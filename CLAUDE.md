# CLAUDE.md: groundwork-library

People open this folder for one of three reasons. Work out which before doing anything; ask if it
isn't clear.

## 1. Joining a team that uses Groundwork ("set me up", "install groundwork", "get started")

They don't need this library. Tell them, briefly, to get the plugin the normal way: on
groundwork.chat → Team → **Connect Claude**, download `groundwork.zip` and upload it in Claude
desktop (Settings → Customize → Plugins → Upload). [START.md](START.md) has the same steps and the
terminal route. Don't walk them through a longer setup from here, and never ask for a key or token.

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
