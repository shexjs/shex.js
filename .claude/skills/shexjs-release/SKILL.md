---
name: shexjs-release
description: Release shex.js packages to npm and maintain its dependencies — bumping versions, cutting a v* tag, the CI publish workflow (publish-ordered.js, OIDC trusted publishing), diagnosing a failed Release run (EUSAGE lock drift, ENEEDAUTH for a new package, E403, E422 provenance), resuming a half-finished publish, subset releases of the independent packages, keeping READMEs release-ready, and handling Dependabot PRs (auto-merge, ignored majors such as TypeScript 7). Use whenever publishing, tagging, bumping versions, or deciding whether to take a dependency bump.
---

# Releasing shex.js and maintaining its dependencies

The repo is an npm-workspaces monorepo (`packages/*`); lerna is no longer
used. The root `shex-root` package is private and its own `version` is not
maintained. `packages/shex-vscode` is private too. Every other package is
public (`publishConfig.access: public`).

## Version lines

- Most packages share one version line (`1.0.0-alpha.NN`).
- The packages listed under `shexjs.independent` in the root `package.json`
  (`@shexjs/term`, `shape-map`) have their own version lines.
  `tools/bumpVersions.js` leaves their versions alone, and also the ranges
  that point at them.
- Alphas are published to the `latest` dist-tag. npm 11+ refuses a prerelease
  that has no `--tag`, so `publish-ordered.js` requires one.

## Cutting a release

Publishing happens **in CI, not locally**. The root README's "publishing"
section has the same steps.

```sh
node tools/bumpVersions.js --dry-run 1.0.0-alpha.NN   # preview
node tools/bumpVersions.js 1.0.0-alpha.NN             # versions + cross-workspace ^ranges
npx -y npm@latest install --package-lock-only         # sync the lock under the strictest npm
npx -y npm@latest ci --dry-run --allow-git=all        # what the release job will run
git add -u && git commit -m "chore(release): 1.0.0-alpha.NN"   # the pre-commit hook runs lint + test
git tag -a v1.0.0-alpha.NN -m "1.0.0-alpha.NN"
git push origin main --follow-tags
```

`.github/workflows/release.yml` runs on any pushed `v*` tag. It uses Node 24,
runs `npm install -g npm@latest` (OIDC needs npm >= 11.5.1), then
`npm ci --allow-git=all`, then `node tools/publish-ordered.js --tag latest`.
Keep `--allow-git=all`: the lock has the `shex-test` git dependency.

**The tag only triggers the run.** Each package publishes the `version` in its
own `package.json`. `publish-ordered.js` publishes every non-private workspace
package after the workspace packages it depends on, and **skips any version
the registry already has**. Useful consequences:

- **Subset release**: bump only the packages you want (for example, just
  `@shexjs/term`) and push any unused `v*` tag, such as
  `v1.0.0-alpha.29-term`. Everything else gets skipped.
- **Resume**: a run that dies partway can be rerun. Packages that were already
  published get skipped.
- Use `node tools/publish-ordered.js --list` to see the order and
  `--dry-run` to rehearse it. `packages/shex/test/PublishOrder-test.js`
  covers the ordering.

If you move a tag after a failed run, the force-push starts a **new** run, so
watch that one. Rerunning the old run fails because the tag no longer points
at the commit it expects.

## When the Release run fails

Check with `gh run list --workflow release.yml` and `gh run view <id> --log-failed`.

- **EUSAGE, "package.json and package-lock.json … not in sync"** in `npm ci`.
  A major bump reached `package.json` without the lock being regenerated.
  Older npm (Node 20/22 CI lanes) tolerates this, but the release job's
  `npm@latest` doesn't. This failure sank alpha.32. Regenerate the lock with
  `npx -y npm@latest install --package-lock-only` and cut a fresh version.
  Always land a major through its own PR, which regenerates the lock. Never
  hand-edit it into `package.json`.
- **ENEEDAUTH, "need auth"** on a package's **first-ever** publish. You can't
  configure a trusted publisher for a name that doesn't exist on npm yet, so
  OIDC mints no token. On alpha.33 this stopped the run at
  `@shexjs/language-server` and left later packages unpublished. To fix it,
  `npm login` locally and run `node tools/publish-ordered.js --tag latest`,
  which finishes all the stragglers. Or publish only the new package with
  `npm publish -w <pkg> --tag latest` and rerun the workflow. Then add a
  trusted publisher for the new package on npmjs.com. **Before a release that
  introduces a new package, plan for this step.** Packages published from a
  local token have no provenance attestation.
- **E403, OIDC permission denied**. The package's trusted publisher on
  npmjs.com (repo `shexjs/shex.js`, workflow `release.yml`) is missing or
  allows only staged publishing. Edit it to allow direct publishing. This is
  configured outside the repo.
- **E422, verifying sigstore provenance**. The package's `repository.url`
  names another repo. It must point at the **`shexjs`** org, not the old
  `shexSpec/shex.js` (this happened to extension-wasi in alpha.31). The
  `https://…`, `….git` and `git+https://….git` spellings all publish with
  provenance. Before tagging, run
  `grep -l shexSpec/shex.js packages/*/package.json`, which should print nothing.

## READMEs a release should keep

Each `packages/*/README.md` follows one pattern: `# <npm name>`, npm-version
and CI badges, a one-line role, `## Install`, a quick start that runs, then
package-specific depth, then a footer pointing at the `shex` package list.
The `shex` package's README keeps the full badge set and has no footer.
`packages/shex/test/Readme-examples-test.js` pulls fenced blocks out of the
READMEs (by README, first line, and index) and runs them. Network-dependent
blocks run only with `TEST_network=true`, which `npm run test-all` sets. If
you change an API that a README demonstrates, update the README in the same
change.

## Dependabot

`.github/dependabot.yml` checks npm and GitHub Actions weekly.

- npm minor and patch updates are grouped into `dev-dependencies` and
  `production-dependencies` PRs. Each major gets its own PR.
  `versioning-strategy: increase`.
- **Ignored majors**:
  - `node-fetch` 3 is ESM-only, and the CJS builds can't use it.
  - `typescript` 7 is the native Go port. The classic compiler API that
    `ts-jison` and `ts-loader` import is no longer exported from its main
    entry. Stay on 5.x; the root pins `^5.5.0`. If TypeScript 8 or later
    arrives, first check whether the classic API is back in the main export.
- Actions updates come as one grouped PR.

`.github/workflows/dependabot-auto-merge.yml` runs on `workflow_run` after
**CI** finishes. For a PR run that succeeded, it squash-merges the PR if the
author is Dependabot. It needs no branch protection and no "Allow auto-merge"
setting, so `gh pr merge --auto` would **not** work here. Merges run one at a
time. A PR that isn't mergeable yet is a quiet no-op, and the workflow
retries after Dependabot rebases it. Things to know:

- `gh pr view --json author` reports `app/dependabot`, not `dependabot[bot]`,
  so the author check matches `*dependabot*`. An exact-match check silently
  skips every PR.
- Majors merge on green too. To hold them for review, uncomment the major
  guard in the workflow file.
- The Node suite doesn't exercise the VS Code editor libraries
  (`vscode-languageclient`/`-languageserver`), so review those by hand even
  when CI is green.
- A red major stays open. Fix it on its branch or close it with a note.

## Related skills

- `shexjs-build-and-test`: the test gates and the build before tagging.
- `shextest-paired-branches`: `npm run check-branch-deps` (also in the
  pre-commit hook and CI) fails on `main` unless `shex-test` points at
  `shexSpec/shexTest#main`. Point it back before you release.
- `shexjs-webapp`: webpack bundles and the webapps site.
