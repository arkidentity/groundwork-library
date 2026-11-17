---
name: church-website-discovery
description: Run the information-gathering process for a church website — prefill what we can from their site, calls and listings, write it into content/ as unconfirmed, draft the round-1 confirms, turn the client's page list into one small conversation per kept page (rounds of 3 or fewer) in outbox/, track coverage, and file answers. Use in a church's workspace repo (groundwork.yml present) when someone says "start website discovery", "prefill the church", "what do we still need for the website", "website coverage", "draft round 1", "draft the page conversations", "draft the next wave", or "what's blocking the build".
---

# Church Website Discovery

Module A of the church website kit. Module B is messaging (`groundwork-outbox` → "start
onboarding"). They share the repo. Kit and rules: `arkidentity/groundwork-library` →
`templates/church-website/` (`README.md`, `STRATEGY.md`, `question-bank.yml`, `sitemap.md`,
`page-questions.yml`). Use the
copy next to this repo (`../groundwork-library`) or read it from GitHub. **Read README and STRATEGY first.**

Nothing reaches the client without a yes. Drafts go in `outbox/`; publishing is the
`groundwork-outbox` skill's publish step.

## Ground rules
1. **Never ask what we can find.** Prefill (round 0) comes before any question.
2. **Every fact is stored with `status: unconfirmed | confirmed`, `source`, `date`.** Only `confirmed`
   values ship. A confirm item flips unconfirmed to confirmed.
3. **Sensitive (`sens: true`) and anything on the "hard stuff" list never becomes a written
   question.** Put it in `messaging/kickoff-call-guide.md`.
4. **Gates first.** Don't ask detail for a thing the church doesn't have. A "no" is `n/a`.
5. **Rounds of 3 or fewer.** Every item carries `round: N`. A round is at most 3 items; an item asks
   one thing (at most 2 prompts; a request may carry 3 short ones). The app shows one round at a
   time and opens the next when the client finishes. Easiest first: facts, then links and files,
   then thinking.
6. **Collect, don't draft.** Copy is not written here. This skill gathers and files.
7. **Don't duplicate Module B.** If `messaging/` or the workspace already has the answer (`also:` in
   the bank), use it and mark the question covered.

## Commands

### "start website discovery" (or "prefill the church")
0. **No Website project yet?** Run `groundwork-project` with the `church-website` template first. It
   creates the project, its topics and the fixed rounds 2–7 (page list, quick facts, links, files,
   Sundays, tools). Tailor the page list (`q-pages` `sitemap:`) to what the prefill found: drop pages
   for things they clearly don't have, use their names ("Life at Hope"). Then continue here.
1. Read `groundwork.yml`, `CLAUDE.md`, `input/` (transcripts, research, sent files), `notes/`, and
   `workspace/inbox/processed/`.
2. **Scrape.** Fetch the church's live site (all nav pages), Facebook, Instagram, YouTube, their
   Google Business Profile and any directory listing. If the site is down, record it and retry
   later; don't guess.
3. **Pull from calls.** For every `src: call` question, find the answer in `input/` transcripts
   and quote the speaker. Transcripts are often mislabeled: read by content.
4. **Write `content/<dest>`** for every section. One file each, in the bank's `dest`. Format per
   fact:
   ```
   - **Sunday service time:** 10:00 a.m.
     status: unconfirmed · source: web search summary (low confidence) · date: 2026-09-30 · q: 3.1
   ```
   Quote their own words where the answer is a voice answer. Never invent.
5. **Write `content/_coverage.md`** (see Coverage).
6. Report: what was found, what couldn't be (and why), what's gated off, what's sensitive.

### "draft round 1" (the confirms)
1. From the prefill, write **up to 3** confirm items, `round: 1`, topic `confirm`, `type: question`,
   each with `planned:` holding a small group of facts in plain words (basics; the week; the pastor).
   Anything we couldn't find stays out; the later rounds ask it.
2. Put drafts in `outbox/`, show the outline, commit `outbox: website round 1`. Publishing is
   `groundwork-outbox`.

### "draft the page conversations" (after the page list comes back)
1. Read the newest answer to `q-pages` (its `sitemap:` frontmatter: page, choice, top, added).
2. For every page with `choice: keep`, in the client's order with starred (`top`) pages first, build
   one topic (conversation) from `templates/church-website/page-questions.yml`:
   - Skip any question already answered (prefill, calls, earlier rounds, Module B). If we have an
     answer but it's unconfirmed, make it a `planned:` confirm instead.
   - Keep each round to 3 items; merge or drop to fit. Number rounds after the highest round in use.
   - A page they **added** gets one round of up to 3 questions you write for it.
   - `unsure` pages: none yet; list them for the next call.
   - `cut` pages: nothing, and mark their sections `n/a` in coverage.
3. Add the launch conversation last (`launch:` in the same file).
4. Drafts in `outbox/`, show the outline (topic, ids, rounds), commit `outbox: website pages`.

### "process the inbox" (answers)
Use `groundwork-inbox`. Then for each answer that maps to a bank question, write it into the
`content/` file as `confirmed` (source: client, with their name and date), update coverage, and if a
confirm item's answer says "different," replace the value and keep the original as a comment.

### "website coverage" / "what's blocking the build"
Recompute `content/_coverage.md` and report: % of `pri: M` confirmed, the blockers by owner, what is
gated off, and the earliest page we can build.

## Coverage file: `content/_coverage.md`
A table, one row per section:

| Section | Page | Gate | Status | Owner (church) | Open M | Notes |
|---|---|---|---|---|---|---|

- **Status:** `empty` (nothing), `draft` (unconfirmed values), `done` (all M confirmed), `n/a` (gated off).
- **Owner:** the person at the church who answers for this section (ask in a quick-facts round if unknown).
- End with: **Minimum viable content** (every M in an on-gate section) with a checklist, and the
  **earliest buildable pages**.

## Gates and the launch list
Gate answers live in `content/_coverage.md` under "Gates". The launch conversation (`launch:` in `page-questions.yml`) covers sections 15 and 16
plus redirects, analytics and the Google Business Profile. Don't schedule launch until those are done.

## Done means
- Every fact has a status, source and date.
- Nothing sensitive was written as a question.
- No question was sent that we could have answered ourselves or that Module B covers.
- Coverage reflects reality, and the client saw nothing without a yes.
