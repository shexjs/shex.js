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

/** where in a sentence a term stands, so a host can spell it accordingly */
export type TermRole = "subject" | "predicate" | "object" | "node" | "property" | "shape";

/**
 * How a host spells a term for a reader who is looking at a document.
 *
 * `<http://hl7.example/Patient2>` is the same node the reader sees written
 * `<Patient2>` on line 8, and only the host knows that: it has the document,
 * its prefixes and its base -- and, where the term is actually written down,
 * the range it was written in, which is better than any of them, being what
 * the author typed rather than a reconstruction of it.
 *
 * Return null for a term the host can't better, and the explicit spelling is
 * used.  Terms are spelled for the document the *reader* is being sent to,
 * which is not always the one the term came from: a property missing from
 * the patient is spelled as the patient's document spells its properties.
 */
export type TermLexer = (term: any, role: TermRole) => string | null;

/** what a caller may already know about where an error was found */
export interface ErrorContext {
  /** the node has been named by whatever this nests under: say only why */
  terse?: boolean;
  /** the TripleConstraint being tested, when the error is nested under one */
  constraint?: ShExJ.TripleConstraint;
  triple?: any;
  node?: any;
  /** the schema's prefixes, so a quoted fragment reads as the schema spells it */
  prefixes?: { [prefix: string]: string };
  /** the schema's BASE, so a shape it declares reads as `<PatientShape>`
   * rather than as the absolute IRI that spelling stands for */
  base?: string;
  /** how the host spells terms, where it can do better than the full IRI */
  lex?: TermLexer;
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

/** an IRI as the schema spells it, where it has a prefix for it */
export function iriText (iri: string, prefixes?: { [prefix: string]: string },
                         base?: string): string {
  for (const [prefix, namespace] of Object.entries(prefixes || {}))
    if (typeof namespace === "string" && namespace.length > 0 && iri.startsWith(namespace)
        && iri.substring(namespace.length).match(/^[A-Za-z_][-\w.]*$/))
      return prefix + ":" + iri.substring(namespace.length);
  return relativeIri(iri, base) || "<" + iri + ">";
}

/**
 * An IRI written against a BASE, or null where it isn't under one.
 *
 * Only a plain relative reference: something that would re-resolve elsewhere
 * -- a second scheme, a leading slash, a query or a fragment -- has to stay
 * absolute or it stops naming the same thing.
 */
export function relativeIri (iri: string, base?: string): string | null {
  if (!base || !iri.startsWith(base) || iri.length === base.length)
    return null;
  const rest = iri.substring(base.length);
  return rest.match(/^[^\/:?#][^:?#]*$/) ? "<" + rest + ">" : null;
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
 * A term from the data, as the reader will find it written.
 *
 * The host's spelling if it has one, and the explicit form otherwise -- never
 * the *schema's* prefixes, which are a different table that may bind the same
 * prefix to a different namespace.  A friendly name that names something else
 * is worse than a long one.
 */
export function dataTerm (term: any, ctx: ErrorContext, role: TermRole): string {
  const said = ctx.lex ? ctx.lex(term, role) : null;
  return said || termText(term);
}

/**
 * An IRI the *schema* names -- a property it requires, a shape it refers to.
 *
 * The host still gets first say: a property missing from a document is best
 * spelled the way that document spells its properties, since that is where
 * the reader will go looking for it.  Failing that, the schema's own
 * spelling, which is at least a table this IRI was written against.
 */
export function schemaIri (iri: any, ctx: ErrorContext, role: TermRole): string {
  const said = ctx.lex ? ctx.lex(iri, role) : null;
  if (said)
    return said;
  return typeof iri === "string" && !iri.startsWith("_:")
    ? iriText(iri, ctx.prefixes, ctx.base)
    : termText(iri);
}

/**
 * A fragment of schema, as ShExC.
 *
 * A message naming what a node had to satisfy reads as the schema does --
 * `xsd:integer mininclusive 3` -- rather than as the ShExJ it is made of.
 * A fragment the writer can't render (a reference to something it hasn't
 * been given, say) falls back to its label or to nothing, never to JSON.
 */
export function shexcFragment (expr: any, prefixes?: { [prefix: string]: string },
                               base?: string): string {
  if (expr === undefined || expr === null)
    return "";
  if (typeof expr === "string")            // a shape reference
    return "@" + iriText(expr, prefixes, base);
  try {
    const writer = new ShExWriter({simplifyParentheses: false, prefixes: prefixes || {}});
    const said = writer.writeShapeExpr(expr);
    return typeof said === "string" ? said.trim() : "";
  } catch (e) {
    return expr.id ? "@<" + expr.id + ">" : "";
  }
}

/** a TripleConstraint as a reader would write it: predicate, value, cardinality */
export function constraintText (tc: any, prefixes?: { [prefix: string]: string },
                                ctx?: ErrorContext): string {
  if (!tc || typeof tc !== "object")
    return "the constraint";
  const value = tc.valueExpr === undefined ? "."
        : shexcFragment(tc.valueExpr, prefixes, ctx && ctx.base) || ".";
  const min = tc.min === undefined ? 1 : tc.min, max = tc.max === undefined ? 1 : tc.max;
  const card = min === 1 && max === 1 ? ""
    : min === 0 && max === 1 ? "?"
    : min === 0 && max === -1 ? "*"
    : min === 1 && max === -1 ? "+"
    : " {" + min + "," + (max === -1 ? "*" : max) + "}";
  const predicate = tc.predicate === undefined ? ""
        : schemaIri(tc.predicate, ctx || {prefixes}, "predicate") + " ";
  return predicate + value + card;
}

/**
 * Why a node missed a constraint, from the leaf the validator now records.
 * A leaf it hasn't typed yet carries only its English, which is used as-is.
 */
export function nodeConstraintDetail (leaf: any, prefixes?: {[prefix: string]: string}): string {
  if (typeof leaf === "string")
    return firstLine(leaf);
  if (leaf === null || typeof leaf !== "object")
    return String(leaf);
  switch (leaf.type) {
  case "DatatypeMismatch":
    return leaf.actual === null || leaf.actual === undefined
      ? "not a literal of type " + iriText(leaf.expected, prefixes)
      : "has type " + iriText(leaf.actual, prefixes) + ", not "
        + iriText(leaf.expected, prefixes);
  case "NodeKindMismatch":
    return "is a " + leaf.actual + ", not an " + leaf.expected;
  case "ValueSetMismatch":
    return "is not in "
      + (shexcFragment({type: "NodeConstraint", values: leaf.values || []}, prefixes) || "the value set");
  case "PatternMismatch":
    return "doesn't match /" + leaf.pattern + "/" + (leaf.flags || "");
  case "FacetViolation":
    return "is " + JSON.stringify(leaf.actual) + ", not " + leaf.facet + " " + leaf.expected;
  default:
    return firstLine(leaf.message !== undefined ? leaf.message : JSON.stringify(leaf));
  }
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
    text: dataTerm(err.triple && err.triple.object, ctx, "object") + " doesn't satisfy "
      + constraintText(err.constraint || ctx.constraint, ctx.prefixes, ctx),
    schemaObj: err.constraint || ctx.constraint,
    predicate: (err.constraint || ctx.constraint || {}).predicate
      || (err.triple && err.triple.predicate),
    triple: err.triple,
  }),
  MissingProperty: (err, ctx) => ({
    text: "missing property " + schemaIri(err.property, ctx, "property")
      + (err.valueExpr === undefined ? "" : " " + shexcFragment(err.valueExpr, ctx.prefixes, ctx.base)),
    predicate: err.property,
    node: ctx.node,
  }),
  ExcessTripleViolation: (err, ctx) => ({
    text: "too many occurrences of "
      + schemaIri(err.property || (err.triple && err.triple.predicate), ctx, "predicate"),
    predicate: err.property || (err.triple && err.triple.predicate),
    triple: err.triple,
    node: ctx.node,
  }),
  ClosedShapeViolation: (err, ctx) => ({
    text: "unexpected in a closed shape: "
      + (err.unexpectedTriples || []).map((t: any) => dataTerm(t.predicate, ctx, "predicate")).join(", "),
    triples: err.unexpectedTriples,
    node: ctx.node,
  }),
  NodeConstraintViolation: (err, ctx) => ({
    text: (ctx.terse
           ? ""
           : dataTerm(err.node, ctx, "node") + " doesn't satisfy "
             + (shexcFragment(err.shapeExpr, ctx.prefixes, ctx.base) || "the node constraint")
             + ((err.errors || []).length === 0 ? "" : ": "))
      + (err.errors || []).map((leaf: any) => nodeConstraintDetail(leaf, ctx.prefixes)).join("; ")
      + ((err.errors || []).length === 0 && ctx.terse
         ? "doesn't satisfy " + (shexcFragment(err.shapeExpr, ctx.prefixes, ctx.base) || "the node constraint")
         : ""),
    schemaObj: err.shapeExpr || ctx.constraint,
    predicate: (ctx.constraint || {}).predicate || (ctx.triple && ctx.triple.predicate),
    triple: ctx.triple,
    node: err.node || ctx.node,
  }),
  NegatedProperty: (err, ctx) => ({
    text: "unexpected " + dataTerm(err.property, ctx, "predicate"),
    predicate: err.property,
    node: ctx.node,
  }),
  AbstractShapeFailure: (err, ctx) => ({
    text: "abstract shape " + schemaIri(err.shape, ctx, "shape") + " can't be matched directly",
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
      text: "triple " + dataTerm(err.triple && err.triple.predicate, ctx, "predicate") + " "
        + dataTerm(err.triple && err.triple.object, ctx, "object") + " fits no triple constraint: "
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
export function repairText (repairs: any[], ctx: ErrorContext = {}): string[] {
  return (repairs || []).map(repair => (repair.arcs || []).map(
    (arc: any) => (arc.delta > 0 ? "add " : "remove ") + Math.abs(arc.delta)
      + " " + schemaIri(arc.property, ctx, "property"))
    .join(" and ")).filter(way => way !== "");
}
