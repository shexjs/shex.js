"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paneEditor = exports.dbParams = exports.ctor = exports.description = exports.label = exports.name = void 0;
exports.rdfjsDB = rdfjsDB;
exports.documentTitle = documentTitle;
exports.fromParams = fromParams;
const neighborhood_api_1 = require("@shexjs/neighborhood-api");
function rdfjsDB(db, queryTracker) {
    function getNeighborhood(point, shapeLabel, _shape) {
        // I'm guessing a local DB doesn't benefit from shape optimization.
        let startTime = null;
        let token = null;
        if (queryTracker) {
            startTime = new Date();
            token = queryTracker.start(false, point, shapeLabel);
        }
        const outgoing = [...db.match(point, null, null, null)].sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
        if (queryTracker) {
            const time = new Date();
            queryTracker.end(outgoing, time.valueOf() - startTime.valueOf(), token);
            startTime = time;
            token = queryTracker.start(true, point, shapeLabel);
        }
        const incoming = [...db.match(null, null, point, null)].sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
        if (queryTracker) {
            queryTracker.end(incoming, new Date().valueOf() - startTime.valueOf(), token);
        }
        return {
            outgoing: outgoing,
            incoming: incoming
        };
    }
    return {
        getNeighborhood: getNeighborhood,
        getSubjects: () => db.getSubjects(),
        getPredicates: () => db.getPredicates(),
        getObjects: () => db.getObjects(),
        getQuads: (...args) => db.getQuads(...args),
        get size() { return db.size; },
    };
}
exports.name = "neighborhood-rdfjs";
exports.label = "Turtle";
exports.description = "Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset";
exports.ctor = rdfjsDB;
/** What it takes to construct this DB, declared for hosts that offer several
 * neighborhood implementations (STRAWMAN, see @shexjs/neighborhood-api).
 * "A list of filenames paired with media types" is declared as one
 * array-of-files parameter per media type -- contentMediaType is the
 * pairing.  Fetching and parsing them is the host's business (it's async
 * and needs parsers this module doesn't ship), so `fromParams` takes the
 * store the host built rather than the file lists. */
/** What to call a document in a tab.  A leading comment is the writer
 * saying what this file is, which beats anything a parser could work out;
 * failing that, the first subject names it, since a document usually is
 * about the thing it starts by describing.  Neither is a parse: a tab has
 * to have a name while the document is still half-typed. */
function documentTitle(text) {
    const lines = text.split("\n");
    for (const line of lines) {
        const bare = line.trim();
        if (bare === "")
            continue;
        if (bare.startsWith("#")) // the writer's own name for it
            return bare.replace(/^#+\s*/, "").substring(0, 24) || null;
        if (/^(@?(prefix|base)\b|PREFIX\b|BASE\b)/i.test(bare))
            continue; // directives name the document's words, not it
        const subject = bare.match(/^(?:<([^>]*)>|((?:[A-Za-z][\w.-]*)?:[^\s;,.]*))/);
        if (subject) {
            const iri = subject[1] || subject[2];
            const local = iri.split(/[#/]/).pop() || iri;
            return (local.startsWith(":") ? local.substring(1) : local).substring(0, 24) || null;
        }
        return null;
    }
    return null;
}
exports.dbParams = [
    { name: "data", selector: true, required: true,
        description: "Turtle data",
        schema: { type: "array", items: { type: "string", format: "uri", contentMediaType: "text/turtle" } },
        // One graph, but not necessarily one document: a patient in one file
        // and an observation about them in another are still one graph, and
        // keeping them apart is how they were written and how they are edited.
        // So a document can be opened, and each is named by the first thing it
        // says about itself.
        pane: { label: "Turtle", editor: { language: "turtle" }, min: 1, creatable: true,
            template: "# a document\nPREFIX : <http://a.example/>\n\n",
            titleOf: (text) => documentTitle(text) },
        cli: { option: "dataURL", alias: "d", typeLabel: "file|URL" } },
    { name: "jsonld",
        description: "JSON-LD data",
        schema: { type: "array", items: { type: "string", format: "uri", contentMediaType: "application/ld+json" } },
        // named files for a host that can fetch and expand them, which so far
        // means the command line: nothing to type into a form, and no pane
        // (this data ends up in the same store the Turtle pane feeds)
        ui: { hidden: true },
        cli: { option: "jsonld", alias: "l", typeLabel: "file|URL" } },
];
function fromParams(params, queryTracker) {
    return rdfjsDB(params.store, queryTracker);
}
/* No claimPaneText: nothing about a document says it wants to be parsed
 * rather than queried, and a host that used to guess from the text now
 * asks (or defaults to this module, an RDF document being what a data pane
 * has always held). */
/** This module has a whole RDF document to edit, so it names the language
 * the host already implements rather than describing one. */
exports.paneEditor = { language: "turtle" };
//# sourceMappingURL=neighborhood-rdfjs.js.map