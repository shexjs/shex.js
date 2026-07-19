/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * See README for description.
 */

import * as symbols from "./ShapeMapSymbols";
import * as ParserModule from "./ShapeMapParser";

/* Write the parser object directly into the symbols so the caller shares a
 * symbol space with ShapeMapJison for e.g. start and focus.
 * (`export =`s the ShapeMapSymbols module object itself so mutations like
 * `require('shape-map').Start = ...` are seen by the generated parser.)
 */
const shapeMap = symbols as typeof symbols & { Parser: typeof ParserModule };
shapeMap.Parser = ParserModule;

export = shapeMap;
