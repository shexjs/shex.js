"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ctor = exports.description = exports.name = void 0;
exports.rdfjsDB = rdfjsDB;
const neighborhood_api_1 = require("@shexjs/neighborhood-api");
function rdfjsDB(db, queryTracker) {
    function getNeighborhood(point, shapeLabel, _shape) {
        // I'm guessing a local DB doesn't benefit from shape optimization.
        let startTime = null;
        if (queryTracker) {
            startTime = new Date();
            queryTracker.start(false, point, shapeLabel);
        }
        const outgoing = [...db.match(point, null, null, null)].sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
        if (queryTracker) {
            const time = new Date();
            queryTracker.end(outgoing, time.valueOf() - startTime.valueOf());
            startTime = time;
        }
        if (queryTracker) {
            queryTracker.start(true, point, shapeLabel);
        }
        const incoming = [...db.match(null, null, point, null)].sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
        if (queryTracker) {
            queryTracker.end(incoming, new Date().valueOf() - startTime.valueOf());
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
exports.description = "Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset";
exports.ctor = rdfjsDB;
//# sourceMappingURL=neighborhood-rdfjs.js.map