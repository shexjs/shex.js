/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "webpacks/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {



/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/**
 *
 * isIRI, isBlank, getLiteralType, getLiteralValue
 */

const ShExTermCjsModule = (function () {

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
    const result = '', length = iri.length, i = -1, pathStart = -1, segmentStart = 0, next = '/';

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

  function internalTerm (node) { // !!rdfjsTermToInternal
    switch (node.termType) {
    case ("NamedNode"):
      return node.value;
    case ("BlankNode"):
      return "_:" + node.value;
    case ("Literal"):
      return "\"" + node.value + "\"" + (
        node.datatypeString === RdfLangString
          ? "@" + node.language
          : node.datatypeString === XsdString
          ? ""
          : "^^" + node.datatypeString
      );
    default: throw Error("unknown RDFJS node type: " + JSON.stringify(node))
    }
  }

  function internalTriple (triple) { // !!rdfjsTripleToInternal
    return {
      subject: internalTerm(triple.subject),
      predicate: internalTerm(triple.predicate),
      object: internalTerm(triple.object)
    };
  }

  function externalTerm (node, factory) { // !!intermalTermToRdfjs
    if (isIRI(node)) {
      return factory.namedNode(node);
    } else if (isBlank(node)) {
      return factory.blankNode(node.substr(2));
    } else if (isLiteral(node)) {
      let dtOrLang = getLiteralLanguage(node) ||
          (getLiteralType(node) === XsdString
           ? null // seems to screw up N3.js
           : factory.namedNode(getLiteralType(node)))
      return factory.literal(getLiteralValue(node), dtOrLang)
    } else {
      throw Error("Unknown internal term type: " + JSON.stringify(node));
    }
  }

  function externalTriple (triple, factory) { // !!rename internalTripleToRdjs
    return factory.quad(
      externalTerm(triple.subject, factory),
      externalTerm(triple.predicate, factory),
      externalTerm(triple.object, factory)
    );
  }

  function intermalTermToTurtle (node, base, prefixes) {
    if (isIRI(node)) {
      // if (node === RDF_TYPE) // only valid in Turtle predicates
      //   return "a";

      // Escape special characters
      if (escape.test(node))
        node = node.replace(escapeAll, characterReplacer);
      const pref = Object.keys(prefixes).find(pref => node.startsWith(prefixes[pref]));
      if (pref) {
        const rest = node.substr(prefixes[pref].length);
        if (rest.indexOf("\\") === -1) // could also say no more than n of these: [...]
          return pref + ":" + rest.replace(/([~!$&'()*+,;=/?#@%])/g, '\\' + "$1");
      }
      if (node.startsWith(base)) {
        return "<" + node.substr(base.length) + ">";
      } else {
        return "<" + node + ">";
      }
    } else if (isBlank(node)) {
      return node;
    } else if (isLiteral(node)) {
      const value = getLiteralValue(node);
      const type = getLiteralType(node);
      const language = getLiteralLanguage(node);
      // Escape special characters
      if (escape.test(value))
        value = value.replace(escapeAll, characterReplacer);
      // Write the literal, possibly with type or language
      if (language)
        return '"' + value + '"@' + language;
      else if (type && type !== "http://www.w3.org/2001/XMLSchema#string")
        return '"' + value + '"^^' + this.intermalTermToTurtle(type, base, prefixes);
      else
        return '"' + value + '"';
    } else {
      throw Error("Unknown internal term type: " + JSON.stringify(node));
    }
  }

  // Tests whether the given entity (triple object) represents an IRI in the N3 library
  function isIRI (entity) {
    if (typeof entity !== 'string')
      return false;
    else if (entity.length === 0)
      return true;
    else {
      const firstChar = entity[0];
      return firstChar !== '"' && firstChar !== '_';
    }
  }

  // Tests whether the given entity (triple object) represents a literal in the N3 library
  function isLiteral (entity) {
    return typeof entity === 'string' && entity[0] === '"';
  }

  // Tests whether the given entity (triple object) represents a blank node in the N3 library
  function isBlank (entity) {
    return typeof entity === 'string' && entity.substr(0, 2) === '_:';
  }

  // Tests whether the given entity represents the default graph
  function isDefaultGraph (entity) {
    return !entity;
  }

  // Tests whether the given triple is in the default graph
  function inDefaultGraph (triple) {
    return !triple.graph;
  }

  // Gets the string value of a literal in the N3 library
  function getLiteralValue (literal) {
    const match = /^"([^]*)"/.exec(literal);
    if (!match)
      throw new Error(literal + ' is not a literal');
    return match[1];
  }

  // Gets the type of a literal in the N3 library
  function getLiteralType (literal) {
    const match = /^"[^]*"(?:\^\^([^"]+)|(@)[^@"]+)?$/.exec(literal);
    if (!match)
      throw new Error(literal + ' is not a literal');
    return match[1] || (match[2] ? RdfLangString : XsdString);
  }

  // Gets the language of a literal in the N3 library
  function getLiteralLanguage (literal) {
    const match = /^"[^]*"(?:@([^@"]+)|\^\^[^"]+)?$/.exec(literal);
    if (!match)
      throw new Error(literal + ' is not a literal');
    return match[1] ? match[1].toLowerCase() : '';
  }


// rdf:type predicate (for 'a' abbreviation)
const RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    RDF_TYPE   = RDF_PREFIX + 'type';

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
    const result = escapeReplacements[character];
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
    internalTerm: internalTerm,
    internalTriple: internalTriple,
    externalTerm: externalTerm,
    externalTriple: externalTriple,
    intermalTermToTurtle: intermalTermToTurtle,
  }
})();

if (true)
  module.exports = ShExTermCjsModule; // node environment


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// **ShExUtil** provides ShEx utility functions

const ShExUtilCjsModule = (function () {
const ShExTerm = __webpack_require__(3);
const Visitor = __webpack_require__(10)
const Hierarchy = __webpack_require__(23)

const SX = {};
SX._namespace = "http://www.w3.org/ns/shex#";
["Schema", "@context", "imports", "startActs", "start", "shapes",
 "ShapeOr", "ShapeAnd", "shapeExprs", "nodeKind",
 "NodeConstraint", "iri", "bnode", "nonliteral", "literal", "datatype", "length", "minlength", "maxlength", "pattern", "flags", "mininclusive", "minexclusive", "maxinclusive", "maxexclusive", "totaldigits", "fractiondigits", "values",
 "ShapeNot", "shapeExpr",
 "Shape", "virtual", "closed", "extra", "expression", "inherit", "semActs",
 "ShapeRef", "reference", "ShapeExternal",
 "EachOf", "OneOf", "expressions", "min", "max", "annotation",
 "TripleConstraint", "inverse", "negated", "predicate", "valueExpr",
 "Inclusion", "include", "Language", "languageTag",
 "IriStem", "LiteralStem", "LanguageStem", "stem",
 "IriStemRange", "LiteralStemRange", "LanguageStemRange", "exclusion",
 "Wildcard", "SemAct", "name", "code",
 "Annotation", "object"].forEach(p => {
  SX[p] = SX._namespace+p;
});
const RDF = {};
RDF._namespace = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
["type", "first", "rest", "nil"].forEach(p => {
  RDF[p] = RDF._namespace+p;
});
const XSD = {}
XSD._namespace = "http://www.w3.org/2001/XMLSchema#";
["anyURI"].forEach(p => {
  XSD[p] = XSD._namespace+p;
});
const OWL = {}
OWL._namespace = "http://www.w3.org/2002/07/owl#";
["Thing"].forEach(p => {
  OWL[p] = OWL._namespace+p;
});

const Missed = {}; // singleton
const UNBOUNDED = -1;

function extend (base) {
  if (!base) base = {};
  for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (let name in arg)
      base[name] = arg[name];
  return base;
}

    function isTerm (t) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }

  function isShapeRef (expr) {
    return typeof expr === "string" // test for JSON-LD @ID
  }
  let isInclusion = isShapeRef;

        function ldify (term) {
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
const ShExUtil = {

  SX: SX,
  RDF: RDF,
  version: function () {
    return "0.5.0";
  },

  Visitor: Visitor,
  index: Visitor.index,

  // tests
  // console.warn("HERE:", ShExJtoAS({"type":"Schema","shapes":[{"id":"http://all.example/S1","type":"Shape","expression":
  //  { "id":"http://all.example/S1e", "type":"EachOf","expressions":[ ] },
  // // { "id":"http://all.example/S1e","type":"TripleConstraint","predicate":"http://all.example/p1"},
  // "extra":["http://all.example/p3","http://all.example/p1","http://all.example/p2"]
  // }]}).shapes['http://all.example/S1']);

  ShExJtoAS: function (schema) {
    const _ShExUtil = this;
    schema._prefixes = schema.prefixes || {  };
    schema._index = this.index(schema);
    return schema;
  },

  AStoShExJ: function (schema, abbreviate) {
    schema["@context"] = schema["@context"] || "http://www.w3.org/ns/shex.jsonld";
    delete schema["_index"];
    delete schema["_prefixes"];
    return schema;
  },

  ShExRVisitor: function (knownShapeExprs) {
    const v = ShExUtil.Visitor();
    const knownExpressions = {};
    const oldVisitShapeExpr = v.visitShapeExpr,
        oldVisitValueExpr = v.visitValueExpr,
        oldVisitExpression = v.visitExpression;
    v.keepShapeExpr = oldVisitShapeExpr;

    v.visitShapeExpr = v.visitValueExpr = function (expr, label) {
      if (typeof expr === "string")
        return expr;
      if ("id" in expr) {
        if (knownShapeExprs.indexOf(expr.id) !== -1 || Object.keys(expr).length === 1)
          return expr.id;
        delete expr.id;
      }
      return oldVisitShapeExpr.call(this, expr, label);
    };

    v.visitExpression = function (expr) {
      if (typeof expr === "string") // shortcut for recursive references e.g. 1Include1 and ../doc/TODO.md
        return expr;
      if ("id" in expr) {
        if (expr.id in knownExpressions) {
          knownExpressions[expr.id].refCount++;
          return expr.id;
        }
      }
      const ret = oldVisitExpression.call(this, expr);
      // Everything from RDF has an ID, usually a BNode.
      knownExpressions[expr.id] = { refCount: 1, expr: ret };
      return ret;
    }

    v.cleanIds = function () {
      for (let k in knownExpressions) {
        const known = knownExpressions[k];
        if (known.refCount === 1 && ShExTerm.isBlank(known.expr.id))
          delete known.expr.id;
      };
    }

    return v;
  },


  // tests
  // const shexr = ShExUtil.ShExRtoShExJ({ "type": "Schema", "shapes": [
  //   { "id": "http://a.example/S1", "type": "Shape",
  //     "expression": {
  //       "type": "TripleConstraint", "predicate": "http://a.example/p1",
  //       "valueExpr": {
  //         "type": "ShapeAnd", "shapeExprs": [
  //           { "type": "NodeConstraint", "nodeKind": "bnode" },
  //           { "id": "http://a.example/S2", "type": "Shape",
  //             "expression": {
  //               "type": "TripleConstraint", "predicate": "http://a.example/p2" } }
  //           //            "http://a.example/S2"
  //         ] } } },
  //   { "id": "http://a.example/S2", "type": "Shape",
  //     "expression": {
  //       "type": "TripleConstraint", "predicate": "http://a.example/p2" } }
  // ] });
  // console.warn("HERE:", shexr.shapes[0].expression.valueExpr);
  // ShExUtil.ShExJtoAS(shexr);
  // console.warn("THERE:", shexr.shapes["http://a.example/S1"].expression.valueExpr);


  ShExRtoShExJ: function (schema) {
    // compile a list of known shapeExprs
    const knownShapeExprs = [];
    if ("shapes" in schema)
      [].push.apply(knownShapeExprs, schema.shapes.map(sh => { return sh.id; }));

    // normalize references to those shapeExprs
    const v = this.ShExRVisitor(knownShapeExprs);
    if ("start" in schema)
      schema.start = v.visitShapeExpr(schema.start);
    if ("shapes" in schema)
      schema.shapes = schema.shapes.map(sh => {
        return v.keepShapeExpr(sh);
      });

    // remove extraneous BNode IDs
    v.cleanIds();
    return schema;
  },

  valGrep: function (obj, type, f) {
    const _ShExUtil = this;
    const ret = [];
    for (let i in obj) {
      const o = obj[i];
      if (typeof o === "object") {
        if ("type" in o && o.type === type)
          ret.push(f(o));
        ret.push.apply(ret, _ShExUtil.valGrep(o, type, f));
      }
    }
    return ret;
  },

  n3jsToTurtle: function (res) {
    function termToLex (node) {
      return typeof node === "object" ? ("\"" + node.value + "\"" + (
        "type" in node ? "^^<" + node.type + ">" :
          "language" in node ? "@" + node.language :
          ""
      )) :
      ShExTerm.isIRI(node) ? "<" + node + ">" :
      ShExTerm.isBlank(node) ? node :
      "???";
    }
    return this.valGrep(res, "TestedTriple", function (t) {
      return ["subject", "predicate", "object"].map(k => {
        return termToLex(t[k]);
      }).join(" ")+" .";
    });
  },

  valToN3js: function (res, factory) {
    return this.valGrep(res, "TestedTriple", function (t) {
      const ret = JSON.parse(JSON.stringify(t));
      if (typeof t.object === "object")
        ret.object = ("\"" + t.object.value + "\"" + (
          "type" in t.object ? "^^" + t.object.type :
            "language" in t.object ? "@" + t.object.language :
            ""
        ));
      return ShExTerm.externalTriple(ret, factory);
    });
  },

  n3jsToTurtle: function (n3js) {
    function termToLex (node) {
      if (ShExTerm.isIRI(node))
        return "<" + node + ">";
      if (ShExTerm.isBlank(node))
        return node;
      const t = ShExTerm.getLiteralType(node);
      if (t && t !== "http://www.w3.org/2001/XMLSchema#string")
        return "\"" + ShExTerm.getLiteralValue(node) + "\"" +
        "^^<" + t + ">";
      return node;
    }
    return n3js.map(function (t) {
      return ["subject", "predicate", "object"].map(k => {
        return termToLex(t[k]);
      }).join(" ")+" .";
    });
  },

  /* canonicalize: move all tripleExpression references to their first expression.
   *
   */
  canonicalize: function (schema, trimIRI) {
    const ret = JSON.parse(JSON.stringify(schema));
    ret["@context"] = ret["@context"] || "http://www.w3.org/ns/shex.jsonld";
    delete ret._prefixes;
    delete ret._base;
    let index = ret._index || this.index(schema);
    delete ret._index;
    let sourceMap = ret._sourceMap;
    delete ret._sourceMap;
    // Don't delete ret.productions as it's part of the AS.
    const v = ShExUtil.Visitor();
    const knownExpressions = [];
    const oldVisitInclusion = v.visitInclusion, oldVisitExpression = v.visitExpression;
    v.visitInclusion = function (inclusion) {
      if (knownExpressions.indexOf(inclusion) === -1 &&
          inclusion in index.tripleExprs) {
        knownExpressions.push(inclusion)
        return oldVisitExpression.call(v, index.tripleExprs[inclusion]);
      }
      return oldVisitInclusion.call(v, inclusion);
    };
    v.visitExpression = function (expression) {
      if (typeof expression === "object" && "id" in expression) {
        if (knownExpressions.indexOf(expression.id) === -1) {
          knownExpressions.push(expression.id)
          return oldVisitExpression.call(v, index.tripleExprs[expression.id]);
        }
        return expression.id; // Inclusion
      }
      return oldVisitExpression.call(v, expression);
    };
    if (trimIRI) {
      v.visitIRI = function (i) {
        return i.replace(trimIRI, "");
      }
      if ("imports" in ret)
        ret.imports = v.visitImports(ret.imports);
    }
    if ("shapes" in ret) {
      ret.shapes = Object.keys(index.shapeExprs).sort().map(k => {
        if ("extra" in index.shapeExprs[k])
          index.shapeExprs[k].extra.sort();
        return v.visitShapeExpr(index.shapeExprs[k]);
      });
    }
    return ret;
  },

  BiDiClosure: function () {
    return {
      needs: {},
      neededBy: {},
      inCycle: [],
      test: function () {
        function expect (l, r) { const ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
        // this.add(1, 2); expect(this.needs, { 1:[2]                     }); expect(this.neededBy, { 2:[1]                     });
        // this.add(3, 4); expect(this.needs, { 1:[2], 3:[4]              }); expect(this.neededBy, { 2:[1], 4:[3]              });
        // this.add(2, 3); expect(this.needs, { 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 2:[1], 3:[2,1], 4:[3,2,1] });

        this.add(2, 3); expect(this.needs, { 2:[3]                     }); expect(this.neededBy, { 3:[2]                     });
        this.add(1, 2); expect(this.needs, { 1:[2,3], 2:[3]            }); expect(this.neededBy, { 3:[2,1], 2:[1]            });
        this.add(1, 3); expect(this.needs, { 1:[2,3], 2:[3]            }); expect(this.neededBy, { 3:[2,1], 2:[1]            });
        this.add(3, 4); expect(this.needs, { 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(6, 7); expect(this.needs, { 6:[7]                    , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6]                    , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(5, 6); expect(this.needs, { 5:[6,7], 6:[7]           , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5]           , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(5, 7); expect(this.needs, { 5:[6,7], 6:[7]           , 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5]           , 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(7, 8); expect(this.needs, { 5:[6,7,8], 6:[7,8], 7:[8], 1:[2,3,4], 2:[3,4], 3:[4] }); expect(this.neededBy, { 7:[6,5], 6:[5], 8:[7,6,5], 3:[2,1], 2:[1], 4:[3,2,1] });
        this.add(4, 5);
        expect(this.needs,    { 1:[2,3,4,5,6,7,8], 2:[3,4,5,6,7,8], 3:[4,5,6,7,8], 4:[5,6,7,8], 5:[6,7,8], 6:[7,8], 7:[8] });
        expect(this.neededBy, { 2:[1], 3:[2,1], 4:[3,2,1], 5:[4,3,2,1], 6:[5,4,3,2,1], 7:[6,5,4,3,2,1], 8:[7,6,5,4,3,2,1] });
      },
      add: function (needer, needie, negated) {
        const r = this;
        if (!(needer in r.needs))
          r.needs[needer] = [];
        if (!(needie in r.neededBy))
          r.neededBy[needie] = [];

        // // [].concat.apply(r.needs[needer], [needie], r.needs[needie]). emitted only last element
        r.needs[needer] = r.needs[needer].concat([needie], r.needs[needie]).
          filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });
        // // [].concat.apply(r.neededBy[needie], [needer], r.neededBy[needer]). emitted only last element
        r.neededBy[needie] = r.neededBy[needie].concat([needer], r.neededBy[needer]).
          filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });

        if (needer in this.neededBy) this.neededBy[needer].forEach(function (e) {
          r.needs[e] = r.needs[e].concat([needie], r.needs[needie]).
            filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; });
        });

        if (needie in this.needs) this.needs[needie].forEach(function (e) {
          r.neededBy[e] = r.neededBy[e].concat([needer], r.neededBy[needer]).
            filter(function (el, ord, l) { return el !== undefined && l.indexOf(el) === ord; })
        });
        // this.neededBy[needie].push(needer);

        if (r.needs[needer].indexOf(needer) !== -1)
          r.inCycle = r.inCycle.concat(r.needs[needer]);
      },
      trim: function () {
        function _trim (a) {
          // filter(function (el, ord, l) { return l.indexOf(el) === ord; })
          for (let i = a.length-1; i > -1; --i)
            if (a.indexOf(a[i]) < i)
              a.splice(i, i+1);
        }
        for (k in this.needs)
          _trim(this.needs[k]);
        for (k in this.neededBy)
          _trim(this.neededBy[k]);
      },
      foundIn: {},
      addIn: function (tripleExpr, shapeExpr) {
        this.foundIn[tripleExpr] = shapeExpr;
      }
    }
  },
  /** @@TODO tests
   * options:
   *   no: don't do anything; just report nestable shapes
   *   transform: function to change shape labels
   */
  nestShapes: function (schema, options = {}) {
    const _ShExUtil = this;
    const index = schema._index || this.index(schema);
    if (!('no' in options)) { options.no = false }

    let shapeLabels = Object.keys(index.shapeExprs || [])
    let shapeReferences = {}
    shapeLabels.forEach(label => {
      let shape = index.shapeExprs[label]
      noteReference(label, null) // just note the shape so we have a complete list at the end
      shape = _ShExUtil.skipDecl(shape)
      if (shape.type === 'Shape') {
        if ('extends' in shape) {
          shape.extends.forEach(
            parent => noteReference(parent, shape)
          )
        }
        if ('expression' in shape) {
          (_ShExUtil.simpleTripleConstraints(shape) || []).forEach(tc => {
            let target = _ShExUtil.getValueType(tc.valueExpr, true)
            noteReference(target, {type: 'tc', shapeLabel: label, tc: tc})
          })
        }
      } else if (shape.type === 'NodeConstraint') {
        // can't have any refs to other shapes
      } else {
        throw Error('nestShapes currently only supports Shapes and NodeConstraints')
      }
    })
    let nestables = Object.keys(shapeReferences).filter(
      label => shapeReferences[label].length === 1
        && shapeReferences[label][0].type === 'tc' // no inheritance support yet
        && _ShExUtil.skipDecl(index.shapeExprs[label]).type === 'Shape' // Don't nest e.g. valuesets for now
    ).filter(
      nestable => !('noNestPattern' in options)
        || !nestable.match(RegExp(options.noNestPattern))
    ).reduce((acc, label) => {
      acc[label] = {
        referrer: shapeReferences[label][0].shapeLabel,
        predicate: shapeReferences[label][0].tc.predicate
      }
      return acc
    }, {})
    if (!options.no) {
      let oldToNew = {}

      if (options.rename) {
      if (!('transform' in options)) {
        options.transform = (function () {
          let map = shapeLabels.reduce((acc, k, idx) => {
            acc[k] = '_:transformed' + idx
            return acc
          }, {})
          return function (id, shapeExpr) {
            return map[id]
          }
        })()
      }
      Object.keys(nestables).forEach(oldName => {
        let shapeExpr = index.shapeExprs[oldName]
        let newName = options.transform(oldName, shapeExpr)
        oldToNew[oldName] = newName
        shapeLabels[shapeLabels.indexOf(oldName)] = newName
        nestables[newName] = nestables[oldName]
        nestables[newName].was = oldName
        delete nestables[oldName]
        index.shapeExprs[newName] = index.shapeExprs[oldName]
        delete index.shapeExprs[oldName]
        if (shapeReferences[oldName].length !== 1) { throw Error('assertion: ' + oldName + ' doesn\'t have one reference: [' + shapeReferences[oldName] + ']') }
        let ref = shapeReferences[oldName][0]
        if (ref.type === 'tc') {
          if (ref.tc.valueExpr.type === 'ShapeRef') {
            ref.tc.valueExpr.reference = newName
          } else {
            throw Error('assertion: rename not implemented for TripleConstraint expr: ' + ref.tc.valueExpr)
            // _ShExUtil.setValueType(ref, newName)
          }
        } else if (ref.type === 'Shape') {
          throw Error('assertion: rename not implemented for Shape: ' + ref)
        } else {
          throw Error('assertion: ' + ref.type + ' not TripleConstraint or Shape')
        }
      })

      Object.keys(nestables).forEach(k => {
        let n = nestables[k]
        if (n.referrer in oldToNew) {
          n.newReferrer = oldToNew[n.referrer]
        }
      })

      // Restore old order for more concise diffs.
      let shapesCopy = {}
      shapeLabels.forEach(label => shapesCopy[label] = index.shapeExprs[label])
      index.shapeExprs = shapesCopy
      } else {
        const doomed = []
        const ids = schema.shapes.map(s => s.id)
        Object.keys(nestables).forEach(oldName => {
          shapeReferences[oldName][0].tc.valueExpr = index.shapeExprs[oldName].shapeExpr
          const delme = ids.indexOf(oldName)
          if (schema.shapes[delme].id !== oldName)
            throw Error('assertion: found ' + schema.shapes[delme].id + ' instead of ' + oldName)
          doomed.push(delme)
          delete index.shapeExprs[oldName]
        })
        doomed.sort((l, r) => r - l).forEach(delme => {
          const id = schema.shapes[delme].id
          if (!nestables[id])
            throw Error('deleting unexpected shape ' + id)
          schema.shapes.splice(delme, 1)
        })
      }
    }
    // console.dir(nestables)
    // console.dir(shapeReferences)
    return nestables

    function noteReference (id, reference) {
      if (!(id in shapeReferences)) {
        shapeReferences[id] = []
      }
      if (reference) {
        shapeReferences[id].push(reference)
      }
    }
  },

  /** @@TODO tests
   *
   */
  getPredicateUsage: function (schema, untyped = {}) {
    const _ShExUtil = this;

    // populate shapeHierarchy
    let shapeHierarchy = Hierarchy.create()
    Object.keys(schema.shapes).forEach(label => {
      let shapeExpr = _ShExUtil.skipDecl(schema.shapes[label])
      if (shapeExpr.type === 'Shape') {
        (shapeExpr.extends || []).forEach(
          superShape => shapeHierarchy.add(superShape, label)
        )
      }
    })
    Object.keys(schema.shapes).forEach(label => {
      if (!(label in shapeHierarchy.parents))
        shapeHierarchy.parents[label] = []
    })

    let predicates = { } // IRI->{ uses: [shapeLabel], commonType: shapeExpr }
    Object.keys(schema.shapes).forEach(shapeLabel => {
      let shapeExpr = _ShExUtil.skipDecl(schema.shapes[shapeLabel])
      if (shapeExpr.type === 'Shape') {
        let tcs = _ShExUtil.simpleTripleConstraints(shapeExpr) || []
        tcs.forEach(tc => {
          let newType = _ShExUtil.getValueType(tc.valueExpr)
          if (!(tc.predicate in predicates)) {
            predicates[tc.predicate] = {
              uses: [shapeLabel],
              commonType: newType,
              polymorphic: false
            }
            if (typeof newType === 'object') {
              untyped[tc.predicate] = {
                shapeLabel,
                predicate: tc.predicate,
                newType,
                references: []
              }
            }
          } else {
            predicates[tc.predicate].uses.push(shapeLabel)
            let curType = predicates[tc.predicate].commonType
            if (typeof curType === 'object' || curType === null) {
              // another use of a predicate with no commonType
              // console.warn(`${shapeLabel} ${tc.predicate}:${newType} uses untypable predicate`)
              untyped[tc.predicate].references.push({ shapeLabel, newType })
            } else if (typeof newType === 'object') {
              // first use of a predicate with no detectable commonType
              predicates[tc.predicate].commonType = null
              untyped[tc.predicate] = {
                shapeLabel,
                predicate: tc.predicate,
                curType,
                newType,
                references: []
              }
            } else if (curType === newType) {
              ; // same type again
            } else if (shapeHierarchy.parents[curType].indexOf(newType) !== -1) {
              predicates[tc.predicate].polymorphic = true; // already covered by current commonType
            } else {
              let idx = shapeHierarchy.parents[newType].indexOf(curType)
              if (idx === -1) {
                let intersection = shapeHierarchy.parents[curType].filter(
                  lab => -1 !== shapeHierarchy.parents[newType].indexOf(lab)
                )
                if (intersection.length === 0) {
                  untyped[tc.predicate] = {
                    shapeLabel,
                    predicate: tc.predicate,
                    curType,
                    newType,
                    references: []
                  }
                  // console.warn(`${shapeLabel} ${tc.predicate} : ${newType} isn\'t related to ${curType}`)
                  predicates[tc.predicate].commonType = null
                } else {
                  predicates[tc.predicate].commonType = intersection[0]
                  predicates[tc.predicate].polymorphic = true
                }
              } else {
                predicates[tc.predicate].commonType = shapeHierarchy.parents[newType][idx]
                predicates[tc.predicate].polymorphic = true
              }
            }
          }
        })
      }
    })
    return predicates
  },

  /** @@TODO tests
   *
   */
  simpleTripleConstraints: function (shape) {
    if (!('expression' in shape)) {
      return []
    }
    if (shape.expression.type === 'TripleConstraint') {
      return [ shape.expression ]
    }
    if (shape.expression.type === 'EachOf' &&
        !(shape.expression.expressions.find(
          expr => expr.type !== 'TripleConstraint'
        ))) {
          return shape.expression.expressions
        }
    throw Error('can\'t (yet) express ' + JSON.stringify(shape))
  },

  skipDecl: function (shapeExpr) {
    return shapeExpr.type === 'ShapeDecl' ? shapeExpr.shapeExpr : shapeExpr
  },

  getValueType: function (valueExpr) {
    if (typeof valueExpr === 'string') { return valueExpr }
    if (valueExpr.reference) { return valueExpr.reference }
    if (valueExpr.nodeKind === 'iri') { return OWL.Thing } // !! push this test to callers
    if (valueExpr.datatype) { return valueExpr.datatype }
    // if (valueExpr.extends && valueExpr.extends.length === 1) { return valueExpr.extends[0] }
    return valueExpr // throw Error('no value type for ' + JSON.stringify(valueExpr))
  },

  /** getDependencies: find which shappes depend on other shapes by inheritance
   * or inclusion.
   * TODO: rewrite in terms of Visitor.
   */
  getDependencies: function (schema, ret) {
    ret = ret || this.BiDiClosure();
    (schema.shapes || []).forEach(function (shape) {
      function _walkShapeExpression (shapeExpr, negated) {
        if (typeof shapeExpr === "string") { // ShapeRef
          ret.add(shape.id, shapeExpr);
        } else if (shapeExpr.type === "ShapeOr" || shapeExpr.type === "ShapeAnd") {
          shapeExpr.shapeExprs.forEach(function (expr) {
            _walkShapeExpression(expr, negated);
          });
        } else if (shapeExpr.type === "ShapeNot") {
          _walkShapeExpression(shapeExpr.shapeExpr, negated ^ 1); // !!! test negation
        } else if (shapeExpr.type === "Shape") {
          _walkShape(shapeExpr, negated);
        } else if (shapeExpr.type === "NodeConstraint") {
          // no impact on dependencies
        } else if (shapeExpr.type === "ShapeExternal") {
        } else
          throw Error("expected Shape{And,Or,Ref,External} or NodeConstraint in " + JSON.stringify(shapeExpr));
      }
      
      function _walkShape (shape, negated) {
        function _walkTripleExpression (tripleExpr, negated) {
          function _exprGroup (exprs, negated) {
            exprs.forEach(function (nested) {
              _walkTripleExpression(nested, negated) // ?? negation allowed?
            });
          }

          function _walkTripleConstraint (tc, negated) {
            if (tc.valueExpr)
              _walkShapeExpression(tc.valueExpr, negated);
            if (negated && ret.inCycle.indexOf(shape.id) !== -1) // illDefined/negatedRefCycle.err
              throw Error("Structural error: " + shape.id + " appears in negated cycle");
          }

          if (typeof tripleExpr === "string") { // Inclusion
            ret.add(shape.id, tripleExpr);
          } else {
            if ("id" in tripleExpr)
              ret.addIn(tripleExpr.id, shape.id)
            if (tripleExpr.type === "TripleConstraint") {
              _walkTripleConstraint(tripleExpr, negated);
            } else if (tripleExpr.type === "OneOf" || tripleExpr.type === "EachOf") {
              _exprGroup(tripleExpr.expressions);
            } else if (tripleExpr.type === "Unique") {
            } else if (tripleExpr.type === "ValueComparison") {
            } else {
              throw Error("expected {TripleConstraint,OneOf,EachOf,Inclusion} in " + tripleExpr);
            }
          }
        }

        if (shape.inherit && shape.inherit.length > 0)
          shape.inherit.forEach(function (i) {
            ret.add(shape.id, i);
          });
        if (shape.expression)
          _walkTripleExpression(shape.expression, negated);
      }
      _walkShapeExpression(shape, 0); // 0 means false for bitwise XOR
    });
    return ret;
  },

  /** partition: create subset of a schema with only desired shapes and
   * their dependencies.
   *
   * @schema: input schema
   * @partition: shape name or array of desired shape names
   * @deps: (optional) dependency tree from getDependencies.
   *        map(shapeLabel -> [shapeLabel])
   */
  partition: function (schema, includes, deps, cantFind) {
    const inputIndex = schema._index || this.index(schema)
    const outputIndex = { shapeExprs: new Map(), tripleExprs: new Map() };
    includes = includes instanceof Array ? includes : [includes];

    // build dependency tree if not passed one
    deps = deps || this.getDependencies(schema);
    cantFind = cantFind || function (what, why) {
      throw new Error("Error: can't find shape " +
                      (why ?
                       why + " dependency " + what :
                       what));
    };
    const partition = {};
    for (let k in schema)
      partition[k] = k === "shapes" ? [] : schema[k];
    includes.forEach(function (i) {
      if (i in outputIndex.shapeExprs) {
        // already got it.
      } else if (i in inputIndex.shapeExprs) {
        const adding = inputIndex.shapeExprs[i];
        partition.shapes.push(adding);
        outputIndex.shapeExprs[adding.id] = adding;
        if (i in deps.needs)
          deps.needs[i].forEach(function (n) {
            // Turn any needed TE into an SE.
            if (n in deps.foundIn)
              n = deps.foundIn[n];

            if (n in outputIndex.shapeExprs) {
            } else if (n in inputIndex.shapeExprs) {
              const needed = inputIndex.shapeExprs[n];
              partition.shapes.push(needed);
              outputIndex.shapeExprs[needed.id] = needed;
            } else
              cantFind(n, i);
          });
      } else {
        cantFind(i, "supplied");
      }
    });
    return partition;
  },


  /** @@TODO flatten: return copy of input schema with all shape and value class
   * references substituted by a copy of their referent.
   *
   * @schema: input schema
   */
  flatten: function (schema, deps, cantFind) {
    const v = this.Visitor();
    return v.visitSchema(schema);
  },

  // @@ put predicateUsage here

  emptySchema: function () {
    return {
      type: "Schema"
    };
  },
  merge: function (left, right, overwrite, inPlace) {
    const ret = inPlace ? left : this.emptySchema();

    function mergeArray (attr) {
      Object.keys(left[attr] || {}).forEach(function (key) {
        if (!(attr in ret))
          ret[attr] = {};
        ret[attr][key] = left[attr][key];
      });
      Object.keys(right[attr] || {}).forEach(function (key) {
        if (!(attr  in left) || !(key in left[attr]) || overwrite) {
          if (!(attr in ret))
            ret[attr] = {};
          ret[attr][key] = right[attr][key];
        }
      });
    }

    function mergeMap (attr) {
      (left[attr] || new Map()).forEach(function (value, key, map) {
        if (!(attr in ret))
          ret[attr] = new Map();
        ret[attr].set(key, left[attr].get(key));
      });
      (right[attr] || new Map()).forEach(function (value, key, map) {
        if (!(attr  in left) || !(left[attr].has(key)) || overwrite) {
          if (!(attr in ret))
            ret[attr] = new Map();
          ret[attr].set(key, right[attr].get(key));
        }
      });
    }

    // base
    if ("_base" in left)
      ret._base = left._base;
    if ("_base" in right)
      if (!("_base" in left) || overwrite)
        ret._base = right._base;

    mergeArray("_prefixes");

    mergeMap("_sourceMap");

    if ("imports" in right)
      if (!("imports" in left) || overwrite)
        ret.imports = right.imports;

    // startActs
    if ("startActs" in left)
      ret.startActs = left.startActs;
    if ("startActs" in right)
      if (!("startActs" in left) || overwrite)
        ret.startActs = right.startActs;

    // start
    if ("start" in left)
      ret.start = left.start;
    if ("start" in right)
      if (!("start" in left) || overwrite)
        ret.start = right.start;

    let lindex = left._index || this.index(left);

    // shapes
    if (!inPlace)
      (left.shapes || []).forEach(function (lshape) {
        if (!("shapes" in ret))
          ret.shapes = [];
        ret.shapes.push(lshape);
      });
    (right.shapes || []).forEach(function (rshape) {
      if (!("shapes"  in left) || !(rshape.id in lindex.shapeExprs) || overwrite) {
        if (!("shapes" in ret))
          ret.shapes = [];
        ret.shapes.push(rshape)
      }
    });

    if (left._index || right._index)
      ret._index = this.index(ret); // inefficient; could build above

    return ret;
  },

  absolutizeResults: function (parsed, base) {
    // !! duplicate of Validation-test.js:84: const referenceResult = parseJSONFile(resultsFile...)
    function mapFunction (k, obj) {
      // resolve relative URLs in results file
      if (["shape", "reference", "node", "subject", "predicate", "object"].indexOf(k) !== -1 &&
          ShExTerm.isIRI(obj[k])) {
        obj[k] = ShExTerm.resolveRelativeIRI(base, obj[k]);
      }}

    function resolveRelativeURLs (obj) {
      Object.keys(obj).forEach(function (k) {
        if (typeof obj[k] === "object") {
          resolveRelativeURLs(obj[k]);
        }
        if (mapFunction) {
          mapFunction(k, obj);
        }
      });
    }
    resolveRelativeURLs(parsed);
    return parsed;
  },

  getProofGraph: function (res, db, dataFactory) {
    function _dive1 (solns) {
      if (solns.type === "NodeConstraintTest") {
      } else if (solns.type === "SolutionList" ||
          solns.type === "ShapeAndResults") {
        solns.solutions.forEach(s => {
          if (s.solution) // no .solution for <S> {}
            _dive1(s.solution);
        });
      } else if (solns.type === "ShapeOrResults") {
        _dive1(solns.solution);
      } else if (solns.type === "ShapeTest") {
        if ("solution" in solns)
          _dive1(solns.solution);
      } else if (solns.type === "OneOfSolutions" ||
                 solns.type === "EachOfSolutions") {
        solns.solutions.forEach(s => {
          _dive1(s);
        });
      } else if (solns.type === "OneOfSolution" ||
                 solns.type === "EachOfSolution") {
        solns.expressions.forEach(s => {
          _dive1(s);
        });
      } else if (solns.type === "TripleConstraintSolutions") {
        solns.solutions.map(s => {
          if (s.type !== "TestedTriple")
            throw Error("unexpected result type: " + s.type);
          const s2 = s;
          if (typeof s2.object === "object")
            s2.object = "\"" + s2.object.value.replace(/"/g, "\\\"") + "\""
            + (s2.object.language ? ("@" + s2.object.language) : 
               s2.object.type ? ("^^" + s2.object.type) :
               "");
          db.addQuad(ShExTerm.externalTriple(s2, dataFactory))
          if ("referenced" in s) {
            _dive1(s.referenced);
          }
        });
      } else {
        throw Error("unexpected expr type "+solns.type+" in " + JSON.stringify(solns));
      }
    }
    _dive1(res);
    return db;
  },

  validateSchema: function (schema) { // obselete, but may need other validations in the future.
    const _ShExUtil = this;
    const visitor = this.Visitor();
    let currentLabel = currentExtra = null;
    let currentNegated = false;
    const dependsOn = { };
    let inTE = false;
    const oldVisitShape = visitor.visitShape;
    const negativeDeps = Hierarchy.create();
    const positiveDeps = Hierarchy.create();
    let index = schema.index || this.index(schema);

    visitor.visitShape = function (shape, label) {
      const lastExtra = currentExtra;
      currentExtra = shape.extra;
      const ret = oldVisitShape.call(visitor, shape, label);
      currentExtra = lastExtra;
      return ret;
    }

    const oldVisitShapeNot = visitor.visitShapeNot;
    visitor.visitShapeNot = function (shapeNot, label) {
      const lastNegated = currentNegated;
      currentNegated ^= true;
      const ret = oldVisitShapeNot.call(visitor, shapeNot, label);
      currentNegated = lastNegated;
      return ret;
    }

    const oldVisitTripleConstraint = visitor.visitTripleConstraint;
    visitor.visitTripleConstraint = function (expr) {
      const lastNegated = currentNegated;
      if (currentExtra && currentExtra.indexOf(expr.predicate) !== -1)
        currentNegated ^= true;
      inTE = true;
      const ret = oldVisitTripleConstraint.call(visitor, expr);
      inTE = false;
      currentNegated = lastNegated;
      return ret;
    };

    const oldVisitShapeRef = visitor.visitShapeRef;
    visitor.visitShapeRef = function (shapeRef) {
      if (!(shapeRef in index.shapeExprs))
        throw firstError(Error("Structural error: reference to " + JSON.stringify(shapeRef) + " not found in schema shape expressions:\n" + dumpKeys(index.shapeExprs) + "."), shapeRef);
      if (!inTE && shapeRef === currentLabel)
        throw firstError(Error("Structural error: circular reference to " + currentLabel + "."), shapeRef);
      (currentNegated ? negativeDeps : positiveDeps).add(currentLabel, shapeRef)
      return oldVisitShapeRef.call(visitor, shapeRef);
    }

    const oldVisitInclusion = visitor.visitInclusion;
    visitor.visitInclusion = function (inclusion) {
      let refd;
      if (!(refd = index.tripleExprs[inclusion]))
        throw firstError(Error("Structural error: included shape " + inclusion + " not found in schema triple expressions:\n" + dumpKeys(index.tripleExprs) + "."), inclusion);
      // if (refd.type !== "Shape")
      //   throw Error("Structural error: " + inclusion + " is not a simple shape.");
      return oldVisitInclusion.call(visitor, inclusion);
    };

    (schema.shapes || []).forEach(function (shape) {
      currentLabel = shape.id;
      visitor.visitShapeExpr(shape, shape.id);
    });
    let circs = Object.keys(negativeDeps.children).filter(
      k => negativeDeps.children[k].filter(
        k2 => k2 in negativeDeps.children && negativeDeps.children[k2].indexOf(k) !== -1
          || k2 in positiveDeps.children && positiveDeps.children[k2].indexOf(k) !== -1
      ).length > 0
    );
    if (circs.length)
      throw firstError(Error("Structural error: circular negative dependencies on " + circs.join(',') + "."), circs[0]);

    function dumpKeys (obj) {
      return obj ? Object.keys(obj).map(
        u => u.substr(0, 2) === '_:' ? u : '<' + u + '>'
      ).join("\n        ") : '- none defined -'
    }

    function firstError (e, obj) {
      if ("_sourceMap" in schema)
        e.location = (schema._sourceMap.get(obj) || [undefined])[0];
      return e;
    }
  },

  /** isWellDefined: assert that schema is well-defined.
   *
   * @schema: input schema
   * @@TODO
   */
  isWellDefined: function (schema) {
    this.validateSchema(schema);
    // const deps = this.getDependencies(schema);
    return schema;
  },

  walkVal: function (val, cb) {
    const _ShExUtil = this;
    if (val.type === "NodeConstraintTest") {
      return null;
    } else if (val.type === "ShapeTest") {
      return "solution" in val ? _ShExUtil.walkVal(val.solution, cb) : null;
    } else if (val.type === "ShapeOrResults") {
      return _ShExUtil.walkVal(val.solution || val.solutions, cb);
    } else if (val.type === "ShapeAndResults") {
      return val.solutions.reduce((ret, exp) => {
        const n = _ShExUtil.walkVal(exp, cb);
        if (n)
          Object.keys(n).forEach(k => {
            if (k in ret)
              ret[k] = ret[k].concat(n[k]);
            else
              ret[k] = n[k];
          })
        return ret;
      }, {});
    } else if (val.type === "EachOfSolutions" || val.type === "OneOfSolutions") {
      return val.solutions.reduce((ret, sln) => {
        sln.expressions.forEach(exp => {
          const n = _ShExUtil.walkVal(exp, cb);
          if (n)
            Object.keys(n).forEach(k => {
              if (k in ret)
                ret[k] = ret[k].concat(n[k]);
              else
                ret[k] = n[k];
            })
        });
        return ret;
      }, {});
    } else if (val.type === "OneOfSolutions") {
      return val.solutions.reduce((ret, sln) => {
        Object.assign(ret, _ShExUtil.walkVal(sln, cb));
        return ret;
      }, {});
    } else if (val.type === "TripleConstraintSolutions") {
      if ("solutions" in val) {
        const ret = {};
        const vals = [];
        ret[val.predicate] = vals;
        val.solutions.forEach(sln => {
          const toAdd = [];
          if (chaseList(sln.referenced, toAdd)) {
            [].push.apply(vals, toAdd);
          } else {
            const newElt = cb(sln);
            if ("referenced" in sln) {
              const t = _ShExUtil.walkVal(sln.referenced, cb);
              if (t)
                newElt.nested = t;
            }
            vals.push(newElt);
          }
          function chaseList (li) {
            if (!li) return false;
            if (li.node === RDF.nil) return true;
            if ("solution" in li && "solutions" in li.solution &&
                li.solution.solutions.length === 1 &&
                "expressions" in li.solution.solutions[0] &&
                li.solution.solutions[0].expressions.length === 2 &&
                "predicate" in li.solution.solutions[0].expressions[0] &&
                li.solution.solutions[0].expressions[0].predicate === RDF.first &&
                li.solution.solutions[0].expressions[1].predicate === RDF.rest) {
              const expressions = li.solution.solutions[0].expressions;
              const ent = expressions[0];
              const rest = expressions[1].solutions[0];
              const member = ent.solutions[0];
              const newElt = cb(member);
              if ("referenced" in member) {
                const t = _ShExUtil.walkVal(member.referenced, cb);
                if (t)
                  newElt.nested = t;
              }
              vals.push(newElt);
              return rest.object === RDF.nil ?
                true :
                chaseList(rest.referenced.type === "ShapeOrResults" // heuristic for `nil  OR @<list>` idiom
                          ? rest.referenced.solution
                          : rest.referenced);
            }
          }
        });
        return vals.length ? ret : null;
      } else {
        return null;
      }
    } else if (val.type === "Recursion") {
      return null;
    } else {
      // console.log(val);
      throw Error("unknown shapeExpression type in " + JSON.stringify(val));
    }
    return val;
  },

  /**
   * Convert val results to a property tree.
   * @exports
   * @returns {@code {p1:[{p2: v2},{p3: v3}]}}
   */
  valToValues: function (val) {
    return this.walkVal (val, function (sln) {
      return { ldterm: sln.object };
    });
  },

  valToExtension: function (val, lookfor) {
    const map = this.walkVal (val, function (sln) {
      return { extensions: sln.extensions };
    });
    function extensions (obj) {
      const list = [];
      let crushed = {};
      function crush (elt) {
        if (crushed === null)
          return elt;
        if (elt.constructor === Array) {
          crushed = null;
          return elt;
        }
        for (k in elt) {
          if (k in crushed) {
            crushed = null
            return elt;
          }
          crushed[k] = ldify(elt[k]);
        }
        return elt;
      }
      for (let k in obj) {
        if (k === "extensions") {
          if (obj[k])
            list.push(crush(ldify(obj[k][lookfor])));
        } else if (k === "nested") {
          const nested = extensions(obj[k]);
          if (nested.constructor === Array)
            nested.forEach(crush);
          else
            crush(nested);
          list.push(nested);
        } else {
          list.push(crush(extensions(obj[k])));
        }
      }
      return list.length === 1 ? list[0] :
        crushed ? crushed :
        list;
    }
    return extensions(map);
  },

  valuesToSchema: function (values) {
    // console.log(JSON.stringify(values, null, "  "));
    const v = values;
    const t = values[RDF.type][0].ldterm;
    if (t === SX.Schema) {
      /* Schema { "@context":"http://www.w3.org/ns/shex.jsonld"
       *           startActs:[SemAct+]? start:(shapeExpr|labeledShapeExpr)?
       *           shapes:[labeledShapeExpr+]? }
       */
      const ret = {
        "@context": "http://www.w3.org/ns/shex.jsonld",
        type: "Schema"
      }
      if (SX.startActs in v)
        ret.startActs = v[SX.startActs].map(e => {
          const ret = {
            type: "SemAct",
            name: e.nested[SX.name][0].ldterm
          };
          if (SX.code in e.nested)
            ret.code = e.nested[SX.code][0].ldterm.value;
          return ret;
        });
      if (SX.imports in v)
        ret.imports = v[SX.imports].map(e => {
          return e.ldterm;
        });
      if (values[SX.start])
        ret.start = extend({id: values[SX.start][0].ldterm}, shapeExpr(values[SX.start][0].nested));
      const shapes = values[SX.shapes];
      if (shapes) {
        ret.shapes = shapes.map(v => {
          return extend({id: v.ldterm}, shapeExpr(v.nested));
        });
      }
      // console.log(ret);
      return ret;
    } else {
      throw Error("unknown schema type in " + JSON.stringify(values));
    }
    function findType (v, elts, f) {
      const t = v[RDF.type][0].ldterm.substr(SX._namespace.length);
      const elt = elts[t];
      if (!elt)
        return Missed;
      if (elt.nary) {
        const ret = {
          type: t,
        };
        ret[elt.prop] = v[SX[elt.prop]].map(e => {
          return valueOf(e);
        });
        return ret;
      } else {
        const ret = {
          type: t
        };
        if (elt.prop) {
          ret[elt.prop] = valueOf(v[SX[elt.prop]][0]);
        }
        return ret;
      }

      function valueOf (x) {
        return elt.expr && "nested" in x ? extend({ id: x.ldterm, }, f(x.nested)) : x.ldterm;
      }
    }
    function shapeExpr (v) {
      // shapeExpr = ShapeOr | ShapeAnd | ShapeNot | NodeConstraint | Shape | ShapeRef | ShapeExternal;
      const elts = { "ShapeAnd"     : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeOr"      : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeNot"     : { nary: false, expr: true , prop: "shapeExpr"  },
                   "ShapeRef"     : { nary: false, expr: false, prop: "reference"  },
                   "ShapeExternal": { nary: false, expr: false, prop: null         } };
      const ret = findType(v, elts, shapeExpr);
      if (ret !== Missed)
        return ret;

      const t = v[RDF.type][0].ldterm;
      if (t === SX.Shape) {
        const ret = { type: "Shape" };
        ["closed"].forEach(a => {
          if (SX[a] in v)
            ret[a] = !!v[SX[a]][0].ldterm.value;
        });
        if (SX.extra in v)
          ret.extra = v[SX.extra].map(e => { return e.ldterm; });
        if (SX.expression in v) {
          ret.expression =
            "nested" in v[SX.expression][0] ?
            extend({id: v[SX.expression][0].ldterm}, tripleExpr(v[SX.expression][0].nested)) :
            v[SX.expression][0].ldterm;
        }
        if (SX.annotation in v)
          ret.annotations = v[SX.annotation].map(e => {
            return {
              type: "Annotation",
              predicate: e.nested[SX.predicate][0].ldterm,
              object: e.nested[SX.object][0].ldterm
            };
          });
        if (SX.semActs in v)
          ret.semActs = v[SX.semActs].map(e => {
            const ret = {
              type: "SemAct",
              name: e.nested[SX.name][0].ldterm
            };
            if (SX.code in e.nested)
              ret.code = e.nested[SX.code][0].ldterm.value;
            return ret;
          });
        return ret;
      } else if (t === SX.NodeConstraint) {
        const ret = { type: "NodeConstraint" };
        if (SX.values in v)
          ret.values = v[SX.values].map(v1 => { return objectValue(v1); });
        if (SX.nodeKind in v)
          ret.nodeKind = v[SX.nodeKind][0].ldterm.substr(SX._namespace.length);
        ["length", "minlength", "maxlength", "mininclusive", "maxinclusive", "minexclusive", "maxexclusive", "totaldigits", "fractiondigits"].forEach(a => {
          if (SX[a] in v)
            ret[a] = parseFloat(v[SX[a]][0].ldterm.value);
        });
        if (SX.pattern in v)
          ret.pattern = v[SX.pattern][0].ldterm.value;
        if (SX.flags in v)
          ret.flags = v[SX.flags][0].ldterm.value;
        if (SX.datatype in v)
          ret.datatype = v[SX.datatype][0].ldterm;
        return ret;
      } else {
        throw Error("unknown shapeExpr type in " + JSON.stringify(v));
      }

    }

    function objectValue (v, expectString) {
      if ("nested" in v) {
        const t = v.nested[RDF.type][0].ldterm;
        if ([SX.IriStem, SX.LiteralStem, SX.LanguageStem].indexOf(t) !== -1) {
          const ldterm = v.nested[SX.stem][0].ldterm.value;
          return {
            type: t.substr(SX._namespace.length),
            stem: ldterm
          };
        } else if ([SX.Language].indexOf(t) !== -1) {
          return {
            type: "Language",
            languageTag: v.nested[SX.languageTag][0].ldterm.value
          };
        } else if ([SX.IriStemRange, SX.LiteralStemRange, SX.LanguageStemRange].indexOf(t) !== -1) {
          const st = v.nested[SX.stem][0];
          let stem = st;
          if (typeof st === "object") {
            if (typeof st.ldterm === "object") {
              stem = st.ldterm;
            } else if (st.ldterm.startsWith("_:")) {
              stem = { type: "Wildcard" };
            }
          }
          const ret = {
            type: t.substr(SX._namespace.length),
            stem: stem.type !== "Wildcard" ? stem.value : stem
          };
          if (SX.exclusion in v.nested) {
            // IriStemRange:
            // * [{"ldterm":"http://a.example/v1"},{"ldterm":"http://a.example/v3"}] <-- no value
            // * [{"ldterm":"_:b836","nested":{a:[{"ldterm":sx:IriStem}],
            //                                 sx:stem:[{"ldterm":{"value":"http://a.example/v1"}}]}},
            //    {"ldterm":"_:b838","nested":{a:[{"ldterm":sx:IriStem}],
            //                                 sx:stem:[{"ldterm":{"value":"http://a.example/v3"}}]}}]

            // LiteralStemRange:
            // * [{"ldterm":{"value":"v1"}},{"ldterm":{"value":"v3"}}]
            // * [{"ldterm":"_:b866","nested":{a:[{"ldterm":sx:LiteralStem}],
            //                                 sx:stem:[{"ldterm":{"value":"v1"}}]}},
            //    {"ldterm":"_:b868","nested":{a:[{"ldterm":sx:LiteralStem}],
            //                                 sx:stem:[{"ldterm":{"value":"v3"}}]}}]

            // LanguageStemRange:
            // * [{"ldterm":{"value":"fr-be"}},{"ldterm":{"value":"fr-ch"}}]
            // * [{"ldterm":"_:b851","nested":{a:[{"ldterm":sx:LanguageStem}],
            //                                 sx:stem:[{"ldterm":{"value":"fr-be"}}]}},
            //    {"ldterm":"_:b853","nested":{a:[{"ldterm":sx:LanguageStem}],
            //                                 sx:stem:[{"ldterm":{"value":"fr-ch"}}]}}]
            ret.exclusions = v.nested[SX.exclusion].map(v1 => {
              return objectValue(v1, t !== SX.IriStemRange);
            });
          }
          return ret;
        } else {
          throw Error("unknown objectValue type in " + JSON.stringify(v));
        }
      } else {
        return expectString ? v.ldterm.value : v.ldterm;
      }
    }

    function tripleExpr (v) {
      // tripleExpr = EachOf | OneOf | TripleConstraint | Inclusion ;
      const elts = { "EachOf"   : { nary: true , expr: true , prop: "expressions" },
                   "OneOf"    : { nary: true , expr: true , prop: "expressions" },
                   "Inclusion": { nary: false, expr: false, prop: "include"     } };
      const ret = findType(v, elts, tripleExpr);
      if (ret !== Missed) {
        minMaxAnnotSemActs(v, ret);
        return ret;
      }

      const t = v[RDF.type][0].ldterm;
      if (t === SX.TripleConstraint) {
        const ret = {
          type: "TripleConstraint",
          predicate: v[SX.predicate][0].ldterm
        };
        ["inverse"].forEach(a => {
          if (SX[a] in v)
            ret[a] = !!v[SX[a]][0].ldterm.value;
        });
        if (SX.valueExpr in v)
          ret.valueExpr = extend({id: v[SX.valueExpr][0].ldterm}, "nested" in v[SX.valueExpr][0] ? shapeExpr(v[SX.valueExpr][0].nested) : {});
        minMaxAnnotSemActs(v, ret);
        return ret;
      } else {
        throw Error("unknown tripleExpr type in " + JSON.stringify(v));
      }
    }
    function minMaxAnnotSemActs (v, ret) {
      if (SX.min in v)
        ret.min = parseInt(v[SX.min][0].ldterm.value);
      if (SX.max in v) {
        ret.max = parseInt(v[SX.max][0].ldterm.value);
        if (isNaN(ret.max))
          ret.max = UNBOUNDED;
      }
      if (SX.annotation in v)
        ret.annotations = v[SX.annotation].map(e => {
          return {
            type: "Annotation",
            predicate: e.nested[SX.predicate][0].ldterm,
            object: e.nested[SX.object][0].ldterm
          };
        });
      if (SX.semActs in v)
        ret.semActs = v[SX.semActs].map(e => {
          const ret = {
            type: "SemAct",
            name: e.nested[SX.name][0].ldterm
          };
          if (SX.code in e.nested)
            ret.code = e.nested[SX.code][0].ldterm.value;
          return ret;
        });
      return ret;
    }
  },

  valToSimple: function (val) {
    const _ShExUtil = this;
    function _join (list) {
      return list.reduce((ret, elt) => {
        Object.keys(elt).forEach(k => {
          if (k in ret) {
            ret[k] = Array.from(new Set(ret[k].concat(elt[k])));
          } else {
            ret[k] = elt[k];
          }
        });
        return ret;
      }, {});
    }
    if (val.type === "TripleConstraintSolutions") {
      if ("solutions" in val) {
        return val.solutions.reduce((ret, sln) => {
          if (!("referenced" in sln))
            return {};
          const toAdd = {};
          if (chaseList(sln.referenced, toAdd)) {
            return _join(ret, toAdd);
          } else {
            return _join(ret, _ShExUtil.valToSimple(sln.referenced));
          }
          function chaseList (li) {
            if (!li) return false;
            if (li.node === RDF.nil) return true;
            if ("solution" in li && "solutions" in li.solution &&
                li.solution.solutions.length === 1 &&
                "expressions" in li.solution.solutions[0] &&
                li.solution.solutions[0].expressions.length === 2 &&
                "predicate" in li.solution.solutions[0].expressions[0] &&
                li.solution.solutions[0].expressions[0].predicate === RDF.first &&
                li.solution.solutions[0].expressions[1].predicate === RDF.rest) {
              const expressions = li.solution.solutions[0].expressions;
              const ent = expressions[0];
              const rest = expressions[1].solutions[0];
              const member = ent.solutions[0];
              const newElt = { ldterm: member.object };
              if ("referenced" in member) {
                const t = _ShExUtil.valToSimple(member.referenced);
                if (t)
                  newElt.nested = t;
              }
              toAdd = _join(toAdd, newElt);
              return rest.object === RDF.nil ?
                true :
                chaseList(rest.referenced.type === "ShapeOrResults" // heuristic for `nil  OR @<list>` idiom
                          ? rest.referenced.solution
                          : rest.referenced);
            }
          }
        }, []);
      } else {
        return [];
      }
    } else if (["TripleConstraintSolutions"].indexOf(val.type) !== -1) {
      return {  };
    } else if (val.type === "NodeConstraintTest") {
      const thisNode = {  };
      thisNode[n3ify(val.node)] = [val.shape];
      return thisNode;
    } else if (val.type === "ShapeTest") {
      const thisNode = {  };
      thisNode[n3ify(val.node)] = [val.shape];
      return "solution" in val ? _join([thisNode].concat(_ShExUtil.valToSimple(val.solution))) : thisNode;
    } else if (val.type === "Recursion") {
      return {  };
    } else if ("solutions" in val) {
      // ["SolutionList", "EachOfSolutions", "OneOfSolutions", "ShapeAndResults", "ShapeOrResults"].indexOf(val.type) !== -1
      return _join(val.solutions.map(sln => {
        return _ShExUtil.valToSimple(sln);
      }));
    } else if ("expressions" in val) {
      return _join(val.expressions.map(sln => {
        return _ShExUtil.valToSimple(sln);
      }));
    } else {
      // console.log(val);
      throw Error("unknown shapeExpression type in " + JSON.stringify(val));
    }
    return val;
  },

  simpleToShapeMap: function (x) {
    return Object.keys(x).reduce((ret, k) => {
      x[k].forEach(s => {
        ret.push({node: k, shape: s });
      });
      return ret;
    }, []);
  },

  absolutizeShapeMap: function (parsed, base) {
    return parsed.map(elt => {
      return Object.assign(elt, {
        node: ShExTerm.resolveRelativeIRI(base, elt.node),
        shape: ShExTerm.resolveRelativeIRI(base, elt.shape)
      });
    });
  },

  errsToSimple: function (val, node, shape) {
    const _ShExUtil = this;
    if (val.type === "FailureList") {
      return val.errors.reduce((ret, e) => {
        return ret.concat(_ShExUtil.errsToSimple(e));
      }, []);
    } else if (val.type === "Failure") {
      return ["validating " + val.node + " as " + val.shape + ":"].concat(errorList(val.errors).reduce((ret, e) => {
        const nested = _ShExUtil.errsToSimple(e).map(s => "  " + s);
        return ret.length > 0 ? ret.concat(["  OR"]).concat(nested) : nested.map(s => "  " + s);
      }, []));
    } else if (val.type === "TypeMismatch") {
      const nested = val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
      return ["validating " + n3ify(val.triple.object) + ":"].concat(nested);
    } else if (val.type === "ShapeAndFailure") {
      return val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
    } else if (val.type === "ShapeOrFailure") {
      return val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat(" OR " + (typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)));
          }, []) :
          " OR " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
    } else if (val.type === "ShapeNotFailure") {
      return ["Node " + val.errors.node + " expected to NOT pass " + val.errors.shape];
    } else if (val.type === "ExcessTripleViolation") {
      return ["validating " + n3ify(val.triple.object) + ": exceeds cardinality"];
    } else if (val.type === "ClosedShapeViolation") {
      return ["ClosedShapeError: unexpected: {"].concat(
        val.unexpectedTriples.map(t => {
          return "  " + t.subject + " " + t.predicate + " " + n3ify(t.object) + " ."
        })
      ).concat(["}"]);
    } else if (val.type === "NodeConstraintViolation") {
      const w = __webpack_require__(11)();
      w._write(w._writeNodeConstraint(val.shapeExpr).join(""));
      let txt;
      w.end((err, res) => {
        txt = res;
      });
      return ["NodeConstraintError: expected to match " + txt];
    } else if (val.type === "MissingProperty") {
      return ["Missing property: " + val.property];
    } else if (val.type === "NegatedProperty") {
      return ["Unexpected property: " + val.property];
    } else if (val.constructor === Array) {debugger;
      return val.reduce((ret, e) => {
        const nested = _ShExUtil.errsToSimple(e).map(s => "  " + s);
        return ret.length ? ret.concat(["AND"]).concat(nested) : nested;
      }, []);
    } else if (val.type === "ValueComparisonFailure") {
      return ["ValueComparisonFailure: expected " + val.left + val.comparator + val.right];
    } else if (val.type === "SemActFailure") {
      const nested = val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _ShExUtil.errsToSimple(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _ShExUtil.errsToSimple(val.errors));
      return ["rejected by semantic action:"].concat(nested);
    } else if (val.type === "SemActViolation") {
      return [val.message];
    } else if (val.type === "BooleanSemActFailure") {
      return ["Failed evaluating " + val.code + " on context " + JSON.stringify(val.ctx)];
    } else {
      debugger; // console.log(val);
      throw Error("unknown shapeExpression type in " + JSON.stringify(val));
    }
    function errorList (errors) {
      return errors.reduce(function (acc, e) {
        const attrs = Object.keys(e);
        return acc.concat(
          (attrs.length === 1 && attrs[0] === "errors")
            ? errorList(e.errors)
            : e);
      }, []);
    }
  },

  resolveRelativeIRI: ShExTerm.resolveRelativeIRI,

  resolvePrefixedIRI: function (prefixedIri, prefixes) {
    const colon = prefixedIri.indexOf(":");
    if (colon === -1)
      return null;
    const prefix = prefixes[prefixedIri.substr(0, colon)];
    return prefix === undefined ? null : prefix + prefixedIri.substr(colon+1);
  },

  parsePassedNode: function (passedValue, meta, deflt, known, reportUnknown) {
    if (passedValue === undefined || passedValue.length === 0)
      return known && known(meta.base) ? meta.base : deflt ? deflt() : this.NotSupplied;
    if (passedValue[0] === "_" && passedValue[1] === ":")
      return passedValue;
    if (passedValue[0] === "\"") {
      const m = passedValue.match(/^"((?:[^"\\]|\\")*)"(?:@(.+)|\^\^(?:<(.*)>|([^:]*):(.*)))?$/);
      if (!m)
        throw Error("malformed literal: " + passedValue);
      const lex = m[1], lang = m[2], rel = m[3], pre = m[4], local = m[5];
      // Turn the literal into an N3.js atom.
      const quoted = "\""+lex+"\"";
      if (lang !== undefined)
        return quoted + "@" + lang;
      if (pre !== undefined) {
        if (!(pre in meta.prefixes))
          throw Error("error parsing node "+passedValue+" no prefix for \"" + pre + "\"");
        return quoted + "^^" + meta.prefixes[pre] + local;
      }
      if (rel !== undefined)
        return quoted + "^^" + ShExTerm.resolveRelativeIRI(meta.base, rel);
      return quoted;
    }
    if (!meta)
      return known(passedValue) ? passedValue : this.UnknownIRI;
    const relIRI = passedValue[0] === "<" && passedValue[passedValue.length-1] === ">";
    if (relIRI)
      passedValue = passedValue.substr(1, passedValue.length-2);
    const t = ShExTerm.resolveRelativeIRI(meta.base || "", passedValue); // fall back to base-less mode
    if (known(t))
      return t;
    if (!relIRI) {
      const t2 = this.resolvePrefixedIRI(passedValue, meta.prefixes);
      if (t2 !== null && known(t2))
        return t2;
    }
    return reportUnknown ? reportUnknown(t) : this.UnknownIRI;
  },

  executeQueryPromise: function (query, endpoint) {
    let rows;

    const queryURL = endpoint + "?query=" + encodeURIComponent(query);
    return fetch(queryURL, {
      headers: {
        'Accept': 'application/sparql-results+json'
      }}).then(resp => resp.json()).then(t => {
        const selects = t.head.vars;
        return t.results.bindings.map(row => {
          return selects.map(sel => {
            const elt = row[sel];
            switch (elt.type) {
            case "uri": return elt.value;
            case "bnode": return "_:" + elt.value;
            case "literal":
              const datatype = elt.datatype;
              const lang = elt["xml:lang"];
              return "\"" + elt.value + "\"" + (
                datatype ? "^^" + datatype :
                  lang ? "@" + lang :
                  "");
            default: throw "unknown XML results type: " + elt.prop("tagName");
            }
            return row[sel];
          })
        });
      })// .then(x => new Promise(resolve => setTimeout(() => resolve(x), 1000)));
  },

  executeQuery: function (query, endpoint) {
    let rows;
    const queryURL = endpoint + "?query=" + encodeURIComponent(query);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", queryURL, false);
    xhr.setRequestHeader('Accept', 'application/sparql-results+json');
    xhr.send();
    // const selectsBlock = query.match(/SELECT\s*(.*?)\s*{/)[1];
    // const selects = selectsBlock.match(/\?[^\s?]+/g);
    const t = JSON.parse(xhr.responseText);
    const selects = t.head.vars;
    return t.results.bindings.map(row => {
      return selects.map(sel => {
        const elt = row[sel];
        switch (elt.type) {
        case "uri": return elt.value;
        case "bnode": return "_:" + elt.value;
        case "literal":
          const datatype = elt.datatype;
          const lang = elt["xml:lang"];
          return "\"" + elt.value + "\"" + (
            datatype ? "^^" + datatype :
              lang ? "@" + lang :
              "");
        default: throw "unknown XML results type: " + elt.prop("tagName");
        }
        return row[sel];
      })
    });

/* TO ADD? XML results format parsed with jquery:
        $(data).find("sparql > results > result").
          each((_, row) => {
            rows.push($(row).find("binding > *:nth-child(1)").
              map((idx, elt) => {
                elt = $(elt);
                const text = elt.text();
                switch (elt.prop("tagName")) {
                case "uri": return text;
                case "bnode": return "_:" + text;
                case "literal":
                  const datatype = elt.attr("datatype");
                  const lang = elt.attr("xml:lang");
                  return "\"" + text + "\"" + (
                    datatype ? "^^" + datatype :
                    lang ? "@" + lang :
                      "");
                default: throw "unknown XML results type: " + elt.prop("tagName");
                }
              }).get());
          });
*/
  },

  rdfjsDB: function (db, queryTracker) {

    function getSubjects () { return db.getSubjects().map(ShExTerm.internalTerm); }
    function getPredicates () { return db.getPredicates().map(ShExTerm.internalTerm); }
    function getObjects () { return db.getObjects().map(ShExTerm.internalTerm); }
    function getQuads () { return db.getQuads.apply(db, arguments).map(ShExTerm.internalTriple); }

    function getNeighborhood (point, shapeLabel/*, shape */) {
      // I'm guessing a local DB doesn't benefit from shape optimization.
      let startTime;
      if (queryTracker) {
        startTime = new Date();
        queryTracker.start(false, point, shapeLabel);
      }
      const outgoing = db.getQuads(point, null, null, null).map(ShExTerm.internalTriple);
      if (queryTracker) {
        const time = new Date();
        queryTracker.end(outgoing, time - startTime);
        startTime = time;
      }
      if (queryTracker) {
        queryTracker.start(true, point, shapeLabel);
      }
      const incoming = db.getQuads(null, null, point, null).map(ShExTerm.internalTriple);
      if (queryTracker) {
        queryTracker.end(incoming, new Date() - startTime);
      }
      return {
        outgoing: outgoing,
        incoming: incoming
      };
    }

    return {
      // size: db.size,
      getNeighborhood: getNeighborhood,
      getSubjects: getSubjects,
      getPredicates: getPredicates,
      getObjects: getObjects,
      getQuads: getQuads,
      get size() { return db.size; },
      // getQuads: function (s, p, o, graph, shapeLabel) {
      //   // console.log(Error(s + p + o).stack)
      //   if (queryTracker)
      //     queryTracker.start(!!s, s ? s : o, shapeLabel);
      //   const quads = db.getQuads(s, p, o, graph)
      //   if (queryTracker)
      //     queryTracker.end(quads, new Date() - startTime);
      //   return quads;
      // }
    }
  },

  NotSupplied: "-- not supplied --", UnknownIRI: "-- not found --",

  /**
   * unescape numerics and allowed single-character escapes.
   * throws: if there are any unallowed sequences
   */
  unescapeText: function (string, replacements) {
    const regex = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g;
    try {
      string = string.replace(regex, function (sequence, unicode4, unicode8, escapedChar) {
        let charCode;
        if (unicode4) {
          charCode = parseInt(unicode4, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          return String.fromCharCode(charCode);
        }
        else if (unicode8) {
          charCode = parseInt(unicode8, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          if (charCode < 0xFFFF) return String.fromCharCode(charCode);
          return String.fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
        }
        else {
          const replacement = replacements[escapedChar];
          if (!replacement) throw new Error("no replacement found for '" + escapedChar + "'");
          return replacement;
        }
      });
      return string;
    }
    catch (error) { console.warn(error); return ''; }
  },

};

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

// Add the ShExUtil functions to the given object or its prototype
function AddShExUtil(parent, toPrototype) {
  for (let name in ShExUtil)
    if (!toPrototype)
      parent[name] = ShExUtil[name];
    else
      parent.prototype[name] = ApplyToThis(ShExUtil[name]);

  return parent;
}

// Returns a function that applies `f` to the `this` object
function ApplyToThis(f) {
  return function (a) { return f(this, a); };
}

return AddShExUtil(AddShExUtil);
})();

if (true)
  module.exports = ShExUtilCjsModule; // node environment


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = { sep: '/' }
try {
  path = __webpack_require__(1)
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = __webpack_require__(29)

var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]'

// * => any number of characters
var star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!')

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {}
  b = b || {}
  var t = {}
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
}

function minimatch (p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === ''

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}
  pattern = pattern.trim()

  // windows support: need to use /, not \
  if (path.sep !== '/') {
    pattern = pattern.split(path.sep).join('/')
  }

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function () {}

Minimatch.prototype.make = make
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = console.error

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
  var negate = false
  var options = this.options
  var negateOffset = 0

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate
    negateOffset++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
}

Minimatch.prototype.braceExpand = braceExpand

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options
    } else {
      options = {}
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern')
  }

  if (options.nobrace ||
    !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long')
  }

  var options = this.options

  // shortcuts
  if (!options.noglobstar && pattern === '**') return GLOBSTAR
  if (pattern === '') return ''

  var re = ''
  var hasMagic = !!options.nocase
  var escaping = false
  // ? => one single character
  var patternListStack = []
  var negativeLists = []
  var stateChar
  var inClass = false
  var reClassStart = -1
  var classStart = -1
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)'
  var self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star
          hasMagic = true
        break
        case '?':
          re += qmark
          hasMagic = true
        break
        default:
          re += '\\' + stateChar
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c
      escaping = false
      continue
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case '\\':
        clearStateChar()
        escaping = true
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === '!' && i === classStart + 1) c = '^'
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
      continue

      case '(':
        if (inClass) {
          re += '('
          continue
        }

        if (!stateChar) {
          re += '\\('
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:'
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)'
          continue
        }

        clearStateChar()
        hasMagic = true
        var pl = patternListStack.pop()
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close
        if (pl.type === '!') {
          negativeLists.push(pl)
        }
        pl.reEnd = re.length
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|'
          escaping = false
          continue
        }

        clearStateChar()
        re += '|'
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += '\\' + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c
          escaping = false
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i)
          try {
            RegExp('[' + cs + ']')
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE)
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]'
            hasMagic = hasMagic || sp[1]
            inClass = false
            continue
          }
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\'
        }

        re += c

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1)
    sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + '\\[' + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length)
    this.debug('setting tail', re, pl)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\'
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    })

    this.debug('tail=%j\n   %s', tail, tail, pl, re)
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart) + t + '\\(' + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += '\\\\'
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(': addPatternStart = true
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n]

    var nlBefore = re.slice(0, nl.reStart)
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd)
    var nlAfter = re.slice(nl.reEnd)

    nlLast += nlAfter

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1
    var cleanAfter = nlAfter
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
    }
    nlAfter = cleanAfter

    var dollar = ''
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$'
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast
    re = newRe
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re
  }

  if (addPatternStart) {
    re = patternStart + re
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : ''
  try {
    var regExp = new RegExp('^' + re + '$', flags)
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) {
    this.regexp = false
    return this.regexp
  }
  var options = this.options

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot
  var flags = options.nocase ? 'i' : ''

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|')

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$'

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$'

  try {
    this.regexp = new RegExp(re, flags)
  } catch (ex) {
    this.regexp = false
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = match
function match (f, partial) {
  this.debug('match', f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options

  // windows: need to use /, not \
  if (path.sep !== '/') {
    f = f.split(path.sep).join('/')
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, 'split', f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, 'set', set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename
  var i
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i]
    var file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern })

  this.debug('matchOne', file.length, pattern.length)

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop')
    var p = pattern[pi]
    var f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
      var pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr)
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr++
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase()
      } else {
        hit = f === p
      }
      this.debug('string match', p, f, hit)
    } else {
      hit = f.match(p)
      this.debug('pattern match', p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '')
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error('wtf?')
}

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(36);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(37);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb, null, ret) },
            function(rej) { process.nextTick(callbackifyOnRejected, rej, cb) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

function posix(path) {
	return path.charAt(0) === '/';
}

function win32(path) {
	// https://github.com/nodejs/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
	var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
	var result = splitDeviceRe.exec(path);
	var device = result[1] || '';
	var isUnc = Boolean(device && device.charAt(1) !== ':');

	// UNC paths are always absolute
	return Boolean(result[2] || isUnc);
}

module.exports = process.platform === 'win32' ? win32 : posix;
module.exports.posix = posix;
module.exports.win32 = win32;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * Status: Early implementation
 *
 * TODO:
 *   testing.
 */

const ShapeMapSymbols = (function () {
  return {
    focus: { term: "FOCUS" },
    start: { term: "START" },
    wildcard: { term: "WILDCARD" },
  }
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShapeMapSymbols;


/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {


function ShExVisitor () {

    function isTerm (t) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }

  function isShapeRef (expr) {
    return typeof expr === "string" // test for JSON-LD @ID
  }
  let isInclusion = isShapeRef;

  // function expect (l, r) { var ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
  var _ShExUtil = this;
  function visitMap (map, val) {
    var ret = {};
    Object.keys(map).forEach(function (item) {
      ret[item] = val(map[item]);
    });
    return ret;
  }
  var r = {
    runtimeError: function (e) {
      throw e;
    },

    visitSchema: function (schema) {
      var ret = { type: "Schema" };
      _expect(schema, "type", "Schema");
      this._maybeSet(schema, ret, "Schema",
                     ["@context", "prefixes", "base", "imports", "startActs", "start", "shapes"],
                     ["_base", "_prefixes", "_index", "_sourceMap"]
                    );
      return ret;
    },

    visitPrefixes: function (prefixes) {
      return prefixes === undefined ?
        undefined :
        visitMap(prefixes, function (val) {
          return val;
        });
    },

    visitIRI: function (i) {
      return i;
    },

    visitImports: function (imports) {
      var _Visitor = this;
      return imports.map(function (imp) {
        return _Visitor.visitIRI(imp);
      });
    },

    visitStartActs: function (startActs) {
      var _Visitor = this;
      return startActs === undefined ?
        undefined :
        startActs.map(function (act) {
          return _Visitor.visitSemAct(act);
        });
    },
    visitSemActs: function (semActs) {
      var _Visitor = this;
      if (semActs === undefined)
        return undefined;
      var ret = []
      Object.keys(semActs).forEach(function (label) {
        ret.push(_Visitor.visitSemAct(semActs[label], label));
      });
      return ret;
    },
    visitSemAct: function (semAct, label) {
      var ret = { type: "SemAct" };
      _expect(semAct, "type", "SemAct");

      this._maybeSet(semAct, ret, "SemAct",
                     ["name", "code"]);
      return ret;
    },

    visitShapes: function (shapes) {
      var _Visitor = this;
      if (shapes === undefined)
        return undefined;
      return shapes.map(
        shapeExpr =>
          _Visitor.visitShapeExpr(shapeExpr)
      );
    },

    visitProductions999: function (productions) { // !! DELETE
      var _Visitor = this;
      if (productions === undefined)
        return undefined;
      var ret = {}
      Object.keys(productions).forEach(function (label) {
        ret[label] = _Visitor.visitExpression(productions[label], label);
      });
      return ret;
    },

    visitShapeExpr: function (expr, label) {
      if (isShapeRef(expr))
        return this.visitShapeRef(expr)
      var r =
          expr.type === "Shape" ? this.visitShape(expr, label) :
          expr.type === "NodeConstraint" ? this.visitNodeConstraint(expr, label) :
          expr.type === "ShapeAnd" ? this.visitShapeAnd(expr, label) :
          expr.type === "ShapeOr" ? this.visitShapeOr(expr, label) :
          expr.type === "ShapeNot" ? this.visitShapeNot(expr, label) :
          expr.type === "ShapeExternal" ? this.visitShapeExternal(expr) :
          null;// if (expr.type === "ShapeRef") r = 0; // console.warn("visitShapeExpr:", r);
      if (r === null)
        throw Error("unexpected shapeExpr type: " + expr.type);
      else
        return r;
    },

    // _visitShapeGroup: visit a grouping expression (shapeAnd, shapeOr)
    _visitShapeGroup: function (expr, label) {
      this._testUnknownAttributes(expr, ["id", "shapeExprs"], expr.type, this.visitShapeNot)
      var _Visitor = this;
      var r = { type: expr.type };
      if ("id" in expr)
        r.id = expr.id;
      r.shapeExprs = expr.shapeExprs.map(function (nested) {
        return _Visitor.visitShapeExpr(nested, label);
      });
      return r;
    },

    // _visitShapeNot: visit negated shape
    visitShapeNot: function (expr, label) {
      this._testUnknownAttributes(expr, ["id", "shapeExpr"], "ShapeNot", this.visitShapeNot)
      var r = { type: expr.type };
      if ("id" in expr)
        r.id = expr.id;
      r.shapeExpr = this.visitShapeExpr(expr.shapeExpr, label);
      return r;
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitShape: function (shape, label) {
      var ret = { type: "Shape" };
      _expect(shape, "type", "Shape");

      this._maybeSet(shape, ret, "Shape",
                     [ "id",
                       // "virtual", "inherit", -- futureWork
                       "closed",
                       "expression", "extra", "semActs", "annotations"]);
      return ret;
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitNodeConstraint: function (shape, label) {
      var ret = { type: "NodeConstraint" };
      _expect(shape, "type", "NodeConstraint");

      this._maybeSet(shape, ret, "NodeConstraint",
                     [ "id",
                       // "virtual", "inherit", -- futureWork
                       "nodeKind", "datatype", "pattern", "flags", "length",
                       "reference", "minlength", "maxlength",
                       "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                       "totaldigits", "fractiondigits", "values", "annotations", "semActs"]);
      return ret;
    },

    visitShapeRef: function (reference) {
      if (typeof reference !== "string") {
        let ex = Exception("visitShapeRef expected a string, not " + JSON.stringify(reference));
        console.warn(ex);
        throw ex;
      }
      return reference;
    },

    visitShapeExternal: function (expr) {
      this._testUnknownAttributes(expr, ["id"], "ShapeExternal", this.visitShapeNot)
      return Object.assign("id" in expr ? { id: expr.id } : {}, { type: "ShapeExternal" });
    },

    // _visitGroup: visit a grouping expression (someOf or eachOf)
    _visitGroup: function (expr, type) {
      var _Visitor = this;
      var r = Object.assign(
        // pre-declare an id so it sorts to the top
        "id" in expr ? { id: null } : { },
        { type: expr.type }
      );
      r.expressions = expr.expressions.map(function (nested) {
        return _Visitor.visitExpression(nested);
      });
      return this._maybeSet(expr, r, "expr",
                            ["id", "min", "max", "annotations", "semActs"], ["expressions"]);
    },

    visitTripleConstraint: function (expr) {
      return this._maybeSet(expr,
                            Object.assign(
                              // pre-declare an id so it sorts to the top
                              "id" in expr ? { id: null } : { },
                              { type: "TripleConstraint" }
                            ),
                            "TripleConstraint",
                            ["id", "inverse", "predicate", "valueExpr",
                             "min", "max", "annotations", "semActs"])
    },

    visitExpression: function (expr) {
      if (typeof expr === "string")
        return this.visitInclusion(expr);
      var r = expr.type === "TripleConstraint" ? this.visitTripleConstraint(expr) :
          expr.type === "OneOf" ? this.visitOneOf(expr) :
          expr.type === "EachOf" ? this.visitEachOf(expr) :
          expr.type === "Unique" ? this.visitUnique(expr) :
          expr.type === "ValueComparison" ? this.visitValueComparison(expr) :
          null;
      if (r === null)
        throw Error("unexpected expression type: " + expr.type);
      else
        return r;
    },

    visitValues: function (values) {
      var _Visitor = this;
      return values.map(function (t) {
        return isTerm(t) || t.type === "Language" ?
          t :
          _Visitor.visitStemRange(t);
      });
    },

    visitStemRange: function (t) {
      var _Visitor = this; // console.log(Error(t.type).stack);
      // _expect(t, "type", "IriStemRange");
      if (!("type" in t))
        _Visitor.runtimeError(Error("expected "+JSON.stringify(t)+" to have a 'type' attribute."));
      var stemRangeTypes = ["IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
      if (stemRangeTypes.indexOf(t.type) === -1)
        _Visitor.runtimeError(Error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'."));
      var stem;
      if (isTerm(t)) {
        _expect(t.stem, "type", "Wildcard");
        stem = { type: t.type, stem: { type: "Wildcard" } };
      } else {
        stem = { type: t.type, stem: t.stem };
      }
      if (t.exclusions) {
        stem.exclusions = t.exclusions.map(function (c) {
          return _Visitor.visitExclusion(c);
        });
      }
      return stem;
    },

    visitExclusion: function (c) {
      if (!isTerm(c)) {
        // _expect(c, "type", "IriStem");
        if (!("type" in c))
          _Visitor.runtimeError(Error("expected "+JSON.stringify(c)+" to have a 'type' attribute."));
        var stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
        if (stemTypes.indexOf(c.type) === -1)
          _Visitor.runtimeError(Error("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'."));
        return { type: c.type, stem: c.stem };
      } else {
        return c;
      }
    },

    visitInclusion: function (inclusion) {
      if (typeof inclusion !== "string") {
        let ex = Exception("visitInclusion expected a string, not " + JSON.stringify(inclusion));
        console.warn(ex);
        throw ex;
      }
      return inclusion;
    },

      visitUnique: function (unique) {
        var ret = { type: "Unique" };
        _expect(unique, "type", "Unique");

        if ("focus" in unique)
          ret.focus = unique.focus;
        ret.uniques = this._visitList(unique.uniques);
        return ret;
      },

      visitAccessors: function (accessors) {
        var _Visitor = this;
        return accessors.map(function (t) {
          return typeof t === "object" ? _Visitor.visitAccessorFunction(t) : t;
        });
      },

      visitAccessorFunction: function (f) {
        var _Visitor = this;
        var r =
            f.type === "LangtagAccessor" ? { type: "LangtagAccessor" } :
            f.type === "DatatypeAccessor" ? { type: "DatatypeAccessor" } :
            null;
        if (r === null)
          throw Error("unexpected accessor function : " + f.type);
        r.name = f.name;
        return r;
      },

      visitValueComparison: function (cmp) {
        var ret = { type: "ValueComparison" };
        _expect(cmp, "type", "ValueComparison");

        ret.left = cmp.left;
        ret.comparator = cmp.comparator;
        ret.right = cmp.right;
        return ret;
      },

    _maybeSet: function (obj, ret, context, members, ignore) {
      var _Visitor = this;
      this._testUnknownAttributes(obj, ignore ? members.concat(ignore) : members, context, this._maybeSet)
      members.forEach(function (member) {
        var methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
        if (member in obj) {
          var f = _Visitor[methodName];
          if (typeof f !== "function") {
            throw Error(methodName + " not found in Visitor");
          }
          var t = f.call(_Visitor, obj[member]);
          if (t !== undefined) {
            ret[member] = t;
          }
        }
      });
      return ret;
    },
    _visitValue: function (v) {
      return v;
    },
    _visitList: function (l) {
      return l.slice();
    },
    _testUnknownAttributes: function (obj, expected, context, captureFrame) {
      var unknownMembers = Object.keys(obj).reduce(function (ret, k) {
        return k !== "type" && expected.indexOf(k) === -1 ? ret.concat(k) : ret;
      }, []);
      if (unknownMembers.length > 0) {
        var e = Error("unknown propert" + (unknownMembers.length > 1 ? "ies" : "y") + ": " +
                      unknownMembers.map(function (p) {
                        return "\"" + p + "\"";
                      }).join(",") +
                      " in " + context + ": " + JSON.stringify(obj));
        Error.captureStackTrace(e, captureFrame);
        throw e;
      }
    }

  };
  r.visitBase = r.visitStart = r.visitVirtual = r.visitClosed = r["visit@context"] = r._visitValue;
  r.visitInherit = r.visitExtra = r.visitAnnotations = r._visitList;
  r.visitInverse = r.visitPredicate = r._visitValue;
  r.visitName = r.visitId = r.visitCode = r.visitMin = r.visitMax = r._visitValue;

  r.visitType = r.visitNodeKind = r.visitDatatype = r.visitPattern = r.visitFlags = r.visitLength = r.visitMinlength = r.visitMaxlength = r.visitMininclusive = r.visitMinexclusive = r.visitMaxinclusive = r.visitMaxexclusive = r.visitTotaldigits = r.visitFractiondigits = r._visitValue;
  r.visitOneOf = r.visitEachOf = r._visitGroup;
  r.visitShapeAnd = r.visitShapeOr = r._visitShapeGroup;
  r.visitInclude = r._visitValue;
  r.visitValueExpr = r.visitShapeExpr;
  return r;

  // Expect property p with value v in object o
  function _expect (o, p, v) {
    if (!(p in o))
      this._error("expected "+JSON.stringify(o)+" to have a ."+p);
    if (arguments.length > 2 && o[p] !== v)
      this._error("expected "+o[o]+" to equal ."+v);
  }

  function _error (str) {
    throw new Error(str);
  }
}

// The ShEx Vistor is here to minimize deps for ShExValidator.
/** create indexes for schema
 */
ShExVisitor.index = function (schema) {
  let index = {
    shapeExprs: {},
    tripleExprs: {}
  };
  let v = ShExVisitor();

  let oldVisitExpression = v.visitExpression;
  v.visitExpression = function (expression) {
    if (typeof expression === "object" && "id" in expression)
      index.tripleExprs[expression.id] = expression;
    return oldVisitExpression.call(v, expression);
  };

  let oldVisitShapeExpr = v.visitShapeExpr;
  v.visitShapeExpr = v.visitValueExpr = function (shapeExpr, label) {
    if (typeof shapeExpr === "object" && "id" in shapeExpr)
      index.shapeExprs[shapeExpr.id] = shapeExpr;
    return oldVisitShapeExpr.call(v, shapeExpr, label);
  };

  v.visitSchema(schema);
  return index;
}

if (true)
  module.exports = ShExVisitor;



/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// **ShExWriter** writes ShEx documents.

const ShExWriterCjsModule = (function () {
const UNBOUNDED = -1;

// Matches a literal as represented in memory by the ShEx library
const ShExLiteralMatcher = /^"([^]*)"(?:\^\^(.+)|@([\-a-z]+))?$/i;

// rdf:type predicate (for 'a' abbreviation)
const RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    RDF_TYPE   = RDF_PREFIX + 'type';

// Characters in literals that require escaping
const ESCAPE_1 = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    ESCAPE_g = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    ESCAPE_replacements = { '\\': '\\\\', '"': '\\"', '/': '\\/', '\t': '\\t',
                            '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f' };

const nodeKinds = {
  'iri': "IRI",
  'bnode': "BNODE",
  'literal': "LITERAL",
  'nonliteral': "NONLITERAL"
};
const nonLitNodeKinds = {
  'iri': "IRI",
  'bnode': "BNODE",
  'literal': "LITERAL",
  'nonliteral': "NONLITERAL"
};

// ## Constructor
function ShExWriter (outputStream, options) {
  if (!(this instanceof ShExWriter))
    return new ShExWriter(outputStream, options);

  // Shift arguments if the first argument is not a stream
  if (outputStream && typeof outputStream.write !== 'function')
    options = outputStream, outputStream = null;
  options = options || {};

  // If no output stream given, send the output as string through the end callback
  if (!outputStream) {
    let output = '';
    this._outputStream = {
      write: function (chunk, encoding, done) { output += chunk; done && done(); },
      end:   function (done) { done && done(null, output); },
    };
    this._endStream = true;
  }
  else {
    this._outputStream = outputStream;
    this._endStream = options.end === undefined ? true : !!options.end;
  }

  // Initialize writer, depending on the format
  this._prefixIRIs = Object.create(null);
  options.prefixes && this.addPrefixes(options.prefixes);

  this._error = options.error || _throwError;
  this.forceParens = !options.simplifyParentheses; // default to false
  this._expect = options.lax ? noop : expect;
}

ShExWriter.prototype = {
  // ## Private methods

  // ### `_write` writes the argument to the output stream
  _write: function (string, callback) {
    this._outputStream.write(string, 'utf8', callback);
  },

  // ### `_writeSchema` writes the shape to the output stream
  _writeSchema: function (schema, done) {
    const _ShExWriter = this;
    this._expect(schema, "type", "Schema");
    _ShExWriter.addPrefixes(schema.prefixes);
    if (schema.base)
      _ShExWriter._write("BASE " + this._encodeIriOrBlankNode(schema.base) + "\n");

    if (schema.imports)
      schema.imports.forEach(function (imp) {
        _ShExWriter._write("IMPORT " + _ShExWriter._encodeIriOrBlankNode(imp) + "\n");
      });
    if (schema.startActs)
      schema.startActs.forEach(function (act) {
        _ShExWriter._expect(act, "type", "SemAct");
        _ShExWriter._write(" %"+
                           _ShExWriter._encodePredicate(act.name)+
                           ("code" in act ? "{"+escapeCode(act.code)+"%"+"}" : "%"));
      });
    if (schema.start)
      _ShExWriter._write("start = " + _ShExWriter._writeShapeExpr(schema.start, done, true, 0).join('') + "\n")
    if ("shapes" in schema)
      schema.shapes.forEach(function (shapeExpr) {
        _ShExWriter._write(
          _ShExWriter._encodeShapeName(shapeExpr.id, false) +
            " " +
            _ShExWriter._writeShapeExpr(shapeExpr, done, true, 0).join("")+"\n",
          done
        );
      })
  },

  _writeShapeExpr: function (shapeExpr, done, forceBraces, parentPrec) {
    const _ShExWriter = this;
    const pieces = [];
    if (typeof shapeExpr === "string") // ShapeRef
      pieces.push("@", _ShExWriter._encodeShapeName(shapeExpr));
    // !!! []s for precedence!
    else if (shapeExpr.type === "ShapeExternal")
      pieces.push("EXTERNAL");
    else if (shapeExpr.type === "ShapeAnd") {
      if (parentPrec >= 3)
        pieces.push("(");
      let lastAndElided = false;
      shapeExpr.shapeExprs.forEach(function (expr, ord) {
        if (ord > 0) { // && !!! grammar rules too weird here
          /*
            shapeAtom:
                  nonLitNodeConstraint shapeOrRef?
                | shapeDecl nonLitNodeConstraint?

            nonLitInlineNodeConstraint:
                  nonLiteralKind stringFacet*
          */
          function nonLitNodeConstraint (idx) {
            let c = shapeExpr.shapeExprs[idx];
            return c.type !== "NodeConstraint"
              || ("nodeKind" in c && c.nodeKind === "literal")
              || "datatype" in c
              || "values" in c
              ? false
              : true;
          }

          function shapeOrRef (idx) {
            let c = shapeExpr.shapeExprs[idx];
            return c.type === "Shape" || c.type === "ShapeRef";
          }

          function shapeDecl (idx) {
            let c = shapeExpr.shapeExprs[idx];
            return c.type === "Shape";
          }

          let elideAnd = !lastAndElided
              && (nonLitNodeConstraint(ord-1) && shapeOrRef(ord)
                  || shapeDecl(ord-1) && nonLitNodeConstraint(ord))
          if (!elideAnd) {
            pieces.push(" AND ");
          }
          lastAndElided = elideAnd;
        }
        [].push.apply(pieces, _ShExWriter._writeShapeExpr(expr, done, false, 3));
      });
      if (parentPrec >= 3)
        pieces.push(")");
    } else if (shapeExpr.type === "ShapeOr") {
      if (parentPrec >= 2)
        pieces.push("(");
      shapeExpr.shapeExprs.forEach(function (expr, ord) {
        if (ord > 0)
          pieces.push(" OR ");
        [].push.apply(pieces, _ShExWriter._writeShapeExpr(expr, done, forceBraces, 2));
      });
      if (parentPrec >= 2)
        pieces.push(")");
    } else if (shapeExpr.type === "ShapeNot") {
      if (parentPrec >= 4)
        pieces.push("(");
      pieces.push("NOT ");
      [].push.apply(pieces, _ShExWriter._writeShapeExpr(shapeExpr.shapeExpr, done, forceBraces, 4));
      if (parentPrec >= 4)
        pieces.push(")");
    } else if (shapeExpr.type === "Shape") {
      [].push.apply(pieces, _ShExWriter._writeShape(shapeExpr, done, forceBraces));
    } else if (shapeExpr.type === "NodeConstraint") {
      [].push.apply(pieces, _ShExWriter._writeNodeConstraint(shapeExpr, done, forceBraces));
    } else
      throw Error("expected Shape{,And,Or,Ref} or NodeConstraint in " + JSON.stringify(shapeExpr));
    return pieces;
  },

  // ### `_writeShape` writes the shape to the output stream
  _writeShape: function (shape, done, forceBraces) {
    const _ShExWriter = this;
    try {
      const pieces = []; // guessing push/join is faster than concat
      this._expect(shape, "type", "Shape");

      if (shape.closed) pieces.push("CLOSED ");

      // if (shape.inherit && shape.inherit.length > 0) { futureWork
      //   pieces.push("&");
      //   shape.inherit.forEach(function (i, ord) {
      //     if (ord)
      //       pieces.push(" ")
      //     pieces.push(_ShExWriter._encodeShapeName(i, ord > 0));
      //   });
      //   pieces.push(" ");
      // }

      if (shape.extra && shape.extra.length > 0) {
        pieces.push("EXTRA ");
        shape.extra.forEach(function (i, ord) {
          pieces.push(_ShExWriter._encodeShapeName(i, false)+" ");
        });
        pieces.push(" ");
      }
      const empties = ["values", "length", "minlength", "maxlength", "pattern", "flags"];
      pieces.push("{\n");

      function _writeShapeActions (semActs) {
        if (!semActs)
          return;

        semActs.forEach(function (act) {
          _ShExWriter._expect(act, "type", "SemAct");
          pieces.push(" %",
                      _ShExWriter._encodePredicate(act.name),
                      ("code" in act ? "{"+escapeCode(act.code)+"%"+"}" : "%"));
        });
      }

      function _writeCardinality (min, max) {
        if      (min === 0 && max === 1)         pieces.push("?");
        else if (min === 0 && max === UNBOUNDED) pieces.push("*");
        else if (min === undefined && max === undefined)                         ;
        else if (min === 1 && max === UNBOUNDED) pieces.push("+");
        else
          pieces.push("{", min, ",", (max === UNBOUNDED ? "*" : max), "}"); // by coincidence, both use the same character.
      }

      function _writeExpression (expr, indent, parentPrecedence) {
        function _writeExpressionActions (semActs) {
          if (semActs) {

            semActs.forEach(function (act) {
              _ShExWriter._expect(act, "type", "SemAct");
              pieces.push("\n"+indent+"   %");
              pieces.push(_ShExWriter._encodeValue(act.name));
              if ("code" in act)
                pieces.push("{"+escapeCode(act.code)+"%"+"}");
              else
                pieces.push("%");
            });
          }
        }

        function _exprGroup (exprs, separator, precedence, forceParens) {
          const needsParens = precedence < parentPrecedence || forceParens;
          if (needsParens) {
            pieces.push("(");
          }
          exprs.forEach(function (nested, ord) {
            _writeExpression(nested, indent+"  ", precedence)
            if (ord < exprs.length - 1)
              pieces.push(separator);
          });
          if (needsParens) {
            pieces.push(")");
          }
        }

        if (typeof expr === "string") {
          pieces.push("&");
          pieces.push(_ShExWriter._encodeShapeName(expr, false));
        } else {

        if ("id" in expr) {
          pieces.push("$");
          pieces.push(_ShExWriter._encodeIriOrBlankNode(expr.id, true));
        }

        if (expr.type === "TripleConstraint") {
          if (expr.inverse)
            pieces.push("^");
          if (expr.negated)
            pieces.push("!");
          pieces.push(indent,
                      _ShExWriter._encodePredicate(expr.predicate),
                      " ");

          if ("valueExpr" in expr)
            [].push.apply(pieces, _ShExWriter._writeShapeExpr(expr.valueExpr, done, true, 0));
          else
            pieces.push(". ");

          _writeCardinality(expr.min, expr.max);
          _ShExWriter._annotations(pieces, expr.annotations, indent);
          _writeExpressionActions(expr.semActs);
        }

        else if (expr.type === "OneOf") {
          const needsParens = "id" in expr || "min" in expr || "max" in expr || "annotations" in expr || "semActs" in expr;
          _exprGroup(expr.expressions, "\n"+indent+"| ", 1, needsParens || _ShExWriter.forceParens);
          _writeCardinality(expr.min, expr.max); // t: open1dotclosecardOpt
          _ShExWriter._annotations(pieces, expr.annotations, indent);
          _writeExpressionActions(expr.semActs);
        }

        else if (expr.type === "EachOf") {
          const needsParens = "id" in expr || "min" in expr || "max" in expr || "annotations" in expr || "semActs" in expr;
          _exprGroup(expr.expressions, ";\n"+indent, 2, needsParens || _ShExWriter.forceParens);
          _writeCardinality(expr.min, expr.max); // t: open1dotclosecardOpt
          _ShExWriter._annotations(pieces, expr.annotations, indent);
          _writeExpressionActions(expr.semActs);
        }

        else throw Error("unexpected expr type: " + expr.type);
        }
      }

      if (shape.expression) // t: 0, 0Inherit1
        _writeExpression(shape.expression, "  ", 0);
      pieces.push("\n}");
      _writeShapeActions(shape.semActs);
      _ShExWriter._annotations(pieces, shape.annotations, "  ");

      return pieces;
    }
    catch (error) { done && done(error); }
  },

  // ### `_writeShape` writes the shape to the output stream
  _writeNodeConstraint: function (v, done) {
    const _ShExWriter = this;
    try {
      _ShExWriter._expect(v, "type", "NodeConstraint");

      const pieces = [];
      if (v.nodeKind in nodeKinds)       pieces.push(nodeKinds[v.nodeKind], " ");
      else if (v.nodeKind !== undefined) _ShExWriter._error("unexpected nodeKind: " + v.nodeKind); // !!!!

      this._fillNodeConstraint(pieces, v, done);
      this._annotations(pieces, v.annotations, "  ");
      return pieces;
    }
    catch (error) { done && done(error); }

  },

  _annotations: function (pieces, annotations, indent) {
    const _ShExWriter = this;
    if (annotations) {
      annotations.forEach(function (a) {
        _ShExWriter._expect(a, "type", "Annotation");
        pieces.push("//\n"+indent+"   ");
        pieces.push(_ShExWriter._encodeValue(a.predicate));
        pieces.push(" ");
        pieces.push(_ShExWriter._encodeValue(a.object));
      });
    }
  },

  _fillNodeConstraint: function (pieces, v, done) {
    const _ShExWriter = this;
    if (v.datatype  && v.values  ) _ShExWriter._error("found both datatype and values in "   +expr);
    if (v.datatype) {
      pieces.push(_ShExWriter._encodeShapeName(v.datatype));
    }

    if (v.values) {
      pieces.push("[");

      v.values.forEach(function (t, ord) {
        if (ord > 0)
          pieces.push(" ");

        if (!isTerm(t)) {
//          expect(t, "type", "IriStemRange");
              if (!("type" in t))
                runtimeError("expected "+JSON.stringify(t)+" to have a 'type' attribute.");
          const stemRangeTypes = ["Language", "IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
              if (stemRangeTypes.indexOf(t.type) === -1)
                runtimeError("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'.");
          if (t.type === "Language") {
            pieces.push("@" + t.languageTag);
          } else if (!isTerm(t.stem)) {
            expect(t.stem, "type", "Wildcard");
            pieces.push(".");
          } else {
            pieces.push(langOrLiteral(t, t.stem) + "~");
          }
          if (t.exclusions) {
            t.exclusions.forEach(function (c) {
              pieces.push(" - ");
              if (!isTerm(c)) {
//                expect(c, "type", "IriStem");
                    if (!("type" in c))
                      runtimeError("expected "+JSON.stringify(c)+" to have a 'type' attribute.");
                    const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
                    if (stemTypes.indexOf(c.type) === -1)
                      runtimeError("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'.");
                pieces.push(langOrLiteral(t, c.stem) + "~");
              } else {
                pieces.push(langOrLiteral(t, c));
              }
            });
          }
          function langOrLiteral (t, c) {
            return ["LanguageStem", "LanguageStemRange"].indexOf(t.type) !== -1 ? "@" + c :
              ["LiteralStem", "LiteralStemRange"].indexOf(t.type) !== -1 ? '"' + c.replace(ESCAPE_g, c) + '"' :
              _ShExWriter._encodeValue(c)
          }
        } else {
          pieces.push(_ShExWriter._encodeValue(t));
        }
      });

      pieces.push("]");
    }

    if ('pattern' in v) {
      const pattern = v.pattern.
          replace(/\//g, "\\/");
      // if (ESCAPE_1.test(pattern))
      //   pattern = pattern.replace(ESCAPE_g, characterReplacer);
      const flags = 'flags' in v ? v.flags : "";
      pieces.push("/" + pattern + "/" + flags + " ");
    }
    ['length', 'minlength', 'maxlength',
     'mininclusive', 'minexclusive', 'maxinclusive', 'maxexclusive',
     'totaldigits', 'fractiondigits'
    ].forEach(function (a) {
      if (v[a])
        pieces.push(" ", a, " ", v[a]);
    });
    return pieces;

    function isTerm (t) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }
  },

  // ### `_encodeIriOrBlankNode` represents an IRI or blank node
  _encodeIriOrBlankNode: function (iri, trailingSpace) {
    trailingSpace = trailingSpace ? ' ' : '';
    // A blank node is represented as-is
    if (iri[0] === '_' && iri[1] === ':') return iri;
    // Escape special characters
    if (ESCAPE_1.test(iri))
      iri = iri.replace(ESCAPE_g, characterReplacer);
    // Try to represent the IRI as prefixed name
    const prefixMatch = this._prefixRegex.exec(iri);
    return !prefixMatch ? '<' + iri + '>' :
           (!prefixMatch[1] ? iri : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2]) + trailingSpace;
  },

  // ### `_encodeLiteral` represents a literal
  _encodeLiteral: function (value, type, language) {
    // Escape special characters
    if (ESCAPE_1.test(value))
      value = value.replace(ESCAPE_g, characterReplacer);
    // Write the literal, possibly with type or language
    if (language)
      return '"' + value + '"@' + language;
    else if (type)
      return '"' + value + '"^^' + this._encodeIriOrBlankNode(type);
    else
      return '"' + value + '"';
  },

  // ### `_encodeShapeName` represents a subject
  _encodeShapeName: function (subject, trailingSpace) {
    if (subject[0] === '"')
      throw new Error('A literal as subject is not allowed: ' + subject);
    return this._encodeIriOrBlankNode(subject, trailingSpace);
  },

  // ### `_encodePredicate` represents a predicate
  _encodePredicate: function (predicate) {
    if (predicate[0] === '"')
      throw new Error('A literal as predicate is not allowed: ' + predicate);
    return predicate === RDF_TYPE ? 'a' : this._encodeIriOrBlankNode(predicate);
  },

  // ### `_encodeValue` represents an object
  _encodeValue: function (object) {
    // Represent an IRI or blank node
    if (typeof object !== "object")
      return this._encodeIriOrBlankNode(object);
    // Represent a literal
    return this._encodeLiteral(object.value, object.type, object.language);
  },

  // ### `_blockedWrite` replaces `_write` after the writer has been closed
  _blockedWrite: function () {
    throw new Error('Cannot write because the writer has been closed.');
  },

  writeSchema: function (shape, done) {
    this._writeSchema(shape, done);
    this.end(done);
  },

  // ### `addShape` adds the shape to the output stream
  addShape: function (shape, name, done) {
    this._write(
      _ShExWriter._encodeShapeName(name, false) +
        " " +
        _ShExWriter._writeShapeExpr(shape, done, true, 0).join(""),
      done
    );
  },

  // ### `addShapes` adds the shapes to the output stream
  addShapes: function (shapes) {
    for (let i = 0; i < shapes.length; i++)
      this.addShape(shapes[i]);
  },

  // ### `addPrefix` adds the prefix to the output stream
  addPrefix: function (prefix, iri, done) {
    const prefixes = {};
    prefixes[prefix] = iri;
    this.addPrefixes(prefixes, done);
  },

  // ### `addPrefixes` adds the prefixes to the output stream
  addPrefixes: function (prefixes, done) {
    // Add all useful prefixes
    const prefixIRIs = this._prefixIRIs;
    let hasPrefixes = false;
    for (let prefix in prefixes) {
      // Verify whether the prefix can be used and does not exist yet
      const iri = prefixes[prefix];
      if (// @@ /[#\/]$/.test(iri) && !! what was that?
          prefixIRIs[iri] !== (prefix += ':')) {
        hasPrefixes = true;
        prefixIRIs[iri] = prefix;
        // Write prefix
        this._write('PREFIX ' + prefix + ' <' + iri + '>\n');
      }
    }
    // Recreate the prefix matcher
    if (hasPrefixes) {
      let IRIlist = '', prefixList = '';
      for (let prefixIRI in prefixIRIs) {
        IRIlist += IRIlist ? '|' + prefixIRI : prefixIRI;
        prefixList += (prefixList ? '|' : '') + prefixIRIs[prefixIRI];
      }
      IRIlist = IRIlist.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
      this._prefixRegex = new RegExp('^(?:' + prefixList + ')[^\/]*$|' +
                                     '^(' + IRIlist + ')([a-zA-Z][\\-_a-zA-Z0-9]*)$');
    }
    // End a prefix block with a newline
    this._write(hasPrefixes ? '\n' : '', done);
  },

  // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
  _prefixRegex: /$0^/,

  // ### `end` signals the end of the output stream
  end: function (done) {
    // Disallow further writing
    this._write = this._blockedWrite;

    // Try to end the underlying stream, ensuring done is called exactly one time
    let singleDone = done && function (error, result) { singleDone = null, done(error, result); };
    if (this._endStream) {
      try { return this._outputStream.end(singleDone); }
      catch (error) { /* error closing stream */ }
    }
    singleDone && singleDone();
  },
};

// Replaces a character by its escaped version
function characterReplacer(character) {
  // Replace a single character by its escaped version
  let result = ESCAPE_replacements[character];
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

function escapeCode (code) {
  return code.replace(/\\/g, "\\\\").replace(/%/g, "\\%")
}

/** _throwError: overridable function to throw Errors().
 *
 * @param func (optional): function at which to truncate stack trace
 * @param str: error message
 */
function _throwError (func, str) {
  if (typeof func !== "function") {
    str = func;
    func = _throwError;
  }
  const e = new Error(str);
  Error.captureStackTrace(e, func);
  throw e;
}

// Expect property p with value v in object o
function expect (o, p, v) {
  if (!(p in o))
    this._error(expect, "expected "+o+" to have a ."+p);
  if (arguments.length > 2 && o[p] !== v)
    this._error(expect, "expected "+o[o]+" to equal ."+v);
}

// The empty function
function noop () {}

return ShExWriter;
})();

// Export the `ShExWriter` class as a whole.
if (true)
  module.exports = ShExWriterCjsModule; // node environment


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

const ShExParserCjsModule = (function () {

const ShExJison = __webpack_require__(27).Parser;

// Creates a ShEx parser with the given pre-defined prefixes
const prepareParser = function (baseIRI, prefixes, schemaOptions) {
  schemaOptions = schemaOptions || {};
  // Create a copy of the prefixes
  const prefixesCopy = {};
  for (const prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  const parser = new ShExJison();

  function runParser () {
    // ShExJison.base = baseIRI || "";
    // ShExJison.basePath = ShExJison.base.replace(/[^\/]*$/, '');
    // ShExJison.baseRoot = ShExJison.base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    ShExJison._prefixes = Object.create(prefixesCopy);
    ShExJison._imports = [];
    ShExJison._setBase(baseIRI);
    ShExJison._setFileName(baseIRI);
    ShExJison.options = schemaOptions;
    let errors = [];
    ShExJison.recoverable = e =>
      errors.push(e);
    let ret = null;
    try {
      ret = ShExJison.prototype.parse.apply(parser, arguments);
    } catch (e) {
      errors.push(e);
    }
    ShExJison.reset();
    errors.forEach(e => {
      if ("hash" in e) {
        const hash = e.hash;
        const location = hash.loc;
        delete hash.loc;
        Object.assign(e, hash, {location: location});
      }
      return e;
    })
    if (errors.length == 1) {
      errors[0].parsed = ret;
      throw errors[0];
    } else if (errors.length) {
      const all = new Error("" + errors.length  + " parser errors:\n" + errors.map(
        e => contextError(e, parser.yy.lexer)
      ).join("\n"));
      all.errors = errors;
      all.parsed = ret;
      throw all;
    } else {
      return ret;
    }
  }
  parser.parse = runParser;
  parser._setBase = function (base) {
    ShExJison._setBase;
    baseIRI = base;
  }
  parser._setFileName = ShExJison._setFileName;
  parser._setOptions = function (opts) { ShExJison.options = opts; };
  parser._resetBlanks = ShExJison._resetBlanks;
  parser.reset = ShExJison.reset;
  ShExJison.options = schemaOptions;
  return parser;

  function contextError (e, lexer) {
    // use the lexer's pretty-printing
    const line = e.location.first_line;
    const col  = e.location.first_column + 1;
    const posStr = "pos" in e.hash ? "\n" + e.hash.pos : ""
    return `${baseIRI}\n line: ${line}, column: ${col}: ${e.message}${posStr}`;
  }
}

return {
  construct: prepareParser
};
})();

if (true)
  module.exports = ShExParserCjsModule;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern, false)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern, inGlobStar)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
//   add to matches if it succeeds.  END.
//
// If inGlobStar and PREFIX is symlink and points to dir
//   set ENTRIES = []
// else readdir(PREFIX) as ENTRIES
//   If fail, END
//
// with ENTRIES
//   If pattern[n] is GLOBSTAR
//     // handle the case where the globstar match is empty
//     // by pruning it out, and testing the resulting pattern
//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
//     // handle other cases.
//     for ENTRY in ENTRIES (not dotfiles)
//       // attach globstar + tail onto the entry
//       // Mark that this entry is a globstar match
//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
//
//   else // not globstar
//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
//       Test ENTRY against pattern[n]
//       If fails, continue
//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
//
// Caveat:
//   Cache all stats and readdirs results to minimize syscall.  Since all
//   we ever care about is existence and directory-ness, we can just keep
//   `true` for files, and [children,...] for directories, or `false` for
//   things that don't exist.

module.exports = glob

var fs = __webpack_require__(2)
var rp = __webpack_require__(14)
var minimatch = __webpack_require__(5)
var Minimatch = minimatch.Minimatch
var inherits = __webpack_require__(32)
var EE = __webpack_require__(33).EventEmitter
var path = __webpack_require__(1)
var assert = __webpack_require__(15)
var isAbsolute = __webpack_require__(7)
var globSync = __webpack_require__(38)
var common = __webpack_require__(16)
var alphasort = common.alphasort
var alphasorti = common.alphasorti
var setopts = common.setopts
var ownProp = common.ownProp
var inflight = __webpack_require__(39)
var util = __webpack_require__(6)
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

var once = __webpack_require__(18)

function glob (pattern, options, cb) {
  if (typeof options === 'function') cb = options, options = {}
  if (!options) options = {}

  if (options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return globSync(pattern, options)
  }

  return new Glob(pattern, options, cb)
}

glob.sync = globSync
var GlobSync = glob.GlobSync = globSync.GlobSync

// old api surface
glob.glob = glob

function extend (origin, add) {
  if (add === null || typeof add !== 'object') {
    return origin
  }

  var keys = Object.keys(add)
  var i = keys.length
  while (i--) {
    origin[keys[i]] = add[keys[i]]
  }
  return origin
}

glob.hasMagic = function (pattern, options_) {
  var options = extend({}, options_)
  options.noprocess = true

  var g = new Glob(pattern, options)
  var set = g.minimatch.set

  if (!pattern)
    return false

  if (set.length > 1)
    return true

  for (var j = 0; j < set[0].length; j++) {
    if (typeof set[0][j] !== 'string')
      return true
  }

  return false
}

glob.Glob = Glob
inherits(Glob, EE)
function Glob (pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = null
  }

  if (options && options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return new GlobSync(pattern, options)
  }

  if (!(this instanceof Glob))
    return new Glob(pattern, options, cb)

  setopts(this, pattern, options)
  this._didRealPath = false

  // process each pattern in the minimatch set
  var n = this.minimatch.set.length

  // The matches are stored as {<filename>: true,...} so that
  // duplicates are automagically pruned.
  // Later, we do an Object.keys() on these.
  // Keep them as a list so we can fill in when nonull is set.
  this.matches = new Array(n)

  if (typeof cb === 'function') {
    cb = once(cb)
    this.on('error', cb)
    this.on('end', function (matches) {
      cb(null, matches)
    })
  }

  var self = this
  this._processing = 0

  this._emitQueue = []
  this._processQueue = []
  this.paused = false

  if (this.noprocess)
    return this

  if (n === 0)
    return done()

  var sync = true
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false, done)
  }
  sync = false

  function done () {
    --self._processing
    if (self._processing <= 0) {
      if (sync) {
        process.nextTick(function () {
          self._finish()
        })
      } else {
        self._finish()
      }
    }
  }
}

Glob.prototype._finish = function () {
  assert(this instanceof Glob)
  if (this.aborted)
    return

  if (this.realpath && !this._didRealpath)
    return this._realpath()

  common.finish(this)
  this.emit('end', this.found)
}

Glob.prototype._realpath = function () {
  if (this._didRealpath)
    return

  this._didRealpath = true

  var n = this.matches.length
  if (n === 0)
    return this._finish()

  var self = this
  for (var i = 0; i < this.matches.length; i++)
    this._realpathSet(i, next)

  function next () {
    if (--n === 0)
      self._finish()
  }
}

Glob.prototype._realpathSet = function (index, cb) {
  var matchset = this.matches[index]
  if (!matchset)
    return cb()

  var found = Object.keys(matchset)
  var self = this
  var n = found.length

  if (n === 0)
    return cb()

  var set = this.matches[index] = Object.create(null)
  found.forEach(function (p, i) {
    // If there's a problem with the stat, then it means that
    // one or more of the links in the realpath couldn't be
    // resolved.  just return the abs value in that case.
    p = self._makeAbs(p)
    rp.realpath(p, self.realpathCache, function (er, real) {
      if (!er)
        set[real] = true
      else if (er.syscall === 'stat')
        set[p] = true
      else
        self.emit('error', er) // srsly wtf right here

      if (--n === 0) {
        self.matches[index] = set
        cb()
      }
    })
  })
}

Glob.prototype._mark = function (p) {
  return common.mark(this, p)
}

Glob.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}

Glob.prototype.abort = function () {
  this.aborted = true
  this.emit('abort')
}

Glob.prototype.pause = function () {
  if (!this.paused) {
    this.paused = true
    this.emit('pause')
  }
}

Glob.prototype.resume = function () {
  if (this.paused) {
    this.emit('resume')
    this.paused = false
    if (this._emitQueue.length) {
      var eq = this._emitQueue.slice(0)
      this._emitQueue.length = 0
      for (var i = 0; i < eq.length; i ++) {
        var e = eq[i]
        this._emitMatch(e[0], e[1])
      }
    }
    if (this._processQueue.length) {
      var pq = this._processQueue.slice(0)
      this._processQueue.length = 0
      for (var i = 0; i < pq.length; i ++) {
        var p = pq[i]
        this._processing--
        this._process(p[0], p[1], p[2], p[3])
      }
    }
  }
}

Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
  assert(this instanceof Glob)
  assert(typeof cb === 'function')

  if (this.aborted)
    return

  this._processing++
  if (this.paused) {
    this._processQueue.push([pattern, index, inGlobStar, cb])
    return
  }

  //console.error('PROCESS %d', this._processing, pattern)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // see if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index, cb)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip _processing
  if (childrenIgnored(this, read))
    return cb()

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb)
}

Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}

Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return cb()

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return cb()

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return cb()
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix) {
      if (prefix !== '/')
        e = prefix + '/' + e
      else
        e = prefix + e
    }
    this._process([e].concat(remain), index, inGlobStar, cb)
  }
  cb()
}

Glob.prototype._emitMatch = function (index, e) {
  if (this.aborted)
    return

  if (isIgnored(this, e))
    return

  if (this.paused) {
    this._emitQueue.push([index, e])
    return
  }

  var abs = isAbsolute(e) ? e : this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute)
    e = abs

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  var st = this.statCache[abs]
  if (st)
    this.emit('stat', e, st)

  this.emit('match', e)
}

Glob.prototype._readdirInGlobStar = function (abs, cb) {
  if (this.aborted)
    return

  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false, cb)

  var lstatkey = 'lstat\0' + abs
  var self = this
  var lstatcb = inflight(lstatkey, lstatcb_)

  if (lstatcb)
    fs.lstat(abs, lstatcb)

  function lstatcb_ (er, lstat) {
    if (er && er.code === 'ENOENT')
      return cb()

    var isSym = lstat && lstat.isSymbolicLink()
    self.symlinks[abs] = isSym

    // If it's not a symlink or a dir, then it's definitely a regular file.
    // don't bother doing a readdir in that case.
    if (!isSym && lstat && !lstat.isDirectory()) {
      self.cache[abs] = 'FILE'
      cb()
    } else
      self._readdir(abs, false, cb)
  }
}

Glob.prototype._readdir = function (abs, inGlobStar, cb) {
  if (this.aborted)
    return

  cb = inflight('readdir\0'+abs+'\0'+inGlobStar, cb)
  if (!cb)
    return

  //console.error('RD %j %j', +inGlobStar, abs)
  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs, cb)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return cb()

    if (Array.isArray(c))
      return cb(null, c)
  }

  var self = this
  fs.readdir(abs, readdirCb(this, abs, cb))
}

function readdirCb (self, abs, cb) {
  return function (er, entries) {
    if (er)
      self._readdirError(abs, er, cb)
    else
      self._readdirEntries(abs, entries, cb)
  }
}

Glob.prototype._readdirEntries = function (abs, entries, cb) {
  if (this.aborted)
    return

  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries
  return cb(null, entries)
}

Glob.prototype._readdirError = function (f, er, cb) {
  if (this.aborted)
    return

  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        this.emit('error', error)
        this.abort()
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict) {
        this.emit('error', er)
        // If the error is handled, then we abort
        // if not, we threw out of here
        this.abort()
      }
      if (!this.silent)
        console.error('glob error', er)
      break
  }

  return cb()
}

Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}


Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  //console.error('pgs2', prefix, remain[0], entries)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return cb()

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false, cb)

  var isSym = this.symlinks[abs]
  var len = entries.length

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return cb()

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true, cb)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true, cb)
  }

  cb()
}

Glob.prototype._processSimple = function (prefix, index, cb) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var self = this
  this._stat(prefix, function (er, exists) {
    self._processSimple2(prefix, index, er, exists, cb)
  })
}
Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {

  //console.error('ps2', prefix, exists)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return cb()

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
  cb()
}

// Returns either 'DIR', 'FILE', or false
Glob.prototype._stat = function (f, cb) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return cb()

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return cb(null, c)

    if (needDir && c === 'FILE')
      return cb()

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (stat !== undefined) {
    if (stat === false)
      return cb(null, stat)
    else {
      var type = stat.isDirectory() ? 'DIR' : 'FILE'
      if (needDir && type === 'FILE')
        return cb()
      else
        return cb(null, type, stat)
    }
  }

  var self = this
  var statcb = inflight('stat\0' + abs, lstatcb_)
  if (statcb)
    fs.lstat(abs, statcb)

  function lstatcb_ (er, lstat) {
    if (lstat && lstat.isSymbolicLink()) {
      // If it's a symlink, then treat it as the target, unless
      // the target does not exist, then treat it as a file.
      return fs.stat(abs, function (er, stat) {
        if (er)
          self._stat2(f, abs, null, lstat, cb)
        else
          self._stat2(f, abs, er, stat, cb)
      })
    } else {
      self._stat2(f, abs, er, lstat, cb)
    }
  }
}

Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
    this.statCache[abs] = false
    return cb()
  }

  var needDir = f.slice(-1) === '/'
  this.statCache[abs] = stat

  if (abs.slice(-1) === '/' && stat && !stat.isDirectory())
    return cb(null, false, stat)

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'
  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return cb()

  return cb(null, c, stat)
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {module.exports = realpath
realpath.realpath = realpath
realpath.sync = realpathSync
realpath.realpathSync = realpathSync
realpath.monkeypatch = monkeypatch
realpath.unmonkeypatch = unmonkeypatch

var fs = __webpack_require__(2)
var origRealpath = fs.realpath
var origRealpathSync = fs.realpathSync

var version = process.version
var ok = /^v[0-5]\./.test(version)
var old = __webpack_require__(28)

function newError (er) {
  return er && er.syscall === 'realpath' && (
    er.code === 'ELOOP' ||
    er.code === 'ENOMEM' ||
    er.code === 'ENAMETOOLONG'
  )
}

function realpath (p, cache, cb) {
  if (ok) {
    return origRealpath(p, cache, cb)
  }

  if (typeof cache === 'function') {
    cb = cache
    cache = null
  }
  origRealpath(p, cache, function (er, result) {
    if (newError(er)) {
      old.realpath(p, cache, cb)
    } else {
      cb(er, result)
    }
  })
}

function realpathSync (p, cache) {
  if (ok) {
    return origRealpathSync(p, cache)
  }

  try {
    return origRealpathSync(p, cache)
  } catch (er) {
    if (newError(er)) {
      return old.realpathSync(p, cache)
    } else {
      throw er
    }
  }
}

function monkeypatch () {
  fs.realpath = realpath
  fs.realpathSync = realpathSync
}

function unmonkeypatch () {
  fs.realpath = origRealpath
  fs.realpathSync = origRealpathSync
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var objectAssign = __webpack_require__(35);

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = __webpack_require__(6);
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(34)))

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {exports.alphasort = alphasort
exports.alphasorti = alphasorti
exports.setopts = setopts
exports.ownProp = ownProp
exports.makeAbs = makeAbs
exports.finish = finish
exports.mark = mark
exports.isIgnored = isIgnored
exports.childrenIgnored = childrenIgnored

function ownProp (obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field)
}

var path = __webpack_require__(1)
var minimatch = __webpack_require__(5)
var isAbsolute = __webpack_require__(7)
var Minimatch = minimatch.Minimatch

function alphasorti (a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase())
}

function alphasort (a, b) {
  return a.localeCompare(b)
}

function setupIgnores (self, options) {
  self.ignore = options.ignore || []

  if (!Array.isArray(self.ignore))
    self.ignore = [self.ignore]

  if (self.ignore.length) {
    self.ignore = self.ignore.map(ignoreMap)
  }
}

// ignore patterns are always in dot:true mode.
function ignoreMap (pattern) {
  var gmatcher = null
  if (pattern.slice(-3) === '/**') {
    var gpattern = pattern.replace(/(\/\*\*)+$/, '')
    gmatcher = new Minimatch(gpattern, { dot: true })
  }

  return {
    matcher: new Minimatch(pattern, { dot: true }),
    gmatcher: gmatcher
  }
}

function setopts (self, pattern, options) {
  if (!options)
    options = {}

  // base-matching: just use globstar for that.
  if (options.matchBase && -1 === pattern.indexOf("/")) {
    if (options.noglobstar) {
      throw new Error("base matching requires globstar")
    }
    pattern = "**/" + pattern
  }

  self.silent = !!options.silent
  self.pattern = pattern
  self.strict = options.strict !== false
  self.realpath = !!options.realpath
  self.realpathCache = options.realpathCache || Object.create(null)
  self.follow = !!options.follow
  self.dot = !!options.dot
  self.mark = !!options.mark
  self.nodir = !!options.nodir
  if (self.nodir)
    self.mark = true
  self.sync = !!options.sync
  self.nounique = !!options.nounique
  self.nonull = !!options.nonull
  self.nosort = !!options.nosort
  self.nocase = !!options.nocase
  self.stat = !!options.stat
  self.noprocess = !!options.noprocess
  self.absolute = !!options.absolute

  self.maxLength = options.maxLength || Infinity
  self.cache = options.cache || Object.create(null)
  self.statCache = options.statCache || Object.create(null)
  self.symlinks = options.symlinks || Object.create(null)

  setupIgnores(self, options)

  self.changedCwd = false
  var cwd = process.cwd()
  if (!ownProp(options, "cwd"))
    self.cwd = cwd
  else {
    self.cwd = path.resolve(options.cwd)
    self.changedCwd = self.cwd !== cwd
  }

  self.root = options.root || path.resolve(self.cwd, "/")
  self.root = path.resolve(self.root)
  if (process.platform === "win32")
    self.root = self.root.replace(/\\/g, "/")

  // TODO: is an absolute `cwd` supposed to be resolved against `root`?
  // e.g. { cwd: '/test', root: __dirname } === path.join(__dirname, '/test')
  self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd)
  if (process.platform === "win32")
    self.cwdAbs = self.cwdAbs.replace(/\\/g, "/")
  self.nomount = !!options.nomount

  // disable comments and negation in Minimatch.
  // Note that they are not supported in Glob itself anyway.
  options.nonegate = true
  options.nocomment = true

  self.minimatch = new Minimatch(pattern, options)
  self.options = self.minimatch.options
}

function finish (self) {
  var nou = self.nounique
  var all = nou ? [] : Object.create(null)

  for (var i = 0, l = self.matches.length; i < l; i ++) {
    var matches = self.matches[i]
    if (!matches || Object.keys(matches).length === 0) {
      if (self.nonull) {
        // do like the shell, and spit out the literal glob
        var literal = self.minimatch.globSet[i]
        if (nou)
          all.push(literal)
        else
          all[literal] = true
      }
    } else {
      // had matches
      var m = Object.keys(matches)
      if (nou)
        all.push.apply(all, m)
      else
        m.forEach(function (m) {
          all[m] = true
        })
    }
  }

  if (!nou)
    all = Object.keys(all)

  if (!self.nosort)
    all = all.sort(self.nocase ? alphasorti : alphasort)

  // at *some* point we statted all of these
  if (self.mark) {
    for (var i = 0; i < all.length; i++) {
      all[i] = self._mark(all[i])
    }
    if (self.nodir) {
      all = all.filter(function (e) {
        var notDir = !(/\/$/.test(e))
        var c = self.cache[e] || self.cache[makeAbs(self, e)]
        if (notDir && c)
          notDir = c !== 'DIR' && !Array.isArray(c)
        return notDir
      })
    }
  }

  if (self.ignore.length)
    all = all.filter(function(m) {
      return !isIgnored(self, m)
    })

  self.found = all
}

function mark (self, p) {
  var abs = makeAbs(self, p)
  var c = self.cache[abs]
  var m = p
  if (c) {
    var isDir = c === 'DIR' || Array.isArray(c)
    var slash = p.slice(-1) === '/'

    if (isDir && !slash)
      m += '/'
    else if (!isDir && slash)
      m = m.slice(0, -1)

    if (m !== p) {
      var mabs = makeAbs(self, m)
      self.statCache[mabs] = self.statCache[abs]
      self.cache[mabs] = self.cache[abs]
    }
  }

  return m
}

// lotta situps...
function makeAbs (self, f) {
  var abs = f
  if (f.charAt(0) === '/') {
    abs = path.join(self.root, f)
  } else if (isAbsolute(f) || f === '') {
    abs = f
  } else if (self.changedCwd) {
    abs = path.resolve(self.cwd, f)
  } else {
    abs = path.resolve(f)
  }

  if (process.platform === 'win32')
    abs = abs.replace(/\\/g, '/')

  return abs
}


// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
function isIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path))
  })
}

function childrenIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return !!(item.gmatcher && item.gmatcher.match(path))
  })
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 17 */
/***/ (function(module, exports) {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var wrappy = __webpack_require__(17)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

ShExWebApp = (function () {
  let shapeMap = __webpack_require__(20)
  return Object.assign({}, {
    ShExTerm:       __webpack_require__(3),
    Util:           __webpack_require__(4),
    Validator:      __webpack_require__(24),
    Writer:         __webpack_require__(11),
    Api:            __webpack_require__(26),
    Parser:         __webpack_require__(12),
    ShapeMap:       shapeMap,
    ShapeMapParser: shapeMap.Parser,
  })
})()

if (true)
  module.exports = ShExWebApp;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * See README for description.
 */

const ShapeMapCjsModule = (function () {
  const symbols = __webpack_require__(8)

  // Write the parser object directly into the symbols so the caller shares a
  // symbol space with ShapeMapJison for e.g. start and focus.
  symbols.Parser = __webpack_require__(21)
  return symbols
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShapeMapCjsModule;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

const ShapeMapParser = (function () {

// stolen as much as possible from SPARQL.js
if (true) {
  ShapeMapJison = __webpack_require__(22).Parser; // node environment
} else {}

// Creates a ShEx parser with the given pre-defined prefixes
const prepareParser = function (baseIRI, schemaMeta, dataMeta) {
  // Create a copy of the prefixes
  const schemaBase = schemaMeta.base;
  const schemaPrefixesCopy = {};
  for (const prefix in schemaMeta.prefixes || {})
    schemaPrefixesCopy[prefix] = schemaMeta.prefixes[prefix];
  const dataBase = dataMeta.base;
  const dataPrefixesCopy = {};
  for (const prefix in dataMeta.prefixes || {})
    dataPrefixesCopy[prefix] = dataMeta.prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  const parser = new ShapeMapJison();

  function runParser () {
    ShapeMapJison._schemaPrefixes = Object.create(schemaPrefixesCopy);
    ShapeMapJison._setSchemaBase(schemaBase);
    ShapeMapJison._dataPrefixes = Object.create(dataPrefixesCopy);
    ShapeMapJison._setDataBase(dataBase);
    ShapeMapJison._setFileName(baseIRI);
    try {
      return ShapeMapJison.prototype.parse.apply(parser, arguments);
    } catch (e) {
      // use the lexer's pretty-printing
      const lineNo = "lexer" in parser.yy ? parser.yy.lexer.yylineno + 1 : 1;
      const pos = "lexer" in parser.yy ? parser.yy.lexer.showPosition() : "";
      const t = Error(`${baseIRI}(${lineNo}): ${e.message}\n${pos}`);
      Error.captureStackTrace(t, runParser);
      parser.reset();
      throw t;
    }
  }
  parser.parse = runParser;
  parser._setSchemaBase = function (base) {
    ShapeMapJison._setSchemaBase;
    schemaBase = base;
  }
  parser._setDataBase = function (base) {
    ShapeMapJison._setDataBase;
    dataBase = base;
  }
  parser._setFileName = ShapeMapJison._setFileName;
  parser.reset = ShapeMapJison.reset;
  return parser;
}

return {
  construct: prepareParser
};
})();

if (true)
  module.exports = ShapeMapParser;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, module) {/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var ShapeMapJison = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,7],$V1=[1,16],$V2=[1,11],$V3=[1,14],$V4=[1,25],$V5=[1,24],$V6=[1,21],$V7=[1,22],$V8=[1,23],$V9=[1,28],$Va=[1,26],$Vb=[1,27],$Vc=[1,29],$Vd=[1,12],$Ve=[1,13],$Vf=[1,15],$Vg=[4,9],$Vh=[16,19,20,21],$Vi=[2,25],$Vj=[16,19,20,21,37],$Vk=[16,19,20,21,31,34,37,39,46,48,50,53,54,55,56,76,77,78,79,80,81,82],$Vl=[4,9,16,19,20,21,37,43,74,75],$Vm=[4,9,43],$Vn=[29,46,80,81,82],$Vo=[4,9,42,43],$Vp=[1,59],$Vq=[46,79,80,81,82],$Vr=[31,34,39,46,48,50,53,54,55,56,76,77,78,80,81,82],$Vs=[1,94],$Vt=[1,85],$Vu=[1,86],$Vv=[1,87],$Vw=[1,90],$Vx=[1,91],$Vy=[1,92],$Vz=[1,93],$VA=[1,95],$VB=[33,48,49,50,53,54,55,56,63],$VC=[4,9,37,65],$VD=[1,99],$VE=[9,37],$VF=[9,65];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"shapeMap":3,"EOF":4,"pair":5,"Q_O_QGT_COMMA_E_S_Qpair_E_C_E_Star":6,"QGT_COMMA_E_Opt":7,"O_QGT_COMMA_E_S_Qpair_E_C":8,"GT_COMMA":9,"nodeSelector":10,"statusAndShape":11,"Qreason_E_Opt":12,"QjsonAttributes_E_Opt":13,"reason":14,"jsonAttributes":15,"GT_AT":16,"Qstatus_E_Opt":17,"shapeSelector":18,"ATSTART":19,"ATPNAME_NS":20,"ATPNAME_LN":21,"status":22,"objectTerm":23,"triplePattern":24,"IT_SPARQL":25,"string":26,"nodeIri":27,"shapeIri":28,"START":29,"subjectTerm":30,"BLANK_NODE_LABEL":31,"literal":32,"GT_LCURLEY":33,"IT_FOCUS":34,"nodePredicate":35,"O_QobjectTerm_E_Or_QIT___E_C":36,"GT_RCURLEY":37,"O_QsubjectTerm_E_Or_QIT___E_C":38,"IT__":39,"GT_NOT":40,"GT_OPT":41,"GT_DIVIDE":42,"GT_DOLLAR":43,"O_QAPPINFO_COLON_E_Or_QAPPINFO_SPACE_COLON_E_C":44,"jsonValue":45,"APPINFO_COLON":46,"APPINFO_SPACE_COLON":47,"IT_false":48,"IT_null":49,"IT_true":50,"jsonObject":51,"jsonArray":52,"INTEGER":53,"DECIMAL":54,"DOUBLE":55,"STRING_LITERAL2":56,"Q_O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C_E_Opt":57,"O_QGT_COMMA_E_S_QjsonMember_E_C":58,"jsonMember":59,"Q_O_QGT_COMMA_E_S_QjsonMember_E_C_E_Star":60,"O_QjsonMember_E_S_QGT_COMMA_E_S_QjsonMember_E_Star_C":61,"STRING_LITERAL2_COLON":62,"GT_LBRACKET":63,"Q_O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C_E_Opt":64,"GT_RBRACKET":65,"O_QGT_COMMA_E_S_QjsonValue_E_C":66,"Q_O_QGT_COMMA_E_S_QjsonValue_E_C_E_Star":67,"O_QjsonValue_E_S_QGT_COMMA_E_S_QjsonValue_E_Star_C":68,"rdfLiteral":69,"numericLiteral":70,"booleanLiteral":71,"Q_O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C_E_Opt":72,"O_QLANGTAG_E_Or_QGT_DTYPE_E_S_QnodeIri_E_C":73,"LANGTAG":74,"GT_DTYPE":75,"STRING_LITERAL1":76,"STRING_LITERAL_LONG1":77,"STRING_LITERAL_LONG2":78,"IT_a":79,"IRIREF":80,"PNAME_LN":81,"PNAME_NS":82,"$accept":0,"$end":1},
terminals_: {2:"error",4:"EOF",9:"GT_COMMA",16:"GT_AT",19:"ATSTART",20:"ATPNAME_NS",21:"ATPNAME_LN",25:"IT_SPARQL",29:"START",31:"BLANK_NODE_LABEL",33:"GT_LCURLEY",34:"IT_FOCUS",37:"GT_RCURLEY",39:"IT__",40:"GT_NOT",41:"GT_OPT",42:"GT_DIVIDE",43:"GT_DOLLAR",46:"APPINFO_COLON",47:"APPINFO_SPACE_COLON",48:"IT_false",49:"IT_null",50:"IT_true",53:"INTEGER",54:"DECIMAL",55:"DOUBLE",56:"STRING_LITERAL2",62:"STRING_LITERAL2_COLON",63:"GT_LBRACKET",65:"GT_RBRACKET",74:"LANGTAG",75:"GT_DTYPE",76:"STRING_LITERAL1",77:"STRING_LITERAL_LONG1",78:"STRING_LITERAL_LONG2",79:"IT_a",80:"IRIREF",81:"PNAME_LN",82:"PNAME_NS"},
productions_: [0,[3,1],[3,4],[8,2],[6,0],[6,2],[7,0],[7,1],[5,4],[12,0],[12,1],[13,0],[13,1],[11,3],[11,1],[11,1],[11,1],[17,0],[17,1],[10,1],[10,1],[10,2],[10,2],[18,1],[18,1],[30,1],[30,1],[23,1],[23,1],[24,5],[24,5],[36,1],[36,1],[38,1],[38,1],[22,1],[22,1],[14,2],[15,3],[44,1],[44,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[45,1],[51,3],[58,2],[60,0],[60,2],[61,2],[57,0],[57,1],[59,2],[52,3],[66,2],[67,0],[67,2],[68,2],[64,0],[64,1],[32,1],[32,1],[32,1],[70,1],[70,1],[70,1],[69,2],[73,1],[73,2],[72,0],[72,1],[71,1],[71,1],[26,1],[26,1],[26,1],[26,1],[35,1],[35,1],[27,1],[27,1],[27,1],[27,1],[28,1],[28,1],[28,1],[28,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

          return []
        
break;
case 2:

          return [$$[$0-3]].concat($$[$0-2])
        
break;
case 3: case 51: case 59:
this.$ = $$[$0];
break;
case 4: case 60: case 63:
this.$ = [  ];
break;
case 5: case 61:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 8:
this.$ = extend({ node: $$[$0-3] }, $$[$0-2], $$[$0-1], $$[$0]);
break;
case 9: case 11: case 52: case 55: case 74:
this.$ = {  };
break;
case 13:
this.$ = extend({ shape: $$[$0] }, $$[$0-1]);
break;
case 14:
this.$ = { shape: ShapeMap.start };
break;
case 15:

        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = { shape: expandPrefix(Parser._schemaPrefixes, $$[$0].substr(0, $$[$0].length - 1)) };
      
break;
case 16:

        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = { shape: expandPrefix(Parser._schemaPrefixes, $$[$0].substr(0, namePos)) + $$[$0].substr(namePos + 1) };
      
break;
case 17:
this.$ = { status: 'conformant' } // defaults to conformant;
break;
case 18:
this.$ = { status: $$[$0] };
break;
case 21:
this.$ = { type: "Extension", language: "http://www.w3.org/ns/shex#Extensions-sparql", lexical: $$[$0]["@value"] };
break;
case 22:
this.$ = { type: "Extension", language: $$[$0-1], lexical: $$[$0]["@value"] };
break;
case 24:
this.$ = ShapeMap.start;
break;
case 29:
this.$ = { type: "TriplePattern", subject: ShapeMap.focus, predicate: $$[$0-2], object: $$[$0-1] };
break;
case 30:
this.$ = { type: "TriplePattern", subject: $$[$0-3], predicate: $$[$0-2], object: ShapeMap.focus };
break;
case 32: case 34: case 42:
this.$ = null;
break;
case 35:
this.$ = 'nonconformant';
break;
case 36:
this.$ = 'unknown';
break;
case 37:
this.$ = { reason: $$[$0] };
break;
case 38:
this.$ = { appinfo: $$[$0] };
break;
case 41:
this.$ = false;
break;
case 43:
this.$ = true;
break;
case 46: case 47: case 48:
this.$ = parseFloat($$[$0]);
break;
case 49:
this.$ = unescapeString($$[$0], 1)["@value"];
break;
case 50: case 58:
this.$ = $$[$0-1];
break;
case 53: case 54: case 71:
this.$ = extend($$[$0-1], $$[$0]);
break;
case 57:

        this.$ = {  };
        const t = $$[$0-1].substr(0, $$[$0-1].length - 1).trim(); // remove trailing ':' and spaces
        this.$[unescapeString(t, 1)["@value"]] = $$[$0];
      
break;
case 62:
this.$ = [$$[$0-1]].concat($$[$0]);
break;
case 68:
this.$ = createLiteral($$[$0], XSD_INTEGER);
break;
case 69:
this.$ = createLiteral($$[$0], XSD_DECIMAL);
break;
case 70:
this.$ = createLiteral($$[$0], XSD_DOUBLE);
break;
case 72:
this.$ = obj("@language", $$[$0].substr(1).toLowerCase());
break;
case 73:
this.$ = obj("@type", $$[$0]);
break;
case 76:
this.$ = createLiteral("true", XSD_BOOLEAN);
break;
case 77:
this.$ = createLiteral("false", XSD_BOOLEAN);
break;
case 78: case 80:
this.$ = unescapeString($$[$0], 1);
break;
case 79: case 81:
this.$ = unescapeString($$[$0], 3);
break;
case 83:
this.$ = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
break;
case 84:

        const node = unescapeText($$[$0].slice(1,-1), {});
        this.$ = Parser._dataBase === null || absoluteIRI.test(node) ? node : _resolveDataIRI(node)
      
break;
case 85: case 86:
this.$ = parsePName($$[$0], Parser._dataPrefixes);
break;
case 87:
this.$ = expandPrefix(Parser._dataPrefixes, $$[$0].substr(0, $$[$0].length - 1));;
break;
case 88:

        const shape = unescapeText($$[$0].slice(1,-1), {});
        this.$ = Parser._schemaBase === null || absoluteIRI.test(shape) ? shape : _resolveSchemaIRI(shape)
      
break;
case 89: case 90:
this.$ = parsePName($$[$0], Parser._schemaPrefixes);
break;
case 91:
this.$ = expandPrefix(Parser._schemaPrefixes, $$[$0].substr(0, $$[$0].length - 1));;
break;
}
},
table: [{3:1,4:[1,2],5:3,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},{1:[3]},{1:[2,1]},o($Vg,[2,4],{6:30}),{11:31,16:[1,32],19:[1,33],20:[1,34],21:[1,35]},o($Vh,[2,19]),o($Vh,[2,20]),{26:36,56:$V9,76:$Va,77:$Vb,78:$Vc},o($Vh,$Vi,{26:37,56:$V9,76:$Va,77:$Vb,78:$Vc}),o($Vj,[2,27]),o($Vj,[2,28]),{27:42,30:40,31:$V1,34:[1,38],38:39,39:[1,41],46:$V3,80:$Vd,81:$Ve,82:$Vf},o($Vk,[2,84]),o($Vk,[2,85]),o($Vk,[2,86]),o($Vk,[2,87]),o([16,19,20,21,37,46,79,80,81,82],[2,26]),o($Vj,[2,65]),o($Vj,[2,66]),o($Vj,[2,67]),o($Vj,[2,74],{72:43,73:44,74:[1,45],75:[1,46]}),o($Vj,[2,68]),o($Vj,[2,69]),o($Vj,[2,70]),o($Vj,[2,76]),o($Vj,[2,77]),o($Vl,[2,78]),o($Vl,[2,79]),o($Vl,[2,80]),o($Vl,[2,81]),{4:[2,6],7:47,8:48,9:[1,49]},o($Vm,[2,9],{12:50,14:51,42:[1,52]}),o($Vn,[2,17],{17:53,22:54,40:[1,55],41:[1,56]}),o($Vo,[2,14]),o($Vo,[2,15]),o($Vo,[2,16]),o($Vh,[2,21]),o($Vh,[2,22]),{27:58,35:57,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},{27:58,35:60,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},o($Vq,[2,33]),o($Vq,[2,34]),o([37,46,79,80,81,82],$Vi),o($Vj,[2,71]),o($Vj,[2,75]),o($Vj,[2,72]),{27:61,46:$V3,80:$Vd,81:$Ve,82:$Vf},{4:[1,62]},o($Vg,[2,5]),{4:[2,7],5:63,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vg,[2,11],{13:64,15:65,43:[1,66]}),o($Vm,[2,10]),{26:67,56:$V9,76:$Va,77:$Vb,78:$Vc},{18:68,28:69,29:[1,70],46:[1,73],80:[1,71],81:[1,72],82:[1,74]},o($Vn,[2,18]),o($Vn,[2,35]),o($Vn,[2,36]),{23:76,26:20,27:42,30:9,31:$V1,32:10,36:75,39:[1,77],46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vr,[2,82]),o($Vr,[2,83]),{34:[1,78]},o($Vj,[2,73]),{1:[2,2]},o($Vg,[2,3]),o($Vg,[2,8]),o($Vg,[2,12]),{44:79,46:[1,80],47:[1,81]},o($Vm,[2,37]),o($Vo,[2,13]),o($Vo,[2,23]),o($Vo,[2,24]),o($Vo,[2,88]),o($Vo,[2,89]),o($Vo,[2,90]),o($Vo,[2,91]),{37:[1,82]},{37:[2,31]},{37:[2,32]},{37:[1,83]},{33:$Vs,45:84,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VB,[2,39]),o($VB,[2,40]),o($Vh,[2,29]),o($Vh,[2,30]),o($Vg,[2,38]),o($VC,[2,41]),o($VC,[2,42]),o($VC,[2,43]),o($VC,[2,44]),o($VC,[2,45]),o($VC,[2,46]),o($VC,[2,47]),o($VC,[2,48]),o($VC,[2,49]),{37:[2,55],57:96,59:98,61:97,62:$VD},{33:$Vs,45:102,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA,64:100,65:[2,63],68:101},{37:[1,103]},{37:[2,56]},o($VE,[2,52],{60:104}),{33:$Vs,45:105,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},{65:[1,106]},{65:[2,64]},o($VF,[2,60],{67:107}),o($VC,[2,50]),{9:[1,109],37:[2,54],58:108},o($VE,[2,57]),o($VC,[2,58]),{9:[1,111],65:[2,62],66:110},o($VE,[2,53]),{59:112,62:$VD},o($VF,[2,61]),{33:$Vs,45:113,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VE,[2,51]),o($VF,[2,59])],
defaultActions: {2:[2,1],62:[2,2],76:[2,31],77:[2,32],97:[2,56],101:[2,64]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: lexer.yylloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

  /*
    ShapeMap parser in the Jison parser generator format.
  */

  const ShapeMap = __webpack_require__(8);

  // Common namespaces and entities
  const XSD = 'http://www.w3.org/2001/XMLSchema#',
      XSD_INTEGER  = XSD + 'integer',
      XSD_DECIMAL  = XSD + 'decimal',
      XSD_FLOAT   = XSD + 'float',
      XSD_DOUBLE   = XSD + 'double',
      XSD_BOOLEAN  = XSD + 'boolean';

  const numericDatatypes = [
      XSD + "integer",
      XSD + "decimal",
      XSD + "float",
      XSD + "double",
      XSD + "string",
      XSD + "boolean",
      XSD + "dateTime",
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

  const absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
    schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

  const numericFacets = ["mininclusive", "minexclusive",
                       "maxinclusive", "maxexclusive"];

  // Extends a base object with properties of other objects
  function extend (base) {
    if (!base) base = {};
    for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (let name in arg)
        base[name] = arg[name];
    return base;
  }

  // N3.js:lib/N3Parser.js<0.4.5>:58 with
  //   s/this\./Parser./g
  // ### `_setSchemaBase` sets the base IRI to resolve relative IRIs.
  Parser._setSchemaBase = function (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (Parser._schemaBase = baseIRI) {
      Parser._schemaBasePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      Parser._schemaBaseRoot   = baseIRI[0];
      Parser._schemaBaseScheme = baseIRI[1];
    }
  }
  Parser._setDataBase = function (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (Parser._dataBase = baseIRI) {
      Parser._dataBasePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      Parser._dataBaseRoot   = baseIRI[0];
      Parser._dataBaseScheme = baseIRI[1];
    }
  }

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./Parser./g
  //   s/token/iri/
  // ### `_resolveSchemaIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  function _resolveSchemaIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return Parser._schemaBase;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return Parser._schemaBase + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return Parser._schemaBase.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? Parser._schemaBaseScheme : Parser._schemaBaseRoot) + _removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return _removeDotSegments(Parser._schemaBasePath + iri);
    }
    }
  }
  function _resolveDataIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return Parser._dataBase;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return Parser._dataBase + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return Parser._dataBase.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? Parser._dataBaseScheme : Parser._dataBaseRoot) + _removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return _removeDotSegments(Parser._dataBasePath + iri);
    }
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986.
  function _removeDotSegments (iri) {
    // Don't modify the IRI if it does not contain any dot segments
    if (!dotSegments.test(iri))
      return iri;

    // Start with an imaginary slash before the IRI in order to resolve trailing './' and '../'
    const result = '', length = iri.length, i = -1, pathStart = -1, segmentStart = 0, next = '/';

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

  function obj() {
    const ret = {  };
    for (let i = 0; i < arguments.length; i+= 2) {
      ret[arguments[i]] = arguments[i+1];
    }
    return ret;
  }

  // Creates a literal with the given value and type
  function createLiteral(value, type) {
    return obj("@value", value, "@type", type );
  }

  // Creates a new blank node identifier
  function blank() {
    return '_:b' + blankId++;
  };
  const blankId = 0;
  Parser._resetBlanks = function () { blankId = 0; }
  Parser.reset = function () {
    Parser._prefixes = Parser._imports = Parser.valueExprDefns = Parser.shapes = Parser.productions = Parser.start = Parser.startActs = null; // Reset state.
    Parser._schemaBase = Parser._schemaBasePath = Parser._schemaBaseRoot = Parser._schemaBaseIRIScheme = null;
  }
  let _fileName; // for debugging
  Parser._setFileName = function (fn) { _fileName = fn; }

  // Regular expression and replacement strings to escape strings
  const stringEscapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                                   't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
      pnameEscapeReplacements = {
        '\\': '\\', "'": "'", '"': '"',
        'n': '\n', 'r': '\r', 't': '\t', 'f': '\f', 'b': '\b',
        '_': '_', '~': '~', '.': '.', '-': '-', '!': '!', '$': '$', '&': '&',
        '(': '(', ')': ')', '*': '*', '+': '+', ',': ',', ';': ';', '=': '=',
        '/': '/', '?': '?', '#': '#', '@': '@', '%': '%',
      };


  // Translates string escape codes in the string into their textual equivalent
  function unescapeString(string, trimLength) {
    string = string.substring(trimLength, string.length - trimLength);
    return obj("@value", unescapeText(string, stringEscapeReplacements));
  }

  function unescapeLangString(string, trimLength) {
    const at = string.lastIndexOf("@");
    const lang = string.substr(at);
    string = string.substr(0, at);
    const u = unescapeString(string, trimLength);
    return extend(u, obj("@language", lang.substr(1).toLowerCase()));
  }

  function error (msg) {
    Parser.reset();
    throw new Error(msg);
  }

  // Parse a prefix out of a PName or throw Error
  function parsePName (pname, prefixes) {
    const namePos = pname.indexOf(':');
    return expandPrefix(prefixes, pname.substr(0, namePos)) + unescapeText(pname.substr(namePos + 1), pnameEscapeReplacements);
  }

  // Expand declared prefix or throw Error
  function expandPrefix (prefixes, prefix) {
    if (!(prefix in prefixes))
      error('Parse error; unknown prefix: ' + prefix);
    return prefixes[prefix];
  }

  // Add a shape to the map
  function addShape (label, shape) {
    if (Parser.productions && label in Parser.productions)
      error("Structural error: "+label+" is a shape");
    if (!Parser.shapes)
      Parser.shapes = {};
    if (label in Parser.shapes) {
      if (Parser.options.duplicateShape === "replace")
        Parser.shapes[label] = shape;
      else if (Parser.options.duplicateShape !== "ignore")
        error("Parse error: "+label+" already defined");
    } else
      Parser.shapes[label] = shape;
  }

  // Add a production to the map
  function addProduction (label, production) {
    if (Parser.shapes && label in Parser.shapes)
      error("Structural error: "+label+" is a shape");
    if (!Parser.productions)
      Parser.productions = {};
    if (label in Parser.productions) {
      if (Parser.options.duplicateShape === "replace")
        Parser.productions[label] = production;
      else if (Parser.options.duplicateShape !== "ignore")
        error("Parse error: "+label+" already defined");
    } else
      Parser.productions[label] = production;
  }

  function shapeJunction (type, container, elts) {
    if (elts.length === 0) {
      return container;
    } else if (container.type === type) {
      container.shapeExprs = container.shapeExprs.concat(elts);
      return container;
    } else {
      return { type: type, shapeExprs: [container].concat(elts) };
    }
  }

  const EmptyObject = {  };
  const EmptyShape = { type: "Shape" };

  // <?INCLUDE from ShExUtil. Factor into `rdf-token` module? ?>
  /**
   * unescape numerics and allowed single-character escapes.
   * throws: if there are any unallowed sequences
   */
  function unescapeText (string, replacements) {
    const regex = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g;
    try {
      string = string.replace(regex, function (sequence, unicode4, unicode8, escapedChar) {
        let charCode;
        if (unicode4) {
          charCode = parseInt(unicode4, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          return String.fromCharCode(charCode);
        }
        else if (unicode8) {
          charCode = parseInt(unicode8, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          if (charCode < 0xFFFF) return String.fromCharCode(charCode);
          return String.fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
        }
        else {
          const replacement = replacements[escapedChar];
          if (!replacement) throw new Error("no replacement found for '" + escapedChar + "'");
          return replacement;
        }
      });
      return string;
    }
    catch (error) { console.warn(error); return ''; }
  }
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function(match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex () {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin (condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState () {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules () {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState (n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState (condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/**/
break;
case 1:return 47;
break;
case 2:return 62;
break;
case 3:return 34;
break;
case 4:return 29;
break;
case 5:return 19;
break;
case 6:return 25;
break;
case 7:return 21;
break;
case 8:return 20;
break;
case 9:return 74;
break;
case 10:return 81;
break;
case 11:return 46;
break;
case 12:return 82;
break;
case 13:return 55;
break;
case 14:return 54;
break;
case 15:return 53;
break;
case 16:return 80;
break;
case 17:return 31;
break;
case 18:return 77;
break;
case 19:return 78;
break;
case 20:return 76;
break;
case 21:return 56;
break;
case 22:return 79;
break;
case 23:return 9;
break;
case 24:return 33;
break;
case 25:return 37;
break;
case 26:return 16;
break;
case 27:return 40;
break;
case 28:return 41;
break;
case 29:return 42;
break;
case 30:return 43;
break;
case 31:return 63;
break;
case 32:return 65;
break;
case 33:return 75;
break;
case 34:return 39;
break;
case 35:return 50;
break;
case 36:return 48;
break;
case 37:return 49;
break;
case 38:return 4;
break;
case 39:return 'unexpected word "'+yy_.yytext+'"';
break;
case 40:return 'invalid character '+yy_.yytext;
break;
}
},
rules: [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(appinfo[\u0020\u000A\u0009]+:))/,/^(?:("([^\u0022\u005C\u000A\u000D]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"[\u0020\u000A\u0009]*:))/,/^(?:([Ff][Oo][Cc][Uu][Ss]))/,/^(?:([Ss][Tt][Aa][Rr][Tt]))/,/^(?:(@[Ss][Tt][Aa][Rr][Tt]))/,/^(?:([Ss][Pp][Aa][Rr][Qq][Ll]))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(appinfo:))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:a\b)/,/^(?:,)/,/^(?:\{)/,/^(?:\})/,/^(?:@)/,/^(?:!)/,/^(?:\?)/,/^(?:\/)/,/^(?:\$)/,/^(?:\[)/,/^(?:\])/,/^(?:\^\^)/,/^(?:_\b)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:null\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (true) {
exports.parser = ShapeMapJison;
exports.Parser = ShapeMapJison.Parser;
exports.parse = function () { return ShapeMapJison.parse.apply(ShapeMapJison, arguments); };
exports.main = function commonjsMain (args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = __webpack_require__(2).readFileSync(__webpack_require__(1).normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if ( true && __webpack_require__.c[__webpack_require__.s] === module) {
  exports.main(process.argv.slice(1));
}
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0), __webpack_require__(9)(module)))

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var HierarchyClosure = (function () {
  /** create a hierarchy object
   * This object keeps track of direct children and parents as well as transitive children and parents.
   */
  function makeHierarchy () {
    let roots = {}
    let parents = {}
    let children = {}
    let holders = {}
    return {
      add: function (parent, child) {
        if (// test if this is a novel entry.
          (parent in children && children[parent].indexOf(child) !== -1)) {
          return
        }
        let target = parent in holders
          ? getNode(parent)
          : (roots[parent] = getNode(parent)) // add new parents to roots.
        let value = getNode(child)

        target[child] = value
        delete roots[child]

        // // maintain hierarchy (direct and confusing)
        // children[parent] = children[parent].concat(child, children[child])
        // children[child].forEach(c => parents[c] = parents[c].concat(parent, parents[parent]))
        // parents[child] = parents[child].concat(parent, parents[parent])
        // parents[parent].forEach(p => children[p] = children[p].concat(child, children[child]))

        // maintain hierarchy (generic and confusing)
        updateClosure(children, parents, child, parent)
        updateClosure(parents, children, parent, child)
        function updateClosure (container, members, near, far) {
          container[far] = container[far].filter(
            e => /* e !== near && */ container[near].indexOf(e) === -1
          ).concat(container[near].indexOf(near) === -1 ? [near] : [], container[near])
          container[near].forEach(
            n => (members[n] = members[n].filter(
              e => e !== far && members[far].indexOf(e) === -1
            ).concat(members[far].indexOf(far) === -1 ? [far] : [], members[far]))
          )
        }

        function getNode (node) {
          if (!(node in holders)) {
            parents[node] = []
            children[node] = []
            holders[node] = {}
          }
          return holders[node]
        }
      },
      roots: roots,
      parents: parents,
      children: children
    }
  }

  function depthFirst (n, f, p) {
    return Object.keys(n).reduce((ret, k) => {
      return ret.concat(
        depthFirst(n[k], f, k),
        p ? f(k, p) : []) // outer invocation can have null parent
    }, [])
  }

  return { create: makeHierarchy, depthFirst }
})()

/* istanbul ignore next */
if (true) {
  module.exports = HierarchyClosure
}


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */

const ShExValidatorCjsModule = (function () {
var UNBOUNDED = -1;

// interface constants
var Start = { term: "START" }
var InterfaceOptions = {
  "coverage": {
    "firstError": "fail on first error (usually used with eval-simple-1err)",
    "exhaustive": "find as many errors as possible (usually used with eval-threaded-nerr)"
  }
};

var VERBOSE = "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

var ProgramFlowError = { type: "ProgramFlowError", errors: { type: "UntrackedError" } };

var ShExTerm = __webpack_require__(3);
let ShExVisitor = __webpack_require__(10);

function getLexicalValue (term) {
  return ShExTerm.isIRI(term) ? term :
    ShExTerm.isLiteral(term) ? ShExTerm.getLiteralValue(term) :
    term.substr(2); // bnodes start with "_:"
}


var XSD = "http://www.w3.org/2001/XMLSchema#";
var integerDatatypes = [
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

var decimalDatatypes = [
  XSD + "decimal",
].concat(integerDatatypes);

var numericDatatypes = [
  XSD + "float",
  XSD + "double"
].concat(decimalDatatypes);

var numericParsers = {};
numericParsers[XSD + "integer"] = function (label, parseError) {
  if (!(label.match(/^[+-]?[0-9]+$/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return parseInt(label);
};
numericParsers[XSD + "decimal"] = function (label, parseError) {
  if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for decimal?
    parseError("illegal decimal value '" + label + "'");
  }
  return parseFloat(label);
};
const DECIMAL_REGEX = /^[+\-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+\-]?[0-9]+)?$/;
numericParsers[XSD + "float"  ] = function (label, parseError) {
  if (label === "NaN") return NaN;
  if (label === "INF") return Infinity;
  if (label === "-INF") return -Infinity;
  if (!(label.match(DECIMAL_REGEX))) { // XSD has no pattern for float?
    parseError("illegal float value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "double" ] = function (label, parseError) {
  if (label === "NaN") return NaN;
  if (label === "INF") return Infinity;
  if (label === "-INF") return -Infinity;
  if (!(label.match(DECIMAL_REGEX))) {
    parseError("illegal double value '" + label + "'");
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
  var parms = ranges[datatype.substr(XSD.length)];
  if (!parms) throw Error("unexpected datatype: " + datatype);
  if (value < parms.min) {
    parseError("\"" + value + "\"^^<" + datatype + "> is less than the min:", parms.min);
  } else if (value > parms.max) {
    parseError("\"" + value + "\"^^<" + datatype + "> is greater than the max:", parms.min);
  }
};

/*
function intSubType (spec, label, parseError) {
  var ret = numericParsers[XSD + "integer"](label, parseError);
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

var stringTests = {
  length   : function (v, l) { return v.length === l; },
  minlength: function (v, l) { return v.length  >= l; },
  maxlength: function (v, l) { return v.length  <= l; }
};

var numericValueTests = {
  mininclusive  : function (n, m) { return n >= m; },
  minexclusive  : function (n, m) { return n >  m; },
  maxinclusive  : function (n, m) { return n <= m; },
  maxexclusive  : function (n, m) { return n <  m; }
};

var decimalLexicalTests = {
  totaldigits   : function (v, d) {
    var m = v.match(/[0-9]/g);
    return m && m.length <= d;
  },
  fractiondigits: function (v, d) {
    var m = v.match(/^[+-]?[0-9]*\.?([0-9]*)$/);
    return m && m[1].length <= d;
  }
};

        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          var ret = { value: ShExTerm.getLiteralValue(term) };
          var dt = ShExTerm.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          var lang = ShExTerm.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }

    function isTerm (t) {
      return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
        return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
      }, true);
    }

/* ShExValidator_constructor - construct an object for validating a schema.
 *
 * schema: a structure produced by a ShEx parser or equivalent.
 * options: object with controls for
 *   lax(true): boolean: whine about missing types in schema.
 *   diagnose(false): boolean: makde validate return a structure with errors.
 */
function ShExValidator_constructor(schema, options) {
  if (!(this instanceof ShExValidator_constructor))
    return new ShExValidator_constructor(schema, options);
  let index = schema._index || ShExVisitor.index(schema)
  this.type = "ShExValidator";
  options = options || {};
  this.options = options;
  this.options.coverage = this.options.coverage || "exhaustive";
  if (!("noCache" in options && options.noCache))
    this.known = {};

  var _ShExValidator = this;
  this.schema = schema;
  this._expect = this.options.lax ? noop : expect; // report errors on missing types.
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function () {  }; // included in case we need it later.
  // var regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
  var regexModule = this.options.regexModule || __webpack_require__(25);

  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  this.getAST = function () {
    return {
      type: "AST",
      shapes: schema.shapes.reduce(function (ret, shape) {
        ret[shape.id] = {
          type: "ASTshape",
          expression: _compileShapeToAST(shape.expression, [], _ShExValidator.schema)
        };
        return ret;
      }, {})
    };
  };

  /* indexTripleConstraints - compile regular expression and index triple constraints
   */
  this.indexTripleConstraints = function (expression) {
    // list of triple constraints from (:p1 ., (:p2 . | :p3 .))
    var tripleConstraints = [];

    if (expression)
      indexTripleConstraints_dive(expression);
    return tripleConstraints;

    function indexTripleConstraints_dive (expr) {
      if (typeof expr === "string") // Inclusion
        return indexTripleConstraints_dive(index.tripleExprs[expr]);

      else if (expr.type === "TripleConstraint") {
        tripleConstraints.push(expr);
        return [tripleConstraints.length - 1]; // index of expr
      }

      else if (expr.type === "OneOf" || expr.type === "EachOf")
        return expr.expressions.reduce(function (acc, nested) {
          return acc.concat(indexTripleConstraints_dive(nested));
        }, []);

      else if (expr.type === "NestedShape")
        return [];

      // @@TODO shape.abstract, shape.extends
      else if (expr.type !== "ValueComparison" && expr.type !== "Unique")
        runtimeError("unexpected expr type: " + expr.type);
    };
  };

  /* emptyTracker - a tracker that does nothing
   */
  this.emptyTracker = function () {
    var noop = x => x;
    return {
      recurse: noop,
      known: noop,
      enter: function (point, label) { ++this.depth; },
      exit: function (point, label, ret) { --this.depth; },
      depth: 0
    };
  };

  /* validate - test point in db against the schema for labelOrShape
   * depth: level of recurssion; for logging.
   */
  this.validate = function (db, point, label, tracker, seen, uniques) {
    // default to schema's start shape
    if (typeof point === "object" && "termType" in point) {
      point = ShExTerm.internalTerm(point)
    }
    if (typeof point === "object") {
      var shapeMap = point;
      if (this.options.results === "api") {
        return shapeMap.map(pair => {
          var time = new Date();
          var res = this.validate(db, pair.node, pair.shape, label, tracker); // really tracker and seen
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
      var results = shapeMap.reduce((ret, pair) => {
        var res = this.validate(db, pair.node, pair.shape, label, tracker); // really tracker and seen
        return "errors" in res ?
          { passes: ret.passes, failures: ret.failures.concat(res) } :
          { passes: ret.passes.concat(res), failures: ret.failures } ;
      }, {passes: [], failures: []});
      if (false) { var _add, ret; }
      if (results.failures.length > 0) {
        return results.failures.length !== 1 ?
          { type: "FailureList", errors: results.failures } :
          results.failures [0];
      } else {
        return results.passes.length !== 1 ?
          { type: "SolutionList", solutions: results.passes } :
          results.passes [0];
      }
    }

    var outside = tracker === undefined;
    // logging stuff
    if (!tracker)
      tracker = this.emptyTracker();
    if (!label || label === Start) {
      if (!schema.start)
        runtimeError("start production not defined");
    }
    if (seen === undefined)
      seen = {};
    if (uniques === undefined)
      uniques = {};
    // if (typeof labelOrShape !== "string")  // !! deprecated?
    //   return this._validateShapeExpr(db, point, labelOrShape, "_: -start-", seen, uniques);

    var shape = null;
    if (label == Start) {
      shape = schema.start;
    } else if (!("shapes" in this.schema) || this.schema.shapes.length === 0) {
      runtimeError("shape " + label + " not found; no shapes in schema");
    } else if (label in index.shapeExprs) {
      shape = index.shapeExprs[label]
    } else {
      runtimeError("shape " + label + " not found in:\n" + Object.keys(index.shapeExprs || []).map(s => "  " + s).join("\n"));
    }
    if (typeof label !== "string")
      return this._validateShapeExpr(db, point, shape, Start, tracker, seen);

    var seenKey = point + "@" + (label === Start ? "_: -start-" : label);
    if (seenKey in seen)
      return tracker.recurse({
        type: "Recursion",
        node: ldify(point),
        shape: label
      });
    if ("known" in this && seenKey in this.known)
      return tracker.known(this.known[seenKey]);
    seen[seenKey] = { point: point, shape: label };
    tracker.enter(point, label);
    var ret = this._validateShapeExpr(db, point, shape, label, tracker, seen, uniques);
    tracker.exit(point, label, ret);
    delete seen[seenKey];
    if ("known" in this)
      this.known[seenKey] = ret;
    if ("startActs" in schema && outside) {
      ret.startActs = schema.startActs;
    }
    return ret;
  }

  this._validateShapeExpr = function (db, point, shapeExpr, shapeLabel, tracker, seen, uniques) {
    if (point === "")
      throw Error("validation needs a valid focus node");
    if (typeof shapeExpr === "string") { // ShapeRef
      return this._validateShapeExpr(db, point, index.shapeExprs[shapeExpr], shapeExpr, tracker, seen, uniques);
    } else if (shapeExpr.type === "NodeConstraint") {
      var sub = this._errorsMatchingNodeConstraint(point, shapeExpr, null);
      return sub.errors && sub.errors.length ? { // @@ when are both conditionals needed?
        type: "Failure",
        node: ldify(point),
        shape: shapeLabel,
        errors: sub.errors.map(function (error) { // !!! just sub.errors?
          return {
            type: "NodeConstraintViolation",
            shapeExpr: shapeExpr,
            error: error
          };
        })
      } : {
        type: "NodeConstraintTest",
        node: ldify(point),
        shape: shapeLabel,
        shapeExpr: shapeExpr
      };
    } else if (shapeExpr.type === "Shape") {
      return this._validateShape(db, point, shapeExpr, shapeLabel, tracker, seen, uniques);
    } else if (shapeExpr.type === "ShapeExternal") {
      return this.options.validateExtern(db, point, shapeLabel, tracker, seen, uniques);
    } else if (shapeExpr.type === "ShapeOr") {
      var errors = [];
      for (var i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        var nested = shapeExpr.shapeExprs[i];
        var sub = this._validateShapeExpr(db, point, nested, shapeLabel, tracker, seen, uniques);
        if ("errors" in sub)
          errors.push(sub);
        else
          return { type: "ShapeOrResults", solution: sub };
      }
      return { type: "ShapeOrFailure", errors: errors };
    } else if (shapeExpr.type === "ShapeNot") {
      var sub = this._validateShapeExpr(db, point, shapeExpr.shapeExpr, shapeLabel, tracker, seen, uniques);
      if ("errors" in sub)
          return { type: "ShapeNotResults", solution: sub };
        else
          return { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      var passes = [];
      var errors = [];
      for (var i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        var nested = shapeExpr.shapeExprs[i];
        var sub = this._validateShapeExpr(db, point, nested, shapeLabel, tracker, seen, uniques);
        if ("errors" in sub)
          errors.push(sub);
        else
          passes.push(sub);
      }
      if (errors.length > 0) {
        return  { type: "ShapeAndFailure", errors: errors};
      }
      return { type: "ShapeAndResults", solutions: passes };
    } else
      throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
  }

  this._validateShape = function (db, point, shape, shapeLabel, tracker, seen, uniques) {
    const _ShExValidator = this;
    const valParms = { db, shapeLabel, tracker, seen, uniques };

    let ret = null;
    const startAcionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in schema) {
      const semActErrors = this.semActHandler.dispatchAll(schema.startActs, null, startAcionStorage)
      if (semActErrors.length)
        return {
          type: "Failure",
          node: ldify(point),
          shape: shapeLabel,
          errors: semActErrors
        }; // some semAct aborted !! return a better error
    }

    const fromDB  = db.getNeighborhood(point, shapeLabel, shape);
    const outgoingLength = fromDB.outgoing.length;
    const neighborhood = fromDB.outgoing.sort(
      (l, r) => l.predicate.localeCompare(r.predicate) || sparqlOrder(l.object, r.object)
    ).concat(fromDB.incoming.sort(
      (l, r) => l.predicate.localeCompare(r.predicate) || sparqlOrder(l.object, r.object)
    ));

    const constraintList = this.indexTripleConstraints(shape.expression);
    const tripleList = matchByPredicate(constraintList, neighborhood, outgoingLength, point, valParms);
    const {misses, extras} = whatsMissing(tripleList, neighborhood, outgoingLength, shape.extra || [])

    const xp = crossProduct(tripleList.constraintList, "NO_TRIPLE_CONSTRAINT");
    const partitionErrors = [];
    const regexEngine = regexModule.compile(schema, shape, index);
    while (xp.next() && ret === null) {
      const errors = []
      const usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      const constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
            _seq(neighborhood.length).map(function () { return 0; });

      // t2tc - array mapping neighborhood index to TripleConstraint
      const t2tcForThisShape = xp.get(); // [0,1,0,3] mapping from triple to constraint

      // Triples not mapped to triple constraints are not allowed in closed shapes.
      if (shape.closed) {
        const unexpectedTriples = neighborhood.slice(0, outgoingLength).filter((t, i) => {
          return t2tcForThisShape[i] === "NO_TRIPLE_CONSTRAINT" && // didn't match a constraint
          extras.indexOf(i) === -1; // wasn't in EXTRAs.
        });
        if (unexpectedTriples.length > 0)
          errors.push({
            errors: [
              {
                type: "ClosedShapeViolation",
                unexpectedTriples: unexpectedTriples
              }
            ]
          });
      }

      // Set usedTriples and constraintMatchCount.
      t2tcForThisShape.forEach(function (tpNumber, ord) {
        if (tpNumber !== "NO_TRIPLE_CONSTRAINT") {
          usedTriples.push(neighborhood[ord]);
          ++constraintMatchCount[tpNumber];
        }
      });
      const tc2t = _constraintToTriples(t2tcForThisShape, constraintList, tripleList); // e.g. [[t0, t2], [t1, t3]]

      const results = regexEngine.match(db, point, constraintList, tc2t, t2tcForThisShape, neighborhood, this.semActHandler, null);
      if ("errors" in results)
        errors.push({ errors: results.errors });

      const possibleRet = { type: "ShapeTest", node: ldify(point), shape: shapeLabel };
      if (errors.length === 0 && Object.keys(results).length > 0) // only include .solution for non-empty pattern
        possibleRet.solution = results;
      if ("semActs" in shape) {
        const semActErrors = this.semActHandler.dispatchAll(shape.semActs, results, possibleRet)
        if (semActErrors.length)
          // some semAct aborted
          errors.push({ errors: semActErrors });
      }

      partitionErrors.push(errors)
      if (errors.length === 0)
        ret = possibleRet
    }
    // end of while(xp.next())

    const missErrors = misses.map(function (miss) {
      const t = neighborhood[miss.tripleNo];
      return {
        type: "TypeMismatch",
        triple: {type: "TestedTriple", subject: t.subject, predicate: t.predicate, object: ldify(t.object)},
        constraint: constraintList[miss.constraintNo],
        errors: miss.errors
      };
    });

    // Report only last errors until we have a better idea.
    const lastErrors = partitionErrors[partitionErrors.length - 1];
    let errors = missErrors.concat(lastErrors.length === 1 ? lastErrors[0].errors : lastErrors);
    if (errors.length > 0)
      ret = {
        type: "Failure",
        node: ldify(point),
        shape: shapeLabel,
        errors: errors
      };

    // remove N3jsTripleToString
    if (VERBOSE)
      neighborhood.forEach(function (t) {
        delete t.toString;
      });

    return addShapeAttributes(shape, ret);
  };

  function matchByPredicate (constraintList, neighborhood, outgoingLength, point, valParms) {
    const outgoing = indexNeighborhood(neighborhood.slice(0, outgoingLength));
    const incoming = indexNeighborhood(neighborhood.slice(outgoingLength));
    return constraintList.reduce(function (ret, constraint, cNo) {

      // subject and object depend on direction of constraint.
      const searchSubject = constraint.inverse ? null : point;
      const searchObject = constraint.inverse ? point : null;
      const index = constraint.inverse ? incoming : outgoing;

      // get triples matching predciate
      const matchPredicate = index.byPredicate[constraint.predicate] ||
            []; // empty list when no triple matches that constraint

      // strip to triples matching value constraints (apart from @<someShape>)
      const matchConstraints = _ShExValidator._triplesMatchingShapeExpr(
        matchPredicate, constraint, valParms
      );

      matchConstraints.hits.forEach(function (evidence) {
        const tNo = neighborhood.indexOf(evidence.triple);
        ret.constraintList[tNo].push(cNo);
        ret.results[cNo][tNo] = evidence.sub;
      });
      matchConstraints.misses.forEach(function (evidence) {
        const tNo = neighborhood.indexOf(evidence.triple);
        ret.misses[tNo] = {constraintNo: cNo, errors: evidence.errors};
      });
      return ret;
    }, { misses: {}, results: _alist(constraintList.length), constraintList:_alist(neighborhood.length) })
  }

  function whatsMissing (tripleList, neighborhood, outgoingLength, extras) {
    const matchedExtras = []; // triples accounted for by EXTRA
    const misses = tripleList.constraintList.reduce(function (ret, constraints, ord) {
      if (constraints.length === 0 &&   // matches no constraints
          ord < outgoingLength &&       // not an incoming triple
          ord in tripleList.misses) {   // predicate matched some constraint(s)
        if (extras.indexOf(neighborhood[ord].predicate) !== -1) {
          matchedExtras.push(ord);
        } else {                        // not declared extra
          ret.push({                    // so it's a missed triple.
            tripleNo: ord,
            constraintNo: tripleList.misses[ord].constraintNo,
            errors: tripleList.misses[ord].errors
          });
        }
      }
      return ret;
    }, []);
    return {misses, extras: matchedExtras}
  }

  function addShapeAttributes (shape, ret) {
    if ("annotations" in shape)
      ret.annotations = shape.annotations;
    return ret;
  }

  // Pivot to triples by constraint.
  function _constraintToTriples (t2tc, constraintList, tripleList) {
    return t2tc.slice().
      reduce(function (ret, cNo, tNo) {
        if (cNo !== "NO_TRIPLE_CONSTRAINT")
          ret[cNo].push({tNo: tNo, res: tripleList.results[cNo][tNo]});
        return ret;
      }, _seq(constraintList.length).map(() => [])); // [length][]
  }

  this._triplesMatchingShapeExpr = function (triples, constraint, valParms) {
    var _ShExValidator = this;
    var misses = [];
    var hits = [];
    triples.forEach(function (triple) {
      var value = constraint.inverse ? triple.subject : triple.object;
      var sub;
      var oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
      var errors = constraint.valueExpr === undefined ?
          undefined :
          (sub = _ShExValidator._errorsMatchingShapeExpr(value, constraint.valueExpr, valParms)).errors;
      if (!errors) {
        hits.push({triple: triple, sub: sub});
      } else if (hits.indexOf(triple) === -1) {
        _ShExValidator.semActHandler.results = JSON.parse(JSON.stringify(oldBindings));
        misses.push({triple: triple, errors: errors});
      }
    });
    return { hits: hits, misses: misses };
  }
  this._errorsMatchingShapeExpr = function (value, valueExpr, valParms) {
    var _ShExValidator = this;
    if (typeof valueExpr === "string") { // ShapeRef
      return _ShExValidator.validate(valParms.db, value, valueExpr, valParms.tracker, valParms.seen, valParms.uniques);
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return _ShExValidator._validateShapeExpr(valParms.db, value, valueExpr, valParms.shapeLabel, valParms.tracker, valParms.seen)
    } else if (valueExpr.type === "ShapeOr") {
      var errors = [];
      for (var i = 0; i < valueExpr.shapeExprs.length; ++i) {
        var nested = valueExpr.shapeExprs[i];
        var sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms);
        if ("errors" in sub)
          errors.push(sub);
        else
          return { type: "ShapeOrResults", solution: sub };
      }
      return { type: "ShapeOrFailure", errors: errors };
    } else if (valueExpr.type === "ShapeAnd") {
      var passes = [];
      for (var i = 0; i < valueExpr.shapeExprs.length; ++i) {
        var nested = valueExpr.shapeExprs[i];
        var sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms);
        if ("errors" in sub)
          return { type: "ShapeAndFailure", errors: [sub] };
        else
          passes.push(sub);
      }
      return { type: "ShapeAndResults", solutions: passes };
    } else if (valueExpr.type === "ShapeNot") {
      var sub = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExpr, valParms);
      // return sub.errors && sub.errors.length ? {} : {
      //   errors: ["Error validating " + value + " as " + JSON.stringify(valueExpr) + ": expected NOT to pass"] };
      var ret = Object.assign({
        type: null,
        focus: value
      }, valueExpr);
      if (sub.errors && sub.errors.length) {
        ret.type = "ShapeNotTest";
        // ret = {};
      } else {
        ret.type = "ShapeNotFailure";
        ret.errors = ["Error validating " + value + " as " + JSON.stringify(valueExpr) + ": expected NOT to pass"]
      }
      return ret;
    } else {
      throw Error("unknown value expression type '" + valueExpr.type + "'");
    }
  };

  /* _errorsMatchingNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  this._errorsMatchingNodeConstraint = function (value, valueExpr, recurse) {
    var errors = [];
    var label = ShExTerm.isLiteral(value) ? ShExTerm.getLiteralValue(value) :
      ShExTerm.isBlank(value) ? value.substring(2) :
      value;
    var dt = ShExTerm.isLiteral(value) ? ShExTerm.getLiteralType(value) : null;
    var numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

    function validationError () {
      var errorStr = Array.prototype.join.call(arguments, "");
      errors.push("Error validating " + value + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
      return false;
    }
    // if (negated) ;
    if (false) {} else {
      if ("nodeKind" in valueExpr) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
          validationError("unknown node kind '" + valueExpr.nodeKind + "'");
        }
        if (ShExTerm.isBlank(value)) {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (ShExTerm.isLiteral(value)) {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }

      if (valueExpr.datatype  && valueExpr.values  ) validationError("found both datatype and values in "   +tripleConstraint);

      if (valueExpr.datatype) {
        if (!ShExTerm.isLiteral(value)) {
          validationError("mismatched datatype: " + value + " is not a literal with datatype " + valueExpr.datatype);
        }
        else if (ShExTerm.getLiteralType(value) !== valueExpr.datatype) {
          validationError("mismatched datatype: " + ShExTerm.getLiteralType(value) + " !== " + valueExpr.datatype);
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
        if (ShExTerm.isLiteral(value) && valueExpr.values.reduce((ret, v) => {
          if (ret) return true;
          var ld = ldify(value);
          if (v.type === "Language") {
            return v.languageTag === ld.language; // @@ use equals/normalizeTest
          }
          if (!(typeof v === "object" && "value" in v))
            return false;
          return v.value === ld.value &&
            v.type === ld.type &&
            v.language === ld.language;
        }, false)) {
          // literal match
        } else if (valueExpr.values.indexOf(value) !== -1) {
          // trivial match
        } else {
          if (!(valueExpr.values.some(function (valueConstraint) {
            if (typeof valueConstraint === "object" && !("value" in valueConstraint)) { // isTerm me -- strike "value" in
              if (!("type" in valueConstraint))
                runtimeError("expected "+JSON.stringify(valueConstraint)+" to have a 'type' attribute.");
              var stemRangeTypes = [
                "Language",
                "IriStem",      "LiteralStem",      "LanguageStem",
                "IriStemRange", "LiteralStemRange", "LanguageStemRange"
              ];
              if (stemRangeTypes.indexOf(valueConstraint.type) === -1)
                runtimeError("expected type attribute '"+valueConstraint.type+"' to be in '"+stemRangeTypes+"'.");

              /* expect N3.js literals with {Literal,Language}StemRange
               *       or non-literals with IriStemRange
               */
              function normalizedTest (val, ref, func) {
                if (ShExTerm.isLiteral(val)) {
                  if (["LiteralStem", "LiteralStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(ShExTerm.getLiteralValue(val), ref);
                  } else if (["LanguageStem", "LanguageStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(ShExTerm.getLiteralLanguage(val) || null, ref);
                  } else {
                    return validationError("literal " + val + " not comparable with non-literal " + ref);
                  }
                } else {
                  if (["IriStem", "IriStemRange"].indexOf(valueConstraint.type) === -1) {
                    return validationError("nonliteral " + val + " not comparable with literal " + JSON.stringify(ref));
                  } else {
                    return func(val, ref);
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
                    var stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
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
            validationError("value " + value + " not found in set " + JSON.stringify(valueExpr.values));
          }
        }
      }
    }

    if ("pattern" in valueExpr) {
      var regexp = "flags" in valueExpr ?
	  new RegExp(valueExpr.pattern, valueExpr.flags) :
	  new RegExp(valueExpr.pattern);
      if (!(getLexicalValue(value).match(regexp)))
        validationError("value " + getLexicalValue(value) + " did not match pattern " + valueExpr.pattern);
    }

    Object.keys(stringTests).forEach(function (test) {
      if (test in valueExpr && !stringTests[test](label, valueExpr[test])) {
        validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + value);
      }
    });

    Object.keys(numericValueTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric) {
          if (!numericValueTests[test](numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + value);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + value);
        }
      }
    });

    Object.keys(decimalLexicalTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
          if (!decimalLexicalTests[test](""+numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + value);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + value);
        }
      }
    });
    var ret = {
      type: null,
      focus: value,
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
      var _semActHanlder = this;
      return semActs.reduce(function (ret, semAct) {
        if (ret.length === 0 && semAct.name in _semActHanlder.handlers) {
          var code = "code" in semAct ? semAct.code : _ShExValidator.options.semActs[semAct.name];
          var existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
          var extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
          const response = _semActHanlder.handlers[semAct.name].dispatch(code, ctx, extensionStorage);
          if (typeof response === 'boolean') {
            if (!response)
              ret.push({ type: "SemActFailure", errors: [{ type: "BooleanSemActFailure", code: code, ctx }] })
          } else if (typeof response === 'object' && response.constructor === Array) {
            if (response.length > 0)
              ret.push({ type: "SemActFailure", errors: response })
          } else {
            throw Error("unsupported response from semantic action handler: " + JSON.stringify(response))
          }
          if (!existing && Object.keys(extensionStorage).length > 0) {
            if (!("extensions" in resultsArtifact))
              resultsArtifact.extensions = {};
            resultsArtifact.extensions[semAct.name] = extensionStorage;
          }
          return ret;
        }
        return ret;
      }, []);
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
    var repeated, container;

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

      var opts = max === UNBOUNDED ?
        new KleeneStar(expr) :
        _seq(max - min).reduce(function (ret, elt, ord) {
          return ord === 0 ?
            new Choice([expr, new Epsilon]) :
            new Choice([new EachOf([expr, ret]), new Epsilon]);
        }, undefined);

      var reqd = min !== 0 ?
        new EachOf(_seq(min).map(function (ret) {
          return expr; // @@ something with ret
        }).concat(opts)) : opts;
      return reqd;
    }

    if (typeof expr === "string") { // Inclusion
      var included = schema._index.tripleExprs[expr].expression;
      return _compileExpression(included, schema);
    }

    else if (expr.type === "TripleConstraint") {
      // predicate, inverse, negated, valueExpr, annotations, semActs, min, max
      var valueExpr = "valueExprRef" in expr ?
        schema.valueExprDefns[expr.valueExprRef] :
        expr.valueExpr;
      var ordinal = tripleConstraints.push(expr)-1;
      var tp = new TripleConstraint(ordinal, expr.predicate, expr.inverse, expr.negated, valueExpr);
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

    else throw Error("unexpected expr type: " + expr.type);
  }

  return expression ? _compileExpression(expression, schema) : new Epsilon();
}

// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets, emptyValue) {
  var n = sets.length, carets = [], args = null;

  function init() {
    args = [];
    for (var i = 0; i < n; i++) {
      carets[i] = 0;
      args[i] = sets[i].length > 0 ? sets[i][0] : emptyValue;
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
    var i = n - 1;
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
      args[i] = sets[i].length > 0 ? sets[i][0] : emptyValue;
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
var N3jsTripleToString = function () {
  function fmt (n) {
    return ShExTerm.isLiteral(n) ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(ShExTerm.getLiteralType(n)) !== -1 ?
      parseInt(ShExTerm.getLiteralValue(n)) :
      n :
    ShExTerm.isBlank(n) ?
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
    byPredicate: triples.reduce(function (ret, t) {
      var p = t.predicate;
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

/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
function sparqlOrder (l, r) {
  var [lprec, rprec] = [l, r].map(
    x => ShExTerm.isBlank(x) ? 1 : ShExTerm.isLiteral(x) ? 2 : 3
  );
  return lprec === rprec ? l.localeCompare(r) : lprec - rprec;
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
  var errorStr = Array.prototype.join.call(arguments, "");
  var e = new Error(errorStr);
  Error.captureStackTrace(e, runtimeError);
  throw e;
}

  function _alist (len) {
    return _seq(len).map(() => [])
  }

  return {
    construct: ShExValidator_constructor,
    start: Start,
    options: InterfaceOptions
  };
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShExValidatorCjsModule;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

const EvalThreadedNErrCjsModule = (function () {
const ShExTerm = __webpack_require__(3);
const UNBOUNDED = -1;

function vpEngine (schema, shape, index) {
    var outerExpression = shape.expression;
    return {
      match:match
    };

    function match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, semActHandler, trace, uniques) {

      /*
       * returns: list of passing or failing threads (no heterogeneous lists)
       */
      function validateExpr (expr, thread) {
        if (typeof expr === "string") { // Inclusion
          var included = index.tripleExprs[expr];
          return validateExpr(included, thread);
        }

        var constraintNo = constraintList.indexOf(expr);
        var min = "min" in expr ? expr.min : 1;
        var max = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;

        function validateRept (type, val) {
          var repeated = 0, errOut = false;
          var newThreads = [thread];
          var minmax = {  };
          if ("min" in expr && expr.min !== 1 || "max" in expr && expr.max !== 1) {
            minmax.min = expr.min;
            minmax.max = expr.max;
          }
          if ("semActs" in expr)
            minmax.semActs = expr.semActs;
          if ("annotations" in expr)
            minmax.annotations = expr.annotations;
          for (; repeated < max && !errOut; ++repeated) {
            var inner = [];
            for (var t = 0; t < newThreads.length; ++t) {
              var newt = newThreads[t];
              var sub = val(newt);
              if (sub.length > 0 && sub[0].errors.length === 0) { // all subs pass or all fail
                sub.forEach(newThread => {
                  var solutions =
                      "expression" in newt ? newt.expression.solutions : [];
                  if ("solution" in newThread)
                    solutions = solutions.concat(newThread.solution);
                  delete newThread.solution;
                  newThread.expression = extend({
                    type: type,
                    solutions: solutions
                  }, minmax);
                });
              }
              if (sub.length === 0 /* min:0 */ || sub[0].errors.length > 0)
                return repeated < min ? sub : newThreads;
              else
                inner = inner.concat(sub);
              // newThreads.expressions.push(sub);
            }
            newThreads = inner;
          }
          if (newThreads.length > 0 && newThreads[0].errors.length === 0 && "semActs" in expr) {
            var passes = [];
            var failures = [];
            newThreads.forEach(newThread => {
              const semActErrors = semActHandler.dispatchAll(expr.semActs, "???", newThread)
              if (semActErrors.length === 0) {
                passes.push(newThread)
              } else {
                [].push.apply(newThread.errors, semActErrors);
                failures.push(newThread);
              }
            });
            newThreads = passes.length > 0 ? passes : failures;
          }
          return newThreads;
        }

        if (expr.type === "TripleConstraint") {
          var negated = "negated" in expr && expr.negated || max === 0;
          if (negated)
            min = max = Infinity;
          if (thread.avail[constraintNo] === undefined)
            thread.avail[constraintNo] = constraintToTripleMapping[constraintNo].map(pair => pair.tNo);
          var minmax = {  };
          if ("min" in expr && expr.min !== 1 || "max" in expr && expr.max !== 1) {
            minmax.min = expr.min;
            minmax.max = expr.max;
          }
          if ("semActs" in expr)
            minmax.semActs = expr.semActs;
          if ("annotations" in expr)
            minmax.annotations = expr.annotations;
          var taken = thread.avail[constraintNo].splice(0, min);
          var passed = negated ? taken.length === 0 : taken.length >= min;
          var ret = [];
          var matched = thread.matched;
          if (passed) {
            do {
              const passFail = taken.reduce((acc, tripleNo) => {
                const t = neighborhood[tripleNo]
                const tested = {
                  type: "TestedTriple",
                  subject: t.subject,
                  predicate: t.predicate,
                  object: ldify(t.object),
                  // These should be in a neighboring object.
                  tripleNo: tripleNo,
                  constraintNo: constraintNo // !! improv
                };
                var hit = constraintToTripleMapping[constraintNo].find(x => x.tNo === tripleNo);
                if (hit.res && Object.keys(hit.res).length > 0)
                  tested.referenced = hit.res;
                const semActErrors = thread.errors.concat(
                  "semActs" in expr
                    ? semActHandler.dispatchAll(expr.semActs, t, tested)
                    : []
                )
                if (semActErrors.length > 0)
                  acc.fail.push({tripleNo, tested, semActErrors})
                else
                  acc.pass.push({tripleNo, tested, semActErrors})
                return acc
              }, {pass: [], fail: []})


              // return an empty solution if min card was 0
              if (passFail.fail.length === 0) {
                // If we didn't take anything, fall back to old errors.
                // Could do something fancy here with a semAct registration for negative matches.
                const totalErrors = taken.length === 0 ? thread.errors.slice() : []
                const myThread = makeThread(passFail.pass, totalErrors)
                ret.push(myThread);
              } else {
                passFail.fail.forEach(
                  f => ret.push(makeThread([f], f.semActErrors))
                )
              }

              function makeThread (tests, errors) {
                return {
                  avail: thread.avail.map(a => { // copy parent thread's avail vector
                    return a.slice();
                  }),
                  errors: errors,
                  matched: matched.concat({
                    tNos: tests.map(p => p.tripleNo)
                  }),
                  expression: extend(
                    {
                      type: "TripleConstraintSolutions",
                      predicate: expr.predicate
                    },
                    "valueExpr" in expr ? { valueExpr: expr.valueExpr } : {},
                    "id" in expr ? { productionLabel: expr.id } : {},
                    minmax,
                    {
                      solutions: tests.map(p => p.tested)
                    }
                  )
                }
              }
            } while ((function () {
              if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                // build another thread.
                taken.push(thread.avail[constraintNo].shift());
                return true;
              } else {
                // no more threads
                return false;
              }
            })());
          } else {
            var valueExpr = null;
            if (typeof expr.valueExpr === "string") { // ShapeRef
              valueExpr = expr.valueExpr;
              if (ShExTerm.isBlank(valueExpr))
                valueExpr = index.shapeExprs[valueExpr];
            } else if (expr.valueExpr) {
              valueExpr = extend({}, expr.valueExpr)
            }
            ret.push({
              avail: thread.avail,
              errors: thread.errors.concat([
                extend({
                  type: negated ? "NegatedProperty" : "MissingProperty",
                  property: expr.predicate
                }, valueExpr ? { valueExpr: valueExpr } : {})
              ]),
              matched: matched
            });
          }

          return ret;
        }

        else if (expr.type === "OneOf") {
          return validateRept("OneOfSolutions", (th) => {
            var accept = null;
            var matched = [];
            var failed = [];
            expr.expressions.forEach(nested => {
              var thcopy = {
                avail: th.avail.map(a => { return a.slice(); }),
                errors: th.errors,
                matched: th.matched//.slice() ever needed??
              };
              var sub = validateExpr(nested, thcopy);
              if (sub[0].errors.length === 0) { // all subs pass or all fail
                matched = matched.concat(sub);
                sub.forEach(newThread => {
                  var expressions =
                      "solution" in thcopy ? thcopy.solution.expressions : [];
                  if ("expression" in newThread) // undefined for no matches on min card:0
                    expressions = expressions.concat([newThread.expression]);
                  delete newThread.expression;
                  newThread.solution = {
                    type: "OneOfSolution",
                    expressions: expressions
                  };
                });
              } else
                failed = failed.concat(sub);
            });
            return matched.length > 0 ? matched : failed;
          });
        }

        else if (expr.type === "EachOf") {
          return homogenize(validateRept("EachOfSolutions", (th) => {
            // Iterate through nested expressions, exprThreads starts as [th].
            return expr.expressions.reduce((exprThreads, nested) => {
              // Iterate through current thread list composing nextThreads.
              // Consider e.g.
              // <S1> { <p1> . | <p2> .; <p3> . } / { <x> <p2> 2; <p3> 3 } (should pass)
              // <S1> { <p1> .; <p2> . }          / { <s1> <p1> 1 }        (should fail)
              return homogenize(exprThreads.reduce((nextThreads, exprThread) => {
                var sub = validateExpr(nested, exprThread);
                // Move newThread.expression into a hierarchical solution structure.
                sub.forEach(newThread => {
                  if (newThread.errors.length === 0) {
                    var expressions =
                        "solution" in exprThread ? exprThread.solution.expressions : [];
                    if ("expression" in newThread) // undefined for no matches on min card:0
                      expressions = expressions.concat([newThread.expression]);
                    // console.warn(threadMatched(newThread), " vs ", exprMatched(expressions));
                    delete newThread.expression;
                    newThread.solution = {
                      type: "EachOfSolution",
                      expressions: expressions // exprThread.expression + newThread.expression
                    };
                  }
                });
                return nextThreads.concat(sub);
              }, []));
            }, [th]);
          }));
        }

        else if (expr.type === "ValueComparison") {
          var lefts  = resolveAccessor(thread.solution, expr.left);
          var rights = resolveAccessor(thread.solution, expr.right);
          var errors = [];
          lefts.forEach(left => {
            rights.forEach(right => {
              function test (passed) {
                if (!passed)
                  errors.push({
                    type: "ValueComparisonFailure",
                    comparator: expr.comparator,
                    left: left,
                    right: right
                  });
              }
              switch (expr.comparator) {
              case ">" : test(left >  right); break;
              case "<" : test(left <  right); break;
              case "==": test(left == right); break;
              case "!=": test(left != right); break;
              default: throw Error("unknown value comparator: " + expr.comparator);
              }
            });
          });
          return [{
            avail:thread.avail,
            errors:thread.errors.concat(errors),
            matched:thread.matched
          }];
        }

        else if (expr.type === "Unique") {
          var keys =
              (expr.focus ? [node] : []).concat(
                expr.uniques.reduce((ret, u) => {
                  return ret.concat(resolveAccessor(thread.solution, u));
                }, [])
              );
          console.warn(keys);
          var errors = [];
          var already = uniques[keys.join(" ")];
          if (already !== node)
            errors.push({type:"UniqueViolation", keys: keys, node: node, conflictsWith: already});
          else
            uniques[keys.join(" ")] = node;
          return [{
            avail:thread.avail,
            errors:thread.errors.concat(errors),
            matched:thread.matched
          }];
          var ret = [{"avail":thread.avail,"errors":thread.errors,"matched":thread.matched,"expression":{ type: "UniqueSolution", expression:expr }}];
//          var ret = [{"avail":thread.avail,"errors":thread.errors.concat([{"type":"UniqueFailure","comparison":expr}]),"matched":thread.matched}]
          console.log(JSON.stringify(ret));
          return ret;
        }

        runtimeError("unexpected expr type: " + expr.type);

        function homogenize (list) {
          return list.reduce((acc, elt) => {
            if (elt.errors.length === 0) {
              if (acc.errors) {
                return { errors: false, l: [elt] };
              } else {
                return { errors: false, l: acc.l.concat(elt) };
              }
            } else {
              if (acc.errors) {
                return { errors: true, l: acc.l.concat(elt) };
              } else {
                return acc; }
            }
          }, {errors: true, l: []}).l;
        }

        function resolveAccessor (solution, accessor) {
          return solution.expressions.reduce((ret, o) => {
            return "productionLabel" in o && o.productionLabel === accessor.productionLabel ? ret.concat(o.solutions.map(s => {
              var triple = neighborhood[s.tripleNo];
              var node = constraintList[s.constraintNo].inverse ? triple.subject : triple.object;
	      switch (accessor.type) {
	      case "TermAccessor":
		return ShExTerm.isLiteral(node) ? ShExTerm.getLiteralValue(node) :
		  ShExTerm.isBlank(node) ? node.substr(2) :
		  node ;
	      case "LangtagAccessor":
		return ShExTerm.isLiteral(node) ? ShExTerm.getLiteralLanguage(node) : "";
	      case "DatatypeAccessor":
		return ShExTerm.isLiteral(node) ? ShExTerm.getLiteralType(node) : "";
	      default:
		throw Error("unknown accessor type:", accessor.type);
              }
	    })) : ret;
	  }, [])
        }

        // serializers for debugging
        function threadMatched (th) {
          return JSON.stringify(th.matched.map(m => { return m.tNos; }));
        }
        function exprMatched (xp) {
          return JSON.stringify(
            xp.reduce((outer, e) => {
              return e.solutions.reduce((inner, s) => {
                inner[s.constraintNo] = inner[s.constraintNo] ?
                  inner[s.constraintNo].concat([s.tripleNo]) :
                  [s.tripleNo];
                return inner;
              }, outer);
            }, []));
        }
      }

      var startingThread = {
        avail:[],   // triples remaining by constraint number
        matched:[], // triples matched in this thread
        errors:[]   // errors encounted
      };
      if (!outerExpression)
        return { }; // vapid match if no expression
      var ret = validateExpr(outerExpression, startingThread);
      // console.log(JSON.stringify(ret));
      // note: don't return if ret.length === 1 because it might fail the unmatchedTriples test.
      var longerChosen =
          ret.reduce((ret, elt) => {
            if (elt.errors.length > 0)
              return ret;              // early return
            var unmatchedTriples = {};
            // Collect triples assigned to some constraint.
            Object.keys(tripleToConstraintMapping).forEach(k => {
              if (tripleToConstraintMapping[k] !== "NO_TRIPLE_CONSTRAINT")
                unmatchedTriples[k] = tripleToConstraintMapping[k];
            });
            // Removed triples matched in this thread.
            elt.matched.forEach(m => {
              m.tNos.forEach(t => {
                delete unmatchedTriples[t];
              });
            });
            // Remaining triples are unaccounted for.
            Object.keys(unmatchedTriples).forEach(t => {
              elt.errors.push({
                type: "ExcessTripleViolation",
                triple: neighborhood[t],
                constraint: constraintList[unmatchedTriples[t]]
              });
            });
            return ret !== null ? ret : // keep first solution
            // Accept thread with no unmatched triples.
            Object.keys(unmatchedTriples).length > 0 ? null : elt;
          }, null);
      return longerChosen !== null ?
        finish(longerChosen.expression, constraintList,
               neighborhood, semActHandler) :
        ret.length > 1 ? {
          type: "PossibleErrors",
          errors: ret.reduce((all, e) => {
            return all.concat([e.errors]);
          }, [])
        } : ret[0];
    }

        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          var ret = { value: ShExTerm.getLiteralValue(term) };
          var dt = ShExTerm.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          var lang = ShExTerm.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }

    function finish (fromValidatePoint, constraintList, neighborhood, semActHandler) {
      function _dive (solns) {
        if (solns.type === "OneOfSolutions" ||
            solns.type === "EachOfSolutions") {
          solns.solutions.forEach(s => {
            s.expressions.forEach(e => {
              _dive(e);
            });
          });
        } else if (solns.type === "TripleConstraintSolutions") {
          solns.solutions = solns.solutions.map(x => {
            if (x.type === "TestedTriple") { // already done
              // These should be in a neighboring object.
              delete x.tripleNo;
              delete x.constraintNo;
              return x; // c.f. validation/3circularRef1_pass-open
            }
            var t = neighborhood[x.tripleNo];
            var expr = constraintList[x.constraintNo];
            var ret = {
              type: "TestedTriple", subject: t.subject, predicate: t.predicate, object: ldify(t.object)
            };
            function diver (focus, shapeLabel, dive) {
              var sub = dive(focus, shapeLabel);
              if ("errors" in sub) {
                // console.dir(sub);
                var err = {
                  type: "ReferenceError", focus: focus,
                  shape: shapeLabel
                };
                if (typeof shapeLabel === "string" && ShExTerm.isBlank(shapeLabel))
                  err.referencedShape = shape;
                err.errors = sub;
                return [err];
              }
              if (("solution" in sub || "solutions" in sub)&& Object.keys(sub.solution || sub.solutions).length !== 0 ||
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
            var subErrors = "valueExpr" in expr ?
                checkValueExpr(expr.inverse ? t.subject : t.object, expr.valueExpr, diveRecurse, diveDirect) :
                [];
            if (subErrors.length === 0 && "semActs" in expr)
              [].push.apply(subErrors, semActHandler.dispatchAll(expr.semActs, t, ret))
            if (subErrors.length > 0) {
              fromValidatePoint.errors = fromValidatePoint.errors || [];
              fromValidatePoint.errors = fromValidatePoint.errors.concat(subErrors);
            }
            return ret;
          });
        } else {
          throw Error("unexpected expr type in " + JSON.stringify(solns));
        }
      }
      if (Object.keys(fromValidatePoint).length > 0) // guard against {}
        _dive(fromValidatePoint);
      if ("semActs" in shape)
        fromValidatePoint.semActs = shape.semActs;
      return fromValidatePoint;
    }
  }

        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          var ret = { value: N3Util.getLiteralValue(term) };
          var dt = N3Util.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          var lang = N3Util.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }

function extend(base) {
  if (!base) base = {};
  for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (var name in arg)
      base[name] = arg[name];
  return base;
}

return {
  name: "eval-threaded-nerr",
  description: "emulation of regular expression engine with error permutations",
  compile: vpEngine
};
})();

if (true)
  module.exports = EvalThreadedNErrCjsModule;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

const ShExApiCjsModule = function (config) {

  const ShExUtil = __webpack_require__(4);
  const ShExParser = __webpack_require__(12);

  const api = { load: LoadPromise, loadExtensions: LoadExtensions, GET: GET, loadShExImports_NotUsed: loadShExImports_NotUsed };
  return api
  
  async function GET (url, mediaType) {
    let m;
    return (m = url.match("^data:([^,]+),(.*)$"))
      ? Promise.resolve({text: m[2], url: m[0]}) // Read from data: URL
      : (url.match("^(blob:)?[a-z]+://."))
      ? myHttpRequest(url, mediaType) // whatever fetch handles
      : (() => { throw Error(`Don't know how to fetch ${url}`) })()

    async function myHttpRequest(url, mediaType) {
      if (typeof config.fetch !== "function")
        throw Error(`Unable to fetch ${url} with fetch=${config.fetch}`)
      let resp
      try {
        resp = await config.fetch(url, {
          headers: {
            'Accept': 'text/shex,text/turtle,*/*'
          }
        })
      } catch (e) {
        // DNS failure
        // no route to host
        // connection refused
        throw Error(`GET <${url}> network failure: ${e.message}`)
      }
      if (!resp.ok)
        throw Error(`GET <${url}> failed: ${resp.status} ${resp.statusText}`)
      const text = await resp.text()
      return {text, url}
    }
  }

  function loadList (src, metaList, mediaType, parserWrapper, target, options, loadImports) {
    return src.map(
      async p =>
        typeof p === "object" ? mergeSchema(p) : await loadParseMergeSchema(p)
    )

    async function mergeSchema (obj) {
      const meta = addMeta(obj.url, mediaType)
      try {
        ShExUtil.merge(target, obj.schema, true, true)
        meta._prefixes = target._prefixes || {}
        meta.base = target._base
        loadImports(obj.schema)
        return [mediaType, obj.url]
      } catch (e) {
        const e2 = Error("error merging schema object " + obj.schema + ": " + e)
        e2.stack = e.stack
        throw e2
      }
    }

    async function loadParseMergeSchema (p) {
      return api.GET(p, mediaType).then(function (loaded) {
        return parserWrapper(loaded.text, mediaType, loaded.url, target,
                             addMeta(loaded.url, mediaType), options, loadImports)
      })
    }

    function addMeta (url, mediaType) {
      const meta = {
        mediaType: mediaType,
        url: url,
        base: url,
        prefixes: {}
      }
      metaList.push(meta)
      return meta
    }
  }

  /* LoadPromise - load shex and json files into a single Schema and turtle into
   * a graph (Data).
   */
  async function LoadPromise (shex, json, turtle, jsonld, schemaOptions = {}, dataOptions = {}) {
    const returns = {
      schema: ShExUtil.emptySchema(),
      data: new config.rdfjs.Store(),
      schemaMeta: [],
      dataMeta: []
    }
    const promises = []
    const schemasSeen = shex.concat(json).map(p => {
      // might be already loaded objects with a url property.
      return typeof p === "object" ? p.url : p
    })
    let transform = null
    if (schemaOptions && "iriTransform" in schemaOptions) {
      transform = schemaOptions.iriTransform
      delete schemaOptions.iriTransform
    }

    const allLoaded = DynamicPromise()
    function loadImports (schema) {
      if (!("imports" in schema))
        return schema
      if (schemaOptions.keepImports) {
        return schema
      }
      const ret = Object.assign({}, schema)
      const imports = ret.imports
      delete ret.imports
      schema.imports.map(function (i) {
        return transform ? transform(i) : i
      }).filter(function (i) {
        return schemasSeen.indexOf(i) === -1
      }).map(i => {
        schemasSeen.push(i)
        allLoaded.add(api.GET(i).then(function (loaded) {
          const meta = {
            // mediaType: mediaType,
            url: loaded.url,
            base: loaded.url,
            prefixes: {}
          }
          // metaList.push(meta)
          return parseShExC(loaded.text, "text/shex", loaded.url,
                            returns.schema, meta, schemaOptions, loadImports)
        })); // addAfter would be after invoking schema.
      })
      return ret
    }

    // gather all the potentially remote inputs
    [].push.apply(promises, [
      loadList(shex, returns.schemaMeta, "text/shex",
               parseShExC, returns.schema, schemaOptions, loadImports),
      loadList(json, returns.schemaMeta, "text/json",
               parseShExJ, returns.schema, schemaOptions, loadImports),
      loadList(turtle, returns.dataMeta, "text/turtle",
               parseTurtle, returns.data, dataOptions),
      loadList(jsonld, returns.dataMeta, "application/ld+json",
               parseJSONLD, returns.data, dataOptions)
    ].reduce((acc, l) => acc.concat(l), [])) // .flat() in node > 8.x
    return allLoaded.all(promises).then(function (resources) {
      if (returns.schemaMeta.length > 0)
        ShExUtil.isWellDefined(returns.schema)
      return returns
    })
  }

  function DynamicPromise () {
    const promises = []
    const results = []
    let completedPromises = 0
    let resolveSelf, rejectSelf
    const self = new Promise(function (resolve, reject) {
      resolveSelf = resolve; rejectSelf = reject
    })
    self.all = function (pz) {
      pz.forEach(function (promise, index) {
        promises.push(promise)
        addThen(promise, index)
      })
      return self
    }
    self.add = function (promise) {
      promises.push(promise)
      addThen(promise, promises.length - 1)
      return self
    }
    return self

    function addThen (promise, index) {
      promise.then(function (value) {
        results[index] = value
        ++completedPromises
        if(completedPromises === promises.length) {
          resolveSelf(results)
        }
      }).catch(function (error) {
        rejectSelf(error)
      })
    }
  }

  function parseShExC (text, mediaType, url, schema, meta, schemaOptions, loadImports) {
    const parser = schemaOptions && "parser" in schemaOptions ?
        schemaOptions.parser :
        ShExParser.construct(url, {}, schemaOptions)
    try {
      const s = parser.parse(text)
      // !! horrible hack until I set a variable to know if there's a BASE.
      if (s.base === url) delete s.base
      meta.prefixes = s._prefixes || {}
      meta.base = s._base || meta.base
      ShExUtil.merge(schema, loadImports(s), false, true)
      return Promise.resolve([mediaType, url])
    } catch (e) {
      e.message = "error parsing ShEx " + url + ": " + e.message
      return Promise.reject(e)
    }
  }

  function loadShExImports_NotUsed (from, parser, transform) {
    const schemasSeen = [from]
    const ret = { type: "Schema" }
    return api.GET(from).then(load999Imports).then(function () {
      ShExUtil.isWellDefined(ret)
      return ret
    })
    function load999Imports (loaded) {
      const schema = parser.parse(loaded.text)
      const imports = schema.imports
      delete schema.imports
      ShExUtil.merge(ret, schema, false, true)
      if (imports) {
        const rest = imports
            .map(function (i) {
              return transform ? transform(i) : i
            }).
            filter(function (i) {
              return schemasSeen.indexOf(i) === -1
            })
        return Promise.all(rest.map(i => {
          schemasSeen.push(i)
          return api.GET(i).then(load999Imports)
        })).then(a => {
          return null
        })
      } else {
        return null
      }
    }
  }

  function parseShExJ (text, mediaType, url, schema, meta, schemaOptions, loadImports) {
    try {
      const s = ShExUtil.ShExJtoAS(JSON.parse(text))
      ShExUtil.merge(schema, s, true, true)
      meta.prefixes = schema._prefixes
      meta.base = schema.base
      loadImports(s)
      return Promise.resolve([mediaType, url])
    } catch (e) {
      const e2 = Error("error parsing JSON " + url + ": " + e)
      // e2.stack = e.stack
      return Promise.reject(e2)
    }
  }

  function parseTurtle (text, mediaType, url, data, meta, dataOptions) {
    return new Promise(function (resolve, reject) {
      new config.rdfjs.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"}).
        parse(text,
              function (error, triple, prefixes) {
                if (prefixes) {
                  meta.prefixes = prefixes
                  // data.addPrefixes(prefixes)
                }
                if (error) {
                  reject("error parsing " + url + ": " + error)
                } else if (triple) {
                  data.addQuad(triple)
                } else {
                  meta.base = this._base
                  resolve([mediaType, url])
                }
              })
    })
  }

  /* parseTurtle999 - a variant of parseTurtle with no callback.
   * so, which is "better"?
   */
  function parseTurtle999 (text, mediaType, url, data, meta, dataOptions) {
    try {
      const p = new config.rdfjs.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"})
      const triples = p.parse(text)
      meta.prefixes = p._prefixes
      meta.base = p._base
      data.addPrefixes(p._prefixes)
      data.addTriples(triples)
      return Promise.resolve([mediaType, url])
    } catch (e) {
      return Promise.reject(Error("error parsing " + url + ": " + e))
    }
  }

  function parseJSONLD (text, mediaType, url, data, meta, dataOptions) {
    return new Promise(function (resolve, reject) {
      const struct = JSON.parse(text)
      config.jsonld.toRDF(struct, {format: "application/nquads", base: url}, function (lderr, nquads) {
        if (lderr) {
          reject("error parsing JSON-ld " + url + ": " + lderr)
        } else {
          meta.prefixes = {}; // @@ take from @context?
          meta.base = url;    // @@ take from @context.base? (or vocab?)
          resolve(parseTurtle(nquads, mediaType, url, data, meta))
        }
      })
    })
  }

  function LoadExtensions (globs) {
    return globs.reduce(
      (list, glob) =>
        list.concat(__webpack_require__(13).glob.sync(glob))
      , []).
      reduce(function (ret, path) {
        try {
	  const t = __webpack_require__(40)(path)
	  ret[t.url] = t
	  return ret
        } catch (e) {
	  console.warn("ShEx extension \"" + moduleDir + "\" not loadable: " + e)
	  return ret
        }
      }, {})
  }

}

if (true)
  module.exports = ShExApiCjsModule


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, module) {/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var ShExJison = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[7,18,19,20,21,23,26,204,226,227],$V1=[1,25],$V2=[1,29],$V3=[1,24],$V4=[1,28],$V5=[1,27],$V6=[2,12],$V7=[2,13],$V8=[2,14],$V9=[7,18,19,20,21,23,26,226,227],$Va=[1,35],$Vb=[1,38],$Vc=[1,37],$Vd=[2,18],$Ve=[2,19],$Vf=[19,21,65,67,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,121,123,159,200,226,230],$Vg=[2,57],$Vh=[1,47],$Vi=[1,48],$Vj=[1,49],$Vk=[19,21,35,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,121,123,159,200,226,230],$Vl=[2,253],$Vm=[2,254],$Vn=[1,51],$Vo=[1,54],$Vp=[1,53],$Vq=[2,275],$Vr=[2,276],$Vs=[2,279],$Vt=[2,277],$Vu=[2,278],$Vv=[2,15],$Vw=[2,17],$Vx=[19,21,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,121,123,159,200,226,230],$Vy=[1,72],$Vz=[2,26],$VA=[2,27],$VB=[2,28],$VC=[115,121,123,200,230],$VD=[2,135],$VE=[1,98],$VF=[1,106],$VG=[1,84],$VH=[1,89],$VI=[1,90],$VJ=[1,91],$VK=[1,97],$VL=[1,102],$VM=[1,103],$VN=[1,104],$VO=[1,107],$VP=[1,108],$VQ=[1,109],$VR=[1,110],$VS=[1,111],$VT=[1,112],$VU=[1,94],$VV=[1,105],$VW=[2,58],$VX=[1,114],$VY=[1,115],$VZ=[1,116],$V_=[1,122],$V$=[1,123],$V01=[47,49],$V11=[2,87],$V21=[2,88],$V31=[204,206],$V41=[1,138],$V51=[1,141],$V61=[1,140],$V71=[2,16],$V81=[7,18,19,20,21,23,26,47,226,227],$V91=[2,43],$Va1=[7,18,19,20,21,23,26,47,49,226,227],$Vb1=[2,50],$Vc1=[2,32],$Vd1=[2,65],$Ve1=[2,70],$Vf1=[2,67],$Vg1=[1,175],$Vh1=[1,176],$Vi1=[1,177],$Vj1=[1,180],$Vk1=[1,183],$Vl1=[2,73],$Vm1=[7,18,19,20,21,23,26,47,49,75,76,77,115,121,123,200,201,204,226,227,230],$Vn1=[2,91],$Vo1=[7,18,19,20,21,23,26,47,49,201,204,226,227],$Vp1=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,201,204,226,227],$Vq1=[7,18,19,20,21,23,26,47,49,75,76,77,97,98,99,100,115,121,123,200,201,204,226,227,230],$Vr1=[2,104],$Vs1=[2,103],$Vt1=[7,18,19,20,21,23,26,47,49,97,98,99,100,108,109,110,111,112,113,201,204,226,227],$Vu1=[2,98],$Vv1=[2,97],$Vw1=[1,198],$Vx1=[1,200],$Vy1=[1,202],$Vz1=[1,201],$VA1=[2,108],$VB1=[2,109],$VC1=[2,110],$VD1=[2,106],$VE1=[2,252],$VF1=[19,21,67,77,96,104,105,161,183,215,216,217,218,219,220,221,222,223,224,226],$VG1=[2,183],$VH1=[7,18,19,20,21,23,26,47,49,108,109,110,111,112,113,201,204,226,227],$VI1=[2,100],$VJ1=[2,114],$VK1=[1,210],$VL1=[1,211],$VM1=[1,212],$VN1=[1,213],$VO1=[96,104,105,217,218,219,220],$VP1=[2,31],$VQ1=[2,35],$VR1=[2,38],$VS1=[2,41],$VT1=[2,89],$VU1=[2,244],$VV1=[2,245],$VW1=[2,246],$VX1=[1,261],$VY1=[1,266],$VZ1=[1,247],$V_1=[1,252],$V$1=[1,253],$V02=[1,254],$V12=[1,260],$V22=[1,257],$V32=[1,265],$V42=[1,268],$V52=[1,269],$V62=[1,270],$V72=[1,276],$V82=[1,277],$V92=[2,20],$Va2=[2,49],$Vb2=[2,56],$Vc2=[2,61],$Vd2=[2,64],$Ve2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,226,227],$Vf2=[2,83],$Vg2=[2,84],$Vh2=[2,29],$Vi2=[2,33],$Vj2=[2,69],$Vk2=[2,66],$Vl2=[2,71],$Vm2=[2,68],$Vn2=[7,18,19,20,21,23,26,47,49,97,98,99,100,201,204,226,227],$Vo2=[1,322],$Vp2=[1,330],$Vq2=[1,331],$Vr2=[1,332],$Vs2=[1,338],$Vt2=[1,339],$Vu2=[7,18,19,20,21,23,26,47,49,75,76,77,115,121,123,200,204,226,227,230],$Vv2=[2,242],$Vw2=[7,18,19,20,21,23,26,47,49,204,226,227],$Vx2=[1,347],$Vy2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,204,226,227],$Vz2=[2,102],$VA2=[2,107],$VB2=[2,94],$VC2=[1,357],$VD2=[2,95],$VE2=[2,96],$VF2=[2,101],$VG2=[19,21,65,157,158,210,226],$VH2=[2,164],$VI2=[2,137],$VJ2=[1,375],$VK2=[1,372],$VL2=[1,376],$VM2=[1,377],$VN2=[1,374],$VO2=[1,382],$VP2=[1,386],$VQ2=[1,385],$VR2=[1,384],$VS2=[1,391],$VT2=[1,394],$VU2=[1,390],$VV2=[1,393],$VW2=[19,21,226,227],$VX2=[1,405],$VY2=[1,411],$VZ2=[1,400],$V_2=[1,404],$V$2=[1,414],$V03=[1,415],$V13=[1,416],$V23=[1,403],$V33=[1,417],$V43=[1,418],$V53=[1,423],$V63=[1,424],$V73=[1,425],$V83=[1,426],$V93=[1,419],$Va3=[1,420],$Vb3=[1,421],$Vc3=[1,422],$Vd3=[1,410],$Ve3=[2,113],$Vf3=[2,118],$Vg3=[2,120],$Vh3=[2,121],$Vi3=[2,122],$Vj3=[2,267],$Vk3=[2,268],$Vl3=[2,269],$Vm3=[2,270],$Vn3=[2,119],$Vo3=[2,30],$Vp3=[2,39],$Vq3=[2,36],$Vr3=[2,42],$Vs3=[2,37],$Vt3=[1,458],$Vu3=[2,40],$Vv3=[1,494],$Vw3=[1,527],$Vx3=[1,528],$Vy3=[1,529],$Vz3=[1,532],$VA3=[2,44],$VB3=[2,51],$VC3=[2,60],$VD3=[2,62],$VE3=[2,72],$VF3=[47,49,66],$VG3=[1,592],$VH3=[47,49,66,75,76,77,115,121,123,200,201,204,230],$VI3=[47,49,66,201,204],$VJ3=[47,49,66,92,93,94,97,98,99,100,201,204],$VK3=[47,49,66,75,76,77,97,98,99,100,115,121,123,200,201,204,230],$VL3=[47,49,66,97,98,99,100,108,109,110,111,112,113,201,204],$VM3=[47,49,66,108,109,110,111,112,113,201,204],$VN3=[47,66],$VO3=[7,18,19,20,21,23,26,47,49,75,76,77,115,121,123,200,226,227,230],$VP3=[2,93],$VQ3=[2,92],$VR3=[2,241],$VS3=[1,634],$VT3=[1,637],$VU3=[1,633],$VV3=[1,636],$VW3=[2,90],$VX3=[2,130],$VY3=[2,105],$VZ3=[2,99],$V_3=[2,111],$V$3=[2,112],$V04=[2,142],$V14=[2,143],$V24=[1,654],$V34=[2,144],$V44=[117,131],$V54=[2,149],$V64=[2,150],$V74=[2,152],$V84=[1,657],$V94=[1,658],$Va4=[19,21,210,226],$Vb4=[2,172],$Vc4=[1,666],$Vd4=[1,667],$Ve4=[117,131,136,137],$Vf4=[2,161],$Vg4=[2,162],$Vh4=[1,671],$Vi4=[1,670],$Vj4=[1,672],$Vk4=[1,673],$Vl4=[1,677],$Vm4=[1,681],$Vn4=[1,680],$Vo4=[1,679],$Vp4=[19,21,115,121,123,200,226,227,230],$Vq4=[19,21,115,121,123,200,210,226,230],$Vr4=[2,250],$Vs4=[2,251],$Vt4=[2,182],$Vu4=[1,710],$Vv4=[19,21,67,77,96,104,105,161,176,183,215,216,217,218,219,220,221,222,223,224,226],$Vw4=[2,247],$Vx4=[2,248],$Vy4=[2,249],$Vz4=[2,260],$VA4=[2,263],$VB4=[2,257],$VC4=[2,258],$VD4=[2,259],$VE4=[2,265],$VF4=[2,266],$VG4=[2,271],$VH4=[2,272],$VI4=[2,273],$VJ4=[2,274],$VK4=[19,21,67,77,96,104,105,107,161,176,183,215,216,217,218,219,220,221,222,223,224,226],$VL4=[1,742],$VM4=[1,789],$VN4=[1,844],$VO4=[1,854],$VP4=[1,890],$VQ4=[1,926],$VR4=[2,63],$VS4=[47,49,66,97,98,99,100,201,204],$VT4=[47,49,66,75,76,77,115,121,123,200,204,230],$VU4=[47,49,66,204],$VV4=[1,948],$VW4=[47,49,66,92,93,94,97,98,99,100,204],$VX4=[1,958],$VY4=[1,995],$VZ4=[1,1031],$V_4=[2,243],$V$4=[1,1042],$V05=[1,1048],$V15=[1,1047],$V25=[19,21,96,104,105,215,216,217,218,219,220,221,222,223,224,226],$V35=[1,1068],$V45=[1,1074],$V55=[1,1073],$V65=[1,1094],$V75=[1,1100],$V85=[1,1099],$V95=[2,131],$Va5=[2,145],$Vb5=[2,147],$Vc5=[2,151],$Vd5=[2,153],$Ve5=[2,154],$Vf5=[2,158],$Vg5=[2,160],$Vh5=[2,166],$Vi5=[2,167],$Vj5=[1,1126],$Vk5=[1,1129],$Vl5=[1,1125],$Vm5=[1,1128],$Vn5=[1,1140],$Vo5=[1,1142],$Vp5=[145,198,199],$Vq5=[2,225],$Vr5=[1,1147],$Vs5=[2,237],$Vt5=[2,255],$Vu5=[2,256],$Vv5=[2,234],$Vw5=[19,21,27,65,157,158,195,196,197,210,226],$Vx5=[1,1155],$Vy5=[1,1157],$Vz5=[1,1159],$VA5=[19,21,67,77,96,104,105,161,177,183,215,216,217,218,219,220,221,222,223,224,226],$VB5=[1,1163],$VC5=[1,1169],$VD5=[1,1172],$VE5=[1,1173],$VF5=[1,1174],$VG5=[1,1162],$VH5=[1,1175],$VI5=[1,1176],$VJ5=[1,1181],$VK5=[1,1182],$VL5=[1,1183],$VM5=[1,1184],$VN5=[1,1177],$VO5=[1,1178],$VP5=[1,1179],$VQ5=[1,1180],$VR5=[1,1168],$VS5=[2,261],$VT5=[2,264],$VU5=[2,123],$VV5=[1,1214],$VW5=[1,1220],$VX5=[1,1252],$VY5=[1,1258],$VZ5=[1,1317],$V_5=[1,1364],$V$5=[47,49,66,75,76,77,115,121,123,200,230],$V06=[47,49,66,92,93,94,97,98,99,100],$V16=[1,1440],$V26=[1,1487],$V36=[2,238],$V46=[2,239],$V56=[2,240],$V66=[7,18,19,20,21,23,26,47,49,75,76,77,107,115,121,123,200,201,204,226,227,230],$V76=[7,18,19,20,21,23,26,47,49,107,201,204,226,227],$V86=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,107,201,204,226,227],$V96=[2,148],$Va6=[2,146],$Vb6=[2,155],$Vc6=[2,159],$Vd6=[2,156],$Ve6=[2,157],$Vf6=[19,21,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,121,123,159,200,226,230],$Vg6=[1,1547],$Vh6=[66,131],$Vi6=[1,1550],$Vj6=[1,1551],$Vk6=[66,131,136,137],$Vl6=[1,1563],$Vm6=[1,1567],$Vn6=[1,1566],$Vo6=[1,1565],$Vp6=[1,1569],$Vq6=[1,1570],$Vr6=[1,1571],$Vs6=[2,223],$Vt6=[1,1579],$Vu6=[1,1583],$Vv6=[1,1582],$Vw6=[1,1581],$Vx6=[2,205],$Vy6=[1,1586],$Vz6=[19,21,67,77,96,104,105,161,176,177,183,215,216,217,218,219,220,221,222,223,224,226],$VA6=[19,21,67,77,96,104,105,107,161,176,177,183,215,216,217,218,219,220,221,222,223,224,226],$VB6=[2,262],$VC6=[1,1624],$VD6=[1,1690],$VE6=[1,1696],$VF6=[1,1695],$VG6=[1,1716],$VH6=[1,1722],$VI6=[1,1721],$VJ6=[1,1742],$VK6=[1,1748],$VL6=[1,1747],$VM6=[1,1789],$VN6=[1,1795],$VO6=[1,1827],$VP6=[1,1833],$VQ6=[1,1848],$VR6=[1,1854],$VS6=[1,1853],$VT6=[1,1874],$VU6=[1,1880],$VV6=[1,1879],$VW6=[1,1900],$VX6=[1,1906],$VY6=[1,1905],$VZ6=[1,1947],$V_6=[1,1953],$V$6=[1,1985],$V07=[1,1991],$V17=[117,131,136,137,201,204],$V27=[2,169],$V37=[1,2009],$V47=[1,2010],$V57=[1,2011],$V67=[1,2012],$V77=[117,131,136,137,153,154,155,156,201,204],$V87=[2,34],$V97=[47,117,131,136,137,153,154,155,156,201,204],$Va7=[2,47],$Vb7=[47,49,117,131,136,137,153,154,155,156,201,204],$Vc7=[2,54],$Vd7=[1,2041],$Ve7=[66,136],$Vf7=[2,228],$Vg7=[1,2098],$Vh7=[1,2131],$Vi7=[1,2137],$Vj7=[1,2136],$Vk7=[1,2157],$Vl7=[1,2163],$Vm7=[1,2162],$Vn7=[1,2184],$Vo7=[1,2190],$Vp7=[1,2189],$Vq7=[1,2211],$Vr7=[1,2217],$Vs7=[1,2216],$Vt7=[1,2237],$Vu7=[1,2243],$Vv7=[1,2242],$Vw7=[1,2264],$Vx7=[1,2270],$Vy7=[1,2269],$Vz7=[1,2339],$VA7=[47,49,66,75,76,77,107,115,121,123,200,201,204,230],$VB7=[47,49,66,107,201,204],$VC7=[47,49,66,92,93,94,97,98,99,100,107,201,204],$VD7=[1,2453],$VE7=[2,170],$VF7=[2,174],$VG7=[2,175],$VH7=[2,176],$VI7=[2,177],$VJ7=[2,45],$VK7=[2,52],$VL7=[2,59],$VM7=[2,79],$VN7=[2,75],$VO7=[2,81],$VP7=[1,2536],$VQ7=[2,78],$VR7=[47,49,75,76,77,97,98,99,100,115,117,121,123,131,136,137,153,154,155,156,200,201,204,230],$VS7=[47,49,75,76,77,115,117,121,123,131,136,137,153,154,155,156,200,201,204,230],$VT7=[47,49,97,98,99,100,108,109,110,111,112,113,117,131,136,137,153,154,155,156,201,204],$VU7=[47,49,92,93,94,97,98,99,100,117,131,136,137,153,154,155,156,201,204],$VV7=[2,85],$VW7=[2,86],$VX7=[47,49,108,109,110,111,112,113,117,131,136,137,153,154,155,156,201,204],$VY7=[1,2574],$VZ7=[27,195,196,197],$V_7=[2,235],$V$7=[2,236],$V08=[1,2601],$V18=[1,2607],$V28=[1,2690],$V38=[1,2723],$V48=[1,2729],$V58=[1,2728],$V68=[1,2749],$V78=[1,2755],$V88=[1,2754],$V98=[1,2776],$Va8=[1,2782],$Vb8=[1,2781],$Vc8=[1,2803],$Vd8=[1,2809],$Ve8=[1,2808],$Vf8=[1,2829],$Vg8=[1,2835],$Vh8=[1,2834],$Vi8=[1,2856],$Vj8=[1,2862],$Vk8=[1,2861],$Vl8=[1,2903],$Vm8=[1,2936],$Vn8=[1,2942],$Vo8=[1,2941],$Vp8=[1,2962],$Vq8=[1,2968],$Vr8=[1,2967],$Vs8=[1,2989],$Vt8=[1,2995],$Vu8=[1,2994],$Vv8=[1,3016],$Vw8=[1,3022],$Vx8=[1,3021],$Vy8=[1,3042],$Vz8=[1,3048],$VA8=[1,3047],$VB8=[1,3069],$VC8=[1,3075],$VD8=[1,3074],$VE8=[117,131,136,137,204],$VF8=[1,3094],$VG8=[2,48],$VH8=[2,55],$VI8=[2,74],$VJ8=[2,80],$VK8=[2,76],$VL8=[2,82],$VM8=[47,49,97,98,99,100,117,131,136,137,153,154,155,156,201,204],$VN8=[1,3118],$VO8=[66,131,136,137,201,204],$VP8=[1,3127],$VQ8=[1,3128],$VR8=[1,3129],$VS8=[1,3130],$VT8=[66,131,136,137,153,154,155,156,201,204],$VU8=[47,66,131,136,137,153,154,155,156,201,204],$VV8=[47,49,66,131,136,137,153,154,155,156,201,204],$VW8=[1,3159],$VX8=[2,222],$VY8=[1,3239],$VZ8=[1,3245],$V_8=[1,3325],$V$8=[1,3331],$V09=[2,171],$V19=[2,46],$V29=[1,3419],$V39=[2,53],$V49=[1,3452],$V59=[2,77],$V69=[2,168],$V79=[1,3497],$V89=[47,49,66,75,76,77,97,98,99,100,115,121,123,131,136,137,153,154,155,156,200,201,204,230],$V99=[47,49,66,75,76,77,115,121,123,131,136,137,153,154,155,156,200,201,204,230],$Va9=[47,49,66,97,98,99,100,108,109,110,111,112,113,131,136,137,153,154,155,156,201,204],$Vb9=[47,49,66,92,93,94,97,98,99,100,131,136,137,153,154,155,156,201,204],$Vc9=[47,49,66,108,109,110,111,112,113,131,136,137,153,154,155,156,201,204],$Vd9=[1,3543],$Ve9=[1,3549],$Vf9=[1,3548],$Vg9=[1,3569],$Vh9=[1,3575],$Vi9=[1,3574],$Vj9=[1,3596],$Vk9=[1,3602],$Vl9=[1,3601],$Vm9=[1,3700],$Vn9=[1,3706],$Vo9=[1,3705],$Vp9=[1,3741],$Vq9=[1,3783],$Vr9=[66,131,136,137,204],$Vs9=[1,3813],$Vt9=[47,49,66,97,98,99,100,131,136,137,153,154,155,156,201,204],$Vu9=[1,3837],$Vv9=[1,3877],$Vw9=[1,3883],$Vx9=[1,3882],$Vy9=[1,3903],$Vz9=[1,3909],$VA9=[1,3908],$VB9=[1,3930],$VC9=[1,3936],$VD9=[1,3935],$VE9=[1,3957],$VF9=[1,3963],$VG9=[1,3962],$VH9=[1,3983],$VI9=[1,3989],$VJ9=[1,3988],$VK9=[1,4010],$VL9=[1,4016],$VM9=[1,4015],$VN9=[107,117,131,136,137,201,204],$VO9=[1,4058],$VP9=[1,4082],$VQ9=[1,4124],$VR9=[1,4157],$VS9=[1,4264],$VT9=[1,4307],$VU9=[1,4313],$VV9=[1,4312],$VW9=[1,4348],$VX9=[1,4390],$VY9=[1,4448],$VZ9=[66,107,131,136,137,201,204],$V_9=[1,4503],$V$9=[1,4527],$V0a=[1,4557],$V1a=[1,4603],$V2a=[1,4675],$V3a=[1,4724];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"shapeExprLabel":32,"O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C":33,"shapeExpression":34,"IT_EXTERNAL":35,"QIT_NOT_E_Opt":36,"shapeAtomNoRef":37,"QshapeOr_E_Opt":38,"IT_NOT":39,"shapeRef":40,"shapeOr":41,"inlineShapeExpression":42,"inlineShapeOr":43,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":44,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":45,"O_QIT_OR_E_S_QshapeAnd_E_C":46,"IT_OR":47,"O_QIT_AND_E_S_QshapeNot_E_C":48,"IT_AND":49,"shapeNot":50,"inlineShapeAnd":51,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":52,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":53,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":54,"inlineShapeNot":55,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":56,"O_QIT_AND_E_S_QinlineShapeNot_E_C":57,"shapeAtom":58,"inlineShapeAtom":59,"nonLitNodeConstraint":60,"QshapeOrRef_E_Opt":61,"litNodeConstraint":62,"shapeOrRef":63,"QnonLitNodeConstraint_E_Opt":64,"(":65,")":66,".":67,"shapeDefinition":68,"nonLitInlineNodeConstraint":69,"QinlineShapeOrRef_E_Opt":70,"litInlineNodeConstraint":71,"inlineShapeOrRef":72,"QnonLitInlineNodeConstraint_E_Opt":73,"inlineShapeDefinition":74,"ATPNAME_LN":75,"ATPNAME_NS":76,"@":77,"Qannotation_E_Star":78,"semanticActions":79,"annotation":80,"IT_LITERAL":81,"QxsFacet_E_Star":82,"datatype":83,"valueSet":84,"QnumericFacet_E_Plus":85,"xsFacet":86,"numericFacet":87,"nonLiteralKind":88,"QstringFacet_E_Star":89,"QstringFacet_E_Plus":90,"stringFacet":91,"IT_IRI":92,"IT_BNODE":93,"IT_NONLITERAL":94,"stringLength":95,"INTEGER":96,"REGEXP":97,"IT_LENGTH":98,"IT_MINLENGTH":99,"IT_MAXLENGTH":100,"numericRange":101,"rawNumeric":102,"numericLength":103,"DECIMAL":104,"DOUBLE":105,"string":106,"^^":107,"IT_MININCLUSIVE":108,"IT_MINEXCLUSIVE":109,"IT_MAXINCLUSIVE":110,"IT_MAXEXCLUSIVE":111,"IT_TOTALDIGITS":112,"IT_FRACTIONDIGITS":113,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":114,"{":115,"QtripleExpression_E_Opt":116,"}":117,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":118,"extension":119,"extraPropertySet":120,"IT_CLOSED":121,"tripleExpression":122,"IT_EXTRA":123,"Qpredicate_E_Plus":124,"predicate":125,"oneOfTripleExpr":126,"groupTripleExpr":127,"multiElementOneOf":128,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":129,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":130,"|":131,"singleElementGroup":132,"multiElementGroup":133,"unaryTripleExpr":134,"QGT_SEMI_E_Opt":135,",":136,";":137,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":138,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":139,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":140,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":141,"valueConstraint":142,"include":143,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":144,"$":145,"tripleExprLabel":146,"tripleConstraint":147,"bracketedTripleExpr":148,"Qcardinality_E_Opt":149,"cardinality":150,"QsenseFlags_E_Opt":151,"senseFlags":152,"*":153,"+":154,"?":155,"REPEAT_RANGE":156,"^":157,"!":158,"[":159,"QvalueSetValue_E_Star":160,"]":161,"valueSetValue":162,"iriRange":163,"literalRange":164,"languageRange":165,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":166,"QiriExclusion_E_Plus":167,"iriExclusion":168,"QliteralExclusion_E_Plus":169,"literalExclusion":170,"QlanguageExclusion_E_Plus":171,"languageExclusion":172,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":173,"QiriExclusion_E_Star":174,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":175,"~":176,"-":177,"QGT_TILDE_E_Opt":178,"literal":179,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":180,"QliteralExclusion_E_Star":181,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":182,"LANGTAG":183,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":184,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":185,"QlanguageExclusion_E_Star":186,"IT_UNIQUE":187,"Q_O_QIT_FOCUS_E_S_QGT_COMMA_E_C_E_Opt":188,"accessor":189,"Q_O_QGT_COMMA_E_S_Qaccessor_E_C_E_Star":190,"O_QGT_LT_E_Or_QGT_EQUAL_E_Or_QGT_NEQUAL_E_Or_QGT_GT_E_C":191,"O_QIT_FOCUS_E_S_QGT_COMMA_E_C":192,"IT_FOCUS":193,"O_QGT_COMMA_E_S_Qaccessor_E_C":194,"<":195,"!=":196,">":197,"IT_LANGTAG":198,"IT_DATATYPE":199,"&":200,"//":201,"O_Qiri_E_Or_Qliteral_E_C":202,"QcodeDecl_E_Star":203,"%":204,"O_QCODE_E_Or_QGT_MODULO_E_C":205,"CODE":206,"rdfLiteral":207,"numericLiteral":208,"booleanLiteral":209,"a":210,"blankNode":211,"langString":212,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":213,"O_QGT_DTYPE_E_S_Qdatatype_E_C":214,"IT_true":215,"IT_false":216,"STRING_LITERAL1":217,"STRING_LITERAL_LONG1":218,"STRING_LITERAL2":219,"STRING_LITERAL_LONG2":220,"LANG_STRING_LITERAL1":221,"LANG_STRING_LITERAL_LONG1":222,"LANG_STRING_LITERAL2":223,"LANG_STRING_LITERAL_LONG2":224,"prefixedName":225,"PNAME_LN":226,"BLANK_NODE_LABEL":227,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":228,"QshapeExprLabel_E_Plus":229,"IT_EXTENDS":230,"$accept":0,"$end":1},
terminals_: {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",35:"IT_EXTERNAL",39:"IT_NOT",47:"IT_OR",49:"IT_AND",65:"(",66:")",67:".",75:"ATPNAME_LN",76:"ATPNAME_NS",77:"@",81:"IT_LITERAL",92:"IT_IRI",93:"IT_BNODE",94:"IT_NONLITERAL",96:"INTEGER",97:"REGEXP",98:"IT_LENGTH",99:"IT_MINLENGTH",100:"IT_MAXLENGTH",104:"DECIMAL",105:"DOUBLE",107:"^^",108:"IT_MININCLUSIVE",109:"IT_MINEXCLUSIVE",110:"IT_MAXINCLUSIVE",111:"IT_MAXEXCLUSIVE",112:"IT_TOTALDIGITS",113:"IT_FRACTIONDIGITS",115:"{",117:"}",121:"IT_CLOSED",123:"IT_EXTRA",131:"|",136:",",137:";",145:"$",153:"*",154:"+",155:"?",156:"REPEAT_RANGE",157:"^",158:"!",159:"[",161:"]",176:"~",177:"-",183:"LANGTAG",187:"IT_UNIQUE",193:"IT_FOCUS",195:"<",196:"!=",197:">",198:"IT_LANGTAG",199:"IT_DATATYPE",200:"&",201:"//",204:"%",206:"CODE",210:"a",215:"IT_true",216:"IT_false",217:"STRING_LITERAL1",218:"STRING_LITERAL_LONG1",219:"STRING_LITERAL2",220:"STRING_LITERAL_LONG2",221:"LANG_STRING_LITERAL1",222:"LANG_STRING_LITERAL_LONG1",223:"LANG_STRING_LITERAL2",224:"LANG_STRING_LITERAL_LONG2",226:"PNAME_LN",227:"BLANK_NODE_LABEL",230:"IT_EXTENDS"},
productions_: [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,2],[33,1],[33,1],[34,3],[34,3],[34,2],[38,0],[38,1],[42,1],[41,1],[41,2],[46,2],[44,1],[44,2],[48,2],[45,1],[45,2],[29,0],[29,2],[43,2],[53,2],[52,0],[52,2],[28,2],[54,0],[54,2],[51,2],[57,2],[56,0],[56,2],[50,2],[36,0],[36,1],[55,2],[58,2],[58,1],[58,2],[58,3],[58,1],[61,0],[61,1],[64,0],[64,1],[37,2],[37,1],[37,2],[37,3],[37,1],[59,2],[59,1],[59,2],[59,3],[59,1],[70,0],[70,1],[73,0],[73,1],[63,1],[63,1],[72,1],[72,1],[40,1],[40,1],[40,2],[62,3],[78,0],[78,2],[60,3],[71,2],[71,2],[71,2],[71,1],[82,0],[82,2],[85,1],[85,2],[69,2],[69,1],[89,0],[89,2],[90,1],[90,2],[88,1],[88,1],[88,1],[86,1],[86,1],[91,2],[91,1],[95,1],[95,1],[95,1],[87,2],[87,2],[102,1],[102,1],[102,1],[102,3],[101,1],[101,1],[101,1],[101,1],[103,1],[103,1],[68,3],[74,4],[118,1],[118,1],[118,1],[114,0],[114,2],[116,0],[116,1],[120,2],[124,1],[124,2],[122,1],[126,1],[126,1],[128,2],[130,2],[129,1],[129,2],[127,1],[127,1],[132,2],[135,0],[135,1],[135,1],[133,3],[139,2],[139,2],[138,1],[138,2],[134,2],[134,1],[134,1],[144,2],[140,0],[140,1],[141,1],[141,1],[148,6],[149,0],[149,1],[147,6],[151,0],[151,1],[150,1],[150,1],[150,1],[150,1],[152,1],[152,2],[152,1],[152,2],[84,3],[160,0],[160,2],[162,1],[162,1],[162,1],[162,2],[167,1],[167,2],[169,1],[169,2],[171,1],[171,2],[166,1],[166,1],[166,1],[163,2],[174,0],[174,2],[175,2],[173,0],[173,1],[168,3],[178,0],[178,1],[164,2],[181,0],[181,2],[182,2],[180,0],[180,1],[170,3],[165,2],[165,2],[186,0],[186,2],[185,2],[184,0],[184,1],[172,3],[142,6],[142,3],[192,2],[188,0],[188,1],[194,2],[190,0],[190,2],[191,1],[191,1],[191,1],[191,1],[189,2],[189,5],[189,5],[143,2],[80,3],[202,1],[202,1],[79,1],[203,0],[203,2],[31,3],[205,1],[205,1],[179,1],[179,1],[179,1],[125,1],[125,1],[83,1],[32,1],[32,1],[146,1],[146,1],[208,1],[208,1],[208,1],[207,1],[207,2],[214,2],[213,0],[213,1],[209,1],[209,1],[106,1],[106,1],[106,1],[106,1],[212,1],[212,1],[212,1],[212,1],[22,1],[22,1],[225,1],[225,1],[211,1],[119,2],[228,1],[228,1],[229,1],[229,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

        let imports = Object.keys(Parser._imports).length ? { imports: Parser._imports } : {}
        const startObj = Parser.start ? { start: Parser.start } : {};
        const startActs = Parser.startActs ? { startActs: Parser.startActs } : {};
        let shapes = Parser.shapes ? { shapes: Object.values(Parser.shapes) } : {};
        const shexj = Object.assign(
          { type: "Schema" }, imports, startActs, startObj, shapes
        )
        if (Parser.options.index) {
          if (Parser._base !== null)
            shexj._base = Parser._base;
          shexj._prefixes = Parser._prefixes;
          shexj._index = {
            shapeExprs: Parser.shapes || new Map(),
            tripleExprs: Parser.productions || new Map()
          };
          shexj._sourceMap = Parser._sourceMap;
        }
        return shexj;
      
break;
case 2:
 yy.parser.yy = { lexer: yy.lexer} ; 
break;
case 15:
 // t: @@
        Parser._setBase(Parser._base === null ||
                    absoluteIRI.test($$[$0].slice(1, -1)) ? $$[$0].slice(1, -1) : _resolveIRI($$[$0].slice(1, -1)));
      
break;
case 16:
 // t: ShExParser-test.js/with pre-defined prefixes
        Parser._prefixes[$$[$0-1].slice(0, -1)] = $$[$0];
      
break;
case 17:
 // t: @@
        Parser._imports.push($$[$0]);
      
break;
case 20:

        if (Parser.start)
          error(new Error("Parse error: start already defined"), yy);
        Parser.start = shapeJunction("ShapeOr", $$[$0-1], $$[$0]); // t: startInline
      
break;
case 21:

        Parser.startActs = $$[$0]; // t: startCode1
      
break;
case 22:
this.$ = [$$[$0]] // t: startCode1;
break;
case 23:
this.$ = appendTo($$[$0-1], $$[$0]) // t: startCode3;
break;
case 26:
 // t: 1dot 1val1vsMinusiri3??
        addShape($$[$0-1],  $$[$0], yy);
      
break;
case 27:

        this.$ = nonest($$[$0]);
      
break;
case 28:
this.$ = { type: "ShapeExternal" };
break;
case 29:

        if ($$[$0-2])
          $$[$0-1] = { type: "ShapeNot", "shapeExpr": nonest($$[$0-1]) }; // t:@@
        if ($$[$0]) { // If there were disjuncts,
          //           shapeOr will have $$[$0].set needsAtom.
          //           Prepend $$[$0].needsAtom with $$[$0-1].
          //           Note that $$[$0] may be a ShapeOr or a ShapeAnd.
          $$[$0].needsAtom.unshift(nonest($$[$0-1]));
          delete $$[$0].needsAtom;
          this.$ = $$[$0];
        } else {
          this.$ = $$[$0-1];
        }
      
break;
case 30:

        $$[$0-1] = { type: "ShapeNot", "shapeExpr": nonest($$[$0-1]) } // !!! opt
        if ($$[$0]) { // If there were disjuncts,
          //           shapeOr will have $$[$0].set needsAtom.
          //           Prepend $$[$0].needsAtom with $$[$0-1].
          //           Note that $$[$0] may be a ShapeOr or a ShapeAnd.
          $$[$0].needsAtom.unshift(nonest($$[$0-1]));
          delete $$[$0].needsAtom;
          this.$ = $$[$0];
        } else {
          this.$ = $$[$0-1];
        }
      
break;
case 31:

        $$[$0].needsAtom.unshift(nonest($$[$0-1]));
        delete $$[$0].needsAtom;
        this.$ = $$[$0]; // { type: "ShapeOr", "shapeExprs": [$$[$0-1]].concat($$[$0]) };
      
break;
case 32: case 246: case 263:
this.$ = null;
break;
case 33: case 37: case 40: case 46: case 53: case 188: case 227: case 262:
this.$ = $$[$0];
break;
case 35:
 // returns a ShapeOr
        const disjuncts = $$[$0].map(nonest);
        this.$ = { type: "ShapeOr", shapeExprs: disjuncts, needsAtom: disjuncts }; // t: @@
      
break;
case 36:
 // returns a ShapeAnd
        // $$[$0-1] could have implicit conjuncts and explicit nested ANDs (will have .nested: true)
        $$[$0-1].filter(c => c.type === "ShapeAnd").length === $$[$0-1].length
        const and = {
          type: "ShapeAnd",
          shapeExprs: $$[$0-1].reduce(
            (acc, elt) =>
              acc.concat(elt.type === 'ShapeAnd' && !elt.nested ? elt.shapeExprs : nonest(elt)), []
          )
        };
        this.$ = $$[$0].length > 0 ? { type: "ShapeOr", shapeExprs: [and].concat($$[$0].map(nonest)) } : and; // t: @@
        this.$.needsAtom = and.shapeExprs;
      
break;
case 38: case 41:
this.$ = [$$[$0]];
break;
case 39: case 42: case 44: case 48: case 51: case 55: case 229:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 43: case 47: case 50: case 54: case 228:
this.$ = [];
break;
case 45:
this.$ = shapeJunction("ShapeOr", $$[$0-1], $$[$0]);
break;
case 49: case 52:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]) // t: @@;
break;
case 56:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t:@@ */ : $$[$0];
break;
case 57: case 225:
this.$ = false;
break;
case 58: case 226:
this.$ = true;
break;
case 59:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $$[$0];
break;
case 60: case 69: case 74:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1];
break;
case 62:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t: 1dotRef1 */ : $$[$0-1] // t:@@;
break;
case 63: case 72: case 77:
this.$ = Object.assign($$[$0-1], {nested: true}) // t: 1val1vsMinusiri3;
break;
case 64: case 73: case 78:
this.$ = EmptyShape // t: 1dot;
break;
case 71:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t:@@ */ : $$[$0-1]	 // t: 1dotRef1 -- use _QnonLitNodeConstraint_E_Opt like below?;
break;
case 76:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: !! look to 1dotRef1;
break;
case 87:
 // t: 1dotRefLNex@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        const namePos = $$[$0].indexOf(':');
        this.$ = addSourceMap(expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1), yy); // ShapeRef
      
break;
case 88:
 // t: 1dotRefNS1@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = addSourceMap(expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy), yy); // ShapeRef
      
break;
case 89:
this.$ = addSourceMap($$[$0], yy) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
break;
case 90: case 93:
 // t: !!
        this.$ = $$[$0-2]
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !!
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !!
      
break;
case 91:
this.$ = [] // t: 1dot, 1dotAnnot3;
break;
case 92:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotAnnot3;
break;
case 94:
this.$ = extend({ type: "NodeConstraint", nodeKind: "literal" }, $$[$0]) // t: 1literalPattern;
break;
case 95:

        if (numericDatatypes.indexOf($$[$0-1]) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $$[$0])
              error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]), yy);
          });
        this.$ = extend({ type: "NodeConstraint", datatype: $$[$0-1] }, $$[$0]) // t: 1datatype
      
break;
case 96:
this.$ = { type: "NodeConstraint", values: $$[$0-1] } // t: 1val1IRIREF;
break;
case 97:
this.$ = extend({ type: "NodeConstraint"}, $$[$0]);
break;
case 98:
this.$ = {} // t: 1literalPattern;
break;
case 99:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1literalLength
      
break;
case 101: case 107:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: !! look to 1literalLength
      
break;
case 102:
this.$ = extend({ type: "NodeConstraint" }, $$[$0-1], $$[$0] ? $$[$0] : {}) // t: 1iriPattern;
break;
case 103:
this.$ = extend({ type: "NodeConstraint" }, $$[$0]) // t: @@;
break;
case 104:
this.$ = {};
break;
case 105:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0])
      
break;
case 108:
this.$ = { nodeKind: "iri" } // t: 1iriPattern;
break;
case 109:
this.$ = { nodeKind: "bnode" } // t: 1bnodeLength;
break;
case 110:
this.$ = { nodeKind: "nonliteral" } // t: 1nonliteralLength;
break;
case 113:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalLength;
break;
case 114:
this.$ = unescapeRegexp($$[$0]) // t: 1literalPattern;
break;
case 115:
this.$ = "length" // t: 1literalLength;
break;
case 116:
this.$ = "minlength" // t: 1literalMinlength;
break;
case 117:
this.$ = "maxlength" // t: 1literalMaxlength;
break;
case 118:
this.$ = keyValObject($$[$0-1], $$[$0]) // t: 1literalMininclusive;
break;
case 119:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalTotaldigits;
break;
case 120:
this.$ = parseInt($$[$0], 10);
break;
case 121: case 122:
this.$ = parseFloat($$[$0]);
break;
case 123:
 // ## deprecated
        if ($$[$0] === XSD_DECIMAL || $$[$0] === XSD_FLOAT || $$[$0] === XSD_DOUBLE)
          this.$ = parseFloat($$[$0-2].value);
        else if (numericDatatypes.indexOf($$[$0]) !== -1)
          this.$ = parseInt($$[$0-2].value)
        else
          error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]), yy);
      
break;
case 124:
this.$ = "mininclusive" // t: 1literalMininclusive;
break;
case 125:
this.$ = "minexclusive" // t: 1literalMinexclusive;
break;
case 126:
this.$ = "maxinclusive" // t: 1literalMaxinclusive;
break;
case 127:
this.$ = "maxexclusive" // t: 1literalMaxexclusive;
break;
case 128:
this.$ = "totaldigits" // t: 1literalTotaldigits;
break;
case 129:
this.$ = "fractiondigits" // t: 1literalFractiondigits;
break;
case 130:
 // t: 1dotInherit3
        this.$ = $$[$0-2] === EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: 0
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 131:
 // t: 1dotInherit3
        const exprObj = $$[$0-1] ? { expression: $$[$0-1] } : EmptyObject; // t: 0, 0Inherit1
        this.$ = (exprObj === EmptyObject && $$[$0-3] === EmptyObject) ?
	  EmptyShape :
	  extend({ type: "Shape" }, exprObj, $$[$0-3]);
      
break;
case 132:
this.$ = [ "inherit", $$[$0] ] // t: 1dotInherit1;
break;
case 133:
this.$ = [ "extra", $$[$0] ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 134:
this.$ = [ "closed", true ] // t: 1dotClosed;
break;
case 135:
this.$ = EmptyObject;
break;
case 136:

        if ($$[$0-1] === EmptyObject)
          $$[$0-1] = {};
        if ($$[$0][0] === "closed")
          $$[$0-1]["closed"] = true; // t: 1dotClosed
        else if ($$[$0][0] in $$[$0-1])
          $$[$0-1][$$[$0][0]] = unionAll($$[$0-1][$$[$0][0]], $$[$0][1]); // t: 1dotInherit3, 3groupdot3Extra, 3groupdotExtra3
        else
          $$[$0-1][$$[$0][0]] = $$[$0][1]; // t: 1dotInherit1
        this.$ = $$[$0-1];
      
break;
case 139:
this.$ = $$[$0] // t: 1dotExtra1, 3groupdot3Extra;
break;
case 140:
this.$ = [$$[$0]] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 141:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 3groupdotExtra3;
break;
case 145:
this.$ = { type: "OneOf", expressions: unionAll([$$[$0-1]], $$[$0]) } // t: 2oneOfdot;
break;
case 146:
this.$ = $$[$0] // t: 2oneOfdot;
break;
case 147:
this.$ = [$$[$0]] // t: 2oneOfdot;
break;
case 148:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2oneOfdot;
break;
case 151:
this.$ = $$[$0-1];
break;
case 155:
this.$ = { type: "EachOf", expressions: unionAll([$$[$0-2]], $$[$0-1]) } // t: 2groupOfdot;
break;
case 156:
this.$ = $$[$0] // ## deprecated // t: 2groupOfdot;
break;
case 157:
this.$ = $$[$0] // t: 2groupOfdot;
break;
case 158:
this.$ = [$$[$0]] // t: 2groupOfdot;
break;
case 159:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2groupOfdot;
break;
case 160:

        if ($$[$0-1]) {
          this.$ = extend({ id: $$[$0-1] }, $$[$0]);
          addProduction($$[$0-1],  this.$, yy);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 163:
this.$ = addSourceMap($$[$0], yy);
break;
case 168:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 169:
this.$ = {} // t: 1dot;
break;
case 171:

        // $$[$0]: t: 1dotCode1
	if ($$[$0-3] !== EmptyShape && false) {
	  const t = blank();
	  addShape(t, $$[$0-3], yy);
	  $$[$0-3] = t; // ShapeRef
	}
        // %6: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5] ? $$[$0-5] : {}, { predicate: $$[$0-4] }, ($$[$0-3] === EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot // t: 1inversedot, 1negatedinversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3 // t: 1inversedotAnnot3
      
break;
case 174:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 175:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 176:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 177:

        $$[$0] = $$[$0].substr(1, $$[$0].length-2);
        const nums = $$[$0].match(/(\d+)/g);
        this.$ = { min: parseInt(nums[0], 10) }; // t: 1card2blank, 1card2Star
        if (nums.length === 2)
            this.$["max"] = parseInt(nums[1], 10); // t: 1card23
        else if ($$[$0].indexOf(',') === -1) // t: 1card2
            this.$["max"] = parseInt(nums[0], 10);
        else
            this.$["max"] = UNBOUNDED;
      
break;
case 178:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 179:
this.$ = { inverse: true, negated: true } // t: 1negatedinversedot;
break;
case 180:
this.$ = { negated: true } // t: 1negateddot;
break;
case 181:
this.$ = { inverse: true, negated: true } // t: 1inversenegateddot;
break;
case 182:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 183:
this.$ = [] // t: 1val1IRIREF;
break;
case 184:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 189:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 190:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 191:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 192:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 193:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 194:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 195:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 196:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 197:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 198:

        if ($$[$0]) {
          this.$ = {  // t: 1val1iriStem, 1val1iriStemMinusiri3
            type: $$[$0].length ? "IriStemRange" : "IriStem",
            stem: $$[$0-1]
          };
          if ($$[$0].length)
            this.$["exclusions"] = $$[$0]; // t: 1val1iriStemMinusiri3
        } else {
          this.$ = $$[$0-1]; // t: 1val1IRIREF, 1AvalA
        }
      
break;
case 199:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 200:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 201:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 204:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 207:

        if ($$[$0]) {
          this.$ = {  // t: 1val1literalStemMinusliteralStem3, 1val1literalStem
            type: $$[$0].length ? "LiteralStemRange" : "LiteralStem",
            stem: $$[$0-1].value
          };
          if ($$[$0].length)
            this.$["exclusions"] = $$[$0]; // t: 1val1literalStemMinusliteral3
        } else {
          this.$ = $$[$0-1]; // t: 1val1LITERAL
        }
      
break;
case 208:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 209:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 210:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 213:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 214:

        if ($$[$0]) {
          this.$ = {  // t: 1val1languageStemMinuslanguage3 1val1languageStemMinuslanguageStem3 : 1val1languageStem
            type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
            stem: $$[$0-1]
          };
          if ($$[$0].length)
            this.$["exclusions"] = $$[$0]; // t: 1val1languageStemMinuslanguage3, 1val1languageStemMinuslanguageStem3
        } else {
          this.$ = { type: "Language", languageTag: $$[$0-1] }; // t: 1val1language
        }
      
break;
case 215:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 216:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 217:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 218:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 221:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 222:

        this.$ = { type: "Unique", focus: $$[$0-3], uniques: [$$[$0-2]].concat($$[$0-1]) };
      
break;
case 223:

        this.$ = { type: "ValueComparison", left: $$[$0-2], comparator: $$[$0-1], right: $$[$0] };
      
break;
case 234:
this.$ = { type: "TermAccessor", productionLabel: $$[$0] };
break;
case 235:
this.$ = { type: "LangtagAccessor", name: $$[$0-1] };
break;
case 236:
this.$ = { type: "DatatypeAccessor", name: $$[$0-1] };
break;
case 237:
this.$ = addSourceMap($$[$0], yy) // Inclusion // t: 2groupInclude1;
break;
case 238:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 241:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 242:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 243:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 244:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 251:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 257:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 258:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 259:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 261:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 265:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 266:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 267:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 268:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 269:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 270:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 271:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 272:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 273:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 274:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 275:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = Parser._base === null || absoluteIRI.test(unesc) ? unesc : _resolveIRI(unesc)
      
break;
case 277:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 278:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
case 280:
this.$ = $$[$0] // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3;
break;
case 283:
this.$ = [$$[$0]] // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3;
break;
case 284:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotInherit3;
break;
}
},
table: [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),{6:4,7:[2,10],8:5,9:10,10:14,11:15,14:6,15:7,16:8,17:9,18:[1,11],19:$V1,20:[1,12],21:$V2,22:22,23:[1,13],24:16,25:17,26:[1,19],30:18,31:21,32:20,204:$V3,211:23,225:26,226:$V4,227:$V5},{7:[1,30]},o($V0,[2,4]),{7:[2,11]},o($V0,$V6),o($V0,$V7),o($V0,$V8),o($V9,[2,7],{12:31}),{19:[1,32]},{21:[1,33]},{19:$Va,21:$Vb,22:34,225:36,226:$Vc},o($V9,[2,5]),o($V9,[2,6]),o($V9,$Vd),o($V9,$Ve),o($V9,[2,21],{31:39,204:$V3}),{27:[1,40]},o($Vf,$Vg,{33:41,34:42,36:44,40:46,35:[1,43],39:[1,45],75:$Vh,76:$Vi,77:$Vj}),o($V0,[2,22]),o($Vk,$Vl),o($Vk,$Vm),{19:$Vn,21:$Vo,22:50,225:52,226:$Vp},o($Vk,$Vq),o($Vk,$Vr),o($Vk,$Vs),o($Vk,$Vt),o($Vk,$Vu),{1:[2,1]},{7:[2,9],8:56,10:57,13:55,15:58,16:59,17:60,18:[1,63],19:$V1,20:[1,64],21:$V2,22:22,23:[1,65],24:61,25:62,26:[1,66],32:67,211:23,225:26,226:$V4,227:$V5},o($V0,$Vv),{19:$Va,21:$Vb,22:68,225:36,226:$Vc},o($V0,$Vw),o($V0,$Vq),o($V0,$Vr),o($V0,$Vt),o($V0,$Vu),o($V0,[2,23]),o($Vx,$Vg,{28:69,50:70,36:71,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:73,60:74,62:75,68:76,69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,225:99,101:100,103:101,19:$VE,21:$VF,65:[1,77],67:[1,78],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:$VU,226:$VV}),o($Vf,$VW,{40:113,75:$VX,76:$VY,77:$VZ}),{41:117,44:118,45:119,46:120,47:$V_,48:121,49:$V$},o($V01,$V11),o($V01,$V21),{19:[1,127],21:[1,131],22:125,32:124,211:126,225:128,226:[1,130],227:[1,129]},{204:[1,134],205:132,206:[1,133]},o($V31,$Vq),o($V31,$Vr),o($V31,$Vt),o($V31,$Vu),o($V9,[2,8]),o($V9,[2,24]),o($V9,[2,25]),o($V9,$V6),o($V9,$V7),o($V9,$V8),o($V9,$Vd),o($V9,$Ve),{19:[1,135]},{21:[1,136]},{19:$V41,21:$V51,22:137,225:139,226:$V61},{27:[1,142]},o($Vf,$Vg,{33:143,34:144,36:146,40:148,35:[1,145],39:[1,147],75:$Vh,76:$Vi,77:$Vj}),o($V0,$V71),o($V81,$V91,{29:149}),o($Va1,$Vb1,{54:150}),o($VC,$VD,{69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,225:99,101:100,103:101,58:151,60:152,62:153,63:154,68:157,40:158,19:$VE,21:$VF,65:[1,155],67:[1,156],75:[1,159],76:[1,160],77:[1,161],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:$VU,226:$VV}),o($Vx,$VW),o($V9,$Vc1,{44:118,45:119,46:120,48:121,38:162,41:163,47:$V_,49:$V$}),o($Va1,$Vd1,{61:164,63:165,68:166,40:167,74:168,114:169,75:$VX,76:$VY,77:$VZ,115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:170,60:171,69:172,88:173,90:174,91:178,95:179,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{34:181,36:182,40:184,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:185}),o($Vo1,$Vn1,{78:186}),o($Vp1,$Vn1,{78:187}),o($Vq1,$Vr1,{89:188}),o($Vm1,$Vs1,{95:96,91:189,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:190}),o($Vt1,$Vu1,{82:191}),o($Vt1,$Vu1,{82:192}),o($Vo1,$Vv1,{101:100,103:101,87:193,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,194],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{160:203}),o($VH1,$VI1),{96:[1,204]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,206],102:205,104:[1,207],105:[1,208],106:209,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,214]},{96:[2,115]},{96:[2,116]},{96:[2,117]},o($Vt1,$Vt),o($Vt1,$Vu),o($VO1,[2,124]),o($VO1,[2,125]),o($VO1,[2,126]),o($VO1,[2,127]),{96:[2,128]},{96:[2,129]},o($V9,$Vc1,{44:118,45:119,46:120,48:121,41:163,38:215,47:$V_,49:$V$}),o($Va1,$V11),o($Va1,$V21),{19:[1,219],21:[1,223],22:217,32:216,211:218,225:220,226:[1,222],227:[1,221]},o($V9,$VP1),o($V9,$VQ1,{46:224,47:$V_}),o($V81,$V91,{29:225,48:226,49:$V$}),o($V81,$VR1),o($Va1,$VS1),o($Vx,$Vg,{28:227,50:228,36:229,39:$Vy}),o($Vx,$Vg,{50:230,36:231,39:$Vy}),o($V01,$VT1),o($V01,$Vl),o($V01,$Vm),o($V01,$Vq),o($V01,$Vr),o($V01,$Vs),o($V01,$Vt),o($V01,$Vu),o($V0,$VU1),o($V0,$VV1),o($V0,$VW1),o($V9,$Vv),{19:$V41,21:$V51,22:232,225:139,226:$V61},o($V9,$Vw),o($V9,$Vq),o($V9,$Vr),o($V9,$Vt),o($V9,$Vu),o($Vx,$Vg,{28:233,50:234,36:235,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:236,60:237,62:238,68:239,69:242,71:243,74:244,88:245,90:246,83:248,84:249,85:250,114:251,91:255,22:256,87:258,95:259,225:262,101:263,103:264,19:$VX1,21:$VY1,65:[1,240],67:[1,241],81:$VZ1,92:$V_1,93:$V$1,94:$V02,97:$V12,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:$V22,226:$V32}),o($Vf,$VW,{40:267,75:$V42,76:$V52,77:$V62}),{41:271,44:272,45:273,46:274,47:$V72,48:275,49:$V82},o($V9,$V92,{46:278,47:$V_}),o($V81,$Va2,{48:279,49:$V$}),o($Va1,$Vb2),o($Va1,$Vd1,{63:165,68:166,40:167,74:168,114:169,61:280,75:$VX,76:$VY,77:$VZ,115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{60:171,69:172,88:173,90:174,91:178,95:179,64:281,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:282,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Ve2,$V11),o($Ve2,$V21),{19:[1,286],21:[1,290],22:284,32:283,211:285,225:287,226:[1,289],227:[1,288]},o($V9,$Vh2),o($V9,$Vi2),o($Va1,$Vj2),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:291}),{115:[1,292],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Va1,$Vl2),o($Va1,$Vm2),o($Vo1,$Vn1,{78:293}),o($Vn2,$Vr1,{89:294}),o($Vo1,$Vs1,{95:179,91:295,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,296]},o($Vn2,$VJ1),{66:[1,297]},o($VC,$VD,{37:298,60:299,62:300,68:301,69:304,71:305,74:306,88:307,90:308,83:310,84:311,85:312,114:313,91:317,22:318,87:320,95:321,225:324,101:325,103:326,19:[1,323],21:[1,328],65:[1,302],67:[1,303],81:[1,309],92:[1,314],93:[1,315],94:[1,316],97:$Vo2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,319],226:[1,327]}),o($Vf,$VW,{40:329,75:$Vp2,76:$Vq2,77:$Vr2}),{41:333,44:334,45:335,46:336,47:$Vs2,48:337,49:$Vt2},o($Vu2,$Vv2,{79:340,80:341,203:342,201:[1,343]}),o($Vw2,$Vv2,{79:344,80:345,203:346,201:$Vx2}),o($Vy2,$Vv2,{79:348,80:349,203:350,201:[1,351]}),o($Vm1,$Vz2,{95:96,91:352,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:353,91:354,87:355,95:356,101:358,103:359,97:$VC2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:353,91:354,87:355,95:356,101:358,103:359,97:$VC2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:353,91:354,87:355,95:356,101:358,103:359,97:$VC2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($VG2,$VH2,{116:360,122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VC,[2,136]),o($VC,[2,132]),o($VC,[2,133]),o($VC,[2,134]),{19:$VO2,21:$VP2,22:380,32:379,211:381,225:383,226:$VQ2,227:$VR2,229:378},{19:$VS2,21:$VT2,22:389,124:387,125:388,210:$VU2,225:392,226:$VV2},o($VW2,[2,281]),o($VW2,[2,282]),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,395],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($Vq1,$Ve3),o($VH1,$Vf3),o($VH1,$Vg3),o($VH1,$Vh3),o($VH1,$Vi3),{107:[1,427]},{107:$Vj3},{107:$Vk3},{107:$Vl3},{107:$Vm3},o($VH1,$Vn3),o($V9,$Vo3),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vp3),o($V9,$Vq3,{46:278,47:$V_}),o($Va1,$Vr3),o($V81,$Vs3),o($Va1,$Vb1,{54:428}),o($VC,$VD,{58:429,60:430,62:431,63:432,69:435,71:436,68:437,40:438,88:439,90:440,83:442,84:443,85:444,74:445,91:452,22:453,87:455,114:456,95:457,225:460,101:461,103:462,19:[1,459],21:[1,464],65:[1,433],67:[1,434],75:[1,446],76:[1,447],77:[1,448],81:[1,441],92:[1,449],93:[1,450],94:[1,451],97:$Vt3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,454],226:[1,463]}),o($Va1,$Vu3),o($VC,$VD,{58:465,60:466,62:467,63:468,69:471,71:472,68:473,40:474,88:475,90:476,83:478,84:479,85:480,74:481,91:488,22:489,87:491,114:492,95:493,225:496,101:497,103:498,19:[1,495],21:[1,500],65:[1,469],67:[1,470],75:[1,482],76:[1,483],77:[1,484],81:[1,477],92:[1,485],93:[1,486],94:[1,487],97:$Vv3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,490],226:[1,499]}),o($V9,$V71),o($V81,$V91,{29:501}),o($Va1,$Vb1,{54:502}),o($VC,$VD,{69:242,71:243,74:244,88:245,90:246,83:248,84:249,85:250,114:251,91:255,22:256,87:258,95:259,225:262,101:263,103:264,58:503,60:504,62:505,63:506,68:509,40:510,19:$VX1,21:$VY1,65:[1,507],67:[1,508],75:[1,511],76:[1,512],77:[1,513],81:$VZ1,92:$V_1,93:$V$1,94:$V02,97:$V12,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:$V22,226:$V32}),o($V9,$Vc1,{44:272,45:273,46:274,48:275,38:514,41:515,47:$V72,49:$V82}),o($Va1,$Vd1,{61:516,63:517,68:518,40:519,74:520,114:521,75:$V42,76:$V52,77:$V62,115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:522,60:523,69:524,88:525,90:526,91:530,95:531,92:$Vw3,93:$Vx3,94:$Vy3,97:$Vz3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:533,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:534}),o($Vo1,$Vn1,{78:535}),o($Vp1,$Vn1,{78:536}),o($Vq1,$Vr1,{89:537}),o($Vm1,$Vs1,{95:259,91:538,97:$V12,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:539}),o($Vt1,$Vu1,{82:540}),o($Vt1,$Vu1,{82:541}),o($Vo1,$Vv1,{101:263,103:264,87:542,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,543],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{160:544}),o($VH1,$VI1),{96:[1,545]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,547],102:546,104:[1,548],105:[1,549],106:550,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,551]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$Vc1,{44:272,45:273,46:274,48:275,41:515,38:552,47:$V72,49:$V82}),o($Va1,$V11),o($Va1,$V21),{19:[1,556],21:[1,560],22:554,32:553,211:555,225:557,226:[1,559],227:[1,558]},o($V9,$VP1),o($V9,$VQ1,{46:561,47:$V72}),o($V81,$V91,{29:562,48:563,49:$V82}),o($V81,$VR1),o($Va1,$VS1),o($Vx,$Vg,{28:564,50:565,36:566,39:$Vy}),o($Vx,$Vg,{50:567,36:568,39:$Vy}),o($V81,$VA3),o($Va1,$VB3),o($Va1,$VC3),o($Va1,$VD3),{66:[1,569]},o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),o($Vw2,$Vv2,{80:345,203:346,79:570,201:$Vx2}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:571,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vw2,$Vv2,{80:345,203:346,79:572,201:$Vx2}),o($Vo1,$Vz2,{95:179,91:573,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Ve3),o($Va1,$VE3),{38:574,41:575,44:334,45:335,46:336,47:$Vs2,48:337,49:$Vt2,66:$Vc1},o($VC,$VD,{61:576,63:577,68:578,40:579,74:580,114:581,47:$Vd1,49:$Vd1,66:$Vd1,75:$Vp2,76:$Vq2,77:$Vr2}),o($VF3,$Ve1),o($VF3,$Vf1,{64:582,60:583,69:584,88:585,90:586,91:590,95:591,92:[1,587],93:[1,588],94:[1,589],97:$VG3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:593,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VF3,$Vl1),o($VH3,$Vn1,{78:594}),o($VI3,$Vn1,{78:595}),o($VJ3,$Vn1,{78:596}),o($VK3,$Vr1,{89:597}),o($VH3,$Vs1,{95:321,91:598,97:$Vo2,98:$VL,99:$VM,100:$VN}),o($VL3,$Vu1,{82:599}),o($VL3,$Vu1,{82:600}),o($VL3,$Vu1,{82:601}),o($VI3,$Vv1,{101:325,103:326,87:602,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,603],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VK3,$VA1),o($VK3,$VB1),o($VK3,$VC1),o($VK3,$VD1),o($VL3,$VE1),o($VF1,$VG1,{160:604}),o($VM3,$VI1),{96:[1,605]},o($VK3,$VJ1),o($VL3,$Vq),o($VL3,$Vr),{96:[1,607],102:606,104:[1,608],105:[1,609],106:610,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,611]},o($VL3,$Vt),o($VL3,$Vu),{38:612,41:575,44:334,45:335,46:336,47:$Vs2,48:337,49:$Vt2,66:$Vc1},o($VF3,$V11),o($VF3,$V21),{19:[1,616],21:[1,620],22:614,32:613,211:615,225:617,226:[1,619],227:[1,618]},{66:$VP1},{46:621,47:$Vs2,66:$VQ1},o($VN3,$V91,{29:622,48:623,49:$Vt2}),o($VN3,$VR1),o($VF3,$VS1),o($Vx,$Vg,{28:624,50:625,36:626,39:$Vy}),o($Vx,$Vg,{50:627,36:628,39:$Vy}),o($VO3,$VP3),o($Vm1,$VQ3),o($VO3,$VR3,{31:629,204:[1,630]}),{19:$VS3,21:$VT3,22:632,125:631,210:$VU3,225:635,226:$VV3},o($Va1,$VW3),o($Vo1,$VQ3),o($Va1,$VR3,{31:638,204:[1,639]}),{19:$VS3,21:$VT3,22:632,125:640,210:$VU3,225:635,226:$VV3},o($Ve2,$VX3),o($Vp1,$VQ3),o($Ve2,$VR3,{31:641,204:[1,642]}),{19:$VS3,21:$VT3,22:632,125:643,210:$VU3,225:635,226:$VV3},o($Vq1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),{96:[1,644]},o($Vt1,$VJ1),{96:[1,646],102:645,104:[1,647],105:[1,648],106:649,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,650]},{117:[1,651]},{117:[2,138]},{117:$V04},{117:$V14,129:652,130:653,131:$V24},{117:$V34},o($V44,$V54),o($V44,$V64),o($V44,$V74,{135:655,138:656,139:659,136:$V84,137:$V94}),o($Va4,$Vb4,{141:660,147:661,148:662,151:663,152:665,65:[1,664],157:$Vc4,158:$Vd4}),o($Ve4,$Vf4),o($Ve4,$Vg4),o($VG2,[2,165]),{65:[1,668]},{27:$Vh4,191:669,195:$Vi4,196:$Vj4,197:$Vk4},{19:$Vl4,21:$Vm4,22:675,146:674,211:676,225:678,226:$Vn4,227:$Vo4},{19:[1,685],21:[1,689],22:683,146:682,211:684,225:686,226:[1,688],227:[1,687]},{65:[1,690]},{65:[1,691]},o($VC,[2,280],{22:380,211:381,225:383,32:692,19:$VO2,21:$VP2,226:$VQ2,227:$VR2}),o($Vp4,[2,283]),o($Vp4,$Vl),o($Vp4,$Vm),o($Vp4,$Vq),o($Vp4,$Vr),o($Vp4,$Vs),o($Vp4,$Vt),o($Vp4,$Vu),o($VC,[2,139],{22:389,225:392,125:693,19:$VS2,21:$VT2,210:$VU2,226:$VV2}),o($Vq4,[2,140]),o($Vq4,$Vr4),o($Vq4,$Vs4),o($Vq4,$Vq),o($Vq4,$Vr),o($Vq4,$Vt),o($Vq4,$Vu),o($Vt1,$Vt4),o($VF1,[2,184]),o($VF1,[2,185]),o($VF1,[2,186]),o($VF1,[2,187]),{166:694,167:695,168:698,169:696,170:699,171:697,172:700,177:[1,701]},o($VF1,[2,202],{173:702,175:703,176:[1,704]}),o($VF1,[2,211],{180:705,182:706,176:[1,707]}),o($VF1,[2,219],{184:708,185:709,176:$Vu4}),{176:$Vu4,185:711},o($Vv4,$Vq),o($Vv4,$Vr),o($Vv4,$Vw4),o($Vv4,$Vx4),o($Vv4,$Vy4),o($Vv4,$Vt),o($Vv4,$Vu),o($Vv4,$Vz4),o($Vv4,$VA4,{213:712,214:713,107:[1,714]}),o($Vv4,$VB4),o($Vv4,$VC4),o($Vv4,$VD4),o($Vv4,$VE4),o($Vv4,$VF4),o($Vv4,$VG4),o($Vv4,$VH4),o($Vv4,$VI4),o($Vv4,$VJ4),o($VK4,$Vj3),o($VK4,$Vk3),o($VK4,$Vl3),o($VK4,$Vm3),{19:[1,717],21:[1,720],22:716,83:715,225:718,226:[1,719]},o($V81,$Va2,{48:721,49:[1,722]}),o($Va1,$Vb2),o($Va1,$Vd1,{61:723,63:724,68:725,40:726,74:727,114:731,75:[1,728],76:[1,729],77:[1,730],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:732,60:733,69:734,88:735,90:736,91:740,95:741,92:[1,737],93:[1,738],94:[1,739],97:$VL4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:743,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:744}),o($Vo1,$Vn1,{78:745}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:746}),o($Vm1,$Vs1,{95:457,91:747,97:$Vt3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:748}),o($Vt1,$Vu1,{82:749}),o($Vt1,$Vu1,{82:750}),o($Vo1,$Vv1,{101:461,103:462,87:751,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:752}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,756],21:[1,760],22:754,32:753,211:755,225:757,226:[1,759],227:[1,758]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{160:761}),o($VH1,$VI1),{115:[1,762],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},{96:[1,763]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,765],102:764,104:[1,766],105:[1,767],106:768,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,769]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$Vb2),o($Va1,$Vd1,{61:770,63:771,68:772,40:773,74:774,114:778,75:[1,775],76:[1,776],77:[1,777],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:779,60:780,69:781,88:782,90:783,91:787,95:788,92:[1,784],93:[1,785],94:[1,786],97:$VM4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:790,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:791}),o($Vo1,$Vn1,{78:792}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:793}),o($Vm1,$Vs1,{95:493,91:794,97:$Vv3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:795}),o($Vt1,$Vu1,{82:796}),o($Vt1,$Vu1,{82:797}),o($Vo1,$Vv1,{101:497,103:498,87:798,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:799}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,803],21:[1,807],22:801,32:800,211:802,225:804,226:[1,806],227:[1,805]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{160:808}),o($VH1,$VI1),{115:[1,809],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},{96:[1,810]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,812],102:811,104:[1,813],105:[1,814],106:815,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,816]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$V92,{46:817,47:$V72}),o($V81,$Va2,{48:818,49:$V82}),o($Va1,$Vb2),o($Va1,$Vd1,{63:517,68:518,40:519,74:520,114:521,61:819,75:$V42,76:$V52,77:$V62,115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{60:523,69:524,88:525,90:526,91:530,95:531,64:820,92:$Vw3,93:$Vx3,94:$Vy3,97:$Vz3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:821,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Ve2,$V11),o($Ve2,$V21),{19:[1,825],21:[1,829],22:823,32:822,211:824,225:826,226:[1,828],227:[1,827]},o($V9,$Vh2),o($V9,$Vi2),o($Va1,$Vj2),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:830}),{115:[1,831],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Va1,$Vl2),o($Va1,$Vm2),o($Vo1,$Vn1,{78:832}),o($Vn2,$Vr1,{89:833}),o($Vo1,$Vs1,{95:531,91:834,97:$Vz3,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,835]},o($Vn2,$VJ1),{66:[1,836]},o($Vu2,$Vv2,{79:837,80:838,203:839,201:[1,840]}),o($Vw2,$Vv2,{79:841,80:842,203:843,201:$VN4}),o($Vy2,$Vv2,{79:845,80:846,203:847,201:[1,848]}),o($Vm1,$Vz2,{95:259,91:849,97:$V12,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:850,91:851,87:852,95:853,101:855,103:856,97:$VO4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:850,91:851,87:852,95:853,101:855,103:856,97:$VO4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:850,91:851,87:852,95:853,101:855,103:856,97:$VO4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:857,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,858],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($Vq1,$Ve3),o($VH1,$Vf3),o($VH1,$Vg3),o($VH1,$Vh3),o($VH1,$Vi3),{107:[1,859]},o($VH1,$Vn3),o($V9,$Vo3),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vp3),o($V9,$Vq3,{46:817,47:$V72}),o($Va1,$Vr3),o($V81,$Vs3),o($Va1,$Vb1,{54:860}),o($VC,$VD,{58:861,60:862,62:863,63:864,69:867,71:868,68:869,40:870,88:871,90:872,83:874,84:875,85:876,74:877,91:884,22:885,87:887,114:888,95:889,225:892,101:893,103:894,19:[1,891],21:[1,896],65:[1,865],67:[1,866],75:[1,878],76:[1,879],77:[1,880],81:[1,873],92:[1,881],93:[1,882],94:[1,883],97:$VP4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,886],226:[1,895]}),o($Va1,$Vu3),o($VC,$VD,{58:897,60:898,62:899,63:900,69:903,71:904,68:905,40:906,88:907,90:908,83:910,84:911,85:912,74:913,91:920,22:921,87:923,114:924,95:925,225:928,101:929,103:930,19:[1,927],21:[1,932],65:[1,901],67:[1,902],75:[1,914],76:[1,915],77:[1,916],81:[1,909],92:[1,917],93:[1,918],94:[1,919],97:$VQ4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,922],226:[1,931]}),o($Va1,$VR4),o($Va1,$VX3),{117:[1,933]},o($Va1,$VP3),o($Vn2,$VY3),{66:$Vh2},{66:$Vi2},o($VF3,$Vj2),o($VF3,$Vk2),o($VF3,$Vf2),o($VF3,$Vg2),o($VI3,$Vn1,{78:934}),{115:[1,935],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VF3,$Vl2),o($VF3,$Vm2),o($VI3,$Vn1,{78:936}),o($VS4,$Vr1,{89:937}),o($VI3,$Vs1,{95:591,91:938,97:$VG3,98:$VL,99:$VM,100:$VN}),o($VS4,$VA1),o($VS4,$VB1),o($VS4,$VC1),o($VS4,$VD1),{96:[1,939]},o($VS4,$VJ1),{66:[1,940]},o($VT4,$Vv2,{79:941,80:942,203:943,201:[1,944]}),o($VU4,$Vv2,{79:945,80:946,203:947,201:$VV4}),o($VW4,$Vv2,{79:949,80:950,203:951,201:[1,952]}),o($VH3,$Vz2,{95:321,91:953,97:$Vo2,98:$VL,99:$VM,100:$VN}),o($VK3,$VA2),o($VI3,$VB2,{86:954,91:955,87:956,95:957,101:959,103:960,97:$VX4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI3,$VD2,{86:954,91:955,87:956,95:957,101:959,103:960,97:$VX4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI3,$VE2,{86:954,91:955,87:956,95:957,101:959,103:960,97:$VX4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VM3,$VF2),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:961,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,962],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VK3,$Ve3),o($VM3,$Vf3),o($VM3,$Vg3),o($VM3,$Vh3),o($VM3,$Vi3),{107:[1,963]},o($VM3,$Vn3),{66:$Vo3},o($VF3,$VT1),o($VF3,$Vl),o($VF3,$Vm),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vs),o($VF3,$Vt),o($VF3,$Vu),o($VN3,$Vp3),{46:964,47:$Vs2,66:$Vq3},o($VF3,$Vr3),o($VN3,$Vs3),o($VF3,$Vb1,{54:965}),o($VC,$VD,{58:966,60:967,62:968,63:969,69:972,71:973,68:974,40:975,88:976,90:977,83:979,84:980,85:981,74:982,91:989,22:990,87:992,114:993,95:994,225:997,101:998,103:999,19:[1,996],21:[1,1001],65:[1,970],67:[1,971],75:[1,983],76:[1,984],77:[1,985],81:[1,978],92:[1,986],93:[1,987],94:[1,988],97:$VY4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,991],226:[1,1000]}),o($VF3,$Vu3),o($VC,$VD,{58:1002,60:1003,62:1004,63:1005,69:1008,71:1009,68:1010,40:1011,88:1012,90:1013,83:1015,84:1016,85:1017,74:1018,91:1025,22:1026,87:1028,114:1029,95:1030,225:1033,101:1034,103:1035,19:[1,1032],21:[1,1037],65:[1,1006],67:[1,1007],75:[1,1019],76:[1,1020],77:[1,1021],81:[1,1014],92:[1,1022],93:[1,1023],94:[1,1024],97:$VZ4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,1027],226:[1,1036]}),o($Vu2,$V_4),{19:$Vn,21:$Vo,22:1038,225:52,226:$Vp},{19:$V$4,21:$V05,22:1040,96:[1,1051],104:[1,1052],105:[1,1053],106:1050,179:1041,202:1039,207:1044,208:1045,209:1046,212:1049,215:[1,1054],216:[1,1055],217:[1,1060],218:[1,1061],219:[1,1062],220:[1,1063],221:[1,1056],222:[1,1057],223:[1,1058],224:[1,1059],225:1043,226:$V15},o($V25,$Vr4),o($V25,$Vs4),o($V25,$Vq),o($V25,$Vr),o($V25,$Vt),o($V25,$Vu),o($Vw2,$V_4),{19:$Vn,21:$Vo,22:1064,225:52,226:$Vp},{19:$V35,21:$V45,22:1066,96:[1,1077],104:[1,1078],105:[1,1079],106:1076,179:1067,202:1065,207:1070,208:1071,209:1072,212:1075,215:[1,1080],216:[1,1081],217:[1,1086],218:[1,1087],219:[1,1088],220:[1,1089],221:[1,1082],222:[1,1083],223:[1,1084],224:[1,1085],225:1069,226:$V55},o($Vy2,$V_4),{19:$Vn,21:$Vo,22:1090,225:52,226:$Vp},{19:$V65,21:$V75,22:1092,96:[1,1103],104:[1,1104],105:[1,1105],106:1102,179:1093,202:1091,207:1096,208:1097,209:1098,212:1101,215:[1,1106],216:[1,1107],217:[1,1112],218:[1,1113],219:[1,1114],220:[1,1115],221:[1,1108],222:[1,1109],223:[1,1110],224:[1,1111],225:1095,226:$V85},o($Vt1,$Ve3),o($Vt1,$Vf3),o($Vt1,$Vg3),o($Vt1,$Vh3),o($Vt1,$Vi3),{107:[1,1116]},o($Vt1,$Vn3),o($Vp1,$V95),{117:$Va5,130:1117,131:$V24},o($V44,$Vb5),o($VG2,$VH2,{132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,127:1118,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($V44,$Vc5),o($V44,$V74,{135:1119,139:1120,136:$V84,137:$V94}),o($VG2,$VH2,{140:368,142:369,143:370,144:371,189:373,134:1121,117:$Vd5,131:$Vd5,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VG2,$VH2,{140:368,142:369,143:370,144:371,189:373,134:1122,117:$Ve5,131:$Ve5,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Ve4,$Vf5),o($Ve4,$Vg5),o($Ve4,$Vh5),o($Ve4,$Vi5),{19:$Vj5,21:$Vk5,22:1124,125:1123,210:$Vl5,225:1127,226:$Vm5},o($VG2,$VH2,{144:371,122:1130,126:1131,127:1132,128:1133,132:1134,133:1135,134:1136,140:1137,142:1138,143:1139,189:1141,145:$VJ2,187:$Vn5,198:$VL2,199:$VM2,200:$Vo5}),o($Va4,[2,173]),o($Va4,[2,178],{158:[1,1143]}),o($Va4,[2,180],{157:[1,1144]}),o($Vp5,$Vq5,{188:1145,192:1146,193:$Vr5}),{145:[1,1149],189:1148,198:[1,1150],199:[1,1151]},o($Vp5,[2,230]),o($Vp5,[2,231]),o($Vp5,[2,232]),o($Vp5,[2,233]),o($Ve4,$Vs5),o($Ve4,$Vt5),o($Ve4,$Vu5),o($Ve4,$Vq),o($Ve4,$Vr),o($Ve4,$Vs),o($Ve4,$Vt),o($Ve4,$Vu),o($VG2,[2,163],{27:$Vv5,195:$Vv5,196:$Vv5,197:$Vv5}),o($Vw5,$Vt5),o($Vw5,$Vu5),o($Vw5,$Vq),o($Vw5,$Vr),o($Vw5,$Vs),o($Vw5,$Vt),o($Vw5,$Vu),{145:[1,1152]},{145:[1,1153]},o($Vp4,[2,284]),o($Vq4,[2,141]),o($VF1,[2,188]),o($VF1,[2,195],{168:1154,177:$Vx5}),o($VF1,[2,196],{170:1156,177:$Vy5}),o($VF1,[2,197],{172:1158,177:$Vz5}),o($VA5,[2,189]),o($VA5,[2,191]),o($VA5,[2,193]),{19:$VB5,21:$VC5,22:1160,96:$VD5,104:$VE5,105:$VF5,106:1171,179:1161,183:$VG5,207:1165,208:1166,209:1167,212:1170,215:$VH5,216:$VI5,217:$VJ5,218:$VK5,219:$VL5,220:$VM5,221:$VN5,222:$VO5,223:$VP5,224:$VQ5,225:1164,226:$VR5},o($VF1,[2,198]),o($VF1,[2,203]),o($VA5,[2,199],{174:1185}),o($VF1,[2,207]),o($VF1,[2,212]),o($VA5,[2,208],{181:1186}),o($VF1,[2,214]),o($VF1,[2,220]),o($VA5,[2,216],{186:1187}),o($VF1,[2,215]),o($Vv4,$VS5),o($Vv4,$VT5),{19:$VX2,21:$VY2,22:1189,83:1188,225:406,226:$Vd3},o($VH1,$VU5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Va1,$VB3),o($Vx,$Vg,{50:1190,36:1191,39:$Vy}),o($Va1,$VC3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:1192}),o($Va1,$V11),o($Va1,$V21),{19:[1,1196],21:[1,1200],22:1194,32:1193,211:1195,225:1197,226:[1,1199],227:[1,1198]},{115:[1,1201],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Va1,$VD3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:1202}),o($Vn2,$Vr1,{89:1203}),o($Vo1,$Vs1,{95:741,91:1204,97:$VL4,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,1205]},o($Vn2,$VJ1),{66:[1,1206]},o($Vu2,$Vv2,{79:1207,80:1208,203:1209,201:[1,1210]}),o($Vw2,$Vv2,{79:1211,80:1212,203:1213,201:$VV5}),o($Vm1,$Vz2,{95:457,91:1215,97:$Vt3,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:1216,91:1217,87:1218,95:1219,101:1221,103:1222,97:$VW5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:1216,91:1217,87:1218,95:1219,101:1221,103:1222,97:$VW5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:1216,91:1217,87:1218,95:1219,101:1221,103:1222,97:$VW5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:1223,80:1224,203:1225,201:[1,1226]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,1227],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1228,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vq1,$Ve3),o($VH1,$Vf3),o($VH1,$Vg3),o($VH1,$Vh3),o($VH1,$Vi3),{107:[1,1229]},o($VH1,$Vn3),o($Va1,$VC3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:1230}),o($Va1,$V11),o($Va1,$V21),{19:[1,1234],21:[1,1238],22:1232,32:1231,211:1233,225:1235,226:[1,1237],227:[1,1236]},{115:[1,1239],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Va1,$VD3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:1240}),o($Vn2,$Vr1,{89:1241}),o($Vo1,$Vs1,{95:788,91:1242,97:$VM4,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,1243]},o($Vn2,$VJ1),{66:[1,1244]},o($Vu2,$Vv2,{79:1245,80:1246,203:1247,201:[1,1248]}),o($Vw2,$Vv2,{79:1249,80:1250,203:1251,201:$VX5}),o($Vm1,$Vz2,{95:493,91:1253,97:$Vv3,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:1254,91:1255,87:1256,95:1257,101:1259,103:1260,97:$VY5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:1254,91:1255,87:1256,95:1257,101:1259,103:1260,97:$VY5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:1254,91:1255,87:1256,95:1257,101:1259,103:1260,97:$VY5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:1261,80:1262,203:1263,201:[1,1264]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,1265],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1266,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vq1,$Ve3),o($VH1,$Vf3),o($VH1,$Vg3),o($VH1,$Vh3),o($VH1,$Vi3),{107:[1,1267]},o($VH1,$Vn3),o($V81,$VA3),o($Va1,$VB3),o($Va1,$VC3),o($Va1,$VD3),{66:[1,1268]},o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),o($Vw2,$Vv2,{80:842,203:843,79:1269,201:$VN4}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1270,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vw2,$Vv2,{80:842,203:843,79:1271,201:$VN4}),o($Vo1,$Vz2,{95:531,91:1272,97:$Vz3,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Ve3),o($Va1,$VE3),o($VO3,$VP3),o($Vm1,$VQ3),o($VO3,$VR3,{31:1273,204:[1,1274]}),{19:$VS3,21:$VT3,22:632,125:1275,210:$VU3,225:635,226:$VV3},o($Va1,$VW3),o($Vo1,$VQ3),o($Va1,$VR3,{31:1276,204:[1,1277]}),{19:$VS3,21:$VT3,22:632,125:1278,210:$VU3,225:635,226:$VV3},o($Ve2,$VX3),o($Vp1,$VQ3),o($Ve2,$VR3,{31:1279,204:[1,1280]}),{19:$VS3,21:$VT3,22:632,125:1281,210:$VU3,225:635,226:$VV3},o($Vq1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),{96:[1,1282]},o($Vt1,$VJ1),{96:[1,1284],102:1283,104:[1,1285],105:[1,1286],106:1287,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,1288]},{117:[1,1289]},o($Vt1,$Vt4),{19:[1,1292],21:[1,1295],22:1291,83:1290,225:1293,226:[1,1294]},o($V81,$Va2,{48:1296,49:[1,1297]}),o($Va1,$Vb2),o($Va1,$Vd1,{61:1298,63:1299,68:1300,40:1301,74:1302,114:1306,75:[1,1303],76:[1,1304],77:[1,1305],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:1307,60:1308,69:1309,88:1310,90:1311,91:1315,95:1316,92:[1,1312],93:[1,1313],94:[1,1314],97:$VZ5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1318,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:1319}),o($Vo1,$Vn1,{78:1320}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:1321}),o($Vm1,$Vs1,{95:889,91:1322,97:$VP4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1323}),o($Vt1,$Vu1,{82:1324}),o($Vt1,$Vu1,{82:1325}),o($Vo1,$Vv1,{101:893,103:894,87:1326,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1327}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,1331],21:[1,1335],22:1329,32:1328,211:1330,225:1332,226:[1,1334],227:[1,1333]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{160:1336}),o($VH1,$VI1),{115:[1,1337],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},{96:[1,1338]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1340],102:1339,104:[1,1341],105:[1,1342],106:1343,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,1344]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$Vb2),o($Va1,$Vd1,{61:1345,63:1346,68:1347,40:1348,74:1349,114:1353,75:[1,1350],76:[1,1351],77:[1,1352],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:1354,60:1355,69:1356,88:1357,90:1358,91:1362,95:1363,92:[1,1359],93:[1,1360],94:[1,1361],97:$V_5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1365,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:1366}),o($Vo1,$Vn1,{78:1367}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:1368}),o($Vm1,$Vs1,{95:925,91:1369,97:$VQ4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1370}),o($Vt1,$Vu1,{82:1371}),o($Vt1,$Vu1,{82:1372}),o($Vo1,$Vv1,{101:929,103:930,87:1373,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1374}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,1378],21:[1,1382],22:1376,32:1375,211:1377,225:1379,226:[1,1381],227:[1,1380]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{160:1383}),o($VH1,$VI1),{115:[1,1384],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},{96:[1,1385]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1387],102:1386,104:[1,1388],105:[1,1389],106:1390,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,1391]},o($Vt1,$Vt),o($Vt1,$Vu),o($Vo1,$V95),o($VU4,$Vv2,{80:946,203:947,79:1392,201:$VV4}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1393,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VU4,$Vv2,{80:946,203:947,79:1394,201:$VV4}),o($VI3,$Vz2,{95:591,91:1395,97:$VG3,98:$VL,99:$VM,100:$VN}),o($VS4,$VA2),o($VS4,$Ve3),o($VF3,$VE3),o($V$5,$VP3),o($VH3,$VQ3),o($V$5,$VR3,{31:1396,204:[1,1397]}),{19:$VS3,21:$VT3,22:632,125:1398,210:$VU3,225:635,226:$VV3},o($VF3,$VW3),o($VI3,$VQ3),o($VF3,$VR3,{31:1399,204:[1,1400]}),{19:$VS3,21:$VT3,22:632,125:1401,210:$VU3,225:635,226:$VV3},o($V06,$VX3),o($VJ3,$VQ3),o($V06,$VR3,{31:1402,204:[1,1403]}),{19:$VS3,21:$VT3,22:632,125:1404,210:$VU3,225:635,226:$VV3},o($VK3,$VY3),o($VL3,$VZ3),o($VL3,$V_3),o($VL3,$V$3),{96:[1,1405]},o($VL3,$VJ1),{96:[1,1407],102:1406,104:[1,1408],105:[1,1409],106:1410,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,1411]},{117:[1,1412]},o($VL3,$Vt4),{19:[1,1415],21:[1,1418],22:1414,83:1413,225:1416,226:[1,1417]},o($VN3,$VA3),o($VN3,$Va2,{48:1419,49:[1,1420]}),o($VF3,$Vb2),o($VC,$VD,{61:1421,63:1422,68:1423,40:1424,74:1425,114:1429,47:$Vd1,49:$Vd1,66:$Vd1,75:[1,1426],76:[1,1427],77:[1,1428]}),o($VF3,$Vc2),o($VF3,$Vf1,{64:1430,60:1431,69:1432,88:1433,90:1434,91:1438,95:1439,92:[1,1435],93:[1,1436],94:[1,1437],97:$V16,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1441,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VF3,$Vd2),o($VH3,$Vn1,{78:1442}),o($VI3,$Vn1,{78:1443}),o($V06,$Vf2),o($V06,$Vg2),o($VK3,$Vr1,{89:1444}),o($VH3,$Vs1,{95:994,91:1445,97:$VY4,98:$VL,99:$VM,100:$VN}),o($VL3,$Vu1,{82:1446}),o($VL3,$Vu1,{82:1447}),o($VL3,$Vu1,{82:1448}),o($VI3,$Vv1,{101:998,103:999,87:1449,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VJ3,$Vn1,{78:1450}),o($V06,$V11),o($V06,$V21),{19:[1,1454],21:[1,1458],22:1452,32:1451,211:1453,225:1455,226:[1,1457],227:[1,1456]},o($VK3,$VA1),o($VK3,$VB1),o($VK3,$VC1),o($VK3,$VD1),o($VL3,$VE1),o($VF1,$VG1,{160:1459}),o($VM3,$VI1),{115:[1,1460],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},{96:[1,1461]},o($VK3,$VJ1),o($VL3,$Vq),o($VL3,$Vr),{96:[1,1463],102:1462,104:[1,1464],105:[1,1465],106:1466,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,1467]},o($VL3,$Vt),o($VL3,$Vu),o($VF3,$Vb2),o($VC,$VD,{61:1468,63:1469,68:1470,40:1471,74:1472,114:1476,47:$Vd1,49:$Vd1,66:$Vd1,75:[1,1473],76:[1,1474],77:[1,1475]}),o($VF3,$Vc2),o($VF3,$Vf1,{64:1477,60:1478,69:1479,88:1480,90:1481,91:1485,95:1486,92:[1,1482],93:[1,1483],94:[1,1484],97:$V26,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1488,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VF3,$Vd2),o($VH3,$Vn1,{78:1489}),o($VI3,$Vn1,{78:1490}),o($V06,$Vf2),o($V06,$Vg2),o($VK3,$Vr1,{89:1491}),o($VH3,$Vs1,{95:1030,91:1492,97:$VZ4,98:$VL,99:$VM,100:$VN}),o($VL3,$Vu1,{82:1493}),o($VL3,$Vu1,{82:1494}),o($VL3,$Vu1,{82:1495}),o($VI3,$Vv1,{101:1034,103:1035,87:1496,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VJ3,$Vn1,{78:1497}),o($V06,$V11),o($V06,$V21),{19:[1,1501],21:[1,1505],22:1499,32:1498,211:1500,225:1502,226:[1,1504],227:[1,1503]},o($VK3,$VA1),o($VK3,$VB1),o($VK3,$VC1),o($VK3,$VD1),o($VL3,$VE1),o($VF1,$VG1,{160:1506}),o($VM3,$VI1),{115:[1,1507],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},{96:[1,1508]},o($VK3,$VJ1),o($VL3,$Vq),o($VL3,$Vr),{96:[1,1510],102:1509,104:[1,1511],105:[1,1512],106:1513,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,1514]},o($VL3,$Vt),o($VL3,$Vu),{204:[1,1517],205:1515,206:[1,1516]},o($Vm1,$V36),o($Vm1,$V46),o($Vm1,$V56),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vz4),o($Vm1,$VA4,{213:1518,214:1519,107:[1,1520]}),o($Vm1,$VB4),o($Vm1,$VC4),o($Vm1,$VD4),o($Vm1,$VE4),o($Vm1,$VF4),o($Vm1,$VG4),o($Vm1,$VH4),o($Vm1,$VI4),o($Vm1,$VJ4),o($V66,$Vj3),o($V66,$Vk3),o($V66,$Vl3),o($V66,$Vm3),{204:[1,1523],205:1521,206:[1,1522]},o($Vo1,$V36),o($Vo1,$V46),o($Vo1,$V56),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vz4),o($Vo1,$VA4,{213:1524,214:1525,107:[1,1526]}),o($Vo1,$VB4),o($Vo1,$VC4),o($Vo1,$VD4),o($Vo1,$VE4),o($Vo1,$VF4),o($Vo1,$VG4),o($Vo1,$VH4),o($Vo1,$VI4),o($Vo1,$VJ4),o($V76,$Vj3),o($V76,$Vk3),o($V76,$Vl3),o($V76,$Vm3),{204:[1,1529],205:1527,206:[1,1528]},o($Vp1,$V36),o($Vp1,$V46),o($Vp1,$V56),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vz4),o($Vp1,$VA4,{213:1530,214:1531,107:[1,1532]}),o($Vp1,$VB4),o($Vp1,$VC4),o($Vp1,$VD4),o($Vp1,$VE4),o($Vp1,$VF4),o($Vp1,$VG4),o($Vp1,$VH4),o($Vp1,$VI4),o($Vp1,$VJ4),o($V86,$Vj3),o($V86,$Vk3),o($V86,$Vl3),o($V86,$Vm3),{19:[1,1535],21:[1,1538],22:1534,83:1533,225:1536,226:[1,1537]},o($V44,$V96),o($V44,$Va6),o($V44,$Vb6),o($Ve4,$Vc6),o($Ve4,$Vd6),o($Ve4,$Ve6),o($Vx,$Vg,{42:1539,43:1540,51:1541,55:1542,36:1543,39:$Vy}),o($Vf6,$Vr4),o($Vf6,$Vs4),o($Vf6,$Vq),o($Vf6,$Vr),o($Vf6,$Vt),o($Vf6,$Vu),{66:[1,1544]},{66:$V04},{66:$V14,129:1545,130:1546,131:$Vg6},{66:$V34},o($Vh6,$V54),o($Vh6,$V64),o($Vh6,$V74,{135:1548,138:1549,139:1552,136:$Vi6,137:$Vj6}),o($Va4,$Vb4,{152:665,141:1553,147:1554,148:1555,151:1556,65:[1,1557],157:$Vc4,158:$Vd4}),o($Vk6,$Vf4),o($Vk6,$Vg4),{65:[1,1558]},{27:$Vh4,191:1559,195:$Vi4,196:$Vj4,197:$Vk4},{19:$Vl6,21:$Vm6,22:1561,146:1560,211:1562,225:1564,226:$Vn6,227:$Vo6},o($Va4,[2,179]),o($Va4,[2,181]),{145:$Vp6,189:1568,198:$Vq6,199:$Vr6},o($Vp5,[2,226]),{136:[1,1572]},o($Ve4,$Vs6),{19:$Vl4,21:$Vm4,22:675,146:1573,211:676,225:678,226:$Vn4,227:$Vo4},{65:[1,1574]},{65:[1,1575]},{19:$Vt6,21:$Vu6,22:1577,146:1576,211:1578,225:1580,226:$Vv6,227:$Vw6},{19:$Vt6,21:$Vu6,22:1577,146:1584,211:1578,225:1580,226:$Vv6,227:$Vw6},o($VA5,[2,190]),{19:$VB5,21:$VC5,22:1160,225:1164,226:$VR5},o($VA5,[2,192]),{96:$VD5,104:$VE5,105:$VF5,106:1171,179:1161,207:1165,208:1166,209:1167,212:1170,215:$VH5,216:$VI5,217:$VJ5,218:$VK5,219:$VL5,220:$VM5,221:$VN5,222:$VO5,223:$VP5,224:$VQ5},o($VA5,[2,194]),{183:$VG5},o($VA5,$Vx6,{178:1585,176:$Vy6}),o($VA5,$Vx6,{178:1587,176:$Vy6}),o($VA5,$Vx6,{178:1588,176:$Vy6}),o($Vz6,$Vq),o($Vz6,$Vr),o($Vz6,$Vw4),o($Vz6,$Vx4),o($Vz6,$Vy4),o($Vz6,$Vt),o($Vz6,$Vu),o($Vz6,$Vz4),o($Vz6,$VA4,{213:1589,214:1590,107:[1,1591]}),o($Vz6,$VB4),o($Vz6,$VC4),o($Vz6,$VD4),o($Vz6,$VE4),o($Vz6,$VF4),o($Vz6,$VG4),o($Vz6,$VH4),o($Vz6,$VI4),o($Vz6,$VJ4),o($VA6,$Vj3),o($VA6,$Vk3),o($VA6,$Vl3),o($VA6,$Vm3),o($VF1,[2,201],{168:1592,177:$Vx5}),o($VF1,[2,210],{170:1593,177:$Vy5}),o($VF1,[2,218],{172:1594,177:$Vz5}),o($Vv4,$VB6),o($Vv4,$VE1),o($Va1,$Vu3),o($VC,$VD,{58:1595,60:1596,62:1597,63:1598,69:1601,71:1602,68:1603,40:1604,88:1605,90:1606,83:1608,84:1609,85:1610,74:1611,91:1618,22:1619,87:1621,114:1622,95:1623,225:1626,101:1627,103:1628,19:[1,1625],21:[1,1630],65:[1,1599],67:[1,1600],75:[1,1612],76:[1,1613],77:[1,1614],81:[1,1607],92:[1,1615],93:[1,1616],94:[1,1617],97:$VC6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,1620],226:[1,1629]}),o($Vw2,$Vv2,{80:1212,203:1213,79:1631,201:$VV5}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1632,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vw2,$Vv2,{80:1212,203:1213,79:1633,201:$VV5}),o($Vo1,$Vz2,{95:741,91:1634,97:$VL4,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Ve3),o($Va1,$VR4),o($VO3,$VP3),o($Vm1,$VQ3),o($VO3,$VR3,{31:1635,204:[1,1636]}),{19:$VS3,21:$VT3,22:632,125:1637,210:$VU3,225:635,226:$VV3},o($Va1,$VW3),o($Vo1,$VQ3),o($Va1,$VR3,{31:1638,204:[1,1639]}),{19:$VS3,21:$VT3,22:632,125:1640,210:$VU3,225:635,226:$VV3},o($Vq1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),{96:[1,1641]},o($Vt1,$VJ1),{96:[1,1643],102:1642,104:[1,1644],105:[1,1645],106:1646,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,1647]},o($Ve2,$VX3),o($Vp1,$VQ3),o($Ve2,$VR3,{31:1648,204:[1,1649]}),{19:$VS3,21:$VT3,22:632,125:1650,210:$VU3,225:635,226:$VV3},o($Vt1,$Vt4),{117:[1,1651]},{19:[1,1654],21:[1,1657],22:1653,83:1652,225:1655,226:[1,1656]},o($Vw2,$Vv2,{80:1250,203:1251,79:1658,201:$VX5}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1659,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vw2,$Vv2,{80:1250,203:1251,79:1660,201:$VX5}),o($Vo1,$Vz2,{95:788,91:1661,97:$VM4,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Ve3),o($Va1,$VR4),o($VO3,$VP3),o($Vm1,$VQ3),o($VO3,$VR3,{31:1662,204:[1,1663]}),{19:$VS3,21:$VT3,22:632,125:1664,210:$VU3,225:635,226:$VV3},o($Va1,$VW3),o($Vo1,$VQ3),o($Va1,$VR3,{31:1665,204:[1,1666]}),{19:$VS3,21:$VT3,22:632,125:1667,210:$VU3,225:635,226:$VV3},o($Vq1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),{96:[1,1668]},o($Vt1,$VJ1),{96:[1,1670],102:1669,104:[1,1671],105:[1,1672],106:1673,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,1674]},o($Ve2,$VX3),o($Vp1,$VQ3),o($Ve2,$VR3,{31:1675,204:[1,1676]}),{19:$VS3,21:$VT3,22:632,125:1677,210:$VU3,225:635,226:$VV3},o($Vt1,$Vt4),{117:[1,1678]},{19:[1,1681],21:[1,1684],22:1680,83:1679,225:1682,226:[1,1683]},o($Va1,$VR4),o($Va1,$VX3),{117:[1,1685]},o($Va1,$VP3),o($Vn2,$VY3),o($Vu2,$V_4),{19:$Vn,21:$Vo,22:1686,225:52,226:$Vp},{19:$VD6,21:$VE6,22:1688,96:[1,1699],104:[1,1700],105:[1,1701],106:1698,179:1689,202:1687,207:1692,208:1693,209:1694,212:1697,215:[1,1702],216:[1,1703],217:[1,1708],218:[1,1709],219:[1,1710],220:[1,1711],221:[1,1704],222:[1,1705],223:[1,1706],224:[1,1707],225:1691,226:$VF6},o($Vw2,$V_4),{19:$Vn,21:$Vo,22:1712,225:52,226:$Vp},{19:$VG6,21:$VH6,22:1714,96:[1,1725],104:[1,1726],105:[1,1727],106:1724,179:1715,202:1713,207:1718,208:1719,209:1720,212:1723,215:[1,1728],216:[1,1729],217:[1,1734],218:[1,1735],219:[1,1736],220:[1,1737],221:[1,1730],222:[1,1731],223:[1,1732],224:[1,1733],225:1717,226:$VI6},o($Vy2,$V_4),{19:$Vn,21:$Vo,22:1738,225:52,226:$Vp},{19:$VJ6,21:$VK6,22:1740,96:[1,1751],104:[1,1752],105:[1,1753],106:1750,179:1741,202:1739,207:1744,208:1745,209:1746,212:1749,215:[1,1754],216:[1,1755],217:[1,1760],218:[1,1761],219:[1,1762],220:[1,1763],221:[1,1756],222:[1,1757],223:[1,1758],224:[1,1759],225:1743,226:$VL6},o($Vt1,$Ve3),o($Vt1,$Vf3),o($Vt1,$Vg3),o($Vt1,$Vh3),o($Vt1,$Vi3),{107:[1,1764]},o($Vt1,$Vn3),o($Vp1,$V95),o($VH1,$VU5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Va1,$VB3),o($Vx,$Vg,{50:1765,36:1766,39:$Vy}),o($Va1,$VC3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:1767}),o($Va1,$V11),o($Va1,$V21),{19:[1,1771],21:[1,1775],22:1769,32:1768,211:1770,225:1772,226:[1,1774],227:[1,1773]},{115:[1,1776],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Va1,$VD3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:1777}),o($Vn2,$Vr1,{89:1778}),o($Vo1,$Vs1,{95:1316,91:1779,97:$VZ5,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,1780]},o($Vn2,$VJ1),{66:[1,1781]},o($Vu2,$Vv2,{79:1782,80:1783,203:1784,201:[1,1785]}),o($Vw2,$Vv2,{79:1786,80:1787,203:1788,201:$VM6}),o($Vm1,$Vz2,{95:889,91:1790,97:$VP4,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:1791,91:1792,87:1793,95:1794,101:1796,103:1797,97:$VN6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:1791,91:1792,87:1793,95:1794,101:1796,103:1797,97:$VN6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:1791,91:1792,87:1793,95:1794,101:1796,103:1797,97:$VN6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:1798,80:1799,203:1800,201:[1,1801]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,1802],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1803,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vq1,$Ve3),o($VH1,$Vf3),o($VH1,$Vg3),o($VH1,$Vh3),o($VH1,$Vi3),{107:[1,1804]},o($VH1,$Vn3),o($Va1,$VC3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:1805}),o($Va1,$V11),o($Va1,$V21),{19:[1,1809],21:[1,1813],22:1807,32:1806,211:1808,225:1810,226:[1,1812],227:[1,1811]},{115:[1,1814],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Va1,$VD3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:1815}),o($Vn2,$Vr1,{89:1816}),o($Vo1,$Vs1,{95:1363,91:1817,97:$V_5,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,1818]},o($Vn2,$VJ1),{66:[1,1819]},o($Vu2,$Vv2,{79:1820,80:1821,203:1822,201:[1,1823]}),o($Vw2,$Vv2,{79:1824,80:1825,203:1826,201:$VO6}),o($Vm1,$Vz2,{95:925,91:1828,97:$VQ4,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:1829,91:1830,87:1831,95:1832,101:1834,103:1835,97:$VP6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:1829,91:1830,87:1831,95:1832,101:1834,103:1835,97:$VP6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:1829,91:1830,87:1831,95:1832,101:1834,103:1835,97:$VP6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:1836,80:1837,203:1838,201:[1,1839]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,1840],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1841,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vq1,$Ve3),o($VH1,$Vf3),o($VH1,$Vg3),o($VH1,$Vh3),o($VH1,$Vi3),{107:[1,1842]},o($VH1,$Vn3),o($VF3,$VX3),{117:[1,1843]},o($VF3,$VP3),o($VS4,$VY3),o($VT4,$V_4),{19:$Vn,21:$Vo,22:1844,225:52,226:$Vp},{19:$VQ6,21:$VR6,22:1846,96:[1,1857],104:[1,1858],105:[1,1859],106:1856,179:1847,202:1845,207:1850,208:1851,209:1852,212:1855,215:[1,1860],216:[1,1861],217:[1,1866],218:[1,1867],219:[1,1868],220:[1,1869],221:[1,1862],222:[1,1863],223:[1,1864],224:[1,1865],225:1849,226:$VS6},o($VU4,$V_4),{19:$Vn,21:$Vo,22:1870,225:52,226:$Vp},{19:$VT6,21:$VU6,22:1872,96:[1,1883],104:[1,1884],105:[1,1885],106:1882,179:1873,202:1871,207:1876,208:1877,209:1878,212:1881,215:[1,1886],216:[1,1887],217:[1,1892],218:[1,1893],219:[1,1894],220:[1,1895],221:[1,1888],222:[1,1889],223:[1,1890],224:[1,1891],225:1875,226:$VV6},o($VW4,$V_4),{19:$Vn,21:$Vo,22:1896,225:52,226:$Vp},{19:$VW6,21:$VX6,22:1898,96:[1,1909],104:[1,1910],105:[1,1911],106:1908,179:1899,202:1897,207:1902,208:1903,209:1904,212:1907,215:[1,1912],216:[1,1913],217:[1,1918],218:[1,1919],219:[1,1920],220:[1,1921],221:[1,1914],222:[1,1915],223:[1,1916],224:[1,1917],225:1901,226:$VY6},o($VL3,$Ve3),o($VL3,$Vf3),o($VL3,$Vg3),o($VL3,$Vh3),o($VL3,$Vi3),{107:[1,1922]},o($VL3,$Vn3),o($VJ3,$V95),o($VM3,$VU5),o($VM3,$VE1),o($VM3,$Vq),o($VM3,$Vr),o($VM3,$Vt),o($VM3,$Vu),o($VF3,$VB3),o($Vx,$Vg,{50:1923,36:1924,39:$Vy}),o($VF3,$VC3),o($VF3,$Vk2),o($VF3,$Vf2),o($VF3,$Vg2),o($VI3,$Vn1,{78:1925}),o($VF3,$V11),o($VF3,$V21),{19:[1,1929],21:[1,1933],22:1927,32:1926,211:1928,225:1930,226:[1,1932],227:[1,1931]},{115:[1,1934],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VF3,$VD3),o($VF3,$Vm2),o($VI3,$Vn1,{78:1935}),o($VS4,$Vr1,{89:1936}),o($VI3,$Vs1,{95:1439,91:1937,97:$V16,98:$VL,99:$VM,100:$VN}),o($VS4,$VA1),o($VS4,$VB1),o($VS4,$VC1),o($VS4,$VD1),{96:[1,1938]},o($VS4,$VJ1),{66:[1,1939]},o($VT4,$Vv2,{79:1940,80:1941,203:1942,201:[1,1943]}),o($VU4,$Vv2,{79:1944,80:1945,203:1946,201:$VZ6}),o($VH3,$Vz2,{95:994,91:1948,97:$VY4,98:$VL,99:$VM,100:$VN}),o($VK3,$VA2),o($VI3,$VB2,{86:1949,91:1950,87:1951,95:1952,101:1954,103:1955,97:$V_6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI3,$VD2,{86:1949,91:1950,87:1951,95:1952,101:1954,103:1955,97:$V_6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI3,$VE2,{86:1949,91:1950,87:1951,95:1952,101:1954,103:1955,97:$V_6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VM3,$VF2),o($VW4,$Vv2,{79:1956,80:1957,203:1958,201:[1,1959]}),o($V06,$VT1),o($V06,$Vl),o($V06,$Vm),o($V06,$Vq),o($V06,$Vr),o($V06,$Vs),o($V06,$Vt),o($V06,$Vu),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,1960],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1961,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VK3,$Ve3),o($VM3,$Vf3),o($VM3,$Vg3),o($VM3,$Vh3),o($VM3,$Vi3),{107:[1,1962]},o($VM3,$Vn3),o($VF3,$VC3),o($VF3,$Vk2),o($VF3,$Vf2),o($VF3,$Vg2),o($VI3,$Vn1,{78:1963}),o($VF3,$V11),o($VF3,$V21),{19:[1,1967],21:[1,1971],22:1965,32:1964,211:1966,225:1968,226:[1,1970],227:[1,1969]},{115:[1,1972],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VF3,$VD3),o($VF3,$Vm2),o($VI3,$Vn1,{78:1973}),o($VS4,$Vr1,{89:1974}),o($VI3,$Vs1,{95:1486,91:1975,97:$V26,98:$VL,99:$VM,100:$VN}),o($VS4,$VA1),o($VS4,$VB1),o($VS4,$VC1),o($VS4,$VD1),{96:[1,1976]},o($VS4,$VJ1),{66:[1,1977]},o($VT4,$Vv2,{79:1978,80:1979,203:1980,201:[1,1981]}),o($VU4,$Vv2,{79:1982,80:1983,203:1984,201:$V$6}),o($VH3,$Vz2,{95:1030,91:1986,97:$VZ4,98:$VL,99:$VM,100:$VN}),o($VK3,$VA2),o($VI3,$VB2,{86:1987,91:1988,87:1989,95:1990,101:1992,103:1993,97:$V07,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI3,$VD2,{86:1987,91:1988,87:1989,95:1990,101:1992,103:1993,97:$V07,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI3,$VE2,{86:1987,91:1988,87:1989,95:1990,101:1992,103:1993,97:$V07,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VM3,$VF2),o($VW4,$Vv2,{79:1994,80:1995,203:1996,201:[1,1997]}),o($V06,$VT1),o($V06,$Vl),o($V06,$Vm),o($V06,$Vq),o($V06,$Vr),o($V06,$Vs),o($V06,$Vt),o($V06,$Vu),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,1998],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:1999,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VK3,$Ve3),o($VM3,$Vf3),o($VM3,$Vg3),o($VM3,$Vh3),o($VM3,$Vi3),{107:[1,2000]},o($VM3,$Vn3),o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$VS5),o($Vm1,$VT5),{19:$V$4,21:$V05,22:2002,83:2001,225:1043,226:$V15},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$VS5),o($Vo1,$VT5),{19:$V35,21:$V45,22:2004,83:2003,225:1069,226:$V55},o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$VS5),o($Vp1,$VT5),{19:$V65,21:$V75,22:2006,83:2005,225:1095,226:$V85},o($Vt1,$VU5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($V17,$V27,{149:2007,150:2008,153:$V37,154:$V47,155:$V57,156:$V67}),o($V77,$V87),o($V97,$Va7,{52:2013}),o($Vb7,$Vc7,{56:2014}),o($VC,$VD,{59:2015,69:2016,71:2017,72:2018,88:2021,90:2022,83:2024,84:2025,85:2026,74:2027,40:2028,91:2032,22:2033,87:2035,114:2036,95:2040,225:2043,101:2044,103:2045,19:[1,2042],21:[1,2047],65:[1,2019],67:[1,2020],75:[1,2037],76:[1,2038],77:[1,2039],81:[1,2023],92:[1,2029],93:[1,2030],94:[1,2031],97:$Vd7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,2034],226:[1,2046]}),o($V17,$V27,{150:2008,149:2048,153:$V37,154:$V47,155:$V57,156:$V67}),{66:$Va5,130:2049,131:$Vg6},o($Vh6,$Vb5),o($VG2,$VH2,{144:371,132:1134,133:1135,134:1136,140:1137,142:1138,143:1139,189:1141,127:2050,145:$VJ2,187:$Vn5,198:$VL2,199:$VM2,200:$Vo5}),o($Vh6,$Vc5),o($Vh6,$V74,{135:2051,139:2052,136:$Vi6,137:$Vj6}),o($VG2,$VH2,{144:371,140:1137,142:1138,143:1139,189:1141,134:2053,66:$Vd5,131:$Vd5,145:$VJ2,187:$Vn5,198:$VL2,199:$VM2,200:$Vo5}),o($VG2,$VH2,{144:371,140:1137,142:1138,143:1139,189:1141,134:2054,66:$Ve5,131:$Ve5,145:$VJ2,187:$Vn5,198:$VL2,199:$VM2,200:$Vo5}),o($Vk6,$Vf5),o($Vk6,$Vg5),o($Vk6,$Vh5),o($Vk6,$Vi5),{19:$Vj5,21:$Vk5,22:1124,125:2055,210:$Vl5,225:1127,226:$Vm5},o($VG2,$VH2,{144:371,126:1131,127:1132,128:1133,132:1134,133:1135,134:1136,140:1137,142:1138,143:1139,189:1141,122:2056,145:$VJ2,187:$Vn5,198:$VL2,199:$VM2,200:$Vo5}),o($Vp5,$Vq5,{192:1146,188:2057,193:$Vr5}),{145:[1,2059],189:2058,198:[1,2060],199:[1,2061]},o($Vk6,$Vs5),o($Vk6,$Vt5),o($Vk6,$Vu5),o($Vk6,$Vq),o($Vk6,$Vr),o($Vk6,$Vs),o($Vk6,$Vt),o($Vk6,$Vu),o($Ve7,$Vf7,{190:2062}),{19:[1,2066],21:[1,2070],22:2064,146:2063,211:2065,225:2067,226:[1,2069],227:[1,2068]},{65:[1,2071]},{65:[1,2072]},o($Vp5,[2,224]),o($Ve4,$Vv5),{145:[1,2073]},{145:[1,2074]},{66:[1,2075]},{66:$Vt5},{66:$Vu5},{66:$Vq},{66:$Vr},{66:$Vs},{66:$Vt},{66:$Vu},{66:[1,2076]},o($VA5,[2,204]),o($VA5,[2,206]),o($VA5,[2,213]),o($VA5,[2,221]),o($Vz6,$VS5),o($Vz6,$VT5),{19:$VB5,21:$VC5,22:2078,83:2077,225:1164,226:$VR5},o($VA5,[2,200]),o($VA5,[2,209]),o($VA5,[2,217]),o($Va1,$Vb2),o($Va1,$Vd1,{61:2079,63:2080,68:2081,40:2082,74:2083,114:2087,75:[1,2084],76:[1,2085],77:[1,2086],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:2088,60:2089,69:2090,88:2091,90:2092,91:2096,95:2097,92:[1,2093],93:[1,2094],94:[1,2095],97:$Vg7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2099,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:2100}),o($Vo1,$Vn1,{78:2101}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:2102}),o($Vm1,$Vs1,{95:1623,91:2103,97:$VC6,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2104}),o($Vt1,$Vu1,{82:2105}),o($Vt1,$Vu1,{82:2106}),o($Vo1,$Vv1,{101:1627,103:1628,87:2107,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2108}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,2112],21:[1,2116],22:2110,32:2109,211:2111,225:2113,226:[1,2115],227:[1,2114]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{160:2117}),o($VH1,$VI1),{115:[1,2118],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},{96:[1,2119]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2121],102:2120,104:[1,2122],105:[1,2123],106:2124,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,2125]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VX3),{117:[1,2126]},o($Va1,$VP3),o($Vn2,$VY3),o($Vu2,$V_4),{19:$Vn,21:$Vo,22:2127,225:52,226:$Vp},{19:$Vh7,21:$Vi7,22:2129,96:[1,2140],104:[1,2141],105:[1,2142],106:2139,179:2130,202:2128,207:2133,208:2134,209:2135,212:2138,215:[1,2143],216:[1,2144],217:[1,2149],218:[1,2150],219:[1,2151],220:[1,2152],221:[1,2145],222:[1,2146],223:[1,2147],224:[1,2148],225:2132,226:$Vj7},o($Vw2,$V_4),{19:$Vn,21:$Vo,22:2153,225:52,226:$Vp},{19:$Vk7,21:$Vl7,22:2155,96:[1,2166],104:[1,2167],105:[1,2168],106:2165,179:2156,202:2154,207:2159,208:2160,209:2161,212:2164,215:[1,2169],216:[1,2170],217:[1,2175],218:[1,2176],219:[1,2177],220:[1,2178],221:[1,2171],222:[1,2172],223:[1,2173],224:[1,2174],225:2158,226:$Vm7},o($Vt1,$Ve3),o($Vt1,$Vf3),o($Vt1,$Vg3),o($Vt1,$Vh3),o($Vt1,$Vi3),{107:[1,2179]},o($Vt1,$Vn3),o($Vy2,$V_4),{19:$Vn,21:$Vo,22:2180,225:52,226:$Vp},{19:$Vn7,21:$Vo7,22:2182,96:[1,2193],104:[1,2194],105:[1,2195],106:2192,179:2183,202:2181,207:2186,208:2187,209:2188,212:2191,215:[1,2196],216:[1,2197],217:[1,2202],218:[1,2203],219:[1,2204],220:[1,2205],221:[1,2198],222:[1,2199],223:[1,2200],224:[1,2201],225:2185,226:$Vp7},o($Vp1,$V95),o($VH1,$VU5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Va1,$VX3),{117:[1,2206]},o($Va1,$VP3),o($Vn2,$VY3),o($Vu2,$V_4),{19:$Vn,21:$Vo,22:2207,225:52,226:$Vp},{19:$Vq7,21:$Vr7,22:2209,96:[1,2220],104:[1,2221],105:[1,2222],106:2219,179:2210,202:2208,207:2213,208:2214,209:2215,212:2218,215:[1,2223],216:[1,2224],217:[1,2229],218:[1,2230],219:[1,2231],220:[1,2232],221:[1,2225],222:[1,2226],223:[1,2227],224:[1,2228],225:2212,226:$Vs7},o($Vw2,$V_4),{19:$Vn,21:$Vo,22:2233,225:52,226:$Vp},{19:$Vt7,21:$Vu7,22:2235,96:[1,2246],104:[1,2247],105:[1,2248],106:2245,179:2236,202:2234,207:2239,208:2240,209:2241,212:2244,215:[1,2249],216:[1,2250],217:[1,2255],218:[1,2256],219:[1,2257],220:[1,2258],221:[1,2251],222:[1,2252],223:[1,2253],224:[1,2254],225:2238,226:$Vv7},o($Vt1,$Ve3),o($Vt1,$Vf3),o($Vt1,$Vg3),o($Vt1,$Vh3),o($Vt1,$Vi3),{107:[1,2259]},o($Vt1,$Vn3),o($Vy2,$V_4),{19:$Vn,21:$Vo,22:2260,225:52,226:$Vp},{19:$Vw7,21:$Vx7,22:2262,96:[1,2273],104:[1,2274],105:[1,2275],106:2272,179:2263,202:2261,207:2266,208:2267,209:2268,212:2271,215:[1,2276],216:[1,2277],217:[1,2282],218:[1,2283],219:[1,2284],220:[1,2285],221:[1,2278],222:[1,2279],223:[1,2280],224:[1,2281],225:2265,226:$Vy7},o($Vp1,$V95),o($VH1,$VU5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Vo1,$V95),{204:[1,2288],205:2286,206:[1,2287]},o($Vm1,$V36),o($Vm1,$V46),o($Vm1,$V56),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vz4),o($Vm1,$VA4,{213:2289,214:2290,107:[1,2291]}),o($Vm1,$VB4),o($Vm1,$VC4),o($Vm1,$VD4),o($Vm1,$VE4),o($Vm1,$VF4),o($Vm1,$VG4),o($Vm1,$VH4),o($Vm1,$VI4),o($Vm1,$VJ4),o($V66,$Vj3),o($V66,$Vk3),o($V66,$Vl3),o($V66,$Vm3),{204:[1,2294],205:2292,206:[1,2293]},o($Vo1,$V36),o($Vo1,$V46),o($Vo1,$V56),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vz4),o($Vo1,$VA4,{213:2295,214:2296,107:[1,2297]}),o($Vo1,$VB4),o($Vo1,$VC4),o($Vo1,$VD4),o($Vo1,$VE4),o($Vo1,$VF4),o($Vo1,$VG4),o($Vo1,$VH4),o($Vo1,$VI4),o($Vo1,$VJ4),o($V76,$Vj3),o($V76,$Vk3),o($V76,$Vl3),o($V76,$Vm3),{204:[1,2300],205:2298,206:[1,2299]},o($Vp1,$V36),o($Vp1,$V46),o($Vp1,$V56),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vz4),o($Vp1,$VA4,{213:2301,214:2302,107:[1,2303]}),o($Vp1,$VB4),o($Vp1,$VC4),o($Vp1,$VD4),o($Vp1,$VE4),o($Vp1,$VF4),o($Vp1,$VG4),o($Vp1,$VH4),o($Vp1,$VI4),o($Vp1,$VJ4),o($V86,$Vj3),o($V86,$Vk3),o($V86,$Vl3),o($V86,$Vm3),{19:[1,2306],21:[1,2309],22:2305,83:2304,225:2307,226:[1,2308]},o($Va1,$Vu3),o($VC,$VD,{58:2310,60:2311,62:2312,63:2313,69:2316,71:2317,68:2318,40:2319,88:2320,90:2321,83:2323,84:2324,85:2325,74:2326,91:2333,22:2334,87:2336,114:2337,95:2338,225:2341,101:2342,103:2343,19:[1,2340],21:[1,2345],65:[1,2314],67:[1,2315],75:[1,2327],76:[1,2328],77:[1,2329],81:[1,2322],92:[1,2330],93:[1,2331],94:[1,2332],97:$Vz7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,2335],226:[1,2344]}),o($Vw2,$Vv2,{80:1787,203:1788,79:2346,201:$VM6}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:2347,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vw2,$Vv2,{80:1787,203:1788,79:2348,201:$VM6}),o($Vo1,$Vz2,{95:1316,91:2349,97:$VZ5,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Ve3),o($Va1,$VR4),o($VO3,$VP3),o($Vm1,$VQ3),o($VO3,$VR3,{31:2350,204:[1,2351]}),{19:$VS3,21:$VT3,22:632,125:2352,210:$VU3,225:635,226:$VV3},o($Va1,$VW3),o($Vo1,$VQ3),o($Va1,$VR3,{31:2353,204:[1,2354]}),{19:$VS3,21:$VT3,22:632,125:2355,210:$VU3,225:635,226:$VV3},o($Vq1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),{96:[1,2356]},o($Vt1,$VJ1),{96:[1,2358],102:2357,104:[1,2359],105:[1,2360],106:2361,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,2362]},o($Ve2,$VX3),o($Vp1,$VQ3),o($Ve2,$VR3,{31:2363,204:[1,2364]}),{19:$VS3,21:$VT3,22:632,125:2365,210:$VU3,225:635,226:$VV3},o($Vt1,$Vt4),{117:[1,2366]},{19:[1,2369],21:[1,2372],22:2368,83:2367,225:2370,226:[1,2371]},o($Vw2,$Vv2,{80:1825,203:1826,79:2373,201:$VO6}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:2374,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vw2,$Vv2,{80:1825,203:1826,79:2375,201:$VO6}),o($Vo1,$Vz2,{95:1363,91:2376,97:$V_5,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Ve3),o($Va1,$VR4),o($VO3,$VP3),o($Vm1,$VQ3),o($VO3,$VR3,{31:2377,204:[1,2378]}),{19:$VS3,21:$VT3,22:632,125:2379,210:$VU3,225:635,226:$VV3},o($Va1,$VW3),o($Vo1,$VQ3),o($Va1,$VR3,{31:2380,204:[1,2381]}),{19:$VS3,21:$VT3,22:632,125:2382,210:$VU3,225:635,226:$VV3},o($Vq1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),{96:[1,2383]},o($Vt1,$VJ1),{96:[1,2385],102:2384,104:[1,2386],105:[1,2387],106:2388,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,2389]},o($Ve2,$VX3),o($Vp1,$VQ3),o($Ve2,$VR3,{31:2390,204:[1,2391]}),{19:$VS3,21:$VT3,22:632,125:2392,210:$VU3,225:635,226:$VV3},o($Vt1,$Vt4),{117:[1,2393]},{19:[1,2396],21:[1,2399],22:2395,83:2394,225:2397,226:[1,2398]},o($VI3,$V95),{204:[1,2402],205:2400,206:[1,2401]},o($VH3,$V36),o($VH3,$V46),o($VH3,$V56),o($VH3,$Vq),o($VH3,$Vr),o($VH3,$Vw4),o($VH3,$Vx4),o($VH3,$Vy4),o($VH3,$Vt),o($VH3,$Vu),o($VH3,$Vz4),o($VH3,$VA4,{213:2403,214:2404,107:[1,2405]}),o($VH3,$VB4),o($VH3,$VC4),o($VH3,$VD4),o($VH3,$VE4),o($VH3,$VF4),o($VH3,$VG4),o($VH3,$VH4),o($VH3,$VI4),o($VH3,$VJ4),o($VA7,$Vj3),o($VA7,$Vk3),o($VA7,$Vl3),o($VA7,$Vm3),{204:[1,2408],205:2406,206:[1,2407]},o($VI3,$V36),o($VI3,$V46),o($VI3,$V56),o($VI3,$Vq),o($VI3,$Vr),o($VI3,$Vw4),o($VI3,$Vx4),o($VI3,$Vy4),o($VI3,$Vt),o($VI3,$Vu),o($VI3,$Vz4),o($VI3,$VA4,{213:2409,214:2410,107:[1,2411]}),o($VI3,$VB4),o($VI3,$VC4),o($VI3,$VD4),o($VI3,$VE4),o($VI3,$VF4),o($VI3,$VG4),o($VI3,$VH4),o($VI3,$VI4),o($VI3,$VJ4),o($VB7,$Vj3),o($VB7,$Vk3),o($VB7,$Vl3),o($VB7,$Vm3),{204:[1,2414],205:2412,206:[1,2413]},o($VJ3,$V36),o($VJ3,$V46),o($VJ3,$V56),o($VJ3,$Vq),o($VJ3,$Vr),o($VJ3,$Vw4),o($VJ3,$Vx4),o($VJ3,$Vy4),o($VJ3,$Vt),o($VJ3,$Vu),o($VJ3,$Vz4),o($VJ3,$VA4,{213:2415,214:2416,107:[1,2417]}),o($VJ3,$VB4),o($VJ3,$VC4),o($VJ3,$VD4),o($VJ3,$VE4),o($VJ3,$VF4),o($VJ3,$VG4),o($VJ3,$VH4),o($VJ3,$VI4),o($VJ3,$VJ4),o($VC7,$Vj3),o($VC7,$Vk3),o($VC7,$Vl3),o($VC7,$Vm3),{19:[1,2420],21:[1,2423],22:2419,83:2418,225:2421,226:[1,2422]},o($VF3,$Vu3),o($VC,$VD,{58:2424,60:2425,62:2426,63:2427,69:2430,71:2431,68:2432,40:2433,88:2434,90:2435,83:2437,84:2438,85:2439,74:2440,91:2447,22:2448,87:2450,114:2451,95:2452,225:2455,101:2456,103:2457,19:[1,2454],21:[1,2459],65:[1,2428],67:[1,2429],75:[1,2441],76:[1,2442],77:[1,2443],81:[1,2436],92:[1,2444],93:[1,2445],94:[1,2446],97:$VD7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,2449],226:[1,2458]}),o($VU4,$Vv2,{80:1945,203:1946,79:2460,201:$VZ6}),o($VF3,$VT1),o($VF3,$Vl),o($VF3,$Vm),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vs),o($VF3,$Vt),o($VF3,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:2461,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VU4,$Vv2,{80:1945,203:1946,79:2462,201:$VZ6}),o($VI3,$Vz2,{95:1439,91:2463,97:$V16,98:$VL,99:$VM,100:$VN}),o($VS4,$VA2),o($VS4,$Ve3),o($VF3,$VR4),o($V$5,$VP3),o($VH3,$VQ3),o($V$5,$VR3,{31:2464,204:[1,2465]}),{19:$VS3,21:$VT3,22:632,125:2466,210:$VU3,225:635,226:$VV3},o($VF3,$VW3),o($VI3,$VQ3),o($VF3,$VR3,{31:2467,204:[1,2468]}),{19:$VS3,21:$VT3,22:632,125:2469,210:$VU3,225:635,226:$VV3},o($VK3,$VY3),o($VL3,$VZ3),o($VL3,$V_3),o($VL3,$V$3),{96:[1,2470]},o($VL3,$VJ1),{96:[1,2472],102:2471,104:[1,2473],105:[1,2474],106:2475,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,2476]},o($V06,$VX3),o($VJ3,$VQ3),o($V06,$VR3,{31:2477,204:[1,2478]}),{19:$VS3,21:$VT3,22:632,125:2479,210:$VU3,225:635,226:$VV3},o($VL3,$Vt4),{117:[1,2480]},{19:[1,2483],21:[1,2486],22:2482,83:2481,225:2484,226:[1,2485]},o($VU4,$Vv2,{80:1983,203:1984,79:2487,201:$V$6}),o($VF3,$VT1),o($VF3,$Vl),o($VF3,$Vm),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vs),o($VF3,$Vt),o($VF3,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:2488,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VU4,$Vv2,{80:1983,203:1984,79:2489,201:$V$6}),o($VI3,$Vz2,{95:1486,91:2490,97:$V26,98:$VL,99:$VM,100:$VN}),o($VS4,$VA2),o($VS4,$Ve3),o($VF3,$VR4),o($V$5,$VP3),o($VH3,$VQ3),o($V$5,$VR3,{31:2491,204:[1,2492]}),{19:$VS3,21:$VT3,22:632,125:2493,210:$VU3,225:635,226:$VV3},o($VF3,$VW3),o($VI3,$VQ3),o($VF3,$VR3,{31:2494,204:[1,2495]}),{19:$VS3,21:$VT3,22:632,125:2496,210:$VU3,225:635,226:$VV3},o($VK3,$VY3),o($VL3,$VZ3),o($VL3,$V_3),o($VL3,$V$3),{96:[1,2497]},o($VL3,$VJ1),{96:[1,2499],102:2498,104:[1,2500],105:[1,2501],106:2502,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,2503]},o($V06,$VX3),o($VJ3,$VQ3),o($V06,$VR3,{31:2504,204:[1,2505]}),{19:$VS3,21:$VT3,22:632,125:2506,210:$VU3,225:635,226:$VV3},o($VL3,$Vt4),{117:[1,2507]},{19:[1,2510],21:[1,2513],22:2509,83:2508,225:2511,226:[1,2512]},o($Vm1,$VB6),o($Vm1,$VE1),o($Vo1,$VB6),o($Vo1,$VE1),o($Vp1,$VB6),o($Vp1,$VE1),o($V17,$Vn1,{78:2514}),o($V17,$VE7),o($V17,$VF7),o($V17,$VG7),o($V17,$VH7),o($V17,$VI7),o($V77,$VJ7,{53:2515,47:[1,2516]}),o($V97,$VK7,{57:2517,49:[1,2518]}),o($Vb7,$VL7),o($Vb7,$VM7,{70:2519,72:2520,74:2521,40:2522,114:2523,75:[1,2524],76:[1,2525],77:[1,2526],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Vb7,$VN7),o($Vb7,$VO7,{73:2527,69:2528,88:2529,90:2530,91:2534,95:2535,92:[1,2531],93:[1,2532],94:[1,2533],97:$VP7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2537,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vb7,$VQ7),o($VR7,$Vr1,{89:2538}),o($VS7,$Vs1,{95:2040,91:2539,97:$Vd7,98:$VL,99:$VM,100:$VN}),o($VT7,$Vu1,{82:2540}),o($VT7,$Vu1,{82:2541}),o($VT7,$Vu1,{82:2542}),o($Vb7,$Vv1,{101:2044,103:2045,87:2543,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VU7,$VV7),o($VU7,$VW7),o($VR7,$VA1),o($VR7,$VB1),o($VR7,$VC1),o($VR7,$VD1),o($VT7,$VE1),o($VF1,$VG1,{160:2544}),o($VX7,$VI1),{115:[1,2545],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VU7,$V11),o($VU7,$V21),{19:[1,2549],21:[1,2553],22:2547,32:2546,211:2548,225:2550,226:[1,2552],227:[1,2551]},{96:[1,2554]},o($VR7,$VJ1),o($VT7,$Vq),o($VT7,$Vr),{96:[1,2556],102:2555,104:[1,2557],105:[1,2558],106:2559,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,2560]},o($VT7,$Vt),o($VT7,$Vu),o($V17,$Vn1,{78:2561}),o($Vh6,$V96),o($Vh6,$Va6),o($Vh6,$Vb6),o($Vk6,$Vc6),o($Vk6,$Vd6),o($Vk6,$Ve6),o($Vx,$Vg,{42:2562,43:2563,51:2564,55:2565,36:2566,39:$Vy}),{66:[1,2567]},{145:$Vp6,189:2568,198:$Vq6,199:$Vr6},o($Vk6,$Vs6),{19:$Vl6,21:$Vm6,22:1561,146:2569,211:1562,225:1564,226:$Vn6,227:$Vo6},{65:[1,2570]},{65:[1,2571]},{66:[1,2572],136:$VY7,194:2573},o($Ve7,$Vv5),o($Ve7,$Vt5),o($Ve7,$Vu5),o($Ve7,$Vq),o($Ve7,$Vr),o($Ve7,$Vs),o($Ve7,$Vt),o($Ve7,$Vu),{145:[1,2575]},{145:[1,2576]},{19:$Vt6,21:$Vu6,22:1577,146:2577,211:1578,225:1580,226:$Vv6,227:$Vw6},{19:$Vt6,21:$Vu6,22:1577,146:2578,211:1578,225:1580,226:$Vv6,227:$Vw6},o($VZ7,$V_7),o($VZ7,$V$7),o($Vz6,$VB6),o($Vz6,$VE1),o($Va1,$VC3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:2579}),o($Va1,$V11),o($Va1,$V21),{19:[1,2583],21:[1,2587],22:2581,32:2580,211:2582,225:2584,226:[1,2586],227:[1,2585]},{115:[1,2588],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Va1,$VD3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:2589}),o($Vn2,$Vr1,{89:2590}),o($Vo1,$Vs1,{95:2097,91:2591,97:$Vg7,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,2592]},o($Vn2,$VJ1),{66:[1,2593]},o($Vu2,$Vv2,{79:2594,80:2595,203:2596,201:[1,2597]}),o($Vw2,$Vv2,{79:2598,80:2599,203:2600,201:$V08}),o($Vm1,$Vz2,{95:1623,91:2602,97:$VC6,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:2603,91:2604,87:2605,95:2606,101:2608,103:2609,97:$V18,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:2603,91:2604,87:2605,95:2606,101:2608,103:2609,97:$V18,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:2603,91:2604,87:2605,95:2606,101:2608,103:2609,97:$V18,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:2610,80:2611,203:2612,201:[1,2613]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,2614],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:2615,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vq1,$Ve3),o($VH1,$Vf3),o($VH1,$Vg3),o($VH1,$Vh3),o($VH1,$Vi3),{107:[1,2616]},o($VH1,$Vn3),o($Vo1,$V95),{204:[1,2619],205:2617,206:[1,2618]},o($Vm1,$V36),o($Vm1,$V46),o($Vm1,$V56),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vz4),o($Vm1,$VA4,{213:2620,214:2621,107:[1,2622]}),o($Vm1,$VB4),o($Vm1,$VC4),o($Vm1,$VD4),o($Vm1,$VE4),o($Vm1,$VF4),o($Vm1,$VG4),o($Vm1,$VH4),o($Vm1,$VI4),o($Vm1,$VJ4),o($V66,$Vj3),o($V66,$Vk3),o($V66,$Vl3),o($V66,$Vm3),{204:[1,2625],205:2623,206:[1,2624]},o($Vo1,$V36),o($Vo1,$V46),o($Vo1,$V56),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vz4),o($Vo1,$VA4,{213:2626,214:2627,107:[1,2628]}),o($Vo1,$VB4),o($Vo1,$VC4),o($Vo1,$VD4),o($Vo1,$VE4),o($Vo1,$VF4),o($Vo1,$VG4),o($Vo1,$VH4),o($Vo1,$VI4),o($Vo1,$VJ4),o($V76,$Vj3),o($V76,$Vk3),o($V76,$Vl3),o($V76,$Vm3),{19:[1,2631],21:[1,2634],22:2630,83:2629,225:2632,226:[1,2633]},{204:[1,2637],205:2635,206:[1,2636]},o($Vp1,$V36),o($Vp1,$V46),o($Vp1,$V56),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vz4),o($Vp1,$VA4,{213:2638,214:2639,107:[1,2640]}),o($Vp1,$VB4),o($Vp1,$VC4),o($Vp1,$VD4),o($Vp1,$VE4),o($Vp1,$VF4),o($Vp1,$VG4),o($Vp1,$VH4),o($Vp1,$VI4),o($Vp1,$VJ4),o($V86,$Vj3),o($V86,$Vk3),o($V86,$Vl3),o($V86,$Vm3),o($Vo1,$V95),{204:[1,2643],205:2641,206:[1,2642]},o($Vm1,$V36),o($Vm1,$V46),o($Vm1,$V56),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vz4),o($Vm1,$VA4,{213:2644,214:2645,107:[1,2646]}),o($Vm1,$VB4),o($Vm1,$VC4),o($Vm1,$VD4),o($Vm1,$VE4),o($Vm1,$VF4),o($Vm1,$VG4),o($Vm1,$VH4),o($Vm1,$VI4),o($Vm1,$VJ4),o($V66,$Vj3),o($V66,$Vk3),o($V66,$Vl3),o($V66,$Vm3),{204:[1,2649],205:2647,206:[1,2648]},o($Vo1,$V36),o($Vo1,$V46),o($Vo1,$V56),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vz4),o($Vo1,$VA4,{213:2650,214:2651,107:[1,2652]}),o($Vo1,$VB4),o($Vo1,$VC4),o($Vo1,$VD4),o($Vo1,$VE4),o($Vo1,$VF4),o($Vo1,$VG4),o($Vo1,$VH4),o($Vo1,$VI4),o($Vo1,$VJ4),o($V76,$Vj3),o($V76,$Vk3),o($V76,$Vl3),o($V76,$Vm3),{19:[1,2655],21:[1,2658],22:2654,83:2653,225:2656,226:[1,2657]},{204:[1,2661],205:2659,206:[1,2660]},o($Vp1,$V36),o($Vp1,$V46),o($Vp1,$V56),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vz4),o($Vp1,$VA4,{213:2662,214:2663,107:[1,2664]}),o($Vp1,$VB4),o($Vp1,$VC4),o($Vp1,$VD4),o($Vp1,$VE4),o($Vp1,$VF4),o($Vp1,$VG4),o($Vp1,$VH4),o($Vp1,$VI4),o($Vp1,$VJ4),o($V86,$Vj3),o($V86,$Vk3),o($V86,$Vl3),o($V86,$Vm3),o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$VS5),o($Vm1,$VT5),{19:$VD6,21:$VE6,22:2666,83:2665,225:1691,226:$VF6},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$VS5),o($Vo1,$VT5),{19:$VG6,21:$VH6,22:2668,83:2667,225:1717,226:$VI6},o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$VS5),o($Vp1,$VT5),{19:$VJ6,21:$VK6,22:2670,83:2669,225:1743,226:$VL6},o($Vt1,$VU5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$Vb2),o($Va1,$Vd1,{61:2671,63:2672,68:2673,40:2674,74:2675,114:2679,75:[1,2676],76:[1,2677],77:[1,2678],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:2680,60:2681,69:2682,88:2683,90:2684,91:2688,95:2689,92:[1,2685],93:[1,2686],94:[1,2687],97:$V28,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2691,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:2692}),o($Vo1,$Vn1,{78:2693}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:2694}),o($Vm1,$Vs1,{95:2338,91:2695,97:$Vz7,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2696}),o($Vt1,$Vu1,{82:2697}),o($Vt1,$Vu1,{82:2698}),o($Vo1,$Vv1,{101:2342,103:2343,87:2699,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2700}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,2704],21:[1,2708],22:2702,32:2701,211:2703,225:2705,226:[1,2707],227:[1,2706]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{160:2709}),o($VH1,$VI1),{115:[1,2710],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},{96:[1,2711]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2713],102:2712,104:[1,2714],105:[1,2715],106:2716,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,2717]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VX3),{117:[1,2718]},o($Va1,$VP3),o($Vn2,$VY3),o($Vu2,$V_4),{19:$Vn,21:$Vo,22:2719,225:52,226:$Vp},{19:$V38,21:$V48,22:2721,96:[1,2732],104:[1,2733],105:[1,2734],106:2731,179:2722,202:2720,207:2725,208:2726,209:2727,212:2730,215:[1,2735],216:[1,2736],217:[1,2741],218:[1,2742],219:[1,2743],220:[1,2744],221:[1,2737],222:[1,2738],223:[1,2739],224:[1,2740],225:2724,226:$V58},o($Vw2,$V_4),{19:$Vn,21:$Vo,22:2745,225:52,226:$Vp},{19:$V68,21:$V78,22:2747,96:[1,2758],104:[1,2759],105:[1,2760],106:2757,179:2748,202:2746,207:2751,208:2752,209:2753,212:2756,215:[1,2761],216:[1,2762],217:[1,2767],218:[1,2768],219:[1,2769],220:[1,2770],221:[1,2763],222:[1,2764],223:[1,2765],224:[1,2766],225:2750,226:$V88},o($Vt1,$Ve3),o($Vt1,$Vf3),o($Vt1,$Vg3),o($Vt1,$Vh3),o($Vt1,$Vi3),{107:[1,2771]},o($Vt1,$Vn3),o($Vy2,$V_4),{19:$Vn,21:$Vo,22:2772,225:52,226:$Vp},{19:$V98,21:$Va8,22:2774,96:[1,2785],104:[1,2786],105:[1,2787],106:2784,179:2775,202:2773,207:2778,208:2779,209:2780,212:2783,215:[1,2788],216:[1,2789],217:[1,2794],218:[1,2795],219:[1,2796],220:[1,2797],221:[1,2790],222:[1,2791],223:[1,2792],224:[1,2793],225:2777,226:$Vb8},o($Vp1,$V95),o($VH1,$VU5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Va1,$VX3),{117:[1,2798]},o($Va1,$VP3),o($Vn2,$VY3),o($Vu2,$V_4),{19:$Vn,21:$Vo,22:2799,225:52,226:$Vp},{19:$Vc8,21:$Vd8,22:2801,96:[1,2812],104:[1,2813],105:[1,2814],106:2811,179:2802,202:2800,207:2805,208:2806,209:2807,212:2810,215:[1,2815],216:[1,2816],217:[1,2821],218:[1,2822],219:[1,2823],220:[1,2824],221:[1,2817],222:[1,2818],223:[1,2819],224:[1,2820],225:2804,226:$Ve8},o($Vw2,$V_4),{19:$Vn,21:$Vo,22:2825,225:52,226:$Vp},{19:$Vf8,21:$Vg8,22:2827,96:[1,2838],104:[1,2839],105:[1,2840],106:2837,179:2828,202:2826,207:2831,208:2832,209:2833,212:2836,215:[1,2841],216:[1,2842],217:[1,2847],218:[1,2848],219:[1,2849],220:[1,2850],221:[1,2843],222:[1,2844],223:[1,2845],224:[1,2846],225:2830,226:$Vh8},o($Vt1,$Ve3),o($Vt1,$Vf3),o($Vt1,$Vg3),o($Vt1,$Vh3),o($Vt1,$Vi3),{107:[1,2851]},o($Vt1,$Vn3),o($Vy2,$V_4),{19:$Vn,21:$Vo,22:2852,225:52,226:$Vp},{19:$Vi8,21:$Vj8,22:2854,96:[1,2865],104:[1,2866],105:[1,2867],106:2864,179:2855,202:2853,207:2858,208:2859,209:2860,212:2863,215:[1,2868],216:[1,2869],217:[1,2874],218:[1,2875],219:[1,2876],220:[1,2877],221:[1,2870],222:[1,2871],223:[1,2872],224:[1,2873],225:2857,226:$Vk8},o($Vp1,$V95),o($VH1,$VU5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($VT4,$VU1),o($VT4,$VV1),o($VT4,$VW1),o($VH3,$VS5),o($VH3,$VT5),{19:$VQ6,21:$VR6,22:2879,83:2878,225:1849,226:$VS6},o($VU4,$VU1),o($VU4,$VV1),o($VU4,$VW1),o($VI3,$VS5),o($VI3,$VT5),{19:$VT6,21:$VU6,22:2881,83:2880,225:1875,226:$VV6},o($VW4,$VU1),o($VW4,$VV1),o($VW4,$VW1),o($VJ3,$VS5),o($VJ3,$VT5),{19:$VW6,21:$VX6,22:2883,83:2882,225:1901,226:$VY6},o($VL3,$VU5),o($VL3,$VE1),o($VL3,$Vq),o($VL3,$Vr),o($VL3,$Vt),o($VL3,$Vu),o($VF3,$Vb2),o($VC,$VD,{61:2884,63:2885,68:2886,40:2887,74:2888,114:2892,47:$Vd1,49:$Vd1,66:$Vd1,75:[1,2889],76:[1,2890],77:[1,2891]}),o($VF3,$Vc2),o($VF3,$Vf1,{64:2893,60:2894,69:2895,88:2896,90:2897,91:2901,95:2902,92:[1,2898],93:[1,2899],94:[1,2900],97:$Vl8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2904,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VF3,$Vd2),o($VH3,$Vn1,{78:2905}),o($VI3,$Vn1,{78:2906}),o($V06,$Vf2),o($V06,$Vg2),o($VK3,$Vr1,{89:2907}),o($VH3,$Vs1,{95:2452,91:2908,97:$VD7,98:$VL,99:$VM,100:$VN}),o($VL3,$Vu1,{82:2909}),o($VL3,$Vu1,{82:2910}),o($VL3,$Vu1,{82:2911}),o($VI3,$Vv1,{101:2456,103:2457,87:2912,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VJ3,$Vn1,{78:2913}),o($V06,$V11),o($V06,$V21),{19:[1,2917],21:[1,2921],22:2915,32:2914,211:2916,225:2918,226:[1,2920],227:[1,2919]},o($VK3,$VA1),o($VK3,$VB1),o($VK3,$VC1),o($VK3,$VD1),o($VL3,$VE1),o($VF1,$VG1,{160:2922}),o($VM3,$VI1),{115:[1,2923],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},{96:[1,2924]},o($VK3,$VJ1),o($VL3,$Vq),o($VL3,$Vr),{96:[1,2926],102:2925,104:[1,2927],105:[1,2928],106:2929,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,2930]},o($VL3,$Vt),o($VL3,$Vu),o($VF3,$VX3),{117:[1,2931]},o($VF3,$VP3),o($VS4,$VY3),o($VT4,$V_4),{19:$Vn,21:$Vo,22:2932,225:52,226:$Vp},{19:$Vm8,21:$Vn8,22:2934,96:[1,2945],104:[1,2946],105:[1,2947],106:2944,179:2935,202:2933,207:2938,208:2939,209:2940,212:2943,215:[1,2948],216:[1,2949],217:[1,2954],218:[1,2955],219:[1,2956],220:[1,2957],221:[1,2950],222:[1,2951],223:[1,2952],224:[1,2953],225:2937,226:$Vo8},o($VU4,$V_4),{19:$Vn,21:$Vo,22:2958,225:52,226:$Vp},{19:$Vp8,21:$Vq8,22:2960,96:[1,2971],104:[1,2972],105:[1,2973],106:2970,179:2961,202:2959,207:2964,208:2965,209:2966,212:2969,215:[1,2974],216:[1,2975],217:[1,2980],218:[1,2981],219:[1,2982],220:[1,2983],221:[1,2976],222:[1,2977],223:[1,2978],224:[1,2979],225:2963,226:$Vr8},o($VL3,$Ve3),o($VL3,$Vf3),o($VL3,$Vg3),o($VL3,$Vh3),o($VL3,$Vi3),{107:[1,2984]},o($VL3,$Vn3),o($VW4,$V_4),{19:$Vn,21:$Vo,22:2985,225:52,226:$Vp},{19:$Vs8,21:$Vt8,22:2987,96:[1,2998],104:[1,2999],105:[1,3000],106:2997,179:2988,202:2986,207:2991,208:2992,209:2993,212:2996,215:[1,3001],216:[1,3002],217:[1,3007],218:[1,3008],219:[1,3009],220:[1,3010],221:[1,3003],222:[1,3004],223:[1,3005],224:[1,3006],225:2990,226:$Vu8},o($VJ3,$V95),o($VM3,$VU5),o($VM3,$VE1),o($VM3,$Vq),o($VM3,$Vr),o($VM3,$Vt),o($VM3,$Vu),o($VF3,$VX3),{117:[1,3011]},o($VF3,$VP3),o($VS4,$VY3),o($VT4,$V_4),{19:$Vn,21:$Vo,22:3012,225:52,226:$Vp},{19:$Vv8,21:$Vw8,22:3014,96:[1,3025],104:[1,3026],105:[1,3027],106:3024,179:3015,202:3013,207:3018,208:3019,209:3020,212:3023,215:[1,3028],216:[1,3029],217:[1,3034],218:[1,3035],219:[1,3036],220:[1,3037],221:[1,3030],222:[1,3031],223:[1,3032],224:[1,3033],225:3017,226:$Vx8},o($VU4,$V_4),{19:$Vn,21:$Vo,22:3038,225:52,226:$Vp},{19:$Vy8,21:$Vz8,22:3040,96:[1,3051],104:[1,3052],105:[1,3053],106:3050,179:3041,202:3039,207:3044,208:3045,209:3046,212:3049,215:[1,3054],216:[1,3055],217:[1,3060],218:[1,3061],219:[1,3062],220:[1,3063],221:[1,3056],222:[1,3057],223:[1,3058],224:[1,3059],225:3043,226:$VA8},o($VL3,$Ve3),o($VL3,$Vf3),o($VL3,$Vg3),o($VL3,$Vh3),o($VL3,$Vi3),{107:[1,3064]},o($VL3,$Vn3),o($VW4,$V_4),{19:$Vn,21:$Vo,22:3065,225:52,226:$Vp},{19:$VB8,21:$VC8,22:3067,96:[1,3078],104:[1,3079],105:[1,3080],106:3077,179:3068,202:3066,207:3071,208:3072,209:3073,212:3076,215:[1,3081],216:[1,3082],217:[1,3087],218:[1,3088],219:[1,3089],220:[1,3090],221:[1,3083],222:[1,3084],223:[1,3085],224:[1,3086],225:3070,226:$VD8},o($VJ3,$V95),o($VM3,$VU5),o($VM3,$VE1),o($VM3,$Vq),o($VM3,$Vr),o($VM3,$Vt),o($VM3,$Vu),o($VE8,$Vv2,{79:3091,80:3092,203:3093,201:$VF8}),o($V97,$VG8),o($Vx,$Vg,{51:3095,55:3096,36:3097,39:$Vy}),o($Vb7,$VH8),o($Vx,$Vg,{55:3098,36:3099,39:$Vy}),o($Vb7,$VI8),o($Vb7,$VJ8),o($Vb7,$VV7),o($Vb7,$VW7),{115:[1,3100],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vb7,$V11),o($Vb7,$V21),{19:[1,3104],21:[1,3108],22:3102,32:3101,211:3103,225:3105,226:[1,3107],227:[1,3106]},o($Vb7,$VK8),o($Vb7,$VL8),o($VM8,$Vr1,{89:3109}),o($Vb7,$Vs1,{95:2535,91:3110,97:$VP7,98:$VL,99:$VM,100:$VN}),o($VM8,$VA1),o($VM8,$VB1),o($VM8,$VC1),o($VM8,$VD1),{96:[1,3111]},o($VM8,$VJ1),{66:[1,3112]},o($VS7,$Vz2,{95:2040,91:3113,97:$Vd7,98:$VL,99:$VM,100:$VN}),o($VR7,$VA2),o($Vb7,$VB2,{86:3114,91:3115,87:3116,95:3117,101:3119,103:3120,97:$VN8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb7,$VD2,{86:3114,91:3115,87:3116,95:3117,101:3119,103:3120,97:$VN8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb7,$VE2,{86:3114,91:3115,87:3116,95:3117,101:3119,103:3120,97:$VN8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VX7,$VF2),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,3121],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:3122,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VU7,$VT1),o($VU7,$Vl),o($VU7,$Vm),o($VU7,$Vq),o($VU7,$Vr),o($VU7,$Vs),o($VU7,$Vt),o($VU7,$Vu),o($VR7,$Ve3),o($VX7,$Vf3),o($VX7,$Vg3),o($VX7,$Vh3),o($VX7,$Vi3),{107:[1,3123]},o($VX7,$Vn3),o($VE8,$Vv2,{80:3092,203:3093,79:3124,201:$VF8}),o($VO8,$V27,{149:3125,150:3126,153:$VP8,154:$VQ8,155:$VR8,156:$VS8}),o($VT8,$V87),o($VU8,$Va7,{52:3131}),o($VV8,$Vc7,{56:3132}),o($VC,$VD,{59:3133,69:3134,71:3135,72:3136,88:3139,90:3140,83:3142,84:3143,85:3144,74:3145,40:3146,91:3150,22:3151,87:3153,114:3154,95:3158,225:3161,101:3162,103:3163,19:[1,3160],21:[1,3165],65:[1,3137],67:[1,3138],75:[1,3155],76:[1,3156],77:[1,3157],81:[1,3141],92:[1,3147],93:[1,3148],94:[1,3149],97:$VW8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,3152],226:[1,3164]}),o($VO8,$V27,{150:3126,149:3166,153:$VP8,154:$VQ8,155:$VR8,156:$VS8}),o($Ve7,$Vf7,{190:3167}),o($Vk6,$Vv5),{145:[1,3168]},{145:[1,3169]},o($Ve4,$VX8),o($Ve7,[2,229]),{145:[1,3171],189:3170,198:[1,3172],199:[1,3173]},{19:$Vt6,21:$Vu6,22:1577,146:3174,211:1578,225:1580,226:$Vv6,227:$Vw6},{19:$Vt6,21:$Vu6,22:1577,146:3175,211:1578,225:1580,226:$Vv6,227:$Vw6},{66:[1,3176]},{66:[1,3177]},o($Vw2,$Vv2,{80:2599,203:2600,79:3178,201:$V08}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:3179,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vw2,$Vv2,{80:2599,203:2600,79:3180,201:$V08}),o($Vo1,$Vz2,{95:2097,91:3181,97:$Vg7,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Ve3),o($Va1,$VR4),o($VO3,$VP3),o($Vm1,$VQ3),o($VO3,$VR3,{31:3182,204:[1,3183]}),{19:$VS3,21:$VT3,22:632,125:3184,210:$VU3,225:635,226:$VV3},o($Va1,$VW3),o($Vo1,$VQ3),o($Va1,$VR3,{31:3185,204:[1,3186]}),{19:$VS3,21:$VT3,22:632,125:3187,210:$VU3,225:635,226:$VV3},o($Vq1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),{96:[1,3188]},o($Vt1,$VJ1),{96:[1,3190],102:3189,104:[1,3191],105:[1,3192],106:3193,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,3194]},o($Ve2,$VX3),o($Vp1,$VQ3),o($Ve2,$VR3,{31:3195,204:[1,3196]}),{19:$VS3,21:$VT3,22:632,125:3197,210:$VU3,225:635,226:$VV3},o($Vt1,$Vt4),{117:[1,3198]},{19:[1,3201],21:[1,3204],22:3200,83:3199,225:3202,226:[1,3203]},o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$VS5),o($Vm1,$VT5),{19:$Vh7,21:$Vi7,22:3206,83:3205,225:2132,226:$Vj7},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$VS5),o($Vo1,$VT5),{19:$Vk7,21:$Vl7,22:3208,83:3207,225:2158,226:$Vm7},o($Vt1,$VU5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$VS5),o($Vp1,$VT5),{19:$Vn7,21:$Vo7,22:3210,83:3209,225:2185,226:$Vp7},o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$VS5),o($Vm1,$VT5),{19:$Vq7,21:$Vr7,22:3212,83:3211,225:2212,226:$Vs7},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$VS5),o($Vo1,$VT5),{19:$Vt7,21:$Vu7,22:3214,83:3213,225:2238,226:$Vv7},o($Vt1,$VU5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$VS5),o($Vp1,$VT5),{19:$Vw7,21:$Vx7,22:3216,83:3215,225:2265,226:$Vy7},o($Vm1,$VB6),o($Vm1,$VE1),o($Vo1,$VB6),o($Vo1,$VE1),o($Vp1,$VB6),o($Vp1,$VE1),o($Va1,$VC3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:3217}),o($Va1,$V11),o($Va1,$V21),{19:[1,3221],21:[1,3225],22:3219,32:3218,211:3220,225:3222,226:[1,3224],227:[1,3223]},{115:[1,3226],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Va1,$VD3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:3227}),o($Vn2,$Vr1,{89:3228}),o($Vo1,$Vs1,{95:2689,91:3229,97:$V28,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,3230]},o($Vn2,$VJ1),{66:[1,3231]},o($Vu2,$Vv2,{79:3232,80:3233,203:3234,201:[1,3235]}),o($Vw2,$Vv2,{79:3236,80:3237,203:3238,201:$VY8}),o($Vm1,$Vz2,{95:2338,91:3240,97:$Vz7,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:3241,91:3242,87:3243,95:3244,101:3246,103:3247,97:$VZ8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:3241,91:3242,87:3243,95:3244,101:3246,103:3247,97:$VZ8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:3241,91:3242,87:3243,95:3244,101:3246,103:3247,97:$VZ8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:3248,80:3249,203:3250,201:[1,3251]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,3252],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:3253,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vq1,$Ve3),o($VH1,$Vf3),o($VH1,$Vg3),o($VH1,$Vh3),o($VH1,$Vi3),{107:[1,3254]},o($VH1,$Vn3),o($Vo1,$V95),{204:[1,3257],205:3255,206:[1,3256]},o($Vm1,$V36),o($Vm1,$V46),o($Vm1,$V56),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vz4),o($Vm1,$VA4,{213:3258,214:3259,107:[1,3260]}),o($Vm1,$VB4),o($Vm1,$VC4),o($Vm1,$VD4),o($Vm1,$VE4),o($Vm1,$VF4),o($Vm1,$VG4),o($Vm1,$VH4),o($Vm1,$VI4),o($Vm1,$VJ4),o($V66,$Vj3),o($V66,$Vk3),o($V66,$Vl3),o($V66,$Vm3),{204:[1,3263],205:3261,206:[1,3262]},o($Vo1,$V36),o($Vo1,$V46),o($Vo1,$V56),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vz4),o($Vo1,$VA4,{213:3264,214:3265,107:[1,3266]}),o($Vo1,$VB4),o($Vo1,$VC4),o($Vo1,$VD4),o($Vo1,$VE4),o($Vo1,$VF4),o($Vo1,$VG4),o($Vo1,$VH4),o($Vo1,$VI4),o($Vo1,$VJ4),o($V76,$Vj3),o($V76,$Vk3),o($V76,$Vl3),o($V76,$Vm3),{19:[1,3269],21:[1,3272],22:3268,83:3267,225:3270,226:[1,3271]},{204:[1,3275],205:3273,206:[1,3274]},o($Vp1,$V36),o($Vp1,$V46),o($Vp1,$V56),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vz4),o($Vp1,$VA4,{213:3276,214:3277,107:[1,3278]}),o($Vp1,$VB4),o($Vp1,$VC4),o($Vp1,$VD4),o($Vp1,$VE4),o($Vp1,$VF4),o($Vp1,$VG4),o($Vp1,$VH4),o($Vp1,$VI4),o($Vp1,$VJ4),o($V86,$Vj3),o($V86,$Vk3),o($V86,$Vl3),o($V86,$Vm3),o($Vo1,$V95),{204:[1,3281],205:3279,206:[1,3280]},o($Vm1,$V36),o($Vm1,$V46),o($Vm1,$V56),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vz4),o($Vm1,$VA4,{213:3282,214:3283,107:[1,3284]}),o($Vm1,$VB4),o($Vm1,$VC4),o($Vm1,$VD4),o($Vm1,$VE4),o($Vm1,$VF4),o($Vm1,$VG4),o($Vm1,$VH4),o($Vm1,$VI4),o($Vm1,$VJ4),o($V66,$Vj3),o($V66,$Vk3),o($V66,$Vl3),o($V66,$Vm3),{204:[1,3287],205:3285,206:[1,3286]},o($Vo1,$V36),o($Vo1,$V46),o($Vo1,$V56),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vz4),o($Vo1,$VA4,{213:3288,214:3289,107:[1,3290]}),o($Vo1,$VB4),o($Vo1,$VC4),o($Vo1,$VD4),o($Vo1,$VE4),o($Vo1,$VF4),o($Vo1,$VG4),o($Vo1,$VH4),o($Vo1,$VI4),o($Vo1,$VJ4),o($V76,$Vj3),o($V76,$Vk3),o($V76,$Vl3),o($V76,$Vm3),{19:[1,3293],21:[1,3296],22:3292,83:3291,225:3294,226:[1,3295]},{204:[1,3299],205:3297,206:[1,3298]},o($Vp1,$V36),o($Vp1,$V46),o($Vp1,$V56),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vz4),o($Vp1,$VA4,{213:3300,214:3301,107:[1,3302]}),o($Vp1,$VB4),o($Vp1,$VC4),o($Vp1,$VD4),o($Vp1,$VE4),o($Vp1,$VF4),o($Vp1,$VG4),o($Vp1,$VH4),o($Vp1,$VI4),o($Vp1,$VJ4),o($V86,$Vj3),o($V86,$Vk3),o($V86,$Vl3),o($V86,$Vm3),o($VH3,$VB6),o($VH3,$VE1),o($VI3,$VB6),o($VI3,$VE1),o($VJ3,$VB6),o($VJ3,$VE1),o($VF3,$VC3),o($VF3,$Vk2),o($VF3,$Vf2),o($VF3,$Vg2),o($VI3,$Vn1,{78:3303}),o($VF3,$V11),o($VF3,$V21),{19:[1,3307],21:[1,3311],22:3305,32:3304,211:3306,225:3308,226:[1,3310],227:[1,3309]},{115:[1,3312],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VF3,$VD3),o($VF3,$Vm2),o($VI3,$Vn1,{78:3313}),o($VS4,$Vr1,{89:3314}),o($VI3,$Vs1,{95:2902,91:3315,97:$Vl8,98:$VL,99:$VM,100:$VN}),o($VS4,$VA1),o($VS4,$VB1),o($VS4,$VC1),o($VS4,$VD1),{96:[1,3316]},o($VS4,$VJ1),{66:[1,3317]},o($VT4,$Vv2,{79:3318,80:3319,203:3320,201:[1,3321]}),o($VU4,$Vv2,{79:3322,80:3323,203:3324,201:$V_8}),o($VH3,$Vz2,{95:2452,91:3326,97:$VD7,98:$VL,99:$VM,100:$VN}),o($VK3,$VA2),o($VI3,$VB2,{86:3327,91:3328,87:3329,95:3330,101:3332,103:3333,97:$V$8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI3,$VD2,{86:3327,91:3328,87:3329,95:3330,101:3332,103:3333,97:$V$8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI3,$VE2,{86:3327,91:3328,87:3329,95:3330,101:3332,103:3333,97:$V$8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VM3,$VF2),o($VW4,$Vv2,{79:3334,80:3335,203:3336,201:[1,3337]}),o($V06,$VT1),o($V06,$Vl),o($V06,$Vm),o($V06,$Vq),o($V06,$Vr),o($V06,$Vs),o($V06,$Vt),o($V06,$Vu),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,3338],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:3339,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VK3,$Ve3),o($VM3,$Vf3),o($VM3,$Vg3),o($VM3,$Vh3),o($VM3,$Vi3),{107:[1,3340]},o($VM3,$Vn3),o($VI3,$V95),{204:[1,3343],205:3341,206:[1,3342]},o($VH3,$V36),o($VH3,$V46),o($VH3,$V56),o($VH3,$Vq),o($VH3,$Vr),o($VH3,$Vw4),o($VH3,$Vx4),o($VH3,$Vy4),o($VH3,$Vt),o($VH3,$Vu),o($VH3,$Vz4),o($VH3,$VA4,{213:3344,214:3345,107:[1,3346]}),o($VH3,$VB4),o($VH3,$VC4),o($VH3,$VD4),o($VH3,$VE4),o($VH3,$VF4),o($VH3,$VG4),o($VH3,$VH4),o($VH3,$VI4),o($VH3,$VJ4),o($VA7,$Vj3),o($VA7,$Vk3),o($VA7,$Vl3),o($VA7,$Vm3),{204:[1,3349],205:3347,206:[1,3348]},o($VI3,$V36),o($VI3,$V46),o($VI3,$V56),o($VI3,$Vq),o($VI3,$Vr),o($VI3,$Vw4),o($VI3,$Vx4),o($VI3,$Vy4),o($VI3,$Vt),o($VI3,$Vu),o($VI3,$Vz4),o($VI3,$VA4,{213:3350,214:3351,107:[1,3352]}),o($VI3,$VB4),o($VI3,$VC4),o($VI3,$VD4),o($VI3,$VE4),o($VI3,$VF4),o($VI3,$VG4),o($VI3,$VH4),o($VI3,$VI4),o($VI3,$VJ4),o($VB7,$Vj3),o($VB7,$Vk3),o($VB7,$Vl3),o($VB7,$Vm3),{19:[1,3355],21:[1,3358],22:3354,83:3353,225:3356,226:[1,3357]},{204:[1,3361],205:3359,206:[1,3360]},o($VJ3,$V36),o($VJ3,$V46),o($VJ3,$V56),o($VJ3,$Vq),o($VJ3,$Vr),o($VJ3,$Vw4),o($VJ3,$Vx4),o($VJ3,$Vy4),o($VJ3,$Vt),o($VJ3,$Vu),o($VJ3,$Vz4),o($VJ3,$VA4,{213:3362,214:3363,107:[1,3364]}),o($VJ3,$VB4),o($VJ3,$VC4),o($VJ3,$VD4),o($VJ3,$VE4),o($VJ3,$VF4),o($VJ3,$VG4),o($VJ3,$VH4),o($VJ3,$VI4),o($VJ3,$VJ4),o($VC7,$Vj3),o($VC7,$Vk3),o($VC7,$Vl3),o($VC7,$Vm3),o($VI3,$V95),{204:[1,3367],205:3365,206:[1,3366]},o($VH3,$V36),o($VH3,$V46),o($VH3,$V56),o($VH3,$Vq),o($VH3,$Vr),o($VH3,$Vw4),o($VH3,$Vx4),o($VH3,$Vy4),o($VH3,$Vt),o($VH3,$Vu),o($VH3,$Vz4),o($VH3,$VA4,{213:3368,214:3369,107:[1,3370]}),o($VH3,$VB4),o($VH3,$VC4),o($VH3,$VD4),o($VH3,$VE4),o($VH3,$VF4),o($VH3,$VG4),o($VH3,$VH4),o($VH3,$VI4),o($VH3,$VJ4),o($VA7,$Vj3),o($VA7,$Vk3),o($VA7,$Vl3),o($VA7,$Vm3),{204:[1,3373],205:3371,206:[1,3372]},o($VI3,$V36),o($VI3,$V46),o($VI3,$V56),o($VI3,$Vq),o($VI3,$Vr),o($VI3,$Vw4),o($VI3,$Vx4),o($VI3,$Vy4),o($VI3,$Vt),o($VI3,$Vu),o($VI3,$Vz4),o($VI3,$VA4,{213:3374,214:3375,107:[1,3376]}),o($VI3,$VB4),o($VI3,$VC4),o($VI3,$VD4),o($VI3,$VE4),o($VI3,$VF4),o($VI3,$VG4),o($VI3,$VH4),o($VI3,$VI4),o($VI3,$VJ4),o($VB7,$Vj3),o($VB7,$Vk3),o($VB7,$Vl3),o($VB7,$Vm3),{19:[1,3379],21:[1,3382],22:3378,83:3377,225:3380,226:[1,3381]},{204:[1,3385],205:3383,206:[1,3384]},o($VJ3,$V36),o($VJ3,$V46),o($VJ3,$V56),o($VJ3,$Vq),o($VJ3,$Vr),o($VJ3,$Vw4),o($VJ3,$Vx4),o($VJ3,$Vy4),o($VJ3,$Vt),o($VJ3,$Vu),o($VJ3,$Vz4),o($VJ3,$VA4,{213:3386,214:3387,107:[1,3388]}),o($VJ3,$VB4),o($VJ3,$VC4),o($VJ3,$VD4),o($VJ3,$VE4),o($VJ3,$VF4),o($VJ3,$VG4),o($VJ3,$VH4),o($VJ3,$VI4),o($VJ3,$VJ4),o($VC7,$Vj3),o($VC7,$Vk3),o($VC7,$Vl3),o($VC7,$Vm3),o($Ve4,$V09),o($V17,$VQ3),o($Ve4,$VR3,{31:3389,204:[1,3390]}),{19:$VS3,21:$VT3,22:632,125:3391,210:$VU3,225:635,226:$VV3},o($V97,$V19),o($Vb7,$Vc7,{56:3392}),o($VC,$VD,{59:3393,69:3394,71:3395,72:3396,88:3399,90:3400,83:3402,84:3403,85:3404,74:3405,40:3406,91:3410,22:3411,87:3413,114:3414,95:3418,225:3421,101:3422,103:3423,19:[1,3420],21:[1,3425],65:[1,3397],67:[1,3398],75:[1,3415],76:[1,3416],77:[1,3417],81:[1,3401],92:[1,3407],93:[1,3408],94:[1,3409],97:$V29,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,3412],226:[1,3424]}),o($Vb7,$V39),o($VC,$VD,{59:3426,69:3427,71:3428,72:3429,88:3432,90:3433,83:3435,84:3436,85:3437,74:3438,40:3439,91:3443,22:3444,87:3446,114:3447,95:3451,225:3454,101:3455,103:3456,19:[1,3453],21:[1,3458],65:[1,3430],67:[1,3431],75:[1,3448],76:[1,3449],77:[1,3450],81:[1,3434],92:[1,3440],93:[1,3441],94:[1,3442],97:$V49,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,3445],226:[1,3457]}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:3459,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vb7,$VT1),o($Vb7,$Vl),o($Vb7,$Vm),o($Vb7,$Vq),o($Vb7,$Vr),o($Vb7,$Vs),o($Vb7,$Vt),o($Vb7,$Vu),o($Vb7,$Vz2,{95:2535,91:3460,97:$VP7,98:$VL,99:$VM,100:$VN}),o($VM8,$VA2),o($VM8,$Ve3),o($Vb7,$V59),o($VR7,$VY3),o($VT7,$VZ3),o($VT7,$V_3),o($VT7,$V$3),{96:[1,3461]},o($VT7,$VJ1),{96:[1,3463],102:3462,104:[1,3464],105:[1,3465],106:3466,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,3467]},o($VT7,$Vt4),{117:[1,3468]},{19:[1,3471],21:[1,3474],22:3470,83:3469,225:3472,226:[1,3473]},o($Ve4,$V69),o($VO8,$Vn1,{78:3475}),o($VO8,$VE7),o($VO8,$VF7),o($VO8,$VG7),o($VO8,$VH7),o($VO8,$VI7),o($VT8,$VJ7,{53:3476,47:[1,3477]}),o($VU8,$VK7,{57:3478,49:[1,3479]}),o($VV8,$VL7),o($VV8,$VM7,{70:3480,72:3481,74:3482,40:3483,114:3484,75:[1,3485],76:[1,3486],77:[1,3487],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($VV8,$VN7),o($VV8,$VO7,{73:3488,69:3489,88:3490,90:3491,91:3495,95:3496,92:[1,3492],93:[1,3493],94:[1,3494],97:$V79,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3498,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VV8,$VQ7),o($V89,$Vr1,{89:3499}),o($V99,$Vs1,{95:3158,91:3500,97:$VW8,98:$VL,99:$VM,100:$VN}),o($Va9,$Vu1,{82:3501}),o($Va9,$Vu1,{82:3502}),o($Va9,$Vu1,{82:3503}),o($VV8,$Vv1,{101:3162,103:3163,87:3504,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb9,$VV7),o($Vb9,$VW7),o($V89,$VA1),o($V89,$VB1),o($V89,$VC1),o($V89,$VD1),o($Va9,$VE1),o($VF1,$VG1,{160:3505}),o($Vc9,$VI1),{115:[1,3506],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vb9,$V11),o($Vb9,$V21),{19:[1,3510],21:[1,3514],22:3508,32:3507,211:3509,225:3511,226:[1,3513],227:[1,3512]},{96:[1,3515]},o($V89,$VJ1),o($Va9,$Vq),o($Va9,$Vr),{96:[1,3517],102:3516,104:[1,3518],105:[1,3519],106:3520,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,3521]},o($Va9,$Vt),o($Va9,$Vu),o($VO8,$Vn1,{78:3522}),{66:[1,3523],136:$VY7,194:2573},{19:$Vt6,21:$Vu6,22:1577,146:3524,211:1578,225:1580,226:$Vv6,227:$Vw6},{19:$Vt6,21:$Vu6,22:1577,146:3525,211:1578,225:1580,226:$Vv6,227:$Vw6},o($Ve7,[2,227]),{19:[1,3529],21:[1,3533],22:3527,146:3526,211:3528,225:3530,226:[1,3532],227:[1,3531]},{65:[1,3534]},{65:[1,3535]},{66:[1,3536]},{66:[1,3537]},o($Ve4,$V_7),o($Ve4,$V$7),o($Va1,$VX3),{117:[1,3538]},o($Va1,$VP3),o($Vn2,$VY3),o($Vu2,$V_4),{19:$Vn,21:$Vo,22:3539,225:52,226:$Vp},{19:$Vd9,21:$Ve9,22:3541,96:[1,3552],104:[1,3553],105:[1,3554],106:3551,179:3542,202:3540,207:3545,208:3546,209:3547,212:3550,215:[1,3555],216:[1,3556],217:[1,3561],218:[1,3562],219:[1,3563],220:[1,3564],221:[1,3557],222:[1,3558],223:[1,3559],224:[1,3560],225:3544,226:$Vf9},o($Vw2,$V_4),{19:$Vn,21:$Vo,22:3565,225:52,226:$Vp},{19:$Vg9,21:$Vh9,22:3567,96:[1,3578],104:[1,3579],105:[1,3580],106:3577,179:3568,202:3566,207:3571,208:3572,209:3573,212:3576,215:[1,3581],216:[1,3582],217:[1,3587],218:[1,3588],219:[1,3589],220:[1,3590],221:[1,3583],222:[1,3584],223:[1,3585],224:[1,3586],225:3570,226:$Vi9},o($Vt1,$Ve3),o($Vt1,$Vf3),o($Vt1,$Vg3),o($Vt1,$Vh3),o($Vt1,$Vi3),{107:[1,3591]},o($Vt1,$Vn3),o($Vy2,$V_4),{19:$Vn,21:$Vo,22:3592,225:52,226:$Vp},{19:$Vj9,21:$Vk9,22:3594,96:[1,3605],104:[1,3606],105:[1,3607],106:3604,179:3595,202:3593,207:3598,208:3599,209:3600,212:3603,215:[1,3608],216:[1,3609],217:[1,3614],218:[1,3615],219:[1,3616],220:[1,3617],221:[1,3610],222:[1,3611],223:[1,3612],224:[1,3613],225:3597,226:$Vl9},o($Vp1,$V95),o($VH1,$VU5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Vm1,$VB6),o($Vm1,$VE1),o($Vo1,$VB6),o($Vo1,$VE1),o($Vp1,$VB6),o($Vp1,$VE1),o($Vm1,$VB6),o($Vm1,$VE1),o($Vo1,$VB6),o($Vo1,$VE1),o($Vp1,$VB6),o($Vp1,$VE1),o($Vw2,$Vv2,{80:3237,203:3238,79:3618,201:$VY8}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:3619,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vw2,$Vv2,{80:3237,203:3238,79:3620,201:$VY8}),o($Vo1,$Vz2,{95:2689,91:3621,97:$V28,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Ve3),o($Va1,$VR4),o($VO3,$VP3),o($Vm1,$VQ3),o($VO3,$VR3,{31:3622,204:[1,3623]}),{19:$VS3,21:$VT3,22:632,125:3624,210:$VU3,225:635,226:$VV3},o($Va1,$VW3),o($Vo1,$VQ3),o($Va1,$VR3,{31:3625,204:[1,3626]}),{19:$VS3,21:$VT3,22:632,125:3627,210:$VU3,225:635,226:$VV3},o($Vq1,$VY3),o($Vt1,$VZ3),o($Vt1,$V_3),o($Vt1,$V$3),{96:[1,3628]},o($Vt1,$VJ1),{96:[1,3630],102:3629,104:[1,3631],105:[1,3632],106:3633,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,3634]},o($Ve2,$VX3),o($Vp1,$VQ3),o($Ve2,$VR3,{31:3635,204:[1,3636]}),{19:$VS3,21:$VT3,22:632,125:3637,210:$VU3,225:635,226:$VV3},o($Vt1,$Vt4),{117:[1,3638]},{19:[1,3641],21:[1,3644],22:3640,83:3639,225:3642,226:[1,3643]},o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$VS5),o($Vm1,$VT5),{19:$V38,21:$V48,22:3646,83:3645,225:2724,226:$V58},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$VS5),o($Vo1,$VT5),{19:$V68,21:$V78,22:3648,83:3647,225:2750,226:$V88},o($Vt1,$VU5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$VS5),o($Vp1,$VT5),{19:$V98,21:$Va8,22:3650,83:3649,225:2777,226:$Vb8},o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$VS5),o($Vm1,$VT5),{19:$Vc8,21:$Vd8,22:3652,83:3651,225:2804,226:$Ve8},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$VS5),o($Vo1,$VT5),{19:$Vf8,21:$Vg8,22:3654,83:3653,225:2830,226:$Vh8},o($Vt1,$VU5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$VS5),o($Vp1,$VT5),{19:$Vi8,21:$Vj8,22:3656,83:3655,225:2857,226:$Vk8},o($VU4,$Vv2,{80:3323,203:3324,79:3657,201:$V_8}),o($VF3,$VT1),o($VF3,$Vl),o($VF3,$Vm),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vs),o($VF3,$Vt),o($VF3,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:3658,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VU4,$Vv2,{80:3323,203:3324,79:3659,201:$V_8}),o($VI3,$Vz2,{95:2902,91:3660,97:$Vl8,98:$VL,99:$VM,100:$VN}),o($VS4,$VA2),o($VS4,$Ve3),o($VF3,$VR4),o($V$5,$VP3),o($VH3,$VQ3),o($V$5,$VR3,{31:3661,204:[1,3662]}),{19:$VS3,21:$VT3,22:632,125:3663,210:$VU3,225:635,226:$VV3},o($VF3,$VW3),o($VI3,$VQ3),o($VF3,$VR3,{31:3664,204:[1,3665]}),{19:$VS3,21:$VT3,22:632,125:3666,210:$VU3,225:635,226:$VV3},o($VK3,$VY3),o($VL3,$VZ3),o($VL3,$V_3),o($VL3,$V$3),{96:[1,3667]},o($VL3,$VJ1),{96:[1,3669],102:3668,104:[1,3670],105:[1,3671],106:3672,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,3673]},o($V06,$VX3),o($VJ3,$VQ3),o($V06,$VR3,{31:3674,204:[1,3675]}),{19:$VS3,21:$VT3,22:632,125:3676,210:$VU3,225:635,226:$VV3},o($VL3,$Vt4),{117:[1,3677]},{19:[1,3680],21:[1,3683],22:3679,83:3678,225:3681,226:[1,3682]},o($VT4,$VU1),o($VT4,$VV1),o($VT4,$VW1),o($VH3,$VS5),o($VH3,$VT5),{19:$Vm8,21:$Vn8,22:3685,83:3684,225:2937,226:$Vo8},o($VU4,$VU1),o($VU4,$VV1),o($VU4,$VW1),o($VI3,$VS5),o($VI3,$VT5),{19:$Vp8,21:$Vq8,22:3687,83:3686,225:2963,226:$Vr8},o($VL3,$VU5),o($VL3,$VE1),o($VL3,$Vq),o($VL3,$Vr),o($VL3,$Vt),o($VL3,$Vu),o($VW4,$VU1),o($VW4,$VV1),o($VW4,$VW1),o($VJ3,$VS5),o($VJ3,$VT5),{19:$Vs8,21:$Vt8,22:3689,83:3688,225:2990,226:$Vu8},o($VT4,$VU1),o($VT4,$VV1),o($VT4,$VW1),o($VH3,$VS5),o($VH3,$VT5),{19:$Vv8,21:$Vw8,22:3691,83:3690,225:3017,226:$Vx8},o($VU4,$VU1),o($VU4,$VV1),o($VU4,$VW1),o($VI3,$VS5),o($VI3,$VT5),{19:$Vy8,21:$Vz8,22:3693,83:3692,225:3043,226:$VA8},o($VL3,$VU5),o($VL3,$VE1),o($VL3,$Vq),o($VL3,$Vr),o($VL3,$Vt),o($VL3,$Vu),o($VW4,$VU1),o($VW4,$VV1),o($VW4,$VW1),o($VJ3,$VS5),o($VJ3,$VT5),{19:$VB8,21:$VC8,22:3695,83:3694,225:3070,226:$VD8},o($VE8,$V_4),{19:$Vn,21:$Vo,22:3696,225:52,226:$Vp},{19:$Vm9,21:$Vn9,22:3698,96:[1,3709],104:[1,3710],105:[1,3711],106:3708,179:3699,202:3697,207:3702,208:3703,209:3704,212:3707,215:[1,3712],216:[1,3713],217:[1,3718],218:[1,3719],219:[1,3720],220:[1,3721],221:[1,3714],222:[1,3715],223:[1,3716],224:[1,3717],225:3701,226:$Vo9},o($V97,$VK7,{57:3722,49:[1,3723]}),o($Vb7,$VL7),o($Vb7,$VM7,{70:3724,72:3725,74:3726,40:3727,114:3728,75:[1,3729],76:[1,3730],77:[1,3731],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Vb7,$VN7),o($Vb7,$VO7,{73:3732,69:3733,88:3734,90:3735,91:3739,95:3740,92:[1,3736],93:[1,3737],94:[1,3738],97:$Vp9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3742,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vb7,$VQ7),o($VR7,$Vr1,{89:3743}),o($VS7,$Vs1,{95:3418,91:3744,97:$V29,98:$VL,99:$VM,100:$VN}),o($VT7,$Vu1,{82:3745}),o($VT7,$Vu1,{82:3746}),o($VT7,$Vu1,{82:3747}),o($Vb7,$Vv1,{101:3422,103:3423,87:3748,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VU7,$VV7),o($VU7,$VW7),o($VR7,$VA1),o($VR7,$VB1),o($VR7,$VC1),o($VR7,$VD1),o($VT7,$VE1),o($VF1,$VG1,{160:3749}),o($VX7,$VI1),{115:[1,3750],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VU7,$V11),o($VU7,$V21),{19:[1,3754],21:[1,3758],22:3752,32:3751,211:3753,225:3755,226:[1,3757],227:[1,3756]},{96:[1,3759]},o($VR7,$VJ1),o($VT7,$Vq),o($VT7,$Vr),{96:[1,3761],102:3760,104:[1,3762],105:[1,3763],106:3764,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,3765]},o($VT7,$Vt),o($VT7,$Vu),o($Vb7,$VL7),o($Vb7,$VM7,{70:3766,72:3767,74:3768,40:3769,114:3770,75:[1,3771],76:[1,3772],77:[1,3773],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Vb7,$VN7),o($Vb7,$VO7,{73:3774,69:3775,88:3776,90:3777,91:3781,95:3782,92:[1,3778],93:[1,3779],94:[1,3780],97:$Vq9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3784,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vb7,$VQ7),o($VR7,$Vr1,{89:3785}),o($VS7,$Vs1,{95:3451,91:3786,97:$V49,98:$VL,99:$VM,100:$VN}),o($VT7,$Vu1,{82:3787}),o($VT7,$Vu1,{82:3788}),o($VT7,$Vu1,{82:3789}),o($Vb7,$Vv1,{101:3455,103:3456,87:3790,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VU7,$VV7),o($VU7,$VW7),o($VR7,$VA1),o($VR7,$VB1),o($VR7,$VC1),o($VR7,$VD1),o($VT7,$VE1),o($VF1,$VG1,{160:3791}),o($VX7,$VI1),{115:[1,3792],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VU7,$V11),o($VU7,$V21),{19:[1,3796],21:[1,3800],22:3794,32:3793,211:3795,225:3797,226:[1,3799],227:[1,3798]},{96:[1,3801]},o($VR7,$VJ1),o($VT7,$Vq),o($VT7,$Vr),{96:[1,3803],102:3802,104:[1,3804],105:[1,3805],106:3806,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,3807]},o($VT7,$Vt),o($VT7,$Vu),{117:[1,3808]},o($VM8,$VY3),o($VT7,$Ve3),o($VT7,$Vf3),o($VT7,$Vg3),o($VT7,$Vh3),o($VT7,$Vi3),{107:[1,3809]},o($VT7,$Vn3),o($VU7,$V95),o($VX7,$VU5),o($VX7,$VE1),o($VX7,$Vq),o($VX7,$Vr),o($VX7,$Vt),o($VX7,$Vu),o($Vr9,$Vv2,{79:3810,80:3811,203:3812,201:$Vs9}),o($VU8,$VG8),o($Vx,$Vg,{51:3814,55:3815,36:3816,39:$Vy}),o($VV8,$VH8),o($Vx,$Vg,{55:3817,36:3818,39:$Vy}),o($VV8,$VI8),o($VV8,$VJ8),o($VV8,$VV7),o($VV8,$VW7),{115:[1,3819],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VV8,$V11),o($VV8,$V21),{19:[1,3823],21:[1,3827],22:3821,32:3820,211:3822,225:3824,226:[1,3826],227:[1,3825]},o($VV8,$VK8),o($VV8,$VL8),o($Vt9,$Vr1,{89:3828}),o($VV8,$Vs1,{95:3496,91:3829,97:$V79,98:$VL,99:$VM,100:$VN}),o($Vt9,$VA1),o($Vt9,$VB1),o($Vt9,$VC1),o($Vt9,$VD1),{96:[1,3830]},o($Vt9,$VJ1),{66:[1,3831]},o($V99,$Vz2,{95:3158,91:3832,97:$VW8,98:$VL,99:$VM,100:$VN}),o($V89,$VA2),o($VV8,$VB2,{86:3833,91:3834,87:3835,95:3836,101:3838,103:3839,97:$Vu9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VV8,$VD2,{86:3833,91:3834,87:3835,95:3836,101:3838,103:3839,97:$Vu9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VV8,$VE2,{86:3833,91:3834,87:3835,95:3836,101:3838,103:3839,97:$Vu9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc9,$VF2),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,3840],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:3841,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vb9,$VT1),o($Vb9,$Vl),o($Vb9,$Vm),o($Vb9,$Vq),o($Vb9,$Vr),o($Vb9,$Vs),o($Vb9,$Vt),o($Vb9,$Vu),o($V89,$Ve3),o($Vc9,$Vf3),o($Vc9,$Vg3),o($Vc9,$Vh3),o($Vc9,$Vi3),{107:[1,3842]},o($Vc9,$Vn3),o($Vr9,$Vv2,{80:3811,203:3812,79:3843,201:$Vs9}),o($Vk6,$VX8),{66:[1,3844]},{66:[1,3845]},o($Ve7,$Vv5),o($Ve7,$Vt5),o($Ve7,$Vu5),o($Ve7,$Vq),o($Ve7,$Vr),o($Ve7,$Vs),o($Ve7,$Vt),o($Ve7,$Vu),{145:[1,3846]},{145:[1,3847]},o($Ve7,$V_7),o($Ve7,$V$7),o($Vo1,$V95),{204:[1,3850],205:3848,206:[1,3849]},o($Vm1,$V36),o($Vm1,$V46),o($Vm1,$V56),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vz4),o($Vm1,$VA4,{213:3851,214:3852,107:[1,3853]}),o($Vm1,$VB4),o($Vm1,$VC4),o($Vm1,$VD4),o($Vm1,$VE4),o($Vm1,$VF4),o($Vm1,$VG4),o($Vm1,$VH4),o($Vm1,$VI4),o($Vm1,$VJ4),o($V66,$Vj3),o($V66,$Vk3),o($V66,$Vl3),o($V66,$Vm3),{204:[1,3856],205:3854,206:[1,3855]},o($Vo1,$V36),o($Vo1,$V46),o($Vo1,$V56),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vz4),o($Vo1,$VA4,{213:3857,214:3858,107:[1,3859]}),o($Vo1,$VB4),o($Vo1,$VC4),o($Vo1,$VD4),o($Vo1,$VE4),o($Vo1,$VF4),o($Vo1,$VG4),o($Vo1,$VH4),o($Vo1,$VI4),o($Vo1,$VJ4),o($V76,$Vj3),o($V76,$Vk3),o($V76,$Vl3),o($V76,$Vm3),{19:[1,3862],21:[1,3865],22:3861,83:3860,225:3863,226:[1,3864]},{204:[1,3868],205:3866,206:[1,3867]},o($Vp1,$V36),o($Vp1,$V46),o($Vp1,$V56),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vz4),o($Vp1,$VA4,{213:3869,214:3870,107:[1,3871]}),o($Vp1,$VB4),o($Vp1,$VC4),o($Vp1,$VD4),o($Vp1,$VE4),o($Vp1,$VF4),o($Vp1,$VG4),o($Vp1,$VH4),o($Vp1,$VI4),o($Vp1,$VJ4),o($V86,$Vj3),o($V86,$Vk3),o($V86,$Vl3),o($V86,$Vm3),o($Va1,$VX3),{117:[1,3872]},o($Va1,$VP3),o($Vn2,$VY3),o($Vu2,$V_4),{19:$Vn,21:$Vo,22:3873,225:52,226:$Vp},{19:$Vv9,21:$Vw9,22:3875,96:[1,3886],104:[1,3887],105:[1,3888],106:3885,179:3876,202:3874,207:3879,208:3880,209:3881,212:3884,215:[1,3889],216:[1,3890],217:[1,3895],218:[1,3896],219:[1,3897],220:[1,3898],221:[1,3891],222:[1,3892],223:[1,3893],224:[1,3894],225:3878,226:$Vx9},o($Vw2,$V_4),{19:$Vn,21:$Vo,22:3899,225:52,226:$Vp},{19:$Vy9,21:$Vz9,22:3901,96:[1,3912],104:[1,3913],105:[1,3914],106:3911,179:3902,202:3900,207:3905,208:3906,209:3907,212:3910,215:[1,3915],216:[1,3916],217:[1,3921],218:[1,3922],219:[1,3923],220:[1,3924],221:[1,3917],222:[1,3918],223:[1,3919],224:[1,3920],225:3904,226:$VA9},o($Vt1,$Ve3),o($Vt1,$Vf3),o($Vt1,$Vg3),o($Vt1,$Vh3),o($Vt1,$Vi3),{107:[1,3925]},o($Vt1,$Vn3),o($Vy2,$V_4),{19:$Vn,21:$Vo,22:3926,225:52,226:$Vp},{19:$VB9,21:$VC9,22:3928,96:[1,3939],104:[1,3940],105:[1,3941],106:3938,179:3929,202:3927,207:3932,208:3933,209:3934,212:3937,215:[1,3942],216:[1,3943],217:[1,3948],218:[1,3949],219:[1,3950],220:[1,3951],221:[1,3944],222:[1,3945],223:[1,3946],224:[1,3947],225:3931,226:$VD9},o($Vp1,$V95),o($VH1,$VU5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Vm1,$VB6),o($Vm1,$VE1),o($Vo1,$VB6),o($Vo1,$VE1),o($Vp1,$VB6),o($Vp1,$VE1),o($Vm1,$VB6),o($Vm1,$VE1),o($Vo1,$VB6),o($Vo1,$VE1),o($Vp1,$VB6),o($Vp1,$VE1),o($VF3,$VX3),{117:[1,3952]},o($VF3,$VP3),o($VS4,$VY3),o($VT4,$V_4),{19:$Vn,21:$Vo,22:3953,225:52,226:$Vp},{19:$VE9,21:$VF9,22:3955,96:[1,3966],104:[1,3967],105:[1,3968],106:3965,179:3956,202:3954,207:3959,208:3960,209:3961,212:3964,215:[1,3969],216:[1,3970],217:[1,3975],218:[1,3976],219:[1,3977],220:[1,3978],221:[1,3971],222:[1,3972],223:[1,3973],224:[1,3974],225:3958,226:$VG9},o($VU4,$V_4),{19:$Vn,21:$Vo,22:3979,225:52,226:$Vp},{19:$VH9,21:$VI9,22:3981,96:[1,3992],104:[1,3993],105:[1,3994],106:3991,179:3982,202:3980,207:3985,208:3986,209:3987,212:3990,215:[1,3995],216:[1,3996],217:[1,4001],218:[1,4002],219:[1,4003],220:[1,4004],221:[1,3997],222:[1,3998],223:[1,3999],224:[1,4000],225:3984,226:$VJ9},o($VL3,$Ve3),o($VL3,$Vf3),o($VL3,$Vg3),o($VL3,$Vh3),o($VL3,$Vi3),{107:[1,4005]},o($VL3,$Vn3),o($VW4,$V_4),{19:$Vn,21:$Vo,22:4006,225:52,226:$Vp},{19:$VK9,21:$VL9,22:4008,96:[1,4019],104:[1,4020],105:[1,4021],106:4018,179:4009,202:4007,207:4012,208:4013,209:4014,212:4017,215:[1,4022],216:[1,4023],217:[1,4028],218:[1,4029],219:[1,4030],220:[1,4031],221:[1,4024],222:[1,4025],223:[1,4026],224:[1,4027],225:4011,226:$VM9},o($VJ3,$V95),o($VM3,$VU5),o($VM3,$VE1),o($VM3,$Vq),o($VM3,$Vr),o($VM3,$Vt),o($VM3,$Vu),o($VH3,$VB6),o($VH3,$VE1),o($VI3,$VB6),o($VI3,$VE1),o($VJ3,$VB6),o($VJ3,$VE1),o($VH3,$VB6),o($VH3,$VE1),o($VI3,$VB6),o($VI3,$VE1),o($VJ3,$VB6),o($VJ3,$VE1),{204:[1,4034],205:4032,206:[1,4033]},o($V17,$V36),o($V17,$V46),o($V17,$V56),o($V17,$Vq),o($V17,$Vr),o($V17,$Vw4),o($V17,$Vx4),o($V17,$Vy4),o($V17,$Vt),o($V17,$Vu),o($V17,$Vz4),o($V17,$VA4,{213:4035,214:4036,107:[1,4037]}),o($V17,$VB4),o($V17,$VC4),o($V17,$VD4),o($V17,$VE4),o($V17,$VF4),o($V17,$VG4),o($V17,$VH4),o($V17,$VI4),o($V17,$VJ4),o($VN9,$Vj3),o($VN9,$Vk3),o($VN9,$Vl3),o($VN9,$Vm3),o($Vb7,$VH8),o($Vx,$Vg,{55:4038,36:4039,39:$Vy}),o($Vb7,$VI8),o($Vb7,$VJ8),o($Vb7,$VV7),o($Vb7,$VW7),{115:[1,4040],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vb7,$V11),o($Vb7,$V21),{19:[1,4044],21:[1,4048],22:4042,32:4041,211:4043,225:4045,226:[1,4047],227:[1,4046]},o($Vb7,$VK8),o($Vb7,$VL8),o($VM8,$Vr1,{89:4049}),o($Vb7,$Vs1,{95:3740,91:4050,97:$Vp9,98:$VL,99:$VM,100:$VN}),o($VM8,$VA1),o($VM8,$VB1),o($VM8,$VC1),o($VM8,$VD1),{96:[1,4051]},o($VM8,$VJ1),{66:[1,4052]},o($VS7,$Vz2,{95:3418,91:4053,97:$V29,98:$VL,99:$VM,100:$VN}),o($VR7,$VA2),o($Vb7,$VB2,{86:4054,91:4055,87:4056,95:4057,101:4059,103:4060,97:$VO9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb7,$VD2,{86:4054,91:4055,87:4056,95:4057,101:4059,103:4060,97:$VO9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb7,$VE2,{86:4054,91:4055,87:4056,95:4057,101:4059,103:4060,97:$VO9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VX7,$VF2),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,4061],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4062,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VU7,$VT1),o($VU7,$Vl),o($VU7,$Vm),o($VU7,$Vq),o($VU7,$Vr),o($VU7,$Vs),o($VU7,$Vt),o($VU7,$Vu),o($VR7,$Ve3),o($VX7,$Vf3),o($VX7,$Vg3),o($VX7,$Vh3),o($VX7,$Vi3),{107:[1,4063]},o($VX7,$Vn3),o($Vb7,$VI8),o($Vb7,$VJ8),o($Vb7,$VV7),o($Vb7,$VW7),{115:[1,4064],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vb7,$V11),o($Vb7,$V21),{19:[1,4068],21:[1,4072],22:4066,32:4065,211:4067,225:4069,226:[1,4071],227:[1,4070]},o($Vb7,$VK8),o($Vb7,$VL8),o($VM8,$Vr1,{89:4073}),o($Vb7,$Vs1,{95:3782,91:4074,97:$Vq9,98:$VL,99:$VM,100:$VN}),o($VM8,$VA1),o($VM8,$VB1),o($VM8,$VC1),o($VM8,$VD1),{96:[1,4075]},o($VM8,$VJ1),{66:[1,4076]},o($VS7,$Vz2,{95:3451,91:4077,97:$V49,98:$VL,99:$VM,100:$VN}),o($VR7,$VA2),o($Vb7,$VB2,{86:4078,91:4079,87:4080,95:4081,101:4083,103:4084,97:$VP9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb7,$VD2,{86:4078,91:4079,87:4080,95:4081,101:4083,103:4084,97:$VP9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb7,$VE2,{86:4078,91:4079,87:4080,95:4081,101:4083,103:4084,97:$VP9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VX7,$VF2),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,4085],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4086,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VU7,$VT1),o($VU7,$Vl),o($VU7,$Vm),o($VU7,$Vq),o($VU7,$Vr),o($VU7,$Vs),o($VU7,$Vt),o($VU7,$Vu),o($VR7,$Ve3),o($VX7,$Vf3),o($VX7,$Vg3),o($VX7,$Vh3),o($VX7,$Vi3),{107:[1,4087]},o($VX7,$Vn3),o($Vb7,$V95),{19:[1,4090],21:[1,4093],22:4089,83:4088,225:4091,226:[1,4092]},o($Vk6,$V09),o($VO8,$VQ3),o($Vk6,$VR3,{31:4094,204:[1,4095]}),{19:$VS3,21:$VT3,22:632,125:4096,210:$VU3,225:635,226:$VV3},o($VU8,$V19),o($VV8,$Vc7,{56:4097}),o($VC,$VD,{59:4098,69:4099,71:4100,72:4101,88:4104,90:4105,83:4107,84:4108,85:4109,74:4110,40:4111,91:4115,22:4116,87:4118,114:4119,95:4123,225:4126,101:4127,103:4128,19:[1,4125],21:[1,4130],65:[1,4102],67:[1,4103],75:[1,4120],76:[1,4121],77:[1,4122],81:[1,4106],92:[1,4112],93:[1,4113],94:[1,4114],97:$VQ9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,4117],226:[1,4129]}),o($VV8,$V39),o($VC,$VD,{59:4131,69:4132,71:4133,72:4134,88:4137,90:4138,83:4140,84:4141,85:4142,74:4143,40:4144,91:4148,22:4149,87:4151,114:4152,95:4156,225:4159,101:4160,103:4161,19:[1,4158],21:[1,4163],65:[1,4135],67:[1,4136],75:[1,4153],76:[1,4154],77:[1,4155],81:[1,4139],92:[1,4145],93:[1,4146],94:[1,4147],97:$VR9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,4150],226:[1,4162]}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4164,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VV8,$VT1),o($VV8,$Vl),o($VV8,$Vm),o($VV8,$Vq),o($VV8,$Vr),o($VV8,$Vs),o($VV8,$Vt),o($VV8,$Vu),o($VV8,$Vz2,{95:3496,91:4165,97:$V79,98:$VL,99:$VM,100:$VN}),o($Vt9,$VA2),o($Vt9,$Ve3),o($VV8,$V59),o($V89,$VY3),o($Va9,$VZ3),o($Va9,$V_3),o($Va9,$V$3),{96:[1,4166]},o($Va9,$VJ1),{96:[1,4168],102:4167,104:[1,4169],105:[1,4170],106:4171,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4172]},o($Va9,$Vt4),{117:[1,4173]},{19:[1,4176],21:[1,4179],22:4175,83:4174,225:4177,226:[1,4178]},o($Vk6,$V69),o($Vk6,$V_7),o($Vk6,$V$7),{19:$Vt6,21:$Vu6,22:1577,146:4180,211:1578,225:1580,226:$Vv6,227:$Vw6},{19:$Vt6,21:$Vu6,22:1577,146:4181,211:1578,225:1580,226:$Vv6,227:$Vw6},o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$VS5),o($Vm1,$VT5),{19:$Vd9,21:$Ve9,22:4183,83:4182,225:3544,226:$Vf9},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$VS5),o($Vo1,$VT5),{19:$Vg9,21:$Vh9,22:4185,83:4184,225:3570,226:$Vi9},o($Vt1,$VU5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$VS5),o($Vp1,$VT5),{19:$Vj9,21:$Vk9,22:4187,83:4186,225:3597,226:$Vl9},o($Vo1,$V95),{204:[1,4190],205:4188,206:[1,4189]},o($Vm1,$V36),o($Vm1,$V46),o($Vm1,$V56),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vw4),o($Vm1,$Vx4),o($Vm1,$Vy4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vz4),o($Vm1,$VA4,{213:4191,214:4192,107:[1,4193]}),o($Vm1,$VB4),o($Vm1,$VC4),o($Vm1,$VD4),o($Vm1,$VE4),o($Vm1,$VF4),o($Vm1,$VG4),o($Vm1,$VH4),o($Vm1,$VI4),o($Vm1,$VJ4),o($V66,$Vj3),o($V66,$Vk3),o($V66,$Vl3),o($V66,$Vm3),{204:[1,4196],205:4194,206:[1,4195]},o($Vo1,$V36),o($Vo1,$V46),o($Vo1,$V56),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vw4),o($Vo1,$Vx4),o($Vo1,$Vy4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vz4),o($Vo1,$VA4,{213:4197,214:4198,107:[1,4199]}),o($Vo1,$VB4),o($Vo1,$VC4),o($Vo1,$VD4),o($Vo1,$VE4),o($Vo1,$VF4),o($Vo1,$VG4),o($Vo1,$VH4),o($Vo1,$VI4),o($Vo1,$VJ4),o($V76,$Vj3),o($V76,$Vk3),o($V76,$Vl3),o($V76,$Vm3),{19:[1,4202],21:[1,4205],22:4201,83:4200,225:4203,226:[1,4204]},{204:[1,4208],205:4206,206:[1,4207]},o($Vp1,$V36),o($Vp1,$V46),o($Vp1,$V56),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vw4),o($Vp1,$Vx4),o($Vp1,$Vy4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vz4),o($Vp1,$VA4,{213:4209,214:4210,107:[1,4211]}),o($Vp1,$VB4),o($Vp1,$VC4),o($Vp1,$VD4),o($Vp1,$VE4),o($Vp1,$VF4),o($Vp1,$VG4),o($Vp1,$VH4),o($Vp1,$VI4),o($Vp1,$VJ4),o($V86,$Vj3),o($V86,$Vk3),o($V86,$Vl3),o($V86,$Vm3),o($VI3,$V95),{204:[1,4214],205:4212,206:[1,4213]},o($VH3,$V36),o($VH3,$V46),o($VH3,$V56),o($VH3,$Vq),o($VH3,$Vr),o($VH3,$Vw4),o($VH3,$Vx4),o($VH3,$Vy4),o($VH3,$Vt),o($VH3,$Vu),o($VH3,$Vz4),o($VH3,$VA4,{213:4215,214:4216,107:[1,4217]}),o($VH3,$VB4),o($VH3,$VC4),o($VH3,$VD4),o($VH3,$VE4),o($VH3,$VF4),o($VH3,$VG4),o($VH3,$VH4),o($VH3,$VI4),o($VH3,$VJ4),o($VA7,$Vj3),o($VA7,$Vk3),o($VA7,$Vl3),o($VA7,$Vm3),{204:[1,4220],205:4218,206:[1,4219]},o($VI3,$V36),o($VI3,$V46),o($VI3,$V56),o($VI3,$Vq),o($VI3,$Vr),o($VI3,$Vw4),o($VI3,$Vx4),o($VI3,$Vy4),o($VI3,$Vt),o($VI3,$Vu),o($VI3,$Vz4),o($VI3,$VA4,{213:4221,214:4222,107:[1,4223]}),o($VI3,$VB4),o($VI3,$VC4),o($VI3,$VD4),o($VI3,$VE4),o($VI3,$VF4),o($VI3,$VG4),o($VI3,$VH4),o($VI3,$VI4),o($VI3,$VJ4),o($VB7,$Vj3),o($VB7,$Vk3),o($VB7,$Vl3),o($VB7,$Vm3),{19:[1,4226],21:[1,4229],22:4225,83:4224,225:4227,226:[1,4228]},{204:[1,4232],205:4230,206:[1,4231]},o($VJ3,$V36),o($VJ3,$V46),o($VJ3,$V56),o($VJ3,$Vq),o($VJ3,$Vr),o($VJ3,$Vw4),o($VJ3,$Vx4),o($VJ3,$Vy4),o($VJ3,$Vt),o($VJ3,$Vu),o($VJ3,$Vz4),o($VJ3,$VA4,{213:4233,214:4234,107:[1,4235]}),o($VJ3,$VB4),o($VJ3,$VC4),o($VJ3,$VD4),o($VJ3,$VE4),o($VJ3,$VF4),o($VJ3,$VG4),o($VJ3,$VH4),o($VJ3,$VI4),o($VJ3,$VJ4),o($VC7,$Vj3),o($VC7,$Vk3),o($VC7,$Vl3),o($VC7,$Vm3),o($VE8,$VU1),o($VE8,$VV1),o($VE8,$VW1),o($V17,$VS5),o($V17,$VT5),{19:$Vm9,21:$Vn9,22:4237,83:4236,225:3701,226:$Vo9},o($Vb7,$V39),o($VC,$VD,{59:4238,69:4239,71:4240,72:4241,88:4244,90:4245,83:4247,84:4248,85:4249,74:4250,40:4251,91:4255,22:4256,87:4258,114:4259,95:4263,225:4266,101:4267,103:4268,19:[1,4265],21:[1,4270],65:[1,4242],67:[1,4243],75:[1,4260],76:[1,4261],77:[1,4262],81:[1,4246],92:[1,4252],93:[1,4253],94:[1,4254],97:$VS9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,4257],226:[1,4269]}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4271,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vb7,$VT1),o($Vb7,$Vl),o($Vb7,$Vm),o($Vb7,$Vq),o($Vb7,$Vr),o($Vb7,$Vs),o($Vb7,$Vt),o($Vb7,$Vu),o($Vb7,$Vz2,{95:3740,91:4272,97:$Vp9,98:$VL,99:$VM,100:$VN}),o($VM8,$VA2),o($VM8,$Ve3),o($Vb7,$V59),o($VR7,$VY3),o($VT7,$VZ3),o($VT7,$V_3),o($VT7,$V$3),{96:[1,4273]},o($VT7,$VJ1),{96:[1,4275],102:4274,104:[1,4276],105:[1,4277],106:4278,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4279]},o($VT7,$Vt4),{117:[1,4280]},{19:[1,4283],21:[1,4286],22:4282,83:4281,225:4284,226:[1,4285]},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4287,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vb7,$VT1),o($Vb7,$Vl),o($Vb7,$Vm),o($Vb7,$Vq),o($Vb7,$Vr),o($Vb7,$Vs),o($Vb7,$Vt),o($Vb7,$Vu),o($Vb7,$Vz2,{95:3782,91:4288,97:$Vq9,98:$VL,99:$VM,100:$VN}),o($VM8,$VA2),o($VM8,$Ve3),o($Vb7,$V59),o($VR7,$VY3),o($VT7,$VZ3),o($VT7,$V_3),o($VT7,$V$3),{96:[1,4289]},o($VT7,$VJ1),{96:[1,4291],102:4290,104:[1,4292],105:[1,4293],106:4294,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4295]},o($VT7,$Vt4),{117:[1,4296]},{19:[1,4299],21:[1,4302],22:4298,83:4297,225:4300,226:[1,4301]},o($VT7,$VU5),o($VT7,$VE1),o($VT7,$Vq),o($VT7,$Vr),o($VT7,$Vt),o($VT7,$Vu),o($Vr9,$V_4),{19:$Vn,21:$Vo,22:4303,225:52,226:$Vp},{19:$VT9,21:$VU9,22:4305,96:[1,4316],104:[1,4317],105:[1,4318],106:4315,179:4306,202:4304,207:4309,208:4310,209:4311,212:4314,215:[1,4319],216:[1,4320],217:[1,4325],218:[1,4326],219:[1,4327],220:[1,4328],221:[1,4321],222:[1,4322],223:[1,4323],224:[1,4324],225:4308,226:$VV9},o($VU8,$VK7,{57:4329,49:[1,4330]}),o($VV8,$VL7),o($VV8,$VM7,{70:4331,72:4332,74:4333,40:4334,114:4335,75:[1,4336],76:[1,4337],77:[1,4338],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($VV8,$VN7),o($VV8,$VO7,{73:4339,69:4340,88:4341,90:4342,91:4346,95:4347,92:[1,4343],93:[1,4344],94:[1,4345],97:$VW9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4349,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VV8,$VQ7),o($V89,$Vr1,{89:4350}),o($V99,$Vs1,{95:4123,91:4351,97:$VQ9,98:$VL,99:$VM,100:$VN}),o($Va9,$Vu1,{82:4352}),o($Va9,$Vu1,{82:4353}),o($Va9,$Vu1,{82:4354}),o($VV8,$Vv1,{101:4127,103:4128,87:4355,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb9,$VV7),o($Vb9,$VW7),o($V89,$VA1),o($V89,$VB1),o($V89,$VC1),o($V89,$VD1),o($Va9,$VE1),o($VF1,$VG1,{160:4356}),o($Vc9,$VI1),{115:[1,4357],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vb9,$V11),o($Vb9,$V21),{19:[1,4361],21:[1,4365],22:4359,32:4358,211:4360,225:4362,226:[1,4364],227:[1,4363]},{96:[1,4366]},o($V89,$VJ1),o($Va9,$Vq),o($Va9,$Vr),{96:[1,4368],102:4367,104:[1,4369],105:[1,4370],106:4371,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4372]},o($Va9,$Vt),o($Va9,$Vu),o($VV8,$VL7),o($VV8,$VM7,{70:4373,72:4374,74:4375,40:4376,114:4377,75:[1,4378],76:[1,4379],77:[1,4380],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($VV8,$VN7),o($VV8,$VO7,{73:4381,69:4382,88:4383,90:4384,91:4388,95:4389,92:[1,4385],93:[1,4386],94:[1,4387],97:$VX9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4391,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VV8,$VQ7),o($V89,$Vr1,{89:4392}),o($V99,$Vs1,{95:4156,91:4393,97:$VR9,98:$VL,99:$VM,100:$VN}),o($Va9,$Vu1,{82:4394}),o($Va9,$Vu1,{82:4395}),o($Va9,$Vu1,{82:4396}),o($VV8,$Vv1,{101:4160,103:4161,87:4397,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb9,$VV7),o($Vb9,$VW7),o($V89,$VA1),o($V89,$VB1),o($V89,$VC1),o($V89,$VD1),o($Va9,$VE1),o($VF1,$VG1,{160:4398}),o($Vc9,$VI1),{115:[1,4399],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vb9,$V11),o($Vb9,$V21),{19:[1,4403],21:[1,4407],22:4401,32:4400,211:4402,225:4404,226:[1,4406],227:[1,4405]},{96:[1,4408]},o($V89,$VJ1),o($Va9,$Vq),o($Va9,$Vr),{96:[1,4410],102:4409,104:[1,4411],105:[1,4412],106:4413,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4414]},o($Va9,$Vt),o($Va9,$Vu),{117:[1,4415]},o($Vt9,$VY3),o($Va9,$Ve3),o($Va9,$Vf3),o($Va9,$Vg3),o($Va9,$Vh3),o($Va9,$Vi3),{107:[1,4416]},o($Va9,$Vn3),o($Vb9,$V95),o($Vc9,$VU5),o($Vc9,$VE1),o($Vc9,$Vq),o($Vc9,$Vr),o($Vc9,$Vt),o($Vc9,$Vu),{66:[1,4417]},{66:[1,4418]},o($Vm1,$VB6),o($Vm1,$VE1),o($Vo1,$VB6),o($Vo1,$VE1),o($Vp1,$VB6),o($Vp1,$VE1),o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$VS5),o($Vm1,$VT5),{19:$Vv9,21:$Vw9,22:4420,83:4419,225:3878,226:$Vx9},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$VS5),o($Vo1,$VT5),{19:$Vy9,21:$Vz9,22:4422,83:4421,225:3904,226:$VA9},o($Vt1,$VU5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$VS5),o($Vp1,$VT5),{19:$VB9,21:$VC9,22:4424,83:4423,225:3931,226:$VD9},o($VT4,$VU1),o($VT4,$VV1),o($VT4,$VW1),o($VH3,$VS5),o($VH3,$VT5),{19:$VE9,21:$VF9,22:4426,83:4425,225:3958,226:$VG9},o($VU4,$VU1),o($VU4,$VV1),o($VU4,$VW1),o($VI3,$VS5),o($VI3,$VT5),{19:$VH9,21:$VI9,22:4428,83:4427,225:3984,226:$VJ9},o($VL3,$VU5),o($VL3,$VE1),o($VL3,$Vq),o($VL3,$Vr),o($VL3,$Vt),o($VL3,$Vu),o($VW4,$VU1),o($VW4,$VV1),o($VW4,$VW1),o($VJ3,$VS5),o($VJ3,$VT5),{19:$VK9,21:$VL9,22:4430,83:4429,225:4011,226:$VM9},o($V17,$VB6),o($V17,$VE1),o($Vb7,$VL7),o($Vb7,$VM7,{70:4431,72:4432,74:4433,40:4434,114:4435,75:[1,4436],76:[1,4437],77:[1,4438],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($Vb7,$VN7),o($Vb7,$VO7,{73:4439,69:4440,88:4441,90:4442,91:4446,95:4447,92:[1,4443],93:[1,4444],94:[1,4445],97:$VY9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4449,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vb7,$VQ7),o($VR7,$Vr1,{89:4450}),o($VS7,$Vs1,{95:4263,91:4451,97:$VS9,98:$VL,99:$VM,100:$VN}),o($VT7,$Vu1,{82:4452}),o($VT7,$Vu1,{82:4453}),o($VT7,$Vu1,{82:4454}),o($Vb7,$Vv1,{101:4267,103:4268,87:4455,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VU7,$VV7),o($VU7,$VW7),o($VR7,$VA1),o($VR7,$VB1),o($VR7,$VC1),o($VR7,$VD1),o($VT7,$VE1),o($VF1,$VG1,{160:4456}),o($VX7,$VI1),{115:[1,4457],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VU7,$V11),o($VU7,$V21),{19:[1,4461],21:[1,4465],22:4459,32:4458,211:4460,225:4462,226:[1,4464],227:[1,4463]},{96:[1,4466]},o($VR7,$VJ1),o($VT7,$Vq),o($VT7,$Vr),{96:[1,4468],102:4467,104:[1,4469],105:[1,4470],106:4471,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4472]},o($VT7,$Vt),o($VT7,$Vu),{117:[1,4473]},o($VM8,$VY3),o($VT7,$Ve3),o($VT7,$Vf3),o($VT7,$Vg3),o($VT7,$Vh3),o($VT7,$Vi3),{107:[1,4474]},o($VT7,$Vn3),o($VU7,$V95),o($VX7,$VU5),o($VX7,$VE1),o($VX7,$Vq),o($VX7,$Vr),o($VX7,$Vt),o($VX7,$Vu),{117:[1,4475]},o($VM8,$VY3),o($VT7,$Ve3),o($VT7,$Vf3),o($VT7,$Vg3),o($VT7,$Vh3),o($VT7,$Vi3),{107:[1,4476]},o($VT7,$Vn3),o($VU7,$V95),o($VX7,$VU5),o($VX7,$VE1),o($VX7,$Vq),o($VX7,$Vr),o($VX7,$Vt),o($VX7,$Vu),{204:[1,4479],205:4477,206:[1,4478]},o($VO8,$V36),o($VO8,$V46),o($VO8,$V56),o($VO8,$Vq),o($VO8,$Vr),o($VO8,$Vw4),o($VO8,$Vx4),o($VO8,$Vy4),o($VO8,$Vt),o($VO8,$Vu),o($VO8,$Vz4),o($VO8,$VA4,{213:4480,214:4481,107:[1,4482]}),o($VO8,$VB4),o($VO8,$VC4),o($VO8,$VD4),o($VO8,$VE4),o($VO8,$VF4),o($VO8,$VG4),o($VO8,$VH4),o($VO8,$VI4),o($VO8,$VJ4),o($VZ9,$Vj3),o($VZ9,$Vk3),o($VZ9,$Vl3),o($VZ9,$Vm3),o($VV8,$VH8),o($Vx,$Vg,{55:4483,36:4484,39:$Vy}),o($VV8,$VI8),o($VV8,$VJ8),o($VV8,$VV7),o($VV8,$VW7),{115:[1,4485],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VV8,$V11),o($VV8,$V21),{19:[1,4489],21:[1,4493],22:4487,32:4486,211:4488,225:4490,226:[1,4492],227:[1,4491]},o($VV8,$VK8),o($VV8,$VL8),o($Vt9,$Vr1,{89:4494}),o($VV8,$Vs1,{95:4347,91:4495,97:$VW9,98:$VL,99:$VM,100:$VN}),o($Vt9,$VA1),o($Vt9,$VB1),o($Vt9,$VC1),o($Vt9,$VD1),{96:[1,4496]},o($Vt9,$VJ1),{66:[1,4497]},o($V99,$Vz2,{95:4123,91:4498,97:$VQ9,98:$VL,99:$VM,100:$VN}),o($V89,$VA2),o($VV8,$VB2,{86:4499,91:4500,87:4501,95:4502,101:4504,103:4505,97:$V_9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VV8,$VD2,{86:4499,91:4500,87:4501,95:4502,101:4504,103:4505,97:$V_9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VV8,$VE2,{86:4499,91:4500,87:4501,95:4502,101:4504,103:4505,97:$V_9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc9,$VF2),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,4506],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4507,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vb9,$VT1),o($Vb9,$Vl),o($Vb9,$Vm),o($Vb9,$Vq),o($Vb9,$Vr),o($Vb9,$Vs),o($Vb9,$Vt),o($Vb9,$Vu),o($V89,$Ve3),o($Vc9,$Vf3),o($Vc9,$Vg3),o($Vc9,$Vh3),o($Vc9,$Vi3),{107:[1,4508]},o($Vc9,$Vn3),o($VV8,$VI8),o($VV8,$VJ8),o($VV8,$VV7),o($VV8,$VW7),{115:[1,4509],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VV8,$V11),o($VV8,$V21),{19:[1,4513],21:[1,4517],22:4511,32:4510,211:4512,225:4514,226:[1,4516],227:[1,4515]},o($VV8,$VK8),o($VV8,$VL8),o($Vt9,$Vr1,{89:4518}),o($VV8,$Vs1,{95:4389,91:4519,97:$VX9,98:$VL,99:$VM,100:$VN}),o($Vt9,$VA1),o($Vt9,$VB1),o($Vt9,$VC1),o($Vt9,$VD1),{96:[1,4520]},o($Vt9,$VJ1),{66:[1,4521]},o($V99,$Vz2,{95:4156,91:4522,97:$VR9,98:$VL,99:$VM,100:$VN}),o($V89,$VA2),o($VV8,$VB2,{86:4523,91:4524,87:4525,95:4526,101:4528,103:4529,97:$V$9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VV8,$VD2,{86:4523,91:4524,87:4525,95:4526,101:4528,103:4529,97:$V$9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VV8,$VE2,{86:4523,91:4524,87:4525,95:4526,101:4528,103:4529,97:$V$9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc9,$VF2),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,4530],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4531,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vb9,$VT1),o($Vb9,$Vl),o($Vb9,$Vm),o($Vb9,$Vq),o($Vb9,$Vr),o($Vb9,$Vs),o($Vb9,$Vt),o($Vb9,$Vu),o($V89,$Ve3),o($Vc9,$Vf3),o($Vc9,$Vg3),o($Vc9,$Vh3),o($Vc9,$Vi3),{107:[1,4532]},o($Vc9,$Vn3),o($VV8,$V95),{19:[1,4535],21:[1,4538],22:4534,83:4533,225:4536,226:[1,4537]},o($Ve7,$V_7),o($Ve7,$V$7),o($Vm1,$VB6),o($Vm1,$VE1),o($Vo1,$VB6),o($Vo1,$VE1),o($Vp1,$VB6),o($Vp1,$VE1),o($VH3,$VB6),o($VH3,$VE1),o($VI3,$VB6),o($VI3,$VE1),o($VJ3,$VB6),o($VJ3,$VE1),o($Vb7,$VI8),o($Vb7,$VJ8),o($Vb7,$VV7),o($Vb7,$VW7),{115:[1,4539],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vb7,$V11),o($Vb7,$V21),{19:[1,4543],21:[1,4547],22:4541,32:4540,211:4542,225:4544,226:[1,4546],227:[1,4545]},o($Vb7,$VK8),o($Vb7,$VL8),o($VM8,$Vr1,{89:4548}),o($Vb7,$Vs1,{95:4447,91:4549,97:$VY9,98:$VL,99:$VM,100:$VN}),o($VM8,$VA1),o($VM8,$VB1),o($VM8,$VC1),o($VM8,$VD1),{96:[1,4550]},o($VM8,$VJ1),{66:[1,4551]},o($VS7,$Vz2,{95:4263,91:4552,97:$VS9,98:$VL,99:$VM,100:$VN}),o($VR7,$VA2),o($Vb7,$VB2,{86:4553,91:4554,87:4555,95:4556,101:4558,103:4559,97:$V0a,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb7,$VD2,{86:4553,91:4554,87:4555,95:4556,101:4558,103:4559,97:$V0a,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb7,$VE2,{86:4553,91:4554,87:4555,95:4556,101:4558,103:4559,97:$V0a,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VX7,$VF2),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,4560],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4561,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VU7,$VT1),o($VU7,$Vl),o($VU7,$Vm),o($VU7,$Vq),o($VU7,$Vr),o($VU7,$Vs),o($VU7,$Vt),o($VU7,$Vu),o($VR7,$Ve3),o($VX7,$Vf3),o($VX7,$Vg3),o($VX7,$Vh3),o($VX7,$Vi3),{107:[1,4562]},o($VX7,$Vn3),o($Vb7,$V95),{19:[1,4565],21:[1,4568],22:4564,83:4563,225:4566,226:[1,4567]},o($Vb7,$V95),{19:[1,4571],21:[1,4574],22:4570,83:4569,225:4572,226:[1,4573]},o($Vr9,$VU1),o($Vr9,$VV1),o($Vr9,$VW1),o($VO8,$VS5),o($VO8,$VT5),{19:$VT9,21:$VU9,22:4576,83:4575,225:4308,226:$VV9},o($VV8,$V39),o($VC,$VD,{59:4577,69:4578,71:4579,72:4580,88:4583,90:4584,83:4586,84:4587,85:4588,74:4589,40:4590,91:4594,22:4595,87:4597,114:4598,95:4602,225:4605,101:4606,103:4607,19:[1,4604],21:[1,4609],65:[1,4581],67:[1,4582],75:[1,4599],76:[1,4600],77:[1,4601],81:[1,4585],92:[1,4591],93:[1,4592],94:[1,4593],97:$V1a,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,159:[1,4596],226:[1,4608]}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4610,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VV8,$VT1),o($VV8,$Vl),o($VV8,$Vm),o($VV8,$Vq),o($VV8,$Vr),o($VV8,$Vs),o($VV8,$Vt),o($VV8,$Vu),o($VV8,$Vz2,{95:4347,91:4611,97:$VW9,98:$VL,99:$VM,100:$VN}),o($Vt9,$VA2),o($Vt9,$Ve3),o($VV8,$V59),o($V89,$VY3),o($Va9,$VZ3),o($Va9,$V_3),o($Va9,$V$3),{96:[1,4612]},o($Va9,$VJ1),{96:[1,4614],102:4613,104:[1,4615],105:[1,4616],106:4617,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4618]},o($Va9,$Vt4),{117:[1,4619]},{19:[1,4622],21:[1,4625],22:4621,83:4620,225:4623,226:[1,4624]},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4626,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VV8,$VT1),o($VV8,$Vl),o($VV8,$Vm),o($VV8,$Vq),o($VV8,$Vr),o($VV8,$Vs),o($VV8,$Vt),o($VV8,$Vu),o($VV8,$Vz2,{95:4389,91:4627,97:$VX9,98:$VL,99:$VM,100:$VN}),o($Vt9,$VA2),o($Vt9,$Ve3),o($VV8,$V59),o($V89,$VY3),o($Va9,$VZ3),o($Va9,$V_3),o($Va9,$V$3),{96:[1,4628]},o($Va9,$VJ1),{96:[1,4630],102:4629,104:[1,4631],105:[1,4632],106:4633,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4634]},o($Va9,$Vt4),{117:[1,4635]},{19:[1,4638],21:[1,4641],22:4637,83:4636,225:4639,226:[1,4640]},o($Va9,$VU5),o($Va9,$VE1),o($Va9,$Vq),o($Va9,$Vr),o($Va9,$Vt),o($Va9,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4642,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vb7,$VT1),o($Vb7,$Vl),o($Vb7,$Vm),o($Vb7,$Vq),o($Vb7,$Vr),o($Vb7,$Vs),o($Vb7,$Vt),o($Vb7,$Vu),o($Vb7,$Vz2,{95:4447,91:4643,97:$VY9,98:$VL,99:$VM,100:$VN}),o($VM8,$VA2),o($VM8,$Ve3),o($Vb7,$V59),o($VR7,$VY3),o($VT7,$VZ3),o($VT7,$V_3),o($VT7,$V$3),{96:[1,4644]},o($VT7,$VJ1),{96:[1,4646],102:4645,104:[1,4647],105:[1,4648],106:4649,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4650]},o($VT7,$Vt4),{117:[1,4651]},{19:[1,4654],21:[1,4657],22:4653,83:4652,225:4655,226:[1,4656]},o($VT7,$VU5),o($VT7,$VE1),o($VT7,$Vq),o($VT7,$Vr),o($VT7,$Vt),o($VT7,$Vu),o($VT7,$VU5),o($VT7,$VE1),o($VT7,$Vq),o($VT7,$Vr),o($VT7,$Vt),o($VT7,$Vu),o($VO8,$VB6),o($VO8,$VE1),o($VV8,$VL7),o($VV8,$VM7,{70:4658,72:4659,74:4660,40:4661,114:4662,75:[1,4663],76:[1,4664],77:[1,4665],115:$VD,121:$VD,123:$VD,200:$VD,230:$VD}),o($VV8,$VN7),o($VV8,$VO7,{73:4666,69:4667,88:4668,90:4669,91:4673,95:4674,92:[1,4670],93:[1,4671],94:[1,4672],97:$V2a,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4676,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VV8,$VQ7),o($V89,$Vr1,{89:4677}),o($V99,$Vs1,{95:4602,91:4678,97:$V1a,98:$VL,99:$VM,100:$VN}),o($Va9,$Vu1,{82:4679}),o($Va9,$Vu1,{82:4680}),o($Va9,$Vu1,{82:4681}),o($VV8,$Vv1,{101:4606,103:4607,87:4682,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vb9,$VV7),o($Vb9,$VW7),o($V89,$VA1),o($V89,$VB1),o($V89,$VC1),o($V89,$VD1),o($Va9,$VE1),o($VF1,$VG1,{160:4683}),o($Vc9,$VI1),{115:[1,4684],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($Vb9,$V11),o($Vb9,$V21),{19:[1,4688],21:[1,4692],22:4686,32:4685,211:4687,225:4689,226:[1,4691],227:[1,4690]},{96:[1,4693]},o($V89,$VJ1),o($Va9,$Vq),o($Va9,$Vr),{96:[1,4695],102:4694,104:[1,4696],105:[1,4697],106:4698,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4699]},o($Va9,$Vt),o($Va9,$Vu),{117:[1,4700]},o($Vt9,$VY3),o($Va9,$Ve3),o($Va9,$Vf3),o($Va9,$Vg3),o($Va9,$Vh3),o($Va9,$Vi3),{107:[1,4701]},o($Va9,$Vn3),o($Vb9,$V95),o($Vc9,$VU5),o($Vc9,$VE1),o($Vc9,$Vq),o($Vc9,$Vr),o($Vc9,$Vt),o($Vc9,$Vu),{117:[1,4702]},o($Vt9,$VY3),o($Va9,$Ve3),o($Va9,$Vf3),o($Va9,$Vg3),o($Va9,$Vh3),o($Va9,$Vi3),{107:[1,4703]},o($Va9,$Vn3),o($Vb9,$V95),o($Vc9,$VU5),o($Vc9,$VE1),o($Vc9,$Vq),o($Vc9,$Vr),o($Vc9,$Vt),o($Vc9,$Vu),{117:[1,4704]},o($VM8,$VY3),o($VT7,$Ve3),o($VT7,$Vf3),o($VT7,$Vg3),o($VT7,$Vh3),o($VT7,$Vi3),{107:[1,4705]},o($VT7,$Vn3),o($VU7,$V95),o($VX7,$VU5),o($VX7,$VE1),o($VX7,$Vq),o($VX7,$Vr),o($VX7,$Vt),o($VX7,$Vu),o($VV8,$VI8),o($VV8,$VJ8),o($VV8,$VV7),o($VV8,$VW7),{115:[1,4706],118:195,119:196,120:197,121:$Vw1,123:$Vx1,200:$Vy1,228:199,230:$Vz1},o($VV8,$V11),o($VV8,$V21),{19:[1,4710],21:[1,4714],22:4708,32:4707,211:4709,225:4711,226:[1,4713],227:[1,4712]},o($VV8,$VK8),o($VV8,$VL8),o($Vt9,$Vr1,{89:4715}),o($VV8,$Vs1,{95:4674,91:4716,97:$V2a,98:$VL,99:$VM,100:$VN}),o($Vt9,$VA1),o($Vt9,$VB1),o($Vt9,$VC1),o($Vt9,$VD1),{96:[1,4717]},o($Vt9,$VJ1),{66:[1,4718]},o($V99,$Vz2,{95:4602,91:4719,97:$V1a,98:$VL,99:$VM,100:$VN}),o($V89,$VA2),o($VV8,$VB2,{86:4720,91:4721,87:4722,95:4723,101:4725,103:4726,97:$V3a,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VV8,$VD2,{86:4720,91:4721,87:4722,95:4723,101:4725,103:4726,97:$V3a,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VV8,$VE2,{86:4720,91:4721,87:4722,95:4723,101:4725,103:4726,97:$V3a,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vc9,$VF2),{19:$VX2,21:$VY2,22:401,67:$VZ2,77:$V_2,96:$V$2,104:$V03,105:$V13,106:413,161:[1,4727],162:396,163:397,164:398,165:399,179:402,183:$V23,207:407,208:408,209:409,212:412,215:$V33,216:$V43,217:$V53,218:$V63,219:$V73,220:$V83,221:$V93,222:$Va3,223:$Vb3,224:$Vc3,225:406,226:$Vd3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4728,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($Vb9,$VT1),o($Vb9,$Vl),o($Vb9,$Vm),o($Vb9,$Vq),o($Vb9,$Vr),o($Vb9,$Vs),o($Vb9,$Vt),o($Vb9,$Vu),o($V89,$Ve3),o($Vc9,$Vf3),o($Vc9,$Vg3),o($Vc9,$Vh3),o($Vc9,$Vi3),{107:[1,4729]},o($Vc9,$Vn3),o($VV8,$V95),{19:[1,4732],21:[1,4735],22:4731,83:4730,225:4733,226:[1,4734]},o($VV8,$V95),{19:[1,4738],21:[1,4741],22:4737,83:4736,225:4739,226:[1,4740]},o($Vb7,$V95),{19:[1,4744],21:[1,4747],22:4743,83:4742,225:4745,226:[1,4746]},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,144:371,189:373,116:4748,117:$VI2,145:$VJ2,187:$VK2,198:$VL2,199:$VM2,200:$VN2}),o($VV8,$VT1),o($VV8,$Vl),o($VV8,$Vm),o($VV8,$Vq),o($VV8,$Vr),o($VV8,$Vs),o($VV8,$Vt),o($VV8,$Vu),o($VV8,$Vz2,{95:4674,91:4749,97:$V2a,98:$VL,99:$VM,100:$VN}),o($Vt9,$VA2),o($Vt9,$Ve3),o($VV8,$V59),o($V89,$VY3),o($Va9,$VZ3),o($Va9,$V_3),o($Va9,$V$3),{96:[1,4750]},o($Va9,$VJ1),{96:[1,4752],102:4751,104:[1,4753],105:[1,4754],106:4755,217:$VK1,218:$VL1,219:$VM1,220:$VN1},{96:[1,4756]},o($Va9,$Vt4),{117:[1,4757]},{19:[1,4760],21:[1,4763],22:4759,83:4758,225:4761,226:[1,4762]},o($Va9,$VU5),o($Va9,$VE1),o($Va9,$Vq),o($Va9,$Vr),o($Va9,$Vt),o($Va9,$Vu),o($Va9,$VU5),o($Va9,$VE1),o($Va9,$Vq),o($Va9,$Vr),o($Va9,$Vt),o($Va9,$Vu),o($VT7,$VU5),o($VT7,$VE1),o($VT7,$Vq),o($VT7,$Vr),o($VT7,$Vt),o($VT7,$Vu),{117:[1,4764]},o($Vt9,$VY3),o($Va9,$Ve3),o($Va9,$Vf3),o($Va9,$Vg3),o($Va9,$Vh3),o($Va9,$Vi3),{107:[1,4765]},o($Va9,$Vn3),o($Vb9,$V95),o($Vc9,$VU5),o($Vc9,$VE1),o($Vc9,$Vq),o($Vc9,$Vr),o($Vc9,$Vt),o($Vc9,$Vu),o($VV8,$V95),{19:[1,4768],21:[1,4771],22:4767,83:4766,225:4769,226:[1,4770]},o($Va9,$VU5),o($Va9,$VE1),o($Va9,$Vq),o($Va9,$Vr),o($Va9,$Vt),o($Va9,$Vu)],
defaultActions: {6:[2,11],30:[2,1],102:[2,115],103:[2,116],104:[2,117],111:[2,128],112:[2,129],210:[2,267],211:[2,268],212:[2,269],213:[2,270],333:[2,31],361:[2,138],362:[2,142],364:[2,144],574:[2,29],575:[2,33],612:[2,30],1131:[2,142],1133:[2,144],1577:[2,255],1578:[2,256],1579:[2,275],1580:[2,276],1581:[2,279],1582:[2,277],1583:[2,278]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: lexer.yylloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

  /*
    ShEx parser in the Jison parser generator format.
  */

  const UNBOUNDED = -1;

  const ShExUtil = __webpack_require__(4);

  // Common namespaces and entities
  const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      RDF_TYPE  = RDF + 'type',
      RDF_FIRST = RDF + 'first',
      RDF_REST  = RDF + 'rest',
      RDF_NIL   = RDF + 'nil',
      XSD = 'http://www.w3.org/2001/XMLSchema#',
      XSD_INTEGER  = XSD + 'integer',
      XSD_DECIMAL  = XSD + 'decimal',
      XSD_FLOAT   = XSD + 'float',
      XSD_DOUBLE   = XSD + 'double',
      XSD_BOOLEAN  = XSD + 'boolean',
      XSD_TRUE =  '"true"^^'  + XSD_BOOLEAN,
      XSD_FALSE = '"false"^^' + XSD_BOOLEAN,
      XSD_PATTERN        = XSD + 'pattern',
      XSD_MININCLUSIVE   = XSD + 'minInclusive',
      XSD_MINEXCLUSIVE   = XSD + 'minExclusive',
      XSD_MAXINCLUSIVE   = XSD + 'maxInclusive',
      XSD_MAXEXCLUSIVE   = XSD + 'maxExclusive',
      XSD_LENGTH         = XSD + 'length',
      XSD_MINLENGTH      = XSD + 'minLength',
      XSD_MAXLENGTH      = XSD + 'maxLength',
      XSD_TOTALDIGITS    = XSD + 'totalDigits',
      XSD_FRACTIONDIGITS = XSD + 'fractionDigits';

  const numericDatatypes = [
      XSD + "integer",
      XSD + "decimal",
      XSD + "float",
      XSD + "double",
      XSD + "string",
      XSD + "boolean",
      XSD + "dateTime",
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

  const absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
    schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

  const numericFacets = ["mininclusive", "minexclusive",
                       "maxinclusive", "maxexclusive"];

  // Returns a lowercase version of the given string
  function lowercase(string) {
    return string.toLowerCase();
  }

  // Appends the item to the array and returns the array
  function appendTo(array, item) {
    return array.push(item), array;
  }

  // Appends the items to the array and returns the array
  function appendAllTo(array, items) {
    return array.push.apply(array, items), array;
  }

  // Extends a base object with properties of other objects
  function extend(base) {
    if (!base) base = {};
    for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (let name in arg)
        base[name] = arg[name];
    return base;
  }

  // Creates an array that contains all items of the given arrays
  function unionAll() {
    let union = [];
    for (let i = 0, l = arguments.length; i < l; i++)
      union = union.concat.apply(union, arguments[i]);
    return union;
  }

  // N3.js:lib/N3Parser.js<0.4.5>:58 with
  //   s/this\./Parser./g
  // ### `_setBase` sets the base IRI to resolve relative IRIs.
  Parser._setBase = function (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (Parser._base = baseIRI) {
      Parser._basePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      Parser._baseRoot   = baseIRI[0];
      Parser._baseScheme = baseIRI[1];
    }
  }

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./Parser./g
  //   s/token/iri/
  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  function _resolveIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return Parser._base;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return Parser._base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return Parser._base.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? Parser._baseScheme : Parser._baseRoot) + _removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return _removeDotSegments(Parser._basePath + iri);
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
    let result = '', i = -1, pathStart = -1, next = '/', segmentStart = 0;

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

  // Creates an expression with the given type and attributes
  function expression(expr, attr) {
    const expression = { expression: expr };
    if (attr)
      for (let a in attr)
        expression[a] = attr[a];
    return expression;
  }

  // Creates a path with the given type and items
  function path(type, items) {
    return { type: 'path', pathType: type, items: items };
  }

  // Creates a literal with the given value and type
  function createLiteral(value, type) {
    return { value: value, type: type };
  }

  // Creates a new blank node identifier
  function blank() {
    return '_:b' + blankId++;
  };
  let blankId = 0;
  Parser._resetBlanks = function () { blankId = 0; }
  Parser.reset = function () {
    Parser._prefixes = Parser._imports = Parser._sourceMap = Parser.shapes = Parser.productions = Parser.start = Parser.startActs = null; // Reset state.
    Parser._base = Parser._baseIRI = Parser._baseIRIPath = Parser._baseIRIRoot = null;
  }
  let _fileName; // for debugging
  Parser._setFileName = function (fn) { _fileName = fn; }

  // Regular expression and replacement strings to escape strings
  const stringEscapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                                   't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
      semactEscapeReplacements = { '\\': '\\', '%': '%' },
      pnameEscapeReplacements = {
        '\\': '\\', "'": "'", '"': '"',
        'n': '\n', 'r': '\r', 't': '\t', 'f': '\f', 'b': '\b',
        '_': '_', '~': '~', '.': '.', '-': '-', '!': '!', '$': '$', '&': '&',
        '(': '(', ')': ')', '*': '*', '+': '+', ',': ',', ';': ';', '=': '=',
        '/': '/', '?': '?', '#': '#', '@': '@', '%': '%',
      };


  // Translates string escape codes in the string into their textual equivalent
  function unescapeString(string, trimLength) {
    string = string.substring(trimLength, string.length - trimLength);
    return { value: ShExUtil.unescapeText(string, stringEscapeReplacements) };
  }

  function unescapeLangString(string, trimLength) {
    const at = string.lastIndexOf("@");
    const lang = string.substr(at);
    string = string.substr(0, at);
    const u = unescapeString(string, trimLength);
    return extend(u, { language: lowercase(lang.substr(1)) });
  }

  // Translates regular expression escape codes in the string into their textual equivalent
  function unescapeRegexp (regexp) {
    const end = regexp.lastIndexOf("/");
    let s = regexp.substr(1, end-1);
    const regexpEscapeReplacements = {
      '.': "\\.", '\\': "\\\\", '?': "\\?", '*': "\\*", '+': "\\+",
      '{': "\\{", '}': "\\}", '(': "\\(", ')': "\\)", '|': "\\|",
      '^': "\\^", '$': "\\$", '[': "\\[", ']': "\\]", '/': "\\/",
      't': '\\t', 'n': '\\n', 'r': '\\r', '-': "\\-", '/': '/'
    };
    s = ShExUtil.unescapeText(s, regexpEscapeReplacements)
    const ret = {
      pattern: s
    };
    if (regexp.length > end+1)
      ret.flags = regexp.substr(end+1);
    return ret;
  }

  // Convenience function to return object with p1 key, value p2
  function keyValObject(key, val) {
    const ret = {};
    ret[key] = val;
    return ret;
  }

  // Return object with p1 key, p2 string value
  function unescapeSemanticAction(key, string) {
    string = string.substring(1, string.length - 2);
    return {
      type: "SemAct",
      name: key,
      code: ShExUtil.unescapeText(string, semactEscapeReplacements)
    };
  }

  function error (e, yy) {
    const hash = {
      text: yy.lexer.match,
      // token: this.terminals_[symbol] || symbol,
      line: yy.lexer.yylineno,
      loc: yy.lexer.yylloc,
      // expected: expected
      pos: yy.lexer.showPosition()
    }
    e.hash = hash;
    if (Parser.recoverable) {
      Parser.recoverable(e)
    } else {
      throw e;
      Parser.reset();
    }
  }

  // Expand declared prefix or throw Error
  function expandPrefix (prefix, yy) {
    if (!(prefix in Parser._prefixes))
      error(new Error('Parse error; unknown prefix "' + prefix + ':"'), yy);
    return Parser._prefixes[prefix];
  }

  // Add a shape to the map
  function addShape (label, shape, yy) {
    if (shape === EmptyShape)
      shape = { type: "Shape" };
    if (Parser.productions && label in Parser.productions)
      error(new Error("Structural error: "+label+" is a triple expression"), yy);
    if (!Parser.shapes)
      Parser.shapes = new Map();
    if (label in Parser.shapes) {
      if (Parser.options.duplicateShape === "replace")
        Parser.shapes[label] = shape;
      else if (Parser.options.duplicateShape !== "ignore")
        error(new Error("Parse error: "+label+" already defined"), yy);
    } else {
      shape.id = label;
      Parser.shapes[label] = shape;
    }
  }

  // Add a production to the map
  function addProduction (label, production, yy) {
    if (Parser.shapes && label in Parser.shapes)
      error(new Error("Structural error: "+label+" is a shape expression"), yy);
    if (!Parser.productions)
      Parser.productions = new Map();
    if (label in Parser.productions) {
      if (Parser.options.duplicateShape === "replace")
        Parser.productions[label] = production;
      else if (Parser.options.duplicateShape !== "ignore")
        error(new Error("Parse error: "+label+" already defined"), yy);
    } else
      Parser.productions[label] = production;
  }

  function addSourceMap (obj, yy) {
    if (!Parser._sourceMap)
      Parser._sourceMap = new Map();
    let list = Parser._sourceMap.get(obj)
    if (!list)
      Parser._sourceMap.set(obj, list = []);
    list.push(yy.lexer.yylloc);
    return obj;
  }

  // shapeJunction judiciously takes a shapeAtom and an optional list of con/disjuncts.
  // No created Shape{And,Or,Not} will have a `nested` shapeExpr.
  // Don't nonest arguments to shapeJunction.
  // shapeAtom emits `nested` so nonest every argument that can be a shapeAtom, i.e.
  //   shapeAtom, inlineShapeAtom, shapeAtomNoRef
  //   {,inline}shape{And,Or,Not}
  //   this does NOT include shapeOrRef or nodeConstraint.
  function shapeJunction (type, shapeAtom, juncts) {
    if (juncts.length === 0) {
      return nonest(shapeAtom);
    } else if (shapeAtom.type === type && !shapeAtom.nested) {
      nonest(shapeAtom).shapeExprs = nonest(shapeAtom).shapeExprs.concat(juncts);
      return shapeAtom;
    } else {
      return { type: type, shapeExprs: [nonest(shapeAtom)].concat(juncts) };
    }
  }

  // strip out .nested attribute
  function nonest (shapeAtom) {
    delete shapeAtom.nested;
    return shapeAtom;
  }

  const EmptyObject = {  };
  const EmptyShape = { type: "Shape" };
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function(match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex () {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin (condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState () {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules () {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState (n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState (condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/**/
break;
case 1:return 75;
break;
case 2:return 76;
break;
case 3: yy_.yytext = yy_.yytext.substr(1); return 183; 
break;
case 4:return 77;
break;
case 5:return 226;
break;
case 6:return 156;
break;
case 7:return 105;
break;
case 8:return 104;
break;
case 9:return 96;
break;
case 10:return 'ANON';
break;
case 11:return 19;
break;
case 12:return 21;
break;
case 13:return 210;
break;
case 14:return 97;
break;
case 15:return 227;
break;
case 16:return 206;
break;
case 17:return 222;
break;
case 18:return 224;
break;
case 19:return 221;
break;
case 20:return 223;
break;
case 21:return 218;
break;
case 22:return 220;
break;
case 23:return 217;
break;
case 24:return 219;
break;
case 25:return 18;
break;
case 26:return 20;
break;
case 27:return 23;
break;
case 28:return 26;
break;
case 29:return 35;
break;
case 30:return 'IT_VIRTUAL';
break;
case 31:return 121;
break;
case 32:return 123;
break;
case 33:return 81;
break;
case 34:return 93;
break;
case 35:return 92;
break;
case 36:return 94;
break;
case 37:return 49;
break;
case 38:return 47;
break;
case 39:return 39;
break;
case 40:return 108;
break;
case 41:return 109;
break;
case 42:return 110;
break;
case 43:return 111;
break;
case 44:return 98;
break;
case 45:return 99;
break;
case 46:return 100;
break;
case 47:return 112;
break;
case 48:return 113;
break;
case 49:return 187;
break;
case 50:return 193;
break;
case 51:return 199;
break;
case 52:return 198;
break;
case 53:return 195;
break;
case 54:return 27;
break;
case 55:return 197;
break;
case 56:return 196;
break;
case 57:return 201;
break;
case 58:return 115;
break;
case 59:return 117;
break;
case 60:return 200;
break;
case 61:return '||';
break;
case 62:return 131;
break;
case 63:return 136;
break;
case 64:return 65;
break;
case 65:return 66;
break;
case 66:return 159;
break;
case 67:return 161;
break;
case 68:return 145;
break;
case 69:return 158;
break;
case 70:return 107;
break;
case 71:return 157;
break;
case 72:return 67;
break;
case 73:return 176;
break;
case 74:return 137;
break;
case 75:return 153;
break;
case 76:return 154;
break;
case 77:return 155;
break;
case 78:return 177;
break;
case 79:return 204;
break;
case 80:return 215;
break;
case 81:return 216;
break;
case 82:return 7;
break;
case 83:return 'unexpected word "'+yy_.yytext+'"';
break;
case 84:return 'invalid character '+yy_.yytext;
break;
}
},
rules: [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Vv][Ii][Rr][Tt][Uu][Aa][Ll]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Uu][Nn][Ii][Qq][Uu][Ee]))/,/^(?:([Ff][Oo][Cc][Uu][Ss]))/,/^(?:([Dd][Aa][Tt][Aa][Tt][Yy][Pp][Ee]))/,/^(?:([Ll][Aa][Nn][Gg][Tt][Aa][Gg]))/,/^(?:<)/,/^(?:=)/,/^(?:>)/,/^(?:!=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (true) {
exports.parser = ShExJison;
exports.Parser = ShExJison.Parser;
exports.parse = function () { return ShExJison.parse.apply(ShExJison, arguments); };
exports.main = function commonjsMain (args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = __webpack_require__(2).readFileSync(__webpack_require__(1).normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if ( true && __webpack_require__.c[__webpack_require__.s] === module) {
  exports.main(process.argv.slice(1));
}
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0), __webpack_require__(9)(module)))

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var pathModule = __webpack_require__(1);
var isWindows = process.platform === 'win32';
var fs = __webpack_require__(2);

// JavaScript implementation of realpath, ported from node pre-v6

var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

function rethrow() {
  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
  // is fairly slow to generate.
  var callback;
  if (DEBUG) {
    var backtrace = new Error;
    callback = debugCallback;
  } else
    callback = missingCallback;

  return callback;

  function debugCallback(err) {
    if (err) {
      backtrace.message = err.message;
      err = backtrace;
      missingCallback(err);
    }
  }

  function missingCallback(err) {
    if (err) {
      if (process.throwDeprecation)
        throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
      else if (!process.noDeprecation) {
        var msg = 'fs: missing callback ' + (err.stack || err.message);
        if (process.traceDeprecation)
          console.trace(msg);
        else
          console.error(msg);
      }
    }
  }
}

function maybeCallback(cb) {
  return typeof cb === 'function' ? cb : rethrow();
}

var normalize = pathModule.normalize;

// Regexp that finds the next partion of a (partial) path
// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
if (isWindows) {
  var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
} else {
  var nextPartRe = /(.*?)(?:[\/]+|$)/g;
}

// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
if (isWindows) {
  var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
} else {
  var splitRootRe = /^[\/]*/;
}

exports.realpathSync = function realpathSync(p, cache) {
  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return cache[p];
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstatSync(base);
      knownHard[base] = true;
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  // NB: p.length changes.
  while (pos < p.length) {
    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      continue;
    }

    var resolvedLink;
    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // some known symbolic link.  no need to stat again.
      resolvedLink = cache[base];
    } else {
      var stat = fs.lstatSync(base);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache) cache[base] = base;
        continue;
      }

      // read the link if it wasn't read before
      // dev/ino always return 0 on windows, so skip the check.
      var linkTarget = null;
      if (!isWindows) {
        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          linkTarget = seenLinks[id];
        }
      }
      if (linkTarget === null) {
        fs.statSync(base);
        linkTarget = fs.readlinkSync(base);
      }
      resolvedLink = pathModule.resolve(previous, linkTarget);
      // track this, if given a cache.
      if (cache) cache[base] = resolvedLink;
      if (!isWindows) seenLinks[id] = linkTarget;
    }

    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }

  if (cache) cache[original] = p;

  return p;
};


exports.realpath = function realpath(p, cache, cb) {
  if (typeof cb !== 'function') {
    cb = maybeCallback(cache);
    cache = null;
  }

  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return process.nextTick(cb.bind(null, null, cache[p]));
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstat(base, function(err) {
        if (err) return cb(err);
        knownHard[base] = true;
        LOOP();
      });
    } else {
      process.nextTick(LOOP);
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  function LOOP() {
    // stop if scanned past end of path
    if (pos >= p.length) {
      if (cache) cache[original] = p;
      return cb(null, p);
    }

    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      return process.nextTick(LOOP);
    }

    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // known symbolic link.  no need to stat again.
      return gotResolvedLink(cache[base]);
    }

    return fs.lstat(base, gotStat);
  }

  function gotStat(err, stat) {
    if (err) return cb(err);

    // if not a symlink, skip to the next path part
    if (!stat.isSymbolicLink()) {
      knownHard[base] = true;
      if (cache) cache[base] = base;
      return process.nextTick(LOOP);
    }

    // stat & read the link if not read before
    // call gotTarget as soon as the link target is known
    // dev/ino always return 0 on windows, so skip the check.
    if (!isWindows) {
      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
      if (seenLinks.hasOwnProperty(id)) {
        return gotTarget(null, seenLinks[id], base);
      }
    }
    fs.stat(base, function(err) {
      if (err) return cb(err);

      fs.readlink(base, function(err, target) {
        if (!isWindows) seenLinks[id] = target;
        gotTarget(err, target);
      });
    });
  }

  function gotTarget(err, target, base) {
    if (err) return cb(err);

    var resolvedLink = pathModule.resolve(previous, target);
    if (cache) cache[base] = resolvedLink;
    gotResolvedLink(resolvedLink);
  }

  function gotResolvedLink(resolvedLink) {
    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var concatMap = __webpack_require__(30);
var balanced = __webpack_require__(31);

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function identity(e) {
  return e;
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length)
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}



/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}


/***/ }),
/* 32 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function eventListener() {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };
    var errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = function errorListener(err) {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}


/***/ }),
/* 34 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 37 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {module.exports = globSync
globSync.GlobSync = GlobSync

var fs = __webpack_require__(2)
var rp = __webpack_require__(14)
var minimatch = __webpack_require__(5)
var Minimatch = minimatch.Minimatch
var Glob = __webpack_require__(13).Glob
var util = __webpack_require__(6)
var path = __webpack_require__(1)
var assert = __webpack_require__(15)
var isAbsolute = __webpack_require__(7)
var common = __webpack_require__(16)
var alphasort = common.alphasort
var alphasorti = common.alphasorti
var setopts = common.setopts
var ownProp = common.ownProp
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

function globSync (pattern, options) {
  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  return new GlobSync(pattern, options).found
}

function GlobSync (pattern, options) {
  if (!pattern)
    throw new Error('must provide pattern')

  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  if (!(this instanceof GlobSync))
    return new GlobSync(pattern, options)

  setopts(this, pattern, options)

  if (this.noprocess)
    return this

  var n = this.minimatch.set.length
  this.matches = new Array(n)
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false)
  }
  this._finish()
}

GlobSync.prototype._finish = function () {
  assert(this instanceof GlobSync)
  if (this.realpath) {
    var self = this
    this.matches.forEach(function (matchset, index) {
      var set = self.matches[index] = Object.create(null)
      for (var p in matchset) {
        try {
          p = self._makeAbs(p)
          var real = rp.realpathSync(p, self.realpathCache)
          set[real] = true
        } catch (er) {
          if (er.syscall === 'stat')
            set[self._makeAbs(p)] = true
          else
            throw er
        }
      }
    })
  }
  common.finish(this)
}


GlobSync.prototype._process = function (pattern, index, inGlobStar) {
  assert(this instanceof GlobSync)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // See if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip processing
  if (childrenIgnored(this, read))
    return

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar)
}


GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
  var entries = this._readdir(abs, inGlobStar)

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix.slice(-1) !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix)
      newPattern = [prefix, e]
    else
      newPattern = [e]
    this._process(newPattern.concat(remain), index, inGlobStar)
  }
}


GlobSync.prototype._emitMatch = function (index, e) {
  if (isIgnored(this, e))
    return

  var abs = this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute) {
    e = abs
  }

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  if (this.stat)
    this._stat(e)
}


GlobSync.prototype._readdirInGlobStar = function (abs) {
  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false)

  var entries
  var lstat
  var stat
  try {
    lstat = fs.lstatSync(abs)
  } catch (er) {
    if (er.code === 'ENOENT') {
      // lstat failed, doesn't exist
      return null
    }
  }

  var isSym = lstat && lstat.isSymbolicLink()
  this.symlinks[abs] = isSym

  // If it's not a symlink or a dir, then it's definitely a regular file.
  // don't bother doing a readdir in that case.
  if (!isSym && lstat && !lstat.isDirectory())
    this.cache[abs] = 'FILE'
  else
    entries = this._readdir(abs, false)

  return entries
}

GlobSync.prototype._readdir = function (abs, inGlobStar) {
  var entries

  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return null

    if (Array.isArray(c))
      return c
  }

  try {
    return this._readdirEntries(abs, fs.readdirSync(abs))
  } catch (er) {
    this._readdirError(abs, er)
    return null
  }
}

GlobSync.prototype._readdirEntries = function (abs, entries) {
  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries

  // mark and cache dir-ness
  return entries
}

GlobSync.prototype._readdirError = function (f, er) {
  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        throw error
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict)
        throw er
      if (!this.silent)
        console.error('glob error', er)
      break
  }
}

GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {

  var entries = this._readdir(abs, inGlobStar)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false)

  var len = entries.length
  var isSym = this.symlinks[abs]

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true)
  }
}

GlobSync.prototype._processSimple = function (prefix, index) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var exists = this._stat(prefix)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
}

// Returns either 'DIR', 'FILE', or false
GlobSync.prototype._stat = function (f) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return false

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return c

    if (needDir && c === 'FILE')
      return false

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (!stat) {
    var lstat
    try {
      lstat = fs.lstatSync(abs)
    } catch (er) {
      if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
        this.statCache[abs] = false
        return false
      }
    }

    if (lstat && lstat.isSymbolicLink()) {
      try {
        stat = fs.statSync(abs)
      } catch (er) {
        stat = lstat
      }
    } else {
      stat = lstat
    }
  }

  this.statCache[abs] = stat

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'

  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return false

  return c
}

GlobSync.prototype._mark = function (p) {
  return common.mark(this, p)
}

GlobSync.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var wrappy = __webpack_require__(17)
var reqs = Object.create(null)
var once = __webpack_require__(18)

module.exports = wrappy(inflight)

function inflight (key, cb) {
  if (reqs[key]) {
    reqs[key].push(cb)
    return null
  } else {
    reqs[key] = [cb]
    return makeres(key)
  }
}

function makeres (key) {
  return once(function RES () {
    var cbs = reqs[key]
    var len = cbs.length
    var args = slice(arguments)

    // XXX It's somewhat ambiguous whether a new callback added in this
    // pass should be queued for later execution if something in the
    // list of callbacks throws, or if it should just be discarded.
    // However, it's such an edge case that it hardly matters, and either
    // choice is likely as surprising as the other.
    // As it happens, we do go ahead and schedule it for later execution.
    try {
      for (var i = 0; i < len; i++) {
        cbs[i].apply(null, args)
      }
    } finally {
      if (cbs.length > len) {
        // added more in the interim.
        // de-zalgo, just in case, but don't call again.
        cbs.splice(0, len)
        process.nextTick(function () {
          RES.apply(null, args)
        })
      } else {
        delete reqs[key]
      }
    }
  })
}

function slice (args) {
  var length = args.length
  var array = []

  for (var i = 0; i < length; i++) array[i] = args[i]
  return array
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(0)))

/***/ }),
/* 40 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 40;

/***/ })
/******/ ]);