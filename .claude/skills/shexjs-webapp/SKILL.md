---
name: shexjs-webapp
description: Work on the shex.js web apps and their browser bundles — shex-simple.html and the ShExMap/reduce/WASI plugins, the page scripts under packages/*/doc/, the webpack bundles in doc/webpacks/, TEST_browser, serving the pages locally, and the gh-pages site publish. Use when editing webapp TypeScript (src/app, src/plugin) or hand-written page/worker scripts, when a library change has to show up in the browser, when TEST_browser fails with ReferenceErrors, or when touching webpack configs or the webapps-site workflow.
---

# shex.js web apps and bundles

The web app is **one page**, `packages/shex-webapp/doc/shex-simple.html`.
ShExMap, reduce and WASI are **plugins** it loads by URL (`?plugin=<url>`,
see the repo-root `doc/plugins.md`). The page is a stack of classic `<script>`s, in order:

1. `webpacks/jquery-components.min.js`, `webpacks/n3js.js` (the `N3js`
   global), `webpacks/shex-webapp.js` (the `ShExWebApp` global): webpack
   bundles.
2. `iri.js`, `ShExPlugins.js`, `ShExAppCommon.js`, … `WorkerMarshalling.js`:
   the app's page scripts, loaded as-is from `doc/`.

For lib builds, the `TEST_*` gates in general and the pre-commit hook, see
the `shexjs-build-and-test` skill.

## Where things live

| Package | Page scripts (`doc/`) | Bundle entry → output |
|---|---|---|
| `shex-webapp` | `shex-simple.html`, `shex-worker.html` (redirect), `ShEx*.js`, `ShExWorkerThread.js`, `shex-app.css` | `shex-webapp.js` → `doc/webpacks/shex-webapp{,.min}.js`; `doc/n3-components.js` → `doc/webpacks/n3js{,.min}.js` |
| `extension-map` | `shexmap-simple.html`, `shexmap-worker.html` (both redirects), `redirect-to-plugin.js`, `ShExMapPlugin.js`, `ShExMapWorkerThread.js` | `shexmap-webapp.js` → `doc/webpacks/shexmap-webapp{,.min}.js` |
| `extension-reduce` | `ShExReducePlugin.js`, `ShExReduceWorkerThread.js` | `shexreduce-webapp.js` → `doc/webpacks/shexreduce-webapp{,.min}.js` |
| `extension-wasi` | `ShExWasiPlugin.js` | `shexwasi-webapp.js` → `doc/webpacks/shexwasi-webapp{,.min}.js` |

`extension-eval`, `extension-test` and `extension-wasi-test` also ship a
hand-written `doc/*Plugin.js` but no bundle of their own.

### Three kinds of browser JS. Know which one you're editing

- **Compiled page scripts: tracked, committed.**
  `packages/shex-webapp/src/app/*.ts` compiles to `packages/shex-webapp/doc/*.js`
  through `tsconfig.app.json` (`module: none`, so plain globals, no
  imports). `extension-map/src/plugin/ShExMapPlugin.ts` compiles to
  `extension-map/doc/ShExMapPlugin.js` through `tsconfig.plugin.json`. Edit
  the `.ts`, recompile, and **commit both**:
  ```sh
  (cd packages/shex-webapp && npx tsc -p tsconfig.app.json)
  (cd packages/extension-map && npx tsc -p tsconfig.plugin.json)
  ```
  (`npm run build` in either package does `tsc` plus that; so do
  `npm run compile` and `make page-scripts`.) CI's
  `npm run check-page-scripts` rebuilds them and **fails if a committed
  `doc/*.js` differs from its `.ts`**, or if a new one was never committed.
  Globals the page scripts share (`ShExWebApp`, `ShExWorker`,
  `WorkerUrl`, …) are declared in `src/app/globals.d.ts`.
- **Hand-written page scripts: tracked, no `.ts`.** `ShExWorkerThread.js`,
  `iri.js`, `n3-components.js` (the n3js entry), `ShExMapWorkerThread.js`,
  `redirect-to-plugin.js`, the reduce/WASI/eval/test plugin files. Edit
  these directly.
- **Webpack bundles: gitignored build output.** Everything in
  `doc/webpacks/` **except** shex-webapp's `jquery-components.*` and its
  hashed png/font assets. Those stay committed. Don't rebuild them with
  `webpack-jquery-components`: newer jquery-ui changes dialog markup the app
  and tests depend on (see the comment in `.gitignore`). Never
  `git add -f` a bundle.

A new `src/app/Foo.ts` also needs a `<script src="./Foo.js">` in
`shex-simple.html`, in dependency order. If the app boots it, add it to
`APP_FILES` in `packages/shex-webapp/test/pages-test.js` too.

## Bundles

Root scripts:

```sh
npm run webpacks-all    # n3js + shex-webapp + map + reduce + wasi
npm run webpack         # the same minus n3js (faster once n3js exists)
npm run webpacks-fetch  # tools/sync-webpacks.sh: copy the last published bundles from gh-pages
```

Each package also has `npm run webpack` of its own. `webpacks-fetch` copies
every `packages/*/doc/webpacks` directory that gh-pages has.

- Bundles pack each package's **`main`, i.e. compiled `lib/*.js`**. They
  don't pack `src/`. A library change (validator, parser, neighborhoods, …)
  reaches the browser only after the lib build **and then** a webpack build.
- The extension bundles don't carry their own copy of core. Their webpack
  `externals` map `@shexjs/webapp` to the `ShExWebApp` global, `n3` to
  `N3js`, and each id in `FromCoreBundle` (map and reduce configs) to
  `ShExWebApp.Modules[id]`. That registry is the `modules` object in
  `packages/shex-webapp/shex-webapp.js`. When an extension starts requiring
  a new shared module, add it to that registry **and** to `FromCoreBundle`.
  Otherwise you get a second copy, or a module that's missing at runtime.
- Exposing a library function to page scripts means adding it to the object
  `shex-webapp.js` returns (for example `ShExWebApp.WorkerGate`), then
  rebuilding the bundle.
- Workers `importScripts` bundles too. `ShExWorkerThread.js` loads
  `n3js.js`, `shex-webapp.js` and `WorkerMarshalling.js`. The map/reduce
  worker threads load their bundle relative to the plugin. A worker change
  can therefore need a bundle rebuild as well.
- A bundle is set up as a global, not a module. To check what it exports,
  grep the emitted file. `require()` in node won't do it.

**Rebuild the bundles** after: editing library `src` (after the lib build);
editing any `*-webapp.js` entry; changing a package's `main`/exports or the
files it requires; renaming or moving modules; editing a webpack config; or
switching branches. Bundles, like `lib/`, survive `git checkout`.

## TEST_browser

The browser suites (`browser-test`, `editors-smoke-test`,
`worker-editors-smoke-test`, `plugin-*-test`, `semact-plugins-test` in
shex-webapp; the `shexmap-*-smoke-test`s in extension-map) run only with
`TEST_browser=true`. They boot the real pages under jsdom
(`packages/shex-webapp/test/harness.js`) with a test server over the repo
root, so they load the **committed `doc/*.js`** and the **built bundles**
from disk.

- **No bundles → a cascade of ReferenceErrors** that look like app breakage:
  `N3js is not defined`, then `ShExWebApp`, `ShExBaseApp` and `ShExApp`
  undefined, then timeouts. It's one missing build. Run
  `npm run webpacks-all` (or `webpacks-fetch`) first.
- **Stale bundles or `doc/*.js`** → tests exercise old code. Recompile what
  you changed before trusting a run.
- The pre-commit hook runs plain `npm test`, so browser suites **don't run
  on commit**. Run `TEST_browser=true npx mocha packages/shex-webapp/test/*test.js`
  yourself. CI runs `compile` + `webpacks-all` + `test-all`.
- Workers in tests are an in-process fake (`test/fakeWorker.js`), not real
  threads.

## Debugger and workers

- `?worker=1` makes the app validate in `ShExWorkerThread.js`
  (`WorkerUrl`). `ShExWorker` is `null` without it.
- Live whole-validation stepping (🐞▶, `#debugValidateLive`) runs in a
  **dedicated** `new Worker(WorkerUrl)`, the same `ShExWorkerThread.js` and
  the same bundle (its `debugValidate` case). There's no separate debugger
  bundle. The button shows only when `SharedArrayBuffer` exists and the page
  is `crossOriginIsolated`. Serve with `--coi` to use it.
- Live stepping can't be tested under jsdom: the fake worker shares the
  page's thread, so `Atomics.wait` would deadlock. The mechanism's test is
  `packages/eval-validator-api/test/WorkerGate-test.js` (real
  `worker_threads`). Try the browser end by hand. Design notes are in the
  repo-root `doc/debugger-design.md`.

## Redirect pages

These are published URLs, kept as redirects to `shex-simple.html`:
- `extension-map/doc/shexmap-simple.html` and `shexmap-worker.html` call
  `redirectToPlugin(...)` (`redirect-to-plugin.js`). It adds
  `plugin=<absolute ShExMapPlugin.js>` and a default `manifestURL`, makes
  `plugin`/`*URL` params absolute, and sets `worker=1` for the worker page.
- `shex-webapp/doc/shex-worker.html` → `shex-simple.html?worker=1`.
- The repo-root `doc/shex-simple.html` is a legacy "has moved" page.

`pages-test.js` checks that the redirects still work. Don't put app UI into
the map pages. It belongs in `shex-simple.html` or in the plugin.

## Trying it locally

```sh
npm ci                   # also builds lib/ (prepare → make ALL), incl. shex-serve
npm run webpacks-all     # or: npm run webpacks-fetch
npm run serve            # shex-serve on :8880 over the repo root; prints the page URLs
npm run serve -- --coi   # cross-origin isolated, for 🐞▶ live stepping
```

Pages use relative paths across `packages/*`, so serve the **repo root**.
`file://` and a server rooted at a package don't work. Useful query params:
`?worker=1`, `?editors=textarea` (plain textareas), `?plugin=<url>`,
`?manifestURL=<url>`.

## Publishing (gh-pages)

`.github/workflows/webapps-site.yml` runs on every push to `main` (or by
hand). It runs `npm ci` then `npm run webpacks-all`, strips the
`<!-- STRIP-FOR-PUBLICATION -->` block from `/index.html`, and commits the
whole tree plus the force-added `doc/webpacks/` dirs and `.nojekyll` **on
top of** `gh-pages`. That branch serves https://shex.js.org/ (CNAME) and
the shex.io clone. The repo-relative layout is kept, so relative paths keep
working.

- Experiment sites (`generics/`, `graphs/`, …) live on their own branches
  and are published by a `webapps-site-branch.yml` that exists **only on
  those branches**. The `id="experiment-sites"` JSON block in `/index.html`
  on `main` lists them. A root publish carries only the dirs listed there,
  so to add an experiment, add its entry on main and on its branch.
- A new plugin bundle dir has to be added to the `git add -f` list in
  `webapps-site.yml`, or it won't be published. (`tools/sync-webpacks.sh`
  then picks it up by itself.)
