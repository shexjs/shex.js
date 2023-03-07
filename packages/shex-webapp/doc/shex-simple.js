const DefaultBase = location.origin + location.pathname;
const App = new ShExSimpleApp(DefaultBase, DirectShExValidator);

// shex-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.


const SharedForTests = {Caches: App.Caches, /*DefaultBase*/} // an object to share state with a test harness

function lexifyFirstColumn999 (row) { // !!not used
  return App.Caches.inputData.meta.termToLex(row[0]); // row[0] is the first column.
}

App.start();
