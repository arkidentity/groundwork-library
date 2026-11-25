---
name: groundwork-guides
description: Work in Groundwork (groundwork.chat) through its connector - the notes clients and teammates leave on live sites and pages, replies, the next questions to ask a client, branded pages (including pages with questions on them), putting the Note button on a client's website, capturing a client's brand, and starting projects from templates. This skill only points to the right guide, because Groundwork serves the current guide for each job. Use when someone says "process the inbox", "what did [client] send", "anything new in Groundwork", "reply to the note", "make a Groundwork page", "make a branded page", "make a how-to page", "add a question to the page", "put the Note button on [client]'s site", "did the script tag work", "capture [client]'s brand", "start a project for [client]", "what should we ask [client]", or anything about Groundwork notes, pages, clients or workspaces.
---

# Groundwork

Groundwork's workflows are served by its connector and kept current on the server, so this skill
stays short on purpose. **Do not work from memory: fetch the guide and follow it.**

## 1. Is the connector connected?
If the Groundwork tools aren't available to you (`list_workspaces`, `get_guide`, ...), use the
`groundwork-connect` skill to get the person connected, then come back. Don't ask for a sign-in
code or key in chat.

Once connected, call `list_workspaces` (pass `plugin_version`: the `version` in
`../../.claude-plugin/plugin.json` next to this skill's folder). If the result starts with
**UPDATE AVAILABLE**, tell the person in one line, then carry on.

## 2. Pick the job, fetch its guide, follow it
Call `get_guide` with the topic:

| The job | Topic |
|---|---|
| Process notes, read what a client sent, mark things done | `inbox` (with `replies`) |
| Choose and word the next questions for a client | `outbox` |
| Make a branded page, with or without questions on it | `pages` |
| Put the Note button on a client's website; get a developer working | `site-setup` |
| Notes and changes while a project's repo is open | `repo-work` |
| Capture a client's brand for their pages | `brand` |
| A quick read-only look at what's waiting | `whats-waiting` |

The connector also offers ready-made starts (prompts): `process_inbox`, `whats_waiting`, `make_page`,
`setup_site`. Starting a project from a template: `list_templates`, then `get_template`.

Helpful tools: `get_workspace` (a client's name, sites, people, repo, pages), `check_site` (is the Note
script on the live site), `get_page_starter` (starting files for a page), `list_questions`.

## 3. Rules that never change
- **Nothing reaches a client without the person's yes.** Show the exact words or page first.
- **The guide wins.** If this skill and a guide ever disagree, follow the guide. If `get_guide` fails,
  say so; don't improvise a different process.
- **Never put a client's or a person's private details into anything public.**
- A repo that has its own `groundwork.yml` and `.claude/skills/groundwork-*` folders is an older
  file-based workspace: use those skills there.
