/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 146
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
    double: `${XSD}double`,
    integer: `${XSD}integer`,
    string: `${XSD}string`
  },
  rdf: {
    type: `${RDF}type`,
    nil: `${RDF}nil`,
    first: `${RDF}first`,
    rest: `${RDF}rest`,
    langString: `${RDF}langString`
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

/***/ 998
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
var _IRIs = _interopRequireDefault(__webpack_require__(146));
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
  // ### The term type of this term
  get termType() {
    return 'NamedNode';
  }
}

// ## Literal constructor
exports.NamedNode = NamedNode;
class Literal extends Term {
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
    // If "@" it follows, return the remaining substring; empty otherwise
    return atPos < id.length && id[atPos++] === '@' ? id.substr(atPos).toLowerCase() : '';
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
    // If "@" follows, return rdf:langString; xsd:string otherwise
    char !== '@' ? xsd.string : rdf.langString;
  }

  // ### Returns whether this object represents the same term as the other
  equals(other) {
    // If both literals were created by this library,
    // equality can be computed through ids
    if (other instanceof Literal) return this.id === other.id;
    // Otherwise, compare term type, value, language, and datatype
    return !!other && !!other.datatype && this.termType === other.termType && this.value === other.value && this.language === other.language && this.datatype.value === other.datatype.value;
  }
  toJSON() {
    return {
      termType: this.termType,
      value: this.value,
      language: this.language,
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
      return factory.literal(id.substr(1, endPos - 1), id[endPos + 1] === '@' ? id.substr(endPos + 2) : factory.namedNode(id.substr(endPos + 3)));
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
      return `"${term.value}"${term.language ? `@${term.language}` : term.datatype && term.datatype.value !== xsd.string ? `^^${term.datatype.value}` : ''}`;
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

  // Automatically determine datatype for booleans and numbers
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

/***/ 818
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
var _N3DataFactory = _interopRequireDefault(__webpack_require__(998));
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
     * @param languageOrDatatype The optional language or datatype.
     *                           If `languageOrDatatype` is a NamedNode,
     *                           then it is used for the value of `NamedNode.datatype`.
     *                           Otherwise `languageOrDatatype` is used for the value
     *                           of `NamedNode.language`.
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
 * A term that represents an RDF literal, containing a string with an optional language tag or datatype.
 */
class Literal {
    constructor(value, languageOrDatatype) {
        this.termType = 'Literal';
        this.value = value;
        if (typeof languageOrDatatype === 'string') {
            this.language = languageOrDatatype;
            this.datatype = Literal.RDF_LANGUAGE_STRING;
        }
        else if (languageOrDatatype) {
            this.language = '';
            this.datatype = languageOrDatatype;
        }
        else {
            this.language = '';
            this.datatype = Literal.XSD_STRING;
        }
    }
    equals(other) {
        return !!other && other.termType === 'Literal' && other.value === this.value &&
            other.language === this.language && this.datatype.equals(other.datatype);
    }
}
exports.Literal = Literal;
Literal.RDF_LANGUAGE_STRING = new NamedNode_1.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
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

/**
 * options: {
 *   indent: '    ',
 *   checkCorefs: n => false, // meaning "trust me, it's a tree"
 * }
 */

// **N3Writer** writes N3 documents.
const namespaces = (__webpack_require__(146)["default"]);
const N3Fac = __webpack_require__(998);
const { Term } = N3Fac;
const N3DataFactory = N3Fac.default;
const { isDefaultGraph } = __webpack_require__(818);

const DEFAULTGRAPH = N3DataFactory.defaultGraph();

const { rdf, xsd } = namespaces;

// Characters in literals that require escaping
const escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapedCharacters = {
      '\\': '\\\\', '"': '\\"', '\t': '\\t',
      '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
    };
const rdf10LocalName = `[_a-zA-Z][\\-_a-zA-Z0-9]*`;
const rdf11LocalName = `[_a-zA-Z0-9][\\-_a-zA-Z0-9.]*`;

// ## Placeholder class to represent already pretty-printed terms
class SerializedTerm extends Term {
  // Pretty-printed nodes are not equal to any other node
  // (e.g., [] does not equal [])
  equals() {
    return false;
  }
}

const INDENT = '  ';

class Nesting {
  constructor (stream, indent, subject, predicate) {
    if (this.constructor === Nesting)
      throw new TypeError(`Cannot construct ${new.target.name} instances directly`);
    const missing = (['close']).filter(m => this[m] === Nesting.prototype[m]);
    if (missing.length)
      throw new TypeError(`${new.target.name} missing methods: ${missing.join(', ')}`);

    this._stream = stream;
    this._indent = indent;
    this._subject = subject;
    this._predicate = predicate; // gets updated by _writeQuad()
  }

  close (done) { this._abstract('close'); }

  _abstract (method) { throw new TypeError(`${this.constructor.name}.${method} not implemented`); }
}

class Root extends Nesting {
  constructor (stream, subject, predicate) { super(stream, '  ', subject, predicate); }
  close (done) {
    if (this.used) {
      this._stream._write('.\n', done);
      this.used = false;
    }
  }
}

class BNode extends Nesting {
  constructor (stream, indent, node) { super(stream, indent, node, null); }
  close (done, p) {
    this._stream._write((this.used ? `\n${p._indent}` : '') + ']', done);
  }
}

class Collection extends Nesting {
  constructor (stream, indent, members) {
    super(stream, indent, null, null);
    this._members = members;
    this.leadSpace = false;
  }
  close (done, p) {
    this._stream._write(`\n${p._indent})`, done);
  }
}


// ## Constructor
class Writer {
  constructor(outputStream, options) {
    // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
    this._prefixRegex = /$0^/;

    // Shift arguments if the first argument is not a stream
    if (outputStream && typeof outputStream.write !== 'function')
      options = outputStream, outputStream = null;
    options = options || {};
    this._lists = options.lists;
    this._indent = options.indent || '  ';
    this._checkCorefs = options.checkCorefs || (n => false); // if unsupplied; assume a tree
    this._version = options.version || 1.0;
    this._localName = this._version === 1.0
        ? rdf10LocalName
        : rdf11LocalName;

    // If no output stream given, send the output as string through the end callback
    if (!outputStream) {
      let output = '';
      this._outputStream = {
        write(chunk, encoding, done) { if (options.debug) { console.log({chunk, output}); } output += chunk; done && done(); },
        end: done => { done && done(null, output); },
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
        this._baseMatcher = new RegExp(`^${escapeRegex(options.baseIRI)
            }${options.baseIRI.endsWith('/') ? '' : '[#?]'}`);
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

      const oldLength = this._nestings.length;
      let [nesting, matched] = this._getNestingForSubject(subject);

      let objectStr;
      if (this._lists && (object.value in this._lists)) {
        objectStr = '(';
        this._nestings.push(new Collection(this, nesting._indent + INDENT, this._lists[object.value]));
      } else if (object.termType === 'BlankNode'
          && this._checkCorefs
          && !this._checkCorefs(object)) {
        objectStr = '[';
        this._nestings.push(new BNode(this, nesting._indent + INDENT, object));
      } else {
        objectStr = this._encodeObject(object);
      }

      // Don't repeat the subject if it's the same
      if (matched) {
        // Don't repeat the predicate if it's the same
        if (predicate.equals(nesting.predicate)) {
          this._write(`, ${objectStr}`, done);
          // Same subject, different predicate
        } else {
          this._write(`${nesting.used ? ';' : ''}\n${nesting._indent}${
              this._encodePredicate(nesting.predicate = predicate)} ${
              objectStr}`, done);
        }
      }
      // Different subject; write the whole quad
      else {
        nesting._subject = subject; nesting._predicate = predicate;
        this._write(`${
                    this._encodeSubject(subject)} ${
                    this._encodePredicate(predicate)} ${
                    objectStr}`, done);
      }
      nesting.used = true;
    }
    catch (error) { if (done) done(error); else throw error;  }
  }

  /*
    closes BNodes and iterates and closes Collections until finding subject.
   */
  _getNestingForSubject (subject) {
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
        } else {
          const li = nesting._members.shift();
          if (li.value in this._lists) {
            // list in a list
            this._write(`${leadSpace}(`)
            this._nestings.push(nesting = new Collection(this, nesting._indent + INDENT, this._lists[li.value]));
            nesting.leadSpace = false;
          } else {
            // any other element in the list
            if (li.equals(subject)) {
              this._write("\n" + nesting._indent + '[');
              nesting._subject = null;
              this._nestings.push(nesting = new BNode(this, nesting._indent + INDENT, subject));
              nesting.leadSpace = false;
            } else {
              nesting._subject = li;
            }
          }
        }
      } else if (nesting instanceof BNode) {
        nesting = this._closeNesting();
      } else {
        nesting.close();
        return [nesting, false]; // didn't match subject
      }
    }
    return [nesting, subject.equals(nesting._subject)]; // hard code true?

  }

  _closeNesting () {
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
      } else {
        this._write('\n}\n');
      }
      return true;
    } else {
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
    return  `${this._encodeSubject(subject)} ${
            this._encodeIriOrBlank(predicate)} ${
            this._encodeObject(object)
            }${graph && graph.value ? ` ${this._encodeIriOrBlank(graph)} .\n` : ' .\n'}`;
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
    return `<<${
      this._encodeSubject(subject)} ${
      this._encodePredicate(predicate)} ${
      this._encodeObject(object)}${
      isDefaultGraph(graph) ? '' : ` ${this._encodeIriOrBlank(graph)}`}>>`;
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
      } else {
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
      IRIlist = escapeRegex(IRIlist, /[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
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
        return new SerializedTerm(`[ ${this._encodePredicate(child.predicate)} ${
                                  this._encodeObject(child.object)} ]`);
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
                      this._encodePredicate(child.predicate)} ${
                      this._encodeObject(child.object)}`;
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

  // ### `end` signals the end of the output stream
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
      try { return this._outputStream.end(singleDone); }
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

if (true)
  module.exports = {Writer};


/***/ },

/***/ 554
(module, __unused_webpack_exports, __webpack_require__) {

/* ShExMaterializer - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */

const {rdfJsTerm2Ld} = __webpack_require__(811);

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

const VERBOSE = false; // "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

const ProgramFlowError = { type: "ProgramFlowError", errors: { type: "UntrackedError" } };

const ShExTerm = __webpack_require__(811);
const ShExMap = __webpack_require__(612);

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
numericParsers[XSD + "float"  ] = function (label, parseError) {
  if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for float?
    parseError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "double" ] = function (label, parseError) {
  if (!(label.match(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return Number(label);
};

function testRange (value, datatype, parseError) {
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
    integer:            { min: -Infinity           , max: Infinity },
    decimal:            { min: -Infinity           , max: Infinity },
    float:              { min: -Infinity           , max: Infinity },
    double:             { min: -Infinity           , max: Infinity },
    nonPositiveInteger: { min: -Infinity           , max: 0        },
    negativeInteger:    { min: -Infinity           , max: -1       },
    long:               { min: -9223372036854775808, max: 9223372036854775807 },
    int:                { min: -2147483648         , max: 2147483647 },
    short:              { min: -32768              , max: 32767    },
    byte:               { min: -128                , max: 127      },
    nonNegativeInteger: { min: 0                   , max: Infinity },
    unsignedLong:       { min: 0                   , max: 18446744073709551615 },
    unsignedInt:        { min: 0                   , max: 4294967295 },
    unsignedShort:      { min: 0                   , max: 65535    },
    unsignedByte:       { min: 0                   , max: 255      },
    positiveInteger:    { min: 1                   , max: Infinity }
  }
  const parms = ranges[datatype.substr(XSD.length)];
  if (!parms) throw Error("unexpected datatype: " + datatype);
  if (value < parms.min) {
    parseError("\"" + value + "\"^^<" + datatype + "> is less than the min:", parms.min);
  } else if (value > parms.max) {
    parseError("\"" + value + "\"^^<" + datatype + "> is greater than the max:", parms.min);
  }
};

/*
function intSubType (spec, label, parseError) {
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
 {type: "positiveInteger", min: 1}].forEach(function (i) {
   numericParsers[XSD + i.type ] = function (label, parseError) {
     return intSubType(i, label, parseError);
   };
 });
*/

const stringTests = {
  length   : function (v, l) { return v.length === l; },
  minlength: function (v, l) { return v.length  >= l; },
  maxlength: function (v, l) { return v.length  <= l; }
};

const numericValueTests = {
  mininclusive  : function (n, m) { return n >= m; },
  minexclusive  : function (n, m) { return n >  m; },
  maxinclusive  : function (n, m) { return n <= m; },
  maxexclusive  : function (n, m) { return n <  m; }
};

const decimalLexicalTests = {
  totaldigits   : function (v, d) {
    const m = v.match(/[0-9]/g);
    return m && m.length <= d;
  },
  fractiondigits: function (v, d) {
    const m = v.match(/^[+-]?[0-9]*\.?([0-9]*)$/);
    return m && m[1].length <= d;
  }
};

function makeCache () {
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
      } else if (cache.indexOf(shape) !== -1) {
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
  this._expect = this.options.lax ? noop : expect; // report errors on missing types.
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function () {  }; // included in case we need it later.
  // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
  const regexModule = this.options.regexModule || __webpack_require__(443);

  let blankNodeCount = 0;
  const nextBNode = options.nextBNode || function () {
    return '_:b' + blankNodeCount++;
  };

  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  this.getAST = function () {
    return {
      type: "AST",
      shapes: Object.keys(this.schema._index.shapeExprs).reduce(function (ret, label) {
        ret[label] = {
          type: "ASTshape",
          expression: _compileShapeToAST(_ShExValidator.schema._index.shapeExprs[label].expression, [], _ShExValidator.schema)
        };
        return ret;
      }, {})
    };
  };

  /* indexTripleConstraints - compile regular expression and index triple constraints
   */
  this.indexTripleConstraints = function (expression) {
    // list of triple constraints from (:p1 ., (:p2 . | :p3 .))
    const tripleConstraints = [];

    if (expression)
      indexTripleConstraints_dive(expression);
    return tripleConstraints;

    function indexTripleConstraints_dive (expr) {
      if (expr.type === "TripleConstraint")
        tripleConstraints.push(expr)-1;

      else if (expr.type === "OneOf" || expr.type === "EachOf")
        expr.expressions.forEach(function (nested) {
          indexTripleConstraints_dive(nested);
        });

      else if (expr.type === "Inclusion")
        indexTripleConstraints_dive(schema.productions[expr.include]);

      else
        runtimeError("unexpected expr type: " + expr.type);
    }// removed by dead control flow

  };

  this.validateShapeMap = function (db, shapeMap, depth, seen) {
    return shapeMap.map(pair => {
      let time = new Date();
      const res = this.validate(db, ShExTerm.ld2RdfJsTerm(pair.node), pair.shape, depth, seen); // really tracker and seen
      time = new Date() - time;
      return {
        node: pair.node,
        shape: pair.shape,
        status: "errors" in res ? "nonconformant" : "conformant",
        appinfo: res,
        elapsed: time
      };
    });
  }

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
  }

  this._validateShapeDecl = function (db, point, shapeDecl, shapeLabel, depth, tracker, seen, subgraph) {
    return this._validateShapeExpr(db, point, shapeDecl.shapeExpr, shapeLabel, depth, tracker, seen, subgraph);
  }

  this._lookupShape = function (label) {
    if (!("shapes" in this.schema) || this.schema.shapes.length === 0) {
      runtimeError("shape " + label + " not found; no shapes in schema");
    } else if (label in index.shapeExprs) {
      return index.shapeExprs[label]
    } else {
      runtimeError("shape " + label + " not found in:\n" + Object.keys(index.shapeExprs || []).map(s => "  " + s).join("\n"));
    }
  }

  this._validateShapeExpr = function (db, point, shapeExpr, shapeLabel, depth, seen) {
    if ("known" in this && this.known.cached(point, shapeExpr))
      return this.known.cached(point, shapeExpr);
    let ret = null;
    if (point === "")
      throw Error("validation needs a valid focus node");
    if (typeof(shapeExpr) === "string") { // ShapeRef
      ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[shapeExpr], shapeExpr, depth, seen);
    } else if (shapeExpr.type === "NodeConstraint") {
      const errors = this._errorsMatchingNodeConstraint(point, shapeExpr, null);
      ret = errors.length ? {
        type: "Failure",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        errors: errors.map(function (miss) {
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
    } else if (shapeExpr.type === "Shape") {
      ret = this._validateShape(db, point, regexModule.compile(schema, shapeExpr),
                                 shapeExpr, shapeLabel, depth, seen);
    } else if (shapeExpr.type === "ShapeExternal") {
      ret = this.options.validateExtern(db, point, shapeLabel, depth, seen);
    } else if (shapeExpr.type === "ShapeOr") {
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
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(db, point, shapeExpr.shapeExpr, shapeLabel, depth, seen);
      if ("errors" in sub)
          ret = { type: "ShapeNotResults", solution: sub };
        else
          ret = { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes = [];
      ret = { type: "ShapeAndResults", solutions: passes };
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(db, point, nested, shapeLabel, depth, seen);
        if ("errors" in sub) {
          ret = { type: "ShapeAndFailure", errors: sub };
          break;
        } else
          passes.push(sub);
      }
    } else
      throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
    if ("known" in this)
      this.known.remember(point, shapeExpr, ret);
    return ret;
  }

  this._validateShape = function (db, point, regexEngine, shape, shapeLabel, depth, seen) {
    const _ShExValidator = this;

    // logging stuff
    if (depth === undefined)
      depth = 0;
    const padding = (new Array(depth + 1)).join("  "); // AKA "  ".repeat(depth);
    function _log () {
      if (!VERBOSE) { return; }
      console.log(padding + Array.prototype.join.call(arguments, ""));
    }

    let ret = null;
    const startAcionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in schema && !this.semActHandler.dispatchAll(schema.startActs, null, startAcionStorage))
      return null; // some semAct aborted !! return real error
    _log("validating <" + point + "> as <" + shapeLabel + ">");

    // const outgoing = indexNeighborhood(db.findByIRI(point, null, null, null).sort(byObject));
    // const incoming = indexNeighborhood(db.findByIRI(null, null, point, null).sort(bySubject));
    const neighborhood = []; // outgoing.triples.concat(incoming.triples); // @@ make fancy array holder.

    const constraintList = this.indexTripleConstraints(shape.expression);
    // const tripleList = triple2constraintList.reduce(function (ret, constraint, ord) {

    //   // subject and object depend on direction of constraint.
    //   const searchSubject = constraint.inverse ? null : point;
    //   const searchObject = constraint.inverse ? point : null;
    //   const index = constraint.inverse ? incoming : outgoing;

    //   // get triples matching predciate
    //   const matchPredicate = index.byPredicate[constraint.predicate] ||
    //     []; // empty list when no triple matches that constraint

    //   function _errorsByShapeLabel (focus, shapeLabel) {
    //     const sub = _ShExValidator.validate(db, focus, shapeLabel, depth + 1, seen);
    //     return "errors" in sub ? sub.errors : [];
    //   }
    //   function _errorsByShapeExpr (focus, shapeExpr) {
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

    //   matchConstraints.hits.forEach(function (t) {
    //     ret.triple2constraintList[neighborhood.indexOf(t)].push(ord);
    //   });
    //   matchConstraints.misses.forEach(function (t) {
    //     ret.misses[neighborhood.indexOf(t.triple)] = {constraintNo: ord, errors: t.errors};
    //   });
    //   return ret;
    // }, { misses: {}, triple2constraintList:_seq(neighborhood.length).map(function () { return []; }) }); // start with [[],[]...]

    // _log("constraints by triple: ", JSON.stringify(tripleList.triple2constraintList));

    // const misses = tripleList.triple2constraintList.reduce(function (ret, constraints, ord) {
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
      //           unexpectedTriples: tripleToConstraintMapping.reduce((ret, c, idx) => {
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
      // tripleToConstraintMapping.forEach(function (tpNumber, ord) {
      //   if (tpNumber !== undefined) {
      //     usedTriples.push(neighborhood[ord]);
      //     ++constraintMatchCount[tpNumber];
      //   }
      // });

      // // Pivot to triples by constraint.
      // function _constraintToTriples () {
      //   const cll = triple2constraintList.length;
      //   return tripleToConstraintMapping.slice().
      //     reduce(function (ret, c, ord) {
      //       if (c !== undefined)
      //         ret[c].push(ord);
      //       return ret;
      //     }, _seq(cll).map(function () { return []; }));
      // }

      // tripleToConstraintMapping.slice().sort(function (a,b) { return a-b; }).filter(function (i) { // sort constraint numbers
      //   return i !== undefined;
      // }).map(function (n) { return n + " "; }).join(""); // e.g. 0 0 1 3 

      function _recurse (point, shapeLabel) {
        return _ShExValidator.validate(db, point, shapeLabel, depth+1, seen);
      }
      function _direct (point, shapeExpr) {
        return _ShExValidator._validateShapeExpr(db, point, shapeExpr, shapeLabel, depth, seen);
      }
      function _testExpr (term, valueExpr, recurse, direct) {
        return _ShExValidator._errorsMatchingShapeExpr(term, valueExpr, recurse, direct)
      }
      const results = regexEngine.match(db, point, constraintList, _synthesize, /*_constraintToTriples(), tripleToConstraintMapping, */ neighborhood, _recurse, _direct, this.semActHandler, _testExpr, null);
      function _synthesize (constraintNo, min, max, neighborhood) {
        // console.log({"constraintNo": constraintNo, "min": min, "max": max, "triple2constraintList": triple2constraintList, "db": db, "point": point, "regexEngine": regexEngine, "shape": shape, "shapeLabel": shapeLabel, "depth": depth, "seen": seen});
        const tc = constraintList[constraintNo];
        const curSubjectx = {cs: point};
        const target = new config.rdfjs.Store();
        mapper.visitTripleConstraint(tc, curSubjectx, nextBNode, target, { _maybeSet: () => {} }, _ShExValidator.schema, db, _recurse, _direct, _testExpr);
        const oldLen = neighborhood.length;
        const created = [... target.match()];
        neighborhood.push.apply(neighborhood, created);
        if (false) // removed by dead control flow
{}
        return Array.apply(null, {length: created.length}).map((_, idx)=>{ return idx+oldLen});
        // if ("semActs" in tc) {
        //   tc.semActs.forEach(function (semAct) {
        //     if (semAct.name === ShExMap.url) {
        //       const prefixes = _ShExValidator.schema.prefixes;
              
        //     }
        //   });
        // }
        // console.dir();
        // removed by dead control flow

      }
      function mapper_visitTripleConstraint (expr) {
        const mapExts = (expr.semActs || []).filter(function (ext) { return ext.name === ShExMap.url; });
        if (mapExts.length) {
          mapExts.forEach(function (ext) {
            const code = ext.code;
            const m = code.match(pattern);

            let tripleObject;
            if (m) { 
              const arg = m[1] ? m[1] : P(m[2] + ":" + m[3]); 
              if (!_.isUndefined(bindings[arg])) {
                tripleObject = bindings[arg];
              }
            }

            // Is the arg a function? Check if it has parentheses and ends with a closing one
            if (_.isUndefined(tripleObject)) {
              if (/[ a-zA-Z0-9]+\(/.test(code)) 
                  tripleObject = extensions.lower(code, bindings, schema.prefixes);
            }

            if (_.isUndefined(tripleObject)) console.warn('Not in bindings: ',code);
            add(curSubject, expr.predicate, tripleObject);
          });

        } else if ("values" in expr.valueExpr && expr.valueExpr.values.length === 1) {
          add(curSubject, expr.predicate, expr.valueExpr.values[0]);

        } else {
          const oldSubject = curSubject;
          curSubject = B();
          add(oldSubject, expr.predicate, curSubject);
          this._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
                         ["inverse", "negated", "predicate", "valueExprRef", "valueExpr",
                          "min", "max", "annotations", "semActs"])
          curSubject = oldSubject;
        }
      };

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
          errors: [ { type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] } ]
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
    if (ret === null/* !! && this.options.diagnose */) {
      const missErrors = [];// misses.map(function (miss) {
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

    if (VERBOSE) { // remove N3jsTripleToString
      neighborhood.forEach(function (t) {
        delete t.toString;
      });
    }
    if ("startActs" in schema && depth === 0) {
      ret.startActs = schema.startActs;
    }
    _log("</" + shapeLabel + ">");
    return ret;
  };

  this._triplesMatchingShapeExpr = function (triples, valueExpr, inverse, recurse, direct) {
    const _ShExValidator = this;
    const misses = [];
    const hits = [];
    triples.forEach(function (triple) {
      const value = inverse ? triple.subject : triple.object;
      const errors = valueExpr === undefined ?
          [] :
          _ShExValidator._errorsMatchingShapeExpr(value, valueExpr, recurse, direct);
      if (errors.length === 0) {
        hits.push(triple);
      } else if (hits.indexOf(triple) === -1) {
        misses.push({triple: triple, errors: errors});
      }
    });
    return { hits: hits, misses: misses };
  }
  this._errorsMatchingShapeExpr = function (value, valueExpr, recurse, direct) {
    const _ShExValidator = this;
    if (typeof(valueExpr) === "string") { // ShapeRef
      return recurse ? recurse(value, valueExpr) : [];
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return direct === undefined ? [] : direct(value, valueExpr);
    } else if (valueExpr.type === "ShapeOr") {
      let ret = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExprs[i], recurse, direct);
        if (nested.length === 0)
          return nested;
        ret = ret.concat(nested);
      }
      return ret;
    } else if (valueExpr.type === "ShapeAnd") {
      return valueExpr.shapeExprs.reduce(function (ret, nested, iter) {
        return ret.concat(_ShExValidator._errorsMatchingShapeExpr(value, nested, recurse, direct, true));
      }, []);
    } else {
      throw Error("unknown value expression type '" + valueExpr.type + "'");
    }
  };

  /* _errorsMatchingNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  this._errorsMatchingNodeConstraint = function (value, valueExpr, recurse) {
    const errors = [];
    const label = value.value;
    const dt = value.termType === "Literal" ? value.datatype.value : null;
    const numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

    function validationError () {
      const errorStr = Array.prototype.join.call(arguments, "");
      errors.push("Error validating " + ShExTerm.rdfJsTerm2Turtle(value) + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
      return false;
    }
    // if (negated) ;
    if (false) // removed by dead control flow
{} else {
      if ("nodeKind" in valueExpr) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
          validationError("unknown node kind '" + valueExpr.nodeKind + "'");
        }
        if (value.termType === "BlankNode") {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (value.termType === "Literal") {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }

      if (valueExpr.datatype  && valueExpr.values) validationError("found both datatype and values in " + valueExpr);

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
          if (ret) return true;
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
        } else if (valueExpr.values.indexOf(label) !== -1) {
          // trivial match
        } else {
          if (!(valueExpr.values.some(function (valueConstraint) {
            if (typeof valueConstraint === "object" && !("value" in valueConstraint)) { // i.e. not a simple term
              if (!("type" in valueConstraint))
                runtimeError("expected "+JSON.stringify(valueConstraint)+" to have a 'type' attribute.");
              const ExpectedTypePattern = /(Iri|Literal|Language)(Stem)?(Range)?/;
              const matchType = valueConstraint.type.match(ExpectedTypePattern);
              if (!matchType)
                runtimeError("expected type attribute '" + valueConstraint.type + "' to match " + ExpectedTypePattern + ".");
              const [undefined, valType, isStem, isRange] = matchType;
              if (valType === 'Iri') {
                if (value.termType !== 'NamedNode')
                  return false;
              } else {
                if (value.termType !== 'Literal')
                  return false;
              }

              /* expect N3.js literals with {Literal,Language}StemRange
               *       or non-literals with IriStemRange
               */
              function normalizedTest (val, ref, func) {
                if (["Literal", "Language"].indexOf(valType) !== -1) { // val.termType === "Literal"
                  if (["LiteralStem", "LiteralStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(val.value, ref);
                  } else if (["LanguageStem", "LanguageStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(val.language || null, ref);
                  } else {
                    return validationError("literal " + JSON.stringify(val) + " not comparable with non-literal " + ref);
                  }
                } else {
                  if (["IriStem", "IriStemRange"].indexOf(valueConstraint.type) === -1) {
                    return validationError("nonliteral " + JSON.stringify(val) + " not comparable with literal " + JSON.stringify(ref));
                  } else {
                    return func(val.value, ref);
                  }
                }
              }
              function startsWith (val, ref) {
                return normalizedTest(val, ref, (l, r) => {
                  return (valueConstraint.type === "LanguageStem" ||
                          valueConstraint.type === "LanguageStemRange") ?
                    // rfc4647 basic filtering
                    l !== null && (l === r || r === "" || l[r.length] === "-") :
                    // simple substring
                    l.startsWith(r);
                });
              }
              function equals (val, ref) {
                return normalizedTest(val, ref, (l, r) => { return l === r; });
              }

              if (!isTerm(valueConstraint.stem)) {
                expect(valueConstraint.stem, "type", "Wildcard");
                // match whatever but check exclusions below
              } else {
                if (!(startsWith(value, valueConstraint.stem))) {
                  return false;
                }
              }
              if (valueConstraint.exclusions) {
                return !valueConstraint.exclusions.some(function (c) {
                  if (!isTerm(c)) {
                    if (!("type" in c))
                      runtimeError("expected "+JSON.stringify(c)+" to have a 'type' attribute.");
                    const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
                    if (stemTypes.indexOf(c.type) === -1)
                      runtimeError("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'.");
                    return startsWith(value, c.stem);
                  } else {
                    return equals(value, c);
                  }
                });
              }
              return true;
            } else {
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
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + label);
        }
      }
    });

    Object.keys(decimalLexicalTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
          if (!decimalLexicalTests[test](""+numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
          }
        } else {
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
    } else {
      ret.type = "NodeConstraintTest";
    }
    return ret;
  };

  this.semActHandler = {
    handlers: { },
    results: { },
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

/* _compileShapeToAST - compile a shape expression to an abstract syntax tree.
 *
 * currently tested but not used.
 */
function _compileShapeToAST (expression, tripleConstraints, schema) {

  function Epsilon () {
    this.type = "Epsilon";
  }

  function TripleConstraint (ordinal, predicate, inverse, negated, valueExpr) {
    this.type = "TripleConstraint";
    // this.ordinal = ordinal; @@ does 1card25
    this.inverse = !!inverse;
    this.negated = !!negated;
    this.predicate = predicate;
    if (valueExpr !== undefined)
      this.valueExpr = valueExpr;
  }

  function Choice (disjuncts) {
    this.type = "Choice";
    this.disjuncts = disjuncts;
  }

  function EachOf (conjuncts) {
    this.type = "EachOf";
    this.conjuncts = conjuncts;
  }

  function SemActs (expression, semActs) {
    this.type = "SemActs";
    this.expression = expression;
    this.semActs = semActs;
  }

  function KleeneStar (expression) {
    this.type = "KleeneStar";
    this.expression = expression;
  }

  function _compileExpression (expr, schema) {
    let repeated, container;

    /* _repeat: map expr with a min and max cardinality to a corresponding AST with Groups and Stars.
       expr 1 1 => expr
       expr 0 1 => Choice(expr, Eps)
       expr 0 3 => Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps)
       expr 2 5 => EachOf(expr, expr, Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps))
       expr 0 * => KleeneStar(expr)
       expr 1 * => EachOf(expr, KleeneStar(expr))
       expr 2 * => EachOf(expr, expr, KleeneStar(expr))

       @@TODO: favor Plus over Star if Epsilon not in expr.
    */
    function _repeat (expr, min, max) {
      if (min === undefined) { min = 1; }
      if (max === undefined) { max = 1; }

      if (min === 1 && max === 1) { return expr; }

      const opts = max === UNBOUNDED ?
        new KleeneStar(expr) :
        _seq(max - min).reduce(function (ret, elt, ord) {
          return ord === 0 ?
            new Choice([expr, new Epsilon]) :
            new Choice([new EachOf([expr, ret]), new Epsilon]);
        }, undefined);

      const reqd = min !== 0 ?
        new EachOf(_seq(min).map(function (ret) {
          return expr; // @@ something with ret
        }).concat(opts)) : opts;
      return reqd;
    }

    if (expr.type === "TripleConstraint") {
      // predicate, inverse, negated, valueExpr, annotations, semActs, min, max
      const valueExpr = "valueExprRef" in expr ?
        schema.valueExprDefns[expr.valueExprRef] :
        expr.valueExpr;
      const ordinal = tripleConstraints.push(expr)-1;
      const tp = new TripleConstraint(ordinal, expr.predicate, expr.inverse, expr.negated, valueExpr);
      repeated = _repeat(tp, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "OneOf") {
      container = new Choice(expr.expressions.map(function (e) {
        return _compileExpression(e, schema);
      }));
      repeated = _repeat(container, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "EachOf") {
      container = new EachOf(expr.expressions.map(function (e) {
        return _compileExpression(e, schema);
      }));
      repeated = _repeat(container, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "Inclusion") {
      const included = schema._index.shapeExprs[expr.include].expression;
      return _compileExpression(included, schema);
    }

    else throw Error("unexpected expr type: " + expr.type);
  }

  return expression ? _compileExpression(expression, schema) : new Epsilon();
}

// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets) {
  const n = sets.length, carets = [], args = null;

  function init() {
    args = [];
    for (let i = 0; i < n; i++) {
      carets[i] = 0;
      args[i] = sets[i][0];
    }
  }

  function next() {

    // special case: crossProduct([]).next().next() returns false.
    if (args !== null && args.length === 0)
      return false;

    if (args === null) {
      init();
      return true;
    }
    const i = n - 1;
    carets[i]++;
    if (carets[i] < sets[i].length) {
      args[i] = sets[i][carets[i]];
      return true;
    }
    while (carets[i] >= sets[i].length) {
      if (i == 0) {
        return false;
      }
      carets[i] = 0;
      args[i] = sets[i][0];
      carets[--i]++;
    }
    args[i] = sets[i][carets[i]];
    return true;
  }

  return {
    next: next,
    do: function (block, _context) { // old API
      return block.apply(_context, args);
    },
    // new API because
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description
    // cautions about functions over arguments.
    get: function () { return args; }
  };
}

/* N3jsTripleToString - simple toString function to make N3.js's triples
 * printable.
 */
const N3jsTripleToString = function () {
  function fmt (n) {
    return n.termType === "Literal" ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(n.datatype.value) !== -1 ?
      parseInt(n.value) :
      n :
    n.termType === "BlankNode" ?
      n :
      "<" + n + ">";
  }
  return fmt(this.subject) + " " + fmt(this.predicate) + " " + fmt(this.object) + " .";
};

/* indexNeighborhood - index triples by predicate
 * returns: {
 *     byPredicate: Object: mapping from predicate to triples containing that
 *                  predicate.
 *
 *     candidates: [[1,3], [0,2]]: mapping from triple to the triple constraints
 *                 it matches.  It is initialized to []. Mappings that remain an
 *                 empty set indicate a triple which didn't matching anything in
 *                 the shape.
 *
 *     misses: list to recieve value constraint failures.
 *   }
 */
function indexNeighborhood (triples) {
  return {
    triples: triples,
    byPredicate: triples.reduce(function (ret, t) {
      const p = t.predicate;
      if (!(p in ret))
        ret[p] = [];
      ret[p].push(t);

      // If in VERBOSE mode, add a nice toString to N3.js's triple objects.
      if (VERBOSE)
        t.toString = N3jsTripleToString;

      return ret;
    }, {}),
    candidates: _seq(triples.length).map(function () {
      return [];
    }),
    misses: []
  };
}

/* bySubject - sort triples by subject following SPARQL partial ordering.
 */
function bySubject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  const l = t1.subject, r = t2.subject;
  const lprec = l.termType === "BlankNode" ? 1 : l.termType === "Literal" ? 2 : 3;
  const rprec = r.termType === "BlankNode" ? 1 : r.termType === "Literal" ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* byObject - sort triples by object following SPARQL partial ordering.
 */
function byObject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  const l = t1.object, r = t2.object;
  const lprec = l.termType === "BlankNode" ? 1 : l.termType === "Literal" ? 2 : 3;
  const rprec = r.termType === "BlankNode" ? 1 : r.termType === "Literal" ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* Return a list of n ""s.
 *
 * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
 * never calls f.
 */
function _seq (n) {
  return n === 0 ?
    [] :
    Array(n).join(" ").split(/ /); // hahaha, javascript, you suck.
}

/* Expect property p with value v in object o
 */
function expect (o, p, v) {
  if (!(p in o))
    runtimeError("expected "+JSON.stringify(o)+" to have a '"+p+"' attribute.");
  if (arguments.length > 2 && o[p] !== v)
    runtimeError("expected "+p+" attribute '"+o[p]+"' to equal '"+v+"'.");
}

function noop () {  }

function runtimeError () {
  const errorStr = Array.prototype.join.call(arguments, "");
  const e = new Error("Runtime error: " + errorStr);
  Error.captureStackTrace(e, runtimeError);
  throw e;
}

  return { // node environment
    construct: ShExMaterializer_constructor,
    options: InterfaceOptions
  };
}


// ## Exports

// Export the `ShExMaterializer` class as a whole.
if (true)
  module.exports = ShExMapMaterializerCjsModule;


/***/ },

/***/ 245
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/** ThreadedMaterializer - prototype NFA-thread-based ShExMap materializer.
 *
 * Motivation: the trivialMaterializer/ShExMaterializer pair walks the target
 * schema depth-first while sharing ONE mutable binder (a pointer into the
 * binding tree plus destructive "used" marks -- see binder() in
 * ../shex-extension-map.js).  When a required node deep in the schema can't be
 * satisfied, the containing node is eliminated, but the binder's pointer and
 * used-marks are NOT restored, so success depends precariously on visit order.
 *
 * This prototype treats materialization like Thompson/Pike NFA simulation
 * (c.f. rbenx in ./eval-simple-1err-materializer.js): the target schema
 * compiles to an NFA (plus a call stack for shape references, making it an
 * RTN/pushdown machine), and each live thread carries ITS OWN immutable
 * binding-tree cursor along with its NFA state, repetition counters and
 * emitted triples.  A thread that hits an unbound required variable simply
 * dies; sibling threads (fewer repetitions, skipped optional, other OneOf
 * disjunct) proceed with an uncorrupted cursor, giving the state rollback the
 * single-threaded implementation lacks.
 *
 * Thread anatomy:
 *   nfa       - compiled NFA of the shape instance being synthesized
 *   stateNo   - current state in that NFA
 *   subject   - N3id term whose arcs we are emitting
 *   repeats   - {reptStateNo: count} for counted repetitions (this instance)
 *   callStack - persistent list of {nfa, outs, subject, repeats, parent}
 *   cursor    - {idx, used, n, sk} pointer into the normalized binding frames
 *   quads     - persistent list of emitted {s, p, o} N3id triples
 *   bnode     - counter for inventing intermediate blank nodes
 *
 * Scheduling here is depth-first with greedy priority (prefer another
 * repetition / the emitting arm of an optional / the first OneOf disjunct),
 * with one demotion: a TC whose variable lookup has to ADVANCE the frame
 * cursor is a choice point, not a fait accompli.  Its continuation is parked
 * on a deferred stack so every alternative that can still consume from the
 * current frame (other disjuncts, the exit arm of a repetition) explores
 * first, and the advance -- which forfeits any unused bindings it skips --
 * remains a fallback.  Without this, a pessimally-ordered OneOf pairs
 * bindings across frames (e.g. frame 0's :use with frame 2's :tel) and that
 * mix would win by being first.
 *
 * Acceptance: every distinct accepting thread is collected (bounded by
 * maxAccepts); materialize() returns the one that consumed the most bindings
 * (ties: fewest forfeited by advances, then discovery order).  The accepts
 * array is exposed for UIs to offer the choice when the materialization is
 * ambiguous.  See ../doc/threaded-materializer.md, which also discusses
 * stepping this machine breadth-parallel (PikeVM style) or determinizing it
 * into a DFA.
 */


const extensions = __webpack_require__(787);
const {n3idQuad2RdfJs} = __webpack_require__(638);

const MapExt = "http://shex.io/extensions/Map/#";
const variablePattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;
const functionPattern = /^\s*[a-zA-Z0-9]+\(.*\)\s*$/;
const UNBOUNDED = -1;

class MaterializationError extends Error {
  constructor (message, failures) {
    super(failures && failures.length
          ? message + "; deepest failures: " + JSON.stringify(
            // `tc` is the schema object (for editors to anchor on); its
            // serialization would bloat the message
            failures.slice(-3).map(f => Object.assign({}, f, {tc: undefined})))
          : message);
    this.failures = failures || [];
  }
}

/** normalizeBindingTree - flatten a binding tree to a sequence of frames.
 *
 * Reproduces the _mults/_cross preprocessing in binder(): bindings whose
 * variable occurs exactly once under an array level (e.g. bp:name next to a
 * list of repeated groups) are distributed into every frame produced by the
 * sibling arrays, preserving the association of multi-bindings while turning
 * the tree into a linear input tape for the NFA.
 */
function normalizeBindingTree (tree) {
  return walk(Array.isArray(tree) ? tree : [tree]).frames;

  function walk (node) {
    if (!Array.isArray(node)) {
      const counts = {};
      for (const k of Object.keys(node))
        counts[k] = 1;
      return {frames: [Object.assign({}, node)], leaf: true, counts};
    }
    const kids = node.map(walk);
    const counts = {};
    kids.forEach(kid => {
      for (const k of Object.keys(kid.counts))
        counts[k] = (counts[k] || 0) + kid.counts[k];
    });
    if (!kids.some(kid => !kid.leaf)) // plain sequence of frames
      return {frames: [].concat.apply([], kids.map(kid => kid.frames)), leaf: false, counts};

    // distribute each singleton binding from leaf kids into array kids' frames
    const shared = {};
    const ordered = [];
    kids.forEach(kid => {
      if (kid.leaf) {
        const rest = {};
        for (const [k, v] of Object.entries(kid.frames[0])) {
          if (counts[k] === 1)
            shared[k] = v;
          else
            rest[k] = v;
        }
        if (Object.keys(rest).length > 0)
          ordered.push({frames: [rest], leaf: true});
      } else {
        ordered.push(kid);
      }
    });
    const frames = [];
    ordered.forEach(kid => kid.frames.forEach(frame => {
      frames.push(kid.leaf ? frame : Object.assign({}, shared, frame));
    }));
    return {frames, leaf: false, counts};
  }
}

/** cursorGet - immutable lookup in the frame sequence.
 *
 * Mirrors binder().get: stay on the current frame if it holds an unused
 * binding for the variable, else scan forward; never move backward.  Returns
 * {value, cursor} with a NEW cursor (the caller's cursor is untouched), or
 * null if no unused binding remains -- unlike binder(), failure poisons
 * nothing.  cursor.n counts consumed frame bindings (globals don't count);
 * Rept states use it to demand progress from repeated subexpressions.
 * cursor.sk accumulates the unused bindings abandoned by forward scans (the
 * cursor never moves backward, so skipping past them forfeits them); the
 * acceptance heuristic prefers threads that forfeited less.
 */
function cursorGet (frames, globals, cursor, varName) {
  if (varName in globals) // staticVars: always available, never consumed
    return {value: globals[varName], cursor};
  for (let i = cursor.idx; i < frames.length; ++i) {
    const key = i + " " + varName;
    if (varName in frames[i] && !(key in cursor.used)) {
      const used = Object.assign({}, cursor.used);
      used[key] = true;
      let sk = cursor.sk;
      for (let j = cursor.idx; j < i; ++j) // abandoned by advancing past frames idx..i-1
        for (const v of Object.keys(frames[j]))
          if (!((j + " " + v) in used))
            ++sk;
      return {value: frames[i][varName], cursor: {idx: i, used, n: cursor.n + 1, sk}};
    }
  }
  return null;
}

class ThreadedMaterializer {
  constructor (schema, options = {}) {
    this.schema = schema;
    this.index = schema._index || (__webpack_require__(837).index)(schema);
    this.prefixes = schema._prefixes || schema.prefixes || {};
    this.globals = options.staticVars || {};
    this.maxRepeat = options.maxRepeat || 50;       // clamp unbounded cardinalities
    this.maxCallDepth = options.maxCallDepth || 50; // guard cyclic shape references
    this.maxSteps = options.maxSteps || 1000000;    // guard thread explosions
    this.maxAccepts = options.maxAccepts || 20;     // stop collecting alternatives here
    // once one thread has accepted, how many more steps to spend looking for
    // better/alternative materializations before settling for the best so far
    this.exploreSteps = options.exploreSteps || 10000;
    this._nfaCache = new Map();
  }

  /** materialize - synthesize a graph instance of shapeLabel (default: start)
   * rooted at createRoot from the given binding tree.
   * Returns an array of RdfJs quads.
   */
  materialize (bindingTree, createRoot, shapeLabel) {
    // drain the step generator; debuggers drive run() themselves
    const it = this.run(bindingTree, createRoot, shapeLabel);
    let step = it.next();
    while (!step.done)
      step = it.next();
    return step.value;
  }

  /** run - the materialization as a generator of debugger step events (see
   * MaterializerDebugger and doc/debugger-design.md at the repository root).
   * Yields, in traversal order:
   *   {type: "tripleConstraint", tc, thread}  before synthesizing a constraint
   *   {type: "fail", failure, thread}         a branch died (its emissions and
   *                                           cursor marks are discarded)
   *   {type: "advance", tc, thread, toFrame}  the constraint's variable lookup
   *                                           advanced the frame cursor: the
   *                                           thread is deferred so in-frame
   *                                           alternatives explore first
   *   {type: "return", thread}                a subshape call completed
   *   {type: "accept", thread, quads}         a thread reached an accepting
   *                                           state (exploration continues)
   * and returns the chosen quads (or throws MaterializationError); all
   * distinct accepts land in this.accepts = [{quads, consumed, skipped,
   * thread}].  thread = {subject, depth (subshape call depth), frame
   * (binding-frame cursor), consumed (bindings consumed), skipped (bindings
   * forfeited by advances), emitted (quads so far)}.
   */
  * run (bindingTree, createRoot, shapeLabel) {
    this.accepts = null;
    this.chosen = null;
    this.provenance = null;
    const frames = normalizeBindingTree(bindingTree);
    this.frames = frames; // exposed so UIs can render binding-tree state
    const nfa = this._compileShapeExprNFA(shapeLabel || this.schema.start
                                          || runtimeError("no shape given and no start in schema"));
    const failures = [];
    // for this.lastReport: which variables the schema referenced, and which
    // were available at all (a typo'd variable name silently prunes every
    // branch that needs it -- e.g. a starred subshape collapses to zero
    // iterations -- so surface never-bound variables and unused statics)
    const report = {referenced: new Set()};
    const availableVars = new Set(Object.keys(this.globals));
    frames.forEach(frame => Object.keys(frame).forEach(v => availableVars.add(v)));
    const accepts = [];
    this.accepts = accepts; // live: debuggers list accepts-so-far mid-run
    const acceptBySig = new Map(); // consumed-bindings signature -> accept
    const quadSigs = new Set();    // graph signatures already recorded
    const finishReport = (error) => {
      const seen = new Set();
      this.lastReport = {
        unboundVariables: failures.filter(f => {
          const key = f.variable + "\t" + (f.tc ? f.tc.predicate : "");
          if (!f.variable || availableVars.has(f.variable) || seen.has(key))
            return false;
          seen.add(key);
          return true;
        }),
        unusedStatics: Object.keys(this.globals).filter(g => !report.referenced.has(g)),
        alternatives: accepts.length,
        explorationTruncated: truncated,
      };
      if (error)
        error.report = this.lastReport;
      return error;
    };
    // a perfect accept consumed every frame binding; nothing can beat it
    const totalFrameBindings = frames.reduce((n, f) => n + Object.keys(f).length, 0);
    const stack = [{
      nfa, stateNo: nfa.start,
      subject: createRoot || "_:root",
      repeats: {}, callStack: null,
      cursor: {idx: 0, used: {}, n: 0, sk: 0},
      quads: null, bnode: 0
    }];
    // threads whose last constraint advanced the frame cursor wait here until
    // every in-frame alternative has been explored
    const deferred = [];
    this._live = {stack, deferred}; // liveThreads() inspects these
    let steps = 0;
    let acceptedAtStep = null; // step count at the first accept
    let truncated = false;     // exploration stopped by a budget, not exhaustion

    search:
    while (stack.length > 0 || deferred.length > 0) {
      if (++steps > this.maxSteps) {
        if (accepts.length > 0) { // settle for the best found so far
          truncated = true;
          break;
        }
        throw finishReport(new MaterializationError("exceeded maxSteps=" + this.maxSteps, failures));
      }
      if (acceptedAtStep !== null && steps - acceptedAtStep > this.exploreSteps) {
        truncated = true;
        break;
      }
      // deferred threads resume oldest-first: the greedy leader deferred at a
      // frame boundary gets back in front of the variants deferred after it
      const th = stack.length > 0 ? stack.pop() : deferred.shift();
      const st = th.nfa.states[th.stateNo];
      switch (st.type) {

      case "Match":
        if (th.callStack === null) { // an accepting thread; keep exploring
          // accepts are identified by WHICH bindings they consumed: variants
          // that differ only in constant emissions (e.g. skipped optional
          // constants) collapse onto the most-emitting one, as do
          // identical graphs
          const sig = Object.keys(th.cursor.used).sort().join("|");
          const qsig = quadSignature(th.quads);
          if (quadSigs.has(qsig))
            break;
          quadSigs.add(qsig);
          const existing = acceptBySig.get(sig);
          const {quads, provenance} = collectQuadsAndProvenance(th.quads);
          if (existing) {
            if (quads.length > existing.quads.length)
              Object.assign(existing, {quads, provenance, skipped: th.cursor.sk, thread: threadView(th)});
            break;
          }
          const accept = {quads, provenance, consumed: th.cursor.n,
                          skipped: th.cursor.sk, thread: threadView(th),
                          used: Object.keys(th.cursor.used)};
          acceptBySig.set(sig, accept);
          accepts.push(accept);
          if (acceptedAtStep === null)
            acceptedAtStep = steps;
          yield {type: "accept", thread: threadView(th), quads: accept.quads};
          if (accept.consumed >= totalFrameBindings // perfect: unbeatable
              || accepts.length >= this.maxAccepts)
            break search;
          break;
        }
        { // return from a shape-reference call
          // the return event belongs to the caller's level: step-out from
          // inside the call lands here
          yield {type: "return",
                 thread: Object.assign(threadView(th), {depth: stackDepth(th.callStack) - 1})};
          const frame = th.callStack;
          // vacuous-descend rule: greedy entry into an OPTIONAL shape-valued
          // constraint whose subshape then emitted nothing and consumed
          // nothing would leave a dangling bnode island; drop this thread --
          // the skip arm already queued yields the same content without it.
          // (A REQUIRED constraint keeps its empty island, as the old
          // materializer did.)
          if (frame.skippable && th.quads === frame.quadsMark && th.cursor.n === frame.consumedMark)
            break;
          frame.outs.forEach(out => stack.push(Object.assign({}, th, {
            nfa: frame.nfa, stateNo: out,
            subject: frame.subject, repeats: frame.repeats,
            callStack: frame.parent
          })));
        }
        break;

      case "Split": // OneOf: first disjunct has priority, so push it last
        for (let i = st.outs.length - 1; i >= 0; --i)
          stack.push(Object.assign({}, th, {stateNo: st.outs[i]}));
        break;

      case "Rept": {
        const r = th.repeats[th.stateNo] || {n: 0, at: -1};
        if (r.n >= st.min) { // exit arm (lower priority): reset counter for possible re-entry
          const repeats = Object.assign({}, th.repeats);
          delete repeats[th.stateNo];
          stack.push(Object.assign({}, th, {stateNo: st.outs[1], repeats}));
        }
        // greedy: another repetition, but only if the previous iteration
        // consumed a frame binding -- constant- or staticVar-only
        // subexpressions stay satisfiable forever, so without this progress
        // guard a starred one would loop to maxRepeat.
        if (r.n < Math.min(st.max, this.maxRepeat) && (r.n === 0 || th.cursor.n > r.at)) {
          const repeats = Object.assign({}, th.repeats);
          repeats[th.stateNo] = {n: r.n + 1, at: th.cursor.n};
          stack.push(Object.assign({}, th, {stateNo: st.outs[0], repeats}));
        }
        break;
      }

      case "TC": {
        yield {type: "tripleConstraint", tc: st.tc, thread: threadView(th)};
        const succs = [];
        const failuresLen = failures.length;
        this._stepTripleConstraint(th, st, frames, succs, failures, report);
        if (succs.length === 0) { // no successors: this branch died
          yield {type: "fail",
                 failure: failures.length > failuresLen ? failures[failures.length - 1] : null,
                 thread: threadView(th)};
        } else if (succs[0].cursor.idx > th.cursor.idx) {
          // the lookup advanced the frame cursor: that's a choice, not a
          // consequence -- park the continuation so alternatives that can
          // still consume from the current frame explore first
          yield {type: "advance", tc: st.tc, thread: threadView(th),
                 toFrame: succs[0].cursor.idx};
          for (const s of succs)
            deferred.push(s);
        } else {
          for (const s of succs)
            stack.push(s);
        }
        break;
      }

      default:
        runtimeError("unexpected NFA state type " + st.type);
      }
    }

    if (accepts.length === 0)
      throw finishReport(new MaterializationError("no thread reached an accepting state", failures));
    finishReport(null);
    // most bindings consumed; ties: fewest forfeited by advances, then most
    // emitted, then discovery (greedy) order
    let best = accepts[0];
    for (const a of accepts)
      if (a.consumed > best.consumed
          || (a.consumed === best.consumed
              && (a.skipped < best.skipped
                  || (a.skipped === best.skipped && a.quads.length > best.quads.length))))
        best = a;
    this.chosen = best;
    // provenance of the returned graph, parallel to its quads
    this.provenance = best.provenance;
    return best.quads;
  }

  /** _stepTripleConstraint - one TC visit synthesizes exactly one instance of
   * the constraint (cardinality is handled by the surrounding Rept states):
   *  - Map semActs: resolve each variable/function against this thread's
   *    cursor; any unbound variable kills the thread (rollback comes free).
   *  - singleton value set: emit the constant.
   *  - shape-valued: invent a bnode, link it, and call into the sub-shape NFA.
   * Successor threads go into succs; the caller schedules them (immediately,
   * or deferred when the cursor advanced).
   */
  _stepTripleConstraint (th, st, frames, succs, failures, report) {
    const tc = st.tc;
    const mapExts = (tc.semActs || []).filter(ext => ext.name === MapExt);

    if (mapExts.length > 0) {
      let cursor = th.cursor;
      const objects = [];
      const sources = []; // provenance, parallel to objects
      for (const ext of mapExts) {
        const code = ext.code;
        const m = code.match(variablePattern);
        if (m) {
          const varName = m[1] ? m[1] : this._expandPrefix(m[2], m[3]);
          report.referenced.add(varName);
          const hit = cursorGet(frames, this.globals, cursor, varName);
          if (hit === null) {
            failures.push({predicate: tc.predicate, tc, variable: varName, frame: cursor.idx});
            return; // unbound required variable: this thread dies
          }
          const fromStatics = varName in this.globals;
          cursor = hit.cursor;
          objects.push(n3ify(hit.value));
          sources.push({variables: [varName], frame: fromStatics ? null : cursor.idx, statics: fromStatics});
        } else if (functionPattern.test(code)) {
          const pulled = []; // the variables lower() consulted, in call order
          try { // e.g. regex(...)/hashmap(...): lower() pulls variables via get()
            const adapter = {get: (v) => {
              report.referenced.add(v);
              const hit = cursorGet(frames, this.globals, cursor, v);
              if (hit === null)
                return undefined;
              pulled.push({variable: v, statics: v in this.globals, frame: hit.cursor.idx});
              cursor = hit.cursor;
              return hit.value;
            }};
            objects.push(extensions.lower(code, adapter, this.prefixes));
            sources.push({
              variables: pulled.map(p => p.variable),
              frame: pulled.length && !pulled[0].statics ? pulled[pulled.length - 1].frame : null,
              statics: pulled.length > 0 && pulled.every(p => p.statics),
            });
          } catch (e) {
            failures.push({predicate: tc.predicate, tc, code, error: e.message});
            return;
          }
        } else {
          failures.push({predicate: tc.predicate, tc, code, error: "unrecognized Map code"});
          return;
        }
      }
      let quads = th.quads;
      objects.forEach((o, i) => {
        quads = {q: this._triple(tc, th.subject, o, sources[i]), prev: quads};
      });
      st.outs.forEach(out => succs.push(Object.assign({}, th, {stateNo: out, cursor, quads})));
      return;
    }

    const valueExpr = tc.valueExpr === undefined ? undefined : this._resolveShapeExpr(tc.valueExpr);
    if (valueExpr && valueExpr.type === "NodeConstraint"
        && valueExpr.values && valueExpr.values.length === 1) {
      const quads = {q: this._triple(tc, th.subject, n3ify(valueExpr.values[0]), {constant: true}),
                     prev: th.quads};
      st.outs.forEach(out => succs.push(Object.assign({}, th, {stateNo: out, quads})));
      return;
    }

    if (valueExpr && ["Shape", "ShapeAnd", "ShapeOr"].indexOf(valueExpr.type) !== -1) {
      if (stackDepth(th.callStack) >= this.maxCallDepth) {
        failures.push({predicate: tc.predicate, tc, error: "exceeded maxCallDepth"});
        return;
      }
      const bnode = "_:tm" + th.bnode;
      const sub = this._compileShapeExprNFA(valueExpr);
      const quads = {q: this._triple(tc, th.subject, bnode, {structural: true}), prev: th.quads};
      succs.push(Object.assign({}, th, {
        nfa: sub, stateNo: sub.start,
        subject: bnode, repeats: {},
        callStack: {nfa: th.nfa, outs: st.outs, subject: th.subject, repeats: th.repeats, parent: th.callStack,
                    skippable: st.skippable === true, quadsMark: quads, consumedMark: th.cursor.n},
        quads,
        bnode: th.bnode + 1
      }));
      return;
    }

    failures.push({predicate: tc.predicate, tc,
                   error: "cannot synthesize valueExpr of type "
                   + (valueExpr ? valueExpr.type : "undefined")
                   + " without a Map semAct"});
  }

  /** liveThreads - snapshot of the current worklist for debugger UIs: the
   * inspectable view of every pending thread (exploration order: main stack
   * first, then deferred) with its partial emissions as RdfJs quads.  Empty
   * before run() starts and after it finishes.
   */
  liveThreads () {
    if (!this._live)
      return [];
    const view = (th, isDeferred) => Object.assign(
      threadView(th), {deferred: isDeferred},
      collectQuadsAndProvenance(th.quads),                  // quads + provenance
      {used: Object.keys(th.cursor.used)});                 // "<frame> <var>" marks
    const ret = [];
    for (let i = this._live.stack.length - 1; i >= 0; --i) // top of stack first
      ret.push(view(this._live.stack[i], false));
    for (const th of this._live.deferred) // resumed oldest-first
      ret.push(view(th, true));
    return ret;
  }

  /** an emitted triple, tagged with the provenance editor UIs use to tie it
   * back to the constraint that synthesized it and the binding(s) it read:
   * src is {variables, frame, statics} | {constant} | {structural} */
  _triple (tc, subject, object, src) {
    const q = tc.inverse
      ? {s: object, p: tc.predicate, o: subject}
      : {s: subject, p: tc.predicate, o: object};
    q.tc = tc;
    q.src = src;
    return q;
  }

  _expandPrefix (prefix, local) {
    return prefix in this.prefixes ? this.prefixes[prefix] + local : prefix + ":" + local;
  }

  _resolveShapeExpr (shapeExpr) {
    for (let hops = 0; typeof shapeExpr === "string"; ++hops) {
      if (hops > 100)
        runtimeError("shape reference loop at " + shapeExpr);
      const decl = this.index.shapeExprs[shapeExpr];
      if (!decl)
        runtimeError("shape " + shapeExpr + " not found in schema");
      shapeExpr = "shapeExpr" in decl ? decl.shapeExpr : decl;
    }
    return shapeExpr;
  }

  /** _alwaysSynthesizable - can this TripleConstraint's instance be emitted
   * whatever the cursor position?  True for singleton-value constants without
   * Map semActs and for Map semActs whose variables are all staticVars
   * (always readable, never consumed). */
  _alwaysSynthesizable (tc) {
    const mapExts = (tc.semActs || []).filter(ext => ext.name === MapExt);
    if (mapExts.length > 0)
      return mapExts.every(ext => {
        const m = ext.code.match(variablePattern);
        if (!m)
          return false; // function codes may consume frame bindings
        const varName = m[1] ? m[1] : this._expandPrefix(m[2], m[3]);
        return varName in this.globals;
      });
    const valueExpr = tc.valueExpr === undefined ? undefined : this._resolveShapeExpr(tc.valueExpr);
    return !!(valueExpr && valueExpr.type === "NodeConstraint"
              && valueExpr.values && valueExpr.values.length === 1);
  }

  /** _compileShapeExprNFA - compile any shapeExpr to an NFA (cached per
   * resolved shapeExpr object):
   * - Shape: its tripleExpr's NFA;
   * - ShapeAnd: conjuncts' NFAs concatenated against the same subject
   *   (NodeConstraint conjuncts restrict the focus node, not its arcs, so
   *   they contribute no emissions and are skipped);
   * - ShapeOr: prioritized Split over the disjuncts' NFAs;
   * - NodeConstraint: the empty NFA (nothing to synthesize).
   */
  _compileShapeExprNFA (shapeExpr) {
    const se = this._resolveShapeExpr(shapeExpr);
    if (this._nfaCache.has(se))
      return this._nfaCache.get(se);
    let nfa;
    if (se.type === "Shape") {
      nfa = this._nfaFor(se);
    } else if (se.type === "ShapeAnd" || se.type === "ShapeOr") {
      const parts = se.shapeExprs
            .map(nested => this._resolveShapeExpr(nested))
            .filter(nested => nested.type !== "NodeConstraint")
            .map(nested => this._compileShapeExprNFA(nested));
      nfa = se.type === "ShapeAnd" ? concatNFAs(parts) : splitNFAs(parts);
    } else if (se.type === "NodeConstraint") {
      nfa = {states: [{type: "Match"}], start: 0};
    } else {
      runtimeError(se.type + " synthesis not supported by this prototype");
    }
    this._nfaCache.set(se, nfa);
    return nfa;
  }

  /** _nfaFor - compile a Shape's tripleExpr to an NFA (cached per Shape).
   * States: TC (consume/emit one constraint instance), Split (OneOf),
   * Rept (counted repetition: outs[0]=loop body, outs[1]=exit), Match.
   * The Match state is always state 0.
   */
  _nfaFor (shape) {
    if (this._nfaCache.has(shape))
      return this._nfaCache.get(shape);
    const states = [];
    const mkState = (s) => states.push(s) - 1;
    const patch = (tail, target) => tail.forEach(t => states[t].outs.push(target));

    const walkExpr = (expr) => {
      let pair;
      switch (expr.type) {
      case "TripleConstraint": {
        const s = mkState({type: "TC", tc: expr, outs: []});
        pair = {start: s, tail: [s]};
        break;
      }
      case "OneOf": {
        const starts = [], tails = [];
        expr.expressions.forEach(nested => {
          const p = walkExpr(nested);
          starts.push(p.start);
          tails.push.apply(tails, p.tail);
        });
        pair = {start: mkState({type: "Split", outs: starts}), tail: tails};
        break;
      }
      case "EachOf": {
        let start = null, tail = null;
        expr.expressions.forEach((nested, ord) => {
          const p = walkExpr(nested);
          if (ord === 0)
            start = p.start;
          else
            patch(tail, p.start);
          tail = p.tail;
        });
        pair = {start, tail};
        break;
      }
      default:
        runtimeError("unexpected tripleExpr type " + expr.type);
      }
      const min = "min" in expr ? expr.min : 1;
      const max = "max" in expr ? (expr.max === UNBOUNDED ? Infinity : expr.max) : 1;
      if (min === 0 && max === 1 && expr.type === "TripleConstraint"
          && this._alwaysSynthesizable(expr))
        return pair; // skipping a constant/static gains nothing: emit greedily
                     // and spare the search the 2^optionals variant space
      if (min === 0 && expr.type === "TripleConstraint")
        states[pair.start].skippable = true; // enables the vacuous-descend rule
      if (min === 1 && max === 1)
        return pair;
      const rept = mkState({type: "Rept", min, max, outs: [pair.start]}); // parent patch appends outs[1]=exit
      patch(pair.tail, rept);
      return {start: rept, tail: [rept]};
    };

    const matchState = mkState({type: "Match"});
    let start = matchState;
    if (shape.expression) {
      const pair = walkExpr(shape.expression);
      patch(pair.tail, matchState);
      start = pair.start;
    }
    const nfa = {states, start};
    this._nfaCache.set(shape, nfa);
    return nfa;
  }
}

/** cloneInto - append a copy of an NFA's states (outs re-based) to combined,
 * returning the offset at which they landed.
 */
function cloneInto (combined, nfa) {
  const offset = combined.length;
  nfa.states.forEach(s => combined.push(
    Object.assign({}, s, s.outs ? {outs: s.outs.map(o => o + offset)} : {})));
  return offset;
}

/** concatNFAs - one NFA that runs each part in sequence against the same
 * subject: every part's Match (state 0 by construction) except the last's
 * becomes a Split to the next part's start.
 */
function concatNFAs (parts) {
  if (parts.length === 0)
    return {states: [{type: "Match"}], start: 0};
  const states = [];
  const offsets = parts.map(part => cloneInto(states, part));
  for (let i = 0; i < parts.length - 1; ++i)
    states[offsets[i]] = {type: "Split", outs: [offsets[i + 1] + parts[i + 1].start]};
  return {states, start: offsets[0] + parts[0].start};
}

/** splitNFAs - one NFA that forks over the parts (each keeps its own Match;
 * the stepper treats any Match as end-of-shape).  Part order is priority
 * order.
 */
function splitNFAs (parts) {
  if (parts.length === 0)
    return {states: [{type: "Match"}], start: 0};
  const states = [];
  const outs = parts.map(part => cloneInto(states, part) + part.start);
  const split = states.push({type: "Split", outs}) - 1;
  return {states, start: split};
}

/** threadView - the inspectable snapshot of a thread shipped in debugger
 * step events. */
function threadView (th) {
  let emitted = 0;
  for (let node = th.quads; node !== null; node = node.prev)
    ++emitted;
  return {
    subject: th.subject,
    depth: stackDepth(th.callStack),
    frame: th.cursor.idx,
    consumed: th.cursor.n,
    skipped: th.cursor.sk || 0,
    emitted,
  };
}

/** quadSignature - order-insensitive identity of a thread's emissions, for
 * deduplicating accepting threads that produce the same graph. */
function quadSignature (quadList) {
  const keys = [];
  for (let node = quadList; node !== null; node = node.prev)
    keys.push(node.q.s + " " + node.q.p + " " + node.q.o);
  return keys.sort().join("\n");
}

/** MaterializerDebugger - step-through control over a materialization (see
 * doc/debugger-design.md).  Drives ThreadedMaterializer.run() one event at a
 * time; entirely synchronous, so UIs can wrap it however they like.
 *
 *   const dbg = new MaterializerDebugger(materializer, bindings, "tag:root");
 *   dbg.addBreakpoint({predicate: "http://a.example/p"});
 *   let at = dbg.continue();        // runs to the breakpoint (or completion)
 *   at = dbg.stepInto();            // next event, entering subshape calls
 *   at = dbg.stepOver();            // next event at the same depth or above
 *   at = dbg.stepOut();             // next event above the current depth
 *   ... dbg.done, dbg.quads, dbg.error
 *
 * Breakpoints: {tc} a schema TripleConstraint object (e.g. from
 * locate.exprAt(offset) under an editor gutter click), {predicate} its IRI
 * (survives structured clone), or {subject} the lexical (N3id)
 * representation of a subject node being synthesized.
 */
class MaterializerDebugger {
  constructor (materializer, bindingTree, createRoot, shapeLabel) {
    this.materializer = materializer;
    this.generator = materializer.run(bindingTree, createRoot, shapeLabel);
    this.breakpoints = {tcs: new Set(), predicates: new Set(), subjects: new Set()};
    this.current = null; // last step event
    this.done = false;
    this.quads = null;   // set when done without error
    this.error = null;   // set when materialization failed
  }

  addBreakpoint ({tc, predicate, subject}) {
    if (tc) this.breakpoints.tcs.add(tc);
    if (predicate) this.breakpoints.predicates.add(predicate);
    if (subject) this.breakpoints.subjects.add(subject);
    return this;
  }

  removeBreakpoint ({tc, predicate, subject}) {
    if (tc) this.breakpoints.tcs.delete(tc);
    if (predicate) this.breakpoints.predicates.delete(predicate);
    if (subject) this.breakpoints.subjects.delete(subject);
    return this;
  }

  _hitsBreakpoint (event) {
    if (event.type !== "tripleConstraint")
      return false;
    return this.breakpoints.tcs.has(event.tc) ||
      this.breakpoints.predicates.has(event.tc.predicate) ||
      this.breakpoints.subjects.has(event.thread.subject);
  }

  _advance (stopWhen) {
    if (this.done)
      return this.current;
    while (true) {
      let step;
      try {
        step = this.generator.next();
      } catch (e) {
        this.done = true;
        this.error = e;
        return this.current = {type: "error", error: e};
      }
      if (step.done) {
        this.done = true;
        this.quads = step.value;
        this.accepts = this.materializer.accepts || [];
        return this.current = {type: "done", quads: step.value, accepts: this.accepts};
      }
      if (stopWhen(step.value) || this._hitsBreakpoint(step.value))
        return this.current = step.value;
    }
  }

  /** pause at the very next event (descending into subshape calls) */
  stepInto () { return this._advance(() => true); }

  /** pause at the next event at the current call depth or above (skipping
   * the interior of subshape calls) */
  stepOver () {
    const depth = this.current && this.current.thread ? this.current.thread.depth : 0;
    return this._advance(event => event.thread && event.thread.depth <= depth);
  }

  /** pause when the current subshape call completes (or anything shallower,
   * e.g. backtracking into a sibling branch) */
  stepOut () {
    const depth = this.current && this.current.thread ? this.current.thread.depth : 0;
    return this._advance(event => event.thread && event.thread.depth < depth);
  }

  /** run to the next breakpoint, or to completion */
  continue () { return this._advance(() => false); }

  /** snapshot of the pending threads (exploration order), each with its
   * partial emissions as quads; accepted threads live in this.accepts */
  threads () { return this.materializer.liveThreads(); }
}

function collectQuads (quadList) {
  return collectQuadsAndProvenance(quadList).quads;
}

/** collectQuadsAndProvenance - a thread's emissions as RdfJs quads, with a
 * parallel provenance array: for each quad, the TripleConstraint that
 * synthesized it and where its object came from (see _triple).  Editor UIs
 * use it to tie a materialized triple back to the output schema and the
 * bindings that fed it. */
function collectQuadsAndProvenance (quadList) {
  const triples = [];
  for (let node = quadList; node !== null; node = node.prev)
    triples.unshift(node.q);
  const seen = {};
  const kept = triples.filter(t => {
    const key = t.s + " " + t.p + " " + t.o;
    return key in seen ? false : (seen[key] = true);
  });
  return {
    quads: kept.map(t => n3idQuad2RdfJs(t.s, t.p, t.o)),
    provenance: kept.map(t => ({tc: t.tc, predicate: t.p, src: t.src})),
  };
}

function stackDepth (callStack) {
  let depth = 0;
  for (let frame = callStack; frame !== null; frame = frame.parent)
    ++depth;
  return depth;
}

function n3ify (ldterm) { // ShExJson term -> N3id string (c.f. shex-extension-map.js)
  if (typeof ldterm !== "object")
    return ldterm;
  const ret = "\"" + ldterm.value + "\"";
  if ("language" in ldterm)
    return ret + "@" + ldterm.language;
  if ("type" in ldterm)
    return ret + "^^" + ldterm.type;
  return ret;
}

function runtimeError () {
  throw new MaterializationError(Array.prototype.join.call(arguments, ""));
}

/** tripleConstraints - every TripleConstraint of a schema in a deterministic
 * order: shapes as declared, each expression tree depth-first, descending
 * into a constraint's inline valueExpr but never following a reference (the
 * referent is reached through its own declaration).
 *
 * Structured clone breaks object identity, so a materialization running in a
 * worker cannot ship its provenance's TripleConstraints.  Both sides hold
 * copies of the same schema, though, so an index into this ordering names
 * the same constraint on either side.
 */
function tripleConstraints (schema) {
  const found = [];
  const seen = new Set();
  const shapeExpr = (expr) => {
    if (!expr || typeof expr !== "object" || seen.has(expr))
      return; // a string is a reference: reached through its declaration
    seen.add(expr);
    switch (expr.type) {
    case "ShapeDecl": return shapeExpr(expr.shapeExpr);
    case "ShapeAnd": case "ShapeOr": return (expr.shapeExprs || []).forEach(shapeExpr);
    case "ShapeNot": return shapeExpr(expr.shapeExpr);
    case "Shape": return tripleExpr(expr.expression);
    }
  };
  const tripleExpr = (expr) => {
    if (!expr || typeof expr !== "object" || seen.has(expr))
      return; // a string is an Inclusion
    seen.add(expr);
    switch (expr.type) {
    case "EachOf": case "OneOf": return (expr.expressions || []).forEach(tripleExpr);
    case "TripleConstraint":
      found.push(expr);
      return shapeExpr(expr.valueExpr);
    }
  };
  (schema.shapes || []).forEach(shapeExpr);
  return found;
}

module.exports = {ThreadedMaterializer, MaterializerDebugger, normalizeBindingTree,
                  MaterializationError, tripleConstraints};


/***/ },

/***/ 443
(module, __unused_webpack_exports, __webpack_require__) {

const {rdfJsTerm2Ld} = __webpack_require__(811);

const NFAXVal1ErrMaterializer = (function () {

  const ShExTerm = __webpack_require__(811);

  const Split = "<span class='keyword' title='Split'>|</span>";
  const Rept  = "<span class='keyword' title='Repeat'>×</span>";
  const Match = "<span class='keyword' title='Match'>␃</span>";
const UNBOUNDED = -1;
  /* compileNFA - compile regular expression and index triple constraints
   */
function compileNFA (schema, shape) {
    const expression = shape.expression;
    return NFA();

    function NFA () {
      // wrapper for states, startNo and matchstate
      const states = [];
      const matchstate = State_make(Match, []);
      let startNo = matchstate;
      const stack = [];
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
      }
      // matchstate = states = startNo = null;
      return ret;

      function walkExpr (expr, stack) {
        let s, starts;
        let lastTail;
        function maybeAddRept (start, tail) {
          if ((expr.min == undefined || expr.min === 1) &&
              (expr.max == undefined || expr.max === 1))
            return {start: start, tail: tail}
          s = State_make(Rept, [start]);
          states[s].expr = expr;
          // cache min/max in normalized form for simplicity of comparison.
          states[s].min = "min" in expr ? expr.min : 1;
          states[s].max = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
          patch(tail, s);
          return {start: s, tail: [s]}
        }

        if (expr.type === "TripleConstraint") {
          s = State_make(expr, []);
          states[s].stack = stack;
          return {start: s, tail: [s]};
          // maybeAddRept(s, [s]);
        }

        else if (expr.type === "OneOf") {
          lastTail = [];
          starts = [];
          expr.expressions.forEach(function (nested, ord) {
            pair = walkExpr(nested, stack.concat({c:expr, e:ord}));
            starts.push(pair.start);
            lastTail = lastTail.concat(pair.tail);
          });
          s = State_make(Split, starts);
          states[s].expr = expr;
          return maybeAddRept(s, lastTail);
        }

        else if (expr.type === "EachOf") {
          expr.expressions.forEach(function (nested, ord) {
            pair = walkExpr(nested, stack.concat({c:expr, e:ord}));
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

        runtimeError("unexpected expr type: " + expr.type);
      }// removed by dead control flow


      function State_make (c, outs, negated) {
        const ret = states.length;
        states.push({c:c, outs:outs});
        if (negated)
          states[ret].negated = true; // only include if true for brevity
        return ret;
      }

      function patch (l, target) {
        l.forEach(elt => {
          states[elt].outs.push(target);
        });
      }
    }


    function nfaToString () {
      const known = {OneOf: [], EachOf: []};
      function dumpTripleConstraint (tc) {
        return "<" + tc.predicate + ">";
      }
      function card (obj) {
        let x = "";
        if ("min" in obj) x += obj.min;
        if ("max" in obj) x += "," + obj.max;
        return x ? "{" + x + "}" : "";
      }
      function junct (j) {
        let id = known[j.type].indexOf(j);
        if (id === -1)
          id = known[j.type].push(j)-1;
        return j.type + id; // + card(j);
      }
      function dumpStackElt (elt) {
        return junct(elt.c) + "." + elt.e + ("i" in elt ? "[" + elt.i + "]" : "");
      }
      function dumpStack (stack) {
        return stack.map(elt => { return dumpStackElt(elt); }).join("/");
      }
      function dumpNFA (states, startNo) {
        return states.map((s, i) => {
          return (i === startNo ? s.c === Match ? "." : "S" : s.c === Match ? "E" : " ") + i + " " + (
            s.c === Split ? ("Split-" + junct(s.expr)) :
              s.c === Rept ? ("Rept-" + junct(s.expr)) :
              s.c === Match ? "Match" :
              dumpTripleConstraint(s.c)
          ) + card(s) + "→" + s.outs.join(" | ") + ("stack" in s ? dumpStack(s.stack) : "");
        }).join("\n");
      }
      function dumpMatched (matched) {
        return matched.map(m => {
          return dumpTripleConstraint(m.c) + "[" + m.triples.join(",") + "]" + dumpStack(m.stack);
        }).join(",");
      }
      function dumpThread (thread) {
        return "S" + thread.state + ":" + Object.keys(thread.repeats).map(k => {
          return k + "×" + thread.repeats[k];
        }).join(",") + " " + dumpMatched(thread.matched);
      }
      function dumpThreadList (list) {
        return "[[" + list.map(thread => { return dumpThread(thread); }).join("\n  ") + "]]";
      }
      return {
        nfa: dumpNFA,
        stack: dumpStack,
        stackElt: dumpStackElt,
        thread: dumpThread,
        threadList: dumpThreadList
      };
    }

  function rbenx_match (graph, node, constraintList, synthesize, /* constraintToTripleMapping, tripleToConstraintMapping, */ neighborhood, recurse, direct, semActHandler, checkValueExpr, trace) {
      const rbenx = this;
      let clist = [], nlist = []; // list of {state:state number, repeats:stateNo->repetitionCount}

      function resetRepeat (thread, repeatedState) {
        const trimmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
          if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
            r[k] = thread.repeats[k];
          return r;
        }, {});
        return {state:thread.state/*???*/, repeats:trimmedRepeats, matched:thread.matched, avail:thread.avail.slice(), stack:thread.stack};
      }
      function incrmRepeat (thread, repeatedState) {
        const incrmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
          r[k] = parseInt(k) == repeatedState ? thread.repeats[k] + 1 : thread.repeats[k];
          return r;
        }, {});
        return {state:thread.state/*???*/, repeats:incrmedRepeats, matched:thread.matched, avail:thread.avail.slice(), stack:thread.stack};
      }
      function stateString (state, repeats) {
        const rs = Object.keys(repeats).map(rpt => {
          return rpt+":"+repeats[rpt];
        }).join(",");
        return rs.length ? state + "-" + rs : ""+state;
      }

      function addstate (list, stateNo, thread, seen) {
        seen = seen || [];
        const seenkey = stateString(stateNo, thread.repeats);
        if (seen.indexOf(seenkey) !== -1)
          return;
        seen.push(seenkey);

        const s = rbenx.states[stateNo];
        if (s.c === Split) {
          return s.outs.reduce((ret, o, idx) => {
            return ret.concat(addstate(list, o, thread, seen));
          }, []);
        // } else if (s.c.type === "OneOf" || s.c.type === "EachOf") { // don't need Rept
        } else if (s.c === Rept) {
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
        } else {
          // if (stateNo !== rbenx.end || !thread.avail.reduce((r2, avail) => { faster if we trim early??
          //   return r2 || avail.length > 0;
          // }, false))
          return [list.push({ // return [new list element index]
            state:stateNo,
            repeats:thread.repeats,
            avail:thread.avail.map(a => { // copy parent thread's avail vector
              return a.slice();
            }),
            stack:thread.stack,
            matched:thread.matched,
            errors: thread.errors
          }) - 1];
        }
      }

      function localExpect999 (list) {
        return list.map(st => {
          const s = rbenx.states[st.state]; // simpler threads are a list of states.
          return renderAtom(s.c, s.negated);
        });
      }

      if (rbenx.states.length === 1)
        return matchedToResult([], constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr);

      let chosen = null;
      // const dump = nfaToString();
      // console.log(dump.nfa(this.states, this.start));
      addstate(clist, this.start, {repeats:{}, avail:[], matched:[], stack:[], errors:[]});
      while (clist.length) {
        nlist.length = 0;
        if (trace)
          trace.push({threads:[]});
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
              const exprs = rbenx.states.map(x => { return x.c === Rept ? x.expr : null; });
              const newStack = state.stack.map(e => {
                let i = thread.repeats[exprs.indexOf(e.c)];
                if (i === undefined)
                  i = 0; // expr has no repeats
                else
                  i = i-1;
                return { c:e.c, e:e.e, i:i };
              });
              const withIndexes = {
                c: state.c,
                triples: taken,
                stack: newStack
              };
              thread.matched = thread.matched.concat(withIndexes);
              state.outs.forEach(o => { // single out if NFA includes epsilons
                addstate(nlist, o, thread);
              });
            } while ((function () {
              if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                taken.push(thread.avail[constraintNo].shift());
                return true; // stay in look to take more.
              } else {
                return false; // no more to take or we're already at max
              }
            })());
          }
          if (trace)
            trace[trace.length-1].threads.push({
              state: clist[threadno].state,
              to:nlist.slice(nlistlen).map(x => {
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
        }, null)
        if (longerChosen)
          chosen = longerChosen;
        // if (longerChosen !== null)
        //   console.log(JSON.stringify(matchedToResult(longerChosen.matched)));
      }
      if (chosen === null)
        return reportError(localExpect(clist, rbenx.states));
      function reportError (errors) { return {
        type: "Failure",
        node: node,
        errors: errors
      } }
      function localExpect (clist, states) {
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

    function matchedToResult (matched, constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr) {
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
          } else {
            ptr = ptr.solutions;
          }
          if (m.stack[mis].i !== last[mis].i) {
            t = [];
            ptr[m.stack[mis].i] = {
              type:m.stack[mis].c.type === "EachOf" ? "EachOfSolution" : "OneOfSolution",
              expressions: t};
            ptr = t;
            last[mis].e = null;
          } else {
            ptr = ptr[last[mis].i].expressions;
          }
          if (m.stack[mis].e !== last[mis].e) {
            t = {};
            ptr[m.stack[mis].e] = t;
            if (m.stack[mis].e > 0 && ptr[m.stack[mis].e-1] === undefined && skips.indexOf(ptr) === -1)
              skips.push(ptr);
            ptr = t;
            last.length = mis + 1; // chop off last so we create everything underneath
          } else {
            throw "how'd we get here?"
            // removed by dead control flow

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
        ptr.solutions = m.triples.map(tno => {
          const triple = neighborhood[tno];
          const ret = {
            type: "TestedTriple",
            subject: rdfJsTerm2Ld(triple.subject),
            predicate: rdfJsTerm2Ld(triple.predicate),
            object: rdfJsTerm2Ld(triple.object)
          };

          function diver (focus, shape, dive) {
            const sub = dive(focus, shape);
            if ("errors" in sub) {
              // console.dir(sub);
              const err = {
                type: "ReferenceError", focus: focus,
                shape: shape, errors: sub
              };
              if (shapeLabel.termType === "BlankNode")
                err.referencedShape = shape;
              return [err];
            }
            if ("solution" in sub && Object.keys(sub.solution).length !== 0 ||
                sub.type === "Recursion")
              ret.referenced = sub; // !!! needs to aggregate errors and solutions
            return [];
          }
          function diveRecurse (focus, shapeLabel) {
            return diver(focus, shapeLabel, recurse);
          }
          function diveDirect (focus, shapeLabel) {
            return diver(focus, shapeLabel, direct);
          }
          if ("valueExpr" in ptr) {
            const sub = checkValueExpr(ptr.inverse ? triple.subject : triple.object, ptr.valueExpr, diveRecurse, diveDirect);
            if ("errors" in sub)
              [].push.apply(errors, sub.errors);
          }

          if (errors.length === 0 && "semActs" in m.c &&
              !semActHandler.dispatchAll(m.c.semActs, triple, ret))
            errors.push({ type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] }) // some semAct aborted
          return ret;
        })
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

function extend(base) {
  if (!base) base = {};
  for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (let name in arg)
      base[name] = arg[name];
  return base;
}

return {
  name: "eval-simple-1err",
  description: "simple regular expression engine with n out states",
  compile: compileNFA
};
})();
// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = NFAXVal1ErrMaterializer;


/***/ },

/***/ 320
(module) {

/**
 * A file with common utility functions used by the extensions.
 */

const ExtensionUtils = (function () {

return {
    // Collapse multiple spaces into one
    collapseSpaces:  function(string) { 
        return string.replace(/  +/g, ' '); 
    },

    // Remove starting and trailing quotes - does not affect center quotes
    trimQuotes999: function(string) { return string.value;

        // empty string or 1 char string cannot have matching quotes
        // removed by dead control flow


        // Starting with single or double quote?
        // removed by dead control flow

       
        // removed by dead control flow

    },

    // Unescape the backslash characters in a string (e.g., in a URL)
    unescapeMetaChars: function(string) { 
        return string.replace(/\\([\/^$])/g, "$1"); 
    }
}
})();

if (true)
  module.exports = ExtensionUtils;


/***/ },

/***/ 787
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * This file is the main entry point into calling an extension. 
 * It determines which extension is requested, and then, assuming
 * the extension is valid, it forwards the request on
 */
const Extensions = (function () {

// Known extensions
const hashmap_extension = __webpack_require__(201);
const regex_extension = __webpack_require__(696);

const utils = __webpack_require__(320);

/**
 * Given a map directive that contains an extension of format 
 *          extensionName(args) 
 * split it up for easy access to extenion name and arguments separately 
 * 
 * @param a map directive with an extension call embedded
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
    if (startArgs < 2 || endArgs < 4 || endArgs <= startArgs+1 || endArgs != mapDirective.length-1) 
        throw Error("Invalid extension function: " + mapDirective + "!");

    return { name:  mapDirective.substring(0, startArgs),
             args:  mapDirective.substring(startArgs+1, endArgs) }; 
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

        default: 
          throw Error('Unknown extension: '+ mapDirective+'!');
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
      
        default: 
          throw Error('Unknown extension: ' + mapDirective+'!');
    }
}

return {
    lift: lift,
    lower: lower,
};
})();

if (true)
  module.exports = Extensions;


/***/ },

/***/ 201
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * The hashmap extension expects a hash map directive in JSON format like: 
 *    hashmap(variable, {"D": "Divorced", "M": "Married", "S": "Single", "W": "Widowed"}) 
 * And returns the appropriate map value based on the input.
 */
const HashmapExtension = (function () {

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
    if (args === undefined || args.length === 0) throw Error("Hashmap extension requires a variable name and map as arguments, but found none!");

    // get the variable name and hashmap
    const matches = /^[ ]*([\w:<>]+)[ ]*,[ ]*({.*)$/s.exec(args);
    if (matches === null || matches.length < 3) throw Error("Hashmap extension requires a variable name and map as arguments, but found: " + mapDirective + "!");

    const varName = matches[1]; 
    const hashString = matches[2];

    let map;
    try { 
        map = JSON.parse(hashString);
        if (Object.keys(map).length === 0) throw Error("Empty hashmap!");
    } catch(e) { 
        throw Error("Hashmap extension unable to parse map in " + mapDirective+"!" + e.message);
    } 

    // Verify that the hash key/value pairs are unique
    const values = Object.values(map);
  if (values.length != [...new Set(values)].length) throw Error('Hashmap extension requires unique key/value pairs!');

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

    if (varComponents !== null && varComponents.length == 3) {
        const prefix = varComponents[1];
        const name = varComponents[2];

        // Verify we've got a good const name, prefix, and prefix value
        if (prefix.length === 0 || name.length === 0) throw Error("Hashmap extension given invalid target variable name " + varName);
        if (!(prefix in prefixes)) throw Error("Hashmap extension given undefined variable prefix " + prefix);

        expandedName = prefixes[prefix] + name; 
    } else {
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

   const key = Object.keys(hash).find(key => value === hash[key])

   if (!key)
       throw Error("Hashmap extension was unable to invert the value " 
                   + value + " with map " + JSON.stringify(hash, {depth: null}) +"!");
   return key;
}
 
function lift(mapDirective, input, prefixes, args) {

    // Parse to get the target const name and the hash map
    const mapArgs = parseArgs(mapDirective, args);
    
    // Get the expanded const name if it was prefixed
    const expandedName = expandedVarName(mapArgs.varName, prefixes);

    const key = input.value || input;
    if (key.length === 0) throw Error('Hashmap extension has no input');
    
    const mappedValue = mapArgs.hash[key];
    return { [expandedName]: mappedValue };
}

function lower(mapDirective, bindings, prefixes, args) {
    const mapArgs = parseArgs(mapDirective, args);

    // Get the expanded const name if it was prefixed
    const expandedName = expandedVarName(mapArgs.varName, prefixes);

    const mappedValueTerm = bindings.get(expandedName);
  const mappedValue = mappedValueTerm.value || mappedValueTerm;
    if (mappedValue === undefined) throw Error('Unable to find mapped value for ' + mapArgs.varName);

    // Now use the mapped Value to find the original value and clean it up if we get something
    const inverseValue = invert(mapArgs.hash, mappedValue);
    if (inverseValue.length !== 0) {
        return '"' + extUtils.unescapeMetaChars( extUtils.collapseSpaces(inverseValue) ) + '"';
    }

    return inverseValue; 
}

return {
  lift: lift,
  lower: lower
};
})();

if (true)
  module.exports = HashmapExtension;


/***/ },

/***/ 696
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * The regex extension expects a map directive like: 
 *    regex(/<regex>/) 
 * where the regex should specify one or more target variables, e.g.,
 *    regex(/"(?<dem:family>[a-zA-Z'\\-]+),\\s*(?<dem:given>[a-zA-Z'\\-\\s]+)"/)
 * The expression will be applied and the results returned as a hash.
 */

const RegexExtension = (function () {
const extUtils = __webpack_require__(320);

const captureGroupName = "(\\?<(?:[a-zA-Z:]+|<[^>]+>)>)";

/**
 * Given a variable name, looks up its prefix, and  replacing the shorthand
 * prefix name in the variable with l name.
 *
 * @param shortPrefixedVar a short prefixed variable name to expand e.g., dem:id
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

  } else if (matches[2] in prefixes) {
    // prefixed const e.g., dem:id
    expandedVarName = prefixes[matches[2]] + matches[3];

  } else
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
    const v = extUtils.unescapeMetaChars( shortPrefixedVar.substr(2, shortPrefixedVar.length - 3) );
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
function trimPattern(args) { 
    if (/^\s*\/.*\/\s*$/.test(args)) {   
        args = /^\s*\/(.*)\/\s*$/.exec(args)[1];
        if (args.length < 1) throw Error(mapDirective + ' is missing the required regex pattern');
    }

    return args;
}

function lift(mapDirective, input, prefixes, args) {
    args = trimPattern(args);

    const expandedVars = [];
    const pattern = args.replace(RegExp(captureGroupName, "g"), 
        function (m, varName, offset, regexStr) {
            buildExpandedVars(varName, expandedVars, prefixes);
            return "";
    });

    if (expandedVars.length === 0) {
        throw Error('Found no capture variable in ' + mapDirective + '!');
    }
    
    let matches;
    try {
        matches = input.match(RegExp(pattern));
    } catch (e) {
        throw Error('Error pattern matching '+mapDirective + " with " + input + ": " + e.message);
    }

    if (!matches) throw Error(mapDirective + ' found no match for input "' + input + '"!');

    // Build a hash of the regex variable name/value pairs
    const result = {};
    for (let i = 1; i < matches.length; ++i) {
      result[expandedVars[i-1]] = matches[i];
    }
  
    return result;
}

function lower(mapDirective, bindings, prefixes, args) {
    args = trimPattern(args);

    // Replace mapDirective named capture groups into bindings for those names.
    const expandedVars = [];
    let matched = false;
    let string = args.replace(RegExp("\\("+captureGroupName+"[^)]+\\)", "g"),
        function (m, varName, offset, str) {
            matched = true;
            const expVarName = buildExpandedVars(varName, expandedVars, prefixes);
            const val = bindings.get(expVarName);
            if (val === undefined) {
                throw Error("Unable to process " + mapDirective + 
                            " because variable \"" + expVarName + "\" was not found!");
      
            } else {
                return val.value || val;
            }
    });

    if (!matched) {
        throw Error('Found no capture variable in ' + mapDirective + '!');
    }

    string = extUtils.collapseSpaces(string); // replaces white space with a single space 
    return '"' + extUtils.unescapeMetaChars(string) + '"';
}

return {
  lift: lift,
  lower: lower
};
})();

if (true)
  module.exports = RegexExtension;


/***/ },

/***/ 638
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

/**
 * N3id - webapps and scripts that rely specifically on N3.js leverage the fact
 * that term.id is N-Triples for all terms except typed literals, which lack
 * <>s around data types. This is handy for testing.
 *   NamedNode: bare word, e.g. http://a.example/
 *   BlankNode: "_:" + label, e.g. _:b1
 *   Literal: quoted value plus ntriples lang or datatype, e.g:
 *     "I said \"Hello World\"."
 *     "I said \"Hello World\"."@en
 *     "1.1"^^http://www.w3.org/2001/XMLSchema#float
 */

const {DataFactory} = __webpack_require__(50);
const RdfJsFactory = new DataFactory();

/**
 * Map an N3id quad to an RdfJs quad
 * @param {*} s subject
 * @param {*} p predicate
 * @param {*} o object
 * @param {*} g graph
 * @returns RdfJs quad
 */
function n3idQuad2RdfJs (s/*: string*/, p/*: string*/, o/*: string*/, g/*: string*/)/*: Quad*/ {
  const graph = g ? n3idTerm2RdfJs(g) : RdfJsFactory.defaultGraph();
  return RdfJsFactory.quad(
      // there probably some elegant way to do this without lots of casting
    n3idTerm2RdfJs(s)/* as NamedNode | BlankNode*/,
    n3idTerm2RdfJs(p)/* as NamedNode*/,
    n3idTerm2RdfJs(o)/* as NamedNode | BlankNode | Literal*/,
    graph/* as NamedNode | BlankNode*/,
  );
}

/**
 * Map an N3id term to an RdfJs Term.
 * @param {*} term N3Id term
 * @returns RdfJs Term
 */
function n3idTerm2RdfJs (term/*: string*/)/*: RdfJsTerm*/ {
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
      : parseDt(closeQuote + 1)
    return RdfJsFactory.literal(value, langOrDt);
  }

  return RdfJsFactory.namedNode(term);

  function parseDt (from/*: number*/)/*: NamedNode*/ {
    if (term[from] !== "^" || term[from + 1] !== "^")
      throw new Error(`garbage after closing \": ${term}`);
    return RdfJsFactory.namedNode(term.substr(from + 2));
  }
}

module.exports = {
  n3idQuad2RdfJs,
  n3idTerm2RdfJs,
}


/***/ },

/***/ 612
(module, __unused_webpack_exports, __webpack_require__) {

/*
 * TODO
 *   templates: @<foo> %map:{ my:specimen.container.code=.1.code, my:specimen.container.disp=.1.display %}
 *   node identifiers: @foo> %map:{ foo.id=substr(20) %}
 *   multiplicity: ...
 */

const {rdfJsTerm2Ld} = __webpack_require__(811);

const ShExMapCjsModule = function (config) {

const ShExTerm = __webpack_require__(811);
const extensions = __webpack_require__(787);
const {ShExVisitor, ShExIndexVisitor} = __webpack_require__(747);
const ShExUtil = __webpack_require__(837);
const N3Util = __webpack_require__(818);
const N3DataFactory = (__webpack_require__(998)["default"]);
const materializer = __webpack_require__(554)(config);
const StringToRdfJs = __webpack_require__(638);

const MapExt = "http://shex.io/extensions/Map/#";
const pattern = /^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/;

const UNBOUNDED = -1;
const MAX_MAX_CARD = 50; // @@ don't repeat forever during dev experiments.

function register (validator, api) {
  if (api === undefined || !('ShExTerm' in api))
    throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

  class MaterializerVisitor extends ShExVisitor {
    constructor (tc, index, curSubjectx) {
      super();
      this.tc = tc;
      this.index = index;
      this.curSubjectx = curSubjectx;
    }

    visitShapeRef (shapeRef, ...args) {
      this.visitShapeDecl(this.index.shapeExprs[shapeRef], ...args);
      return super.visitShapeRef(shapeRef, ...args);
    };

    visitValueRef (r, ...args) {
      this.visitTripleExpr(schema.shapes[r], r, ...args);
      return this._visitValue(r, ...args);
    };

    visitTripleConstraint (expr, curSubjectx, nextBNode, target, materializer, schema, bindings) {
      this.tc(expr, curSubjectx, nextBNode, target, materializer, schema, bindings);
    };
  }

  const prefixes = "_prefixes" in validator.schema ?
      validator.schema._prefixes :
      {};

  validator.semActHandler.results[MapExt] = {};
  validator.semActHandler.register(
    MapExt,
    {
      /**
       * Callback for extension invocation.
       *
       * @param {string} code - text of the semantic action.
       * @param {object} ctx - matched triple or results subset.
       * @param {object} extensionStorage - place where the extension writes into the result structure.
       * @return {bool} false if the extension failed or did not accept the ctx object.
       */
      dispatch: function (code, ctx, extensionStorage) {
        function fail (msg) { const e = Error(msg); Error.captureStackTrace(e, fail); throw e; }
        function getPrefixedName(bindingName) {
           // already have the fully prefixed binding name ready to go
           if (typeof bindingName === "string") return bindingName;

           // bindingName is from a pattern match - need to get & expand it with prefix
            const prefixedName = bindingName[1] ? bindingName[1] :
                bindingName[2] in prefixes ? (prefixes[bindingName[2]] + bindingName[3]) :
                fail("unknown prefix " + bindingName[2] + " in \"" + code + "\".");
            return prefixedName;
        }

        const update = function(bindingName, value) {

            if (!bindingName) {
               throw Error("Invocation error: " + MapExt + " code \"" + code + "\" didn't match " + pattern);
            }

            const prefixedName = getPrefixedName(bindingName);
            const quotedValue = rdfJsTerm2Ld(value);

            validator.semActHandler.results[MapExt][prefixedName] = quotedValue;
            extensionStorage[prefixedName] = quotedValue;
        };

        // Do we have a map extension function?
        const funcArg = code.match(/^\s*[a-zA-Z0-9]+\((.*)\)\s*$/)
        if (funcArg) {
          const results = extensions.lift(code, ctx.triples[0].object.value, prefixes);
          for (key in results)
            update(key, N3DataFactory.literal(results[key]));
        } else {
          const bindingName = code.match(pattern);
          if (ctx.node) {
            update(bindingName, ctx.node);
          } else {
            const inverse = ctx.tripleExpr.type === 'TripleConstraint' && ctx.tripleExpr.inverse;
            update(bindingName, inverse ? ctx.triples[0].subject : ctx.triples[0].object);
          }
        }

        return []; // There are no evaluation failures. Any parsing problem throws.
      }
    }
  );
  return {
    results: validator.semActHandler.results[MapExt],
    binder,
    trivialMaterializer,
    visitTripleConstraint
  }

function visitTripleConstraint (expr, curSubjectx, nextBNode, target, visitor, schema, bindings, recurse, direct, checkValueExpr) {
      // utility functions for e.g. s = add(B(), P(":value"), L("70", P("xsd:float")))
      function P (pname) { return expandPrefixedName(pname, schema._prefixes); }
      function L (value, modifier) { return N3Util.createLiteral(value, modifier); }
      function B () { return nextBNode(); }
      function add (s, p, o) {
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
              const funcArg = code.match(/^\s*[a-zA-Z0-9]+\((.*)\)\s*$/)
              if (funcArg)
                tripleObject = extensions.lower(code, bindings, schema._prefixes, funcArg[1]);
            }

            if (tripleObject === undefined)
              ; // console.warn('Not in bindings: ',code);
            else if (expr.inverse)
              add(tripleObject, expr.predicate, curSubjectx.cs);
            else
              add(curSubjectx.cs, expr.predicate, tripleObject);
          });

        } else if (typeof expr.valueExpr !== "string" && "values" in expr.valueExpr && expr.valueExpr.values.length === 1) {
          if (expr.inverse)
            add(expr.valueExpr.values[0], expr.predicate, curSubjectx.cs);
          else
            add(curSubjectx.cs, expr.predicate, n3ify(expr.valueExpr.values[0]));

        } else {
          const oldSubject = curSubjectx.cs;
          let maxAdd = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;
          if (maxAdd > MAX_MAX_CARD)
            maxAdd = MAX_MAX_CARD;
          if (!recurse)
            maxAdd = 1; // no grounds to know how much to repeat.
          for (let repetition = 0; repetition < maxAdd; ++repetition) {
            curSubjectx.cs = B();
            if (recurse) {
              const res = checkValueExpr(StringToRdfJs.n3idTerm2RdfJs(curSubjectx.cs), expr.valueExpr, recurse, direct)
              if ("errors" in res)
                break;
            }
            if (expr.inverse)
              add(curSubjectx.cs, expr.predicate, oldSubject);
            else
              add(oldSubject, expr.predicate, curSubjectx.cs);
          }
          visitor._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
                         ["inverse", "negated", "predicate", "valueExpr",
                          "min", "max", "annotations", "semActs"], null, curSubjectx, nextBNode, target, visitor, schema, bindings)
          curSubjectx.cs = oldSubject;
        }
      }

function trivialMaterializer (schema, nextBNode) {
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
      function P (pname) { return expandPrefixedName(pname, schema.prefixes); }
      function L (value, modifier) { return N3Util.createLiteral(value, modifier); }
      function B () { return nextBNode(); }
      function add (s, p, o) { target.addTriple({ subject: s, predicate: p, object: n3ify(o) }); return s; }

      const curSubject = createRoot || B();
      const curSubjectx = {cs: curSubject};

      const v = new MaterializerVisitor(visitTripleConstraint, index);
      v.visitShapeExpr(shape, curSubjectx, nextBNode, target, v, schema, bindings);// , curSubjectx, nextBNode, target, materializer
      return target;
    }
  };
}

function binder (tree) {
  let stack = []; // e.g. [2, 1] for v="http://shex.io/extensions/Map/#BPDAM-XXX"
  const globals = {}; // !! delme
  //

  /**
   * returns: { const->count }
   */
  function _mults (obj) {
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
      } else {
        // variable name.
        toAdd = _make(k, 1);
      }
      return _add(r, toAdd);
    }, {});
    if (rays.length > 0) {
      objs.forEach(i => {
        const novel = Object.keys(obj[i]).filter(k => {
          return counts[k] === 1;
        });
        if (novel.length) {
          const n2 = novel.reduce((r, k) => {
            r[k] = obj[i][k];
            return r;
          }, {});
          rays.forEach(l => {
            _cross(obj[l], n2);
          });
        }
      });
      objs.reverse();
      objs.forEach(i => {
        obj.splice(i, 1); // remove object from tree
      });
    }
    return counts;
  }
  function _add (l, r) {
    const ret = Object.assign({}, l);
    return Object.keys(r).reduce((ret, k) => {
      const add = k in r ? r[k] : 1;
      ret[k] = k in ret ? ret[k] + add : add;
      return ret;
    }, ret);
  }
  function _make (k, v) {
    const ret = {};
    ret[k] = v;
    return ret;
  }
  function _cross (list, map) {
    for (let listIndex in list) {
      if (Array.isArray(list[listIndex])) {
        _cross(list[listIndex], map);
      } else {
        Object.keys(map).forEach(mapKey => {
          if (mapKey in list[listIndex])
            throw Error("unexpected duplicate key: " + mapKey + " in " + JSON.stringify(list[listIndex]));
          list[listIndex][mapKey] = map[mapKey];
        });
      }
    };
  }
  _mults(tree);
  function _simplify (list) {
    const ret = list.reduce((r, elt) => {
      return r.concat(
        Array.isArray(elt) ?
          _simplify(elt) :
          elt
      );
    }, []);
    return ret.length === 1 ? ret[0] : ret;
  }
  tree = Array.isArray(tree) ? _simplify(tree) : [tree]; // expects an array

  // const globals = tree.reduce((r, e, idx) => {
  //   if (!Array.isArray(e)) {
  //     Object.keys(e).forEach(k => {
  //       r[k] = e[k];
  //     });
  //     removables.unshift(idx); // higher indexes at the left
  //   }
  //   return r;
  // }, {});

  function getter (v) {
    // work with copy of stack while trying to grok this problem...
    if (stack === null)
      return undefined;
    if (v in globals)
      return globals[v];
    const nextStack = stack.slice();
    let next = diveIntoObj(nextStack); // no effect if in obj
    while (!(v in next)) {
      let last;
      while(!Array.isArray(next)) {
        last = nextStack.pop();
        next = getObj(nextStack);
      }
      if (next.length === last+1) {
        stack = null;
        return undefined;
      }
      nextStack.push(last+1);
      next = diveIntoObj(nextStack);
      // console.log("advanced to " + nextStack);
      // throw Error ("can't advance to find " + v + " in " + JSON.stringify(next));
    }
    stack = nextStack.slice();
    const ret = next[v];
    delete next[v];
    return ret;

    function getObj (s) {
      return s.reduce(function (res, elt) {
        return res[elt];
      }, tree);
    }

    function diveIntoObj (s) {
      while (Array.isArray(getObj(s)))
        s.push(0);
      return getObj(s);
    }
  };
  return {get: getter};
}

}

function done (validator) {
  if (Object.keys(validator.semActHandler.results[MapExt]).length === 0)
    delete validator.semActHandler.results[MapExt];
}

function n3ify (ldterm) {
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
  function expandPrefixedName (prefixedName, prefixes) {
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

function extractBindingsDelMe (soln, min, max, depth) {
  if ("min" in soln && soln.min < min)
    min = soln.min
  const myMax = "max" in soln ?
      (soln.max === UNBOUNDED ?
       Infinity :
       soln.max) :
      1;
  if (myMax > max)
    max = myMax

  function walkExpressions (s) {
    return s.expressions.reduce((inner, e) => {
      return inner.concat(extractBindingsDelMe(e, min, max, depth+1));
    }, []);
  }

  function walkTriple (s) {
    const fromTriple = "extensions" in s && MapExt in s.extensions ?
        [{ depth: depth, min: min, max: max, obj: s.extensions[MapExt] }] :
        [];
    return "referenced" in s ?
      fromTriple.concat(extractBindingsDelMe(s.referenced.solution, min, max, depth+1)) :
      fromTriple;
  }

  function structuralError (msg) { throw Error(msg); }

  const walk = // function to explore each solution
      soln.type === "someOfSolutions" ||
      soln.type === "eachOfSolutions" ? walkExpressions :
      soln.type === "tripleConstraintSolutions" ? walkTriple :
      structuralError("unknown type: " + soln.type);

  if (myMax > 1) // preserve important associations:
    // map: e.g. [[1,2],[3,4]]
    // [walk(soln.solutions[0]), walk(soln.solutions[1]),...]
    return soln.solutions.map(walk);
  else // hide unimportant nesting:
    // flatmap: e.g. [1,2,3,4]
    // [].concat(walk(soln.solutions[0])).concat(walk(soln.solutions[1]))...
    return [].concat.apply([], soln.solutions.map(walk));
}

return {
  register: register,
  done: done,
  materializer: materializer,
  ThreadedMaterializer: (__webpack_require__(245).ThreadedMaterializer),
  MaterializerDebugger: (__webpack_require__(245).MaterializerDebugger),
  MaterializationError: (__webpack_require__(245).MaterializationError),
  tripleConstraints: (__webpack_require__(245).tripleConstraints),
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

if (true)
  module.exports = ShExMapCjsModule;


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
  Map:                __webpack_require__(612),
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