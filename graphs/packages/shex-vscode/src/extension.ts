/** The VS Code client shell.  It is deliberately thin: it launches
 * @shexjs/language-server over stdio and lets the Language Server Protocol
 * carry diagnostics, hover, go-to-definition, references, the outline and
 * completion.
 *
 * On top of the server it adds a little editor ergonomics the protocol can't:
 * a way to build a shape map by pointing at a node and a shape -- right-click a
 * node in your data, then a shape in your schema (or the other way round) -- and
 * see the result highlighted on the node.  Every actual validation is still done
 * by the server's `shex.validate` command; this file only gathers the node,
 * the shape, and the two documents, and paints the answer.
 */
"use strict";

import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  LanguageClient, LanguageClientOptions, ServerOptions, TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;
let clientStarted: Promise<void> | undefined; // resolves when the server is ready
let cross: CrossHighlight;                    // shared schema<->data highlighter (manifest browser + pointing)
// Re-run the current validation (a pointing pair or the open manifest entry)
// against the *live* documents; set by whichever validated last.
let revalidateCurrent: (() => void | Promise<void>) | undefined;
let autoValidateTimer: ReturnType<typeof setTimeout> | undefined;

/** Where nonconformant nodes get their red squiggle. */
const validationDiagnostics = vscode.languages.createDiagnosticCollection("shex-validation");

/** A node or a shape the user has pointed at, waiting for its partner. */
interface Marked {
  atom: string;         // the shape-map atom: "<iri>" or the START keyword
  label: string;        // what the user clicked, for messages (":alice", "<...>")
  text: string;         // the whole document it came from (schema or data)
  uri: vscode.Uri;
  base?: string;        // a data document's declared BASE, if any
  range: vscode.Range;  // where the term sits, so we can highlight it
}
let pendingNode: Marked | undefined;
let pendingShape: Marked | undefined;
let status: vscode.StatusBarItem;

export function activate (context: vscode.ExtensionContext): void {
  // The server is a dependency of this extension, so it resolves whether we run
  // from the monorepo (workspace symlink) or from a packaged .vsix.
  const serverModule = require.resolve("@shexjs/language-server/lib/server.js");

  const serverOptions: ServerOptions = {
    run:   { module: serverModule, transport: TransportKind.stdio },
    debug: { module: serverModule, transport: TransportKind.stdio,
             options: { execArgv: ["--nolazy", "--inspect=6009"] } },
  };

  const clientOptions: LanguageClientOptions = {
    // No `scheme`, so the server also serves inline manifest schemas/data that
    // the manifest browser opens as `untitled:` documents, not just `file:`.
    documentSelector: [
      { language: "shexc" },
      { language: "turtle" },
      { language: "shex-shapemap" },
    ],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.{shex,shexc,ttl,trig,smap,shapemap}"),
    },
    // The server reads this to decide what a ShExC-constraint mouseover does:
    // "highlight" the matching data triples (default) or show its ShExJ tooltip.
    initializationOptions: { schemaMouseover: schemaMouseoverSetting() },
  };

  status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  status.command = "shex.clearValidationSelection";

  // Mutual schema<->data highlighting, shared by the manifest browser and the
  // pointing (right-click a node, then a shape) flow.
  cross = new CrossHighlight();

  client = new LanguageClient("shex", "ShEx Language Server", serverOptions, clientOptions);
  context.subscriptions.push(
    client, // dispose (stop the server) when the extension deactivates
    validationDiagnostics, status, cross,
    // One hover provider serves both panes; it paints the counterpart ranges and
    // returns the match/failure message as the tooltip (see CrossHighlight).
    vscode.languages.registerHoverProvider(
      [{ language: "shexc" }, { language: "turtle" }],
      { provideHover: (doc, pos) => cross.hover(doc, pos) }),
    // Cursor-driven counterpart to the hover (a reliable, mouse-free trigger).
    vscode.window.onDidChangeTextEditorSelection(e => cross.onSelection(e.textEditor)),
    // Re-apply the always-on markers when tabs/splits change, so every editor
    // showing the schema or data carries them (not just the first).
    vscode.window.onDidChangeVisibleTextEditors(() => cross.refreshVisible()),
    // Re-run the last validation on demand (against the live documents).
    vscode.commands.registerCommand("shex.revalidate", () => revalidateCurrent?.()),
    // ...and, if `shex.autoValidateDelay` > 0, automatically that many ms after
    // an edit to the current schema or data.
    vscode.workspace.onDidChangeTextDocument(e => {
      const delay = vscode.workspace.getConfiguration("shex").get<number>("autoValidateDelay", 0);
      if (delay > 0 && revalidateCurrent && cross.owns(e.document)) {
        if (autoValidateTimer) clearTimeout(autoValidateTimer);
        autoValidateTimer = setTimeout(() => { void revalidateCurrent?.(); }, delay);
      }
    }),
    // Let the schema-mouseover choice take effect without a restart.
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("shex.schemaMouseover"))
        void client.sendNotification("workspace/didChangeConfiguration",
          { settings: { shex: { schemaMouseover: schemaMouseoverSetting() } } });
    }),
    // NB: none of these ids may be the server's advertised command
    // ("shex.validate").  The client auto-registers every id in the server's
    // executeCommandProvider, so reusing it here throws "command already exists"
    // during initialize.  These are editor-side wrappers that *forward* to it.
    vscode.commands.registerCommand("shex.validateThisNode", validateThisNode),
    vscode.commands.registerCommand("shex.validateAgainstThisShape", validateAgainstThisShape),
    vscode.commands.registerCommand("shex.clearValidationSelection", clearSelection),
    vscode.commands.registerCommand("shex.validateInteractive", runValidateTyped),
    vscode.commands.registerCommand("shex.openManifestBrowser", openManifestBrowser),
    vscode.commands.registerCommand("shex.showComposedManifest", showComposedManifest),
  );
  // start() rejects if the server can't launch or the LSP handshake fails.
  // Surface that -- otherwise it becomes a silent unhandled rejection and all
  // the user sees is the client's terse "Server process exited" line.
  clientStarted = client.start();
  clientStarted.catch((err: unknown) => {
    const msg = err instanceof Error ? (err.stack || err.message) : String(err);
    client.outputChannel.appendLine("ShEx: language client failed to start:\n" + msg);
    client.outputChannel.show(true);
    void vscode.window.showErrorMessage(
      "ShEx language server failed to start; see the \"ShEx Language Server\" output channel.");
  });
}

// --- pointing at a node and a shape ----------------------------------------

/** Right-click a node in a Turtle document (or run from the palette with the
 * cursor on one).  If a shape is already selected, validate now; otherwise
 * remember the node and wait for a shape. */
async function validateThisNode (): Promise<void> {
  const ed = vscode.window.activeTextEditor;
  if (!ed || kindOf(ed.document) !== "data") {
    vscode.window.showWarningMessage("Put the cursor on a node in a Turtle/TriG document, then run this.");
    return;
  }
  const term = termAtCursor(ed);
  const prefixes = collectPrefixes(ed.document.getText());
  const atom = term && iriAtom(term.token, prefixes);
  if (!term || !atom) {
    vscode.window.showWarningMessage("Couldn't read a node here. Put the cursor on the node term (e.g. :alice or <http://…>) and retry.");
    return;
  }
  if (looksLikeNamespace(atom, prefixes, "a node")) return;
  pendingNode = { atom, label: term.token, text: ed.document.getText(), uri: ed.document.uri,
                  base: collectBase(ed.document.getText()), range: term.range };
  await maybeValidate(`node ${describeTerm(term.token, atom)}`, "a shape in your schema");
}

/** Right-click a shape in a ShExC schema (or run from the palette with the
 * cursor on one).  If a node is already selected, validate now; otherwise
 * remember the shape and wait for a node. */
async function validateAgainstThisShape (): Promise<void> {
  const ed = vscode.window.activeTextEditor;
  if (!ed || kindOf(ed.document) !== "schema") {
    vscode.window.showWarningMessage("Put the cursor on a shape label in a ShExC schema, then run this.");
    return;
  }
  const term = termAtCursor(ed);
  const prefixes = collectPrefixes(ed.document.getText());
  const atom = term && shapeAtom(term.token, prefixes);
  if (!term || !atom) {
    vscode.window.showWarningMessage("Couldn't read a shape here. Put the cursor on the shape label (e.g. :User, <http://…>, or START) and retry.");
    return;
  }
  if (looksLikeNamespace(atom, prefixes, "a shape")) return;
  pendingShape = { atom, label: term.token, text: ed.document.getText(), uri: ed.document.uri, range: term.range };
  await maybeValidate(`shape ${describeTerm(term.token, atom)}`, "a node in your data");
}

/** If both a node and a shape are now selected, validate the pair; otherwise
 * report what is still needed. */
async function maybeValidate (justPicked: string, stillNeed: string): Promise<void> {
  if (pendingNode && pendingShape) {
    const node = pendingNode, shape = pendingShape;
    pendingNode = pendingShape = undefined;
    status.hide();
    await validatePair(node, shape);
  } else {
    status.text = `$(target) ShEx: ${justPicked} — pick ${stillNeed}`;
    status.tooltip = "Click to clear the ShEx validation selection";
    status.show();
    vscode.window.showInformationMessage(
      `ShEx: ${justPicked} selected. Now right-click ${stillNeed} and choose the matching “ShEx: Validate …”.`);
  }
}

function clearSelection (): void {
  pendingNode = pendingShape = undefined;
  status.hide();
}

/** Send the node/shape pair to the server and paint the answer: a red squiggle
 * on the node when it doesn't conform, an information message when it does, and
 * the full proof/errors in the "ShEx" output channel either way. */
async function validatePair (node: Marked, shape: Marked): Promise<void> {
  const shapeMap = `${node.atom}@${shape.atom}`;
  revalidateCurrent = () => validatePair(node, shape);   // "ShEx: Re-validate" / auto re-run this pair
  validationDiagnostics.delete(node.uri);

  // Reuse the tabs the user already has open -- only reveal a document that
  // isn't visible anywhere (beside the active editor).  Forcing fixed columns
  // duplicated panes the user had arranged; since you right-clicked in both
  // editors they're normally already on screen, so nothing moves.
  const schemaDoc = await vscode.workspace.openTextDocument(shape.uri);
  const dataDoc = await vscode.workspace.openTextDocument(node.uri);
  const isVisible = (doc: vscode.TextDocument) => vscode.window.visibleTextEditors.some(e => e.document === doc);
  if (!isVisible(schemaDoc)) await vscode.window.showTextDocument(schemaDoc, { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true, preview: false });
  if (!isVisible(dataDoc)) await vscode.window.showTextDocument(dataDoc, { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true, preview: false });
  cross.setSlot(schemaDoc, dataDoc);

  let res: any;
  try {
    // runManifestEntry (not shex.validate) so we get the correspondences that
    // drive highlighting, plus per-association failure reasons -- validated
    // against the live documents so the ranges line up with what's on screen.
    res = await client.sendRequest("workspace/executeCommand", {
      command: "shex.runManifestEntry",
      arguments: [schemaDoc.getText(), dataDoc.getText(), shapeMap, "conformant", collectBase(dataDoc.getText())],
    });
  } catch (e) {
    vscode.window.showErrorMessage("ShEx: validation request failed: " + (e as Error).message);
    return;
  }

  const { correspondences, ...rest } = res || {};
  cross.setCorrespondences(correspondences as Correspondence[] | undefined);

  const out = vscode.window.createOutputChannel("ShEx");
  out.clear();
  out.appendLine(`# ${shapeMap}`);
  out.appendLine(JSON.stringify(rest, null, 2));

  if (rest && rest.errors && rest.errors.length) {
    vscode.window.showWarningMessage(`ShEx: ${rest.errors[0]}`);
    out.show(true);
    return;
  }
  const assoc = rest.assocs && rest.assocs[0];
  const status = assoc && assoc.actual === "conformant" ? "conformant" : "nonconformant";
  const ADD = "Add to manifest";
  let choice: string | undefined;
  if (status === "conformant") {
    choice = await vscode.window.showInformationMessage(`ShEx: ✓ ${node.label} conforms to ${shape.label}.`, ADD);
  } else {
    const why = assoc && assoc.reasons && assoc.reasons.length ? " " + assoc.reasons[0] : "";
    const diag = new vscode.Diagnostic(node.range,
      `Does not conform to ${shape.label}.${why}`, vscode.DiagnosticSeverity.Error);
    diag.source = "shex";
    validationDiagnostics.set(node.uri, [diag]);
    out.show(true);
    choice = await vscode.window.showWarningMessage(`ShEx: ✗ ${node.label} does not conform to ${shape.label}.`, ADD);
  }
  if (choice === ADD) await addComposedEntry(node, shape, status);
}

// --- composing a manifest from validations ----------------------------------

let composeDoc: vscode.TextDocument | undefined;

/** Append the just-validated node/shape pair to a growing YAML manifest (an
 * untitled document), schema and data inline and the observed status as the
 * expected one -- so a session of pointing validations becomes a reusable test
 * manifest you can save and open in the browser. */
async function addComposedEntry (node: Marked, shape: Marked, status: string): Promise<void> {
  const entry = yamlEntry({
    schemaLabel: labelFromUri(shape.uri, "schema"), schema: shape.text,
    dataLabel: labelFromUri(node.uri, "data"), data: node.text,
    queryMap: `${node.atom}@${shape.atom}`, status,
  });
  if (!composeDoc || composeDoc.isClosed)
    composeDoc = await vscode.workspace.openTextDocument({ language: "yaml",
      content: "# ShEx manifest composed from validations — save it, then run “ShEx: Open Manifest Browser”.\n" });
  const edit = new vscode.WorkspaceEdit();
  edit.insert(composeDoc.uri, new vscode.Position(composeDoc.lineCount, 0), entry);
  await vscode.workspace.applyEdit(edit);
  await vscode.window.showTextDocument(composeDoc, { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true, preview: false });
}

/** Reveal the composed manifest, or explain how to start one. */
async function showComposedManifest (): Promise<void> {
  if (composeDoc && !composeDoc.isClosed) await vscode.window.showTextDocument(composeDoc, { preview: false });
  else void vscode.window.showInformationMessage("No composed manifest yet. Validate a node against a shape and choose “Add to manifest”.");
}

function labelFromUri (uri: vscode.Uri, fallback: string): string {
  const base = path.basename(uri.fsPath).replace(/\.[^.]+$/, "");
  return base && !/^untitled/i.test(base) ? base : fallback;
}

/** One manifest entry as YAML: single-line fields double-quoted (always valid),
 * schema/data as `|` block scalars. */
function yamlEntry (e: { schemaLabel: string; schema: string; dataLabel: string; data: string; queryMap: string; status: string }): string {
  const block = (key: string, text: string) =>
    `  ${key}: |\n` + text.replace(/\n$/, "").split("\n").map(l => "    " + l).join("\n") + "\n";
  const q = (s: string) => JSON.stringify(s); // a JSON string is a valid YAML double-quoted scalar
  return `- schemaLabel: ${q(e.schemaLabel)}\n`
    + block("schema", e.schema)
    + `  dataLabel: ${q(e.dataLabel)}\n`
    + block("data", e.data)
    + `  queryMap: ${q(e.queryMap)}\n`
    + `  status: ${e.status}\n`;
}

// --- the typed fallback (no cursor, no manifest) ---------------------------

/** Validate the active ShExC schema against a chosen Turtle document and a
 * shape map the user types.  The power-user path when pointing is inconvenient. */
async function runValidateTyped (): Promise<void> {
  const schema = vscode.window.activeTextEditor;
  if (!schema || kindOf(schema.document) !== "schema") {
    vscode.window.showWarningMessage("Open a ShExC schema in the active editor, then run this.");
    return;
  }
  const dataUris = await vscode.workspace.findFiles("**/*.{ttl,trig,turtle}", "**/node_modules/**", 50);
  const pick = dataUris.length
    ? await vscode.window.showQuickPick(
        dataUris.map(u => ({ label: vscode.workspace.asRelativePath(u), uri: u })),
        { placeHolder: "Turtle data to validate" })
    : undefined;
  if (!pick) { vscode.window.showWarningMessage("No Turtle data file chosen."); return; }
  const dataDoc = await vscode.workspace.openTextDocument(pick.uri);
  const shapeMap = await vscode.window.showInputBox({
    prompt: "Shape map", value: "<node>@START", placeHolder: "<focusNode>@<shapeLabel>",
  });
  if (!shapeMap) return;

  const res: any = await client.sendRequest("workspace/executeCommand", {
    command: "shex.validate",
    arguments: [schema.document.getText(), dataDoc.getText(), shapeMap, collectBase(dataDoc.getText())],
  });
  const out = vscode.window.createOutputChannel("ShEx");
  out.clear();
  out.appendLine(JSON.stringify(res, null, 2));
  out.show(true);
}

// --- cross-pane highlighting (schema constraint <-> data triple) ------------

/** An LSP-style 0-based line/character range, as the server's manifest
 * `correspondences` speak it. */
interface LspRange { startLine: number; startChar: number; endLine: number; endChar: number; }

/** One schema-constraint <-> data-triple correspondence from a validation run
 * (the language server's `correspondencesOf`, built from the *regular*
 * validation results -- the matched/failed triples under each constraint --
 * not from ShExMap materialization). */
interface Correspondence {
  status: "conformant" | "nonconformant";
  message: string;
  schema: LspRange[];
  data: LspRange[];
  quad?: string;   // matched data triple (data vocabulary) -- shown over the schema
  path?: string;   // shape path `@Shape/pred…` (schema vocabulary) -- shown over the data
}

/** Mutual hover highlighting between a manifest entry's schema and data panes,
 * a la the ShEx.js WebApp: hovering a triple constraint lights the data triples
 * that matched (green) or failed (red) it, and hovering a data triple lights
 * its constraint.  VS Code has no "token hovered" event, so the highlight is a
 * side effect of the hover provider that also supplies the tooltip. */
class CrossHighlight {
  // A light fill plus a solid outline: the outline stays visible even when the
  // hover tooltip paints VS Code's own hoverHighlightBackground over the term
  // (a bare background just blends away, which read as the highlight vanishing).
  private readonly match = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(88, 199, 122, 0.20)", border: "1px solid rgba(88, 199, 122, 0.9)", borderRadius: "2px",
    overviewRulerColor: "rgba(88, 199, 122, 0.85)", overviewRulerLane: vscode.OverviewRulerLane.Center,
  });
  private readonly fail = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(229, 92, 92, 0.20)", border: "1px solid rgba(229, 92, 92, 0.9)", borderRadius: "2px",
    overviewRulerColor: "rgba(229, 92, 92, 0.85)", overviewRulerLane: vscode.OverviewRulerLane.Center,
  });
  // A faint, *always-on* wash over every matched triple/constraint, so the
  // correspondences are visible the moment an entry validates -- no hover
  // needed. Hovering (or the cursor) then brightens the specific pairing.
  private readonly persist = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(88, 199, 122, 0.13)",
    overviewRulerColor: "rgba(88, 199, 122, 0.5)", overviewRulerLane: vscode.OverviewRulerLane.Right,
  });
  // Persistent squiggles for the failures, so they show without any hovering.
  private readonly diags = vscode.languages.createDiagnosticCollection("shex-manifest");
  private schema?: vscode.TextDocument;
  private data?: vscode.TextDocument;
  private corr: Correspondence[] = [];

  /** Point at the entry's currently-open schema/data documents (or clear when
   * called with none), forgetting the previous entry's correspondences. */
  setSlot (schema?: vscode.TextDocument, data?: vscode.TextDocument): void {
    this.schema = schema; this.data = data; this.corr = [];
    this.paint([]);
    this.applyPersistent();
  }
  setCorrespondences (corr: Correspondence[] | undefined): void {
    this.corr = corr || [];
    this.paint([]);           // drop any sticky brighten from the previous run
    this.applyPersistent();   // wash the matches + squiggle the failures right away
    // A brief confirmation the pipeline fired (and a diagnostic: if you see this
    // but no highlighting, the decorations aren't landing on the pane).
    if (this.corr.length)
      void vscode.window.setStatusBarMessage(`$(link) ShEx: linked ${this.corr.length} triple${this.corr.length === 1 ? "" : "s"}`, 5000);
  }

  /** The hover entry point, shared by the schema and data providers: paints the
   * counterpart ranges (and the hovered range itself) and returns the matched
   * messages as the tooltip. */
  hover (doc: vscode.TextDocument, pos: vscode.Position): vscode.Hover | undefined {
    const side = this.sideOf(doc);
    if (!side) return undefined;
    const hits = this.hitsAt(doc, side, doc.offsetAt(pos));
    // Sticky: only (re)paint when actually over a correspondence.  Never clear
    // on an empty hover -- as the tooltip opens the pointer settles a hair off
    // the token and that stray no-hit event was wiping the counterpart's
    // brighten (leaving only the wash).  It clears on the next validation.
    if (!hits.length) return undefined;
    this.paint(hits);
    // Over the schema: the matched data triple(s) in the data's vocabulary
    // (there may be several).  Over the data: the constraint's shape path in
    // the schema's vocabulary.  A failure appends why.  No range on the Hover:
    // VS Code paints its own highlight over a hover's range, covering ours.
    const lines: string[] = [];
    const seen = new Set<string>();
    for (const h of hits) {
      const primary = side === "schema" ? h.quad : h.path;
      const line = primary
        ? "`" + primary + "`" + (h.status === "nonconformant" ? " — " + h.message : "")
        : h.message;
      if (!seen.has(line)) { seen.add(line); lines.push(line); }
    }
    return new vscode.Hover(lines.join("\n\n"));
  }

  /** Cursor-driven counterpart: clicking or arrowing onto a constraint/triple
   * highlights its counterpart -- a reliable trigger next to the hover (VS Code
   * has no mouse-move event, and hover is easy to miss). */
  onSelection (ed: vscode.TextEditor): void {
    const side = this.sideOf(ed.document);
    if (!side) return;
    const hits = this.hitsAt(ed.document, side, ed.document.offsetAt(ed.selection.active));
    if (hits.length) this.paint(hits);   // sticky, as in hover()
  }

  private sideOf (doc: vscode.TextDocument): "schema" | "data" | null {
    const u = doc.uri.toString();   // match by URI, not instance (VS Code may hand back a fresh doc)
    return this.schema && u === this.schema.uri.toString() ? "schema"
      : this.data && u === this.data.uri.toString() ? "data" : null;
  }
  private hitsAt (doc: vscode.TextDocument, side: "schema" | "data", offset: number): Correspondence[] {
    return this.corr.filter(c => c[side].some(r => this.within(doc, r, offset)));
  }

  /** The always-on markers: a faint green wash on every matched range, and a
   * warning squiggle on every failing range (present-but-wrong triples; a
   * missing triple has no data range, so its reason shows in the detail panel
   * instead).  Re-applied on every setSlot/setCorrespondences. */
  private applyPersistent (): void {
    this.diags.clear();
    const forDoc = (doc: vscode.TextDocument | undefined, side: "schema" | "data") => {
      if (!doc) return;
      const wash: vscode.Range[] = [];
      const ds: vscode.Diagnostic[] = [];
      for (const c of this.corr)
        for (const r of c[side]) {
          if (c.status === "conformant") wash.push(this.toRange(r));
          else ds.push(new vscode.Diagnostic(this.toRange(r), c.message, vscode.DiagnosticSeverity.Warning));
        }
      for (const ed of this.editorsFor(doc)) ed.setDecorations(this.persist, wash);   // every tab showing it
      if (ds.length) this.diags.set(doc.uri, ds);           // diagnostics are per-URI already
    };
    forDoc(this.schema, "schema");
    forDoc(this.data, "data");
  }

  /** Re-apply the always-on markers when the set of visible editors changes
   * (e.g. another tab/split of the schema or data appears). */
  refreshVisible (): void { this.applyPersistent(); }

  /** True if `doc` is the current entry's schema or data (for auto-revalidate). */
  owns (doc: vscode.TextDocument): boolean { return this.sideOf(doc) !== null; }

  /** Every visible editor showing `doc`'s file (matched by URI, and there may
   * be more than one tab/split). */
  private editorsFor (doc: vscode.TextDocument): vscode.TextEditor[] {
    const u = doc.uri.toString();
    return vscode.window.visibleTextEditors.filter(e => e.document.uri.toString() === u);
  }

  private paint (hits: Correspondence[]): void {
    const apply = (doc: vscode.TextDocument | undefined, side: "schema" | "data") => {
      if (!doc) return;
      const ok: vscode.Range[] = [], bad: vscode.Range[] = [];
      for (const h of hits)
        for (const r of h[side])
          (h.status === "conformant" ? ok : bad).push(this.toRange(r));
      for (const ed of this.editorsFor(doc)) {
        ed.setDecorations(this.match, ok);
        ed.setDecorations(this.fail, bad);
      }
    };
    apply(this.schema, "schema");
    apply(this.data, "data");
  }

  private within (doc: vscode.TextDocument, r: LspRange, offset: number): boolean {
    const from = doc.offsetAt(new vscode.Position(r.startLine, r.startChar));
    const to = doc.offsetAt(new vscode.Position(r.endLine, r.endChar));
    return offset >= from && offset <= to;
  }
  private toRange (r: LspRange): vscode.Range {
    return new vscode.Range(r.startLine, r.startChar, r.endLine, r.endChar);
  }
  dispose (): void { this.match.dispose(); this.fail.dispose(); this.persist.dispose(); this.diags.dispose(); }
}

// --- manifest browser (shared webview) --------------------------------------

/** Open the shared manifest-browser webview on a chosen YAML manifest, and
 * bridge its messages to the server's `shex.loadManifest`/`shex.runManifestEntry`
 * commands.  The HTML/JS lives in @shexjs/language-server so the JetBrains
 * client can host the very same page. */
async function openManifestBrowser (): Promise<void> {
  const uri = await pickManifest();
  if (!uri) return;

  const panel = vscode.window.createWebviewPanel(
    "shexManifest", "ShEx Manifest", vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true });
  panel.webview.html = manifestBrowserHtml(panel.webview);

  let entries: any[] = [];
  let tmpDir: string | undefined;                        // holds inline schema/data as real files
  const tmp = () => (tmpDir ??= fs.mkdtempSync(path.join(os.tmpdir(), "shex-manifest-")));
  // The schema/data docs for the current entry, and the temp-file URIs this
  // browser opened (so it can tidy them away on the next selection -- but never
  // one the user has edited).
  const slot: { index?: number; schema?: vscode.TextDocument; data?: vscode.TextDocument } = {};
  const owned = new Set<string>();
  const isDirtyOpen = (u: string) => vscode.workspace.textDocuments.some(d => d.uri.toString() === u && d.isDirty);

  const loadEntries = async () => {
    try { await clientStarted; } catch { return; } // server failed; already reported
    const text = (await vscode.workspace.openTextDocument(uri)).getText();
    const res: any = await client.sendRequest("workspace/executeCommand",
      { command: "shex.loadManifest", arguments: [text, uri.scheme === "file" ? uri.fsPath : ""] });
    if (res && res.errors) { void vscode.window.showErrorMessage("ShEx manifest: " + res.errors.join("; ")); return; }
    entries = (res && res.entries) || [];
    void panel.webview.postMessage({ type: "manifest", entries, file: vscode.workspace.asRelativePath(uri) });
  };

  const closeOwned = async () => {
    for (const u of Array.from(owned)) {
      if (isDirtyOpen(u)) continue;                       // keep buffers the user edited
      for (const g of vscode.window.tabGroups.all)
        for (const t of g.tabs)
          if (t.input instanceof vscode.TabInputText && t.input.uri.toString() === u)
            await vscode.window.tabGroups.close(t);
      owned.delete(u);
    }
  };
  // Inline content becomes a real temp file (full language support, clean
  // open/close); a schemaURL/dataURL opens the real file itself.
  const openSlot = async (fsPath: string | undefined, content: string | undefined,
                          tmpName: string, column: vscode.ViewColumn): Promise<vscode.TextDocument> => {
    let fileUri: vscode.Uri;
    if (fsPath) fileUri = vscode.Uri.file(fsPath);
    else {
      const p = path.join(tmp(), tmpName);
      fileUri = vscode.Uri.file(p);
      if (!isDirtyOpen(fileUri.toString())) fs.writeFileSync(p, content || "");
      owned.add(fileUri.toString());
    }
    const doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc, { viewColumn: column, preserveFocus: true, preview: false });
    return doc;
  };
  // Open an entry's schema and data as real, editable, highlighted, navigable
  // documents (schema in column 2, data in column 3).
  const openEntry = async (i: number) => {
    const e = entries[i];
    if (!e) return;
    await closeOwned();
    slot.schema = await openSlot(e.schemaPath, e.schema, `entry${i}.schema.shex`, vscode.ViewColumn.Two);
    slot.data = await openSlot(e.dataPath, e.data, `entry${i}.data.${dataExt(e.data)}`, vscode.ViewColumn.Three);
    slot.index = i;
    cross.setSlot(slot.schema, slot.data);   // arm hover highlighting for this pair
  };
  // Validate an entry.  `live` reads the (possibly edited) open documents so you
  // can edit schema/data and re-run; otherwise it uses the manifest's own text.
  const validateEntry = async (i: number, live: boolean) => {
    const e = entries[i];
    if (!e) return;
    const useSlot = live && slot.index === i;
    if (useSlot) revalidateCurrent = () => validateEntry(i, true);   // target of "ShEx: Re-validate" / auto
    const schema = useSlot && slot.schema && !slot.schema.isClosed ? slot.schema.getText() : (e.schema || "");
    const data = useSlot && slot.data && !slot.data.isClosed ? slot.data.getText() : (e.data || "");
    let result: any;
    try {
      result = await client.sendRequest("workspace/executeCommand",
        { command: "shex.runManifestEntry", arguments: [schema, data, e.queryMap || "", e.status || "conformant", e.dataBase] });
    } catch (err) {
      // A server hiccup mid-run must not become an unhandled rejection.
      void panel.webview.postMessage({ type: "result", index: i, result: { errors: [String((err as Error).message)] } });
      return;
    }
    // The page renders the verdict; the correspondences drive the (host-side)
    // hover highlighting for the pair that's actually open -- keep them out of
    // the webview payload and hand them to CrossHighlight instead.
    const { correspondences, ...display } = result || {};
    void panel.webview.postMessage({ type: "result", index: i, result: display });
    if (useSlot) cross.setCorrespondences(correspondences as Correspondence[] | undefined);
  };

  panel.webview.onDidReceiveMessage(async (m: any) => {
    try {
      if (m.type === "ready" || m.type === "reload") await loadEntries();
      else if (m.type === "select") { await openEntry(m.index); await validateEntry(m.index, true); }
      else if (m.type === "run") await validateEntry(m.index, true);
      else if (m.type === "runAll") for (let i = 0; i < entries.length; i++) if (!entries[i].neighborhood) await validateEntry(i, false);
    } catch (err) {
      void vscode.window.showErrorMessage("ShEx manifest browser: " + (err instanceof Error ? err.message : String(err)));
    }
  });
  panel.onDidDispose(() => {
    cross.setSlot(undefined, undefined);   // drop highlights and correspondences
    revalidateCurrent = undefined;
    void closeOwned();
    if (tmpDir) try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best effort */ }
  });
}

/** The active editor if it is a YAML file, else a quick-pick over the workspace. */
async function pickManifest (): Promise<vscode.Uri | undefined> {
  const active = vscode.window.activeTextEditor?.document;
  if (active && (active.languageId === "yaml" || /\.ya?ml$/i.test(active.uri.fsPath))) return active.uri;
  const uris = await vscode.workspace.findFiles("**/*.{yaml,yml}", "**/node_modules/**", 200);
  if (!uris.length) { void vscode.window.showWarningMessage("No .yaml manifest in the workspace. Open one and retry."); return undefined; }
  const pick = await vscode.window.showQuickPick(
    uris.map(u => ({ label: vscode.workspace.asRelativePath(u), uri: u })),
    { placeHolder: "Pick a ShEx manifest (YAML)" });
  return pick?.uri;
}

/** Read the shared browser page from the server package and fill in the
 * webview's CSP source and a per-load nonce. */
function manifestBrowserHtml (webview: vscode.Webview): string {
  const serverMain = require.resolve("@shexjs/language-server/lib/server.js");
  const htmlPath = path.join(path.dirname(serverMain), "..", "media", "manifest-browser.html");
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return fs.readFileSync(htmlPath, "utf8")
    .replace(/\{\{nonce\}\}/g, nonce)
    .replace(/\{\{cspSource\}\}/g, webview.cspSource);
}

// --- small helpers ----------------------------------------------------------

function kindOf (doc: vscode.TextDocument): "schema" | "data" | "other" {
  switch (doc.languageId) {
    case "turtle": case "trig": return "data";
    case "shexc": return "schema";
    default: return "other";
  }
}

/** The extension a chunk of inline manifest data should be materialized under:
 * `.trig` when it uses a `GRAPH` keyword (which the strict-Turtle tooling would
 * reject), else `.ttl`.  Both map to the same "turtle" language, but the
 * extension is what tells the editor (and a reader) which dialect it is. */
function dataExt (content: string | undefined): "trig" | "ttl" {
  return /(?:^|[^:\w])GRAPH\s/i.test(content || "") ? "trig" : "ttl";
}

/** The `shex.schemaMouseover` setting ("highlight" | "shexj"), passed to the
 * server so a ShExC-constraint hover either lights the data or shows ShExJ. */
function schemaMouseoverSetting (): string {
  return vscode.workspace.getConfiguration("shex").get<string>("schemaMouseover", "highlight");
}

/** The RDF term at the cursor (or the current selection): an <iri>, a prefixed
 * name, a default-prefixed `:name`, or a bare word like START. */
function termAtCursor (ed: vscode.TextEditor): { token: string, range: vscode.Range } | undefined {
  const doc = ed.document, sel = ed.selection;
  // Prefer the regex word-range at the cursor: it captures ":alice" / "ex:alice"
  // / "<http://…>" as one term even when a double-click selected only "alice".
  // Fall back to an explicit multi-token selection if the cursor isn't on a term.
  const re = /<[^>\s]*>|[A-Za-z_][\w.+-]*:[\w.+-]*|:[\w.+-]+|[A-Za-z_][\w.+-]*/;
  const range = doc.getWordRangeAtPosition(sel.active, re) || (sel.isEmpty ? undefined : sel);
  return range ? { token: doc.getText(range).trim(), range } : undefined;
}

/** A shape-map atom for a node/shape term: keep an <iri> as-is, expand a
 * prefixed name to an absolute <iri> (the shape-map parser gets no prefixes),
 * and give up on a bare word. */
function iriAtom (token: string, prefixes: Record<string, string>): string | undefined {
  token = token.trim();
  if (/^<[^>]*>$/.test(token)) return token;
  const c = token.indexOf(":");
  if (c >= 0) {
    const pfx = token.slice(0, c), local = token.slice(c + 1);
    if (prefixes[pfx] !== undefined) return `<${prefixes[pfx]}${local}>`;
  }
  return undefined;
}

/** Like iriAtom, but the bare word START (the schema's start shape) is allowed. */
function shapeAtom (token: string, prefixes: Record<string, string>): string | undefined {
  if (/^(START|start)$/.test(token.trim())) return "START";
  return iriAtom(token, prefixes);
}

/** True (and warns) when the atom is exactly a declared namespace IRI -- i.e.
 * the cursor was on a `<http://…>` in a PREFIX line, not on a term.  This is the
 * usual "I got <http://ex/>@<http://ex/>" misclick. */
function looksLikeNamespace (atom: string, prefixes: Record<string, string>, what: string): boolean {
  if (atom.startsWith("<") && Object.values(prefixes).includes(atom.slice(1, -1))) {
    void vscode.window.showWarningMessage(
      `ShEx: ${atom} is a namespace from a PREFIX line, not ${what}. Put the cursor on the term itself (e.g. :alice or :User) and try again.`);
    return true;
  }
  return false;
}

/** Show what got picked, resolved: ":alice → <http://ex/alice>", or just the
 * atom when the surface form already is the atom (an <iri> or START). */
function describeTerm (token: string, atom: string): string {
  return token === atom ? atom : `${token} → ${atom}`;
}

/** Collect `PREFIX x: <iri>` / `@prefix x: <iri>` declarations (default prefix
 * keyed by ""). */
function collectPrefixes (text: string): Record<string, string> {
  const p: Record<string, string> = {};
  const re = /(?:@prefix|PREFIX)\s+([A-Za-z_][\w.-]*)?:\s*<([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) p[m[1] || ""] = m[2];
  return p;
}

/** The document's declared BASE, if any (relative IRIs resolve against it). */
function collectBase (text: string): string | undefined {
  const m = /(?:@base|BASE)\s+<([^>]*)>/i.exec(text);
  return m ? m[1] : undefined;
}

export function deactivate (): Thenable<void> | undefined {
  return client ? client.stop() : undefined;
}
