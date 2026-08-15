/**
 * One place that turns a validation error into a sentence.
 *
 * There were two: this package's ShExHumanErrorWriter, which builds an
 * indented tree for `errsToSimple`, and editor-services' ErrorLeaves, which
 * builds one line per error for a CodeMirror diagnostic.  They wrote the
 * same sentences differently -- "Missing property: <p>" against "missing
 * expected property <p>" -- and drifted apart as each was touched.
 *
 * The two jobs really do differ: a tree indents its causes, a diagnostic
 * points at a range.  What they share is the *leaf*: what went wrong with
 * this triple, this constraint, this node.  That is what lives here.
 * Composition (the tree) and anchoring (the ranges) stay with their
 * callers, which is where they belong.
 *
 * See doc/error-reporting.md (F1, F2).
 */

import type * as ShExJ from "shexj";

const ShExWriter = require("@shexjs/writer");

/** what a caller may already know about where an error was found */
export interface ErrorContext {
  /** the TripleConstraint being tested, when the error is nested under one */
  constraint?: ShExJ.TripleConstraint;
  triple?: any;
  node?: any;
  /** the schema's prefixes, so a quoted fragment reads as the schema spells it */
  prefixes?: { [prefix: string]: string };
}

/** a leaf error, said once, with whatever a host needs to point at it */
export interface ErrorDescription {
  /** one line, no nesting: the caller composes */
  text: string;
  /** the schema object this is about (a TripleConstraint or a NodeConstraint) */
  schemaObj?: object;
  predicate?: string;
  triple?: any;
  triples?: any[];
  node?: any;
}

/** an RDF term as a reader writes it */
export function termText (term: any): string {
  if (term === undefined || term === null)
    return "?";
  if (typeof term === "string")
    return term.startsWith("_:") ? term : "<" + term + ">";
  if (typeof term !== "object")
    return String(term);
  if (typeof term.value !== "string")
    return JSON.stringify(term);
  const quoted = JSON.stringify(term.value);
  return term.language ? quoted + "@" + term.language
    : term.type ? quoted + "^^<" + term.type + ">"
    : quoted;
}

/**
 * A fragment of schema, as ShExC.
 *
 * A message naming what a node had to satisfy reads as the schema does --
 * `xsd:integer mininclusive 3` -- rather than as the ShExJ it is made of.
 * A fragment the writer can't render (a reference to something it hasn't
 * been given, say) falls back to its label or to nothing, never to JSON.
 */
export function shexcFragment (expr: any, prefixes?: { [prefix: string]: string }): string {
  if (expr === undefined || expr === null)
    return "";
  if (typeof expr === "string")            // a shape reference
    return "@<" + expr + ">";
  try {
    const writer = new ShExWriter({simplifyParentheses: false, prefixes: prefixes || {}});
    const said = writer.writeShapeExpr(expr);
    return typeof said === "string" ? said.trim() : "";
  } catch (e) {
    return expr.id ? "@<" + expr.id + ">" : "";
  }
}

/** a TripleConstraint as a reader would write it: predicate, value, cardinality */
export function constraintText (tc: any, prefixes?: { [prefix: string]: string }): string {
  if (!tc || typeof tc !== "object")
    return "the constraint";
  const value = tc.valueExpr === undefined ? "." : shexcFragment(tc.valueExpr, prefixes) || ".";
  const min = tc.min === undefined ? 1 : tc.min, max = tc.max === undefined ? 1 : tc.max;
  const card = min === 1 && max === 1 ? ""
    : min === 0 && max === 1 ? "?"
    : min === 0 && max === -1 ? "*"
    : min === 1 && max === -1 ? "+"
    : " {" + min + "," + (max === -1 ? "*" : max) + "}";
  return (tc.predicate ? "<" + tc.predicate + "> " : "") + value + card;
}

/** the first line of a legacy stringified explanation, minus any ShExJ in it */
function firstLine (said: any): string {
  const text = typeof said === "string" ? said : JSON.stringify(said);
  const line = text.split("\n")[0];
  // legacy leaves read "Error validating "x" as {"type":"NodeConstraint",...}: why"
  const blob = line.match(/^Error validating (.*?) as \{.*\}: (.*)$/);
  return blob ? blob[2] + " (" + blob[1] + ")" : line;
}

const leaves: {[type: string]: (err: any, ctx: ErrorContext) => ErrorDescription} = {
  TypeMismatch: (err, ctx) => ({
    text: termText(err.triple && err.triple.object) + " doesn't satisfy "
      + constraintText(err.constraint || ctx.constraint, ctx.prefixes),
    schemaObj: err.constraint || ctx.constraint,
    predicate: (err.constraint || ctx.constraint || {}).predicate
      || (err.triple && err.triple.predicate),
    triple: err.triple,
  }),
  MissingProperty: (err, ctx) => ({
    text: "missing property " + termText(err.property)
      + (err.valueExpr === undefined ? "" : " " + shexcFragment(err.valueExpr, ctx.prefixes)),
    predicate: err.property,
    node: ctx.node,
  }),
  ExcessTripleViolation: (err, ctx) => ({
    text: "too many occurrences of " + termText(err.property || (err.triple && err.triple.predicate)),
    predicate: err.property || (err.triple && err.triple.predicate),
    triple: err.triple,
    node: ctx.node,
  }),
  ClosedShapeViolation: (err, ctx) => ({
    text: "unexpected in a closed shape: "
      + (err.unexpectedTriples || []).map((t: any) => termText(t.predicate)).join(", "),
    triples: err.unexpectedTriples,
    node: ctx.node,
  }),
  NodeConstraintViolation: (err, ctx) => ({
    text: termText(err.node) + " doesn't satisfy "
      + (shexcFragment(err.shapeExpr, ctx.prefixes)
         || firstLine((err.errors || [])[0] || "the node constraint")),
    schemaObj: err.shapeExpr || ctx.constraint,
    predicate: (ctx.constraint || {}).predicate || (ctx.triple && ctx.triple.predicate),
    triple: ctx.triple,
    node: err.node || ctx.node,
  }),
  NegatedProperty: (err, ctx) => ({
    text: "unexpected " + termText(err.property),
    predicate: err.property,
    node: ctx.node,
  }),
  AbstractShapeFailure: (err, ctx) => ({
    text: "abstract shape " + termText(err.shape) + " can't be matched directly",
    node: ctx.node,
  }),
  SemActFailure: (_err, ctx) => ({
    text: "rejected by a semantic action",
    schemaObj: ctx.constraint,
    predicate: (ctx.constraint || {}).predicate || (ctx.triple && ctx.triple.predicate),
    triple: ctx.triple,
    node: ctx.node,
  }),
  SemActViolation: (err, ctx) => ({
    text: err.message || "rejected by a semantic action",
    node: ctx.node,
  }),
  FeasibilityViolation: (err, ctx) => {
    // each repair is a set of arcs to add together; the repairs are the
    // alternatives, and removing the triple is always one of them
    const ways = (err.repairs || []).map((repair: any) =>
      (repair.arcs || []).map((arc: any) => arc.property));
    const each1 = ways.every((arcs: string[]) => arcs.length === 1);
    const said = each1
          ? "add " + ways.map((arcs: string[]) => arcs[0]).join(" or ")
          : ways.map((arcs: string[]) => "add " + arcs.join(" and ")).join(", or ");
    return {
      text: "triple " + termText(err.triple && err.triple.predicate) + " "
        + termText(err.triple && err.triple.object) + " fits no triple constraint: "
        + (ways.length === 0 ? "remove it" : "either " + said + ", or remove it"),
      predicate: err.triple && err.triple.predicate,
      triple: err.triple,
      node: ctx.node,
    };
  },
};

/**
 * The sentence for one error, or null where it has none of its own -- a
 * wrapper whose account is the errors nested inside it, which the caller
 * composes as it sees fit.
 */
export function describeError (err: any, ctx: ErrorContext = {}): ErrorDescription | null {
  if (typeof err === "string")
    return {text: firstLine(err)};
  if (err === null || typeof err !== "object" || typeof err.type !== "string")
    return null;
  const leaf = leaves[err.type];
  return leaf === undefined ? null : leaf(err, ctx);
}

/** Does this error say something itself, or only through what it contains? */
export function isLeafError (err: any): boolean {
  return typeof err === "string"
    || (err !== null && typeof err === "object" && typeof err.type === "string"
        && err.type in leaves);
}

/** what would make a node conform, as one line per way */
export function repairText (repairs: any[]): string[] {
  return (repairs || []).map(repair => (repair.arcs || []).map(
    (arc: any) => (arc.delta > 0 ? "add " : "remove ") + Math.abs(arc.delta) + " " + arc.property)
    .join(" and ")).filter(way => way !== "");
}
