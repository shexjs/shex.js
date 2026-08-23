/**
 * ShEx as a parser generator.
 *
 * A ShEx schema recognizes a subgraph the way a grammar recognizes a string,
 * and a validation result is the parse tree it recognized it by.  This
 * extension is the other half a parser generator has: an action per
 * production, run bottom-up over that tree, each one reducing what its
 * children produced into one value.  What comes out is an AST.
 *
 *     <#Num>   { a [:Num] ; :value xsd:integer }   ->  {op: 'num', value: num(one(':value'))}
 *     <#BinOp> { a [:Add :Mul] ;
 *                :left @<#Expr> ; :right @<#Expr> } ->  {op: local(one('a')),
 *                                                        l: one(':left'), r: one(':right')}
 *
 * Actions run *after* the match, not during it, which is the whole reason
 * this is separate from the validator: the matcher backtracks, and an action
 * that fired on a partition that was later abandoned would have built part of
 * an AST for a parse that never happened.  Dispatch here only records that an
 * action applies at a place in the result; `reduce()` then folds the result
 * that survived.  So an action can't reject a match -- that is the schema's
 * job -- and it is free to be as effectful as it likes.
 *
 * An action names what its sub-productions reduced to the way yacc does:
 * `$sx:nodeKind` is what the arc on that predicate reduced to, `$1` is the
 * first value the body matched, and `$` is the value of this production.
 *
 * This module has no action language: `reduce()` takes an `evaluate(code,
 * scope)` and hands it plain data.  Running code that arrived with a document
 * is a decision the caller makes by passing an evaluator at all.
 */

const ReduceExt = 'http://shex.io/extensions/Reduce/';

/** an RDF term as a ShExJ result records it: an IRI string, or an ObjectLiteral */
type LdTerm = string | {value: string, type?: string, language?: string};

/**
 * What runs an action.  This is the only language-dependent part: everything
 * above it -- which production reduced, what its arcs reduced to -- is the
 * same whatever the actions are written in, so an implementation in another
 * language reimplements the fold and brings its own evaluator.
 * `@shexjs/extension-reduce-js` is the JavaScript one.
 */
type Evaluator = (code: string, scope: ReduceScope) => any;

/** What an evaluator is handed.  Plain data: no functions cross this line. */
interface ReduceScope {
  /** which kind of production reduced */
  kind: 'shape' | 'tripleConstraint';
  /** where in the result this happened, for the evaluator's error messages */
  where: string;
  /** prefixes an action may use to name a predicate */
  prefixes: {[prefix: string]: string};
  /** whatever the caller passed as `api` */
  api: {[name: string]: any};
  /**
   * Somewhere to keep what one action wants the next one to know.
   *
   * One object for a run, handed to every action in it, and empty until an
   * action puts something in it -- a start action, for anything the rest of
   * them need set up.  It is the only way an action can say something that
   * outlives its own production: everything else it is handed describes the
   * one place it was dispatched.
   */
  state: {[name: string]: any};
  /** what each arc reduced to, by full predicate IRI; empty for a constraint */
  arcs: {[predicate: string]: any[]};
  /** kind 'shape': the focus term and the label it matched */
  node?: LdTerm;
  shape?: string;
  /** kind 'tripleConstraint': the triple, and what its object reduced to */
  subject?: LdTerm;
  predicate?: string;
  object?: LdTerm;
  value?: any;
  /** what each `$...` in the code was rewritten to, and what it stands for */
  bindings: {[name: string]: any};
  /**
   * The name the action assigns its value to, present only if the action
   * used `$`.  An evaluator that sees this makes that name assignable and
   * answers with its value rather than with the code's own.
   */
  ret?: string;
}

interface ReduceOptions {
  /** what runs an action; required, since this module has no language */
  evaluate?: Evaluator;
  /** prefixes an action may use to name a predicate */
  prefixes?: {[prefix: string]: string};
  /** extra names for the evaluator to put in scope */
  api?: {[name: string]: any};
  /** the extension IRI to read actions for (default: this module's) */
  url?: string;
  /**
   * What a cycle in the data reduces to, when the value it needs is still
   * being computed:
   *   'node'   (default) the focus term -- which, in a language whose
   *            references are IRIs, is exactly the reference
   *   'marker' {type: 'Recursion', node, shape}
   *   'throw'  refuse
   */
  onRecursion?: 'node' | 'marker' | 'throw';
}

interface EagerOptions extends ReduceOptions {
  /**
   * Which values mean "this match is no good", so that the matcher goes on
   * to the next way of matching -- the next branch of an OR, the next
   * partition.  The default is a value with a `failure` key.
   */
  rejects?: (value: any) => boolean;
}

// ## the SemAct extension half: record, don't run

function register (validator: any, api?: any): any {
  if (validator === undefined || validator.semActHandler === undefined)
    throw Error('register(validator, ...) wants a ShExValidator');
  validator.semActHandler.results[ReduceExt] = [];
  return validator.semActHandler.register(ReduceExt, {
    /**
     * Note that this action applies here, and say nothing about the match.
     * `reduce()` reads these back out of whichever result survived.
     */
    dispatch: function (code: string, _ctx: any, extensionStorage: any) {
      extensionStorage.code = code;
      return [];
    },
    api,
  });
}

/**
 * ...or run them as the matcher matches, and let them reject.
 *
 * The other `register` records and `reduce()` folds afterwards, because the
 * matcher backtracks: an action that fired on a partition later abandoned
 * would have built part of an AST for a parse that never happened.  That is
 * the LR bargain -- defer the reduction until the parse is decided -- and
 * the price of it is that an action cannot say "not this way".
 *
 * PEG pays the other way: actions run inside the attempt, an attempt may be
 * abandoned, and an action may fail the attempt it is in.  This is that.
 * The action runs at dispatch, its value is stored on the result so the
 * fold takes it rather than running the code again, and a value the
 * `rejects` test recognizes fails the match -- which sends an OR to its next
 * branch, exactly as a node constraint that didn't hold would.
 *
 * So the author owns two things they did not before: an action may run on a
 * branch that is then thrown away (write it without side effects, or expect
 * them twice), and an action's value is now part of what "matched" means.
 */
function registerEager (validator: any, options: EagerOptions = {}): any {
  if (validator === undefined || validator.semActHandler === undefined)
    throw Error('registerEager(validator, ...) wants a ShExValidator');
  if (typeof options.evaluate !== 'function')
    throw Error('registerEager() needs an `evaluate` option -- (code, scope) => value. '
                + 'For actions written in JavaScript that is @shexjs/extension-reduce-js.');
  const f = foldFor(options);
  const rejects = options.rejects || refused;
  validator.semActHandler.results[f.url] = [];
  return validator.semActHandler.register(f.url, {
    dispatch: function (code: string, ctx: any, storage: any, artifact: any) {
      // a group's action is not run in either mode: a shape's action already
      // sees everything its body matched, by predicate
      if (ctx && ctx.tripleExpr
          && (ctx.tripleExpr.type === 'EachOf' || ctx.tripleExpr.type === 'OneOf'))
        return [];
      const where = describe(artifact);
      const {scope, values} = eagerScope(f, ctx, artifact);
      const value = runAction(f, code, where, scope, values);
      storage.code = code;
      storage.value = value;                // what the fold will take
      return rejects(value)
        ? [{type: 'SemActFailure', errors: [rejection(value, where)]}]
        : [];
    },
    api: options.api,
  });
}

/** the value an action returns to say "this match is no good" */
function refused (value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && 'failure' in value;
}

function rejection (value: any, where: string): string {
  const said = value && value.failure;
  return `the action on ${where} rejected the match`
    + (said === undefined || said === '' ? '' : ': ' + String(said));
}

/**
 * What an eager action sees.  The same scope the fold builds, from the same
 * places -- the result artifact is the fold's own input, and the values
 * underneath it are stored there by the actions that already ran.
 */
function eagerScope (f: Fold, ctx: any, artifact: any): {scope: any, values: any[]} {
  if (ctx === null || ctx === undefined)  // a start action: before any of it
    return {scope: {kind: 'start', arcs: {}}, values: []};
  if (artifact && artifact.type === 'TestedTriple') {
    const bare = artifact.referenced === undefined
      ? artifact.object
      : reduceNode(f, artifact.referenced);
    return {
      scope: {kind: 'tripleConstraint', subject: artifact.subject,
              predicate: artifact.predicate, object: artifact.object,
              value: bare, arcs: {}},
      values: [bare],
    };
  }
  const {arcs, values} = arcsOf(f, artifact && artifact.solution !== undefined
                                ? artifact.solution : ctx);
  return {
    scope: {kind: 'shape', node: artifact ? artifact.node : undefined,
            shape: artifact ? artifact.shape : undefined, arcs},
    values,
  };
}

function done (validator: any): void {
  if (validator.semActHandler.results[ReduceExt].length === 0)
    delete validator.semActHandler.results[ReduceExt];
}

// ## the fold

/** where an action was, when it goes wrong */
class ReduceError extends Error {
  constructor (where: string, code: string, cause: any) {
    super(`reducing ${where}:\n  ${code}\n${indent(String(cause && cause.message || cause))}`);
    this.name = 'ReduceError';
  }
}

/** what it takes to run an action: the language, and what the language sees */
interface Runner {
  evaluate: Evaluator;
  prefixes: {[prefix: string]: string};
  api: {[name: string]: any};
  /** what the actions of this run tell each other; see ReduceScope.state */
  state: {[name: string]: any};
  /** the $-rewrite, by action text */
  bounds: Map<string, Bound>;
}

/** one walk of a result: what may be run, what it is read as, what a cycle means */
interface Fold {
  /** null when the caller passed no evaluator: then only stored values are read */
  runner: Runner | null;
  url: string;
  onRecursion: 'node' | 'marker' | 'throw';
  seen: Map<string, any>;
}

function foldFor (options: ReduceOptions): Fold {
  return {
    runner: typeof options.evaluate === 'function'
      ? {evaluate: options.evaluate, prefixes: options.prefixes || {},
         api: options.api || {}, state: {}, bounds: new Map<string, Bound>()}
      : null,
    url: options.url || ReduceExt,
    onRecursion: options.onRecursion || 'node',
    seen: new Map<string, any>(),
  };
}

/**
 * The value the actions reduce a validation result to.
 *
 * `result` is what `validateShapeMap`/`validateNodeShapePair` returned.  A
 * result with more than one node/shape pair reduces to an array, one value
 * per pair, in the order they were asked for.
 */
function reduce (result: any, options: ReduceOptions = {}): any {
  return reduceResult(foldFor(options), result);
}

function reduceResult (f: Fold, res: any): any {
  // a results ShapeMap: [{node, shape, status, appinfo}, ...]
  if (Array.isArray(res))
    return res.map(entry => 'appinfo' in entry ? reduceResult(f, entry.appinfo) : reduceNode(f, entry));
  runStartActs(f, res);
  return reduceNode(f, res);
}

/**
 * The schema's start actions, before the walk.
 *
 * A start action runs before the match rather than at some place in it, so
 * `register` has nothing to record for one -- the validator hands its
 * dispatch a scratch object and then drops it -- and the fold is where a
 * recorded run gets to run them.  An eager run has already run them, and
 * folds with no evaluator, which is what tells the two apart here.
 */
function runStartActs (f: Fold, res: any): void {
  if (f.runner === null)                  // nothing to run: an eager run
    return;
  ((res && res.startActs) || [])
    .filter((act: any) => act.name === f.url && typeof act.code === 'string')
    .forEach((act: any) =>
      runAction(f, act.code, 'the start actions', {kind: 'start', arcs: {}}, []));
}

function reduceNode (f: Fold, node: any): any {
  if (node === null || node === undefined)
    return node;
  switch (node.type) {

  case 'SolutionList':
    return node.solutions.map((s: any) => reduceNode(f, s));

  /* An AND is several constraints on one node, so it reduces to one value:
   * whichever conjunct said something.  A conjunct with no action reduces
   * to its own node, and saying "this node is this node" is not an answer
   * anyone wrote an action for, so those drop out.  `IRI /pattern/` and
   * `BNODE CLOSED {...}` are the everyday shapes of this. */
  case 'ShapeAndResults': {
    const values = node.solutions.map((s: any) => reduceNode(f, s));
    const spoke = values.filter((v: any, i: number) => v !== nodeOf(node.solutions[i]));
    return spoke.length === 1 ? spoke[0]
      : spoke.length === 0 ? nodeOf(node.solutions[0])
      : values;
  }

  case 'ShapeOrResults':
  case 'ShapeNotResults':
    return reduceNode(f, node.solution);

  case 'ShapeTest': {
    const key = keyOf(node.node, node.shape);
    const {arcs, values} = arcsOf(f, node.solution);
    const value = run(f, node, {kind: 'shape', node: node.node, shape: node.shape, arcs},
                      values, () => node.node);
    f.seen.set(key, value);
    return value;
  }

  case 'NodeConstraintTest':
    return run(f, node, {kind: 'shape', node: node.node, shape: node.shape, arcs: {}},
               [], () => node.node);

  case 'Recursion': {
    // The matcher found this pair on the way down, so its value is still
    // being computed; if it happens to be finished, use it.
    const key = keyOf(node.node, node.shape);
    if (f.seen.has(key))
      return f.seen.get(key);
    switch (f.onRecursion) {
    case 'marker': return {type: 'Recursion', node: node.node, shape: node.shape};
    case 'throw':  throw Error(`${key} is still being reduced: the data has a cycle`);
    default:       return node.node;
    }
  }

  default:
    // an unlabelled shape (`{ :p . }` with no ShapeDecl) reports no wrapper
    if ('solution' in node) return reduceNode(f, node.solution);
    if ('solutions' in node) return node.solutions.map((s: any) => reduceNode(f, s));
    return node;
  }
}

/**
 * What a shape's body matched, twice over: by predicate, which is how an
 * action names a sub-production, and in match order, which is how `$1`
 * reaches one whose name it shares with another.
 */
function arcsOf (f: Fold, solution: any): {arcs: {[predicate: string]: any[]}, values: any[]} {
  const arcs: {[predicate: string]: any[]} = {};
  const values: any[] = [];
  collect(solution);
  return {arcs, values};

  function collect (s: any): void {
    if (s === null || s === undefined) return;
    if (Array.isArray(s)) return s.forEach(collect);
    switch (s.type) {
    case 'EachOfSolutions':
    case 'OneOfSolutions':
      return s.solutions.forEach(collect);
    case 'EachOfSolution':
    case 'OneOfSolution':
      return s.expressions.forEach(collect);
    case 'TripleConstraintSolutions': {
      // an action on a triple constraint is recorded per matched triple,
      // so a repeated arc gets one run of the action per occurrence
      (s.solutions || []).forEach((tested: any) => {
        const bare = tested.referenced === undefined
          ? tested.object
          : reduceNode(f, tested.referenced);
        // the object is this production's one sub-production, so it is $1
        const value = run(f, tested,
                          {kind: 'tripleConstraint', subject: tested.subject,
                           predicate: tested.predicate, object: tested.object,
                           value: bare, arcs: {}},
                          [bare], () => bare);
        (arcs[s.predicate] = arcs[s.predicate] || []).push(value);
        values.push(value);
      });
      return;
    }
    default:
      if ('solutions' in s) return collect(s.solutions);
      if ('solution' in s) return collect(s.solution);
    }
  }
}

/**
 * Only what dispatch left counts.  A result node also carries the schema's
 * `semActs`, but not always its own -- a shape's actions turn up on the
 * solution beneath it too -- and `extensions` is written by the dispatch for
 * exactly one artifact, so it is the one that can be trusted.
 */
function extOn (f: Fold, node: any): any {
  const ext = node && node.extensions && node.extensions[f.url];
  return ext && (typeof ext.code === 'string' || 'value' in ext) ? ext : undefined;
}

function run (f: Fold, node: any, scope: any, values: any[], fallback: () => any): any {
  const ext = extOn(f, node);
  if (ext === undefined)
    return fallback();
  if ('value' in ext)
    return ext.value;                     // an eager action already ran here
  return runAction(f, ext.code, describe(node), scope, values);
}

function runAction (f: Fold, code: string, where: string, scope: any, values: any[]): any {
  const runner = f.runner;
  if (runner === null)
    throw Error('reduce() needs an `evaluate` option -- (code, scope) => value. '
                + 'For actions written in JavaScript that is @shexjs/extension-reduce-js.');
  try {
    const bound = bindRefs(code, runner.prefixes, runner.bounds);
    const bindings: {[name: string]: any} = {};
    bound.refs.forEach(({id, ref}) => {
      bindings[id] = ref.kind === 'ret' ? undefined
        : ref.kind === 'pos' ? values[ref.at - 1]
        : (scope.arcs || {})[ref.iri];
    });
    return runner.evaluate(bound.code, Object.assign(
      {where, prefixes: runner.prefixes, api: runner.api, state: runner.state}, scope,
      bound.ret === undefined ? {bindings} : {bindings, ret: bound.ret}) as ReduceScope);
  } catch (e) {
    throw new ReduceError(where, code, e);
  }
}

// ## $-references: naming what a production's sub-productions reduced to

/** what a `$...` in an action stands for, once the values are in hand */
type Ref =
  | {kind: 'ret'}                    // `$`  -- this production's value
  | {kind: 'pos', at: number}        // `$1` -- the first value the body matched
  | {kind: 'arc', iri: string};      // `$sx:nodeKind` -- what that arc reduced to

/** an action, with every reference in it replaced by an ordinary name */
interface Bound {
  code: string;
  refs: {id: string, ref: Ref}[];
  /** the name `$` became, if the action used it */
  ret?: string;
}

/**
 * `$$` or `$`, `$1`, `$<iri>`, `$prefix:local`, `$:local` -- and `$name`,
 * which is deliberately none of them: `$` starts an identifier in several
 * action languages, and a name with no prefix is not a predicate.
 *
 * The last alternative is the bare `$`, which is not read as a reference
 * before `{`, `/` or a quote -- much more likely a template literal, the end
 * of a regular expression, or a dollar sign in a string than a reference.
 */
const REF = /\$(\$|\d+|<[^\s<>"{}|^`\\]*>|[A-Za-z_][\w-]*:[\w-]*|:[\w-]*|[A-Za-z_][\w-]*)|\$(?![{/'"`])/g;

/**
 * The action as the evaluator should see it: every reference rewritten to a
 * name, and a list of what those names stand for.
 *
 * yacc splices `$1` into the C it emits, because it knows what C is.  This
 * doesn't know what the actions are written in, so it can only substitute
 * text -- which is why the names it substitutes are plain ASCII identifiers
 * (legal in any action language anyone is likely to bring) and why a `$1`
 * inside a string literal is a reference too.
 */
function bindRefs (code: string, prefixes: {[prefix: string]: string},
                   cache: Map<string, Bound>): Bound {
  const already = cache.get(code);
  if (already !== undefined)
    return already;

  const refs: {id: string, ref: Ref}[] = [];
  const seen = new Map<string, string>();
  let ret: string | undefined;

  const rewritten = code.replace(REF, (whole: string, text: string) => {
    if (text !== undefined && /^[A-Za-z_]/.test(text) && text.indexOf(':') === -1)
      return whole;                   // `$name`: an identifier, not a reference
    const key = text === undefined || text === '$' ? '' : text;
    const before = seen.get(key);
    if (before !== undefined)
      return before;
    const ref = parseRef(key, prefixes);
    const id = idFor(ref, code, refs);
    seen.set(key, id);
    refs.push({id, ref});
    if (ref.kind === 'ret')
      ret = id;
    return id;
  });

  const bound = {code: rewritten, refs, ret};
  cache.set(code, bound);
  return bound;
}

function parseRef (text: string, prefixes: {[prefix: string]: string}): Ref {
  if (text === '')
    return {kind: 'ret'};
  if (/^\d+$/.test(text)) {
    const at = Number(text);
    if (at === 0)
      throw Error("$0: a production's values are numbered from $1, as in yacc");
    return {kind: 'pos', at};
  }
  return {kind: 'arc', iri: text[0] === '<' ? text.slice(1, -1) : expandName(text, prefixes)};
}

function expandName (name: string, prefixes: {[prefix: string]: string}): string {
  const prefix = name.substr(0, name.indexOf(':'));
  if (!(prefix in prefixes))
    throw Error(`$${name}: no prefix "${prefix}:" (reduce() was given `
                + (Object.keys(prefixes).length
                   ? Object.keys(prefixes).map(p => p + ':').join(', ') : 'none') + ')');
  return prefixes[prefix] + name.substr(name.indexOf(':') + 1);
}

/**
 * A name for a reference that reads like what it stands for -- `_nodeKind`,
 * `_1`, `_ret` -- and that the action isn't already using for something of
 * its own.
 */
function idFor (ref: Ref, code: string, refs: {id: string, ref: Ref}[]): string {
  const base = '_' + (ref.kind === 'ret' ? 'ret'
                      : ref.kind === 'pos' ? ref.at
                      : localOf(ref.iri).replace(/[^A-Za-z0-9_]/g, '_') || 'arc');
  let id = base;
  for (let n = 1; refs.some(r => r.id === id) || mentions(code, id); ++n)
    id = base + '_' + (n + 1);
  return id;
}

/** the part of an IRI after the last delimiter, which is what it is called */
function localOf (iri: string): string {
  return iri.replace(/^.*[/#:]/, '');
}

function mentions (code: string, id: string): boolean {
  return new RegExp('\\b' + id + '\\b').test(code);
}

// ## reporting

function describe (node: any): string {
  if (node === null || node === undefined) return String(node);
  switch (node.type) {
  case 'ShapeTest':
  case 'NodeConstraintTest':
    return `<${node.shape}> at ${short(node.node)}`;
  case 'TripleConstraintSolutions':
    return `the constraint on <${node.predicate}>`;
  case 'TestedTriple':
    return `the constraint on <${node.predicate}> at ${short(node.subject)}`;
  default:
    return node.type || 'the result';
  }
}
function short (term: LdTerm): string {
  return typeof term === 'string' ? `<${term}>` : JSON.stringify(term);
}
function indent (s: string): string {
  return s.split('\n').map(l => '    ' + l).join('\n');
}
/** the focus term a result node is about, however deep it is wrapped */
function nodeOf (res: any): any {
  if (res === null || res === undefined) return undefined;
  if ('node' in res) return res.node;
  if ('solution' in res) return nodeOf(res.solution);
  if ('solutions' in res && res.solutions.length) return nodeOf(res.solutions[0]);
  return undefined;
}

function keyOf (node: LdTerm, shape: string): string {
  return short(node) + '@' + shape;
}

export = {
  name: 'Reduce',
  description: `ShEx as a parser generator: the schema recognizes, the actions reduce.

The schema is the grammar and a validation result is the parse tree it
recognized by; this folds one action per production over that tree, bottom
up, and what comes out is an AST.  Actions run after the match, not during
it, so a partition the matcher abandoned leaves nothing behind and an action
cannot reject a match -- that is the schema's job.

This module has no action language.  reduce() takes an \`evaluate(code, scope)\`
and hands it plain data:
  kind                 'shape' or 'tripleConstraint'
  node, shape, arcs    the focus term, the label it matched, and what each
                       arc reduced to, by full predicate IRI
  subject, predicate,  for a constraint: the triple, and what its object
  object, value        reduced to
  bindings, ret        what each $... in the code was rewritten to, and the
                       name the action assigns its value to, if it used $
  prefixes, api, where the caller's prefixes and extras, and where this is
No functions cross that line, so the same fold ports to an implementation in
another language.  @shexjs/extension-reduce-js is the JavaScript evaluator.

url: ${ReduceExt}`,
  register,
  registerEager,
  done,
  url: ReduceExt,
  reduce,
}
