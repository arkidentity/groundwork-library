---
name: groundwork-connect
description: Help someone connect Claude to Groundwork (the Groundwork connector at https://groundwork.chat/api/mcp) and answer every question on the way - which sign-in and OAuth options to pick, what to put in headers, which tool permissions to allow, the emailed code, adding it for a whole organization, the terminal route, and what to do when it doesn't work. Use when someone says "connect Groundwork", "add the Groundwork connector", "set up Groundwork in Claude", "which option do I pick", "what do I do for permissions", "I didn't get the code", "the Groundwork tools aren't showing", "add Groundwork for my whole team", or asks how Claude reads their Groundwork notes.
---

# Connect Claude to Groundwork

The Groundwork connector lets Claude read a team's notes (with their photos), reply as that person,
and mark notes done. It reaches only the workspaces where the signed-in person is **team**; client
people can't connect.

Walk the person through **one screen at a time**. Say exactly what to click and why in one line. Never
ask them to paste a sign-in code, key or token into the chat, and never write one into a file.

## 0. Is it already connected?

If Groundwork tools are available to you (`list_workspaces`, `list_notes`, ...), call
`list_workspaces` (with `plugin_version`: the `version` in `../../.claude-plugin/plugin.json` next to
this skill's folder) and tell them it works and which workspaces they can see. If the result starts
with UPDATE AVAILABLE, tell them that too. Done.

If not, ask which they use, then go to that section:
- **Claude desktop, claude.ai or the mobile app** → section 1 (most people).
- **Claude Code in a terminal** → section 3.
- **They're the Owner of a Claude Team or Enterprise plan and want it for everyone** → section 4.

## 1. Add it in Claude (desktop, claude.ai, mobile)

1. **Settings → Connectors → Add custom connector.** (If their organization's Owner already added
   it, Groundwork is already in that list: they just click **Connect** and skip to step 5.)
2. **Name:** `Groundwork`. **URL:** `https://groundwork.chat/api/mcp`, exactly, no slash at the end.
3. **Authentication: Sign in now.** Every Groundwork tool needs an account, so sign in up front.
   Not "Sign in when needed" (nothing works without an account) and not "No sign-in".
4. **OAuth client: Use Claude's published identity** (it shows "Detected"). Groundwork supports it,
   so there's nothing to set up. "Register automatically" also works but leaves a registration
   behind for every connection; "Use your own OAuth client" isn't needed.
5. **Request headers: leave empty.** Signing in replaces keys. Never paste a `gwk_` key here.
6. Click **Add / Connect**. A browser page from groundwork.chat opens:
   - Type the email they use on Groundwork → **Email me a code**.
   - Type the **6-digit code** from the email **on that same page** (it lasts 10 minutes).
   - Click **Allow**. If they're already signed in to groundwork.chat in that browser, it goes
     straight to Allow.
7. Back in Claude, the connector shows **Disconnect** and its tools. Go to section 2.

## 2. Tool permissions (the screen after connecting)

| Tool | Set to | Why |
|---|---|---|
| Get note, Get photo, List notes, List workspaces | **Always allow** | They only read. Asking every time just slows Claude down. |
| Reply, Set status | **Needs approval** | A reply shows on the client's pin and can send them an email or Slack message; a status change shows too. Approving lets them read it first. |

In Auto mode Claude may act without asking even on "Needs approval"; the approval only holds in
Manual mode. Then have them try it: *"What notes are waiting in Groundwork?"*

## 3. Claude Code in a terminal

```
claude mcp add --transport http --scope user groundwork https://groundwork.chat/api/mcp
```
Then type `/mcp` in Claude Code, pick groundwork, choose **Authenticate**, and sign in in the browser
that opens (same email + code + Allow as above).

**A computer that can't open a browser to sign in** (a server, a remote box): make a key instead at
groundwork.chat → **Team → Connect Claude** → name the computer → **Make a key**, and run the command
that page shows. A key belongs to one person and one computer.

## 4. For a whole organization (Owner of a Claude Team or Enterprise plan)

- Adding it under your own Settings connects **only you**. Nobody else sees it.
- For everyone: **Organization settings → Connectors → Add → Custom → Web**, URL
  `https://groundwork.chat/api/mcp`, same choices as section 1 (Sign in now, Claude's published
  identity, no headers).
- Then each member clicks **Connect** next to Groundwork in their own Settings → Connectors and signs
  in **as themselves**. Each sees only their own workspaces; people who aren't team in Groundwork get
  nothing.
- A connector's sign-in settings **can't be changed** after it's added for the organization; changing
  them means removing it, adding it again, and everyone reconnecting. So get section 1 working for one
  person first.
- If the Owner also added it personally, they'll see Groundwork twice. Disconnect and remove the
  personal one.

## 5. When it doesn't work

| What they see | What to do |
|---|---|
| No code email | Check spam. Codes only go to people who are **team** on a Groundwork workspace, at most 3 per email every 15 minutes. If it's still missing, make a key (section 3) or ask whoever runs their Groundwork team to check they're added. |
| "That code didn't work" | Codes last 10 minutes and allow 5 tries. Send a new one and use the newest email. |
| "Groundwork's Claude connector is for team members" | They're a client on that workspace, not team. Client people leave notes on the site instead. |
| "Can't connect" / "doesn't recognise the app" | The sign-in page was opened from an old tab or bookmark. Start again from Claude's Connect button. |
| "This sign-in expired" | They took over 15 minutes. Start again from Claude. |
| Connected, but no Groundwork tools in a chat | Start a new chat, and check Groundwork is switched on in that chat's tools/connectors menu. |
| Worked before, now asks to sign in again | Normal after 90 days unused, or if the connection was turned off. Click Connect again. |

**Turning it off:** groundwork.chat → **Team → Connect Claude** lists every connected Claude account
and key, each with **Turn off**. It stops working on Claude's next request.
