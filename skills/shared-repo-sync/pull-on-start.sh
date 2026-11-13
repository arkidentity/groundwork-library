#!/bin/sh
# Shared repo: get the other person's work before starting.
if [ -n "$(git status --porcelain)" ]; then
  echo "Shared repo: there are uncommitted changes here, so I did not pull. Commit them, then pull before starting."
  exit 0
fi
if out=$(git pull --ff-only -q 2>&1); then
  echo "Shared repo: pulled the latest from GitHub."
else
  echo "Shared repo: could not pull from GitHub ($out). Tell the user before making changes."
fi
