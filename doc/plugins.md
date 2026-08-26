# Writing a plugin for the shex.js web apps

A plugin is **one URL, one module, whatever it has to add**.  The app
fetches it, runs it, and puts on the page what it says it adds; a schema
dispatches whatever semantic-action extensions it installs by IRI.  ShExMap
and ShExReduce are both written this way and neither is special --
`packages/extension-map/doc/` and `packages/extension-reduce/doc/` are the
worked examples, and `doc/plugin-skeleton/hello-plugin.js` is the smallest
one that works.

## Why "plugin": two things were called "extension"

ShEx already has extensions: the semantic-action handlers indexed at
shexSpec/extensions -- GenX, Map, Test, Eval -- each named by an IRI, each
invoked from a schema as `%<IRI>:{ code %}`, each installed on a validator
with `validator.semActHandler.register(IRI, {dispatch (…) {…}})`.  The npm
packages `@shexjs/extension-*` implement them, and the CLI uses them with
no web page in sight.

What this document describes is a different thing: a module the *web app*
loads by URL, which may install any number of those extensions -- one,
several, none -- and may change the page.  Calling both "extension" made
every sentence about either ambiguous, and made the module's `id` look like
it had to be a SemAct IRI, which a module installing two handlers (or a
pure-rendering one installing none) does not have.

So the words, as this codebase now uses them:

| word | means |
| --- | --- |
| **extension** | a semantic-action handler, named by IRI, dispatched by a schema.  The spec's word, kept for the spec's thing |
| **plugin** | a module the web app loads by URL: descriptors, `ShExPlugins`, `?plugin=`, this document.  The ordinary industry word for exactly this |
| **query-map extension** | unrelated to either: a shape-map term like `SPARQL "SELECT …"`, resolved by a data source.  The shape-map grammar's word, unchanged |

The old spellings still answer where a URL might carry them: `?extension=`
and `?extensionURL=` load plugins exactly as `?plugin=` and `?pluginURL=`
do, a manifest entry's `extensions:` is read where `plugins:` is, and the
`ShExExtensions` global is an alias of `ShExPlugins`.  New links get the
new words; old links keep working.

> Why one parameter rather than one per kind: loading and *selecting* are
> different acts.  A plugin **contributes** an extension, panes, a data
> source; what *uses* one is unchanged -- a schema dispatches an extension
> by IRI, `?neighborhood=` picks the source, a pane is on screen because it
> is there.  So the app never has to know which kinds a URL will turn out
> to hold.

## Loading one

Three ways in, and they are the same plugin however many of them a reader
uses -- registering the same `id` twice is a no-op:

| | |
| --- | --- |
| `?plugin=<url>` | repeatable; `?pluginURL=<url>` means the same thing and is what a permalink writes |
| `plugins: [<url>…]` on a manifest entry | loaded, and awaited, before the entry is read -- an entry may name what it needs |
| `<script src=…>` on the page | for a page that always wants it |

Whatever loaded it, the module runs and calls `ShExPlugins.register(…)`.
A module fetched by URL may instead export its descriptor as
`module.exports.ui`, and export `register(validator, api)` beside it for a
handler; a page script has no `module`, so it calls `register` itself.

## The descriptor

```js
ShExPlugins.register({
  id: "http://shex.io/extensions/Map/#",   // required: what names this plugin
  label: "ShExMap",                        // what to call it on screen
  …
});
```

Everything else is optional, and an app that reads a kind no descriptor
carries -- or a descriptor that carries a kind the app doesn't read yet --
is fine either way.  `id` is the identity: any string unique to this
plugin, used to deduplicate registrations and to tag what the app builds
for it.  A plugin that installs exactly one semantic-action extension
conventionally uses that extension's IRI, since the plugin is already named
by what it does; one that installs two, or none, names itself some other
way -- its own URL is a fine choice.

The register also *writes* to the descriptor, so a plugin can rely on the
bookkeeping without doing it: `baseUrl` and `applied` below are filled in
at registration, and the app marks `initialized` once `init` has run.

### What it runs on

| | |
| --- | --- |
| `scripts: [url…]` | fetched, in order, **before anything else is applied**; resolved against the plugin, not the page, since the page has never heard of your bundle.  Skipped if the page already has that exact URL |
| `baseUrl` | filled in for you -- where the module was loaded from |
| `applied` | filled in: a promise for what the apps did about it |

### On the page

A plugin with panes or controls gets a **screen**: a page-full of its own,
reached by the **screen tabs** that stand where the page title stood -- the
first of them says what the title said, so the app's own screen is a tab
like any other.  (Not to be confused with the **results tabs** below, which
are about what came *of* a screen rather than which one you are on.)  The
app's own screen is the validator -- schema, data, shape map -- and each
plugin's screen holds its panes laid out in columns (**panels**), with its
toolbar and statusbar underneath.  The results area below is shared across
screens.  A screen that is not showing is hidden and nothing else: its
panes still load from the query string and from manifest entries, its keys
still answer, and hooks like `schema` still read it -- ShExReduce's overlay
steers a validation from wherever the reader happens to be looking.  The
current screen rides in permalinks as `screen=<plugin id>`.

Applied in this order, once per app:

1. **`css`** -- a string of rules, appended to the head *after* the page's
   own, in a `<style data-plugin="<id>">`.  A plugin may therefore say
   differently what the page said.
2. **`panes`** -- each becomes a textarea, a status line, a cache that parses
   what is in it, and the query parameter and manifest key that fill it:
   ```js
   {name: "bindings",        // this.Caches[name]
    id: "bindings1",         // the div's id, for your CSS and your code
    kind: "json",            // json | schema | turtle: which cache class
    editor: "json",          // json | shexc | turtle: the editor pane
    panel: "inputs",         // which column of the screen; omit to share one
    rows: 19,                // its share of the column, and the rows it
                             // falls back to where nothing is sharing
    className: "bindings droparea",
    queryStringParm: "bindings",
    manifest: {key: "staticVars", asYamlObject: true}}
   ```
   Panes share one column of the screen unless `panel:` groups them
   otherwise: panes naming the same `panel` stack in one column, in
   declaration order.  Two say where a pane goes instead:

   - **`fill: true`** gives it the height of its column instead of the
     `rows` it asks for -- for a pane that *is* the column, like
     ShExReduce's overlay, which stands where the schema stands on the
     validator's screen.  `rows` stays as what it falls back to.
   - **`tab: {id, label}`** puts it in a results tab rather than on the
     screen -- for a pane that holds what a verb *produced*, which reads
     with the other results.  ShExReduce's AST is one.
   - **`borrow: true`** takes a pane the app already has (`name` is its
     cache's name, e.g. `inputData`) and shows it on this screen too.  It
     is the same pane -- one element, one cache, one editor -- moved to
     whichever screen is looking at it, and returned when you leave.
     ShExReduce borrows the data pane, since an overlay is written for a
     shape of data.  `borrow: "<selector>"` takes that element instead of
     the pane's whole column, which is how ShExReduce gets the schema
     document (`#schemaDocument`) without the manifest and the shape map
     that share its column.  Nothing else in the entry is read but `tabs`
     and `label`: the pane is not yours to declare.
   - **`tabs: "<id>", label: "<text>"`** puts the pane in a set of tabs
     rather than stacking it in the column: panes naming the same `tabs`
     take turns in one column, a tab each, the way the data source's
     documents do in `#dataPaneTabs`.  ShExReduce's schema and the overlay
     hung on it are `#schemaPaneTabs`.

     `manifest` is how a manifest entry fills it: `key`
   (and `<key>URL`, which is fetched and resolved against the manifest),
   `spillName` for a gist, `asYamlObject` where the entry holds a mapping
   and the pane holds JSON.  Omit `manifest` for a pane that is a *product*
   rather than an input.
3. **`resultsTabs`** -- `[{id, label}]`.  A validator has one kind of result
   and writes it into `#results`; declare a second and the results area
   becomes tabs, this app's own first.
4. **`toolbar`** -- a row of controls across the plugin's screen, under its
   columns, in order:
   ```js
   {kind: "button", id, label, title, key: {ctrl: true, key: "\\"}, run: app => …}
   {kind: "input",  id, className, placeholder, title, queryStringParm, manifest}
   {kind: "group",  id, hidden: true, controls: [ … ]}
   {kind: "status", id, className, contentId, contentTitle}
   ```
5. **`statusbar`** -- the same controls, under the toolbar rather than in it.
   Use it for anything that grows and shrinks: the toolbar's box floats, so
   something changing width in there moves the buttons under the mouse.
6. **`keys`** -- `[{id, key: {ctrl, key}, run}]`, for a verb with no button.
7. **`methods`** -- an object mixed into the app, so `this` is the app and a
   verb reads as a method of it.  A name the app already has is left alone.
8. **`init(app)`** -- once, after all of the above, for what a plugin *does*
   rather than declares.

`run` may return a promise; a failure is reported where the results go
rather than thrown into the console.

### Where a plugin writes

A plugin owns two places, and the contract is built to hand it those and
nothing else:

- **its screen** -- the panes, the toolbar and the statusbar it declared;
- **its results tab** -- what it made, and a `resultsTabStatus(id)` line for
  anything it has to say about what is in it.

Everything else on the page belongs to the app: the title, the screen tabs,
the validator's own screen and its results.  A tab is already labelled with
the kind of result it holds, so a plugin has no reason to write over the
results area as a whole -- ShExMap used to head it "materialization results"
where the tab beside it said "materialization".  What it has to say that is
more particular than the label ("stepped through", "alternative 3") it says
on its own tab's status line.  The one thing over the results a plugin may
have is `resultsTabsAside()`: the right-hand end of the tab strip, for a
control *about* the results, which put among them would push them.

Nothing enforces this -- a plugin is a script on the page and jQuery will
find anything it asks for -- but the API is shaped so that the reaching is
visible: `app.resultsTabStatus(id)`, `app.resultsTabsAside()`, and the
descriptor for everything else.  A plugin writing `$("#inputSchema")` is
doing something the contract has no name for, and that is the signal to ask
for a hook rather than to keep reaching.

One place ShExMap still reaches, deliberately: it writes `last
materialization: N ms` into the shape map's tooltip, where the app writes
the same thing for a validation.  A hook for "how long the verb took" would
be the tidy answer if a third plugin ever wanted one; for two it would be
ceremony, and the tooltip is where a reader who knows the app already looks.

### Validation

| | |
| --- | --- |
| `register(validator, api)` | install the semantic-action extensions the schema dispatches on.  `api` is the `ShExWebApp` global.  Called for a page validator and in the worker |
| `schema(schema, app)` | a turn at what is about to be validated, before it reaches a validator or crosses a `postMessage`.  Return the schema (ShExReduce hangs an overlay's actions on it) |
| `results: base => class extends base { … }` | compose the results renderer.  Two plugins compose rather than the second replacing the first |
| `onStartingValidation(app)` | a validation is starting: whatever the last one produced is about to be replaced |

### In the worker

`worker: "./my-worker-half.js"` -- named relative to the plugin.  The app
tells its worker about it on every request; the worker imports it once, and
the script registers what it adds:

```js
importScripts(pluginBase + "webpacks/my-bundle.js");   // pluginBase: where this was loaded from

registerWorkerPlugin({
  register (validator, api) { … },        // the extensions, as on the page
  requests: {                             // request types the app may send
    materialize (msg) { … self.postMessage({response: "done"}) },
  },
});
```

A worker resolves a relative `importScripts` against *its own* script and
knows nothing of the page, which is why the app names plugins absolutely
and the thread hands each one the base it came from.

## From another origin

Nothing above changes, but the module itself crosses origins by `fetch`:
the app fetches it before running it, so its host has to permit the reader
with

```
Access-Control-Allow-Origin: *
```

(or the app's origin).  The rest of a plugin's files are classic-script
loads, which a browser does not gate on that header: a `scripts` entry is a
`<script src>` injection, and the worker half is a classic worker's
`importScripts`, whose request the fetch spec leaves at its `no-cors`
default.  A worker-imported script *is* held to a JavaScript MIME type, so
serve the worker half as `text/javascript`.  Sending the header on
everything costs nothing and keeps the door open for an ESM future, where
module loads do enforce it.
`packages/shex-webapp/test/plugin-cross-origin-test.js` serves
`doc/plugin-skeleton/` from a second port and loads it from there, which is
the case this contract is for.

## Starting from the skeleton

`doc/plugin-skeleton/hello-plugin.js` is a working plugin in about forty
lines: a semantic-action extension that records what `%Hello:{ … %}`
matched, a pane, and a button that writes one into the other.  Copy it,
change the `id` to something of yours, and add what yours does.

```
shex-simple.html?plugin=https://your.example/hello-plugin.js
```

## What is not in the contract

- **Unloading.**  Plugins are additive for the session; a page that has
  loaded one keeps it.  Reload to be rid of it.
- **Ordering between plugins.**  They are applied in the order they
  registered.  Two that fight over the same id are one plugin; two that
  fight over the same DOM id are a bug in one of them.
- **Trust.**  Loading a plugin runs its author's JavaScript in the page,
  with everything the page can reach.  A URL in a manifest is a URL somebody
  wrote down; treat it as you would a script tag.
