/**
 * lezer-shexc -- an incremental, error-tolerant Lezer grammar for ShEx
 * Compact Syntax (ShExC), with highlighting tags for CodeMirror.
 *
 *   import {parser} from "lezer-shexc";
 *   const tree = parser.parse(text);        // a @lezer/common Tree
 *
 * The parse is what the ShEx specification's grammar (as shex.js's parser
 * has it) accepts, so a schema the validator takes parses without error
 * nodes here, and one it refuses shows where -- and, being Lezer, a
 * half-typed schema still parses around the error, and an edit re-parses
 * only what it touched.  This is the editor's parse, for colour, folding
 * and structure; the schema itself still comes from @shexjs/parser.
 */
import {styleTags, tags as t} from "@lezer/highlight";
import {parser as rawParser} from "./parser.js";

/** the highlighting: what each token is, and what an IRI is *for* */
export const highlighting = styleTags({
  // an IRI is coloured by its role: a shape's label where it is declared,
  // a reference to one, a predicate, a datatype; anything else as an IRI
  "ShapeExprDecl/ShapeExprLabel/IRIREF ShapeExprDecl/ShapeExprLabel/PrefixedName/...": t.definition(t.className),
  "ShapeRef/ShapeExprLabel/IRIREF ShapeRef/ShapeExprLabel/PrefixedName/...": t.className,
  "ATIRIREF ATPNAME_LN ATPNAME_NS ATBLANK_NODE_LABEL": t.className,
  "Predicate/IRIREF Predicate/PrefixedName/...": t.propertyName,
  "Datatype/IRIREF Datatype/PrefixedName/...": t.typeName,
  "TripleExprLabel/IRIREF TripleExprLabel/PrefixedName/...": t.labelName,
  IRIREF: t.url,
  "PNAME_LN PNAME_NS": t.namespace,
  BLANK_NODE_LABEL: t.variableName,
  "STRING_LITERAL1 STRING_LITERAL2 STRING_LITERAL_LONG1 STRING_LITERAL_LONG2": t.string,
  "LANG_STRING_LITERAL1 LANG_STRING_LITERAL2 LANG_STRING_LITERAL_LONG1 LANG_STRING_LITERAL_LONG2": t.string,
  LANGTAG: t.modifier,
  "INTEGER DECIMAL DOUBLE": t.number,
  "TrueKw FalseKw": t.bool,
  REGEXP: t.regexp,
  REPEAT_RANGE: t.number,
  CODE: t.meta,
  "BaseKw PrefixKw ImportKw StartKw": t.definitionKeyword,
  "AbstractKw ExternalKw RestrictsKw ExtendsKw ClosedKw ExtraKw": t.modifier,
  "LiteralKw IriKw BnodeKw NonLiteralKw": t.typeName,
  "AndKw OrKw NotKw": t.logicOperator,
  "MinInclusiveKw MinExclusiveKw MaxInclusiveKw MaxExclusiveKw LengthKw MinLengthKw MaxLengthKw TotalDigitsKw FractionDigitsKw": t.keyword,
  RdfTypeKw: t.keyword,
  ShapeAny: t.atom,
  Comment: t.comment,
  'Cardinality/"*" Cardinality/"+" Cardinality/"?"': t.arithmeticOperator,
  'SenseFlags/"^"': t.operator,
  '"//" ^^ ~ = $ & | @ %': t.operator,
  "( )": t.paren,
  "[ ]": t.squareBracket,
  "{ }": t.brace,
  ", ;": t.separator,
});

export const parser = rawParser.configure({props: [highlighting]});
