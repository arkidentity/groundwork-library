#!/usr/bin/env node
// Proves validate.mjs fails when it should. Each case copies the library to a temp folder, breaks
// one thing, and expects a non-zero exit with a message containing `expect`. A control case must pass.

import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const V = readFileSync(join(ROOT, 'library.yml'), 'utf8').match(/^version:\s*(\S+)/m)[1]
const TV = readFileSync(join(ROOT, 'templates/blank/template.yml'), 'utf8').match(/^version:\s*(\S+)/m)[1]
const edit = (dir, file, fn) => writeFileSync(join(dir, file), fn(readFileSync(join(dir, file), 'utf8')))
const swap = (from, to) => (s) => {
  if (!s.includes(from)) throw new Error(`test setup: "${from}" not found`)
  return s.replace(from, to)
}

const cases = [
  ['control: unchanged library passes', null, () => {}],
  ['invalid YAML in template.yml', 'invalid YAML', (d) => edit(d, 'templates/messaging/template.yml', (s) => s + '\n  bad: [')],
  ['unknown {{placeholder}}', 'is not in template.yml vars', (d) => edit(d, 'templates/messaging/assigned/q-002-your-customer.md', swap('{{customer}}', '{{oops}}'))],
  ["item's topic doesn't exist", 'is not one of this template', (d) => edit(d, 'templates/messaging/assigned/q-003-the-problem.md', swap('topic: your-story', 'topic: nope'))],
  ['bad item type', 'type must be one of', (d) => edit(d, 'templates/messaging/assigned/q-004-what-you-do.md', swap('type: question', 'type: quiz'))],
  ['duplicate item id', 'duplicate id', (d) => edit(d, 'templates/messaging/assigned/q-005-proof-and-story.md', swap('id: q-005', 'id: q-004'))],
  ['filename does not start with id', 'filename must start with the id', (d) => edit(d, 'templates/messaging/assigned/q-006-your-words.md', swap('id: q-006', 'id: q-016'))],
  ['template version differs from index', 'differs from library.yml', (d) => edit(d, 'templates/blank/template.yml', swap(`version: ${TV}`, 'version: 99.0.0'))],
  ['changelog has no entry for the version', 'no "## 99.0.0" entry', (d) => edit(d, 'library.yml', swap(`version: ${V}\ncontract`, 'version: 99.0.0\ncontract'))],
  ['skill name differs from folder', 'must equal the folder name', (d) => edit(d, 'skills/groundwork-inbox/SKILL.md', swap('name: groundwork-inbox', 'name: inbox'))],
  ['old templates/projects path in a skill', 'old templates/projects/', (d) => edit(d, 'skills/groundwork-outbox/SKILL.md', (s) => s + '\nsee templates/projects/x\n')],
  ['template folder not listed in the index', 'is not listed', (d) => { mkdirSync(join(d, 'templates/extra')); cpSync(join(d, 'templates/blank'), join(d, 'templates/extra'), { recursive: true }) }],
  ['pairs_with a template that does not exist', 'is not a template in this library', (d) => edit(d, 'templates/blank/template.yml', swap('pairs_with: []', 'pairs_with: [ghost]'))],
  ['question bank: bad priority', 'pri must be one of', (d) => edit(d, 'templates/church-website/question-bank.yml', swap('pri: M', 'pri: X'))],
  ['question bank: unknown gate', 'unknown gate', (d) => edit(d, 'templates/church-website/question-bank.yml', swap('gate: livestream}', 'gate: nothing}'))],
  ['LICENSE removed', 'LICENSE', (d) => rmSync(join(d, 'LICENSE'))],
  ['library.yml has no source', '`source` must be owner/repo', (d) => edit(d, 'library.yml', swap('source: arkidentity/groundwork-library', 'source: nonsense'))],
  ['a script with a syntax error', 'does not parse', (d) => edit(d, 'skills/groundwork-project/scripts/resolve-library.mjs', (t) => t + '\nconst = ;\n')],
  ['core skill line the sync script cannot read (keys swapped)', 'sync-skills.mjs', (d) => edit(d, 'library.yml', swap('{name: groundwork-inbox, core: true}', '{core: true, name: groundwork-inbox}'))],
  ['core skill line with extra spaces still passes', null, (d) => edit(d, 'library.yml', swap('{name: groundwork-inbox, core: true}', '{name: groundwork-inbox,  core:  true}'))],
]

let failed = 0
for (const [name, expect, mutate] of cases) {
  const dir = mkdtempSync(join(tmpdir(), 'gwlib-'))
  try {
    cpSync(ROOT, dir, { recursive: true, filter: (p) => !/(\.git|node_modules)(\/|$)/.test(p) })
    cpSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'), { recursive: true })
    mutate(dir)
    let code = 0
    let out = ''
    try {
      out = execFileSync('node', ['scripts/validate.mjs'], { cwd: dir, encoding: 'utf8', stdio: 'pipe' })
    } catch (e) {
      code = e.status ?? 1
      out = `${e.stdout ?? ''}${e.stderr ?? ''}`
    }
    const ok = expect === null ? code === 0 : code === 1 && out.includes(expect)
    if (!ok) failed++
    console.log(`${ok ? 'pass' : 'FAIL'}  ${name}${ok ? '' : `\n      expected ${expect === null ? 'exit 0' : `exit 1 containing "${expect}"`}, got exit ${code}:\n      ${out.split('\n').find((l) => /ERROR/.test(l)) ?? out.slice(0, 200)}`}`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
console.log(failed ? `\n${failed} of ${cases.length} validator tests failed` : `\nall ${cases.length} validator tests passed`)
process.exit(failed ? 1 : 0)
