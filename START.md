# Start here: using Groundwork with Claude

This guide is for **joining a team that already uses Groundwork**, for example someone just added
you to a project on groundwork.chat. Starting Groundwork for a new organization from scratch is a
different job: see [GETTING-STARTED.md](GETTING-STARTED.md).

You need the **Claude desktop app**. GitHub is only needed if you'll work in a project's repo.

You don't need to download this library. The plugin is one file, `groundwork.zip` (step 1).

## The pieces

| Piece | What it does | Do you need it? |
|---|---|---|
| **The groundwork plugin** | Teaches Claude Groundwork's jobs: process the inbox, make branded pages, capture a brand, start projects | Yes |
| **The Groundwork connector** | A live link from Claude to groundwork.chat: read notes, reply, mark them done | If you'll answer notes from Claude |
| **Your project's repo** | Where the project's pages and notes live as files | If you'll make pages or work in files |

The plugin and the connector are separate, and the order doesn't matter.

## 1. Add the plugin

**From Claude desktop (no terminal):**
1. Download **groundwork.zip** from the latest release:
   https://github.com/arkidentity/groundwork-library/releases/latest/download/groundwork.zip
   Don't unzip it.
2. Claude desktop → **Settings → Customize → Plugins → Upload**, and choose `groundwork.zip`.
3. Make sure **groundwork** is turned on.

**Or from a terminal** (this route updates itself on every release):
1. Install the Claude Code command-line tool:
   - Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`
   - Mac: `curl -fsSL https://claude.ai/install.sh | bash`
2. Run `claude plugin install groundwork@groundwork-library`.
   - On Windows, if `claude` isn't recognized, the installer put it in a folder that isn't on your
     PATH. Use the full path instead:
     `& "$env:USERPROFILE\.local\bin\claude.exe" plugin install groundwork@groundwork-library`

## 2. Connect Groundwork (optional)

1. Sign in at https://groundwork.chat → **Team → Connect Claude Code** → name this computer →
   **Make a key**.
2. Add it the way that page shows. The key belongs to you and this one computer. Never paste it
   into a file or a repo.

## 3. Get your project's repo (if you'll work in files)

1. Ask whoever runs the project to invite your GitHub account to the repo, with **Write** access if
   you'll make pages.
2. In GitHub Desktop: **File → Clone repository**, and pick it.
3. In Claude desktop's **Code** tab, open that folder.

## 4. Check it works

Start a **new** session in the Code tab and ask:
1. *"List your groundwork skills."* Claude should name five: groundwork-inbox, groundwork-outbox,
   groundwork-project, groundwork-brand-capture and shared-repo-sync.
2. In your project's repo: *"Make a Groundwork page about [something small]."* After you push, it
   should show on the project's Home in groundwork.chat within about a minute.

## Updating

- **Installed from a terminal:** updates arrive by themselves.
- **Uploaded the zip:** download `groundwork.zip` again from the link above and upload it again.
  Check which version you have by asking Claude *"which groundwork plugin version do you have?"* The
  newest is on the [releases page](https://github.com/arkidentity/groundwork-library/releases/latest).
