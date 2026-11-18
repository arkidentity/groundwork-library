#!/usr/bin/env node
// Builds the Claude Code plugin marketplace from skills/ and library.yml.
//
//   node scripts/build-plugins.mjs           write .claude-plugin/marketplace.json and plugins/
//   node scripts/build-plugins.mjs --check   exit 1 if they are out of date (CI)
//
// skills/ stays the one place skills are edited. This copies them into plugins:
// - plugins/groundwork: every core skill (library.yml `core: true`)
// - plugins/<skill>:    each optional skill on its own, so agencies install only what they use
// Setup skills (used from a clone to start an organization) are not shipped as plugins.
// Plugin versions follow library.yml, so installed copies move only on a release.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const LIB = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const lib = YAML.parse(readFileSync(join(LIB, 'library.yml'), 'utf8'))
const version = String(lib.version)
const SETUP_ONLY = new Set(['groundwork-setup'])

const desc = (skill) => {
  const md = readFileSync(join(LIB, 'skills', skill, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n')
  const m = md.match(/^description:\s*(.+)$/m)
  return m ? m[1].trim() : ''
}
const short = (s) => (s.length > 200 ? s.slice(0, s.lastIndexOf(' ', 197)) + '…' : s)

const core = lib.skills.filter((s) => s.core).map((s) => s.name)
const optional = lib.skills.filter((s) => !s.core && !SETUP_ONLY.has(s.name)).map((s) => s.name)

const author = { name: 'Groundwork', url: 'https://groundwork.chat' }
const plugins = [
  {
    name: 'groundwork',
    skills: core,
    description: 'Core Groundwork skills: connect Claude to Groundwork, file client notes (inbox), prepare questions and branded pages (outbox), start projects, capture a client brand, and keep the shared repo in sync.',
  },
  ...optional.map((name) => ({ name, skills: [name], description: short(desc(name)) })),
  // The directory edition (Anthropic's plugin directory): text-only skills, since an organization
  // that isn't Verified may ship only Markdown, text, JSON, YAML and images. Other files are left
  // out (each skill says where to read them), and repo hooks (shared-repo-sync) stay out.
  {
    name: 'groundwork-chat',
    displayName: 'Groundwork Chat',
    directory: true,
    skills: core.filter((s) => s !== 'shared-repo-sync'),
    description: 'Work with Groundwork (groundwork.chat) in Claude: connect it, process the notes clients and teammates leave on live sites, draft replies and next questions for your yes, start projects from templates, and capture a client brand.',
  },
]
const ALLOWED = /\.(md|txt|json|ya?ml|png|jpe?g|gif|webp)$/i
const isBinary = (f) => /\.(png|jpe?g|gif|webp)$/i.test(f)
const leftOutNote = (skill, left) => [
  '',
  '## Files this edition leaves out',
  '',
  `The directory edition carries text only. In a workspace repo, use its own copy under \`.claude/skills/${skill}/\`; otherwise read these from https://github.com/${lib.source}/tree/v${version}/skills/${skill}:`,
  '',
  ...[...left].sort().map((f) => `- \`${f}\``), // sorted: readdir order differs between Windows and Linux
  '',
].join('\n')

// The README shown as the directory listing. It must say everything the plugin runs, sends or
// fetches (the directory's security scan checks behavior against it).
function readme(p) {
  const skills = p.skills.map((s) => `- **${s}**: ${short(desc(s))}`).join('\n')
  return `# ${p.displayName ?? (p.name === 'groundwork' ? 'Groundwork' : p.name)}

${p.description}

Groundwork (https://groundwork.chat) is where an agency's clients and teammates leave notes right on
a live site or page, answer questions, and see what's been settled. These skills teach Claude to
work with that: read and file the notes, draft replies for you to approve, prepare the next
questions, and keep the project's repository in step.

## Skills

${skills}

## What it runs, sends and fetches

- **The Groundwork connector** (https://groundwork.chat/api/mcp), when you've connected it, to list
  and read notes, reply, and set a note's status. Nothing is sent to a client without your yes in
  the chat. The skills pass their own version so Groundwork can tell you when an update is out.
- **Files in your own repositories**: notes, decisions and drafts are written into the project
  repository you're working in, and committed only when you ask.${p.skills.includes('shared-repo-sync') ? `
- **shared-repo-sync** can set up two optional hooks in a repository you choose: \`git pull\` when a
  session starts, and a reminder to push when it ends. They run only after you ask for them.` : ''}${p.skills.includes('groundwork-project') ? `
- **groundwork-project** reads this library's templates from GitHub
  (https://github.com/arkidentity/groundwork-library) at the version your workspace pins.` : ''}${p.skills.includes('groundwork-brand-capture') ? `
- **groundwork-brand-capture** fetches a client's public website to read its colors, fonts and logo.` : ''}

No data is sent anywhere else.

## Get started

Ask Claude "help me connect Groundwork", or see https://groundwork.chat.

## License

MIT. See LICENSE.
`
}

// Desired files: path -> text
const want = new Map()
const norm = (t) => t.replace(/\r\n/g, '\n')
for (const p of plugins) {
  const root = `plugins/${p.name}`
  // Anthropic's directory needs a README (40+ words) and a license inside each plugin folder.
  want.set(`${root}/README.md`, readme(p))
  want.set(`${root}/LICENSE`, norm(readFileSync(join(LIB, 'LICENSE'), 'utf8')))
  want.set(`${root}/.claude-plugin/plugin.json`, JSON.stringify({
    name: p.name, displayName: p.displayName ?? (p.name === 'groundwork' ? 'Groundwork' : undefined), version, description: p.description, author,
    homepage: 'https://groundwork.chat', repository: `https://github.com/${lib.source}`, license: 'MIT',
    keywords: ['groundwork', 'agency', 'client-feedback'],
  }, null, 2) + '\n')
  if (p.directory) want.set(`${root}/.claude-plugin/icon.png`, readFileSync(join(LIB, 'assets', 'icon.png')))
  for (const skill of p.skills) {
    const src = join(LIB, 'skills', skill)
    const left = []
    const walk = (dir) => {
      for (const f of readdirSync(dir)) {
        const full = join(dir, f)
        if (f === '.library.json') continue
        const rel = relative(src, full).replace(/\\/g, '/')
        if (statSync(full).isDirectory()) walk(full)
        else if (p.directory && !ALLOWED.test(f)) left.push(rel)
        else want.set(`${root}/skills/${skill}/${rel}`, isBinary(f) ? readFileSync(full) : norm(readFileSync(full, 'utf8')))
      }
    }
    walk(src)
    if (left.length) {
      const key = `${root}/skills/${skill}/SKILL.md`
      want.set(key, want.get(key).trimEnd() + '\n' + leftOutNote(skill, left))
    }
  }
}
want.set('.claude-plugin/marketplace.json', JSON.stringify({
  name: 'groundwork-library',
  owner: author,
  description: 'Groundwork skills for agencies and teams. Install the groundwork plugin; add optional skills as needed.',
  plugins: plugins.map((p) => ({ name: p.name, source: `./plugins/${p.name}`, description: p.description, category: 'productivity' })),
}, null, 2) + '\n')

// Existing generated files
const have = new Map()
const walkHave = (dir) => {
  if (!existsSync(join(LIB, dir))) return
  for (const f of readdirSync(join(LIB, dir))) {
    const rel = `${dir}/${f}`
    if (statSync(join(LIB, rel)).isDirectory()) walkHave(rel)
    else have.set(rel, isBinary(rel) ? readFileSync(join(LIB, rel)) : norm(readFileSync(join(LIB, rel), 'utf8')))
  }
}
walkHave('plugins')
if (existsSync(join(LIB, '.claude-plugin/marketplace.json'))) have.set('.claude-plugin/marketplace.json', norm(readFileSync(join(LIB, '.claude-plugin/marketplace.json'), 'utf8')))

const same = (a, b) => (Buffer.isBuffer(a) && Buffer.isBuffer(b) ? a.equals(b) : a === b)
const stale = [...want].filter(([f, t]) => !same(have.get(f), t)).map(([f]) => f)
const extra = [...have.keys()].filter((f) => !want.has(f))

if (check) {
  if (stale.length || extra.length) {
    console.error('plugins are out of date. Run: node scripts/build-plugins.mjs')
    for (const f of [...stale, ...extra]) console.error('  ' + f)
    process.exit(1)
  }
  console.log(`plugins: ok (${plugins.length} plugins, v${version})`)
  process.exit(0)
}
for (const f of extra) rmSync(join(LIB, f))
for (const [f, t] of want) {
  mkdirSync(dirname(join(LIB, f)), { recursive: true })
  writeFileSync(join(LIB, f), t)
}
console.log(`plugins: wrote ${plugins.length} plugins (v${version}): ${plugins.map((p) => p.name).join(', ')}`)
