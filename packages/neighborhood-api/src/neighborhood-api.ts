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

/**
 * The same, for a source that has to go and get it -- a fetch(), a query.
 *
 * Deliberately a *second* interface rather than a widening of the first.
 * The validator's search is synchronous recursion, and an await at every
 * step of it would cost a promise per node visited: measured over the FHIR
 * corpus that is ~2800 neighborhoods for one root against an 11ms median
 * (perf/baseline-sync.json), so the data already in memory -- most of it,
 * most of the time -- would pay for the data that isn't.
 *
 * The search doesn't become async to use one of these.  It becomes
 * *resumable*: it stops at the fetch and goes on from there, driven by
 * ShExValidator.validateShapeMapAsync.  A caller with a local store keeps
 * NeighborhoodDb and pays nothing.
 */
export interface AsyncNeighborhoodDb {
  getSubjects(): RdfJs.Term[];
  getPredicates(): RdfJs.Term[];
  getObjects(): RdfJs.Term[];
  getQuads(): RdfJs.Quad[];
  getNeighborhood (point: RdfJs.Term, shapeLabel: string | typeof Start, shape: Shape): Promise<Neighborhood>;
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

/** A parameter whose value is one or more *documents the user edits*, not a
 * scalar they type into a field: the RDF a local store validates, the
 * entity pages a Wikibase neighborhood should believe instead of what the
 * site currently says.
 *
 * A host shows a pane per document -- one at a time, the way any editor
 * shows tabs -- and asks the module what language they are in and whether
 * the user may add more.  A neighborhood whose data is one graph declares
 * exactly one; a neighborhood whose data is a set of entities declares as
 * many as the user cares to open; a neighborhood that only queries a
 * server declares none, and its whole configuration is fields.
 */
export interface PaneSpec {
  /** what to call one of these documents: "Turtle", "entity JSON" */
  label: string;
  /** how the document is edited; absent means a plain textarea */
  editor?: ParamEditor;
  /** fewest and most a host should offer (max undefined: no limit) */
  min?: number;
  max?: number;
  /** may the user open more of them? */
  creatable?: boolean;
  /** what a newly opened document starts as */
  template?: string;
  /** a name for one document, read out of it -- a Wikibase entity page's
   * id, say -- for its tab.  Null when the document doesn't say (it is
   * half-typed, or not of this kind), leaving the host its own numbering. */
  titleOf? (text: string): string | null;
}

/** One construction parameter of a NeighborhoodDb implementation, in the
 * style of an OpenAPI Parameter Object. */
export interface DbParamSpec {
  /** key of this parameter in the bag handed to `fromParams` */
  name: string;
  description?: string;
  /** this parameter's presence picks this module: a host offering several
   * neighborhood modules selects the one whose selector the user supplied.
   * More than one may be marked -- any of them names the source. */
  selector?: boolean;
  required?: boolean;
  schema: DbParamSchema;
  /** how to surface this in a command line, where OpenAPI has no opinion:
   * `option` overrides the flag name (e.g. sparql's historical --endpoint),
   * `alias` is a single-char short flag.  A host is free to prefix option
   * names to avoid collisions between modules. */
  cli?: { option?: string; alias?: string; typeLabel?: string };
  /** present when this parameter's value is documents to edit rather than
   * a value to type; see PaneSpec */
  pane?: PaneSpec;
  /** `hidden` keeps a parameter out of a rendered form -- for one that only
   * means something where the host isn't, like a directory to cache in when
   * the host is a browser */
  ui?: { hidden?: boolean };
}

/** the parameters a host renders as document panes, and as form fields */
export function paneParams (specs: DbParamSpec[]): DbParamSpec[] {
  return specs.filter(spec => !!spec.pane);
}

export function fieldParams (specs: DbParamSpec[]): DbParamSpec[] {
  return specs.filter(spec => !spec.pane);
}

/** How a module is named where a name has to be short and stable: a
 * manifest entry's `neighborhood`, a permalink parameter, a picklist's
 * option value. */
export function moduleId (module: NeighborhoodModule): string {
  return module.name.replace(/^neighborhood-/, "");
}

// ── a module's own language-sensitive editor ────────────────────────────────
// STRAWMAN.  A host with editors (the WebApp) shows the text that selects
// and configures a neighborhood -- today the data pane, where "# Endpoint:
// <url>" means "query this instead of parsing me".  Which language that
// text is in is the module's business, not the host's.
//
// But a module that implements getNeighborhood must not be obliged to ship
// a javascript editor, so a ParamEditor *describes* a language rather than
// implementing one: whole-document tokens, diagnostics, completions, all in
// plain data over plain strings.  No editor library, no DOM, nothing to
// import -- and unit-testable without either.  A module with a big document
// to edit instead names a language the host already implements
// (`language: "turtle"`).  A module that describes nothing at all gets the
// plain textarea the WebApp shows with its editors turned off, which is
// also what every module gets when the editors are off or absent.

/** A run of text to color.  `style` is a highlight role -- the names
 * CodeMirror's stream parsers use ("keyword", "comment", "string", "link",
 * "number", "variableName", "invalid", ...) -- which the host maps to its
 * own theme. */
export interface EditorToken {
  from: number;
  to: number;
  style: string;
}

export interface EditorDiagnostic {
  from: number;
  to: number;
  severity: "error" | "warning" | "info";
  message: string;
}

export interface EditorCompletion {
  label: string;
  detail?: string;
  /** completion kind, e.g. "keyword", "namespace", "class", "property" */
  type?: string;
}

export interface EditorCompletions {
  /** where the text being completed starts */
  from: number;
  to?: number;
  options: EditorCompletion[];
}

/** Context a host may hand the editor: the live db, when one is built, so
 * completions can draw on what it knows (see NeighborhoodWebAppDb below). */
export interface EditorContext {
  db?: NeighborhoodDb;
}

/** How a module's own text should be edited.  Every member is optional: a
 * module contributes as much language as it has and no more, and the
 * members compose -- a module whose pane is mostly an RDF document with a
 * header line of its own says `language: "turtle"` for the body and
 * describes just the header in `tokens`/`lint`, which the host overlays on
 * (rather than replaces) what the named language provides. */
export interface ParamEditor {
  /** a language the host already implements ("turtle", "shexc", "json"),
   * for text a module does not want to describe itself */
  language?: string;
  /** syntax coloring, as a whole-document scan */
  tokens? (text: string, ctx?: EditorContext): EditorToken[];
  /** diagnostics over the whole text */
  lint? (text: string, ctx?: EditorContext): EditorDiagnostic[];
  /** completions at a cursor offset; null for "nothing to offer here" */
  complete? (text: string, pos: number, ctx?: EditorContext): EditorCompletions | null;
}

// ── query map extensions ───────────────────────────────────────────────────
// A shape map may pick its focus nodes by asking rather than by naming
// them: `SPARQL "SELECT ..."@START` means "whatever that query selects".
// Which questions can be asked is not a property of the shape map language
// but of where the data comes from -- only a query service can run a SPARQL
// query, only a Wikibase knows what an entity id means -- so each module
// says what it can resolve and a host asks the selected source.  A host
// that finds no resolver can then say *which* source doesn't understand
// the extension, rather than reporting it as a syntax error or, worse,
// running it against something that was never configured.

/** How a bare extension name in a shape map becomes an IRI: the convention
 * the shape-map grammar follows, and SPARQL's own name obeys. */
export function extensionIri (name: string): string {
  return "http://www.w3.org/ns/shex#Extensions-" + name.toLowerCase();
}

/** The name a shape map would write for an extension IRI, for error
 * messages and for writing a shape map back out. */
export function extensionName (language: string): string {
  const m = language.match(/#Extensions-(.*)$/);
  return m ? m[1].toUpperCase() : language;
}

export interface QueryMapResolver {
  /** the extension IRI the shape-map parser reports; see extensionIri */
  language: string;
  /** how it is written in a shape map, the bare word before the string */
  name: string;
  description?: string;
  /** the focus nodes this extension's text picks out.  Synchronous, like
   * the rest of this API: the db it is handed answers synchronously too. */
  resolve (lexical: string, db: NeighborhoodDb): RdfJsTerm[];
}

/** the selected source's resolver for an extension, or null if it has none */
export function queryMapResolverFor (module: NeighborhoodModule, language: string): QueryMapResolver | null {
  return (module.queryMapResolvers || []).find(r => r.language === language) || null;
}

/** What a neighborhood package's entry may export.  `name`, `description`
 * and `ctor` are the longstanding convention; the rest are optional
 * declarations that let a host construct the db, and edit the text
 * configuring it, generically. */
export interface NeighborhoodModule {
  name: string;
  description: string;
  /** What this source does to get its answers, which a host may need to
   * know without knowing the source: "query" goes to a service, "translate"
   * turns some other representation into RDF.  Either means the data is
   * fetched rather than typed, so a host can offer to record what a
   * validation fetched (the WebApp's slurp).  A source that is handed its
   * data declares neither. */
  capabilities?: ("query" | "translate")[];
  /** what to call this data source where a user picks one, e.g. "Wikidata".
   * A neighborhood is an implementation detail from inside; from outside it
   * is where the data comes from. */
  label?: string;
  /** the implementation-specific constructor (each module's own signature) */
  ctor: (...args: any[]) => NeighborhoodDb;
  /** uniform constructor over values keyed by DbParamSpec.name */
  fromParams?: (params: { [name: string]: any }, queryTracker?: DbQueryTracker) => NeighborhoodDb;
  dbParams?: DbParamSpec[];
  /** Does this text ask for this module, and with what parameters?
   *
   * Not how a host picks a data source -- the user does that -- but how
   * text that arrives from somewhere else says which one it wants: a
   * manifest entry, a permalink, a dropped file, or a pane saved back when
   * "# Endpoint: <url>" at the top of the data was how you reached a query
   * service.  Return null to pass. */
  claimPaneText? (text: string): { [name: string]: any } | null;
  /** the query map extensions this source can resolve; see QueryMapResolver */
  queryMapResolvers?: QueryMapResolver[];
  /** how the text this module claims should be edited, for a host with one
   * pane and no notion of which parameter it holds.  A host that renders
   * dbParams gets each pane's language from its PaneSpec instead. */
  paneEditor?: ParamEditor;
}

/** The module whose claimPaneText answers to this text, and the parameters
 * it read out of it; null when none does, leaving the host with whatever
 * data source it was going to use anyway. */
export function claimPane (modules: NeighborhoodModule[], text: string): {
  module: NeighborhoodModule;
  params: { [name: string]: any };
} | null {
  for (const module of modules) {
    const params = module.claimPaneText ? module.claimPaneText(text) : null;
    if (params !== null)
      return {module, params};
  }
  return null;
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
  /** typeahead for the focus node input, e.g. wikidata's label search.
   * Also what a module's ParamEditor completions can draw on, through the
   * EditorContext's `db`. */
  suggestFocusNodes?(prefix: string, limit: number): EditorCompletion[];
  /** display label for a term, e.g. rdfs:label in the user's language */
  labelOf?(term: RdfJsTerm, language: string): string | null;
  /** This source's own document, parsed, with a side table saying where
   * each quad was written -- the same shape a Turtle parser reports
   * ({start, end} per position, a multiset).  A host anchors validation
   * results to the data with this, and only the source can supply it: a
   * document is Turtle, or an entity page, or whatever the source reads.
   * Absent means "assume the host's own format". */
  locateDocument?(text: string): {
    text: string;
    quads: RdfJs.Quad[];
    provenance: {get (quad: RdfJs.Quad): any[], readonly size: number};
    diagnostics: {from: number, to: number, severity: string, message: string}[];
  } | null;
  /** The documents this db read to answer what it was asked -- a
   * translating source's source material, one per thing it fetched.  A
   * host that offers to record what a validation fetched hands these back
   * as documents, so what was read can be edited and validated again. */
  loadedPages?(): { id: string, text: string }[];
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

