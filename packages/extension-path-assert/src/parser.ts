/**
 * The assertion language's syntax: a lexer and a recursive-descent parser
 * that turn `%assert:{ … %}` code into the AST the evaluator walks.
 *
 * The grammar is XPath 3's, cut down and re-aimed at RDF:
 *
 *   Expr        ::= ExprSingle (',' ExprSingle)*            -- a sequence (union)
 *   ExprSingle  ::= 'let' Var ':=' ExprSingle 'return' ExprSingle
 *                 | 'if' '(' Expr ')' 'then' ExprSingle 'else' ExprSingle
 *                 | ('some' | 'every') Var 'in' ExprSingle 'satisfies' ExprSingle
 *                 | Or ('implies' ExprSingle)?
 *   Or          ::= And ('or' And)*                           -- also ||
 *   And         ::= Comparison ('and' Comparison)*            -- also &&
 *   Comparison  ::= Additive (('=' | '!=' | '<' | '<=' | '>' | '>=') Additive)?
 *   Additive    ::= Multiplicative (('+' | '-') Multiplicative)*
 *   Multiplicative ::= Union (('*' | 'div' | 'mod') Union)*
 *   Union       ::= Intersect (('|' | 'union') Intersect)*
 *   Intersect   ::= Unary (('intersect' | 'except') Unary)*
 *   Unary       ::= ('-' | '!')? Path
 *   Path        ::= Step ('/' Step)*                          -- E1/E2: E2 for each item of E1
 *   Step        ::= Primary Closure? Predicate*
 *   Closure     ::= '*' | '+' | '?'      -- attached (no space) to a path step or a parenthesized path
 *   Predicate   ::= '[' Expr ']'
 *   Primary     ::= '.' | Var | Literal | '@' IRI | ('^')? IRI | 'a' | '^a'
 *                 | '(' Expr? ')' | Name '(' (ExprSingle (',' ExprSingle)*)? ')'
 *
 * An IRI (or prefixed name) is a property: a step from the context item
 * along that predicate, or against it after `^`.  A node is written with
 * `@` in front (`@ex:Alice`, `@<http://…>`), which is what tells
 * `up:classifiedWith = @keyword:371` apart from a comparison of two
 * properties.  `a` is rdf:type, as in Turtle.  `*`, `+` and `?` written
 * right after a step (`rdfs:subClassOf*`, `(:a/:b)+`) are closures, as in
 * SPARQL property paths; with a space before them they are arithmetic.
 * `#` starts a comment.  Literals are Turtle's.
 */
import type {Term} from "@rdfjs/types";
import {literal, langLiteral, bool, number, NumericKind, RDF_TYPE} from "./terms";

export interface Span { start: number; end: number; }

export type BinaryOp = "or" | "and" | "implies"
  | "=" | "!=" | "<" | "<=" | ">" | ">="
  | "+" | "-" | "*" | "div" | "mod"
  | "union" | "intersect" | "except";

export type Node =
  | ({type: "Context"} & Span)
  | ({type: "Var", name: string} & Span)
  | ({type: "Literal", term: Term} & Span)
  | ({type: "NodeRef", iri: string} & Span)
  | ({type: "Step", iri: string, inverse: boolean} & Span)
  | ({type: "Closure", kind: "*" | "+" | "?", expr: Node} & Span)
  | ({type: "Filter", expr: Node, predicate: Node} & Span)
  | ({type: "Path", steps: Node[]} & Span)
  | ({type: "Sequence", items: Node[]} & Span)
  | ({type: "Binary", op: BinaryOp, left: Node, right: Node} & Span)
  | ({type: "Negate", expr: Node} & Span)
  | ({type: "Not", expr: Node} & Span)
  | ({type: "Call", name: string, args: Node[]} & Span)
  | ({type: "Let", name: string, value: Node, body: Node} & Span)
  | ({type: "If", test: Node, then: Node, else: Node} & Span)
  | ({type: "Quantified", kind: "some" | "every", name: string, domain: Node, body: Node} & Span);

export interface ParseOptions {
  prefixes?: {[prefix: string]: string};
  base?: string;
}

export class AssertSyntaxError extends Error {
  constructor (message: string, public pos: number, code: string) {
    super(message + "\n" + code + "\n" + " ".repeat(Math.max(0, pos)) + "^");
    this.name = "AssertSyntaxError";
  }
}

// ── lexer ───────────────────────────────────────────────────────────────────

type TokType = "str" | "num" | "iri" | "noderef" | "var" | "name" | "punct" | "eof";

interface Token {
  t: TokType;
  v: string;
  pos: number;
  end: number;
  /** whitespace (or a comment) came right before it */
  ws: boolean;
  lang?: string;
  dt?: string;
  kind?: NumericKind;
}

const NAME_START = /[A-Za-z_À-￿]/;
const NAME_CHAR = /[A-Za-z0-9_.\-À-￿]/;
const LOCAL_CHAR = /[A-Za-z0-9_.\-%\\À-￿]/;
const PUNCT2 = [":=", "!=", "<=", ">=", "&&", "||"];
const PUNCT1 = "()[],/^|=<>+-*?.!";

function lex (code: string, opts: ParseOptions): Token[] {
  const tokens: Token[] = [];
  const prefixes = opts.prefixes || {};
  let i = 0;
  let ws = false;
  const fail = (msg: string, at: number): never => { throw new AssertSyntaxError(msg, at, code); };
  const resolveIri = (iri: string): string => {
    if (!opts.base || /^[a-z][a-z0-9+.-]*:/i.test(iri)) return iri;
    try { return new URL(iri, opts.base).href; } catch (_e) { return iri; }
  };
  const expandPname = (pname: string, at: number): string => {
    const colon = pname.indexOf(":");
    const prefix = pname.substring(0, colon), local = pname.substring(colon + 1);
    if (!(prefix in prefixes))
      fail(`unknown prefix "${prefix}:" (the schema's PREFIX declarations are in scope)`, at);
    return prefixes[prefix] + local.replace(/\\(.)/g, "$1");
  };
  /** an IRIREF or a prefixed name at i, or null */
  const iriAt = (): {iri: string, end: number} | null => {
    if (code[i] === "<") {
      const m = /^<([^<>"{}|^`\\\s]*)>/.exec(code.substring(i));
      return m ? {iri: resolveIri(m[1]), end: i + m[0].length} : null;
    }
    let j = i;
    while (j < code.length && NAME_CHAR.test(code[j])) j++;
    if (code[j] !== ":") return null;
    j++;
    while (j < code.length && LOCAL_CHAR.test(code[j])) {
      if (code[j] === "\\") j++;                       // an escaped local char
      j++;
    }
    while (code[j - 1] === "." && j > i) j--;          // a trailing dot ends the sentence, not the name
    return {iri: expandPname(code.substring(i, j), i), end: j};
  };

  while (i < code.length) {
    const c = code[i];
    if (/\s/.test(c)) { i++; ws = true; continue; }
    if (c === "#") { while (i < code.length && code[i] !== "\n") i++; ws = true; continue; }
    const pos = i;
    const push = (t: TokType, v: string, end: number, extra: Partial<Token> = {}) => {
      tokens.push(Object.assign({t, v, pos, end, ws}, extra));
      i = end;
      ws = false;
    };

    if (c === '"' || c === "'") {                       // a string literal
      let j = i + 1, s = "";
      while (j < code.length && code[j] !== c) {
        if (code[j] === "\\") {
          const e = code[j + 1];
          const simple: {[k: string]: string} = {n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", '"': '"', "'": "'", "\\": "\\"};
          if (e in simple) { s += simple[e]; j += 2; }
          else if (e === "u" || e === "U") {
            const len = e === "u" ? 4 : 8;
            const hex = code.substring(j + 2, j + 2 + len);
            if (!/^[0-9A-Fa-f]+$/.test(hex) || hex.length !== len) fail("bad \\" + e + " escape", j);
            s += String.fromCodePoint(parseInt(hex, 16));
            j += 2 + len;
          } else fail("unknown escape \\" + e, j);
        } else { s += code[j]; j++; }
      }
      if (j >= code.length) fail("unterminated string", i);
      j++;
      const extra: Partial<Token> = {};
      const langMatch = /^@([A-Za-z]+(?:-[A-Za-z0-9]+)*)/.exec(code.substring(j));
      if (langMatch) { extra.lang = langMatch[1]; j += langMatch[0].length; }
      else if (code.startsWith("^^", j)) {
        i = j + 2;
        const dt = iriAt();
        if (dt === null) fail("expected a datatype IRI after ^^", j);
        extra.dt = dt!.iri;
        j = dt!.end;
      }
      i = pos;
      push("str", s, j, extra);
      continue;
    }
    if (/[0-9]/.test(c)) {                              // a number
      const m = /^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/.exec(code.substring(i))!;
      const kind: NumericKind = m[2] ? "double" : m[1] ? "decimal" : "integer";
      push("num", m[0], i + m[0].length, {kind});
      continue;
    }
    if (c === "@") {                                    // a node
      i++;
      const iri = iriAt();
      if (iri === null) fail("expected an IRI or prefixed name after @", pos);
      i = pos;
      push("noderef", iri!.iri, iri!.end);
      continue;
    }
    if ((c === "$" || c === "?") && i + 1 < code.length && NAME_START.test(code[i + 1])) {
      let j = i + 1;
      while (j < code.length && /[A-Za-z0-9_À-￿]/.test(code[j])) j++;
      push("var", code.substring(i + 1, j), j);
      continue;
    }
    if (c === "<" && !code.startsWith("<=", i)) {
      const iri = iriAt();
      if (iri !== null) { push("iri", iri.iri, iri.end); continue; }
    }
    if (code.startsWith(":=", i)) { push("punct", ":=", i + 2); continue; }   // before a prefixed name's ":"
    if (c === ":" || NAME_START.test(c)) {              // a prefixed name, a keyword or a function name
      const iri = iriAt();
      if (iri !== null) { push("iri", iri.iri, iri.end); continue; }
      let j = i;
      while (j < code.length && NAME_CHAR.test(code[j])) j++;
      while (code[j - 1] === "." && j > i) j--;
      if (j === i) fail(`unexpected "${c}"`, i);
      push("name", code.substring(i, j), j);
      continue;
    }
    const two = code.substring(i, i + 2);
    if (PUNCT2.indexOf(two) !== -1) { push("punct", two, i + 2); continue; }
    if (PUNCT1.indexOf(c) !== -1) { push("punct", c, i + 1); continue; }
    fail(`unexpected "${c}"`, i);
  }
  tokens.push({t: "eof", v: "", pos: code.length, end: code.length, ws});
  return tokens;
}

// ── parser ──────────────────────────────────────────────────────────────────

const KEYWORDS = new Set(["let", "return", "if", "then", "else", "some", "every", "in", "satisfies",
                          "implies", "or", "and", "union", "intersect", "except", "div", "mod",
                          "true", "false", "a"]);

/** what a closure can apply to: something that navigates from its context */
function isPathLike (n: Node): boolean {
  switch (n.type) {
  case "Step": case "Closure": case "Filter": case "Path": return true;
  case "Binary": return (n.op === "union" || n.op === "intersect" || n.op === "except") && isPathLike(n.left) && isPathLike(n.right);
  case "Sequence": return n.items.every(isPathLike);
  default: return false;
  }
}

export function parse (code: string, opts: ParseOptions = {}): Node {
  const tokens = lex(code, opts);
  let k = 0;
  const peek = (): Token => tokens[k];
  const next = (): Token => tokens[k++];
  const fail = (msg: string, tok: Token = peek()): never => {
    throw new AssertSyntaxError(msg + (tok.t === "eof" ? " at the end" : ` at "${code.substring(tok.pos, tok.end)}"`), tok.pos, code);
  };
  const isPunct = (v: string, tok: Token = peek()) => tok.t === "punct" && tok.v === v;
  const isName = (v: string, tok: Token = peek()) => tok.t === "name" && tok.v === v;
  const expectPunct = (v: string): Token => isPunct(v) ? next() : fail(`expected "${v}"`);
  const expectName = (v: string): Token => isName(v) ? next() : fail(`expected "${v}"`);
  const expectVar = (): string => peek().t === "var" ? next().v : fail("expected a $variable");
  const span = (start: number): Span => ({start, end: tokens[k - 1].end});

  function parseExpr (): Node {
    const start = peek().pos;
    const items = [parseExprSingle()];
    while (isPunct(",")) { next(); items.push(parseExprSingle()); }
    return items.length === 1 ? items[0] : {type: "Sequence", items, ...span(start)};
  }

  function parseExprSingle (): Node {
    const start = peek().pos;
    if (isName("let")) {
      next();
      const name = expectVar();
      expectPunct(":=");
      const value = parseExprSingle();
      expectName("return");
      const body = parseExprSingle();
      return {type: "Let", name, value, body, ...span(start)};
    }
    if (isName("if")) {
      next(); expectPunct("(");
      const test = parseExpr();
      expectPunct(")"); expectName("then");
      const then = parseExprSingle();
      expectName("else");
      const otherwise = parseExprSingle();
      return {type: "If", test, then, else: otherwise, ...span(start)};
    }
    if (isName("some") || isName("every")) {
      const kind = next().v as "some" | "every";
      const name = expectVar();
      expectName("in");
      const domain = parseExprSingle();
      expectName("satisfies");
      const body = parseExprSingle();
      return {type: "Quantified", kind, name, domain, body, ...span(start)};
    }
    const left = parseOr();
    if (isName("implies")) {
      next();
      const right = parseExprSingle();
      return {type: "Binary", op: "implies", left, right, ...span(start)};
    }
    return left;
  }

  function binaryLevel (ops: {[token: string]: BinaryOp}, below: () => Node, names: boolean): Node {
    const start = peek().pos;
    let left = below();
    for (;;) {
      const tok = peek();
      const key = (names && tok.t === "name") || tok.t === "punct" ? tok.v : "";
      if (!(key in ops)) return left;
      next();
      const right = below();
      left = {type: "Binary", op: ops[key], left, right, ...span(start)};
    }
  }

  const parseOr = () => binaryLevel({or: "or", "||": "or"}, parseAnd, true);
  const parseAnd = () => binaryLevel({and: "and", "&&": "and"}, parseComparison, true);
  function parseComparison (): Node {
    const start = peek().pos;
    const left = parseAdditive();
    const tok = peek();
    if (tok.t === "punct" && ["=", "!=", "<", "<=", ">", ">="].indexOf(tok.v) !== -1) {
      next();
      const right = parseAdditive();
      if (peek().t === "punct" && ["=", "!=", "<", "<=", ">", ">="].indexOf(peek().v) !== -1)
        fail("comparisons don't chain: use `and`");
      return {type: "Binary", op: tok.v as BinaryOp, left, right, ...span(start)};
    }
    return left;
  }
  const parseAdditive = () => binaryLevel({"+": "+", "-": "-"}, parseMultiplicative, false);
  const parseMultiplicative = () => binaryLevel({"*": "*", div: "div", mod: "mod"}, parseUnion, true);
  const parseUnion = () => binaryLevel({"|": "union", union: "union"}, parseIntersect, true);
  const parseIntersect = () => binaryLevel({intersect: "intersect", except: "except"}, parseUnary, true);

  function parseUnary (): Node {
    const start = peek().pos;
    if (isPunct("-")) { next(); return {type: "Negate", expr: parseUnary(), ...span(start)}; }
    if (isPunct("!")) { next(); return {type: "Not", expr: parseUnary(), ...span(start)}; }
    return parsePath();
  }

  function parsePath (): Node {
    const start = peek().pos;
    const steps = [parseStep()];
    while (isPunct("/")) { next(); steps.push(parseStep()); }
    return steps.length === 1 ? steps[0] : {type: "Path", steps, ...span(start)};
  }

  function parseStep (): Node {
    const start = peek().pos;
    let node = parsePrimary();
    const tok = peek();
    if (tok.t === "punct" && (tok.v === "*" || tok.v === "+" || tok.v === "?") && !tok.ws) {
      if (!isPathLike(node))
        fail(`"${tok.v}" right after this is a closure, and closures apply to path steps; put a space before it for arithmetic`, tok);
      next();
      node = {type: "Closure", kind: tok.v as "*" | "+" | "?", expr: node, ...span(start)};
    }
    while (isPunct("[")) {
      next();
      const predicate = parseExpr();
      expectPunct("]");
      node = {type: "Filter", expr: node, predicate, ...span(start)};
    }
    return node;
  }

  function parsePrimary (): Node {
    const tok = peek();
    const start = tok.pos;
    switch (tok.t) {
    case "punct":
      if (tok.v === ".") { next(); return {type: "Context", ...span(start)}; }
      if (tok.v === "(") {
        next();
        if (isPunct(")")) { next(); return {type: "Sequence", items: [], ...span(start)}; }
        const inner = parseExpr();
        expectPunct(")");
        return inner;
      }
      if (tok.v === "^") {
        next();
        const target = peek();
        if (target.t === "iri") { next(); return {type: "Step", iri: target.v, inverse: true, ...span(start)}; }
        if (isName("a")) { next(); return {type: "Step", iri: RDF_TYPE, inverse: true, ...span(start)}; }
        return fail("expected a property after ^");
      }
      return fail("unexpected");
    case "iri": next(); return {type: "Step", iri: tok.v, inverse: false, ...span(start)};
    case "noderef": next(); return {type: "NodeRef", iri: tok.v, ...span(start)};
    case "var": next(); return {type: "Var", name: tok.v, ...span(start)};
    case "str": {
      next();
      const term = tok.lang ? langLiteral(tok.v, tok.lang) : literal(tok.v, tok.dt);
      return {type: "Literal", term, ...span(start)};
    }
    case "num": {
      next();
      return {type: "Literal", term: number(Number(tok.v), tok.kind!), ...span(start)};
    }
    case "name": {
      if (tok.v === "true" || tok.v === "false") { next(); return {type: "Literal", term: bool(tok.v === "true"), ...span(start)}; }
      if (tok.v === "a") { next(); return {type: "Step", iri: RDF_TYPE, inverse: false, ...span(start)}; }
      if (isPunct("(", tokens[k + 1]) && !KEYWORDS.has(tok.v)) {
        next(); next();
        const args: Node[] = [];
        if (!isPunct(")")) {
          args.push(parseExprSingle());
          while (isPunct(",")) { next(); args.push(parseExprSingle()); }
        }
        expectPunct(")");
        return {type: "Call", name: tok.v, args, ...span(start)};
      }
      if (KEYWORDS.has(tok.v)) return fail(`unexpected keyword`);
      return fail(`"${tok.v}" is not a function call, a keyword or a prefixed name`);
    }
    case "eof": return fail("expected an expression");
    }
  }

  const ast = parseExpr();
  if (peek().t !== "eof") fail("unexpected");
  return ast;
}

/** the source text of a node, for messages */
export function textOf (code: string, n: Span): string {
  return code.substring(n.start, n.end).replace(/\s+/g, " ").trim();
}
