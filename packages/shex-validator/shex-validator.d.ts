import * as ShExJ from 'shexj';
import * as ShExUtil from '@shexjs/util';

export const options: {
    coverage: {
        exhaustive: string;
        firstError: string;
    };
};

export const start: {
    term: string;
};

export interface ShapeMapEntry {
    node: string;
    shape: string;
}

export type ShapeMap = ShapeMapEntry[];

export interface ValidationResult {
  errors?: any[]; // need to model http://github.com/shexSpec/shexTest/blob/doc/ShExV.jsg the same way ShExJ was modeled
}

export interface Validator {
  validate (point: string, label: string, tracker?: ShExUtil.QueryTracker, seen?: object): ValidationResult;
  validate (smap: ShapeMap, tracker?: ShExUtil.QueryTracker, seen?: object): ValidationResult;
}

export function construct(schema: ShExJ.Schema, db: any, options: object): Validator;


