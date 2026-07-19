/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * Status: Early implementation
 *
 * TODO:
 *   testing.
 */

export interface ShapeMapSymbol { term: string }

/* `let` (not `const`) so these compile to plain writable exports: callers like
 * the webapps and Map-test assign e.g. `ShapeMap.Start = ShExValidator.Start`
 * onto this module so the generated ShapeMapJison parser shares their symbols.
 */
export let Focus: ShapeMapSymbol = { term: "FOCUS" };
export let Start: ShapeMapSymbol = { term: "START" };
export let Wildcard: ShapeMapSymbol = { term: "WILDCARD" };
