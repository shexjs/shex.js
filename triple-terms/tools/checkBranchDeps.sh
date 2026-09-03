#!/bin/sh
# On main, the shex-test dependency must track shexSpec/shexTest#main
# (successor to tools/travisRepo.sh, which checked the same invariant in
# the retired .travis.yml).
if [ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] && \
   ! grep -q '"shex-test": "github:shexSpec/shexTest#main"' package.json
then
  printf 'ERROR in package.json: shex.js main should be testing against shexTest main\n' >&2
  exit 1
fi
