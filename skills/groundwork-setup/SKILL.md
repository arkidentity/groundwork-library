---
name: groundwork-setup
description: Set up Groundwork from scratch for a new organization (a church, ministry, business or agency) — check the tools, create the private GitHub repo, scaffold groundwork.yml and the workspace folders, explain what must never go in the repo, install the Groundwork GitHub App, request access, add the team and the people they'll ask, sync the skills, start a first project, and teach the daily loop. Use when someone says "set up groundwork", "start a groundwork workspace", "groundwork for my church/team/organization", "new groundwork repo", or "how do I get started with groundwork".
---

# Groundwork Setup

Walks someone new through getting Groundwork running for their organization. Go one step at a
time: explain the step in a sentence, do it (or tell them exactly what to click), confirm it
worked, then move on. Assume they know Claude, not necessarily git. Plain words, no jargon.

**What Groundwork is, in one breath:** a private GitHub repo holds the work. The Groundwork app
(a website) shows the people you're working with a few questions at a time; they answer by talking
or typing; their answers land back in the repo, where Claude helps you file them and decide what to
ask next. The repo is the memory; the app is the front door.

Facts you need (from `docs/REPO-CONTRACT.md` in this library):
- App: **https://groundwork-lyart-delta.vercel.app** (a custom domain is planned; the old address will redirect).
- GitHub App to install: **https://github.com/apps/groundwork-workspace**
- Access is approved by hand. The library's maintainer adds each organization's GitHub account to
  the app's allowed list. Contact: open an issue on `arkidentity/groundwork-library` titled
  "Access request: <GitHub account>", or ask the person who invited them.

## Step 0. What they need first
Check, and help install what's missing:
1. **A GitHub account** (personal or an organization account for their church/company). Ask which
   account will own the repo. An organization account is better for a team.
2. **Claude Code** (the `claude` command, the desktop app's Code tab, or an IDE extension).
3. **git** and the **GitHub CLI**: `git --version`, `gh --version`, then `gh auth login` if
   `gh auth status` fails.
4. **Two-step login on GitHub**, for everyone who will touch the repo. The repo will hold the
   organization's notes.

## Step 1. One repo or two?
The Groundwork GitHub App can read **everything** in a repo it's installed on. So:
- **One repo (most people):** the repo is both the team's working folder and the workspace. Choose
  this unless their notes would put someone at risk if they leaked.
- **Two repos (sensitive work):** a private project repo the app never touches, plus a small
  `<name>-workspace` repo with only what the app needs. The inbox skill files notes from the
  workspace into the project repo. Choose this for anything involving people's safety, health,
  legal or financial details.

## Step 2. Create the repo
```bash
gh repo create <owner>/<name> --private --clone
cd <name>
```
Always **private**. Name it after the organization or the project (`hope-church`,
`hope-church-workspace`).

## Step 3. Scaffold it
Create these files (fill in their details; ask, don't guess):

**`groundwork.yml`** (never shown to the people they ask):
```yaml
name: Hope Church                 # shown as "Hope Church Workspace"
slug: hope                        # the address: /c/hope (lowercase, hyphens)
# notes_repo: <owner>/<project>   # two-repo setups only: where notes are filed
team:
  # Your staff who write questions and file answers. Name and email, one per line.
  - Alex Rivera <alex@hopechurch.org>
people:
  # The people you're asking (elders, a client, volunteers): "Full Name <email>".
  # They sign in with a link emailed to this address. No GitHub account needed.
  - Sam Lee <sam@example.com>
libraries:
  - source: arkidentity/groundwork-library
    ref: <latest tag, e.g. v0.6.0>
```
**Team entries need an email** (`Name <email>`): that's what gives someone team access to this
workspace and only this one.

**Folders:**
```
workspace/assigned/        ← questions you publish (the app shows these)
workspace/topics/          ← conversations that group them
workspace/projects/        ← optional: bodies of work (a website, a campaign)
workspace/shared/          ← reference docs people can read in the app (Library)
workspace/inbox/processed/ ← answers land in inbox/, move here once filed
outbox/                    ← drafts; invisible until published
input/                     ← raw material: call notes, transcripts, emails (team-only)
notes/                     ← filed answers (team-only)
```
Put a `.gitkeep` in empty folders so git keeps them.

**`workspace/shared/welcome.md`**: a short, warm note for the people they'll ask: what this is,
"start with Next up," "tap Talk and say it however it comes out," "you can edit until we've read
it." Write it in the organization's voice; show it before saving.

**`CLAUDE.md`**: the house rules for anyone (or any Claude) working in this repo. Include: who the
organization is, who's on the team, what the people they ask can see (only `workspace/assigned`,
`topics`, `projects`, `shared`), the "never put in the repo" list below, and "nothing reaches
them without a yes."

**`.gitignore`**: `.DS_Store`, `node_modules/`, and big media (`*.mp3 *.m4a *.wav *.mp4 *.mov *.zip`).

## Step 4. What never goes in the repo
Say this plainly and put it in `CLAUDE.md`:
- **Passwords, logins, API keys, tokens.** Ever. Ask people to invite you to things instead.
- **Card, bank, or government ID numbers.**
- **Anything about a person you'd be harmed or embarrassed to see leaked**: health, counseling or
  pastoral-care details, legal matters, children's information, home addresses of vulnerable
  people. Summarize without names, or keep it out entirely (or use two repos).
- **Big audio and video files.** Keep transcripts as text instead.
- **Pricing or contracts** you wouldn't want the people you're asking to read, if they might ever
  get repo access.
Remember: git history is permanent. Deleting a file later doesn't remove it. Catch it before committing.

## Step 5. Commit and push
```bash
git add -A && git commit -m "Set up Groundwork workspace" && git push -u origin main
```

## Step 6. Install the Groundwork GitHub App
Send them to **https://github.com/apps/groundwork-workspace** → **Install** (or **Configure** if
it's already on their account) → choose the account that owns the repo → **Only select
repositories** → pick this repo (in a two-repo setup, **only** the `-workspace` repo) → Install.
Never choose "All repositories."

## Step 7. Request access
The app ignores accounts it hasn't approved. Have them send the GitHub account name (the owner of
the repo) to the maintainer (see the facts at the top). Until it's approved, the workspace won't
appear. Once approved, it shows up within a minute; no redeploy.

## Step 8. Add the skills
From a clone of this library next to their repo:
```bash
git clone https://github.com/arkidentity/groundwork-library.git   # once, beside their repo
cd groundwork-library
node scripts/sync-skills.mjs --repo ../<name> --commit
```
That copies `groundwork-inbox`, `groundwork-outbox` and `groundwork-project` into
`.claude/skills/`, stamped with the version. Push their repo afterward. To update later, run it
again with `--upgrade`.

## Step 9. Sign in and look
They go to the app address, enter their email (the one in `team:`), and click the emailed link.
They should see their workspace with a "Team only" status line. Then add one real person in
`people:`, push, and have them sign in too.

## Step 10. First project
In their repo, in Claude Code: **"start a project"** (or "start a church website project" to use a
template; "start a blank project" for anything else). The `groundwork-project` skill drafts it into
`outbox/`. Review it, then **"publish the outbox."** Teach the shape while you go:
- **Projects** hold **conversations**; conversations hold **questions**.
- **Rounds:** people see 3 questions or fewer at a time (`round: 1`, `round: 2` …); the next round
  opens when they finish.
- **Asking several people:** `ask: [Sam, Jordan]` on a question, conversation or project. Each
  answers for themselves, without seeing the others' answers until they've given theirs.
- **Team-only:** `audience: team` hides something from the people you're asking.
- **Quick confirms:** a `planned:` line they can approve with one tap.

## Step 11. The daily loop
- **Answers come in** → in Claude Code: **"process the inbox."** Notes get filed, decisions and
  open questions pulled out, follow-ups suggested.
- **Next questions** → "draft the next round" / "prepare the outbox," review, then publish.
- **Add or remove someone** → edit `groundwork.yml`, push. Takes effect within a minute.
- **Updates to templates and skills** → `sync-skills.mjs --upgrade` from the library.

## Done means
- A private repo with `groundwork.yml`, the workspace folders, `welcome.md`, `CLAUDE.md`, and the skills.
- The GitHub App installed on that repo only, and access approved.
- They signed in as team, and at least one person they're asking can sign in.
- They know the never-in-the-repo list, and they've started (or planned) a first project.
