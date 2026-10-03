# Getting started with Groundwork

Groundwork is a simple way to gather answers from the people you work with (your elders, a client,
volunteers) without long forms or email threads. They see a few questions at a time and answer by
talking or typing. Their answers land in a private GitHub repo, where Claude helps you file them and
decide what to ask next.

## What you need
- A **GitHub** account (an organization account is best for a team), with two-step login turned on.
- **Claude Code** (the `claude` command, the Claude desktop app's Code tab, or an IDE extension).
- **git** and the **GitHub CLI** (`gh`). Claude can help you install them.

## The fastest way: let Claude walk you through it
1. Get the setup skill:
   ```bash
   git clone https://github.com/arkidentity/groundwork-library.git
   mkdir -p ~/.claude/skills
   cp -R groundwork-library/skills/groundwork-setup ~/.claude/skills/
   ```
2. Open Claude Code in the folder where you keep your projects (the one that now holds
   `groundwork-library`) and say: **"set up groundwork for my organization."**

Claude takes it one step at a time: creating the private repo, the files, installing the
Groundwork GitHub App, requesting access, adding your team and the people you'll ask, and starting
your first project.

## The short version, if you'd rather do it yourself
1. Create a **private** repo. Add `groundwork.yml` (your name, `team:` with `Name <email>` for each
   staff member, `people:` with `Name <email>` for each person you'll ask), the `workspace/`
   folders, a `workspace/shared/welcome.md`, and a `CLAUDE.md` with your house rules. The skill file
   [`skills/groundwork-setup/SKILL.md`](skills/groundwork-setup/SKILL.md) has every detail.
2. Install the GitHub App on that repo only: **https://github.com/apps/groundwork-workspace**
3. **Request access:** open an issue here titled "Access request: <your GitHub account>". Access is
   approved by hand.
4. Sync the skills into your repo: `node scripts/sync-skills.mjs --repo ../<your-repo> --commit`, then push.
5. Sign in at **https://groundwork.chat** with the email you put in `team:`.

## Never put these in the repo
Passwords, logins, API keys; card, bank or ID numbers; health, counseling, legal or children's
details; big audio or video files. The Groundwork app can read the whole repo, and git history is
permanent. If your notes could put someone at risk, use two repos (the setup skill explains how).

## How it works, in four ideas
- **Projects → conversations → questions.**
- **Rounds:** people see 3 questions or fewer at a time; the next round opens when they finish.
- **Ask several people** (`ask: [Sam, Jordan]`): each answers on their own before seeing the others.
- **Nothing reaches them without your yes:** drafts live in `outbox/` until you publish.
