/**
 * An attempt to capture types emitted when constructing a validation proof
 *
 * This is currently in root of @shexjs/term to signal that there's no build
 * product (which would erroneously fire make).
 */

import * as ShExJ from "@types/shexj";
import {Start} from "@shexjs/neighborhood-api";
export {};

export type shapeExprTest = ShapeOrResults | ShapeAndResults | ShapeNotResults
  | ShapeTest | NodeTest | NodeConstraintTest
  | SolutionList
  | Failure | error | FailureList
  | Recursion | AbstractShapeFailure;

export type error = MissingProperty | TypeMismatch | Failure | TypedFailure;
export type groupSolutions = EachOfSolutions | OneOfSolutions;
export type tripleExprSolutions = groupSolutions | TripleConstraintSolutions;
export type groupSolution = EachOfSolution | OneOfSolution;
export type tripleExprSolution = groupSolution | TestedTriple;

export interface ShapeOrResults {
  type: "ShapeOrResults";
  solution: shapeExprTest
}
export interface ShapeAndResults {
  type: "ShapeAndResults";
  solutions: shapeExprTest[]; // 1 or more
}

export interface ShapeNotResults {
  type: "ShapeNotResults";
  solution: Failure
}

export interface Failure {
  type: "Failure";
  node: ShExJ.objectValue;
  shape: ShExJ.shapeDeclLabel | Start;
  errors: error[]; // 1 or more
}

export interface FailureList {
  type: "FailureList";
  errors: error[] // 1 or more
}

export interface TypedFailure { }

export interface MissingProperty extends TypedFailure {
  type: "MissingProperty";
  property: ShExJ.IRI;
  valueExpr?: ShExJ.shapeExprOrRef
}

export interface ExcessTripleViolation extends TypedFailure {
  type: "ExcessTripleViolation";
  property: ShExJ.IRI;
  triple: Quad;
  valueExpr?: ShExJ.shapeExprOrRef
}

export interface TypeMismatch extends TypedFailure {
  type: "TypeMismatch";
  triple: TestedTriple;
  constraint: ShExJ.TripleConstraint;
  errors: STRING[];

}

export interface NodeConstraintViolation extends TypedFailure {
  type: "NodeConstraintViolation";
  errors: error[];
}

export interface SemActFailure extends TypedFailure {
  type: "SemActFailure";
  errors: error[];
}

export interface ShapeOrFailure extends TypedFailure {
  type: "ShapeOrFailure";
  errors: error[];
}

export interface ShapeAndFailure extends TypedFailure {
  type: "ShapeAndFailure";
  errors: error[];
}

export interface ShapeNotFailure extends TypedFailure {
  type: "ShapeNotFailure";
  errors: error[];
}

export interface ClosedShapeViolation extends TypedFailure {
  type: "ClosedShapeViolation";
  unexpectedTriples: {
    subject: ShExJ.shapeDeclLabel;
    predicate: ShExJ.IRI;
    object: ShExJ.objectValue;
  }[];
}

export interface NodeTest {
  type: "NodeTest";
  node: ShExJ.objectValue;
  shape: ShExJ.shapeDeclLabel;
  shapeExpr: ShExJ.shapeExpr
}

export interface ShapeTest {
  type: "ShapeTest";
  node: ShExJ.objectValue;
  shape: ShExJ.shapeDeclLabel | Start;
  solution?: tripleExprSolutions;
  startActs?: ShExJ.SemAct[]; // 1 or more
  annotations?: ShExJ.Annotation[] // 1 or more
}

export interface NodeConstraintTest {
  type: "NodeConstraintTest";
  node: ShExJ.objectValue;
  shape: ShExJ.shapeDeclLabel | Start;
  startActs?: ShExJ.SemAct[]; // 1 or more
  annotations?: ShExJ.Annotation[] // 1 or more
}

export interface SolutionList {
  type: "SolutionList";
  solutions: shapeExprTest[] // 1 or more
}

export interface EachOfSolutions {
  type: "EachOfSolutions";
  solutions: EachOfSolution[]; // 1 or more
  min?: ShExJ.INTEGER;
  max?: ShExJ.INTEGER;
  annotations?: ShExJ.Annotation[]; // 1 or more
  semActs?: ShExJ.SemAct[] // 1 or more
}

export interface EachOfSolution {
  type: "EachOfSolution";
  expressions: groupSolutions[] // 1 or more
}

export interface OneOfSolutions {
  type: "OneOfSolutions";
  solutions: OneOfSolution[]; // 1 or more
  min?: ShExJ.INTEGER;
  max?: ShExJ.INTEGER;
  annotations?: ShExJ.Annotation[]; // 1 or more
  semActs?: ShExJ.SemAct[] // 1 or more
}

export interface OneOfSolution {
  type: "OneOfSolution";
  expressions: groupSolutions[] // 1 or more
}

export interface TripleConstraintSolutions {
  productionLabel?: ShExJ.shapeDeclLabel;
  type: "TripleConstraintSolutions";
  predicate: ShExJ.IRI;
  valueExpr?: ShExJ.shapeExprOrRef;
  min?: ShExJ.INTEGER;
  max?: ShExJ.INTEGER;
  solutions: TestedTriple[];
  annotations?: ShExJ.Annotation[]; // 1 or more
  semActs?: ShExJ.SemAct[] // 1 or more
}

export interface TestedTriple {
  type: "TestedTriple";
  subject: ShExJ.shapeDeclLabel;
  predicate: ShExJ.IRI;
  object: ShExJ.objectValue;
  referenced?: (shapeExprTest|Recursion)
}

export interface Recursion {
  type: "Recursion";
  node: ShExJ.objectValue;
  shape: ShExJ.shapeDeclLabel
}

export interface AbstractShapeFailure {
  type: "AbstractShapeFailure";
  shape: ShExJ.shapeDeclLabel;
  errors: [error]
}
