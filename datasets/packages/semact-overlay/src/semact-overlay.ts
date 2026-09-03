/**
 * Semantic actions, kept out of the schema.
 *
 * A ShExC schema with `%<ext>{ code %}` sprinkled through it is a schema
 * only one program can read comfortably: everyone else has to step over
 * somebody else's code to see the shapes.  An *overlay* says the same thing
 * from outside -- an RDF document naming schema elements and the actions to
 * hang on them -- so the schema stays the thing several tools can share.
 *
 *     PREFIX sa: <http://shex.io/ns/semact#>
 *     <#calc> a sa:Overlay ;
 *       sa:extension <http://shex.io/extensions/Reduce/> ;
 *       sa:action
 *         [ sa:ref  <http://a.example/calc#Num> ;
 *           sa:code "{op: 'num', value: one(':value')}" ],
 *         [ sa:path "@<http://a.example/calc#BinOp>" ;
 *           sa:code "{op: type, l: one(':left'), r: one(':right')}" ] .
 *
 * The idea, the vocabulary shape and the two ways of naming an element are
 * lifted from ericprud/shex-form, which does this for `ui:` annotations.
 * `sa:ref` names an element by its ShExJ id; `sa:path` selects one with a
 * ShapePath, which is how you reach the elements nobody labelled.
 */
import {ShExIndexVisitor} from '@shexjs/visitor';

const ShapePath = require('shape-path-core');

export const NS = 'http://shex.io/ns/semact#';
export const Vocab = {
  Overlay:   NS + 'Overlay',
  action:    NS + 'action',
  ref:       NS + 'ref',
  path:      NS + 'path',
  code:      NS + 'code',
  extension: NS + 'extension',
  order:     NS + 'order',
  start:     NS + 'start',
};
const RDF_type = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

/** ShExJ productions with a place to put a SemAct (ShExJ.jsg semActs:[SemAct+]?) */
const CAN_HOLD_SEMACTS = [
  'Shape', 'NodeConstraint', 'TripleConstraint', 'EachOf', 'OneOf',
];

/** What the RDF layer has to provide: N3.Store satisfies it. */
export interface QuadSource {
  getQuads (s: any, p: any, o: any, g?: any): any[];
}

export interface OverlayOptions {
  /** base IRI for ShapePath resolution (default: none) */
  base?: string;
  /** prefixes for ShapePath resolution */
  prefixes?: {[prefix: string]: string};
  /** replace an element's existing actions rather than appending to them */
  replace?: boolean;
  /** only read overlays with this subject IRI (default: every sa:Overlay) */
  only?: string;
}

export interface SemAct {
  type: 'SemAct';
  name: string;
  code?: string;
}

/** One `sa:action`, resolved down to the element it lands on. */
interface Binding {
  target: any;
  semAct: SemAct;
  order: number;
  /** how the overlay named it, for error messages */
  named: string;
}

/**
 * `schema`, with the overlay's actions written into it -- and returned, so
 * a caller may read it either way.
 *
 * This is the mode that costs the schema its innocence: an element that the
 * overlay names comes away carrying `semActs`, and anything else holding
 * that schema sees them.  Where that isn't wanted -- a schema several
 * readings share, or one on disk that should stay what it says --
 * `indexOverlay` says the same thing beside the schema rather than in it.
 */
export function applyOverlay (schema: any, overlay: QuadSource, options: OverlayOptions = {}): any {
  const started = new Set<any>();
  for (const b of bind(schema, overlay, options)) {
    if (b.target === schema) {  // sa:start -- the schema's own startActs
      if (options.replace && !started.has(schema)) { schema.startActs = []; started.add(schema); }
      schema.startActs = (schema.startActs || []).concat([b.semAct]);
      continue;
    }
    canHold(b);
    if (options.replace && !started.has(b.target)) { b.target.semActs = []; started.add(b.target); }
    b.target.semActs = (b.target.semActs || []).concat([b.semAct]);
  }
  return schema;
}

/**
 * What the overlay says, keyed by the element it says it about, with the
 * schema left exactly as it was.
 *
 * The keys are the schema's own objects, so the Map means nothing without
 * it: hand both to the validator, which asks the Map about an element as
 * well as reading the element's own actions
 * (`new ShExValidator(schema, db, {semActIndex: index})`).
 *
 * `replace` has nothing to do here.  It is for keeping a second run of an
 * overlay from stacking actions onto the schema, and a run of this one
 * builds a new Map rather than adding to anything.
 */
export function indexOverlay (schema: any, overlay: QuadSource,
                              options: OverlayOptions = {}): Map<any, SemAct[]> {
  const index = new Map<any, SemAct[]>();
  for (const b of bind(schema, overlay, options)) {
    if (b.target !== schema)
      canHold(b);
    const already = index.get(b.target);
    if (already === undefined)
      index.set(b.target, [b.semAct]);
    else
      already.push(b.semAct);
  }
  return index;
}

/**
 * The overlay's actions, each resolved to the element it lands on.
 *
 * Same element, more than one action: order by sa:order, then by the code
 * itself, so a document that doesn't say gets the same answer every run.
 */
function bind (schema: any, overlay: QuadSource, options: OverlayOptions): Binding[] {
  const index = ShExIndexVisitor.index(schema);
  const bindings = readOverlay(overlay, options)
        .map(spec => resolve(spec, schema, index, options));
  bindings.sort((l, r) => l.order - r.order || cmp(l.semAct.code, r.semAct.code));
  return bindings;
}

/**
 * ShExJ has semActs on five productions, and those are the five a validator
 * dispatches at, so an action anywhere else would never run either way.
 */
function canHold (b: Binding): void {
  if (CAN_HOLD_SEMACTS.indexOf(b.target.type) === -1)
    throw Error(`${b.named} is a ${b.target.type}; ShExJ has semActs on `
                + CAN_HOLD_SEMACTS.join(', '));
}

/** the actions an overlay document asks for, before they are resolved */
interface ActionSpec {
  ref?: string;
  path?: string;
  start: boolean;
  code?: string;
  name: string;
  order: number;
}

function readOverlay (overlay: QuadSource, options: OverlayOptions): ActionSpec[] {
  const overlays = overlay.getQuads(null, RDF_type, Vocab.Overlay)
        .filter(q => options.only === undefined || q.subject.value === options.only);
  if (overlays.length === 0 && options.only !== undefined)
    throw Error(`no <${options.only}> a sa:Overlay in the overlay document`);

  return overlays.flatMap((root: any) => {
    const fallbackName = one(overlay, root.subject, Vocab.extension);
    return overlay.getQuads(root.subject, Vocab.action, null).map(q => {
      const a = q.object;
      const ref = one(overlay, a, Vocab.ref);
      const path = one(overlay, a, Vocab.path);
      const start = overlay.getQuads(a, Vocab.start, null).length > 0;
      const named = [ref && `sa:ref <${ref}>`, path && `sa:path "${path}"`, start && 'sa:start']
            .filter(x => x);
      if (named.length !== 1)
        throw Error(`an sa:action wants exactly one of sa:ref, sa:path or sa:start; `
                    + (named.length ? `<${root.subject.value}> gave ${named.join(' and ')}`
                                    : `<${root.subject.value}> gave none`));
      const name = one(overlay, a, Vocab.extension) || fallbackName;
      if (!name)
        throw Error(`no sa:extension on ${named[0]} or on <${root.subject.value}>: `
                    + `an action has to say which extension runs it`);
      const order = one(overlay, a, Vocab.order);
      return {
        ref, path, start,
        code: one(overlay, a, Vocab.code),
        name,
        order: order === undefined ? 0 : parseInt(order, 10),
      };
    });
  });
}

function resolve (spec: ActionSpec, schema: any, index: any, options: OverlayOptions): Binding {
  const semAct: SemAct = {type: 'SemAct', name: spec.name};
  if (spec.code !== undefined)
    semAct.code = spec.code;

  if (spec.start)
    return {target: schema, semAct, order: spec.order, named: 'sa:start'};

  if (spec.ref !== undefined) {
    let target = index.shapeExprs[spec.ref] || index.tripleExprs[spec.ref];
    if (target === undefined)
      throw Error(`sa:ref <${spec.ref}> is not a label in this schema; it has `
                  + describeLabels(index));
    // A ShapeDecl is a label wrapped around a shape expression, and ShExJ
    // puts semActs on the expression rather than on the wrapper.
    if (target.type === 'ShapeDecl')
      target = target.shapeExpr;
    return {target, semAct, order: spec.order, named: `sa:ref <${spec.ref}>`};
  }

  const found = evalShapePath(spec.path!, schema, options);
  if (found.length === 0)
    throw Error(`sa:path "${spec.path}" selected nothing in this schema`);
  if (found.length > 1)
    throw Error(`sa:path "${spec.path}" selected ${found.length} elements; `
                + `an action goes on one (narrow the path, or write one action each)`);
  return {target: found[0], semAct, order: spec.order, named: `sa:path "${spec.path}"`};
}

/** the ShapePath elements `pathStr` selects in `schema` */
export function evalShapePath (pathStr: string, schema: any, options: OverlayOptions = {}): any[] {
  const yy = {
    base: options.base === undefined ? undefined : new URL(options.base),
    prefixes: options.prefixes || {},
  };
  const expr = new ShapePath.Parser.ShapePathParser(yy).parse(pathStr);
  return expr.evalPathExpr([schema], new ShapePath.Ast.EvalContext(schema));
}

// ## reading RDF without depending on an RDF library

function one (source: QuadSource, subject: any, predicate: string): string | undefined {
  const found = source.getQuads(subject, predicate, null);
  if (found.length === 0)
    return undefined;
  if (found.length > 1)
    throw Error(`${predicate} is given ${found.length} times on one sa:action`);
  return found[0].object.value;
}

function cmp (l: string | undefined, r: string | undefined): number {
  return (l || '') < (r || '') ? -1 : (l || '') > (r || '') ? 1 : 0;
}

function describeLabels (index: any): string {
  const shapes = Object.keys(index.shapeExprs || {});
  const tes = Object.keys(index.tripleExprs || {});
  return `${shapes.length} shape ${plural(shapes.length, 'label')}`
    + ` and ${tes.length} triple expression ${plural(tes.length, 'label')}`
    + (shapes.length + tes.length > 0
       ? `:\n  ` + shapes.concat(tes).map(l => '  ' + l).join('\n  ')
       : '');
}

function plural (n: number, word: string): string {
  return n === 1 ? word : word + 's';
}

// ## the other direction: taking actions out of a schema

interface ExtractedAction {
  /** the element's ShExJ id */
  ref?: string;
  /** a ShapePath that selects it */
  path?: string;
  /** the schema's own startActs */
  start?: boolean;
  name: string;
  code?: string;
  order: number;
}

interface Extraction {
  /** a copy of the schema with the extracted actions taken out of it */
  schema: any;
  /** what was taken out, ready to write as sa:action */
  actions: ExtractedAction[];
  /** actions on elements an overlay has no way to name; left where they were */
  left: {where: string, semActs: SemAct[]}[];
}

/**
 * A schema's actions, lifted out into overlay form.
 *
 * The way back for a schema that already has `%<ext>{...%}` through it: what
 * comes out is a schema anyone can read and a list of actions that puts them
 * back.  An element an overlay can't name -- no id, and no ShapePath this
 * knows how to write for it -- keeps its actions, and is listed in `left`.
 */
export function extractOverlay (schema: any): Extraction {
  const copy = JSON.parse(JSON.stringify(schema));
  delete copy._index;
  const actions: ExtractedAction[] = [];
  const left: {where: string, semActs: SemAct[]}[] = [];

  if (copy.startActs) {
    copy.startActs.forEach((a: SemAct, i: number) =>
      actions.push({start: true, name: a.name, code: a.code, order: i}));
    delete copy.startActs;
  }
  (copy.shapes || []).forEach((decl: any) => {
    const label = typeof decl.id === 'string' && decl.id.substr(0, 2) !== '_:'
      ? decl.id : null;
    shapeExpr(decl.type === 'ShapeDecl' ? decl.shapeExpr : decl,
              label === null ? null : {ref: label},
              label, `<${decl.id}>`);
  });
  return {schema: copy, actions, left};

  function shapeExpr (expr: any, naming: any, label: string | null, where: string): void {
    if (expr === null || typeof expr !== 'object')
      return;
    take(expr, naming, where);
    switch (expr.type) {
    case 'ShapeAnd':
    case 'ShapeOr':
      // a conjunct has no id and no step this writes, so it names nothing
      return expr.shapeExprs.forEach((e: any, i: number) =>
        shapeExpr(e, null, label, `${where}/shapeExprs[${i}]`));
    case 'ShapeNot':
      return shapeExpr(expr.shapeExpr, null, label, `${where}/shapeExpr`);
    case 'Shape':
      return tripleExpr(expr.expression, label, `${where}/expression`,
                        countPredicates(expr.expression));
    default:
      return;
    }
  }

  function tripleExpr (expr: any, label: string | null, where: string,
                       counts: {[p: string]: number}): void {
    if (expr === null || typeof expr !== 'object')
      return;
    // A triple constraint with an id is named by it; without one, the
    // predicate shortcut reaches it, so long as the shape has a label and
    // only one constraint on that predicate.
    const naming = expr.id !== undefined && expr.id.substr(0, 2) !== '_:'
      ? {ref: expr.id}
      : expr.type === 'TripleConstraint' && label !== null && counts[expr.predicate] === 1
        ? {path: `@<${label}>~<${expr.predicate}>`}
        : null;
    take(expr, naming, where);
    if (expr.type === 'EachOf' || expr.type === 'OneOf')
      expr.expressions.forEach((e: any, i: number) =>
        tripleExpr(e, label, `${where}/expressions[${i}]`, counts));
    if (expr.type === 'TripleConstraint')
      shapeExpr(expr.valueExpr, null, null, `${where}/valueExpr`);
  }

  function take (elt: any, naming: any, where: string): void {
    const acts: SemAct[] = elt.semActs;
    if (acts === undefined || acts.length === 0)
      return;
    if (naming === null) {
      left.push({where, semActs: acts});
      return;
    }
    acts.forEach((a, i) => actions.push(
      Object.assign({}, naming, {name: a.name, code: a.code, order: i})));
    delete elt.semActs;
  }

  function countPredicates (expr: any): {[p: string]: number} {
    const counts: {[p: string]: number} = {};
    walk(expr);
    return counts;
    function walk (e: any): void {
      if (e === null || typeof e !== 'object') return;
      if (e.type === 'TripleConstraint')
        counts[e.predicate] = (counts[e.predicate] || 0) + 1;
      else if (e.type === 'EachOf' || e.type === 'OneOf')
        e.expressions.forEach(walk);
    }
  }
}

/** the Turtle for a list of extracted actions */
export function overlayTurtle (actions: ExtractedAction[], options: {
  subject?: string, extension?: string,
} = {}): string {
  const subject = options.subject || '<#overlay>';
  const shared = options.extension
    || (actions.length && actions.every(a => a.name === actions[0].name)
        ? actions[0].name : undefined);
  const lines = actions.map(a => {
    const parts = [
      a.start ? 'sa:start true' : a.ref !== undefined ? `sa:ref <${a.ref}>`
        : `sa:path ${quote(a.path!)}`,
      shared === undefined ? `sa:extension <${a.name}>` : null,
      a.code === undefined ? null : `sa:code ${quote(a.code)}`,
      a.order === 0 ? null : `sa:order ${a.order}`,
    ].filter(p => p !== null);
    return '  [ ' + parts.join(' ;\n    ') + ' ]';
  });
  return `PREFIX sa: <${NS}>\n\n${subject} a sa:Overlay ;\n`
    + (shared === undefined ? '' : `  sa:extension <${shared}> ;\n`)
    + (lines.length ? '  sa:action\n' + lines.join(' ,\n') + '\n' : '')
    + '.\n';
}

function quote (s: string): string {
  return s.indexOf('\n') === -1
    ? '"' + s.replace(/(["\\])/g, '\\$1') + '"'
    : '"""' + s.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"') + '"""';
}
