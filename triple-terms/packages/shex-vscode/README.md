# ShEx for VS Code

Language support for [ShEx](https://shex.io/) — ShExC schemas, Turtle/TriG data,
and ShapeMaps — powered by [`@shexjs/language-server`](../shex-language-server).

## Features

- **Diagnostics** as you type, for ShExC (and ShExJ/ShExR/DCTAP), Turtle/TriG, and ShapeMaps.
- **Hover**: the constraint or shape under the cursor in ShExC; the expanded IRI of a prefixed name in Turtle.
- **Go to definition** and **find references** for shape labels.
- **Outline** of a schema's shapes.
- **Completion** of shape labels and prefixes.
- **Validate a node against a shape by pointing** — right-click a node in your data and a shape in your schema (in either order); they open side by side with the matching triples highlighted across panes (failures squiggled). No hand-written shape map, no manifest required. See [Validate a node against a shape](#validate-a-node-against-a-shape).
- **Manifest browser** — open a YAML test manifest as a scrollable table; pick an entry to open its schema and data side by side as real editors, see each node/shape's PASS/FAIL, and mouse over a constraint to light the data triples it matched (or failed). See [Browse a manifest](#browse-a-manifest).
- **Compose a manifest** — turn a run of pointing-validations into a reusable YAML manifest. See [Compose a manifest](#compose-a-manifest).
- Basic ShExC and Turtle syntax highlighting (TextMate grammars), refined by a **semantic-token overlay** from the server that distinguishes a shape's declaration from references to it.

## Develop / run from the monorepo

This extension is a workspace package. Run these **from the repo root** —
`compile` is a root script (`make ALL`), not a per-package one:

```sh
npm install
npm run compile          # builds the server, this extension, and the rest
```

Then open `packages/shex-vscode` in VS Code and press **F5** (Run Extension).
The Extension Development Host resolves `@shexjs/language-server` through the
workspace, so no separate install is needed. Open a `.shex` or `.ttl` file.

`npm run compile` (`make ALL`) is only for the first build — it compiles the
whole monorepo so the server's dependencies exist. To iterate afterwards, build
just what changed: F5's `build` task recompiles this extension **and** the
server (a `tsc` in each), or run `npm run build -w shex-vscode` /
`npm run build -w @shexjs/language-server` from the repo root.

## Validate a node against a shape

The server does the validating; the extension lets you **build the shape map by
pointing**, so you never hand-write one — and it works with any schema and data
you have open, no manifest needed.

Create two files in a folder you open in VS Code (these are the `user` entries
from [`examples/manifest.yaml`](../shex-language-server/examples/manifest.yaml)):

`user.shex`

```shex
PREFIX : <http://ex/>
:User {
  :name . ;   # exactly one name
  :age  . ?   # an optional age
}
```

`users.ttl`

```turtle
PREFIX : <http://ex/>
:alice :name "Alice" ; :age 30 .   # conforms to :User
:bob   :age 41 .                    # no :name — will not conform
```

Both files get squiggles for *syntax* errors as you type. To check
*conformance* of a node against a shape:

1. In **`users.ttl`**, right-click `:alice` → **ShEx: Validate this node…**. A
   notice confirms the node, and the status bar shows the pending selection.
2. In **`user.shex`**, right-click `:User` → **ShEx: Validate against this
   shape…**.
3. → **✓ :alice conforms to :User.** The schema and data open **side by side**
   (schema left, data right) and the matched triples light up **green** — the
   same cross-pane highlighting as the manifest browser; mouse over (or click)
   `:name` in the schema to see its triple light in the data, and vice-versa.

Now a non-conforming one — right-click **`:bob`** → *Validate this node…*, then
`:User` → *Validate against this shape…*:

→ **✗ :bob does not conform to :User**, a **red squiggle on `:bob`** in
`users.ttl`, failing triples/constraints **squiggled** across the two panes, and
the reason (the missing `:name`) in the warning and the **ShEx** output channel.

The **order doesn't matter** — right-click the *shape* first and the *node*
second for the same result. Notes:

- Both `:alice` (a prefixed name) and `<http://ex/alice>` (an absolute IRI) work;
  the extension expands prefixes for you, reading each document's own `PREFIX`
  (and `BASE`) lines.
- To validate against a schema's **start** shape, point at its `start` keyword
  (or the shape it references).
- **ShEx: Clear validation selection** (or click the status-bar item) cancels a
  pending pick.
- After a validation, **edit the schema or data and re-run it** without
  re-picking: **ShEx: Re-validate** (`ctrl+alt+r` / `cmd+alt+r`) re-runs the last
  pair (or the open manifest entry) against the live documents. Set
  `shex.autoValidateDelay` to a number of milliseconds to have it re-run
  automatically that long after you stop editing.
- Prefer to type the map? **ShEx: Validate (enter a shape map)…** takes a data
  file and a shape map like `<http://ex/alice>@<http://ex/User>` directly.

### Ready-made conformant / non-conformant pairs

You don't have to invent examples —
[`examples/manifest.yaml`](../shex-language-server/examples/manifest.yaml) in the
language-server package collects schema / data / `queryMap` triples with known
outcomes (the `user` entries are exactly the `user.shex` / `users.ttl` above).
Open it in the **[manifest browser](#browse-a-manifest)** below.

## Browse a manifest

Run **⇧⌘P → "ShEx: Open Manifest Browser"** and pick a YAML manifest (the active
editor if it is YAML, else a quick-pick). You get a scrollable **table** of its
entries — schema, data, queryMap, expected status, and a PASS/FAIL badge.

- **Arrow keys** move the highlight; **click or Enter** on an entry opens its
  **schema and data side by side** — schema on the left, data on the right — as
  real editors with highlighting, hover, go-to-definition, everything the server
  provides. A `schemaURL`/`dataURL` opens the actual file; inline content opens
  as an editable buffer (`.trig` when the data uses a `GRAPH` keyword, else
  `.ttl`).
- **Mouse over a triple constraint** in the schema (or **click / arrow onto**
  it — VS Code has no mouse-move event, so the cursor is the reliable trigger)
  and the data triples that matched it light up **green**; do the same on a data
  triple to light its constraint — the same cross-pane highlighting as the
  [ShEx.js web app](https://shex.js.dev/). The **hover tooltip names the
  counterpart**: over a schema constraint, the matched triple(s) in the *data's*
  prefixes (there may be several); over a data triple, the constraint's shape
  path in the *schema's* prefixes (e.g. `@<PatientShape>/:name/:family`).
  Failing triples/constraints are **squiggled** persistently (no hover needed).
  It's driven by the run's validation results, so **Re-run** after an edit to
  refresh it.
- The browser shows the entry's verdict and each node/shape association's
  expected-vs-actual result; a failing association **lists why** (e.g. `missing
  property :name`, `"male99" doesn't satisfy ["male" "female"]`) right in the
  detail panel. **Edit the schema or data and press Re-run** to re-validate the
  live editors.
- **Run all** checks every entry from the manifest text at once.

Full queryMap semantics are honored: `<node>@<shape>`, `@START`,
`{FOCUS predicate object}` / `{subject predicate FOCUS}` pattern queries (one
association per matching node), and `!`-negated shapes (`<node>@!<Shape>`, which
expect *nonconformant*). Entries marked `neighborhood: sparql`/`wikibase` need
the network and aren't run. It's driven by the server's `shex.loadManifest` /
`shex.runManifestEntry` commands, so the JetBrains client hosts the same view.

## Compose a manifest

Build a manifest by validating instead of writing YAML by hand. Every time you
validate a node against a shape (the [pointing flow](#validate-a-node-against-a-shape)
above), the result offers **Add to manifest**. Choosing it appends an entry —
the schema and data inline, `<node>@<shape>` as the queryMap, and the observed
result as the expected `status` — to a growing YAML document. Save it and open
it in the manifest browser (or reopen it any time with **"ShEx: Show Composed
Manifest"**). What you just validated becomes a reusable, re-runnable test.

## Package a .vsix

The extension depends on `@shexjs/language-server` and its ShEx stack. Because
those are workspace packages, packaging with `vsce` from the monorepo needs the
dependency tree flattened into the extension — bundle it (e.g. with `esbuild`)
or run `vsce package` against a standalone copy with the server installed as a
normal dependency. (Dev/F5 above needs none of this.)

## Settings

- `shex.trace.server`: `off` | `messages` | `verbose` — trace LSP traffic.

## License

MIT
