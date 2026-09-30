#!/usr/bin/env node
// Copies the library's skills into workspace repos (any folder with a groundwork.yml).
//
//   node scripts/sync-skills.mjs [--root <dir>] [--repo <path>]... [--add <skill>]...
//                                [--except <repo>:<skill>]... [--pin] [--upgrade]
//                                [--dry-run] [--commit] [--force]
//
// - Finds workspace repos one level under --root (default: the folder that holds this library).
//   Pass --repo to name repos explicitly instead (repeatable).
// - Syncs the core skills (library.yml) plus any other library skill the repo already has.
//   --add installs an optional skill into every repo it touches.
// - Each synced skill gets a .library.json stamp (library version + content hash). A skill whose
//   files differ from its stamp has local edits: it is SKIPPED, never overwritten, unless --force.
//   A skill with no stamp that differs from the library is treated the same way.
// - --except acme-workspace:groundwork-outbox leaves one skill in one repo alone (a deliberate fork).
// - Pins: a workspace's groundwork.yml can pin this library:
//       libraries:
//         - source: arkidentity/groundwork-library
//           ref: v0.2.0
//   A pinned repo is only synced when its pin equals this library's version. Otherwise it is
//   skipped, so a release never reaches a client repo by accident. --upgrade moves the pin to this
//   version and syncs. --pin adds a pin (at this version) to repos that have none. Unpinned repos
//   still sync, with a notice.
// - --commit commits the change in each repo (skills, and groundwork.yml if a pin changed).
//   It never pushes.

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const LIB = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const STAMP = '.library.json'

// ---- args ----
const args = process.argv.slice(2)
const flag = (n) => args.includes(n)
const values = (n) => args.flatMap((a, i) => (a === n && args[i + 1] ? [args[i + 1]] : []))
const dryRun = flag('--dry-run')
const commit = flag('--commit')
const force = flag('--force')
const pinFlag = flag('--pin')
const upgrade = flag('--upgrade')
const add = values('--add')
const except = new Set(values('--except'))
const explicit = values('--repo').map((p) => resolve(p))
const root = resolve(values('--root')[0] ?? join(LIB, '..'))

// ---- library ----
const indexText = readFileSync(join(LIB, 'library.yml'), 'utf8')
const version = indexText.match(/^version:\s*(\S+)/m)?.[1] ?? '0.0.0'
const source = indexText.match(/^source:\s*(\S+)/m)?.[1]
if (!source) fail('library.yml has no `source:` line (owner/repo)')
const wantRef = `v${version}`
const core = [...indexText.matchAll(/\{name:\s*([\w-]+),\s*core:\s*true\}/g)].map((m) => m[1])
const librarySkills = readdirSync(join(LIB, 'skills'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
for (const a of add) if (!librarySkills.includes(a)) fail(`--add ${a}: not a library skill (${librarySkills.join(', ')})`)

function fail(msg) {
  console.error(msg)
  process.exit(1)
}

function listFiles(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...listFiles(p))
    else if (e.name !== STAMP && e.name !== '.DS_Store') out.push(p)
  }
  return out.sort()
}

// Hash of names + contents, so a rename or an edit both change it.
function hashDir(dir) {
  const h = createHash('sha256')
  for (const f of listFiles(dir)) {
    h.update(relative(dir, f)).update('\0').update(readFileSync(f)).update('\0')
  }
  return h.digest('hex')
}

function readStamp(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, STAMP), 'utf8'))
  } catch {
    return null
  }
}

function copyDir(src, dest) {
  rmSync(dest, { recursive: true, force: true })
  for (const f of listFiles(src)) {
    const to = join(dest, relative(src, f))
    mkdirSync(dirname(to), { recursive: true })
    writeFileSync(to, readFileSync(f))
  }
}

function git(repo, ...a) {
  return execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8' }).trim()
}


// ---- pins in groundwork.yml ----
// Reads the `ref:` that follows our `source:` line. Text-based on purpose: workspace repos have no
// node_modules, and this keeps comments in groundwork.yml intact.
const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function findPin(text) {
  const lines = text.split('\n')
  const srcRe = new RegExp(`^\\s*-?\\s*source:\\s*["']?${escapeRe(source)}["']?\\s*(#.*)?$`)
  const at = lines.findIndex((l) => srcRe.test(l))
  if (at === -1) return { lines, at: -1 }
  for (let i = at + 1; i < Math.min(lines.length, at + 4); i++) {
    if (/^\s*-\s/.test(lines[i])) break // next list item
    const m = lines[i].match(/^(\s*)ref:\s*["']?([^"'\s#]+)["']?\s*(#.*)?$/)
    if (m) return { lines, at, refLine: i, ref: m[2] }
  }
  return { lines, at, ref: undefined }
}

function setPin(text, ref) {
  const found = findPin(text)
  const { lines } = found
  if (found.refLine !== undefined) {
    lines[found.refLine] = lines[found.refLine].replace(/(ref:\s*)["']?[^"'\s#]+["']?/, `$1${ref}`)
    return lines.join('\n')
  }
  const item = [`  - source: ${source}`, `    ref: ${ref}`]
  const libs = lines.findIndex((l) => /^libraries:\s*$/.test(l))
  if (libs !== -1) lines.splice(libs + 1, 0, ...item)
  else lines.push(...(lines[lines.length - 1] === '' ? [] : ['']).concat(['libraries:', ...item, '']))
  return lines.join('\n')
}

// ---- which repos ----
const repos = explicit.length
  ? explicit
  : readdirSync(root, { withFileTypes: true })
      .filter((e) => e.isDirectory() && join(root, e.name) !== LIB)
      .map((e) => join(root, e.name))
      .filter((p) => existsSync(join(p, 'groundwork.yml')))
      .sort()
if (!repos.length) fail(`No workspace repos found under ${root} (looking for groundwork.yml).`)

console.log(`groundwork-library ${version}${dryRun ? '  (dry run)' : ''}`)
const libHash = Object.fromEntries(librarySkills.map((s) => [s, hashDir(join(LIB, 'skills', s))]))
let skipped = 0
let pinSkipped = 0

for (const repo of repos) {
  const name = repo.split('/').pop()
  if (!existsSync(join(repo, 'groundwork.yml'))) {
    console.log(`\n${name}: no groundwork.yml, skipped`)
    continue
  }
  const skillsDir = join(repo, '.claude', 'skills')
  const have = existsSync(skillsDir) ? readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : []
  const managed = [...new Set([...core, ...add, ...have.filter((s) => librarySkills.includes(s))])].sort()
  console.log(`\n${name}`)
  const changed = []

  // Pin decision.
  const ymlPath = join(repo, 'groundwork.yml')
  const ymlText = readFileSync(ymlPath, 'utf8')
  const pin = findPin(ymlText).ref
  let newPin = null
  if (pin === undefined) {
    if (pinFlag) {
      newPin = wantRef
      console.log(`  pin: none -> ${wantRef}`)
    } else console.log(`  pin: none (unpinned; add --pin to pin it at ${wantRef})`)
  } else if (pin === wantRef) {
    console.log(`  pin: ${pin}`)
  } else if (upgrade) {
    newPin = wantRef
    console.log(`  pin: ${pin} -> ${wantRef} (--upgrade)`)
  } else {
    pinSkipped++
    console.log(`  pin: ${pin}, library is ${wantRef}: SKIPPED (pinned; run with --upgrade to move this repo to ${wantRef})`)
    continue
  }
  if (newPin && !dryRun) {
    writeFileSync(ymlPath, setPin(ymlText, newPin))
    changed.push('groundwork.yml pin')
  }

  for (const skill of managed) {
    if (except.has(`${name}:${skill}`)) {
      console.log(`  - ${skill}: excluded (--except)`)
      continue
    }
    const dest = join(skillsDir, skill)
    const src = join(LIB, 'skills', skill)
    const stamp = readStamp(dest)
    const writeStamp = () => writeFileSync(join(dest, STAMP), JSON.stringify({ library: 'groundwork-library', version, hash: libHash[skill] }, null, 2) + '\n')

    if (!existsSync(dest)) {
      console.log(`  + ${skill}: install`)
      if (!dryRun) {
        copyDir(src, dest)
        writeStamp()
        changed.push(skill)
      }
      continue
    }
    const current = hashDir(dest)
    const edited = stamp ? current !== stamp.hash : current !== libHash[skill]
    if (current === libHash[skill]) {
      if (stamp?.version === version && stamp.hash === libHash[skill]) console.log(`  = ${skill}: up to date`)
      else {
        console.log(`  = ${skill}: same as library, ${stamp ? 'stamp updated' : 'adopted (stamped)'}`)
        if (!dryRun) {
          writeStamp()
          changed.push(skill)
        }
      }
      continue
    }
    if (edited && !force) {
      skipped++
      console.log(`  ! ${skill}: SKIPPED, ${stamp ? 'edited here since the last sync' : 'not from the library and differs'} (use --force to overwrite)`)
      continue
    }
    console.log(`  ~ ${skill}: update${stamp ? ` ${stamp.version} -> ${version}` : ''}${edited ? ' (FORCED over local edits)' : ''}`)
    if (!dryRun) {
      copyDir(src, dest)
      writeStamp()
      changed.push(skill)
    }
  }

  if (commit && !dryRun && changed.length) {
    git(repo, 'add', '.claude/skills', 'groundwork.yml')
    if (git(repo, 'diff', '--cached', '--name-only', '--', '.claude/skills', 'groundwork.yml')) {
      git(repo, 'commit', '-q', '-m', `Skills: sync from groundwork-library ${version} (${changed.join(', ')})`, '--', '.claude/skills', 'groundwork.yml')
      console.log(`  committed (not pushed)`)
    }
  }
}

console.log(
  `\n${skipped ? `${skipped} skill(s) skipped because of local edits. ` : ''}${pinSkipped ? `${pinSkipped} repo(s) skipped because they are pinned to another version. ` : ''}Nothing is pushed; push each repo yourself.`
)
if (skipped || pinSkipped) process.exitCode = 2
