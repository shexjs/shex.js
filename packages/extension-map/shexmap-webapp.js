ShExWebApp = (function () {
  let shapeMap = require("shape-map")
  return Object.assign({}, {
    ShExTerm:       require('@shexjs/term'),
    Util:           require('@shexjs/util'),
    Validator:      require('@shexjs/validator'),
    Writer:         require('@shexjs/writer'),
    Api:            require("@shexjs/api"),
    Parser:         require("@shexjs/parser"),
    ShapeMap:       shapeMap,
    ShapeMapParser: shapeMap.Parser,

    Map:         require("@shexjs/extension-map"),
    // <script src="../lib/extension-utils.js"                      ></script><script>modules["./extension-utils"] = modules["./lib/extension-utils"] = module.exports;</script>
    // <script src="../lib/regex_extension.js"                      ></script><script>modules["./regex_extension"] = modules["./lib/regex_extension"] = module.exports;</script>
    // <script src="../lib/hashmap_extension.js"                    ></script><script>modules["./lib/hashmap_extension"] = modules["./hashmap_extension"] = module.exports;</script>
    // <script src="../lib/extensions.js"                           ></script><script>modules["./lib/extensions"] = modules["./lib/extensions"] = module.exports;</script>
    // <script src="../lib/eval-simple-1err-materializer.js"        ></script><script>modules["../lib/regex/nfax-val-1err-materializer"] = module.exports;</script>

    // <script src="../shex-extension-map.js"                       ></script><script>modules["../shex-extension-map"] = module.exports;</script>
    // <script src="../lib/ShExMaterializer.js"                     ></script><script>ShExMaterializer = module.exports;</script>
  })
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWebApp;
