#!/usr/bin/env node
// Tests sync-skills.mjs against a throwaway library and workspace repo in a temp folder.

import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tmp = mkdtempSync(join(tmpdir(), 'gwsync-'))
const lib = join(tmp, 'groundwork-library')
const repo = join(tmp, 'client-workspace')
const env = {
  ...process.env,
  GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@example.com', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@example.com',
}
const git = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', env }).trim()
const sync = (...a) => spawnSync('node', [join(lib, 'scripts/sync-skills.mjs'), '--repo', repo, ...a], { encoding: 'utf8', env })
const skill = (name) => join(repo, '.claude/skills', name, 'SKILL.md')
const libSkill = (name) => join(lib, 'skills', name, 'SKILL.md')
const commits = () => Number(git('rev-list', '--count', 'HEAD'))

let failed = 0
function check(name, cond, detail = '') {
  if (!cond) failed++
  console.log(`${cond ? 'pass' : 'FAIL'}  ${name}${cond ? '' : `  ${detail}`}`)
}

try {
  // A minimal library: the real scripts, index and skills (copied), so the test tracks the real layout.
  cpSync(ROOT, lib, { recursive: true, filter: (p) => !/(\.git|node_modules|templates)(\/|$)/.test(p) })
  cpSync(join(ROOT, 'templates'), join(lib, 'templates'), { recursive: true })
  execFileSync('git', ['init', '-q', repo], { env })
  writeFileSync(join(repo, 'groundwork.yml'), 'name: Test Client\n')
  git('add', '-A')
  git('commit', '-q', '-m', 'init')

  const core = ['groundwork-inbox', 'groundwork-outbox', 'groundwork-project']
  let r = sync('--commit')
  check('installs the core skills into a fresh repo', core.every((s) => existsSync(skill(s))), r.stdout + r.stderr)
  check('does not install the optional skill uninvited', !existsSync(skill('church-website-discovery')))
  check('writes a stamp for each skill', core.every((s) => existsSync(join(repo, '.claude/skills', s, '.library.json'))))
  check('commits (one new commit) and does not push', commits() === 2 && !/push/i.test(git('log', '-1', '--format=%s')))

  r = sync('--commit')
  check('second run changes nothing', r.status === 0 && commits() === 2 && /up to date/.test(r.stdout), r.stdout)

  const inboxBefore = readFileSync(skill('groundwork-inbox'), 'utf8')
  writeFileSync(skill('groundwork-inbox'), inboxBefore + '\nLOCAL EDIT\n')
  r = sync()
  check('skips a skill edited locally, exit code 2', r.status === 2 && /SKIPPED/.test(r.stdout), r.stdout)
  check('leaves the local edit in place', readFileSync(skill('groundwork-inbox'), 'utf8').includes('LOCAL EDIT'))

  r = sync('--except', 'client-workspace:groundwork-inbox')
  check('--except leaves a forked skill alone without error', r.status === 0 && /excluded/.test(r.stdout), r.stdout)

  r = sync('--force')
  check('--force overwrites the local edit', !readFileSync(skill('groundwork-inbox'), 'utf8').includes('LOCAL EDIT') && r.status === 0, r.stdout)

  // A library release: change a skill, bump the version.
  writeFileSync(libSkill('groundwork-outbox'), readFileSync(libSkill('groundwork-outbox'), 'utf8') + '\nNEW RULE\n')
  writeFileSync(join(lib, 'library.yml'), readFileSync(join(lib, 'library.yml'), 'utf8').replace(/^version: .*/m, 'version: 9.9.9'))
  r = sync('--commit')
  check('a new library release updates the skill', readFileSync(skill('groundwork-outbox'), 'utf8').includes('NEW RULE'), r.stdout)
  check('the stamp records the new version', JSON.parse(readFileSync(join(repo, '.claude/skills/groundwork-outbox/.library.json'), 'utf8')).version === '9.9.9')
  check('untouched skills are not rewritten by a release', /groundwork-project: (up to date|same as library)/.test(r.stdout), r.stdout)

  r = sync('--add', 'church-website-discovery', '--commit')
  check('--add installs an optional skill', existsSync(skill('church-website-discovery')), r.stdout)
  writeFileSync(libSkill('church-website-discovery'), readFileSync(libSkill('church-website-discovery'), 'utf8') + '\nMORE\n')
  r = sync()
  check('an optional skill already present keeps syncing', readFileSync(skill('church-website-discovery'), 'utf8').includes('MORE'), r.stdout)

  r = sync('--add', 'no-such-skill')
  check('--add of an unknown skill fails clearly', r.status === 1 && /not a library skill/.test(r.stderr), r.stderr)

  const dry = readFileSync(skill('groundwork-outbox'), 'utf8')
  writeFileSync(libSkill('groundwork-outbox'), dry + '\nDRY\n')
  r = sync('--dry-run')
  check('--dry-run writes nothing', !readFileSync(skill('groundwork-outbox'), 'utf8').includes('DRY') && /dry run/.test(r.stdout), r.stdout)

  // ---- pins ----
  const repo2 = join(tmp, 'pinned-workspace')
  execFileSync('git', ['init', '-q', repo2], { env })
  const yml2 = '# Groundwork config\nname: Pinned Client   # keep this comment\npeople:\n  - A <a@example.com>\n'
  writeFileSync(join(repo2, 'groundwork.yml'), yml2)
  const git2 = (...a) => execFileSync('git', ['-C', repo2, ...a], { encoding: 'utf8', env }).trim()
  git2('add', '-A')
  git2('commit', '-q', '-m', 'init')
  const sync2 = (...a) => spawnSync('node', [join(lib, 'scripts/sync-skills.mjs'), '--repo', repo2, ...a], { encoding: 'utf8', env })
  const setLibrary = (v, extra = '') => {
    writeFileSync(join(lib, 'library.yml'), readFileSync(join(lib, 'library.yml'), 'utf8').replace(/^version: .*/m, `version: ${v}`))
    if (extra) writeFileSync(libSkill('groundwork-outbox'), readFileSync(libSkill('groundwork-outbox'), 'utf8') + extra)
  }
  const yml = () => readFileSync(join(repo2, 'groundwork.yml'), 'utf8')
  const outbox2 = () => readFileSync(join(repo2, '.claude/skills/groundwork-outbox/SKILL.md'), 'utf8')

  setLibrary('5.0.0')
  r = sync2('--dry-run', '--pin')
  check('--pin with --dry-run writes nothing', yml() === yml2 && /none -> v5.0.0/.test(r.stdout), r.stdout)

  r = sync2()
  check('an unpinned repo still syncs, with a notice', r.status === 0 && /unpinned/.test(r.stdout) && existsSync(join(repo2, '.claude/skills/groundwork-inbox/SKILL.md')), r.stdout)
  check('an unpinned repo is left unpinned without --pin', !/libraries:/.test(yml()))

  r = sync2('--pin', '--commit')
  check('--pin adds the pin at the current version', /libraries:\n {2}- source: arkidentity\/groundwork-library\n {4}ref: v5\.0\.0/.test(yml()), yml())
  check('--pin keeps the rest of groundwork.yml and its comments', yml().startsWith(yml2.trimEnd()) && yml().includes('# keep this comment'), yml())
  check('--pin commits groundwork.yml along with the skills', /groundwork\.yml/.test(git2('show', '--stat', '--format=', 'HEAD')), git2('show', '--stat', '--format=', 'HEAD'))

  setLibrary('5.1.0', '\nRELEASE 5.1 RULE\n')
  r = sync2('--commit')
  check('a pinned repo is skipped when the library has moved on', r.status === 2 && /pinned; run with --upgrade/.test(r.stdout), r.stdout)
  check('the skipped repo keeps its old skills and old pin', !outbox2().includes('RELEASE 5.1 RULE') && /ref: v5\.0\.0/.test(yml()))

  r = sync2('--upgrade', '--dry-run')
  check('--upgrade with --dry-run changes nothing', /v5.0.0 -> v5.1.0/.test(r.stdout) && /ref: v5\.0\.0/.test(yml()) && !outbox2().includes('RELEASE 5.1 RULE'), r.stdout)

  r = sync2('--upgrade', '--commit')
  check('--upgrade moves the pin and syncs the skills', /ref: v5\.1\.0/.test(yml()) && outbox2().includes('RELEASE 5.1 RULE') && r.status === 0, r.stdout)
  check('--upgrade leaves the comments alone', yml().includes('# keep this comment'))

  // A repo that already pins some other library keeps it.
  const repo3 = join(tmp, 'other-libs')
  execFileSync('git', ['init', '-q', repo3], { env })
  writeFileSync(join(repo3, 'groundwork.yml'), 'name: Multi\nlibraries:\n  - source: acme/their-templates\n    ref: v3.0.0\n')
  execFileSync('git', ['-C', repo3, 'add', '-A'], { env })
  execFileSync('git', ['-C', repo3, 'commit', '-q', '-m', 'init'], { env })
  spawnSync('node', [join(lib, 'scripts/sync-skills.mjs'), '--repo', repo3, '--pin'], { encoding: 'utf8', env })
  const y3 = readFileSync(join(repo3, 'groundwork.yml'), 'utf8')
  check('--pin adds ours without touching another library entry', y3.includes('acme/their-templates') && y3.includes('ref: v3.0.0') && /source: arkidentity\/groundwork-library\n {4}ref: v5\.1\.0/.test(y3), y3)

  // Pinned to something that is not a release tag: still compared as text, so it needs --upgrade.
  writeFileSync(join(repo3, 'groundwork.yml'), 'name: Multi\nlibraries:\n  - source: arkidentity/groundwork-library\n    ref: main\n')
  r = spawnSync('node', [join(lib, 'scripts/sync-skills.mjs'), '--repo', repo3], { encoding: 'utf8', env })
  check('a floating pin (ref: main) is skipped until upgraded to a tag', r.status === 2 && /pin: main/.test(r.stdout), r.stdout)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

console.log(failed ? `\n${failed} sync test(s) failed` : '\nall sync tests passed')
process.exit(failed ? 1 : 0)
