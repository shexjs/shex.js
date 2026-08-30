#!/bin/sh -e
# Fetch prebuilt webpack bundles into the working tree without running webpack.
#
# The bundles are gitignored on main; .github/workflows/webapps-site.yml
# rebuilds them on every push to main and publishes a complete webapps site
# (bundles included) to the `gh-pages` branch. This script copies that
# branch's doc/webpacks trees into the working tree (they stay untracked).
# (A deployment can also simply clone gh-pages itself and `git pull`.)
#
# Use it:
#  - on shex.io, after `git pull` of main (e.g. from cron or a post-merge hook):
#      git pull && tools/sync-webpacks.sh
#  - locally, when you want to try the webapps without building:
#      npm run webpacks-fetch
#
# To build locally instead: npm run webpacks-all
#
# Usage: tools/sync-webpacks.sh [remote]

remote=${1:-origin}
cd "$(dirname "$0")/.."

dirs="packages/shex-webapp/doc/webpacks packages/extension-map/doc/webpacks
      packages/extension-reduce/doc/webpacks"

# FETCH_HEAD works even in single-branch clones that track only main.
git fetch "$remote" gh-pages

# `git checkout <tree> -- <path>` also stages what it writes, so unstage after.
git checkout FETCH_HEAD -- $dirs
git reset -q -- $dirs

echo "webpacks synced from $remote's gh-pages branch:"
git log -1 --format='  %h %s' FETCH_HEAD
