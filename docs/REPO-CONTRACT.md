# Workspace Repo Contract (v3)

> Published copy, kept with the library so the skills and templates can cite it. The Groundwork app
> implements this contract; if you run your own tooling against it, this is the file format to follow.

The rules every client workspace repo follows. The app, the `groundwork-inbox` and
`groundwork-outbox` skills, and any human editing by hand all depend on this. **Change it here first, then in code.**

A working example lives in [`examples/sample-workspace/`](../examples/sample-workspace/).

## Layout

```
<client>-workspace/            ← one private repo per client, e.g. acme-workspace
  README.md                    ← for us: who the client is
  groundwork.yml               ← client name, who can log in, `notes_repo`. (`groundwork.yml` also takes an optional `libraries:` pin).
                               `team:` entries written `Name <email>` get team access to this workspace only;
                               `people:` entries (`Name <email>`) are the people being asked.
  .claude/skills/               ← groundwork-inbox + groundwork-outbox. Load for anyone who opens
                               this repo in Claude Code. Master copies: groundwork/examples/.
  notes/                       ← team-only filed notes (one-repo setups, where no project repo is set).
  outbox/                      ← team-only DRAFTS, same layout as workspace/ (topics/, assigned/,
                               shared/). The app never reads it. Publishing = git mv into workspace/.
  workspace/
    projects/                  ← us → client. One file per project; groups conversations. Optional.
    topics/                    ← us → client. One file per conversation; groups assigned items.
    assigned/                  ← us → client. One file per item.
    inbox/                     ← client → us. App writes here. Never edited.
      processed/               ← inbox files we've handled. Moved, never deleted.
    shared/                    ← us → client. Library. Any .md, subfolders allowed.
```

The app may **read** `topics/`, `assigned/`, `shared/` and `inbox/`, **create** files in `inbox/`,
**update only the `status` field** of files in `assigned/`, and let an answer's author edit or
delete their own unprocessed inbox file. Every other path is refused on the server.

## Outbox (drafts)

Everything we send a client starts as a draft in `outbox/`, in exactly the format below. Drafts
can be committed and pushed safely: the app can't read `outbox/`, so the client never sees them,
and teammates can review them on GitHub. **Local preview** (the groundwork app on `localhost` with
`LOCAL_WORKSPACES=../<repo>`) shows drafts as if published. Add `DEV_VIEW_AS=client` to see exactly what the client will (team-only items hidden).
**Publishing** is `git mv outbox/<x> workspace/<x>` for approved files, then commit and push.
Nothing is published without a yes.

## Projects: `workspace/projects/<slug>.md`

A project is a body of work with its own conversations: "Website build," "Google Ads," "Event
landing page," "App: onboarding." It is optional. **v3 adds this layer; everything from v2 stays valid.**

```markdown
---
title: Your new website            # shown on Home and at the top of the project page
order: 1                           # projects sort by this (active first, then paused, then done)
summary: One line for the Home card.
status: active                     # active (default) | paused | done
priority: now                      # optional team star: listed first on Home
audience: team                     # optional: hides the project, its conversations and items from clients
---

Intro: what this project is and where it stands. A few sentences.
```

A conversation joins a project with `project: <slug>` in its topic file. The rules:

- **A topic belongs to at most one project.** No `project:`, or an unknown slug, means **General**.
- **Item ids stay unique across the whole workspace** (`q-007` is never reused in another project).
  Answers in `inbox/` are keyed by id, so moving a conversation between projects never loses one.
- **The project layer is invisible with only one project.** A workspace shows it only when there
  are two or more groups (counting General). Home then lists projects, each opens its own page of
  conversations, and "Next up" names both the project and the conversation.
- **Paused and done projects sink to the bottom** and are skipped by "Next up". Their conversations
  stay readable.
- **`audience: team` on a project** hides it and everything in it from clients, like a team-only topic.
- **Shared facts live once**, in the repo's `content/` and `messaging/` folders, never copied between
  projects. A question answered in one project is referenced from the other.
- **Drafts** follow the same layout: `outbox/projects/<slug>.md`. Publishing is `git mv` as usual.
- **Provenance (optional):** a project started from a library template carries `from_template:
  <name>@<template version>` and `template_library: <owner/repo>@<ref>` in its frontmatter. The app
  ignores them; the skills use them (for example, to offer template updates later).
- **Nesting (`parent:`) and per-person project access** are planned, not part of v3.

## Topics: `workspace/topics/<slug>.md`

A topic is one conversation: a short intro plus its items, in order. Home shows "Next up" (the
first open `priority: now` item if any, else the first open item, walking topics in order) and every topic with its progress.
Add `audience: team` to make the whole topic team-only (see *Team-only* below).

```markdown
---
title: Homepage copy              # shown on Home and at the top of the topic
project: website                   # optional: which project (workspace/projects/<slug>.md) it belongs to
order: 1                           # topics sort by this
summary: One line for the Home card.
---

Intro: where things stand, what we're planning, and why their input matters. A few sentences.
```

Items join a topic with `topic: <slug>`. Items without one (or with an unknown slug) show under
"Other".

## Assigned items: `workspace/assigned/<id>-<slug>.md`

```markdown
---
id: q-001
type: question
title: One plain-language line the client sees in the list
status: open
assigned: 2026-09-26
due: 2026-10-03
topic: homepage-copy
order: 2
links:
  - title: The homepage draft (page)
    url: https://…
prompts:
  - First question to talk through
  - Second question to talk through
planned: |
  What we're planning to do unless they tell us otherwise. Shown with a one-tap "Sounds right."
---

Body: context in plain language. What we know, what we need, why it matters.
```

| Field | Required | Values |
|---|---|---|
| `id` | yes | Prefix + 3 digits, unique per repo. `q-` question, `r-` review, `l-` link, `x-` request. Never reused. |
| `type` | yes | `question` · `review` · `link` · `request` |
| `title` | yes | ≤ 100 chars, no jargon |
| `status` | yes | `open` → `answered` (app sets on reply) → `closed` (we set) |
| `assigned` | yes | `YYYY-MM-DD` |
| `due` | no | `YYYY-MM-DD` |
| `from` | recommended | who on the team is asking, e.g. `Sam`. Shown as "Question from Sam" and on Next up. |
| `topic` | no | slug of a `workspace/topics/` file |
| `order` | no | position within the topic, lower first |
| `audience` | no | `team` hides the item from client logins; see *Team-only* below. Every item in a team-only topic is team-only too. |
| `priority` | no | `now` only. The first open `priority: now` item becomes Next up, ahead of topic order, and gets a "Priority" tag. The team can toggle it with the ☆ in the app. |
| `priority_prompts` | no | e.g. `[2, 4]`: 1-based prompts the team starred. Shown with a "Priority" tag; order and numbering don't change (answers record prompts by number). Toggled with the ☆ beside each prompt. |
| `links` | for `review`/`link` | list of `{ title, url }`, shown as page cards. `link: <url>` still works for one. |
| `prompts` | no | several questions answered in one go. Shown as a numbered checklist pinned above the Talk button; the client ticks each as they cover it. Best on a `review`: the page plus the open questions it raises. Keep to 2–5. |
| `ask` | no | who is asked: a list of names (first or full) or emails from `groundwork.yml` `people:` and `team:`, e.g. `[Alex, Sam]`. Also allowed on a topic or project; an item without its own takes its topic's, then its project's. See *Asking several people* below. |
| `sitemap` | no | a page list for the client to shape. Each entry is `{ page, job, fixed }` (or just a page name); `fixed: true` can't be cut (Home). The client marks each page Keep / Not sure / Cut, reorders, adds their own and stars up to 3. See *Page lists* below. |
| `round` | no | a whole number, `1` and up. Asks in small rounds: within a project, a client sees only the lowest round that still has an open item (plus anything already answered). Answering the last open item opens the next round automatically. Keep rounds to 3 items or fewer, easiest first. Items without a round always show; team-only items don't count toward a round. See *Rounds* below. |
| `planned` | no | what we intend to do. The client confirms with one tap (saved as an inbox file with `confirmed: true`) or says what's different. The best fit for clients who prefer intentions over approval questions. |

The filename must start with the `id`. The slug is for humans only.

**Board mapping:** `open` = Waiting on you · `answered` = Waiting on us · `closed` = Done.

## Inbox files: `workspace/inbox/<YYYY-MM-DD>-<re>-<HHMMSS>.md` (UTC)

The app writes these. **The team never edits them.** The author can edit or take back their own
answer in the app until the team processes it (moves it to `processed/`); after that it's locked.

```markdown
---
re: q-001
from: Alex Rivera
from_email: alex@example.com
via: voice
received: 2026-09-26T19:32:08Z
---

Verbatim text. No cleanup.
```

| Field | Values |
|---|---|
| `re` | an item `id`, or `brain-dump` |
| `from` | the logged-in user's display name |
| `from_email` | the author's login email. Decides who may edit. Older files without it are read-only. |
| `role` | `client` or `team`. Team members can answer and send messages too (adding context, answering a question the client asked). Only a `client` answer moves an item to answered; team answers never take an item off the client's list. On a team-only item it's the reverse: a `team` answer moves it to answered. Older files without it count as `client`. |
| `edited` | ISO 8601 UTC, set when the author edits. The original `received` is kept. |
| `via` | `voice` · `typed` |
| `received` | ISO 8601, UTC (`2026-09-26T20:47:55Z`). The filename date and time are UTC too. |
| `title` | optional, brain dumps only |
| `confirmed` | `true` when the client tapped "Sounds right" on the item's `planned` text |
| `covered` | list of prompt numbers the client ticked while answering, e.g. `[1, 2, 4]`. A hint, not a guarantee: read the answer for what it actually covers. |

The time in the filename prevents collisions when someone answers twice. Filenames for brain dumps
use `brain-dump` as the `re` part.

## Shared library: `workspace/shared/**.md`

Plain markdown. The first `# Heading` is the title shown in the library. Subfolders become sections.
Search is plain text across these files only.

**What it's for:** questions and reviews are asks that close; the library is what stays true, the
place the client goes to find something again. Written *to* the client. Every workspace keeps:

- `welcome.md`: how the workspace works, and any rule for this channel. Shown first on Home as a
  card until the person taps "Got it" (remembered per browser), and always kept in the Library.
- `pages-weve-shared.md`: every page we've shared, newest first, as links (never copies, which
  drift), one plain line each, with a status and date. The outbox skill adds rows on publish.
- `what-weve-settled.md`: a plain-language digest of what's decided, split into "What you've told
  us" and "What we're doing." The inbox skill proposes lines as decisions come in.

**Never in the library:** full specs written for builders, transcripts, security material,
anything commercial, or anything the client shouldn't read verbatim.

Shared pages (e.g. Claude artifacts) always open in a new tab: claude.ai refuses to be embedded
in other sites (`frame-ancestors 'self'`, tested 2026-09-26).

## Commit messages (written by the app)

- `inbox: q-001 answered by Alex Rivera (voice)`
- `inbox: brain dump from Alex Rivera`
- `inbox: q-001 edited by Alex Rivera`
- `inbox: q-001 taken back by Alex Rivera`
- `inbox: q-001 confirmed by Alex Rivera`
- `assigned: q-001 status → answered`
- `assigned: q-001 status → open (answer taken back)`

## Rules

1. **Text only.** No images, audio or binaries. The app throws audio away after transcribing.
2. **Git history is permanent.** Anything that must never be stored can't go through this.
3. **Raw stays raw.** The team never edits or deletes inbox files. Cleanup produces *new* files elsewhere. Junk and test entries are set aside by moving them to `processed/` unfiled.
4. **Take back isn't erasure.** Editing or taking back removes words from the workspace and from
   what we work from, but git history keeps the old version. Anything that must truly disappear
   needs a history rewrite by hand.
5. **Processing locks an answer.** Moving it to `inbox/processed/` is the team saying "we've read
   this and may have built on it." The skill must only process what's there; edits after a pull
   show up as a normal git change.

## Stars (team only)

The team's ☆ in the app writes `priority: now` into the file's frontmatter; tap again to remove it.

- **Topics:** starred topics are listed first on Home, which also puts them first when Next up walks topics.
- **Items:** see `priority` above. Starred items win Next up.
- **Prompts:** see `priority_prompts` above.
- **Library docs:** starred docs are listed first under "Starred." A doc without frontmatter gets a small `---` block added. Otherwise the welcome doc comes first, then the rest by title.

## Asking several people: `ask:`

```yaml
ask: [Alex, Sam]     # on an item, a topic (conversation) or a project
```

- **Each person asked answers for themselves.** The item shows "Asked of Alex, Sam. Sam answered.
  Still open for Alex." It leaves Sam's Next up and counts as done for them, and stays in Alex's.
- **It moves to answered only when everyone asked has answered**, whether they're client or team.
  Taking an answer back reopens it.
- **Rounds go at each person's pace.** An item you answered counts as done for you, so your next
  round opens even while others are still answering yours.
- **Answers stay hidden until you've given yours.** Someone asked who hasn't answered sees how many
  others have, not what they said (filtered on the server). After answering, they see everyone's.
  People who weren't asked see every answer, and can still add their own.
- **Without `ask:`** nothing changes: the client's answer moves it to answered, team answers are context.
- **Disagreements** are found when processing the inbox: compare the answers to the same item and
  list where they differ, as a follow-up item to both or a note for the next call.

## Page lists: `sitemap:`

```yaml
sitemap:
  - page: Home
    job: Helps a visitor decide to come on Sunday.
    fixed: true
  - page: Plan Your Visit
    job: What a first Sunday is like.
```

The answer lands in the inbox like any other, with the readable list as its text ("Keep, in this
order: 1. Home ★ …", then "Not sure" and "Cut") and the structure in its frontmatter:

```yaml
sitemap:
  - { page: Home, choice: keep, top: true, added: false }   # choice: keep | unsure | cut
```

Sending again is allowed; the newest answer counts, and the editor reopens with it. Up to 40 pages,
names up to 60 characters. Kept pages drive what we ask next (one small conversation per page).

## Rounds: `round: N`

For asking a little at a time, so a client can finish something and feel done.

- **Per project.** Each project's rounds count on their own; conversations in the same project share them.
- **One round open at a time.** The open round is the lowest one with an open client item. Later
  rounds are hidden from clients by the server (like team-only), and the team sees them tagged
  "Round N · opens later." Next up skips them.
- **Opens by itself.** When the client answers the last open item in a round, the next one appears,
  with a "Round N done" note. To hold a round back for review, leave its items `audience: team`
  and remove the line when ready.
- **Progress.** With two or more rounds, Home and the project page show one dot per round instead
  of the item count.

## Team-only: `audience: team`

For asking a teammate before the client sees something (e.g. "Sam, react to this spec first").
Put `audience: team` in the frontmatter of a topic, an item or a library doc.

- **Clients never see it.** The server drops team-only files from every client read: Home, Next
  up, topic pages, item links, the Library, search and Recent activity (answers to a team-only
  item never show). A guessed URL is a 404. Answering or confirming one as a client is refused.
- **The team sees it with a "Team only" tag.** Open team-only items come first in the team's
  Next up, ahead of client items. The team status line counts client items only, plus "N
  team-only waiting on us."
- **The team answers it like a client would**: Talk or type, the answer lands in `inbox/` with
  `role: team`, and that answer moves the item to answered.
- **Team messages from Home** (`brain-dump` with `role: team`) are hidden from clients too.
- **Moving it to the client** is removing the line (usually after a rewrite for them). Keep the
  id; it just becomes visible.
- **Not a secure channel.** The app can read everything in the repo, and team-only is a view
  rule, not encryption. Anything under a client's security rules still stays off the Workspace.
- **Local preview as a client:** `DEV_VIEW_AS=client` with the dev sign-in shows exactly what a
  client sees.
