---
name: groundwork-site
description: Put Groundwork's Note button on a client's live website and get the team working the notes - add the client on groundwork.chat, add the one-line script tag (AI Studio, Lovable, Bolt, WordPress, Squarespace, Wix or Claude Code), check it landed with "Check this site", connect the site's GitHub repo, invite the client's people, send a test note, then work the notes in Claude. No terminal needed. Use when someone says "put Groundwork on a site", "add the Note button", "connect a client's website", "set up Groundwork for a built site", "the Note button isn't showing", "did the script tag work", "onboard a developer to Groundwork", or "how do we edit a site from the notes".
---

# Put Groundwork on a client's website

For an agency team connecting a site that is already built (or being built) so the client can tap a
spot and leave a note, and the team works those notes in Claude. About 15 minutes per client. **No
terminal.** One step at a time: say what to click and why in a line, then wait.

Who does what: the agency's **Owner or Admin** on groundwork.chat adds clients and connects GitHub.
A **developer** (anyone who edits the site) needs the plugin, the connector and the repo. A
**client** only opens a review link.

## 1. Add the client
groundwork.chat → **New client** → the client's name. They land on a **Set up** checklist. Every step
can be skipped and finished later.

## 2. Their website: add the Note button
Under **Their website** type the live address and **Add website** (add the preview address too, so
notes work before launch). Groundwork shows a one-line script tag that goes before `</body>` on
every page. How it gets there depends on how the site is built:

| Site built in | Do this |
|---|---|
| AI Studio (Go High Level's builder), Lovable, Bolt | Open **Instructions**, **Copy for your AI prompt**, paste it into the AI's chat. It adds the tag and names each section. Then publish. |
| Claude (a repo on the computer) | Give Claude the same prompt, then commit and push. |
| A Go High Level website or funnel (built in its page builder, not AI Studio) | Settings → Custom code or Tracking code → footer → paste the tag → save. |
| WordPress, Squarespace, Wix | The site-wide footer code box (steps are on the Instructions page). |

Sections get names (`data-section="Hero"`) so a note says where it was left. Visitors never see the
button; only people signed in through Groundwork do.

## 3. Check that it landed
Back in Groundwork click **Check this site** (under the script tag, and on setup step 2). It opens the
live site's home page and looks for the tag, then says one of: **seen**; **a tag for a different
site** (replace it); **not seen** (paste it, publish the site, check again); **couldn't check**
(login-protected, or the tag is added by JavaScript: send a test note instead).
A site that isn't published yet will read "not seen": a pasted tag in AI Studio or a builder isn't
live until it's published.

## 4. Where the code lives: connect GitHub
**Where the code lives** → **Connect GitHub** → choose the organization → **Only select
repositories** → the site's repo → Install. This copies every note (with photos and replies) into
`groundwork/inbox/` in that repo so Claude can read them. A site built only in a page builder (Wix, Squarespace, a Go High Level funnel) has no
repo: skip this step; the team works from Groundwork itself. Groundwork only writes inside a
`groundwork/` folder, and only to repos you pick.

## 5. Invite the client's people
**Invite people** → name and email for each person who should give feedback. They sign in with an
email link, no password.

## 6. Try it
**Review this site** opens the site with the Note button on (signed in for 30 days). Tap Note, tap a
spot, write a test note, add a photo, send. It shows in the inbox on groundwork.chat and, with GitHub
connected, as a file in `groundwork/inbox/`. **Invite to review** sends the client the same link.

## 7. Get a developer working
Each developer, once:
1. **Plugin:** Claude desktop → Settings → Customize → Plugins → Upload `groundwork.zip` (from the
   library's latest GitHub release). Turn **groundwork** on.
2. **Connector:** the agency Owner adds it **once for the whole organization**: Organization
   settings → Connectors → Add → Custom → Web, name Groundwork, address
   `https://groundwork.chat/api/mcp`, sign-in **Sign in now**, **Claude's published identity**, no
   headers. Each person then clicks **Connect** and signs in with the emailed 6-digit code. Set
   Reply and Set status to **Needs approval**. (Use `groundwork-connect` for any screen that
   confuses them.)
3. **Repo:** the Owner gives them **Write** access on GitHub. In GitHub Desktop: File → Clone
   repository. In Claude desktop's **Code** tab, open that folder.

## 8. Working the notes
In the repo, in Claude: **"Work through the new Groundwork notes."** (`groundwork-inbox` does it.)
Pull first. Claude reads each note with its page, section and photos, proposes the change, drafts the
reply, and waits for a yes. Then push. **A push is not a publish on every host:** a site in AI Studio
(Go High Level's builder) may need publishing before the client sees it. Claude asks "is this live?" before
saying it's fixed; then mark the note **Done** (or reply) so the client sees it on their spot.

## Check once before a client is invited
- **Does the host keep a push?** Make one small edit through Claude, push it, and confirm the live
  site shows it and a later edit in the builder doesn't overwrite it. If a builder overwrites repo
  changes, say so: edit in one place only.
- **Do both sides see it?** The test note shows in the inbox, in the repo, and the reply reaches the
  client's spot.

## Who sees what
Client's people see their own notes and the team's replies. The team sees every note for every client
it has. A site's visitors see nothing.

## Checklist per client
- [ ] Client added
- [ ] Tag on every page, sections named, **Check this site** says seen
- [ ] Repo connected (or skipped on purpose)
- [ ] Client's people invited
- [ ] Test note seen in Groundwork (and the repo)
- [ ] Developer has plugin, connector and repo; one edit made end to end
- [ ] Review link sent to the client
