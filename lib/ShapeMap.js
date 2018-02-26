/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * Status: Early implementation
 *
 * TODO:
 *   testing.
 */

var ShapeMap = (function () {
  var Focus = { term: "FOCUS" }
  var Wildcard = { term: "WILDCARD" }
  return {
    focus: Focus,
    wildcard: Wildcard,
  };
})();

// Export the `ShExValidator` class as a whole.
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShapeMap;
