# @shexjs/language-server

A [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
server for [ShEx](https://shex.io/), built on
[`@shexjs/editor-services`](../shex-editor-services). It gives any LSP-capable
editor the *semantic* half of ShEx tooling — the part a syntax grammar
(tree-sitter, TextMate) and a batch validator don't provide.

## Features

| Document | Provides |
| --- | --- |
| **ShExC** schema (`.shex`, `.shexc`) | diagnostics, hover, go-to-definition & find-references over shape labels, document outline, completion of shape labels and prefixes, semantic tokens (a shape's declaration vs. references to it) |
| **ShExJ / ShExR / DCTAP** schema | diagnostics (the schema language is auto-detected) |
| **Turtle / TriG** data (`.ttl`, `.trig`) | diagnostics, hover that expands a prefixed name to its IRI |
| **ShapeMap** (`.smap`, `.shapemap`) | diagnostics |

It also answers a `shex.validate` [workspace command](#validate-command) that
tests nodes for conformance against a schema (ShExC, ShExJ, or ShExR) and data
(Turtle or TriG).

## Run it

```sh
npm install -g @shexjs/language-server
shex-language-server --stdio
```

The server speaks LSP over stdio. Point any client at `shex-language-server
--stdio` (or `node .../lib/server.js --stdio`) and associate these language
ids: `shexc`, `turtle` (and `trig`), `shex-shapemap`. This repository ships two
ready clients: [VS Code](../shex-vscode) and [JetBrains](../../clients/jetbrains).

### Editors

- **Neovim** (built-in LSP):
  ```lua
  vim.lsp.start({ name = "shex", cmd = { "shex-language-server", "--stdio" },
                  filetypes = { "shexc", "turtle" } })
  ```
- **Emacs** (`eglot`): add `(shexc-mode . ("shex-language-server" "--stdio"))`
  to `eglot-server-programs`.

## Validate command

Test conformance of nodes against shapes. `workspace/executeCommand` with

```
command:   "shex.validate"
arguments: [ schemaText, dataText, shapeMapText, base? ]
```

The **schema** may be ShExC, ShExJ, or ShExR (auto-detected); the **data**
Turtle or TriG; `shapeMapText` a *fixed* shape map (`<focusNode>@<shapeLabel>`,
or `@START` — relative IRIs resolve against `base`, default `http://a.example/`).
The reply is `{ "results": [ … ] }` — each result `"conformant"` or
`"nonconformant"` (proof/errors under `"appinfo"`) — or `{ "errors": [ … ] }`.

Framing this by hand means counting `Content-Length` bytes, so use the REPL.

## Manifest commands

Two more commands drive the editor **manifest browsers** over
`workspace/executeCommand`:

- **`shex.loadManifest`** — `[ manifestText, manifestPath? ]` → `{ entries: [ … ] }`.
  Parses a YAML/JSON manifest (the [conventional form](#examples-and-the-manifest-browser)),
  reading any `schemaURL`/`dataURL` relative to `manifestPath`.
- **`shex.runManifestEntry`** — `[ schemaText, dataText, queryMapText, expectedStatus?, base? ]`
  → `{ assocs: [ { node, shape, negated, expected, actual, pass } ], pass }`, or
  `{ errors }`. Resolves the queryMap against the data — including
  `{FOCUS … }` / `{ … FOCUS}` pattern queries (one association per matching node)
  and `!`-negated shapes (`<node>@!<Shape>`, expecting *nonconformant*) —
  validates every association, and reports the per-association and overall
  PASS/FAIL.

Unlike `shex.validate`, these are not advertised in the server's
`executeCommandProvider` (so a client won't auto-bind a command that collides
with its own); invoke them directly.

## The REPL

[`examples/lsp-repl.js`](examples/lsp-repl.js) drives the server for you. You
fill four slots — **`schema`**, **`data`**, **`node`**, **`shape`** — then
`SEND` validates the node against the shape. The header marks each filled slot
with a ✓; the plain ones are what's still empty.

```console
$ node examples/lsp-repl.js
ClinObs.shex   ✓schema ✓data ✓node ✓shape
…
> schema examples/ClinObs.shex      # a path or a URL
> node <Obs1>
> shape START
> SEND
conformant
```

`schema`/`data` load from a path or URL; `node`, `shape`, and `map
<node>@<shape>` set the rest. `check schema` / `check data` validate one
document's **format** on its own — the server answers with its diagnostics (the
same check an editor makes on open). The prompt has command/path **tab
completion**, history (`↑`/`↓`), and `C-a`/`C-e`/`C-u`/`C-k`/`C-w` line editing.

With no TTY it runs **headless** — reads commands from stdin, one per line, and
prints results — so a session can live in a piped script or a heredoc.

## Examples and the manifest browser

The examples live in [`examples/manifest.yaml`](examples/manifest.yaml), a ShEx
manifest in the conventional shex.js form (an array of `schemaLabel` /
`schema`|`schemaURL` / `dataLabel` / `data`|`dataURL` / `queryMap` / `status`
entries — the shex-webapp reads the same JSON/YAML). The default is the webapp's
clinical-observation examples plus a couple of tiny ones. The REPL loads and
resolves it (reading any `schemaURL`/`dataURL` relative to the manifest), and
the tests drive the same file through the REPL — so what you run is what CI
checks.

The same manifest opens in the editor **manifest browsers**
([VS Code](../shex-vscode/README.md#browse-a-manifest), and JetBrains), which
render it as a table and open each entry's schema and data as real editor
documents — via the [`shex.loadManifest` / `shex.runManifestEntry`](#manifest-commands)
commands above. The terminal REPL below is the same idea without an editor.

```console
> manifest                  # load examples/manifest.yaml
loaded 2 schema(s), 7 data from examples/manifest.yaml
> list
   0  clinical observation / the least an Observation can be  [conformant]
   2  clinical observation / no subject  [nonconformant]
   …
> pick 2                    # fill all four slots from an entry
loaded "clinical observation / no subject"; ready — SEND
> SEND                      # -> nonconformant
```

In a real terminal the menu and the prompt share one screen. Once a manifest is
loaded, **ctrl-↑ / cmd-↑** moves focus up to the menu and **ctrl-↓ / cmd-↓**
back down to the prompt. The menu has two panes — schemas on the left, and, for
the selected one, its data on the right:

```
manifest.yaml   ✓schema ✓data ✓node ✓shape
↑↓ move · ↵/space select · ←back · ctrl-↓ prompt · q

  schema                        data
❯ clinical observation          no subject [nonconformant]
  user                          a status outside the value set [nonconformant]

slots
  { "schema": "<Obs1> :status \"final\" .", "node": "<Obs1>", "shape": "START" … }
> _
```

Move with the arrows or `j`/`k`; `↵` or `space` picks (a schema opens its data;
a data item **fills all four slots** and shows them in the block); `←`/`h` goes
back a column; `q` quits the menu. Then `ctrl-↓` to the prompt and `SEND`.
`list` and `pick <n>` are the same thing for a piped script.

A manifest can name schemas and data by `schemaURL`/`dataURL` (loaded relative
to the manifest) as well as inline them; a full manifest's `neighborhood:
sparql`/`wikibase` entries need the network and aren't run here.

### The three schema languages

The command auto-detects the schema language, so the same shape validates as
ShExC, ShExJ, or ShExR — `schema some.shexj` / `schema some.shexr` load either
the way a `.shex` does:

```turtle
# ShExR -- a schema as RDF
PREFIX sx: <http://www.w3.org/ns/shex#>
PREFIX : <http://ex/>
[] a sx:Schema ; sx:shapes ( :User ) .
:User a sx:ShapeDecl ; sx:shapeExpr [ a sx:Shape ; sx:expression [
  a sx:EachOf ; sx:expressions (
    [ a sx:TripleConstraint ; sx:predicate :name ]
    [ a sx:TripleConstraint ; sx:predicate :age ; sx:min 0 ; sx:max 1 ] ) ] ] .
```

## Design

The server is a thin adapter. Every parse, location, and diagnostic comes from
`@shexjs/editor-services`; `server.ts` only translates between that module's
character-offset ranges and LSP's line/character positions. Cross-document
validation is loaded lazily (`validate.ts`) so a schema-only session never
loads the validator.

## License

MIT
