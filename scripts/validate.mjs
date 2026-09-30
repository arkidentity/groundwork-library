#!/usr/bin/env node
// Validates the whole library: index, templates, skills, the church-website question bank, and the
// changelog. Exits 1 on any error. Warnings never fail the run.
//
//   node scripts/validate.mjs

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, relative, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const warnings = []
const err = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

const ITEM_TYPES = ['question', 'review', 'link', 'request']
const ITEM_STATUSES = ['open', 'answered', 'closed']
const PROJECT_STATUSES = ['active', 'paused', 'done']
const SEMVER = /^\d+\.\d+\.\d+$/
// Variables a skill always supplies, on top of each template's own `vars`.
const BUILTIN_VARS = ['project', 'date', 'from']

const rel = (p) => relative(ROOT, p)
const read = (p) => readFileSync(p, 'utf8')
const isDir = (p) => existsSync(p) && statSync(p).isDirectory()
const dirs = (p) => (isDir(p) ? readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : [])
const files = (p, ext) => (isDir(p) ? readdirSync(p).filter((f) => f.endsWith(ext)).sort() : [])

function yaml(path) {
  try {
    return parse(read(path))
  } catch (e) {
    err(rel(path), `invalid YAML: ${String(e.message).split('\n')[0]}`)
    return null
  }
}

// Fills {{vars}} with a plain value so frontmatter can be parsed. Returns the filled text and any
// placeholder that is neither a declared var nor a builtin.
function fill(text, declared) {
  const unknown = new Set()
  const out = text.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!declared.has(k) && !BUILTIN_VARS.includes(k)) unknown.add(k)
    return k === 'date' ? '2026-01-01' : k === 'project' ? 'proj' : 'Sample'
  })
  return { out, unknown: [...unknown] }
}

function frontmatter(path, declared) {
  const { out, unknown } = fill(read(path), declared)
  for (const k of unknown) err(rel(path), `placeholder {{${k}}} is not in template.yml vars`)
  const m = out.match(/^---\n([\s\S]*?)\n---/)
  if (!m) {
    err(rel(path), 'missing frontmatter')
    return null
  }
  try {
    const data = parse(m[1])
    if (!data || typeof data !== 'object') throw new Error('frontmatter is not a mapping')
    return data
  } catch (e) {
    err(rel(path), `frontmatter does not parse: ${String(e.message).split('\n')[0]}`)
    return null
  }
}

// ---------- library.yml ----------
const indexPath = join(ROOT, 'library.yml')
const index = yaml(indexPath)
if (!index) finish()
const indexText = read(indexPath)
if (!SEMVER.test(String(index.version))) err('library.yml', `version "${index.version}" is not semver`)
if (!Number.isInteger(index.contract)) err('library.yml', 'contract must be an integer')
if (!/^[\w.-]+\/[\w.-]+$/.test(String(index.source ?? ''))) err('library.yml', '`source` must be owner/repo (what workspaces put in libraries:)')

// The sync script reads core skills with a regex; make sure it sees exactly what YAML says.
const yamlCore = (index.skills ?? []).filter((s) => s.core === true).map((s) => s.name).sort()
const regexCore = [...indexText.matchAll(/\{name:\s*([\w-]+),\s*core:\s*true\}/g)].map((m) => m[1]).sort()
if (JSON.stringify(yamlCore) !== JSON.stringify(regexCore)) {
  err('library.yml', `core skills differ between YAML (${yamlCore}) and what sync-skills.mjs reads (${regexCore}); keep each skill on one line as {name: x, core: true|false}`)
}
if (!/^version:\s*\S+/m.test(indexText)) err('library.yml', 'sync-skills.mjs needs a top-level `version:` line')

// ---------- index vs folders ----------
const listedTemplates = (index.templates ?? []).map((t) => t.name)
const listedSkills = (index.skills ?? []).map((s) => s.name)
for (const t of listedTemplates) if (!isDir(join(ROOT, 'templates', t))) err('library.yml', `template "${t}" is listed but templates/${t}/ does not exist`)
for (const d of dirs(join(ROOT, 'templates'))) if (!listedTemplates.includes(d)) err('library.yml', `templates/${d}/ exists but is not listed`)
for (const s of listedSkills) if (!isDir(join(ROOT, 'skills', s))) err('library.yml', `skill "${s}" is listed but skills/${s}/ does not exist`)
for (const d of dirs(join(ROOT, 'skills'))) if (!listedSkills.includes(d)) err('library.yml', `skills/${d}/ exists but is not listed`)
for (const dup of [...listedTemplates, ...listedSkills].filter((n, i, a) => a.indexOf(n) !== i)) err('library.yml', `duplicate name "${dup}"`)

// ---------- scripts ----------
const scriptFiles = [
  ...files(join(ROOT, 'scripts'), '.mjs').map((f) => join(ROOT, 'scripts', f)),
  ...dirs(join(ROOT, 'skills')).flatMap((sk) => files(join(ROOT, 'skills', sk, 'scripts'), '.mjs').map((f) => join(ROOT, 'skills', sk, 'scripts', f))),
]
for (const f of scriptFiles) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' })
  if (r.status !== 0) err(rel(f), `does not parse: ${String(r.stderr).split('\n').find((l) => l.trim()) ?? ''}`)
}

// ---------- license ----------
if (!existsSync(join(ROOT, 'LICENSE'))) err('LICENSE', 'missing (this repo is published under MIT)')
else if (!/^MIT License/.test(read(join(ROOT, 'LICENSE')))) err('LICENSE', 'is not the MIT license text')
try {
  if (JSON.parse(read(join(ROOT, 'package.json'))).license !== 'MIT') err('package.json', 'license must be MIT')
} catch {
  err('package.json', 'missing or invalid')
}

// ---------- changelog ----------
const changelog = existsSync(join(ROOT, 'CHANGELOG.md')) ? read(join(ROOT, 'CHANGELOG.md')) : ''
if (!new RegExp(`^## ${String(index.version).replace(/\./g, '\\.')}\\b`, 'm').test(changelog)) {
  err('CHANGELOG.md', `no "## ${index.version}" entry for the current library version`)
}

// ---------- skills ----------
for (const s of dirs(join(ROOT, 'skills'))) {
  const path = join(ROOT, 'skills', s, 'SKILL.md')
  if (!existsSync(path)) {
    err(`skills/${s}`, 'no SKILL.md')
    continue
  }
  const m = read(path).match(/^---\n([\s\S]*?)\n---/)
  let data = null
  try {
    data = m ? parse(m[1]) : null
  } catch (e) {
    err(rel(path), `frontmatter does not parse: ${String(e.message).split('\n')[0]}`)
    continue
  }
  if (!data) {
    err(rel(path), 'missing frontmatter')
    continue
  }
  if (data.name !== s) err(rel(path), `name "${data.name}" must equal the folder name "${s}"`)
  if (typeof data.description !== 'string' || data.description.length < 40) err(rel(path), 'description is missing or too short to trigger on')
  const text = read(path)
  if (/templates\/projects/.test(text)) err(rel(path), 'refers to the old templates/projects/ path (now templates/)')
  for (const ref of text.matchAll(/`templates\/([\w-]+)(?![\w.-])/g)) {
    if (!listedTemplates.includes(ref[1])) warn(rel(path), `mentions template "${ref[1]}" which is not in the library`)
  }
}

// ---------- templates ----------
for (const t of dirs(join(ROOT, 'templates'))) {
  const base = join(ROOT, 'templates', t)
  const tplPath = join(base, 'template.yml')
  if (!existsSync(tplPath)) {
    err(`templates/${t}`, 'no template.yml')
    continue
  }
  const tpl = yaml(tplPath)
  if (!tpl) continue
  const where = `templates/${t}/template.yml`
  if (tpl.name !== t) err(where, `name "${tpl.name}" must equal the folder name "${t}"`)
  if (!SEMVER.test(String(tpl.version))) err(where, `version "${tpl.version}" is not semver`)
  const indexed = (index.templates ?? []).find((x) => x.name === t)
  if (indexed) {
    if (String(indexed.version) !== String(tpl.version)) err(where, `version ${tpl.version} differs from library.yml (${indexed.version})`)
    if (indexed.path !== `templates/${t}`) err('library.yml', `path for ${t} should be templates/${t}`)
  }
  for (const k of ['title', 'description']) if (typeof tpl[k] !== 'string' || !tpl[k].trim()) err(where, `missing ${k}`)
  if (!tpl.project || typeof tpl.project !== 'object') err(where, 'missing project: block')
  else {
    const slug = tpl.project.slug
    if (t !== 'blank' && !/^[a-z0-9-]+$/.test(String(slug ?? ''))) err(where, `project.slug "${slug}" must be lowercase letters, numbers, hyphens`)
    if (!['all', 'team'].includes(String(tpl.project.audience ?? 'all'))) err(where, 'project.audience must be all or team')
  }
  const declared = new Set(Object.keys(tpl.vars ?? {}))
  for (const p of tpl.pairs_with ?? []) {
    const name = typeof p === 'string' ? p : p?.template
    if (!listedTemplates.includes(name)) err(where, `pairs_with "${name}" is not a template in this library`)
  }
  if (tpl.skill && !listedSkills.includes(tpl.skill)) err(where, `skill "${tpl.skill}" is not in this library`)
  for (const f of tpl.team_files ?? []) {
    if (!f.from || !existsSync(join(base, f.from))) err(where, `team_files from "${f.from}" does not exist`)
  }

  // project.md
  if (!existsSync(join(base, 'project.md'))) err(`templates/${t}`, 'no project.md')
  else {
    const d = frontmatter(join(base, 'project.md'), declared)
    if (d) {
      if (typeof d.title !== 'string') err(`templates/${t}/project.md`, 'frontmatter needs a title')
      if (d.status !== undefined && !PROJECT_STATUSES.includes(d.status)) err(`templates/${t}/project.md`, `status must be one of ${PROJECT_STATUSES}`)
    }
  }

  // topics
  const topicSlugs = new Set()
  for (const f of files(join(base, 'topics'), '.md')) {
    const path = join(base, 'topics', f)
    const d = frontmatter(path, declared)
    topicSlugs.add(f.replace(/\.md$/, ''))
    if (!d) continue
    if (typeof d.title !== 'string') err(rel(path), 'frontmatter needs a title')
    if (typeof d.order !== 'number') err(rel(path), 'order must be a number')
    if (t !== 'blank' && d.project !== 'proj') {
      // `proj` is what fill() substitutes for {{project}}.
      // The skill adds project: if it is missing, but templates should carry the placeholder.
      warn(rel(path), 'no `project: {{project}}` line (the skill adds it, but it is clearer here)')
    }
  }

  // items
  const ids = new Set()
  const rounds = new Map()
  for (const f of files(join(base, 'assigned'), '.md')) {
    const path = join(base, 'assigned', f)
    const d = frontmatter(path, declared)
    if (!d) continue
    if (typeof d.id !== 'string' || !/^[a-z]-[\w]+$/.test(d.id)) err(rel(path), 'id must look like q-002 (letter, hyphen, then letters or digits)')
    else {
      if (!f.startsWith(d.id)) err(rel(path), `filename must start with the id "${d.id}"`)
      if (ids.has(d.id)) err(rel(path), `duplicate id ${d.id} in this template`)
      ids.add(d.id)
    }
    if (!ITEM_TYPES.includes(d.type)) err(rel(path), `type must be one of ${ITEM_TYPES}`)
    if (!ITEM_STATUSES.includes(d.status)) err(rel(path), `status must be one of ${ITEM_STATUSES}`)
    if (typeof d.title !== 'string' || !d.title.trim()) err(rel(path), 'missing title')
    if (d.assigned === undefined) err(rel(path), 'missing assigned date')
    if (typeof d.order !== 'number') err(rel(path), 'order must be a number')
    if (typeof d.topic !== 'string' || !topicSlugs.has(d.topic)) err(rel(path), `topic "${d.topic}" is not one of this template's topics (${[...topicSlugs]})`)
    if (d.prompts !== undefined) {
      if (!Array.isArray(d.prompts) || d.prompts.some((p) => typeof p !== 'string' || !p.trim())) err(rel(path), 'prompts must be a list of non-empty strings')
      else if (d.type === 'question' && d.prompts.length > 5) warn(rel(path), `${d.prompts.length} prompts; the rule of thumb is 3 to 5 for a question`)
      else if (d.prompts.length > 8) warn(rel(path), `${d.prompts.length} prompts is a lot even for a request`)
    }
    if (d.planned !== undefined && typeof d.planned !== 'string') err(rel(path), 'planned must be text')
    if (d.round !== undefined) {
      if (!Number.isInteger(d.round) || d.round < 1) err(rel(path), 'round must be a whole number, 1 or more')
      else rounds.set(d.round, (rounds.get(d.round) ?? 0) + 1)
    }
    if (d.sitemap !== undefined) {
      if (!Array.isArray(d.sitemap) || !d.sitemap.length) err(rel(path), 'sitemap must be a non-empty list')
      else for (const p of d.sitemap) {
        const name = typeof p === 'string' ? p : p?.page
        if (typeof name !== 'string' || !name.trim()) err(rel(path), 'every sitemap entry needs a page name')
      }
    }
  }
  const maxRound = Number(tpl.rules?.round_size ?? 3)
  for (const [r, n] of rounds) if (n > maxRound) warn(where, `round ${r} has ${n} items; the rule is ${maxRound} or fewer`)
  for (const id of Object.keys(tpl.items ?? {})) {
    if (!ids.has(id)) err(where, `items lists "${id}" but no assigned file has that id`)
  }
}

// ---------- church-website question bank ----------
const bankPath = join(ROOT, 'templates', 'church-website', 'question-bank.yml')
if (existsSync(bankPath)) {
  const bank = yaml(bankPath)
  if (bank) {
    const SRC = ['scrape', 'call', 'manual', 'ours']
    const PRI = ['M', 'S', 'N']
    const TYPES = ['text', 'longtext', 'list', 'select', 'multi', 'upload', 'url', 'time']
    const gates = new Set(Object.keys(bank.gates ?? {}))
    const seen = new Set()
    let total = 0
    let must = 0
    for (const s of bank.sections ?? []) {
      if (s.gate && !gates.has(s.gate)) err('question-bank.yml', `section ${s.id}: unknown gate "${s.gate}"`)
      if (!s.dest) err('question-bank.yml', `section ${s.id}: missing dest`)
      for (const q of s.q ?? []) {
        total++
        if (q.pri === 'M') must++
        const w = `question-bank.yml ${q.id}`
        if (seen.has(q.id)) err(w, 'duplicate question id')
        seen.add(q.id)
        if (typeof q.q !== 'string' || !q.q.trim()) err(w, 'missing question text')
        if (!PRI.includes(q.pri)) err(w, `pri must be one of ${PRI}`)
        if (!SRC.includes(q.src)) err(w, `src must be one of ${SRC}`)
        if (!TYPES.includes(q.type)) err(w, `type must be one of ${TYPES}`)
        if (q.gate && !gates.has(q.gate)) err(w, `unknown gate "${q.gate}"`)
        if (!String(q.id).startsWith(`${s.id}.`)) err(w, `id should start with its section number "${s.id}."`)
      }
    }
    console.log(`question bank: ${total} questions, ${must} must-haves, ${gates.size} gates`)
  }
}

finish()

function finish() {
  for (const w of warnings) console.log(`warn  ${w}`)
  for (const e of errors) console.error(`ERROR ${e}`)
  const t = dirs(join(ROOT, 'templates')).length
  const s = dirs(join(ROOT, 'skills')).length
  console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s)` : `ok: ${t} templates, ${s} skills, ${warnings.length} warning(s)`)
  process.exit(errors.length ? 1 : 0)
}
