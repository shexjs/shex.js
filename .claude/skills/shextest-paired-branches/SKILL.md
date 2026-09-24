---
name: shextest-paired-branches
description: Change shex.js together with the shexTest conformance corpus — adding or changing shexTest schemas/validation tests, generating shex.js .val reference results, keeping a shex.js branch and a same-named shexTest branch in step, pointing CI at the shexTest branch, and merging the pair in the right order. Use whenever a shex.js change needs new or changed shexTest tests, or a shexTest PR needs shex.js reference results.
---

# Paired shex.js / shexTest branches

[shexTest](https://github.com/shexSpec/shexTest) is the ShEx conformance
corpus; shex.js runs it in its test suite. A change that needs new or changed
tests lives on **two branches with the same name**, one in each repo, and
they land together.

## Layout and corpus resolution

shex.js finds the corpus with `packages/shex-cli/test/findPath.js`. It tries,
relative to the shex.js checkout:

1. `$TESTSDIR`, when set
2. `../shexTest`
3. `../../shexTest`
4. `../../shexSpec/shexTest`
5. the `shex-test` devDependency in `node_modules`

So the tests run against **whatever branch your shexTest checkout has checked
out**. Check that before you trust a result. If `Validation-test.js` prints
`did not use N val files` and its test count drops, you are probably on the
wrong corpus.

To check a shex.js branch against shexTest `main` without switching your
checkout, use a worktree:

```sh
git -C ../shexTest worktree add /tmp/shexTest-main origin/main
TESTSDIR=/tmp/shexTest-main npm test
git -C ../shexTest worktree remove /tmp/shexTest-main
```

## The workflow

1. **Branch both repos** from their `main`s with the same name.
2. **Change shexTest**: add the schema/data files and manifest entries (see
   [Adding tests](#adding-tests-to-shextest)). Regenerate the JSON-LD
   manifests (shexTest CI fails with `manifest.jsonld is stale` otherwise):
   ```sh
   (cd schemas && ../bin/genJSON.js manifest.ttl > manifest.jsonld)
   (cd validation && ../bin/genJSON.js manifest.ttl > manifest.jsonld)
   ```
   Do the same for `schemas-contrib/` and `validation-contrib/` if you touched them.
3. **Change shex.js** and generate `.val` reference results for every new
   passing validation test (see [.val files](#val-reference-results)).
4. **Point shex.js CI at the shexTest branch.** CI clones shexTest at the ref
   named by the `shex-test` devDependency in the root `package.json`
   (`.github/workflows/ci.yml` extracts it with `sed`):
   ```sh
   npm install --save-dev "shex-test@github:shexSpec/shexTest#<branch>"
   ```
   This changes only `package.json` and the lockfile's `resolved` hash.
   Commit it on the shex.js branch.
5. **Run the full suite** (`npm test`) against the shexTest branch. Also run
   it against shexTest `main`, and note any failures that only the shexTest
   branch fixes. Say so in the PR descriptions.
6. **Open both PRs.** Cross-link them and state the merge order.
7. **Point shex.js back at shexTest main before merging it.**
   `npm run check-branch-deps` (`tools/checkBranchDeps.sh`, run by the
   pre-commit hook and by CI) fails on `main` unless the dependency is
   `github:shexSpec/shexTest#main`. So merging while the dependency names the
   branch turns `main` red. Make this the shex.js PR's last commit:
   ```sh
   npm install --save-dev "shex-test@github:shexSpec/shexTest#main"
   ```
   From then on, the PR's CI runs against shexTest `main`. Only failures you
   already noted in step 5 are acceptable.
8. **Merge shex.js first, then shexTest right away.** shex.js's `.val` files
   have to be in place before the shexTest tests that need them. Until the
   shexTest PR merges, shex.js `main` shows the step-5 failures, so keep that
   gap short. Both repos use merge commits, not squash.

## Adding tests to shexTest

- **`schemas/` representation test**: three files, `NAME.shex` (ShExC),
  `NAME.json` (ShExJ) and `NAME.ttl` (ShExR), plus a manifest entry. That's
  both the `mf:entries` list and a `sht:RepresentationTest` body in
  `schemas/manifest.ttl`. Generate the other two from the ShExC with
  shex.js's CLI:
  ```sh
  node packages/shex-cli/bin/shex-to-json   -x NAME.shex > NAME.json   # add "@context" to match the corpus
  node packages/shex-cli/bin/shex-to-turtle -x NAME.shex > NAME.ttl
  ```
  Check one entry with
  `TESTS=NAME npx mocha packages/shex-cli/test/Parser-Writer-test.js`.
- **`negativeSyntax/`, `negativeStructure/`**: one `.shex` plus a manifest
  entry. The harness matches the error message: `Parse error` or
  `Structural error`. **Never run `make` in these directories.** Their
  Makefiles regenerate `manifest.ttl` from the directory listing and drop the
  hand-written error-location brackets.
- **`validation/`**: a manifest entry that points at `../schemas/X.shex` and a
  `validation/*.ttl` data file. `sht:ValidationFailure` needs nothing more.
  `sht:ValidationTest` (a pass) needs a shex.js `.val`.
- **`*-contrib/`**: for tests that are useful across implementations but
  that the spec doesn't define (repairs, feasibility). The runner is
  `packages/shex-validator/test/ValidationContrib-test.js`. It checks
  pass/fail and traits only, with no `.val`.
- **Traits** (`sht:` terms) are an open vocabulary. Coin new ones freely.

## `.val` reference results

These live in `packages/shex-validator/test/val/`. Each file is mapped from a
test id in `test-result-map.json`. Without a mapping, a passing test fails with
`has no reference result`.

1. Add `"#TESTID": "TESTID.val"` to `test-result-map.json`, next to its
   siblings.
2. Create the file with the placeholder `{}` (REGEN only rewrites mapped,
   existing files).
3. Generate the file's contents from today's validator:
   ```sh
   REGEN=1 TESTS='<regex over test ids>' npx mocha packages/shex-validator/test/Validation-test.js
   ```
4. Run the same command without `REGEN` to confirm the result is stable.
5. **Review the diff.** REGEN also rewrites existing files whose content
   hasn't changed: pretty-printing and key order only. `git checkout` those
   back so the diff shows only real changes.

Gotchas:

- **Case-insensitive filesystems** (macOS, Windows): `X_passLAtFR.val` and
  `X_passLAtfr.val` are the same file. Map test ids that differ only in case
  to one shared file (only if the results really are identical, which step 4
  confirms).
- **Renamed test ids**: if the shexTest branch renames a test, keep the old id
  mapped too, so shex.js still passes against shexTest `main` until the
  shexTest PR merges.

## Stacked PRs

When several paired changes are stacked, merge from the bottom of the stack
up. Before merging each PR, retarget the next one to `main`
(`gh pr edit N --base main`), so deleting the merged branch can't close the
PR that sits on it. Afterwards, delete the merged branches. `git branch -d`
refuses branches that aren't fully merged, which makes it a useful check.

## Notes

- shex.js has a pre-commit hook that runs the whole test suite (about a
  minute).
- Build outputs under `packages/*/lib/*.js` are gitignored. After editing the
  TypeScript (`src/*.ts`), run `npx tsc` in that package. After editing
  `packages/shex-parser/lib/ShExJison.jison`, run `npm run parser` in
  `packages/shex-parser`.
- **Those builds survive `git checkout`**, and so does the shexTest branch.
  After switching shex.js branches, rebuild the packages whose sources
  differ, and check which shexTest branch the tests will see. Otherwise the
  pre-commit hook tests a mix of code and corpus from different branches,
  and fails for reasons that have nothing to do with your change. For a
  commit unrelated to the pairing, set `TESTSDIR` to a shexTest `main`
  worktree (see above) so the hook sees a matching corpus.
