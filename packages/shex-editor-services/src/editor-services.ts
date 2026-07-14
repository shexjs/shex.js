/** @shexjs/editor-services - range-aware parsing and validation-error
 * mapping for language-sensitive editors (see doc/editor-integration-plan.md
 * at the repository root).
 *
 * The editor never talks to the parsers; this module runs them and returns
 * plain {from, to, severity, message} diagnostics (character offsets,
 * CodeMirror-ready) plus locate() functions for cross-pane highlights:
 *
 *   const s = EditorServices.parseShExC(schemaText, {base});
 *   const d = EditorServices.parseTurtle(dataText, {baseIRI: base});
 *   // ... run ShExValidator as usual on d.dataset or any RdfJs store ...
 *   const {schema, data, pairs} = EditorServices.mapValidationErrors(valResult, s, d);
 */

import * as ShExParser from "@shexjs/parser";
import {rdfjs as MillanRdfJs} from "millan";

const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
const RDF_LANGSTRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

// ---------------------------------------------------------------------------
// types

/** a jison lexer location: 1-based lines, 0-based columns */
export interface Yylloc {
  first_line: number;
  first_column: number;
  last_line: number;
  last_column: number;
  filename?: string;
}

/** half-open character-offset range, CodeMirror-ready */
export interface Range {
  from: number;
  to: number;
}

export interface Diagnostic extends Range {
  severity: "error" | "warning" | "info";
  message: string;
  /** id shared by the schema- and data-side diagnostics of one error */
  pair?: number;
}

/** the parts of a parsed ShExJ schema this module reads; expression objects
 * are compared by identity, so keep whatever the parser produced */
export interface SchemaWithMeta {
  shapes?: object[];
  _locations?: {[label: string]: Yylloc};
  _exprLocations?: Map<object, Yylloc>;
  _sourceMap?: Map<string, Yylloc[]>;
  _index?: {shapeExprs: {[label: string]: any}, tripleExprs: {[label: string]: any}};
  [key: string]: any;
}

export interface Locate {
  /** full declaration range of a shape label */
  shape (label: string): Range | null;
  /** range of just the label token that opens a shape's declaration */
  shapeLabel (label: string): Range | null;
  /** range of a schema expression object (TripleConstraint, ...) */
  expr (obj: object): Range | null;
  /** ranges of every @<label> / &<label> reference site */
  refs (label: string): Range[];
  /** best-effort range for a constraint on `predicate` within `shapeLabel` */
  constraint (shapeLabel: string, predicate: string): Range | null;
}

export interface LocatedSchema {
  text: string;
  schema: SchemaWithMeta | null;
  locate: Locate;
}

export interface ParsedShExC extends LocatedSchema {
  diagnostics: Diagnostic[];
}

export interface ParsedTurtle {
  text: string;
  dataset: MillanRdfJs.MillanDataset;
  diagnostics: Diagnostic[];
}

/** term-level ranges of a data triple plus the shape-label range: the
 * anchors for cross-pane hover highlighting */
export interface PairAnchors {
  shapeLabel: Range | null;
  subject: Range | null;
  predicate: Range | null;
  object: Range | null;
}

export interface ErrorPair {
  id: number;
  type: string;
  /** "conformant" for matched constraints, "nonconformant" for failures */
  status: "conformant" | "nonconformant";
  message: string;
  schema: Range | null;
  data: Range | null;
  anchors: PairAnchors;
}

export interface MappedErrors {
  schema: Diagnostic[];
  data: Diagnostic[];
  pairs: ErrorPair[];
}

/** LD (ShExJson) term as found in validation results */
type LdTerm = string | {value: string, type?: string, language?: string};

interface TestedTriple {
  subject: LdTerm;
  predicate: string;
  object: LdTerm;
}

// ---------------------------------------------------------------------------
// offsets

/** lineOffsets - character offset of the start of each (1-based) line. */
export function lineOffsets (text: string): number[] {
  const starts = [0];
  for (let i = 0; i < text.length; ++i)
    if (text[i] === "\n")
      starts.push(i + 1);
  return starts;
}

/** yyllocToRange - jison yylloc to {from, to} character offsets. */
export function yyllocToRange (loc: Yylloc | undefined, starts: number[]): Range | null {
  if (!loc || loc.first_line === undefined || loc.first_line - 1 >= starts.length)
    return null;
  return {
    from: starts[loc.first_line - 1] + loc.first_column,
    to: starts[Math.min(loc.last_line, starts.length) - 1] + loc.last_column,
  };
}

/** millanSourceToRange - millan SourceRange (inclusive endOffset) to
 * {from, to}. */
export function millanSourceToRange (source: MillanRdfJs.SourceLocation | undefined): Range | null {
  return source && source.startOffset !== undefined
    ? {from: source.startOffset, to: source.endOffset + 1}
    : null;
}

// ---------------------------------------------------------------------------
// ShExC

export interface ParseShExCOptions {
  base?: string;
  prefixes?: {[prefix: string]: string};
  schemaOptions?: object;
}

/** parseShExC - parse a ShExC document, returning the schema (when it
 * parses), diagnostics for parse errors, and range lookups for shapes,
 * expressions (e.g. TripleConstraints) and shape references.
 */
export function parseShExC (text: string, opts: ParseShExCOptions = {}): ParsedShExC {
  const starts = lineOffsets(text);
  const parser = (ShExParser as any).construct(opts.base || "urn:editor:schema",
                                               opts.prefixes || {},
                                               Object.assign({index: true}, opts.schemaOptions));
  let schema: SchemaWithMeta | null = null;
  const diagnostics: Diagnostic[] = [];
  try {
    schema = parser.parse(text);
  } catch (e: any) {
    (e.errors || [e]).forEach((err: any) => {
      const range = yyllocToRange(err.location, starts)
            || {from: text.length, to: text.length};
      diagnostics.push(Object.assign({
        severity: "error" as const,
        message: firstLine(err.message),
      }, range));
    });
    schema = e.parsed || null; // whatever parsed before the error
  }
  return Object.assign({diagnostics}, locateInParsed(text, schema));
}

/** locateInParsed - range lookups over an ALREADY-parsed schema (e.g. the
 * web apps' cache.parsed, whose expression objects are the ones validation
 * errors reference by identity -- @shexjs/loader's import-merging makes a
 * new top-level Schema but shares the inner objects).
 */
export function locateInParsed (text: string, schema: SchemaWithMeta | null): LocatedSchema {
  const starts = lineOffsets(text);
  return {
    text,
    schema,
    locate: {
      shape: (label: string) => schema && schema._locations
        ? yyllocToRange(schema._locations[label], starts)
        : null,
      shapeLabel: (label: string) => {
        const decl = schema && schema._locations
              ? yyllocToRange(schema._locations[label], starts) : null;
        if (!decl)
          return null;
        // the declaration starts with (ABSTRACT)? <label>; take the label token
        const lead = /^\s*(?:abstract\s+)?/i.exec(text.slice(decl.from))![0].length;
        const token = /^\S+/.exec(text.slice(decl.from + lead));
        return token
          ? {from: decl.from + lead, to: decl.from + lead + token[0].length}
          : decl;
      },
      expr: (obj: object) => schema && schema._exprLocations
        ? yyllocToRange(schema._exprLocations.get(obj), starts)
        : null,
      refs: (label: string) => schema && schema._sourceMap
        ? (schema._sourceMap.get(label) || [])
            .map(loc => yyllocToRange(loc, starts))
            .filter((r): r is Range => r !== null)
        : [],
      constraint: (shapeLabel: string, predicate: string) => {
        const tc = findTripleConstraint(schema, shapeLabel, predicate);
        return tc && schema && schema._exprLocations
          ? yyllocToRange(schema._exprLocations.get(tc), starts)
          : null;
      },
    },
  };
}

function firstLine (str: unknown): string { return String(str).split("\n", 1)[0]; }

function findTripleConstraint (schema: SchemaWithMeta | null, shapeLabel: string, predicate: string): object | null {
  const decl = schema && schema._index && schema._index.shapeExprs[shapeLabel];
  let found: object | null = null;
  (function walk (expr: any): void {
    if (!expr || typeof expr !== "object" || found)
      return;
    if (expr.type === "TripleConstraint" && expr.predicate === predicate)
      found = expr;
    else if (expr.expressions)
      expr.expressions.forEach(walk);
    else if (expr.expression)
      walk(expr.expression);
    else if (expr.shapeExpr)
      walk(expr.shapeExpr);
    else if (expr.shapeExprs)
      expr.shapeExprs.forEach(walk);
  })(decl);
  return found;
}

// ---------------------------------------------------------------------------
// Turtle (millan rdfjs adapter: error-tolerant, terms carry source ranges)

export interface ParseTurtleOptions {
  baseIRI?: string;
  sourceURL?: string;
}

export function parseTurtle (text: string, opts: ParseTurtleOptions = {}): ParsedTurtle {
  const {dataset, errors, semanticErrors, emitterErrors} =
        MillanRdfJs.parseTurtleToRdfjs(text, {
          baseIRI: opts.baseIRI || "urn:editor:data",
          sourceURL: opts.sourceURL,
        });
  const diagnostics: Diagnostic[] = [];
  (errors as any[]).concat(semanticErrors).forEach((err: any) => {
    const token = err.token && !isNaN(err.token.startOffset) ? err.token : null;
    diagnostics.push({
      severity: "error",
      message: firstLine(err.message),
      from: token ? token.startOffset : text.length,
      to: token ? token.endOffset + 1 : text.length,
    });
  });
  (emitterErrors as any[]).forEach((err: any) => {
    const range = millanSourceToRange(err.source) || {from: 0, to: 0};
    diagnostics.push(Object.assign({severity: "error" as const, message: firstLine(err.message)}, range));
  });
  return {text, dataset, diagnostics};
}

// ---------------------------------------------------------------------------
// validation-error mapping

/** ldTermToRdfJs - a ShExJson (LD) term as found in validation results to a
 * plain RDF/JS term structure that millan terms' equals() accepts. */
function ldTermToRdfJs (ld: LdTerm): object {
  if (typeof ld === "object")
    return {
      termType: "Literal",
      value: ld.value,
      language: ld.language || "",
      datatype: {
        termType: "NamedNode",
        value: ld.type || (ld.language ? RDF_LANGSTRING : XSD_STRING),
      },
    };
  return ld.startsWith("_:")
    ? {termType: "BlankNode", value: ld.substr(2)}
    : {termType: "NamedNode", value: ld};
}

/** trimRange - drop trailing whitespace from a range (some term sources
 * include following trivia). */
function trimRange (range: Range | null, text: string): Range | null {
  if (!range)
    return null;
  let to = range.to;
  while (to > range.from && /\s/.test(text[to - 1]))
    --to;
  return to === range.to ? range : {from: range.from, to};
}

/** tripleAnchors - locate a validation result's TestedTriple in the parsed
 * data, returning per-term ranges (millan terms carry their own source). */
function tripleAnchors (dataset: MillanRdfJs.MillanDataset, triple: TestedTriple, text: string):
    {subject: Range | null, predicate: Range | null, object: Range | null} | null {
  const matches = [...(dataset as any).match(ldTermToRdfJs(triple.subject),
                                             ldTermToRdfJs(triple.predicate),
                                             ldTermToRdfJs(triple.object))];
  if (matches.length === 0)
    return null;
  const quad: any = matches[0];
  return {
    subject: trimRange(millanSourceToRange(quad.subject && quad.subject.source), text),
    predicate: trimRange(millanSourceToRange(quad.predicate && quad.predicate.source), text),
    object: trimRange(millanSourceToRange(quad.object && quad.object.source)
                      || millanSourceToRange(quad.source), text),
  };
}

/** rangeOfNode - anchor for node-level errors (e.g. MissingProperty): the
 * first assertion where the node appears as subject. */
function rangeOfNode (dataset: MillanRdfJs.MillanDataset, node: LdTerm): Range | null {
  const matches = [...(dataset as any).match(ldTermToRdfJs(node))];
  return matches.length
    ? millanSourceToRange((matches[0] as any).subject.source) || millanSourceToRange((matches[0] as any).source)
    : null;
}

interface ErrorLeaf {
  message: string;
  schemaObj?: object;
  predicate?: string;
  triple?: TestedTriple;
  triples?: TestedTriple[];
  node?: LdTerm;
}

interface WalkContext {
  node?: LdTerm;
  shape?: string;
  /** nearest enclosing error's constraint (e.g. a NodeConstraintViolation
   * nested in a TypeMismatch anchors on the TypeMismatch's constraint) */
  constraint?: object;
  /** nearest enclosing error's triple, for the same reason */
  triple?: TestedTriple;
}

// error types that anchor a diagnostic (as opposed to containers to recurse
// through); each entry renders a message and picks its anchors
const ErrorLeaves: {[type: string]: (err: any, ctx: WalkContext) => ErrorLeaf} = {
  TypeMismatch: (err, _ctx) => ({
    message: `${termStr(err.triple.object)} doesn't satisfy ${err.constraint ? constraintStr(err.constraint) : "the constraint"}`,
    schemaObj: err.constraint,
    triple: err.triple,
  }),
  MissingProperty: (err, ctx) => ({
    message: `missing expected property ${termStr(err.property)}`,
    predicate: err.property,
    node: ctx.node,
  }),
  ExcessTripleViolation: (err, ctx) => ({
    message: `too many occurrences of ${termStr(err.property)}`,
    predicate: err.property,
    node: ctx.node,
  }),
  ClosedShapeViolation: (err, ctx) => ({
    message: `unexpected properties in closed shape: ${
      (err.unexpectedTriples || []).map((t: TestedTriple) => termStr(t.predicate)).join(", ")}`,
    triples: err.unexpectedTriples,
    node: ctx.node,
  }),
  NodeConstraintViolation: (err, ctx) => ({
    message: firstLine((err.errors || [])[0] || "node constraint violation"),
    schemaObj: ctx.constraint, // usually nested in a TypeMismatch
    triple: ctx.triple,
    node: ctx.node,
  }),
  SemActFailure: (_err, ctx) => ({
    message: "semantic action failure",
    schemaObj: ctx.constraint,
    triple: ctx.triple,
    node: ctx.node,
  }),
};

function termStr (t: LdTerm): string {
  return typeof t === "object" ? JSON.stringify(t.value) : "<" + t + ">";
}

function constraintStr (tc: any): string {
  const card = "min" in tc || "max" in tc ? ` {${tc.min ?? 1},${tc.max ?? 1}}` : "";
  const ve = tc.valueExpr === undefined ? "."
        : typeof tc.valueExpr === "string" ? "@<" + tc.valueExpr + ">"
        : tc.valueExpr.type === "NodeConstraint"
        ? (tc.valueExpr.datatype || (tc.valueExpr.values ? "[...]" : tc.valueExpr.nodeKind || "."))
        : tc.valueExpr.type;
  return `<${tc.predicate}> ${ve}${card}`;
}

/** mapValidationErrors - walk a validation result (single Failure, a
 * ShapeMap entry list, or anything ShExValidator returns) and resolve each
 * error to ranges in the schema and data documents.
 *
 * Returns {schema: [diagnostic], data: [diagnostic], pairs: [{id, message,
 * schema, data}]}; paired diagnostics share `pair` ids so an editor can
 * flash the counterpart range on hover.
 */
export function mapValidationErrors (valResult: unknown,
                                     shexcParsed: LocatedSchema,
                                     turtleParsed?: ParsedTurtle | null): MappedErrors {
  const pairs: ErrorPair[] = [];
  const seen = new Set<object>();

  (function walk (node: any, ctx: WalkContext): void {
    if (!node || typeof node !== "object" || seen.has(node))
      return;
    seen.add(node);
    if (Array.isArray(node))
      return node.forEach(n => walk(n, ctx));

    // track focus node / shape / enclosing-error context on the way down
    if (node.node !== undefined || node.shape !== undefined ||
        node.constraint !== undefined || node.triple !== undefined)
      ctx = {node: node.node !== undefined ? node.node : ctx.node,
             shape: node.shape !== undefined ? node.shape : ctx.shape,
             constraint: node.constraint !== undefined ? node.constraint : ctx.constraint,
             triple: node.triple !== undefined ? node.triple : ctx.triple};

    if (node.type in ErrorLeaves)
      emit("nonconformant", ErrorLeaves[node.type](node, ctx), node, ctx);

    // successful matches: each TestedTriple under a TripleConstraintSolutions
    // pairs a schema constraint with a data triple
    if (node.type === "TripleConstraintSolutions" && Array.isArray(node.solutions))
      node.solutions.forEach((sol: any) => {
        if (sol && sol.type === "TestedTriple")
          emit("conformant", {
            message: `${termStr(sol.object)} matched <${node.predicate}>`,
            predicate: node.predicate,
            triple: sol,
          }, node, ctx);
      });

    for (const key of ["errors", "appinfo", "solutions", "solution",
                       "expressions", "referenced", "unexpectedTriples"])
      if (key in node)
        walk(node[key], ctx);
  })(valResult, {});

  function emit (status: "conformant" | "nonconformant", leaf: ErrorLeaf, err: any, ctx: WalkContext): void {
    const schemaRange =
          (leaf.schemaObj && shexcParsed.locate.expr(leaf.schemaObj)) ||
          (leaf.predicate && ctx.shape && shexcParsed.locate.constraint(ctx.shape, leaf.predicate)) ||
          // last resort: just the shape's label token -- never the whole
          // declaration, which would paint innocent constraints red
          (ctx.shape && shexcParsed.locate.shapeLabel(ctx.shape)) ||
          null;
    const anchors: PairAnchors = {
      shapeLabel: ctx.shape ? shexcParsed.locate.shapeLabel(ctx.shape) : null,
      subject: null, predicate: null, object: null,
    };
    let dataRange: Range | null = null;
    if (turtleParsed && turtleParsed.dataset) {
      const triple = leaf.triple || (leaf.triples && leaf.triples[0]) || null;
      if (triple) {
        const termRanges = tripleAnchors(turtleParsed.dataset, triple, turtleParsed.text);
        if (termRanges)
          Object.assign(anchors, termRanges);
        dataRange = anchors.object;
      }
      if (!dataRange && leaf.node !== undefined && leaf.node !== null)
        dataRange = rangeOfNode(turtleParsed.dataset, leaf.node);
    }
    pairs.push({
      id: pairs.length,
      type: err.type,
      status,
      message: leaf.message,
      schema: schemaRange,
      data: dataRange,
      anchors,
    });
  }

  // squiggles come from failures only; conformant pairs drive hover highlights
  const toDiagnostics = (side: "schema" | "data"): Diagnostic[] => pairs
        .filter(p => p.status === "nonconformant" && p[side])
        .map(p => ({from: p[side]!.from, to: p[side]!.to, severity: "error" as const,
                    message: p.message, pair: p.id}));
  return {schema: toDiagnostics("schema"), data: toDiagnostics("data"), pairs};
}
