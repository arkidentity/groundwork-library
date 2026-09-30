# Messaging template (formerly the onboarding kit)

The standard start for any client we're building a message for (a website, a campaign, a pitch).
Its one job: **fill a ten-section brand brief and capture the client's real voice without drafting
anything**, using as little of the client's time as possible. It is inspired by the StoryBrand
framework and is not affiliated with or endorsed by its authors; the questions here are original.

The brand brief sections used in the table below: §1 hero (who the customer is), §2 problem,
§3 villain, §4 offer, §5 plan, §6 stakes, §7 success, §8 proof, §9 founder backstory, §10 who owns the
words. "Word list" means the client's locked words (always use) and banned words (never use).

This is a **project template** (see `../README.md`). Run it from the client's repo: say **"start
onboarding"** or **"start a messaging project."** The `groundwork-project` skill creates the
Messaging project in `outbox/` from this folder (`template.yml`, `project.md`, `topics/`,
`assigned/`), tailors it, and waits for a yes before anything is published.

## The four parts

| Part | What it is | Where it lives | Fills |
|---|---|---|---|
| **1. Send us what you have** | One request with a checklist. Links or "don't have it." | Workspace: `x-001` | Gate 0 (what was read) |
| **2. The interview** | Five conversations, 3–5 questions each, answered by talking | Workspace: `q-002`–`q-006` | Gate 1 intake + Gate 2 real sentences |
| **3. Kickoff call** | 60 minutes, recorded, same questions, live | `kickoff-call-guide.md` (team) | Everything the workspace misses |
| **4. Language audit** | What's working and what's in the way, from their own copy and words | `audit-rubric.md` (team), then a review in the Workspace | Gate 2 locked/banned words |

Order: publish parts 1 and 2 together, book the call in the first week, run the audit once the
material and at least two conversations are in. The audit goes to the client as a review, with
flags and reasons only. Replacement lines come later, in the messaging work itself.

## How the interview maps to the brand brief

| Conversation | Brand brief sections |
|---|---|
| q-002 Your customer | §1 hero, §6 stakes |
| q-003 The problem | §2 problem (all three layers), §3 villain |
| q-004 What you do | §4 offer, §5 plan |
| q-005 Proof and your story | §7 success, §8 proof, §9 founder backstory |
| q-006 Your words | §10 who owns the words, the word list (locked and banned words) |

## Why talking, and why no scored assessment

People write in their brochure voice and talk in their real one. The word list needs real sentences, and
a spoken answer to "what does the customer say when they first call?" produces a dozen of them. A
scored self-assessment tells us what the client *thinks* of their message, invites them to game
it, and gives us none of their language.

## Tailoring (done by the skill, checked by a person)

- Swap `{{customer}}` for what the client calls their customer (homeowner, parent, pastor).
- Use the client's industry in examples. Keep every question answerable by someone with no
  marketing vocabulary.
- If public research exists (`input/`), skip what we already know and ask about the gaps it lists.
- Keep `from:` as the person running the onboarding.
- Never ask for passwords or logins. If we need access, they invite us.
