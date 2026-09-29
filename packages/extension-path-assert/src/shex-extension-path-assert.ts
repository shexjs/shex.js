/**
 * Assertions as ShEx semantic actions.
 *
 *   :Event {
 *     :start xsd:date ;
 *     :end   xsd:date ;
 *     :part  @:Event *
 *   } %assert:{ :end >= :start %}
 *
 * The code is an XPath-style expression over the RDF graph (see parser.ts
 * for the grammar): property steps from the focus node, `[…]` filters,
 * `*`/`+`/`?` closures, SPARQL's functions, `some`/`every`, `let`, `if`,
 * `implies`.  The action passes when the expression's effective boolean
 * value is true.  When it fails, the failure says why: the value of every
 * comparison operand and path the expression looked at, as a unit-test
 * assertion would.  `fail("message")` fails with a message of your own.
 *
 * What is in scope depends on where the action is:
 *
 *   - on a shape or a node constraint: `.` and `$this` are the node being
 *     validated;
 *   - on a triple constraint: `$this` is the node being validated, `.` and
 *     `$value` are the other end of the triple the constraint matched;
 *   - on a group (EachOf/OneOf): `.` and `$this` are the node its triples share;
 *   - in the start actions: nothing; a path starts at a node (`@ex:Class/^a`).
 *
 * The schema's PREFIX declarations are in scope.
 *
 * Data is read through the validator's data source, one neighborhood at a
 * time -- the same call the validator itself makes -- so this works over
 * every source the validator does (an RDF/JS store, a SPARQL endpoint, a
 * wikibase) with no query engine.  A source that answers with promises
 * makes the action answer with one; validate with validateShapeMapAsync
 * then, as the WebApp and the worker do.
 */
import type {Term, Quad} from "@rdfjs/types";
import {parse, Node, AssertSyntaxError, textOf} from "./parser";
import {evaluate, explain, TermSet, EvalContext, Env, EvalError, Maybe, isThenable, then} from "./evaluator";
import {AssertFailed} from "./functions";
import {termToTurtle, termKey, Meta} from "./terms";

const AssertExt = "http://shex.io/extensions/PathAssert/";

interface Failure {
  type: "SemActFailure";
  errors: string[];
  /** the expression, as written */
  assertion: string;
  /** what its parts evaluated to, one line each */
  explanation?: string[];
}

type Verdict = Failure[];

/** what the action's place in the schema binds; see the header */
interface Bound {
  this?: Term;
  value?: Term;
  item?: Term;
}

function preBound (ctx: any): Bound {
  if (ctx === null || ctx === undefined)
    return {};                                            // a start action
  if (ctx.node !== undefined && typeof ctx.node === "object" && "termType" in ctx.node)
    return {this: ctx.node, item: ctx.node};              // a shape or a node constraint
  const triples: Quad[] = Array.isArray(ctx.triples) ? ctx.triples : [];
  if (ctx.tripleExpr && ctx.tripleExpr.type === "TripleConstraint" && triples.length === 1) {
    const [t] = triples;
    return ctx.tripleExpr.inverse
      ? {this: t.object as Term, value: t.subject as Term, item: t.subject as Term}
      : {this: t.subject as Term, value: t.object as Term, item: t.object as Term};
  }
  // a group: the node all of its triples are about
  const shared = (terms: Term[]) =>
    terms.length > 0 && terms.every(t => termKey(t) === termKey(terms[0])) ? terms[0] : undefined;
  const focus = shared(triples.map(t => t.subject as Term)) || shared(triples.map(t => t.object as Term));
  return focus === undefined ? {} : {this: focus, item: focus};
}

function register (validator: any, api: any) {
  if (api === undefined || !('ShExTerm' in api))
    throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)');
  const schema = validator.schema || {};
  const meta: Meta = {base: schema._base || undefined, prefixes: schema._prefixes || {}};
  const serialize = (t: Term) => termToTurtle(t, meta);

  const parsed = new Map<string, Node>();
  /** what each question was answered, for the dispatch that comes back for it */
  const verdicts = new Map<string, Verdict>();
  /** questions asked of an asynchronous source and not yet answered */
  const pending = new Map<string, PromiseLike<unknown>>();

  validator.semActHandler.register(AssertExt, {
    dispatch (code: string | null, ctx: any, _extensionStorage: any): Verdict | PromiseLike<unknown> {
      if (code === null)
        throw Error(`Invocation error: ${AssertExt} needs an expression`);
      let ast = parsed.get(code);
      if (ast === undefined) {
        try {
          ast = parse(code, {prefixes: meta.prefixes, base: meta.base});
        } catch (e) {
          if (e instanceof AssertSyntaxError)
            throw Error(`Invocation error: ${AssertExt} code didn't parse: ${e.message}`);
          throw e;
        }
        parsed.set(code, ast);
      }
      const bound = preBound(ctx);
      const key = [code, bound.this, bound.value, bound.item].map(x => typeof x === "string" ? x : x ? termKey(x) : "").join("\u0000");
      const answer = verdicts.get(key);
      if (answer !== undefined)
        return answer;
      const waiting = pending.get(key);
      if (waiting !== undefined)
        return waiting;

      const db = validator.db;
      if (!db || typeof db.getNeighborhood !== "function")
        throw Error(`Invocation error: ${AssertExt} needs the validator's data source (validator.db)`);
      const ectx: EvalContext = {db, shapeLabel: AssertExt, code, memo: new Map()};
      const vars = new Map<string, TermSet>();
      if (bound.this) vars.set("this", TermSet.of(bound.this));
      if (bound.value) vars.set("value", TermSet.of(bound.value));
      const env: Env = {item: bound.item, vars};

      const result = run(ast, env, ectx, serialize);
      if (isThenable(result)) {
        const settled = result.then(v => { verdicts.set(key, v); pending.delete(key); },
                                    e => { pending.delete(key); throw e; });
        pending.set(key, settled);
        return settled;
      }
      verdicts.set(key, result);
      return result;
    }
  });
}

/** the verdict: [] to pass, a failure that explains itself otherwise */
function run (ast: Node, env: Env, ctx: EvalContext, serialize: (t: Term) => string): Maybe<Verdict> {
  const assertion = textOf(ctx.code, ast);
  const failure = (errors: string[], explanation?: string[]): Verdict =>
    [Object.assign({type: "SemActFailure", errors, assertion} as Failure, explanation ? {explanation} : {})];
  const onError = (e: unknown): Verdict => {
    if (e instanceof AssertFailed)
      return failure([e.message]);
    if (e instanceof EvalError)
      throw Error(`Invocation error: ${AssertExt}: ${e.message}`);
    throw e;
  };
  try {
    const verdict = then(evaluate(ast, env, ctx), set => {
      if (set.ebv)
        return [] as Verdict;
      return then(explain(ast, env, ctx, serialize), lines => failure(["assertion failed: " + assertion], lines));
    });
    return isThenable(verdict) ? verdict.then(v => v, onError) : verdict;
  } catch (e) {
    return onError(e);
  }
}

function done (_validator: any) {
}

export = {
  name: "PathAssert",
  description: `Assertions: XPath-style path expressions over the focus node, passing when true and explaining themselves when not
url: ${AssertExt}`,
  register,
  done,
  url: AssertExt,
  /** the language's parser, for tools that want the AST */
  parse,
};
