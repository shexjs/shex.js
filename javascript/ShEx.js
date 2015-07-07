// Replace local require by a lazy loader
var globalRequire = require;
require = function () {};

// Expose submodules
var exports = module.exports = {
  Parser:       require('./lib/ShExParser'),
  Util:         require('./lib/ShExUtil'),
};

// Load submodules on first access
Object.keys(exports).forEach(function (submodule) {
  Object.defineProperty(exports, submodule, {
    configurable: true,
    enumerable: true,
    get: function () {
      delete exports[submodule];
      return exports[submodule] = globalRequire('./lib/ShEx' + submodule);
    },
  });
});
