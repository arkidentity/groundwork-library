# Church website discovery kit

This is a **project template** (see `../README.md`). The `groundwork-project` skill creates the Website
project from it (project file, topics, the first items); `church-website-discovery` then runs the waves.

The standard information process for any church website we build. It covers **content, flow and
priorities**. Design is not in here.

Read `STRATEGY.md` first: it says what the site is *for*, which decides what we ask.

## Two modules that work together

| Module | What it is | Sold |
|---|---|---|
| **A. Website discovery** (this kit) | Facts, flow and priorities for every page. Fills `content/`. | Always, it's the website job. |
| **B. Messaging** (`../messaging/`) | Brand brief and voice: who the visitor is, their problem, proof, the church's words. Fills `messaging/`. | Offered as the upsell. |

They share one repo, one workspace and one `content/` + `messaging/` spine. B's answers satisfy
some of A's questions (`also:` field in `question-bank.yml`), so a client who buys both never
answers twice.

**Without B,** we still ask the light voice questions in Section 1 and write copy from those.
**With B,** copy is written from the locked brand brief, and the Section 1 answers are replaced by
B's. The pitch that's true: copy written before the message is settled gets rewritten.

## The waves

| Wave | Who does the work | What happens |
|---|---|---|
| **0. Prefill** | Us | Scrape their site, socials, listings and any call transcripts. Write every answer we can into `content/` marked `unconfirmed` with its source. |
| **1. Confirm** | Client, 5 minutes | Send what we found as "planned" items: "We have Sunday 10:00. Right?" One tap to confirm, or say what's different. |
| **2. Blockers** | Client, by talking | The MUST questions nobody could scrape (marked `src: manual`). Stories are asked to be talked, not typed. |
| **3. Per page** | Client, as each page is built | The rest, one section at a time, only for sections that exist (see gates). |
| **4. Launch list** | Client + us | Domain, DNS, email, redirects, analytics, Google Business Profile, who updates it. |

Never send a blank question we could have answered ourselves. Never send more than one wave at once.

## Gates: ask whether it exists first
Before any section's detail, ask one yes/no per area: livestream, sermons online, events tool,
online giving, kids, youth, small groups, care ministry, second language. A "no" turns the section
off and is recorded as `n/a`, not `empty`. A "not yet" becomes a line on the roadmap, never a
question. (A church with no youth ministry should never be asked to describe it.)

## Sensitive things
Reputation problems, past leadership history, money trouble, disputes, other churches' troubles
and contested positions are asked **on a call, never in a written question.** Log them in
`messaging/kickoff-call-guide.md` under "The hard stuff." Decide together what the site says.

## Where answers go

| Kind | Goes to |
|---|---|
| Facts (times, address, staff, ministries, beliefs text) | `content/<section>.md` |
| Stories and voice | `messaging/` (and B's brand brief if sold) |
| Status per section | `content/_coverage.md` |
| Files (logo, photos) | `site/assets/` or a link, never in the workspace app |

Every fact in `content/` carries `status: unconfirmed | confirmed`, a `source:` and a `date:`. The
site is built from `confirmed` values. Nothing unconfirmed ships.

## Files in this kit
- `STRATEGY.md`: how we build church sites that convert, and what we measure.
- `question-bank.yml`: every question with priority, source, gate, destination and B overlap.
- `sitemap.md`: default pages, each with its one job.
- Skill: `church-website-discovery` ships inside each church repo at `.claude/skills/`
  (master: `examples/sample-workspace/.claude/skills/`). Say **"start website discovery"**.
