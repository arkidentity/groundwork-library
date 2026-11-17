---
name: shared-repo-sync
description: Keep a repo that several people edit in sync — Claude Code pulls from GitHub when a session starts and warns about uncommitted or unpushed work when it finishes. Use when someone says "set up the pull/push hooks", "turn on shared repo sync", "remind us to pull and push", when setting up a new workspace repo, or when a shared repo has .claude/skills/shared-repo-sync but no hooks in .claude/settings.json.
---

# Shared repo sync

Workspace repos are shared: our team and the client both work in them. The rule is **pull before
you start, push when you're done.** This skill turns that rule into two Claude Code hooks, so nobody
has to remember it.

| Hook | When | What it does |
|---|---|---|
| `pull-on-start.sh` | A Claude Code session starts | Pulls from GitHub (fast-forward only). If there are uncommitted changes it doesn't pull, and says so. If the pull fails, Claude is told to warn the person before changing anything. |
| `remind-push.sh` | Claude finishes a reply | If anything is uncommitted or not pushed, shows the person a one-line reminder. Silent when clean. |

The scripts sync into every workspace repo with the other core skills. The hooks only run once the
repo's `.claude/settings.json` points at them.

## Turning it on in a repo

1. Read `.claude/settings.json` if it exists. Keep everything in it.
2. Add these two entries under `hooks` (merge into existing `SessionStart` / `Stop` arrays; don't
   add them twice):
   ```json
   {
     "hooks": {
       "SessionStart": [
         { "hooks": [ { "type": "command", "command": "sh \"$CLAUDE_PROJECT_DIR/.claude/skills/shared-repo-sync/pull-on-start.sh\"" } ] }
       ],
       "Stop": [
         { "hooks": [ { "type": "command", "command": "sh \"$CLAUDE_PROJECT_DIR/.claude/skills/shared-repo-sync/remind-push.sh\"" } ] }
       ]
     }
   }
   ```
3. Make sure `.gitattributes` has `*.sh text eol=lf`, so the scripts run on Windows too.
4. Commit and push. Tell the person: the first time anyone opens the repo in Claude Code, it asks
   them to approve the hooks. That's expected.

## Limits
- Hooks only run in Claude Code. Someone who edits files and syncs with GitHub Desktop alone gets no
  reminder; show them Desktop's **Pull origin** button and its "behind" count.
- The pull is fast-forward only. When both people changed the same thing, it stops and says so
  rather than merging. Help the person resolve it.
