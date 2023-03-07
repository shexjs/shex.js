const DefaultBase = location.origin + location.pathname;
const App = new ShExMapWorkerApp(DefaultBase, RemoteShExValidator);

// shexmap-simple - Simple ShEx2 validator for HTML.
// Copyright 2017 Eric Prud'hommeux
// Release under MIT License.


const SharedForTests = {Caches: App.Caches, /*DefaultBase*/} // an object to share state with a test harness

App.start();
