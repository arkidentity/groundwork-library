# groundwork-library

Templates and skills for Groundwork client workspaces, versioned in one place. The app
(`arkidentity/groundwork`) never reads this repo; only people and skills do, when they start a
project or sync skills. **Releasing a template is a git tag, not a deploy.**

```
library.yml          ← index: version, contract version, every template and skill
templates/<name>/    ← project templates (template.yml, project.md, topics/, assigned/, ...)
skills/<name>/       ← Claude Code skills (SKILL.md)
scripts/sync-skills.mjs
CHANGELOG.md
```

| Template | What it is |
|---|---|
| `church-website` | Website discovery in rounds of 3 or fewer, an interactive page list, per-page questions, conversion strategy |
| `messaging` | Brand brief and voice capture, inspired by the StoryBrand framework (the upsell) |
| `blank` | An empty project with one conversation |

| Skill | What it does |
|---|---|
| `groundwork-inbox` | Process what the client sent |
| `groundwork-outbox` | Draft and publish what goes to the client |
| `groundwork-project` | Create or change a project from a template |
| `church-website-discovery` | Run the website discovery waves (optional) |

## Using it

**Templates:** in a workspace repo, say "start a <name> project." The `groundwork-project` skill
finds the library version the workspace is pinned to (see Pins), copies the template into `outbox/`,
and stamps `from_template: <name>@<template version>` and `template_library: <source>@<ref>` on the
project. After that the project belongs to the client; template releases never change it.

**Skills:** copy them into workspace repos with the sync script, from this repo:

```bash
node scripts/sync-skills.mjs --dry-run        # see the plan for every repo under ../
node scripts/sync-skills.mjs --commit         # sync and commit in each repo (never pushes)
node scripts/sync-skills.mjs --add church-website-discovery --repo ../some-church
node scripts/sync-skills.mjs --except acme-workspace:groundwork-outbox   # leave a deliberate fork alone
```

- Core skills (`library.yml`) go into every workspace repo. Optional ones go where they already
  exist, or where you pass `--add`.
- Each synced skill gets a `.library.json` stamp. **A skill edited locally since the last sync is
  skipped, never overwritten** (`--force` overrides). Repo-specific rules belong in the repo's
  `CLAUDE.md`, not in a forked skill.

## Pins

A workspace says which library version it is on, in `groundwork.yml`:

```yaml
libraries:
  - source: arkidentity/groundwork-library
    ref: v0.2.0
```

- **Why:** a template or skill change can change what a client sees. A pin means nothing moves until
  someone moves it on purpose.
- **Templates:** `groundwork-project` runs `.claude/skills/groundwork-project/scripts/resolve-library.mjs`,
  which returns a checkout at exactly that ref: a sibling `../groundwork-library` if it is at the
  ref, otherwise a cached clone in `~/.cache/groundwork/libraries`. It never hands back a different
  version. No pin means "use the sibling as it is", with a notice.
- **Skills:** the sync script only syncs a repo whose pin equals the version it is run from. Others are
  skipped and reported.

```bash
node scripts/sync-skills.mjs --pin --commit       # add a pin (at this version) to unpinned repos
node scripts/sync-skills.mjs --upgrade --commit   # move pinned repos to this version, then sync
```

Run the sync script from a checkout at the release tag (`git checkout v0.2.0`) so the pin it writes
matches what a fresh clone of that tag contains. Use tags (`v1.2.3`) for pins. `ref: main` is accepted
but floats, so the sync script treats it as out of date until it is upgraded to a tag.

## Updating an old project

A template release never changes a running project. To see what a newer template would bring, run
from the workspace repo (or say "check template updates"):

```bash
node .claude/skills/groundwork-project/scripts/template-diff.mjs --to latest
```

It lists, per project: new topics and items, changed and removed files (linked to the workspace item
each became, with its status), the changelog entries in between, and question-bank changes. It only
reads. The `groundwork-project` skill then drafts any additions into `outbox/` and never rewrites a
live item. Projects need the `from_template` / `template_library` stamps; older ones can be stamped by
hand.

## License and affiliation

MIT, see [LICENSE](LICENSE). Use it, change it, run your own copy. The `messaging` template is inspired
by the StoryBrand framework; it is not affiliated with or endorsed by StoryBrand, Donald Miller or
Business Made Simple, and the questions are original. The file format the skills work with is in
[docs/REPO-CONTRACT.md](docs/REPO-CONTRACT.md).

## Checks
```bash
npm ci
npm run validate   # the whole library: index, templates, skills, question bank, changelog
npm test           # validate + the validator's own tests + the sync script's tests
```
GitHub Actions runs both, plus a client-name guard (`scripts/check-denylist.mjs`, pattern from the `DENYLIST_REGEX` secret), on every push and pull request, and on tags. The validator checks that every
template has a matching `template.yml`, every `{{placeholder}}` is declared, every item's frontmatter
parses with a known type and an existing topic, ids are unique, skills' names match their folders,
versions agree across `library.yml` and each template, and the changelog mentions the current
version. A release tag must equal the version in `library.yml`.

## Releasing
1. Edit a template or skill. Add a line to `CHANGELOG.md`.
2. Bump `version` in `library.yml` (and a template's own `version` if it changed). Semver: patch =
   wording, minor = new template/question/skill/optional field, major = anything that changes ids,
   layout, or the contract version a workspace needs.
3. Wait for CI to pass, then `git tag vX.Y.Z` and push with tags (CI checks the tag matches).
4. Nothing changes for any workspace yet. To roll a release out to a client, check out the tag and run
   `sync-skills.mjs --upgrade --commit` for that repo (`--repo ../client-workspace`), review, push.

## Not built yet
- Distributing skills as a Claude Code plugin, so the copies in each repo can go away.
- Org libraries (a church or another company's own template repo, layered over this one).
