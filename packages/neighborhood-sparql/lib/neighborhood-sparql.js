"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbParams = exports.ctor = exports.description = exports.name = exports.BNodeIdentityError = void 0;
exports.sparqlDB = sparqlDB;
exports.fromParams = fromParams;
const neighborhood_api_1 = require("@shexjs/neighborhood-api");
const ShExUtil = __importStar(require("@shexjs/util"));
const visitor_1 = require("@shexjs/visitor");
const N3 = __importStar(require("n3")); // TODO: set global externally
/** Thrown when a blank node can't be pinned down by an anchored description. */
class BNodeIdentityError extends Error {
    constructor(message, query) {
        super(message + (query ? `\n\nquery was:\n${query}` : ""));
        this.query = query;
        this.name = "BNodeIdentityError";
    }
}
exports.BNodeIdentityError = BNodeIdentityError;
const DataFactory = N3.DataFactory;
const XsdString = "http://www.w3.org/2001/XMLSchema#string";
function sparqlDB(endpoint, queryTracker, options = {}) {
    // Need to inspect the schema to calculate the relevant neighborhood.
    let schemaIndex = null;
    const startDepth = options.bnodeDepth === undefined ? 4 : options.bnodeDepth;
    const maxDepth = options.maxBnodeDepth === undefined ? 64 : options.maxBnodeDepth;
    const verify = options.verifyBnodeDescriptions !== false;
    const execute = options.executeQuery ||
        ((q, ep, df) => ShExUtil.executeQuery(q, ep, df));
    const queryCache = options.cacheQueries === false ? null : new Map();
    const runQuery = (query) => {
        if (queryCache === null)
            return execute(query, endpoint, DataFactory);
        let rows = queryCache.get(query);
        if (rows === undefined) {
            rows = execute(query, endpoint, DataFactory);
            queryCache.set(query, rows);
        }
        return rows;
    };
    /** Every blank node this DB has handed out, by its internal label. */
    const described = new Map();
    let nextLabel = 0;
    // ── term serialization ─────────────────────────────────────────────────────
    const LITERAL_ESCAPES = {
        "\\": "\\\\", '"': '\\"', "\n": "\\n", "\r": "\\r",
        "\t": "\\t", "\b": "\\b", "\f": "\\f",
    };
    /** SPARQL's ECHAR covers seven characters; everything else below U+0020 has
     * to go in as \uXXXX or the query won't parse. */
    function escapeLiteral(text) {
        // eslint-disable-next-line no-control-regex
        return text.replace(/[\\"\u0000-\u001F\u007F]/g, c => LITERAL_ESCAPES[c] || "\\u" + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0"));
    }
    function turtlifyRdfJs(term) {
        switch (term.termType) {
            case "NamedNode": return "<" + term.value + ">";
            case "Literal": {
                const lit = term;
                const lex = '"' + escapeLiteral(lit.value) + '"';
                return lit.language
                    ? lex + "@" + lit.language
                    : lit.datatype && lit.datatype.value !== XsdString
                        ? lex + "^^<" + lit.datatype.value + ">"
                        : lex;
            }
            case "BlankNode": throw new BNodeIdentityError(`refusing to write _:${term.value} into a query: a blank node label from one ` +
                `result set means nothing in the next request`);
            default: throw Error(`unrecognized termType ${term.termType} in ${term.value}`);
        }
    }
    /** Terms handed in by the validator come from a different RDF/JS factory
     * than the one building quads here; N3's quads want N3's terms. */
    function asN3Term(term) {
        switch (term.termType) {
            case "NamedNode": return DataFactory.namedNode(term.value);
            case "BlankNode": return DataFactory.blankNode(term.value);
            case "Literal": {
                const lit = term;
                return DataFactory.literal(lit.value, lit.language || DataFactory.namedNode(lit.datatype.value));
            }
            default: return term;
        }
    }
    /** Identity of a term *within one result set*, where blank labels do mean something. */
    function rowKey(term) {
        return term.termType === "BlankNode" ? "_:" + term.value : turtlifyRdfJs(term);
    }
    /** Descriptions are stored with placeholder variables `?_0_`, `?_1_`, ...;
     * instantiating renames them under a prefix that can't collide with the
     * variables of whatever query they're embedded in. */
    function instantiate(text, prefix) {
        return text.replace(/\?_(\d+)_/g, (_, n) => "?" + prefix + n);
    }
    const V = (i) => `?_${i}_`;
    /** "`v` is not this term", written so that it can neither raise a type error
     * nor need an operator a store might not have.
     *
     * `?v != "ab"^^ex:dt1` is a type error when ?v is a literal of some other
     * unknown datatype -- and an error inside NOT EXISTS quietly drops the row
     * that should have ruled the match out.  `sameTerm` says what's meant, but
     * QLever doesn't implement it.  Comparing kind, lexical form, language and
     * datatype separately works everywhere: SPARQL's `&&` yields false rather
     * than an error as soon as one conjunct is false, so the isIRI/isLiteral
     * guard makes the rest safe. */
    function differsFromTerm(v, term) {
        if (term.termType === "NamedNode")
            return `!(isIRI(${v}) && str(${v}) = "${escapeLiteral(term.value)}")`;
        const lit = term;
        const same = [`isLiteral(${v})`, `str(${v}) = "${escapeLiteral(lit.value)}"`];
        if (lit.language)
            same.push(`lang(${v}) = "${escapeLiteral(lit.language)}"`);
        else
            same.push(`lang(${v}) = ""`, `datatype(${v}) = <${lit.datatype ? lit.datatype.value : XsdString}>`);
        return `!(${same.join(" && ")})`;
    }
    function differsFromIri(v, iri) {
        return `!(isIRI(${v}) && str(${v}) = "${escapeLiteral(iri)}")`;
    }
    // ── which arcs does this shape care about? ──────────────────────────────────
    /** Predicates the shape needs to see, and whether it looks at arcs coming in.
     *
     * A shape's own triple expression is only part of the answer: EXTENDS pulls
     * in the constraints of everything it extends, and the validator will look
     * for those triples in the neighborhood this returns.  Fetch too few and the
     * extended shape reports a missing property that is sitting right there.
     */
    function requiredArcs(shape) {
        const out = [];
        let anyInverse = false;
        const seenShapeExprs = new Set();
        const seenTripleExprs = new Set();
        visitShape(shape);
        return { out, anyInverse };
        function visitShape(s) {
            if (s.expression)
                visitTripleExpr(s.expression);
            (s.extends || []).forEach(visitShapeExpr);
        }
        function visitShapeExpr(se) {
            if (typeof se === "string") {
                if (seenShapeExprs.has(se))
                    return; // inheritance can be recursive
                seenShapeExprs.add(se);
                const decl = schemaIndex ? schemaIndex.shapeExprs[se] : undefined;
                if (decl)
                    visitShapeExpr(decl);
                return;
            }
            if (se.type === "ShapeDecl") {
                visitShapeExpr(se.shapeExpr);
                (se.restricts || []).forEach(visitShapeExpr);
                return;
            }
            switch (se.type) {
                case "Shape":
                    visitShape(se);
                    break;
                case "ShapeAnd":
                case "ShapeOr":
                    se.shapeExprs.forEach(visitShapeExpr);
                    break;
                case "ShapeNot":
                    visitShapeExpr(se.shapeExpr);
                    break;
                default: break; // NodeConstraint, ShapeExternal
            }
        }
        function visitTripleExpr(te) {
            if (typeof te === "string") {
                if (seenTripleExprs.has(te))
                    return; // inclusions can be recursive
                seenTripleExprs.add(te);
                const found = schemaIndex ? schemaIndex.tripleExprs[te] : undefined;
                if (found)
                    visitTripleExpr(found);
                return;
            }
            switch (te.type) {
                case "TripleConstraint":
                    if (te.inverse)
                        anyInverse = true;
                    else if (out.indexOf(te.predicate) === -1)
                        out.push(te.predicate);
                    break;
                case "EachOf":
                case "OneOf":
                    te.expressions.forEach(visitTripleExpr);
                    break;
                default: break;
            }
        }
    }
    // ── descriptions ──────────────────────────────────────────────────────────
    /** How to reach a focus node: a stored description for a blank node, a BIND
     * for anything ground. */
    function descriptionOf(point) {
        if (point.termType === "BlankNode") {
            const known = described.get(point.value);
            if (!known)
                throw new BNodeIdentityError(`_:${point.value} didn't come from this endpoint, so there's no way to ask ` +
                    `about it. SPARQL has no told bnodes: only blank nodes reached by ` +
                    `traversal from a ground node can be a focus.`);
            return known;
        }
        return {
            label: "", text: "", nVars: 0, target: -1, ground: turtlifyRdfJs(point),
            varLabel: [], truncated: false, matches: 1, outgoing: null,
        };
    }
    /** Pattern lines and variables of a description under construction. */
    class Builder {
        constructor(base) {
            this.base = base;
            this.lines = [];
            this.truncated = false;
            /** result-set label -> variable already bound to it */
            this.labelToVar = new Map();
            /** result-set label -> this DB's label for that node */
            this.labelToInternal = new Map();
            this.fresh = [];
            this.nVars = base.nVars;
            this.varLabel = base.varLabel.slice();
        }
        newVar() {
            this.varLabel[this.nVars] = null;
            return this.nVars++;
        }
        /** How to write variable `v` in a pattern: the anchor's own term if it's
         * ground, otherwise the placeholder variable. */
        ref(v) {
            return v < 0 ? this.base.ground : V(v);
        }
        text() { return this.base.text + this.lines.join(""); }
    }
    /** Objects of one predicate, split by what we can say about them.
     *
     * Blank nodes are ordered by what they look like rather than by the label
     * this result set happens to have given them, so that the handles this DB
     * mints come out the same however the endpoint scrambles its labels. */
    function partitionObjects(objs, bySubject) {
        const blanks = objs.filter(o => o.termType === "BlankNode").map(rowKey);
        const key = new Map(blanks.map(bl => [bl, contentKey(bl, bySubject)]));
        return {
            ground: objs.filter(o => o.termType !== "BlankNode")
                .sort((l, r) => turtlifyRdfJs(l).localeCompare(turtlifyRdfJs(r))),
            blanks: blanks.sort((l, r) => key.get(l).localeCompare(key.get(r)) || l.localeCompare(r)),
        };
    }
    /** A label-independent fingerprint of a blank node's arcs. */
    function contentKey(label, bySubject) {
        return (bySubject.get(label) || []).map(t => `${t.p} ${t.o.termType === "BlankNode" ? "[]" : turtlifyRdfJs(t.o)}`).sort().join(" ");
    }
    function dedupeTerms(terms) {
        const seen = new Set();
        return terms.filter(t => {
            const k = rowKey(t);
            if (seen.has(k))
                return false;
            seen.add(k);
            return true;
        });
    }
    /** Constrain `v` to have exactly `ground` + `refs` as its objects of `p`.
     *
     * The distinctness filters are what make "two blank children" different from
     * "one blank child mentioned twice", so a node's child count is part of its
     * description rather than a lower bound on it. */
    function emitArcs(b, v, p, ground, refs) {
        const self = b.ref(v);
        for (const g of ground)
            b.lines.push(`  ${self} <${p}> ${turtlifyRdfJs(g)} .\n`);
        // Two blank objects are two nodes: without this a node with one child would
        // satisfy a description of a node with two.
        for (let i = 0; i < refs.length; ++i)
            for (let j = i + 1; j < refs.length; ++j)
                b.lines.push(`  FILTER (${V(refs[i])} != ${V(refs[j])})\n`);
        const x = b.newVar();
        const others = ground.map(g => differsFromTerm(V(x), g))
            .concat(refs.map(r => `${V(x)} != ${V(r)}`));
        // MINUS rather than FILTER NOT EXISTS -- same meaning here, since every
        // variable the exclusion depends on is (re)stated inside the group, so the
        // domains always overlap.  Engines plan MINUS like any other binary join;
        // QLever re-plans a NOT EXISTS argument once per candidate subplan, which
        // costs ~4x memory per clause (see the neighborhood-sparql README).
        const correlate = refs.map(r => ` ${self} <${p}> ${V(r)} .`).join("");
        b.lines.push(`  MINUS { ${self} <${p}> ${V(x)} .${correlate}` +
            (others.length ? ` FILTER (${others.join(" && ")})` : "") +
            ` }\n`);
    }
    /** Describe `key`'s outgoing arcs exactly, onto variable `v`.
     *
     * Returns a canonical signature of the subtree: siblings with equal
     * signatures are the ones no anchored pattern could tell apart.
     */
    function describeNode(b, v, key, bySubject, depthLeft) {
        const triples = bySubject.get(key) || [];
        const byPred = new Map();
        for (const { p, o } of triples) {
            if (!byPred.has(p))
                byPred.set(p, []);
            byPred.get(p).push(o);
        }
        const preds = [...byPred.keys()].sort();
        const sig = [];
        for (const p of preds) {
            const { ground, blanks } = partitionObjects(dedupeTerms(byPred.get(p)), bySubject);
            const refs = [];
            const recurse = [];
            const corefs = [];
            for (const bl of blanks) {
                const prior = b.labelToVar.get(bl);
                if (prior !== undefined) {
                    // Somewhere already on the path: a co-reference, not a new node.
                    b.lines.push(`  ${V(v)} <${p}> ${V(prior)} .\n`);
                    refs.push(prior);
                    corefs.push("^" + prior);
                }
                else {
                    const nv = b.newVar();
                    b.labelToVar.set(bl, nv);
                    b.lines.push(`  ${V(v)} <${p}> ${V(nv)} .\n  FILTER (isBlank(${V(nv)}))\n`);
                    refs.push(nv);
                    recurse.push({ v: nv, key: bl, parent: v, arc: p, signature: "" });
                }
            }
            emitArcs(b, v, p, ground, refs);
            const kids = [];
            for (const kid of recurse) {
                kid.signature = depthLeft > 0
                    ? describeNode(b, kid.v, kid.key, bySubject, depthLeft - 1)
                    : ((b.truncated = true), "…");
                b.fresh.push(kid);
                kids.push(kid.signature);
            }
            sig.push(`${p} {${ground.map(turtlifyRdfJs).join(",")}} [${kids.sort().join("|")}] ` +
                `<${corefs.sort().join(",")}>`);
        }
        // ...and nothing else. Safe because level >= 1 of the component query
        // fetches every triple of every blank node it reaches.
        const xp = b.newVar(), xo = b.newVar();
        b.lines.push(`  MINUS { ${V(v)} ${V(xp)} ${V(xo)} .` +
            (preds.length ? ` FILTER (${preds.map(p => differsFromIri(V(xp), p)).join(" && ")})` : "") +
            ` }\n`);
        return "(" + sig.join(" ") + ")";
    }
    /** Turn a builder's nested variables into blank node handles.
     *
     * How many nodes a description matches is the size of its variable's orbit:
     * children with the same signature are interchangeable, and so is everything
     * hanging off an interchangeable parent.
     */
    function mintNested(b, rootMatches, internalOf) {
        const text = b.text();
        const groupOf = (f) => `${f.parent} ${f.arc} ${f.signature}`;
        const group = new Map();
        for (const f of b.fresh)
            group.set(groupOf(f), (group.get(groupOf(f)) || 0) + 1);
        const byVar = new Map();
        for (const f of b.fresh)
            byVar.set(f.v, f);
        const orbit = (v) => {
            const f = byVar.get(v);
            if (!f)
                return rootMatches; // the node this description is rooted at
            return orbit(f.parent) * group.get(groupOf(f));
        };
        const minted = [];
        for (const f of b.fresh) {
            const known = internalOf.get(f.key);
            if (known !== undefined) {
                // Another description already named this node; that one stays canonical
                // so the validator sees one node, not two.
                b.varLabel[f.v] = known;
                continue;
            }
            const label = "sq" + nextLabel++;
            internalOf.set(f.key, label);
            b.varLabel[f.v] = label;
            minted.push(describe(label, b, f.v, orbit(f.v), text));
        }
        return minted;
    }
    function describe(label, b, target, matches, text) {
        const desc = {
            label, text, nVars: b.nVars, target, varLabel: b.varLabel,
            truncated: b.truncated, matches, outgoing: null,
        };
        described.set(label, desc);
        return desc;
    }
    /** Have the endpoint confirm each new description picks out what it claims.
     *
     * This is the difference between a subtly wrong description showing up as an
     * error and showing up as a wrong validation result.
     */
    function verifyDescriptions(fresh) {
        if (!verify || fresh.length === 0)
            return;
        const branches = fresh.map((d, i) => `  {\n${instantiate(d.text, `v${i}_`)}` +
            `    BIND(${i} AS ?i)\n    BIND(?v${i}_${d.target} AS ?v)\n  }`);
        const query = `SELECT ?i (COUNT(DISTINCT ?v) AS ?n) WHERE {\n` +
            branches.join("\n  UNION\n") + `\n} GROUP BY ?i`;
        const counts = new Map();
        for (const row of runQuery(query))
            counts.set(parseInt(row[0].value, 10), parseInt(row[1].value, 10));
        for (let i = 0; i < fresh.length; ++i) {
            const got = counts.get(i) || 0;
            if (got !== fresh[i].matches)
                throw new BNodeIdentityError(`the description of _:${fresh[i].label} matches ${got} node(s) where ` +
                    `${fresh[i].matches} indistinguishable node(s) were expected` +
                    (got > fresh[i].matches
                        ? " -- it doesn't pin the node down"
                        : " -- it doesn't describe the node it came from"), instantiate(fresh[i].text, "v") + `# target ?v${fresh[i].target}\n`);
        }
    }
    // ── fetching ──────────────────────────────────────────────────────────────
    /** The focus's own arcs plus, level by level, the arcs of every blank node
     * reachable from it.  One result set, so its labels are mutually consistent
     * and co-references are visible. */
    function componentQuery(anchor, preds, depth, inverse) {
        const tgt = anchor.target < 0 ? anchor.ground : `?a${anchor.target}`;
        const values = (v) => preds ? `    VALUES ${v} { ${preds.map(p => `<${p}>`).join(" ")} }\n` : "";
        const branches = [];
        branches.push(inverse
            ? `  {\n    BIND(0 AS ?lvl)\n    ?s ?p ${tgt} .\n    BIND(${tgt} AS ?o)\n  }`
            : `  {\n    BIND(0 AS ?lvl)\n${values("?p")}    ${tgt} ?p ?o .\n    BIND(${tgt} AS ?s)\n  }`);
        for (let lvl = 1; lvl <= depth; ++lvl) {
            const steps = [`    BIND(${lvl} AS ?lvl)\n`];
            steps.push(inverse
                ? `    ?b0 ?q0 ${tgt} .\n    FILTER (isBlank(?b0))\n`
                : values("?q0") + `    ${tgt} ?q0 ?b0 .\n    FILTER (isBlank(?b0))\n`);
            for (let i = 1; i < lvl; ++i)
                steps.push(`    ?b${i - 1} ?q${i} ?b${i} .\n    FILTER (isBlank(?b${i}))\n`);
            steps.push(`    ?b${lvl - 1} ?p ?o .\n    BIND(?b${lvl - 1} AS ?s)\n`);
            branches.push(`  {\n${steps.join("")}  }`);
        }
        const anchorVars = Array.from({ length: anchor.nVars }, (_, i) => `?a${i} `).join("");
        return `SELECT ?lvl ?s ?p ?o ${anchorVars}WHERE {\n` +
            instantiate(anchor.text, "a") + branches.join("\n  UNION\n") + "\n}";
    }
    /** One component query, turned into quads plus handles for its blank nodes.
     *
     * Starts with a depth-0 probe -- most neighborhoods contain no blank nodes,
     * and a single-branch query is much cheaper to plan than the full UNION of
     * chains -- and only walks the blank-node component when the probe shows
     * blank nodes (the truncation retry below escalates the same way when a
     * description bottoms out). */
    function fetch(point, preds, inverse) {
        for (let depth = 0;; depth = depth === 0 ? (startDepth || 4) : Math.min(depth * 2, maxDepth)) {
            const anchor = descriptionOf(point);
            const query = componentQuery(anchor, preds, depth, inverse);
            const rows = runQuery(query);
            if (rows.length === 0)
                return [];
            // Rows are [lvl, s, p, o, a0, a1, ...]; the anchor columns repeat.
            const bySubject = new Map();
            const level0 = [];
            const seen = new Set();
            for (const row of rows) {
                const [lvl, s, p, o] = row;
                const key = `${rowKey(s)} <${p.value}> ${rowKey(o)}`;
                if (parseInt(lvl.value, 10) === 0 && !seen.has("0 " + key)) {
                    seen.add("0 " + key);
                    level0.push({ s, p: p.value, o });
                }
                if (seen.has(key))
                    continue;
                seen.add(key);
                if (!bySubject.has(rowKey(s)))
                    bySubject.set(rowKey(s), []);
                bySubject.get(rowKey(s)).push({ p: p.value, o });
            }
            // What the anchor already pinned down keeps its identity: this is how a
            // walk that comes back around a cycle recognizes where it has been.
            const anchorVar = new Map();
            const internalOf = new Map();
            for (let i = 0; i < anchor.nVars; ++i) {
                const term = rows[0][4 + i];
                if (!term || term.termType !== "BlankNode")
                    continue;
                anchorVar.set(rowKey(term), i);
                if (anchor.varLabel[i])
                    internalOf.set(rowKey(term), anchor.varLabel[i]);
            }
            // Name every blank node one arc from the focus before describing any of
            // them, so that a node reachable two ways gets one handle rather than a
            // handle plus a nested alias.
            const near = (t) => inverse ? t.s : t.o;
            const slots = [];
            const arcPreds = [...new Set(level0.filter(t => near(t).termType === "BlankNode")
                    .map(t => t.p))].sort();
            for (const p of arcPreds) {
                const { blanks } = partitionObjects(dedupeTerms(level0.filter(t => t.p === p).map(near)), bySubject);
                for (const key of blanks)
                    if (!anchorVar.has(key) && !internalOf.has(key)) {
                        internalOf.set(key, "sq" + nextLabel++);
                        slots.push({ p, key });
                    }
            }
            // Each gets its own description: anchor, the arc that reaches it, and an
            // exact account of what hangs off it.  Nothing about its siblings -- the
            // focus is already pinned, and describing k siblings together makes the
            // pattern's join factorial in k.
            const built = slots.map(({ p, key }) => {
                const b = new Builder(anchor);
                for (const [k, i] of anchorVar)
                    b.labelToVar.set(k, i);
                const v = b.newVar();
                b.labelToVar.set(key, v);
                const self = b.ref(anchor.target);
                b.lines.push((inverse ? `  ${V(v)} <${p}> ${self} .\n` : `  ${self} <${p}> ${V(v)} .\n`) +
                    `  FILTER (isBlank(${V(v)}))\n`);
                const signature = depth > 0
                    ? describeNode(b, v, key, bySubject, depth - 1)
                    : ((b.truncated = true), "\u2026");
                return { p: (inverse ? "^" : "") + p, key, b, v, signature };
            });
            if (built.some(c => c.b.truncated) && depth < maxDepth) {
                // A description that stopped early may not separate siblings; look further.
                nextLabel -= slots.length;
                continue;
            }
            // Interchangeable siblings share a signature, and a description matching
            // n of them is right n times over.
            const orbit = new Map();
            for (const c of built)
                orbit.set(c.p + " " + c.signature, (orbit.get(c.p + " " + c.signature) || 0) + 1);
            const fresh = [];
            for (const c of built) {
                const matches = anchor.matches * orbit.get(c.p + " " + c.signature);
                const text = c.b.text();
                c.b.varLabel[c.v] = internalOf.get(c.key);
                fresh.push(describe(internalOf.get(c.key), c.b, c.v, matches, text));
                fresh.push(...mintNested(c.b, matches, internalOf));
            }
            verifyDescriptions(fresh);
            // Describing a blank node walked all its arcs; remember them so stepping
            // into it needs no further query.
            const byInternal = new Map([...internalOf].map(([k, l]) => [l, k]));
            for (const d of fresh) {
                const key = byInternal.get(d.label);
                d.outgoing = key === undefined ? null : quadsOf(d.label, bySubject.get(key) || [], internalOf);
            }
            const self = asN3Term(point);
            return level0.map(t => DataFactory.quad((inverse ? toInternal(t.s, internalOf) : self), DataFactory.namedNode(t.p), (inverse ? self : toInternal(t.o, internalOf))))
                .sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
        }
    }
    function quadsOf(label, triples, internalOf) {
        const subject = DataFactory.blankNode(label);
        const out = [];
        for (const t of triples) {
            // A truncated description leaves nodes past the frontier unnamed; then
            // there's nothing to cache and the next step has to ask the endpoint.
            if (t.o.termType === "BlankNode" && !internalOf.has(rowKey(t.o)))
                return null;
            out.push(DataFactory.quad(subject, DataFactory.namedNode(t.p), toInternal(t.o, internalOf)));
        }
        return out.sort((l, r) => (0, neighborhood_api_1.sparqlOrder)(l.object, r.object));
    }
    /** Swap a result-set blank node for the handle this DB minted for it. */
    function toInternal(term, internalOf) {
        if (term.termType !== "BlankNode")
            return term;
        const label = internalOf.get(rowKey(term));
        if (!label)
            throw new BNodeIdentityError(`no description was built for the blank node returned as ${rowKey(term)}`);
        return DataFactory.blankNode(label);
    }
    // ── NeighborhoodDb ────────────────────────────────────────────────────────
    function getNeighborhood(point, shapeLabel, shape) {
        const arcs = requiredArcs(shape);
        const wantEverything = !!shape.closed || !!options.allOutgoing;
        const outPreds = wantEverything ? null : arcs.out;
        let startTime = Date.now();
        if (queryTracker)
            queryTracker.start(false, point, shapeLabel);
        const cached = cachedOutgoing(point, outPreds);
        const outgoing = (wantEverything || outPreds.length > 0)
            ? (cached !== null ? cached : fetch(point, outPreds, false))
            : [];
        if (queryTracker) {
            const now = Date.now();
            queryTracker.end(outgoing, now - startTime);
            startTime = now;
        }
        let incoming = [];
        if (arcs.anyInverse) {
            if (queryTracker)
                queryTracker.start(true, point, shapeLabel);
            incoming = fetch(point, null, true);
            if (queryTracker)
                queryTracker.end(incoming, Date.now() - startTime);
        }
        return { outgoing, incoming };
    }
    /** Describing a blank node already walked its arcs; don't ask twice. */
    function cachedOutgoing(point, preds) {
        if (point.termType !== "BlankNode")
            return null;
        const known = described.get(point.value);
        if (!known || known.outgoing === null)
            return null;
        return preds === null
            ? known.outgoing
            : known.outgoing.filter(q => preds.indexOf(q.predicate.value) !== -1);
    }
    function getQuads(s, p, o) {
        const spo = [["?s", s], ["?p", p], ["?o", o]];
        const selected = spo.filter(([, t]) => !t).map(([v]) => v);
        const where = spo.map(([v, t]) => t ? turtlifyRdfJs(t) : v).join(" ");
        const rows = runQuery(`SELECT ${selected.join(" ") || "*"} WHERE { ${where} }`);
        const pick = (v, given, row) => given ? given : row[selected.indexOf(v)];
        return rows.map(row => DataFactory.quad(asN3Term(pick("?s", s, row)), asN3Term(pick("?p", p, row)), asN3Term(pick("?o", o, row))));
    }
    return {
        getNeighborhood,
        getQuads,
        getSubjects: function () { return ["!Query DB can't index subjects"]; },
        getPredicates: function () { return ["!Query DB can't index predicates"]; },
        getObjects: function () { return ["!Query DB can't index objects"]; },
        get size() { return undefined; },
        setSchema: function (schema) { schemaIndex = schema._index || visitor_1.ShExIndexVisitor.index(schema); },
    };
}
exports.name = "neighborhood-sparql";
exports.description = "Implementation of @shexjs/neighborhood-api which gets data from a SPARQL endpoint";
exports.ctor = sparqlDB;
/** What it takes to construct this DB, declared for hosts (the CLI, the
 * WebApp) that offer several neighborhood implementations.  See the STRAWMAN
 * notes in @shexjs/neighborhood-api. */
exports.dbParams = [
    { name: "endpoint", selector: true, required: true,
        description: "data query endpoint",
        schema: { type: "string", format: "uri" },
        cli: { option: "endpoint", typeLabel: "IRI" } }, // the CLI's historical flag
    { name: "allOutgoing",
        description: "fetch every outgoing arc rather than only those the shape needs",
        schema: { type: "boolean" },
        cli: { option: "slurp-all" } }, // rides the CLI's existing flag
    { name: "bnodeDepth",
        description: "how optimistically to chase blank nodes when describing them (grown on demand)",
        schema: { type: "integer", default: 4 },
        cli: { option: "sparql-bnode-depth", typeLabel: "integer" } },
    { name: "verifyBnodeDescriptions",
        description: "pessimistically ask the endpoint to confirm each blank node description",
        schema: { type: "boolean", default: true },
        cli: { option: "sparql-verify-bnodes" } },
];
function fromParams(params, queryTracker) {
    return sparqlDB(params.endpoint, queryTracker, {
        allOutgoing: params.allOutgoing,
        bnodeDepth: params.bnodeDepth,
        verifyBnodeDescriptions: params.verifyBnodeDescriptions,
    });
}
//# sourceMappingURL=neighborhood-sparql.js.map