# Changelog

Semver. **Patch:** wording and fixes. **Minor:** new templates, new questions, new skills, new
optional fields. **Major:** anything that changes ids, file layout, or the contract version a
workspace needs. Templates only affect projects started after a release; existing projects are
updated on purpose (see README, "Updating an old project").

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
