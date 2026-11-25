---
name: groundwork-outbox
description: Start onboarding a new messaging/marketing client, or prepare what goes out to a Groundwork client — read the client's project repo (open questions, recent logs, specs, shared pages), work out what only the client can tell us, and draft it as topics and items in this workspace repo's outbox/ for review; then publish approved drafts to the client's Workspace. Use in a *-workspace repo (or any repo with groundwork.yml) when someone says "start onboarding", "onboard [client]", "prepare the outbox", "what should we ask [client]", "draft questions for [client]", "get [client]'s workspace ready", or "publish the outbox". Also use in any repo linked to a Groundwork project (it has a `groundwork/` folder of notes) when someone says "make a Groundwork page", "make a branded page for [client]", "make a how-to page", "put this on [client]'s workspace", or "add a question to the page".
---

# Groundwork Outbox

The other half of `groundwork-inbox`. The inbox brings the client's answers in. The outbox decides
what we ask, show and confirm, and sends it out. Everything is drafted in `outbox/` first. **Nothing
reaches the client without a yes.**

File formats: `arkidentity/groundwork-library` → `docs/REPO-CONTRACT.md` (topics, items, `planned`, `links`).

**Database projects (no `groundwork.yml`, only a `groundwork/` folder or none): use the connector.**
`get_guide outbox` has how to choose and word questions, `list_questions` shows what's already
asked, `list_templates` / `get_template` give the current templates, and `create_question` puts an
approved question in their Groundwork. Pass `plugin_version` (see `groundwork-inbox`) on your first
call. The `outbox/` folder flow below is for workspace repos.

## Ground rules

1. **Draft in `outbox/`, never straight into `workspace/`.** The app can't read `outbox/`, so drafts
   can be committed and pushed for teammates to review. The client sees nothing until publish.
2. **The project repo's rules win.** Read its `CLAUDE.md` first: voice, security rules, how the
   client likes to be approached. If it says the client prefers intentions over approval questions
   (for example, "share intention, don't ask permission"), then lean on `planned` items and clarifying
   questions, and never write "do you approve…?".
3. **This is not a secure channel.** Anything the project's security rules restrict (names of
   vulnerable people, precise locations, lists of sensitive places) stays out of the workspace even
   as a question. List those items separately and say they belong on a secure channel.
4. **Never re-ask what's settled.** Check the project's decisions, what's already live in
   `workspace/assigned/`, what's drafted in `outbox/`, and what the client has already answered in
   `workspace/inbox/processed/`.
5. **Ask a teammate first with `audience: team`.** When something should get a teammate's reaction
   before the client sees it (a new direction, a spec, messaging), write it as a team-only topic or
   item: `audience: team` in the frontmatter. It can go straight into `workspace/`, since clients
   never see it; the teammate answers it in the app like the client would. When it's settled,
   rewrite it for the client and remove the line (keep the id). Team-only is a view rule, not a
   secure channel: rule 3 still applies.
6. **Link to things people can open inside the Workspace.** Never put a GitHub link in a Workspace
   item: project repos are private, and GitHub shows a 404 to anyone not signed in with access.
   - **For the client:** a hosted deliverable: `workspace/deliverables/<slug>/index.html` plus a
     `deliverable.yml` (title, audience), linked as `deliverable:<slug>` (see "Hosted
     deliverables" in the Groundwork repo contract). It opens beside the conversation on a
     computer and follows the workspace login, so it needs no sharing check. A client brand goes
     in `workspace/deliverables/_shared/brand.css`. Older Claude artifact links still work but
     open in a new tab; move them over when you touch them.
   - **Brand first.** Before making a client page, check `groundwork.yml` for a `theme:`. If it's
     missing, say so and stop to identify their branding with the person you're working with:
     their website, a brand guide or logo files, their colors and fonts. Ask, don't guess. Add it
     as `theme:` (colors for light and dark, Google Fonts; see the Groundwork repo's
     `docs/ADDING-A-CLIENT.md`), noting where each value came from, and show it before saving.
     That one block styles their workspace and every page. Start every page from
     `deliverable-starter/page/` (next to this skill): it links the neutral `/deliverable.css`,
     then `_theme.css` (built from `theme:`), then optional extras in `_shared/brand.css` (a
     texture, a logo; most clients need none). A page made before the theme exists looks clean
     and neutral, and picks up the brand once it's added.
   - **For the team:** copy the spec into a team-only Library doc,
     `workspace/shared/for-the-team/<slug>.md`, with frontmatter `audience: team`,
     `source: <project repo>/<path>` and `copied: <date>`, and a one-line note under the title
     that it's a copy. Turn relative links into plain text (they can't open in the app). Link it
     from the item as `<app url>/c/<client slug>/library/for-the-team/<slug>`.
   - **Keep copies current:** the stale check compares each copy's `copied:` date with the source
     file's last commit, and re-copies on a yes.

## Database projects: branded pages from the linked repo

A project made with **New client** on groundwork.chat has no `groundwork.yml`. Its notes live in
Groundwork, copied into `groundwork/inbox/` and `groundwork/threads/` in the repo it's linked to.
Groundwork hosts pages from that same repo. If this repo has a `groundwork/` folder and no
`groundwork.yml`, this is the flow for pages (questions and topics can't be published from Claude
for these projects yet; say so if asked).

1. **Where pages go:** `groundwork/pages/<slug>/` (lowercase, hyphens), with
   - `index.html`: a full page (`<!doctype html>`, charset, viewport, `<title>`).
   - `deliverable.yml`: `title:` and `audience: all` (or `team`: only the team sees it). Optional:
     `version:`, `updated: YYYY-MM-DD`, `blurb:` (one line for its card on Home), `order:`,
     `hidden: true`, and `asks:` (questions as markers on the page; see "What a page can do").
     Public link: `share: { code: <12+ random letters>, on: true }` (the app's Share switch doesn't
     reach repo pages yet).
   - Images next to it. Never write anything else under `groundwork/`: the rest is Groundwork's.
2. **Brand first.** Look for `groundwork/pages/_shared/brand.css`. If it's missing, find the brand
   with the person: the client's live website (read its colors and fonts), a brand guide, logo
   files. Ask, don't guess. Write it as tokens in `_shared/brand.css` (colors as CSS variables for
   light and dark, Google Fonts `@import`), with a comment saying where each value came from, and
   show it before saving. Every page links `/deliverable.css` then `_shared/brand.css`, so all of a
   client's pages match.
3. **Sections:** put `data-section="Name"` on each major section so notes say where they were left.
4. **Lean.** One job per page, real content, no filler. Follow the project's `CLAUDE.md` rules
   (security, money, people) exactly as for any other client material.
5. **Publish:** commit and push. It shows on the project's Home within about 30 seconds. Tell the
   person where to look, and that the client sees it if `audience: all`.


## What a page can do (read before building one)

A page is plain HTML, but it runs in a sandbox: **no cookies, no storage, no access to Groundwork,
no way to send anything to the team on its own.** So there are two kinds of interactivity, and they
are very different. Pick on purpose and tell the person which one a part of the page is.

**1. Only the reader sees it (nothing reaches us).** Works with plain HTML, CSS and a little script.
- `<details>` / `<summary>` lists: a how-to with one tap-to-open step each, so a long process reads as
  a short list. Put the who (`Alex`, `Sam`, `You`) in each summary and the clicks inside.
- Tabs, toggles, "show the plan", "tap for the clicks".
- A highlighted choice (a card marked as the recommended one) to *show* what we suggest.
- Checkboxes work only while the page is open: **nothing is saved** (no storage in the sandbox), so
  don't use them as a to-do the reader will come back to.

**2. Reaches the team: `asks:` in `deliverable.yml`.** The only way a page collects an answer.
```yaml
asks:
  - id: site-hosting            # unique on this page, lowercase and dashes
    section: One thing to tell us   # the data-section (or data-note) on the page where its marker sits
    prompt: Does this site go live from AI Studio or Go High Level?   # one question, 20 words or fewer
    kind: confirm               # confirm = "Sounds right?" one tap; choice = pick one of options:; omit = a note
    for: Alex                   # optional: only this person (name, email or a list) sees it
```
- A marker shows on that section. Tapping it opens the answer box right there; after an answer a
  "Next question" button leads on. Answers arrive as notes titled "Answer on <page>: <question>",
  so the inbox flow handles them like any note. Each person's phone remembers what they answered.
- `kind: confirm` is for something we plan or assume ("Edit in Claude Code from here on. Sounds
  right?"). Use it for most asks: one tap beats a paragraph.
- **`kind: choice` is a pick-one.** Give it `options:` (2 to 6 short options, each up to 80
  characters). The reader taps one, then Send, with an optional "why". The answer arrives as a note
  "Chose: <option>." and the team gets the usual alert. Use it when there are a few real options
  (hosting, a design, a date) and a typed answer would be harder to act on:
  ```yaml
  - id: hosting
    section: One thing to tell us
    prompt: Does this site go live from AI Studio or Go High Level?
    kind: choice
    options: [AI Studio, Go High Level, Not sure]
  ```
  Fewer than 2 usable options makes it a plain note. Put the options on the page too, so a reader
  can see what each means before picking. Nothing happens automatically after a pick: the answer
  is a note, and the inbox flow replies to it.
- Every `section:` must match a `data-section` on the page, or the marker has nowhere to sit.
- Run the **ask check** (step 4b) on every ask.

## Building a good page

- **One job per page**, shown not explained. A reader should know in five seconds who it's for and
  what we want from them (`.eyebrow`, `h1`, one-line `.lede`, then "who it's for and the ask").
- **Order for a how-to:** the picture first (a short chain of boxes: who does what, left to right),
  then the steps as collapsible lists with who does each one, then the one thing we need from them.
- **Cut text, then cut again.** Steps are short lines a person can act on. Long reasoning goes in a
  closed "The full plan" `<details>` at the bottom for people (or an AI) who want it.
- **Say what's not built or not checked.** If a step wasn't tested or depends on something unknown,
  the page says so in one line.
- **No names of other clients, people or private money in a page** unless this client is the
  audience and the project's rules allow it.
- **Mobile first:** works at phone width, 16px gutters, tap targets at least 44px.
- **Brand:** link `/deliverable.css`, then the client's brand; use the tokens, not raw colors.
- **Check it:** open it signed in as the client would see it (preview, or after push) and tap every
  ask and every `<details>` before saying it's done.

## Setup

1. Read `groundwork.yml`: `name`, and `notes_repo` (the project repo, e.g. `your-org/acme`; older
   configs call it `project`). With no `notes_repo`, this repo is the project: read its `notes/` and everything outside `workspace/`.
2. Find the project repo next to this one (`../acme`). Pull both repos.
3. Read the project's `CLAUDE.md` and whatever it says to read first.

## Projects

A workspace can hold several projects (`workspace/projects/<slug>.md`, contract v3), each with its
own conversations. A topic joins one with `project: <slug>`. Put new work in the right project
when drafting, create `outbox/projects/<slug>.md` for a new one, and never copy questions between
projects: shared facts live once in `content/` and `messaging/`. With one project, don't create the
layer. Item ids stay unique across the whole workspace.

## Workflow

### 1. Gather what's waiting on the client
Look for anything only the client can answer, confirm or react to:
- Open-questions files. Sections addressed to the client, and questions they own.
- The last one to two weeks of logs, especially "for <client>" or "waiting on <client>".
- Open items at the bottom of specs and plans.
- **Every page shared with the client** (artifact links in logs and specs), **and the open
  questions that page raises.** Read the page's source doc (the spec it was made from) all the way
  to its open-questions section. Those questions travel with the page (step 2). This is the source
  most often missed: a shared page nearly always carries questions only the client can answer.
- Anything already sent through another channel and still unanswered. Moving it here is fine. Note
  it so the team knows.

### 2. Sort each one
- **A page plus the questions it raises** → one `review` with `links:` and `prompts:` (2–5
  questions, each a full sentence that stands on its own). The client reads the page, taps Talk and
  answers them together, ticking each off. People who think out loud answer several questions in
  one breath; don't split what belongs together.
- **Something to look at, with no questions of its own** → `review` with `links:`.
- **A fact only they know, unrelated to any page** → `question`. Ask it plainly. Say why it
  matters in one line. If several such questions share a subject, make one item with `prompts:`.
- **Something we've assumed or plan to do** → `question` with `planned:`. State the plan in a
  sentence or two. The client taps "Sounds right" or says what's different. This is usually the
  fastest and most respectful way to get an answer.
- **Too sensitive for this channel** → leave it out and list it (rule 3).
- **Not really theirs to answer**, or not needed yet → leave it out and say so.

### 3. Shape it into conversations
- **3–6 topics**, each a real conversation (a spec, a decision area), in the order that matters most:
  what blocks the work first.
- In each topic: **the page and its questions first** (one item with `prompts`), then quick
  confirms (`planned`), each its own item since one tap beats talking.
- **2–5 items per topic.** More than that is a sign it's two topics.
- **Don't overwhelm.** Propose a first wave of about 8–12 items. Draft later waves too, in
  `outbox/later/` (same layout). Local preview doesn't show `later/`, so it shows exactly wave one.
- Topic intros: 2–4 sentences. Where things stand, what we're planning, and why their input matters.
  Written to the client, in their language.

### 4. Write the drafts
Into `outbox/topics/<slug>.md` and `outbox/assigned/<id>-<slug>.md`, in the contract's format:
- **Ids:** the next unused number across `workspace/assigned/`, `outbox/` and every past id,
  including retired ones (check `git log --all --name-only -- workspace/assigned outbox` and the
  repo README). Numbers are shared across prefixes (q-004 after r-003) and never reused.
- `status: open`, `assigned: <today>`, `topic:`, `order:`, and `from:` (first name of whoever
  on the team is asking; default to the person you're working with). The client sees it.
- **Titles** under about 80 characters, as a real question or an action ("Take a look at…").
- **Bodies** short: a sentence of context, the thing we need, and why it matters. Their vocabulary,
  not ours. No jargon. Follow the project's voice rules (for example, no em dashes).

### 4b. The ask check (every item, before step 5)
Clients answer on a phone, one thing at a time, often by talking. An ask they have to decode goes
unanswered. Rewrite any item that fails one of these:
1. **Show, then ask.** If there's anything to look at (a draft, a page, a list), link it. Reacting
   beats writing from scratch.
2. **Lead with what we think.** If we have a guess, it's a `planned:` quick confirm, so the answer
   can be one tap ("Sounds right"). Most items should be this.
3. **One question per prompt, 20 words or fewer.** No "and/or", no two questions joined.
4. **Not loaded.** No question that has a right answer, assumes a problem, or asks them to judge
   themselves ("Why haven't you…", "How committed are you…"). Ask what they see, want, or would do.
5. **Easy to start.** Where a blank page would stall them, add an example of the kind of answer
   that helps ("Even one sentence is enough, like: …").
6. **Still true.** Nothing we've already decided, dropped, or moved past (check `decisions.md` and
   the last week of logs). The app hides asks untouched for 14 days; don't publish one you'd let
   go stale.
In step 5, list any item you rewrote and why, in a line each.

### 5. Review with the person you're working with
Show the plan as a compact outline: topics in order, each item's id, type, title, and whether it's
a quick confirm. Then the list of things left out and why (sensitive, settled, not theirs, later).
Then tell them how to preview it exactly as the client will:

```bash
cd ../groundwork && DEV_VIEW_AS=client LOCAL_WORKSPACES=../<this-repo> npm run dev
```

Then open `http://localhost:3000`. (That shows drafts as if published, as the client sees them,
with team-only items hidden; nothing is sent. Leave out `DEV_VIEW_AS=client` to see the team view.)

Commit the drafts (`outbox: draft <n> items for <client>`) and push when asked, so teammates can
review on GitHub.

### Sharing check (every run, and again right before publishing)
Only for Claude artifact links still in the workspace; hosted deliverables don't need it.
A Claude artifact is **private when first published**. Only the person who owns it can make it
open to others (the page's Share menu → "Anyone with the link"); Claude can't. A private link
opens for us and fails for the client, so check before anything goes out.

1. Collect every `claude.ai/.../artifact/...` URL in: the items and topics about to be published
   (`links:` and bodies), everything already in `workspace/`, and `workspace/shared/**.md`
   (including `pages-weve-shared.md` and its `sources:`). Team-only items count too: a teammate
   can't open a private artifact either.
2. Read each one with the Artifact tool (`action: "read"`). Its header states the sharing: "shared
   with anyone with the link" passes; anything else (private, or shared only with named people)
   fails.
3. **Any failure blocks publishing.** List the failing pages by title and link, ask the person
   you're working with to share each one, then read them again. Never publish, and never add a
   Library row for, a page that fails. Links that aren't artifacts (GitHub, the live app, Drive)
   are not checked here; say so if a client item links to GitHub, since clients can't open it.
4. When you publish a new artifact yourself during a run, say right away that it needs sharing
   before the client gets it.

Report the result with the stale check: "Sharing: all N pages open" or the list to fix.

### 6. Publish (only on a yes)
0. **Run the sharing check** (above). Stop here if anything fails.
1. `git mv` each approved file from `outbox/` to the same place in `workspace/`. Publish a topic
   file together with its first items, never a topic with nothing in it.
2. Commit `workspace: publish <topic titles> (<ids>)` and push. The client sees it within a minute.
3. In the project repo, mark each question that went out, following its format (e.g. a note in
   `open-questions.md`: "In the Workspace as q-006, <date>"), so nobody asks it again elsewhere.
   Commit and push per its rules.
4. **Keep the library current.** If what you published links a page that isn't already in
   `workspace/shared/pages-weve-shared.md`, add a row at the top of its table in the same commit:
   linked title, one plain line on what it is, "Draft, <Mon D>". If a page was replaced, update its
   row instead of adding one. Create the file if it doesn't exist.
5. Say what's live, and what's still waiting in `outbox/` for a later wave.

## Start onboarding (new messaging or marketing clients)

When someone says "start onboarding": that is the **Messaging project**. Run `groundwork-project`
with the `messaging` template (`arkidentity/groundwork-library` → `templates/messaging/`; read its
README first). It creates the project, its topics and the five interview items in `outbox/`, tailored
to the client. Then finish here:

1. **Tailor** with what's already known. Read `input/` (public research) and the project's
   `CLAUDE.md`. Skip or reword questions it already answers, and aim prompts at the gaps it lists.
   Keep every question answerable with no marketing vocabulary, 3 to 5 prompts per item.
2. **Keep sensitive things out.** Reputation problems, bad reviews, disputes and money trouble go
   on the kickoff call list, never into a written question.
3. **Start the language audit** in `messaging/language-audit.md` using the template's
   `audit-rubric.md`, from whatever of their copy exists now (the website at least). Team version
   only; the client version waits until their material and two conversations are in.
4. **Prepare the kickoff call**: the template's `kickoff-call-guide.md` goes into `messaging/`
   (filled in "The 3 gaps" and "The hard stuff" for this client).
5. Then continue at step 5 above (review with the person you're working with, preview, publish on
   a yes). Parts 1 and 2 are published together.

## Done means
- Every draft follows the contract and the project's voice and security rules.
- Nothing already settled or already asked was drafted.
- Sensitive items were listed and kept out.
- Nothing was published without a yes.
