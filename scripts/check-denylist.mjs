#!/usr/bin/env node
// Fails if a client-name pattern appears in any tracked file or commit message. This repo is public,
// so client names and other private details must never land in it.
//
//   DENYLIST_REGEX='\b(acme|jane doe)\b' node scripts/check-denylist.mjs
//
// The pattern comes from the environment (in CI, the DENYLIST_REGEX repository secret), because a
// list of names committed to a public repo would itself leak them. With no pattern set (forks, a
// fresh clone) it says so and exits 0. Matches are reported as file:line only, never the text.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const pattern = (process.env.DENYLIST_REGEX ?? '').trim()
if (!pattern) {
  console.log('check-denylist: DENYLIST_REGEX is not set; skipping (expected on forks and fresh clones).')
  process.exit(0)
}
let re
try {
  re = new RegExp(pattern, 'i')
} catch (e) {
  console.error(`check-denylist: DENYLIST_REGEX is not a valid regular expression (${e.message.split('\n')[0]}).`)
  process.exit(2)
}

const hits = []
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
for (const file of tracked) {
  if (file === 'package-lock.json') continue
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  if (text.includes('\0')) continue // binary
  text.split('\n').forEach((line, i) => {
    if (re.test(line)) hits.push(`${file}:${i + 1}`)
  })
}
// Filenames count too.
for (const file of tracked) if (re.test(file)) hits.push(`${file} (file name)`)

// All of history: commit messages and authors, and every line that was ever added to any file, so a
// name in a file that was later deleted or rewritten is still caught.
try {
  const log = execFileSync('git', ['log', '--all', '--format=%H%x1f%an%x1f%ae%x1f%B%x1e'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  for (const rec of log.split('\x1e').filter((r) => r.trim())) {
    const [sha, name, email, body] = rec.trim().split('\x1f')
    if (re.test(body ?? '') || re.test(name ?? '') || re.test(email ?? '')) hits.push(`commit ${sha.slice(0, 10)} (message or author)`)
  }
  const patch = execFileSync('git', ['log', '--all', '-p', '-U0', '--no-color', '--format=@@COMMIT %H'], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })
  let commit = ''
  let file = ''
  for (const line of patch.split('\n')) {
    if (line.startsWith('@@COMMIT ')) commit = line.slice(9, 19)
    else if (line.startsWith('+++ ')) file = line.slice(4).replace(/^b\//, '')
    else if (line.startsWith('+') && re.test(line.slice(1))) hits.push(`commit ${commit} added a match in ${file}`)
  }
} catch {
  /* no history yet */
}

if (hits.length) {
  console.error(`check-denylist: ${hits.length} match(es) for the client-name pattern (text not shown):`)
  for (const h of [...new Set(hits)]) console.error(`  ${h}`)
  process.exit(1)
}
console.log(`check-denylist: clean (${tracked.length} files, history checked).`)
