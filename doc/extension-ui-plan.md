# Extensions that reach the UI — implementation plan

> **Status (2026-08-23): phase 0 done; phases 1–5 proposed.**
> The inventory in §2 is the part that does the work: it is the list a port
> is done against, so that a feature that moves can be told from one that
> was dropped.  Phase 0 pinned it, wrote the missing test, and fixed the two
> bugs that test found.

## 1. Where it stands

`@shexjs/extension-map` is a validator extension that also has a web app, and
the way it has one is by copying:

| | shex-webapp | extension-map |
| --- | --- | --- |
| page | `doc/shex-simple.html` (275) | `doc/shexmap-simple.html` (318) |
| worker page | `doc/shex-worker.html` (280) | `doc/shexmap-worker.html` (320) |
| app | `doc/ShExBaseApp.js` (4513) | `doc/ShExMapBaseApp.js` (1210) |
| main-thread host | `doc/ShExApp.js` (21) | `doc/ShExMapInMainApp.js` (48) |
| worker host | `doc/ShExInWorkerApp.js` (9) | `doc/ShExMapInWorkerApp.js` (95) |
| worker thread | `doc/ShExWorkerThread.js` (116) | `doc/ShExMapWorkerThread.js` (147) |

The pages are copies with a recorded delta, `shexmap-simple.html.patch`, whose
paths went stale in 2018 — a copy that nobody can re-derive is a fork.

The leak runs the other way too. `ShExBaseApp` already knows about ShExMap:

- `MENU_ITEM_materialize = "- materialize -"` — declared at
  `ShExBaseApp.js:12`, prepended to the query-map extension's focus rows at
  `:972`, injected into the focus-node context menu at `:1892`, handled at
  `:1982`.
- `loadExtraInputs` (`:1373`) walks "the app's QueryParams manifest
  descriptors (assigned post-construction): shexmap's staticVars,
  outputSchema[URL] and outputShapeMap; nothing in shex-simple."
- `:1088` works around resources that live in `shex-webapp/doc/` and 404 from
  `extension-map/doc/`, which is the page duplication showing through.
- `:2` says the file holds "Classes and constants common to all
  shex{,map}{simple,worker}" — four pages named in the base app's first line.

Two things in the base app are *already* extension-shaped, and are the
precedent this plan generalizes rather than invents:

- **query-map extensions** (`:900`, `:925`, `:942`): a shape map may hold a
  `SPARQL "SELECT …"` or `QENTITIES "42"` term, resolved by whoever
  understands that language, and written back by the name its source used.
- **neighborhood selection**: the db behind the data pane is chosen by
  parameter (`endpoint`, wikidata), not compiled in.

## 2. Inventory: what ShExMap contributes today

> **Phase 0 done (2026-08-23).** Coverage below is what an audit found, not
> what the first draft assumed: three rows had no test where the draft said
> "smoke", and writing one of them turned up two bugs (rows 5/12).

Nothing may be lost. Each row is a feature, where it lives now, and what
covers it; a port is done when every row is ticked, and a row with no test
gets one **before** it moves.

- [ ] **1. `#bindings1` pane** (JSON bindings, editable) — page +
      `JSONCache` (`ShExMapBaseApp.js:22`). *smoke: "should boot with editor
      panes on the ShExMap caches"*
- [ ] **2. `#staticVars` pane** — page + `JSONCache`. *same test, and
      "should load a picked manifest entry's materialization inputs"*
- [ ] **3. `#outputSchema` pane** (a `SchemaCache`) — page + ctor `:94`.
      *same two*
- [ ] **4. `#outactions` row**: materialize button, `outputShape`,
      `createRoot` — page, `prepareControls:174`. *smoke: "should keep the
      materialize buttons inside a box that contains them"*
- [ ] **5. keybindings** ctl-\ materialize, ctl-[ / ctl-] bindings table —
      `ShExMapBaseApp.js:152`–`:167`, dispatched from `ShExBaseApp.js:3490`.
      *smoke: "should reach materialize on ctl-\ and the bindings table on
      ctl-[ / ctl-]" — **written in phase 0**, and it found the two bugs
      below*
- [ ] **6. pane CSS** (bindings colours, selected row, `#inputarea`
      overflow) — page `<style>`. *no test; checked by eye*
- [ ] **7. `- materialize -` context-menu item** — **in the base app**
      `:12`, `:972`, `:1892`, `:1982`. *no test.* It needs a right-click on
      an edit-map `.focus` input whose query map holds an Extension term
      (`SPARQL "SELECT …"`), which needs an endpoint to resolve — the menu
      does build under jsdom, so this is reachable with `nock`, but the
      cheaper seam is phase 1's menu-item registry. **Phase 1 may not remove
      `MENU_ITEM_materialize` until one of the two exists.**
- [ ] **8. manifest keys** `staticVars`, `outputSchema[URL]`,
      `outputShapeMap` — **in the base app** `loadExtraInputs:1373`.
      *smoke: "should load a picked manifest entry's materialization inputs"*
- [ ] **9. validator wiring** `MapModule.register(validator, ShExWebApp)` —
      `ShExMapInMainApp.js:38`. *`extension-map/test/Map-test.js`*
- [ ] **10. materialize verb**: collect inputs, run, report — `:648`–`:716`.
      *smoke: "should keep validation and materialization results in their
      own tabs"*
- [ ] **11. materialized-graph rendering + provenance hovers** —
      `:760`–`:943`. *smoke: eight tests, "should render the materialized
      graph…" through "should light up the schema and the data from a hover
      in the bindings"*
- [ ] **12. bindings ⇄ table** — `:1155`, `:1205`, reachable only by ctl-[ /
      ctl-]. *covered by the phase-0 test above.* **It did not work**: see
      below.
- [ ] **13. results renderer addition** (`valToExtension`) —
      `ShExMapResultsRenderer:32`. *smoke: the tabs test*
- [ ] **14. materializer debugger** (session, step, threads, binding state)
      — `:189`–`:345`. *`MaterializerDebugger-test.js`,
      `ShExMapDebugRepl-test.js`, and five smoke tests*
- [ ] **15. worker request `materialize`** — `ShExMapWorkerThread.js:76`.
      *worker smoke: "should tie worker-materialized triples to constraints
      and bindings"*
- [ ] **16. worker create carries `staticVars`** —
      `ShExMapWorkerThread.js:19`. *same*
- [x] **17. page title/branding** — page. *Not an extension's job: one page,
      generically titled. Nothing to port.*

### What writing row 5's test found

The bindings table has never worked in this form. Two bugs, both fixed in the
same commit as the test, because a feature that is broken when it is ported
is a feature nobody can tell was lost:

1. `varsIn` was a plain `function` inside a class method. A class body is
   strict, so `this` was `undefined` and the first cell it filled threw
   *Cannot read properties of undefined (reading 'Caches')* — leaving a
   headerless table over a hidden textarea.
2. With that fixed, the cell did `termToLex(n3ify(binding))`: `n3ify`
   rendered the ShExJ `{value, type?, language?}` as a Turtle string and
   `termToLex` wanted an RDFJS term, so it threw *unknown RDFJS node type*.
   Now `termToLex(ShExTerm.ld2RdfJsTerm(binding))`, and `n3ify` is gone.

"smoke" is `extension-map/test/shexmap-editors-smoke-test.js` (20 tests) and
`shexmap-worker-editors-smoke-test.js` (5), which drive the real page under
jsdom against a local server. They are the safety net: they exercise the
page, so a feature that survives them survived the port.

## 3. The contract

An extension is a module loaded by URL that registers a descriptor:

```js
ShExExtensions.register({
  id:    "http://shex.io/extensions/Map/",   // the SemAct IRI: it already names it
  label: "ShExMap",
  css:   "…",                       // or a stylesheet URL
  panes: [ {slot: "aside", id: "bindings", kind: "json",   label: "bindings"},
           {slot: "aside", id: "staticVars", kind: "json", label: "static vars"},
           {slot: "aside", id: "outputSchema", kind: "schema"} ],
  actions: [ {id: "materialize", label: "materialize", key: "ctrl-\\",
              slot: "toolbar", run: (app) => …} ],
  menuItems: [ {menu: "focus", id: "- materialize -", run: … } ],
  manifestKeys: ["staticVars", "outputSchema", "outputShapeMap"],
  results: (base) => class extends base { … },   // compose, don't subclass a global
  validator: MapModule,             // register(validator, ShExWebApp)
  worker: "…/shexmap-worker.js",    // importScripts'd; adds request types
});
```

Three hosting facts shape it:

- **The page has no module system.** Globals plus a `modules[]` shim
  (`doc/require.js`) and webpack bundles. So: `<script src=URL>` injection and
  a global registry, not `import()`. ESM is the eventual target, not this
  change.
- **The worker is a classic worker.** `importScripts(url)` takes any
  CORS-permitting URL, which is exactly "load an extension by URL" — and
  `ShExWorkerThread.js:37` already carries the stub comment
  `// extensions.each(ext => ext.register(validator, ShExWebApp)`.
- **Panes are caches.** A pane in this app is an `InterfaceCache` with parse,
  dirty and status behaviour; `kind` in a pane descriptor picks the cache
  class, so an extension declares a pane rather than building one.

## 4. Where extensions go on screen

ShExMap puts its panes in a right-hand column. Keep the column, but make it a
**stack of collapsible cards, one per extension**, in a named slot:

    toolbar     buttons and inputs beside `validate`
    aside       the right-hand column: one card per extension, panes inside
    results     sections appended under a validation result
    statusbar   short status text

Cards rather than tabs because ShExMap's bindings, statics and output want to
be visible at the same time as the results. With one extension loaded the page
looks like today's ShExMap; with two, neither has to know about the other.
Extensions never address `#bindings1` directly — the app owns layout, and an
extension owning a `<div>` is how the fork started.

## 5. Phases

Each phase ends green: the existing smoke tests pass **unchanged**, and any
test that had to change is a feature that moved, with the diff as the record.

**Phase 0 — pin the inventory. Done.** §2 is the checklist. The audit found
three rows with no test where the draft assumed one (5, 7, 12); the
keybinding test was written and covers 5 and 12, and turned up two bugs in
the bindings table, fixed with it.  Row 7 is still uncovered and says what it
would take; row 6 is by eye.  Nothing else moves until row 7 has a test or
phase 1 gives it a registry to be tested at.

**Phase 1 — hooks in the base app, ShExMap still on its own page.**
`shexmap-simple.html` keeps existing and registers through the new hooks, one
at a time, smoke tests green after each: css → panes → manifest keys
(generalize `loadExtraInputs`, which is already half-general) → menu items
(deletes `MENU_ITEM_materialize` from the base) → actions → results → worker
requests. After this phase the base app contains no ShExMap identifier.

**Phase 2 — collapse the pages.** `shex-simple.html` loads extensions from
`?extension=<url>` and from the manifest; `shexmap-{simple,worker}.html`
become redirects (the URLs are published on gh-pages), and the stale
`.patch` goes.

**Phase 3 — move the code.** `extension-map/doc/ShExMap*.js` become a webpack
bundle pair, `webpacks/shexmap-ui.js` and `webpacks/shexmap-worker.js`, built
from `packages/extension-map/`. shex-webapp keeps no map code; extension-map
keeps no page.

**Phase 4 — a second extension proves the contract.** ShExReduce
(`@shexjs/extension-reduce`): panes for the overlay and for the reduced AST, a
`reduce` verb beside `validate`, and the `examples/calc-semact/` pair as its
manifest — the two schemas make a demo that shows an action steering a parse
and an action falsifying one. If the contract only fits ShExMap, this is where
that shows.

**Phase 5 — outside contributors.** Document the contract, add a manifest that
loads an extension from a *different origin* (the test server can serve a
second port, so cross-origin is tested rather than assumed), and publish a
skeleton extension repo.

## 6. Guardrails

- **The inventory is the definition of done** — §2, ticked row by row.
- **A test that forbids the leak coming back.** A unit test greps
  `packages/shex-webapp/doc/` for extension identifiers (`materialize`,
  `bindings`, `staticVars`, `outputSchema`, `shexmap`) and fails on a hit —
  the analogue of `monorepo-deps-test`. Cheap, and it is what keeps phase 1
  from being undone by the next feature.
- **Published URLs keep working** until phase 2's redirects are in place.
- **One page per hosting mode, forever**: `shex-simple` and `shex-worker`. A
  new page is the smell this plan exists to remove.

## 7. Risks and open questions

- **Loading code by URL is running code from a URL.** A manifest that names an
  extension is a manifest that executes it. Gate it: same-origin by default,
  a confirmation for anything else, and never from a manifest fetched by
  `?manifestURL=` without asking. This is the one item that should be settled
  before phase 2 rather than after.
- **Two extensions at once**: the slot model allows it, but the two would
  share the validator and the worker. Registering two SemAct handlers is
  already fine; two *verbs* competing for the results pane is not tested. Say
  "more than one may load" in phase 4, not phase 1.
- **The worker is classic.** `importScripts` is what makes URL loading easy;
  an ESM worker would need `type: "module"` and a different loader. Not now.
- **`ShExBaseApp.js` is 4513 lines**, and phase 1 adds hooks to it before
  anything is removed. Expect it to grow before it shrinks; the base app's
  own split is a separate job.
- **The materializer debugger (row 14)** is the deepest coupling — it reaches
  into binding frames and pane ranges. It may be the one thing that stays a
  ShExMap-shaped hook rather than becoming a general one; decide in phase 3
  with the tests in hand.
