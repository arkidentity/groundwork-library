# Changelog

Semver. **Patch:** wording and fixes. **Minor:** new templates, new questions, new skills, new
optional fields. **Major:** anything that changes ids, file layout, or the contract version a
workspace needs. Templates only affect projects started after a release; existing projects are
updated on purpose (see README, "Updating an old project").

## 0.20.0 (2026-11-17)
- **New core skill `groundwork-connect`.** Ask Claude "help me connect Groundwork" and it walks
  through each screen: which Authentication and OAuth client options to pick, no headers, which tool
  permissions to allow, the emailed code, adding it for a whole organization (adding it for yourself
  connects only you), the terminal route, and what to do when something fails.
- START.md gains "Questions you'll hit while connecting".

## 0.19.3 (2026-11-17)
- **Connect Groundwork by signing in, no key.** START.md and `groundwork-inbox` now say to add
  `https://groundwork.chat/api/mcp` as a custom connector in Claude (or `claude mcp add` + `/mcp` in
  a terminal) and sign in. Keys remain for computers that can't sign in. The inbox skill knows
  `get_photo`. The page on groundwork.chat is now called **Connect Claude**.

## 0.19.2 (2026-11-17)
- **Fix: the plugin zip now uploads in Claude desktop.** The upload rejected skill descriptions
  containing `<client>`-style placeholders (it reads them as XML tags). Descriptions use
  `[client]` instead, and `npm run validate` now fails on `<` or `>` in a description.

## 0.19.1 (2026-11-17)
- **Add the plugin from Claude desktop, no terminal.** Each release now attaches `groundwork.zip`
  (and a zip per optional plugin) to the GitHub release; upload it under Settings → Customize →
  Plugins. New [START.md](START.md) walks someone joining a team through setup, and the library's
  new `CLAUDE.md` has Claude guide them step by step. Uploaded copies don't update themselves.

## 0.19.0 (2026-11-17)
- **The library is now a Claude Code plugin marketplace.** Install the `groundwork` plugin
  (all core skills) instead of copying skills into each repo; optional skills are their own
  plugins. **For agencies:** nothing changes unless you switch; synced copies keep working. To
  switch, see "Install as a plugin" in the README. Skills are still edited in `skills/`;
  `npm run build:plugins` regenerates `plugins/`, and CI fails if it is stale.

## 0.18.1 (2026-11-17)
- **`groundwork-brand-capture`:** read colors from visible text, not wrappers (page builders hide
  styles on parents); record the section-band rhythm; only keep colors seen on screen; band classes
  reset the color tokens.

## 0.18.0 (2026-11-17)
- **New skill `groundwork-brand-capture`.** Measures a client's live website (computed fonts,
  colors, section bands, buttons, layout), downloads the real logo, and writes
  `_shared/brand.css` so Groundwork pages match the client's site. Run it when onboarding a client.

## 0.17.0 (2026-11-17)
- **`groundwork-outbox` makes pages for database projects.** Groundwork now hosts branded pages
  from a linked repo's `groundwork/pages/<slug>/` (`index.html` + `deliverable.yml`), like
  `workspace/deliverables/` in a file-based workspace. The skill adds a section for repos with a
  `groundwork/` folder and no `groundwork.yml`: brand in `groundwork/pages/_shared/brand.css`,
  `data-section` names, `share:` in `deliverable.yml`. Triggers on "make a Groundwork page".

## 0.16.0 (2026-11-16)
- **`groundwork-inbox` knows database projects.** Groundwork is now Agency, Brand, Project, with
  notes held in the database and no `groundwork.yml`. The skill adds a Step 0 (find the project in
  the team's project map (`PROJECTS.md`) or the connector's `list_workspaces`) and a Database projects flow:
  read through the Groundwork connector (or the read-only repo copy in `groundwork/`), file notes,
  reply and `set_status` through the connector, no `processed/` move. The file-based flow is
  unchanged below it. `groundwork-outbox`, `groundwork-project` and `groundwork-setup` still
  assume the file-based flow; database projects cannot publish assigned questions from Claude yet.

## 0.15.0 (2026-11-13)
- **Threads** (app support shipped 2026-11-12/13): a note left on a hosted page starts
  `workspace/threads/<note id>.md` with the spot, status (`open`/`answered`/`done`), `waiting_on`,
  `team_only`, and replies from either side, which can carry photos and PDFs. Contract section
  "Threads" added. `groundwork-inbox` reads a note's thread with it (step 1) and drafts our reply
  on the thread for a yes, then sets status and waiting on (new step 3c).

## 0.14.0 (2026-11-03)
- **New core skill `shared-repo-sync`:** two Claude Code hooks for repos our team and the client
  both edit. A session start pulls from GitHub; the end of each reply warns about uncommitted or
  unpushed work. Synced into every workspace repo; turned on per repo in `.claude/settings.json`
  (the skill says how). `groundwork-setup` step 8 turns it on for new organizations.

## 0.13.0 (2026-10-17)
- **Decided and dropped** (app support shipped 2026-10-17): items take `status: decided` with a
  one-line `decided:` and `settled: <date>`, or `status: dropped`. Clients see a Decided page;
  dropped items vanish for them. `groundwork-inbox` step 5b proposes settling items, and offers it at
  the end of any working session.
- **Stale asks expire:** the app hides open asks untouched for 14 days from clients and flags them
  for the team (`keep: true` opts out). The inbox skill proposes a rewrite or drop.
- **The ask check** (`groundwork-outbox` 4b): show then ask, lead with a plan, one question of 20
  words or fewer, nothing loaded, an example when a blank page would stall them, nothing stale.

## 0.12.0 (2026-10-03)
- **One place for a client's brand:** `theme:` in `groundwork.yml` now styles their pages too (the
  app serves it to pages as `_theme.css`). Setup and outbox ask for the theme instead of a separate
  stylesheet; `_shared/brand.css` is only for optional extras (textures, logos).
- Starter page links `/deliverable.css`, `_theme.css`, then `_shared/brand.css`.

## 0.11.0 (2026-10-03)
- **Workspace theme** (app support shipped 2026-10-03): `theme:` in `groundwork.yml` gives a
  workspace the client's colors (light and dark) and Google Fonts. `groundwork-setup` adds it once
  the brand is known, with the same values as `_shared/brand.css`.

## 0.10.0 (2026-10-03)
- **Answers record what was open beside them** (app support shipped 2026-10-03): `viewing:`
  (`deliverable:<slug>`, `library:<doc>` or a web address) and, for a deliverable,
  `viewing_version:` (the commit of the page). `groundwork-inbox` reads that exact page before the
  answer.

## 0.9.0 (2026-10-03)
- **Every client gets a brand for their pages.** `groundwork-setup` asks for their branding
  (website, brand guide, colors, fonts) and builds `workspace/deliverables/_shared/brand.css`;
  `groundwork-outbox` checks for it before making any client page and stops to identify it if
  missing.
- **`deliverable-starter/`** in the `groundwork-outbox` skill: a brand file to fill in and a page to
  copy. Pages link Groundwork's neutral `/deliverable.css`, then the brand, so a page made before
  the brand exists looks clean and neutral rather than unstyled.

## 0.8.0 (2026-10-03)
- **Hosted deliverables** (app support shipped 2026-10-03). Pages for a client live in the workspace
  at `workspace/deliverables/<slug>/` (`index.html` + `deliverable.yml`), linked as
  `deliverable:<slug>`, and open beside the conversation on a computer. A client brand goes in
  `workspace/deliverables/_shared/brand.css`. The team can switch on a share link per page.
- `groundwork-outbox`: client pages are hosted deliverables now; the artifact sharing check only
  applies to Claude artifact links still in a workspace.
- The app is at **groundwork.chat**.

## 0.7.0 (2026-10-01)
- **New skill `groundwork-setup`**: walks a new organization from nothing to a working workspace
  (tools, private repo, `groundwork.yml`, folders, welcome and `CLAUDE.md`, the never-in-the-repo
  list, installing the GitHub App, requesting access, syncing skills, first project, the daily loop).
  Not synced into workspaces; install it once from this repo (see `GETTING-STARTED.md`).
- **`GETTING-STARTED.md`** for people new to Groundwork.
- Contract: `team:` entries written `Name <email>` give team access to that workspace only (the app
  supports this as of 2026-10-01, along with approving other organizations one at a time).

## 0.6.0 (2026-10-01)
- **Contract: asking several people** (app support shipped 2026-10-01). `ask: [Alex, Sam]` on an
  item, a topic or a project (items inherit from their topic, then project). Each person asked
  answers for themselves; the item moves to answered only when everyone has; answers stay hidden
  from someone asked until they've given theirs. Rounds move at each person's pace. Documented in
  `docs/REPO-CONTRACT.md`; `validate` checks the field's shape.
- No template changes.

## 0.5.0 (2026-09-30)
- **Contract: rounds and page lists** (app support shipped the same day). `round: N` on an item: a
  client sees one round per project at a time and the next opens when they finish. `sitemap:` on an
  item: an interactive page list (keep / not sure / cut, reorder, add, star 3); the answer carries a
  structured `sitemap:`. Both documented in `docs/REPO-CONTRACT.md`; `validate` checks them and
  warns when a round has more than 3 items.
- **`church-website` 0.2.0, rebuilt around rounds.** Round 1 confirms (generated, 3 at most); round 2
  the page list (`q-pages`) and three quick facts; rounds 3–5 links, the first-Sunday walk-through
  (split into three small items), logo and photos; rounds 6–7 a new **"The tools you use"**
  conversation (giving, people database, volunteers, calendar, email, sign-ups). The old 7-prompt
  request is now three items of 2–3 prompts. "Our Pastor and Team" is its own default page.
- New `page-questions.yml`: the rounds for each page a client keeps, plus the launch conversation,
  linked to question-bank ids. `church-website-discovery` gains "draft round 1" and "draft the page
  conversations".
- Question bank: 10 low-value questions cut (listed at the top of the file).

## 0.4.0 (2026-10-01)
- **Public release under the MIT license.** This repo is now published openly. All client names and
  client-specific examples were removed from templates, skills and docs; examples use `acme`, `Hope`
  and `Alex Rivera`. History starts fresh at this release.
- `docs/REPO-CONTRACT.md`: a published copy of the workspace file-format spec, so the skills can cite it.
- `messaging` template retitled "Messaging brand brief" (inspired by the StoryBrand framework, not
  affiliated); the ten brand-brief sections and the word list are now defined in its README.
- `scripts/check-denylist.mjs` and a CI step fail the build if a client-name pattern (repository secret)
  appears in any file, commit message or line ever added to history.
- Templates `church-website` and `messaging` are 0.1.1 (wording only).

## 0.3.1 (2026-10-01)
- `template-diff`: a release where only the template's version number moved is reported as
  "Nothing to adopt" (status `metadata-only`). The library-wide changelog prints once per range
  instead of under every project. No more comment lines mistaken for a title on `template.yml`.
  A release with no recorded template version reads "unversioned", not "?".

## 0.3.0 (2026-10-01)
- **Check template updates.** `groundwork-project` ships `scripts/template-diff.mjs`: for every project
  started from a template it compares the template as it was then with the template now (pinned
  version, `--to latest`, or any tag) and reports new, changed and removed files, the changelog in
  between, and bank question changes. It links changed template files to the workspace items they
  became and never edits the workspace. The skill says how to adopt changes safely.
- Items and topics started from a template now carry `template_item` / `template_topic`.
- `resolve-library.mjs` gains `--ref` and `--source` to fetch a specific version.

## 0.2.0 (2026-10-01)
- **Pins.** A workspace pins the library version it is on in `groundwork.yml` (`libraries:`). The sync
  script only moves a pinned repo with `--upgrade`, and `--pin` adds a pin. A release never reaches a
  client repo by accident.
- `groundwork-project` ships `scripts/resolve-library.mjs`: it returns a checkout at exactly the pinned
  ref (a sibling if it matches, else a cached clone) and never a different version.
- Projects started from a template record `from_template` and `template_library` in their frontmatter.
- `library.yml` gains `source: owner/repo`. The validator also syntax-checks every script.
- CI: `scripts/validate.mjs` (library-wide checks), `scripts/test-validate.mjs` (17 cases proving it fails
  when it should), `scripts/test-sync.mjs` (16 cases for the sync script), and a GitHub Actions workflow.
- Each template now carries its own `version` in `template.yml`, checked against `library.yml`.

## 0.1.0 (2026-10-01)
- First release. Moved here from the `groundwork` app repo.
- Templates: `church-website`, `messaging` (was the onboarding kit), `blank`.
- Skills: `groundwork-inbox`, `groundwork-outbox`, `groundwork-project`, `church-website-discovery`.
- `scripts/sync-skills.mjs` copies skills into workspace repos and refuses to overwrite local edits.
