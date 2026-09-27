/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 50
(__unused_webpack_module, exports, __webpack_require__) {

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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(968), exports);
__exportStar(__webpack_require__(352), exports);
__exportStar(__webpack_require__(947), exports);
__exportStar(__webpack_require__(417), exports);
__exportStar(__webpack_require__(963), exports);
__exportStar(__webpack_require__(135), exports);
__exportStar(__webpack_require__(0), exports);
//# sourceMappingURL=index.js.map

/***/ },

/***/ 968
(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlankNode = void 0;
/**
 * A term that represents an RDF blank node with a label.
 */
class BlankNode {
    constructor(value) {
        this.termType = 'BlankNode';
        this.value = value;
    }
    equals(other) {
        return !!other && other.termType === 'BlankNode' && other.value === this.value;
    }
}
exports.BlankNode = BlankNode;
//# sourceMappingURL=BlankNode.js.map

/***/ },

/***/ 352
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataFactory = void 0;
const BlankNode_1 = __webpack_require__(968);
const DefaultGraph_1 = __webpack_require__(947);
const Literal_1 = __webpack_require__(417);
const NamedNode_1 = __webpack_require__(963);
const Quad_1 = __webpack_require__(135);
const Variable_1 = __webpack_require__(0);
let dataFactoryCounter = 0;
/**
 * A factory for instantiating RDF terms and quads.
 */
class DataFactory {
    constructor(options) {
        this.blankNodeCounter = 0;
        options = options || {};
        this.blankNodePrefix = options.blankNodePrefix || `df_${dataFactoryCounter++}_`;
    }
    /**
     * @param value The IRI for the named node.
     * @return A new instance of NamedNode.
     * @see NamedNode
     */
    namedNode(value) {
        return new NamedNode_1.NamedNode(value);
    }
    /**
     * @param value The optional blank node identifier.
     * @return A new instance of BlankNode.
     *         If the `value` parameter is undefined a new identifier
     *         for the blank node is generated for each call.
     * @see BlankNode
     */
    blankNode(value) {
        return new BlankNode_1.BlankNode(value || `${this.blankNodePrefix}${this.blankNodeCounter++}`);
    }
    /**
     * @param value              The literal value.
     * @param languageOrDatatype The optional language, datatype, or directional language.
     *                           If `languageOrDatatype` is a NamedNode,
     *                           then it is used for the value of `NamedNode.datatype`.
     *                           If `languageOrDatatype` is a NamedNode, it is used for the value
     *                           of `NamedNode.language`.
     *                           Otherwise, it is used as a directional language,
     *                           from which the language is set to `languageOrDatatype.language`
     *                           and the direction to `languageOrDatatype.direction`.
     * @return A new instance of Literal.
     * @see Literal
     */
    literal(value, languageOrDatatype) {
        return new Literal_1.Literal(value, languageOrDatatype);
    }
    /**
     * This method is optional.
     * @param value The variable name
     * @return A new instance of Variable.
     * @see Variable
     */
    variable(value) {
        return new Variable_1.Variable(value);
    }
    /**
     * @return An instance of DefaultGraph.
     */
    defaultGraph() {
        return DefaultGraph_1.DefaultGraph.INSTANCE;
    }
    /**
     * @param subject   The quad subject term.
     * @param predicate The quad predicate term.
     * @param object    The quad object term.
     * @param graph     The quad graph term.
     * @return A new instance of Quad.
     * @see Quad
     */
    quad(subject, predicate, object, graph) {
        return new Quad_1.Quad(subject, predicate, object, graph || this.defaultGraph());
    }
    /**
     * Create a deep copy of the given term using this data factory.
     * @param original An RDF term.
     * @return A deep copy of the given term.
     */
    fromTerm(original) {
        // TODO: remove nasty any casts when this TS bug has been fixed:
        //  https://github.com/microsoft/TypeScript/issues/26933
        switch (original.termType) {
            case 'NamedNode':
                return this.namedNode(original.value);
            case 'BlankNode':
                return this.blankNode(original.value);
            case 'Literal':
                if (original.language) {
                    return this.literal(original.value, original.language);
                }
                if (!original.datatype.equals(Literal_1.Literal.XSD_STRING)) {
                    return this.literal(original.value, this.fromTerm(original.datatype));
                }
                return this.literal(original.value);
            case 'Variable':
                return this.variable(original.value);
            case 'DefaultGraph':
                return this.defaultGraph();
            case 'Quad':
                return this.quad(this.fromTerm(original.subject), this.fromTerm(original.predicate), this.fromTerm(original.object), this.fromTerm(original.graph));
        }
    }
    /**
     * Create a deep copy of the given quad using this data factory.
     * @param original An RDF quad.
     * @return A deep copy of the given quad.
     */
    fromQuad(original) {
        return this.fromTerm(original);
    }
    /**
     * Reset the internal blank node counter.
     */
    resetBlankNodeCounter() {
        this.blankNodeCounter = 0;
    }
}
exports.DataFactory = DataFactory;
//# sourceMappingURL=DataFactory.js.map

/***/ },

/***/ 947
(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultGraph = void 0;
/**
 * A singleton term instance that represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
class DefaultGraph {
    constructor() {
        this.termType = 'DefaultGraph';
        this.value = '';
        // Private constructor
    }
    equals(other) {
        return !!other && other.termType === 'DefaultGraph';
    }
}
exports.DefaultGraph = DefaultGraph;
DefaultGraph.INSTANCE = new DefaultGraph();
//# sourceMappingURL=DefaultGraph.js.map

/***/ },

/***/ 417
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Literal = void 0;
const NamedNode_1 = __webpack_require__(963);
/**
 * A term that represents an RDF literal,
 * containing a string with an optional language tag and optional direction
 * or datatype.
 */
class Literal {
    constructor(value, languageOrDatatype) {
        this.termType = 'Literal';
        this.value = value;
        if (typeof languageOrDatatype === 'string') {
            this.language = languageOrDatatype;
            this.datatype = Literal.RDF_LANGUAGE_STRING;
            this.direction = '';
        }
        else if (languageOrDatatype) {
            if ('termType' in languageOrDatatype) {
                this.language = '';
                this.datatype = languageOrDatatype;
                this.direction = '';
            }
            else {
                this.language = languageOrDatatype.language;
                this.datatype = languageOrDatatype.direction ?
                    Literal.RDF_DIRECTIONAL_LANGUAGE_STRING :
                    Literal.RDF_LANGUAGE_STRING;
                this.direction = languageOrDatatype.direction || '';
            }
        }
        else {
            this.language = '';
            this.datatype = Literal.XSD_STRING;
            this.direction = '';
        }
    }
    equals(other) {
        return !!other && other.termType === 'Literal' && other.value === this.value &&
            other.language === this.language &&
            ((other.direction === this.direction) || (!other.direction && this.direction === '')) &&
            this.datatype.equals(other.datatype);
    }
}
exports.Literal = Literal;
Literal.RDF_LANGUAGE_STRING = new NamedNode_1.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
Literal.RDF_DIRECTIONAL_LANGUAGE_STRING = new NamedNode_1.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString');
Literal.XSD_STRING = new NamedNode_1.NamedNode('http://www.w3.org/2001/XMLSchema#string');
//# sourceMappingURL=Literal.js.map

/***/ },

/***/ 963
(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NamedNode = void 0;
/**
 * A term that contains an IRI.
 */
class NamedNode {
    constructor(value) {
        this.termType = 'NamedNode';
        this.value = value;
    }
    equals(other) {
        return !!other && other.termType === 'NamedNode' && other.value === this.value;
    }
}
exports.NamedNode = NamedNode;
//# sourceMappingURL=NamedNode.js.map

/***/ },

/***/ 135
(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Quad = void 0;
/**
 * An instance of DefaultGraph represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
class Quad {
    constructor(subject, predicate, object, graph) {
        this.termType = 'Quad';
        this.value = '';
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.graph = graph;
    }
    equals(other) {
        // `|| !other.termType` is for backwards-compatibility with old factories without RDF* support.
        return !!other && (other.termType === 'Quad' || !other.termType) &&
            this.subject.equals(other.subject) &&
            this.predicate.equals(other.predicate) &&
            this.object.equals(other.object) &&
            this.graph.equals(other.graph);
    }
}
exports.Quad = Quad;
//# sourceMappingURL=Quad.js.map

/***/ },

/***/ 0
(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Variable = void 0;
/**
 * A term that represents a variable.
 */
class Variable {
    constructor(value) {
        this.termType = 'Variable';
        this.value = value;
    }
    equals(other) {
        return !!other && other.termType === 'Variable' && other.value === this.value;
    }
}
exports.Variable = Variable;
//# sourceMappingURL=Variable.js.map

/***/ },

/***/ 441
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/**
 * options: {
 *   indent: '    ',
 *   checkCorefs: n => false, // meaning "trust me, it's a tree"
 * }
 */
// **N3Writer** writes N3 documents.
const namespaces = (__webpack_require__(215)["default"]);
const N3Fac = __webpack_require__(601);
const { Term } = N3Fac;
const N3DataFactory = N3Fac.default;
const { isDefaultGraph } = __webpack_require__(539);
const DEFAULTGRAPH = N3DataFactory.defaultGraph();
const { rdf, xsd } = namespaces;
// Characters in literals that require escaping
const escape = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/, escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g, escapedCharacters = {
    '\\': '\\\\', '"': '\\"', '\t': '\\t',
    '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
};
const rdf10LocalName = `[_a-zA-Z][\\-_a-zA-Z0-9]*`;
const rdf11LocalName = `[_a-zA-Z0-9][\\-_a-zA-Z0-9.]*`;
// ## Placeholder class to represent already pretty-printed terms
class SerializedTerm extends Term {
    constructor(id) { super(id); }
    // Pretty-printed nodes are not equal to any other node
    // (e.g., [] does not equal [])
    equals() {
        return false;
    }
}
const INDENT = '  ';
class Nesting {
    constructor(stream, indent, subject, predicate) {
        this._stream = stream;
        this._indent = indent;
        this._subject = subject;
        this._predicate = predicate; // gets updated by _writeQuad()
    }
}
class Root extends Nesting {
    constructor(stream, subject, predicate) { super(stream, '  ', subject, predicate); }
    close(done) {
        if (this.used) {
            this._stream._write('.\n', done);
            this.used = false;
        }
    }
}
class BNode extends Nesting {
    constructor(stream, indent, node) { super(stream, indent, node, null); }
    close(done, p) {
        this._stream._write((this.used ? `\n${p._indent}` : '') + ']', done);
    }
}
class Collection extends Nesting {
    constructor(stream, indent, members) {
        super(stream, indent, null, null);
        this._members = members;
        this.leadSpace = false;
    }
    close(done, p) {
        this._stream._write(`\n${p._indent})`, done);
    }
}
// ## Constructor
class Writer {
    constructor(outputStream, options) {
        // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
        this._prefixRegex = /$0^/;
        this._lineMode = false;
        // Shift arguments if the first argument is not a stream
        if (outputStream && typeof outputStream.write !== 'function')
            options = outputStream, outputStream = null;
        options = options || {};
        this._lists = options.lists;
        this._indent = options.indent || '  ';
        this._checkCorefs = options.checkCorefs || ((_n) => false); // if unsupplied; assume a tree
        this._version = options.version || 1.0;
        this._localName = this._version === 1.0
            ? rdf10LocalName
            : rdf11LocalName;
        // If no output stream given, send the output as string through the end callback
        if (!outputStream) {
            let output = '';
            this._outputStream = {
                write(chunk, _encoding, done) { if (options.debug) {
                    console.log({ chunk, output });
                } output += chunk; done && done(); },
                end: (done) => { done && done(null, output); },
            };
            this._endStream = true;
        }
        else {
            this._outputStream = outputStream;
            this._endStream = options.end === undefined ? true : !!options.end;
        }
        // Initialize writer, depending on the format
        this._nestings = [new Root(this, null, null)];
        if (!(/triple|quad/i).test(options.format)) {
            this._lineMode = false;
            this._graph = DEFAULTGRAPH;
            this._prefixIRIs = Object.create(null);
            options.prefixes && this.addPrefixes(options.prefixes);
            if (options.baseIRI) {
                this._baseMatcher = new RegExp(`^${escapeRegex(options.baseIRI)}${options.baseIRI.endsWith('/') ? '' : '[#?]'}`);
                this._baseLength = options.baseIRI.length;
            }
        }
        else {
            this._lineMode = true;
            this._writeQuad = this._writeQuadLine;
        }
    }
    // ## Private methods
    // ### Whether the current graph is the default graph
    get _inDefaultGraph() {
        return DEFAULTGRAPH.equals(this._graph);
    }
    // ### `_write` writes the argument to the output stream
    _write(string, callback) {
        this._outputStream.write(string, 'utf8', callback);
    }
    // ### `_writeQuad` writes the quad to the output stream
    _writeQuad(subject, predicate, object, graph, done) {
        try {
            // Write the graph's label if it has changed
            if (!graph.equals(this._graph)) {
                // Close the previous graph and start the new one
                this._getNestingForSubject(DEFAULTGRAPH); // TODO: should be fresh bnode or null-ish thingy
                this._write((this._nestings.length === 1 ? '' : (this._inDefaultGraph ? '.\n' : '\n}\n')) +
                    (DEFAULTGRAPH.equals(graph) ? '' : `${this._encodeIriOrBlank(graph)} {\n`));
                this._graph = graph;
            }
            let [nesting, matched] = this._getNestingForSubject(subject);
            let objectStr;
            if (this._lists && (object.value in this._lists)) {
                objectStr = '(';
                this._nestings.push(new Collection(this, nesting._indent + INDENT, this._lists[object.value]));
            }
            else if (object.termType === 'BlankNode'
                && this._checkCorefs
                && !this._checkCorefs(object)) {
                objectStr = '[';
                this._nestings.push(new BNode(this, nesting._indent + INDENT, object));
            }
            else {
                objectStr = this._encodeObject(object);
            }
            // Don't repeat the subject if it's the same
            if (matched) {
                // Don't repeat the predicate if it's the same
                if (predicate.equals(nesting.predicate)) {
                    this._write(`, ${objectStr}`, done);
                    // Same subject, different predicate
                }
                else {
                    this._write(`${nesting.used ? ';' : ''}\n${nesting._indent}${this._encodePredicate(nesting.predicate = predicate)} ${objectStr}`, done);
                }
            }
            // Different subject; write the whole quad
            else {
                nesting._subject = subject;
                nesting._predicate = predicate;
                this._write(`${this._encodeSubject(subject)} ${this._encodePredicate(predicate)} ${objectStr}`, done);
            }
            nesting.used = true;
        }
        catch (error) {
            if (done)
                done(error);
            else
                throw error;
        }
    }
    /*
      closes BNodes and iterates and closes Collections until finding subject.
     */
    _getNestingForSubject(subject) {
        let nesting = this._nestings.length > 0
            ? this._nestings[this._nestings.length - 1]
            : null;
        while (nesting && !subject.equals(nesting._subject)) {
            if (nesting instanceof Collection) {
                const leadSpace = nesting.leadSpace ? ' ' : '';
                if (nesting._subject) {
                    this._write(`${leadSpace}${this._encodeObject(nesting._subject)}`);
                    nesting._subject = null; // don't serialize again if e.g. returning from nested list
                    nesting.leadSpace = true;
                }
                if (nesting._members.length === 0) {
                    nesting = this._closeNesting();
                }
                else {
                    const li = nesting._members.shift();
                    if (li.value in this._lists) {
                        // list in a list
                        this._write(`${leadSpace}(`);
                        this._nestings.push(nesting = new Collection(this, nesting._indent + INDENT, this._lists[li.value]));
                        nesting.leadSpace = false;
                    }
                    else {
                        // any other element in the list
                        if (li.equals(subject)) {
                            this._write("\n" + nesting._indent + '[');
                            nesting._subject = null;
                            this._nestings.push(nesting = new BNode(this, nesting._indent + INDENT, subject));
                            nesting.leadSpace = false;
                        }
                        else {
                            nesting._subject = li;
                        }
                    }
                }
            }
            else if (nesting instanceof BNode) {
                nesting = this._closeNesting();
            }
            else {
                nesting.close();
                return [nesting, false]; // didn't match subject
            }
        }
        return [nesting, subject.equals(nesting._subject)]; // hard code true?
    }
    _closeNesting() {
        const nesting = this._nestings.pop();
        const ret = this._nestings[this._nestings.length - 1];
        nesting.close(null, ret);
        return ret;
    }
    _finish() {
        const oldLength = this._nestings.length;
        this._getNestingForSubject(DEFAULTGRAPH); // TODO: should be fresh bnode or null-ish thingy
        if (oldLength !== 1) {
            if (this._inDefaultGraph) {
            }
            else {
                this._write('\n}\n');
            }
            return true;
        }
        else {
            return false;
        }
    }
    // ### `_writeQuadLine` writes the quad to the output stream as a single line
    _writeQuadLine(subject, predicate, object, graph, done) {
        // Write the quad without prefixes
        delete this._prefixMatch;
        this._write(this.quadToString(subject, predicate, object, graph), done);
    }
    // ### `quadToString` serializes a quad as a string
    quadToString(subject, predicate, object, graph) {
        return `${this._encodeSubject(subject)} ${this._encodeIriOrBlank(predicate)} ${this._encodeObject(object)}${graph && graph.value ? ` ${this._encodeIriOrBlank(graph)} .\n` : ' .\n'}`;
    }
    // ### `quadsToString` serializes an array of quads as a string
    quadsToString(quads) {
        return quads.map(t => {
            return this.quadToString(t.subject, t.predicate, t.object, t.graph);
        }).join('');
    }
    // ### `_encodeSubject` represents a subject
    _encodeSubject(entity) {
        return entity.termType === 'Quad' ?
            this._encodeQuad(entity) : this._encodeIriOrBlank(entity);
    }
    // ### `_encodeIriOrBlank` represents an IRI or blank node
    _encodeIriOrBlank(entity) {
        // A blank node or list is represented as-is
        if (entity.termType !== 'NamedNode') {
            // If it is a list head, pretty-print it
            return 'id' in entity ? entity.id : `_:${entity.value}`;
        }
        let iri = entity.value;
        // Use relative IRIs if requested and possible
        if (this._baseMatcher && this._baseMatcher.test(iri))
            iri = iri.substr(this._baseLength);
        // Escape special characters
        if (escape.test(iri))
            iri = iri.replace(escapeAll, characterReplacer);
        // Try to represent the IRI as prefixed name
        const prefixMatch = this._prefixRegex.exec(iri);
        return !prefixMatch ? `<${iri}>` :
            (!prefixMatch[1] ? iri : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2]);
    }
    // ### `_encodeLiteral` represents a literal
    _encodeLiteral(literal) {
        // Escape special characters
        let value = literal.value;
        if (escape.test(value))
            value = value.replace(escapeAll, characterReplacer);
        // Write a language-tagged literal
        if (literal.language)
            return `"${value}"@${literal.language}`;
        // Write dedicated literals per data type
        if (this._lineMode) {
            // Only abbreviate strings in N-Triples or N-Quads
            if (literal.datatype.value === xsd.string)
                return `"${value}"`;
        }
        else {
            // Use common datatype abbreviations in Turtle or TriG
            switch (literal.datatype.value) {
                case xsd.string:
                    return `"${value}"`;
                case xsd.boolean:
                    if (value === 'true' || value === 'false')
                        return value;
                    break;
                case xsd.integer:
                    if (/^[+-]?\d+$/.test(value))
                        return value;
                    break;
                case xsd.decimal:
                    if (/^[+-]?\d*\.\d+$/.test(value))
                        return value;
                    break;
                case xsd.double:
                    if (/^[+-]?(?:\d+\.\d*|\.?\d+)[eE][+-]?\d+$/.test(value))
                        return value;
                    break;
            }
        }
        // Write a regular datatyped literal
        return `"${value}"^^${this._encodeIriOrBlank(literal.datatype)}`;
    }
    // ### `_encodePredicate` represents a predicate
    _encodePredicate(predicate) {
        return predicate.value === rdf.type ? 'a' : this._encodeIriOrBlank(predicate);
    }
    // ### `_encodeObject` represents an object
    _encodeObject(object) {
        switch (object.termType) {
            case 'Quad':
                return this._encodeQuad(object);
            case 'Literal':
                return this._encodeLiteral(object);
            default:
                return this._encodeIriOrBlank(object);
        }
    }
    // ### `_encodeQuad` encodes an RDF* quad
    _encodeQuad({ subject, predicate, object, graph }) {
        return `<<${this._encodeSubject(subject)} ${this._encodePredicate(predicate)} ${this._encodeObject(object)}${isDefaultGraph(graph) ? '' : ` ${this._encodeIriOrBlank(graph)}`}>>`;
    }
    // ### `_blockedWrite` replaces `_write` after the writer has been closed
    _blockedWrite() {
        throw new Error('Cannot write because the writer has been closed.');
    }
    // ### `addQuad` adds the quad to the output stream
    addQuad(subject, predicate, object, graph, done) {
        // The quad was given as an object, so shift parameters
        if (object === undefined)
            this._writeQuad(subject.subject, subject.predicate, subject.object, subject.graph, predicate);
        // The optional `graph` parameter was not provided
        else if (typeof graph === 'function')
            this._writeQuad(subject, predicate, object, DEFAULTGRAPH, graph);
        // The `graph` parameter was provided
        else
            this._writeQuad(subject, predicate, object, graph || DEFAULTGRAPH, done);
    }
    // ### `addQuads` adds the quads to the output stream
    addQuads(quads) {
        for (let i = 0; i < quads.length; i++)
            this.addQuad(quads[i]);
    }
    // ### `addPrefix` adds the prefix to the output stream
    addPrefix(prefix, iri, done) {
        const prefixes = {};
        prefixes[prefix] = iri;
        this.addPrefixes(prefixes, done);
    }
    // ### `addPrefixes` adds the prefixes to the output stream
    addPrefixes(prefixes, done) {
        // Ignore prefixes if not supported by the serialization
        if (!this._prefixIRIs)
            return done && done();
        // Write all new prefixes
        let hasPrefixes = false;
        for (let prefix in prefixes) {
            let iri = prefixes[prefix];
            if (typeof iri !== 'string')
                iri = iri.value;
            hasPrefixes = true;
            // Finish a possible pending quad
            if (this._finish())
                this._graph = '';
            // Store and write the prefix
            this._prefixIRIs[iri] = (prefix += ':');
            if (this._version > 1) {
                this._write(`PREFIX ${prefix} <${iri}>\n`);
            }
            else {
                this._write(`@prefix ${prefix} <${iri}>.\n`);
            }
        }
        // Recreate the prefix matcher
        if (hasPrefixes) {
            let IRIlist = '', prefixList = '';
            for (const prefixIRI in this._prefixIRIs) {
                IRIlist += IRIlist ? `|${prefixIRI}` : prefixIRI;
                prefixList += (prefixList ? '|' : '') + this._prefixIRIs[prefixIRI];
            }
            IRIlist = escapeRegex(IRIlist);
            this._prefixRegex = new RegExp(`^(?:${prefixList})[^\/]*$|` +
                `^(${IRIlist})(${this._localName})$`);
        }
        // End a prefix block with a newline
        this._write(hasPrefixes ? '\n' : '', done);
    }
    // ### `blank` creates a blank node with the given content
    blank(predicate, object) {
        let children = predicate, child, length;
        // Empty blank node
        if (predicate === undefined)
            children = [];
        // Blank node passed as blank(Term("predicate"), Term("object"))
        else if (predicate.termType)
            children = [{ predicate: predicate, object: object }];
        // Blank node passed as blank({ predicate: predicate, object: object })
        else if (!('length' in predicate))
            children = [predicate];
        switch (length = children.length) {
            // Generate an empty blank node
            case 0:
                return new SerializedTerm('[]');
            // Generate a non-nested one-triple blank node
            case 1:
                child = children[0];
                if (!(child.object instanceof SerializedTerm))
                    return new SerializedTerm(`[ ${this._encodePredicate(child.predicate)} ${this._encodeObject(child.object)} ]`);
            // Generate a multi-triple or nested blank node
            default:
                let contents = '[';
                // Write all triples in order
                for (let i = 0; i < length; i++) {
                    child = children[i];
                    // Write only the object is the predicate is the same as the previous
                    if (child.predicate.equals(predicate))
                        contents += `, ${this._encodeObject(child.object)}`;
                    // Otherwise, write the predicate and the object
                    else {
                        contents += `${(i ? ';\n  ' : '\n  ') +
                            this._encodePredicate(child.predicate)} ${this._encodeObject(child.object)}`;
                        predicate = child.predicate;
                    }
                }
                return new SerializedTerm(`${contents}\n]`);
        }
    }
    // ### `list` creates a list node with the given content
    list(elements) {
        const length = elements && elements.length || 0, contents = new Array(length);
        for (let i = 0; i < length; i++)
            contents[i] = this._encodeObject(elements[i]);
        return new SerializedTerm(`(${contents.join(' ')})`);
    }
    // ### `comment` writes a comment line
    comment(text) {
        // Finish a possible pending quad
        this._finish();
        this._write(text + "\n");
    }
    // ### `end` signals the end of the output stream
    end(done) {
        // Finish a possible pending quad
        this._finish();
        // Disallow further writing
        this._write = this._blockedWrite;
        // Try to end the underlying stream, ensuring done is called exactly one time
        let singleDone = done && ((error, result) => { singleDone = null, done(error, result); });
        if (this._endStream) {
            try {
                return this._outputStream.end(singleDone);
            }
            catch (error) { /* error closing stream */ }
        }
        singleDone && singleDone();
    }
}
// Replaces a character by its escaped version
function characterReplacer(character) {
    // Replace a single character by its escaped version
    let result = escapedCharacters[character];
    if (result === undefined) {
        // Replace a single character with its 4-bit unicode escape sequence
        if (character.length === 1) {
            result = character.charCodeAt(0).toString(16);
            result = '\\u0000'.substr(0, 6 - result.length) + result;
        }
        // Replace a surrogate pair with its 8-bit unicode escape sequence
        else {
            result = ((character.charCodeAt(0) - 0xD800) * 0x400 +
                character.charCodeAt(1) + 0x2400).toString(16);
            result = '\\U00000000'.substr(0, 10 - result.length) + result;
        }
    }
    return result;
}
function escapeRegex(regex) {
    return regex.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
}
module.exports = { Writer };
//# sourceMappingURL=NestedWriter.js.map

/***/ },

/***/ 554
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/* ShExMaterializer - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */
const { rdfJsTerm2Ld } = __webpack_require__(811);
const ShExMapMaterializerCjsModule = function (config) {
    const Start = config.Validator.Start;
    // interface constants
    const InterfaceOptions = {
        "or": {
            "oneOf": "exactly one disjunct must pass",
            "someOf": "one or more disjuncts must pass",
            "firstOf": "disjunct evaluation stops after one passes"
        },
        "partition": {
            "greedy": "each triple constraint consumes all triples matching predicate and object",
            "exhaustive": "search all mappings of triples to triple constriant"
        }
    };
    // **ShExValidator** provides ShEx utility functions
    const ShExTerm = __webpack_require__(811);
    const UNBOUNDED = -1;
    const XSD = "http://www.w3.org/2001/XMLSchema#";
    const integerDatatypes = [
        XSD + "integer",
        XSD + "nonPositiveInteger",
        XSD + "negativeInteger",
        XSD + "long",
        XSD + "int",
        XSD + "short",
        XSD + "byte",
        XSD + "nonNegativeInteger",
        XSD + "unsignedLong",
        XSD + "unsignedInt",
        XSD + "unsignedShort",
        XSD + "unsignedByte",
        XSD + "positiveInteger"
    ];
    const decimalDatatypes = [
        XSD + "decimal",
    ].concat(integerDatatypes);
    const numericDatatypes = [
        XSD + "float",
        XSD + "double"
    ].concat(decimalDatatypes);
    const numericParsers = {};
    numericParsers[XSD + "integer"] = function (label, parseError) {
        if (!(label.match(/^[+-]?[0-9]+$/))) {
            parseError("illegal integer value '" + label + "'");
        }
        return parseInt(label);
    };
    numericParsers[XSD + "decimal"] = function (label, parseError) {
        if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for decimal?
            parseError("illegal integer value '" + label + "'");
        }
        return parseFloat(label);
    };
    numericParsers[XSD + "float"] = function (label, parseError) {
        if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for float?
            parseError("illegal integer value '" + label + "'");
        }
        return parseFloat(label);
    };
    numericParsers[XSD + "double"] = function (label, parseError) {
        if (!(label.match(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/))) {
            parseError("illegal integer value '" + label + "'");
        }
        return Number(label);
    };
    function testRange(value, datatype, parseError) {
        const ranges = {
            //    integer            -1 0 1 +1 | "" -1.0 +1.0 1e0 NaN INF
            //    decimal            -1 0 1 +1 -1.0 +1.0 | "" 1e0 NaN INF
            //    float              -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
            //    double             -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
            //    nonPositiveInteger -1 0 +0 -0 | 1 +1 1a a1
            //    negativeInteger    -1 | 0 +0 -0 1
            //    long               -1 0 1 +1 |
            //    int                -1 0 1 +1 |
            //    short              -32768 0 32767 | -32769 32768
            //    byte               -128 0 127 | "" -129 128
            //    nonNegativeInteger 0 -0 +0 1 +1 | -1
            //    unsignedLong       0 1 | -1
            //    unsignedInt        0 1 | -1
            //    unsignedShort      0 65535 | -1 65536
            //    unsignedByte       0 255 | -1 256
            //    positiveInteger    1 | -1 0
            //    string             "" "a" "0"
            //    boolean            true false 0 1 | "" TRUE FALSE tRuE fAlSe -1 2 10 01
            //    dateTime           "2012-01-02T12:34:56.78Z" | "" "2012-01-02T" "2012-01-02"
            integer: { min: -Infinity, max: Infinity },
            decimal: { min: -Infinity, max: Infinity },
            float: { min: -Infinity, max: Infinity },
            double: { min: -Infinity, max: Infinity },
            nonPositiveInteger: { min: -Infinity, max: 0 },
            negativeInteger: { min: -Infinity, max: -1 },
            long: { min: -9223372036854775808, max: 9223372036854775807 },
            int: { min: -2147483648, max: 2147483647 },
            short: { min: -32768, max: 32767 },
            byte: { min: -128, max: 127 },
            nonNegativeInteger: { min: 0, max: Infinity },
            unsignedLong: { min: 0, max: 18446744073709551615 },
            unsignedInt: { min: 0, max: 4294967295 },
            unsignedShort: { min: 0, max: 65535 },
            unsignedByte: { min: 0, max: 255 },
            positiveInteger: { min: 1, max: Infinity }
        };
        const parms = ranges[datatype.substr(XSD.length)];
        if (!parms)
            throw Error("unexpected datatype: " + datatype);
        if (value < parms.min) {
            parseError("\"" + value + "\"^^<" + datatype + "> is less than the min:", parms.min);
        }
        else if (value > parms.max) {
            parseError("\"" + value + "\"^^<" + datatype + "> is greater than the max:", parms.min);
        }
    }
    ;
    /*
    function intSubType (spec: any, label: any, parseError: any) {
      const ret = numericParsers[XSD + "integer"](label, parseError);
      if ("min" in spec && ret < spec.min)
        parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be < " + spec.min);
      if ("max" in spec && ret > spec.max)
        parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be > " + spec.max);
      return ret;
    }
    [{type: "nonPositiveInteger", max: 0},
     {type: "negativeInteger", max: -1},
     {type: "long", min: -9223372036854775808, max: 9223372036854775807}, // beyond IEEE double
     {type: "int", min: -2147483648, max: 2147483647},
     {type: "short", min: -32768, max: 32767},
     {type: "byte", min: -128, max: 127},
     {type: "nonNegativeInteger", min: 0},
     {type: "unsignedLong", min: 0, max: 18446744073709551615},
     {type: "unsignedInt", min: 0, max: 4294967295},
     {type: "unsignedShort", min: 0, max: 65535},
     {type: "unsignedByte", min: 0, max: 255},
     {type: "positiveInteger", min: 1}].forEach(function (i: any) {
       numericParsers[XSD + i.type ] = function (label: any, parseError: any) {
         return intSubType(i, label, parseError);
       };
     });
    */
    const stringTests = {
        length: function (v, l) { return v.length === l; },
        minlength: function (v, l) { return v.length >= l; },
        maxlength: function (v, l) { return v.length <= l; }
    };
    const numericValueTests = {
        mininclusive: function (n, m) { return n >= m; },
        minexclusive: function (n, m) { return n > m; },
        maxinclusive: function (n, m) { return n <= m; },
        maxexclusive: function (n, m) { return n < m; }
    };
    const decimalLexicalTests = {
        totaldigits: function (v, d) {
            const m = v.match(/[0-9]/g);
            return m && m.length <= d;
        },
        fractiondigits: function (v, d) {
            const m = v.match(/^[+-]?[0-9]*\.?([0-9]*)$/);
            return m && m[1].length <= d;
        }
    };
    function makeCache() {
        const _keys = {}; // _keys[http://abcd] = [obj1, obj2]
        const _vals = {}; // _vals[http://abcd] = [res1, res2]
        return {
            cached: function (focus, shape) {
                const key = ShExTerm.rdfJsTerm2Turtle(focus);
                let cache = _keys[key];
                if (!cache) {
                    _keys[key] = cache = [];
                    _vals[key] = [];
                    return undefined;
                }
                const idx = cache.indexOf(shape);
                return idx === -1 ? undefined : _vals[key][idx];
            },
            remember: function (focus, shape, res) {
                const key = ShExTerm.rdfJsTerm2Turtle(focus);
                const cache = _keys[key];
                if (!cache) {
                    _keys[key] = [];
                    _vals[key] = [];
                }
                else if (cache.indexOf(shape) !== -1) {
                    // we're conservative in the use here.
                    throw Error("not expecting duplicate key " + key);
                }
                _keys[key].push(shape);
                _vals[key].push(res);
            }
        };
    }
    /* ShExValidator - construct an object for validating a schema.
     *
     * schema: a structure produced by a ShEx parser or equivalent.
     * options: object with controls for
     *   lax(true): boolean: whine about missing types in schema.
     *   diagnose(false): boolean: makde validate return a structure with errors.
     */
    function ShExMaterializer_constructor(schema, mapper, options) {
        if (!(this instanceof ShExMaterializer_constructor))
            return new ShExMaterializer_constructor(schema, mapper, options);
        this.type = "ShExValidator";
        options = options || {};
        this.options = options;
        this.options.or = this.options.or || "someOf";
        this.options.partition = this.options.partition || "exhaustive";
        if (!("noCache" in options && options.noCache))
            this.known = makeCache();
        const _ShExValidator = this;
        this.schema = schema;
        this._optimize = {}; // optimizations:
        // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
        this.reset = function () { }; // included in case we need it later.
        // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
        const regexModule = this.options.regexModule || __webpack_require__(443);
        let blankNodeCount = 0;
        const nextBNode = options.nextBNode || function () {
            return '_:b' + blankNodeCount++;
        };
        /* indexTripleConstraints - compile regular expression and index triple constraints
         */
        this.indexTripleConstraints = function (expression) {
            // list of triple constraints from (:p1 ., (:p2 . | :p3 .))
            const tripleConstraints = [];
            if (expression)
                indexTripleConstraints_dive(expression);
            return tripleConstraints;
            function indexTripleConstraints_dive(expr) {
                if (typeof expr === "string") // an inclusion: the labelled expression it names
                    indexTripleConstraints_dive(schema._index.tripleExprs[expr]);
                else if (expr.type === "TripleConstraint")
                    tripleConstraints.push(expr) - 1;
                else if (expr.type === "OneOf" || expr.type === "EachOf")
                    expr.expressions.forEach(function (nested) {
                        indexTripleConstraints_dive(nested);
                    });
                else
                    runtimeError("unexpected expr type: " + expr.type);
            }
            // removed by dead control flow

        };
        this.validateShapeMap = function (db, shapeMap, depth, seen) {
            return shapeMap.map((pair) => {
                let time = new Date();
                const res = this.validate(db, ShExTerm.ld2RdfJsTerm(pair.node), pair.shape, depth, seen); // really tracker and seen
                time = new Date().valueOf() - time.valueOf();
                return {
                    node: pair.node,
                    shape: pair.shape,
                    status: "errors" in res ? "nonconformant" : "conformant",
                    appinfo: res,
                    elapsed: time
                };
            });
        };
        /* validate - test point in db against the schema for labelOrShape
         * depth: level of recurssion; for logging.
         */
        this.validate = function (db, point, labelOrShape, depth, seen) {
            // default to schema's start shape
            if (!labelOrShape || labelOrShape === config.Validator.Start) {
                if (!schema.start)
                    runtimeError("start production not defined");
                labelOrShape = schema.start;
            }
            if (typeof labelOrShape !== "string")
                return this._validateShapeExpr(db, point, labelOrShape, "_: -start-", depth, seen);
            if (!(labelOrShape in this.schema._index.shapeExprs))
                runtimeError("shape " + labelOrShape + " not defined");
            const label = labelOrShape; // for clarity
            if (seen === undefined)
                seen = {};
            const seenKey = ShExTerm.rdfJsTerm2Turtle(point) + "@" + (label === Start ? "_: -start-" : label);
            if (seenKey in seen)
                return {
                    type: "Recursion",
                    node: rdfJsTerm2Ld(point),
                    shape: label
                };
            seen[seenKey] = { point: point, shapeLabel: label };
            const ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[label], label, depth, seen);
            delete seen[seenKey];
            return ret;
        };
        this._validateShapeDecl = function (db, point, shapeDecl, shapeLabel, depth, tracker, seen, subgraph) {
            return this._validateShapeExpr(db, point, shapeDecl.shapeExpr, shapeLabel, depth, tracker, seen, subgraph);
        };
        this._validateShapeExpr = function (db, point, shapeExpr, shapeLabel, depth, seen) {
            if ("known" in this && this.known.cached(point, shapeExpr))
                return this.known.cached(point, shapeExpr);
            let ret = null;
            if (point === "")
                throw Error("validation needs a valid focus node");
            if (typeof (shapeExpr) === "string") { // ShapeRef
                ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[shapeExpr], shapeExpr, depth, seen);
            }
            else if (shapeExpr.type === "NodeConstraint") {
                const checked = this._errorsMatchingNodeConstraint(point, shapeExpr, null);
                ret = "errors" in checked ? {
                    type: "Failure",
                    node: rdfJsTerm2Ld(point),
                    shape: shapeLabel,
                    errors: checked.errors.map(function (_miss) {
                        return {
                            type: "NodeConstraintViolation",
                            shapeExpr: shapeExpr
                        };
                    })
                } : {
                    type: "NodeConstraintTest",
                    node: rdfJsTerm2Ld(point),
                    shape: shapeLabel,
                    shapeExpr: shapeExpr
                };
            }
            else if (shapeExpr.type === "Shape") {
                ret = this._validateShape(db, point, regexModule.compile(schema, shapeExpr), shapeExpr, shapeLabel, depth, seen);
            }
            else if (shapeExpr.type === "ShapeExternal") {
                ret = this.options.validateExtern(db, point, shapeLabel, depth, seen);
            }
            else if (shapeExpr.type === "ShapeOr") {
                const errors = [];
                ret = { type: "ShapeOrFailure", errors: errors };
                for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
                    const nested = shapeExpr.shapeExprs[i];
                    const sub = this._validateShapeExpr(db, point, nested, shapeLabel, depth, seen);
                    if ("errors" in sub)
                        errors.push(sub);
                    else {
                        ret = { type: "ShapeOrResults", solution: sub };
                        break;
                    }
                }
            }
            else if (shapeExpr.type === "ShapeNot") {
                const sub = this._validateShapeExpr(db, point, shapeExpr.shapeExpr, shapeLabel, depth, seen);
                if ("errors" in sub)
                    ret = { type: "ShapeNotResults", solution: sub };
                else
                    ret = { type: "ShapeNotFailure", errors: sub };
            }
            else if (shapeExpr.type === "ShapeAnd") {
                const passes = [];
                ret = { type: "ShapeAndResults", solutions: passes };
                for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
                    const nested = shapeExpr.shapeExprs[i];
                    const sub = this._validateShapeExpr(db, point, nested, shapeLabel, depth, seen);
                    if ("errors" in sub) {
                        ret = { type: "ShapeAndFailure", errors: sub };
                        break;
                    }
                    else
                        passes.push(sub);
                }
            }
            else
                throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
            if ("known" in this)
                this.known.remember(point, shapeExpr, ret);
            return ret;
        };
        this._validateShape = function (db, point, regexEngine, shape, shapeLabel, depth, seen) {
            const _ShExValidator = this;
            // logging stuff
            if (depth === undefined)
                depth = 0;
            let ret = null;
            const startAcionStorage = {}; // !!! need test to see this write to results structure.
            if ("startActs" in schema && !this.semActHandler.dispatchAll(schema.startActs, null, startAcionStorage))
                return null; // some semAct aborted !! return real error
            // const outgoing = indexNeighborhood(db.findByIRI(point, null, null, null).sort(byObject));
            // const incoming = indexNeighborhood(db.findByIRI(null, null, point, null).sort(bySubject));
            const neighborhood = []; // outgoing.triples.concat(incoming.triples); // @@ make fancy array holder.
            const constraintList = this.indexTripleConstraints(shape.expression);
            // const tripleList = triple2constraintList.reduce(function (ret: any, constraint: any, ord: any) {
            //   // subject and object depend on direction of constraint.
            //   const searchSubject = constraint.inverse ? null : point;
            //   const searchObject = constraint.inverse ? point : null;
            //   const index = constraint.inverse ? incoming : outgoing;
            //   // get triples matching predciate
            //   const matchPredicate = index.byPredicate[constraint.predicate] ||
            //     []; // empty list when no triple matches that constraint
            //   function _errorsByShapeLabel (focus: any, shapeLabel: any) {
            //     const sub = _ShExValidator.validate(db, focus, shapeLabel, depth + 1, seen);
            //     return "errors" in sub ? sub.errors : [];
            //   }
            //   function _errorsByShapeExpr (focus: any, shapeExpr: any) {
            //     const sub = _ShExValidator._validateShapeExpr(db, focus, shapeExpr, shapeLabel, depth, seen);
            //     return "errors" in sub ? sub.errors : [];
            //   }
            //   // strip to triples matching value constraints (apart from @<someShape>)
            //   const matchConstraints = _ShExValidator._triplesMatchingShapeExpr(
            //     matchPredicate,
            //     constraint.valueExpr,
            //     constraint.inverse,
            //     /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeLabel,
            //     /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeExpr
            //   );
            //   matchConstraints.hits.forEach(function (t: any) {
            //     ret.triple2constraintList[neighborhood.indexOf(t)].push(ord);
            //   });
            //   matchConstraints.misses.forEach(function (t: any) {
            //     ret.misses[neighborhood.indexOf(t.triple)] = {constraintNo: ord, errors: t.errors};
            //   });
            //   return ret;
            // }, { misses: {}, triple2constraintList:_seq(neighborhood.length).map(function () { return []; }) }); // start with [[],[]...]
            // _log("constraints by triple: ", JSON.stringify(tripleList.triple2constraintList));
            // const misses = tripleList.triple2constraintList.reduce(function (ret: any, constraints: any, ord: any) {
            //   if (constraints.length === 0 &&                       // matches no constraints
            //       ord < outgoing.triples.length &&                  // not an incoming triple
            //       ord in tripleList.misses &&                       // predicate matched some constraint(s)
            //       (shape.extra === undefined ||                     // not declared extra
            //        shape.extra.indexOf(neighborhood[ord].predicate) === -1)) {
            //     ret.push({tripleNo: ord, constraintNo: tripleList.misses[ord].constraintNo, errors: tripleList.misses[ord].errors});
            //   }
            //   return ret;
            // }, []);
            // const xp = crossProduct(tripleList.triple2constraintList);
            const partitionErrors = [];
            // while (misses.length === 0 && xp.next() && ret === null) {
            //   // caution: early continues
            for (let __once = 0; __once < 1; ++__once) {
                // const usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
                // const constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
                //   _seq(neighborhood.length).map(function () { return 0; });
                // const tripleToConstraintMapping = xp.get(); // [0,1,0,3] mapping from triple to constraint
                // // Triples not mapped to triple constraints are not allowed in closed shapes.
                // if (shape.closed) {
                //   const firstSkippedTriple = tripleToConstraintMapping.indexOf(undefined);
                //   if (firstSkippedTriple !== -1 && firstSkippedTriple < outgoing.triples.length) {
                //     partitionErrors.push({
                //       errors: [
                //         {
                //           type: "ClosedShapeViolation",
                //           unexpectedTriples: tripleToConstraintMapping.reduce((ret: any, c: any, idx: any) => {
                //             if (idx < outgoing.triples.length && c === undefined)
                //               ret.push(outgoing.triples[idx]);
                //             return ret;
                //           }, [])
                //         }
                //       ]
                //     });
                //     continue; // closed shape violation.
                //   }
                // }
                // // Set usedTriples and constraintMatchCount.
                // tripleToConstraintMapping.forEach(function (tpNumber: any, ord: any) {
                //   if (tpNumber !== undefined) {
                //     usedTriples.push(neighborhood[ord]);
                //     ++constraintMatchCount[tpNumber];
                //   }
                // });
                // // Pivot to triples by constraint.
                // function _constraintToTriples () {
                //   const cll = triple2constraintList.length;
                //   return tripleToConstraintMapping.slice().
                //     reduce(function (ret: any, c: any, ord: any) {
                //       if (c !== undefined)
                //         ret[c].push(ord);
                //       return ret;
                //     }, _seq(cll).map(function () { return []; }));
                // }
                // tripleToConstraintMapping.slice().sort(function (a: any, b: any) { return a-b; }).filter(function (i: any) { // sort constraint numbers
                //   return i !== undefined;
                // }).map(function (n: any) { return n + " "; }).join(""); // e.g. 0 0 1 3 
                function _recurse(point, shapeLabel) {
                    return _ShExValidator.validate(db, point, shapeLabel, depth + 1, seen);
                }
                function _direct(point, shapeExpr) {
                    return _ShExValidator._validateShapeExpr(db, point, shapeExpr, shapeLabel, depth, seen);
                }
                function _testExpr(term, valueExpr, recurse, direct) {
                    return _ShExValidator._errorsMatchingShapeExpr(term, valueExpr, recurse, direct);
                }
                const results = regexEngine.match(db, point, constraintList, _synthesize, /*_constraintToTriples(), tripleToConstraintMapping, */ neighborhood, _recurse, _direct, this.semActHandler, _testExpr, null);
                function _synthesize(constraintNo, _min, _max, neighborhood) {
                    // console.log({"constraintNo": constraintNo, "min": min, "max": max, "triple2constraintList": triple2constraintList, "db": db, "point": point, "regexEngine": regexEngine, "shape": shape, "shapeLabel": shapeLabel, "depth": depth, "seen": seen});
                    const tc = constraintList[constraintNo];
                    const curSubjectx = { cs: point };
                    const target = new config.rdfjs.Store();
                    mapper.visitTripleConstraint(tc, curSubjectx, nextBNode, target, { _maybeSet: () => { } }, _ShExValidator.schema, db, _recurse, _direct, _testExpr);
                    const oldLen = neighborhood.length;
                    const created = [...target.match()];
                    neighborhood.push.apply(neighborhood, created);
                    return Array.apply(null, { length: created.length }).map((_, idx) => { return idx + oldLen; });
                }
                // {// testing parity between two engines
                //   const nfa = require("@shexjs/eval-simple-1err").compile(schema, shape);
                //   const fromNFA = nfa.match(db, point, triple2constraintList, _constraintToTriples(), tripleToConstraintMapping, neighborhood, _recurse, this.semActHandler, _testExpr, null);
                //   if ("errors" in fromNFA !== "errors" in results)
                //     { throw Error(JSON.stringify(results) + " vs " + JSON.stringify(fromNFA)); }
                // }
                if ("errors" in results) {
                    partitionErrors.push({
                        errors: results.errors
                    });
                    if (_ShExValidator.options.partition !== "exhaustive")
                        break;
                    else
                        continue;
                }
                // _log("post-regexp " + usedTriples.join(" "));
                const possibleRet = { type: "ShapeTest", node: rdfJsTerm2Ld(point), shape: shapeLabel };
                if (Object.keys(results).length > 0) // only include .solution for non-empty pattern
                    possibleRet.solution = results;
                if ("semActs" in shape &&
                    !this.semActHandler.dispatchAll(shape.semActs, results, possibleRet)) {
                    // some semAct aborted
                    partitionErrors.push({
                        errors: [{ type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] }]
                    });
                    if (_ShExValidator.options.partition !== "exhaustive")
                        break;
                    else
                        continue;
                }
                // _log("final " + usedTriples.join(" "));
                ret = possibleRet;
                // alts.push(tripleToConstraintMapping);
            }
            if (ret === null /* !! && this.options.diagnose */) {
                const missErrors = []; // misses.map(function (miss: any) {
                //   const t = neighborhood[miss.tripleNo];
                //   return {
                //     type: "TypeMismatch",
                //     triple: {subject: t.subject, predicate: t.predicate, object: rdfJsTerm2Ld(t.object)},
                //     constraint: triple2constraintList[miss.constraintNo],
                //     errors: miss.errors
                //   };
                // });
                ret = {
                    type: "Failure",
                    node: rdfJsTerm2Ld(point),
                    shape: shapeLabel,
                    errors: missErrors.concat(partitionErrors.length === 1 ? partitionErrors[0].errors : partitionErrors)
                };
            }
            if ("startActs" in schema && depth === 0) {
                ret.startActs = schema.startActs;
            }
            return ret;
        };
        this._errorsMatchingShapeExpr = function (value, valueExpr, recurse, direct) {
            const _ShExValidator = this;
            if (typeof (valueExpr) === "string") { // ShapeRef
                return recurse ? recurse(value, valueExpr) : [];
            }
            else if (valueExpr.type === "NodeConstraint") {
                return this._errorsMatchingNodeConstraint(value, valueExpr, null);
            }
            else if (valueExpr.type === "Shape") {
                return direct === undefined ? [] : direct(value, valueExpr);
            }
            else if (valueExpr.type === "ShapeOr") {
                // Every checker answers a result object, with `errors` when it failed (the
                // engine tests `"errors" in`); these used to treat them as error lists.
                const errors = [];
                for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
                    const nested = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExprs[i], recurse, direct);
                    if (!("errors" in nested))
                        return { type: "ShapeOrResults", solution: nested };
                    errors.push(nested);
                }
                return { type: "ShapeOrFailure", errors };
            }
            else if (valueExpr.type === "ShapeAnd") {
                const solutions = [], errors = [];
                for (const nested of valueExpr.shapeExprs) {
                    const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, recurse, direct);
                    ("errors" in sub ? errors : solutions).push(sub);
                }
                return errors.length ? { type: "ShapeAndFailure", errors } : { type: "ShapeAndResults", solutions };
            }
            else {
                throw Error("unknown value expression type '" + valueExpr.type + "'");
            }
        };
        /* _errorsMatchingNodeConstraint - return whether the value matches the value
         * expression without checking shape references.
         */
        this._errorsMatchingNodeConstraint = function (value, valueExpr, _recurse) {
            const errors = [];
            const label = value.value;
            const dt = value.termType === "Literal" ? value.datatype.value : null;
            const numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;
            function validationError(...args) {
                const errorStr = args.join("");
                errors.push("Error validating " + ShExTerm.rdfJsTerm2Turtle(value) + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
                return false;
            }
            {
                if ("nodeKind" in valueExpr) {
                    if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
                        validationError("unknown node kind '" + valueExpr.nodeKind + "'");
                    }
                    if (value.termType === "BlankNode") {
                        if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
                            validationError("blank node found when " + valueExpr.nodeKind + " expected");
                        }
                    }
                    else if (value.termType === "Literal") {
                        if (valueExpr.nodeKind !== "literal") {
                            validationError("literal found when " + valueExpr.nodeKind + " expected");
                        }
                    }
                    else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
                        validationError("iri found when " + valueExpr.nodeKind + " expected");
                    }
                }
                if (valueExpr.datatype && valueExpr.values)
                    validationError("found both datatype and values in " + valueExpr);
                if (valueExpr.datatype) {
                    if (value.termType !== "Literal") {
                        validationError("mismatched datatype: " + JSON.stringify(rdfJsTerm2Ld(value)) + " is not a literal with datatype " + valueExpr.datatype);
                    }
                    else if (value.datatype.value !== valueExpr.datatype) {
                        validationError("mismatched datatype: " + value.datatype.value + " !== " + valueExpr.datatype);
                    }
                    else if (numeric) {
                        testRange(numericParsers[numeric](label, validationError), valueExpr.datatype, validationError);
                    }
                    else if (valueExpr.datatype === XSD + "boolean") {
                        if (label !== "true" && label !== "false" && label !== "1" && label !== "0")
                            validationError("illegal boolean value: " + label);
                    }
                    else if (valueExpr.datatype === XSD + "dateTime") {
                        if (!label.match(/^[+-]?\d{4}-[01]\d-[0-3]\dT[0-5]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)?$/))
                            validationError("illegal dateTime value: " + label);
                    }
                }
                if (valueExpr.values) {
                    if (value.termType === "Literal" && valueExpr.values.reduce((ret, v) => {
                        if (ret)
                            return true;
                        const ld = rdfJsTerm2Ld(value);
                        if (v.type === "Language") {
                            return v.languageTag === ld.language; // @@ use equals/normalizeTest
                        }
                        if (!(typeof v === "object" && "value" in v)) // don't check for equivalent term if not a simple literal
                            return false;
                        return v.value === label
                            && (!("type" in v) || v.type === value.datatype.value)
                            && (!("language" in v) || v.language === value.language);
                    }, false)) {
                        // literal match
                    }
                    else if (valueExpr.values.indexOf(label) !== -1) {
                        // trivial match
                    }
                    else {
                        if (!(valueExpr.values.some(function (valueConstraint) {
                            if (typeof valueConstraint === "object" && !("value" in valueConstraint)) { // i.e. not a simple term
                                if (!("type" in valueConstraint))
                                    runtimeError("expected " + JSON.stringify(valueConstraint) + " to have a 'type' attribute.");
                                const ExpectedTypePattern = /(Iri|Literal|Language)(Stem)?(Range)?/;
                                const matchType = valueConstraint.type.match(ExpectedTypePattern);
                                if (!matchType)
                                    runtimeError("expected type attribute '" + valueConstraint.type + "' to match " + ExpectedTypePattern + ".");
                                const [, valType] = matchType;
                                if (valType === 'Iri') {
                                    if (value.termType !== 'NamedNode')
                                        return false;
                                }
                                else {
                                    if (value.termType !== 'Literal')
                                        return false;
                                }
                                /* expect N3.js literals with {Literal,Language}StemRange
                                 *       or non-literals with IriStemRange
                                 */
                                function normalizedTest(val, ref, func) {
                                    if (["Literal", "Language"].indexOf(valType) !== -1) { // val.termType === "Literal"
                                        if (["LiteralStem", "LiteralStemRange"].indexOf(valueConstraint.type) !== -1) {
                                            return func(val.value, ref);
                                        }
                                        else if (["LanguageStem", "LanguageStemRange"].indexOf(valueConstraint.type) !== -1) {
                                            return func(val.language || null, ref);
                                        }
                                        else {
                                            return validationError("literal " + JSON.stringify(val) + " not comparable with non-literal " + ref);
                                        }
                                    }
                                    else { // an Iri stem or range: the value is a NamedNode (tested above)
                                        return func(val.value, ref);
                                    }
                                }
                                function startsWith(val, ref) {
                                    return normalizedTest(val, ref, (l, r) => {
                                        return (valueConstraint.type === "LanguageStem" ||
                                            valueConstraint.type === "LanguageStemRange") ?
                                            // rfc4647 basic filtering
                                            l !== null && (l === r || r === "" || l[r.length] === "-") :
                                            // simple substring
                                            l.startsWith(r);
                                    });
                                }
                                function equals(val, ref) {
                                    return normalizedTest(val, ref, (l, r) => { return l === r; });
                                }
                                if (!isTerm(valueConstraint.stem)) {
                                    if (valueConstraint.stem.type !== "Wildcard")
                                        runtimeError("expected stem " + JSON.stringify(valueConstraint.stem) + " to be a Wildcard.");
                                    // match whatever but check exclusions below
                                }
                                else {
                                    if (!(startsWith(value, valueConstraint.stem))) {
                                        return false;
                                    }
                                }
                                if (valueConstraint.exclusions) {
                                    return !valueConstraint.exclusions.some(function (c) {
                                        if (!isTerm(c)) {
                                            if (!("type" in c))
                                                runtimeError("expected " + JSON.stringify(c) + " to have a 'type' attribute.");
                                            const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
                                            if (stemTypes.indexOf(c.type) === -1)
                                                runtimeError("expected type attribute '" + c.type + "' to be in '" + stemTypes + "'.");
                                            return startsWith(value, c.stem);
                                        }
                                        else {
                                            return equals(value, c);
                                        }
                                    });
                                }
                                return true;
                            }
                            else {
                                // ignore -- would have caught it above
                            }
                        }))) {
                            validationError("value " + label + " not found in set " + JSON.stringify(valueExpr.values));
                        }
                    }
                }
            }
            if ("pattern" in valueExpr) {
                const regexp = "flags" in valueExpr ?
                    new RegExp(valueExpr.pattern, valueExpr.flags) :
                    new RegExp(valueExpr.pattern);
                if (!(label.match(regexp)))
                    validationError("value " + label + " did not match pattern " + valueExpr.pattern);
            }
            Object.keys(stringTests).forEach(function (test) {
                if (test in valueExpr && !stringTests[test](label, valueExpr[test])) {
                    validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
                }
            });
            Object.keys(numericValueTests).forEach(function (test) {
                if (test in valueExpr) {
                    if (numeric) {
                        if (!numericValueTests[test](numericParsers[numeric](label, validationError), valueExpr[test])) {
                            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
                        }
                    }
                    else {
                        validationError("facet violation: numeric facet " + test + " can't apply to " + label);
                    }
                }
            });
            Object.keys(decimalLexicalTests).forEach(function (test) {
                if (test in valueExpr) {
                    if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
                        if (!decimalLexicalTests[test]("" + numericParsers[numeric](label, validationError), valueExpr[test])) {
                            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
                        }
                    }
                    else {
                        validationError("facet violation: numeric facet " + test + " can't apply to " + label);
                    }
                }
            });
            const ret = {
                type: null,
                focus: rdfJsTerm2Ld(value),
                shapeExpr: valueExpr
            };
            if (errors.length) {
                ret.type = "NodeConstraintViolation";
                ret.errors = errors;
            }
            else {
                ret.type = "NodeConstraintTest";
            }
            return ret;
        };
        this.semActHandler = {
            handlers: {},
            results: {},
            /**
             * Store a semantic action handler.
             *
             * @param {string} name - semantic action's URL.
             * @param {object} handler - handler function.
             *
             * The handler object has a dispatch function is invoked with:
             * @param {string} code - text of the semantic action.
             * @param {object} ctx - matched triple or results subset.
             * @param {object} extensionStorage - place where the extension writes into the result structure.
             * @return {bool} false if the extension failed or did not accept the ctx object.
             */
            register: function (name, handler) {
                this.handlers[name] = handler;
            },
            /**
             * Calls all semantic actions, allowing each to write to resultsArtifact.
             *
             * @param {array} semActs - list of semantic actions to invoke.
             * @return {bool} false if any result was false.
             */
            dispatchAll: function (semActs, ctx, resultsArtifact) {
                const _semActHanlder = this;
                return semActs.reduce(function (ret, semAct) {
                    if (ret && semAct.name in _semActHanlder.handlers) {
                        const code = "code" in semAct ? semAct.code : _ShExValidator.options.semActs[semAct.name];
                        const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
                        const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
                        ret = ret && _semActHanlder.handlers[semAct.name].dispatch(code, ctx, extensionStorage);
                        if (!existing && Object.keys(extensionStorage).length > 0) {
                            if (!("extensions" in resultsArtifact))
                                resultsArtifact.extensions = {};
                            resultsArtifact.extensions[semAct.name] = extensionStorage;
                        }
                        return ret;
                    }
                    return ret;
                }, true);
            }
        };
    }
    function isTerm(t) {
        return typeof t !== "object" || "value" in t && Object.keys(t).reduce(function (r, k) {
            return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
        }, true);
    }
    function runtimeError(...args) {
        const errorStr = args.join("");
        const e = new Error("Runtime error: " + errorStr);
        if ("captureStackTrace" in Error)
            Error.captureStackTrace(e, runtimeError);
        throw e;
    }
    return {
        construct: ShExMaterializer_constructor,
        options: InterfaceOptions
    };
};
module.exports = ShExMapMaterializerCjsModule;
//# sourceMappingURL=ShExMaterializer.js.map

/***/ },

/***/ 245
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/** ThreadedMaterializer - materialization by iteration scopes.
 *
 * Builds an instance of an output schema from a ShExMap binding tree, read as a scope
 * tree (./scopes.ts): a scope's own bindings, and one list of iteration scopes per
 * repeated constraint or group of the input.  Nothing is flattened and nothing is
 * consumed (../doc/iteration-scopes.md is the normative description):
 *
 * - A constraint with a Map variable READS it from the scope it is evaluated at, or
 *   from the nearest ancestor scope that binds it.  Reading marks nothing, so a
 *   parent's binding can be read in every item, and twice in one.  A variable bound
 *   nowhere on that chain fails the constraint.
 * - A REPETITION in the output schema iterates one list of the input: the deepest list
 *   its body's variables are bound at (nested repetitions count through their parent
 *   list).  Its body runs once per iteration of that list, in list order, at that
 *   iteration's scope; an iteration whose body fails is skipped; the count of successful
 *   iterations must reach the minimum, and the repetition stops at the maximum.  A body
 *   whose variables are all bound at or above the current scope runs once, there.  A
 *   body whose variables live in two lists neither of which contains the other is
 *   ill-formed, and says so.
 * - CHOICES (OneOf, ShapeOr, an optional constraint, a shape with extensions) yield
 *   alternatives, per scope; the alternatives of the parts of a group or conjunction
 *   combine by product, pruned to the best maxAccepts as they combine.  Every complete
 *   alternative is an accept; materialize() returns the one that read the most distinct
 *   bindings (ties: most quads, then schema order), or whichever options.prefer ranks
 *   first, and keeps the rest in this.accepts.
 * - A value a Map code produces must SATISFY the constraint's value expression when
 *   that is a node constraint; a plain literal whose lexical form fits the datatype is
 *   retyped to it; any other mismatch fails the constraint (options.checkValues=false
 *   turns this off).
 * - NODE IDENTITY: a shape-valued constraint with a Map variable names its node; one
 *   with %Map:{ id(...) %} (./keys.ts) keys it, so equal keys merge; otherwise the node
 *   is a blank node determined by the root, the constraint, its call depth and the
 *   scope (its @node when it is an iteration, else its path), so runs agree.
 *
 * run() is a generator of debugger step events (MaterializerDebugger drives it):
 *   {type: "tripleConstraint", tc, thread}   before synthesizing a constraint
 *   {type: "fail", failure, thread}          the constraint failed (its alternative dies)
 *   {type: "enter", tc, thread, scope}       a repetition's body starts on an iteration
 *   {type: "return", thread}                 a subshape call completed
 *   {type: "accept", thread, quads}          a complete alternative (at the end, each)
 * The thread view is {subject, depth, frame (the scope's index in walk order), scope
 * (its path), consumed (distinct bindings read so far on this branch), skipped (always
 * 0), emitted, used ("<frame> <variable>" marks)}.  Every quad carries `tc` and `src`,
 * its provenance; this.provenance is parallel to the chosen quads.
 *
 * The frame-cursor design this replaces is described in ../doc/threaded-materializer.md.
 */

const extensions = __webpack_require__(787);
const { n3idQuad2RdfJs, n3idTerm2RdfJs } = __webpack_require__(638);
const scopes_1 = __webpack_require__(680);
const bindingTree_1 = __webpack_require__(324);
const keys_1 = __webpack_require__(525);
const MapExt = "http://shex.io/extensions/Map/#";
const variablePattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;
const functionPattern = /^\s*[a-zA-Z0-9]+\(.*\)\s*$/;
const UNBOUNDED = -1;
class MaterializationError extends Error {
    constructor(message, failures) {
        super(failures && failures.length
            ? message + "; deepest failures: " + JSON.stringify(failures.slice(-3).map((f) => Object.assign({}, f, { tc: undefined })))
            : message);
        this.failures = failures || [];
    }
}
// -- results ---------------------------------------------------------------------------
/** one way to materialize something: its quads (each with tc and src) and the bindings read */
class Result {
    constructor(quads = [], reads = new Set()) {
        this.quads = quads;
        this.reads = reads;
    }
    then(other) {
        const reads = new Set(this.reads);
        other.reads.forEach(r => reads.add(r));
        return new Result(this.quads.concat(other.quads), reads);
    }
}
const rank = (r) => [r.reads.size, r.quads.length];
const betterRank = (a, b) => a.reads.size > b.reads.size || (a.reads.size === b.reads.size && a.quads.length > b.quads.length);
/** the legacy flattening, kept for callers that still list frames; @-keys are dropped */
function normalizeBindingTree(tree) {
    return normalizeBindingTreeWithOrigins(tree).frames;
}
function normalizeBindingTreeWithOrigins(tree) {
    const walked = walk(tree, []);
    return { frames: walked.frames, origins: walked.origins };
    function walk(node, path) {
        if (!Array.isArray(node)) {
            const counts = {};
            const origin = {};
            const own = {};
            for (const k of Object.keys(node)) {
                if (k.startsWith("@"))
                    continue;
                own[k] = node[k];
                counts[k] = 1;
                origin[k] = path.concat([k]);
            }
            return { frames: [own], origins: [origin], leaf: true, counts };
        }
        const kids = node.map((kid, i) => walk(kid, path.concat([i])));
        const counts = {};
        kids.forEach((kid) => {
            for (const k of Object.keys(kid.counts))
                counts[k] = (counts[k] || 0) + kid.counts[k];
        });
        if (!kids.some((kid) => !kid.leaf))
            return { frames: [].concat.apply([], kids.map((kid) => kid.frames)),
                origins: [].concat.apply([], kids.map((kid) => kid.origins)),
                leaf: false, counts };
        const shared = {};
        const sharedOrigin = {};
        const ordered = [];
        kids.forEach((kid) => {
            if (kid.leaf) {
                const rest = {};
                const restOrigin = {};
                for (const [k, v] of Object.entries(kid.frames[0])) {
                    if (counts[k] === 1) {
                        shared[k] = v;
                        sharedOrigin[k] = kid.origins[0][k];
                    }
                    else {
                        rest[k] = v;
                        restOrigin[k] = kid.origins[0][k];
                    }
                }
                if (Object.keys(rest).length > 0)
                    ordered.push({ frames: [rest], origins: [restOrigin], leaf: true });
            }
            else {
                ordered.push(kid);
            }
        });
        const frames = [];
        const origins = [];
        ordered.forEach((kid) => kid.frames.forEach((frame, i) => {
            frames.push(kid.leaf ? frame : Object.assign({}, shared, frame));
            origins.push(kid.leaf ? kid.origins[i] : Object.assign({}, sharedOrigin, kid.origins[i]));
        }));
        if (frames.length === 0 && Object.keys(shared).length > 0) {
            // a scope whose lists are all empty still has its own bindings: one frame of them
            frames.push(shared);
            origins.push(sharedOrigin);
        }
        return { frames, origins, leaf: false, counts };
    }
}
class ThreadedMaterializer {
    constructor(schema, options = {}) {
        this.tree = null;
        this._root = null;
        this._lists = new Map();
        this._tcIndex = new Map();
        this._active = [];
        this._failures = [];
        this._referenced = new Set();
        this._dropped = 0;
        this._stack = [];
        this._validator = null;
        this.schema = schema;
        this.index = schema._index || (__webpack_require__(747).ShExIndexVisitor).index(schema);
        this.prefixes = schema._prefixes || schema.prefixes || {};
        this.globals = options.staticVars || {};
        this.maxRepeat = "maxRepeat" in options && options.maxRepeat !== undefined ? options.maxRepeat : Infinity;
        this.maxCallDepth = options.maxCallDepth || 50;
        this.maxSteps = options.maxSteps || 1000000; // accepted for compatibility; the search has no budget to spend
        this.maxAccepts = options.maxAccepts || 20; // alternatives kept, at every level and at the end
        this.exploreSteps = options.exploreSteps || 10000; // likewise
        this.prefer = typeof options.prefer === "function" ? options.prefer : null;
        this.requireBindingsInSubshapes = options.requireBindingsInSubshapes === true;
        this.checkValues = options.checkValues !== false;
    }
    /** materialize - the quads of the best materialization of shapeLabel (default: start)
     * rooted at createRoot, as RdfJs quads */
    materialize(bindingTree, createRoot, shapeLabel) {
        const it = this.run(bindingTree, createRoot, shapeLabel);
        let step = it.next();
        while (!step.done)
            step = it.next();
        return step.value;
    }
    /** run - the materialization as a generator of debugger step events (see the module
     * comment); returns the chosen quads or throws MaterializationError */
    *run(bindingTree, createRoot, shapeLabel) {
        this.accepts = null;
        this.chosen = null;
        this.provenance = null;
        try {
            this.tree = new scopes_1.ScopeTree(bindingTree);
        }
        catch (e) {
            if (e instanceof scopes_1.BindingTreeError)
                throw new MaterializationError(e.message);
            throw e;
        }
        const view = this.tree.frames();
        this.frames = view.frames; // for UIs that list the bindings by scope
        this.frameOrigins = view.origins;
        this._root = createRoot || "_:root";
        this._lists = new Map();
        this._tcIndex = new Map();
        this._active = [];
        this._failures = [];
        this._referenced = new Set();
        this._dropped = 0;
        this._stack = [];
        const start = shapeLabel || this.schema.start || runtimeError("no shape given and no start in schema");
        const label = typeof start === "string" ? start : "START";
        const results = yield* this._shapeExpr(start, this.tree.root, this._root, 0, label);
        const seen = new Set();
        const accepts = [];
        for (const r of results.slice().sort((a, b) => betterRank(a, b) ? -1 : betterRank(b, a) ? 1 : 0)) {
            const { quads, provenance } = collectQuadsAndProvenance(r.quads);
            const sig = quadSignature(quads);
            if (seen.has(sig))
                continue;
            seen.add(sig);
            const used = Array.from(r.reads).map(readMark(this.tree));
            accepts.push({ quads, provenance, consumed: r.reads.size, skipped: 0,
                thread: { subject: this._root, depth: 0, frame: 0, scope: [], consumed: r.reads.size, skipped: 0,
                    emitted: quads.length, used },
                used });
        }
        this.accepts = accepts;
        const report = this.finishReport(accepts.length);
        if (accepts.length === 0)
            throw Object.assign(new MaterializationError("nothing materializes the shape from these bindings", this._failures), { report });
        for (const a of accepts)
            yield { type: "accept", thread: a.thread, quads: a.quads };
        let best = accepts[0];
        if (this.prefer)
            for (const a of accepts)
                if (this.prefer(a, best) < 0)
                    best = a;
        this.chosen = best;
        this.provenance = best.provenance;
        return best.quads;
    }
    finishReport(found) {
        const available = new Set(Object.keys(this.globals).concat(this.tree ? this.tree.variables() : []));
        const seen = new Set();
        this.lastReport = {
            unboundVariables: this._failures.filter((f) => {
                const key = f.variable + "\t" + (f.tc ? f.tc.predicate : "");
                if (!f.variable || available.has(f.variable) || seen.has(key))
                    return false;
                seen.add(key);
                return true;
            }),
            unusedStatics: Object.keys(this.globals).filter((g) => !this._referenced.has(g)),
            alternatives: found,
            explorationTruncated: this._dropped > 0,
            configsPruned: this._dropped,
        };
        return this.lastReport;
    }
    /** liveThreads - the open shape calls, outermost first, as thread views; the last
     * (innermost, most recently entered) is marked current: it is where the debugger is
     * actually paused, the others merely not yet returned. */
    liveThreads() {
        return this._stack.map((ctx, i) => Object.assign(this.threadView(ctx), { deferred: false }, collectQuadsAndProvenance(ctx.lead.quads), { used: Array.from(ctx.lead.reads).map(readMark(this.tree)),
            current: i === this._stack.length - 1 }));
    }
    /** currentThread - the graph as it is built so far: every open shape call's own
     * emissions, aggregated outer to inner (a shape's completed earlier constraints, then
     * the shape its current constraint calls into, and so on to where the debugger is
     * paused).  liveThreads() lists each open call separately -- what #dbgThreads shows as
     * pending threads; a nested one's quads fold into its caller's only once it returns, so
     * none of those separate views alone has everything emitted so far.  This is their sum. */
    currentThread() {
        if (this._stack.length === 0)
            return null;
        const innermost = this._stack[this._stack.length - 1];
        const lead = this._stack.reduce((acc, ctx) => acc.then(ctx.lead), new Result());
        return Object.assign(this.threadView(innermost), { deferred: false, current: true }, collectQuadsAndProvenance(lead.quads), { used: Array.from(lead.reads).map(readMark(this.tree)) });
    }
    threadView(ctx) {
        return { subject: ctx.subject, depth: ctx.depth, frame: ctx.scope.index, scope: ctx.scope.path,
            consumed: ctx.lead.reads.size, skipped: 0, emitted: ctx.lead.quads.length,
            used: Array.from(ctx.lead.reads).map(readMark(this.tree)) };
    }
    // -- shape expressions ----------------------------------------------------------------
    *_shapeExpr(se, scope, subject, depth, label) {
        if (typeof se === "string") {
            const decl = this.index.shapeExprs[se];
            if (!decl)
                runtimeError("shape " + se + " not found in schema");
            const options = this.extensionCandidates(decl);
            if (options.length === 0)
                runtimeError("shape " + se + " is abstract and nothing extends it");
            return yield* this._guarded("ref|" + se + "|" + (0, scopes_1.pathKey)(scope.path) + "|" + subject, se, function* () {
                const out = [];
                for (const o of options)
                    out.push(...(yield* this._shapeExpr(expressionOf(o), scope, subject, depth, se)));
                return this._prune(out);
            }.bind(this));
        }
        const fromRef = label !== undefined; // a reference's guard already covers what it resolves to
        label = label || "(inline " + se.type + ")";
        const guard = (key, run) => fromRef ? run() : this._guarded(key, label, run);
        switch (se.type) {
            case "ShapeDecl":
                return yield* this._shapeExpr(se.shapeExpr, scope, subject, depth, label);
            case "Shape":
                return yield* guard("shape|" + idOf(se) + "|" + (0, scopes_1.pathKey)(scope.path) + "|" + subject, function* () {
                    const parts = this.shapeParts(se).map((p) => p.expression);
                    const ctx = { subject, scope, depth, lead: new Result() };
                    this._stack.push(ctx);
                    try {
                        let acc = [new Result()];
                        for (const e of parts) {
                            const alternatives = e ? yield* this._expression(e, scope, subject, depth) : [new Result()];
                            if (alternatives.length === 0)
                                return [];
                            acc = this._all([acc, alternatives]);
                            ctx.lead = acc[0];
                        }
                        return acc;
                    }
                    finally {
                        this._stack.pop();
                    }
                }.bind(this));
            case "ShapeAnd":
                return yield* guard("and|" + idOf(se) + "|" + (0, scopes_1.pathKey)(scope.path) + "|" + subject, function* () {
                    const alternatives = [];
                    for (const p of se.shapeExprs)
                        if (this.resolve(p).type !== "NodeConstraint")
                            alternatives.push(yield* this._shapeExpr(p, scope, subject, depth));
                    return this._all(alternatives);
                }.bind(this));
            case "ShapeOr":
                return yield* guard("or|" + idOf(se) + "|" + (0, scopes_1.pathKey)(scope.path) + "|" + subject, function* () {
                    const out = [];
                    for (const p of se.shapeExprs)
                        if (this.resolve(p).type !== "NodeConstraint")
                            out.push(...(yield* this._shapeExpr(p, scope, subject, depth)));
                    return this._prune(out);
                }.bind(this));
            case "NodeConstraint":
                return [new Result()];
            default:
                runtimeError(se.type + " synthesis not supported");
        }
    }
    /** refuse a shape expression that reaches itself at the same scope and subject through
     * references alone (<A> @<B> OR ..., <B> @<A> OR ...) */
    *_guarded(key, label, run) {
        const at = this._active.findIndex(a => a.key === key);
        if (at !== -1)
            runtimeError("cycle in shape expressions: ", this._active.slice(at).map(a => a.label).concat(label).join(" -> "));
        this._active.push({ key, label });
        try {
            return yield* run();
        }
        finally {
            this._active.pop();
        }
    }
    /** the declaration itself (unless abstract) first, then its non-abstract extensions */
    extensionCandidates(decl) {
        const found = [];
        if (!decl.abstract)
            found.push(decl);
        const label = decl.id;
        if (label !== undefined) {
            const queue = [label];
            const seen = new Set();
            while (queue.length) {
                const base = queue.shift();
                for (const other of this.schema.shapes || []) {
                    const shape = expressionOf(other);
                    const ext = shape && shape.extends ? shape.extends : [];
                    if (ext.indexOf(base) !== -1 && !seen.has(other.id)) {
                        seen.add(other.id);
                        if (!other.abstract)
                            found.push(other);
                        queue.push(other.id);
                    }
                }
            }
        }
        return found;
    }
    /** the shapes whose expressions share the node when it matches `shape`: what it EXTENDS
     * (transitively), then itself */
    shapeParts(shape, seen = new Set()) {
        const parts = [];
        for (const base of shape.extends || []) {
            if (seen.has(base))
                continue;
            seen.add(base);
            const decl = this.index.shapeExprs[base];
            const se = decl ? this.resolve(expressionOf(decl)) : null;
            for (const s of shapesIn(se, this))
                parts.push(...this.shapeParts(s, seen));
        }
        parts.push(shape);
        return parts;
    }
    resolve(se) {
        for (let hops = 0; typeof se === "string" || (se && se.type === "ShapeDecl"); ++hops) {
            if (hops > 100)
                runtimeError("shape reference loop at " + se);
            if (typeof se === "string") {
                const decl = this.index.shapeExprs[se];
                if (!decl)
                    runtimeError("shape " + se + " not found in schema");
                se = decl;
            }
            else {
                se = se.shapeExpr;
            }
        }
        return se;
    }
    // -- triple expressions ---------------------------------------------------------------
    *_expression(expr, scope, subject, depth) {
        if (typeof expr === "string")
            expr = this.index.tripleExprs[expr];
        const min = expr.min !== undefined ? expr.min : 1;
        const max = expr.max !== undefined ? (expr.max === UNBOUNDED ? Infinity : expr.max) : 1;
        if (min === 1 && max === 1)
            return yield* this._once(expr, scope, subject, depth, false);
        return yield* this._repetition(expr, min, max, scope, subject, depth);
    }
    *_once(expr, scope, subject, depth, skippable) {
        switch (expr.type) {
            case "TripleConstraint":
                return yield* this._tc(expr, scope, subject, depth, skippable);
            case "EachOf": {
                const top = this._stack[this._stack.length - 1];
                const base = top ? top.lead : new Result();
                let acc = [new Result()];
                for (const e of expr.expressions) {
                    const alternatives = yield* this._expression(e, scope, subject, depth);
                    if (alternatives.length === 0) {
                        if (top)
                            top.lead = base;
                        return [];
                    }
                    acc = this._all([acc, alternatives]);
                    if (top)
                        top.lead = base.then(acc[0]);
                }
                if (top)
                    top.lead = base;
                return acc;
            }
            case "OneOf": {
                const out = [];
                for (const e of expr.expressions)
                    out.push(...(yield* this._expression(e, scope, subject, depth)));
                return this._prune(out);
            }
            default:
                runtimeError("unexpected tripleExpr type " + expr.type);
        }
    }
    *_repetition(expr, min, max, scope, subject, depth) {
        const listPath = this.listPathOf(expr);
        const skippable = min === 0;
        if (listPath === null || listPath.length <= scope.depth) {
            if (min > 1)
                return [];
            const body = yield* this._once(expr, scope, subject, depth, skippable);
            return body.length ? body : (min === 0 ? [new Result()] : []);
        }
        const cap = Math.min(max, this.maxRepeat);
        let results = [new Result()];
        let count = 0;
        for (const item of scope.descendantsAt(listPath)) {
            if (count >= cap)
                break;
            yield { type: "enter", tc: firstConstraint(expr), thread: this.threadView(this.ctx(subject, item, depth)), scope: item.path };
            const body = yield* this._once(expr, item, subject, depth, skippable);
            if (body.length === 0)
                continue; // this item does not fit the body: skip it
            results = this._all([results, body]);
            ++count;
        }
        return count >= min ? results : [];
    }
    *_tc(tc, scope, subject, depth, skippable) {
        const view = () => this.threadView(this.ctx(subject, scope, depth));
        yield { type: "tripleConstraint", tc, thread: view() };
        const before = this._failures.length;
        const out = yield* this._tcStep(tc, scope, subject, depth, skippable);
        if (out.length === 0)
            yield { type: "fail", failure: this._failures.length > before ? this._failures[this._failures.length - 1] : null,
                thread: view() };
        return out;
    }
    /** the branch being evaluated: the sum of the enclosing shapes' leading partial results */
    ctx(subject, scope, depth) {
        let lead = new Result();
        for (const c of this._stack)
            lead = lead.then(c.lead);
        return { subject, scope, depth, lead };
    }
    *_tcStep(tc, scope, subject, depth, skippable) {
        const mapExts = (tc.semActs || []).filter((ext) => ext.name === MapExt);
        const triple = (object, src) => {
            if (tc.inverse && typeof object === "object")
                return failure({ predicate: tc.predicate, tc, error: "literal subject of inverse" });
            return this._triple(tc, subject, object, src);
        };
        const failure = (f) => { this._failures.push(f); return null; };
        if (mapExts.some((ext) => (0, keys_1.isKeyCode)(ext.code)))
            return yield* this._keyed(tc, mapExts, scope, subject, depth, skippable);
        if (mapExts.length > 0) {
            const reads = new Set();
            const staticsRead = [];
            const get = (v) => {
                this._referenced.add(v);
                if (v in this.globals) {
                    staticsRead.push(v);
                    return this.globals[v];
                }
                const hit = scope.lookup(v);
                if (hit === null)
                    return undefined;
                reads.add((0, scopes_1.pathKey)(hit.scope.path) + "|" + v);
                return hit.value;
            };
            const quads = [];
            const objects = [];
            for (const ext of mapExts) {
                const code = ext.code;
                const m = code.match(variablePattern);
                const before = new Set(reads);
                staticsRead.length = 0;
                let value;
                let how;
                if (m) {
                    const varName = m[1] ? m[1] : this._expandPrefix(m[2], m[3]);
                    value = get(varName);
                    if (value === undefined)
                        return failure({ predicate: tc.predicate, tc, variable: varName, scope: scope.path }), [];
                    how = { variables: [varName] };
                }
                else if (functionPattern.test(code)) {
                    try {
                        value = extensions.lower(code, { get: (v) => { const x = get(v); return x === undefined ? undefined : x; } }, this.prefixes);
                    }
                    catch (e) {
                        return failure({ predicate: tc.predicate, tc, code, error: e.message }), [];
                    }
                    if (value === undefined || value === null)
                        return failure({ predicate: tc.predicate, tc, code, error: "unbound" }), [];
                    how = { code: code.trim(), variables: Array.from(reads).filter(r => !before.has(r)).map(r => r.split("|")[1]) };
                }
                else {
                    return failure({ predicate: tc.predicate, tc, code, error: "unrecognized Map code" }), [];
                }
                if (this.checkValues) {
                    const checked = this._checked(tc, value);
                    if (checked === null)
                        return failure({ predicate: tc.predicate, tc, code, error: "the value does not satisfy the value expression" }), [];
                    value = checked;
                }
                const object = n3ify(value);
                const src = Object.assign(how, { frame: scope.index, scope: scope.path, node: scope.nearestNode(),
                    reads: Array.from(reads).filter(r => !before.has(r)).map(r => r.split("|")),
                    statics: staticsRead.slice() });
                const q = triple(object, src);
                if (q === null)
                    return [];
                quads.push(q);
                objects.push(object);
            }
            const result = new Result(quads, reads);
            if (this.referencesShape(tc.valueExpr) && objects.length === 1 && typeof objects[0] === "string" && !objects[0].startsWith('"')) {
                // the variable names the node: materialize the nested shape on it
                if (depth >= this.maxCallDepth)
                    return failure({ predicate: tc.predicate, tc, error: "exceeded maxCallDepth" }), [];
                quads[0].src.named = true;
                const nested = yield* this._shapeExpr(tc.valueExpr, scope, objects[0], depth + 1);
                return nested.map(n => result.then(n));
            }
            return [result];
        }
        const valueExpr = tc.valueExpr === undefined ? undefined : this.resolve(tc.valueExpr);
        if (valueExpr && valueExpr.type === "NodeConstraint" && valueExpr.values && valueExpr.values.length === 1) {
            const q = triple(n3ify(valueExpr.values[0]), { constant: true, frame: scope.index, scope: scope.path, node: scope.nearestNode(), reads: [], statics: [] });
            return q === null ? [] : [new Result([q])];
        }
        if (this.referencesShape(tc.valueExpr)) {
            if (depth >= this.maxCallDepth)
                return failure({ predicate: tc.predicate, tc, error: "exceeded maxCallDepth" }), [];
            const node = this._mint(tc, scope, depth);
            const link = triple(node, { structural: true, frame: scope.index, scope: scope.path, node: scope.nearestNode(), reads: [], statics: [] });
            if (link === null)
                return [];
            const out = [];
            this._stack.push({ subject, scope, depth, lead: new Result([link]) }); // the link counts as emitted while the shape is built
            let nested;
            try {
                nested = yield* this._shapeExpr(tc.valueExpr, scope, node, depth + 1);
            }
            finally {
                this._stack.pop();
            }
            yield { type: "return", thread: this.threadView(this.ctx(subject, scope, depth)) };
            for (const n of nested) {
                if (skippable && n.reads.size === 0 && (n.quads.length === 0 || this.requireBindingsInSubshapes))
                    continue; // an optional island nothing asked for
                out.push(new Result([link].concat(n.quads), n.reads));
            }
            return out;
        }
        return failure({ predicate: tc.predicate, tc,
            error: "cannot synthesize valueExpr of type " + (valueExpr ? valueExpr.type : "undefined") + " without a Map semAct" }), [];
    }
    /** a shape-valued constraint with id(...): the node is a function of the key */
    *_keyed(tc, mapExts, scope, subject, depth, skippable) {
        if (mapExts.length > 1)
            runtimeError("id() must be the only Map code on the constraint at " + tc.predicate);
        if (!this.referencesShape(tc.valueExpr))
            runtimeError("id() at " + tc.predicate + " needs a shape-valued constraint: it names a node, not a value");
        const code = mapExts[0].code;
        let terms;
        try {
            terms = (0, keys_1.keyTerms)(code, this.prefixes);
        }
        catch (e) {
            runtimeError(e.message);
        }
        const reads = new Set();
        const staticsRead = [];
        let missing = null;
        const get = (v) => {
            this._referenced.add(v);
            if (v in this.globals) {
                staticsRead.push(v);
                return this.globals[v];
            }
            const hit = scope.lookup(v);
            if (hit === null) {
                missing = v;
                return null;
            }
            reads.add((0, scopes_1.pathKey)(hit.scope.path) + "|" + v);
            return hit.value;
        };
        const values = [];
        for (const term of terms) {
            let value;
            if (term === keys_1.NODE_ARGUMENT) {
                value = scope.nearestNode();
                if (value === null) {
                    this._failures.push({ predicate: tc.predicate, tc, code, error: "no @node in scope" });
                    return [];
                }
            }
            else if (term instanceof keys_1.Template) {
                value = term.expand(get);
            }
            else {
                value = get(term);
            }
            if (value === null || value === undefined) {
                this._failures.push({ predicate: tc.predicate, tc, variable: missing || code, scope: scope.path });
                return [];
            }
            values.push(value);
        }
        const node = values.length === 1 && !(typeof values[0] === "object")
            ? n3ify(values[0])
            : "_:k" + digest([typeof tc.valueExpr === "string" ? tc.valueExpr : "inline" + this.tcOrdinal(tc)]
                .concat(values.map(v => n3ify(v))).join("\u0000"));
        if (depth >= this.maxCallDepth) {
            this._failures.push({ predicate: tc.predicate, tc, error: "exceeded maxCallDepth" });
            return [];
        }
        const src = { keyed: code.trim(), frame: scope.index, scope: scope.path, node: scope.nearestNode(),
            reads: Array.from(reads).map(r => r.split("|")), statics: staticsRead.slice() };
        const link = tc.inverse && node.startsWith('"') ? null : this._triple(tc, subject, node, src);
        if (link === null)
            return [];
        const out = [];
        const nested = yield* this._shapeExpr(tc.valueExpr, scope, node, depth + 1);
        yield { type: "return", thread: this.threadView(this.ctx(subject, scope, depth)) };
        for (const n of nested) {
            if (skippable && n.reads.size === 0 && reads.size === 0 && (n.quads.length === 0 || this.requireBindingsInSubshapes))
                continue;
            const all = new Set(reads);
            n.reads.forEach(r => all.add(r));
            out.push(new Result([link].concat(n.quads), all));
        }
        return out;
    }
    /** the node for a shape-valued constraint without a key: determined by the root, the
     * constraint, its call depth, and the scope -- the input node it matched when it is an
     * iteration, else its path -- so runs agree and materializing a root twice adds nothing */
    _mint(tc, scope, depth) {
        const where = scope.node !== undefined && scope.node !== null ? n3ify(scope.node) : "p" + scope.path.join("_");
        return "_:m" + digest([n3ify(this._root), String(this.tcOrdinal(tc)), String(depth), where].join("\u0000"));
    }
    tcOrdinal(tc) {
        if (!this._tcIndex.has(tc))
            this._tcIndex.set(tc, this._tcIndex.size);
        return this._tcIndex.get(tc);
    }
    referencesShape(se) {
        if (se === undefined || se === null)
            return false;
        const r = this.resolve(se);
        return r && r.type !== "NodeConstraint";
    }
    // -- value expressions ----------------------------------------------------------------
    /** `value` (a JSON term) if it satisfies the constraint's value expression, a retyped
     * copy of a plain literal whose lexical form fits the expression's datatype, or null */
    _checked(tc, value) {
        if (tc.valueExpr === undefined)
            return value;
        const se = this.resolve(tc.valueExpr);
        if (!isNodeConstraintish(se, this))
            return value;
        if (this._satisfies(se, value))
            return value;
        const dt = this._datatypeOf(se);
        if (dt && typeof value === "object" && value !== null && !("type" in value) && !("language" in value)) {
            const retyped = { value: value.value, type: dt };
            if (this._satisfies(se, retyped))
                return retyped;
        }
        return null;
    }
    _datatypeOf(se) {
        se = this.resolve(se);
        if (se.type === "NodeConstraint")
            return se.datatype || null;
        if (se.type === "ShapeAnd") {
            const found = se.shapeExprs.map((p) => this._datatypeOf(p)).filter((d) => d);
            return new Set(found).size === 1 ? found[0] : null;
        }
        return null;
    }
    _satisfies(se, value) {
        se = this.resolve(se);
        switch (se.type) {
            case "NodeConstraint": {
                const res = this.validator().testNodeConstraint(n3idTerm2RdfJs(n3ify(value)), se, { label: null });
                return res.type === "NodeConstraintTest";
            }
            case "ShapeAnd":
                return se.shapeExprs.every((p) => !isNodeConstraintish(this.resolve(p), this) || this._satisfies(p, value));
            case "ShapeOr":
                return se.shapeExprs.some((p) => this._satisfies(p, value));
            case "ShapeNot":
                return !this._satisfies(se.shapeExpr, value);
            default:
                return true; // a shape: the nested materialization is the check
        }
    }
    validator() {
        if (this._validator === null) {
            const { ShExValidator } = __webpack_require__(179);
            this._validator = new ShExValidator(this.schema, {}, {});
        }
        return this._validator;
    }
    // -- which list a repetition iterates -------------------------------------------------
    listPathOf(expr) {
        if (!this._lists.has(expr))
            this._lists.set(expr, this.analyse(expr));
        return this._lists.get(expr);
    }
    /** the list the repetition `expr` iterates: the deepest list its body's variables are
     * bound at, nested repetitions counting through their parent list */
    analyse(expr) {
        const direct = new Set();
        const nested = [];
        this.collect(expr, direct, nested, new Set(), true);
        const bound = this.tree.boundAt;
        const candidates = [];
        const add = (path, why) => {
            if (!candidates.some(c => c.path.length === path.length && (0, scopes_1.isPrefix)(c.path, path)))
                candidates.push({ path, why });
        };
        for (const v of direct)
            if (v in bound)
                add(bound[v], v);
        for (const r of nested) {
            const lp = this.listPathOf(r);
            if (lp && lp.length > 0)
                add(lp.slice(0, -1), "the repetition at " + predicatesOf(r));
        }
        if (candidates.length === 0)
            return null;
        const deepest = candidates.reduce((a, b) => b.path.length > a.path.length ? b : a);
        for (const c of candidates)
            if (!(0, scopes_1.isPrefix)(c.path, deepest.path))
                runtimeError("the repetition at " + predicatesOf(expr) + " reads from unrelated lists: " +
                    c.why + " is bound at [" + c.path + "] and " + deepest.why + " at [" + deepest.path + "]");
        return deepest.path;
    }
    /** variables read directly in `expr`'s body, and the repetitions directly inside it */
    collect(expr, direct, nested, seen, top) {
        if (typeof expr === "string")
            expr = this.index.tripleExprs[expr];
        if (!expr || seen.has(expr))
            return;
        seen.add(expr);
        if (!top && !((expr.min === undefined || expr.min === 1) && (expr.max === undefined || expr.max === 1))) {
            nested.push(expr);
            return;
        }
        if (expr.type === "TripleConstraint") {
            for (const ext of (expr.semActs || []).filter((e) => e.name === MapExt)) {
                try {
                    for (const v of variablesOf(ext.code, this.prefixes))
                        direct.add(v);
                }
                catch (e) {
                    // an unparsable code fails at evaluation, where it is reported
                }
            }
            if (this.referencesShape(expr.valueExpr))
                this.collectShape(expr.valueExpr, direct, nested, seen);
        }
        else if (expr.type === "EachOf" || expr.type === "OneOf") {
            for (const e of expr.expressions)
                this.collect(e, direct, nested, seen, false);
        }
    }
    collectShape(se, direct, nested, seen) {
        if (typeof se === "string") {
            const decl = this.index.shapeExprs[se];
            if (!decl)
                return;
            for (const o of this.extensionCandidates(decl))
                this.collectShape(expressionOf(o), direct, nested, seen);
            return;
        }
        if (!se || seen.has(se))
            return;
        seen.add(se);
        if (se.type === "ShapeDecl") {
            this.collectShape(se.shapeExpr, direct, nested, seen);
        }
        else if (se.type === "Shape") {
            for (const p of this.shapeParts(se))
                if (p.expression)
                    this.collect(p.expression, direct, nested, seen, false);
        }
        else if (se.type === "ShapeAnd" || se.type === "ShapeOr") {
            for (const p of se.shapeExprs)
                this.collectShape(p, direct, nested, seen);
        }
    }
    // -- combining alternatives -----------------------------------------------------------
    /** every combination of one alternative per part, pruned as it grows */
    _all(parts) {
        let acc = [new Result()];
        for (const alternatives of parts) {
            if (alternatives.length === 0)
                return [];
            const next = [];
            for (const a of acc)
                for (const b of alternatives)
                    next.push(a.then(b));
            acc = this._prune(next);
        }
        return acc;
    }
    _prune(results) {
        if (results.length <= this.maxAccepts)
            return results;
        const ranked = results.map((r, i) => ({ r, i }))
            .sort((a, b) => betterRank(a.r, b.r) ? -1 : betterRank(b.r, a.r) ? 1 : a.i - b.i)
            .slice(0, this.maxAccepts)
            .sort((a, b) => a.i - b.i);
        this._dropped += results.length - ranked.length;
        return ranked.map(x => x.r);
    }
    /** an emitted triple with its provenance: the constraint and where its object came from */
    _triple(tc, subject, object, src) {
        const q = tc.inverse
            ? { s: object, p: tc.predicate, o: subject }
            : { s: subject, p: tc.predicate, o: object };
        q.tc = tc;
        q.src = src;
        return q;
    }
    _expandPrefix(prefix, local) {
        return prefix in this.prefixes ? this.prefixes[prefix] + local : prefix + ":" + local;
    }
    /** update - materialize into `store`, replacing what the output schema currently holds
     * at `createRoot`: `rebind(root, shape)` (a function the caller supplies, e.g. from a
     * validator over the store) returns the validation result of the store at that root, or
     * null when the root holds nothing on the schema's predicates; what it matched and is
     * no longer produced is removed, the new quads are added, and everything else is left
     * alone.  Returns {added, removed} as RdfJs quads. */
    update(store, bindingTree, createRoot, shapeLabel, rebind) {
        const quads = this.materialize(bindingTree, createRoot, shapeLabel);
        const key = (q) => [q.subject.value, q.predicate.value, q.object.termType, q.object.value,
            q.object.termType === "Literal" ? (q.object.language || q.object.datatype.value) : ""].join("\u0000");
        const produced = new Map(quads.map((q) => [key(q), q]));
        const val = rebind(createRoot, shapeLabel);
        const current = [];
        if (val !== null && val !== undefined) {
            if (val.type === "Failure" || "errors" in val)
                runtimeError(n3ify(createRoot) + " holds something that does not conform to the output schema, so what to replace cannot be told");
            const { matchedTriples } = __webpack_require__(324);
            for (const t of matchedTriples(val))
                current.push(n3idQuad2RdfJs(t.subject, t.predicate, n3ify(t.object)));
        }
        const removed = current.filter((q) => !produced.has(key(q)));
        const added = quads.filter((q) => store.countQuads(q.subject, q.predicate, q.object, q.graph) === 0);
        for (const q of removed)
            store.removeQuad(q);
        for (const q of quads)
            store.addQuad(q);
        return { added, removed };
    }
}
// -- helpers -----------------------------------------------------------------------------
function readMark(tree) {
    const byPath = new Map(tree.scopes.map(s => [(0, scopes_1.pathKey)(s.path), s.index]));
    return (r) => {
        const [path, v] = r.split("|");
        return byPath.get(path) + " " + v;
    };
}
function expressionOf(decl) {
    return decl && decl.type === "ShapeDecl" ? decl.shapeExpr : decl;
}
function idOf(se) {
    if (!idOf.ids.has(se))
        idOf.ids.set(se, String(idOf.ids.size));
    return idOf.ids.get(se);
}
idOf.ids = new WeakMap();
function shapesIn(se, m) {
    if (!se)
        return [];
    se = m.resolve(se);
    if (se.type === "Shape")
        return [se];
    if (se.type === "ShapeAnd")
        return se.shapeExprs.reduce((acc, p) => acc.concat(shapesIn(p, m)), []);
    return [];
}
function isNodeConstraintish(se, m) {
    if (!se)
        return false;
    if (se.type === "NodeConstraint")
        return true;
    if (se.type === "ShapeAnd" || se.type === "ShapeOr")
        return se.shapeExprs.some((p) => isNodeConstraintish(m.resolve(p), m));
    if (se.type === "ShapeNot")
        return isNodeConstraintish(m.resolve(se.shapeExpr), m);
    return false;
}
function variablesOf(code, prefixes) {
    const m = code.match(variablePattern);
    if (m)
        return [m[1] ? m[1] : (m[2] in prefixes ? prefixes[m[2]] + m[3] : m[2] + ":" + m[3])];
    if ((0, keys_1.isKeyCode)(code))
        return (0, keys_1.keyArguments)(code, prefixes).filter(a => a !== keys_1.NODE_ARGUMENT);
    if (functionPattern.test(code))
        return extensionVariables(code, prefixes);
    return [];
}
/** the variables a regex() or hashmap() code reads */
function extensionVariables(code, prefixes) {
    const call = /^\s*([a-zA-Z0-9]+)\s*\((.*)\)\s*$/s.exec(code);
    if (!call)
        return [];
    if (call[1] === "hashmap") {
        const first = call[2].split(",")[0].trim();
        try {
            return [(0, keys_1.expandVariable)(first, prefixes)];
        }
        catch (e) {
            return [];
        }
    }
    if (call[1] === "regex") {
        const out = [];
        for (const g of (0, keys_1.allMatches)(/\(\?<([^>]+)>/g, call[2])) {
            try {
                out.push((0, keys_1.expandVariable)(g[1].replace(/\\([\/^$])/g, "$1"), prefixes));
            }
            catch (e) { /* not a variable */ }
        }
        return out;
    }
    return [];
}
function firstConstraint(expr) {
    const stack = [expr];
    while (stack.length) {
        const e = stack.shift();
        if (!e || typeof e === "string")
            continue;
        if (e.type === "TripleConstraint")
            return e;
        if (e.expressions)
            stack.unshift(...e.expressions);
    }
    return null;
}
function predicatesOf(expr) {
    const found = [];
    const stack = [expr];
    while (stack.length && found.length < 2) {
        const e = stack.shift();
        if (!e || typeof e === "string")
            continue;
        if (e.type === "TripleConstraint")
            found.push(e.predicate);
        else if (e.expressions)
            stack.unshift(...e.expressions);
    }
    return found.join(", ") || "(no predicate)";
}
/** A stable, 16-hex-digit digest for minting blank node ids: this only needs
 * distinct strings to land on distinct keys, not cryptographic strength, so
 * it avoids `crypto` -- this package ships a browser bundle (see
 * webpack.config.js) that can't resolve Node's `crypto` module. cyrb53-style:
 * two 32-bit mixes over the string's UTF-16 code units. */
function digest(s) {
    let h1 = 0xdeadbeef ^ s.length, h2 = 0x41c6ce57 ^ s.length;
    for (let i = 0; i < s.length; ++i) {
        const ch = s.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}
function quadSignature(quads) {
    return quads.map((q) => q.subject.value + " " + q.predicate.value + " " + q.object.termType + q.object.value).sort().join("\n");
}
/** a result's emissions as RdfJs quads, without repeats, with a parallel provenance array */
function collectQuadsAndProvenance(quadList) {
    const seen = {};
    const kept = quadList.filter((t) => {
        const key = t.s + " " + t.p + " " + t.o;
        return key in seen ? false : (seen[key] = true);
    });
    const quads = kept.map((t) => n3idQuad2RdfJs(t.s, t.p, t.o));
    return {
        quads,
        provenance: kept.map((t, i) => ({ quad: quads[i], tc: t.tc, predicate: t.p, src: t.src })),
    };
}
function n3ify(ldterm) {
    if (typeof ldterm !== "object" || ldterm === null)
        return ldterm;
    const ret = "\"" + ldterm.value + "\"";
    if ("language" in ldterm)
        return ret + "@" + ldterm.language;
    if ("type" in ldterm)
        return ret + "^^" + ldterm.type;
    return ret;
}
function runtimeError(...args) {
    throw new MaterializationError(args.join(""));
}
/** MaterializerDebugger - step-through control over a materialization: drives
 * ThreadedMaterializer.run() one event at a time; synchronous.
 *
 *   const dbg = new MaterializerDebugger(materializer, bindings, "tag:root");
 *   dbg.addBreakpoint({predicate: "http://a.example/p"});
 *   let at = dbg.continue();        // runs to the breakpoint (or completion)
 *   at = dbg.stepInto();            // next event, entering subshape calls
 *   at = dbg.stepOver();            // next event at the same depth or above
 *   at = dbg.stepOut();             // next event above the current depth
 *   ... dbg.done, dbg.quads, dbg.error
 *
 * Breakpoints: {tc} a schema TripleConstraint object, {predicate} its IRI, or {subject}
 * the lexical (N3id) representation of a subject node being synthesized.
 */
class MaterializerDebugger {
    constructor(materializer, bindingTree, createRoot, shapeLabel) {
        this.materializer = materializer;
        this.generator = materializer.run(bindingTree, createRoot, shapeLabel);
        this.breakpoints = { tcs: new Set(), predicates: new Set(), subjects: new Set() };
        this.current = null;
        this.done = false;
        this.quads = null;
        this.error = null;
    }
    addBreakpoint({ tc, predicate, subject }) {
        if (tc)
            this.breakpoints.tcs.add(tc);
        if (predicate)
            this.breakpoints.predicates.add(predicate);
        if (subject)
            this.breakpoints.subjects.add(subject);
        return this;
    }
    removeBreakpoint({ tc, predicate, subject }) {
        if (tc)
            this.breakpoints.tcs.delete(tc);
        if (predicate)
            this.breakpoints.predicates.delete(predicate);
        if (subject)
            this.breakpoints.subjects.delete(subject);
        return this;
    }
    _hitsBreakpoint(event) {
        if (event.type !== "tripleConstraint")
            return false;
        return this.breakpoints.tcs.has(event.tc) ||
            this.breakpoints.predicates.has(event.tc.predicate) ||
            this.breakpoints.subjects.has(event.thread.subject);
    }
    _advance(stopWhen) {
        if (this.done)
            return this.current;
        while (true) {
            let step;
            try {
                step = this.generator.next();
            }
            catch (e) {
                this.done = true;
                this.error = e;
                return this.current = { type: "error", error: e };
            }
            if (step.done) {
                this.done = true;
                this.quads = step.value;
                this.accepts = this.materializer.accepts || [];
                return this.current = { type: "done", quads: step.value, accepts: this.accepts };
            }
            if (stopWhen(step.value) || this._hitsBreakpoint(step.value))
                return this.current = step.value;
        }
    }
    stepInto() { return this._advance(() => true); }
    stepOver() {
        const depth = this.current && this.current.thread ? this.current.thread.depth : 0;
        return this._advance((event) => event.thread && event.thread.depth <= depth);
    }
    stepOut() {
        const depth = this.current && this.current.thread ? this.current.thread.depth : 0;
        return this._advance((event) => event.thread && event.thread.depth < depth);
    }
    continue() { return this._advance(() => false); }
    /** the open shape calls (outermost first), each with its own partial emissions */
    threads() { return this.materializer.liveThreads(); }
    /** the graph as it is built so far -- every open call's emissions, aggregated */
    currentThread() { return this.materializer.currentThread(); }
}
/** tripleConstraints - every TripleConstraint of a schema in a deterministic order (see
 * the worker: an index into this ordering names the same constraint on either side of a
 * structured clone) */
function tripleConstraints(schema) {
    const found = [];
    const seen = new Set();
    const shapeExpr = (expr) => {
        if (!expr || typeof expr !== "object" || seen.has(expr))
            return;
        seen.add(expr);
        switch (expr.type) {
            case "ShapeDecl": return shapeExpr(expr.shapeExpr);
            case "ShapeAnd":
            case "ShapeOr": return (expr.shapeExprs || []).forEach(shapeExpr);
            case "ShapeNot": return shapeExpr(expr.shapeExpr);
            case "Shape": return tripleExpr(expr.expression);
        }
    };
    const tripleExpr = (expr) => {
        if (!expr || typeof expr !== "object" || seen.has(expr))
            return;
        seen.add(expr);
        switch (expr.type) {
            case "EachOf":
            case "OneOf": return (expr.expressions || []).forEach(tripleExpr);
            case "TripleConstraint":
                found.push(expr);
                return shapeExpr(expr.valueExpr);
        }
    };
    (schema.shapes || []).forEach(shapeExpr);
    return found;
}
module.exports = { BS: ThreadedMaterializer, fW: MaterializerDebugger,
    ...void (normalizeBindingTree), ...void (normalizeBindingTreeWithOrigins),
    k: MaterializationError, Fl: tripleConstraints, ...void (bindingTree_1.NODE_KEY) };
//# sourceMappingURL=ThreadedMaterializer.js.map

/***/ },

/***/ 459
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;
/** analysis - static checks of a ShExMap schema pair, before any data.
 *
 * `analyse(inputSchema, outputSchema)` says whether every output repetition has a
 * well-formed iteration scope, whether every variable the output reads is bound in the
 * input where it can be read from, and which bindings go unused -- the questions
 * materialization would otherwise answer at run time, one graph at a time.
 *
 * A variable's SITE is the chain of repeated constraints and groups of the input schema
 * that enclose its %Map code: it is bound once per iteration of the innermost one, or
 * once for the whole tree when the chain is empty.  An output repetition's ITERATION
 * SCOPE is the deepest site among the variables its body reads, nested repetitions
 * counting through their parent site; it is ill-formed when two of those sites lie in
 * unrelated lists.  A constraint may read a variable whose site is an ancestor of (or
 * equal to) the scope it is evaluated at; a deeper site means "which one?", and an
 * unrelated one means the value is not in scope.
 */

__webpack_unused_export__ = ({ value: true });
exports.pl = void 0;
exports.KH = analyse;
const keys_1 = __webpack_require__(525);
const MapExt = "http://shex.io/extensions/Map/#";
const variablePattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;
const functionPattern = /^\s*[a-zA-Z0-9]+\(.*\)\s*$/;
class Report {
    constructor(prefixes) {
        this.errors = [];
        this.warnings = [];
        this.bound = new Map(); // input variable -> site
        this.read = new Set(); // variables the output reads
        this.prefixes = prefixes;
    }
    get ok() { return this.errors.length === 0; }
    where(site) {
        return site.length === 0 ? "the root" : "each " + site.map(e => label(e)).join(" / ");
    }
    /** `text` with every namespace the schemas declare written as its prefix */
    short(text) {
        for (const [prefix, ns] of Object.entries(this.prefixes).sort((a, b) => b[1].length - a[1].length))
            if (ns)
                text = text.split(ns).join(prefix + ":");
        return text;
    }
    error(message) { this.errors.push(this.short(message)); }
    warn(message) { this.warnings.push(this.short(message)); }
    toString() {
        const lines = this.errors.map(e => "error: " + e).concat(this.warnings.map(w => "warning: " + w));
        return lines.length ? lines.join("\n") : "ok: the schemas map coherently";
    }
}
exports.pl = Report;
/** check that `outputSchema` can be materialized coherently from what `inputSchema` binds;
 * schemas are parsed ShExJ (with _index and _prefixes), `options.staticVars` the IRIs of
 * static variables, `options.inputStart`/`outputStart` shape labels (default: start) */
function analyse(inputSchema, outputSchema, options = {}) {
    const prefixes = Object.assign({}, outputSchema._prefixes || outputSchema.prefixes || {}, inputSchema._prefixes || inputSchema.prefixes || {});
    const report = new Report(prefixes);
    const statics = options.staticVars || [];
    new Input(inputSchema, prefixes, report).run(start(inputSchema, options.inputStart));
    new Output(outputSchema, prefixes, report, new Set(statics)).run(start(outputSchema, options.outputStart));
    for (const [v, site] of report.bound)
        if (!report.read.has(v))
            report.warn(`${v} is bound (at ${report.where(site)}) but the output never reads it`);
    for (const v of statics.filter(s => !report.read.has(s)).sort())
        report.warn(`static variable ${v} is never read`);
    return report;
}
function start(schema, given) {
    if (given)
        return given;
    if (!schema.start)
        throw Error("the schema has no start shape; name one");
    return schema.start;
}
function isRepetition(expr) {
    return !((expr.min === undefined || expr.min === 1) && (expr.max === undefined || expr.max === 1));
}
function isRepeated(expr) {
    return expr.max !== undefined && expr.max !== 1;
}
function label(expr) {
    const found = [];
    const stack = [expr];
    while (stack.length && found.length < 2) {
        const e = stack.shift();
        if (!e || typeof e === "string")
            continue;
        if (e.type === "TripleConstraint")
            found.push((e.inverse ? "^" : "") + e.predicate);
        else if (e.expressions)
            stack.unshift(...e.expressions);
    }
    return found.length > 1 ? "(" + found.join(", ") + ")" : found.length ? found[0] : "(group)";
}
/** (variables bound or read by a constraint's Map codes, id() arguments) */
function variables(tc, prefixes) {
    const plain = [];
    const keys = [];
    let hasKey = false;
    for (const act of (tc.semActs || []).filter((a) => a.name === MapExt)) {
        const code = act.code || "";
        try {
            if ((0, keys_1.isKeyCode)(code)) {
                hasKey = true;
                keys.push(...(0, keys_1.keyArguments)(code, prefixes).filter(a => a !== keys_1.NODE_ARGUMENT));
            }
            else if (code.match(variablePattern)) {
                const m = code.match(variablePattern);
                plain.push(m[1] ? m[1] : (m[2] in prefixes ? prefixes[m[2]] + m[3] : m[2] + ":" + m[3]));
            }
            else if (functionPattern.test(code)) {
                plain.push(...functionVariables(code, prefixes));
            }
        }
        catch (e) {
            // an unparsable code is reported when it runs
        }
    }
    return { plain, keys, hasKey };
}
function functionVariables(code, prefixes) {
    const call = /^\s*([a-zA-Z0-9]+)\s*\((.*)\)\s*$/s.exec(code);
    if (!call)
        return [];
    if (call[1] === "hashmap")
        return [(0, keys_1.expandVariable)(call[2].split(",")[0].trim(), prefixes)];
    if (call[1] === "regex") {
        const out = [];
        for (const g of (0, keys_1.allMatches)(/\(\?<([^>]+)>/g, call[2]))
            out.push((0, keys_1.expandVariable)(g[1].replace(/\\([\/^$])/g, "$1"), prefixes));
        return out;
    }
    return [];
}
class Walker {
    constructor(schema, prefixes, report) {
        this.schema = schema;
        this.prefixes = prefixes;
        this.report = report;
        this.index = schema._index || (__webpack_require__(747).ShExIndexVisitor).index(schema);
    }
    decl(ref) { return this.index.shapeExprs[ref]; }
    candidates(decl) {
        const found = [];
        if (!decl.abstract)
            found.push(decl);
        const queue = [decl.id];
        const seen = new Set();
        while (queue.length) {
            const base = queue.shift();
            for (const other of this.schema.shapes || []) {
                const shape = other.type === "ShapeDecl" ? other.shapeExpr : other;
                if (shape && shape.extends && shape.extends.indexOf(base) !== -1 && !seen.has(other.id)) {
                    seen.add(other.id);
                    if (!other.abstract)
                        found.push(other);
                    queue.push(other.id);
                }
            }
        }
        return found;
    }
    parts(shape, seen = new Set()) {
        const out = [];
        for (const base of shape.extends || []) {
            if (seen.has(base))
                continue;
            seen.add(base);
            const d = this.decl(base);
            const se = d ? (d.type === "ShapeDecl" ? d.shapeExpr : d) : null;
            if (se && se.type === "Shape")
                out.push(...this.parts(se, seen));
        }
        out.push(shape);
        return out;
    }
    resolveExpr(e) { return typeof e === "string" ? this.index.tripleExprs[e] : e; }
}
/** where the input schema binds each variable */
class Input extends Walker {
    constructor() {
        super(...arguments);
        this.seen = new Set();
    }
    run(se) { this.shapeExpr(se, []); }
    shapeExpr(se, site) {
        if (typeof se === "string") {
            const d = this.decl(se);
            if (d)
                for (const o of this.candidates(d))
                    this.shapeExpr(o.type === "ShapeDecl" ? o.shapeExpr : o, site);
            return;
        }
        if (!se || this.seen.has(se))
            return;
        this.seen.add(se);
        if (se.type === "ShapeDecl")
            this.shapeExpr(se.shapeExpr, site);
        else if (se.type === "Shape")
            for (const p of this.parts(se))
                if (p.expression)
                    this.expression(p.expression, site);
                else if (se.type === "ShapeAnd" || se.type === "ShapeOr")
                    for (const p of se.shapeExprs)
                        this.shapeExpr(p, site);
    }
    expression(expr, site) {
        expr = this.resolveExpr(expr);
        if (!expr)
            return;
        if (isRepeated(expr))
            site = site.concat([expr]);
        if (expr.type === "TripleConstraint") {
            for (const v of variables(expr, this.prefixes).plain) {
                const at = this.report.bound.get(v);
                if (at === undefined)
                    this.report.bound.set(v, site);
                else if (!sameSite(at, site))
                    this.report.error(`${v} is bound at two places of the input schema, ${this.report.where(at)} and ` +
                        `${this.report.where(site)}; a variable must have one binding site`);
            }
            if (expr.valueExpr !== undefined && typeof expr.valueExpr !== "object" || (expr.valueExpr && expr.valueExpr.type !== "NodeConstraint"))
                this.shapeExpr(expr.valueExpr, site);
        }
        else if (expr.type === "EachOf" || expr.type === "OneOf") {
            for (const e of expr.expressions)
                this.expression(e, site);
        }
    }
}
function sameSite(a, b) {
    return a.length === b.length && a.every((x, i) => x === b[i]);
}
function isPrefixSite(a, b) {
    return a.length <= b.length && a.every((x, i) => x === b[i]);
}
/** where the output schema reads each variable, and what each repetition iterates */
class Output extends Walker {
    constructor(schema, prefixes, report, statics) {
        super(schema, prefixes, report);
        this.statics = statics;
        this.scopes = new Map();
        this.illFormed = new Set();
        this.active = new Set();
    }
    run(se) { this.shapeExpr(se, []); }
    shapeExpr(se, scope) {
        if (typeof se === "string") {
            const d = this.decl(se);
            if (!d) {
                this.report.error(`the output schema references ${se}, which it does not define`);
                return;
            }
            const options = this.candidates(d);
            if (options.length === 0)
                this.report.error(`${se} is abstract and nothing extends it`);
            for (const o of options)
                this.shapeExpr(o.type === "ShapeDecl" ? o.shapeExpr : o, scope);
            return;
        }
        if (!se || this.active.has(se))
            return;
        this.active.add(se);
        try {
            if (se.type === "ShapeDecl")
                this.shapeExpr(se.shapeExpr, scope);
            else if (se.type === "Shape")
                for (const p of this.parts(se))
                    if (p.expression)
                        this.expression(p.expression, scope);
                    else if (se.type === "ShapeAnd" || se.type === "ShapeOr")
                        for (const p of se.shapeExprs)
                            if (!(p && p.type === "NodeConstraint"))
                                this.shapeExpr(p, scope);
                            else if (se.type !== "NodeConstraint")
                                this.report.error(`${se.type} cannot be materialized`);
        }
        finally {
            this.active.delete(se);
        }
    }
    expression(expr, scope) {
        expr = this.resolveExpr(expr);
        if (!expr)
            return;
        let bodyScope = scope;
        if (isRepetition(expr)) {
            const iterates = this.iterationScope(expr);
            if (this.illFormed.has(expr))
                return; // its structure is the error; its reads would only repeat it
            bodyScope = iterates !== null && iterates.length > scope.length ? iterates : scope;
        }
        if (expr.type === "TripleConstraint")
            this.constraint(expr, bodyScope);
        else if (expr.type === "EachOf" || expr.type === "OneOf")
            for (const e of expr.expressions)
                this.expression(e, bodyScope);
    }
    constraint(tc, scope) {
        const { plain, keys, hasKey } = variables(tc, this.prefixes);
        const acts = (tc.semActs || []).filter((a) => a.name === MapExt);
        if (hasKey) {
            if (acts.length > 1)
                this.report.error(`id() must be the only Map code on ${tc.predicate}`);
            if (!(tc.valueExpr !== undefined && (typeof tc.valueExpr === "string" || tc.valueExpr.type !== "NodeConstraint")))
                this.report.error(`id() on ${tc.predicate} needs a shape-valued constraint`);
            if (acts.some((a) => (0, keys_1.isKeyCode)(a.code || "") && (0, keys_1.keyArguments)(a.code, this.prefixes).indexOf(keys_1.NODE_ARGUMENT) !== -1) && scope.length === 0)
                this.report.error(`id(@node) on ${tc.predicate} is read at the root, where no input iteration provides a node`);
        }
        for (const v of plain.concat(keys))
            this.readVariable(v, tc, scope);
        if (tc.valueExpr !== undefined && (typeof tc.valueExpr === "string" || tc.valueExpr.type !== "NodeConstraint"))
            this.shapeExpr(tc.valueExpr, scope);
    }
    readVariable(v, tc, scope) {
        this.report.read.add(v);
        if (this.statics.has(v))
            return;
        const site = this.report.bound.get(v);
        if (site === undefined) {
            this.report.error(`${tc.predicate} reads ${v}, which the input schema never binds`);
            return;
        }
        if (isPrefixSite(site, scope))
            return; // bound here or above: readable
        if (isPrefixSite(scope, site))
            this.report.error(`${tc.predicate} reads ${v}, bound once per ${this.report.where(site)}, from ` +
                `${this.report.where(scope)}: which one?  A repetition over it is needed`);
        else
            this.report.error(`${tc.predicate} reads ${v}, bound at ${this.report.where(site)}, from ` +
                `${this.report.where(scope)}, which is not below it`);
    }
    iterationScope(expr) {
        if (this.scopes.has(expr))
            return this.scopes.get(expr);
        this.scopes.set(expr, null);
        const direct = new Set();
        const nested = [];
        this.collect(expr, direct, nested, new Set(), true);
        const candidates = [];
        const add = (site, why) => {
            if (!candidates.some(c => sameSite(c.site, site)))
                candidates.push({ site, why });
        };
        for (const v of direct)
            if (this.report.bound.has(v))
                add(this.report.bound.get(v), v);
        for (const r of nested) {
            const sub = this.iterationScope(r);
            if (sub && sub.length)
                add(sub.slice(0, -1), "the repetition over " + label(r));
        }
        let result = null;
        if (candidates.length) {
            const deepest = candidates.reduce((a, b) => b.site.length > a.site.length ? b : a);
            result = deepest.site;
            for (const c of candidates)
                if (!isPrefixSite(c.site, deepest.site)) {
                    this.report.error(`the repetition over ${label(expr)} reads from unrelated lists: ${c.why} is bound at ` +
                        `${this.report.where(c.site)} and ${deepest.why} at ${this.report.where(deepest.site)}`);
                    this.illFormed.add(expr);
                    direct.forEach(v => this.report.read.add(v));
                    break;
                }
        }
        this.scopes.set(expr, result);
        return result;
    }
    collect(expr, direct, nested, seen, top) {
        expr = this.resolveExpr(expr);
        if (!expr || seen.has(expr))
            return;
        seen.add(expr);
        if (!top && isRepetition(expr)) {
            nested.push(expr);
            return;
        }
        if (expr.type === "TripleConstraint") {
            const { plain, keys } = variables(expr, this.prefixes);
            plain.concat(keys).forEach(v => direct.add(v));
            if (expr.valueExpr !== undefined && (typeof expr.valueExpr === "string" || expr.valueExpr.type !== "NodeConstraint"))
                this.collectShape(expr.valueExpr, direct, nested, seen);
        }
        else if (expr.type === "EachOf" || expr.type === "OneOf") {
            for (const e of expr.expressions)
                this.collect(e, direct, nested, seen, false);
        }
    }
    collectShape(se, direct, nested, seen) {
        if (typeof se === "string") {
            const d = this.decl(se);
            if (d)
                for (const o of this.candidates(d))
                    this.collectShape(o.type === "ShapeDecl" ? o.shapeExpr : o, direct, nested, seen);
            return;
        }
        if (!se || seen.has(se))
            return;
        seen.add(se);
        if (se.type === "ShapeDecl")
            this.collectShape(se.shapeExpr, direct, nested, seen);
        else if (se.type === "Shape")
            for (const p of this.parts(se))
                if (p.expression)
                    this.collect(p.expression, direct, nested, seen, false);
                else if (se.type === "ShapeAnd" || se.type === "ShapeOr")
                    for (const p of se.shapeExprs)
                        this.collectShape(p, direct, nested, seen);
    }
}
//# sourceMappingURL=analysis.js.map

/***/ },

/***/ 324
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;
/** bindingTree - the ShExMap binding tree of a validation result, read structurally.
 *
 * A validation result is a tree of shape tests; each `TestedTriple` carries the
 * `%Map:{ … %}` bindings its constraint made under `extensions`.  This walks it into
 * the binding-tree grammar both implementations exchange (see ../doc/iteration-scopes.md):
 *
 *   Scope      ::= Object                    -- own bindings, no repeated parts
 *                | [ Object, List* ]         -- own bindings (maybe {}), then one list per
 *                                            --   repeated constraint or group, in schema order
 *   List       ::= [ Object* ] | [ ScopeArray* ]   -- iterations, all objects or all arrays
 *
 * A repeated constraint or group (max other than 1) makes one list, an iteration per
 * match, EMPTY when nothing matched, so a list's position says which expression it came
 * from whatever the data.  A non-repeated nested shape merges into the scope that
 * matched it.  An iteration of a repeated shape-valued constraint records the node the
 * nested shape matched as "@node" (the subject for an inverse constraint) -- a reserved
 * key, never a variable.  EXTENDS results (`ExtendedResults`) merge the extended shapes'
 * bindings and the local ones into one scope, which `ShExUtil.valToExtension` never did.
 *
 * `ShExUtil.valToExtension` remains for the legacy materializers; ThreadedMaterializer
 * reads both layouts.
 */

__webpack_unused_export__ = ({ value: true });
exports.NODE_KEY = void 0;
exports.Y = bindingTree;
exports.matchedTriples = matchedTriples;
const MapExt = "http://shex.io/extensions/Map/#";
exports.NODE_KEY = "@node";
const EMPTY = () => ({ vars: {}, lists: [] });
function merge(a, b) {
    return { vars: Object.assign({}, a.vars, b.vars), lists: a.lists.concat(b.lists) };
}
function isRepeated(sol) {
    return "max" in sol && sol.max !== undefined && sol.max !== 1;
}
function hasBindings(rec) {
    return Object.keys(rec.vars).some(k => k !== exports.NODE_KEY) || rec.lists.some(l => l.some(hasBindings));
}
/** the binding tree of a shapeExprTest (as `resultMapToShapeExprTest` gives it) */
function bindingTree(val, extensionUrl = MapExt) {
    return toJson(scopeOf(val, extensionUrl));
}
function toJson(rec) {
    if (rec.lists.length === 0)
        return rec.vars;
    const lists = rec.lists.map(list => {
        const iterations = list.map(toJson);
        return iterations.some(Array.isArray) ? iterations.map(it => Array.isArray(it) ? it : [it]) : iterations;
    });
    return [rec.vars].concat(lists);
}
function scopeOf(val, ext, focus) {
    if (val === null || val === undefined || typeof val === "string")
        return EMPTY();
    switch (val.type) {
        case "ShapeTest":
            return "solution" in val && val.solution ? solutionRec(val.solution, ext, val.node) : EMPTY();
        case "ShapeAndResults":
        case "ExtensionResults":
        case "SolutionList":
            return (val.solutions || []).reduce((acc, s) => merge(acc, scopeOf(s, ext, focus)), EMPTY());
        case "ExtendedResults": // the extended shapes' results, and the shape's own solutions
            return merge(scopeOf(val.extensions, ext, focus), solutionRec(val.local, ext, focus));
        case "ShapeOrResults":
            return scopeOf(val.solution, ext, focus);
        case "TripleConstraintSolutions":
        case "EachOfSolutions":
        case "OneOfSolutions":
            return solutionRec(val, ext, focus);
        default: // NodeConstraintTest, ShapeNot*, Failure, Recursion: bind nothing
            return EMPTY();
    }
}
function solutionRec(sol, ext, focus) {
    switch (sol.type) {
        case "TripleConstraintSolutions": {
            const solutions = sol.solutions || [];
            if (isRepeated(sol)) {
                const iterations = solutions.map((t) => iteration(t, focus, ext)).filter(hasBindings);
                return { vars: {}, lists: [iterations] };
            }
            return solutions.reduce((acc, t) => merge(acc, bindingsOf(t, ext)), EMPTY());
        }
        case "EachOfSolutions":
        case "OneOfSolutions": {
            const groups = (sol.solutions || []).map((g) => (g.expressions || []).reduce((acc, e) => merge(acc, solutionRec(e, ext, focus)), EMPTY()));
            if (isRepeated(sol))
                return { vars: {}, lists: [groups.filter(hasBindings)] };
            return groups.reduce((acc, g) => merge(acc, g), EMPTY());
        }
        case "ExtendedResults": // a shape test's solution, when the shape EXTENDS others
        case "ShapeAndResults":
        case "ExtensionResults":
            return scopeOf(sol, ext, focus);
        default:
            return EMPTY();
    }
}
/** the bindings one tested triple made: its constraint's Map codes, and the nested shape's */
function bindingsOf(t, ext) {
    const own = t.extensions && t.extensions[ext] ? Object.assign({}, t.extensions[ext]) : {};
    const nested = "referenced" in t ? scopeOf(t.referenced, ext) : EMPTY();
    return { vars: Object.assign(own, nested.vars), lists: nested.lists };
}
/** one iteration of a repeated shape-valued constraint: its node first.  An inverse
 * constraint's tested triple has the focus as its object; the node is then its subject. */
function iteration(t, focus, ext) {
    const rec = bindingsOf(t, ext);
    const node = sameTerm(t.subject, focus) ? t.object : t.subject;
    const referencesShape = "referenced" in t && t.referenced && t.referenced.type !== "NodeConstraintTest";
    return referencesShape ? { vars: Object.assign({ [exports.NODE_KEY]: node }, rec.vars), lists: rec.lists } : rec;
}
function sameTerm(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
/** every triple the validation matched, as N3id `{subject, predicate, object}` */
function matchedTriples(val) {
    const out = [];
    const seen = new Set();
    (function walk(v) {
        if (v === null || v === undefined || typeof v !== "object")
            return;
        if (Array.isArray(v))
            return v.forEach(walk);
        if (v.type === "TestedTriple") {
            const key = JSON.stringify([v.subject, v.predicate, v.object]);
            if (!seen.has(key)) {
                seen.add(key);
                out.push({ subject: v.subject, predicate: v.predicate, object: v.object });
            }
        }
        for (const k of Object.keys(v))
            if (k !== "valueExpr" && k !== "shapeExpr" && k !== "semActs")
                walk(v[k]);
    })(val);
    return out;
}
//# sourceMappingURL=bindingTree.js.map

/***/ },

/***/ 443
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const term_1 = __webpack_require__(811);
const Split = "<span class='keyword' title='Split'>|</span>";
const Rept = "<span class='keyword' title='Repeat'>×</span>";
const Match = "<span class='keyword' title='Match'>␃</span>";
const UNBOUNDED = -1;
/* compileNFA - compile regular expression and index triple constraints
 */
function compileNFA(schema, shape) {
    const expression = shape.expression;
    return NFA();
    function NFA() {
        // wrapper for states, startNo and matchstate
        const states = [];
        const matchstate = State_make(Match, []);
        let startNo = matchstate;
        let pair;
        if (expression) {
            const pair = walkExpr(expression, []);
            patch(pair.tail, matchstate);
            startNo = pair.start;
        }
        const ret = {
            algorithm: "rbenx",
            end: matchstate,
            states: states,
            start: startNo,
            match: rbenx_match
        };
        // matchstate = states = startNo = null;
        return ret;
        function walkExpr(expr, stack) {
            let s = 0, starts;
            let lastTail = [];
            function maybeAddRept(start, tail) {
                if ((expr.min == undefined || expr.min === 1) &&
                    (expr.max == undefined || expr.max === 1))
                    return { start: start, tail: tail };
                s = State_make(Rept, [start]);
                states[s].expr = expr;
                // cache min/max in normalized form for simplicity of comparison.
                states[s].min = "min" in expr ? expr.min : 1;
                states[s].max = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
                patch(tail, s);
                return { start: s, tail: [s] };
            }
            if (expr.type === "TripleConstraint") {
                s = State_make(expr, []);
                states[s].stack = stack;
                return { start: s, tail: [s] };
                // maybeAddRept(s, [s]);
            }
            else if (expr.type === "OneOf") {
                lastTail = [];
                starts = [];
                expr.expressions.forEach(function (nested, ord) {
                    pair = walkExpr(nested, stack.concat({ c: expr, e: ord }));
                    starts.push(pair.start);
                    lastTail = lastTail.concat(pair.tail);
                });
                s = State_make(Split, starts);
                states[s].expr = expr;
                return maybeAddRept(s, lastTail);
            }
            else if (expr.type === "EachOf") {
                expr.expressions.forEach(function (nested, ord) {
                    pair = walkExpr(nested, stack.concat({ c: expr, e: ord }));
                    if (ord === 0)
                        s = pair.start;
                    else
                        patch(lastTail, pair.start);
                    lastTail = pair.tail;
                });
                return maybeAddRept(s, lastTail);
            }
            else if (expr.type === "Inclusion") {
                const included = schema.productions[expr.include];
                return walkExpr(included, stack);
            }
            throw Error("unexpected expr type: " + expr.type);
        }
        // removed by dead control flow

        function State_make(c, outs, negated) {
            const ret = states.length;
            states.push({ c: c, outs: outs });
            if (negated)
                states[ret].negated = true; // only include if true for brevity
            return ret;
        }
        function patch(l, target) {
            l.forEach(elt => {
                states[elt].outs.push(target);
            });
        }
    }
    function rbenx_match(_graph, node, constraintList, synthesize, /* constraintToTripleMapping, tripleToConstraintMapping, */ neighborhood, recurse, direct, semActHandler, checkValueExpr, trace) {
        const rbenx = this;
        let clist = [], nlist = []; // list of {state:state number, repeats:stateNo->repetitionCount}
        function resetRepeat(thread, repeatedState) {
            const trimmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
                if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
                    r[k] = thread.repeats[k];
                return r;
            }, {});
            return { state: thread.state /*???*/, repeats: trimmedRepeats, matched: thread.matched, avail: thread.avail.slice(), stack: thread.stack };
        }
        function incrmRepeat(thread, repeatedState) {
            const incrmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
                r[k] = parseInt(k) == repeatedState ? thread.repeats[k] + 1 : thread.repeats[k];
                return r;
            }, {});
            return { state: thread.state /*???*/, repeats: incrmedRepeats, matched: thread.matched, avail: thread.avail.slice(), stack: thread.stack };
        }
        function stateString(state, repeats) {
            const rs = Object.keys(repeats).map(rpt => {
                return rpt + ":" + repeats[rpt];
            }).join(",");
            return rs.length ? state + "-" + rs : "" + state;
        }
        function addstate(list, stateNo, thread, seen) {
            seen = seen || [];
            const seenkey = stateString(stateNo, thread.repeats);
            if (seen.indexOf(seenkey) !== -1)
                return [];
            seen.push(seenkey);
            const s = rbenx.states[stateNo];
            if (s.c === Split) {
                return s.outs.reduce((ret, o) => {
                    return ret.concat(addstate(list, o, thread, seen));
                }, []);
                // } else if (s.c.type === "OneOf" || s.c.type === "EachOf") { // don't need Rept
            }
            else if (s.c === Rept) {
                let ret = [];
                // matched = [matched].concat("Rept" + s.expr);
                if (!(stateNo in thread.repeats))
                    thread.repeats[stateNo] = 0;
                const repetitions = thread.repeats[stateNo];
                // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
                if (repetitions < s.max)
                    ret = ret.concat(addstate(list, s.outs[0], incrmRepeat(thread, stateNo), seen)); // outs[0] to repeat
                if (repetitions >= s.min && repetitions <= s.max)
                    ret = ret.concat(addstate(list, s.outs[1], resetRepeat(thread, stateNo), seen)); // outs[1] when done
                return ret;
            }
            else {
                // if (stateNo !== rbenx.end || !thread.avail.reduce((r2, avail) => { faster if we trim early??
                //   return r2 || avail.length > 0;
                // }, false))
                return [list.push({
                        state: stateNo,
                        repeats: thread.repeats,
                        avail: thread.avail.map((a) => {
                            return a.slice();
                        }),
                        stack: thread.stack,
                        matched: thread.matched,
                        errors: thread.errors
                    }) - 1];
            }
        }
        if (rbenx.states.length === 1)
            return matchedToResult([], constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr);
        let chosen = null;
        // const dump = nfaToString();
        // console.log(dump.nfa(this.states, this.start));
        addstate(clist, this.start, { repeats: {}, avail: [], matched: [], stack: [], errors: [] });
        while (clist.length) {
            nlist.length = 0;
            if (trace)
                trace.push({ threads: [] });
            for (let threadno = 0; threadno < clist.length; ++threadno) {
                const thread = clist[threadno];
                if (thread.state === rbenx.end)
                    continue;
                const state = rbenx.states[thread.state];
                const nlistlen = nlist.length;
                const constraintNo = constraintList.indexOf(state.c);
                // may be Accept!
                let min = "min" in state.c ? state.c.min : 1;
                let max = "max" in state.c ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
                if ("negated" in state.c && state.c.negated)
                    min = max = 0;
                if (thread.avail[constraintNo] === undefined)
                    thread.avail[constraintNo] = synthesize(constraintNo, min, max, neighborhood);
                const taken = thread.avail[constraintNo].splice(0, max);
                if (taken.length >= min) {
                    do {
                        // find the exprs that require repetition
                        const exprs = rbenx.states.map((x) => { return x.c === Rept ? x.expr : null; });
                        const newStack = state.stack.map((e) => {
                            let i = thread.repeats[exprs.indexOf(e.c)];
                            if (i === undefined)
                                i = 0; // expr has no repeats
                            else
                                i = i - 1;
                            return { c: e.c, e: e.e, i: i };
                        });
                        const withIndexes = {
                            c: state.c,
                            triples: taken,
                            stack: newStack
                        };
                        thread.matched = thread.matched.concat(withIndexes);
                        state.outs.forEach((o) => {
                            addstate(nlist, o, thread);
                        });
                    } while ((function () {
                        if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                            taken.push(thread.avail[constraintNo].shift());
                            return true; // stay in look to take more.
                        }
                        else {
                            return false; // no more to take or we're already at max
                        }
                    })());
                }
                if (trace)
                    trace[trace.length - 1].threads.push({
                        state: clist[threadno].state,
                        to: nlist.slice(nlistlen).map((x) => {
                            return stateString(x.state, x.repeats);
                        })
                    });
            }
            // console.log(dump.threadList(nlist));
            if (nlist.length === 0 && chosen === null)
                return reportError(localExpect(clist, rbenx.states));
            const t = clist;
            clist = nlist;
            nlist = t;
            const longerChosen = clist.reduce((ret, elt) => {
                const matchedAll = 
                // elt.matched.reduce((ret, m) => {
                //   return ret + m.triples.length; // count matched triples
                // }, 0) === tripleToConstraintMapping.reduce((ret, t) => {
                //   return t === undefined ? ret : ret + 1; // count expected
                // }, 0);
                true;
                return ret !== null ? ret : (elt.state === rbenx.end && matchedAll) ? elt : null;
            }, null);
            if (longerChosen)
                chosen = longerChosen;
            // if (longerChosen !== null)
            //   console.log(JSON.stringify(matchedToResult(longerChosen.matched)));
        }
        if (chosen === null)
            return reportError(localExpect(clist, rbenx.states));
        function reportError(errors) {
            return {
                type: "Failure",
                node: node,
                errors: errors
            };
        }
        function localExpect(clist, states) {
            const lastState = states[states.length - 1];
            return clist.map(t => {
                const c = rbenx.states[t.state].c;
                // if (c === Match)
                //   return { type: "EndState999" };
                const valueExpr = extend({}, c.valueExpr);
                if ("reference" in valueExpr) {
                    const ref = valueExpr.reference;
                    if (ref.termType === "BlankNode")
                        valueExpr.reference = schema.shapes[ref];
                }
                return extend({
                    type: lastState.c.negated ? "NegatedProperty" :
                        t.state === rbenx.end ? "ExcessTripleViolation" :
                            "MissingProperty",
                    property: lastState.c.predicate
                }, Object.keys(valueExpr).length > 0 ? { valueExpr: valueExpr } : {});
            });
        }
        // console.log("chosen:", dump.thread(chosen));
        return "errors" in chosen.matched ?
            chosen.matched :
            matchedToResult(chosen.matched, constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr);
    }
    function matchedToResult(matched, _constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr) {
        let last = [];
        const errors = [];
        const skips = [];
        const ret = matched.reduce((out, m) => {
            let mis = 0;
            let ptr = out, t;
            while (mis < last.length &&
                m.stack[mis].c === last[mis].c && // constraint
                m.stack[mis].i === last[mis].i && // iteration number
                m.stack[mis].e === last[mis].e) { // (dis|con)junction number
                ptr = ptr.solutions[last[mis].i].expressions[last[mis].e];
                ++mis;
            }
            while (mis < m.stack.length) {
                if (mis >= last.length) {
                    last.push({});
                }
                if (m.stack[mis].c !== last[mis].c) {
                    t = [];
                    ptr.type = m.stack[mis].c.type === "EachOf" ? "EachOfSolutions" : "OneOfSolutions", ptr.solutions = t;
                    if ("min" in m.stack[mis].c)
                        ptr.min = m.stack[mis].c.min;
                    if ("max" in m.stack[mis].c)
                        ptr.max = m.stack[mis].c.max;
                    if ("annotations" in m.stack[mis].c)
                        ptr.annotations = m.stack[mis].c.annotations;
                    if ("semActs" in m.stack[mis].c)
                        ptr.semActs = m.stack[mis].c.semActs;
                    ptr = t;
                    last[mis].i = null;
                    // !!! on the way out to call after valueExpr test
                    if ("semActs" in m.stack[mis].c) {
                        if (!semActHandler.dispatchAll(m.stack[mis].c.semActs, "???", ptr))
                            throw { type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] };
                    }
                    // if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
                }
                else {
                    ptr = ptr.solutions;
                }
                if (m.stack[mis].i !== last[mis].i) {
                    t = [];
                    ptr[m.stack[mis].i] = {
                        type: m.stack[mis].c.type === "EachOf" ? "EachOfSolution" : "OneOfSolution",
                        expressions: t
                    };
                    ptr = t;
                    last[mis].e = null;
                }
                else {
                    ptr = ptr[last[mis].i].expressions;
                }
                if (m.stack[mis].e !== last[mis].e) {
                    t = {};
                    ptr[m.stack[mis].e] = t;
                    if (m.stack[mis].e > 0 && ptr[m.stack[mis].e - 1] === undefined && skips.indexOf(ptr) === -1)
                        skips.push(ptr);
                    ptr = t;
                    last.length = mis + 1; // chop off last so we create everything underneath
                }
                else {
                    throw "how'd we get here?";
                }
                ++mis;
            }
            ptr.type = "TripleConstraintSolutions";
            if ("min" in m.c)
                ptr.min = m.c.min;
            if ("max" in m.c)
                ptr.max = m.c.max;
            ptr.predicate = m.c.predicate;
            if ("valueExpr" in m.c)
                ptr.valueExpr = m.c.valueExpr;
            if ("productionLabel" in m.c)
                ptr.productionLabel = m.c.productionLabel;
            ptr.solutions = m.triples.map((tno) => {
                const triple = neighborhood[tno];
                const ret = {
                    type: "TestedTriple",
                    subject: (0, term_1.rdfJsTerm2Ld)(triple.subject),
                    predicate: (0, term_1.rdfJsTerm2Ld)(triple.predicate),
                    object: (0, term_1.rdfJsTerm2Ld)(triple.object)
                };
                function diver(focus, shape, dive) {
                    const sub = dive(focus, shape);
                    if ("errors" in sub) {
                        // console.dir(sub);
                        const err = {
                            type: "ReferenceError", focus: focus,
                            shape: shape, errors: sub
                        };
                        if (shape.termType === "BlankNode")
                            err.referencedShape = shape;
                        return [err];
                    }
                    if ("solution" in sub && Object.keys(sub.solution).length !== 0 ||
                        sub.type === "Recursion")
                        ret.referenced = sub; // !!! needs to aggregate errors and solutions
                    return [];
                }
                function diveRecurse(focus, shapeLabel) {
                    return diver(focus, shapeLabel, recurse);
                }
                function diveDirect(focus, shapeLabel) {
                    return diver(focus, shapeLabel, direct);
                }
                if ("valueExpr" in ptr) {
                    const sub = checkValueExpr(ptr.inverse ? triple.subject : triple.object, ptr.valueExpr, diveRecurse, diveDirect);
                    if ("errors" in sub)
                        [].push.apply(errors, sub.errors);
                }
                if (errors.length === 0 && "semActs" in m.c &&
                    !semActHandler.dispatchAll(m.c.semActs, triple, ret))
                    errors.push({ type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] }); // some semAct aborted
                return ret;
            });
            if ("annotations" in m.c)
                ptr.annotations = m.c.annotations;
            if ("semActs" in m.c)
                ptr.semActs = m.c.semActs;
            last = m.stack.slice();
            return out;
        }, {});
        if (errors.length)
            return {
                type: "SemActFailure",
                errors: errors
            };
        // Clear out the nulls for the expressions with min:0 and no matches.
        // <S> { (:p .; :q .)?; :r . } \ { <s> :r 1 } -> i:0, e:1 resulting in null at e=0
        // Maybe we want these nulls in expressions[] to make it clear that there are holes?
        skips.forEach(skip => {
            for (let exprNo = 0; exprNo < skip.length; ++exprNo)
                if (skip[exprNo] === null || skip[exprNo] === undefined)
                    skip.splice(exprNo--, 1);
        });
        if ("semActs" in shape)
            ret.semActs = shape.semActs;
        return ret;
    }
}
function extend(base, ...extensions) {
    if (!base)
        base = {};
    for (let i = 0, l = extensions.length, arg; i < l && (arg = extensions[i] || {}); i++)
        for (let name in arg)
            base[name] = arg[name];
    return base;
}
module.exports = {
    name: "eval-simple-1err",
    description: "simple regular expression engine with n out states",
    compile: compileNFA
};
//# sourceMappingURL=eval-simple-1err-materializer.js.map

/***/ },

/***/ 320
(module) {

"use strict";

/**
 * A file with common utility functions used by the extensions.
 */
const ExtensionUtils = {
    // Collapse multiple spaces into one
    collapseSpaces: function (string) {
        return string.replace(/  +/g, ' ');
    },
    // Remove starting and trailing quotes - does not affect center quotes
    trimQuotes999: function (string) { return string.value; },
    // Unescape the backslash characters in a string (e.g., in a URL)
    unescapeMetaChars: function (string) {
        return string.replace(/\\([\/^$])/g, "$1");
    }
};
module.exports = ExtensionUtils;
//# sourceMappingURL=extension-utils.js.map

/***/ },

/***/ 787
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/**
 * This file is the main entry point into calling an extension.
 * It determines which extension is requested, and then, assuming
 * the extension is valid, it forwards the request on
 */
// Known extensions
const hashmap_extension = __webpack_require__(201);
const regex_extension = __webpack_require__(696);
/**
 * Given a map directive that contains an extension of format
 *          extensionName(args)
 * split it up for easy access to extenion name and arguments separately
 *
 * @param mapDirective a map directive with an extension call embedded
 *
 * @return an object with members:  extension name and the arguments.
 */
function extensionDef(mapDirective) {
    if (mapDirective === undefined)
        throw Error("Invalid extension function: " + mapDirective + "!");
    // Get the extension name and argument(s)
    mapDirective = mapDirective.trim(); // Strip any leading or trailing white space
    const startArgs = mapDirective.indexOf('(', 0);
    const endArgs = mapDirective.lastIndexOf(')');
    if (startArgs < 2 || endArgs < 4 || endArgs <= startArgs + 1 || endArgs != mapDirective.length - 1)
        throw Error("Invalid extension function: " + mapDirective + "!");
    return { name: mapDirective.substring(0, startArgs),
        args: mapDirective.substring(startArgs + 1, endArgs) };
}
function lift(mapDirective, input, prefixes) {
    const extDef = extensionDef(mapDirective);
    switch (extDef.name) {
        case 'hashmap':
            return hashmap_extension.lift(mapDirective, input, prefixes, extDef.args);
        case 'regex':
            return regex_extension.lift(mapDirective, input, prefixes, extDef.args);
        case 'test':
            return mapDirective;
        case 'id': // names an output node; validating input it binds nothing
            return {};
        default:
            throw Error('Unknown extension: ' + mapDirective + '!');
    }
}
function lower(mapDirective, bindings, prefixes) {
    const extDef = extensionDef(mapDirective);
    switch (extDef.name) {
        case 'hashmap':
            return hashmap_extension.lower(mapDirective, bindings, prefixes, extDef.args);
        case 'regex':
            return regex_extension.lower(mapDirective, bindings, prefixes, extDef.args);
        case 'test':
            return mapDirective;
        case 'id':
            throw Error(mapDirective.trim() + ' names a node; it belongs on a shape-valued constraint, not a value');
        default:
            throw Error('Unknown extension: ' + mapDirective + '!');
    }
}
module.exports = {
    lift: lift,
    lower: lower,
};
//# sourceMappingURL=extensions.js.map

/***/ },

/***/ 201
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/**
 * The hashmap extension expects a hash map directive in JSON format like:
 *    hashmap(variable, {"D": "Divorced", "M": "Married", "S": "Single", "W": "Widowed"})
 * And returns the appropriate map value based on the input.
 */
const extUtils = __webpack_require__(320);
/**
 * This function will parse the args string to find the target variable name and
 * JSON hashmap arguments we'll use for doing the hash mapping.
 *
 * @param args a string with the extension arguments
 *
 * @return an object of format: {const: varname, map: hashmap}
 */
function parseArgs(mapDirective, args) {
    // Do we have anything in args?
    if (args === undefined || args.length === 0)
        throw Error("Hashmap extension requires a variable name and map as arguments, but found none!");
    // get the variable name and hashmap
    const matches = /^[ ]*([\w:<>]+)[ ]*,[ ]*({.*)$/s.exec(args);
    if (matches === null || matches.length < 3)
        throw Error("Hashmap extension requires a variable name and map as arguments, but found: " + mapDirective + "!");
    const varName = matches[1];
    const hashString = matches[2];
    let map;
    try {
        map = JSON.parse(hashString);
        if (Object.keys(map).length === 0)
            throw Error("Empty hashmap!");
    }
    catch (e) {
        throw Error("Hashmap extension unable to parse map in " + mapDirective + "!" + e.message);
    }
    // Verify that the hash key/value pairs are unique
    const values = Object.values(map);
    if (values.length != [...new Set(values)].length)
        throw Error('Hashmap extension requires unique key/value pairs!');
    return { varName: varName,
        hash: map };
}
/**
 * If the variable name is a prefixed name (format prefix:name), expand it
 * to the full name; returns the original variable name if not prefixed.
 *
 * @param varName variable name
 * @param prefixes a list of known prefixes in <short name>: <expanded name>
 *
 * @return the variable name, expanded if it had a prefix on it
 */
function expandedVarName(varName, prefixes) {
    const varComponents = varName.match(/^([\w]+):(.*)$/);
    let expandedName;
    if (varComponents !== null && varComponents.length == 3) {
        const prefix = varComponents[1];
        const name = varComponents[2];
        // Verify we've got a good const name, prefix, and prefix value
        if (prefix.length === 0 || name.length === 0)
            throw Error("Hashmap extension given invalid target variable name " + varName);
        if (!(prefix in prefixes))
            throw Error("Hashmap extension given undefined variable prefix " + prefix);
        expandedName = prefixes[prefix] + name;
    }
    else {
        // Not a prefixed name
        expandedName = varName;
    }
    return expandedName;
}
/**
 * Invert the value by finding the hash key that matches the value
 * This assumes key/value pairs are unique
 *
 * @param hash hash object whose attributes should be traversed.
 * @param value scalar value to look for
 */
function invert(hash, value) {
    const key = Object.keys(hash).find(key => value === hash[key]);
    if (!key)
        throw Error("Hashmap extension was unable to invert the value "
            + value + " with map " + JSON.stringify(hash, { depth: null }) + "!");
    return key;
}
function lift(mapDirective, input, prefixes, args) {
    // Parse to get the target const name and the hash map
    const mapArgs = parseArgs(mapDirective, args);
    // Get the expanded const name if it was prefixed
    const expandedName = expandedVarName(mapArgs.varName, prefixes);
    const key = input.value || input;
    if (key.length === 0)
        throw Error('Hashmap extension has no input');
    const mappedValue = mapArgs.hash[key];
    return { [expandedName]: mappedValue };
}
function lower(mapDirective, bindings, prefixes, args) {
    const mapArgs = parseArgs(mapDirective, args);
    // Get the expanded const name if it was prefixed
    const expandedName = expandedVarName(mapArgs.varName, prefixes);
    const mappedValueTerm = bindings.get(expandedName);
    const mappedValue = mappedValueTerm.value || mappedValueTerm;
    if (mappedValue === undefined)
        throw Error('Unable to find mapped value for ' + mapArgs.varName);
    // Now use the mapped Value to find the original value and clean it up if we get something
    const inverseValue = invert(mapArgs.hash, mappedValue);
    if (inverseValue.length !== 0) {
        return '"' + extUtils.unescapeMetaChars(extUtils.collapseSpaces(inverseValue)) + '"';
    }
    return inverseValue;
}
module.exports = {
    lift: lift,
    lower: lower
};
//# sourceMappingURL=hashmap_extension.js.map

/***/ },

/***/ 525
(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;
/** keys - `%Map:{ id(arg, ...) %}` on a shape-valued output constraint names the node its
 * nested shape is built on.  Arguments are variables, `@node` (the input node the enclosing
 * iteration matched) or IRI templates `<http://a.example/person/{v:mrn}>`, whose
 * placeholders are replaced by the values' lexical forms, IRI-safe (everything but letters,
 * digits and -._~ percent-encoded, as R2RML does).  On the input side id() binds nothing,
 * so one schema serves both directions.
 */

__webpack_unused_export__ = ({ value: true });
exports.Template = exports.NODE_ARGUMENT = void 0;
exports.allMatches = allMatches;
exports.isKeyCode = isKeyCode;
exports.expandVariable = expandVariable;
__webpack_unused_export__ = lexical;
exports.keyTerms = keyTerms;
exports.keyArguments = keyArguments;
exports.NODE_ARGUMENT = "@node";
const CALL = /^\s*([A-Za-z][A-Za-z0-9]*)\s*\((.*)\)\s*$/s;
const VARIABLE = /^ *(?:<([^>]*)>|([^:<>\s]*):(\S*)) *$/;
const PLACEHOLDER = /\{([^{}]*)\}/g;
/** every match of a global regex, in order (String.prototype.matchAll is outside this package's lib) */
function allMatches(re, text) {
    const out = [];
    const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    let m;
    while ((m = r.exec(text)) !== null) {
        out.push(m);
        if (m[0].length === 0)
            r.lastIndex++;
    }
    return out;
}
function isKeyCode(code) {
    const m = CALL.exec(code);
    return m !== null && m[1] === "id";
}
function expandVariable(name, prefixes) {
    const m = VARIABLE.exec(name);
    if (!m)
        throw Error(`"${name}" is not a ShExMap variable (prefix:name or <iri>)`);
    if (m[1] !== undefined)
        return m[1];
    if (!(m[2] in prefixes))
        throw Error(`Unknown prefix "${m[2]}:" in ShExMap variable "${name}"`);
    return prefixes[m[2]] + m[3];
}
class Template {
    constructor(text, prefixes) {
        this.segments = [];
        this.text = text;
        let pos = 0;
        for (const m of allMatches(PLACEHOLDER, text)) {
            if (m.index > pos)
                this.segments.push(text.slice(pos, m.index));
            this.segments.push({ variable: expandVariable(m[1], prefixes) });
            pos = m.index + m[0].length;
        }
        if (pos < text.length)
            this.segments.push(text.slice(pos));
    }
    variables() {
        return this.segments.filter(s => typeof s !== "string").map((s) => s.variable);
    }
    /** the IRI (as an N3id string), or null when a variable is unbound */
    expand(get) {
        let out = "";
        for (const seg of this.segments) {
            if (typeof seg === "string") {
                out += seg;
            }
            else {
                const value = get(seg.variable);
                if (value === null || value === undefined)
                    return null;
                out += iriSafe(lexical(value));
            }
        }
        return out;
    }
}
exports.Template = Template;
/** the lexical form of a JSON term (an IRI string, a _:label, or {value, ...}) */
function lexical(term) {
    return typeof term === "object" && term !== null && "value" in term ? term.value : String(term);
}
function iriSafe(s) {
    return encodeURIComponent(s).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
/** the arguments of an id() code: variable IRIs, NODE_ARGUMENT, and Templates */
function keyTerms(code, prefixes) {
    const m = CALL.exec(code);
    if (!m || m[1] !== "id")
        throw Error(`${code.trim()} is not an id() code`);
    const parts = m[2].trim() ? m[2].split(",").map(a => a.trim()) : [];
    if (parts.length === 0)
        throw Error(`id() needs at least one variable, template or ${exports.NODE_ARGUMENT}: ${code.trim()}`);
    return parts.map(a => a === exports.NODE_ARGUMENT ? a
        : a.startsWith("<") && a.endsWith(">") && a.includes("{") ? new Template(a.slice(1, -1), prefixes)
            : expandVariable(a, prefixes));
}
/** the variables an id() code reads (templates' placeholders included), and NODE_ARGUMENT where it appears */
function keyArguments(code, prefixes) {
    const out = [];
    for (const term of keyTerms(code, prefixes))
        if (term instanceof Template)
            out.push(...term.variables());
        else
            out.push(term);
    return out;
}
//# sourceMappingURL=keys.js.map

/***/ },

/***/ 696
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/**
 * The regex extension expects a map directive like:
 *    regex(/<regex>/)
 * where the regex should specify one or more target variables, e.g.,
 *    regex(/"(?<dem:family>[a-zA-Z'\\-]+),\\s*(?<dem:given>[a-zA-Z'\\-\\s]+)"/)
 * The expression will be applied and the results returned as a hash.
 */
const extUtils = __webpack_require__(320);
const captureGroupName = "(\\?<(?:[a-zA-Z:]+|<[^>]+>)>)";
/**
 * Given a variable name, looks up its prefix, and  replacing the shorthand
 * prefix name in the variable with l name.
 *
 * @param varName a short prefixed variable name to expand e.g., dem:id
 * @param prefixes a list of the prefix short name/full name mappings
 *
 * @return the fully expanded name
 */
function applyPrefix(varName, prefixes) {
    // Figure out what variable syntax we have.  It could be <varname> or <prefix:varname>
    const matches = varName.match(/^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/);
    if (matches === null)
        throw Error("variable \"" + varName + "\" did not match expected pattern!");
    let expandedVarName;
    if (matches[1]) {
        // Got <varname>
        expandedVarName = matches[1];
    }
    else if (matches[2] in prefixes) {
        // prefixed const e.g., dem:id
        expandedVarName = prefixes[matches[2]] + matches[3];
    }
    else
        // unknown prefix
        throw Error("Unknown prefix " + matches[2] + " in \"" + varName + "\"!");
    return expandedVarName;
}
/**
 * Expand the variable passed in shortPrefixedVar, and add it to a list of the known
 * fully expanded variables.
 *
 * @param shortPrefixedVar a short prefixed variable name e.g., ?<dem:id>
 * @param expandedVars the list of known variables
 * @param prefixes the prefix hash that maps short prefix name to the full URI prefix
 *
 * @return the fully expanded variable name
 */
function buildExpandedVars(shortPrefixedVar, expandedVars, prefixes) {
    // shortPrefixedVar will look like this: ?<test:string> - strip off the ?< and > chars
    const v = extUtils.unescapeMetaChars(shortPrefixedVar.substr(2, shortPrefixedVar.length - 3));
    const expandedVarName = applyPrefix(v, prefixes);
    if (expandedVarName in expandedVars)
        throw Error("unable to process prefixes in " + expandedVarName);
    // Add this new const to the list and return the expanded const name
    expandedVars.push(expandedVarName);
    return expandedVarName;
}
/**
 * Strip any starting and trailing / char, ignoring leading & trailing whitespace
 */
function trimPattern(mapDirective, args) {
    if (/^\s*\/.*\/\s*$/.test(args)) {
        args = /^\s*\/(.*)\/\s*$/.exec(args)[1];
        if (args.length < 1)
            throw Error(mapDirective + ' is missing the required regex pattern');
    }
    return args;
}
function lift(mapDirective, input, prefixes, args) {
    args = trimPattern(mapDirective, args);
    const expandedVars = [];
    const pattern = args.replace(RegExp(captureGroupName, "g"), function (_m, varName) {
        buildExpandedVars(varName, expandedVars, prefixes);
        return "";
    });
    if (expandedVars.length === 0) {
        throw Error('Found no capture variable in ' + mapDirective + '!');
    }
    let matches;
    try {
        matches = input.match(RegExp(pattern));
    }
    catch (e) {
        throw Error('Error pattern matching ' + mapDirective + " with " + input + ": " + e.message);
    }
    if (!matches)
        throw Error(mapDirective + ' found no match for input "' + input + '"!');
    // Build a hash of the regex variable name/value pairs
    const result = {};
    for (let i = 1; i < matches.length; ++i) {
        result[expandedVars[i - 1]] = matches[i];
    }
    return result;
}
function lower(mapDirective, bindings, prefixes, args) {
    args = trimPattern(mapDirective, args);
    // Replace mapDirective named capture groups into bindings for those names.
    const expandedVars = [];
    let matched = false;
    let string = args.replace(RegExp("\\(" + captureGroupName + "[^)]+\\)", "g"), function (_m, varName) {
        matched = true;
        const expVarName = buildExpandedVars(varName, expandedVars, prefixes);
        const val = bindings.get(expVarName);
        if (val === undefined) {
            throw Error("Unable to process " + mapDirective +
                " because variable \"" + expVarName + "\" was not found!");
        }
        else {
            return val.value || val;
        }
    });
    if (!matched) {
        throw Error('Found no capture variable in ' + mapDirective + '!');
    }
    string = extUtils.collapseSpaces(string); // replaces white space with a single space
    return '"' + extUtils.unescapeMetaChars(string) + '"';
}
module.exports = {
    lift: lift,
    lower: lower
};
//# sourceMappingURL=regex_extension.js.map

/***/ },

/***/ 680
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;
/** scopes - the binding tree read as a scope tree, for materialization by iteration scopes.
 *
 * A binding tree (see ./bindingTree.ts) is a *scope*: an object of own bindings, or an
 * array whose first element is that object and whose other elements are *lists*, each
 * list holding one *iteration* (a scope) per match of a repeated constraint or group.
 * `parseScope` builds Scope objects from a tree, accepting the two older layouts shex.js
 * wrote (L1: a root written as its one list; L2: a nested scope written as a sibling of
 * the constraint's own binding), and `ScopeTree` answers what materialization asks: at
 * what list a variable is bound, and which scopes under a given one belong to a list.
 *
 * A *list path* names a list by position: the list indices from the root, so [] is the
 * root scope itself, [0] the root's first list, [0, 1] the second list of an iteration
 * of that list.  Every iteration of a list shares the list's path.
 */

__webpack_unused_export__ = ({ value: true });
exports.ScopeTree = __webpack_unused_export__ = exports.BindingTreeError = void 0;
exports.isPrefix = isPrefix;
__webpack_unused_export__ = sameList;
exports.pathKey = pathKey;
__webpack_unused_export__ = parseScope;
const bindingTree_1 = __webpack_require__(324);
class BindingTreeError extends Error {
}
exports.BindingTreeError = BindingTreeError;
class Scope {
    constructor(own, node, parent, listPath, path, jsonPath) {
        this.lists = [];
        this.index = 0; // position in walk order (the UI's "frame" number)
        this.own = own;
        this.node = node;
        this.parent = parent;
        this.listPath = listPath;
        this.path = path;
        this.jsonPath = jsonPath;
    }
    get depth() { return this.listPath.length; }
    /** {value, scope} for `v` from here or the nearest ancestor binding it, else null */
    lookup(v) {
        for (let s = this; s !== null; s = s.parent)
            if (v in s.own)
                return { value: s.own[v], scope: s };
        return null;
    }
    /** the node of this scope or of the nearest ancestor that recorded one */
    nearestNode() {
        for (let s = this; s !== null; s = s.parent)
            if (s.node !== undefined && s.node !== null)
                return s.node;
        return null;
    }
    /** the scopes below this one that are iterations of `listPath`, in document order */
    descendantsAt(listPath) {
        if (!isPrefix(this.listPath, listPath) || sameList(listPath, this.listPath))
            return [];
        const out = [];
        for (const list of this.lists)
            for (const it of list) {
                if (sameList(it.listPath, listPath))
                    out.push(it);
                else if (isPrefix(it.listPath, listPath))
                    out.push(...it.descendantsAt(listPath));
            }
        return out;
    }
    *walk() {
        yield this;
        for (const list of this.lists)
            for (const it of list)
                yield* it.walk();
    }
}
__webpack_unused_export__ = Scope;
function isPrefix(a, b) {
    return a.length <= b.length && a.every((x, i) => b[i] === x);
}
function sameList(a, b) {
    return a.length === b.length && isPrefix(a, b);
}
function pathKey(p) { return p.join("."); }
function isObject(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }
function isScopeArray(a) {
    return Array.isArray(a) && a.length >= 1 && isObject(a[0]) && a.slice(1).every(Array.isArray);
}
/** the scope tree of a binding tree */
function parseScope(tree) {
    if (isObject(tree) || isScopeArray(tree))
        return scope(tree, null, [], [], []);
    if (Array.isArray(tree)) {
        // L1: a root without own bindings, written without its object
        if (tree.every(isObject)) // shex.js: the root's one list
            return scope([{}, tree], null, [], [], [], true);
        if (tree.every(Array.isArray)) {
            if (tree.every(isScopeArray)) // shex.js: one list of scope iterations
                return scope([{}, tree], null, [], [], [], true);
            if (tree.every((e) => e.every(isObject))) // PyShEx before 2026-09-27: the lists
                return scope([{}].concat(tree), null, [], [], [], true);
        }
    }
    throw new BindingTreeError("not a scope: " + short(tree));
}
function scope(node, parent, listPath, path, jsonPath, synthetic = false) {
    const own = isObject(node) ? node : node[0];
    const lists = isObject(node) ? [] : node.slice(1);
    const vars = {};
    for (const k of Object.keys(own))
        if (!k.startsWith("@"))
            vars[k] = own[k];
    const ownPath = synthetic ? null : (isObject(node) ? jsonPath : jsonPath.concat([0]));
    const s = new Scope(vars, own[bindingTree_1.NODE_KEY], parent, listPath, path, ownPath);
    lists.forEach((list, i) => {
        if (!Array.isArray(list))
            throw new BindingTreeError("a scope's lists must be arrays: " + short(list));
        // a synthetic root's lists sit at the tree's own indices
        const listJson = synthetic ? (jsonPath.length === 0 && lists.length === 1 ? [] : [i]) : jsonPath.concat([i + 1]);
        s.lists.push(list.map((e, j) => iteration(e, s, listPath.concat([i]), path.concat([i, j]), listJson.concat([j]))));
    });
    return s;
}
function iteration(elt, parent, listPath, path, jsonPath) {
    if (isObject(elt) || isScopeArray(elt)) // a scope; also L2 (a nested scope written as a sibling)
        return scope(elt, parent, listPath, path, jsonPath);
    if (Array.isArray(elt) && elt.every(isObject)) // shex.js: a nested scope with no own bindings, its one list unwrapped
        return scope([{}, elt], parent, listPath, path, jsonPath, true);
    throw new BindingTreeError("not an iteration: " + short(elt));
}
function short(x) {
    const s = JSON.stringify(x);
    return s === undefined ? String(x) : s.length < 120 ? s : s.slice(0, 117) + "...";
}
/** a parsed tree plus the indexes materialization needs */
class ScopeTree {
    constructor(tree) {
        this.boundAt = {}; // variable -> the list it is bound at
        this.bindings = 0;
        this.scopes = []; // walk order; scope.index indexes this
        this.root = parseScope(tree);
        for (const s of this.root.walk()) {
            s.index = this.scopes.length;
            this.scopes.push(s);
            for (const v of Object.keys(s.own)) {
                ++this.bindings;
                if (!(v in this.boundAt))
                    this.boundAt[v] = s.listPath;
                else if (!sameList(this.boundAt[v], s.listPath))
                    throw new BindingTreeError(`variable ${v} is bound at two lists, [${this.boundAt[v]}] and [${s.listPath}]`);
            }
        }
    }
    variables() { return Object.keys(this.boundAt); }
    /** the UI's view: own bindings per scope, in walk order, and where each was written */
    frames() {
        return {
            frames: this.scopes.map(s => Object.assign({}, s.own)),
            origins: this.scopes.map(s => {
                const o = {};
                for (const v of Object.keys(s.own))
                    o[v] = s.jsonPath === null ? null : s.jsonPath.concat([v]);
                return o;
            }),
        };
    }
}
exports.ScopeTree = ScopeTree;
//# sourceMappingURL=scopes.js.map

/***/ },

/***/ 636
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/*
 * TODO
 *   templates: @<foo> %map:{ my:specimen.container.code=.1.code, my:specimen.container.disp=.1.display %}
 *   node identifiers: @foo> %map:{ foo.id=substr(20) %}
 *   multiplicity: ...
 */
const { rdfJsTerm2Ld } = __webpack_require__(811);
const ShExMapCjsModule = function (config) {
    const ShExTerm = __webpack_require__(811);
    const extensions = __webpack_require__(787);
    const { ShExVisitor, ShExIndexVisitor } = __webpack_require__(747);
    const ShExUtil = __webpack_require__(837);
    const N3Util = __webpack_require__(539);
    const N3DataFactory = (__webpack_require__(601)["default"]);
    const materializer = __webpack_require__(554)(config);
    const StringToRdfJs = __webpack_require__(638);
    const MapExt = "http://shex.io/extensions/Map/#";
    const pattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;
    const UNBOUNDED = -1;
    const MAX_MAX_CARD = 50; // @@ don't repeat forever during dev experiments.
    function register(validator, api) {
        if (api === undefined || !('ShExTerm' in api))
            throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)');
        class MaterializerVisitor extends ShExVisitor {
            constructor(tc, index, curSubjectx) {
                super();
                this.tc = tc;
                this.index = index;
                this.curSubjectx = curSubjectx;
            }
            visitShapeRef(shapeRef, ...args) {
                this.visitShapeDecl(this.index.shapeExprs[shapeRef], ...args);
                return super.visitShapeRef(shapeRef, ...args);
            }
            ;
            visitValueRef(r, ...args) {
                this.visitTripleExpr(validator.schema.shapes[r], r, ...args);
                return this._visitValue(r, ...args);
            }
            ;
            visitTripleConstraint(expr, curSubjectx, nextBNode, target, materializer, schema, bindings) {
                this.tc(expr, curSubjectx, nextBNode, target, materializer, schema, bindings);
            }
            ;
        }
        const prefixes = "_prefixes" in validator.schema ?
            validator.schema._prefixes :
            {};
        validator.semActHandler.results[MapExt] = {};
        validator.semActHandler.register(MapExt, {
            /**
             * Callback for extension invocation.
             *
             * @param {string} code - text of the semantic action.
             * @param {object} ctx - matched triple or results subset.
             * @param {object} extensionStorage - place where the extension writes into the result structure.
             * @return {Array} [] on success; otherwise the errors that fail the
             *   constraint (by convention [{type: "SemActFailure", errors: [msg]}]).
             *   Throw for an invocation error, e.g. code that doesn't parse.
             */
            dispatch: function (code, ctx, extensionStorage) {
                function fail(msg) { const e = Error(msg); if ("captureStackTrace" in Error)
                    Error.captureStackTrace(e, fail); throw e; }
                function getPrefixedName(bindingName) {
                    // already have the fully prefixed binding name ready to go
                    if (typeof bindingName === "string")
                        return bindingName;
                    // bindingName is from a pattern match - need to get & expand it with prefix
                    const prefixedName = bindingName[1] ? bindingName[1] :
                        bindingName[2] in prefixes ? (prefixes[bindingName[2]] + bindingName[3]) :
                            fail("unknown prefix " + bindingName[2] + " in \"" + code + "\".");
                    return prefixedName;
                }
                const update = function (bindingName, value) {
                    if (!bindingName) {
                        throw Error("Invocation error: " + MapExt + " code \"" + code + "\" didn't match " + pattern);
                    }
                    const prefixedName = getPrefixedName(bindingName);
                    const quotedValue = rdfJsTerm2Ld(value);
                    validator.semActHandler.results[MapExt][prefixedName] = quotedValue;
                    extensionStorage[prefixedName] = quotedValue;
                };
                // Do we have a map extension function?
                const funcArg = code.match(/^\s*[a-zA-Z0-9]+\((.*)\)\s*$/);
                if (funcArg) {
                    const results = extensions.lift(code, ctx.triples[0].object.value, prefixes);
                    for (const key in results)
                        update(key, N3DataFactory.literal(results[key]));
                }
                else {
                    const bindingName = code.match(pattern);
                    if (ctx.node) {
                        update(bindingName, ctx.node);
                    }
                    else {
                        const inverse = ctx.tripleExpr.type === 'TripleConstraint' && ctx.tripleExpr.inverse;
                        update(bindingName, inverse ? ctx.triples[0].subject : ctx.triples[0].object);
                    }
                }
                return []; // There are no evaluation failures. Any parsing problem throws.
            }
        });
        return {
            results: validator.semActHandler.results[MapExt],
            binder,
            trivialMaterializer,
            visitTripleConstraint
        };
        function visitTripleConstraint(expr, curSubjectx, nextBNode, target, visitor, schema, bindings, recurse, direct, checkValueExpr) {
            // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
            function P(pname) { return expandPrefixedName(pname, schema._prefixes); }
            function L(value, modifier) { return N3Util.createLiteral(value, modifier); }
            function B() { return nextBNode(); }
            function add(s, p, o) {
                target.addQuad(StringToRdfJs.n3idQuad2RdfJs(s, p, o));
                return s;
            }
            const mapExts = (expr.semActs || []).filter(function (ext) { return ext.name === MapExt; });
            if (mapExts.length) {
                mapExts.forEach(function (ext) {
                    const code = ext.code;
                    const m = code.match(pattern);
                    let tripleObject;
                    if (m) {
                        const arg = m[1] ? m[1] : P(m[2] + ":" + m[3]);
                        const val = n3ify(bindings.get(arg));
                        if (val !== undefined) {
                            tripleObject = val;
                        }
                    }
                    // Is the arg a function? Check if it has parentheses and ends with a closing one
                    if (tripleObject === undefined) {
                        const funcArg = code.match(/^\s*[a-zA-Z0-9]+\((.*)\)\s*$/);
                        if (funcArg)
                            tripleObject = extensions.lower(code, bindings, schema._prefixes, funcArg[1]);
                    }
                    if (tripleObject === undefined) { /* console.warn('Not in bindings: ',code); */ }
                    else if (expr.inverse)
                        add(tripleObject, expr.predicate, curSubjectx.cs);
                    else
                        add(curSubjectx.cs, expr.predicate, tripleObject);
                });
            }
            else if (typeof expr.valueExpr !== "string" && "values" in expr.valueExpr && expr.valueExpr.values.length === 1) {
                if (expr.inverse)
                    add(expr.valueExpr.values[0], expr.predicate, curSubjectx.cs);
                else
                    add(curSubjectx.cs, expr.predicate, n3ify(expr.valueExpr.values[0]));
            }
            else {
                const oldSubject = curSubjectx.cs;
                let maxAdd = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
                if (maxAdd > MAX_MAX_CARD)
                    maxAdd = MAX_MAX_CARD;
                if (!recurse)
                    maxAdd = 1; // no grounds to know how much to repeat.
                for (let repetition = 0; repetition < maxAdd; ++repetition) {
                    curSubjectx.cs = B();
                    if (recurse) {
                        const res = checkValueExpr(StringToRdfJs.n3idTerm2RdfJs(curSubjectx.cs), expr.valueExpr, recurse, direct);
                        if ("errors" in res)
                            break;
                    }
                    if (expr.inverse)
                        add(curSubjectx.cs, expr.predicate, oldSubject);
                    else
                        add(oldSubject, expr.predicate, curSubjectx.cs);
                }
                visitor._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint", ["inverse", "negated", "predicate", "valueExpr",
                    "min", "max", "annotations", "semActs"], null, curSubjectx, nextBNode, target, visitor, schema, bindings);
                curSubjectx.cs = oldSubject;
            }
        }
        function trivialMaterializer(schema, nextBNode) {
            let blankNodeCount = 0;
            const index = schema._index || ShExIndexVisitor.index(schema);
            nextBNode = nextBNode || function () {
                return '_:b' + blankNodeCount++;
            };
            return {
                materialize: function (bindings, createRoot, shape, target) {
                    shape = !shape || shape === validator.Start
                        ? schema.start
                        : schema.shapes.indexOf(shape) !== -1
                            ? shape
                            : this._lookupShape(shape);
                    target = target || new config.rdfjs.Store();
                    // target.addPrefixes(schema.prefixes); // not used, but seems polite
                    // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
                    function P(pname) { return expandPrefixedName(pname, schema.prefixes); }
                    function L(value, modifier) { return N3Util.createLiteral(value, modifier); }
                    function B() { return nextBNode(); }
                    function add(s, p, o) { target.addTriple({ subject: s, predicate: p, object: n3ify(o) }); return s; }
                    const curSubject = createRoot || B();
                    const curSubjectx = { cs: curSubject };
                    const v = new MaterializerVisitor(visitTripleConstraint, index);
                    v.visitShapeExpr(shape, curSubjectx, nextBNode, target, v, schema, bindings); // , curSubjectx, nextBNode, target, materializer
                    return target;
                }
            };
        }
        function binder(tree) {
            let stack = []; // e.g. [2, 1] for v="http://shex.io/extensions/Map/#BPDAM-XXX"
            const globals = {}; // !! delme
            //
            /**
             * returns: { const->count }
             */
            function _mults(obj) {
                const rays = [];
                const objs = [];
                const counts = Object.keys(obj).reduce((r, k) => {
                    let toAdd = null;
                    if (typeof obj[k] === "object" && !("value" in obj[k])) {
                        toAdd = _mults(obj[k]);
                        if (Array.isArray(obj[k]))
                            rays.push(k);
                        else
                            objs.push(k);
                    }
                    else {
                        // variable name.
                        toAdd = _make(k, 1);
                    }
                    return _add(r, toAdd);
                }, {});
                if (rays.length > 0) {
                    objs.forEach((i) => {
                        const novel = Object.keys(obj[i]).filter((k) => {
                            return counts[k] === 1;
                        });
                        if (novel.length) {
                            const n2 = novel.reduce((r, k) => {
                                r[k] = obj[i][k];
                                return r;
                            }, {});
                            rays.forEach((l) => {
                                _cross(obj[l], n2);
                            });
                        }
                    });
                    objs.reverse();
                    objs.forEach((i) => {
                        obj.splice(i, 1); // remove object from tree
                    });
                }
                return counts;
            }
            function _add(l, r) {
                const ret = Object.assign({}, l);
                return Object.keys(r).reduce((ret, k) => {
                    const add = k in r ? r[k] : 1;
                    ret[k] = k in ret ? ret[k] + add : add;
                    return ret;
                }, ret);
            }
            function _make(k, v) {
                const ret = {};
                ret[k] = v;
                return ret;
            }
            function _cross(list, map) {
                for (let listIndex in list) {
                    if (Array.isArray(list[listIndex])) {
                        _cross(list[listIndex], map);
                    }
                    else {
                        Object.keys(map).forEach((mapKey) => {
                            if (mapKey in list[listIndex])
                                throw Error("unexpected duplicate key: " + mapKey + " in " + JSON.stringify(list[listIndex]));
                            list[listIndex][mapKey] = map[mapKey];
                        });
                    }
                }
                ;
            }
            _mults(tree);
            function _simplify(list) {
                const ret = list.reduce((r, elt) => {
                    return r.concat(Array.isArray(elt) ?
                        _simplify(elt) :
                        elt);
                }, []);
                return ret.length === 1 ? ret[0] : ret;
            }
            tree = Array.isArray(tree) ? _simplify(tree) : [tree]; // expects an array
            // const globals = tree.reduce((r: any, e: any, idx: any) => {
            //   if (!Array.isArray(e)) {
            //     Object.keys(e).forEach((k: any) => {
            //       r[k] = e[k];
            //     });
            //     removables.unshift(idx); // higher indexes at the left
            //   }
            //   return r;
            // }, {});
            function getter(v) {
                // work with copy of stack while trying to grok this problem...
                if (stack === null)
                    return undefined;
                if (v in globals)
                    return globals[v];
                const nextStack = stack.slice();
                let next = diveIntoObj(nextStack); // no effect if in obj
                while (!(v in next)) {
                    let last;
                    while (!Array.isArray(next)) {
                        last = nextStack.pop();
                        next = getObj(nextStack);
                    }
                    if (next.length === last + 1) {
                        stack = null;
                        return undefined;
                    }
                    nextStack.push(last + 1);
                    next = diveIntoObj(nextStack);
                    // console.log("advanced to " + nextStack);
                    // throw Error ("can't advance to find " + v + " in " + JSON.stringify(next));
                }
                stack = nextStack.slice();
                const ret = next[v];
                delete next[v];
                return ret;
                function getObj(s) {
                    return s.reduce(function (res, elt) {
                        return res[elt];
                    }, tree);
                }
                function diveIntoObj(s) {
                    while (Array.isArray(getObj(s)))
                        s.push(0);
                    return getObj(s);
                }
            }
            ;
            return { get: getter };
        }
    }
    function done(validator) {
        if (Object.keys(validator.semActHandler.results[MapExt]).length === 0)
            delete validator.semActHandler.results[MapExt];
    }
    function n3ify(ldterm) {
        if (typeof ldterm !== "object")
            return ldterm;
        const ret = "\"" + ldterm.value + "\"";
        if ("language" in ldterm)
            return ret + "@" + ldterm.language;
        if ("type" in ldterm)
            return ret + "^^" + ldterm.type;
        return ret;
    }
    // Expands the prefixed name to a full IRI (also when it occurs as a literal's type)
    function expandPrefixedName(prefixedName, prefixes) {
        const match = /(?:^|"\^\^)([^:\/#"'\^_]*):[^\/]*$/.exec(prefixedName);
        let prefix, base, index;
        if (match)
            prefix = match[1], base = prefixes[prefix], index = match.index;
        if (base === undefined)
            return prefixedName;
        // The match index is non-zero when expanding a literal's type
        return index === 0 ? base + prefixedName.substr(prefix.length + 1)
            : prefixedName.substr(0, index + 3) +
                base + prefixedName.substr(index + prefix.length + 4);
    }
    return {
        register: register,
        done: done,
        materializer: materializer,
        ThreadedMaterializer: (__webpack_require__(245)/* .ThreadedMaterializer */ .BS),
        MaterializerDebugger: (__webpack_require__(245)/* .MaterializerDebugger */ .fW),
        MaterializationError: (__webpack_require__(245)/* .MaterializationError */ .k),
        tripleConstraints: (__webpack_require__(245)/* .tripleConstraints */ .Fl),
        // the binding tree of a validation result, in the layout ThreadedMaterializer reads
        // (see doc/iteration-scopes.md); valToExtension remains for the legacy materializers
        bindingTree: (__webpack_require__(324)/* .bindingTree */ .Y),
        matchedTriples: (__webpack_require__(324).matchedTriples),
        NODE_KEY: (__webpack_require__(324).NODE_KEY),
        // static checks of a schema pair
        analyse: (__webpack_require__(459)/* .analyse */ .KH),
        Report: (__webpack_require__(459)/* .Report */ .pl),
        // binder: binder,
        url: MapExt,
        // visitTripleConstraint: myvisitTripleConstraint
        extension: {
            hashmap: __webpack_require__(201),
            regex: __webpack_require__(696)
        },
        extensions: __webpack_require__(787),
        utils: __webpack_require__(320),
    };
};
module.exports = ShExMapCjsModule;
//# sourceMappingURL=shex-extension-map.js.map

/***/ },

/***/ 638
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.n3idQuad2RdfJs = n3idQuad2RdfJs;
exports.n3idTerm2RdfJs = n3idTerm2RdfJs;
const rdf_data_factory_1 = __webpack_require__(50);
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

/***/ },

/***/ 215
(__unused_webpack_module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  XSD = 'http://www.w3.org/2001/XMLSchema#',
  SWAP = 'http://www.w3.org/2000/10/swap/';
var _default = exports["default"] = {
  xsd: {
    decimal: `${XSD}decimal`,
    boolean: `${XSD}boolean`,
    dateTime: `${XSD}dateTime`,
    double: `${XSD}double`,
    integer: `${XSD}integer`,
    string: `${XSD}string`
  },
  rdf: {
    type: `${RDF}type`,
    nil: `${RDF}nil`,
    first: `${RDF}first`,
    rest: `${RDF}rest`,
    langString: `${RDF}langString`,
    dirLangString: `${RDF}dirLangString`,
    reifies: `${RDF}reifies`
  },
  owl: {
    sameAs: 'http://www.w3.org/2002/07/owl#sameAs'
  },
  r: {
    forSome: `${SWAP}reify#forSome`,
    forAll: `${SWAP}reify#forAll`
  },
  log: {
    implies: `${SWAP}log#implies`,
    isImpliedBy: `${SWAP}log#isImpliedBy`
  }
};

/***/ },

/***/ 601
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.Variable = exports.Triple = exports.Term = exports.Quad = exports.NamedNode = exports.Literal = exports.DefaultGraph = exports.BlankNode = void 0;
exports.escapeQuotes = escapeQuotes;
exports.fromQuad = fromQuad;
exports.fromTerm = fromTerm;
exports.termFromId = termFromId;
exports.termToId = termToId;
exports.unescapeQuotes = unescapeQuotes;
var _IRIs = _interopRequireDefault(__webpack_require__(215));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// N3.js implementations of the RDF/JS core data types
// See http://rdf.js.org/data-model-spec/

const {
  rdf,
  xsd
} = _IRIs.default;

// eslint-disable-next-line prefer-const
let DEFAULTGRAPH;
let _blankNodeCounter = 0;
const escapedLiteral = /^"(.*".*)(?="[^"]*$)/;

// ## DataFactory singleton
const DataFactory = {
  namedNode,
  blankNode,
  variable,
  literal,
  defaultGraph,
  quad,
  triple: quad,
  fromTerm,
  fromQuad
};
var _default = exports["default"] = DataFactory; // ## Term constructor
class Term {
  constructor(id) {
    this.id = id;
  }

  // ### The value of this term
  get value() {
    return this.id;
  }

  // ### Returns whether this object represents the same term as the other
  equals(other) {
    // If both terms were created by this library,
    // equality can be computed through ids
    if (other instanceof Term) return this.id === other.id;
    // Otherwise, compare term type and value
    return !!other && this.termType === other.termType && this.value === other.value;
  }

  // ### Implement hashCode for Immutable.js, since we implement `equals`
  // https://immutable-js.com/docs/v4.0.0/ValueObject/#hashCode()
  hashCode() {
    return 0;
  }

  // ### Returns a plain object representation of this term
  toJSON() {
    return {
      termType: this.termType,
      value: this.value
    };
  }
}

// ## NamedNode constructor
exports.Term = Term;
class NamedNode extends Term {
  // ### Creates a named node
  /**
   * @deprecated Create named nodes through a data factory instead
   * (`DataFactory.namedNode(iri)`), so that term validation can be applied;
   * the constructor assumes an already-validated IRI.
   */
  constructor(iri) {
    super(iri);
  }

  // ### The term type of this term
  get termType() {
    return 'NamedNode';
  }
}

// ## Literal constructor
exports.NamedNode = NamedNode;
class Literal extends Term {
  // ### Creates a literal
  /**
   * @deprecated Create literals through a data factory instead
   * (`DataFactory.literal(value, languageOrDatatype)`), so that term
   * validation can be applied; the constructor takes the internal
   * id representation and assumes it is already valid.
   */
  constructor(id) {
    super(id);
  }

  // ### The term type of this term
  get termType() {
    return 'Literal';
  }

  // ### The text value of this literal
  get value() {
    return this.id.substring(1, this.id.lastIndexOf('"'));
  }

  // ### The language of this literal
  get language() {
    // Find the last quotation mark (e.g., '"abc"@en-us')
    const id = this.id;
    let atPos = id.lastIndexOf('"') + 1;
    const dirPos = id.lastIndexOf('--');
    // If "@" it follows, return the remaining substring; empty otherwise
    return atPos < id.length && id[atPos++] === '@' ? (dirPos > atPos ? id.substr(0, dirPos) : id).substr(atPos).toLowerCase() : '';
  }

  // ### The direction of this literal
  get direction() {
    // Find the last double dash after the closing quote (e.g., '"abc"@en-us--ltr')
    const id = this.id;
    const endPos = id.lastIndexOf('"');
    const dirPos = id.lastIndexOf('--');
    return dirPos > endPos && dirPos + 2 < id.length ? id.substr(dirPos + 2).toLowerCase() : '';
  }

  // ### The datatype IRI of this literal
  get datatype() {
    return new NamedNode(this.datatypeString);
  }

  // ### The datatype string of this literal
  get datatypeString() {
    // Find the last quotation mark (e.g., '"abc"^^http://ex.org/types#t')
    const id = this.id,
      dtPos = id.lastIndexOf('"') + 1;
    const char = dtPos < id.length ? id[dtPos] : '';
    // If "^" it follows, return the remaining substring
    return char === '^' ? id.substr(dtPos + 2) :
    // If "@" follows, return rdf:langString or rdf:dirLangString; xsd:string otherwise
    char !== '@' ? xsd.string : id.indexOf('--', dtPos) > 0 ? rdf.dirLangString : rdf.langString;
  }

  // ### Returns whether this object represents the same term as the other
  equals(other) {
    // If both literals were created by this library,
    // equality can be computed through ids
    if (other instanceof Literal) return this.id === other.id;
    // Otherwise, compare term type, value, language, and datatype
    return !!other && !!other.datatype && this.termType === other.termType && this.value === other.value && this.language === other.language && (this.direction === other.direction || this.direction === '' && !other.direction) && this.datatype.value === other.datatype.value;
  }
  toJSON() {
    return {
      termType: this.termType,
      value: this.value,
      language: this.language,
      direction: this.direction,
      datatype: {
        termType: 'NamedNode',
        value: this.datatypeString
      }
    };
  }
}

// ## BlankNode constructor
exports.Literal = Literal;
class BlankNode extends Term {
  // ### Creates a blank node
  /**
   * @deprecated Create blank nodes through a data factory instead
   * (`DataFactory.blankNode(name)`), so that term validation can be applied;
   * the constructor assumes an already-validated name.
   */
  constructor(name) {
    super(`_:${name}`);
  }

  // ### The term type of this term
  get termType() {
    return 'BlankNode';
  }

  // ### The name of this blank node
  get value() {
    return this.id.substr(2);
  }
}
exports.BlankNode = BlankNode;
class Variable extends Term {
  // ### Creates a variable
  /**
   * @deprecated Create variables through a data factory instead
   * (`DataFactory.variable(name)`), so that term validation can be applied;
   * the constructor assumes an already-validated name.
   */
  constructor(name) {
    super(`?${name}`);
  }

  // ### The term type of this term
  get termType() {
    return 'Variable';
  }

  // ### The name of this variable
  get value() {
    return this.id.substr(1);
  }
}

// ## DefaultGraph constructor
exports.Variable = Variable;
class DefaultGraph extends Term {
  // ### Creates the default graph
  /**
   * @deprecated Obtain the default graph through a data factory instead
   * (`DataFactory.defaultGraph()`).
   */
  constructor() {
    super('');
    return DEFAULTGRAPH || this;
  }

  // ### The term type of this term
  get termType() {
    return 'DefaultGraph';
  }

  // ### Returns whether this object represents the same term as the other
  equals(other) {
    // If both terms were created by this library,
    // equality can be computed through strict equality;
    // otherwise, compare term types.
    return this === other || !!other && this.termType === other.termType;
  }
}

// ## DefaultGraph singleton
exports.DefaultGraph = DefaultGraph;
DEFAULTGRAPH = new DefaultGraph();

// ### Constructs a term from the given internal string ID
// The third 'nested' parameter of this function is to aid
// with recursion over nested terms. It should not be used
// by consumers of this library.
// See https://github.com/rdfjs/N3.js/pull/311#discussion_r1061042725
function termFromId(id, factory, nested) {
  factory = factory || DataFactory;

  // Falsy value or empty string indicate the default graph
  if (!id) return factory.defaultGraph();

  // Identify the term type based on the first character
  switch (id[0]) {
    case '?':
      return factory.variable(id.substr(1));
    case '_':
      return factory.blankNode(id.substr(2));
    case '"':
      // Shortcut for internal literals
      if (factory === DataFactory) return new Literal(id);
      // Literal without datatype or language
      if (id[id.length - 1] === '"') return factory.literal(id.substr(1, id.length - 2));
      // Literal with datatype or language
      const endPos = id.lastIndexOf('"', id.length - 1);
      let languageOrDatatype;
      if (id[endPos + 1] === '@') {
        languageOrDatatype = id.substr(endPos + 2);
        const dashDashIndex = languageOrDatatype.lastIndexOf('--');
        if (dashDashIndex > 0 && dashDashIndex < languageOrDatatype.length) {
          languageOrDatatype = {
            language: languageOrDatatype.substr(0, dashDashIndex),
            direction: languageOrDatatype.substr(dashDashIndex + 2)
          };
        }
      } else {
        languageOrDatatype = factory.namedNode(id.substr(endPos + 3));
      }
      return factory.literal(id.substr(1, endPos - 1), languageOrDatatype);
    case '[':
      id = JSON.parse(id);
      break;
    default:
      if (!nested || !Array.isArray(id)) {
        return factory.namedNode(id);
      }
  }
  return factory.quad(termFromId(id[0], factory, true), termFromId(id[1], factory, true), termFromId(id[2], factory, true), id[3] && termFromId(id[3], factory, true));
}

// ### Constructs an internal string ID from the given term or ID string
// The third 'nested' parameter of this function is to aid
// with recursion over nested terms. It should not be used
// by consumers of this library.
// See https://github.com/rdfjs/N3.js/pull/311#discussion_r1061042725
function termToId(term, nested) {
  if (typeof term === 'string') return term;
  if (term instanceof Term && term.termType !== 'Quad') return term.id;
  if (!term) return DEFAULTGRAPH.id;

  // Term instantiated with another library
  switch (term.termType) {
    case 'NamedNode':
      return term.value;
    case 'BlankNode':
      return `_:${term.value}`;
    case 'Variable':
      return `?${term.value}`;
    case 'DefaultGraph':
      return '';
    case 'Literal':
      return `"${term.value}"${term.language ? `@${term.language}${term.direction ? `--${term.direction}` : ''}` : term.datatype && term.datatype.value !== xsd.string ? `^^${term.datatype.value}` : ''}`;
    case 'Quad':
      const res = [termToId(term.subject, true), termToId(term.predicate, true), termToId(term.object, true)];
      if (term.graph && term.graph.termType !== 'DefaultGraph') {
        res.push(termToId(term.graph, true));
      }
      return nested ? res : JSON.stringify(res);
    default:
      throw new Error(`Unexpected termType: ${term.termType}`);
  }
}

// ## Quad constructor
class Quad extends Term {
  // ### Creates a quad
  /**
   * @deprecated Create quads through a data factory instead
   * (`DataFactory.quad(subject, predicate, object, graph)`), so that term
   * validation can be applied; the constructor assumes already-validated terms.
   */
  constructor(subject, predicate, object, graph) {
    super('');
    this._subject = subject;
    this._predicate = predicate;
    this._object = object;
    this._graph = graph || DEFAULTGRAPH;
  }

  // ### The term type of this term
  get termType() {
    return 'Quad';
  }
  get subject() {
    return this._subject;
  }
  get predicate() {
    return this._predicate;
  }
  get object() {
    return this._object;
  }
  get graph() {
    return this._graph;
  }

  // ### Returns a plain object representation of this quad
  toJSON() {
    return {
      termType: this.termType,
      subject: this._subject.toJSON(),
      predicate: this._predicate.toJSON(),
      object: this._object.toJSON(),
      graph: this._graph.toJSON()
    };
  }

  // ### Returns whether this object represents the same quad as the other
  equals(other) {
    return !!other && this._subject.equals(other.subject) && this._predicate.equals(other.predicate) && this._object.equals(other.object) && this._graph.equals(other.graph);
  }
}
exports.Triple = exports.Quad = Quad;
// ### Escapes the quotes within the given literal
function escapeQuotes(id) {
  return id.replace(escapedLiteral, (_, quoted) => `"${quoted.replace(/"/g, '""')}`);
}

// ### Unescapes the quotes within the given literal
function unescapeQuotes(id) {
  return id.replace(escapedLiteral, (_, quoted) => `"${quoted.replace(/""/g, '"')}`);
}

// ### Creates an IRI
function namedNode(iri) {
  return new NamedNode(iri);
}

// ### Creates a blank node
function blankNode(name) {
  return new BlankNode(name || `n3-${_blankNodeCounter++}`);
}

// ### Creates a literal
function literal(value, languageOrDataType) {
  // Create a language-tagged string
  if (typeof languageOrDataType === 'string') return new Literal(`"${value}"@${languageOrDataType.toLowerCase()}`);

  // Create a language-tagged string with base direction
  if (languageOrDataType !== undefined && !('termType' in languageOrDataType)) {
    return new Literal(`"${value}"@${languageOrDataType.language.toLowerCase()}${languageOrDataType.direction ? `--${languageOrDataType.direction.toLowerCase()}` : ''}`);
  }

  // Automatically determine datatype for booleans, numbers, and dates
  let datatype = languageOrDataType ? languageOrDataType.value : '';
  if (datatype === '') {
    // Convert a boolean
    if (typeof value === 'boolean') datatype = xsd.boolean;
    // Convert an integer or double
    else if (typeof value === 'number') {
      if (Number.isFinite(value)) datatype = Number.isInteger(value) ? xsd.integer : xsd.double;else {
        datatype = xsd.double;
        if (!Number.isNaN(value)) value = value > 0 ? 'INF' : '-INF';
      }
    }
    // Convert a valid date
    else if (value instanceof Date && !Number.isNaN(value.getTime())) {
      datatype = xsd.dateTime;
      value = value.toISOString();
    }
  }

  // Create a datatyped literal
  return datatype === '' || datatype === xsd.string ? new Literal(`"${value}"`) : new Literal(`"${value}"^^${datatype}`);
}

// ### Creates a variable
function variable(name) {
  return new Variable(name);
}

// ### Returns the default graph
function defaultGraph() {
  return DEFAULTGRAPH;
}

// ### Creates a quad
function quad(subject, predicate, object, graph) {
  return new Quad(subject, predicate, object, graph);
}
function fromTerm(term) {
  if (term instanceof Term) return term;

  // Term instantiated with another library
  switch (term.termType) {
    case 'NamedNode':
      return namedNode(term.value);
    case 'BlankNode':
      return blankNode(term.value);
    case 'Variable':
      return variable(term.value);
    case 'DefaultGraph':
      return DEFAULTGRAPH;
    case 'Literal':
      return literal(term.value, term.language || term.datatype);
    case 'Quad':
      return fromQuad(term);
    default:
      throw new Error(`Unexpected termType: ${term.termType}`);
  }
}
function fromQuad(inQuad) {
  if (inQuad instanceof Quad) return inQuad;
  if (inQuad.termType !== 'Quad') throw new Error(`Unexpected termType: ${inQuad.termType}`);
  return quad(fromTerm(inQuad.subject), fromTerm(inQuad.predicate), fromTerm(inQuad.object), fromTerm(inQuad.graph));
}

/***/ },

/***/ 539
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.inDefaultGraph = inDefaultGraph;
exports.isBlankNode = isBlankNode;
exports.isDefaultGraph = isDefaultGraph;
exports.isLiteral = isLiteral;
exports.isNamedNode = isNamedNode;
exports.isQuad = isQuad;
exports.isVariable = isVariable;
exports.prefix = prefix;
exports.prefixes = prefixes;
var _N3DataFactory = _interopRequireDefault(__webpack_require__(601));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// **N3Util** provides N3 utility functions.

// Tests whether the given term represents an IRI
function isNamedNode(term) {
  return !!term && term.termType === 'NamedNode';
}

// Tests whether the given term represents a blank node
function isBlankNode(term) {
  return !!term && term.termType === 'BlankNode';
}

// Tests whether the given term represents a literal
function isLiteral(term) {
  return !!term && term.termType === 'Literal';
}

// Tests whether the given term represents a variable
function isVariable(term) {
  return !!term && term.termType === 'Variable';
}

// Tests whether the given term represents a quad
function isQuad(term) {
  return !!term && term.termType === 'Quad';
}

// Tests whether the given term represents the default graph
function isDefaultGraph(term) {
  return !!term && term.termType === 'DefaultGraph';
}

// Tests whether the given quad is in the default graph
function inDefaultGraph(quad) {
  return isDefaultGraph(quad.graph);
}

// Creates a function that prepends the given IRI to a local name
function prefix(iri, factory) {
  return prefixes({
    '': iri.value || iri
  }, factory)('');
}

// Creates a function that allows registering and expanding prefixes
function prefixes(defaultPrefixes, factory) {
  // Add all of the default prefixes
  const prefixes = Object.create(null);
  for (const prefix in defaultPrefixes) processPrefix(prefix, defaultPrefixes[prefix]);
  // Set the default factory if none was specified
  factory = factory || _N3DataFactory.default;

  // Registers a new prefix (if an IRI was specified)
  // or retrieves a function that expands an existing prefix (if no IRI was specified)
  function processPrefix(prefix, iri) {
    // Create a new prefix if an IRI is specified or the prefix doesn't exist
    if (typeof iri === 'string') {
      // Create a function that expands the prefix
      const cache = Object.create(null);
      prefixes[prefix] = local => {
        return cache[local] || (cache[local] = factory.namedNode(iri + local));
      };
    } else if (!(prefix in prefixes)) {
      throw new Error(`Unknown prefix: ${prefix}`);
    }
    return prefixes[prefix];
  }
  return processPrefix;
}

/***/ },

/***/ 683
(module, __unused_webpack_exports, __webpack_require__) {

/* ShExMap webapp bundle entry: extends the ShExWebApp global created by
 * ../shex-webapp/doc/webpacks/shex-webapp.js with the ShExMap extension.
 *
 * In HTML (and worker importScripts), load n3js.js and shex-webapp.js before
 * this bundle: webpack `externals` (see webpack.config.js) resolve the shared
 * modules to ShExWebApp.Modules / N3js at runtime instead of bundling a
 * second copy of every module.
 *
 * Under node, require("@shexjs/webapp") resolves normally, so this module
 * exports the same superset object it always did.
 */
ShExWebApp = Object.assign(__webpack_require__(568), {
  Map:                __webpack_require__(636),
  StringToRdfJs:      __webpack_require__(638),
  NestedTurtleWriter: __webpack_require__(441),
})

if (true)
  module.exports = ShExWebApp;


/***/ },

/***/ 568
(module) {

"use strict";
module.exports = ShExWebApp;

/***/ },

/***/ 811
(module) {

"use strict";
module.exports = ShExWebApp.Modules["@shexjs/term"];

/***/ },

/***/ 837
(module) {

"use strict";
module.exports = ShExWebApp.Modules["@shexjs/util"];

/***/ },

/***/ 179
(module) {

"use strict";
module.exports = ShExWebApp.Modules["@shexjs/validator"];

/***/ },

/***/ 747
(module) {

"use strict";
module.exports = ShExWebApp.Modules["@shexjs/visitor"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	let __webpack_exports__ = __webpack_require__(683);
/******/ 	
/******/ })()
;