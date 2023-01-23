/**
 * An attempt to capture types emitted when constructing a validation proof
 *
 * This is currently in root of @shexjs/term to signal that there's no build
 * product (which would erroneously fire make).
 */

import * as ShExJ from '@types/shexj';
import {BNODE} from "@types/shexj";
export {};

export type shapeExprTest = ShapeOrResults | ShapeAndResults | ShapeNotResults | ShapeTest | NodeTest | NodeConstraintTest | SolutionList | Failure | FailureList | Recursion | AbstractShapeFailure;

export interface ShapeOrResults {
  type: "ShapeOrResults";
  solution:shapeExprTest
}
export interface ShapeAndResults {
  type: "ShapeAndResults";
  solutions:shapeExprTest[]; // 1 or more
}
export interface ShapeNotResults {
  type: "ShapeNotResults";
  solution:Failure
}
export interface Failure {
  type: "Failure";
  node:(IRI|BNODE);
  shape:(IRI|BNODE);
  errors:error[]; // 1 or more
}
export interface FailureList {
  type: "FailureList";
  errors:error[] // 1 or more
}
export type error = MissingProperty | TypeMismatch | Failure | TypedFailure;
export interface TypedFailure { }
export interface MissingProperty extends TypedFailure {
  type: "MissingProperty";
  property:IRI;
  valueExpr?:NodeConstraint
}
export interface ExcessTripleViolation extends TypedFailure {
  type: "ExcessTripleViolation";
  property:IRI;
  triple: Quad;
  valueExpr?:NodeConstraint
}
export interface TypeMismatch extends TypedFailure {
  type: "TypeMismatch";
  triple:TestedTriple;
  constraint:TripleConstraint;
  errors:STRING[];

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
    subject:(IRI|BNODE);
    predicate:IRI;
    object:(IRI|BNODE|ObjectLiteral);
  }[];
}

export interface NodeTest {
  type: "NodeTest";
  node:(IRI|BNODE|ObjectLiteral);
  shape:(IRI|BNODE);
  shapeExpr:shapeExpr
}
export interface ShapeTest {
  type: "ShapeTest";
  node:(IRI|BNODE);
  shape:(IRI|BNODE|START);
  solution?:tripleExprSolutions;
  startActs?:ShExJ.SemAct[]; // 1 or more
  annotations?:ShExJ.Annotation[] // 1 or more
}
export interface NodeConstraintTest {
  type: "NodeConstraintTest";
  node:(IRI|BNODE);
  shape:(IRI|BNODE|START);
  startActs?:ShExJ.SemAct[]; // 1 or more
  annotations?:ShExJ.Annotation[] // 1 or more
}
export interface SolutionList {
  type: "SolutionList";
  solutions:shapeExprTest[] // 1 or more
}
export type tripleExprSolutions = EachOfSolutions | OneOfSolutions | TripleConstraintSolutions ;
export type tripleExprSolution = EachOfSolution | OneOfSolution | TestedTriple ;
export interface EachOfSolutions {
  type: "EachOfSolutions";
  solutions:EachOfSolution[]; // 1 or more
  min?:INTEGER;
  max?:INTEGER;
  annotations?:ShExJ.Annotation[]; // 1 or more
  semActs?:ShExJ.SemAct[] // 1 or more
}
export interface EachOfSolution {
  type: "EachOfSolution";
  expressions:tripleExprSolutions[] // 1 or more
}
export interface OneOfSolutions {
  type: "OneOfSolutions";
  solutions:OneOfSolution[]; // 1 or more
  min?:INTEGER;
  max?:INTEGER;
  annotations?:ShExJ.Annotation[]; // 1 or more
  semActs?:ShExJ.SemAct[] // 1 or more
}
export interface OneOfSolution {
  type: "OneOfSolution";
  expressions:tripleExprSolutions[] // 1 or more
}
export interface TripleConstraintSolutions {
  productionLabel?:(IRI|BNODE);
  type: "TripleConstraintSolutions";
  predicate:IRI;
  valueExpr?:ShExJ.shapeExprOrRef;
  min?:INTEGER;
  max?:INTEGER;
  solutions:TestedTriple[];
  annotations?:ShExJ.Annotation[]; // 1 or more
  semActs?:ShExJ.SemAct[] // 1 or more
}
export interface TestedTriple {
  type: "TestedTriple";
  subject:(IRI|BNODE);
  predicate:IRI;
  object:(IRI|BNODE|ObjectLiteral);
  referenced?:(shapeExprTest|Recursion)
}
export interface Recursion {
  type: "Recursion";
  node:(IRI|BNODE);
  shape:(IRI|BNODE)
}
export interface AbstractShapeFailure {
  type: "AbstractShapeFailure";
  shape:(IRI|BNODE);
  errors:[error]
}
