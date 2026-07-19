"use strict";
/** shex - meta-package aggregating the @shexjs/* packages.
 *
 * Everything here is also available as an individual package (e.g.
 * require("@shexjs/parser")); this index just saves node users from
 * managing a dozen dependencies:
 *
 *   const ShEx = require("shex");
 *   const schema = ShEx.Parser.construct(base).parse(shexc);
 *   const validator = new ShEx.Validator.ShExValidator(schema, ShEx.RdfJsDb(graph));
 */
module.exports = {
    Parser: require("@shexjs/parser"), // .construct(base, prefixes, opts).parse(shexc)
    Writer: require("@shexjs/writer"), // serialize ShExJ as ShExC
    Validator: require("@shexjs/validator"), // {ShExValidator, ...}
    RdfJsDb: require("@shexjs/neighborhood-rdfjs").ctor, // wrap an RDF/JS store for validation
    Loader: require("@shexjs/loader"), // ({fetch, rdfjs}) => schema/data loader
    NodeLoader: require("@shexjs/node"), // Loader plus file: URL support
    Term: require("@shexjs/term"), // RDF term utilities
    Util: require("@shexjs/util"), // schema/results transformations
    Visitor: require("@shexjs/visitor"), // schema visitor pattern
    ShapeMap: require("shape-map"), // ShapeMap parser
};
//# sourceMappingURL=shex.js.map