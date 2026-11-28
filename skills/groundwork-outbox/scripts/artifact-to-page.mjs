#!/usr/bin/env node
// Turn a Claude artifact's HTML into a hosted Groundwork page (workspace/deliverables/<slug>/).
//
//   node artifact-to-page.mjs <artifact.html> <deliverables/slug> [--title "Name"] [--source <artifact url>] [--force]
//
// The artifact is read first with the Artifact tool (action "read", with `path` to save the file);
// this script only checks that the HTML will survive the move, then writes the page.
// Run it again with the republished HTML to refresh a page: its title, audience, version, asks and
// share settings stay; only index.html, `pulled:` and `updated:` change.
//
// A new page is written with `audience: team`, so nobody outside the team sees it until someone
// says it is ready and the line is changed to `all`.

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  if (i === -1) return null
  const v = args[i + 1]
  args.splice(i, 2)
  return v
}
const title = flag('--title')
const source = flag('--source')
const force = args.includes('--force')
const [input, target] = args.filter((a) => !a.startsWith('--'))

if (!input || !target) {
  console.error('Usage: artifact-to-page.mjs <artifact.html> <deliverables/slug> [--title "Name"] [--source <url>] [--force]')
  process.exit(2)
}
const slug = path.basename(path.resolve(target))
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(`"${slug}" is not a valid slug: lowercase letters, digits and dashes only.`)
  process.exit(2)
}
if (!fs.existsSync(input)) {
  console.error(`Not found: ${input}`)
  process.exit(2)
}

const html = fs.readFileSync(input, 'utf8')

// ---- fit check: what a page cannot do once it runs in Groundwork's sandbox ----
// Hosted pages run in an opaque origin: no storage, no Claude runtime, no cookies.

const blockers = []
const warnings = []
const has = (re) => re.test(html)

if (has(/window\.claude\b|\bclaude\.(complete|ask|db|data|files|user|share)\b/))
  blockers.push('Uses the Claude artifact runtime (window.claude…): shared data, viewer identity or "ask Claude". It does not exist on a Groundwork page.')
if (has(/<meta[^>]+name=["']artifact-capabilities["']/i))
  blockers.push('Declares artifact capabilities, which only work on claude.ai.')
if (has(/\b(localStorage|sessionStorage|indexedDB)\b/))
  warnings.push('Uses browser storage. Groundwork pages run sandboxed with no storage: saved state will not stick, and unguarded access throws. Check it still loads.')
if (has(/document\.cookie/)) warnings.push('Uses cookies. They are not available in the sandbox.')
if (has(/\bfetch\s*\(|XMLHttpRequest/)) warnings.push('Makes network requests. Cross-origin calls only work if the other server allows it.')

const hosts = new Set()
for (const m of html.matchAll(/(?:src|href)=["'](https?:)?\/\/([^/"']+)/gi)) hosts.add(m[2])
const okHosts = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com']
const odd = [...hosts].filter((h) => !okHosts.includes(h))
if (odd.length) warnings.push(`Loads files from ${odd.join(', ')}. Make sure they are public.`)

if (!has(/<meta[^>]+name=["']viewport["']/i)) warnings.push('No viewport meta tag: it may look tiny on a phone.')
if (!has(/<title>/i)) warnings.push('No <title>.')

for (const b of blockers) console.error('BLOCKER: ' + b)
for (const w of warnings) console.warn('Warning: ' + w)
if (blockers.length && !force) {
  console.error('\nNot written. Fix the artifact, or pass --force to write it anyway (it will not work as is).')
  process.exit(1)
}

// ---- write ----

const dir = path.resolve(target)
const yml = path.join(dir, 'deliverable.yml')
const today = new Date().toISOString().slice(0, 10)
const pageTitle = title ?? html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? slug

// Set or add a top-level `key: value` line; leave every other line (asks, share…) as it is.
function setKey(text, key, value) {
  const re = new RegExp(`^${key}:.*$`, 'm')
  const line = `${key}: ${value}`
  if (re.test(text)) return text.replace(re, line)
  const trimmed = text.replace(/\s+$/, '')
  return (trimmed ? trimmed + '\n' : '') + line + '\n'
}
const q = (s) => (/^[\w .,'()/&-]+$/.test(s) ? s : JSON.stringify(s))

fs.mkdirSync(dir, { recursive: true })
const existed = fs.existsSync(yml)
const before = fs.existsSync(path.join(dir, 'index.html')) ? fs.readFileSync(path.join(dir, 'index.html'), 'utf8') : null
fs.writeFileSync(path.join(dir, 'index.html'), html)

let cfg = existed ? fs.readFileSync(yml, 'utf8') : ''
if (!existed) {
  cfg = setKey(cfg, 'title', q(pageTitle))
  cfg = setKey(cfg, 'audience', 'team')
} else if (title) {
  cfg = setKey(cfg, 'title', q(title))
}
if (source) cfg = setKey(cfg, 'source', source)
cfg = setKey(cfg, 'pulled', today)
if (before !== html) cfg = setKey(cfg, 'updated', today)
fs.writeFileSync(yml, cfg)

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1)
console.log(
  existed
    ? before === html
      ? `${slug}: already up to date (pulled ${today}).`
      : `${slug}: refreshed index.html (${kb(before ?? '')} → ${kb(html)} KB). Bump version: in deliverable.yml and add an update to items that link it if the change matters to the client.`
    : `${slug}: new page written, team-only (${kb(html)} KB). Preview it, then change audience: to all when it is ready.`,
)
if (!existed && !source) console.log('Tip: pass --source <artifact url> so the next refresh knows where it came from.')
