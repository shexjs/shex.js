/**
 * Terms used in ShEx.
 *
 * There are four representations of RDF terms used in ShEx NamedNodevalidation and applications:
 * 1. LD (short for JSON-LD) @ids used in ShExJ.
 *   "http://a.example/some/Iri
 *   "_:someBlankNode
 *   { "value": "1.0", "datatype": "http://www.w3.org/2001/XMLSchema#float" }
 *   { "value": "chat", "language": "fr" }
 * 2. RdfJs Terms [RdfJsTerm] specification used in validation
 *   { "termType": "NamedNode": "value": "http://a.example/some/Iri" }
 *   { "termType": "BlankNode": "value": "someBlankNode" }
 *   { "termType": "Literal": "value": "1.0", "datatype": "http://www.w3.org/2001/XMLSchema#float" }
 *   { "termType": "Literal": "value": "chat", "language": "fr" }
 * 3. Turtle representation is used for human interfaces
 *   <http://a.example/some/Iri>, p:IRI, p:, :
 *   _:someBlankNode, []
 *   "1.0"^^<http://www.w3.org/2001/XMLSchema#float>, "1.0"^^xsd:float, 1.0
 *   "chat"@fr
 * 4. N3id - webapps and scripts that rely specifically on N3.js leverage the
 *    fact that term.id is Turtle for all terms except typed literals which lack
 *    <>s around data types:
 *   "1.0"^^http://www.w3.org/2001/XMLSchema#float
 *
 * [RdfJsTerm](https://rdf.js.org/data-model-spec/#term-interface)
 */

/**
 *
 * isIRI, isBlank, getLiteralType, getLiteralValue
 */

const ShExTermCjsModule = (function () {

  const RelativizeIri = require("relativize-url").relativize;
  const DataFactory = require('rdf-data-factory');

  const absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
    schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

  const RdfLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
  const XsdString = "http://www.w3.org/2001/XMLSchema#string";

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./Parser./g
  //   s/token/iri/
  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  function resolveRelativeIRI (base, iri) {

    if (absoluteIRI.test(iri))
      return iri

    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return base;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return base.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      let m = base.match(schemeAuthority);
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? m[1] : m[0]) + _removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return _removeDotSegments(base.replace(/[^\/?]*(?:\?.*)?$/, '') + iri);
    }
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986.
  function _removeDotSegments (iri) {
    // Don't modify the IRI if it does not contain any dot segments
    if (!dotSegments.test(iri))
      return iri;

    // Start with an imaginary slash before the IRI in order to resolve trailing './' and '../'
    const length = iri.length;
    let result = '', i = -1, pathStart = -1, segmentStart = 0, next = '/';

    while (i < length) {
      switch (next) {
      // The path starts with the first slash after the authority
      case ':':
        if (pathStart < 0) {
          // Skip two slashes before the authority
          if (iri[++i] === '/' && iri[++i] === '/')
            // Skip to slash after the authority
            while ((pathStart = i + 1) < length && iri[pathStart] !== '/')
              i = pathStart;
        }
        break;
      // Don't modify a query string or fragment
      case '?':
      case '#':
        i = length;
        break;
      // Handle '/.' or '/..' path segments
      case '/':
        if (iri[i + 1] === '.') {
          next = iri[++i + 1];
          switch (next) {
          // Remove a '/.' segment
          case '/':
            result += iri.substring(segmentStart, i - 1);
            segmentStart = i + 1;
            break;
          // Remove a trailing '/.' segment
          case undefined:
          case '?':
          case '#':
            return result + iri.substring(segmentStart, i) + iri.substr(i + 1);
          // Remove a '/..' segment
          case '.':
            next = iri[++i + 1];
            if (next === undefined || next === '/' || next === '?' || next === '#') {
              result += iri.substring(segmentStart, i - 2);
              // Try to remove the parent path from result
              if ((segmentStart = result.lastIndexOf('/')) >= pathStart)
                result = result.substr(0, segmentStart);
              // Remove a trailing '/..' segment
              if (next !== '/')
                return result + '/' + iri.substr(i + 1);
              segmentStart = i + 1;
            }
          }
        }
      }
      next = iri[++i];
    }
    return result + iri.substring(segmentStart);
  }

  const Turtle = {};
  Turtle.PN_CHARS_BASE = "A-Za-z\u{C0}-\u{D6}\u{D8}-\u{F6}\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}"; // escape anything outside BMP: \u{10000}-\u{EFFFF}
  Turtle.PN_CHARS_U = Turtle.PN_CHARS_BASE + "_";
  Turtle.PN_CHARS_WO_HYPHEN = Turtle.PN_CHARS_U + "0-9\u{B7}\u{300}-\u{36F}\u{203F}-\u{2040}";
  Turtle.PN_PREFIX = [Turtle.PN_CHARS_BASE, Turtle.PN_CHARS_WO_HYPHEN + '.-', Turtle.PN_CHARS];
  Turtle.PN_LOCAL = [
    Turtle.PN_CHARS_U + ":0-9",
    Turtle.PN_CHARS_WO_HYPHEN + ".:-",
    Turtle.PN_CHARS_WO_HYPHEN + ":-"
  ];

  function rdfJsTerm2Turtle (node, meta) {
    switch (node.termType) {
    case ("NamedNode"):
      return iri2Turtle(node.value, meta);
    case ("BlankNode"):
      return "_:" + node.value;
    case ("Literal"):
      return "\"" + node.value.replace(/"/g, '\\"') + "\"" + (
        node.datatype.value === RdfLangString
          ? "@" + node.language
          : node.datatype.value === XsdString
          ? ""
          : "^^" + node.datatype.value
      );
    default: throw Error(`rdfJsTerm2Turtle: unknown RDFJS node type: ${JSON.stringify(node)}`)
    }
  }

  function iri2Turtle (iri, meta = {}, aForType = true) {
    const {base, prefixes = {}} = meta;
    if (aForType && iri === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
      return "a";

    const rel = "<" + (base ? RelativizeIri(iri, base) : iri) + ">";
    for (prefix in prefixes) {
      const ns = prefixes[prefix];
      if (iri.startsWith(ns)) {
        const localName = iri.substr(ns.length);
        const first = localName.slice(0, 1).replaceAll(new RegExp("[^" + Turtle.PN_LOCAL[0] + "]", "g"), s => '\\' + s);
        const middle = localName.slice(1, localName.length - 1).replaceAll(new RegExp("[^" + Turtle.PN_LOCAL[1] + "]", "g"), s => '\\' + s);
        const last = localName.length > 1 ? localName.slice(localName.length - 1).replaceAll(new RegExp("[^" + Turtle.PN_LOCAL[2] + "]", "g"), s => '\\' + s) : '';
        const pName = prefix + ':' + first + middle + last;
        if (pName.length < rel.length)
          return pName;
      }
    }
    return rel;
  }

  function shExJsTerm2Turtle (node, meta = {}, aForType = true) {
    const {base, prefixes = {}} = meta;
    if (typeof node === "string") {
      if (node.startsWith("_:")) {
        return node;
      } else {
        return this.iri2Turtle(node, meta, aForType);
      }
    } else if (isLiteral(node)) {
      let value = getLiteralValue(node);
      const type = getLiteralType(node);
      const language = getLiteralLanguage(node);
      // Escape special characters
      if (escape.test(value))
        value = value.replace(escapeAll, characterReplacer);
      // Write the literal, possibly with type or language
      if (language)
        return '"' + value + '"@' + language;
      else if (type && type !== "http://www.w3.org/2001/XMLSchema#string")
        return '"' + value + '"^^' + this.iri2Turtle(type, meta, false);
      else
        return '"' + value + '"';
    } else {
      throw Error("Unknown internal term type: " + JSON.stringify(node));
    }
  }

  function shExJsTerm2Ld (term) {
    if (term[0] !== "\"")
      return term;
    const ret = { value: ShExTerm.getLiteralValue(term) };
    const dt = ShExTerm.getLiteralType(term);
    if (dt &&
        dt !== "http://www.w3.org/2001/XMLSchema#string" &&
        dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
      ret.type = dt;
    const lang = ShExTerm.getLiteralLanguage(term)
    if (lang)
      ret.language = lang;
    return ret;
  }

  // Tests whether the given entity (triple object) represents an IRI in the N3 library
  function isIRI (entity) {
    return entity.termType === 'NamedNode';
  }

  // Tests whether the given entity (triple object) represents a literal in the N3 library
  function isLiteral (entity) {
    return entity.termType === 'Literal';
  }

  // Tests whether the given entity (triple object) represents a blank node in the N3 library
  function isBlank (entity) {
    return entity.termType === 'BlankNode';
  }

  // Tests whether the given triple is in the default graph
  function inDefaultGraph (quad) {
    return isDefaultGraph(quad.graph);
  }

  // Tests whether the given entity represents the default graph
  function isDefaultGraph (entity) {
    return entity.termType === 'DefaultGraph';
  }

  // Gets the string value of a literal in the N3 library
  function getLiteralValue (literal) {
    return literal.value;
  }

  // Gets the type of a literal in the N3 library
  function getLiteralType (literal) {
    return literal.datatype.value;
  }

  // Gets the language of a literal in the N3 library
  function getLiteralLanguage (literal) {
    return literal.language;
  }

// Characters in literals that require escaping
const escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapeReplacements = {
      '\\': '\\\\', '"': '\\"', '\t': '\\t',
      '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
    };

  // Replaces a character by its escaped version
  function characterReplacer (character) {
    // Replace a single character by its escaped version
    let result = escapeReplacements[character]; // @@ const should be let
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

  function ld2RdfJsTerm (ld) {
    switch (typeof ld) {
    case 'object':
      const copy = JSON.parse(JSON.stringify(ld));
      if (!copy.value)
        throw Error(`JSON-LD-style object literal has no value: ${JSON.stringify(ld)}`)
      const value = copy.value;
      delete copy.value;
      if (copy.language)
        return new DataFactory.Literal(value, copy.language);
      if (copy.type)
        return new DataFactory.Literal(value, new DataFactory.NamedNode(copy.type));
      if (Object.keys(copy).length > 0)
        throw Error(`Unrecognized attributes inn JSON-LD-style object literal: ${JSON.stringify(Object.keys(copy))}`)
      return new DataFactory.Literal(value);

    case 'string':
      return ld.startsWith('_:')
        ? new DataFactory.BlankNode(ld.substr(2))
        : new DataFactory.NamedNode(ld);

    default: throw Error(`Unrecognized JSON-LD-style term: ${JSON.stringify(ld)}`)
    }
  }

  function rdfJsTerm2Ld (term) {
    switch (term.termType) {
    case "NamedNode": return term.value;
    case "BlankNode": return "_:" + term.value;
    case "Literal":
      const ret = { value: term.value };
      const dt = term.datatype.value;
      const lang = term.language;
      if (dt &&
          dt !== "http://www.w3.org/2001/XMLSchema#string" &&
          dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
        ret.type = dt;
      if (lang)
        ret.language = lang;
      return ret;
    default:
      throw Error(`Unrecognized termType ${term.termType} ${term.value}`);
    }
  }

  /** N3id functions
   * Some tests and algorithms use n3.js ids as syntax for input graphs in tests.
   *   NamedNode: bare word, e.g. http://a.example/
   *   BlankNode: "_:" + label, e.g. _:b1
   *   Literal: quoted value plus ntriples lang or datatype, e.g:
   *     "I said \"Hello World\"."
   *     "I said \"Hello World\"."@en
   *     "1.1"^^http://www.w3.org/2001/XMLSchema#float
   */

  /**
   * Map an N3id quad to an RdfJs quad
   * @param {*} s subject
   * @param {*} p predicate
   * @param {*} o object
   * @param {*} g graph
   * @returns RdfJs quad
   */
  function n3idQuad2RdfJs (s, p, o, g) {
    return new DataFactory.Quad(
      n3idTerm2RdfJs(s),
      n3idTerm2RdfJs(p),
      n3idTerm2RdfJs(o),
      g ? n3idTerm2RdfJs(g) : new DataFactory.DefaultGraph(),
    );
  }

  /**
   * Map an N3id term to an RdfJs Term.
   * @param {*} term N3Id term
   * @returns RdfJs Term
   */
  function n3idTerm2RdfJs (term) {
    if (term[0] === "_" && term[1] === ":")
      return new DataFactory.BlankNode(term.substr(2));

    if (term[0] === "\"" || term[0] === "'") {
      const closeQuote = term.lastIndexOf(term[0]);
      if (closeQuote === -1)
        throw new Error(`no close ${term[0]}: ${term}`);
      const value = term.substr(1, closeQuote - 1).replace(/\\"/g, '"');
      const langOrDt = term.length === closeQuote + 1
            ? null
            : term[closeQuote + 1] === "@"
            ? term.substr(closeQuote + 2)
            : parseDt(closeQuote + 1)
      return new DataFactory.Literal(value, langOrDt);
    }

    return new DataFactory.NamedNode(term);

    function parseDt (from) {
      if (term[from] !== "^" || term[from + 1] !== "^")
        throw new Error(`garbage after closing ": ${term}`);
      return new DataFactory.NamedNode(term.substr(from + 2));
    }
  }

  return {
    RdfLangString: RdfLangString,
    XsdString: XsdString,
    resolveRelativeIRI: resolveRelativeIRI,
    isIRI: isIRI,
    isLiteral: isLiteral,
    isBlank: isBlank,
    isDefaultGraph: isDefaultGraph,
    inDefaultGraph: inDefaultGraph,
    getLiteralValue: getLiteralValue,
    getLiteralType: getLiteralType,
    getLiteralLanguage: getLiteralLanguage,
    rdfJsTerm2Turtle,
    shExJsTerm2Turtle,
    shExJsTerm2Ld,
    ld2RdfJsTerm,
    rdfJsTerm2Ld,
    n3idQuad2RdfJs,
    n3idTerm2RdfJs,
    iri2Turtle,
  }
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExTermCjsModule; // node environment
