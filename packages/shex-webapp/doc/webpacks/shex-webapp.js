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
 "Shape", "closed", "extra", "expression", "semActs",
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
      if (shape.type === 'Shape') {
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
        && label in index.shapeExprs
        && index.shapeExprs[label].type === 'Shape' // Don't nest e.g. valuesets for now. @@ needs an option
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
              acc[k] = '_:renamed' + idx
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
          oldToNew[oldName] = shapeExpr.id = newName
          shapeLabels[shapeLabels.indexOf(oldName)] = newName
          nestables[newName] = nestables[oldName]
          nestables[newName].was = oldName
          delete nestables[oldName]

          // @@ maybe update index when done? 
          index.shapeExprs[newName] = index.shapeExprs[oldName]
          delete index.shapeExprs[oldName]

          if (shapeReferences[oldName].length !== 1) { throw Error('assertion: ' + oldName + ' doesn\'t have one reference: [' + shapeReferences[oldName] + ']') }
          let ref = shapeReferences[oldName][0]
          if (ref.type === 'tc') {
            if (typeof ref.tc.valueExpr === 'string') { // ShapeRef
              ref.tc.valueExpr = newName
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
          const borged = index.shapeExprs[oldName]
          // In principle, the ShExJ shouldn't have a Decl if the above criteria are met,
          // but the ShExJ may be generated by something which emits Decls regardless.
          shapeReferences[oldName][0].tc.valueExpr = borged
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
          delete schema.shapes[delme].id
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
      let shapeExpr = schema.shapes[label]
      if (shapeExpr.type === 'Shape') {
        (shapeExpr.extends || []).forEach(
          superShape => shapeHierarchy.add(superShape.reference, label)
        )
      }
    })
    Object.keys(schema.shapes).forEach(label => {
      if (!(label in shapeHierarchy.parents))
        shapeHierarchy.parents[label] = []
    })

    let predicates = { } // IRI->{ uses: [shapeLabel], commonType: shapeExpr }
    Object.keys(schema.shapes).forEach(shapeLabel => {
      let shapeExpr = schema.shapes[shapeLabel]
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
            } else if (shapeHierarchy.parents[curType] && shapeHierarchy.parents[curType].indexOf(newType) !== -1) {
              predicates[tc.predicate].polymorphic = true; // already covered by current commonType
            } else {
              let idx = shapeHierarchy.parents[newType] ? shapeHierarchy.parents[newType].indexOf(curType) : -1
              if (idx === -1) {
                let intersection = shapeHierarchy.parents[curType]
                    ? shapeHierarchy.parents[curType].filter(
                      lab => -1 !== shapeHierarchy.parents[newType].indexOf(lab)
                    )
                    : []
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
            _walkShapeExpression(expr, negated ^ !!expr.negated);
          });
        } else if (shapeExpr.type === "ShapeNot") {
          _walkShapeExpression(shapeExpr.shapeExpr, negated ^ 1); // !!! test negation
        } else if (shapeExpr.type === "Shape") {
          _walkShape(shapeExpr, negated ^ !!shapeExpr.negated);
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
              _walkTripleExpression(nested, negated ^ !!nested.negated) // ?? negation allowed?
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
              _walkTripleConstraint(tripleExpr, negated ^ !!tripleExpr.negated);
            } else if (tripleExpr.type === "OneOf" || tripleExpr.type === "EachOf") {
              _exprGroup(tripleExpr.expressions);
            } else {
              throw Error("expected {TripleConstraint,OneOf,EachOf,Inclusion} in " + tripleExpr);
            }
          }
        }

        if (shape.expression)
          _walkTripleExpression(shape.expression, negated ^ !!shape.negated);
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
    } else if (val.type === "NodeConstraintTest") {
      return null;
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
        ["inverse", "negated"].forEach(a => {
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

  // function expect (l, r) { const ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
  const _ShExUtil = this;
  function visitMap (map, val) {
    const ret = {};
    Object.keys(map).forEach(function (item) {
      ret[item] = val(map[item]);
    });
    return ret;
  }
  const r = {
    runtimeError: function (e) {
      throw e;
    },

    visitSchema: function (schema) {
      const ret = { type: "Schema" };
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
      const _Visitor = this;
      return imports.map(function (imp) {
        return _Visitor.visitIRI(imp);
      });
    },

    visitStartActs: function (startActs) {
      const _Visitor = this;
      return startActs === undefined ?
        undefined :
        startActs.map(function (act) {
          return _Visitor.visitSemAct(act);
        });
    },
    visitSemActs: function (semActs) {
      const _Visitor = this;
      if (semActs === undefined)
        return undefined;
      const ret = []
      Object.keys(semActs).forEach(function (label) {
        ret.push(_Visitor.visitSemAct(semActs[label], label));
      });
      return ret;
    },
    visitSemAct: function (semAct, label) {
      const ret = { type: "SemAct" };
      _expect(semAct, "type", "SemAct");

      this._maybeSet(semAct, ret, "SemAct",
                     ["name", "code"]);
      return ret;
    },

    visitShapes: function (shapes) {
      const _Visitor = this;
      if (shapes === undefined)
        return undefined;
      return shapes.map(
        shapeExpr =>
          _Visitor.visitShapeExpr(shapeExpr)
      );
    },

    visitProductions999: function (productions) { // !! DELETE
      const _Visitor = this;
      if (productions === undefined)
        return undefined;
      const ret = {}
      Object.keys(productions).forEach(function (label) {
        ret[label] = _Visitor.visitExpression(productions[label], label);
      });
      return ret;
    },

    visitShapeExpr: function (expr, label) {
      if (isShapeRef(expr))
        return this.visitShapeRef(expr)
      const r =
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
      const _Visitor = this;
      const r = { type: expr.type };
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
      const r = { type: expr.type };
      if ("id" in expr)
        r.id = expr.id;
      r.shapeExpr = this.visitShapeExpr(expr.shapeExpr, label);
      return r;
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitShape: function (shape, label) {
      const ret = { type: "Shape" };
      _expect(shape, "type", "Shape");

      this._maybeSet(shape, ret, "Shape",
                     [ "id",
                       "closed",
                       "expression", "extra", "semActs", "annotations"]);
      return ret;
    },

    // ### `visitNodeConstraint` deep-copies the structure of a shape
    visitNodeConstraint: function (shape, label) {
      const ret = { type: "NodeConstraint" };
      _expect(shape, "type", "NodeConstraint");

      this._maybeSet(shape, ret, "NodeConstraint",
                     [ "id",
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
      const _Visitor = this;
      const r = Object.assign(
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
                            ["id", "inverse", "negated", "predicate", "valueExpr",
                             "min", "max", "annotations", "semActs"])
    },

    visitExpression: function (expr) {
      if (typeof expr === "string")
        return this.visitInclusion(expr);
      const r = expr.type === "TripleConstraint" ? this.visitTripleConstraint(expr) :
          expr.type === "OneOf" ? this.visitOneOf(expr) :
          expr.type === "EachOf" ? this.visitEachOf(expr) :
          null;
      if (r === null)
        throw Error("unexpected expression type: " + expr.type);
      else
        return r;
    },

    visitValues: function (values) {
      const _Visitor = this;
      return values.map(function (t) {
        return isTerm(t) || t.type === "Language" ?
          t :
          _Visitor.visitStemRange(t);
      });
    },

    visitStemRange: function (t) {
      const _Visitor = this; // console.log(Error(t.type).stack);
      // _expect(t, "type", "IriStemRange");
      if (!("type" in t))
        _Visitor.runtimeError(Error("expected "+JSON.stringify(t)+" to have a 'type' attribute."));
      const stemRangeTypes = ["IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
      if (stemRangeTypes.indexOf(t.type) === -1)
        _Visitor.runtimeError(Error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'."));
      let stem;
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
        const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
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

    _maybeSet: function (obj, ret, context, members, ignore) {
      const _Visitor = this;
      this._testUnknownAttributes(obj, ignore ? members.concat(ignore) : members, context, this._maybeSet)
      members.forEach(function (member) {
        const methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
        if (member in obj) {
          const f = _Visitor[methodName];
          if (typeof f !== "function") {
            throw Error(methodName + " not found in Visitor");
          }
          const t = f.call(_Visitor, obj[member]);
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
      const unknownMembers = Object.keys(obj).reduce(function (ret, k) {
        return k !== "type" && expected.indexOf(k) === -1 ? ret.concat(k) : ret;
      }, []);
      if (unknownMembers.length > 0) {
        const e = Error("unknown propert" + (unknownMembers.length > 1 ? "ies" : "y") + ": " +
                      unknownMembers.map(function (p) {
                        return "\"" + p + "\"";
                      }).join(",") +
                      " in " + context + ": " + JSON.stringify(obj));
        Error.captureStackTrace(e, captureFrame);
        throw e;
      }
    }

  };
  r.visitBase = r.visitStart = r.visitClosed = r["visit@context"] = r._visitValue;
  r.visitExtra = r.visitAnnotations = r._visitList;
  r.visitInverse = r.visitNegated = r.visitPredicate = r._visitValue;
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

      if (shape.expression) // t: 0
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
const UNBOUNDED = -1;

// interface constants
const Start = { term: "START" }
const InterfaceOptions = {
  "coverage": {
    "firstError": "fail on first error (usually used with eval-simple-1err)",
    "exhaustive": "find as many errors as possible (usually used with eval-threaded-nerr)"
  }
};

const VERBOSE = "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

const ProgramFlowError = { type: "ProgramFlowError", errors: { type: "UntrackedError" } };

const ShExTerm = __webpack_require__(3);
let ShExVisitor = __webpack_require__(10);

function getLexicalValue (term) {
  return ShExTerm.isIRI(term) ? term :
    ShExTerm.isLiteral(term) ? ShExTerm.getLiteralValue(term) :
    term.substr(2); // bnodes start with "_:"
}


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
function ShExValidator_constructor(schema, db, options) {
  if (!(this instanceof ShExValidator_constructor))
    return new ShExValidator_constructor(schema, db, options);
  let index = schema._index || ShExVisitor.index(schema)
  this.type = "ShExValidator";
  options = options || {};
  this.options = options;
  this.options.coverage = this.options.coverage || "exhaustive";
  if (!("noCache" in options && options.noCache))
    this.known = {};

  const _ShExValidator = this;
  this.schema = schema;
  this._expect = this.options.lax ? noop : expect; // report errors on missing types.
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function () {  }; // included in case we need it later.
  // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
  const regexModule = this.options.regexModule || __webpack_require__(25);

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
    const tripleConstraints = [];

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

      else
        runtimeError("unexpected expr type: " + expr.type);
    };
  };

  /* emptyTracker - a tracker that does nothing
   */
  this.emptyTracker = function () {
    const noop = x => x;
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
  this.validate = function (point, label, tracker, seen) {
    // default to schema's start shape
    if (typeof point === "object" && "termType" in point) {
      point = ShExTerm.internalTerm(point)
    }
    if (typeof point === "object") {
      const shapeMap = point;
      if (this.options.results === "api") {
        return shapeMap.map(pair => {
          let time = new Date();
          const res = this.validate(pair.node, pair.shape, label, tracker); // really tracker and seen
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
      const results = shapeMap.reduce((ret, pair) => {
        const res = this.validate(pair.node, pair.shape, label, tracker); // really tracker and seen
        return "errors" in res ?
          { passes: ret.passes, failures: ret.failures.concat(res) } :
          { passes: ret.passes.concat(res), failures: ret.failures } ;
      }, {passes: [], failures: []});
      if (false) { var _add; }
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

    const outside = tracker === undefined;
    // logging stuff
    if (!tracker)
      tracker = this.emptyTracker();
    if (!label || label === Start) {
      if (!schema.start)
        runtimeError("start production not defined");
    }

    let shape = null;
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
      return this._validateShapeExpr(point, shape, Start, tracker, seen);

    if (seen === undefined)
      seen = {};
    const seenKey = point + "@" + (label === Start ? "_: -start-" : label);
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
    const ret = this._validateShapeExpr(point, shape, label, tracker, seen);
    tracker.exit(point, label, ret);
    delete seen[seenKey];
    if ("known" in this)
      this.known[seenKey] = ret;
    if ("startActs" in schema && outside) {
      ret.startActs = schema.startActs;
    }
    return ret;
  }

  this._validateShapeExpr = function (point, shapeExpr, shapeLabel, tracker, seen) {
    if (point === "")
      throw Error("validation needs a valid focus node");
    if (typeof shapeExpr === "string") { // ShapeRef
      return this._validateShapeExpr(point, index.shapeExprs[shapeExpr], shapeExpr, tracker, seen);
    } else if (shapeExpr.type === "NodeConstraint") {
      const sub = this._errorsMatchingNodeConstraint(point, shapeExpr, null);
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
      return this._validateShape(point, shapeExpr, shapeLabel, tracker, seen);
    } else if (shapeExpr.type === "ShapeExternal") {
      return this.options.validateExtern(point, shapeLabel, tracker, seen);
    } else if (shapeExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, tracker, seen);
        if ("errors" in sub)
          errors.push(sub);
        else
          return { type: "ShapeOrResults", solution: sub };
      }
      return { type: "ShapeOrFailure", errors: errors };
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(point, shapeExpr.shapeExpr, shapeLabel, tracker, seen);
      if ("errors" in sub)
          return { type: "ShapeNotResults", solution: sub };
        else
          return { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes = [];
      const errors = [];
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(point, nested, shapeLabel, tracker, seen);
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

  this._validateShape = function (point, shape, shapeLabel, tracker, seen) {
    const _ShExValidator = this;
    const valParms = { db, shapeLabel, tracker, seen };

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
    const _ShExValidator = this;
    const misses = [];
    const hits = [];
    triples.forEach(function (triple) {
      const value = constraint.inverse ? triple.subject : triple.object;
      let sub;
      const oldBindings = JSON.parse(JSON.stringify(_ShExValidator.semActHandler.results));
      const errors = constraint.valueExpr === undefined ?
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
    const _ShExValidator = this;
    if (typeof valueExpr === "string") { // ShapeRef
      return _ShExValidator.validate(value, valueExpr, valParms.tracker, valParms.seen);
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return _ShExValidator._validateShapeExpr(value, valueExpr, valParms.shapeLabel, valParms.tracker, valParms.seen)
    } else if (valueExpr.type === "ShapeOr") {
      const errors = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = valueExpr.shapeExprs[i];
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms);
        if ("errors" in sub)
          errors.push(sub);
        else
          return { type: "ShapeOrResults", solution: sub };
      }
      return { type: "ShapeOrFailure", errors: errors };
    } else if (valueExpr.type === "ShapeAnd") {
      const passes = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = valueExpr.shapeExprs[i];
        const sub = _ShExValidator._errorsMatchingShapeExpr(value, nested, valParms);
        if ("errors" in sub)
          return { type: "ShapeAndFailure", errors: [sub] };
        else
          passes.push(sub);
      }
      return { type: "ShapeAndResults", solutions: passes };
    } else if (valueExpr.type === "ShapeNot") {
      const sub = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExpr, valParms);
      // return sub.errors && sub.errors.length ? {} : {
      //   errors: ["Error validating " + value + " as " + JSON.stringify(valueExpr) + ": expected NOT to pass"] };
      const ret = Object.assign({
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
    const errors = [];
    const label = ShExTerm.isLiteral(value) ? ShExTerm.getLiteralValue(value) :
      ShExTerm.isBlank(value) ? value.substring(2) :
      value;
    const dt = ShExTerm.isLiteral(value) ? ShExTerm.getLiteralType(value) : null;
    const numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

    function validationError () {
      const errorStr = Array.prototype.join.call(arguments, "");
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
          const ld = ldify(value);
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
              const stemRangeTypes = [
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
            validationError("value " + value + " not found in set " + JSON.stringify(valueExpr.values));
          }
        }
      }
    }

    if ("pattern" in valueExpr) {
      const regexp = "flags" in valueExpr ?
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
    const ret = {
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
      const _semActHanlder = this;
      return semActs.reduce(function (ret, semAct) {
        if (ret.length === 0 && semAct.name in _semActHanlder.handlers) {
          const code = "code" in semAct ? semAct.code : _ShExValidator.options.semActs[semAct.name];
          const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
          const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
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

    if (typeof expr === "string") { // Inclusion
      const included = schema._index.tripleExprs[expr].expression;
      return _compileExpression(included, schema);
    }

    else if (expr.type === "TripleConstraint") {
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

    else throw Error("unexpected expr type: " + expr.type);
  }

  return expression ? _compileExpression(expression, schema) : new Epsilon();
}

// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets, emptyValue) {
  const n = sets.length, carets = [];
  let args = null;

  function init() {
    args = [];
    for (let i = 0; i < n; i++) {
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
    let i = n - 1;
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
const N3jsTripleToString = function () {
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

/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
function sparqlOrder (l, r) {
  const [lprec, rprec] = [l, r].map(
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
  const errorStr = Array.prototype.join.call(arguments, "");
  const e = new Error(errorStr);
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
    const outerExpression = shape.expression;
    return {
      match:match
    };

    function match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, semActHandler, trace) {

      /*
       * returns: list of passing or failing threads (no heterogeneous lists)
       */
      function validateExpr (expr, thread) {
        if (typeof expr === "string") { // Inclusion
          const included = index.tripleExprs[expr];
          return validateExpr(included, thread);
        }

        const constraintNo = constraintList.indexOf(expr);
        let min = "min" in expr ? expr.min : 1;
        let max = "max" in expr ? expr.max === UNBOUNDED ? Infinity : expr.max : 1;

        function validateRept (type, val) {
          let repeated = 0, errOut = false;
          let newThreads = [thread];
          const minmax = {  };
          if ("min" in expr && expr.min !== 1 || "max" in expr && expr.max !== 1) {
            minmax.min = expr.min;
            minmax.max = expr.max;
          }
          if ("semActs" in expr)
            minmax.semActs = expr.semActs;
          if ("annotations" in expr)
            minmax.annotations = expr.annotations;
          for (; repeated < max && !errOut; ++repeated) {
            let inner = [];
            for (let t = 0; t < newThreads.length; ++t) {
              const newt = newThreads[t];
              const sub = val(newt);
              if (sub.length > 0 && sub[0].errors.length === 0) { // all subs pass or all fail
                sub.forEach(newThread => {
                  const solutions =
                      "expression" in newt ? newt.expression.solutions.slice() : [];
                  if ("solution" in newThread)
                    solutions.push(newThread.solution);
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
            const passes = [];
            const failures = [];
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
          const negated = "negated" in expr && expr.negated || max === 0;
          if (negated)
            min = max = Infinity;
          if (thread.avail[constraintNo] === undefined)
            thread.avail[constraintNo] = constraintToTripleMapping[constraintNo].map(pair => pair.tNo);
          const minmax = {  };
          if ("min" in expr && expr.min !== 1 || "max" in expr && expr.max !== 1) {
            minmax.min = expr.min;
            minmax.max = expr.max;
          }
          if ("semActs" in expr)
            minmax.semActs = expr.semActs;
          if ("annotations" in expr)
            minmax.annotations = expr.annotations;
          const taken = thread.avail[constraintNo].splice(0, min);
          const passed = negated ? taken.length === 0 : taken.length >= min;
          const ret = [];
          const matched = thread.matched;
          if (passed) {
            do {
              const passFail = taken.reduce((acc, tripleNo) => {
                const t = neighborhood[tripleNo]
                const tested = {
                  type: "TestedTriple",
                  subject: t.subject,
                  predicate: t.predicate,
                  object: ldify(t.object)
                }
                const hit = constraintToTripleMapping[constraintNo].find(x => x.tNo === tripleNo);
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
            let valueExpr = null;
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
            // const accept = null;
            const matched = [];
            const failed = [];
            expr.expressions.forEach(nested => {
              const thcopy = {
                avail: th.avail.map(a => { return a.slice(); }),
                errors: th.errors,
                matched: th.matched//.slice() ever needed??
              };
              const sub = validateExpr(nested, thcopy);
              if (sub[0].errors.length === 0) { // all subs pass or all fail
                [].push.apply(matched, sub);
                sub.forEach(newThread => {
                  const expressions =
                      "solution" in thcopy ? thcopy.solution.expressions : [];
                  if ("expression" in newThread) // undefined for no matches on min card:0
                    expressions.push(newThread.expression);
                  delete newThread.expression;
                  newThread.solution = {
                    type: "OneOfSolution",
                    expressions: expressions
                  };
                });
              } else
                [].push.apply(failed, sub);
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
                const sub = validateExpr(nested, exprThread);
                // Move newThread.expression into a hierarchical solution structure.
                sub.forEach(newThread => {
                  if (newThread.errors.length === 0) {
                    const expressions =
                        "solution" in exprThread ? exprThread.solution.expressions.slice() : [];
                    if ("expression" in newThread) // undefined for no matches on min card:0
                      expressions.push(newThread.expression);
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
      }

      const startingThread = {
        avail:[],   // triples remaining by constraint number
        matched:[], // triples matched in this thread
        errors:[]   // errors encounted
      };
      if (!outerExpression)
        return { }; // vapid match if no expression
      const ret = validateExpr(outerExpression, startingThread);
      // console.log(JSON.stringify(ret));
      // note: don't return if ret.length === 1 because it might fail the unmatchedTriples test.
      const longerChosen =
          ret.reduce((ret, elt) => {
            if (elt.errors.length > 0)
              return ret;              // early return
            const unmatchedTriples = {};
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
            if (x.type === "TestedTriple") // already done
              return x; // c.f. validation/3circularRef1_pass-open
            const t = neighborhood[x.tripleNo];
            const expr = constraintList[x.constraintNo];
            const ret = {
              type: "TestedTriple", subject: t.subject, predicate: t.predicate, object: ldify(t.object)
            };
            function diver (focus, shapeLabel, dive) {
              const sub = dive(focus, shapeLabel);
              if ("errors" in sub) {
                // console.dir(sub);
                const err = {
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
            const subErrors = "valueExpr" in expr ?
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
          const ret = { value: N3Util.getLiteralValue(term) };
          const dt = N3Util.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          const lang = N3Util.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }

function extend(base) {
  if (!base) base = {};
  for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (let name in arg)
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
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[7,18,19,20,21,23,26,189,211,212],$V1=[1,25],$V2=[1,29],$V3=[1,24],$V4=[1,28],$V5=[1,27],$V6=[2,12],$V7=[2,13],$V8=[2,14],$V9=[7,18,19,20,21,23,26,211,212],$Va=[1,35],$Vb=[1,38],$Vc=[1,37],$Vd=[2,18],$Ve=[2,19],$Vf=[19,21,65,67,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,157,211],$Vg=[2,57],$Vh=[1,47],$Vi=[1,48],$Vj=[1,49],$Vk=[19,21,35,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,157,211],$Vl=[2,236],$Vm=[2,237],$Vn=[1,51],$Vo=[1,54],$Vp=[1,53],$Vq=[2,258],$Vr=[2,259],$Vs=[2,262],$Vt=[2,260],$Vu=[2,261],$Vv=[2,15],$Vw=[2,17],$Vx=[19,21,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,157,211],$Vy=[1,72],$Vz=[2,26],$VA=[2,27],$VB=[2,28],$VC=[115,120,122],$VD=[2,134],$VE=[1,98],$VF=[1,106],$VG=[1,84],$VH=[1,89],$VI=[1,90],$VJ=[1,91],$VK=[1,97],$VL=[1,102],$VM=[1,103],$VN=[1,104],$VO=[1,107],$VP=[1,108],$VQ=[1,109],$VR=[1,110],$VS=[1,111],$VT=[1,112],$VU=[1,94],$VV=[1,105],$VW=[2,58],$VX=[1,114],$VY=[1,115],$VZ=[1,116],$V_=[1,122],$V$=[1,123],$V01=[47,49],$V11=[2,87],$V21=[2,88],$V31=[189,191],$V41=[1,138],$V51=[1,141],$V61=[1,140],$V71=[2,16],$V81=[7,18,19,20,21,23,26,47,211,212],$V91=[2,43],$Va1=[7,18,19,20,21,23,26,47,49,211,212],$Vb1=[2,50],$Vc1=[2,32],$Vd1=[2,65],$Ve1=[2,70],$Vf1=[2,67],$Vg1=[1,175],$Vh1=[1,176],$Vi1=[1,177],$Vj1=[1,180],$Vk1=[1,183],$Vl1=[2,73],$Vm1=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,186,189,211,212],$Vn1=[2,91],$Vo1=[7,18,19,20,21,23,26,47,49,186,189,211,212],$Vp1=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,186,189,211,212],$Vq1=[7,18,19,20,21,23,26,47,49,75,76,77,97,98,99,100,115,120,122,186,189,211,212],$Vr1=[2,104],$Vs1=[2,103],$Vt1=[7,18,19,20,21,23,26,47,49,97,98,99,100,108,109,110,111,112,113,186,189,211,212],$Vu1=[2,98],$Vv1=[2,97],$Vw1=[1,197],$Vx1=[1,198],$Vy1=[2,108],$Vz1=[2,109],$VA1=[2,110],$VB1=[2,106],$VC1=[2,235],$VD1=[19,21,67,77,96,104,105,159,181,200,201,202,203,204,205,206,207,208,209,211],$VE1=[2,181],$VF1=[7,18,19,20,21,23,26,47,49,108,109,110,111,112,113,186,189,211,212],$VG1=[2,100],$VH1=[2,114],$VI1=[1,206],$VJ1=[1,207],$VK1=[1,208],$VL1=[1,209],$VM1=[96,104,105,202,203,204,205],$VN1=[2,31],$VO1=[2,35],$VP1=[2,38],$VQ1=[2,41],$VR1=[2,89],$VS1=[2,227],$VT1=[2,228],$VU1=[2,229],$VV1=[1,257],$VW1=[1,262],$VX1=[1,243],$VY1=[1,248],$VZ1=[1,249],$V_1=[1,250],$V$1=[1,256],$V02=[1,253],$V12=[1,261],$V22=[1,264],$V32=[1,265],$V42=[1,266],$V52=[1,272],$V62=[1,273],$V72=[2,20],$V82=[2,49],$V92=[2,56],$Va2=[2,61],$Vb2=[2,64],$Vc2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,211,212],$Vd2=[2,83],$Ve2=[2,84],$Vf2=[2,29],$Vg2=[2,33],$Vh2=[2,69],$Vi2=[2,66],$Vj2=[2,71],$Vk2=[2,68],$Vl2=[7,18,19,20,21,23,26,47,49,97,98,99,100,186,189,211,212],$Vm2=[1,318],$Vn2=[1,326],$Vo2=[1,327],$Vp2=[1,328],$Vq2=[1,334],$Vr2=[1,335],$Vs2=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,189,211,212],$Vt2=[2,225],$Vu2=[7,18,19,20,21,23,26,47,49,189,211,212],$Vv2=[1,343],$Vw2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,189,211,212],$Vx2=[2,102],$Vy2=[2,107],$Vz2=[2,94],$VA2=[1,353],$VB2=[2,95],$VC2=[2,96],$VD2=[2,101],$VE2=[19,21,65,155,156,195,211],$VF2=[2,162],$VG2=[2,136],$VH2=[1,368],$VI2=[1,367],$VJ2=[1,373],$VK2=[1,376],$VL2=[1,372],$VM2=[1,375],$VN2=[1,387],$VO2=[1,393],$VP2=[1,382],$VQ2=[1,386],$VR2=[1,396],$VS2=[1,397],$VT2=[1,398],$VU2=[1,385],$VV2=[1,399],$VW2=[1,400],$VX2=[1,405],$VY2=[1,406],$VZ2=[1,407],$V_2=[1,408],$V$2=[1,401],$V03=[1,402],$V13=[1,403],$V23=[1,404],$V33=[1,392],$V43=[2,113],$V53=[2,118],$V63=[2,120],$V73=[2,121],$V83=[2,122],$V93=[2,250],$Va3=[2,251],$Vb3=[2,252],$Vc3=[2,253],$Vd3=[2,119],$Ve3=[2,30],$Vf3=[2,39],$Vg3=[2,36],$Vh3=[2,42],$Vi3=[2,37],$Vj3=[1,440],$Vk3=[2,40],$Vl3=[1,476],$Vm3=[1,509],$Vn3=[1,510],$Vo3=[1,511],$Vp3=[1,514],$Vq3=[2,44],$Vr3=[2,51],$Vs3=[2,60],$Vt3=[2,62],$Vu3=[2,72],$Vv3=[47,49,66],$Vw3=[1,574],$Vx3=[47,49,66,75,76,77,115,120,122,186,189],$Vy3=[47,49,66,186,189],$Vz3=[47,49,66,92,93,94,97,98,99,100,186,189],$VA3=[47,49,66,75,76,77,97,98,99,100,115,120,122,186,189],$VB3=[47,49,66,97,98,99,100,108,109,110,111,112,113,186,189],$VC3=[47,49,66,108,109,110,111,112,113,186,189],$VD3=[47,66],$VE3=[7,18,19,20,21,23,26,47,49,75,76,77,115,120,122,211,212],$VF3=[2,93],$VG3=[2,92],$VH3=[2,224],$VI3=[1,616],$VJ3=[1,619],$VK3=[1,615],$VL3=[1,618],$VM3=[2,90],$VN3=[2,130],$VO3=[2,105],$VP3=[2,99],$VQ3=[2,111],$VR3=[2,112],$VS3=[2,141],$VT3=[2,142],$VU3=[1,636],$VV3=[2,143],$VW3=[117,130],$VX3=[2,148],$VY3=[2,149],$VZ3=[2,151],$V_3=[1,639],$V$3=[1,640],$V04=[19,21,195,211],$V14=[2,170],$V24=[1,648],$V34=[1,649],$V44=[117,130,135,136],$V54=[2,160],$V64=[19,21,115,120,122,195,211],$V74=[2,233],$V84=[2,234],$V94=[2,180],$Va4=[1,683],$Vb4=[19,21,67,77,96,104,105,159,174,181,200,201,202,203,204,205,206,207,208,209,211],$Vc4=[2,230],$Vd4=[2,231],$Ve4=[2,232],$Vf4=[2,243],$Vg4=[2,246],$Vh4=[2,240],$Vi4=[2,241],$Vj4=[2,242],$Vk4=[2,248],$Vl4=[2,249],$Vm4=[2,254],$Vn4=[2,255],$Vo4=[2,256],$Vp4=[2,257],$Vq4=[19,21,67,77,96,104,105,107,159,174,181,200,201,202,203,204,205,206,207,208,209,211],$Vr4=[1,715],$Vs4=[1,762],$Vt4=[1,817],$Vu4=[1,827],$Vv4=[1,863],$Vw4=[1,899],$Vx4=[2,63],$Vy4=[47,49,66,97,98,99,100,186,189],$Vz4=[47,49,66,75,76,77,115,120,122,189],$VA4=[47,49,66,189],$VB4=[1,921],$VC4=[47,49,66,92,93,94,97,98,99,100,189],$VD4=[1,931],$VE4=[1,968],$VF4=[1,1004],$VG4=[2,226],$VH4=[1,1015],$VI4=[1,1021],$VJ4=[1,1020],$VK4=[19,21,96,104,105,200,201,202,203,204,205,206,207,208,209,211],$VL4=[1,1041],$VM4=[1,1047],$VN4=[1,1046],$VO4=[1,1067],$VP4=[1,1073],$VQ4=[1,1072],$VR4=[2,131],$VS4=[2,144],$VT4=[2,146],$VU4=[2,150],$VV4=[2,152],$VW4=[2,153],$VX4=[2,157],$VY4=[2,159],$VZ4=[2,164],$V_4=[2,165],$V$4=[1,1099],$V05=[1,1102],$V15=[1,1098],$V25=[1,1101],$V35=[1,1112],$V45=[2,220],$V55=[2,238],$V65=[2,239],$V75=[1,1116],$V85=[1,1118],$V95=[1,1120],$Va5=[19,21,67,77,96,104,105,159,175,181,200,201,202,203,204,205,206,207,208,209,211],$Vb5=[1,1124],$Vc5=[1,1130],$Vd5=[1,1133],$Ve5=[1,1134],$Vf5=[1,1135],$Vg5=[1,1123],$Vh5=[1,1136],$Vi5=[1,1137],$Vj5=[1,1142],$Vk5=[1,1143],$Vl5=[1,1144],$Vm5=[1,1145],$Vn5=[1,1138],$Vo5=[1,1139],$Vp5=[1,1140],$Vq5=[1,1141],$Vr5=[1,1129],$Vs5=[2,244],$Vt5=[2,247],$Vu5=[2,123],$Vv5=[1,1175],$Vw5=[1,1181],$Vx5=[1,1213],$Vy5=[1,1219],$Vz5=[1,1278],$VA5=[1,1325],$VB5=[47,49,66,75,76,77,115,120,122],$VC5=[47,49,66,92,93,94,97,98,99,100],$VD5=[1,1401],$VE5=[1,1448],$VF5=[2,221],$VG5=[2,222],$VH5=[2,223],$VI5=[7,18,19,20,21,23,26,47,49,75,76,77,107,115,120,122,186,189,211,212],$VJ5=[7,18,19,20,21,23,26,47,49,107,186,189,211,212],$VK5=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,107,186,189,211,212],$VL5=[2,147],$VM5=[2,145],$VN5=[2,154],$VO5=[2,158],$VP5=[2,155],$VQ5=[2,156],$VR5=[19,21,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,120,122,157,211],$VS5=[1,1508],$VT5=[66,130],$VU5=[1,1511],$VV5=[1,1512],$VW5=[66,130,135,136],$VX5=[2,203],$VY5=[1,1528],$VZ5=[19,21,67,77,96,104,105,159,174,175,181,200,201,202,203,204,205,206,207,208,209,211],$V_5=[19,21,67,77,96,104,105,107,159,174,175,181,200,201,202,203,204,205,206,207,208,209,211],$V$5=[2,245],$V06=[1,1566],$V16=[1,1632],$V26=[1,1638],$V36=[1,1637],$V46=[1,1658],$V56=[1,1664],$V66=[1,1663],$V76=[1,1684],$V86=[1,1690],$V96=[1,1689],$Va6=[1,1731],$Vb6=[1,1737],$Vc6=[1,1769],$Vd6=[1,1775],$Ve6=[1,1790],$Vf6=[1,1796],$Vg6=[1,1795],$Vh6=[1,1816],$Vi6=[1,1822],$Vj6=[1,1821],$Vk6=[1,1842],$Vl6=[1,1848],$Vm6=[1,1847],$Vn6=[1,1889],$Vo6=[1,1895],$Vp6=[1,1927],$Vq6=[1,1933],$Vr6=[117,130,135,136,186,189],$Vs6=[2,167],$Vt6=[1,1951],$Vu6=[1,1952],$Vv6=[1,1953],$Vw6=[1,1954],$Vx6=[117,130,135,136,151,152,153,154,186,189],$Vy6=[2,34],$Vz6=[47,117,130,135,136,151,152,153,154,186,189],$VA6=[2,47],$VB6=[47,49,117,130,135,136,151,152,153,154,186,189],$VC6=[2,54],$VD6=[1,1983],$VE6=[1,2020],$VF6=[1,2053],$VG6=[1,2059],$VH6=[1,2058],$VI6=[1,2079],$VJ6=[1,2085],$VK6=[1,2084],$VL6=[1,2106],$VM6=[1,2112],$VN6=[1,2111],$VO6=[1,2133],$VP6=[1,2139],$VQ6=[1,2138],$VR6=[1,2159],$VS6=[1,2165],$VT6=[1,2164],$VU6=[1,2186],$VV6=[1,2192],$VW6=[1,2191],$VX6=[1,2261],$VY6=[47,49,66,75,76,77,107,115,120,122,186,189],$VZ6=[47,49,66,107,186,189],$V_6=[47,49,66,92,93,94,97,98,99,100,107,186,189],$V$6=[1,2375],$V07=[2,168],$V17=[2,172],$V27=[2,173],$V37=[2,174],$V47=[2,175],$V57=[2,45],$V67=[2,52],$V77=[2,59],$V87=[2,79],$V97=[2,75],$Va7=[2,81],$Vb7=[1,2458],$Vc7=[2,78],$Vd7=[47,49,75,76,77,97,98,99,100,115,117,120,122,130,135,136,151,152,153,154,186,189],$Ve7=[47,49,75,76,77,115,117,120,122,130,135,136,151,152,153,154,186,189],$Vf7=[47,49,97,98,99,100,108,109,110,111,112,113,117,130,135,136,151,152,153,154,186,189],$Vg7=[47,49,92,93,94,97,98,99,100,117,130,135,136,151,152,153,154,186,189],$Vh7=[2,85],$Vi7=[2,86],$Vj7=[47,49,108,109,110,111,112,113,117,130,135,136,151,152,153,154,186,189],$Vk7=[1,2512],$Vl7=[1,2518],$Vm7=[1,2601],$Vn7=[1,2634],$Vo7=[1,2640],$Vp7=[1,2639],$Vq7=[1,2660],$Vr7=[1,2666],$Vs7=[1,2665],$Vt7=[1,2687],$Vu7=[1,2693],$Vv7=[1,2692],$Vw7=[1,2714],$Vx7=[1,2720],$Vy7=[1,2719],$Vz7=[1,2740],$VA7=[1,2746],$VB7=[1,2745],$VC7=[1,2767],$VD7=[1,2773],$VE7=[1,2772],$VF7=[1,2814],$VG7=[1,2847],$VH7=[1,2853],$VI7=[1,2852],$VJ7=[1,2873],$VK7=[1,2879],$VL7=[1,2878],$VM7=[1,2900],$VN7=[1,2906],$VO7=[1,2905],$VP7=[1,2927],$VQ7=[1,2933],$VR7=[1,2932],$VS7=[1,2953],$VT7=[1,2959],$VU7=[1,2958],$VV7=[1,2980],$VW7=[1,2986],$VX7=[1,2985],$VY7=[117,130,135,136,189],$VZ7=[1,3005],$V_7=[2,48],$V$7=[2,55],$V08=[2,74],$V18=[2,80],$V28=[2,76],$V38=[2,82],$V48=[47,49,97,98,99,100,117,130,135,136,151,152,153,154,186,189],$V58=[1,3029],$V68=[66,130,135,136,186,189],$V78=[1,3038],$V88=[1,3039],$V98=[1,3040],$Va8=[1,3041],$Vb8=[66,130,135,136,151,152,153,154,186,189],$Vc8=[47,66,130,135,136,151,152,153,154,186,189],$Vd8=[47,49,66,130,135,136,151,152,153,154,186,189],$Ve8=[1,3070],$Vf8=[1,3139],$Vg8=[1,3145],$Vh8=[1,3225],$Vi8=[1,3231],$Vj8=[2,169],$Vk8=[2,46],$Vl8=[1,3319],$Vm8=[2,53],$Vn8=[1,3352],$Vo8=[2,77],$Vp8=[2,166],$Vq8=[1,3397],$Vr8=[47,49,66,75,76,77,97,98,99,100,115,120,122,130,135,136,151,152,153,154,186,189],$Vs8=[47,49,66,75,76,77,115,120,122,130,135,136,151,152,153,154,186,189],$Vt8=[47,49,66,97,98,99,100,108,109,110,111,112,113,130,135,136,151,152,153,154,186,189],$Vu8=[47,49,66,92,93,94,97,98,99,100,130,135,136,151,152,153,154,186,189],$Vv8=[47,49,66,108,109,110,111,112,113,130,135,136,151,152,153,154,186,189],$Vw8=[1,3428],$Vx8=[1,3434],$Vy8=[1,3433],$Vz8=[1,3454],$VA8=[1,3460],$VB8=[1,3459],$VC8=[1,3481],$VD8=[1,3487],$VE8=[1,3486],$VF8=[1,3585],$VG8=[1,3591],$VH8=[1,3590],$VI8=[1,3626],$VJ8=[1,3668],$VK8=[66,130,135,136,189],$VL8=[1,3698],$VM8=[47,49,66,97,98,99,100,130,135,136,151,152,153,154,186,189],$VN8=[1,3722],$VO8=[1,3758],$VP8=[1,3764],$VQ8=[1,3763],$VR8=[1,3784],$VS8=[1,3790],$VT8=[1,3789],$VU8=[1,3811],$VV8=[1,3817],$VW8=[1,3816],$VX8=[1,3838],$VY8=[1,3844],$VZ8=[1,3843],$V_8=[1,3864],$V$8=[1,3870],$V09=[1,3869],$V19=[1,3891],$V29=[1,3897],$V39=[1,3896],$V49=[107,117,130,135,136,186,189],$V59=[1,3939],$V69=[1,3963],$V79=[1,4005],$V89=[1,4038],$V99=[1,4143],$Va9=[1,4186],$Vb9=[1,4192],$Vc9=[1,4191],$Vd9=[1,4227],$Ve9=[1,4269],$Vf9=[1,4325],$Vg9=[66,107,130,135,136,186,189],$Vh9=[1,4380],$Vi9=[1,4404],$Vj9=[1,4434],$Vk9=[1,4480],$Vl9=[1,4552],$Vm9=[1,4601];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"shapeExprLabel":32,"O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C":33,"shapeExpression":34,"IT_EXTERNAL":35,"QIT_NOT_E_Opt":36,"shapeAtomNoRef":37,"QshapeOr_E_Opt":38,"IT_NOT":39,"shapeRef":40,"shapeOr":41,"inlineShapeExpression":42,"inlineShapeOr":43,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":44,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":45,"O_QIT_OR_E_S_QshapeAnd_E_C":46,"IT_OR":47,"O_QIT_AND_E_S_QshapeNot_E_C":48,"IT_AND":49,"shapeNot":50,"inlineShapeAnd":51,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":52,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":53,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":54,"inlineShapeNot":55,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":56,"O_QIT_AND_E_S_QinlineShapeNot_E_C":57,"shapeAtom":58,"inlineShapeAtom":59,"nonLitNodeConstraint":60,"QshapeOrRef_E_Opt":61,"litNodeConstraint":62,"shapeOrRef":63,"QnonLitNodeConstraint_E_Opt":64,"(":65,")":66,".":67,"shapeDefinition":68,"nonLitInlineNodeConstraint":69,"QinlineShapeOrRef_E_Opt":70,"litInlineNodeConstraint":71,"inlineShapeOrRef":72,"QnonLitInlineNodeConstraint_E_Opt":73,"inlineShapeDefinition":74,"ATPNAME_LN":75,"ATPNAME_NS":76,"@":77,"Qannotation_E_Star":78,"semanticActions":79,"annotation":80,"IT_LITERAL":81,"QxsFacet_E_Star":82,"datatype":83,"valueSet":84,"QnumericFacet_E_Plus":85,"xsFacet":86,"numericFacet":87,"nonLiteralKind":88,"QstringFacet_E_Star":89,"QstringFacet_E_Plus":90,"stringFacet":91,"IT_IRI":92,"IT_BNODE":93,"IT_NONLITERAL":94,"stringLength":95,"INTEGER":96,"REGEXP":97,"IT_LENGTH":98,"IT_MINLENGTH":99,"IT_MAXLENGTH":100,"numericRange":101,"rawNumeric":102,"numericLength":103,"DECIMAL":104,"DOUBLE":105,"string":106,"^^":107,"IT_MININCLUSIVE":108,"IT_MINEXCLUSIVE":109,"IT_MAXINCLUSIVE":110,"IT_MAXEXCLUSIVE":111,"IT_TOTALDIGITS":112,"IT_FRACTIONDIGITS":113,"Q_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":114,"{":115,"QtripleExpression_E_Opt":116,"}":117,"QextraPropertySet_E_Or_QIT_CLOSED_E_C":118,"extraPropertySet":119,"IT_CLOSED":120,"tripleExpression":121,"IT_EXTRA":122,"Qpredicate_E_Plus":123,"predicate":124,"oneOfTripleExpr":125,"groupTripleExpr":126,"multiElementOneOf":127,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":128,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":129,"|":130,"singleElementGroup":131,"multiElementGroup":132,"unaryTripleExpr":133,"QGT_SEMI_E_Opt":134,",":135,";":136,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":137,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":138,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":139,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":140,"include":141,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":142,"$":143,"tripleExprLabel":144,"tripleConstraint":145,"bracketedTripleExpr":146,"Qcardinality_E_Opt":147,"cardinality":148,"QsenseFlags_E_Opt":149,"senseFlags":150,"*":151,"+":152,"?":153,"REPEAT_RANGE":154,"^":155,"!":156,"[":157,"QvalueSetValue_E_Star":158,"]":159,"valueSetValue":160,"iriRange":161,"literalRange":162,"languageRange":163,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":164,"QiriExclusion_E_Plus":165,"iriExclusion":166,"QliteralExclusion_E_Plus":167,"literalExclusion":168,"QlanguageExclusion_E_Plus":169,"languageExclusion":170,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":171,"QiriExclusion_E_Star":172,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":173,"~":174,"-":175,"QGT_TILDE_E_Opt":176,"literal":177,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":178,"QliteralExclusion_E_Star":179,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":180,"LANGTAG":181,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":182,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":183,"QlanguageExclusion_E_Star":184,"&":185,"//":186,"O_Qiri_E_Or_Qliteral_E_C":187,"QcodeDecl_E_Star":188,"%":189,"O_QCODE_E_Or_QGT_MODULO_E_C":190,"CODE":191,"rdfLiteral":192,"numericLiteral":193,"booleanLiteral":194,"a":195,"blankNode":196,"langString":197,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":198,"O_QGT_DTYPE_E_S_Qdatatype_E_C":199,"IT_true":200,"IT_false":201,"STRING_LITERAL1":202,"STRING_LITERAL_LONG1":203,"STRING_LITERAL2":204,"STRING_LITERAL_LONG2":205,"LANG_STRING_LITERAL1":206,"LANG_STRING_LITERAL_LONG1":207,"LANG_STRING_LITERAL2":208,"LANG_STRING_LITERAL_LONG2":209,"prefixedName":210,"PNAME_LN":211,"BLANK_NODE_LABEL":212,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":213,"IT_EXTENDS":214,"$accept":0,"$end":1},
terminals_: {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",35:"IT_EXTERNAL",39:"IT_NOT",47:"IT_OR",49:"IT_AND",65:"(",66:")",67:".",75:"ATPNAME_LN",76:"ATPNAME_NS",77:"@",81:"IT_LITERAL",92:"IT_IRI",93:"IT_BNODE",94:"IT_NONLITERAL",96:"INTEGER",97:"REGEXP",98:"IT_LENGTH",99:"IT_MINLENGTH",100:"IT_MAXLENGTH",104:"DECIMAL",105:"DOUBLE",107:"^^",108:"IT_MININCLUSIVE",109:"IT_MINEXCLUSIVE",110:"IT_MAXINCLUSIVE",111:"IT_MAXEXCLUSIVE",112:"IT_TOTALDIGITS",113:"IT_FRACTIONDIGITS",115:"{",117:"}",120:"IT_CLOSED",122:"IT_EXTRA",130:"|",135:",",136:";",143:"$",151:"*",152:"+",153:"?",154:"REPEAT_RANGE",155:"^",156:"!",157:"[",159:"]",174:"~",175:"-",181:"LANGTAG",185:"&",186:"//",189:"%",191:"CODE",195:"a",200:"IT_true",201:"IT_false",202:"STRING_LITERAL1",203:"STRING_LITERAL_LONG1",204:"STRING_LITERAL2",205:"STRING_LITERAL_LONG2",206:"LANG_STRING_LITERAL1",207:"LANG_STRING_LITERAL_LONG1",208:"LANG_STRING_LITERAL2",209:"LANG_STRING_LITERAL_LONG2",211:"PNAME_LN",212:"BLANK_NODE_LABEL",214:"IT_EXTENDS"},
productions_: [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,2],[33,1],[33,1],[34,3],[34,3],[34,2],[38,0],[38,1],[42,1],[41,1],[41,2],[46,2],[44,1],[44,2],[48,2],[45,1],[45,2],[29,0],[29,2],[43,2],[53,2],[52,0],[52,2],[28,2],[54,0],[54,2],[51,2],[57,2],[56,0],[56,2],[50,2],[36,0],[36,1],[55,2],[58,2],[58,1],[58,2],[58,3],[58,1],[61,0],[61,1],[64,0],[64,1],[37,2],[37,1],[37,2],[37,3],[37,1],[59,2],[59,1],[59,2],[59,3],[59,1],[70,0],[70,1],[73,0],[73,1],[63,1],[63,1],[72,1],[72,1],[40,1],[40,1],[40,2],[62,3],[78,0],[78,2],[60,3],[71,2],[71,2],[71,2],[71,1],[82,0],[82,2],[85,1],[85,2],[69,2],[69,1],[89,0],[89,2],[90,1],[90,2],[88,1],[88,1],[88,1],[86,1],[86,1],[91,2],[91,1],[95,1],[95,1],[95,1],[87,2],[87,2],[102,1],[102,1],[102,1],[102,3],[101,1],[101,1],[101,1],[101,1],[103,1],[103,1],[68,3],[74,4],[118,1],[118,1],[114,0],[114,2],[116,0],[116,1],[119,2],[123,1],[123,2],[121,1],[125,1],[125,1],[127,2],[129,2],[128,1],[128,2],[126,1],[126,1],[131,2],[134,0],[134,1],[134,1],[132,3],[138,2],[138,2],[137,1],[137,2],[133,2],[133,1],[142,2],[139,0],[139,1],[140,1],[140,1],[146,6],[147,0],[147,1],[145,6],[149,0],[149,1],[148,1],[148,1],[148,1],[148,1],[150,1],[150,2],[150,1],[150,2],[84,3],[158,0],[158,2],[160,1],[160,1],[160,1],[160,2],[165,1],[165,2],[167,1],[167,2],[169,1],[169,2],[164,1],[164,1],[164,1],[161,2],[172,0],[172,2],[173,2],[171,0],[171,1],[166,3],[176,0],[176,1],[162,2],[179,0],[179,2],[180,2],[178,0],[178,1],[168,3],[163,2],[163,2],[184,0],[184,2],[183,2],[182,0],[182,1],[170,3],[141,2],[80,3],[187,1],[187,1],[79,1],[188,0],[188,2],[31,3],[190,1],[190,1],[177,1],[177,1],[177,1],[124,1],[124,1],[83,1],[32,1],[32,1],[144,1],[144,1],[193,1],[193,1],[193,1],[192,1],[192,2],[199,2],[198,0],[198,1],[194,1],[194,1],[106,1],[106,1],[106,1],[106,1],[197,1],[197,1],[197,1],[197,1],[22,1],[22,1],[210,1],[210,1],[196,1],[213,1],[213,1]],
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
case 32: case 229: case 246:
this.$ = null;
break;
case 33: case 37: case 40: case 46: case 53: case 186: case 245:
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
case 39: case 42: case 44: case 48: case 51: case 55:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 43: case 47: case 50: case 54:
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
case 57:
this.$ = false;
break;
case 58:
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
 // t: @@
        this.$ = $$[$0-2] === EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: 0
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 131:
 // t: @@
        const exprObj = $$[$0-1] ? { expression: $$[$0-1] } : EmptyObject; // t: 0
        this.$ = (exprObj === EmptyObject && $$[$0-3] === EmptyObject) ?
	  EmptyShape :
	  extend({ type: "Shape" }, exprObj, $$[$0-3]);
      
break;
case 132:
this.$ = [ "extra", $$[$0] ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 133:
this.$ = [ "closed", true ] // t: 1dotClosed;
break;
case 134:
this.$ = EmptyObject;
break;
case 135:

        if ($$[$0-1] === EmptyObject)
          $$[$0-1] = {};
        if ($$[$0][0] === "closed")
          $$[$0-1]["closed"] = true; // t: 1dotClosed
        else if ($$[$0][0] in $$[$0-1])
          $$[$0-1][$$[$0][0]] = unionAll($$[$0-1][$$[$0][0]], $$[$0][1]); // t: 3groupdot3Extra, 3groupdotExtra3
        else
          $$[$0-1][$$[$0][0]] = $$[$0][1]; // t: @@
        this.$ = $$[$0-1];
      
break;
case 138:
this.$ = $$[$0] // t: 1dotExtra1, 3groupdot3Extra;
break;
case 139:
this.$ = [$$[$0]] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 140:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 3groupdotExtra3;
break;
case 144:
this.$ = { type: "OneOf", expressions: unionAll([$$[$0-1]], $$[$0]) } // t: 2oneOfdot;
break;
case 145:
this.$ = $$[$0] // t: 2oneOfdot;
break;
case 146:
this.$ = [$$[$0]] // t: 2oneOfdot;
break;
case 147:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2oneOfdot;
break;
case 150:
this.$ = $$[$0-1];
break;
case 154:
this.$ = { type: "EachOf", expressions: unionAll([$$[$0-2]], $$[$0-1]) } // t: 2groupOfdot;
break;
case 155:
this.$ = $$[$0] // ## deprecated // t: 2groupOfdot;
break;
case 156:
this.$ = $$[$0] // t: 2groupOfdot;
break;
case 157:
this.$ = [$$[$0]] // t: 2groupOfdot;
break;
case 158:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2groupOfdot;
break;
case 159:

        if ($$[$0-1]) {
          this.$ = extend({ id: $$[$0-1] }, $$[$0]);
          addProduction($$[$0-1],  this.$, yy);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 161:
this.$ = addSourceMap($$[$0], yy);
break;
case 166:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 167:
this.$ = {} // t: 1dot;
break;
case 169:

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
case 172:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 173:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 174:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 175:

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
case 176:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 177:
this.$ = { inverse: true, negated: true } // t: 1negatedinversedot;
break;
case 178:
this.$ = { negated: true } // t: 1negateddot;
break;
case 179:
this.$ = { inverse: true, negated: true } // t: 1inversenegateddot;
break;
case 180:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 181:
this.$ = [] // t: 1val1IRIREF;
break;
case 182:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 187:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 188:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 189:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 190:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 191:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 192:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 193:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 194:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 195:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 196:

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
case 197:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 198:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 199:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 202:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 205:

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
case 206:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 207:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 208:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 211:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 212:

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
case 213:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 214:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 215:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 216:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 219:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 220:
this.$ = addSourceMap($$[$0], yy) // Inclusion // t: 2groupInclude1;
break;
case 221:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 224:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 225:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 226:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 227:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 234:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 240:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 241:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 242:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 244:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 248:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 249:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 250:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 251:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 252:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 253:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 254:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 255:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 256:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 257:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 258:
 // t: 1dot
        const unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = Parser._base === null || absoluteIRI.test(unesc) ? unesc : _resolveIRI(unesc)
      
break;
case 260:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $$[$0].indexOf(':');
        this.$ = expandPrefix($$[$0].substr(0, namePos1), yy) + ShExUtil.unescapeText($$[$0].substr(namePos1 + 1), pnameEscapeReplacements);
      
break;
case 261:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
}
},
table: [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),{6:4,7:[2,10],8:5,9:10,10:14,11:15,14:6,15:7,16:8,17:9,18:[1,11],19:$V1,20:[1,12],21:$V2,22:22,23:[1,13],24:16,25:17,26:[1,19],30:18,31:21,32:20,189:$V3,196:23,210:26,211:$V4,212:$V5},{7:[1,30]},o($V0,[2,4]),{7:[2,11]},o($V0,$V6),o($V0,$V7),o($V0,$V8),o($V9,[2,7],{12:31}),{19:[1,32]},{21:[1,33]},{19:$Va,21:$Vb,22:34,210:36,211:$Vc},o($V9,[2,5]),o($V9,[2,6]),o($V9,$Vd),o($V9,$Ve),o($V9,[2,21],{31:39,189:$V3}),{27:[1,40]},o($Vf,$Vg,{33:41,34:42,36:44,40:46,35:[1,43],39:[1,45],75:$Vh,76:$Vi,77:$Vj}),o($V0,[2,22]),o($Vk,$Vl),o($Vk,$Vm),{19:$Vn,21:$Vo,22:50,210:52,211:$Vp},o($Vk,$Vq),o($Vk,$Vr),o($Vk,$Vs),o($Vk,$Vt),o($Vk,$Vu),{1:[2,1]},{7:[2,9],8:56,10:57,13:55,15:58,16:59,17:60,18:[1,63],19:$V1,20:[1,64],21:$V2,22:22,23:[1,65],24:61,25:62,26:[1,66],32:67,196:23,210:26,211:$V4,212:$V5},o($V0,$Vv),{19:$Va,21:$Vb,22:68,210:36,211:$Vc},o($V0,$Vw),o($V0,$Vq),o($V0,$Vr),o($V0,$Vt),o($V0,$Vu),o($V0,[2,23]),o($Vx,$Vg,{28:69,50:70,36:71,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:73,60:74,62:75,68:76,69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,210:99,101:100,103:101,19:$VE,21:$VF,65:[1,77],67:[1,78],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$VU,211:$VV}),o($Vf,$VW,{40:113,75:$VX,76:$VY,77:$VZ}),{41:117,44:118,45:119,46:120,47:$V_,48:121,49:$V$},o($V01,$V11),o($V01,$V21),{19:[1,127],21:[1,131],22:125,32:124,196:126,210:128,211:[1,130],212:[1,129]},{189:[1,134],190:132,191:[1,133]},o($V31,$Vq),o($V31,$Vr),o($V31,$Vt),o($V31,$Vu),o($V9,[2,8]),o($V9,[2,24]),o($V9,[2,25]),o($V9,$V6),o($V9,$V7),o($V9,$V8),o($V9,$Vd),o($V9,$Ve),{19:[1,135]},{21:[1,136]},{19:$V41,21:$V51,22:137,210:139,211:$V61},{27:[1,142]},o($Vf,$Vg,{33:143,34:144,36:146,40:148,35:[1,145],39:[1,147],75:$Vh,76:$Vi,77:$Vj}),o($V0,$V71),o($V81,$V91,{29:149}),o($Va1,$Vb1,{54:150}),o($VC,$VD,{69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,210:99,101:100,103:101,58:151,60:152,62:153,63:154,68:157,40:158,19:$VE,21:$VF,65:[1,155],67:[1,156],75:[1,159],76:[1,160],77:[1,161],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$VU,211:$VV}),o($Vx,$VW),o($V9,$Vc1,{44:118,45:119,46:120,48:121,38:162,41:163,47:$V_,49:$V$}),o($Va1,$Vd1,{61:164,63:165,68:166,40:167,74:168,114:169,75:$VX,76:$VY,77:$VZ,115:$VD,120:$VD,122:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:170,60:171,69:172,88:173,90:174,91:178,95:179,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{34:181,36:182,40:184,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:185}),o($Vo1,$Vn1,{78:186}),o($Vp1,$Vn1,{78:187}),o($Vq1,$Vr1,{89:188}),o($Vm1,$Vs1,{95:96,91:189,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:190}),o($Vt1,$Vu1,{82:191}),o($Vt1,$Vu1,{82:192}),o($Vo1,$Vv1,{101:100,103:101,87:193,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,194],118:195,119:196,120:$Vw1,122:$Vx1},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:199}),o($VF1,$VG1),{96:[1,200]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,202],102:201,104:[1,203],105:[1,204],106:205,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,210]},{96:[2,115]},{96:[2,116]},{96:[2,117]},o($Vt1,$Vt),o($Vt1,$Vu),o($VM1,[2,124]),o($VM1,[2,125]),o($VM1,[2,126]),o($VM1,[2,127]),{96:[2,128]},{96:[2,129]},o($V9,$Vc1,{44:118,45:119,46:120,48:121,41:163,38:211,47:$V_,49:$V$}),o($Va1,$V11),o($Va1,$V21),{19:[1,215],21:[1,219],22:213,32:212,196:214,210:216,211:[1,218],212:[1,217]},o($V9,$VN1),o($V9,$VO1,{46:220,47:$V_}),o($V81,$V91,{29:221,48:222,49:$V$}),o($V81,$VP1),o($Va1,$VQ1),o($Vx,$Vg,{28:223,50:224,36:225,39:$Vy}),o($Vx,$Vg,{50:226,36:227,39:$Vy}),o($V01,$VR1),o($V01,$Vl),o($V01,$Vm),o($V01,$Vq),o($V01,$Vr),o($V01,$Vs),o($V01,$Vt),o($V01,$Vu),o($V0,$VS1),o($V0,$VT1),o($V0,$VU1),o($V9,$Vv),{19:$V41,21:$V51,22:228,210:139,211:$V61},o($V9,$Vw),o($V9,$Vq),o($V9,$Vr),o($V9,$Vt),o($V9,$Vu),o($Vx,$Vg,{28:229,50:230,36:231,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:232,60:233,62:234,68:235,69:238,71:239,74:240,88:241,90:242,83:244,84:245,85:246,114:247,91:251,22:252,87:254,95:255,210:258,101:259,103:260,19:$VV1,21:$VW1,65:[1,236],67:[1,237],81:$VX1,92:$VY1,93:$VZ1,94:$V_1,97:$V$1,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$V02,211:$V12}),o($Vf,$VW,{40:263,75:$V22,76:$V32,77:$V42}),{41:267,44:268,45:269,46:270,47:$V52,48:271,49:$V62},o($V9,$V72,{46:274,47:$V_}),o($V81,$V82,{48:275,49:$V$}),o($Va1,$V92),o($Va1,$Vd1,{63:165,68:166,40:167,74:168,114:169,61:276,75:$VX,76:$VY,77:$VZ,115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{60:171,69:172,88:173,90:174,91:178,95:179,64:277,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:278,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vc2,$V11),o($Vc2,$V21),{19:[1,282],21:[1,286],22:280,32:279,196:281,210:283,211:[1,285],212:[1,284]},o($V9,$Vf2),o($V9,$Vg2),o($Va1,$Vh2),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:287}),{115:[1,288],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vj2),o($Va1,$Vk2),o($Vo1,$Vn1,{78:289}),o($Vl2,$Vr1,{89:290}),o($Vo1,$Vs1,{95:179,91:291,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,292]},o($Vl2,$VH1),{66:[1,293]},o($VC,$VD,{37:294,60:295,62:296,68:297,69:300,71:301,74:302,88:303,90:304,83:306,84:307,85:308,114:309,91:313,22:314,87:316,95:317,210:320,101:321,103:322,19:[1,319],21:[1,324],65:[1,298],67:[1,299],81:[1,305],92:[1,310],93:[1,311],94:[1,312],97:$Vm2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,315],211:[1,323]}),o($Vf,$VW,{40:325,75:$Vn2,76:$Vo2,77:$Vp2}),{41:329,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2},o($Vs2,$Vt2,{79:336,80:337,188:338,186:[1,339]}),o($Vu2,$Vt2,{79:340,80:341,188:342,186:$Vv2}),o($Vw2,$Vt2,{79:344,80:345,188:346,186:[1,347]}),o($Vm1,$Vx2,{95:96,91:348,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:349,91:350,87:351,95:352,101:354,103:355,97:$VA2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($VE2,$VF2,{116:356,121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,117:$VG2,143:$VH2,185:$VI2}),o($VC,[2,135]),o($VC,[2,132]),o($VC,[2,133]),{19:$VJ2,21:$VK2,22:371,123:369,124:370,195:$VL2,210:374,211:$VM2},{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,377],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,409]},{107:$V93},{107:$Va3},{107:$Vb3},{107:$Vc3},o($VF1,$Vd3),o($V9,$Ve3),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vf3),o($V9,$Vg3,{46:274,47:$V_}),o($Va1,$Vh3),o($V81,$Vi3),o($Va1,$Vb1,{54:410}),o($VC,$VD,{58:411,60:412,62:413,63:414,69:417,71:418,68:419,40:420,88:421,90:422,83:424,84:425,85:426,74:427,91:434,22:435,87:437,114:438,95:439,210:442,101:443,103:444,19:[1,441],21:[1,446],65:[1,415],67:[1,416],75:[1,428],76:[1,429],77:[1,430],81:[1,423],92:[1,431],93:[1,432],94:[1,433],97:$Vj3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,436],211:[1,445]}),o($Va1,$Vk3),o($VC,$VD,{58:447,60:448,62:449,63:450,69:453,71:454,68:455,40:456,88:457,90:458,83:460,84:461,85:462,74:463,91:470,22:471,87:473,114:474,95:475,210:478,101:479,103:480,19:[1,477],21:[1,482],65:[1,451],67:[1,452],75:[1,464],76:[1,465],77:[1,466],81:[1,459],92:[1,467],93:[1,468],94:[1,469],97:$Vl3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,472],211:[1,481]}),o($V9,$V71),o($V81,$V91,{29:483}),o($Va1,$Vb1,{54:484}),o($VC,$VD,{69:238,71:239,74:240,88:241,90:242,83:244,84:245,85:246,114:247,91:251,22:252,87:254,95:255,210:258,101:259,103:260,58:485,60:486,62:487,63:488,68:491,40:492,19:$VV1,21:$VW1,65:[1,489],67:[1,490],75:[1,493],76:[1,494],77:[1,495],81:$VX1,92:$VY1,93:$VZ1,94:$V_1,97:$V$1,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$V02,211:$V12}),o($V9,$Vc1,{44:268,45:269,46:270,48:271,38:496,41:497,47:$V52,49:$V62}),o($Va1,$Vd1,{61:498,63:499,68:500,40:501,74:502,114:503,75:$V22,76:$V32,77:$V42,115:$VD,120:$VD,122:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:504,60:505,69:506,88:507,90:508,91:512,95:513,92:$Vm3,93:$Vn3,94:$Vo3,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:515,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:516}),o($Vo1,$Vn1,{78:517}),o($Vp1,$Vn1,{78:518}),o($Vq1,$Vr1,{89:519}),o($Vm1,$Vs1,{95:255,91:520,97:$V$1,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:521}),o($Vt1,$Vu1,{82:522}),o($Vt1,$Vu1,{82:523}),o($Vo1,$Vv1,{101:259,103:260,87:524,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,525],118:195,119:196,120:$Vw1,122:$Vx1},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:526}),o($VF1,$VG1),{96:[1,527]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,529],102:528,104:[1,530],105:[1,531],106:532,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,533]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$Vc1,{44:268,45:269,46:270,48:271,41:497,38:534,47:$V52,49:$V62}),o($Va1,$V11),o($Va1,$V21),{19:[1,538],21:[1,542],22:536,32:535,196:537,210:539,211:[1,541],212:[1,540]},o($V9,$VN1),o($V9,$VO1,{46:543,47:$V52}),o($V81,$V91,{29:544,48:545,49:$V62}),o($V81,$VP1),o($Va1,$VQ1),o($Vx,$Vg,{28:546,50:547,36:548,39:$Vy}),o($Vx,$Vg,{50:549,36:550,39:$Vy}),o($V81,$Vq3),o($Va1,$Vr3),o($Va1,$Vs3),o($Va1,$Vt3),{66:[1,551]},o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),o($Vu2,$Vt2,{80:341,188:342,79:552,186:$Vv2}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:553,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:341,188:342,79:554,186:$Vv2}),o($Vo1,$Vx2,{95:179,91:555,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vu3),{38:556,41:557,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2,66:$Vc1},o($Vv3,$Vd1,{61:558,63:559,68:560,40:561,74:562,114:563,75:$Vn2,76:$Vo2,77:$Vp2,115:$VD,120:$VD,122:$VD}),o($Vv3,$Ve1),o($Vv3,$Vf1,{64:564,60:565,69:566,88:567,90:568,91:572,95:573,92:[1,569],93:[1,570],94:[1,571],97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:575,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vl1),o($Vx3,$Vn1,{78:576}),o($Vy3,$Vn1,{78:577}),o($Vz3,$Vn1,{78:578}),o($VA3,$Vr1,{89:579}),o($Vx3,$Vs1,{95:317,91:580,97:$Vm2,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:581}),o($VB3,$Vu1,{82:582}),o($VB3,$Vu1,{82:583}),o($Vy3,$Vv1,{101:321,103:322,87:584,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,585],118:195,119:196,120:$Vw1,122:$Vx1},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{158:586}),o($VC3,$VG1),{96:[1,587]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,589],102:588,104:[1,590],105:[1,591],106:592,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,593]},o($VB3,$Vt),o($VB3,$Vu),{38:594,41:557,44:330,45:331,46:332,47:$Vq2,48:333,49:$Vr2,66:$Vc1},o($Vv3,$V11),o($Vv3,$V21),{19:[1,598],21:[1,602],22:596,32:595,196:597,210:599,211:[1,601],212:[1,600]},{66:$VN1},{46:603,47:$Vq2,66:$VO1},o($VD3,$V91,{29:604,48:605,49:$Vr2}),o($VD3,$VP1),o($Vv3,$VQ1),o($Vx,$Vg,{28:606,50:607,36:608,39:$Vy}),o($Vx,$Vg,{50:609,36:610,39:$Vy}),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:611,189:[1,612]}),{19:$VI3,21:$VJ3,22:614,124:613,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:620,189:[1,621]}),{19:$VI3,21:$VJ3,22:614,124:622,195:$VK3,210:617,211:$VL3},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:623,189:[1,624]}),{19:$VI3,21:$VJ3,22:614,124:625,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,626]},o($Vt1,$VH1),{96:[1,628],102:627,104:[1,629],105:[1,630],106:631,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,632]},{117:[1,633]},{117:[2,137]},{117:$VS3},{117:$VT3,128:634,129:635,130:$VU3},{117:$VV3},o($VW3,$VX3),o($VW3,$VY3),o($VW3,$VZ3,{134:637,137:638,138:641,135:$V_3,136:$V$3}),o($V04,$V14,{140:642,145:643,146:644,149:645,150:647,65:[1,646],155:$V24,156:$V34}),o($V44,$V54),o($VE2,[2,163]),{19:[1,653],21:[1,657],22:651,144:650,196:652,210:654,211:[1,656],212:[1,655]},{19:[1,661],21:[1,665],22:659,144:658,196:660,210:662,211:[1,664],212:[1,663]},o($VC,[2,138],{22:371,210:374,124:666,19:$VJ2,21:$VK2,195:$VL2,211:$VM2}),o($V64,[2,139]),o($V64,$V74),o($V64,$V84),o($V64,$Vq),o($V64,$Vr),o($V64,$Vt),o($V64,$Vu),o($Vt1,$V94),o($VD1,[2,182]),o($VD1,[2,183]),o($VD1,[2,184]),o($VD1,[2,185]),{164:667,165:668,166:671,167:669,168:672,169:670,170:673,175:[1,674]},o($VD1,[2,200],{171:675,173:676,174:[1,677]}),o($VD1,[2,209],{178:678,180:679,174:[1,680]}),o($VD1,[2,217],{182:681,183:682,174:$Va4}),{174:$Va4,183:684},o($Vb4,$Vq),o($Vb4,$Vr),o($Vb4,$Vc4),o($Vb4,$Vd4),o($Vb4,$Ve4),o($Vb4,$Vt),o($Vb4,$Vu),o($Vb4,$Vf4),o($Vb4,$Vg4,{198:685,199:686,107:[1,687]}),o($Vb4,$Vh4),o($Vb4,$Vi4),o($Vb4,$Vj4),o($Vb4,$Vk4),o($Vb4,$Vl4),o($Vb4,$Vm4),o($Vb4,$Vn4),o($Vb4,$Vo4),o($Vb4,$Vp4),o($Vq4,$V93),o($Vq4,$Va3),o($Vq4,$Vb3),o($Vq4,$Vc3),{19:[1,690],21:[1,693],22:689,83:688,210:691,211:[1,692]},o($V81,$V82,{48:694,49:[1,695]}),o($Va1,$V92),o($Va1,$Vd1,{61:696,63:697,68:698,40:699,74:700,114:704,75:[1,701],76:[1,702],77:[1,703],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:705,60:706,69:707,88:708,90:709,91:713,95:714,92:[1,710],93:[1,711],94:[1,712],97:$Vr4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:716,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:717}),o($Vo1,$Vn1,{78:718}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:719}),o($Vm1,$Vs1,{95:439,91:720,97:$Vj3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:721}),o($Vt1,$Vu1,{82:722}),o($Vt1,$Vu1,{82:723}),o($Vo1,$Vv1,{101:443,103:444,87:724,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:725}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,729],21:[1,733],22:727,32:726,196:728,210:730,211:[1,732],212:[1,731]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:734}),o($VF1,$VG1),{115:[1,735],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,736]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,738],102:737,104:[1,739],105:[1,740],106:741,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,742]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:743,63:744,68:745,40:746,74:747,114:751,75:[1,748],76:[1,749],77:[1,750],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:752,60:753,69:754,88:755,90:756,91:760,95:761,92:[1,757],93:[1,758],94:[1,759],97:$Vs4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:763,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:764}),o($Vo1,$Vn1,{78:765}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:766}),o($Vm1,$Vs1,{95:475,91:767,97:$Vl3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:768}),o($Vt1,$Vu1,{82:769}),o($Vt1,$Vu1,{82:770}),o($Vo1,$Vv1,{101:479,103:480,87:771,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:772}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,776],21:[1,780],22:774,32:773,196:775,210:777,211:[1,779],212:[1,778]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:781}),o($VF1,$VG1),{115:[1,782],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,783]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,785],102:784,104:[1,786],105:[1,787],106:788,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,789]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$V72,{46:790,47:$V52}),o($V81,$V82,{48:791,49:$V62}),o($Va1,$V92),o($Va1,$Vd1,{63:499,68:500,40:501,74:502,114:503,61:792,75:$V22,76:$V32,77:$V42,115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{60:505,69:506,88:507,90:508,91:512,95:513,64:793,92:$Vm3,93:$Vn3,94:$Vo3,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:794,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vc2,$V11),o($Vc2,$V21),{19:[1,798],21:[1,802],22:796,32:795,196:797,210:799,211:[1,801],212:[1,800]},o($V9,$Vf2),o($V9,$Vg2),o($Va1,$Vh2),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:803}),{115:[1,804],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vj2),o($Va1,$Vk2),o($Vo1,$Vn1,{78:805}),o($Vl2,$Vr1,{89:806}),o($Vo1,$Vs1,{95:513,91:807,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,808]},o($Vl2,$VH1),{66:[1,809]},o($Vs2,$Vt2,{79:810,80:811,188:812,186:[1,813]}),o($Vu2,$Vt2,{79:814,80:815,188:816,186:$Vt4}),o($Vw2,$Vt2,{79:818,80:819,188:820,186:[1,821]}),o($Vm1,$Vx2,{95:255,91:822,97:$V$1,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:823,91:824,87:825,95:826,101:828,103:829,97:$Vu4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:823,91:824,87:825,95:826,101:828,103:829,97:$Vu4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:823,91:824,87:825,95:826,101:828,103:829,97:$Vu4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:830,117:$VG2,143:$VH2,185:$VI2}),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,831],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,832]},o($VF1,$Vd3),o($V9,$Ve3),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vf3),o($V9,$Vg3,{46:790,47:$V52}),o($Va1,$Vh3),o($V81,$Vi3),o($Va1,$Vb1,{54:833}),o($VC,$VD,{58:834,60:835,62:836,63:837,69:840,71:841,68:842,40:843,88:844,90:845,83:847,84:848,85:849,74:850,91:857,22:858,87:860,114:861,95:862,210:865,101:866,103:867,19:[1,864],21:[1,869],65:[1,838],67:[1,839],75:[1,851],76:[1,852],77:[1,853],81:[1,846],92:[1,854],93:[1,855],94:[1,856],97:$Vv4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,859],211:[1,868]}),o($Va1,$Vk3),o($VC,$VD,{58:870,60:871,62:872,63:873,69:876,71:877,68:878,40:879,88:880,90:881,83:883,84:884,85:885,74:886,91:893,22:894,87:896,114:897,95:898,210:901,101:902,103:903,19:[1,900],21:[1,905],65:[1,874],67:[1,875],75:[1,887],76:[1,888],77:[1,889],81:[1,882],92:[1,890],93:[1,891],94:[1,892],97:$Vw4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,895],211:[1,904]}),o($Va1,$Vx4),o($Va1,$VN3),{117:[1,906]},o($Va1,$VF3),o($Vl2,$VO3),{66:$Vf2},{66:$Vg2},o($Vv3,$Vh2),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:907}),{115:[1,908],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vj2),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:909}),o($Vy4,$Vr1,{89:910}),o($Vy3,$Vs1,{95:573,91:911,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy1),o($Vy4,$Vz1),o($Vy4,$VA1),o($Vy4,$VB1),{96:[1,912]},o($Vy4,$VH1),{66:[1,913]},o($Vz4,$Vt2,{79:914,80:915,188:916,186:[1,917]}),o($VA4,$Vt2,{79:918,80:919,188:920,186:$VB4}),o($VC4,$Vt2,{79:922,80:923,188:924,186:[1,925]}),o($Vx3,$Vx2,{95:317,91:926,97:$Vm2,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:927,91:928,87:929,95:930,101:932,103:933,97:$VD4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:927,91:928,87:929,95:930,101:932,103:933,97:$VD4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:927,91:928,87:929,95:930,101:932,103:933,97:$VD4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:934,117:$VG2,143:$VH2,185:$VI2}),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,935],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,936]},o($VC3,$Vd3),{66:$Ve3},o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VD3,$Vf3),{46:937,47:$Vq2,66:$Vg3},o($Vv3,$Vh3),o($VD3,$Vi3),o($Vv3,$Vb1,{54:938}),o($VC,$VD,{58:939,60:940,62:941,63:942,69:945,71:946,68:947,40:948,88:949,90:950,83:952,84:953,85:954,74:955,91:962,22:963,87:965,114:966,95:967,210:970,101:971,103:972,19:[1,969],21:[1,974],65:[1,943],67:[1,944],75:[1,956],76:[1,957],77:[1,958],81:[1,951],92:[1,959],93:[1,960],94:[1,961],97:$VE4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,964],211:[1,973]}),o($Vv3,$Vk3),o($VC,$VD,{58:975,60:976,62:977,63:978,69:981,71:982,68:983,40:984,88:985,90:986,83:988,84:989,85:990,74:991,91:998,22:999,87:1001,114:1002,95:1003,210:1006,101:1007,103:1008,19:[1,1005],21:[1,1010],65:[1,979],67:[1,980],75:[1,992],76:[1,993],77:[1,994],81:[1,987],92:[1,995],93:[1,996],94:[1,997],97:$VF4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,1000],211:[1,1009]}),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:1011,210:52,211:$Vp},{19:$VH4,21:$VI4,22:1013,96:[1,1024],104:[1,1025],105:[1,1026],106:1023,177:1014,187:1012,192:1017,193:1018,194:1019,197:1022,200:[1,1027],201:[1,1028],202:[1,1033],203:[1,1034],204:[1,1035],205:[1,1036],206:[1,1029],207:[1,1030],208:[1,1031],209:[1,1032],210:1016,211:$VJ4},o($VK4,$V74),o($VK4,$V84),o($VK4,$Vq),o($VK4,$Vr),o($VK4,$Vt),o($VK4,$Vu),o($Vu2,$VG4),{19:$Vn,21:$Vo,22:1037,210:52,211:$Vp},{19:$VL4,21:$VM4,22:1039,96:[1,1050],104:[1,1051],105:[1,1052],106:1049,177:1040,187:1038,192:1043,193:1044,194:1045,197:1048,200:[1,1053],201:[1,1054],202:[1,1059],203:[1,1060],204:[1,1061],205:[1,1062],206:[1,1055],207:[1,1056],208:[1,1057],209:[1,1058],210:1042,211:$VN4},o($Vw2,$VG4),{19:$Vn,21:$Vo,22:1063,210:52,211:$Vp},{19:$VO4,21:$VP4,22:1065,96:[1,1076],104:[1,1077],105:[1,1078],106:1075,177:1066,187:1064,192:1069,193:1070,194:1071,197:1074,200:[1,1079],201:[1,1080],202:[1,1085],203:[1,1086],204:[1,1087],205:[1,1088],206:[1,1081],207:[1,1082],208:[1,1083],209:[1,1084],210:1068,211:$VQ4},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,1089]},o($Vt1,$Vd3),o($Vp1,$VR4),{117:$VS4,129:1090,130:$VU3},o($VW3,$VT4),o($VE2,$VF2,{131:361,132:362,133:363,139:364,141:365,142:366,126:1091,143:$VH2,185:$VI2}),o($VW3,$VU4),o($VW3,$VZ3,{134:1092,138:1093,135:$V_3,136:$V$3}),o($VE2,$VF2,{139:364,141:365,142:366,133:1094,117:$VV4,130:$VV4,143:$VH2,185:$VI2}),o($VE2,$VF2,{139:364,141:365,142:366,133:1095,117:$VW4,130:$VW4,143:$VH2,185:$VI2}),o($V44,$VX4),o($V44,$VY4),o($V44,$VZ4),o($V44,$V_4),{19:$V$4,21:$V05,22:1097,124:1096,195:$V15,210:1100,211:$V25},o($VE2,$VF2,{142:366,121:1103,125:1104,126:1105,127:1106,131:1107,132:1108,133:1109,139:1110,141:1111,143:$VH2,185:$V35}),o($V04,[2,171]),o($V04,[2,176],{156:[1,1113]}),o($V04,[2,178],{155:[1,1114]}),o($V44,$V45),o($V44,$V55),o($V44,$V65),o($V44,$Vq),o($V44,$Vr),o($V44,$Vs),o($V44,$Vt),o($V44,$Vu),o($VE2,[2,161]),o($VE2,$V55),o($VE2,$V65),o($VE2,$Vq),o($VE2,$Vr),o($VE2,$Vs),o($VE2,$Vt),o($VE2,$Vu),o($V64,[2,140]),o($VD1,[2,186]),o($VD1,[2,193],{166:1115,175:$V75}),o($VD1,[2,194],{168:1117,175:$V85}),o($VD1,[2,195],{170:1119,175:$V95}),o($Va5,[2,187]),o($Va5,[2,189]),o($Va5,[2,191]),{19:$Vb5,21:$Vc5,22:1121,96:$Vd5,104:$Ve5,105:$Vf5,106:1132,177:1122,181:$Vg5,192:1126,193:1127,194:1128,197:1131,200:$Vh5,201:$Vi5,202:$Vj5,203:$Vk5,204:$Vl5,205:$Vm5,206:$Vn5,207:$Vo5,208:$Vp5,209:$Vq5,210:1125,211:$Vr5},o($VD1,[2,196]),o($VD1,[2,201]),o($Va5,[2,197],{172:1146}),o($VD1,[2,205]),o($VD1,[2,210]),o($Va5,[2,206],{179:1147}),o($VD1,[2,212]),o($VD1,[2,218]),o($Va5,[2,214],{184:1148}),o($VD1,[2,213]),o($Vb4,$Vs5),o($Vb4,$Vt5),{19:$VN2,21:$VO2,22:1150,83:1149,210:388,211:$V33},o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$Vr3),o($Vx,$Vg,{50:1151,36:1152,39:$Vy}),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1153}),o($Va1,$V11),o($Va1,$V21),{19:[1,1157],21:[1,1161],22:1155,32:1154,196:1156,210:1158,211:[1,1160],212:[1,1159]},{115:[1,1162],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1163}),o($Vl2,$Vr1,{89:1164}),o($Vo1,$Vs1,{95:714,91:1165,97:$Vr4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1166]},o($Vl2,$VH1),{66:[1,1167]},o($Vs2,$Vt2,{79:1168,80:1169,188:1170,186:[1,1171]}),o($Vu2,$Vt2,{79:1172,80:1173,188:1174,186:$Vv5}),o($Vm1,$Vx2,{95:439,91:1176,97:$Vj3,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1177,91:1178,87:1179,95:1180,101:1182,103:1183,97:$Vw5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1177,91:1178,87:1179,95:1180,101:1182,103:1183,97:$Vw5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1177,91:1178,87:1179,95:1180,101:1182,103:1183,97:$Vw5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1184,80:1185,188:1186,186:[1,1187]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1188],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1189,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1190]},o($VF1,$Vd3),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1191}),o($Va1,$V11),o($Va1,$V21),{19:[1,1195],21:[1,1199],22:1193,32:1192,196:1194,210:1196,211:[1,1198],212:[1,1197]},{115:[1,1200],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1201}),o($Vl2,$Vr1,{89:1202}),o($Vo1,$Vs1,{95:761,91:1203,97:$Vs4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1204]},o($Vl2,$VH1),{66:[1,1205]},o($Vs2,$Vt2,{79:1206,80:1207,188:1208,186:[1,1209]}),o($Vu2,$Vt2,{79:1210,80:1211,188:1212,186:$Vx5}),o($Vm1,$Vx2,{95:475,91:1214,97:$Vl3,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1215,91:1216,87:1217,95:1218,101:1220,103:1221,97:$Vy5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1215,91:1216,87:1217,95:1218,101:1220,103:1221,97:$Vy5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1215,91:1216,87:1217,95:1218,101:1220,103:1221,97:$Vy5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1222,80:1223,188:1224,186:[1,1225]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1226],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1227,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1228]},o($VF1,$Vd3),o($V81,$Vq3),o($Va1,$Vr3),o($Va1,$Vs3),o($Va1,$Vt3),{66:[1,1229]},o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),o($Vu2,$Vt2,{80:815,188:816,79:1230,186:$Vt4}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1231,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:815,188:816,79:1232,186:$Vt4}),o($Vo1,$Vx2,{95:513,91:1233,97:$Vp3,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vu3),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:1234,189:[1,1235]}),{19:$VI3,21:$VJ3,22:614,124:1236,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:1237,189:[1,1238]}),{19:$VI3,21:$VJ3,22:614,124:1239,195:$VK3,210:617,211:$VL3},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:1240,189:[1,1241]}),{19:$VI3,21:$VJ3,22:614,124:1242,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,1243]},o($Vt1,$VH1),{96:[1,1245],102:1244,104:[1,1246],105:[1,1247],106:1248,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1249]},{117:[1,1250]},o($Vt1,$V94),{19:[1,1253],21:[1,1256],22:1252,83:1251,210:1254,211:[1,1255]},o($V81,$V82,{48:1257,49:[1,1258]}),o($Va1,$V92),o($Va1,$Vd1,{61:1259,63:1260,68:1261,40:1262,74:1263,114:1267,75:[1,1264],76:[1,1265],77:[1,1266],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:1268,60:1269,69:1270,88:1271,90:1272,91:1276,95:1277,92:[1,1273],93:[1,1274],94:[1,1275],97:$Vz5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1279,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:1280}),o($Vo1,$Vn1,{78:1281}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:1282}),o($Vm1,$Vs1,{95:862,91:1283,97:$Vv4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1284}),o($Vt1,$Vu1,{82:1285}),o($Vt1,$Vu1,{82:1286}),o($Vo1,$Vv1,{101:866,103:867,87:1287,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1288}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,1292],21:[1,1296],22:1290,32:1289,196:1291,210:1293,211:[1,1295],212:[1,1294]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:1297}),o($VF1,$VG1),{115:[1,1298],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1299]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1301],102:1300,104:[1,1302],105:[1,1303],106:1304,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1305]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:1306,63:1307,68:1308,40:1309,74:1310,114:1314,75:[1,1311],76:[1,1312],77:[1,1313],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:1315,60:1316,69:1317,88:1318,90:1319,91:1323,95:1324,92:[1,1320],93:[1,1321],94:[1,1322],97:$VA5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1326,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:1327}),o($Vo1,$Vn1,{78:1328}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:1329}),o($Vm1,$Vs1,{95:898,91:1330,97:$Vw4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1331}),o($Vt1,$Vu1,{82:1332}),o($Vt1,$Vu1,{82:1333}),o($Vo1,$Vv1,{101:902,103:903,87:1334,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1335}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,1339],21:[1,1343],22:1337,32:1336,196:1338,210:1340,211:[1,1342],212:[1,1341]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:1344}),o($VF1,$VG1),{115:[1,1345],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1346]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1348],102:1347,104:[1,1349],105:[1,1350],106:1351,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1352]},o($Vt1,$Vt),o($Vt1,$Vu),o($Vo1,$VR4),o($VA4,$Vt2,{80:919,188:920,79:1353,186:$VB4}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1354,117:$VG2,143:$VH2,185:$VI2}),o($VA4,$Vt2,{80:919,188:920,79:1355,186:$VB4}),o($Vy3,$Vx2,{95:573,91:1356,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy2),o($Vy4,$V43),o($Vv3,$Vu3),o($VB5,$VF3),o($Vx3,$VG3),o($VB5,$VH3,{31:1357,189:[1,1358]}),{19:$VI3,21:$VJ3,22:614,124:1359,195:$VK3,210:617,211:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:1360,189:[1,1361]}),{19:$VI3,21:$VJ3,22:614,124:1362,195:$VK3,210:617,211:$VL3},o($VC5,$VN3),o($Vz3,$VG3),o($VC5,$VH3,{31:1363,189:[1,1364]}),{19:$VI3,21:$VJ3,22:614,124:1365,195:$VK3,210:617,211:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,1366]},o($VB3,$VH1),{96:[1,1368],102:1367,104:[1,1369],105:[1,1370],106:1371,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1372]},{117:[1,1373]},o($VB3,$V94),{19:[1,1376],21:[1,1379],22:1375,83:1374,210:1377,211:[1,1378]},o($VD3,$Vq3),o($VD3,$V82,{48:1380,49:[1,1381]}),o($Vv3,$V92),o($Vv3,$Vd1,{61:1382,63:1383,68:1384,40:1385,74:1386,114:1390,75:[1,1387],76:[1,1388],77:[1,1389],115:$VD,120:$VD,122:$VD}),o($Vv3,$Va2),o($Vv3,$Vf1,{64:1391,60:1392,69:1393,88:1394,90:1395,91:1399,95:1400,92:[1,1396],93:[1,1397],94:[1,1398],97:$VD5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1402,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vb2),o($Vx3,$Vn1,{78:1403}),o($Vy3,$Vn1,{78:1404}),o($VC5,$Vd2),o($VC5,$Ve2),o($VA3,$Vr1,{89:1405}),o($Vx3,$Vs1,{95:967,91:1406,97:$VE4,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:1407}),o($VB3,$Vu1,{82:1408}),o($VB3,$Vu1,{82:1409}),o($Vy3,$Vv1,{101:971,103:972,87:1410,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vz3,$Vn1,{78:1411}),o($VC5,$V11),o($VC5,$V21),{19:[1,1415],21:[1,1419],22:1413,32:1412,196:1414,210:1416,211:[1,1418],212:[1,1417]},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{158:1420}),o($VC3,$VG1),{115:[1,1421],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1422]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,1424],102:1423,104:[1,1425],105:[1,1426],106:1427,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1428]},o($VB3,$Vt),o($VB3,$Vu),o($Vv3,$V92),o($Vv3,$Vd1,{61:1429,63:1430,68:1431,40:1432,74:1433,114:1437,75:[1,1434],76:[1,1435],77:[1,1436],115:$VD,120:$VD,122:$VD}),o($Vv3,$Va2),o($Vv3,$Vf1,{64:1438,60:1439,69:1440,88:1441,90:1442,91:1446,95:1447,92:[1,1443],93:[1,1444],94:[1,1445],97:$VE5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1449,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vb2),o($Vx3,$Vn1,{78:1450}),o($Vy3,$Vn1,{78:1451}),o($VC5,$Vd2),o($VC5,$Ve2),o($VA3,$Vr1,{89:1452}),o($Vx3,$Vs1,{95:1003,91:1453,97:$VF4,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:1454}),o($VB3,$Vu1,{82:1455}),o($VB3,$Vu1,{82:1456}),o($Vy3,$Vv1,{101:1007,103:1008,87:1457,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vz3,$Vn1,{78:1458}),o($VC5,$V11),o($VC5,$V21),{19:[1,1462],21:[1,1466],22:1460,32:1459,196:1461,210:1463,211:[1,1465],212:[1,1464]},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{158:1467}),o($VC3,$VG1),{115:[1,1468],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,1469]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,1471],102:1470,104:[1,1472],105:[1,1473],106:1474,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1475]},o($VB3,$Vt),o($VB3,$Vu),{189:[1,1478],190:1476,191:[1,1477]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:1479,199:1480,107:[1,1481]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,1484],190:1482,191:[1,1483]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:1485,199:1486,107:[1,1487]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{189:[1,1490],190:1488,191:[1,1489]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:1491,199:1492,107:[1,1493]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),{19:[1,1496],21:[1,1499],22:1495,83:1494,210:1497,211:[1,1498]},o($VW3,$VL5),o($VW3,$VM5),o($VW3,$VN5),o($V44,$VO5),o($V44,$VP5),o($V44,$VQ5),o($Vx,$Vg,{42:1500,43:1501,51:1502,55:1503,36:1504,39:$Vy}),o($VR5,$V74),o($VR5,$V84),o($VR5,$Vq),o($VR5,$Vr),o($VR5,$Vt),o($VR5,$Vu),{66:[1,1505]},{66:$VS3},{66:$VT3,128:1506,129:1507,130:$VS5},{66:$VV3},o($VT5,$VX3),o($VT5,$VY3),o($VT5,$VZ3,{134:1509,137:1510,138:1513,135:$VU5,136:$VV5}),o($V04,$V14,{150:647,140:1514,145:1515,146:1516,149:1517,65:[1,1518],155:$V24,156:$V34}),o($VW5,$V54),{19:[1,1522],21:[1,1526],22:1520,144:1519,196:1521,210:1523,211:[1,1525],212:[1,1524]},o($V04,[2,177]),o($V04,[2,179]),o($Va5,[2,188]),{19:$Vb5,21:$Vc5,22:1121,210:1125,211:$Vr5},o($Va5,[2,190]),{96:$Vd5,104:$Ve5,105:$Vf5,106:1132,177:1122,192:1126,193:1127,194:1128,197:1131,200:$Vh5,201:$Vi5,202:$Vj5,203:$Vk5,204:$Vl5,205:$Vm5,206:$Vn5,207:$Vo5,208:$Vp5,209:$Vq5},o($Va5,[2,192]),{181:$Vg5},o($Va5,$VX5,{176:1527,174:$VY5}),o($Va5,$VX5,{176:1529,174:$VY5}),o($Va5,$VX5,{176:1530,174:$VY5}),o($VZ5,$Vq),o($VZ5,$Vr),o($VZ5,$Vc4),o($VZ5,$Vd4),o($VZ5,$Ve4),o($VZ5,$Vt),o($VZ5,$Vu),o($VZ5,$Vf4),o($VZ5,$Vg4,{198:1531,199:1532,107:[1,1533]}),o($VZ5,$Vh4),o($VZ5,$Vi4),o($VZ5,$Vj4),o($VZ5,$Vk4),o($VZ5,$Vl4),o($VZ5,$Vm4),o($VZ5,$Vn4),o($VZ5,$Vo4),o($VZ5,$Vp4),o($V_5,$V93),o($V_5,$Va3),o($V_5,$Vb3),o($V_5,$Vc3),o($VD1,[2,199],{166:1534,175:$V75}),o($VD1,[2,208],{168:1535,175:$V85}),o($VD1,[2,216],{170:1536,175:$V95}),o($Vb4,$V$5),o($Vb4,$VC1),o($Va1,$Vk3),o($VC,$VD,{58:1537,60:1538,62:1539,63:1540,69:1543,71:1544,68:1545,40:1546,88:1547,90:1548,83:1550,84:1551,85:1552,74:1553,91:1560,22:1561,87:1563,114:1564,95:1565,210:1568,101:1569,103:1570,19:[1,1567],21:[1,1572],65:[1,1541],67:[1,1542],75:[1,1554],76:[1,1555],77:[1,1556],81:[1,1549],92:[1,1557],93:[1,1558],94:[1,1559],97:$V06,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,1562],211:[1,1571]}),o($Vu2,$Vt2,{80:1173,188:1174,79:1573,186:$Vv5}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1574,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:1173,188:1174,79:1575,186:$Vv5}),o($Vo1,$Vx2,{95:714,91:1576,97:$Vr4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:1577,189:[1,1578]}),{19:$VI3,21:$VJ3,22:614,124:1579,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:1580,189:[1,1581]}),{19:$VI3,21:$VJ3,22:614,124:1582,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,1583]},o($Vt1,$VH1),{96:[1,1585],102:1584,104:[1,1586],105:[1,1587],106:1588,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1589]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:1590,189:[1,1591]}),{19:$VI3,21:$VJ3,22:614,124:1592,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,1593]},{19:[1,1596],21:[1,1599],22:1595,83:1594,210:1597,211:[1,1598]},o($Vu2,$Vt2,{80:1211,188:1212,79:1600,186:$Vx5}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1601,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:1211,188:1212,79:1602,186:$Vx5}),o($Vo1,$Vx2,{95:761,91:1603,97:$Vs4,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:1604,189:[1,1605]}),{19:$VI3,21:$VJ3,22:614,124:1606,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:1607,189:[1,1608]}),{19:$VI3,21:$VJ3,22:614,124:1609,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,1610]},o($Vt1,$VH1),{96:[1,1612],102:1611,104:[1,1613],105:[1,1614],106:1615,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,1616]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:1617,189:[1,1618]}),{19:$VI3,21:$VJ3,22:614,124:1619,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,1620]},{19:[1,1623],21:[1,1626],22:1622,83:1621,210:1624,211:[1,1625]},o($Va1,$Vx4),o($Va1,$VN3),{117:[1,1627]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:1628,210:52,211:$Vp},{19:$V16,21:$V26,22:1630,96:[1,1641],104:[1,1642],105:[1,1643],106:1640,177:1631,187:1629,192:1634,193:1635,194:1636,197:1639,200:[1,1644],201:[1,1645],202:[1,1650],203:[1,1651],204:[1,1652],205:[1,1653],206:[1,1646],207:[1,1647],208:[1,1648],209:[1,1649],210:1633,211:$V36},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:1654,210:52,211:$Vp},{19:$V46,21:$V56,22:1656,96:[1,1667],104:[1,1668],105:[1,1669],106:1666,177:1657,187:1655,192:1660,193:1661,194:1662,197:1665,200:[1,1670],201:[1,1671],202:[1,1676],203:[1,1677],204:[1,1678],205:[1,1679],206:[1,1672],207:[1,1673],208:[1,1674],209:[1,1675],210:1659,211:$V66},o($Vw2,$VG4),{19:$Vn,21:$Vo,22:1680,210:52,211:$Vp},{19:$V76,21:$V86,22:1682,96:[1,1693],104:[1,1694],105:[1,1695],106:1692,177:1683,187:1681,192:1686,193:1687,194:1688,197:1691,200:[1,1696],201:[1,1697],202:[1,1702],203:[1,1703],204:[1,1704],205:[1,1705],206:[1,1698],207:[1,1699],208:[1,1700],209:[1,1701],210:1685,211:$V96},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,1706]},o($Vt1,$Vd3),o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$Vr3),o($Vx,$Vg,{50:1707,36:1708,39:$Vy}),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1709}),o($Va1,$V11),o($Va1,$V21),{19:[1,1713],21:[1,1717],22:1711,32:1710,196:1712,210:1714,211:[1,1716],212:[1,1715]},{115:[1,1718],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1719}),o($Vl2,$Vr1,{89:1720}),o($Vo1,$Vs1,{95:1277,91:1721,97:$Vz5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1722]},o($Vl2,$VH1),{66:[1,1723]},o($Vs2,$Vt2,{79:1724,80:1725,188:1726,186:[1,1727]}),o($Vu2,$Vt2,{79:1728,80:1729,188:1730,186:$Va6}),o($Vm1,$Vx2,{95:862,91:1732,97:$Vv4,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1733,91:1734,87:1735,95:1736,101:1738,103:1739,97:$Vb6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1733,91:1734,87:1735,95:1736,101:1738,103:1739,97:$Vb6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1733,91:1734,87:1735,95:1736,101:1738,103:1739,97:$Vb6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1740,80:1741,188:1742,186:[1,1743]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1744],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1745,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1746]},o($VF1,$Vd3),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:1747}),o($Va1,$V11),o($Va1,$V21),{19:[1,1751],21:[1,1755],22:1749,32:1748,196:1750,210:1752,211:[1,1754],212:[1,1753]},{115:[1,1756],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:1757}),o($Vl2,$Vr1,{89:1758}),o($Vo1,$Vs1,{95:1324,91:1759,97:$VA5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,1760]},o($Vl2,$VH1),{66:[1,1761]},o($Vs2,$Vt2,{79:1762,80:1763,188:1764,186:[1,1765]}),o($Vu2,$Vt2,{79:1766,80:1767,188:1768,186:$Vc6}),o($Vm1,$Vx2,{95:898,91:1770,97:$Vw4,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:1771,91:1772,87:1773,95:1774,101:1776,103:1777,97:$Vd6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:1771,91:1772,87:1773,95:1774,101:1776,103:1777,97:$Vd6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:1771,91:1772,87:1773,95:1774,101:1776,103:1777,97:$Vd6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:1778,80:1779,188:1780,186:[1,1781]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1782],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1783,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,1784]},o($VF1,$Vd3),o($Vv3,$VN3),{117:[1,1785]},o($Vv3,$VF3),o($Vy4,$VO3),o($Vz4,$VG4),{19:$Vn,21:$Vo,22:1786,210:52,211:$Vp},{19:$Ve6,21:$Vf6,22:1788,96:[1,1799],104:[1,1800],105:[1,1801],106:1798,177:1789,187:1787,192:1792,193:1793,194:1794,197:1797,200:[1,1802],201:[1,1803],202:[1,1808],203:[1,1809],204:[1,1810],205:[1,1811],206:[1,1804],207:[1,1805],208:[1,1806],209:[1,1807],210:1791,211:$Vg6},o($VA4,$VG4),{19:$Vn,21:$Vo,22:1812,210:52,211:$Vp},{19:$Vh6,21:$Vi6,22:1814,96:[1,1825],104:[1,1826],105:[1,1827],106:1824,177:1815,187:1813,192:1818,193:1819,194:1820,197:1823,200:[1,1828],201:[1,1829],202:[1,1834],203:[1,1835],204:[1,1836],205:[1,1837],206:[1,1830],207:[1,1831],208:[1,1832],209:[1,1833],210:1817,211:$Vj6},o($VC4,$VG4),{19:$Vn,21:$Vo,22:1838,210:52,211:$Vp},{19:$Vk6,21:$Vl6,22:1840,96:[1,1851],104:[1,1852],105:[1,1853],106:1850,177:1841,187:1839,192:1844,193:1845,194:1846,197:1849,200:[1,1854],201:[1,1855],202:[1,1860],203:[1,1861],204:[1,1862],205:[1,1863],206:[1,1856],207:[1,1857],208:[1,1858],209:[1,1859],210:1843,211:$Vm6},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,1864]},o($VB3,$Vd3),o($Vz3,$VR4),o($VC3,$Vu5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($Vv3,$Vr3),o($Vx,$Vg,{50:1865,36:1866,39:$Vy}),o($Vv3,$Vs3),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:1867}),o($Vv3,$V11),o($Vv3,$V21),{19:[1,1871],21:[1,1875],22:1869,32:1868,196:1870,210:1872,211:[1,1874],212:[1,1873]},{115:[1,1876],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vt3),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:1877}),o($Vy4,$Vr1,{89:1878}),o($Vy3,$Vs1,{95:1400,91:1879,97:$VD5,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy1),o($Vy4,$Vz1),o($Vy4,$VA1),o($Vy4,$VB1),{96:[1,1880]},o($Vy4,$VH1),{66:[1,1881]},o($Vz4,$Vt2,{79:1882,80:1883,188:1884,186:[1,1885]}),o($VA4,$Vt2,{79:1886,80:1887,188:1888,186:$Vn6}),o($Vx3,$Vx2,{95:967,91:1890,97:$VE4,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:1891,91:1892,87:1893,95:1894,101:1896,103:1897,97:$Vo6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:1891,91:1892,87:1893,95:1894,101:1896,103:1897,97:$Vo6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:1891,91:1892,87:1893,95:1894,101:1896,103:1897,97:$Vo6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VC4,$Vt2,{79:1898,80:1899,188:1900,186:[1,1901]}),o($VC5,$VR1),o($VC5,$Vl),o($VC5,$Vm),o($VC5,$Vq),o($VC5,$Vr),o($VC5,$Vs),o($VC5,$Vt),o($VC5,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1902],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1903,117:$VG2,143:$VH2,185:$VI2}),o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,1904]},o($VC3,$Vd3),o($Vv3,$Vs3),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:1905}),o($Vv3,$V11),o($Vv3,$V21),{19:[1,1909],21:[1,1913],22:1907,32:1906,196:1908,210:1910,211:[1,1912],212:[1,1911]},{115:[1,1914],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vt3),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:1915}),o($Vy4,$Vr1,{89:1916}),o($Vy3,$Vs1,{95:1447,91:1917,97:$VE5,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy1),o($Vy4,$Vz1),o($Vy4,$VA1),o($Vy4,$VB1),{96:[1,1918]},o($Vy4,$VH1),{66:[1,1919]},o($Vz4,$Vt2,{79:1920,80:1921,188:1922,186:[1,1923]}),o($VA4,$Vt2,{79:1924,80:1925,188:1926,186:$Vp6}),o($Vx3,$Vx2,{95:1003,91:1928,97:$VF4,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:1929,91:1930,87:1931,95:1932,101:1934,103:1935,97:$Vq6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:1929,91:1930,87:1931,95:1932,101:1934,103:1935,97:$Vq6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:1929,91:1930,87:1931,95:1932,101:1934,103:1935,97:$Vq6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VC4,$Vt2,{79:1936,80:1937,188:1938,186:[1,1939]}),o($VC5,$VR1),o($VC5,$Vl),o($VC5,$Vm),o($VC5,$Vq),o($VC5,$Vr),o($VC5,$Vs),o($VC5,$Vt),o($VC5,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,1940],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:1941,117:$VG2,143:$VH2,185:$VI2}),o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,1942]},o($VC3,$Vd3),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$VH4,21:$VI4,22:1944,83:1943,210:1016,211:$VJ4},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$VL4,21:$VM4,22:1946,83:1945,210:1042,211:$VN4},o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VO4,21:$VP4,22:1948,83:1947,210:1068,211:$VQ4},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vr6,$Vs6,{147:1949,148:1950,151:$Vt6,152:$Vu6,153:$Vv6,154:$Vw6}),o($Vx6,$Vy6),o($Vz6,$VA6,{52:1955}),o($VB6,$VC6,{56:1956}),o($VC,$VD,{59:1957,69:1958,71:1959,72:1960,88:1963,90:1964,83:1966,84:1967,85:1968,74:1969,40:1970,91:1974,22:1975,87:1977,114:1978,95:1982,210:1985,101:1986,103:1987,19:[1,1984],21:[1,1989],65:[1,1961],67:[1,1962],75:[1,1979],76:[1,1980],77:[1,1981],81:[1,1965],92:[1,1971],93:[1,1972],94:[1,1973],97:$VD6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,1976],211:[1,1988]}),o($Vr6,$Vs6,{148:1950,147:1990,151:$Vt6,152:$Vu6,153:$Vv6,154:$Vw6}),{66:$VS4,129:1991,130:$VS5},o($VT5,$VT4),o($VE2,$VF2,{142:366,131:1107,132:1108,133:1109,139:1110,141:1111,126:1992,143:$VH2,185:$V35}),o($VT5,$VU4),o($VT5,$VZ3,{134:1993,138:1994,135:$VU5,136:$VV5}),o($VE2,$VF2,{142:366,139:1110,141:1111,133:1995,66:$VV4,130:$VV4,143:$VH2,185:$V35}),o($VE2,$VF2,{142:366,139:1110,141:1111,133:1996,66:$VW4,130:$VW4,143:$VH2,185:$V35}),o($VW5,$VX4),o($VW5,$VY4),o($VW5,$VZ4),o($VW5,$V_4),{19:$V$4,21:$V05,22:1097,124:1997,195:$V15,210:1100,211:$V25},o($VE2,$VF2,{142:366,125:1104,126:1105,127:1106,131:1107,132:1108,133:1109,139:1110,141:1111,121:1998,143:$VH2,185:$V35}),o($VW5,$V45),o($VW5,$V55),o($VW5,$V65),o($VW5,$Vq),o($VW5,$Vr),o($VW5,$Vs),o($VW5,$Vt),o($VW5,$Vu),o($Va5,[2,202]),o($Va5,[2,204]),o($Va5,[2,211]),o($Va5,[2,219]),o($VZ5,$Vs5),o($VZ5,$Vt5),{19:$Vb5,21:$Vc5,22:2000,83:1999,210:1125,211:$Vr5},o($Va5,[2,198]),o($Va5,[2,207]),o($Va5,[2,215]),o($Va1,$V92),o($Va1,$Vd1,{61:2001,63:2002,68:2003,40:2004,74:2005,114:2009,75:[1,2006],76:[1,2007],77:[1,2008],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:2010,60:2011,69:2012,88:2013,90:2014,91:2018,95:2019,92:[1,2015],93:[1,2016],94:[1,2017],97:$VE6,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2021,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:2022}),o($Vo1,$Vn1,{78:2023}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:2024}),o($Vm1,$Vs1,{95:1565,91:2025,97:$V06,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2026}),o($Vt1,$Vu1,{82:2027}),o($Vt1,$Vu1,{82:2028}),o($Vo1,$Vv1,{101:1569,103:1570,87:2029,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2030}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,2034],21:[1,2038],22:2032,32:2031,196:2033,210:2035,211:[1,2037],212:[1,2036]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:2039}),o($VF1,$VG1),{115:[1,2040],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2041]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2043],102:2042,104:[1,2044],105:[1,2045],106:2046,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2047]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VN3),{117:[1,2048]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:2049,210:52,211:$Vp},{19:$VF6,21:$VG6,22:2051,96:[1,2062],104:[1,2063],105:[1,2064],106:2061,177:2052,187:2050,192:2055,193:2056,194:2057,197:2060,200:[1,2065],201:[1,2066],202:[1,2071],203:[1,2072],204:[1,2073],205:[1,2074],206:[1,2067],207:[1,2068],208:[1,2069],209:[1,2070],210:2054,211:$VH6},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:2075,210:52,211:$Vp},{19:$VI6,21:$VJ6,22:2077,96:[1,2088],104:[1,2089],105:[1,2090],106:2087,177:2078,187:2076,192:2081,193:2082,194:2083,197:2086,200:[1,2091],201:[1,2092],202:[1,2097],203:[1,2098],204:[1,2099],205:[1,2100],206:[1,2093],207:[1,2094],208:[1,2095],209:[1,2096],210:2080,211:$VK6},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2101]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:2102,210:52,211:$Vp},{19:$VL6,21:$VM6,22:2104,96:[1,2115],104:[1,2116],105:[1,2117],106:2114,177:2105,187:2103,192:2108,193:2109,194:2110,197:2113,200:[1,2118],201:[1,2119],202:[1,2124],203:[1,2125],204:[1,2126],205:[1,2127],206:[1,2120],207:[1,2121],208:[1,2122],209:[1,2123],210:2107,211:$VN6},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$VN3),{117:[1,2128]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:2129,210:52,211:$Vp},{19:$VO6,21:$VP6,22:2131,96:[1,2142],104:[1,2143],105:[1,2144],106:2141,177:2132,187:2130,192:2135,193:2136,194:2137,197:2140,200:[1,2145],201:[1,2146],202:[1,2151],203:[1,2152],204:[1,2153],205:[1,2154],206:[1,2147],207:[1,2148],208:[1,2149],209:[1,2150],210:2134,211:$VQ6},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:2155,210:52,211:$Vp},{19:$VR6,21:$VS6,22:2157,96:[1,2168],104:[1,2169],105:[1,2170],106:2167,177:2158,187:2156,192:2161,193:2162,194:2163,197:2166,200:[1,2171],201:[1,2172],202:[1,2177],203:[1,2178],204:[1,2179],205:[1,2180],206:[1,2173],207:[1,2174],208:[1,2175],209:[1,2176],210:2160,211:$VT6},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2181]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:2182,210:52,211:$Vp},{19:$VU6,21:$VV6,22:2184,96:[1,2195],104:[1,2196],105:[1,2197],106:2194,177:2185,187:2183,192:2188,193:2189,194:2190,197:2193,200:[1,2198],201:[1,2199],202:[1,2204],203:[1,2205],204:[1,2206],205:[1,2207],206:[1,2200],207:[1,2201],208:[1,2202],209:[1,2203],210:2187,211:$VW6},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vo1,$VR4),{189:[1,2210],190:2208,191:[1,2209]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:2211,199:2212,107:[1,2213]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,2216],190:2214,191:[1,2215]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:2217,199:2218,107:[1,2219]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{189:[1,2222],190:2220,191:[1,2221]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:2223,199:2224,107:[1,2225]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),{19:[1,2228],21:[1,2231],22:2227,83:2226,210:2229,211:[1,2230]},o($Va1,$Vk3),o($VC,$VD,{58:2232,60:2233,62:2234,63:2235,69:2238,71:2239,68:2240,40:2241,88:2242,90:2243,83:2245,84:2246,85:2247,74:2248,91:2255,22:2256,87:2258,114:2259,95:2260,210:2263,101:2264,103:2265,19:[1,2262],21:[1,2267],65:[1,2236],67:[1,2237],75:[1,2249],76:[1,2250],77:[1,2251],81:[1,2244],92:[1,2252],93:[1,2253],94:[1,2254],97:$VX6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,2257],211:[1,2266]}),o($Vu2,$Vt2,{80:1729,188:1730,79:2268,186:$Va6}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2269,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:1729,188:1730,79:2270,186:$Va6}),o($Vo1,$Vx2,{95:1277,91:2271,97:$Vz5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:2272,189:[1,2273]}),{19:$VI3,21:$VJ3,22:614,124:2274,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:2275,189:[1,2276]}),{19:$VI3,21:$VJ3,22:614,124:2277,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,2278]},o($Vt1,$VH1),{96:[1,2280],102:2279,104:[1,2281],105:[1,2282],106:2283,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2284]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:2285,189:[1,2286]}),{19:$VI3,21:$VJ3,22:614,124:2287,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,2288]},{19:[1,2291],21:[1,2294],22:2290,83:2289,210:2292,211:[1,2293]},o($Vu2,$Vt2,{80:1767,188:1768,79:2295,186:$Vc6}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2296,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:1767,188:1768,79:2297,186:$Vc6}),o($Vo1,$Vx2,{95:1324,91:2298,97:$VA5,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:2299,189:[1,2300]}),{19:$VI3,21:$VJ3,22:614,124:2301,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:2302,189:[1,2303]}),{19:$VI3,21:$VJ3,22:614,124:2304,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,2305]},o($Vt1,$VH1),{96:[1,2307],102:2306,104:[1,2308],105:[1,2309],106:2310,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2311]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:2312,189:[1,2313]}),{19:$VI3,21:$VJ3,22:614,124:2314,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,2315]},{19:[1,2318],21:[1,2321],22:2317,83:2316,210:2319,211:[1,2320]},o($Vy3,$VR4),{189:[1,2324],190:2322,191:[1,2323]},o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$VH5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Ve4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Vf4),o($Vx3,$Vg4,{198:2325,199:2326,107:[1,2327]}),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($Vx3,$Vp4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{189:[1,2330],190:2328,191:[1,2329]},o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$VH5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Ve4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Vf4),o($Vy3,$Vg4,{198:2331,199:2332,107:[1,2333]}),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($Vy3,$Vp4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),{189:[1,2336],190:2334,191:[1,2335]},o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$VH5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Ve4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Vf4),o($Vz3,$Vg4,{198:2337,199:2338,107:[1,2339]}),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($Vz3,$Vp4),o($V_6,$V93),o($V_6,$Va3),o($V_6,$Vb3),o($V_6,$Vc3),{19:[1,2342],21:[1,2345],22:2341,83:2340,210:2343,211:[1,2344]},o($Vv3,$Vk3),o($VC,$VD,{58:2346,60:2347,62:2348,63:2349,69:2352,71:2353,68:2354,40:2355,88:2356,90:2357,83:2359,84:2360,85:2361,74:2362,91:2369,22:2370,87:2372,114:2373,95:2374,210:2377,101:2378,103:2379,19:[1,2376],21:[1,2381],65:[1,2350],67:[1,2351],75:[1,2363],76:[1,2364],77:[1,2365],81:[1,2358],92:[1,2366],93:[1,2367],94:[1,2368],97:$V$6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,2371],211:[1,2380]}),o($VA4,$Vt2,{80:1887,188:1888,79:2382,186:$Vn6}),o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2383,117:$VG2,143:$VH2,185:$VI2}),o($VA4,$Vt2,{80:1887,188:1888,79:2384,186:$Vn6}),o($Vy3,$Vx2,{95:1400,91:2385,97:$VD5,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy2),o($Vy4,$V43),o($Vv3,$Vx4),o($VB5,$VF3),o($Vx3,$VG3),o($VB5,$VH3,{31:2386,189:[1,2387]}),{19:$VI3,21:$VJ3,22:614,124:2388,195:$VK3,210:617,211:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:2389,189:[1,2390]}),{19:$VI3,21:$VJ3,22:614,124:2391,195:$VK3,210:617,211:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,2392]},o($VB3,$VH1),{96:[1,2394],102:2393,104:[1,2395],105:[1,2396],106:2397,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2398]},o($VC5,$VN3),o($Vz3,$VG3),o($VC5,$VH3,{31:2399,189:[1,2400]}),{19:$VI3,21:$VJ3,22:614,124:2401,195:$VK3,210:617,211:$VL3},o($VB3,$V94),{117:[1,2402]},{19:[1,2405],21:[1,2408],22:2404,83:2403,210:2406,211:[1,2407]},o($VA4,$Vt2,{80:1925,188:1926,79:2409,186:$Vp6}),o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2410,117:$VG2,143:$VH2,185:$VI2}),o($VA4,$Vt2,{80:1925,188:1926,79:2411,186:$Vp6}),o($Vy3,$Vx2,{95:1447,91:2412,97:$VE5,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy2),o($Vy4,$V43),o($Vv3,$Vx4),o($VB5,$VF3),o($Vx3,$VG3),o($VB5,$VH3,{31:2413,189:[1,2414]}),{19:$VI3,21:$VJ3,22:614,124:2415,195:$VK3,210:617,211:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:2416,189:[1,2417]}),{19:$VI3,21:$VJ3,22:614,124:2418,195:$VK3,210:617,211:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,2419]},o($VB3,$VH1),{96:[1,2421],102:2420,104:[1,2422],105:[1,2423],106:2424,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2425]},o($VC5,$VN3),o($Vz3,$VG3),o($VC5,$VH3,{31:2426,189:[1,2427]}),{19:$VI3,21:$VJ3,22:614,124:2428,195:$VK3,210:617,211:$VL3},o($VB3,$V94),{117:[1,2429]},{19:[1,2432],21:[1,2435],22:2431,83:2430,210:2433,211:[1,2434]},o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vr6,$Vn1,{78:2436}),o($Vr6,$V07),o($Vr6,$V17),o($Vr6,$V27),o($Vr6,$V37),o($Vr6,$V47),o($Vx6,$V57,{53:2437,47:[1,2438]}),o($Vz6,$V67,{57:2439,49:[1,2440]}),o($VB6,$V77),o($VB6,$V87,{70:2441,72:2442,74:2443,40:2444,114:2445,75:[1,2446],76:[1,2447],77:[1,2448],115:$VD,120:$VD,122:$VD}),o($VB6,$V97),o($VB6,$Va7,{73:2449,69:2450,88:2451,90:2452,91:2456,95:2457,92:[1,2453],93:[1,2454],94:[1,2455],97:$Vb7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2459,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VB6,$Vc7),o($Vd7,$Vr1,{89:2460}),o($Ve7,$Vs1,{95:1982,91:2461,97:$VD6,98:$VL,99:$VM,100:$VN}),o($Vf7,$Vu1,{82:2462}),o($Vf7,$Vu1,{82:2463}),o($Vf7,$Vu1,{82:2464}),o($VB6,$Vv1,{101:1986,103:1987,87:2465,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vg7,$Vh7),o($Vg7,$Vi7),o($Vd7,$Vy1),o($Vd7,$Vz1),o($Vd7,$VA1),o($Vd7,$VB1),o($Vf7,$VC1),o($VD1,$VE1,{158:2466}),o($Vj7,$VG1),{115:[1,2467],118:195,119:196,120:$Vw1,122:$Vx1},o($Vg7,$V11),o($Vg7,$V21),{19:[1,2471],21:[1,2475],22:2469,32:2468,196:2470,210:2472,211:[1,2474],212:[1,2473]},{96:[1,2476]},o($Vd7,$VH1),o($Vf7,$Vq),o($Vf7,$Vr),{96:[1,2478],102:2477,104:[1,2479],105:[1,2480],106:2481,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2482]},o($Vf7,$Vt),o($Vf7,$Vu),o($Vr6,$Vn1,{78:2483}),o($VT5,$VL5),o($VT5,$VM5),o($VT5,$VN5),o($VW5,$VO5),o($VW5,$VP5),o($VW5,$VQ5),o($Vx,$Vg,{42:2484,43:2485,51:2486,55:2487,36:2488,39:$Vy}),{66:[1,2489]},o($VZ5,$V$5),o($VZ5,$VC1),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:2490}),o($Va1,$V11),o($Va1,$V21),{19:[1,2494],21:[1,2498],22:2492,32:2491,196:2493,210:2495,211:[1,2497],212:[1,2496]},{115:[1,2499],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:2500}),o($Vl2,$Vr1,{89:2501}),o($Vo1,$Vs1,{95:2019,91:2502,97:$VE6,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,2503]},o($Vl2,$VH1),{66:[1,2504]},o($Vs2,$Vt2,{79:2505,80:2506,188:2507,186:[1,2508]}),o($Vu2,$Vt2,{79:2509,80:2510,188:2511,186:$Vk7}),o($Vm1,$Vx2,{95:1565,91:2513,97:$V06,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:2514,91:2515,87:2516,95:2517,101:2519,103:2520,97:$Vl7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:2514,91:2515,87:2516,95:2517,101:2519,103:2520,97:$Vl7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:2514,91:2515,87:2516,95:2517,101:2519,103:2520,97:$Vl7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:2521,80:2522,188:2523,186:[1,2524]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,2525],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:2526,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,2527]},o($VF1,$Vd3),o($Vo1,$VR4),{189:[1,2530],190:2528,191:[1,2529]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:2531,199:2532,107:[1,2533]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,2536],190:2534,191:[1,2535]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:2537,199:2538,107:[1,2539]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,2542],21:[1,2545],22:2541,83:2540,210:2543,211:[1,2544]},{189:[1,2548],190:2546,191:[1,2547]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:2549,199:2550,107:[1,2551]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vo1,$VR4),{189:[1,2554],190:2552,191:[1,2553]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:2555,199:2556,107:[1,2557]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,2560],190:2558,191:[1,2559]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:2561,199:2562,107:[1,2563]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,2566],21:[1,2569],22:2565,83:2564,210:2567,211:[1,2568]},{189:[1,2572],190:2570,191:[1,2571]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:2573,199:2574,107:[1,2575]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$V16,21:$V26,22:2577,83:2576,210:1633,211:$V36},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$V46,21:$V56,22:2579,83:2578,210:1659,211:$V66},o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$V76,21:$V86,22:2581,83:2580,210:1685,211:$V96},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$V92),o($Va1,$Vd1,{61:2582,63:2583,68:2584,40:2585,74:2586,114:2590,75:[1,2587],76:[1,2588],77:[1,2589],115:$VD,120:$VD,122:$VD}),o($Va1,$Va2),o($Va1,$Vf1,{64:2591,60:2592,69:2593,88:2594,90:2595,91:2599,95:2600,92:[1,2596],93:[1,2597],94:[1,2598],97:$Vm7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2602,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vb2),o($Vm1,$Vn1,{78:2603}),o($Vo1,$Vn1,{78:2604}),o($Vc2,$Vd2),o($Vc2,$Ve2),o($Vq1,$Vr1,{89:2605}),o($Vm1,$Vs1,{95:2260,91:2606,97:$VX6,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2607}),o($Vt1,$Vu1,{82:2608}),o($Vt1,$Vu1,{82:2609}),o($Vo1,$Vv1,{101:2264,103:2265,87:2610,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2611}),o($Vc2,$V11),o($Vc2,$V21),{19:[1,2615],21:[1,2619],22:2613,32:2612,196:2614,210:2616,211:[1,2618],212:[1,2617]},o($Vq1,$Vy1),o($Vq1,$Vz1),o($Vq1,$VA1),o($Vq1,$VB1),o($Vt1,$VC1),o($VD1,$VE1,{158:2620}),o($VF1,$VG1),{115:[1,2621],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2622]},o($Vq1,$VH1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2624],102:2623,104:[1,2625],105:[1,2626],106:2627,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2628]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VN3),{117:[1,2629]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:2630,210:52,211:$Vp},{19:$Vn7,21:$Vo7,22:2632,96:[1,2643],104:[1,2644],105:[1,2645],106:2642,177:2633,187:2631,192:2636,193:2637,194:2638,197:2641,200:[1,2646],201:[1,2647],202:[1,2652],203:[1,2653],204:[1,2654],205:[1,2655],206:[1,2648],207:[1,2649],208:[1,2650],209:[1,2651],210:2635,211:$Vp7},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:2656,210:52,211:$Vp},{19:$Vq7,21:$Vr7,22:2658,96:[1,2669],104:[1,2670],105:[1,2671],106:2668,177:2659,187:2657,192:2662,193:2663,194:2664,197:2667,200:[1,2672],201:[1,2673],202:[1,2678],203:[1,2679],204:[1,2680],205:[1,2681],206:[1,2674],207:[1,2675],208:[1,2676],209:[1,2677],210:2661,211:$Vs7},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2682]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:2683,210:52,211:$Vp},{19:$Vt7,21:$Vu7,22:2685,96:[1,2696],104:[1,2697],105:[1,2698],106:2695,177:2686,187:2684,192:2689,193:2690,194:2691,197:2694,200:[1,2699],201:[1,2700],202:[1,2705],203:[1,2706],204:[1,2707],205:[1,2708],206:[1,2701],207:[1,2702],208:[1,2703],209:[1,2704],210:2688,211:$Vv7},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Va1,$VN3),{117:[1,2709]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:2710,210:52,211:$Vp},{19:$Vw7,21:$Vx7,22:2712,96:[1,2723],104:[1,2724],105:[1,2725],106:2722,177:2713,187:2711,192:2716,193:2717,194:2718,197:2721,200:[1,2726],201:[1,2727],202:[1,2732],203:[1,2733],204:[1,2734],205:[1,2735],206:[1,2728],207:[1,2729],208:[1,2730],209:[1,2731],210:2715,211:$Vy7},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:2736,210:52,211:$Vp},{19:$Vz7,21:$VA7,22:2738,96:[1,2749],104:[1,2750],105:[1,2751],106:2748,177:2739,187:2737,192:2742,193:2743,194:2744,197:2747,200:[1,2752],201:[1,2753],202:[1,2758],203:[1,2759],204:[1,2760],205:[1,2761],206:[1,2754],207:[1,2755],208:[1,2756],209:[1,2757],210:2741,211:$VB7},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,2762]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:2763,210:52,211:$Vp},{19:$VC7,21:$VD7,22:2765,96:[1,2776],104:[1,2777],105:[1,2778],106:2775,177:2766,187:2764,192:2769,193:2770,194:2771,197:2774,200:[1,2779],201:[1,2780],202:[1,2785],203:[1,2786],204:[1,2787],205:[1,2788],206:[1,2781],207:[1,2782],208:[1,2783],209:[1,2784],210:2768,211:$VE7},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vx3,$Vs5),o($Vx3,$Vt5),{19:$Ve6,21:$Vf6,22:2790,83:2789,210:1791,211:$Vg6},o($VA4,$VS1),o($VA4,$VT1),o($VA4,$VU1),o($Vy3,$Vs5),o($Vy3,$Vt5),{19:$Vh6,21:$Vi6,22:2792,83:2791,210:1817,211:$Vj6},o($VC4,$VS1),o($VC4,$VT1),o($VC4,$VU1),o($Vz3,$Vs5),o($Vz3,$Vt5),{19:$Vk6,21:$Vl6,22:2794,83:2793,210:1843,211:$Vm6},o($VB3,$Vu5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($Vv3,$V92),o($Vv3,$Vd1,{61:2795,63:2796,68:2797,40:2798,74:2799,114:2803,75:[1,2800],76:[1,2801],77:[1,2802],115:$VD,120:$VD,122:$VD}),o($Vv3,$Va2),o($Vv3,$Vf1,{64:2804,60:2805,69:2806,88:2807,90:2808,91:2812,95:2813,92:[1,2809],93:[1,2810],94:[1,2811],97:$VF7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2815,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vv3,$Vb2),o($Vx3,$Vn1,{78:2816}),o($Vy3,$Vn1,{78:2817}),o($VC5,$Vd2),o($VC5,$Ve2),o($VA3,$Vr1,{89:2818}),o($Vx3,$Vs1,{95:2374,91:2819,97:$V$6,98:$VL,99:$VM,100:$VN}),o($VB3,$Vu1,{82:2820}),o($VB3,$Vu1,{82:2821}),o($VB3,$Vu1,{82:2822}),o($Vy3,$Vv1,{101:2378,103:2379,87:2823,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vz3,$Vn1,{78:2824}),o($VC5,$V11),o($VC5,$V21),{19:[1,2828],21:[1,2832],22:2826,32:2825,196:2827,210:2829,211:[1,2831],212:[1,2830]},o($VA3,$Vy1),o($VA3,$Vz1),o($VA3,$VA1),o($VA3,$VB1),o($VB3,$VC1),o($VD1,$VE1,{158:2833}),o($VC3,$VG1),{115:[1,2834],118:195,119:196,120:$Vw1,122:$Vx1},{96:[1,2835]},o($VA3,$VH1),o($VB3,$Vq),o($VB3,$Vr),{96:[1,2837],102:2836,104:[1,2838],105:[1,2839],106:2840,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,2841]},o($VB3,$Vt),o($VB3,$Vu),o($Vv3,$VN3),{117:[1,2842]},o($Vv3,$VF3),o($Vy4,$VO3),o($Vz4,$VG4),{19:$Vn,21:$Vo,22:2843,210:52,211:$Vp},{19:$VG7,21:$VH7,22:2845,96:[1,2856],104:[1,2857],105:[1,2858],106:2855,177:2846,187:2844,192:2849,193:2850,194:2851,197:2854,200:[1,2859],201:[1,2860],202:[1,2865],203:[1,2866],204:[1,2867],205:[1,2868],206:[1,2861],207:[1,2862],208:[1,2863],209:[1,2864],210:2848,211:$VI7},o($VA4,$VG4),{19:$Vn,21:$Vo,22:2869,210:52,211:$Vp},{19:$VJ7,21:$VK7,22:2871,96:[1,2882],104:[1,2883],105:[1,2884],106:2881,177:2872,187:2870,192:2875,193:2876,194:2877,197:2880,200:[1,2885],201:[1,2886],202:[1,2891],203:[1,2892],204:[1,2893],205:[1,2894],206:[1,2887],207:[1,2888],208:[1,2889],209:[1,2890],210:2874,211:$VL7},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,2895]},o($VB3,$Vd3),o($VC4,$VG4),{19:$Vn,21:$Vo,22:2896,210:52,211:$Vp},{19:$VM7,21:$VN7,22:2898,96:[1,2909],104:[1,2910],105:[1,2911],106:2908,177:2899,187:2897,192:2902,193:2903,194:2904,197:2907,200:[1,2912],201:[1,2913],202:[1,2918],203:[1,2919],204:[1,2920],205:[1,2921],206:[1,2914],207:[1,2915],208:[1,2916],209:[1,2917],210:2901,211:$VO7},o($Vz3,$VR4),o($VC3,$Vu5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($Vv3,$VN3),{117:[1,2922]},o($Vv3,$VF3),o($Vy4,$VO3),o($Vz4,$VG4),{19:$Vn,21:$Vo,22:2923,210:52,211:$Vp},{19:$VP7,21:$VQ7,22:2925,96:[1,2936],104:[1,2937],105:[1,2938],106:2935,177:2926,187:2924,192:2929,193:2930,194:2931,197:2934,200:[1,2939],201:[1,2940],202:[1,2945],203:[1,2946],204:[1,2947],205:[1,2948],206:[1,2941],207:[1,2942],208:[1,2943],209:[1,2944],210:2928,211:$VR7},o($VA4,$VG4),{19:$Vn,21:$Vo,22:2949,210:52,211:$Vp},{19:$VS7,21:$VT7,22:2951,96:[1,2962],104:[1,2963],105:[1,2964],106:2961,177:2952,187:2950,192:2955,193:2956,194:2957,197:2960,200:[1,2965],201:[1,2966],202:[1,2971],203:[1,2972],204:[1,2973],205:[1,2974],206:[1,2967],207:[1,2968],208:[1,2969],209:[1,2970],210:2954,211:$VU7},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,2975]},o($VB3,$Vd3),o($VC4,$VG4),{19:$Vn,21:$Vo,22:2976,210:52,211:$Vp},{19:$VV7,21:$VW7,22:2978,96:[1,2989],104:[1,2990],105:[1,2991],106:2988,177:2979,187:2977,192:2982,193:2983,194:2984,197:2987,200:[1,2992],201:[1,2993],202:[1,2998],203:[1,2999],204:[1,3000],205:[1,3001],206:[1,2994],207:[1,2995],208:[1,2996],209:[1,2997],210:2981,211:$VX7},o($Vz3,$VR4),o($VC3,$Vu5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($VY7,$Vt2,{79:3002,80:3003,188:3004,186:$VZ7}),o($Vz6,$V_7),o($Vx,$Vg,{51:3006,55:3007,36:3008,39:$Vy}),o($VB6,$V$7),o($Vx,$Vg,{55:3009,36:3010,39:$Vy}),o($VB6,$V08),o($VB6,$V18),o($VB6,$Vh7),o($VB6,$Vi7),{115:[1,3011],118:195,119:196,120:$Vw1,122:$Vx1},o($VB6,$V11),o($VB6,$V21),{19:[1,3015],21:[1,3019],22:3013,32:3012,196:3014,210:3016,211:[1,3018],212:[1,3017]},o($VB6,$V28),o($VB6,$V38),o($V48,$Vr1,{89:3020}),o($VB6,$Vs1,{95:2457,91:3021,97:$Vb7,98:$VL,99:$VM,100:$VN}),o($V48,$Vy1),o($V48,$Vz1),o($V48,$VA1),o($V48,$VB1),{96:[1,3022]},o($V48,$VH1),{66:[1,3023]},o($Ve7,$Vx2,{95:1982,91:3024,97:$VD6,98:$VL,99:$VM,100:$VN}),o($Vd7,$Vy2),o($VB6,$Vz2,{86:3025,91:3026,87:3027,95:3028,101:3030,103:3031,97:$V58,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VB2,{86:3025,91:3026,87:3027,95:3028,101:3030,103:3031,97:$V58,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VC2,{86:3025,91:3026,87:3027,95:3028,101:3030,103:3031,97:$V58,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vj7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3032],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3033,117:$VG2,143:$VH2,185:$VI2}),o($Vg7,$VR1),o($Vg7,$Vl),o($Vg7,$Vm),o($Vg7,$Vq),o($Vg7,$Vr),o($Vg7,$Vs),o($Vg7,$Vt),o($Vg7,$Vu),o($Vd7,$V43),o($Vj7,$V53),o($Vj7,$V63),o($Vj7,$V73),o($Vj7,$V83),{107:[1,3034]},o($Vj7,$Vd3),o($VY7,$Vt2,{80:3003,188:3004,79:3035,186:$VZ7}),o($V68,$Vs6,{147:3036,148:3037,151:$V78,152:$V88,153:$V98,154:$Va8}),o($Vb8,$Vy6),o($Vc8,$VA6,{52:3042}),o($Vd8,$VC6,{56:3043}),o($VC,$VD,{59:3044,69:3045,71:3046,72:3047,88:3050,90:3051,83:3053,84:3054,85:3055,74:3056,40:3057,91:3061,22:3062,87:3064,114:3065,95:3069,210:3072,101:3073,103:3074,19:[1,3071],21:[1,3076],65:[1,3048],67:[1,3049],75:[1,3066],76:[1,3067],77:[1,3068],81:[1,3052],92:[1,3058],93:[1,3059],94:[1,3060],97:$Ve8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3063],211:[1,3075]}),o($V68,$Vs6,{148:3037,147:3077,151:$V78,152:$V88,153:$V98,154:$Va8}),o($Vu2,$Vt2,{80:2510,188:2511,79:3078,186:$Vk7}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3079,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:2510,188:2511,79:3080,186:$Vk7}),o($Vo1,$Vx2,{95:2019,91:3081,97:$VE6,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:3082,189:[1,3083]}),{19:$VI3,21:$VJ3,22:614,124:3084,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:3085,189:[1,3086]}),{19:$VI3,21:$VJ3,22:614,124:3087,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,3088]},o($Vt1,$VH1),{96:[1,3090],102:3089,104:[1,3091],105:[1,3092],106:3093,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3094]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:3095,189:[1,3096]}),{19:$VI3,21:$VJ3,22:614,124:3097,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,3098]},{19:[1,3101],21:[1,3104],22:3100,83:3099,210:3102,211:[1,3103]},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$VF6,21:$VG6,22:3106,83:3105,210:2054,211:$VH6},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$VI6,21:$VJ6,22:3108,83:3107,210:2080,211:$VK6},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VL6,21:$VM6,22:3110,83:3109,210:2107,211:$VN6},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$VO6,21:$VP6,22:3112,83:3111,210:2134,211:$VQ6},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$VR6,21:$VS6,22:3114,83:3113,210:2160,211:$VT6},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VU6,21:$VV6,22:3116,83:3115,210:2187,211:$VW6},o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Va1,$Vs3),o($Va1,$Vi2),o($Va1,$Vd2),o($Va1,$Ve2),o($Vo1,$Vn1,{78:3117}),o($Va1,$V11),o($Va1,$V21),{19:[1,3121],21:[1,3125],22:3119,32:3118,196:3120,210:3122,211:[1,3124],212:[1,3123]},{115:[1,3126],118:195,119:196,120:$Vw1,122:$Vx1},o($Va1,$Vt3),o($Va1,$Vk2),o($Vo1,$Vn1,{78:3127}),o($Vl2,$Vr1,{89:3128}),o($Vo1,$Vs1,{95:2600,91:3129,97:$Vm7,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy1),o($Vl2,$Vz1),o($Vl2,$VA1),o($Vl2,$VB1),{96:[1,3130]},o($Vl2,$VH1),{66:[1,3131]},o($Vs2,$Vt2,{79:3132,80:3133,188:3134,186:[1,3135]}),o($Vu2,$Vt2,{79:3136,80:3137,188:3138,186:$Vf8}),o($Vm1,$Vx2,{95:2260,91:3140,97:$VX6,98:$VL,99:$VM,100:$VN}),o($Vq1,$Vy2),o($Vo1,$Vz2,{86:3141,91:3142,87:3143,95:3144,101:3146,103:3147,97:$Vg8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VB2,{86:3141,91:3142,87:3143,95:3144,101:3146,103:3147,97:$Vg8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VC2,{86:3141,91:3142,87:3143,95:3144,101:3146,103:3147,97:$Vg8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF1,$VD2),o($Vw2,$Vt2,{79:3148,80:3149,188:3150,186:[1,3151]}),o($Vc2,$VR1),o($Vc2,$Vl),o($Vc2,$Vm),o($Vc2,$Vq),o($Vc2,$Vr),o($Vc2,$Vs),o($Vc2,$Vt),o($Vc2,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3152],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3153,117:$VG2,143:$VH2,185:$VI2}),o($Vq1,$V43),o($VF1,$V53),o($VF1,$V63),o($VF1,$V73),o($VF1,$V83),{107:[1,3154]},o($VF1,$Vd3),o($Vo1,$VR4),{189:[1,3157],190:3155,191:[1,3156]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:3158,199:3159,107:[1,3160]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,3163],190:3161,191:[1,3162]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:3164,199:3165,107:[1,3166]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,3169],21:[1,3172],22:3168,83:3167,210:3170,211:[1,3171]},{189:[1,3175],190:3173,191:[1,3174]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:3176,199:3177,107:[1,3178]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vo1,$VR4),{189:[1,3181],190:3179,191:[1,3180]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:3182,199:3183,107:[1,3184]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,3187],190:3185,191:[1,3186]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:3188,199:3189,107:[1,3190]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,3193],21:[1,3196],22:3192,83:3191,210:3194,211:[1,3195]},{189:[1,3199],190:3197,191:[1,3198]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:3200,199:3201,107:[1,3202]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vx3,$V$5),o($Vx3,$VC1),o($Vy3,$V$5),o($Vy3,$VC1),o($Vz3,$V$5),o($Vz3,$VC1),o($Vv3,$Vs3),o($Vv3,$Vi2),o($Vv3,$Vd2),o($Vv3,$Ve2),o($Vy3,$Vn1,{78:3203}),o($Vv3,$V11),o($Vv3,$V21),{19:[1,3207],21:[1,3211],22:3205,32:3204,196:3206,210:3208,211:[1,3210],212:[1,3209]},{115:[1,3212],118:195,119:196,120:$Vw1,122:$Vx1},o($Vv3,$Vt3),o($Vv3,$Vk2),o($Vy3,$Vn1,{78:3213}),o($Vy4,$Vr1,{89:3214}),o($Vy3,$Vs1,{95:2813,91:3215,97:$VF7,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy1),o($Vy4,$Vz1),o($Vy4,$VA1),o($Vy4,$VB1),{96:[1,3216]},o($Vy4,$VH1),{66:[1,3217]},o($Vz4,$Vt2,{79:3218,80:3219,188:3220,186:[1,3221]}),o($VA4,$Vt2,{79:3222,80:3223,188:3224,186:$Vh8}),o($Vx3,$Vx2,{95:2374,91:3226,97:$V$6,98:$VL,99:$VM,100:$VN}),o($VA3,$Vy2),o($Vy3,$Vz2,{86:3227,91:3228,87:3229,95:3230,101:3232,103:3233,97:$Vi8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VB2,{86:3227,91:3228,87:3229,95:3230,101:3232,103:3233,97:$Vi8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vy3,$VC2,{86:3227,91:3228,87:3229,95:3230,101:3232,103:3233,97:$Vi8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC3,$VD2),o($VC4,$Vt2,{79:3234,80:3235,188:3236,186:[1,3237]}),o($VC5,$VR1),o($VC5,$Vl),o($VC5,$Vm),o($VC5,$Vq),o($VC5,$Vr),o($VC5,$Vs),o($VC5,$Vt),o($VC5,$Vu),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3238],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3239,117:$VG2,143:$VH2,185:$VI2}),o($VA3,$V43),o($VC3,$V53),o($VC3,$V63),o($VC3,$V73),o($VC3,$V83),{107:[1,3240]},o($VC3,$Vd3),o($Vy3,$VR4),{189:[1,3243],190:3241,191:[1,3242]},o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$VH5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Ve4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Vf4),o($Vx3,$Vg4,{198:3244,199:3245,107:[1,3246]}),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($Vx3,$Vp4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{189:[1,3249],190:3247,191:[1,3248]},o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$VH5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Ve4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Vf4),o($Vy3,$Vg4,{198:3250,199:3251,107:[1,3252]}),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($Vy3,$Vp4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),{19:[1,3255],21:[1,3258],22:3254,83:3253,210:3256,211:[1,3257]},{189:[1,3261],190:3259,191:[1,3260]},o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$VH5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Ve4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Vf4),o($Vz3,$Vg4,{198:3262,199:3263,107:[1,3264]}),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($Vz3,$Vp4),o($V_6,$V93),o($V_6,$Va3),o($V_6,$Vb3),o($V_6,$Vc3),o($Vy3,$VR4),{189:[1,3267],190:3265,191:[1,3266]},o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$VH5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Ve4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Vf4),o($Vx3,$Vg4,{198:3268,199:3269,107:[1,3270]}),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($Vx3,$Vp4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{189:[1,3273],190:3271,191:[1,3272]},o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$VH5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Ve4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Vf4),o($Vy3,$Vg4,{198:3274,199:3275,107:[1,3276]}),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($Vy3,$Vp4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),{19:[1,3279],21:[1,3282],22:3278,83:3277,210:3280,211:[1,3281]},{189:[1,3285],190:3283,191:[1,3284]},o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$VH5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Ve4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Vf4),o($Vz3,$Vg4,{198:3286,199:3287,107:[1,3288]}),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($Vz3,$Vp4),o($V_6,$V93),o($V_6,$Va3),o($V_6,$Vb3),o($V_6,$Vc3),o($V44,$Vj8),o($Vr6,$VG3),o($V44,$VH3,{31:3289,189:[1,3290]}),{19:$VI3,21:$VJ3,22:614,124:3291,195:$VK3,210:617,211:$VL3},o($Vz6,$Vk8),o($VB6,$VC6,{56:3292}),o($VC,$VD,{59:3293,69:3294,71:3295,72:3296,88:3299,90:3300,83:3302,84:3303,85:3304,74:3305,40:3306,91:3310,22:3311,87:3313,114:3314,95:3318,210:3321,101:3322,103:3323,19:[1,3320],21:[1,3325],65:[1,3297],67:[1,3298],75:[1,3315],76:[1,3316],77:[1,3317],81:[1,3301],92:[1,3307],93:[1,3308],94:[1,3309],97:$Vl8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3312],211:[1,3324]}),o($VB6,$Vm8),o($VC,$VD,{59:3326,69:3327,71:3328,72:3329,88:3332,90:3333,83:3335,84:3336,85:3337,74:3338,40:3339,91:3343,22:3344,87:3346,114:3347,95:3351,210:3354,101:3355,103:3356,19:[1,3353],21:[1,3358],65:[1,3330],67:[1,3331],75:[1,3348],76:[1,3349],77:[1,3350],81:[1,3334],92:[1,3340],93:[1,3341],94:[1,3342],97:$Vn8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3345],211:[1,3357]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3359,117:$VG2,143:$VH2,185:$VI2}),o($VB6,$VR1),o($VB6,$Vl),o($VB6,$Vm),o($VB6,$Vq),o($VB6,$Vr),o($VB6,$Vs),o($VB6,$Vt),o($VB6,$Vu),o($VB6,$Vx2,{95:2457,91:3360,97:$Vb7,98:$VL,99:$VM,100:$VN}),o($V48,$Vy2),o($V48,$V43),o($VB6,$Vo8),o($Vd7,$VO3),o($Vf7,$VP3),o($Vf7,$VQ3),o($Vf7,$VR3),{96:[1,3361]},o($Vf7,$VH1),{96:[1,3363],102:3362,104:[1,3364],105:[1,3365],106:3366,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3367]},o($Vf7,$V94),{117:[1,3368]},{19:[1,3371],21:[1,3374],22:3370,83:3369,210:3372,211:[1,3373]},o($V44,$Vp8),o($V68,$Vn1,{78:3375}),o($V68,$V07),o($V68,$V17),o($V68,$V27),o($V68,$V37),o($V68,$V47),o($Vb8,$V57,{53:3376,47:[1,3377]}),o($Vc8,$V67,{57:3378,49:[1,3379]}),o($Vd8,$V77),o($Vd8,$V87,{70:3380,72:3381,74:3382,40:3383,114:3384,75:[1,3385],76:[1,3386],77:[1,3387],115:$VD,120:$VD,122:$VD}),o($Vd8,$V97),o($Vd8,$Va7,{73:3388,69:3389,88:3390,90:3391,91:3395,95:3396,92:[1,3392],93:[1,3393],94:[1,3394],97:$Vq8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3398,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vd8,$Vc7),o($Vr8,$Vr1,{89:3399}),o($Vs8,$Vs1,{95:3069,91:3400,97:$Ve8,98:$VL,99:$VM,100:$VN}),o($Vt8,$Vu1,{82:3401}),o($Vt8,$Vu1,{82:3402}),o($Vt8,$Vu1,{82:3403}),o($Vd8,$Vv1,{101:3073,103:3074,87:3404,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$Vh7),o($Vu8,$Vi7),o($Vr8,$Vy1),o($Vr8,$Vz1),o($Vr8,$VA1),o($Vr8,$VB1),o($Vt8,$VC1),o($VD1,$VE1,{158:3405}),o($Vv8,$VG1),{115:[1,3406],118:195,119:196,120:$Vw1,122:$Vx1},o($Vu8,$V11),o($Vu8,$V21),{19:[1,3410],21:[1,3414],22:3408,32:3407,196:3409,210:3411,211:[1,3413],212:[1,3412]},{96:[1,3415]},o($Vr8,$VH1),o($Vt8,$Vq),o($Vt8,$Vr),{96:[1,3417],102:3416,104:[1,3418],105:[1,3419],106:3420,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3421]},o($Vt8,$Vt),o($Vt8,$Vu),o($V68,$Vn1,{78:3422}),o($Va1,$VN3),{117:[1,3423]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:3424,210:52,211:$Vp},{19:$Vw8,21:$Vx8,22:3426,96:[1,3437],104:[1,3438],105:[1,3439],106:3436,177:3427,187:3425,192:3430,193:3431,194:3432,197:3435,200:[1,3440],201:[1,3441],202:[1,3446],203:[1,3447],204:[1,3448],205:[1,3449],206:[1,3442],207:[1,3443],208:[1,3444],209:[1,3445],210:3429,211:$Vy8},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:3450,210:52,211:$Vp},{19:$Vz8,21:$VA8,22:3452,96:[1,3463],104:[1,3464],105:[1,3465],106:3462,177:3453,187:3451,192:3456,193:3457,194:3458,197:3461,200:[1,3466],201:[1,3467],202:[1,3472],203:[1,3473],204:[1,3474],205:[1,3475],206:[1,3468],207:[1,3469],208:[1,3470],209:[1,3471],210:3455,211:$VB8},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,3476]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:3477,210:52,211:$Vp},{19:$VC8,21:$VD8,22:3479,96:[1,3490],104:[1,3491],105:[1,3492],106:3489,177:3480,187:3478,192:3483,193:3484,194:3485,197:3488,200:[1,3493],201:[1,3494],202:[1,3499],203:[1,3500],204:[1,3501],205:[1,3502],206:[1,3495],207:[1,3496],208:[1,3497],209:[1,3498],210:3482,211:$VE8},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vu2,$Vt2,{80:3137,188:3138,79:3503,186:$Vf8}),o($Va1,$VR1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3504,117:$VG2,143:$VH2,185:$VI2}),o($Vu2,$Vt2,{80:3137,188:3138,79:3505,186:$Vf8}),o($Vo1,$Vx2,{95:2600,91:3506,97:$Vm7,98:$VL,99:$VM,100:$VN}),o($Vl2,$Vy2),o($Vl2,$V43),o($Va1,$Vx4),o($VE3,$VF3),o($Vm1,$VG3),o($VE3,$VH3,{31:3507,189:[1,3508]}),{19:$VI3,21:$VJ3,22:614,124:3509,195:$VK3,210:617,211:$VL3},o($Va1,$VM3),o($Vo1,$VG3),o($Va1,$VH3,{31:3510,189:[1,3511]}),{19:$VI3,21:$VJ3,22:614,124:3512,195:$VK3,210:617,211:$VL3},o($Vq1,$VO3),o($Vt1,$VP3),o($Vt1,$VQ3),o($Vt1,$VR3),{96:[1,3513]},o($Vt1,$VH1),{96:[1,3515],102:3514,104:[1,3516],105:[1,3517],106:3518,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3519]},o($Vc2,$VN3),o($Vp1,$VG3),o($Vc2,$VH3,{31:3520,189:[1,3521]}),{19:$VI3,21:$VJ3,22:614,124:3522,195:$VK3,210:617,211:$VL3},o($Vt1,$V94),{117:[1,3523]},{19:[1,3526],21:[1,3529],22:3525,83:3524,210:3527,211:[1,3528]},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$Vn7,21:$Vo7,22:3531,83:3530,210:2635,211:$Vp7},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$Vq7,21:$Vr7,22:3533,83:3532,210:2661,211:$Vs7},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$Vt7,21:$Vu7,22:3535,83:3534,210:2688,211:$Vv7},o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$Vw7,21:$Vx7,22:3537,83:3536,210:2715,211:$Vy7},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$Vz7,21:$VA7,22:3539,83:3538,210:2741,211:$VB7},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VC7,21:$VD7,22:3541,83:3540,210:2768,211:$VE7},o($VA4,$Vt2,{80:3223,188:3224,79:3542,186:$Vh8}),o($Vv3,$VR1),o($Vv3,$Vl),o($Vv3,$Vm),o($Vv3,$Vq),o($Vv3,$Vr),o($Vv3,$Vs),o($Vv3,$Vt),o($Vv3,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3543,117:$VG2,143:$VH2,185:$VI2}),o($VA4,$Vt2,{80:3223,188:3224,79:3544,186:$Vh8}),o($Vy3,$Vx2,{95:2813,91:3545,97:$VF7,98:$VL,99:$VM,100:$VN}),o($Vy4,$Vy2),o($Vy4,$V43),o($Vv3,$Vx4),o($VB5,$VF3),o($Vx3,$VG3),o($VB5,$VH3,{31:3546,189:[1,3547]}),{19:$VI3,21:$VJ3,22:614,124:3548,195:$VK3,210:617,211:$VL3},o($Vv3,$VM3),o($Vy3,$VG3),o($Vv3,$VH3,{31:3549,189:[1,3550]}),{19:$VI3,21:$VJ3,22:614,124:3551,195:$VK3,210:617,211:$VL3},o($VA3,$VO3),o($VB3,$VP3),o($VB3,$VQ3),o($VB3,$VR3),{96:[1,3552]},o($VB3,$VH1),{96:[1,3554],102:3553,104:[1,3555],105:[1,3556],106:3557,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3558]},o($VC5,$VN3),o($Vz3,$VG3),o($VC5,$VH3,{31:3559,189:[1,3560]}),{19:$VI3,21:$VJ3,22:614,124:3561,195:$VK3,210:617,211:$VL3},o($VB3,$V94),{117:[1,3562]},{19:[1,3565],21:[1,3568],22:3564,83:3563,210:3566,211:[1,3567]},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vx3,$Vs5),o($Vx3,$Vt5),{19:$VG7,21:$VH7,22:3570,83:3569,210:2848,211:$VI7},o($VA4,$VS1),o($VA4,$VT1),o($VA4,$VU1),o($Vy3,$Vs5),o($Vy3,$Vt5),{19:$VJ7,21:$VK7,22:3572,83:3571,210:2874,211:$VL7},o($VB3,$Vu5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($VC4,$VS1),o($VC4,$VT1),o($VC4,$VU1),o($Vz3,$Vs5),o($Vz3,$Vt5),{19:$VM7,21:$VN7,22:3574,83:3573,210:2901,211:$VO7},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vx3,$Vs5),o($Vx3,$Vt5),{19:$VP7,21:$VQ7,22:3576,83:3575,210:2928,211:$VR7},o($VA4,$VS1),o($VA4,$VT1),o($VA4,$VU1),o($Vy3,$Vs5),o($Vy3,$Vt5),{19:$VS7,21:$VT7,22:3578,83:3577,210:2954,211:$VU7},o($VB3,$Vu5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($VC4,$VS1),o($VC4,$VT1),o($VC4,$VU1),o($Vz3,$Vs5),o($Vz3,$Vt5),{19:$VV7,21:$VW7,22:3580,83:3579,210:2981,211:$VX7},o($VY7,$VG4),{19:$Vn,21:$Vo,22:3581,210:52,211:$Vp},{19:$VF8,21:$VG8,22:3583,96:[1,3594],104:[1,3595],105:[1,3596],106:3593,177:3584,187:3582,192:3587,193:3588,194:3589,197:3592,200:[1,3597],201:[1,3598],202:[1,3603],203:[1,3604],204:[1,3605],205:[1,3606],206:[1,3599],207:[1,3600],208:[1,3601],209:[1,3602],210:3586,211:$VH8},o($Vz6,$V67,{57:3607,49:[1,3608]}),o($VB6,$V77),o($VB6,$V87,{70:3609,72:3610,74:3611,40:3612,114:3613,75:[1,3614],76:[1,3615],77:[1,3616],115:$VD,120:$VD,122:$VD}),o($VB6,$V97),o($VB6,$Va7,{73:3617,69:3618,88:3619,90:3620,91:3624,95:3625,92:[1,3621],93:[1,3622],94:[1,3623],97:$VI8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3627,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VB6,$Vc7),o($Vd7,$Vr1,{89:3628}),o($Ve7,$Vs1,{95:3318,91:3629,97:$Vl8,98:$VL,99:$VM,100:$VN}),o($Vf7,$Vu1,{82:3630}),o($Vf7,$Vu1,{82:3631}),o($Vf7,$Vu1,{82:3632}),o($VB6,$Vv1,{101:3322,103:3323,87:3633,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vg7,$Vh7),o($Vg7,$Vi7),o($Vd7,$Vy1),o($Vd7,$Vz1),o($Vd7,$VA1),o($Vd7,$VB1),o($Vf7,$VC1),o($VD1,$VE1,{158:3634}),o($Vj7,$VG1),{115:[1,3635],118:195,119:196,120:$Vw1,122:$Vx1},o($Vg7,$V11),o($Vg7,$V21),{19:[1,3639],21:[1,3643],22:3637,32:3636,196:3638,210:3640,211:[1,3642],212:[1,3641]},{96:[1,3644]},o($Vd7,$VH1),o($Vf7,$Vq),o($Vf7,$Vr),{96:[1,3646],102:3645,104:[1,3647],105:[1,3648],106:3649,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3650]},o($Vf7,$Vt),o($Vf7,$Vu),o($VB6,$V77),o($VB6,$V87,{70:3651,72:3652,74:3653,40:3654,114:3655,75:[1,3656],76:[1,3657],77:[1,3658],115:$VD,120:$VD,122:$VD}),o($VB6,$V97),o($VB6,$Va7,{73:3659,69:3660,88:3661,90:3662,91:3666,95:3667,92:[1,3663],93:[1,3664],94:[1,3665],97:$VJ8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3669,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VB6,$Vc7),o($Vd7,$Vr1,{89:3670}),o($Ve7,$Vs1,{95:3351,91:3671,97:$Vn8,98:$VL,99:$VM,100:$VN}),o($Vf7,$Vu1,{82:3672}),o($Vf7,$Vu1,{82:3673}),o($Vf7,$Vu1,{82:3674}),o($VB6,$Vv1,{101:3355,103:3356,87:3675,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vg7,$Vh7),o($Vg7,$Vi7),o($Vd7,$Vy1),o($Vd7,$Vz1),o($Vd7,$VA1),o($Vd7,$VB1),o($Vf7,$VC1),o($VD1,$VE1,{158:3676}),o($Vj7,$VG1),{115:[1,3677],118:195,119:196,120:$Vw1,122:$Vx1},o($Vg7,$V11),o($Vg7,$V21),{19:[1,3681],21:[1,3685],22:3679,32:3678,196:3680,210:3682,211:[1,3684],212:[1,3683]},{96:[1,3686]},o($Vd7,$VH1),o($Vf7,$Vq),o($Vf7,$Vr),{96:[1,3688],102:3687,104:[1,3689],105:[1,3690],106:3691,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,3692]},o($Vf7,$Vt),o($Vf7,$Vu),{117:[1,3693]},o($V48,$VO3),o($Vf7,$V43),o($Vf7,$V53),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),{107:[1,3694]},o($Vf7,$Vd3),o($Vg7,$VR4),o($Vj7,$Vu5),o($Vj7,$VC1),o($Vj7,$Vq),o($Vj7,$Vr),o($Vj7,$Vt),o($Vj7,$Vu),o($VK8,$Vt2,{79:3695,80:3696,188:3697,186:$VL8}),o($Vc8,$V_7),o($Vx,$Vg,{51:3699,55:3700,36:3701,39:$Vy}),o($Vd8,$V$7),o($Vx,$Vg,{55:3702,36:3703,39:$Vy}),o($Vd8,$V08),o($Vd8,$V18),o($Vd8,$Vh7),o($Vd8,$Vi7),{115:[1,3704],118:195,119:196,120:$Vw1,122:$Vx1},o($Vd8,$V11),o($Vd8,$V21),{19:[1,3708],21:[1,3712],22:3706,32:3705,196:3707,210:3709,211:[1,3711],212:[1,3710]},o($Vd8,$V28),o($Vd8,$V38),o($VM8,$Vr1,{89:3713}),o($Vd8,$Vs1,{95:3396,91:3714,97:$Vq8,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy1),o($VM8,$Vz1),o($VM8,$VA1),o($VM8,$VB1),{96:[1,3715]},o($VM8,$VH1),{66:[1,3716]},o($Vs8,$Vx2,{95:3069,91:3717,97:$Ve8,98:$VL,99:$VM,100:$VN}),o($Vr8,$Vy2),o($Vd8,$Vz2,{86:3718,91:3719,87:3720,95:3721,101:3723,103:3724,97:$VN8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VB2,{86:3718,91:3719,87:3720,95:3721,101:3723,103:3724,97:$VN8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VC2,{86:3718,91:3719,87:3720,95:3721,101:3723,103:3724,97:$VN8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vv8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3725],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3726,117:$VG2,143:$VH2,185:$VI2}),o($Vu8,$VR1),o($Vu8,$Vl),o($Vu8,$Vm),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vs),o($Vu8,$Vt),o($Vu8,$Vu),o($Vr8,$V43),o($Vv8,$V53),o($Vv8,$V63),o($Vv8,$V73),o($Vv8,$V83),{107:[1,3727]},o($Vv8,$Vd3),o($VK8,$Vt2,{80:3696,188:3697,79:3728,186:$VL8}),o($Vo1,$VR4),{189:[1,3731],190:3729,191:[1,3730]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:3732,199:3733,107:[1,3734]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,3737],190:3735,191:[1,3736]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:3738,199:3739,107:[1,3740]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,3743],21:[1,3746],22:3742,83:3741,210:3744,211:[1,3745]},{189:[1,3749],190:3747,191:[1,3748]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:3750,199:3751,107:[1,3752]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Va1,$VN3),{117:[1,3753]},o($Va1,$VF3),o($Vl2,$VO3),o($Vs2,$VG4),{19:$Vn,21:$Vo,22:3754,210:52,211:$Vp},{19:$VO8,21:$VP8,22:3756,96:[1,3767],104:[1,3768],105:[1,3769],106:3766,177:3757,187:3755,192:3760,193:3761,194:3762,197:3765,200:[1,3770],201:[1,3771],202:[1,3776],203:[1,3777],204:[1,3778],205:[1,3779],206:[1,3772],207:[1,3773],208:[1,3774],209:[1,3775],210:3759,211:$VQ8},o($Vu2,$VG4),{19:$Vn,21:$Vo,22:3780,210:52,211:$Vp},{19:$VR8,21:$VS8,22:3782,96:[1,3793],104:[1,3794],105:[1,3795],106:3792,177:3783,187:3781,192:3786,193:3787,194:3788,197:3791,200:[1,3796],201:[1,3797],202:[1,3802],203:[1,3803],204:[1,3804],205:[1,3805],206:[1,3798],207:[1,3799],208:[1,3800],209:[1,3801],210:3785,211:$VT8},o($Vt1,$V43),o($Vt1,$V53),o($Vt1,$V63),o($Vt1,$V73),o($Vt1,$V83),{107:[1,3806]},o($Vt1,$Vd3),o($Vw2,$VG4),{19:$Vn,21:$Vo,22:3807,210:52,211:$Vp},{19:$VU8,21:$VV8,22:3809,96:[1,3820],104:[1,3821],105:[1,3822],106:3819,177:3810,187:3808,192:3813,193:3814,194:3815,197:3818,200:[1,3823],201:[1,3824],202:[1,3829],203:[1,3830],204:[1,3831],205:[1,3832],206:[1,3825],207:[1,3826],208:[1,3827],209:[1,3828],210:3812,211:$VW8},o($Vp1,$VR4),o($VF1,$Vu5),o($VF1,$VC1),o($VF1,$Vq),o($VF1,$Vr),o($VF1,$Vt),o($VF1,$Vu),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vv3,$VN3),{117:[1,3833]},o($Vv3,$VF3),o($Vy4,$VO3),o($Vz4,$VG4),{19:$Vn,21:$Vo,22:3834,210:52,211:$Vp},{19:$VX8,21:$VY8,22:3836,96:[1,3847],104:[1,3848],105:[1,3849],106:3846,177:3837,187:3835,192:3840,193:3841,194:3842,197:3845,200:[1,3850],201:[1,3851],202:[1,3856],203:[1,3857],204:[1,3858],205:[1,3859],206:[1,3852],207:[1,3853],208:[1,3854],209:[1,3855],210:3839,211:$VZ8},o($VA4,$VG4),{19:$Vn,21:$Vo,22:3860,210:52,211:$Vp},{19:$V_8,21:$V$8,22:3862,96:[1,3873],104:[1,3874],105:[1,3875],106:3872,177:3863,187:3861,192:3866,193:3867,194:3868,197:3871,200:[1,3876],201:[1,3877],202:[1,3882],203:[1,3883],204:[1,3884],205:[1,3885],206:[1,3878],207:[1,3879],208:[1,3880],209:[1,3881],210:3865,211:$V09},o($VB3,$V43),o($VB3,$V53),o($VB3,$V63),o($VB3,$V73),o($VB3,$V83),{107:[1,3886]},o($VB3,$Vd3),o($VC4,$VG4),{19:$Vn,21:$Vo,22:3887,210:52,211:$Vp},{19:$V19,21:$V29,22:3889,96:[1,3900],104:[1,3901],105:[1,3902],106:3899,177:3890,187:3888,192:3893,193:3894,194:3895,197:3898,200:[1,3903],201:[1,3904],202:[1,3909],203:[1,3910],204:[1,3911],205:[1,3912],206:[1,3905],207:[1,3906],208:[1,3907],209:[1,3908],210:3892,211:$V39},o($Vz3,$VR4),o($VC3,$Vu5),o($VC3,$VC1),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vt),o($VC3,$Vu),o($Vx3,$V$5),o($Vx3,$VC1),o($Vy3,$V$5),o($Vy3,$VC1),o($Vz3,$V$5),o($Vz3,$VC1),o($Vx3,$V$5),o($Vx3,$VC1),o($Vy3,$V$5),o($Vy3,$VC1),o($Vz3,$V$5),o($Vz3,$VC1),{189:[1,3915],190:3913,191:[1,3914]},o($Vr6,$VF5),o($Vr6,$VG5),o($Vr6,$VH5),o($Vr6,$Vq),o($Vr6,$Vr),o($Vr6,$Vc4),o($Vr6,$Vd4),o($Vr6,$Ve4),o($Vr6,$Vt),o($Vr6,$Vu),o($Vr6,$Vf4),o($Vr6,$Vg4,{198:3916,199:3917,107:[1,3918]}),o($Vr6,$Vh4),o($Vr6,$Vi4),o($Vr6,$Vj4),o($Vr6,$Vk4),o($Vr6,$Vl4),o($Vr6,$Vm4),o($Vr6,$Vn4),o($Vr6,$Vo4),o($Vr6,$Vp4),o($V49,$V93),o($V49,$Va3),o($V49,$Vb3),o($V49,$Vc3),o($VB6,$V$7),o($Vx,$Vg,{55:3919,36:3920,39:$Vy}),o($VB6,$V08),o($VB6,$V18),o($VB6,$Vh7),o($VB6,$Vi7),{115:[1,3921],118:195,119:196,120:$Vw1,122:$Vx1},o($VB6,$V11),o($VB6,$V21),{19:[1,3925],21:[1,3929],22:3923,32:3922,196:3924,210:3926,211:[1,3928],212:[1,3927]},o($VB6,$V28),o($VB6,$V38),o($V48,$Vr1,{89:3930}),o($VB6,$Vs1,{95:3625,91:3931,97:$VI8,98:$VL,99:$VM,100:$VN}),o($V48,$Vy1),o($V48,$Vz1),o($V48,$VA1),o($V48,$VB1),{96:[1,3932]},o($V48,$VH1),{66:[1,3933]},o($Ve7,$Vx2,{95:3318,91:3934,97:$Vl8,98:$VL,99:$VM,100:$VN}),o($Vd7,$Vy2),o($VB6,$Vz2,{86:3935,91:3936,87:3937,95:3938,101:3940,103:3941,97:$V59,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VB2,{86:3935,91:3936,87:3937,95:3938,101:3940,103:3941,97:$V59,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VC2,{86:3935,91:3936,87:3937,95:3938,101:3940,103:3941,97:$V59,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vj7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3942],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3943,117:$VG2,143:$VH2,185:$VI2}),o($Vg7,$VR1),o($Vg7,$Vl),o($Vg7,$Vm),o($Vg7,$Vq),o($Vg7,$Vr),o($Vg7,$Vs),o($Vg7,$Vt),o($Vg7,$Vu),o($Vd7,$V43),o($Vj7,$V53),o($Vj7,$V63),o($Vj7,$V73),o($Vj7,$V83),{107:[1,3944]},o($Vj7,$Vd3),o($VB6,$V08),o($VB6,$V18),o($VB6,$Vh7),o($VB6,$Vi7),{115:[1,3945],118:195,119:196,120:$Vw1,122:$Vx1},o($VB6,$V11),o($VB6,$V21),{19:[1,3949],21:[1,3953],22:3947,32:3946,196:3948,210:3950,211:[1,3952],212:[1,3951]},o($VB6,$V28),o($VB6,$V38),o($V48,$Vr1,{89:3954}),o($VB6,$Vs1,{95:3667,91:3955,97:$VJ8,98:$VL,99:$VM,100:$VN}),o($V48,$Vy1),o($V48,$Vz1),o($V48,$VA1),o($V48,$VB1),{96:[1,3956]},o($V48,$VH1),{66:[1,3957]},o($Ve7,$Vx2,{95:3351,91:3958,97:$Vn8,98:$VL,99:$VM,100:$VN}),o($Vd7,$Vy2),o($VB6,$Vz2,{86:3959,91:3960,87:3961,95:3962,101:3964,103:3965,97:$V69,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VB2,{86:3959,91:3960,87:3961,95:3962,101:3964,103:3965,97:$V69,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VC2,{86:3959,91:3960,87:3961,95:3962,101:3964,103:3965,97:$V69,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vj7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,3966],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:3967,117:$VG2,143:$VH2,185:$VI2}),o($Vg7,$VR1),o($Vg7,$Vl),o($Vg7,$Vm),o($Vg7,$Vq),o($Vg7,$Vr),o($Vg7,$Vs),o($Vg7,$Vt),o($Vg7,$Vu),o($Vd7,$V43),o($Vj7,$V53),o($Vj7,$V63),o($Vj7,$V73),o($Vj7,$V83),{107:[1,3968]},o($Vj7,$Vd3),o($VB6,$VR4),{19:[1,3971],21:[1,3974],22:3970,83:3969,210:3972,211:[1,3973]},o($VW5,$Vj8),o($V68,$VG3),o($VW5,$VH3,{31:3975,189:[1,3976]}),{19:$VI3,21:$VJ3,22:614,124:3977,195:$VK3,210:617,211:$VL3},o($Vc8,$Vk8),o($Vd8,$VC6,{56:3978}),o($VC,$VD,{59:3979,69:3980,71:3981,72:3982,88:3985,90:3986,83:3988,84:3989,85:3990,74:3991,40:3992,91:3996,22:3997,87:3999,114:4000,95:4004,210:4007,101:4008,103:4009,19:[1,4006],21:[1,4011],65:[1,3983],67:[1,3984],75:[1,4001],76:[1,4002],77:[1,4003],81:[1,3987],92:[1,3993],93:[1,3994],94:[1,3995],97:$V79,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3998],211:[1,4010]}),o($Vd8,$Vm8),o($VC,$VD,{59:4012,69:4013,71:4014,72:4015,88:4018,90:4019,83:4021,84:4022,85:4023,74:4024,40:4025,91:4029,22:4030,87:4032,114:4033,95:4037,210:4040,101:4041,103:4042,19:[1,4039],21:[1,4044],65:[1,4016],67:[1,4017],75:[1,4034],76:[1,4035],77:[1,4036],81:[1,4020],92:[1,4026],93:[1,4027],94:[1,4028],97:$V89,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4031],211:[1,4043]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4045,117:$VG2,143:$VH2,185:$VI2}),o($Vd8,$VR1),o($Vd8,$Vl),o($Vd8,$Vm),o($Vd8,$Vq),o($Vd8,$Vr),o($Vd8,$Vs),o($Vd8,$Vt),o($Vd8,$Vu),o($Vd8,$Vx2,{95:3396,91:4046,97:$Vq8,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy2),o($VM8,$V43),o($Vd8,$Vo8),o($Vr8,$VO3),o($Vt8,$VP3),o($Vt8,$VQ3),o($Vt8,$VR3),{96:[1,4047]},o($Vt8,$VH1),{96:[1,4049],102:4048,104:[1,4050],105:[1,4051],106:4052,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4053]},o($Vt8,$V94),{117:[1,4054]},{19:[1,4057],21:[1,4060],22:4056,83:4055,210:4058,211:[1,4059]},o($VW5,$Vp8),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$Vw8,21:$Vx8,22:4062,83:4061,210:3429,211:$Vy8},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$Vz8,21:$VA8,22:4064,83:4063,210:3455,211:$VB8},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VC8,21:$VD8,22:4066,83:4065,210:3482,211:$VE8},o($Vo1,$VR4),{189:[1,4069],190:4067,191:[1,4068]},o($Vm1,$VF5),o($Vm1,$VG5),o($Vm1,$VH5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vc4),o($Vm1,$Vd4),o($Vm1,$Ve4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vf4),o($Vm1,$Vg4,{198:4070,199:4071,107:[1,4072]}),o($Vm1,$Vh4),o($Vm1,$Vi4),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vm4),o($Vm1,$Vn4),o($Vm1,$Vo4),o($Vm1,$Vp4),o($VI5,$V93),o($VI5,$Va3),o($VI5,$Vb3),o($VI5,$Vc3),{189:[1,4075],190:4073,191:[1,4074]},o($Vo1,$VF5),o($Vo1,$VG5),o($Vo1,$VH5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vc4),o($Vo1,$Vd4),o($Vo1,$Ve4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vf4),o($Vo1,$Vg4,{198:4076,199:4077,107:[1,4078]}),o($Vo1,$Vh4),o($Vo1,$Vi4),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vm4),o($Vo1,$Vn4),o($Vo1,$Vo4),o($Vo1,$Vp4),o($VJ5,$V93),o($VJ5,$Va3),o($VJ5,$Vb3),o($VJ5,$Vc3),{19:[1,4081],21:[1,4084],22:4080,83:4079,210:4082,211:[1,4083]},{189:[1,4087],190:4085,191:[1,4086]},o($Vp1,$VF5),o($Vp1,$VG5),o($Vp1,$VH5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vc4),o($Vp1,$Vd4),o($Vp1,$Ve4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vf4),o($Vp1,$Vg4,{198:4088,199:4089,107:[1,4090]}),o($Vp1,$Vh4),o($Vp1,$Vi4),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vm4),o($Vp1,$Vn4),o($Vp1,$Vo4),o($Vp1,$Vp4),o($VK5,$V93),o($VK5,$Va3),o($VK5,$Vb3),o($VK5,$Vc3),o($Vy3,$VR4),{189:[1,4093],190:4091,191:[1,4092]},o($Vx3,$VF5),o($Vx3,$VG5),o($Vx3,$VH5),o($Vx3,$Vq),o($Vx3,$Vr),o($Vx3,$Vc4),o($Vx3,$Vd4),o($Vx3,$Ve4),o($Vx3,$Vt),o($Vx3,$Vu),o($Vx3,$Vf4),o($Vx3,$Vg4,{198:4094,199:4095,107:[1,4096]}),o($Vx3,$Vh4),o($Vx3,$Vi4),o($Vx3,$Vj4),o($Vx3,$Vk4),o($Vx3,$Vl4),o($Vx3,$Vm4),o($Vx3,$Vn4),o($Vx3,$Vo4),o($Vx3,$Vp4),o($VY6,$V93),o($VY6,$Va3),o($VY6,$Vb3),o($VY6,$Vc3),{189:[1,4099],190:4097,191:[1,4098]},o($Vy3,$VF5),o($Vy3,$VG5),o($Vy3,$VH5),o($Vy3,$Vq),o($Vy3,$Vr),o($Vy3,$Vc4),o($Vy3,$Vd4),o($Vy3,$Ve4),o($Vy3,$Vt),o($Vy3,$Vu),o($Vy3,$Vf4),o($Vy3,$Vg4,{198:4100,199:4101,107:[1,4102]}),o($Vy3,$Vh4),o($Vy3,$Vi4),o($Vy3,$Vj4),o($Vy3,$Vk4),o($Vy3,$Vl4),o($Vy3,$Vm4),o($Vy3,$Vn4),o($Vy3,$Vo4),o($Vy3,$Vp4),o($VZ6,$V93),o($VZ6,$Va3),o($VZ6,$Vb3),o($VZ6,$Vc3),{19:[1,4105],21:[1,4108],22:4104,83:4103,210:4106,211:[1,4107]},{189:[1,4111],190:4109,191:[1,4110]},o($Vz3,$VF5),o($Vz3,$VG5),o($Vz3,$VH5),o($Vz3,$Vq),o($Vz3,$Vr),o($Vz3,$Vc4),o($Vz3,$Vd4),o($Vz3,$Ve4),o($Vz3,$Vt),o($Vz3,$Vu),o($Vz3,$Vf4),o($Vz3,$Vg4,{198:4112,199:4113,107:[1,4114]}),o($Vz3,$Vh4),o($Vz3,$Vi4),o($Vz3,$Vj4),o($Vz3,$Vk4),o($Vz3,$Vl4),o($Vz3,$Vm4),o($Vz3,$Vn4),o($Vz3,$Vo4),o($Vz3,$Vp4),o($V_6,$V93),o($V_6,$Va3),o($V_6,$Vb3),o($V_6,$Vc3),o($VY7,$VS1),o($VY7,$VT1),o($VY7,$VU1),o($Vr6,$Vs5),o($Vr6,$Vt5),{19:$VF8,21:$VG8,22:4116,83:4115,210:3586,211:$VH8},o($VB6,$Vm8),o($VC,$VD,{59:4117,69:4118,71:4119,72:4120,88:4123,90:4124,83:4126,84:4127,85:4128,74:4129,40:4130,91:4134,22:4135,87:4137,114:4138,95:4142,210:4145,101:4146,103:4147,19:[1,4144],21:[1,4149],65:[1,4121],67:[1,4122],75:[1,4139],76:[1,4140],77:[1,4141],81:[1,4125],92:[1,4131],93:[1,4132],94:[1,4133],97:$V99,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4136],211:[1,4148]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4150,117:$VG2,143:$VH2,185:$VI2}),o($VB6,$VR1),o($VB6,$Vl),o($VB6,$Vm),o($VB6,$Vq),o($VB6,$Vr),o($VB6,$Vs),o($VB6,$Vt),o($VB6,$Vu),o($VB6,$Vx2,{95:3625,91:4151,97:$VI8,98:$VL,99:$VM,100:$VN}),o($V48,$Vy2),o($V48,$V43),o($VB6,$Vo8),o($Vd7,$VO3),o($Vf7,$VP3),o($Vf7,$VQ3),o($Vf7,$VR3),{96:[1,4152]},o($Vf7,$VH1),{96:[1,4154],102:4153,104:[1,4155],105:[1,4156],106:4157,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4158]},o($Vf7,$V94),{117:[1,4159]},{19:[1,4162],21:[1,4165],22:4161,83:4160,210:4163,211:[1,4164]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4166,117:$VG2,143:$VH2,185:$VI2}),o($VB6,$VR1),o($VB6,$Vl),o($VB6,$Vm),o($VB6,$Vq),o($VB6,$Vr),o($VB6,$Vs),o($VB6,$Vt),o($VB6,$Vu),o($VB6,$Vx2,{95:3667,91:4167,97:$VJ8,98:$VL,99:$VM,100:$VN}),o($V48,$Vy2),o($V48,$V43),o($VB6,$Vo8),o($Vd7,$VO3),o($Vf7,$VP3),o($Vf7,$VQ3),o($Vf7,$VR3),{96:[1,4168]},o($Vf7,$VH1),{96:[1,4170],102:4169,104:[1,4171],105:[1,4172],106:4173,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4174]},o($Vf7,$V94),{117:[1,4175]},{19:[1,4178],21:[1,4181],22:4177,83:4176,210:4179,211:[1,4180]},o($Vf7,$Vu5),o($Vf7,$VC1),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vt),o($Vf7,$Vu),o($VK8,$VG4),{19:$Vn,21:$Vo,22:4182,210:52,211:$Vp},{19:$Va9,21:$Vb9,22:4184,96:[1,4195],104:[1,4196],105:[1,4197],106:4194,177:4185,187:4183,192:4188,193:4189,194:4190,197:4193,200:[1,4198],201:[1,4199],202:[1,4204],203:[1,4205],204:[1,4206],205:[1,4207],206:[1,4200],207:[1,4201],208:[1,4202],209:[1,4203],210:4187,211:$Vc9},o($Vc8,$V67,{57:4208,49:[1,4209]}),o($Vd8,$V77),o($Vd8,$V87,{70:4210,72:4211,74:4212,40:4213,114:4214,75:[1,4215],76:[1,4216],77:[1,4217],115:$VD,120:$VD,122:$VD}),o($Vd8,$V97),o($Vd8,$Va7,{73:4218,69:4219,88:4220,90:4221,91:4225,95:4226,92:[1,4222],93:[1,4223],94:[1,4224],97:$Vd9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4228,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vd8,$Vc7),o($Vr8,$Vr1,{89:4229}),o($Vs8,$Vs1,{95:4004,91:4230,97:$V79,98:$VL,99:$VM,100:$VN}),o($Vt8,$Vu1,{82:4231}),o($Vt8,$Vu1,{82:4232}),o($Vt8,$Vu1,{82:4233}),o($Vd8,$Vv1,{101:4008,103:4009,87:4234,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$Vh7),o($Vu8,$Vi7),o($Vr8,$Vy1),o($Vr8,$Vz1),o($Vr8,$VA1),o($Vr8,$VB1),o($Vt8,$VC1),o($VD1,$VE1,{158:4235}),o($Vv8,$VG1),{115:[1,4236],118:195,119:196,120:$Vw1,122:$Vx1},o($Vu8,$V11),o($Vu8,$V21),{19:[1,4240],21:[1,4244],22:4238,32:4237,196:4239,210:4241,211:[1,4243],212:[1,4242]},{96:[1,4245]},o($Vr8,$VH1),o($Vt8,$Vq),o($Vt8,$Vr),{96:[1,4247],102:4246,104:[1,4248],105:[1,4249],106:4250,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4251]},o($Vt8,$Vt),o($Vt8,$Vu),o($Vd8,$V77),o($Vd8,$V87,{70:4252,72:4253,74:4254,40:4255,114:4256,75:[1,4257],76:[1,4258],77:[1,4259],115:$VD,120:$VD,122:$VD}),o($Vd8,$V97),o($Vd8,$Va7,{73:4260,69:4261,88:4262,90:4263,91:4267,95:4268,92:[1,4264],93:[1,4265],94:[1,4266],97:$Ve9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4270,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vd8,$Vc7),o($Vr8,$Vr1,{89:4271}),o($Vs8,$Vs1,{95:4037,91:4272,97:$V89,98:$VL,99:$VM,100:$VN}),o($Vt8,$Vu1,{82:4273}),o($Vt8,$Vu1,{82:4274}),o($Vt8,$Vu1,{82:4275}),o($Vd8,$Vv1,{101:4041,103:4042,87:4276,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$Vh7),o($Vu8,$Vi7),o($Vr8,$Vy1),o($Vr8,$Vz1),o($Vr8,$VA1),o($Vr8,$VB1),o($Vt8,$VC1),o($VD1,$VE1,{158:4277}),o($Vv8,$VG1),{115:[1,4278],118:195,119:196,120:$Vw1,122:$Vx1},o($Vu8,$V11),o($Vu8,$V21),{19:[1,4282],21:[1,4286],22:4280,32:4279,196:4281,210:4283,211:[1,4285],212:[1,4284]},{96:[1,4287]},o($Vr8,$VH1),o($Vt8,$Vq),o($Vt8,$Vr),{96:[1,4289],102:4288,104:[1,4290],105:[1,4291],106:4292,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4293]},o($Vt8,$Vt),o($Vt8,$Vu),{117:[1,4294]},o($VM8,$VO3),o($Vt8,$V43),o($Vt8,$V53),o($Vt8,$V63),o($Vt8,$V73),o($Vt8,$V83),{107:[1,4295]},o($Vt8,$Vd3),o($Vu8,$VR4),o($Vv8,$Vu5),o($Vv8,$VC1),o($Vv8,$Vq),o($Vv8,$Vr),o($Vv8,$Vt),o($Vv8,$Vu),o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vs2,$VS1),o($Vs2,$VT1),o($Vs2,$VU1),o($Vm1,$Vs5),o($Vm1,$Vt5),{19:$VO8,21:$VP8,22:4297,83:4296,210:3759,211:$VQ8},o($Vu2,$VS1),o($Vu2,$VT1),o($Vu2,$VU1),o($Vo1,$Vs5),o($Vo1,$Vt5),{19:$VR8,21:$VS8,22:4299,83:4298,210:3785,211:$VT8},o($Vt1,$Vu5),o($Vt1,$VC1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vw2,$VS1),o($Vw2,$VT1),o($Vw2,$VU1),o($Vp1,$Vs5),o($Vp1,$Vt5),{19:$VU8,21:$VV8,22:4301,83:4300,210:3812,211:$VW8},o($Vz4,$VS1),o($Vz4,$VT1),o($Vz4,$VU1),o($Vx3,$Vs5),o($Vx3,$Vt5),{19:$VX8,21:$VY8,22:4303,83:4302,210:3839,211:$VZ8},o($VA4,$VS1),o($VA4,$VT1),o($VA4,$VU1),o($Vy3,$Vs5),o($Vy3,$Vt5),{19:$V_8,21:$V$8,22:4305,83:4304,210:3865,211:$V09},o($VB3,$Vu5),o($VB3,$VC1),o($VB3,$Vq),o($VB3,$Vr),o($VB3,$Vt),o($VB3,$Vu),o($VC4,$VS1),o($VC4,$VT1),o($VC4,$VU1),o($Vz3,$Vs5),o($Vz3,$Vt5),{19:$V19,21:$V29,22:4307,83:4306,210:3892,211:$V39},o($Vr6,$V$5),o($Vr6,$VC1),o($VB6,$V77),o($VB6,$V87,{70:4308,72:4309,74:4310,40:4311,114:4312,75:[1,4313],76:[1,4314],77:[1,4315],115:$VD,120:$VD,122:$VD}),o($VB6,$V97),o($VB6,$Va7,{73:4316,69:4317,88:4318,90:4319,91:4323,95:4324,92:[1,4320],93:[1,4321],94:[1,4322],97:$Vf9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4326,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VB6,$Vc7),o($Vd7,$Vr1,{89:4327}),o($Ve7,$Vs1,{95:4142,91:4328,97:$V99,98:$VL,99:$VM,100:$VN}),o($Vf7,$Vu1,{82:4329}),o($Vf7,$Vu1,{82:4330}),o($Vf7,$Vu1,{82:4331}),o($VB6,$Vv1,{101:4146,103:4147,87:4332,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vg7,$Vh7),o($Vg7,$Vi7),o($Vd7,$Vy1),o($Vd7,$Vz1),o($Vd7,$VA1),o($Vd7,$VB1),o($Vf7,$VC1),o($VD1,$VE1,{158:4333}),o($Vj7,$VG1),{115:[1,4334],118:195,119:196,120:$Vw1,122:$Vx1},o($Vg7,$V11),o($Vg7,$V21),{19:[1,4338],21:[1,4342],22:4336,32:4335,196:4337,210:4339,211:[1,4341],212:[1,4340]},{96:[1,4343]},o($Vd7,$VH1),o($Vf7,$Vq),o($Vf7,$Vr),{96:[1,4345],102:4344,104:[1,4346],105:[1,4347],106:4348,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4349]},o($Vf7,$Vt),o($Vf7,$Vu),{117:[1,4350]},o($V48,$VO3),o($Vf7,$V43),o($Vf7,$V53),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),{107:[1,4351]},o($Vf7,$Vd3),o($Vg7,$VR4),o($Vj7,$Vu5),o($Vj7,$VC1),o($Vj7,$Vq),o($Vj7,$Vr),o($Vj7,$Vt),o($Vj7,$Vu),{117:[1,4352]},o($V48,$VO3),o($Vf7,$V43),o($Vf7,$V53),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),{107:[1,4353]},o($Vf7,$Vd3),o($Vg7,$VR4),o($Vj7,$Vu5),o($Vj7,$VC1),o($Vj7,$Vq),o($Vj7,$Vr),o($Vj7,$Vt),o($Vj7,$Vu),{189:[1,4356],190:4354,191:[1,4355]},o($V68,$VF5),o($V68,$VG5),o($V68,$VH5),o($V68,$Vq),o($V68,$Vr),o($V68,$Vc4),o($V68,$Vd4),o($V68,$Ve4),o($V68,$Vt),o($V68,$Vu),o($V68,$Vf4),o($V68,$Vg4,{198:4357,199:4358,107:[1,4359]}),o($V68,$Vh4),o($V68,$Vi4),o($V68,$Vj4),o($V68,$Vk4),o($V68,$Vl4),o($V68,$Vm4),o($V68,$Vn4),o($V68,$Vo4),o($V68,$Vp4),o($Vg9,$V93),o($Vg9,$Va3),o($Vg9,$Vb3),o($Vg9,$Vc3),o($Vd8,$V$7),o($Vx,$Vg,{55:4360,36:4361,39:$Vy}),o($Vd8,$V08),o($Vd8,$V18),o($Vd8,$Vh7),o($Vd8,$Vi7),{115:[1,4362],118:195,119:196,120:$Vw1,122:$Vx1},o($Vd8,$V11),o($Vd8,$V21),{19:[1,4366],21:[1,4370],22:4364,32:4363,196:4365,210:4367,211:[1,4369],212:[1,4368]},o($Vd8,$V28),o($Vd8,$V38),o($VM8,$Vr1,{89:4371}),o($Vd8,$Vs1,{95:4226,91:4372,97:$Vd9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy1),o($VM8,$Vz1),o($VM8,$VA1),o($VM8,$VB1),{96:[1,4373]},o($VM8,$VH1),{66:[1,4374]},o($Vs8,$Vx2,{95:4004,91:4375,97:$V79,98:$VL,99:$VM,100:$VN}),o($Vr8,$Vy2),o($Vd8,$Vz2,{86:4376,91:4377,87:4378,95:4379,101:4381,103:4382,97:$Vh9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VB2,{86:4376,91:4377,87:4378,95:4379,101:4381,103:4382,97:$Vh9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VC2,{86:4376,91:4377,87:4378,95:4379,101:4381,103:4382,97:$Vh9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vv8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,4383],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4384,117:$VG2,143:$VH2,185:$VI2}),o($Vu8,$VR1),o($Vu8,$Vl),o($Vu8,$Vm),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vs),o($Vu8,$Vt),o($Vu8,$Vu),o($Vr8,$V43),o($Vv8,$V53),o($Vv8,$V63),o($Vv8,$V73),o($Vv8,$V83),{107:[1,4385]},o($Vv8,$Vd3),o($Vd8,$V08),o($Vd8,$V18),o($Vd8,$Vh7),o($Vd8,$Vi7),{115:[1,4386],118:195,119:196,120:$Vw1,122:$Vx1},o($Vd8,$V11),o($Vd8,$V21),{19:[1,4390],21:[1,4394],22:4388,32:4387,196:4389,210:4391,211:[1,4393],212:[1,4392]},o($Vd8,$V28),o($Vd8,$V38),o($VM8,$Vr1,{89:4395}),o($Vd8,$Vs1,{95:4268,91:4396,97:$Ve9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy1),o($VM8,$Vz1),o($VM8,$VA1),o($VM8,$VB1),{96:[1,4397]},o($VM8,$VH1),{66:[1,4398]},o($Vs8,$Vx2,{95:4037,91:4399,97:$V89,98:$VL,99:$VM,100:$VN}),o($Vr8,$Vy2),o($Vd8,$Vz2,{86:4400,91:4401,87:4402,95:4403,101:4405,103:4406,97:$Vi9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VB2,{86:4400,91:4401,87:4402,95:4403,101:4405,103:4406,97:$Vi9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VC2,{86:4400,91:4401,87:4402,95:4403,101:4405,103:4406,97:$Vi9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vv8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,4407],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4408,117:$VG2,143:$VH2,185:$VI2}),o($Vu8,$VR1),o($Vu8,$Vl),o($Vu8,$Vm),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vs),o($Vu8,$Vt),o($Vu8,$Vu),o($Vr8,$V43),o($Vv8,$V53),o($Vv8,$V63),o($Vv8,$V73),o($Vv8,$V83),{107:[1,4409]},o($Vv8,$Vd3),o($Vd8,$VR4),{19:[1,4412],21:[1,4415],22:4411,83:4410,210:4413,211:[1,4414]},o($Vm1,$V$5),o($Vm1,$VC1),o($Vo1,$V$5),o($Vo1,$VC1),o($Vp1,$V$5),o($Vp1,$VC1),o($Vx3,$V$5),o($Vx3,$VC1),o($Vy3,$V$5),o($Vy3,$VC1),o($Vz3,$V$5),o($Vz3,$VC1),o($VB6,$V08),o($VB6,$V18),o($VB6,$Vh7),o($VB6,$Vi7),{115:[1,4416],118:195,119:196,120:$Vw1,122:$Vx1},o($VB6,$V11),o($VB6,$V21),{19:[1,4420],21:[1,4424],22:4418,32:4417,196:4419,210:4421,211:[1,4423],212:[1,4422]},o($VB6,$V28),o($VB6,$V38),o($V48,$Vr1,{89:4425}),o($VB6,$Vs1,{95:4324,91:4426,97:$Vf9,98:$VL,99:$VM,100:$VN}),o($V48,$Vy1),o($V48,$Vz1),o($V48,$VA1),o($V48,$VB1),{96:[1,4427]},o($V48,$VH1),{66:[1,4428]},o($Ve7,$Vx2,{95:4142,91:4429,97:$V99,98:$VL,99:$VM,100:$VN}),o($Vd7,$Vy2),o($VB6,$Vz2,{86:4430,91:4431,87:4432,95:4433,101:4435,103:4436,97:$Vj9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VB2,{86:4430,91:4431,87:4432,95:4433,101:4435,103:4436,97:$Vj9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB6,$VC2,{86:4430,91:4431,87:4432,95:4433,101:4435,103:4436,97:$Vj9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vj7,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,4437],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4438,117:$VG2,143:$VH2,185:$VI2}),o($Vg7,$VR1),o($Vg7,$Vl),o($Vg7,$Vm),o($Vg7,$Vq),o($Vg7,$Vr),o($Vg7,$Vs),o($Vg7,$Vt),o($Vg7,$Vu),o($Vd7,$V43),o($Vj7,$V53),o($Vj7,$V63),o($Vj7,$V73),o($Vj7,$V83),{107:[1,4439]},o($Vj7,$Vd3),o($VB6,$VR4),{19:[1,4442],21:[1,4445],22:4441,83:4440,210:4443,211:[1,4444]},o($VB6,$VR4),{19:[1,4448],21:[1,4451],22:4447,83:4446,210:4449,211:[1,4450]},o($VK8,$VS1),o($VK8,$VT1),o($VK8,$VU1),o($V68,$Vs5),o($V68,$Vt5),{19:$Va9,21:$Vb9,22:4453,83:4452,210:4187,211:$Vc9},o($Vd8,$Vm8),o($VC,$VD,{59:4454,69:4455,71:4456,72:4457,88:4460,90:4461,83:4463,84:4464,85:4465,74:4466,40:4467,91:4471,22:4472,87:4474,114:4475,95:4479,210:4482,101:4483,103:4484,19:[1,4481],21:[1,4486],65:[1,4458],67:[1,4459],75:[1,4476],76:[1,4477],77:[1,4478],81:[1,4462],92:[1,4468],93:[1,4469],94:[1,4470],97:$Vk9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4473],211:[1,4485]}),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4487,117:$VG2,143:$VH2,185:$VI2}),o($Vd8,$VR1),o($Vd8,$Vl),o($Vd8,$Vm),o($Vd8,$Vq),o($Vd8,$Vr),o($Vd8,$Vs),o($Vd8,$Vt),o($Vd8,$Vu),o($Vd8,$Vx2,{95:4226,91:4488,97:$Vd9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy2),o($VM8,$V43),o($Vd8,$Vo8),o($Vr8,$VO3),o($Vt8,$VP3),o($Vt8,$VQ3),o($Vt8,$VR3),{96:[1,4489]},o($Vt8,$VH1),{96:[1,4491],102:4490,104:[1,4492],105:[1,4493],106:4494,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4495]},o($Vt8,$V94),{117:[1,4496]},{19:[1,4499],21:[1,4502],22:4498,83:4497,210:4500,211:[1,4501]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4503,117:$VG2,143:$VH2,185:$VI2}),o($Vd8,$VR1),o($Vd8,$Vl),o($Vd8,$Vm),o($Vd8,$Vq),o($Vd8,$Vr),o($Vd8,$Vs),o($Vd8,$Vt),o($Vd8,$Vu),o($Vd8,$Vx2,{95:4268,91:4504,97:$Ve9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy2),o($VM8,$V43),o($Vd8,$Vo8),o($Vr8,$VO3),o($Vt8,$VP3),o($Vt8,$VQ3),o($Vt8,$VR3),{96:[1,4505]},o($Vt8,$VH1),{96:[1,4507],102:4506,104:[1,4508],105:[1,4509],106:4510,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4511]},o($Vt8,$V94),{117:[1,4512]},{19:[1,4515],21:[1,4518],22:4514,83:4513,210:4516,211:[1,4517]},o($Vt8,$Vu5),o($Vt8,$VC1),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vt),o($Vt8,$Vu),o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4519,117:$VG2,143:$VH2,185:$VI2}),o($VB6,$VR1),o($VB6,$Vl),o($VB6,$Vm),o($VB6,$Vq),o($VB6,$Vr),o($VB6,$Vs),o($VB6,$Vt),o($VB6,$Vu),o($VB6,$Vx2,{95:4324,91:4520,97:$Vf9,98:$VL,99:$VM,100:$VN}),o($V48,$Vy2),o($V48,$V43),o($VB6,$Vo8),o($Vd7,$VO3),o($Vf7,$VP3),o($Vf7,$VQ3),o($Vf7,$VR3),{96:[1,4521]},o($Vf7,$VH1),{96:[1,4523],102:4522,104:[1,4524],105:[1,4525],106:4526,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4527]},o($Vf7,$V94),{117:[1,4528]},{19:[1,4531],21:[1,4534],22:4530,83:4529,210:4532,211:[1,4533]},o($Vf7,$Vu5),o($Vf7,$VC1),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vt),o($Vf7,$Vu),o($Vf7,$Vu5),o($Vf7,$VC1),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vt),o($Vf7,$Vu),o($V68,$V$5),o($V68,$VC1),o($Vd8,$V77),o($Vd8,$V87,{70:4535,72:4536,74:4537,40:4538,114:4539,75:[1,4540],76:[1,4541],77:[1,4542],115:$VD,120:$VD,122:$VD}),o($Vd8,$V97),o($Vd8,$Va7,{73:4543,69:4544,88:4545,90:4546,91:4550,95:4551,92:[1,4547],93:[1,4548],94:[1,4549],97:$Vl9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4553,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vd8,$Vc7),o($Vr8,$Vr1,{89:4554}),o($Vs8,$Vs1,{95:4479,91:4555,97:$Vk9,98:$VL,99:$VM,100:$VN}),o($Vt8,$Vu1,{82:4556}),o($Vt8,$Vu1,{82:4557}),o($Vt8,$Vu1,{82:4558}),o($Vd8,$Vv1,{101:4483,103:4484,87:4559,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vu8,$Vh7),o($Vu8,$Vi7),o($Vr8,$Vy1),o($Vr8,$Vz1),o($Vr8,$VA1),o($Vr8,$VB1),o($Vt8,$VC1),o($VD1,$VE1,{158:4560}),o($Vv8,$VG1),{115:[1,4561],118:195,119:196,120:$Vw1,122:$Vx1},o($Vu8,$V11),o($Vu8,$V21),{19:[1,4565],21:[1,4569],22:4563,32:4562,196:4564,210:4566,211:[1,4568],212:[1,4567]},{96:[1,4570]},o($Vr8,$VH1),o($Vt8,$Vq),o($Vt8,$Vr),{96:[1,4572],102:4571,104:[1,4573],105:[1,4574],106:4575,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4576]},o($Vt8,$Vt),o($Vt8,$Vu),{117:[1,4577]},o($VM8,$VO3),o($Vt8,$V43),o($Vt8,$V53),o($Vt8,$V63),o($Vt8,$V73),o($Vt8,$V83),{107:[1,4578]},o($Vt8,$Vd3),o($Vu8,$VR4),o($Vv8,$Vu5),o($Vv8,$VC1),o($Vv8,$Vq),o($Vv8,$Vr),o($Vv8,$Vt),o($Vv8,$Vu),{117:[1,4579]},o($VM8,$VO3),o($Vt8,$V43),o($Vt8,$V53),o($Vt8,$V63),o($Vt8,$V73),o($Vt8,$V83),{107:[1,4580]},o($Vt8,$Vd3),o($Vu8,$VR4),o($Vv8,$Vu5),o($Vv8,$VC1),o($Vv8,$Vq),o($Vv8,$Vr),o($Vv8,$Vt),o($Vv8,$Vu),{117:[1,4581]},o($V48,$VO3),o($Vf7,$V43),o($Vf7,$V53),o($Vf7,$V63),o($Vf7,$V73),o($Vf7,$V83),{107:[1,4582]},o($Vf7,$Vd3),o($Vg7,$VR4),o($Vj7,$Vu5),o($Vj7,$VC1),o($Vj7,$Vq),o($Vj7,$Vr),o($Vj7,$Vt),o($Vj7,$Vu),o($Vd8,$V08),o($Vd8,$V18),o($Vd8,$Vh7),o($Vd8,$Vi7),{115:[1,4583],118:195,119:196,120:$Vw1,122:$Vx1},o($Vd8,$V11),o($Vd8,$V21),{19:[1,4587],21:[1,4591],22:4585,32:4584,196:4586,210:4588,211:[1,4590],212:[1,4589]},o($Vd8,$V28),o($Vd8,$V38),o($VM8,$Vr1,{89:4592}),o($Vd8,$Vs1,{95:4551,91:4593,97:$Vl9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy1),o($VM8,$Vz1),o($VM8,$VA1),o($VM8,$VB1),{96:[1,4594]},o($VM8,$VH1),{66:[1,4595]},o($Vs8,$Vx2,{95:4479,91:4596,97:$Vk9,98:$VL,99:$VM,100:$VN}),o($Vr8,$Vy2),o($Vd8,$Vz2,{86:4597,91:4598,87:4599,95:4600,101:4602,103:4603,97:$Vm9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VB2,{86:4597,91:4598,87:4599,95:4600,101:4602,103:4603,97:$Vm9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vd8,$VC2,{86:4597,91:4598,87:4599,95:4600,101:4602,103:4603,97:$Vm9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vv8,$VD2),{19:$VN2,21:$VO2,22:383,67:$VP2,77:$VQ2,96:$VR2,104:$VS2,105:$VT2,106:395,159:[1,4604],160:378,161:379,162:380,163:381,177:384,181:$VU2,192:389,193:390,194:391,197:394,200:$VV2,201:$VW2,202:$VX2,203:$VY2,204:$VZ2,205:$V_2,206:$V$2,207:$V03,208:$V13,209:$V23,210:388,211:$V33},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4605,117:$VG2,143:$VH2,185:$VI2}),o($Vu8,$VR1),o($Vu8,$Vl),o($Vu8,$Vm),o($Vu8,$Vq),o($Vu8,$Vr),o($Vu8,$Vs),o($Vu8,$Vt),o($Vu8,$Vu),o($Vr8,$V43),o($Vv8,$V53),o($Vv8,$V63),o($Vv8,$V73),o($Vv8,$V83),{107:[1,4606]},o($Vv8,$Vd3),o($Vd8,$VR4),{19:[1,4609],21:[1,4612],22:4608,83:4607,210:4610,211:[1,4611]},o($Vd8,$VR4),{19:[1,4615],21:[1,4618],22:4614,83:4613,210:4616,211:[1,4617]},o($VB6,$VR4),{19:[1,4621],21:[1,4624],22:4620,83:4619,210:4622,211:[1,4623]},o($VE2,$VF2,{121:357,125:358,126:359,127:360,131:361,132:362,133:363,139:364,141:365,142:366,116:4625,117:$VG2,143:$VH2,185:$VI2}),o($Vd8,$VR1),o($Vd8,$Vl),o($Vd8,$Vm),o($Vd8,$Vq),o($Vd8,$Vr),o($Vd8,$Vs),o($Vd8,$Vt),o($Vd8,$Vu),o($Vd8,$Vx2,{95:4551,91:4626,97:$Vl9,98:$VL,99:$VM,100:$VN}),o($VM8,$Vy2),o($VM8,$V43),o($Vd8,$Vo8),o($Vr8,$VO3),o($Vt8,$VP3),o($Vt8,$VQ3),o($Vt8,$VR3),{96:[1,4627]},o($Vt8,$VH1),{96:[1,4629],102:4628,104:[1,4630],105:[1,4631],106:4632,202:$VI1,203:$VJ1,204:$VK1,205:$VL1},{96:[1,4633]},o($Vt8,$V94),{117:[1,4634]},{19:[1,4637],21:[1,4640],22:4636,83:4635,210:4638,211:[1,4639]},o($Vt8,$Vu5),o($Vt8,$VC1),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vt),o($Vt8,$Vu),o($Vt8,$Vu5),o($Vt8,$VC1),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vt),o($Vt8,$Vu),o($Vf7,$Vu5),o($Vf7,$VC1),o($Vf7,$Vq),o($Vf7,$Vr),o($Vf7,$Vt),o($Vf7,$Vu),{117:[1,4641]},o($VM8,$VO3),o($Vt8,$V43),o($Vt8,$V53),o($Vt8,$V63),o($Vt8,$V73),o($Vt8,$V83),{107:[1,4642]},o($Vt8,$Vd3),o($Vu8,$VR4),o($Vv8,$Vu5),o($Vv8,$VC1),o($Vv8,$Vq),o($Vv8,$Vr),o($Vv8,$Vt),o($Vv8,$Vu),o($Vd8,$VR4),{19:[1,4645],21:[1,4648],22:4644,83:4643,210:4646,211:[1,4647]},o($Vt8,$Vu5),o($Vt8,$VC1),o($Vt8,$Vq),o($Vt8,$Vr),o($Vt8,$Vt),o($Vt8,$Vu)],
defaultActions: {6:[2,11],30:[2,1],102:[2,115],103:[2,116],104:[2,117],111:[2,128],112:[2,129],206:[2,250],207:[2,251],208:[2,252],209:[2,253],329:[2,31],357:[2,137],358:[2,141],360:[2,143],556:[2,29],557:[2,33],594:[2,30],1104:[2,141],1106:[2,143]},
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
      Parser.shapes[label] = Object.assign({id: label}, shape);
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
case 3: yy_.yytext = yy_.yytext.substr(1); return 181; 
break;
case 4:return 77;
break;
case 5:return 211;
break;
case 6:return 154;
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
case 13:return 195;
break;
case 14:return 97;
break;
case 15:return 212;
break;
case 16:return 191;
break;
case 17:return 207;
break;
case 18:return 209;
break;
case 19:return 206;
break;
case 20:return 208;
break;
case 21:return 203;
break;
case 22:return 205;
break;
case 23:return 202;
break;
case 24:return 204;
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
case 30:return 120;
break;
case 31:return 122;
break;
case 32:return 81;
break;
case 33:return 93;
break;
case 34:return 92;
break;
case 35:return 94;
break;
case 36:return 49;
break;
case 37:return 47;
break;
case 38:return 39;
break;
case 39:return 108;
break;
case 40:return 109;
break;
case 41:return 110;
break;
case 42:return 111;
break;
case 43:return 98;
break;
case 44:return 99;
break;
case 45:return 100;
break;
case 46:return 112;
break;
case 47:return 113;
break;
case 48:return 27;
break;
case 49:return 186;
break;
case 50:return 115;
break;
case 51:return 117;
break;
case 52:return 185;
break;
case 53:return '||';
break;
case 54:return 130;
break;
case 55:return 135;
break;
case 56:return 65;
break;
case 57:return 66;
break;
case 58:return 157;
break;
case 59:return 159;
break;
case 60:return 143;
break;
case 61:return 156;
break;
case 62:return 107;
break;
case 63:return 155;
break;
case 64:return 67;
break;
case 65:return 174;
break;
case 66:return 136;
break;
case 67:return 151;
break;
case 68:return 152;
break;
case 69:return 153;
break;
case 70:return 175;
break;
case 71:return 189;
break;
case 72:return 200;
break;
case 73:return 201;
break;
case 74:return 7;
break;
case 75:return 'unexpected word "'+yy_.yytext+'"';
break;
case 76:return 'invalid character '+yy_.yytext;
break;
}
},
rules: [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76],"inclusive":true}}
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