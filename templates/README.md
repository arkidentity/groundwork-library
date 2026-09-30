# Project templates

A **project** is a body of work in a client's workspace (contract v3: `workspace/projects/<slug>.md`).
A **template** is a ready-made project: the project file, its conversations (topics) and their
items, plus the team-only scaffolding that goes with it. Saying **"start a <name> project"** in a
client repo runs the `groundwork-project` skill, which copies the template into `outbox/`, fills
the variables, renumbers ids, and waits for a yes before anything reaches the client.

| Template | Project it creates | What it is | Sold |
|---|---|---|---|
| [`church-website/`](church-website/) | Website | Information discovery for a church site: facts, flow, priorities. Also has the conversion strategy and a question bank. | Always, with a website job |
| [`messaging/`](messaging/) | Your message | Brand brief and voice: customer, problem, plan, proof, words. | The upsell |
| [`blank/`](blank/) | (yours) | An empty project with one conversation, for anything that has no template yet. | n/a |

## Anatomy of a template

```
<template>/
  template.yml      ← name, variables, the project defaults, team files, pairing rules
  project.md        ← becomes workspace/projects/<slug>.md
  topics/*.md       ← become workspace/topics/<slug>.md (get `project: <slug>` added)
  assigned/*.md     ← become workspace/assigned/<id>-<slug>.md (ids renumbered)
  (other files)     ← team-only scaffolding that template.yml maps into the repo
```

Rules the skill follows (they're also the contract's, see REPO-CONTRACT.md → Projects):
- **Topic slugs and item ids are workspace-wide.** On a clash, prefix the topic slug with the
  project slug and fix each item's `topic:`; ids take the next unused number.
- **Never copy a question that's already answered or already asked** in another project. Shared
  facts live once in `content/` and `messaging/`. `template.yml` `pairs_with` lists which templates
  overlap, and which items one covers for the other.
- **Sensitive things never become a written item** (see each template's README).
- **Drafts only.** Nothing is published without a yes.

## Adding a template
Make a folder with the anatomy above and a `template.yml`. Keep each item to 3 to 5 prompts that a
person can answer by talking. Use `{{variables}}` for anything church- or client-specific.
