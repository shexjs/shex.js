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

- ~~`MENU_ITEM_materialize = "- materialize -"`~~ — **not a leak: read the
  code, not the name.** It heads the focus-node menu over a *query* map and
  means "every node the query named, as a row each" — materialize as a view
  is materialized. ShExMap's materialize builds a graph, and the two share
  nothing but the word. See row 7.
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

- [x] **1. `#bindings1` pane** (JSON bindings, editable) — **a declared
      pane** (`ShExMapPlugin.js`), built by `buildPluginPanes`; the
      `JSONCache` it wants is now the base app's `json` pane kind. *smoke:
      "should boot with editor panes on the ShExMap caches" and "should build
      its panes from the extension, not from the page"*
- [x] **2. `#staticVars` pane** — same, and its `staticVars` manifest key is
      part of the declaration. *same two, and "should load a picked manifest
      entry's materialization inputs"*
- [x] **3. `#outputSchema` pane** (the `schema` pane kind) — same, with its
      `outputSchema`/`outputSchemaURL` manifest key. *same three*
- [x] **4. `#outactions` row**: materialize button, debug button, the
      `outputShapeMap` input and the step buttons — **a `toolbar` in the
      descriptor**, built into the extension's card under the panes it
      consumes. (No `createRoot`: the draft named one, the page never had
      one.) *smoke: "should keep the materialize buttons inside a box that
      contains them", and on the plain page "should build its toolbar, and
      say so when the verb is not loaded"*
- [x] **5. keybindings** ctl-\ materialize, ctl-[ / ctl-] bindings table —
      **declared beside the controls**: a toolbar button may name the key
      that runs it too, and a verb with no button is a `keys` entry. The key
      runs the verb rather than pressing the button, so the test now counts
      the verb and checks both ways in reach the same one. *smoke: "should
      reach materialize on ctl-\ and the bindings table on ctl-[ / ctl-]" —
      **written in phase 0**, and it found the two bugs below*
- [x] **6. pane CSS** (bindings colours, selected row, `#inputarea`
      overflow) — **a descriptor's `css`** (`ShExMapPlugin.js`), appended
      after the page's own rules. *smoke: "should take its pane colours from
      the extension, not from the page", and the plain page's "should add
      nothing where no extension is registered"*
- [x] **7. `- materialize -` context-menu item** — **not ShExMap's**, and
      not an extension's job: it expands a query map into the rows it stood
      for, which is base-app work that a page with nothing registered can
      do. *smoke, on the plain page: "should expand a query map into one
      edit-map row per node it names" — **written in this phase**, and it
      found the bug below.* Nothing moves; the constant stays, with a
      comment saying which materialize it is.
- [ ] **8. manifest keys** `staticVars`, `outputSchema[URL]`,
      `outputShapeMap` — `loadExtraInputs:1373` walks `QueryParams`, which was
      already general; two of the three keys now arrive there from the pane
      declarations. `outputShapeMap` is not a pane — it is the `#outactions`
      row's input — so it waits for row 4. *smoke: "should load a picked
      manifest entry's materialization inputs"*
- [x] **9. validator wiring** `MapModule.register(validator, ShExWebApp)` —
      **`register` in the descriptor**, called where a module loaded by
      `?extension=` is called; it returns early when ShExMap's module isn't
      on the page. *`extension-map/test/Map-test.js`, and every smoke test
      that validates a map schema*
- [x] **10. materialize verb**: collect inputs, run, report — **`methods`
      in the descriptor**, mixed into the app, along with the materializer
      it runs and the results-tab switching it does. What it renders with
      is rows 11 and 14, reached as `this.<name>` because they are the same
      object's methods. *smoke: "should keep validation and materialization
      results in their own tabs", and on the plain page "should build its
      toolbar, and say so when the verb is not loaded"*
- [x] **11. materialized-graph rendering + provenance hovers** — **in the
      descriptor's `methods`**, with the Turtle panes it renders into and
      the hovers it hangs on them. *smoke: eight tests, "should render the
      materialized graph…" through "should light up the schema and the data
      from a hover in the bindings"*
- [ ] **12. bindings ⇄ table** — `:1155`, `:1205`, reachable only by ctl-[ /
      ctl-]. *covered by the phase-0 test above.* **It did not work**: see
      below.
- [x] **13. results renderer addition** (`valToExtension`) — **`results:
      base => class extends base`** in the descriptor, so two extensions
      compose rather than the second replacing the first, and neither has to
      name a global to subclass. *smoke: "validation populated the
      bindings", in both the main and worker pages' tests*
- [x] **14. materializer debugger** (session, step, threads, binding state)
      — **in the descriptor's `methods`**; its step buttons are `toolbar`
      controls and its thread list is a `statusbar` one, which is a slot of
      its own because a list that grows and shrinks must not sit in the box
      the buttons float in. *`MaterializerDebugger-test.js`,
      `ShExMapDebugRepl-test.js`, and five smoke tests*
- [x] **15. worker request `materialize`** — **`requests.materialize` in
      the extension's worker half**, which `ShExWorkerThread` imports when
      the app names it. Unknown requests are looked up there before they
      are refused. *worker smoke: "should tie worker-materialized triples to
      constraints and bindings", and "should validate in the plain worker,
      with ShExMap named as an extension"*
- [x] **16. worker create carries `staticVars`** — they travel in the
      `materialize` request, which is the extension's own message now.
      *same*
- [x] **17. page title/branding** — page. *Not an extension's job: one page,
      generically titled. Nothing to port.*

### What writing row 7's test found

The menu over a query map had one blank item where the nodes should be. The
Extension branch of `buildMenuItemsPromise` returned `{items: hash}` where
every other branch returns the hash; jquery-contextMenu takes what `build`
returns as its options, so the menu it drew had a single entry called
`items` — no name, nothing to pick, and `- materialize -` nowhere in it.
The wrapper came in with the 2023 remote-query merge (`4cedbc60`) and
survived this August's rewrite of how the nodes are fetched (`e1184a07`),
so the menu has been drawing that blank item for as long as it has existed.
Flattened, and the test right-clicks its way through the real plugin.

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
ShExPlugins.register({
  id:    "http://shex.io/extensions/Map/",   // the SemAct IRI: it already names it
  label: "ShExMap",
  css:   "…",                       // or a stylesheet URL
  panes: [ {slot: "aside", id: "bindings", kind: "json",   label: "bindings"},
           {slot: "aside", id: "staticVars", kind: "json", label: "static vars"},
           {slot: "aside", id: "outputSchema", kind: "schema"} ],
  toolbar: [ {kind: "button", id: "materialize", label: "materialize (ctl-\\)",
              key: {ctrl: true, key: "\\"}, run: app => app.materialize()},
             {kind: "input", id: "outputShapeMap", queryStringParm: "output-map",
              manifest: {key: "outputShapeMap"}},
             {kind: "group", id: "debugControls", hidden: true, controls: [ … ]},
             {kind: "status", id: "dbgStatusRow", contentId: "dbgStatus"} ],
  keys: [ {id: "bindingsToTable", key: {ctrl: true, key: "["}, run: app => … } ],
  results: (base) => class extends base { … },   // compose, don't subclass a global
  validator: MapModule,             // register(validator, ShExWebApp)
  worker: "…/shexmap-worker.js",    // importScripts'd; adds request types
});
```

**Loading (phase 2, done).** One URL, one module, whatever it has to add --
because an extension is one thing to the person using it. `?extension=<url>`
(repeatable; `?pluginURL=` is the same thing, and is what a permalink
writes) and `extensions: [url, …]` on a manifest entry both mean *fetch this
and run it*. The module says what it adds:

```js
module.exports = {
  ui: { id: "…", label: "…", css: "…", panes: [ … ] },   // what it adds to the page
  name: "Test", url: "…", description: "…",              // and/or a handler:
  register (validator, ShExWebApp) { validator.semActHandler.register(…) },
};
```

Either half or both. A module written as a page script hands its descriptor
straight to `ShExPlugins.register` instead of exporting `ui`, and is
loadable both ways: registering the same `id` twice is a no-op, so a page
that loads it as a script, a manifest entry that names it, and a permalink
that carries it are one extension between them.

*Loading is one act; selection is per kind and already exists.* An extension
*contributes* a handler, a data source, panes; what *uses* one is separate
and unchanged -- a schema dispatches a handler by IRI, `?neighborhood=`
picks the source, a pane is shown because it is there. So there is no reason
for a second switch per kind, and every reason not to: two extensions load
the same way, and the app never has to know which kinds a URL will turn out
to hold.

Three hosting facts shape it:

- **The page has no module system.** Globals plus a `modules[]` shim
  (`doc/require.js`) and webpack bundles. So: `<script src=URL>` injection and
  a global registry, not `import()`. ESM is the eventual target, not this
  change.
- **The worker is a classic worker.** `importScripts(url)` takes any
  CORS-permitting URL, which is exactly "load an extension by URL" — and
  `ShExWorkerThread.js` carried the stub comment `// extensions.each(ext =>
  ext.register(validator, ShExWebApp)` for years before this filled it in.
  A worker resolves a relative `importScripts` against *its own* script and
  knows nothing of the page, so the app names extensions absolutely and the
  thread hands each one the base it was loaded from.
- **Panes are caches.** A pane in this app is an `InterfaceCache` with parse,
  dirty and status behaviour; `kind` in a pane descriptor picks the cache
  class, so an extension declares a pane rather than building one.
- **Order is the constraint, not mechanism.** What an extension adds is
  itself a query parameter and a manifest key, so it has to be loaded before
  the query string is walked and before an entry is read. Both loaders do
  their extensions first and await them; the parameter pass skips the
  `extension` entry (`earlyLoad`) because it already ran.

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
>
> **Row 7's answer, from phase 1:** the test exists now, and what it says is
> that the row was misfiled. `- materialize -` is the query map's, not
> ShExMap's, so there is no menu hook to build yet — the only menu ShExMap
> puts up is on its own `#outputShapeMap` input, through the base app's
> public `addContextMenus`, and that moves with row 4.

**Phase 1 — hooks in the base app, ShExMap still on its own page.**
`shexmap-simple.html` keeps existing and registers through the new hooks, one
at a time, smoke tests green after each: css → panes+manifest keys → ~~menu
items~~ → actions → results → worker requests. After this phase the base app
contains no ShExMap identifier.

> **css: done.** `doc/ShExPlugins.js` is the register; `ShExBaseApp.start`
> calls `applyExtensions`, which appends each descriptor's `css` to the head
> after the page's own rules, so an extension may say differently what the
> page said — which is how a map app gets `#inputarea { overflow-x: auto }`
> without a page of its own. `extension-map/doc/ShExMapPlugin.js` is the
> first descriptor. Tested from both sides: the map page wears the colours
> and names the sheet's `data-extension`, and the plain page has no such
> sheet and nothing registered. Inventory row 6 is off the page.
>
> **panes and manifest keys are one hook, not two.** The plan had them as
> separate steps; they aren't separable. `ShExMapBaseApp`'s constructor makes
> three caches over three page-supplied textareas, and the `QueryParams` /
> `Getables` entries that carry the manifest keys (`staticVars`,
> `outputSchema`, `outputShapeMap`) each reference one of those caches. A
> descriptor cannot declare its manifest keys until the app builds its panes.
> So the next hook has to bring all of: a **slot** to build into; a
> `kind` → cache mapping (`json`, `schema`, and the plain input
> `#outputShapeMap`, which is not a cache at all); the `Getables` and
> `QueryParams` entries per pane; and `setEditors`' iteration over `Caches`,
> which is what turns a pane into a CodeMirror one under `?editors=1`.
> That is the piece the whole plan turns on, and it is bigger than one
> bullet.
>
> **panes + manifest keys: done.** A descriptor's `panes` say name, id,
> `kind`, `rows`, class, query parameter and manifest key; `buildPluginPanes`
> makes the textarea, the status line, the cache (`json` | `schema` |
> `turtle`), and the `Getables`/`QueryParams` entries — four things that have
> to agree, said once. They go in `#extensionPanes`, which a page may place
> where it likes and gets appended to `#inputarea` if it doesn't, one card per
> extension; `#extensionPanes { display: contents }` keeps the cards as the
> `.panel`s. `addEditorPanes` asks each declaration for its `editor`, so
> `?editors=1` reaches them as before. The map's two pane columns are one card
> now, which is §4's `aside`. Off `ShExMapBaseApp`: its `JSONCache`, three
> cache constructions, three parameter entries and the `addEditorPanes`
> override; off both map pages: three pane divs. What is left of the map's
> own markup is the `#outactions` row and the debugger's — rows 4 and 14.

**Phase 2 — collapse the pages.** `shex-simple.html` loads extensions from
`?extension=<url>` and from the manifest; `shexmap-{simple,worker}.html`
become redirects (the URLs are published on gh-pages), and the stale
`.patch` goes.

> **loading: done**, ahead of the rest of phase 1, because it is what makes
> `shex-simple.html?manifestURL=…/extension-map/examples/manifest.yaml` mean
> anything. `ShExPlugins.register` is idempotent and notifies; the app
> applies each descriptor as it arrives rather than only at boot, so an
> extension may land at any moment -- and a pane built after `?editors=1`
> took effect is still an editor. The map's example manifests name their
> extension, so picking a ShExMap entry on the plain page brings ShExMap.
>
> What that page shows today is the panes, filled from the entry
> (`staticVars`, `outputSchemaURL`): the *materialize* button, the debugger
> and the results renderer are still `ShExMapBaseApp`, a subclass no URL can
> load, and they arrive with rows 4, 10, 13 and 14.
>
> Three things were in the way, none of them the design. `?extension=` set
> `this.Caches.extension.url` on a cache that has no `Caches`, so every load
> threw; the handler was handed to the validator through
> `$(".pluginControl:checked").each(() => $(this)…)`, where an arrow
> function's `this` is the enclosing class, so `undefined.register` -- the
> feature has never run; and the evaluation context defined `module` but not
> `exports`, so a UMD bundle took its browser branch and hung itself on the
> window. Fixed, and the smoke tests load both halves of an extension: the
> ShExMap descriptor and shexTest's `Test` handler, which fails a node its
> action says `fail()` on and stops when the menu switches it off.
>
> `extension-test/browser/` is a browserify bundle of a file the package no
> longer has, from before `SemActFailure`: its `dispatch` returns `false`,
> which the validator refuses. `lib/shex-extension-test.js` needs no bundler
> (no requires, `module.exports` is the extension), so the test loads that;
> the stale bundle wants rebuilding, which wants a bundler installed.
>
> **controls + keys: done** (rows 4 and 5). A `toolbar` is a row of controls
> — button, input, group, status — built into the extension's card, and a
> button may name the key that runs it; a verb with no button is a `keys`
> entry. Both go through one `runPluginAction`, which reports what it
> can't run instead of throwing, and leaves `SharedForTests.promise` alone
> when the verb set it itself (materialize hands over the materialization,
> not the click). `keyDownHandlers` is read per keydown, so a binding may
> arrive at any time — an extension loaded mid-session brings its keys.
>
> **the verb, the handler and the renderer: done** (rows 9, 10, 13). Three
> hooks, and the app class they were holding up:
>
> - `methods` on a descriptor are mixed into the app, so ShExMap's verbs
>   read exactly as they did when they were methods on a subclass -- `this`
>   is still the app. A name the app already has is left alone, which is how
>   the worker app keeps its own materializer until rows 15 and 16.
> - `results: base => class extends base` composes renderers.
> - `register(validator, api)` on a descriptor is called where a module
>   loaded by URL is, so the handler reaches the validator either way.
> - plus `init(app)` for what an extension has to do rather than declare
>   (here: build the map module and hang the context menu on its own
>   input), and `onStartingValidation`.
>
> **the rest of it: done** (rows 11 and 14), and with them the class.
> `ShExMapBaseApp.js` is **deleted** — 985 lines of rendering and debugging
> moved into the descriptor's `methods` unchanged but for their indentation,
> which is what the mixin bought. `shexmap-simple.html` constructs
> `ShExApp`: it is `shex-simple.html` with one more script tag and different
> paths. Two more slots came with them — `resultsPanels`, where a second
> kind of result gets a tab and this app's own results become the first
> (built by the app, so no page carries the markup), and `statusbar`, under
> the toolbar rather than in it, because the thread list changes width and
> the step buttons must not move under the mouse. `pages-test` now checks
> that no map page mentions any of ShExMap's ids, which is the guard against
> quietly leaving something behind.
>
> `ShExMapInMainApp.js` is **deleted** -- its `getValidator` was the handler
> registration and its `getMaterializer` is in the descriptor -- and
> `shexmap-simple.html` constructs `ShExMapBaseApp` directly. That class is
> down to 985 lines from 1159, its constructor to two lines, and its
> overrides to three: `resultsTarget`, `prepareControls` (one `tabs()` call)
> and the constructor. It also `extends ShExApp` now rather than
> `ShExBaseApp`, which drops a copy of the manifest wiring it had been
> carrying.
>
> The containment rule the row needs (`display: flow-root` around a floated
> inner box) is the *app's* now, as `.pluginToolbar` — every extension's
> row gets it. Which turned up a leak the css hook missed: `shex-app.css`,
> not just the pages, carried ShExMap rules. `#outactionsRow`/`#outactions`
> are gone, `#debugControls` moved to the descriptor, and the debugger's
> (`#dbgThreadsRow`, `#dbgThreads`, `#dbgStatus`) stay for row 14 rather
> than splitting one feature's styling across two files. `pages-test`'s
> "no rule for an id no page has" now reads the descriptor too, since that
> is where a page's controls come from.

> **the worker: done** (rows 15, 16, and row 9's other half). Every request
> carries `extensions: [url…]`; `ShExWorkerThread` imports each once,
> registers what it hands back with the validator it builds, and looks up an
> unknown request among their `requests` before refusing it.
> `ShExMapWorkerThread.js` is 59 lines now rather than 147 — it was a copy
> of `ShExWorkerThread.js` with two things added, and the copy had gone
> stale: the base one has since learned to ask an endpoint asynchronously
> (`SparqlDbAsync`, `validateShapeMapAsync`) and to marshal the terms a
> query tracker reports, and the map's worker page had neither. Deleting the
> fork is the fix.
>
> `ShExMapInWorkerApp.js` goes too: its `getValidator` differed only in the
> worker URL, which the page now says once as `WorkerUrl` (it was already
> saying it to `new Worker`), its `getMaterializer` is the descriptor's --
> `this.remote` picks the message-passing one -- and its
> `makeConsoleTracker` was a stale copy of the base app's, dead under
> `LOG_PROGRESS = false`.
>
> A descriptor now knows where it was loaded from (`baseUrl`, from
> `document.currentScript.src` or stamped by whoever fetched it), so it can
> name its own worker half relative to itself and be right from any page.

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
