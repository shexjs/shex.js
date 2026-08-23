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
 * The actions themselves are JavaScript, like `@shexjs/extension-eval`: an
 * expression if it parses as one, a function body otherwise.  Running code
 * that arrived with a document is a decision the caller makes by registering
 * this extension at all.
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

/**
 * The value the actions reduce a validation result to.
 *
 * `result` is what `validateShapeMap`/`validateNodeShapePair` returned.  A
 * result with more than one node/shape pair reduces to an array, one value
 * per pair, in the order they were asked for.
 */
function reduce (result: any, options: ReduceOptions = {}): any {
  const url = options.url || ReduceExt;
  const evaluate = options.evaluate;
  if (typeof evaluate !== 'function')
    throw Error('reduce() needs an `evaluate` option -- (code, scope) => value. '
                + 'For actions written in JavaScript that is @shexjs/extension-reduce-js.');
  const prefixes = options.prefixes || {};
  const api = options.api || {};
  const seen = new Map<string, any>();

  return reduceResult(result);

  function reduceResult (res: any): any {
    // a results ShapeMap: [{node, shape, status, appinfo}, ...]
    if (Array.isArray(res))
      return res.map(entry => 'appinfo' in entry ? reduceResult(entry.appinfo) : reduceNode(entry));
    return reduceNode(res);
  }

  function reduceNode (node: any): any {
    if (node === null || node === undefined)
      return node;
    switch (node.type) {

    case 'SolutionList':
      return node.solutions.map(reduceNode);

    /* An AND is several constraints on one node, so it reduces to one value:
     * whichever conjunct said something.  A conjunct with no action reduces
     * to its own node, and saying "this node is this node" is not an answer
     * anyone wrote an action for, so those drop out.  `IRI /pattern/` and
     * `BNODE CLOSED {...}` are the everyday shapes of this. */
    case 'ShapeAndResults': {
      const values = node.solutions.map(reduceNode);
      const spoke = values.filter((v: any, i: number) => v !== nodeOf(node.solutions[i]));
      return spoke.length === 1 ? spoke[0]
        : spoke.length === 0 ? nodeOf(node.solutions[0])
        : values;
    }

    case 'ShapeOrResults':
    case 'ShapeNotResults':
      return reduceNode(node.solution);

    case 'ShapeTest': {
      const key = keyOf(node.node, node.shape);
      const arcs = arcsOf(node.solution);
      const value = run(node, {kind: 'shape', node: node.node, shape: node.shape, arcs},
                        () => node.node);
      seen.set(key, value);
      return value;
    }

    case 'NodeConstraintTest':
      return run(node, {kind: 'shape', node: node.node, shape: node.shape, arcs: {}},
                 () => node.node);

    case 'Recursion': {
      // The matcher found this pair on the way down, so its value is still
      // being computed; if it happens to be finished, use it.
      const key = keyOf(node.node, node.shape);
      if (seen.has(key))
        return seen.get(key);
      switch (options.onRecursion || 'node') {
      case 'marker': return {type: 'Recursion', node: node.node, shape: node.shape};
      case 'throw':  throw Error(`${key} is still being reduced: the data has a cycle`);
      default:       return node.node;
      }
    }

    default:
      // an unlabelled shape (`{ :p . }` with no ShapeDecl) reports no wrapper
      if ('solution' in node) return reduceNode(node.solution);
      if ('solutions' in node) return node.solutions.map(reduceNode);
      return node;
    }
  }

  /** predicate -> [value, ...] for everything a shape's body matched */
  function arcsOf (solution: any): {[predicate: string]: any[]} {
    const arcs: {[predicate: string]: any[]} = {};
    collect(solution);
    return arcs;

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
            : reduceNode(tested.referenced);
          const code = actionOn(tested);
          const value = code === undefined ? bare
            : runCode(code, s, {kind: 'tripleConstraint', subject: tested.subject,
                                predicate: tested.predicate, object: tested.object,
                                value: bare, arcs: {}});
          (arcs[s.predicate] = arcs[s.predicate] || []).push(value);
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
   * Only what dispatch recorded counts.  A result node also carries the
   * schema's `semActs`, but not always its own -- a shape's actions turn up
   * on the solution beneath it too -- and `extensions` is written by the
   * dispatch for exactly one artifact, so it is the one that can be trusted.
   */
  function actionOn (node: any): string | undefined {
    const ext = node && node.extensions && node.extensions[url];
    return ext && typeof ext.code === 'string' ? ext.code : undefined;
  }

  function run (node: any, scope: any, fallback: () => any): any {
    const code = actionOn(node);
    return code === undefined ? fallback() : runCode(code, node, scope);
  }

  function runCode (code: string, node: any, scope: any): any {
    const where = describe(node);
    try {
      return evaluate!(code, Object.assign({where, prefixes, api}, scope) as ReduceScope);
    } catch (e) {
      throw new ReduceError(where, code, e);
    }
  }
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
  prefixes, api, where the caller's prefixes and extras, and where this is
No functions cross that line, so the same fold ports to an implementation in
another language.  @shexjs/extension-reduce-js is the JavaScript evaluator.

url: ${ReduceExt}`,
  register,
  done,
  url: ReduceExt,
  reduce,
}
