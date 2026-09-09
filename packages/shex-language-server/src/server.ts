/** A Language Server Protocol server for ShEx.
 *
 * It is a thin adapter: every piece of language intelligence comes from
 * @shexjs/editor-services (the same range-aware parsing that drives the
 * shex.js web editors), and this file only translates between that module's
 * character-offset model and LSP's line/character Positions.
 *
 * What it serves, by document language:
 *   - shexc  (a ShEx schema): diagnostics, hover, go-to-definition and
 *     find-references over shape labels, a document outline, and completion of
 *     shape labels and prefixes.  `lintSchema` auto-detects ShExC / ShExJ /
 *     ShExR / DCTAP, so a schema in any of those four surface languages gets
 *     diagnostics here.
 *   - turtle / trig (RDF data): diagnostics, and hover that expands a prefixed
 *     name to its IRI using the document's own PREFIX table.
 *   - shapemap: diagnostics.
 *
 * Cross-document validation (a data graph against a schema) is a workspace-level
 * operation -- which data, which schema, which shape map -- so it is exposed as
 * the `shex.validate` command rather than as automatic per-file diagnostics.
 */
"use strict";

import {
  createConnection, TextDocuments, ProposedFeatures, TextDocumentSyncKind,
  DiagnosticSeverity, SymbolKind, CompletionItemKind, SemanticTokensBuilder,
  type InitializeParams, type InitializeResult,
  type Diagnostic as LspDiagnostic, type Range as LspRange,
  type Hover, type Location, type DocumentSymbol, type CompletionItem,
  type SemanticTokens,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import * as ES from "@shexjs/editor-services";
import * as N3 from "n3";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// --- languages -------------------------------------------------------------

type DocKind = "schema" | "turtle" | "shapemap";

/** Which family a document belongs to.  Anything that isn't obviously data or
 * a shape map is treated as a schema, and `lintSchema` sorts out which of the
 * four schema languages it actually is. */
function kindOf (doc: TextDocument): DocKind {
  switch (doc.languageId) {
    case "turtle": case "trig": case "ntriples": case "n-triples":
      return "turtle";
    case "shapemap": case "shex-shapemap":
      return "shapemap";
    default:
      return "schema"; // shexc, shexj, shexr, dctap, or unknown
  }
}

// --- offset <-> Position ----------------------------------------------------
// TextDocument already indexes its line starts, so it does the conversion;
// editor-services speaks half-open [from, to) character offsets.

function toRange (doc: TextDocument, r: ES.Range): LspRange {
  return { start: doc.positionAt(r.from), end: doc.positionAt(r.to) };
}

function severityOf (s: ES.Diagnostic["severity"]): DiagnosticSeverity {
  return s === "error" ? DiagnosticSeverity.Error
    : s === "warning" ? DiagnosticSeverity.Warning
    : DiagnosticSeverity.Information;
}

// --- diagnostics ------------------------------------------------------------

/** The syntactic diagnostics for a document, from whichever editor-services
 * parser its language calls for.  Parsing never throws here -- a broken buffer
 * is the normal case in an editor -- so anything unexpected becomes an empty
 * diagnostic list rather than a dropped connection. */
/** Turtle diagnostics that don't cry TriG.  editor-services' Turtle parser
 * can't read TriG's GRAPH blocks and flags them as syntax errors; the
 * validator's N3 reads both.  So when the Turtle parser complains, give N3 the
 * last word -- if N3 accepts the text it is valid (TriG) and those errors are
 * false.  A genuinely broken buffer fails both, and keeps the richer,
 * multi-error Turtle diagnostics. */
function turtleDiagnostics (text: string): ES.Diagnostic[] {
  const ds = ES.parseTurtle(text, {}).diagnostics;
  if (ds.length === 0) return ds;
  try { new N3.Parser({ baseIRI: "http://a.example/" }).parse(text); return []; } catch { /* genuinely invalid */ }
  return ds;
}

function diagnosticsFor (doc: TextDocument): LspDiagnostic[] {
  const text = doc.getText();
  let ds: ES.Diagnostic[] = [];
  try {
    switch (kindOf(doc)) {
      case "turtle":   ds = turtleDiagnostics(text); break;
      case "shapemap": ds = ES.parseShapeMap(text, {} as any).diagnostics; break;
      case "schema":   ds = ES.lintSchema(text, {}); break;
    }
  } catch (e) {
    connection.console.warn(`diagnostics failed for ${doc.uri}: ${(e as Error).message}`);
    return [];
  }
  return ds.map(d => ({
    severity: severityOf(d.severity),
    range: toRange(doc, d),
    message: d.message,
    source: "shex",
  }));
}

function publishDiagnostics (doc: TextDocument): void {
  connection.sendDiagnostics({ uri: doc.uri, diagnostics: diagnosticsFor(doc) });
}

// --- schema location helpers ------------------------------------------------

/** The shape labels a schema declares. */
function labelsOf (schema: ES.SchemaWithMeta | null): string[] {
  const shapes = (schema && schema.shapes) || [];
  return shapes.map((s: any) => s && s.id).filter((id: any): id is string => typeof id === "string");
}

/** The shape label whose declaration or a reference to which sits at `offset`,
 * and which of the two it is.  This is how a cursor on `@<Foo>` finds `<Foo>`,
 * and how a cursor on `<Foo>`'s own name finds its references. */
function labelAt (parsed: ES.ParsedShExC, offset: number):
    { label: string; on: "decl" | "ref" } | null {
  const has = (r: ES.Range | null) => !!r && offset >= r.from && offset <= r.to;
  for (const label of labelsOf(parsed.schema)) {
    if (has(parsed.locate.shapeLabel(label))) return { label, on: "decl" };
    if (parsed.locate.refs(label).some(has)) return { label, on: "ref" };
  }
  return null;
}

/** The prefix table a document declared, wherever the parser happened to hang
 * it -- best-effort, for completion and hover. */
function prefixesOf (obj: any): { [prefix: string]: string } {
  return (obj && (obj.prefixes || obj._prefixes || obj["@prefixes"])) || {};
}

// --- turtle hover: expand a prefixed name ----------------------------------

/** The `prefix:local` (or `<iri>`) token straddling `offset`, if any. */
function termAt (text: string, offset: number): string | null {
  const isTerm = (c: string) => /[^\s{}()\[\],;"'`]/.test(c);
  let from = offset, to = offset;
  while (from > 0 && isTerm(text[from - 1])) --from;
  while (to < text.length && isTerm(text[to])) ++to;
  const tok = text.slice(from, to);
  return tok.length ? tok : null;
}

// --- semantic tokens --------------------------------------------------------
// A thin *semantic* layer meant to sit over the client's TextMate base: it
// marks shape labels, distinguishing a shape's own declaration
// (`type.declaration`) from a reference to it (`type`) -- the one thing a regex
// grammar can't know.  Everything else (keywords, IRIs, strings, datatypes)
// stays the base grammar's job.

const SEMTOK_TYPES = ["type"];               // index 0
const SEMTOK_MODIFIERS = ["declaration"];    // bit 0

function buildSemanticTokens (doc: TextDocument): SemanticTokens {
  let parsed: ES.ParsedShExC;
  try { parsed = ES.parseShExC(doc.getText(), {}); } catch { return { data: [] }; }
  const toks: { line: number; char: number; len: number; mod: number }[] = [];
  const add = (r: ES.Range | null, mod: number) => {
    if (!r) return;
    const a = doc.positionAt(r.from), b = doc.positionAt(r.to);
    if (a.line !== b.line || b.character <= a.character) return; // shape labels are single-line
    toks.push({ line: a.line, char: a.character, len: b.character - a.character, mod });
  };
  for (const label of labelsOf(parsed.schema)) {
    add(parsed.locate.shapeLabel(label), 0b1);                   // the declaration
    for (const ref of parsed.locate.refs(label)) add(ref, 0);    // and its references
  }
  toks.sort((x, y) => x.line - y.line || x.char - y.char);       // builder needs sorted input
  const builder = new SemanticTokensBuilder();
  for (const t of toks) builder.push(t.line, t.char, t.len, 0 /* "type" */, t.mod);
  return builder.build();
}

// --- lifecycle --------------------------------------------------------------

connection.onInitialize((_params: InitializeParams): InitializeResult => ({
  capabilities: {
    textDocumentSync: TextDocumentSyncKind.Incremental,
    hoverProvider: true,
    definitionProvider: true,
    referencesProvider: true,
    documentSymbolProvider: true,
    completionProvider: { triggerCharacters: ["@", "&", ":", "<"] },
    executeCommandProvider: { commands: ["shex.validate"] },
    semanticTokensProvider: {
      legend: { tokenTypes: SEMTOK_TYPES, tokenModifiers: SEMTOK_MODIFIERS },
      full: true,
    },
  },
  serverInfo: { name: "shex-language-server" },
}));

connection.languages.semanticTokens.on((params): SemanticTokens => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc || kindOf(doc) !== "schema") return { data: [] };
  return buildSemanticTokens(doc);
});

documents.onDidOpen(e => publishDiagnostics(e.document));
documents.onDidChangeContent(e => publishDiagnostics(e.document));
documents.onDidClose(e => connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] }));

// --- hover ------------------------------------------------------------------

connection.onHover(({ textDocument, position }): Hover | null => {
  const doc = documents.get(textDocument.uri);
  if (!doc) return null;
  const text = doc.getText();
  const offset = doc.offsetAt(position);

  if (kindOf(doc) === "turtle") {
    const parsed = ES.parseTurtle(text, {});
    const tok = termAt(text, offset);
    const m = tok && /^([A-Za-z][\w.-]*)?:(\S*)$/.exec(tok);
    if (m && parsed.prefixes && m[1] !== undefined && (m[1] in parsed.prefixes || "" in parsed.prefixes)) {
      const iri = (parsed.prefixes[m[1]] ?? parsed.prefixes[""]) + (m[2] || "");
      return { contents: { kind: "markdown", value: "`" + iri + "`" } };
    }
    return null;
  }

  // schema (ShExC): the constraint, then the shape, then a resolved reference
  let parsed: ES.ParsedShExC;
  try { parsed = ES.parseShExC(text, {}); } catch { return null; }

  const at = parsed.locate.exprAt(offset);
  if (at) {
    const e: any = at.expr;
    const head = e && e.predicate ? "**" + e.predicate + "**\n\n" : "";
    return {
      contents: { kind: "markdown", value: head + "```json\n" + JSON.stringify(at.expr, null, 2) + "\n```" },
      range: toRange(doc, at.range),
    };
  }
  const here = labelAt(parsed, offset);
  if (here) {
    const decl = parsed.locate.shape(here.label);
    return {
      contents: { kind: "markdown", value: "**shape** `" + here.label + "`" },
      range: (here.on === "ref" ? undefined : decl ? toRange(doc, decl) : undefined),
    };
  }
  const sh = parsed.locate.shapeAt(offset);
  if (sh) return { contents: { kind: "markdown", value: "**shape** `" + sh.label + "`" }, range: toRange(doc, sh.range) };
  return null;
});

// --- definition / references (shape labels) --------------------------------

connection.onDefinition(({ textDocument, position }): Location | null => {
  const doc = documents.get(textDocument.uri);
  if (!doc || kindOf(doc) !== "schema") return null;
  let parsed: ES.ParsedShExC;
  try { parsed = ES.parseShExC(doc.getText(), {}); } catch { return null; }
  const here = labelAt(parsed, doc.offsetAt(position));
  if (!here) return null;
  const decl = parsed.locate.shape(here.label) || parsed.locate.shapeLabel(here.label);
  return decl ? { uri: doc.uri, range: toRange(doc, decl) } : null;
});

connection.onReferences(({ textDocument, position, context }): Location[] => {
  const doc = documents.get(textDocument.uri);
  if (!doc || kindOf(doc) !== "schema") return [];
  let parsed: ES.ParsedShExC;
  try { parsed = ES.parseShExC(doc.getText(), {}); } catch { return []; }
  const here = labelAt(parsed, doc.offsetAt(position));
  if (!here) return [];
  const ranges = parsed.locate.refs(here.label).slice();
  if (context.includeDeclaration) {
    const d = parsed.locate.shapeLabel(here.label);
    if (d) ranges.push(d);
  }
  return ranges.map(r => ({ uri: doc.uri, range: toRange(doc, r) }));
});

// --- outline ----------------------------------------------------------------

connection.onDocumentSymbol(({ textDocument }): DocumentSymbol[] => {
  const doc = documents.get(textDocument.uri);
  if (!doc || kindOf(doc) !== "schema") return [];
  let parsed: ES.ParsedShExC;
  try { parsed = ES.parseShExC(doc.getText(), {}); } catch { return []; }
  const out: DocumentSymbol[] = [];
  for (const label of labelsOf(parsed.schema)) {
    const whole = parsed.locate.shape(label);
    const name = parsed.locate.shapeLabel(label);
    if (!whole) continue;
    out.push({
      name: label,
      kind: SymbolKind.Interface,
      range: toRange(doc, whole),
      selectionRange: toRange(doc, name || whole),
    });
  }
  return out;
});

// --- completion (shape labels + prefixes) ----------------------------------

connection.onCompletion(({ textDocument }): CompletionItem[] => {
  const doc = documents.get(textDocument.uri);
  if (!doc || kindOf(doc) !== "schema") return [];
  let parsed: ES.ParsedShExC;
  try { parsed = ES.parseShExC(doc.getText(), {}); } catch { return []; }
  const items: CompletionItem[] = labelsOf(parsed.schema).map(label => ({
    label, kind: CompletionItemKind.Interface, detail: "shape",
  }));
  const prefixes = prefixesOf(parsed.schema);
  for (const p of Object.keys(prefixes))
    items.push({ label: p + ":", kind: CompletionItemKind.Module, detail: prefixes[p] });
  return items;
});

// --- validate & manifest commands -------------------------------------------
// Loaded lazily: a schema-only editing session shouldn't pay to load the
// validator, and clients that never invoke these shouldn't either.  Only
// `shex.validate` is advertised in executeCommandProvider; the manifest
// commands are reached by the editor manifest browsers' direct executeCommand
// requests, which don't need advertisement (and advertising them would make
// clients auto-register colliding VS Code commands -- see the client shells).

connection.onExecuteCommand(async params => {
  const args = (params.arguments || []) as any[];
  try {
    switch (params.command) {
      case "shex.validate": {
        const [schemaText, dataText, shapeMapText, base] = args as string[];
        return require("./validate").validate(schemaText, dataText, shapeMapText, base || undefined);
      }
      case "shex.loadManifest": {
        const [manifestText, manifestPath] = args as string[];
        return require("./manifest").loadManifest(manifestText, manifestPath || undefined);
      }
      case "shex.runManifestEntry": {
        const [schemaText, dataText, queryMapText, expectedStatus, base] = args as string[];
        return require("./manifest").runEntry(schemaText, dataText, queryMapText, expectedStatus, base || undefined);
      }
      default:
        return null;
    }
  } catch (e) {
    connection.console.error(params.command + ": " + (e as Error).message);
    return { errors: [String((e as Error).message)] };
  }
});

// --- go ---------------------------------------------------------------------

documents.listen(connection);
connection.listen();
