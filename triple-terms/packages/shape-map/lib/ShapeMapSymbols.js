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
const term_1 = require("@shexjs/term");
/* `let` (not `const`) so these compile to plain writable exports, which the
 * generated ShapeMapJison parser reads when it runs.  `Start` is
 * @shexjs/term's, the one object the validator and the data sources
 * compare against too; callers used to assign `ShapeMap.Start =
 * ShExValidator.Start` to make that so, and may still, harmlessly. */
exports.Focus = { term: "FOCUS" };
exports.Start = term_1.Start;
exports.Wildcard = { term: "WILDCARD" };
//# sourceMappingURL=ShapeMapSymbols.js.map