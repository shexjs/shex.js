import * as ShExJ from 'shexj';
import * as ShExUtil from '@shexjs/util';
import * as RdfJs from "@rdfjs/types/data-model";

export interface ValidatorRegexpApi {
  compile(
    schema: ShExJ.Schema,
    shape: ShExJ.Shape,
    index: ShExUtil.Index,
  ): ValidatorRegexEngine;
}

export interface Tc2t {
  "tNo": number,
  "res": object // ShExR type
}

export const NoTripleConstraint = ["NO_TRIPLE_CONSTRAINT"];

export type TcAssignment = number | typeof NoTripleConstraint;

export interface ValidatorRegexEngine {
  match(
    db: ShExUtil.NeighborhoodDb,
    point: string | object,
    constraintList: ShExJ.TripleConstraint[],
    tc2t: Tc2t[][],
    t2tcForThisShape: TcAssignment[][],
    neighborhood: RdfJs.Quad[] | null,
    semActHandler: ShExUtil.SemActHandler,
    trace: object[]
  ): object;
}

