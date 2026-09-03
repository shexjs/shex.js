/**
 * options: {
 *   indent: '    ',
 *   checkCorefs: n => false, // meaning "trust me, it's a tree"
 * }
 */

// **N3Writer** writes N3 documents.
const namespaces = require('n3/lib/IRIs').default;
const N3Fac = require('n3/lib/N3DataFactory');
const { Term } = N3Fac;
const N3DataFactory = N3Fac.default;
const { isDefaultGraph } = require('n3/lib/N3Util');

const DEFAULTGRAPH = N3DataFactory.defaultGraph();

const { rdf, xsd } = namespaces;

// Characters in literals that require escaping
const escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapedCharacters: { [char: string]: string } = {
      '\\': '\\\\', '"': '\\"', '\t': '\\t',
      '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
    };
const rdf10LocalName = `[_a-zA-Z][\\-_a-zA-Z0-9]*`;
const rdf11LocalName = `[_a-zA-Z0-9][\\-_a-zA-Z0-9.]*`;

// ## Placeholder class to represent already pretty-printed terms
class SerializedTerm extends Term {
  constructor (id: any) { super(id); }
  // Pretty-printed nodes are not equal to any other node
  // (e.g., [] does not equal [])
  equals() {
    return false;
  }
}

const INDENT = '  ';

abstract class Nesting {
  _stream: Writer;
  _indent: string;
  _subject: any;
  _predicate: any;
  /** NB: distinct from _predicate; tracked by _writeQuad's same-subject branch */
  predicate: any;
  used?: boolean;

  constructor (stream: Writer, indent: string, subject: any, predicate: any) {
    this._stream = stream;
    this._indent = indent;
    this._subject = subject;
    this._predicate = predicate; // gets updated by _writeQuad()
  }

  abstract close (done?: any, p?: Nesting): void;
}

class Root extends Nesting {
  constructor (stream: Writer, subject: any, predicate: any) { super(stream, '  ', subject, predicate); }
  close (done?: any) {
    if (this.used) {
      this._stream._write('.\n', done);
      this.used = false;
    }
  }
}

class BNode extends Nesting {
  constructor (stream: Writer, indent: string, node: any) { super(stream, indent, node, null); }
  close (done?: any, p?: Nesting) {
    this._stream._write((this.used ? `\n${p!._indent}` : '') + ']', done);
  }
}

class Collection extends Nesting {
  _members: any[];
  leadSpace: boolean;

  constructor (stream: Writer, indent: string, members: any[]) {
    super(stream, indent, null, null);
    this._members = members;
    this.leadSpace = false;
  }
  close (done?: any, p?: Nesting) {
    this._stream._write(`\n${p!._indent})`, done);
  }
}


// ## Constructor
class Writer {
  // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
  _prefixRegex = /$0^/;
  _lists: { [value: string]: any[] } | undefined;
  _indent: string;
  _checkCorefs: (n: any) => boolean;
  _version: number;
  _localName: string;
  _outputStream: any;
  _endStream: boolean;
  _nestings: Nesting[];
  _lineMode = false;
  _graph: any;
  _prefixIRIs: { [iri: string]: string } | undefined;
  _baseMatcher: RegExp | undefined;
  _baseLength: number | undefined;
  _prefixMatch?: any;

  constructor(outputStream?: any, options?: any) {
    // Shift arguments if the first argument is not a stream
    if (outputStream && typeof outputStream.write !== 'function')
      options = outputStream, outputStream = null;
    options = options || {};
    this._lists = options.lists;
    this._indent = options.indent || '  ';
    this._checkCorefs = options.checkCorefs || ((_n: any) => false); // if unsupplied; assume a tree
    this._version = options.version || 1.0;
    this._localName = this._version === 1.0
        ? rdf10LocalName
        : rdf11LocalName;

    // If no output stream given, send the output as string through the end callback
    if (!outputStream) {
      let output = '';
      this._outputStream = {
        write(chunk: string, _encoding?: any, done?: any) { if (options.debug) { console.log({chunk, output}); } output += chunk; done && done(); },
        end: (done?: any) => { done && done(null, output); },
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
  _write(string: string, callback?: any) {
    this._outputStream.write(string, 'utf8', callback);
  }

  // ### `_writeQuad` writes the quad to the output stream
  _writeQuad(subject: any, predicate: any, object: any, graph: any, done?: any) {
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
  _getNestingForSubject (subject: any): [Nesting, boolean] {
    let nesting: Nesting | null = this._nestings.length > 0
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
          if (li.value in this._lists!) {
            // list in a list
            this._write(`${leadSpace}(`)
            this._nestings.push(nesting = new Collection(this, nesting._indent + INDENT, this._lists![li.value]));
            (nesting as Collection).leadSpace = false;
          } else {
            // any other element in the list
            if (li.equals(subject)) {
              this._write("\n" + nesting._indent + '[');
              nesting._subject = null;
              this._nestings.push(nesting = new BNode(this, nesting._indent + INDENT, subject));
              (nesting as any).leadSpace = false;
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
    return [nesting!, subject.equals(nesting!._subject)]; // hard code true?

  }

  _closeNesting (): Nesting {
    const nesting = this._nestings.pop()!;
    const ret = this._nestings[this._nestings.length - 1];
    nesting.close(null, ret);
    return ret;
  }

  _finish(): boolean {
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
  _writeQuadLine(subject: any, predicate: any, object: any, graph: any, done?: any) {
    // Write the quad without prefixes
    delete this._prefixMatch;
    this._write(this.quadToString(subject, predicate, object, graph), done);
  }

  // ### `quadToString` serializes a quad as a string
  quadToString(subject: any, predicate: any, object: any, graph?: any): string {
    return  `${this._encodeSubject(subject)} ${
            this._encodeIriOrBlank(predicate)} ${
            this._encodeObject(object)
            }${graph && graph.value ? ` ${this._encodeIriOrBlank(graph)} .\n` : ' .\n'}`;
  }

  // ### `quadsToString` serializes an array of quads as a string
  quadsToString(quads: any[]): string {
    return quads.map(t => {
      return this.quadToString(t.subject, t.predicate, t.object, t.graph);
    }).join('');
  }

  // ### `_encodeSubject` represents a subject
  _encodeSubject(entity: any): string {
    return entity.termType === 'Quad' ?
      this._encodeQuad(entity) : this._encodeIriOrBlank(entity);
  }

  // ### `_encodeIriOrBlank` represents an IRI or blank node
  _encodeIriOrBlank(entity: any): string {
    // A blank node or list is represented as-is
    if (entity.termType !== 'NamedNode') {
      // If it is a list head, pretty-print it
      return 'id' in entity ? entity.id : `_:${entity.value}`;
    }
    let iri = entity.value;
    // Use relative IRIs if requested and possible
    if (this._baseMatcher && this._baseMatcher.test(iri))
      iri = iri.substr(this._baseLength!);
    // Escape special characters
    if (escape.test(iri))
      iri = iri.replace(escapeAll, characterReplacer);
    // Try to represent the IRI as prefixed name
    const prefixMatch = this._prefixRegex.exec(iri);
    return !prefixMatch ? `<${iri}>` :
           (!prefixMatch[1] ? iri : this._prefixIRIs![prefixMatch[1]] + prefixMatch[2]);
  }

  // ### `_encodeLiteral` represents a literal
  _encodeLiteral(literal: any): string {
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
  _encodePredicate(predicate: any): string {
    return predicate.value === rdf.type ? 'a' : this._encodeIriOrBlank(predicate);
  }

  // ### `_encodeObject` represents an object
  _encodeObject(object: any): string {
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
  _encodeQuad({ subject, predicate, object, graph }: any): string {
    return `<<${
      this._encodeSubject(subject)} ${
      this._encodePredicate(predicate)} ${
      this._encodeObject(object)}${
      isDefaultGraph(graph) ? '' : ` ${this._encodeIriOrBlank(graph)}`}>>`;
  }

  // ### `_blockedWrite` replaces `_write` after the writer has been closed
  _blockedWrite(): never {
    throw new Error('Cannot write because the writer has been closed.');
  }

  // ### `addQuad` adds the quad to the output stream
  addQuad(subject: any, predicate?: any, object?: any, graph?: any, done?: any) {
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
  addQuads(quads: any[]) {
    for (let i = 0; i < quads.length; i++)
      this.addQuad(quads[i]);
  }

  // ### `addPrefix` adds the prefix to the output stream
  addPrefix(prefix: string, iri: any, done?: any) {
    const prefixes: any = {};
    prefixes[prefix] = iri;
    this.addPrefixes(prefixes, done);
  }

  // ### `addPrefixes` adds the prefixes to the output stream
  addPrefixes(prefixes: any, done?: any) {
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
      IRIlist = escapeRegex(IRIlist);
      this._prefixRegex = new RegExp(`^(?:${prefixList})[^\/]*$|` +
                                     `^(${IRIlist})(${this._localName})$`);
    }
    // End a prefix block with a newline
    this._write(hasPrefixes ? '\n' : '', done);
  }

  // ### `blank` creates a blank node with the given content
  blank(predicate?: any, object?: any) {
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
  list(elements?: any[]) {
    const length = elements && elements.length || 0, contents = new Array(length);
    for (let i = 0; i < length; i++)
      contents[i] = this._encodeObject(elements![i]);
    return new SerializedTerm(`(${contents.join(' ')})`);
  }

  // ### `comment` writes a comment line
  comment(text: string) {
    // Finish a possible pending quad
    this._finish();
    this._write(text + "\n");
  }

  // ### `end` signals the end of the output stream
  end(done?: any) {
    // Finish a possible pending quad
    this._finish();
    // Disallow further writing
    this._write = this._blockedWrite;

    // Try to end the underlying stream, ensuring done is called exactly one time
    let singleDone: any = done && ((error?: any, result?: any) => { singleDone = null, done(error, result); });
    if (this._endStream) {
      try { return this._outputStream.end(singleDone); }
      catch (error) { /* error closing stream */ }
    }
    singleDone && singleDone();
  }
}

// Replaces a character by its escaped version
function characterReplacer(character: string): string {
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

function escapeRegex(regex: string): string {
  return regex.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
}

export = {Writer};
