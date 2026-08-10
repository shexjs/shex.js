/** API called by @shexjs/validator to get a neighborhood (arcs in and out of a node)
 */
import {Shape} from 'shexj';
import * as RdfJs from "@rdfjs/types/data-model";
import {Term as RdfJsTerm} from "@rdfjs/types/data-model";
export const Start = { term: "START" }

export {};

export interface Neighborhood {
  incoming: RdfJs.Quad[];
  outgoing: RdfJs.Quad[];
}

/** Tracks the queries a NeighborhoodDb makes on behalf of a validator,
 * e.g. to log or slurp the retrieved triples.
 */
export interface DbQueryTracker {
  start (isIncoming: boolean, term: RdfJsTerm, shapeLabel: string | typeof Start): void;
  end (quads: RdfJs.Quad[], time: number): void;
}

export interface NeighborhoodDb {
  getSubjects(): RdfJs.Term[];
  getPredicates(): RdfJs.Term[];
  getObjects(): RdfJs.Term[];
  getQuads(): RdfJs.Quad[];
  getNeighborhood (point: RdfJs.Term, shapeLabel: string | typeof Start, shape: Shape): Neighborhood;
  get size(): number
}

// ── declaring a DB's construction parameters ────────────────────────────────
// STRAWMAN (names and shapes negotiable).  Each neighborhood implementation
// needs different things to come to life -- an rdfjs store wants files (with
// media types), a SPARQL db wants an endpoint and query-strategy flags, a
// wikidata db wants the page base it appends entity ids to.  A host that
// offers several implementations (the CLI, the WebApp) shouldn't hard-code
// each one's needs, so a module may *declare* them.
//
// The declaration rides on the module, not on NeighborhoodDb: parameters
// exist to construct the db, so by the time an instance exists they're
// spent.  And because the declaration is a pair of optional exports
// (`dbParams`, `fromParams`) rather than a required interface, a module that
// ignores all of this still works everywhere it works today -- which is the
// "optional NeighborhoodParmsDb" choice, without a new interface to
// implement.
//
// The vocabulary is a subset of OpenAPI's Parameter/Schema Objects, chosen
// by comparing against what `command-line-args` option definitions can say
// (see paramsToCommandLineArgs below for the fit measured in both
// directions).

/** A subset of the OpenAPI Schema Object, wide enough for db parameters. */
export interface DbParamSchema {
  type: "string" | "number" | "integer" | "boolean" | "array";
  /** e.g. "uri", "file-path" -- advisory, shown in help text */
  format?: string;
  enum?: string[];
  default?: unknown;
  /** for arrays; contentMediaType says how to interpret each entry, which is
   * how "a list of filenames paired with media types" is declared without a
   * pairing syntax: one array-of-files parameter per media type */
  items?: { type: string; format?: string; contentMediaType?: string };
}

/** One construction parameter of a NeighborhoodDb implementation, in the
 * style of an OpenAPI Parameter Object. */
export interface DbParamSpec {
  /** key of this parameter in the bag handed to `fromParams` */
  name: string;
  description?: string;
  /** the parameter whose presence picks this module: a host offering several
   * neighborhood modules selects the one whose selector the user supplied */
  selector?: boolean;
  required?: boolean;
  schema: DbParamSchema;
  /** how to surface this in a command line, where OpenAPI has no opinion:
   * `option` overrides the flag name (e.g. sparql's historical --endpoint),
   * `alias` is a single-char short flag.  A host is free to prefix option
   * names to avoid collisions between modules. */
  cli?: { option?: string; alias?: string; typeLabel?: string };
}

/** What a neighborhood package's entry may export.  `name`, `description`
 * and `ctor` are the longstanding convention; `dbParams`/`fromParams` are
 * the optional declaration that lets a host construct the db generically. */
export interface NeighborhoodModule {
  name: string;
  description: string;
  /** the implementation-specific constructor (each module's own signature) */
  ctor: (...args: any[]) => NeighborhoodDb;
  /** uniform constructor over values keyed by DbParamSpec.name */
  fromParams?: (params: { [name: string]: any }, queryTracker?: DbQueryTracker) => NeighborhoodDb;
  dbParams?: DbParamSpec[];
}

/** What a command-line-args/command-line-usage option definition looks like;
 * spelled out here so the translation below is checkable without depending
 * on those packages. */
export interface CliOptionDefinition {
  name: string;
  alias?: string;
  type: StringConstructor | NumberConstructor | BooleanConstructor;
  multiple?: boolean;
  defaultValue?: unknown;
  description?: string;
  typeLabel?: string;
}

/** Translate DbParamSpecs into command-line-args option definitions.
 *
 * This function is also the measurement the two vocabularies were compared
 * by.  What survives the round trip: names, descriptions, the four scalar
 * types, arrays (`multiple`), defaults, enums (demoted to a typeLabel).
 * What OpenAPI can say that command-line-args cannot: `format`,
 * `items.contentMediaType` (both demoted to help text), `required` (CLA has
 * no mandatory options -- the host must enforce it), and nested objects
 * (not offered in DbParamSchema for exactly that reason).  What
 * command-line-args can say that OpenAPI cannot: `alias`, `defaultOption`,
 * `lazyMultiple`, `group` -- which is why DbParamSpec carries a `cli` hint
 * rather than pretending OpenAPI covers a command line.
 */
export function paramsToCommandLineArgs (specs: DbParamSpec[]): CliOptionDefinition[] {
  return specs.map(spec => {
    const scalar = spec.schema.type === "array" ? (spec.schema.items?.type || "string") : spec.schema.type;
    const def: CliOptionDefinition = {
      name: spec.cli?.option || spec.name,
      type: scalar === "boolean" ? Boolean : scalar === "number" || scalar === "integer" ? Number : String,
    };
    if (spec.cli?.alias) def.alias = spec.cli.alias;
    if (spec.schema.type === "array") def.multiple = true;
    if (spec.schema.default !== undefined) def.defaultValue = spec.schema.default;
    if (spec.description) def.description = spec.description;
    def.typeLabel = spec.cli?.typeLabel
      || (spec.schema.enum ? spec.schema.enum.join("|") : undefined)
      || (spec.schema.type === "array" ? spec.schema.items?.format : spec.schema.format);
    if (def.typeLabel === undefined) delete def.typeLabel;
    return def;
  });
}

// ── loading a neighborhood module into the WebApp ───────────────────────────
// STRAWMAN.  The WebApp wants more from a db than getNeighborhood: focus
// node typeahead, display labels, maybe a module-tuned editor.  But a
// module that implements getNeighborhood must not be obliged to ship a
// javascript language-sensitive editor, so every affordance here is
// optional: the WebApp feature-tests and falls back to its generic UI.  A
// plain NeighborhoodDb loads fine -- construction is already covered by
// dbParams/fromParams above (rendered as a form instead of command line
// options).

export interface NeighborhoodWebAppDb extends NeighborhoodDb {
  /** typeahead for the focus node input, e.g. wikidata's label search */
  suggestFocusNodes?(prefix: string, limit: number): Promise<RdfJs.Term[]>;
  /** display label for a term, e.g. rdfs:label in the user's language */
  labelOf?(term: RdfJsTerm, language: string): Promise<string | null>;
}

/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
export function sparqlOrder (l: RdfJsTerm, r: RdfJsTerm): number {
  const [lprec, rprec] = [prec(l), prec(r)];
  return lprec === rprec ? l.value.localeCompare(r.value) : lprec - rprec;
}

const termType2Prec: {
  [key in 'BlankNode' | 'NamedNode' | 'Literal']: number
} = {
  'BlankNode': 1,
  'Literal': 2,
  'NamedNode': 3,
}

function prec (t: RdfJsTerm) : number {
  let typeLabel = t.termType;
  if (typeLabel === 'Quad' || typeLabel === 'Variable' || typeLabel === 'DefaultGraph')
    throw Error(`no defined SPARQL order for ${typeLabel} ${t.value}`)
  return termType2Prec[typeLabel];
}

