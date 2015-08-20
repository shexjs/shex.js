// **ShExResults** provides ShEx utility functions

// ## Constructor
function ShExResults(triples, options) {
  if (!(this instanceof ShExResults))
    return new ShExResults(triples, options);
}

// ShExResults.prototype = {
//   // ## Public properties
//   triples: function (graph) {
//     return [];
//   }
// };

// ## Exports

// Export the `ShExResults` class as a whole.
if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExResults; // node environment
else
  ShExResults = ShExResults;
