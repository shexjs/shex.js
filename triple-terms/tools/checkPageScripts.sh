#!/bin/sh
# The web apps' page scripts (packages/*/doc/*.js) are compiled from
# src/app and src/plugin TypeScript but committed, because the pages load
# them as-is.  Rebuild them and fail if the committed copies are stale or
# a new one was never added.
cd "$(dirname "$0")/.." || exit 1
make -s page-scripts || exit 1
# Only the working tree's column: a rebuilt copy that matches what is staged
# is fine (before a commit), and in CI nothing is staged.
stale=$(git status --porcelain -- 'packages/*/doc/*.js' | grep -E '^(.[^ ]|\?\?)')
if [ -n "$stale" ]; then
  printf 'ERROR: page scripts differ from their TypeScript; run `make page-scripts` and commit:\n%s\n' "$stale" >&2
  exit 1
fi
