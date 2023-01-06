import * as ShExJ from 'shexj';
import * as ShExUtil from '@shexjs/util';
import * as RdfJs from '@rdfjs/types/data-model';
import {shapeExprTest, Recursion} from "@shexjs/term/shexv";
import {BooleanSemActFailure, SemActFailure} from "@shexjs/term/shexv";
import {NeighborhoodDb} from "@shexjs/neighborhood-api";

export {};

export interface ValidatorRegexpApi {
  compile(
    schema: ShExJ.Schema,
    shape: ShExJ.Shape,
    index: ShExUtil.Index,
  ): ValidatorRegexEngine;
}

export interface Tc2t {
  'tNo': number,
  'res': object // ShExR type
}

export const NoTripleConstraint = Symbol('NO_TRIPLE_CONSTRAINT');

export type TcAssignment = number | typeof NoTripleConstraint;

export interface ValidatorRegexEngine {
  match(
    db: NeighborhoodDb,
    point: string | object,
    constraintList: ShExJ.TripleConstraint[],
    tc2t: Tc2t[][],
    t2tcForThisShape: TcAssignment[][],
    neighborhood: RdfJs.Quad[] | null,
    semActHandler: SemActDispatcher,
    trace: object[]
  ): object;
}

export interface QueryTracker {
  enter (term: RdfJs.Term, shapeLabel: string): void;
  exit (term: RdfJs.Term, shapeLabel: string, res: shapeExprTest): void;
  recurse (rec: Recursion): void;
  known (res: shapeExprTest): void;
}

export interface SemActModule {
  dispatchAll(semActs: any[], ctx: object, resultsArtifact: object): object[],
  handlers: object,
  register(name: string, handler: object): void,
  results: object
}

export interface SemActDispatcher {
  register(name: string, handler: SemActHandler): void;
  dispatchAll(semActs: ShExJ.SemAct[] | undefined, ctx: any, resultsArtifact: any): (SemActFailure | BooleanSemActFailure)[];
}

export interface SemActHandler {
  dispatch(code: string | null, ctx: any, extensionStorage: any): (SemActFailure | BooleanSemActFailure)[];
}
