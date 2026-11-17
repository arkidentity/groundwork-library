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
]

// Desired files: path -> text
const want = new Map()
const norm = (t) => t.replace(/\r\n/g, '\n')
for (const p of plugins) {
  const root = `plugins/${p.name}`
  want.set(`${root}/.claude-plugin/plugin.json`, JSON.stringify({
    name: p.name, version, description: p.description, author,
    homepage: 'https://groundwork.chat', repository: `https://github.com/${lib.source}`, license: 'MIT',
    keywords: ['groundwork', 'agency', 'client-feedback'],
  }, null, 2) + '\n')
  for (const skill of p.skills) {
    const src = join(LIB, 'skills', skill)
    const walk = (dir) => {
      for (const f of readdirSync(dir)) {
        const full = join(dir, f)
        if (f === '.library.json') continue
        if (statSync(full).isDirectory()) walk(full)
        else want.set(`${root}/skills/${skill}/${relative(src, full).replace(/\\/g, '/')}`, norm(readFileSync(full, 'utf8')))
      }
    }
    walk(src)
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
    else have.set(rel, norm(readFileSync(join(LIB, rel), 'utf8')))
  }
}
walkHave('plugins')
if (existsSync(join(LIB, '.claude-plugin/marketplace.json'))) have.set('.claude-plugin/marketplace.json', norm(readFileSync(join(LIB, '.claude-plugin/marketplace.json'), 'utf8')))

const stale = [...want].filter(([f, t]) => have.get(f) !== t).map(([f]) => f)
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
