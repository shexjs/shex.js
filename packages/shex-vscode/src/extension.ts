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
  };

  status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  status.command = "shex.clearValidationSelection";

  client = new LanguageClient("shex", "ShEx Language Server", serverOptions, clientOptions);
  context.subscriptions.push(
    client, // dispose (stop the server) when the extension deactivates
    validationDiagnostics, status,
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
  validationDiagnostics.delete(node.uri);
  let res: any;
  try {
    res = await client.sendRequest("workspace/executeCommand", {
      command: "shex.validate",
      arguments: [shape.text, node.text, shapeMap, node.base],
    });
  } catch (e) {
    vscode.window.showErrorMessage("ShEx: validation request failed: " + (e as Error).message);
    return;
  }

  const out = vscode.window.createOutputChannel("ShEx");
  out.clear();
  out.appendLine(`# ${shapeMap}`);
  out.appendLine(JSON.stringify(res, null, 2));

  const result = res && res.results && res.results[0];
  if (res && res.errors && res.errors.length) {
    vscode.window.showWarningMessage(`ShEx: ${res.errors[0]}`);
    out.show(true);
    return;
  }
  const status = result && result.status === "conformant" ? "conformant" : "nonconformant";
  const ADD = "Add to manifest";
  let choice: string | undefined;
  if (status === "conformant") {
    choice = await vscode.window.showInformationMessage(`ShEx: ✓ ${node.label} conforms to ${shape.label}.`, ADD);
  } else {
    const diag = new vscode.Diagnostic(
      node.range,
      `Does not conform to ${shape.label}. See the "ShEx" output for the failing constraints.`,
      vscode.DiagnosticSeverity.Error);
    diag.source = "shex";
    validationDiagnostics.set(node.uri, [diag]);
    void vscode.window.showTextDocument(node.uri, { selection: node.range, preserveFocus: false });
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
    slot.data = await openSlot(e.dataPath, e.data, `entry${i}.data.ttl`, vscode.ViewColumn.Three);
    slot.index = i;
  };
  // Validate an entry.  `live` reads the (possibly edited) open documents so you
  // can edit schema/data and re-run; otherwise it uses the manifest's own text.
  const validateEntry = async (i: number, live: boolean) => {
    const e = entries[i];
    if (!e) return;
    const useSlot = live && slot.index === i;
    const schema = useSlot && slot.schema && !slot.schema.isClosed ? slot.schema.getText() : (e.schema || "");
    const data = useSlot && slot.data && !slot.data.isClosed ? slot.data.getText() : (e.data || "");
    const result = await client.sendRequest("workspace/executeCommand",
      { command: "shex.runManifestEntry", arguments: [schema, data, e.queryMap || "", e.status || "conformant", e.dataBase] });
    void panel.webview.postMessage({ type: "result", index: i, result });
  };

  panel.webview.onDidReceiveMessage(async (m: any) => {
    if (m.type === "ready" || m.type === "reload") await loadEntries();
    else if (m.type === "select") { await openEntry(m.index); await validateEntry(m.index, true); }
    else if (m.type === "run") await validateEntry(m.index, true);
    else if (m.type === "runAll") for (let i = 0; i < entries.length; i++) if (!entries[i].neighborhood) await validateEntry(i, false);
  });
  panel.onDidDispose(() => {
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
