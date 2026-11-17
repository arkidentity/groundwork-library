#!/usr/bin/env node
// "Check template updates": for every project in this workspace that was started from a library
// template, compares the template as it was when the project started with the template now, and
// prints what changed. It reads and reports. It never edits the workspace.
//
//   node .claude/skills/groundwork-project/scripts/template-diff.mjs
//        [--workspace <dir>] [--project <slug>] [--to pinned|latest|<tag>] [--json]
//
// A project records its origin in frontmatter (workspace/projects/<slug>.md or outbox/projects/):
//     from_template: church-website@0.1.0
//     template_library: arkidentity/groundwork-library@v0.1.0
// Items and topics started from a template record `template_item: <template file name>` and
// `template_topic: <template topic slug>`, which is how a changed template file is linked back to
// the workspace item it became (ids are renumbered when a template is used).
//
// --to: what to compare against. `pinned` (default) = the version in groundwork.yml `libraries:`;
// `latest` = the newest v1.2.3 tag on GitHub; or any tag. Zero dependencies.

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const value = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const workspace = resolve(value('--workspace') ?? process.cwd())
const onlyProject = value('--project')
const to = value('--to') ?? 'pinned'
const asJson = args.includes('--json')
const fail = (m) => {
  process.stderr.write(`template-diff: ${m}\n`)
  process.exit(1)
}

// ---------- small readers ----------
const read = (p) => readFileSync(p, 'utf8')
const isDir = (p) => existsSync(p) && statSync(p).isDirectory()
function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  return m ? m[1] : ''
}
function field(text, key) {
  const m = frontmatter(text).match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, 'm'))
  if (!m) return undefined
  return m[1].replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '')
}
function titleOf(text) {
  return field(text, 'title') ?? text.match(/^#\s+(.+)$/m)?.[1]?.trim()
}
function walk(dir, base = dir) {
  const out = {}
  if (!isDir(dir)) return out
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) Object.assign(out, walk(p, base))
    else out[relative(base, p)] = read(p)
  }
  return out
}
const semver = (t) => t.match(/^v?(\d+)\.(\d+)\.(\d+)$/)?.slice(1).map(Number)
const cmp = (a, b) => {
  const x = semver(a)
  const y = semver(b)
  if (!x || !y) return 0
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}

// ---------- the workspace's pin and projects ----------
const ymlPath = join(workspace, 'groundwork.yml')
if (!existsSync(ymlPath)) fail(`no groundwork.yml in ${workspace}`)
const yml = read(ymlPath).split('\n')
let pinSource = 'arkidentity/groundwork-library'
let pinRef
{
  const at = yml.findIndex((l) => /^\s*-?\s*source:\s*\S+/.test(l))
  if (at !== -1) {
    pinSource = yml[at].match(/source:\s*["']?([^"'\s#]+)/)[1]
    for (let i = at + 1; i < Math.min(yml.length, at + 4) && !/^\s*-\s/.test(yml[i]); i++) {
      const m = yml[i].match(/^\s*ref:\s*["']?([^"'\s#]+)/)
      if (m) pinRef = m[1]
    }
  }
}

const projects = []
for (const dir of ['workspace/projects', 'outbox/projects']) {
  const abs = join(workspace, dir)
  if (!isDir(abs)) continue
  for (const f of readdirSync(abs).filter((x) => x.endsWith('.md'))) {
    const text = read(join(abs, f))
    const slug = f.replace(/\.md$/, '')
    if (onlyProject && slug !== onlyProject) continue
    const from = field(text, 'from_template')
    const lib = field(text, 'template_library')
    projects.push({ slug, where: dir, title: titleOf(text) ?? slug, from, lib })
  }
}

// Workspace items and topics, to link changed template files back to what they became.
function linked(dirs, key, value) {
  const hits = []
  for (const d of dirs) {
    const abs = join(workspace, d)
    if (!isDir(abs)) continue
    for (const f of readdirSync(abs).filter((x) => x.endsWith('.md'))) {
      const text = read(join(abs, f))
      if (field(text, key) === value) {
        hits.push({ file: `${d}/${f}`, id: field(text, 'id') ?? f.replace(/\.md$/, ''), status: field(text, 'status'), title: titleOf(text) })
      }
    }
  }
  return hits
}

// ---------- resolving library versions ----------
function resolveLibrary(ref, source) {
  const r = spawnSync(process.execPath, [join(HERE, 'resolve-library.mjs'), '--workspace', workspace, '--ref', ref, '--source', source], { encoding: 'utf8' })
  if (r.status !== 0) {
    const lines = (r.stderr || 'resolver failed').trim().split('\n')
    const own = lines.filter((l) => l.startsWith('resolve-library:') && !/fetching/.test(l)).pop() // the failure, not the progress note
    return { error: own ? own.replace(/^resolve-library:\s*/, '') : lines.pop() }
  }
  return { dir: r.stdout.trim() }
}

function latestTag(source) {
  const base = (process.env.GROUNDWORK_LIBRARY_GIT_BASE ?? 'https://github.com').replace(/\/$/, '')
  try {
    const out = execFileSync('git', ['ls-remote', '--tags', '--refs', `${base}/${source}.git`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    const tags = out.split('\n').map((l) => l.split('refs/tags/')[1]).filter((t) => t && semver(t))
    return tags.sort(cmp).pop()
  } catch {
    return undefined
  }
}

// ---------- comparing two template folders ----------
function questionMap(text) {
  const out = {}
  for (const m of text.matchAll(/\{id: "([\d.]+)", q: "((?:[^"\\]|\\.)*)", type: (\w+), pri: (\w)/g)) out[m[1]] = { q: m[2], pri: m[4] }
  return out
}

function unifiedDiff(a, b) {
  const r = spawnSync('git', ['diff', '--no-index', '--no-color', '-U2', '--', a, b], { encoding: 'utf8' })
  const lines = r.stdout.split('\n')
  const at = lines.findIndex((l) => l.startsWith('@@'))
  return at === -1 ? '' : lines.slice(at).join('\n').trimEnd()
}

function compareTemplates(nameDir, aDir, bDir) {
  const A = walk(aDir)
  const B = walk(bDir)
  const titleFor = (p, text) => (p.endsWith('.md') ? titleOf(text) : undefined)
  const kind = (p) => (p.startsWith('topics/') ? 'topic' : p.startsWith('assigned/') ? 'item' : p === 'project.md' ? 'project' : p === 'template.yml' ? 'template.yml' : 'file')
  const out = { added: [], removed: [], changed: [], bank: null }
  for (const p of Object.keys(B).sort()) {
    if (!(p in A)) out.added.push({ path: p, kind: kind(p), title: titleFor(p, B[p]) })
  }
  for (const p of Object.keys(A).sort()) {
    if (!(p in B)) out.removed.push({ path: p, kind: kind(p), title: titleFor(p, A[p]), links: linksFor(kind(p), p) })
    else if (A[p] !== B[p]) {
      if (basename(p) === 'question-bank.yml') {
        const qa = questionMap(A[p])
        const qb = questionMap(B[p])
        out.bank = {
          path: p,
          added: Object.keys(qb).filter((id) => !(id in qa)).map((id) => ({ id, ...qb[id] })),
          removed: Object.keys(qa).filter((id) => !(id in qb)).map((id) => ({ id, ...qa[id] })),
          changed: Object.keys(qb).filter((id) => id in qa && (qa[id].q !== qb[id].q || qa[id].pri !== qb[id].pri)).map((id) => ({ id, from: qa[id], to: qb[id] })),
        }
      } else {
        out.changed.push({ path: p, kind: kind(p), title: titleFor(p, B[p]) ?? titleFor(p, A[p]), links: linksFor(kind(p), p), diff: unifiedDiff(join(aDir, p), join(bDir, p)) })
      }
    }
  }
  return out
}

function linksFor(kind, p) {
  const stem = basename(p).replace(/\.md$/, '')
  if (kind === 'item') return linked(['workspace/assigned', 'outbox/assigned'], 'template_item', stem)
  if (kind === 'topic') return linked(['workspace/topics', 'outbox/topics'], 'template_topic', stem)
  return []
}

function changelogBetween(dir, fromRef, toRef) {
  const p = join(dir, 'CHANGELOG.md')
  if (!existsSync(p) || !semver(fromRef) || !semver(toRef)) return []
  const sections = read(p).split(/^## /m).slice(1)
  return sections
    .map((s) => ({ version: s.match(/^(\d+\.\d+\.\d+)/)?.[1], text: s.replace(/^.*\n/, '').trim() }))
    .filter((s) => s.version && cmp(s.version, fromRef) > 0 && cmp(s.version, toRef) <= 0)
    .sort((a, b) => cmp(b.version, a.version))
}

// ---------- run ----------
const stamped = projects.filter((p) => p.from)
const results = []
for (const pr of stamped) {
  const [name, tver] = pr.from.split('@')
  const [aSource, aRef] = (pr.lib ?? '').split('@')
  const res = { project: pr.slug, title: pr.title, template: name, stampedVersion: tver, stampedLibrary: pr.lib ?? null }
  if (!pr.lib || !aRef || pr.lib === 'unpinned') {
    results.push({ ...res, status: 'cannot-compare', reason: `no template_library stamp, so there is no starting version to compare from (add \`template_library: ${pinSource}@<tag>\` if you know which release it was started from)` })
    continue
  }
  const target = to === 'pinned' ? pinRef : to === 'latest' ? latestTag(aSource) : to
  if (!target) {
    results.push({ ...res, status: 'cannot-compare', reason: to === 'latest' ? 'could not list tags from GitHub (offline or not signed in?)' : 'this workspace has no pin in groundwork.yml; pass --to <tag> or --to latest' })
    continue
  }
  const A = resolveLibrary(aRef, aSource)
  const B = resolveLibrary(target, aSource)
  if (A.error || B.error) {
    results.push({ ...res, status: 'cannot-compare', reason: A.error ?? B.error })
    continue
  }
  const aT = join(A.dir, 'templates', name)
  const bT = join(B.dir, 'templates', name)
  if (!isDir(bT)) {
    results.push({ ...res, status: 'template-missing', targetLibrary: `${aSource}@${target}`, reason: `template "${name}" does not exist in ${target} (removed or renamed)` })
    continue
  }
  const versionOf = (d) => (existsSync(join(d, 'template.yml')) ? read(join(d, 'template.yml')).match(/^version:\s*(\S+)/m)?.[1] : undefined) ?? 'unversioned'
  const diff = compareTemplates(name, aT, bT)
  const count = diff.added.length + diff.removed.length + diff.changed.length + (diff.bank ? 1 : 0)
  // Only the template's own version number moved: nothing for the project to adopt.
  const versionOnly =
    count > 0 &&
    !diff.added.length && !diff.removed.length && !diff.bank &&
    diff.changed.every((f) => f.path === 'template.yml' && f.diff.split('\n').filter((l) => /^[+-](?![+-])/.test(l)).every((l) => /^[+-]version:/.test(l)))
  results.push({
    ...res,
    status: count === 0 ? 'up-to-date' : versionOnly ? 'metadata-only' : 'updates',
    targetLibrary: `${aSource}@${target}`,
    fromTemplateVersion: versionOf(aT),
    toTemplateVersion: versionOf(bT),
    changelog: changelogBetween(B.dir, aRef, target),
    ...diff,
  })
}

// ---------- output ----------
if (asJson) {
  process.stdout.write(`${JSON.stringify({ workspace, pin: pinRef ?? null, to, results }, null, 2)}\n`)
  process.exit(0)
}

const out = []
const say = (s = '') => out.push(s)
say(`# Template update check`)
say()
say(`Workspace pin: ${pinRef ? `${pinSource}@${pinRef}` : 'none'} · comparing against: ${to === 'pinned' ? 'the pin' : to}`)
if (!projects.length) say('\nNo projects found (workspace/projects/ or outbox/projects/).')
else if (!stamped.length) {
  say(`\nNo project records where it came from. Projects started by groundwork-project 0.2+ carry \`from_template\` and \`template_library\`. For an older project, add them by hand (for example \`from_template: church-website@0.1.0\` and \`template_library: ${pinSource}@v0.1.0\`).`)
}
const shownChangelog = new Set()
const linkText = (ls) => (ls.length ? ` → linked: ${ls.map((l) => `${l.id} (${l.status ?? 'topic'})`).join(', ')}` : ' → not linked to any workspace item')
for (const r of results) {
  say()
  say(`## ${r.title} (${r.project}), from template ${r.template}`)
  say(`Started from ${r.template}@${r.stampedVersion}, library ${r.stampedLibrary ?? '(not recorded)'}`)
  if (r.status === 'cannot-compare' || r.status === 'template-missing') {
    say(`**Cannot compare:** ${r.reason}`)
    continue
  }
  say(`Compared with ${r.targetLibrary} (template ${r.fromTemplateVersion} → ${r.toTemplateVersion})`)
  if (r.status === 'up-to-date') {
    say('**Up to date.** The template is unchanged since this project started.')
    continue
  }
  if (r.status === 'metadata-only') {
    say('**Nothing to adopt.** Only the template\'s own version number changed; its topics, items and text are the same.')
    continue
  }
  if (r.changelog.length) {
    // The changelog is library-wide, so print each range once, not under every project.
    const key = `${r.stampedLibrary}->${r.targetLibrary}`
    if (shownChangelog.has(key)) say('\n### What the library says changed\nSame range as above.')
    else {
      shownChangelog.add(key)
      say('\n### What the library says changed (library-wide, not only this template)')
      for (const c of r.changelog) say(`\n**${c.version}**\n${c.text}`)
    }
  }
  if (r.added.length) {
    say('\n### New in the template (would be drafted into outbox/, never over anything live)')
    for (const f of r.added) say(`- ${f.kind}: \`${f.path}\`${f.title ? ` "${f.title}"` : ''}`)
  }
  if (r.bank) {
    const b = r.bank
    say('\n### Question bank')
    say(`${b.added.length} added, ${b.removed.length} removed, ${b.changed.length} changed.`)
    for (const q of b.added) say(`- + ${q.id} [${q.pri}] ${q.q}`)
    for (const q of b.removed) say(`- - ${q.id} [${q.pri}] ${q.q}`)
    for (const q of b.changed) say(`- ~ ${q.id} [${q.from.pri}→${q.to.pri}] ${q.to.q}`)
  }
  if (r.changed.length) {
    say('\n### Changed (review by hand; live items are never rewritten)')
    for (const f of r.changed) {
      say(`\n- ${f.kind}: \`${f.path}\`${f.title ? ` "${f.title}"` : ''}${['item', 'topic'].includes(f.kind) ? linkText(f.links) : ''}`)
      if (f.diff) say(`\n\`\`\`diff\n${f.diff}\n\`\`\``)
    }
  }
  if (r.removed.length) {
    say('\n### Removed from the template')
    for (const f of r.removed) say(`- ${f.kind}: \`${f.path}\`${f.title ? ` "${f.title}"` : ''}${['item', 'topic'].includes(f.kind) ? linkText(f.links) : ''}`)
  }
}
process.stdout.write(`${out.join('\n')}\n`)
