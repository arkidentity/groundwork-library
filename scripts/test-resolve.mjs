#!/usr/bin/env node
// Tests the pin resolver against local git repos (no network): a "remote" library with two tagged
// releases, a sibling checkout, and workspaces pinned to different versions.

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const RESOLVER = join(ROOT, 'skills/groundwork-project/scripts/resolve-library.mjs')
const tmp = mkdtempSync(join(tmpdir(), 'gwresolve-'))
const env = {
  ...process.env,
  GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@example.com', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@example.com',
  GROUNDWORK_LIBRARY_GIT_BASE: `file://${join(tmp, 'remote')}`,
  GROUNDWORK_CACHE: join(tmp, 'cache'),
}
const run = (cwd, ...a) => execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8', env }).trim()

let failed = 0
function check(name, cond, detail = '') {
  if (!cond) failed++
  console.log(`${cond ? 'pass' : 'FAIL'}  ${name}${cond ? '' : `  ${detail}`}`)
}
function resolver(workspace, ...extra) {
  const r = spawnSync('node', [RESOLVER, '--workspace', workspace, ...extra], { encoding: 'utf8', env })
  return { path: r.stdout.trim(), err: r.stderr, code: r.status }
}
function workspace(name, yml) {
  const dir = join(tmp, name)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'groundwork.yml'), yml)
  return dir
}

try {
  // The remote: owner/repo.git with v1.0.0 and v2.0.0.
  const remote = join(tmp, 'remote', 'acme', 'lib.git')
  mkdirSync(remote, { recursive: true })
  const work = join(tmp, 'work')
  execFileSync('git', ['init', '-q', work], { env })
  for (const v of ['1.0.0', '2.0.0']) {
    writeFileSync(join(work, 'library.yml'), `name: lib\nversion: ${v}\n`)
    run(work, 'add', '-A')
    run(work, 'commit', '-q', '-m', `v${v}`)
    run(work, 'tag', `v${v}`)
  }
  execFileSync('git', ['clone', '-q', '--bare', work, remote], { env })

  const pinned = (ref, extra = '') => `name: T\nlibraries:\n  - source: acme/lib\n    ref: ${ref}\n${extra}`

  // A sibling checkout sitting at v2.0.0 (the newest).
  const sibling = join(tmp, 'lib')
  execFileSync('git', ['clone', '-q', remote, sibling], { env })

  let ws = workspace('ws-pinned-v2', pinned('v2.0.0'))
  let r = resolver(ws, '--library', sibling)
  check('uses the sibling when it is exactly at the pinned ref', r.code === 0 && r.path === sibling, JSON.stringify(r))

  ws = workspace('ws-pinned-v1', pinned('v1.0.0'))
  r = resolver(ws, '--library', sibling)
  check('does NOT use a sibling at a different version', r.code === 0 && r.path !== sibling, JSON.stringify(r))
  check('fetches the pinned ref into the cache instead', r.path.startsWith(join(tmp, 'cache')) && /fetching/.test(r.err), JSON.stringify(r))
  check('the cached checkout really is at the pinned version', readFileSync(join(r.path, 'library.yml'), 'utf8').includes('version: 1.0.0'))

  const before = r.path
  r = resolver(ws, '--library', sibling)
  check('the second call reuses the cache without fetching', r.path === before && !/fetching/.test(r.err), JSON.stringify(r))

  ws = workspace('ws-bad-tag', pinned('v9.9.9'))
  r = resolver(ws, '--library', sibling)
  check('an unknown tag fails clearly', r.code === 1 && /could not clone/.test(r.err) && r.path === '', JSON.stringify(r))
  check('a failed fetch leaves no half-written cache', !existsSync(join(tmp, 'cache', 'acme__lib', 'v9.9.9')) && !existsSync(join(tmp, 'cache', 'acme__lib', 'v9.9.9.partial')))

  ws = workspace('ws-unpinned', 'name: T\n')
  r = resolver(ws, '--library', sibling)
  check('an unpinned workspace uses the sibling and says so', r.code === 0 && r.path === sibling && /no pin/.test(r.err), JSON.stringify(r))

  ws = workspace('ws-unpinned-nolib', 'name: T\n')
  r = resolver(ws, '--library', join(tmp, 'nowhere'))
  check('unpinned with no library anywhere fails', r.code === 1, JSON.stringify(r))

  ws = workspace('ws-comments', '# Groundwork config\nname: T   # the client\nlibraries:\n  # our templates\n  - source: "acme/lib"   # pinned\n    ref: "v1.0.0"   # do not float\n')
  r = resolver(ws, '--library', sibling)
  check('reads quoted values and ignores comments', r.code === 0 && readFileSync(join(r.path, 'library.yml'), 'utf8').includes('version: 1.0.0'), JSON.stringify(r))

  r = resolver(join(tmp, 'not-a-workspace'))
  check('a folder with no groundwork.yml fails clearly', r.code === 1 && /no groundwork.yml/.test(r.err), JSON.stringify(r))
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

console.log(failed ? `\n${failed} resolver test(s) failed` : '\nall resolver tests passed')
process.exit(failed ? 1 : 0)
