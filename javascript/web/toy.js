/** @license MIT - Toy.js 0.4.3 (browser build) - © (well, stolen from) Ruben Verborgh */
(function (toy) {
(function () {

function ToyStore(triples, options) {
  if (!(this instanceof ToyStore))
    return new ToyStore(triples, options);

  this._foo = 45;
}

ToyStore.prototype = {
  // ## Public properties

  // ### `size` returns the number of triples in the store.
  get size() {
    // Return the triple count if if was cached.
    var size = this._size;
    if (size !== null)
      return size;

    // Calculate the number of triples by counting to the deepest level.
    var graphs = this._graphs, subjects, subject;
    for (var graphKey in graphs)
      for (var subjectKey in (subjects = graphs[graphKey].subjects))
        for (var predicateKey in (subject = subjects[subjectKey]))
          size += Object.keys(subject[predicateKey]).length;
    return this._size = size;
  },

  // ## Private methods

  // ### `_addToIndex` adds a triple to a three-layered index.
  play: function () {
    var writer = ShExWriter();
    writer.addShape({
      "type": "shape",
      "expression": {
        "type": "tripleConstraint",
        "predicate": "http://a.example/p1",
        "value": { "type": "valueClass" }
      },
      "semAct": { "http://a.example/semAct1": " code1 " }
    }, function (error, triple, prefixes) {
      if (triple)
	console.log(triple.subject, triple.predicate, triple.object, '.');
      else
	try {
	  console.dir(error);
	} catch (e) {
	  console.log("error: " + error, prefixes);
	}
    });
  },
};

// ## Exports

// Export the `ToyStore` class as a whole.

Toy.Store = ToyStore;

})();
})(typeof exports !== "undefined" ? exports : this.Toy = {});

