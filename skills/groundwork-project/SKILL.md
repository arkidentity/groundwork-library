---
name: groundwork-project
description: Create a project in a Groundwork client workspace from a template (or blank) — copy the template's project file, conversations and items into outbox/, fill the variables, renumber ids, avoid clashes and duplicate questions with the client's other projects, and wait for a yes before publishing. Also adds, pauses, finishes, or moves conversations between projects. Use in a *-workspace repo (any repo with groundwork.yml) when someone says "start a project", "add a <name> project", "start a website project", "start a messaging project", "start onboarding", "new project for <client>", "pause the <name> project", "move <conversation> to <project>", "check template updates", "is the <name> template out of date", or "what changed in the template".
---

# Groundwork Project

A **project** is a body of work inside a client's workspace ("Website build," "Google Ads," "App:
prayer"). Contract: `arkidentity/groundwork-library` → `docs/REPO-CONTRACT.md` → **Projects** (v3). Templates
live in the library, not in this repo: `arkidentity/groundwork-library` → `templates/` (index:
`templates/README.md`).

## Find the right library version first (always)
A workspace pins the library version it is on in `groundwork.yml`:

```yaml
libraries:
  - source: arkidentity/groundwork-library
    ref: v0.2.0
```

Run the resolver from the workspace repo. It prints the path of a checkout at exactly that ref
(a sibling `../groundwork-library` if it is at the ref, else a cached clone it fetches for you):

```bash
node .claude/skills/groundwork-project/scripts/resolve-library.mjs
```

Use that path for every template read below; never a checkout at another version. With no pin it
uses the sibling and says so; mention that the workspace is unpinned. If it fails (offline, bad
tag), stop and tell the person; don't fall back to a different version. To move a workspace to a
newer library, the pin is raised on purpose (`sync-skills.mjs --upgrade` in the library repo), never
as a side effect of starting a project.

This skill builds the **project shell and its first conversations**. Other skills do the ongoing
work: `church-website-discovery` runs the website waves, `groundwork-outbox` drafts and publishes
later waves, `groundwork-inbox` files answers. **Nothing reaches the client without a yes.**

## Ground rules
1. **Drafts go in `outbox/`** (`outbox/projects/`, `outbox/topics/`, `outbox/assigned/`), never
   straight into `workspace/`.
2. **One project is invisible.** With a single project the client sees no project layer. Don't create
   the layer just to have it; create a second project only when the work is genuinely separate.
3. **Topic slugs and item ids are workspace-wide.** Check `workspace/` **and** `outbox/` for clashes.
   On a topic-slug clash, prefix with the project slug (`website-getting-started`) and fix each
   item's `topic:`. Items take the next unused id in their letter series (`q-010`, `x-002`);
   never reuse an id.
4. **Never ask twice.** Before drafting, read the client's other projects, `content/`, `messaging/`,
   `notes/` and `workspace/inbox/processed/`. Skip or reword any template item whose answer already
   exists or is already asked. `template.yml` `pairs_with` and `items.<id>.skip_if` say where overlaps
   usually are.
5. **Sensitive things stay out** of every written item (see the template's README). They go on a call
   list in `messaging/`.
6. **Team-only is a view rule, not a secure channel.** `audience: team` on the project hides it and
   everything in it from client logins. Use it to hold something back (an upsell not yet offered) or
   to get a teammate's reaction first.

## Start a project from a template

1. **Pick the template.** List `templates/` in the resolved library (church-website, messaging, blank, and any
   added since). If none fits, use `blank` and say so.
2. **Read `template.yml`, `README.md`, and every file in the template.** Note `vars`,
   `project.slug`, `pairs_with`, `items`, `team_files`, `generate`, `skill`.
3. **Fill the variables.** Ask only for the ones you can't infer from `groundwork.yml`, the repo and
   `input/`. `{{from}}` is the teammate who holds the relationship with the client. `{{date}}` is
   today. Keep the client's own words and industry terms; no jargon they don't use. Quote any value
   that contains a colon when it lands in YAML.
4. **Copy into `outbox/`:**
   - `project.md` → `outbox/projects/<slug>.md`. If the slug exists in `workspace/` or `outbox/`, stop
     and ask (don't overwrite). Add two lines of frontmatter so the project remembers where it came
     from: `from_template: <name>@<template version>` (the template's own `version`) and
     `template_library: <source>@<ref>` (the pin, e.g. `arkidentity/groundwork-library@v0.2.0`; the
     ref that was resolved, or `unpinned` with no pin).
   - `topics/*.md` → `outbox/topics/`, add `project: <slug>` (the templates use `{{project}}`) and
     `template_topic: <the template's topic file name, without .md>`.
   - `assigned/*.md` → `outbox/assigned/<id>-<slug>.md`, renumbered (rule 3), `topic:` fixed, and add
     `template_item: <the template file's name, without .md>` (e.g. `q-002-your-customer`). These two
     stamps are how "check template updates" links a changed template file to the item it became,
     since ids are renumbered.
5. **Apply `pairs_with` and `skip_if`.** Drop items another project already covers. Note what you
   dropped and why.
6. **Tailor.** Reword prompts with what you know (3 to 5 prompts per item, answerable by talking).
   Read the client's `CLAUDE.md` for voice and security rules first.
7. **Team files.** For each `team_files` entry with a `to`, copy it there and apply its `tailor:` note
   (never overwrite an existing file). Entries with `to: null` are reference: read from the template
   folder, don't copy.
8. **Set `audience`.** Ask if the project should be team-only for now (e.g. an upsell not yet offered).
9. **Validate.** Every draft's frontmatter must parse; every `topic:` resolves to a topic file; ids
   are unique across `workspace/` + `outbox/`.
10. **Hand off.** If the template names a `skill`, say the next command (e.g. "start website
    discovery"). Show a compact outline: project, topics in order, each item's id, type, title;
    then what was skipped. Show the local preview command from `groundwork-outbox`. Commit
    `outbox: start <project> project`. Publish only on a yes (below).

## Publish (only on a yes)
1. `git mv` each approved file from `outbox/` to the same path in `workspace/`. Publish the project
   file together with at least one topic that has items.
2. **Sharing check and library updates** are `groundwork-outbox`'s publish step; follow it.
3. Commit `workspace: publish <project> project`, push. The client sees it within a minute (team-only
   projects only the team sees).
4. **Deploy order:** the Groundwork app must already support projects (contract v3). It does as of
   2026-09-30. If you're unsure, check the app's deploy before pushing project files.

## Check template updates
Use when someone asks "check template updates", "is the website template out of date", or "what changed
in the template." The check **only reads**; nothing in the workspace changes until you draft it and
get a yes.

1. **Resolve the library** (see above), so the pin is known.
2. **Run the check** from the workspace repo:
   ```bash
   node .claude/skills/groundwork-project/scripts/template-diff.mjs            # vs the pinned version
   node .claude/skills/groundwork-project/scripts/template-diff.mjs --to latest  # preview a newer release
   node .claude/skills/groundwork-project/scripts/template-diff.mjs --project website --json
   ```
   For every project that records `from_template` and `template_library`, it compares the template
   as it was when the project started with the template now, and lists what is new, changed and
   removed, the changelog entries in between, and, for the church website template, a summary of
   bank questions added, removed or changed. Changed and removed files are linked to the workspace
   items they became (`template_item`) with their status. Older projects without stamps are reported
   as "cannot compare"; add the stamps by hand if you know the release they came from.
3. **Go through it with the person, never silently.** For each project with updates:
   - **New topics and items:** draft them into `outbox/` the way "Start a project" does (copy from the
     target version's template, `resolve-library.mjs --ref <tag>` fetches it; fill the variables; renumber
     ids; add `template_item` / `template_topic`; put items under the workspace topic found through
     the `template_topic` stamp, or ask). Skip anything the client already answered or that an existing
     item already asks (read the workspace first; rule 4).
   - **Changed items:** **never rewrite a live item.** If the workspace copy is still only in `outbox/`,
     update it on a yes. If it is published and open, show the new wording and ask. If it is answered,
     leave it and say what changed.
   - **Removed items:** leave live items alone; mention them.
   - **Question bank changes** (church-website): new must-haves become part of the next wave
     (`church-website-discovery` → "draft the next wave"); don't draft them here.
   - Read out the changelog entries; they say why.
4. **Move the stamps only when it's settled.** When every change is adopted, skipped on purpose, or
   deliberately left, set the project's `from_template:` to `<name>@<new template version>` and
   `template_library:` to `<source>@<target tag>`. If something was deferred, leave the stamps alone so
   the next check lists it again.
5. **The pin is separate.** The check compares against the workspace's pin. To move the whole
   workspace to a newer library (its skills too), raise the pin on purpose from the library repo:
   `node scripts/sync-skills.mjs --upgrade --repo <this repo>`. `--to latest` shows what that would bring.

## Other project changes
- **Pause / finish:** set `status: paused` or `done` in the project file. Paused and done projects
  sink on Home and are skipped by Next up.
- **Move a conversation:** change `project:` in the topic file. Items and answers follow (ids are
  workspace-wide).
- **Star a project** (`priority: now`): the team can also do this in the app.
- **Make it client-visible:** remove `audience: team` from the project file, commit, push. Its
  conversations reach the client at once, so confirm first.
- **Rename the client-facing title:** edit the project's `title:`.

## Done means
- The project, its topics and items are in `outbox/` (or `workspace/` after a yes), parse cleanly, and
  use unused ids and slugs.
- Nothing already answered or already asked was duplicated.
- Sensitive items were kept out and listed separately.
- The client saw nothing without a yes.
