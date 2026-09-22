"use strict";

/**
 * ShExRWriter — serialize a ShExJ schema as ShExR (a ShEx schema written as RDF),
 * in Turtle, using the `sx:` (http://www.w3.org/ns/shex#) vocabulary defined by
 * ShExR.shex. Mirrors ShExUtil.ShExRtoShExJ in reverse.
 *
 *   new ShExRWriter({ base }).writeSchema(shexjSchema, (error, text, prefixes) => …)
 *
 * The ShExR encoding is a near-mechanical projection of ShExJ: an object with a
 * `type` becomes `[ a sx:Type ; … ]` (a named node `<id> a sx:Type ; …` when it
 * has an `id`), each ShExJ key `k` becomes `sx:k` (with `annotations`→`sx:annotation`),
 * array-valued keys become RDF collections `( … )`, `nodeKind` values become the
 * IRIs `sx:iri`/`sx:bnode`/`sx:literal`/`sx:nonliteral`, and `extra` expands to one
 * repeated `sx:extra <iri>` per value (it is `IRI *`, not a list).
 */

const SX = "http://www.w3.org/ns/shex#";
const XSD = "http://www.w3.org/2001/XMLSchema#";

// ShExJ array keys serialized as RDF collections "( … )".
const LIST_KEYS = new Set([
  "shapes", "shapeExprs", "expressions", "values", "semActs", "startActs",
  "imports", "annotations", "exclusions", "extends",
]);
// ShExJ keys whose (scalar) value is an IRI.
const IRI_KEYS = new Set(["predicate", "datatype", "name"]);
// ShExJ boolean keys.
const BOOL_KEYS = new Set(["inverse", "negated", "closed", "abstract"]);
// ShExJ integer keys.
const INT_KEYS = new Set(["min", "max", "length", "minlength", "maxlength", "totaldigits", "fractiondigits"]);
// ShExJ numeric-literal keys (value may be number or {value,type}).
const NUM_KEYS = new Set(["mininclusive", "minexclusive", "maxinclusive", "maxexclusive"]);
// ShExJ string keys.
const STRING_KEYS = new Set(["pattern", "flags", "code", "stem", "languageTag"]);
// ShExJ keys whose value is a nested shape/triple expression (ref or object).
const EXPR_KEYS = new Set(["shapeExpr", "valueExpr", "start", "expression", "object"]);

function ShExRWriter (options) { this.options = options || {}; }

ShExRWriter.prototype.writeSchema = function (schema, callback) {
  try {
    // Prefer the schema's own base for the `ex:` prefix; the caller's base is
    // often the source file's file: URL, which is noise. Skip a file: base.
    let base = schema._base || this.options.base;
    if (base && String(base).startsWith("file:")) base = null;
    const out = [];
    if (base) out.push(`PREFIX ex: <${String(base).replace(/\/$/, "")}>`);
    out.push(`PREFIX sx: <${SX}>`);
    out.push(`PREFIX xsd: <${XSD}>`);
    out.push("");

    const shapes = schema.shapes || [];
    // --- the Schema node ---
    const sprops = [];
    if (schema.imports) sprops.push(`sx:imports ${coll(schema.imports.map(iri))}`);
    if (schema.startActs) sprops.push(`sx:startActs ${coll(schema.startActs.map(a => node(a, 2)))}`);
    if (schema.start !== undefined) sprops.push(`sx:start ${expr(schema.start, 1)}`);
    if (shapes.length) sprops.push(`sx:shapes ${coll(shapes.map(d => iri(declId(d))))}`);
    out.push(`[] a sx:Schema ;\n    ${sprops.join(" ;\n    ")} .`);
    out.push("");

    // --- each shape declaration as a top-level statement ---
    for (const decl of shapes) {
      const isDecl = decl.type === "ShapeDecl";
      const abstract = isDecl && decl.abstract ? " sx:abstract true ;" : "";
      const se = isDecl ? decl.shapeExpr : decl; // ShExJ may inline a bare shapeExpr with an id
      out.push(`${iri(declId(decl))} a sx:ShapeDecl ;${abstract} sx:shapeExpr ${shapeExpr(se, 1)} .`);
      out.push("");
    }
    callback(null, out.join("\n"), { sx: SX, xsd: XSD });
  } catch (e) { callback(e); }
};

function declId (d) { return d.id !== undefined ? d.id : d.shapeExpr && d.shapeExpr.id; }

// A shape expression: a string (reference) or an object with a `type`.
function shapeExpr (se, depth) {
  if (typeof se === "string") return iri(se);
  return node(se, depth);
}
// A nested expression value that may be a ref (string) or an inline object.
function expr (v, depth) { return typeof v === "string" ? iri(v) : node(v, depth); }

// Serialize any typed ShExJ object as `[ a sx:Type ; … ]` (or `<id> …` if named).
function node (obj, depth) {
  const ind = "  ".repeat(depth + 1);
  const parts = [];
  for (const k of Object.keys(obj)) {
    if (k === "type" || k === "id" || k[0] === "_") continue;
    parts.push(prop(k, obj[k], depth + 1, ind));
  }
  let body = `a sx:${obj.type}`;
  if (parts.length) body += ` ;\n${ind}${parts.join(` ;\n${ind}`)}`;
  return obj.id !== undefined ? `${iri(obj.id)} ${body}` : `[ ${body} ]`;
}

// Serialize one `key: value` as one-or-more `sx:pred …` clauses.
function prop (k, v, depth, ind) {
  if (k === "extra") return v.map(x => `sx:extra ${iri(x)}`).join(` ;\n${ind}`);
  if (k === "nodeKind") return `sx:nodeKind sx:${v}`;
  if (BOOL_KEYS.has(k)) return `sx:${k} ${v ? "true" : "false"}`;
  if (INT_KEYS.has(k)) return `sx:${k} ${v}`;
  if (NUM_KEYS.has(k)) return `sx:${k} ${numLit(v)}`;
  if (STRING_KEYS.has(k)) return `sx:${k} ${strLit(v)}`;
  if (IRI_KEYS.has(k)) return `sx:${k} ${iri(v)}`;
  if (EXPR_KEYS.has(k)) return `sx:${predName(k)} ${k === "object" ? valueSetValue(v, depth) : expr(v, depth)}`;
  if (LIST_KEYS.has(k)) return `sx:${predName(k)} ${coll(v.map(item => listItem(k, item, depth)))}`;
  throw new Error(`ShExRWriter: unhandled ShExJ property '${k}'`);
}

// ShExJ key -> ShExR predicate local name (only `annotations` differs).
function predName (k) { return k === "annotations" ? "annotation" : k; }

function listItem (k, item, depth) {
  switch (k) {
    case "shapeExprs":
    case "extends":     return shapeExpr(item, depth);
    case "expressions": return expr(item, depth);          // triple expression or ref
    case "semActs":
    case "startActs":
    case "annotations": return node(item, depth);          // SemAct / Annotation
    case "imports":     return iri(item);
    case "values":      return valueSetValue(item, depth);
    case "exclusions":  return typeof item === "string" ? iri(item) : node(item, depth);
    default:            return typeof item === "string" ? iri(item) : node(item, depth);
  }
}

// A value-set value: bare IRI, RDF literal, or a stem/language object.
function valueSetValue (v, depth) {
  if (typeof v === "string") return iri(v);            // objectValue: IRI
  if (v && v.type) return node(v, depth);              // IriStem / LiteralStem / Language / … / Wildcard
  if (v && "value" in v) return rdfLiteral(v);         // objectValue: LITERAL
  throw new Error(`ShExRWriter: unhandled value-set value ${JSON.stringify(v)}`);
}

// --- terminals ---
function iri (i) { return `<${i}>`; }
function strLit (s) { return JSON.stringify(String(s)); }
function numLit (v) { return (v && typeof v === "object") ? rdfLiteral(v) : String(v); }
function rdfLiteral (lit) {
  if (typeof lit !== "object") return JSON.stringify(String(lit));
  let s = JSON.stringify(String(lit.value));
  if (lit.language) s += "@" + lit.language;
  else if (lit.type) s += "^^" + iri(lit.type);
  return s;
}
function coll (items) { return `(${items.length ? " " + items.join(" ") + " " : ""})`; }

module.exports = ShExRWriter;
