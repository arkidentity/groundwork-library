---
name: church-website-discovery
description: Run the information-gathering process for a church website — prefill what we can from their site, calls and listings, write it into content/ as unconfirmed, then draft confirm items and the next wave of questions into outbox/, track coverage, and file answers. Use in a church's workspace repo (groundwork.yml present) when someone says "start website discovery", "prefill the church", "what do we still need for the website", "website coverage", "draft the next wave", or "what's blocking the build".
---

# Church Website Discovery

Module A of the church website kit. Module B is messaging (`groundwork-outbox` → "start
onboarding"). They share the repo. Kit and rules: `arkidentity/groundwork-library` →
`templates/church-website/` (`README.md`, `STRATEGY.md`, `question-bank.yml`, `sitemap.md`). Use the
copy next to this repo (`../groundwork-library`) or read it from GitHub. **Read README and STRATEGY first.**

Nothing reaches the client without a yes. Drafts go in `outbox/`; publishing is the
`groundwork-outbox` skill's publish step.

## Ground rules
1. **Never ask what we can find.** Wave 0 comes before any question.
2. **Every fact is stored with `status: unconfirmed | confirmed`, `source`, `date`.** Only `confirmed`
   values ship. A confirm item flips unconfirmed to confirmed.
3. **Sensitive (`sens: true`) and anything on the "hard stuff" list never becomes a written
   question.** Put it in `messaging/kickoff-call-guide.md`.
4. **Gates first.** Don't ask detail for a thing the church doesn't have. A "no" is `n/a`.
5. **One wave at a time.** Don't put a later wave in the client's Workspace early.
6. **Collect, don't draft.** Copy is not written here. This skill gathers and files.
7. **Don't duplicate Module B.** If `messaging/` or the workspace already has the answer (`also:` in
   the bank), use it and mark the question covered.

## Commands

### "start website discovery" (or "prefill the church")
0. **No Website project yet?** Run `groundwork-project` with the `church-website` template first. It
   creates the project, its topics, and the first two items (x-001, q-visit). Then continue here.
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

### "draft the next wave"
1. Recompute coverage. Pick the lowest unfinished wave (1 confirm → 2 blockers → 3 per page → 4 launch).
2. **Wave 1 confirm items:** one item per small group of found facts, `type: question`, with
   `planned:` holding the facts in plain words ("We have Sunday at 10:00. Sound right?"). Group 5 or
   fewer per item. Keep them answerable in one tap.
3. **Wave 2 blockers:** every `pri: M` with `src: manual` and gate on, and no answer yet. Group by
   topic, 3 to 5 prompts per item, written to be talked. Skip anything Module B covers.
4. **Wave 3:** only the sections for pages being built now.
5. Put drafts in `outbox/` (same layout as `workspace/`). Follow the REPO-CONTRACT formats and the
   church's voice: plain words, no church jargon unless the church uses it, never "do you approve".
6. Show a compact outline: topics, ids, types, and what's left out and why. Then the preview command
   from `groundwork-outbox`. Commit `outbox: website wave <n>`.

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
- **Owner:** the person at the church who answers for this section (ask in wave 2 if unknown).
- End with: **Minimum viable content** (every M in an on-gate section) with a checklist, and the
  **earliest buildable pages**.

## Gates and the launch list
Gate answers live in `content/_coverage.md` under "Gates". Wave 4 (launch list) is section 15 and 16
plus redirects, analytics and the Google Business Profile. Don't schedule launch until those are done.

## Done means
- Every fact has a status, source and date.
- Nothing sensitive was written as a question.
- No question was sent that we could have answered ourselves or that Module B covers.
- Coverage reflects reality, and the client saw nothing without a yes.
