---
name: groundwork-inbox
description: Process a Groundwork inbox — read what a client or reviewer sent (page notes, answers to questions, messages), file clean notes into the project's repo, pull out decisions and open questions, draft replies and follow-ups, and mark items done. Works for both kinds of Groundwork project - database projects (agency, brand, project; read through the Groundwork connector or the repo copy in groundwork/) and older workspace repos (groundwork.yml, workspace/inbox, moved to processed/). Use when someone says "process the inbox", "check the workspace", "what did [client] send", "anything new from [project]?", "process the inbox for [project]", or after pulling new answers.
---

# Groundwork Inbox

Turns what a client or reviewer sent through Groundwork into filed, usable notes, without ever
changing their words.

## Step 0: which kind of project is this?

Groundwork is organized **Agency → Brand → Project**. Find the project first.

1. Look it up in the team's project map (a `PROJECTS.md` kept next to the team's other notes), or call the connector's
   `list_workspaces`. Match on the project name or slug (for example "Website" or "Ads campaign").
2. Pick the path:
   - **Database project** (listed as a database project in the map, or it appears in
     `list_workspaces`): there is **no `groundwork.yml`** and no `workspace/` folder. The Groundwork
     database holds the notes. Follow **Database projects** below.
   - **Older workspace repo** (a `*-workspace` or client repo with `groundwork.yml`): skip to
     **Ground rules** and the numbered workflow. Everything from there on is the file-based flow.
3. Not in the map and not in `list_workspaces`: stop and ask which project, and ask the person to add
   it to `PROJECTS.md`. Don't guess a repo.

## Database projects

The project's notes live in Groundwork. A linked repo only gets a **copy** of each note; Groundwork
stays the inbox, so nothing is lost if the repo link is removed.

### Ways to read the inbox

0. **Say which version you are.** On your first `list_workspaces` or `list_notes` call, pass
   `plugin_version`: this skill's version, from the `version` in `../../.claude-plugin/plugin.json`
   next to this skill's folder (or the version in the folder path, e.g. `.../groundwork/0.22.0/skills/`).
   In a workspace repo's copy, use the `ref:` under `libraries:` in `groundwork.yml`. If the result
   starts with **UPDATE AVAILABLE**, tell the person in one line, then carry on.
1. **The Groundwork connector (use this when it's connected).** Tools: `list_workspaces`,
   `list_notes` (`workspace`, `status` defaults to not done, `limit`), `get_note` (spot, every reply,
   numbered files, the first 2 photos as previews), `get_photo` (one photo by file number), `reply`,
   `set_status` (open / answered / done), `get_guide` (the current workflow and reply rules). It
   only reaches projects where the signed-in person is on
   the team. If the tools aren't available, tell the person to add it once: in Claude, Settings →
   Connectors → Add custom connector → `https://groundwork.chat/api/mcp` → Connect → sign in with
   the emailed code → Allow. In a terminal: `claude mcp add --transport http --scope user groundwork
   https://groundwork.chat/api/mcp`, then `/mcp` → Authenticate. groundwork.chat → Team → **Connect
   Claude** (`/connect`) shows both, and keys for computers that can't sign in.
2. **The repo copy (read-only fallback).** `<folder>/inbox/<note>.md` (+ `inbox/files/`) and
   `<folder>/threads/<note>.md` in the project's repo, where `<folder>` is `groundwork`, or
   `groundwork/<slug>` when two projects share a repo (see the project map). Pull the repo first. The
   copy is written in the background and can lag or miss a note if a write failed, so say that you
   read the copy, not the live inbox. Without the connector you cannot reply or set status.

If neither works (no connector, no repo link, or no `groundwork/` folder yet), say so plainly and
point to the dashboard. Don't invent notes.

### What's different from the file-based flow

- **No `processed/` and no `git mv`.** Never move or edit a file in `groundwork/inbox/` or
  `groundwork/threads/`; they're a copy that Groundwork rewrites. A note is processed when it's filed
  in the project's own notes **and** its status is `done` in Groundwork (`set_status`).
- **"What's new"** is `list_notes` with the default status (not done). On the repo copy, read each
  thread's `status:` and skip `done`; also skip notes already filed (look for the note id in the
  project's filed notes, in the `Raw:` line).
- **Editing `status:` in a repo thread file does nothing yet.** Status flows only through the
  connector or the dashboard. Don't tell anyone it's saved if you only edited the copy.
- **The `kind` rule still holds** (see "Who left it" in step 1). Only `kind: decides` notes can become
  decisions. Notes from a teammate (`kind: team`, or `role: team` on older notes) or a tester are not
  the client deciding: they become to-dos or a bug list, never "What you've told us". A team note
  about the app itself is feedback for whoever maintains the site, not a decision.
- **`viewing:` is a web address.** Open it if you can; otherwise record what it was. There are no
  `deliverable:` or `library:` pages for these projects.
- **A note's thread is the conversation.** Read `get_note` (or the thread file) in full before
  summarizing; a later reply may already answer or change the note.

### Database workflow

**With the connector, its guide leads.** Call `get_guide` with topic `inbox` (or start from the
connector's `process_inbox` prompt) and follow it for reading, the rundown, replies and marking done.
That guide is served by groundwork.chat, so it's always current. This skill adds two things on top:
the `kind` rule and sorting many notes (step 1 "Who left it" and step 2a of the file-based flow,
which apply here too), and what needs the repo: steps 3, 4 and 8 below, done between the guide's
rundown and its "mark done" step. Without the connector (repo copy only), follow all the steps below.

1. **Find and read.** `list_notes` for the project, then `get_note` for each (photos too). Or read
   the repo copy. Empty: say so and stop.
2. **Rundown first.** Before writing anything, tell the person who sent what, on which page or spot,
   with the gist in a line or two, and flag anything sensitive under the project's `CLAUDE.md`.
3. **File a note per item.** Put it where the project repo's `CLAUDE.md` says input belongs; if it
   doesn't say, use `input/groundwork/YYYY-MM-DD-<short-slug>.md` in the project repo. Use the
   note template under step 3 below, but put the note id and the dashboard link on the `Raw:` line
   (`groundwork: <project> / <note id>`), and omit `Question:` (these are page notes, not answers
   to assigned questions). Sensitive content the project forbids storing: stop and flag it. Don't
   file it, and mention that the original is still in Groundwork and its repo copy.
4. **Update the project's running files** (decisions, open questions, log) exactly as step 4 says.
5. **Draft replies in chat; nothing is sent without a yes.** For each note that needs one, show a
   short reply in the person's words. On a yes, call `reply`. Use `team_only` threads for team-only
   conversation. Pick the status honestly: a question back to them → `answered`; nothing more
   needed → `done`; something still owed to them → leave `open`.
6. **Mark done.** After a note is filed (or set aside with a yes) and any reply is sent, call
   `set_status` with `done`. Only for notes you handled. Show the list first.
7. **Follow-up questions.** Draft them in chat, plain language, no jargon. Database projects can't
   publish assigned questions from here yet (the connector has no create-item tool, and the repo
   copy covers only inbox and threads). Give the person the final wording to add in the
   Groundwork dashboard, and say that's what happened.
8. **Commit the project repo** per its conventions, naming the notes filed and the ones set aside.
   There is no workspace-repo commit and nothing to push for the inbox itself.

**Done means:** every handled note is filed in the project's repo, has our approved reply (or a
stated reason it needs none), is `done` in Groundwork, and decisions, open questions and the log
follow the project's rules. Nothing was sent without a yes.

---

# File-based workspaces (older flow)

For repos with `groundwork.yml` and `workspace/`. Turns what a client sent through their Workspace
into filed notes. You run this from a client's **workspace repo** (e.g. `acme-workspace`). Notes go
into the client's **project repo** (e.g. `acme`), which is the source of truth the team works from.

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

**Who left it (the roster).** Notes from 2026-11-17 on carry `kind:` (on the inbox file and its
thread), set from the project's roster:
- `decides`: a client person the team marked as a decision-maker (People screen; `(decides)` after
  their entry in `groundwork.yml`, or approver on a database project). **Only these notes can
  become decisions** or go in "What you've told us".
- `team`: one of us. Team input, a to-do, or a bug for whoever builds the app; never a decision.
- `tester`: everyone else (client staff not marked as deciding, testers, unknown names). Their notes
  become to-dos and bug lists. If a tester's note asks for a real decision, list it as an open
  question for a decision-maker instead of filing it as decided.
Older notes have no `kind:`: work it out the same way (a name on `team:` is team, even when
`role: client` was stamped by mistake; a `people:` entry tagged `(decides)` decides; anyone else is a tester).

**What kind of note (`type:`).** `bug`, `wording`, `design`, `question` or `idea`, when the sender
picked one. When there's none, decide it yourself and set `type:` on the thread when you reply (the
Notes view groups by it). A brain dump that mixes several types is several items: split it in your
rundown.

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

**A note left on a page has a thread** (`workspace/threads/<note id>.md`, where `<note id>` is the
inbox filename without `.md`). Read it with the note: it has the spot (`spot:`), whether it's
`team_only`, and any replies since, from either side, in the app's drawer. A later reply in the
thread may already answer or change the note, so file what the thread says now, not just the
first message. Thread replies can carry photos too (`[file](workspace/inbox/files/…)` lines).

An answer with `confirmed: true` is a one-tap "Sounds right" on the item's `planned` text: treat the
plan as a decision the client agreed to, and file it that way (it's usually one line in the
project's decisions, not a whole note). Items may belong to a `topic` (`workspace/topics/`); group
notes by topic when that reads better.

Voice answers are raw speech-to-text: filler words, run-ons, misheard words. Read for meaning. When you
quote, keep their words but fix obvious transcription errors, and mark anything you're unsure of `[?]`.

### 2a. Sort many notes
When there are more than a handful of page notes (bug testing with many testers), don't file them
one by one. Group them by page, then by spot, then by type, and lead the rundown with counts:
"Film C: 3 bugs from 2 people, 1 wording fix". Then:
- **bugs** → one bug list per page (a checklist in the project, or the app's issue list if it has
  one), each line with who saw it, the spot, and a link to the raw note;
- **wording** and **design** from team or testers → to-dos on that page;
- **questions** → answer on the thread (step 3c), or ask the sender a follow-up there;
- **ideas** → a short ideas list; only a decision-maker's idea that they say they want is a decision.
Duplicates (the same bug from two people) become one line naming both.

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

### 3c. Answer on the thread
A note with a thread is a conversation on a spot, and the person who left it sees our reply there,
on the dot, next to what they were looking at. So for each one, draft a short reply in chat: what
we heard and what we'll do (or did), in the client's words, no jargon, a sentence or three. Same
rules as anything sent to the client (ground rule 3): **nothing is written without a yes**, and a
reply to a team-only thread is for the team only.

With a yes, append the reply to the thread file as the app does (see the contract, "Threads"):

```markdown

### Sam (team) · 2026-11-13T15:04:00.000Z
Got it. We moved the service time to the bottom line in draft 4.
```

- The name is the person you're working with, plus ` (team)`; the time is now, in UTC ISO.
- Then set the frontmatter the way a team reply in the app would, unless they say otherwise:
  - a question back to the sender (client, tester or teammate): `status: answered`,
    `waiting_on: <their first name or email>`; the note then waits on them, and they see it from the
    Note button. This is how to follow up on an unclear note: ask on its thread, don't guess;
  - nothing more needed from anyone: `status: done`, `waiting_on: ""`;
  - we still owe them something: leave `status: open`, `waiting_on: team`.
- Set `type:` if the note had none (see step 1).
- Change only `status`, `waiting_on`, `type` and the new `###` block. Never edit an earlier reply, the
  first message or `spot`. Never write to a thread that doesn't exist; a note without one (an
  answer to an item, a message from Home) gets its follow-up through step 5 instead.
- A thread that's already settled in the app (`done`, or the last reply is ours and says enough)
  needs no reply; say so in the rundown.

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

### 5b. Settle what's settled
The client's Decided page and the team's Home stay true only if items move when things settle.
Check every item (not just today's answers) against what actually came in and what the team has
decided in calls and logs since, and propose changes:
- **We landed it** → `status: decided`, plus `decided:` (one plain sentence the client will read on
  their Decided page, e.g. "Your billboard: A church where no one stays unknown.") and
  `settled: <today>`.
- **We moved past it** (a different direction, made moot, replaced by a newer ask) → `status:
  dropped` and `settled: <today>`. Clients never see dropped items; the team sees them folded on
  Decided.
- **Done with nothing to record** (a link they looked at, a file they sent) → `closed`.
- **Marked answered, but nothing real came in** (only set-aside entries) → back to `open`, so it
  shows as waiting on the client again.
- **Open and over 14 days old** (the app now hides these from the client and flags them for the
  team) → propose a rewrite, `dropped`, or an `updates:` line if it still matters as is.

Show the proposal as a short list: id, title, new status, and the `decided:` line. On approval,
change only `status:` and add `decided:` / `settled:`; leave everything else in the file alone.

**End of any working session, not just inbox runs:** if the person you're working with settled or
dropped something that has an item in Groundwork, offer this step for those items before you wrap up.

### 6. Lock and commit
1. `git mv` each filed inbox file into `workspace/inbox/processed/`.
2. Commit the **workspace repo**: `inbox: processed <n> answers (<ids>)`, adding
   `; set aside <n> (<filenames>, <reason>)` when there are any, `; replied on <n> threads` when
   there are any, plus any new or changed assigned items and thread files. Thread files stay in
   `workspace/threads/`; they don't move when their note is processed.
3. Commit the **project repo** following its conventions.
4. Show what changed in both, then push both. If a push is rejected because the client edited or took
   back an answer since your pull, pull again, re-check that file, and redo only what's affected.

## Done means
- The inbox is empty, except for anything deliberately held back for a stated reason (e.g. waiting
  on the client to finish editing).
- Every processed answer has a note in the project repo linking back to it.
- Every page note with a thread has our approved reply on it, or a stated reason it needs none.
- Decisions, open questions and the log are updated per the project's rules.
- Nothing was published to the client without a yes.
