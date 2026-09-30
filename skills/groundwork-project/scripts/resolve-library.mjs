#!/usr/bin/env node
// Prints the path of a checkout of the groundwork-library version this workspace is pinned to.
//
//   node .claude/skills/groundwork-project/scripts/resolve-library.mjs [--workspace <dir>] [--library <dir>]
//                                                                     [--ref <tag>] [--source <owner/repo>]
//
// Reads `libraries:` in the workspace's groundwork.yml:
//     libraries:
//       - source: arkidentity/groundwork-library
//         ref: v0.2.0
// and returns, in order:
//   1. a sibling checkout (../groundwork-library, or --library) that is exactly at `ref`
//   2. a cached clone of `ref` in ~/.cache/groundwork/libraries (cloned now if missing)
// --ref / --source override the pin (used to fetch an older or newer version to compare).
// It never returns a checkout at a different version. With no pin it returns the sibling as-is and
// says so on stderr. The path is the only thing written to stdout. Zero dependencies.
//
// GROUNDWORK_LIBRARY_GIT_BASE (default https://github.com) is where `source` is cloned from.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const DEFAULT_SOURCE = 'arkidentity/groundwork-library'
const args = process.argv.slice(2)
const value = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const workspace = resolve(value('--workspace') ?? process.cwd())
const info = (m) => process.stderr.write(`${m}\n`)
const fail = (m) => {
  info(`resolve-library: ${m}`)
  process.exit(1)
}
const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
const isLibrary = (dir) => existsSync(join(dir, 'library.yml')) && existsSync(join(dir, '.git'))

// ---- the pin ----
const ymlPath = join(workspace, 'groundwork.yml')
if (!existsSync(ymlPath)) fail(`no groundwork.yml in ${workspace} (run it from a workspace repo, or pass --workspace)`)
const lines = readFileSync(ymlPath, 'utf8').split('\n')
let source = DEFAULT_SOURCE
let ref
const at = lines.findIndex((l) => /^\s*-?\s*source:\s*\S+/.test(l))
if (at !== -1) {
  source = lines[at].match(/source:\s*["']?([^"'\s#]+)/)[1]
  for (let i = at + 1; i < Math.min(lines.length, at + 4) && !/^\s*-\s/.test(lines[i]); i++) {
    const m = lines[i].match(/^\s*ref:\s*["']?([^"'\s#]+)/)
    if (m) ref = m[1]
  }
}
// Overrides win over the pin (used to fetch an older or newer version to compare against).
if (value('--source')) source = value('--source')
if (value('--ref')) ref = value('--ref')
if (!/^[\w.-]+\/[\w.-]+$/.test(source)) fail(`source "${source}" is not owner/repo`)

// ---- candidates ----
const sibling = resolve(value('--library') ?? join(workspace, '..', source.split('/')[1]))

function atRef(dir, wanted) {
  try {
    return git(dir, 'rev-parse', 'HEAD') === git(dir, 'rev-parse', `${wanted}^{commit}`)
  } catch {
    return false
  }
}

if (!ref) {
  if (isLibrary(sibling)) {
    info(`resolve-library: this workspace has no pin; using ${sibling} as it is (add \`libraries:\` to groundwork.yml to pin it)`)
    process.stdout.write(`${sibling}\n`)
    process.exit(0)
  }
  fail(`no pin in groundwork.yml and no library checkout at ${sibling}`)
}

if (isLibrary(sibling) && atRef(sibling, ref)) {
  process.stdout.write(`${sibling}\n`)
  process.exit(0)
}

const cache = join(process.env.GROUNDWORK_CACHE ?? join(homedir(), '.cache', 'groundwork', 'libraries'), source.replace('/', '__'), ref)
if (isLibrary(cache) && atRef(cache, ref)) {
  process.stdout.write(`${cache}\n`)
  process.exit(0)
}

const base = (process.env.GROUNDWORK_LIBRARY_GIT_BASE ?? 'https://github.com').replace(/\/$/, '')
info(`resolve-library: fetching ${source}@${ref} into ${cache}`)
mkdirSync(join(cache, '..'), { recursive: true })
const tmp = `${cache}.partial`
rmSync(tmp, { recursive: true, force: true })
try {
  execFileSync('git', ['clone', '--quiet', '--depth', '1', '--branch', ref, `${base}/${source}.git`, tmp], { stdio: ['ignore', 'ignore', 'pipe'] })
} catch (e) {
  rmSync(tmp, { recursive: true, force: true })
  fail(`could not clone ${source}@${ref} from ${base} (is the tag real, and are you signed in to GitHub?)\n${String(e.stderr ?? e.message).trim()}`)
}
rmSync(cache, { recursive: true, force: true })
renameSync(tmp, cache)
process.stdout.write(`${cache}\n`)
