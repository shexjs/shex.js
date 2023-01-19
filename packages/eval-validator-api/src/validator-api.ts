import * as ShExJ from 'shexj';
import * as RdfJs from '@rdfjs/types/data-model';
import {shapeExprTest, Recursion, SemActFailure} from "@shexjs/term/src/shexv";
import {NeighborhoodDb} from "@shexjs/neighborhood-api";
import {SchemaIndex} from "@shexjs/term";

export {};

export interface Tc2t {
  'tNo': number,
  'res': object // ShExR type
}

export const NoTripleConstraint = Symbol('NO_TRIPLE_CONSTRAINT');

export type TcAssignment = number | typeof NoTripleConstraint;
export type T2TcPartition = TcAssignment[];

export interface ValidatorRegexModule {
  compile(schema: ShExJ.Schema, shape: ShExJ.Shape, index: SchemaIndex): ValidatorRegexEngine
}

export interface ValidatorRegexEngine {
  match(
    db: NeighborhoodDb,
    point: string | object,
    constraintList: ShExJ.TripleConstraint[],
    tc2t: Tc2t[][],
    t2tcForThisShape: T2TcPartition,
    neighborhood: RdfJs.Quad[] | null,
    semActHandler: SemActDispatcher,
    trace: object[] | null
  ): object;
}

export interface QueryTracker {
  enter (term: RdfJs.Term, shapeLabel: string): void;
  exit (term: RdfJs.Term, shapeLabel: string, res: shapeExprTest): void;
  recurse (rec: Recursion): void;
  known (res: shapeExprTest): void;
}

export interface SemActDispatcher {
  register(name: string, handler: SemActHandler): void;
  dispatchAll(semActs: ShExJ.SemAct[] | undefined, ctx: any, resultsArtifact: any): SemActFailure[];
  results: { [id: string]: string | undefined }; // TODO: improve this trivial storage mechanism
}

export interface SemActHandler {
  dispatch(code: string | null, ctx: any, extensionStorage: any): SemActFailure[];
}
