const DefaultBase = location.origin + location.pathname;
const App = new ShExSimpleApp(DefaultBase, DirectShExValidator);
const SharedForTests = {Caches: App.Caches, /*DefaultBase*/} // an object to share state with a test harness
App.start();
