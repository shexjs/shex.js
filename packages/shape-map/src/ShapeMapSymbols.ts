/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * Status: Early implementation
 *
 * TODO:
 *   testing.
 */

import {Start as TermStart} from "@shexjs/term";

export interface ShapeMapSymbol { term: string }

/* `let` (not `const`) so these compile to plain writable exports, which the
 * generated ShapeMapJison parser reads when it runs.  `Start` is
 * @shexjs/term's, the one object the validator and the data sources
 * compare against too; callers used to assign `ShapeMap.Start =
 * ShExValidator.Start` to make that so, and may still, harmlessly. */
export let Focus: ShapeMapSymbol = { term: "FOCUS" };
export let Start: ShapeMapSymbol = TermStart;
export let Wildcard: ShapeMapSymbol = { term: "WILDCARD" };
