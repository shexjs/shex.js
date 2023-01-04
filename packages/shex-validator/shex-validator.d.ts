import {Schema} as ShExJ from 'shexj';
import {QueryTracker} from '@shexjs/validator-api';

export const options: {
    coverage: {
        exhaustive: string;
        firstError: string;
    };
};

export const start: {
    term: string;
};

export interface ValidationResult {
  errors?: any[]; // need to model http://github.com/shexSpec/shexTest/blob/doc/ShExV.jsg the same way ShExJ was modeled
}

export interface Validator {
  validate (point: string, label: string, tracker?: QueryTracker, seen?: object): ValidationResult;
  validate (smap: ShapeMap, tracker?: QueryTracker, seen?: object): ValidationResult;
}

export function construct(schema: Schema, db: ValidatorNeighborhood, options: object): Validator;


