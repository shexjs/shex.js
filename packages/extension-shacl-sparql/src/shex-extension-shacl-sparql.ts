/**
 * SHACL-SPARQL constraints as ShEx semantic actions.
 *
 *   <S> { :start xsd:date ; :end xsd:date } %shacl-sparql:{
 *     SELECT $this ?start ?end ("ends before it starts" AS ?message)
 *     WHERE { $this :start ?start ; :end ?end FILTER (?end < ?start) }
 *   %}
 *
 * A query means what it means in SHACL-SPARQL, so one written for a
 * sh:SPARQLConstraint (SELECT) or a sh:SPARQLAskValidator (ASK) can be used
 * as it is:
 *
 *   - SELECT: each row is a violation, so no rows passes.  A row's ?message,
 *     if it binds one, says what went wrong.
 *   - ASK: true passes.
 *
 * What is pre-bound depends on where the action is:
 *
 *   - on a shape or a node constraint: $this, the node being validated;
 *   - on a triple constraint: $this, the node being validated, and $value,
 *     the other end of the triple the constraint matched;
 *   - on a group (EachOf/OneOf): $this, the node its triples share;
 *   - in the start actions: nothing -- a check over the whole of the data.
 *
 * The schema's PREFIX declarations are in scope, so a query needs none of
 * its own (SHACL's sh:prefixes).
 *
 * What a query runs over is the validator's data source's view, as its
 * querySource() says (@shexjs/neighborhood-api): an RDF/JS dataset is
 * queried in place with Comunica, its default graph the union of all its
 * graphs; an endpoint is sent the query, with the pre-bound terms written
 * into it -- which can't be done for a blank node, so a blank node $this
 * or $value can't be asked about at an endpoint.
 *
 * Every query is answered asynchronously: validate with
 * ShExValidator.validateShapeMapAsync.
 */
import type * as RdfJs from "@rdfjs/types";
import type {QuerySource, SparqlAnswer} from "@shexjs/neighborhood-api";
import {Parser as SparqlParser, Generator as SparqlGenerator} from "sparqljs";

const ShaclSparqlExt = "http://shex.io/extensions/SHACL-SPARQL/";

interface Failure {
  type: "SemActFailure";
  errors: string[];
  /** the row that was the violation, each variable written as Turtle */
  row?: {[variable: string]: string};
}

/** a query as written, parsed once */
interface Prepared {
  queryType: "SELECT" | "ASK";
  parsed: any;
  /** what an RDF/JS source is sent: the query with its prefixes spelled out */
  text: string;
}

/** a term the query is told $this or $value is */
type Bound = {[variable: string]: RdfJs.Term};

function register (validator: any, api: any) {
  if (api === undefined || !('ShExTerm' in api))
    throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)');
  const ShExTerm = api.ShExTerm;

  const prepared = new Map<string, Prepared>();
  /** what each question was answered, for the dispatch that comes back for it */
  const answered = new Map<string, Failure[]>();
  /** questions sent and not yet answered, so two askers wait on one query */
  const asking = new Map<string, Promise<void>>();

  validator.semActHandler.register(ShaclSparqlExt, {
    dispatch (code: string | null, ctx: any, _extensionStorage: any): Failure[] | Promise<void> {
      if (code === null)
        throw Error(`Invocation error: ${ShaclSparqlExt} needs a query`);
      const query = prepare(code);
      const bound = preBound(ctx);
      const key = code + "\u0000" + Object.keys(bound).sort()
            .map(v => v + "=" + ShExTerm.rdfJsTerm2Turtle(bound[v])).join("\u0000");
      const answer = answered.get(key);
      if (answer !== undefined)
        return answer;
      let waiting = asking.get(key);
      if (waiting === undefined) {
        waiting = ask(query, bound).then(answer => {
          answered.set(key, judge(query, answer));
          asking.delete(key);
        }, e => {
          asking.delete(key);
          throw e;
        });
        asking.set(key, waiting);
      }
      return waiting;
    }
  });
  return undefined;

  function prepare (code: string): Prepared {
    let ret = prepared.get(code);
    if (ret === undefined) {
      const schema = validator.schema;
      const parser = new SparqlParser({prefixes: schema._prefixes || {}, baseIRI: schema._base || undefined});
      let parsed: any;
      try {
        parsed = parser.parse(code);
      } catch (e) {
        throw Error(`Invocation error: ${ShaclSparqlExt} code didn't parse as SPARQL: ${(e as Error).message}\n${code}`);
      }
      if (parsed.type !== "query" || (parsed.queryType !== "SELECT" && parsed.queryType !== "ASK"))
        throw Error(`Invocation error: ${ShaclSparqlExt} code must be a SELECT or an ASK, not ${parsed.queryType || parsed.type}`);
      ret = {queryType: parsed.queryType, parsed, text: new SparqlGenerator().stringify(parsed)};
      prepared.set(code, ret);
    }
    return ret;
  }

  function ask (query: Prepared, bound: Bound): Promise<SparqlAnswer> {
    const db = validator.db;
    const source: QuerySource | undefined =
          db && typeof db.querySource === "function" ? db.querySource() : undefined;
    if (source === undefined)
      return Promise.reject(Error(`${ShaclSparqlExt}: this data source can't be queried (it has no querySource())`));
    switch (source.kind) {
      case "rdfjs":
        return askDataset(source.dataset, query.text, bound);
      case "endpoint":
        return Promise.resolve().then(() => source.query(substitute(query.parsed, bound)));
      default:
        return Promise.reject(Error(`${ShaclSparqlExt}: can't query a ${(source as {kind: string}).kind} source`));
    }
  }

  /** a query's answer, as the failures it means */
  function judge (query: Prepared, answer: SparqlAnswer): Failure[] {
    if ("boolean" in answer)
      return answer.boolean ? [] : [{type: "SemActFailure", errors: [`${ShaclSparqlExt} ASK answered false`]}];
    return answer.rows.map(row => {
      const said: {[variable: string]: string} = {};
      answer.vars.forEach((v, i) => {
        if (row[i] !== null && row[i] !== undefined)
          said[v] = ShExTerm.rdfJsTerm2Turtle(row[i]);
      });
      const messageAt = answer.vars.indexOf("message");
      const message = messageAt !== -1 && row[messageAt] ? row[messageAt]!.value
            : `${ShaclSparqlExt} ${query.queryType} found a violation: `
              + Object.keys(said).map(v => `?${v}=${said[v]}`).join(" ");
      return {type: "SemActFailure", errors: [message], row: said};
    });
  }
}

/** Where the action is says what $this and $value are (see the header). */
function preBound (ctx: any): Bound {
  if (ctx === null || ctx === undefined)
    return {};                                        // a start action
  if (ctx.node !== undefined && typeof ctx.node === "object" && "termType" in ctx.node)
    return {this: ctx.node};                          // a shape or a node constraint
  const triples: RdfJs.Quad[] = Array.isArray(ctx.triples) ? ctx.triples : [];
  if (ctx.tripleExpr && ctx.tripleExpr.type === "TripleConstraint" && triples.length === 1) {
    const [t] = triples;
    return ctx.tripleExpr.inverse
      ? {this: t.object, value: t.subject}
      : {this: t.subject, value: t.object};
  }
  // a group: the node all of its triples are about
  const shared = (terms: RdfJs.Term[]) =>
        terms.length > 0 && terms.every(t => t.equals(terms[0])) ? terms[0] : undefined;
  const focus = shared(triples.map(t => t.subject)) || shared(triples.map(t => t.object));
  return focus === undefined ? {} : {this: focus};
}

/**
 * The query, for an endpoint, with the pre-bound terms written in: an
 * endpoint can only be sent text.  A projected variable that is bound
 * becomes `(<term> AS ?var)`, so the rows still say what it was.
 */
function substitute (parsed: any, bound: Bound): string {
  for (const v of Object.keys(bound))
    if (bound[v].termType === "BlankNode")
      throw Error(`${ShaclSparqlExt}: can't ask an endpoint about $${v}, a blank node: `
                  + `there is no way to name it in a query`);
  const replace = (node: any): any => {
    if (Array.isArray(node))
      return node.map(replace);
    if (node === null || typeof node !== "object")
      return node;
    if (node.termType === "Variable")
      return node.value in bound ? bound[node.value] : node;
    if (node.termType !== undefined)
      return node;                                    // a constant already
    const ret: any = {};
    for (const k of Object.keys(node))
      ret[k] = replace(node[k]);
    return ret;
  };
  const projection = parsed.variables;
  const query = replace(Object.assign({}, parsed, {variables: undefined}));
  if (projection !== undefined)
    query.variables = projection.map((v: any) =>
      v.termType === "Variable" && v.value in bound ? {expression: bound[v.value], variable: v}
      : v.termType === undefined && v.expression !== undefined ? {expression: replace(v.expression), variable: v.variable}
      : v);
  else
    delete query.variables;
  return new SparqlGenerator().stringify(query);
}

let engine: any = null;

/** Comunica, over a dataset in place; its default graph the union of them all */
async function askDataset (dataset: any, text: string, bound: Bound): Promise<SparqlAnswer> {
  if (engine === null) {
    const {QueryEngine} = require("@comunica/query-sparql-rdfjs");
    engine = new QueryEngine();
  }
  const context: any = {sources: [dataset], unionDefaultGraph: true};
  if (Object.keys(bound).length > 0) {
    const {BindingsFactory} = require("@comunica/utils-bindings-factory");
    const {DataFactory} = require("rdf-data-factory");
    context.initialBindings = new BindingsFactory(new DataFactory()).fromRecord(bound);
  }
  const result = await engine.query(text, context);
  if (result.resultType === "boolean")
    return {boolean: await result.execute()};
  if (result.resultType !== "bindings")
    throw Error(`${ShaclSparqlExt}: expected rows or a boolean, got ${result.resultType}`);
  const vars: string[] = (await result.metadata()).variables
        .map((v: any) => v.variable !== undefined ? v.variable.value : v.value);
  const rows: (RdfJs.Term | null)[][] = [];
  for await (const binding of await result.execute())
    rows.push(vars.map(v => binding.get(v) || null));
  return {vars, rows};
}

function done (_validator: any) {
}

export = {
  name: "SHACL-SPARQL",
  description: `SHACL-SPARQL constraints as semantic actions: a SELECT fails on each row it finds, an ASK passes when true
url: ${ShaclSparqlExt}`,
  register,
  done,
  url: ShaclSparqlExt,
  /** its actions answer with promises: validate with validateShapeMapAsync
   * (a host that drives validation, the CLI, asks this) */
  asynchronous: true,
};
