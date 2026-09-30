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

## Rounds, not waves

A client sees **one round at a time, 3 items at most**, and the next round opens when they finish.
Each item asks one thing (at most 2 prompts; a request may carry 3 short ones). Easiest first.

| Round | Conversation | What happens |
|---|---|---|
| 0 | (us) | **Prefill.** Scrape their site, socials, listings and call transcripts into `content/`, marked `unconfirmed`. |
| 1 | Does this look right? | Up to 3 one-tap confirms of what we found (basics, the week, the pastor). |
| 2 | Your pages · A few quick things | **The page list** (keep / cut / add / star 3) and three quick facts. |
| 3–5 | A few quick things · Your Sundays | Links, the first-Sunday walk-through, logo and photos, first-timer questions. |
| 6–7 | The tools you use | Giving, people database, volunteers; calendar, email, sign-ups. "Nothing yet" becomes our recommendation, never homework. |
| 8+ | One per kept page | From `page-questions.yml`, only for pages they kept, starred pages first. |
| last | Getting ready to launch | Domain, Google listing, approver, launch date, redirects, report. |

Never send a blank question we could have answered ourselves: send it as a `planned:` confirm.
To hold a round for review, keep its items `audience: team` until you're ready.

## Gates: ask whether it exists first
Most gates are answered by the page list: a cut page turns its section off. The rest (kids, youth,
groups, care, second language) come from the ministry list and prefill, never a list of yes/no
questions. A "no" turns the section
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
- `sitemap.md`: default pages, each with its one job (the page list in `q-pages`).
- `page-questions.yml`: the rounds for each page a client keeps, linked to bank ids.
- Skill: `church-website-discovery` ships inside each church repo at `.claude/skills/`
  (master: `examples/sample-workspace/.claude/skills/`). Say **"start website discovery"**.
