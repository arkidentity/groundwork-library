# Groundwork

Core Groundwork skills: connect Claude to Groundwork, file client notes (inbox), prepare questions and branded pages (outbox), put the Note button on a client site, start projects, capture a client brand, and keep the shared repo in sync.

Groundwork (https://groundwork.chat) is where an agency's clients and teammates leave notes right on
a live site or page, answer questions, and see what's been settled. These skills teach Claude to
work with that: read and file the notes, draft replies for you to approve, prepare the next
questions, and keep the project's repository in step.

## Skills

- **groundwork-inbox**: Process a Groundwork inbox — read what a client or reviewer sent (page notes, answers to questions, messages), file clean notes into the project's repo, pull out decisions and open questions, draft…
- **groundwork-outbox**: Start onboarding a new messaging/marketing client, or prepare what goes out to a Groundwork client — read the client's project repo (open questions, recent logs, specs, shared pages), work out what…
- **groundwork-project**: Create a project in a Groundwork client workspace from a template (or blank) — copy the template's project file, conversations and items into outbox/, fill the variables, renumber ids, avoid…
- **shared-repo-sync**: Keep a repo that several people edit in sync — Claude Code pulls from GitHub when a session starts and warns about uncommitted or unpushed work when it finishes. Use when someone says "set up the…
- **groundwork-brand-capture**: Capture a client's brand from their live website and turn it into the shared stylesheet their Groundwork pages use, so every branded page looks like the client's own site. Use when onboarding a new…
- **groundwork-connect**: Help someone connect Claude to Groundwork (the Groundwork connector at https://groundwork.chat/api/mcp) and answer every question on the way - which sign-in and OAuth options to pick, what to put…
- **groundwork-site**: Put Groundwork's Note button on a client's live website and get the team working the notes - add the client on groundwork.chat, add the one-line script tag (AI Studio, Lovable, Bolt, WordPress,…

## What it runs, sends and fetches

- **The Groundwork connector** (https://groundwork.chat/api/mcp), when you've connected it, to list
  and read notes, reply, and set a note's status. Nothing is sent to a client without your yes in
  the chat. The skills pass their own version so Groundwork can tell you when an update is out.
- **Files in your own repositories**: notes, decisions and drafts are written into the project
  repository you're working in, and committed only when you ask.
- **shared-repo-sync** can set up two optional hooks in a repository you choose: `git pull` when a
  session starts, and a reminder to push when it ends. They run only after you ask for them.
- **groundwork-project** reads this library's templates from GitHub
  (https://github.com/arkidentity/groundwork-library) at the version your workspace pins.
- **groundwork-brand-capture** fetches a client's public website to read its colors, fonts and logo.

No data is sent anywhere else.

## Get started

Ask Claude "help me connect Groundwork", or see https://groundwork.chat.

## License

MIT. See LICENSE.
