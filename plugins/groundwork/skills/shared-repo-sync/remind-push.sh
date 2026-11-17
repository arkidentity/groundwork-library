#!/bin/sh
# Shared repo: remind whoever is working to commit and push before they leave.
dirty=$(git status --porcelain | wc -l | tr -d ' ')
ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 0)
if [ "$dirty" -gt 0 ] || [ "$ahead" -gt 0 ]; then
  echo "{\"systemMessage\": \"Shared repo: $dirty uncommitted file(s), $ahead commit(s) not pushed. Commit and push before you finish so the others get it.\"}"
fi
