"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.n3idQuad2RdfJs = n3idQuad2RdfJs;
exports.n3idTerm2RdfJs = n3idTerm2RdfJs;
const rdf_data_factory_1 = require("rdf-data-factory");
const RdfJsFactory = new rdf_data_factory_1.DataFactory();
/**
 * Map an N3id quad to an RdfJs quad
 * @param s subject
 * @param p predicate
 * @param o object
 * @param g graph
 * @returns RdfJs quad
 */
function n3idQuad2RdfJs(s, p, o, g) {
    const graph = g ? n3idTerm2RdfJs(g) : RdfJsFactory.defaultGraph();
    return RdfJsFactory.quad(
    // there probably some elegant way to do this without lots of casting
    n3idTerm2RdfJs(s), n3idTerm2RdfJs(p), n3idTerm2RdfJs(o), graph);
}
/**
 * Map an N3id term to an RdfJs Term.
 * @param term N3Id term
 * @returns RdfJs Term
 */
function n3idTerm2RdfJs(term) {
    if (term[0] === "_" && term[1] === ":")
        return RdfJsFactory.blankNode(term.substr(2));
    if (term[0] === "\"" || term[0] === "'") {
        const closeQuote = term.lastIndexOf(term[0]);
        if (closeQuote === -1)
            throw new Error(`no close ${term[0]}: ${term}`);
        const value = term.substr(1, closeQuote - 1).replace(/\\"/g, '"');
        const langOrDt = term.length === closeQuote + 1
            ? undefined
            : term[closeQuote + 1] === "@"
                ? term.substr(closeQuote + 2)
                : parseDt(closeQuote + 1);
        return RdfJsFactory.literal(value, langOrDt);
    }
    return RdfJsFactory.namedNode(term);
    function parseDt(from) {
        if (term[from] !== "^" || term[from + 1] !== "^")
            throw new Error(`garbage after closing \": ${term}`);
        return RdfJsFactory.namedNode(term.substr(from + 2));
    }
}
//# sourceMappingURL=stringToRdfJs.js.map