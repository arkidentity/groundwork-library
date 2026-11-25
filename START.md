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

**From Claude (desktop, claude.ai or mobile), no key:**
1. Claude → **Settings → Connectors → Add custom connector**. Name it Groundwork and paste
   `https://groundwork.chat/api/mcp`.
2. Leave sign-in on **Sign in now** and **Use Claude's published identity**, and add no headers.
3. Click **Connect**, sign in to Groundwork with the 6-digit code it emails you, and click **Allow**.

It follows your Claude account, so you do this once, not per computer. You can turn it off at
groundwork.chat → **Team → Connect Claude**. If your organization's Owner already added it for
everyone, just click **Connect** next to Groundwork in Settings → Connectors.

With the plugin added, you can also just ask Claude: *"Help me connect Groundwork."* It walks you
through each screen.

### Questions you'll hit while connecting

| Screen | Pick | Why |
|---|---|---|
| Authentication | **Sign in now** | Every Groundwork tool needs an account. |
| OAuth client | **Use Claude's published identity** (shows "Detected") | Groundwork supports it; nothing to set up. |
| Request headers | **Leave empty** | Signing in replaces keys. Never paste a key here. |
| Tool permissions: Get note, Get photo, List notes, List workspaces | **Always allow** | They only read. |
| Tool permissions: Reply, Set status | **Needs approval** | Clients see replies (and may get an email or Slack message), so read them first. |

- **Adding it for your whole organization?** Adding it under your own Settings connects only you,
  even if you're the Owner. For everyone, the Owner uses Organization settings → Connectors → Add →
  Custom → Web with the same choices. Each person then clicks Connect and signs in as themselves.
  Its sign-in settings can't be changed afterwards, so get it working for one person first.
- **No code email?** Check spam. Codes only go to people who are team on a Groundwork workspace, at
  most 3 per 15 minutes, and last 10 minutes. Type the code on the same page that asked for it.
- **"Connector is for team members"?** You're a client on that workspace. Clients leave notes on
  the site instead.
- **A project is missing from Claude (or you can't see it in Groundwork)?** Team members are given
  projects one by one. If you're set to **Only these clients**, a new project doesn't show for you until an owner or
  admin ticks it: groundwork.chat → menu → **Team members** → **Edit** next to your name. Choosing **All clients** shows
  every project, including ones started later. It takes effect within about a minute, with no refresh or
  reconnect needed in Claude. A project's creator is added to it automatically. Nobody else is.
- **Connected, but the wrong projects (or none) show?** Claude acts as the email you typed at the Allow step,
  not your Claude login. If that email isn't on the team for a project, the project won't appear. Open
  groundwork.chat → **Connect Claude** → **Turn off** the old connection, remove and add the connector again,
  and sign in with the email that is on the team.
- **Marked a note done in the repo but it's still open?** Status lives in Groundwork, not in the repo's copy.
  Mark it done in Groundwork, or through Claude (the project must be in your list).
- **The Note button doesn't show after you sign in on a site?** The sign-in link opens the first address on
  the project's website list and only signs you in there. If the site's home page redirects without keeping
  the `?gw=` part of the address, the sign-in is lost. Ask the site's developer to pass it through. See Help →
  Troubleshooting at groundwork.chat/help.

**Or from a terminal (Claude Code):** run
`claude mcp add --transport http --scope user groundwork https://groundwork.chat/api/mcp`, then type
`/mcp` in Claude Code and choose Authenticate. On a computer that can't sign in through a browser,
make a key instead at groundwork.chat → **Team → Connect Claude**. A key belongs to you and that one
computer; never paste it into a file or a repo.

## 3. Get your project's repo (if you'll work in files)

1. Ask whoever runs the project to invite your GitHub account to the repo, with **Write** access if
   you'll make pages.
2. In GitHub Desktop: **File → Clone repository**, and pick it.
3. In Claude desktop's **Code** tab, open that folder.

## 4. Check it works

Start a **new** session in the Code tab and ask:
1. *"List your groundwork skills."* Claude should name two: groundwork-guides and groundwork-connect.
   The workflows themselves come from the connector's guides (groundwork.chat → Guides), so there's
   nothing else to install and they stay current.
2. In your project's repo: *"Make a Groundwork page about [something small]."* After you push, it
   should show on the project's Home in groundwork.chat within about a minute.

## Updating

- **Installed from a terminal:** updates arrive by themselves.
- **Uploaded the zip:** download `groundwork.zip` again from the link above and upload it again.
  Check which version you have by asking Claude *"which groundwork plugin version do you have?"* The
  newest is on the [releases page](https://github.com/arkidentity/groundwork-library/releases/latest).
