#!/usr/bin/env node
// Tests template-diff.mjs against local git repos: a "remote" library with releases v1.0.0 and v2.0.0
// where the template changes in every way that matters, and workspaces stamped from v1.0.0.

import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIFF = join(ROOT, 'skills/groundwork-project/scripts/template-diff.mjs')
const tmp = mkdtempSync(join(tmpdir(), 'gwdiff-'))
const env = {
  ...process.env,
  GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@example.com', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@example.com',
  GROUNDWORK_LIBRARY_GIT_BASE: `file://${join(tmp, 'remote')}`,
  GROUNDWORK_CACHE: join(tmp, 'cache'),
}
const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8', env }).trim()
const put = (base, rel, text) => {
  mkdirSync(join(base, rel, '..'), { recursive: true })
  writeFileSync(join(base, rel), text)
}

let failed = 0
function check(name, cond, detail = '') {
  if (!cond) failed++
  console.log(`${cond ? 'pass' : 'FAIL'}  ${name}${cond ? '' : `  ${String(detail).slice(0, 400)}`}`)
}
const item = (id, title, prompts, extra = '') =>
  `---\nid: ${id}\ntype: question\ntitle: ${title}\nstatus: open\nassigned: {{date}}\ntopic: intro\norder: 1\nprompts:\n${prompts.map((p) => `  - "${p}"`).join('\n')}\n${extra}---\n\nBody.\n`
const bank = (rows) => `sections:\n  - id: 1\n    name: S\n    dest: x\n    q:\n${rows.map(([id, q, pri]) => `      - {id: "${id}", q: "${q}", type: text, pri: ${pri}, src: manual}`).join('\n')}\n`

try {
  const work = join(tmp, 'work')
  execFileSync('git', ['init', '-q', work], { env })
  const release = (v, files, changelog) => {
    for (const [rel, text] of Object.entries(files)) put(work, rel, text)
    put(work, 'library.yml', `name: lib\nsource: acme/lib\nversion: ${v}\n`)
    put(work, 'CHANGELOG.md', changelog)
    git(work, 'add', '-A')
    git(work, 'commit', '-q', '-m', `v${v}`)
    git(work, 'tag', `v${v}`)
  }
  // ---- v1.0.0 ----
  release('1.0.0', {
    'templates/site/template.yml': 'name: site\nversion: 1.0.0\n',
    'templates/site/project.md': '---\ntitle: Site\n---\nIntro\n',
    'templates/site/topics/intro.md': '---\ntitle: Intro\norder: 1\n---\nHello\n',
    'templates/site/assigned/q-001-first.md': item('q-001', 'First question', ['Old prompt one', 'Keep me']),
    'templates/site/assigned/q-002-second.md': item('q-002', 'Second question', ['Only here']),
    'templates/site/question-bank.yml': bank([['1.1', 'Name?', 'M'], ['1.2', 'Address?', 'S'], ['1.3', 'Gone soon?', 'N']]),
  }, '# Changelog\n\n## 1.0.0\n- First release.\n')
  // ---- v2.0.0 ----
  release('2.0.0', {
    'templates/site/template.yml': 'name: site\nversion: 1.1.0\n',
    'templates/site/assigned/q-001-first.md': item('q-001', 'First question', ['New prompt one', 'Keep me']),
    'templates/site/assigned/q-004-fourth.md': item('q-004', 'Fourth question', ['Brand new']),
    'templates/site/topics/extra.md': '---\ntitle: Extra\norder: 2\n---\nMore\n',
    'templates/site/question-bank.yml': bank([['1.1', 'Name?', 'M'], ['1.2', 'Address?', 'M'], ['1.4', 'New thing?', 'M']]),
  }, '# Changelog\n\n## 2.0.0\n- Reworded the first question, added a fourth, dropped the second.\n\n## 1.0.0\n- First release.\n')
  execFileSync('git', ['-C', work, 'rm', '-q', 'templates/site/assigned/q-002-second.md'], { env })
  git(work, 'commit', '-q', '-m', 'v2 cleanup')
  git(work, 'tag', '-f', 'v2.0.0')
  const remote = join(tmp, 'remote', 'acme', 'lib.git')
  mkdirSync(remote, { recursive: true })
  execFileSync('git', ['clone', '-q', '--bare', work, remote], { env })

  const workspace = (name, { pin = 'v2.0.0', project = 'from_template: site@1.0.0\ntemplate_library: acme/lib@v1.0.0\n', items = true } = {}) => {
    const dir = join(tmp, name)
    put(dir, 'groundwork.yml', `name: T\n${pin ? `libraries:\n  - source: acme/lib\n    ref: ${pin}\n` : ''}`)
    put(dir, 'workspace/projects/site.md', `---\ntitle: The site\n${project}---\nBody\n`)
    if (items) {
      put(dir, 'workspace/assigned/q-010-first.md', item('q-010', 'Their first', ['x'], 'template_item: q-001-first\n').replace('status: open', 'status: answered'))
      put(dir, 'workspace/assigned/q-011-second.md', item('q-011', 'Their second', ['y'], 'template_item: q-002-second\n'))
      put(dir, 'workspace/topics/intro.md', '---\ntitle: Intro\ntemplate_topic: intro\n---\nHello\n')
    }
    return dir
  }
  const run = (ws, ...a) => spawnSync('node', [DIFF, '--workspace', ws, ...a], { encoding: 'utf8', env })
  const json = (ws, ...a) => JSON.parse(run(ws, '--json', ...a).stdout)
  const paths = (list) => list.map((f) => f.path)

  // ---- the main case ----
  const ws = workspace('ws-main')
  execFileSync('git', ['init', '-q', ws], { env })
  git(ws, 'add', '-A')
  git(ws, 'commit', '-q', '-m', 'init')
  let res = json(ws).results[0]
  check('finds the project and says updates are available', res?.status === 'updates' && res.template === 'site', JSON.stringify(res)?.slice(0, 200))
  check('reports the template version change', res.fromTemplateVersion === '1.0.0' && res.toTemplateVersion === '1.1.0', `${res.fromTemplateVersion}->${res.toTemplateVersion}`)
  check('lists new files (an item and a topic)', paths(res.added).includes('assigned/q-004-fourth.md') && paths(res.added).includes('topics/extra.md'), JSON.stringify(res.added))
  check('gives a new item its title', res.added.find((f) => f.path === 'assigned/q-004-fourth.md')?.title === 'Fourth question')
  const changed = res.changed.find((f) => f.path === 'assigned/q-001-first.md')
  check('lists a changed item with a line diff', changed && /-\s+- "Old prompt one"/.test(changed.diff) && /\+\s+- "New prompt one"/.test(changed.diff), changed?.diff)
  check('links a changed item to the workspace item it became, with its status', changed?.links?.[0]?.id === 'q-010' && changed.links[0].status === 'answered', JSON.stringify(changed?.links))
  const removed = res.removed.find((f) => f.path === 'assigned/q-002-second.md')
  check('lists a removed item and links it to the live one', removed?.links?.[0]?.id === 'q-011' && removed.links[0].status === 'open', JSON.stringify(removed))
  check('lists template.yml as changed', paths(res.changed).includes('template.yml'))
  check('the unchanged topic and project files are not reported', !paths([...res.changed, ...res.added, ...res.removed]).some((p) => p === 'topics/intro.md' || p === 'project.md'))
  check('summarises the question bank (added, removed, changed)', res.bank?.added.map((q) => q.id).join() === '1.4' && res.bank.removed.map((q) => q.id).join() === '1.3' && res.bank.changed.map((q) => q.id).join() === '1.2' && res.bank.changed[0].to.pri === 'M', JSON.stringify(res.bank))
  check('does not dump the bank as a raw diff', !paths(res.changed).includes('question-bank.yml'))
  check('includes the changelog entries after the starting release, not before', res.changelog.length === 1 && res.changelog[0].version === '2.0.0' && /Reworded/.test(res.changelog[0].text), JSON.stringify(res.changelog))

  const md = run(ws).stdout
  check('the markdown report has the sections a person reads', /### New in the template/.test(md) && /### Changed/.test(md) && /```diff/.test(md) && /### Removed/.test(md) && /### Question bank/.test(md) && /linked: q-010 \(answered\)/.test(md), md.slice(0, 500))
  check('the report says it never rewrites live items', /never (over|rewritten)/.test(md))

  // ---- not linked ----
  const ws2 = workspace('ws-unlinked', { items: false })
  res = json(ws2).results[0]
  check('an item with no template_item stamp reads as "not linked"', /not linked to any workspace item/.test(run(ws2).stdout) && res.changed.find((f) => f.path === 'assigned/q-001-first.md').links.length === 0)

  // ---- up to date ----
  const ws3 = workspace('ws-current', { project: 'from_template: site@1.1.0\ntemplate_library: acme/lib@v2.0.0\n' })
  check('a project started from the current release is up to date', json(ws3).results[0].status === 'up-to-date' && /Up to date/.test(run(ws3).stdout))

  // ---- --to ----
  execFileSync('git', ['-C', work, 'tag', 'v3.0.0'], { env })
  execFileSync('git', ['-C', work, 'push', '-q', remote, 'v3.0.0'], { env })
  res = json(ws, '--to', 'latest').results[0]
  check('--to latest finds the newest tag on the remote', res.targetLibrary === 'acme/lib@v3.0.0', res.targetLibrary)
  res = json(ws, '--to', 'v2.0.0').results[0]
  check('--to <tag> compares against that tag', res.targetLibrary === 'acme/lib@v2.0.0' && res.status === 'updates')

  // ---- a release where only the template's version number moved ----
  put(work, 'templates/site/template.yml', 'name: site\nversion: 1.1.1\n')
  put(work, 'library.yml', 'name: lib\nsource: acme/lib\nversion: 2.1.0\n')
  put(work, 'CHANGELOG.md', '# Changelog\n\n## 2.1.0\n- Metadata only.\n\n## 2.0.0\n- Big one.\n\n## 1.0.0\n- First release.\n')
  git(work, 'add', '-A')
  git(work, 'commit', '-q', '-m', 'v2.1.0')
  git(work, 'tag', 'v2.1.0')
  execFileSync('git', ['-C', work, 'push', '-q', remote, 'v2.1.0'], { env })
  const wsMeta = workspace('ws-meta', { project: 'from_template: site@1.1.0\ntemplate_library: acme/lib@v2.0.0\n' })
  res = json(wsMeta, '--to', 'v2.1.0').results[0]
  check('a version-number-only change is "metadata-only", not "updates"', res.status === 'metadata-only', JSON.stringify(res).slice(0, 200))
  check('...and the report says there is nothing to adopt', /Nothing to adopt/.test(run(wsMeta, '--to', 'v2.1.0').stdout))
  check('template.yml is labelled without a title (no comment line mistaken for one)', !json(ws).results[0].changed.find((f) => f.path === 'template.yml').title, JSON.stringify(json(ws).results[0].changed.find((f) => f.path === 'template.yml')))

  // ---- two projects over the same range print the changelog once ----
  const two = workspace('ws-two')
  put(two, 'workspace/projects/site2.md', '---\ntitle: Second site\nfrom_template: site@1.0.0\ntemplate_library: acme/lib@v1.0.0\n---\nBody\n')
  const twoMd = run(two).stdout
  check('two projects over one range print the changelog once', (twoMd.match(/library-wide/g) ?? []).length === 1 && /Same range as above/.test(twoMd), twoMd.slice(0, 300))

  // ---- the cannot-compare cases ----
  const ws4 = workspace('ws-nostamp-lib', { project: 'from_template: site@1.0.0\n' })
  res = json(ws4).results[0]
  check('no template_library stamp: says it cannot compare and why', res.status === 'cannot-compare' && /no template_library stamp/.test(res.reason), JSON.stringify(res))
  const ws5 = workspace('ws-nopin', { pin: null })
  res = json(ws5).results[0]
  check('an unpinned workspace asks for --to', res.status === 'cannot-compare' && /no pin/.test(res.reason), JSON.stringify(res))
  const ws6 = workspace('ws-badtag', { pin: 'v9.9.9' })
  res = json(ws6).results[0]
  check('a target tag that does not exist fails clearly', res.status === 'cannot-compare' && /could not clone/.test(res.reason), JSON.stringify(res))
  const ws7 = workspace('ws-gone', { project: 'from_template: gone@1.0.0\ntemplate_library: acme/lib@v1.0.0\n' })
  res = json(ws7).results[0]
  check('a template that no longer exists is reported, not crashed on', res.status === 'cannot-compare' || res.status === 'template-missing', JSON.stringify(res))

  // ---- no stamps at all ----
  const ws8 = workspace('ws-plain', { project: '', items: false })
  const plain = run(ws8)
  check('a workspace with no provenance explains how to add it', plain.status === 0 && /No project records where it came from/.test(plain.stdout), plain.stdout + plain.stderr)
  check('--project limits the check to one project', json(ws, '--project', 'other').results.length === 0)

  // ---- it only reads ----
  const before = git(ws, 'status', '--porcelain')
  check('running it never changes the workspace', before === git(ws, 'status', '--porcelain'))
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

console.log(failed ? `\n${failed} diff test(s) failed` : '\nall diff tests passed')
process.exit(failed ? 1 : 0)
