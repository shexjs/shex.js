"use strict";
/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * Status: Early implementation
 *
 * TODO:
 *   testing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wildcard = exports.Start = exports.Focus = void 0;
/* `let` (not `const`) so these compile to plain writable exports: callers like
 * the webapps and Map-test assign e.g. `ShapeMap.Start = ShExValidator.Start`
 * onto this module so the generated ShapeMapJison parser shares their symbols.
 */
exports.Focus = { term: "FOCUS" };
exports.Start = { term: "START" };
exports.Wildcard = { term: "WILDCARD" };
//# sourceMappingURL=ShapeMapSymbols.js.map