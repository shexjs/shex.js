/** analysis - static checks of a ShExMap schema pair, before any data.
 *
 * `analyse(inputSchema, outputSchema)` says whether every output repetition has a
 * well-formed iteration scope, whether every variable the output reads is bound in the
 * input where it can be read from, and which bindings go unused -- the questions
 * materialization would otherwise answer at run time, one graph at a time.
 *
 * A variable's SITE is the chain of repeated constraints and groups of the input schema
 * that enclose its %Map code: it is bound once per iteration of the innermost one, or
 * once for the whole tree when the chain is empty.  An output repetition's ITERATION
 * SCOPE is the deepest site among the variables its body reads, nested repetitions
 * counting through their parent site; it is ill-formed when two of those sites lie in
 * unrelated lists.  A constraint may read a variable whose site is an ancestor of (or
 * equal to) the scope it is evaluated at; a deeper site means "which one?", and an
 * unrelated one means the value is not in scope.
 */
"use strict";

import {isKeyCode, keyArguments, NODE_ARGUMENT, expandVariable, allMatches} from "./keys";

const MapExt = "http://shex.io/extensions/Map/#";
const variablePattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;
const functionPattern = /^\s*[a-zA-Z0-9]+\(.*\)\s*$/;

type Site = any[];              // the enclosing repeated expressions, outermost first

export class Report {
  errors: string[] = [];
  warnings: string[] = [];
  bound: Map<string, Site> = new Map();     // input variable -> site
  read: Set<string> = new Set();            // variables the output reads
  prefixes: {[p: string]: string};

  constructor (prefixes: {[p: string]: string}) { this.prefixes = prefixes; }

  get ok (): boolean { return this.errors.length === 0; }

  where (site: Site): string {
    return site.length === 0 ? "the root" : "each " + site.map(e => label(e)).join(" / ");
  }

  /** `text` with every namespace the schemas declare written as its prefix */
  short (text: string): string {
    for (const [prefix, ns] of Object.entries(this.prefixes).sort((a, b) => b[1].length - a[1].length))
      if (ns)
        text = text.split(ns).join(prefix + ":");
    return text;
  }

  error (message: string) { this.errors.push(this.short(message)); }
  warn (message: string) { this.warnings.push(this.short(message)); }

  toString (): string {
    const lines = this.errors.map(e => "error: " + e).concat(this.warnings.map(w => "warning: " + w));
    return lines.length ? lines.join("\n") : "ok: the schemas map coherently";
  }
}

/** check that `outputSchema` can be materialized coherently from what `inputSchema` binds;
 * schemas are parsed ShExJ (with _index and _prefixes), `options.staticVars` the IRIs of
 * static variables, `options.inputStart`/`outputStart` shape labels (default: start) */
export function analyse (inputSchema: any, outputSchema: any, options: any = {}): Report {
  const prefixes = Object.assign({}, outputSchema._prefixes || outputSchema.prefixes || {},
                                 inputSchema._prefixes || inputSchema.prefixes || {});
  const report = new Report(prefixes);
  const statics: string[] = options.staticVars || [];
  new Input(inputSchema, prefixes, report).run(start(inputSchema, options.inputStart));
  new Output(outputSchema, prefixes, report, new Set(statics)).run(start(outputSchema, options.outputStart));
  for (const [v, site] of report.bound)
    if (!report.read.has(v))
      report.warn(`${v} is bound (at ${report.where(site)}) but the output never reads it`);
  for (const v of statics.filter(s => !report.read.has(s)).sort())
    report.warn(`static variable ${v} is never read`);
  return report;
}

function start (schema: any, given: any): any {
  if (given)
    return given;
  if (!schema.start)
    throw Error("the schema has no start shape; name one");
  return schema.start;
}

function isRepetition (expr: any): boolean {
  return !((expr.min === undefined || expr.min === 1) && (expr.max === undefined || expr.max === 1));
}

function isRepeated (expr: any): boolean {
  return expr.max !== undefined && expr.max !== 1;
}

function label (expr: any): string {
  const found: string[] = [];
  const stack = [expr];
  while (stack.length && found.length < 2) {
    const e = stack.shift();
    if (!e || typeof e === "string")
      continue;
    if (e.type === "TripleConstraint")
      found.push((e.inverse ? "^" : "") + e.predicate);
    else if (e.expressions)
      stack.unshift(...e.expressions);
  }
  return found.length > 1 ? "(" + found.join(", ") + ")" : found.length ? found[0] : "(group)";
}

/** (variables bound or read by a constraint's Map codes, id() arguments) */
function variables (tc: any, prefixes: any): {plain: string[], keys: string[], hasKey: boolean} {
  const plain: string[] = [];
  const keys: string[] = [];
  let hasKey = false;
  for (const act of (tc.semActs || []).filter((a: any) => a.name === MapExt)) {
    const code = act.code || "";
    try {
      if (isKeyCode(code)) {
        hasKey = true;
        keys.push(...keyArguments(code, prefixes).filter(a => a !== NODE_ARGUMENT));
      } else if (code.match(variablePattern)) {
        const m = code.match(variablePattern)!;
        plain.push(m[1] ? m[1] : (m[2] in prefixes ? prefixes[m[2]] + m[3] : m[2] + ":" + m[3]));
      } else if (functionPattern.test(code)) {
        plain.push(...functionVariables(code, prefixes));
      }
    } catch (e) {
      // an unparsable code is reported when it runs
    }
  }
  return {plain, keys, hasKey};
}

function functionVariables (code: string, prefixes: any): string[] {
  const call = /^\s*([a-zA-Z0-9]+)\s*\((.*)\)\s*$/s.exec(code);
  if (!call)
    return [];
  if (call[1] === "hashmap")
    return [expandVariable(call[2].split(",")[0].trim(), prefixes)];
  if (call[1] === "regex") {
    const out: string[] = [];
    for (const g of allMatches(/\(\?<([^>]+)>/g, call[2]))
      out.push(expandVariable(g[1].replace(/\\([\/^$])/g, "$1"), prefixes));
    return out;
  }
  return [];
}

class Walker {
  index: any;
  constructor (public schema: any, public prefixes: any, public report: Report) {
    this.index = schema._index || require("@shexjs/visitor").ShExIndexVisitor.index(schema);
  }
  decl (ref: string): any { return this.index.shapeExprs[ref]; }
  candidates (decl: any): any[] {
    const found: any[] = [];
    if (!decl.abstract)
      found.push(decl);
    const queue = [decl.id];
    const seen = new Set<string>();
    while (queue.length) {
      const base = queue.shift();
      for (const other of this.schema.shapes || []) {
        const shape = other.type === "ShapeDecl" ? other.shapeExpr : other;
        if (shape && shape.extends && shape.extends.indexOf(base) !== -1 && !seen.has(other.id)) {
          seen.add(other.id);
          if (!other.abstract)
            found.push(other);
          queue.push(other.id);
        }
      }
    }
    return found;
  }
  parts (shape: any, seen: Set<string> = new Set()): any[] {
    const out: any[] = [];
    for (const base of shape.extends || []) {
      if (seen.has(base))
        continue;
      seen.add(base);
      const d = this.decl(base);
      const se = d ? (d.type === "ShapeDecl" ? d.shapeExpr : d) : null;
      if (se && se.type === "Shape")
        out.push(...this.parts(se, seen));
    }
    out.push(shape);
    return out;
  }
  resolveExpr (e: any): any { return typeof e === "string" ? this.index.tripleExprs[e] : e; }
}

/** where the input schema binds each variable */
class Input extends Walker {
  seen = new Set<any>();

  run (se: any) { this.shapeExpr(se, []); }

  shapeExpr (se: any, site: Site): void {
    if (typeof se === "string") {
      const d = this.decl(se);
      if (d)
        for (const o of this.candidates(d))
          this.shapeExpr(o.type === "ShapeDecl" ? o.shapeExpr : o, site);
      return;
    }
    if (!se || this.seen.has(se))
      return;
    this.seen.add(se);
    if (se.type === "ShapeDecl")
      this.shapeExpr(se.shapeExpr, site);
    else if (se.type === "Shape")
      for (const p of this.parts(se))
        if (p.expression)
          this.expression(p.expression, site);
    else if (se.type === "ShapeAnd" || se.type === "ShapeOr")
      for (const p of se.shapeExprs)
        this.shapeExpr(p, site);
  }

  expression (expr: any, site: Site): void {
    expr = this.resolveExpr(expr);
    if (!expr)
      return;
    if (isRepeated(expr))
      site = site.concat([expr]);
    if (expr.type === "TripleConstraint") {
      for (const v of variables(expr, this.prefixes).plain) {
        const at = this.report.bound.get(v);
        if (at === undefined)
          this.report.bound.set(v, site);
        else if (!sameSite(at, site))
          this.report.error(`${v} is bound at two places of the input schema, ${this.report.where(at)} and ` +
                            `${this.report.where(site)}; a variable must have one binding site`);
      }
      if (expr.valueExpr !== undefined && typeof expr.valueExpr !== "object" || (expr.valueExpr && expr.valueExpr.type !== "NodeConstraint"))
        this.shapeExpr(expr.valueExpr, site);
    } else if (expr.type === "EachOf" || expr.type === "OneOf") {
      for (const e of expr.expressions)
        this.expression(e, site);
    }
  }
}

function sameSite (a: Site, b: Site): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

function isPrefixSite (a: Site, b: Site): boolean {
  return a.length <= b.length && a.every((x, i) => x === b[i]);
}

/** where the output schema reads each variable, and what each repetition iterates */
class Output extends Walker {
  scopes = new Map<any, Site | null>();
  illFormed = new Set<any>();
  active = new Set<any>();

  constructor (schema: any, prefixes: any, report: Report, public statics: Set<string>) {
    super(schema, prefixes, report);
  }

  run (se: any) { this.shapeExpr(se, []); }

  shapeExpr (se: any, scope: Site): void {
    if (typeof se === "string") {
      const d = this.decl(se);
      if (!d) {
        this.report.error(`the output schema references ${se}, which it does not define`);
        return;
      }
      const options = this.candidates(d);
      if (options.length === 0)
        this.report.error(`${se} is abstract and nothing extends it`);
      for (const o of options)
        this.shapeExpr(o.type === "ShapeDecl" ? o.shapeExpr : o, scope);
      return;
    }
    if (!se || this.active.has(se))
      return;
    this.active.add(se);
    try {
      if (se.type === "ShapeDecl")
        this.shapeExpr(se.shapeExpr, scope);
      else if (se.type === "Shape")
        for (const p of this.parts(se))
          if (p.expression)
            this.expression(p.expression, scope);
      else if (se.type === "ShapeAnd" || se.type === "ShapeOr")
        for (const p of se.shapeExprs)
          if (!(p && p.type === "NodeConstraint"))
            this.shapeExpr(p, scope);
      else if (se.type !== "NodeConstraint")
        this.report.error(`${se.type} cannot be materialized`);
    } finally {
      this.active.delete(se);
    }
  }

  expression (expr: any, scope: Site): void {
    expr = this.resolveExpr(expr);
    if (!expr)
      return;
    let bodyScope = scope;
    if (isRepetition(expr)) {
      const iterates = this.iterationScope(expr);
      if (this.illFormed.has(expr))
        return;                    // its structure is the error; its reads would only repeat it
      bodyScope = iterates !== null && iterates.length > scope.length ? iterates : scope;
    }
    if (expr.type === "TripleConstraint")
      this.constraint(expr, bodyScope);
    else if (expr.type === "EachOf" || expr.type === "OneOf")
      for (const e of expr.expressions)
        this.expression(e, bodyScope);
  }

  constraint (tc: any, scope: Site): void {
    const {plain, keys, hasKey} = variables(tc, this.prefixes);
    const acts = (tc.semActs || []).filter((a: any) => a.name === MapExt);
    if (hasKey) {
      if (acts.length > 1)
        this.report.error(`id() must be the only Map code on ${tc.predicate}`);
      if (!(tc.valueExpr !== undefined && (typeof tc.valueExpr === "string" || tc.valueExpr.type !== "NodeConstraint")))
        this.report.error(`id() on ${tc.predicate} needs a shape-valued constraint`);
      if (acts.some((a: any) => isKeyCode(a.code || "") && keyArguments(a.code, this.prefixes).indexOf(NODE_ARGUMENT) !== -1) && scope.length === 0)
        this.report.error(`id(@node) on ${tc.predicate} is read at the root, where no input iteration provides a node`);
    }
    for (const v of plain.concat(keys))
      this.readVariable(v, tc, scope);
    if (tc.valueExpr !== undefined && (typeof tc.valueExpr === "string" || tc.valueExpr.type !== "NodeConstraint"))
      this.shapeExpr(tc.valueExpr, scope);
  }

  readVariable (v: string, tc: any, scope: Site): void {
    this.report.read.add(v);
    if (this.statics.has(v))
      return;
    const site = this.report.bound.get(v);
    if (site === undefined) {
      this.report.error(`${tc.predicate} reads ${v}, which the input schema never binds`);
      return;
    }
    if (isPrefixSite(site, scope))
      return;                      // bound here or above: readable
    if (isPrefixSite(scope, site))
      this.report.error(`${tc.predicate} reads ${v}, bound once per ${this.report.where(site)}, from ` +
                        `${this.report.where(scope)}: which one?  A repetition over it is needed`);
    else
      this.report.error(`${tc.predicate} reads ${v}, bound at ${this.report.where(site)}, from ` +
                        `${this.report.where(scope)}, which is not below it`);
  }

  iterationScope (expr: any): Site | null {
    if (this.scopes.has(expr))
      return this.scopes.get(expr)!;
    this.scopes.set(expr, null);
    const direct = new Set<string>();
    const nested: any[] = [];
    this.collect(expr, direct, nested, new Set(), true);
    const candidates: {site: Site, why: string}[] = [];
    const add = (site: Site, why: string) => {
      if (!candidates.some(c => sameSite(c.site, site)))
        candidates.push({site, why});
    };
    for (const v of direct)
      if (this.report.bound.has(v))
        add(this.report.bound.get(v)!, v);
    for (const r of nested) {
      const sub = this.iterationScope(r);
      if (sub && sub.length)
        add(sub.slice(0, -1), "the repetition over " + label(r));
    }
    let result: Site | null = null;
    if (candidates.length) {
      const deepest = candidates.reduce((a, b) => b.site.length > a.site.length ? b : a);
      result = deepest.site;
      for (const c of candidates)
        if (!isPrefixSite(c.site, deepest.site)) {
          this.report.error(`the repetition over ${label(expr)} reads from unrelated lists: ${c.why} is bound at ` +
                            `${this.report.where(c.site)} and ${deepest.why} at ${this.report.where(deepest.site)}`);
          this.illFormed.add(expr);
          direct.forEach(v => this.report.read.add(v));
          break;
        }
    }
    this.scopes.set(expr, result);
    return result;
  }

  collect (expr: any, direct: Set<string>, nested: any[], seen: Set<any>, top: boolean): void {
    expr = this.resolveExpr(expr);
    if (!expr || seen.has(expr))
      return;
    seen.add(expr);
    if (!top && isRepetition(expr)) {
      nested.push(expr);
      return;
    }
    if (expr.type === "TripleConstraint") {
      const {plain, keys} = variables(expr, this.prefixes);
      plain.concat(keys).forEach(v => direct.add(v));
      if (expr.valueExpr !== undefined && (typeof expr.valueExpr === "string" || expr.valueExpr.type !== "NodeConstraint"))
        this.collectShape(expr.valueExpr, direct, nested, seen);
    } else if (expr.type === "EachOf" || expr.type === "OneOf") {
      for (const e of expr.expressions)
        this.collect(e, direct, nested, seen, false);
    }
  }

  collectShape (se: any, direct: Set<string>, nested: any[], seen: Set<any>): void {
    if (typeof se === "string") {
      const d = this.decl(se);
      if (d)
        for (const o of this.candidates(d))
          this.collectShape(o.type === "ShapeDecl" ? o.shapeExpr : o, direct, nested, seen);
      return;
    }
    if (!se || seen.has(se))
      return;
    seen.add(se);
    if (se.type === "ShapeDecl")
      this.collectShape(se.shapeExpr, direct, nested, seen);
    else if (se.type === "Shape")
      for (const p of this.parts(se))
        if (p.expression)
          this.collect(p.expression, direct, nested, seen, false);
    else if (se.type === "ShapeAnd" || se.type === "ShapeOr")
      for (const p of se.shapeExprs)
        this.collectShape(p, direct, nested, seen);
  }
}
