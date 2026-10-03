---
name: groundwork-inbox
description: Process a Groundwork client workspace inbox — read what the client sent through their Workspace (answers to questions, reviews, messages), file clean notes into the client's project repo, pull out decisions and open questions, draft follow-up questions, and lock the originals by moving them to processed/. Use when someone in a *-workspace repo says "process the inbox", "check the workspace", "what did <client> send", "anything new from <client>?", or after pulling new answers.
---

# Groundwork Inbox

Turns what a client sent through their Workspace into filed, usable notes, without ever changing their
words. You run this from a client's **workspace repo** (e.g. `acme-workspace`). Notes go into the
client's **project repo** (e.g. `acme`), which is the source of truth the team works from.

The file rules are in `arkidentity/groundwork-library` → `docs/REPO-CONTRACT.md`. The short version is below.

## Ground rules (never break these)

1. **Never edit or delete a raw inbox file.** Summaries and notes are *new* files. Moving a file to
   `workspace/inbox/processed/` is the only change allowed, and it's done with `git mv`.
2. **The project repo's rules win.** Read its `CLAUDE.md` before writing anything there and follow it:
   filing conventions, security rules, log entries, decisions and open-questions formats. If a raw
   answer contains something the project's rules forbid storing (for example, names of people in
   sensitive settings, specific places, dates tied to places), **stop and flag it to the person you're working with.**
   Don't file it, don't paraphrase it into the notes, and point out that it's already in the
   workspace repo's git history, which may need a history rewrite.
3. **Nothing reaches the client without a yes.** Follow-up questions are drafted in chat first. Only
   write them to `workspace/assigned/` after they're approved. Same for closing an item.
4. **Processing locks an answer.** Once a file is in `processed/`, the client can no longer edit or
   take it back in the app. Only move files you've filed, or ones set aside with a yes (step 3b).

## Setup

1. Read `groundwork.yml` at the repo root:
   - `name`: the client's name.
   - `notes_repo`: the project repo where notes are filed, e.g. `your-org/acme`. Optional. Older
     configs call this `project`; accept both. (`project` now also names a body of work inside the
     workspace, see `workspace/projects/`.)
2. Find the project repo on this machine. Look for a sibling folder with the repo's name (`../acme`).
   If it isn't there, ask where it is. If `notes_repo` isn't set, file into `notes/` at the root of this
   workspace repo instead. That folder is team-only; clients never see it.
3. **Pull both repos** (`git pull` in each) so you're working from the latest answers and edits.
4. Read the project repo's `CLAUDE.md` (and anything it says to read first).

## Workflow

### 1. See what's new
List `workspace/inbox/*.md`, **not** `processed/`. If it's empty, say so and stop.

For each file, read the frontmatter and text:
- `re`: the item it answers (look up `workspace/assigned/<re>-*.md` for the question), or
  `brain-dump`, which is a message the client sent from Home.
- `from`, `via` (voice or typed), `received`, `edited` if they changed it.
- `role`: `client` or `team`. **Team answers are not the client speaking.** A teammate may add
  context, answer something for the client, or reply to a question the client asked. File them
  under the teammate's name, never as a client decision, and never add them to "What you've told
  us." In notes, always say who said what.
  **A team answer to a team-only item** (`audience: team` on the item or its topic) is the
  teammate answering what we asked them. File it as their input in the project (log, open
  questions, the spec it's about), and say what it means for the client version of the item.

An item with `prompts` asks several questions at once. The answer's `covered` lists the ones the
client ticked, but read the whole answer: people cover things they didn't tick and skip things
they did. File one note per item with a section per prompt, and list any prompt left unanswered
as an open question (and a candidate follow-up).

An answer with `viewing:` was sent with that page open beside it, so read the page before you read
the answer: "the headline feels off" means the headline *they saw*.
- `deliverable:<slug>` with `viewing_version: <commit>`: that exact version, with
  `git show <commit>:workspace/deliverables/<slug>/index.html`. If the page has changed since, say
  so in the note, and check whether their point still applies to the current version.
- `library:<doc>`: `workspace/shared/<doc>.md`.
- a web address: open it if you can; otherwise note what it was.

An answer with `confirmed: true` is a one-tap "Sounds right" on the item's `planned` text: treat the
plan as a decision the client agreed to, and file it that way (it's usually one line in the
project's decisions, not a whole note). Items may belong to a `topic` (`workspace/topics/`); group
notes by topic when that reads better.

Voice answers are raw speech-to-text: filler words, run-ons, misheard words. Read for meaning. When you
quote, keep their words but fix obvious transcription errors, and mark anything you're unsure of `[?]`.

### 2. Show the person you're working with
Before writing anything, give a short rundown: who sent what, about which question, and the gist in a
line or two each. Flag anything that looks sensitive under the project's rules. Ask if anything should
be handled differently.

### 3. File a note for each answer
Put it where the project's `CLAUDE.md` says input belongs. If it doesn't say, use
`input/workspace/YYYY-MM-DD-<re>-<short-slug>.md` in the project repo.

```markdown
# <Question title, or the message's title / a short topic>

**From:** <from> · <received date> · <spoken|typed><, edited>
**Question:** <re> — <question title>        (omit for messages)
**Raw:** <workspace repo name>/workspace/inbox/processed/<filename>

## Summary
<3–6 sentences in plain language: what they said and what it means for the work.>

## Key points
- ...

## In their words
> <1–4 short quotes worth keeping exactly. Their phrasing is often the most valuable part.>

## Decisions
- <anything they settled, or "None">

## Open questions
- <anything unresolved, or anything their answer raises>
```

Several answers to the same question can share one note. Link notes to each other and to existing
project docs when they're related.

### 3b. Set aside what shouldn't be filed
Some entries aren't real input: a teammate testing the app, a stray fragment, a duplicate, or
feedback about the app itself. Say which ones you think these are and why. With a yes, move them to
`processed/` **without** a note, and list them in the commit message as set aside. Don't leave them
sitting in the inbox, where they'd come up every time.

Feedback about the Workspace app itself belongs with whoever maintains the Groundwork app, not in the
client's project. Mention it; don't file it here.

### 4. Update the project's running files
If the project has them, follow their exact format:
- **Decisions** → append to its decisions file. Never rewrite past entries.
- **Open questions** → add new ones; mark answered ones answered, with a link to the note.
- **Log** → if the project keeps a session log, mention what was processed.

### 4b. Keep the library current
When the client decided something, or confirmed a plan, propose the line it adds to
`workspace/shared/what-weve-settled.md`: one plain sentence, in their words where possible, under
"What you've told us" (their decisions) or "What we're doing" (our plans they confirmed). The client
reads this file, so it follows the same rules as anything sent to them. On a yes, add it in the
same commit as the processed answers. If a new decision replaces an old line, change the line.

### 5. Suggest what to ask next
Draft follow-up items: things the answer left unclear, or the natural next question. Show them in
chat as a short list with a proposed title and a sentence or two of plain-language context each.
**No jargon or insider language.** Write it the way the client talks. Where we already know what
we'd do, make it a `planned` quick confirm.

On approval, write each one to **`outbox/assigned/`** (drafts; see `groundwork-outbox`) in the
contract's format, with the next unused id, `status: open`, `assigned: <today>`, and the `topic`
it continues. Then publish it the way the outbox skill does (`git mv` into `workspace/`) once the
person you're working with says so.

Also check each answered item's status against what actually came in, and propose changes:
- **Settled** → `closed`.
- **Marked answered, but nothing real came in** (only set-aside entries) → back to `open`, so it
  shows as waiting on the client again.

On approval, change only the `status:` line, nothing else in the file.

### 6. Lock and commit
1. `git mv` each filed inbox file into `workspace/inbox/processed/`.
2. Commit the **workspace repo**: `inbox: processed <n> answers (<ids>)`, adding
   `; set aside <n> (<filenames>, <reason>)` when there are any, plus any new or changed assigned items.
3. Commit the **project repo** following its conventions.
4. Show what changed in both, then push both. If a push is rejected because the client edited or took
   back an answer since your pull, pull again, re-check that file, and redo only what's affected.

## Done means
- The inbox is empty, except for anything deliberately held back for a stated reason (e.g. waiting
  on the client to finish editing).
- Every processed answer has a note in the project repo linking back to it.
- Decisions, open questions and the log are updated per the project's rules.
- Nothing was published to the client without a yes.
