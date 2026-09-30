#!/usr/bin/env node
// Tests check-denylist.mjs in throwaway git repos.

import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'check-denylist.mjs')
const tmp = mkdtempSync(join(tmpdir(), 'gwdeny-'))
const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@example.com', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@example.com' }
delete env.DENYLIST_REGEX
const git = (...a) => execFileSync('git', ['-C', tmp, ...a], { encoding: 'utf8', env })
const run = (pattern) => spawnSync('node', [SCRIPT], { cwd: tmp, encoding: 'utf8', env: pattern === undefined ? env : { ...env, DENYLIST_REGEX: pattern } })

let failed = 0
const check = (name, cond, detail = '') => {
  if (!cond) failed++
  console.log(`${cond ? 'pass' : 'FAIL'}  ${name}${cond ? '' : `  ${String(detail).slice(0, 300)}`}`)
}

try {
  execFileSync('git', ['init', '-q', tmp], { env })
  writeFileSync(join(tmp, 'a.md'), 'Nothing private here.\nSecond line.\n')
  git('add', '-A')
  git('commit', '-q', '-m', 'first')

  let r = run(undefined)
  check('no pattern set: skips and exits 0', r.status === 0 && /not set/.test(r.stdout), r.stdout)
  r = run('\\b(acme corp|jane doe)\\b')
  check('a clean repo passes', r.status === 0 && /clean/.test(r.stdout), r.stdout + r.stderr)

  writeFileSync(join(tmp, 'b.md'), 'line one\nWorked with Acme Corp last year.\n')
  git('add', '-A')
  git('commit', '-q', '-m', 'second')
  r = run('\\b(acme corp|jane doe)\\b')
  check('a match in a file fails with file:line', r.status === 1 && /b\.md:2/.test(r.stderr), r.stderr)
  check('the matched text is never printed', !/acme corp/i.test(r.stdout + r.stderr), r.stdout + r.stderr)

  git('rm', '-q', 'b.md')
  git('commit', '-q', '-m', 'remove it')
  r = run('\\b(acme corp|jane doe)\\b')
  check('a match only in old history (file since removed) still fails, naming the commit and file', r.status === 1 && /commit [0-9a-f]{10} added a match in b\.md/.test(r.stderr), r.stderr)

  writeFileSync(join(tmp, 'c.md'), 'fine\n')
  git('add', '-A')
  git('commit', '-q', '-m', 'notes about Jane Doe')
  r = run('\\b(acme corp|jane doe)\\b')
  check('a match in a commit message fails', r.status === 1 && /commit [0-9a-f]{10}/.test(r.stderr), r.stderr)

  r = run('(')
  check('an invalid pattern fails loudly with exit 2', r.status === 2 && /not a valid/.test(r.stderr), r.stderr)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
console.log(failed ? `\n${failed} denylist test(s) failed` : '\nall denylist tests passed')
process.exit(failed ? 1 : 0)
