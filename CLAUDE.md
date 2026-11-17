# CLAUDE.md: groundwork-library

People open this folder for one of three reasons. Work out which before doing anything; ask if it
isn't clear.

## 1. Joining a team that uses Groundwork ("set me up", "install groundwork", "get started")

Walk them through [START.md](START.md), **one step at a time**: say what the step is for in a
sentence, tell them exactly what to click, wait for them to confirm it worked, then move on. They
may not know git or the terminal, so use plain words and prefer the Claude desktop route.

- You can't click through Claude's Settings for them. Guide them, then check.
- Step 1: the plugin is `groundwork.zip` from the latest release. If they cloned or downloaded this
  library, there is no zip in it; send them to the download link in START.md.
- After the plugin is added, it only loads in a **new** session. Ask them to start one and ask
  "list your groundwork skills"; if the skills are already available in this session, check them
  yourself.
- Never ask for, read out, or write down a connector key, password or token.
- When they're done, tell them what they set up and what they skipped (for example the connector).

## 2. Starting Groundwork for a new organization ("set up groundwork for my church/team")

Follow [skills/groundwork-setup/SKILL.md](skills/groundwork-setup/SKILL.md). Read it from this
folder; there's no need to copy it anywhere first.

## 3. Working on the library itself (editing skills, templates, releasing)

- **This repo is public.** Never write a client's name, a person's details or anything private into
  a file or a commit message. CI checks history against a private denylist and will fail.
- Edit skills in `skills/`, never in `plugins/`, then run `npm run build:plugins`.
- Run `npm test` before committing.
- Releasing is in the README ("Releasing"). Pushing a `vX.Y.Z` tag runs
  `.github/workflows/release.yml`, which builds `groundwork.zip` (and one zip per optional plugin)
  and attaches them to the GitHub release that START.md links to.
