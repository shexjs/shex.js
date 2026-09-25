# ShEx for JetBrains IDEs

An IntelliJ Platform plugin (Kotlin + Gradle) that brings **ShEx (Shape
Expressions)** language support to IntelliJ IDEA and other JetBrains IDEs by
running the [`@shexjs/language-server`](../../packages/shex-language-server) as
an external Language Server, wired in through **[LSP4IJ]** (Red Hat's generic LSP
client for JetBrains).

This is one of three editor clients for the ShEx language server; it is the
JetBrains one. Its only *intelligence* is a base ShExC lexer for coloring —
every diagnostic, hover, definition, reference, outline entry, completion, and
the semantic-token highlighting comes from the server. The plugin's job is to
launch that server, tell LSP4IJ which files to send it, and paint the lexical
base under the server's semantic overlay.

[LSP4IJ]: https://plugins.jetbrains.com/plugin/23257-lsp4ij

## Quick start

You need **Node** and a **JDK (17+ / 21)** on your `PATH`. Run the npm steps
**from the repo root** — `compile` is a root script (`make ALL`), not one you'll
find in `packages/*/package.json`:

```sh
# 1. build the server this plugin launches
npm install
npm run compile                      # from the repo root; builds packages/shex-language-server/lib/server.js

# 2. get Gradle and materialize the wrapper jar (this dir ships the scripts, not the jar)
brew install gradle                  # or your OS's package manager; Gradle 9.0+
cd clients/jetbrains
gradle wrapper --gradle-version 9.0.0

# 3. launch a sandbox IDE with the plugin (and LSP4IJ) installed
#    First run downloads IntelliJ IDEA + LSP4IJ (~1 GB) -- slow once, cached after.
./gradlew runIde
```

(`npm run compile` is only the first build — the whole monorepo, so the server's
dependencies exist. To rebuild just the server after editing it, use its
targeted `tsc`: `npm run build -w @shexjs/language-server` from the repo root.)

In the sandbox IDE that opens:

1. **Open the `shex.js` repo as the project**, so the plugin finds the server at
   `packages/shex-language-server/lib/server.js`. (Opening a different project?
   Instead `export SHEX_LANGUAGE_SERVER=/abs/…/packages/shex-language-server/lib/server.js`
   before `runIde` — see [Pointing the plugin at the server](#pointing-the-plugin-at-the-server).)
2. Open a ShEx file — try `packages/shex-language-server/examples/ClinObs.shex`,
   or any `.ttl`. You should get a squiggle on a syntax error; hover a shape,
   Ctrl/Cmd-click a `@<…>` reference, open the **Structure** view for the shape
   outline, and Ctrl-Space for completion. Hover a `prefix:local` in Turtle to
   see its IRI.
3. **Open the "Language Servers" tool window** (from LSP4IJ). It shows whether
   the server started and a console of the LSP traffic — the first place to look
   if nothing lights up.

Snags: no Gradle? step 2 installs it (or run a system `gradle runIde` directly,
no wrapper needed). `lsp4ijVersion` won't resolve? the Marketplace maven prunes
old tags — set it in [`gradle.properties`](gradle.properties) to a current
release (0.19.x–0.21.x as of late 2025). `node` must be on `PATH`. To install a signed build instead of `runIde`, `./gradlew
buildPlugin` and load the zip via **Settings → Plugins → ⚙ → Install Plugin from
Disk…**.

## What you get

Once installed and pointed at a built server, opening a ShEx-family file gives
you, courtesy of the server:

- **publishDiagnostics** — syntax errors as you type (ShExC / ShExJ / ShExR /
  DCTAP schemas, Turtle/TriG data, and shape maps)
- **hover** — the constraint/shape under the cursor; in Turtle, a prefixed name
  expanded to its IRI
- **go-to-definition** and **find-references** over shape labels
- **documentSymbol** — a shape outline (Structure view / breadcrumbs)
- **completion** — shape labels and prefixes
- **semantic tokens** — the server marks a shape's declaration vs. references to
  it; LSP4IJ renders them as an overlay over the base ShExC highlighting below
- the **`shex.validate`** execute-command (data graph × schema × shape map)

Syntax highlighting is the plugin's own: base lexers for ShExC
([`ShExCLexer.kt`](src/main/kotlin/org/shexjs/jetbrains/ShExCLexer.kt) /
[`ShExCSyntaxHighlighter.kt`](src/main/kotlin/org/shexjs/jetbrains/ShExCSyntaxHighlighter.kt))
and Turtle/TriG
([`TurtleLexer.kt`](src/main/kotlin/org/shexjs/jetbrains/TurtleLexer.kt) /
[`TurtleSyntaxHighlighter.kt`](src/main/kotlin/org/shexjs/jetbrains/TurtleSyntaxHighlighter.kt))
color comments, strings, IRIs, prefixed names, keywords and numbers by the
current theme, and the server's semantic tokens refine the ShExC. So both the
schema *and* the data panes are highlighted.

### File associations

| Extensions | LSP `languageId` | How it's mapped |
|---|---|---|
| `.shex`, `.shexc` | `shexc` | IntelliJ `FileType` → `languageMapping` |
| `.shexj` | `shexj` | IntelliJ `FileType` → `languageMapping` |
| `.shexr` | `shexr` | IntelliJ `FileType` → `languageMapping` |
| `.smap`, `.shapemap` | `shapemap` | IntelliJ `FileType` → `languageMapping` |
| `.ttl`, `.trig`, `.turtle` | `turtle` | IntelliJ `FileType` → `languageMapping` + `fileNamePatternMapping` |

The RDF data extensions get their own IntelliJ language so the data panes are
highlighted — but under the ShEx-specific id **`ShExTurtle`**, not `Turtle`:
`Language(id)` rejects duplicates, so a bare `Turtle` would throw at class-load
whenever the user also has an RDF/Turtle plugin defining it. The server is
*also* bound to these files **by filename pattern** (same `serverId`, so it only
ever adds a binding), which keeps validation working even when a foreign plugin
owns the `.ttl` file type.

## Manifest browser

**Tools → Open ShEx Manifest Browser** opens a **ShEx Manifest** tool window —
the same table view the VS Code client uses, hosted here in **JCEF** (IntelliJ's
embedded browser) and driven by the server's `shex.loadManifest` /
`shex.runManifestEntry` commands over LSP4IJ.

Pick a YAML manifest (the current editor if it is YAML, else a file chooser) and
you get a scrollable table of its entries, each with a PASS/FAIL badge.
Selecting an entry opens its **schema and data side by side** — schema on the
left, data on the right (a vertical editor split) — a `schemaURL`/`dataURL`
opening the actual file, inline content a temp file (`.trig` when the data uses
a `GRAPH` keyword, else `.ttl`). They get the plugin's highlighting plus the
server's hover and go-to-definition; validation runs against those **live**
documents, so you can edit and **Re-run**. **Run all** checks every entry. Full
queryMap semantics are honored (`{FOCUS …}` / `{… FOCUS}` pattern queries and
`!`-negated shapes).

A failing association **lists why** (e.g. `missing property :name`,
`"male99" doesn't satisfy ["male" "female"]`) in the detail panel.

**Mouse over a triple constraint** in the schema and the data triples that
matched it light up **green**; mousing over a data triple lights its constraint
— the same cross-pane highlighting as the
[ShEx.js web app](https://shex.js.dev/), here a true mouseover via an
[`EditorMouseMotionListener`](src/main/kotlin/org/shexjs/jetbrains/ShexCrossHighlighter.kt).
Failing triples/constraints are **squiggled** persistently (no hover needed).
It's driven by the run's validation results, so **Re-run** after an edit to
refresh it.

The page itself is [`packages/shex-language-server/media/manifest-browser.html`](../../packages/shex-language-server/media/manifest-browser.html)
— literally the same file both editor clients load, resolved next to the server.
Requires an IDE build with JCEF (all current IntelliJ-based IDEs ship it); if it
is unavailable the tool window says so.

## Validate by pointing

Without writing a manifest: **right-click a node** in a data document →
**“ShEx: Validate This Node”**, and **right-click a shape** in a schema →
**“ShEx: Validate Against This Shape”** (either order). When both are set, the
schema and data open **side by side** (schema left, data right), the pair
`<node>@<shape>` is validated, the matching triples get the same green
wash / red squiggle cross-pane highlighting as the manifest browser (mouse over
to brighten a pairing), and the verdict shows as a balloon — **conformant**, or
**nonconformant** with the reasons. Mousing over a match also pops a tooltip
naming the counterpart: the matched **quad** in the data's vocabulary over a
schema constraint, the **shape path** (`@<Shape>/pred…`) in the schema's over a
data triple.

The pair is kept and validated against the **live** documents, so after editing
the schema or data: **Tools → ShEx: Re-validate Last Node/Shape** re-runs it
(no default keybinding — assign one in Settings ▸ Keymap, "ShEx: Re-validate",
since the obvious combos are taken by Run/Edit-Configurations), and
**Tools → ShEx: Toggle Auto-validate on Edit**
re-runs it automatically a beat after each edit. This mirrors the VS Code
client's flow; see
[`ShexPointingValidator.kt`](src/main/kotlin/org/shexjs/jetbrains/ShexPointingValidator.kt).

## Prerequisites

1. **A JetBrains IDE**, 2024.2 or newer (build 242+).
2. **[LSP4IJ]** — declared as a plugin dependency, so the Marketplace installs it
   automatically alongside this plugin (and `runIde` provisions it for you).
3. **Node.js** on your `PATH` (the server runs as `node … --stdio`).
4. **A built ShEx language server.** From the monorepo root:

   ```sh
   npm install
   npm run compile          # make ALL; once built, `cd packages/shex-language-server && npm run build` recompiles just the server
   ```

   This produces `packages/shex-language-server/lib/server.js`.

## Pointing the plugin at the server

The server path is resolved at launch, in this order:

1. **`SHEX_LANGUAGE_SERVER` environment variable**, if set. It may be either
   - a path to a built `server.js` (launched as `node <path> --stdio`), or
   - a globally-installed `shex-language-server` **bin** (launched as
     `<path> --stdio` directly — anything not ending in `.js` is treated as an
     executable).
2. **Monorepo default** — `<projectBaseDir>/packages/shex-language-server/lib/server.js`.
   This assumes the project open in the IDE is the `shex.js` repo root (this
   plugin lives at `clients/jetbrains/`, a sibling of `packages/`). Open the repo
   root as your project and, after `npm run compile`, it just works.
3. **Fallback** — a bare `shex-language-server` resolved from `PATH`.

`node` (and a bare bin) are resolved from `PATH`; the child process inherits your
console environment, so whatever Node your terminal uses is what the server uses.

### Using a globally-installed server

If you'd rather not build in-tree:

```sh
npm install -g @shexjs/language-server
# then point the plugin at the global install, e.g.:
export SHEX_LANGUAGE_SERVER="$(npm root -g)/@shexjs/language-server/lib/server.js"
# …or just the bin (which has its own `#!/usr/bin/env node` shebang):
export SHEX_LANGUAGE_SERVER=shex-language-server
```

Set the variable in the environment the IDE inherits (e.g. launch the IDE from a
shell that exports it, or use your OS's per-app environment mechanism).

## Building / trying it

This directory ships the Gradle wrapper *scripts* and configuration but **not**
the binary `gradle/wrapper/gradle-wrapper.jar` (a jar can't be checked in as
text). Materialize it once with a system Gradle (9.0+):

```sh
cd clients/jetbrains
gradle wrapper --gradle-version 9.0.0      # creates gradle-wrapper.jar
```

After that, use the wrapper as usual:

```sh
./gradlew runIde        # launch a sandbox IDE with the plugin (+ LSP4IJ) installed
./gradlew buildPlugin   # produce build/distributions/shex-jetbrains-<version>.zip
```

Install the built zip via **Settings → Plugins → ⚙ → Install Plugin from Disk…**.

If you don't want the wrapper at all, a system Gradle works directly:
`gradle runIde`, `gradle buildPlugin`.

## Versions targeted

| Component | Version | Notes |
|---|---|---|
| IntelliJ Platform Gradle Plugin | `2.18.1` | the 2.x plugin (`org.jetbrains.intellij.platform`), **not** legacy 1.x |
| Target IDE | IntelliJ IDEA `2026.2.2` | one distribution since 2025.3 (`intellijIdea(version)`, no `IC`/`IU`); `sinceBuild = 242` (floor), `untilBuild = 262.*` |
| LSP4IJ | `0.21.0` | `com.redhat.devtools.lsp4ij` (lists 2026.2 compatibility) |
| Kotlin | `2.0.21` | JVM toolchain 21 |
| Gradle | `9.0+` | via the wrapper (plugin 2.18.1 needs a current Gradle) |

All of these live in [`gradle.properties`](gradle.properties) /
[`build.gradle.kts`](build.gradle.kts) — bump them there.

## API assumptions to verify before `./gradlew buildPlugin`

This source was authored offline against the LSP4IJ / IntelliJ APIs as of late
2025. The pieces below are the ones to sanity-check if a build complains; all are
stable across recent versions, but exact coordinates drift:

- **LSP4IJ version.** `lsp4ijVersion` must match a build the Marketplace maven
  still hosts (it prunes old tags — `0.19.x–0.21.x` at time of writing; `0.8.0`
  no longer resolves). The APIs used —
  `LanguageServerFactory#createConnectionProvider`,
  `OSProcessStreamConnectionProvider#setCommandLine`,
  `LanguageServerManager#{getInstance,start,getLanguageServer}`,
  `LanguageServerItem#{getServer,getWorkspaceService}`, and the declarative
  extension points `server`, `languageMapping`, `fileNamePatternMapping` — are
  all present in `0.21.0` (verified against its source).
- **IntelliJ Platform Gradle Plugin.** `create(type, version)`,
  `defaultRepositories()`, `plugin(id, version)` and
  `pluginConfiguration { ideaVersion { … } }` are 2.x DSL. `instrumentationTools()`
  was removed in later 2.x, so it is gone here (on `2.18.1`); the plugin needs a
  current Gradle (materialize the wrapper at 9.0+).
- **Platform version.** `IC 2026.2.2`, built with `jvmToolchain(21)`;
  `pluginSinceBuild` stays `242` (the floor, so the plugin still targets 2024.2+).
  Raise `platformVersion` and `pluginUntilBuild` together for a newer IDE. (An
  older platform like `2024.2.5` makes `runIde`'s bundled Gradle plugin throw on
  a modern JDK — `JavaVersion.parse("25")` — which is why this targets a current
  build.)
- **Manifest browser — JCEF + LSP4IJ command execution.** `com.intellij.ui.jcef`
  (`JBCefBrowser`, `JBCefJSQuery`) is stable platform API. The one thing to
  confirm is how the browser sends a `workspace/executeCommand`:
  `ShexManifestBrowser.executeCommand` uses
  `LanguageServerManager.getInstance(project)` → `getLanguageServer("shexLanguageServer")`
  → `LanguageServerItem#getServer()` → lsp4j `getWorkspaceService().executeCommand(…)`,
  plus `LanguageServerManager#start(String)` to ensure the server is up. If those
  names have drifted in your LSP4IJ, that one method is the only place to adjust.

## Layout

```
clients/jetbrains/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
├── gradle/wrapper/gradle-wrapper.properties   # jar is generated by `gradle wrapper`
├── gradlew, gradlew.bat
├── src/main/
│   ├── kotlin/org/shexjs/jetbrains/
│   │   ├── ShexLanguageServerFactory.kt        # launches `node server.js --stdio`
│   │   ├── ShexFileTypes.kt                     # ShEx-family FileTypes + Languages (incl. Turtle)
│   │   ├── ShExCLexer.kt                        # base ShExC lexer (highlighting)
│   │   ├── ShExCSyntaxHighlighter.kt            # + tokens, colors, factory
│   │   ├── TurtleLexer.kt                       # base Turtle/TriG lexer (data highlighting)
│   │   ├── TurtleSyntaxHighlighter.kt           # + tokens, colors, factory
│   │   ├── ShexLsp.kt                          # shared executeCommand over LSP4IJ
│   │   ├── ShexManifestBrowser.kt              # JCEF web view <-> LSP4IJ executeCommand, split panes
│   │   ├── ShexCrossHighlighter.kt             # schema<->data mouseover highlighting + failure squiggles
│   │   ├── ShexPointingValidator.kt            # validate-by-pointing (node @ shape)
│   │   ├── ShexPointingActions.kt              # right-click "Validate This Node / Against This Shape"
│   │   ├── ShexManifestToolWindowFactory.kt    # the "ShEx Manifest" tool window
│   │   └── ShexOpenManifestBrowserAction.kt    # Tools > Open ShEx Manifest Browser
│   └── resources/META-INF/plugin.xml           # LSP4IJ server + mappings, tool window, actions
├── .gitignore
└── README.md
```
