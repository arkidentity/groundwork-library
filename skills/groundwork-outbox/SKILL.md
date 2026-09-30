---
name: groundwork-outbox
description: Start onboarding a new messaging/marketing client, or prepare what goes out to a Groundwork client — read the client's project repo (open questions, recent logs, specs, shared pages), work out what only the client can tell us, and draft it as topics and items in this workspace repo's outbox/ for review; then publish approved drafts to the client's Workspace. Use in a *-workspace repo (or any repo with groundwork.yml) when someone says "start onboarding", "onboard <client>", "prepare the outbox", "what should we ask <client>", "draft questions for <client>", "get <client>'s workspace ready", or "publish the outbox".
---

# Groundwork Outbox

The other half of `groundwork-inbox`. The inbox brings the client's answers in. The outbox decides
what we ask, show and confirm, and sends it out. Everything is drafted in `outbox/` first. **Nothing
reaches the client without a yes.**

File formats: `arkidentity/groundwork-library` → `docs/REPO-CONTRACT.md` (topics, items, `planned`, `links`).

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
   - **For the client:** a designed artifact page, shared "anyone with the link" (see the
     sharing check).
   - **For the team:** copy the spec into a team-only Library doc,
     `workspace/shared/for-the-team/<slug>.md`, with frontmatter `audience: team`,
     `source: <project repo>/<path>` and `copied: <date>`, and a one-line note under the title
     that it's a copy. Turn relative links into plain text (they can't open in the app). Link it
     from the item as `<app url>/c/<client slug>/library/for-the-team/<slug>`.
   - **Keep copies current:** the stale check compares each copy's `copied:` date with the source
     file's last commit, and re-copies on a yes.

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
