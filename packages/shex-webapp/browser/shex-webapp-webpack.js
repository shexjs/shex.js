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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 41);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var RDF  = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    XSD  = 'http://www.w3.org/2001/XMLSchema#',
    SWAP = 'http://www.w3.org/2000/10/swap/';

/* harmony default export */ __webpack_exports__["a"] = ({
  xsd: {
    decimal: XSD + 'decimal',
    boolean: XSD + 'boolean',
    double:  XSD + 'double',
    integer: XSD + 'integer',
    string:  XSD + 'string',
  },
  rdf: {
    type:       RDF + 'type',
    nil:        RDF + 'nil',
    first:      RDF + 'first',
    rest:       RDF + 'rest',
    langString: RDF + 'langString',
  },
  owl: {
    sameAs: 'http://www.w3.org/2002/07/owl#sameAs',
  },
  r: {
    forSome: SWAP + 'reify#forSome',
    forAll:  SWAP + 'reify#forAll',
  },
  log: {
    implies: SWAP + 'log#implies',
  },
});


/***/ }),
/* 1 */
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
/* 2 */
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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {



/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  }

  return keys;
};
/*</replacement>*/


module.exports = Duplex;

var Readable = __webpack_require__(33);

var Writable = __webpack_require__(37);

__webpack_require__(10)(Duplex, Readable);

{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);

  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;

  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;

    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
}); // the no-half-open enforcer

function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return; // no more data can be written.
  // But allow more writes to happen in this tick.

  process.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }

    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(33);
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = __webpack_require__(37);
exports.Duplex = __webpack_require__(5);
exports.Transform = __webpack_require__(39);
exports.PassThrough = __webpack_require__(76);
exports.finished = __webpack_require__(17);
exports.pipeline = __webpack_require__(77);


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/**
 *
 * isIRI, isBlank, getLiteralType, getLiteralValue
 */

var RdfTerm = (function () {

  var absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
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
    var result = '', length = iri.length, i = -1, pathStart = -1, segmentStart = 0, next = '/';

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
      var pref = Object.keys(prefixes).find(pref => node.startsWith(prefixes[pref]));
      if (pref) {
        var rest = node.substr(prefixes[pref].length);
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
      var value = getLiteralValue(node);
      var type = getLiteralType(node);
      var language = getLiteralLanguage(node);
      // Escape special characters
      if (escape.test(value))
        value = value.replace(escapeAll, characterReplacer);
      // Write the literal, possibly with type or language
      if (language)
        return '"' + value + '"@' + language;
      else if (type)
        return '"' + value + '"^^' + this._encodeIriOrBlankNode(type);
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
      var firstChar = entity[0];
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
    var match = /^"([^]*)"/.exec(literal);
    if (!match)
      throw new Error(literal + ' is not a literal');
    return match[1];
  }

  // Gets the type of a literal in the N3 library
  function getLiteralType (literal) {
    var match = /^"[^]*"(?:\^\^([^"]+)|(@)[^@"]+)?$/.exec(literal);
    if (!match)
      throw new Error(literal + ' is not a literal');
    return match[1] || (match[2] ? RdfLangString : XsdString);
  }

  // Gets the language of a literal in the N3 library
  function getLiteralLanguage (literal) {
    var match = /^"[^]*"(?:@([^@"]+)|\^\^[^"]+)?$/.exec(literal);
    if (!match)
      throw new Error(literal + ' is not a literal');
    return match[1] ? match[1].toLowerCase() : '';
  }


// rdf:type predicate (for 'a' abbreviation)
var RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    RDF_TYPE   = RDF_PREFIX + 'type';

// Characters in literals that require escaping
var escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapeReplacements = {
      '\\': '\\\\', '"': '\\"', '\t': '\\t',
      '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
    };

  // Replaces a character by its escaped version
  function characterReplacer (character) {
    // Replace a single character by its escaped version
    var result = escapeReplacements[character];
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
  module.exports = RdfTerm; // node environment


/***/ }),
/* 8 */
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(66)
var ieee754 = __webpack_require__(67)
var isArray = __webpack_require__(68)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(8)))

/***/ }),
/* 10 */
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var ShExCore = {
  RdfTerm:    __webpack_require__(7),
  Util:         __webpack_require__(20),
  Validator:    __webpack_require__(53),
  Writer:    __webpack_require__(21),
  'nfax-val-1err':     __webpack_require__(54),
  'threaded-val-nerr': __webpack_require__(25)
};

if (true)
  module.exports = ShExCore;



/***/ }),
/* 12 */
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

exports.isBuffer = __webpack_require__(46);

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
exports.inherits = __webpack_require__(47);

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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return N3Lexer; });
/* harmony import */ var _IRIs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var queue_microtask__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(40);
/* harmony import */ var queue_microtask__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(queue_microtask__WEBPACK_IMPORTED_MODULE_1__);
// **N3Lexer** tokenizes N3 documents.



const { xsd } = _IRIs__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"];

// Regular expression and replacement string to escape N3 strings
var escapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\([^])/g;
var escapeReplacements = {
  '\\': '\\', "'": "'", '"': '"',
  'n': '\n', 'r': '\r', 't': '\t', 'f': '\f', 'b': '\b',
  '_': '_', '~': '~', '.': '.', '-': '-', '!': '!', '$': '$', '&': '&',
  '(': '(', ')': ')', '*': '*', '+': '+', ',': ',', ';': ';', '=': '=',
  '/': '/', '?': '?', '#': '#', '@': '@', '%': '%',
};
var illegalIriChars = /[\x00-\x20<>\\"\{\}\|\^\`]/;

var lineModeRegExps = {
  _iri: true,
  _unescapedIri: true,
  _simpleQuotedString: true,
  _langcode: true,
  _blank: true,
  _newline: true,
  _comment: true,
  _whitespace: true,
  _endOfFile: true,
};
var invalidRegExp = /$0^/;

// ## Constructor
class N3Lexer {
  constructor(options) {
    // ## Regular expressions
    // It's slightly faster to have these as properties than as in-scope variables
    this._iri = /^<((?:[^ <>{}\\]|\\[uU])+)>[ \t]*/; // IRI with escape sequences; needs sanity check after unescaping
    this._unescapedIri = /^<([^\x00-\x20<>\\"\{\}\|\^\`]*)>[ \t]*/; // IRI without escape sequences; no unescaping
    this._simpleQuotedString = /^"([^"\\\r\n]*)"(?=[^"])/; // string without escape sequences
    this._simpleApostropheString = /^'([^'\\\r\n]*)'(?=[^'])/;
    this._langcode = /^@([a-z]+(?:-[a-z0-9]+)*)(?=[^a-z0-9\-])/i;
    this._prefix = /^((?:[A-Za-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])(?:\.?[\-0-9A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])*)?:(?=[#\s<])/;
    this._prefixed = /^((?:[A-Za-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])(?:\.?[\-0-9A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])*)?:((?:(?:[0-:A-Z_a-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff]|%[0-9a-fA-F]{2}|\\[!#-\/;=?\-@_~])(?:(?:[\.\-0-:A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff]|%[0-9a-fA-F]{2}|\\[!#-\/;=?\-@_~])*(?:[\-0-:A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff]|%[0-9a-fA-F]{2}|\\[!#-\/;=?\-@_~]))?)?)(?:[ \t]+|(?=\.?[,;!\^\s#()\[\]\{\}"'<>]))/;
    this._variable = /^\?(?:(?:[A-Z_a-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])(?:[\-0-:A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])*)(?=[.,;!\^\s#()\[\]\{\}"'<>])/;
    this._blank = /^_:((?:[0-9A-Z_a-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])(?:\.?[\-0-9A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])*)(?:[ \t]+|(?=\.?[,;:\s#()\[\]\{\}"'<>]))/;
    this._number = /^[\-+]?(?:(\d+\.\d*|\.?\d+)[eE][\-+]?|\d*(\.)?)\d+(?=\.?[,;:\s#()\[\]\{\}"'<>])/;
    this._boolean = /^(?:true|false)(?=[.,;\s#()\[\]\{\}"'<>])/;
    this._keyword = /^@[a-z]+(?=[\s#<:])/i;
    this._sparqlKeyword = /^(?:PREFIX|BASE|GRAPH)(?=[\s#<])/i;
    this._shortPredicates = /^a(?=[\s()\[\]\{\}"'<>])/;
    this._newline = /^[ \t]*(?:#[^\n\r]*)?(?:\r\n|\n|\r)[ \t]*/;
    this._comment = /#([^\n\r]*)/;
    this._whitespace = /^[ \t]+/;
    this._endOfFile = /^(?:#[^\n\r]*)?$/;
    options = options || {};

    // In line mode (N-Triples or N-Quads), only simple features may be parsed
    if (this._lineMode = !!options.lineMode) {
      this._n3Mode = false;
      // Don't tokenize special literals
      for (var key in this) {
        if (!(key in lineModeRegExps) && this[key] instanceof RegExp)
          this[key] = invalidRegExp;
      }
    }
    // When not in line mode, enable N3 functionality by default
    else {
      this._n3Mode = options.n3 !== false;
    }
    // Don't output comment tokens by default
    this._comments = !!options.comments;
    // Cache the last tested closing position of long literals
    this._literalClosingPos = 0;
  }

  // ## Private methods

  // ### `_tokenizeToEnd` tokenizes as for as possible, emitting tokens through the callback
  _tokenizeToEnd(callback, inputFinished) {
    // Continue parsing as far as possible; the loop will return eventually
    var input = this._input, outputComments = this._comments;
    while (true) {
      // Count and skip whitespace lines
      var whiteSpaceMatch, comment;
      while (whiteSpaceMatch = this._newline.exec(input)) {
        // Try to find a comment
        if (outputComments && (comment = this._comment.exec(whiteSpaceMatch[0])))
          callback(null, { line: this._line, type: 'comment', value: comment[1], prefix: '' });
        // Advance the input
        input = input.substr(whiteSpaceMatch[0].length, input.length);
        this._line++;
      }
      // Skip whitespace on current line
      if (!whiteSpaceMatch && (whiteSpaceMatch = this._whitespace.exec(input)))
        input = input.substr(whiteSpaceMatch[0].length, input.length);

      // Stop for now if we're at the end
      if (this._endOfFile.test(input)) {
        // If the input is finished, emit EOF
        if (inputFinished) {
          // Try to find a final comment
          if (outputComments && (comment = this._comment.exec(input)))
            callback(null, { line: this._line, type: 'comment', value: comment[1], prefix: '' });
          callback(input = null, { line: this._line, type: 'eof', value: '', prefix: '' });
        }
        return this._input = input;
      }

      // Look for specific token types based on the first character
      var line = this._line, type = '', value = '', prefix = '',
          firstChar = input[0], match = null, matchLength = 0, inconclusive = false;
      switch (firstChar) {
      case '^':
        // We need at least 3 tokens lookahead to distinguish ^^<IRI> and ^^pre:fixed
        if (input.length < 3)
          break;
        // Try to match a type
        else if (input[1] === '^') {
          this._previousMarker = '^^';
          // Move to type IRI or prefixed name
          input = input.substr(2);
          if (input[0] !== '<') {
            inconclusive = true;
            break;
          }
        }
        // If no type, it must be a path expression
        else {
          if (this._n3Mode) {
            matchLength = 1;
            type = '^';
          }
          break;
        }
        // Fall through in case the type is an IRI
      case '<':
        // Try to find a full IRI without escape sequences
        if (match = this._unescapedIri.exec(input))
          type = 'IRI', value = match[1];
        // Try to find a full IRI with escape sequences
        else if (match = this._iri.exec(input)) {
          value = this._unescape(match[1]);
          if (value === null || illegalIriChars.test(value))
            return reportSyntaxError(this);
          type = 'IRI';
        }
        // Try to find a nested triple
        else if (input.length > 1 && input[1] === '<')
          type = '<<', matchLength = 2;
        // Try to find a backwards implication arrow
        else if (this._n3Mode && input.length > 1 && input[1] === '=')
          type = 'inverse', matchLength = 2, value = '>';
        break;

      case '>':
        if (input.length > 1 && input[1] === '>')
          type = '>>', matchLength = 2;
        break;

      case '_':
        // Try to find a blank node. Since it can contain (but not end with) a dot,
        // we always need a non-dot character before deciding it is a blank node.
        // Therefore, try inserting a space if we're at the end of the input.
        if ((match = this._blank.exec(input)) ||
            inputFinished && (match = this._blank.exec(input + ' ')))
          type = 'blank', prefix = '_', value = match[1];
        break;

      case '"':
        // Try to find a literal without escape sequences
        if (match = this._simpleQuotedString.exec(input))
          value = match[1];
        // Try to find a literal wrapped in three pairs of quotes
        else {
          ({ value, matchLength } = this._parseLiteral(input));
          if (value === null)
            return reportSyntaxError(this);
        }
        if (match !== null || matchLength !== 0) {
          type = 'literal';
          this._literalClosingPos = 0;
        }
        break;

      case "'":
        if (!this._lineMode) {
          // Try to find a literal without escape sequences
          if (match = this._simpleApostropheString.exec(input))
            value = match[1];
          // Try to find a literal wrapped in three pairs of quotes
          else {
            ({ value, matchLength } = this._parseLiteral(input));
            if (value === null)
              return reportSyntaxError(this);
          }
          if (match !== null || matchLength !== 0) {
            type = 'literal';
            this._literalClosingPos = 0;
          }
        }
        break;

      case '?':
        // Try to find a variable
        if (this._n3Mode && (match = this._variable.exec(input)))
          type = 'var', value = match[0];
        break;

      case '@':
        // Try to find a language code
        if (this._previousMarker === 'literal' && (match = this._langcode.exec(input)))
          type = 'langcode', value = match[1];
        // Try to find a keyword
        else if (match = this._keyword.exec(input))
          type = match[0];
        break;

      case '.':
        // Try to find a dot as punctuation
        if (input.length === 1 ? inputFinished : (input[1] < '0' || input[1] > '9')) {
          type = '.';
          matchLength = 1;
          break;
        }
        // Fall through to numerical case (could be a decimal dot)

      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '+':
      case '-':
        // Try to find a number. Since it can contain (but not end with) a dot,
        // we always need a non-dot character before deciding it is a number.
        // Therefore, try inserting a space if we're at the end of the input.
        if (match = this._number.exec(input) ||
            inputFinished && (match = this._number.exec(input + ' '))) {
          type = 'literal', value = match[0];
          prefix = (typeof match[1] === 'string' ? xsd.double :
                    (typeof match[2] === 'string' ? xsd.decimal : xsd.integer));
        }
        break;

      case 'B':
      case 'b':
      case 'p':
      case 'P':
      case 'G':
      case 'g':
        // Try to find a SPARQL-style keyword
        if (match = this._sparqlKeyword.exec(input))
          type = match[0].toUpperCase();
        else
          inconclusive = true;
        break;

      case 'f':
      case 't':
        // Try to match a boolean
        if (match = this._boolean.exec(input))
          type = 'literal', value = match[0], prefix = xsd.boolean;
        else
          inconclusive = true;
        break;

      case 'a':
        // Try to find an abbreviated predicate
        if (match = this._shortPredicates.exec(input))
          type = 'abbreviation', value = 'a';
        else
          inconclusive = true;
        break;

      case '=':
        // Try to find an implication arrow or equals sign
        if (this._n3Mode && input.length > 1) {
          type = 'abbreviation';
          if (input[1] !== '>')
            matchLength = 1, value = '=';
          else
            matchLength = 2, value = '>';
        }
        break;

      case '!':
        if (!this._n3Mode)
          break;
      case ',':
      case ';':
      case '[':
      case ']':
      case '(':
      case ')':
      case '{':
      case '}':
        if (!this._lineMode) {
          matchLength = 1;
          type = firstChar;
        }
        break;

      default:
        inconclusive = true;
      }

      // Some first characters do not allow an immediate decision, so inspect more
      if (inconclusive) {
        // Try to find a prefix
        if ((this._previousMarker === '@prefix' || this._previousMarker === 'PREFIX') &&
            (match = this._prefix.exec(input)))
          type = 'prefix', value = match[1] || '';
        // Try to find a prefixed name. Since it can contain (but not end with) a dot,
        // we always need a non-dot character before deciding it is a prefixed name.
        // Therefore, try inserting a space if we're at the end of the input.
        else if ((match = this._prefixed.exec(input)) ||
                 inputFinished && (match = this._prefixed.exec(input + ' ')))
          type = 'prefixed', prefix = match[1] || '', value = this._unescape(match[2]);
      }

      // A type token is special: it can only be emitted after an IRI or prefixed name is read
      if (this._previousMarker === '^^') {
        switch (type) {
        case 'prefixed': type = 'type';    break;
        case 'IRI':      type = 'typeIRI'; break;
        default:         type = '';
        }
      }

      // What if nothing of the above was found?
      if (!type) {
        // We could be in streaming mode, and then we just wait for more input to arrive.
        // Otherwise, a syntax error has occurred in the input.
        // One exception: error on an unaccounted linebreak (= not inside a triple-quoted literal).
        if (inputFinished || (!/^'''|^"""/.test(input) && /\n|\r/.test(input)))
          return reportSyntaxError(this);
        else
          return this._input = input;
      }

      // Emit the parsed token
      var token = { line: line, type: type, value: value, prefix: prefix };
      callback(null, token);
      this.previousToken = token;
      this._previousMarker = type;
      // Advance to next part to tokenize
      input = input.substr(matchLength || match[0].length, input.length);
    }

    // Signals the syntax error through the callback
    function reportSyntaxError(self) { callback(self._syntaxError(/^\S*/.exec(input)[0])); }
  }

  // ### `_unescape` replaces N3 escape codes by their corresponding characters
  _unescape(item) {
    let invalid = false;
    const replaced = item.replace(escapeSequence, (sequence, unicode4, unicode8, escapedChar) => {
      // 4-digit unicode character
      if (typeof unicode4 === 'string')
        return String.fromCharCode(Number.parseInt(unicode4, 16));
      // 8-digit unicode character
      if (typeof unicode8 === 'string') {
        let charCode = Number.parseInt(unicode8, 16);
        return charCode <= 0xFFFF ? String.fromCharCode(Number.parseInt(unicode8, 16)) :
          String.fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
      }
      // fixed escape sequence
      if (escapedChar in escapeReplacements)
        return escapeReplacements[escapedChar];
      // invalid escape sequence
      invalid = true;
      return '';
    });
    return invalid ? null : replaced;
  }

  // ### `_parseLiteral` parses a literal into an unescaped value
  _parseLiteral(input) {
    // Ensure we have enough lookahead to identify triple-quoted strings
    if (input.length >= 3) {
      // Identify the opening quote(s)
      const opening = input.match(/^(?:"""|"|'''|'|)/)[0];
      const openingLength = opening.length;

      // Find the next candidate closing quotes
      let closingPos = Math.max(this._literalClosingPos, openingLength);
      while ((closingPos = input.indexOf(opening, closingPos)) > 0) {
        // Count backslashes right before the closing quotes
        let backslashCount = 0;
        while (input[closingPos - backslashCount - 1] === '\\')
          backslashCount++;

        // An even number of backslashes (in particular 0)
        // means these are actual, non-escaped closing quotes
        if (backslashCount % 2 === 0) {
          // Extract and unescape the value
          const raw = input.substring(openingLength, closingPos);
          const lines = raw.split(/\r\n|\r|\n/).length - 1;
          const matchLength = closingPos + openingLength;
          // Only triple-quoted strings can be multi-line
          if (openingLength === 1 && lines !== 0 ||
              openingLength === 3 && this._lineMode)
            break;
          this._line += lines;
          return { value: this._unescape(raw), matchLength };
        }
        closingPos++;
      }
      this._literalClosingPos = input.length - openingLength + 1;
    }
    return { value: '', matchLength: 0 };
  }

  // ### `_syntaxError` creates a syntax error for the given issue
  _syntaxError(issue) {
    this._input = null;
    var err = new Error('Unexpected "' + issue + '" on line ' + this._line + '.');
    err.context = {
      token: undefined,
      line: this._line,
      previousToken: this.previousToken,
    };
    return err;
  }

  // ## Public methods

  // ### `tokenize` starts the transformation of an N3 document into an array of tokens.
  // The input can be a string or a stream.
  tokenize(input, callback) {
    var self = this;
    this._line = 1;

    // If the input is a string, continuously emit tokens through the callback until the end
    if (typeof input === 'string') {
      this._input = input;
      // If a callback was passed, asynchronously call it
      if (typeof callback === 'function')
        queue_microtask__WEBPACK_IMPORTED_MODULE_1___default()(() => self._tokenizeToEnd(callback, true));
      // If no callback was passed, tokenize synchronously and return
      else {
        var tokens = [], error;
        this._tokenizeToEnd(function (e, t) { e ? (error = e) : tokens.push(t); }, true);
        if (error) throw error;
        return tokens;
      }
    }
    // Otherwise, the input must be a stream
    else {
      this._input = '';
      this._pendingBuffer = null;
      if (typeof input.setEncoding === 'function')
        input.setEncoding('utf8');
      // Adds the data chunk to the buffer and parses as far as possible
      input.on('data', function (data) {
        if (self._input !== null && data.length !== 0) {
          // Prepend any previous pending writes
          if (self._pendingBuffer) {
            data = Buffer.concat([self._pendingBuffer, data]);
            self._pendingBuffer = null;
          }
          // Hold if the buffer ends in an incomplete unicode sequence
          if (data[data.length - 1] & 0x80) {
            self._pendingBuffer = data;
          }
          // Otherwise, tokenize as far as possible
          else {
            self._input += data;
            self._tokenizeToEnd(callback, false);
          }
        }
      });
      // Parses until the end
      input.on('end', function () {
        if (self._input !== null)
          self._tokenizeToEnd(callback, true);
      });
      input.on('error', callback);
    }
  }
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(9).Buffer))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = { sep: '/' }
try {
  path = __webpack_require__(2)
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = __webpack_require__(58)

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
/* 15 */
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
/* 16 */
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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).


var ERR_STREAM_PREMATURE_CLOSE = __webpack_require__(4).codes.ERR_STREAM_PREMATURE_CLOSE;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    callback.apply(this, args);
  };
}

function noop() {}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;

  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };

  var writableEnded = stream._writableState && stream._writableState.finished;

  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };

  var readableEnded = stream._readableState && stream._readableState.endEmitted;

  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };

  var onerror = function onerror(err) {
    callback.call(stream, err);
  };

  var onclose = function onclose() {
    var err;

    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }

    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };

  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };

  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}

module.exports = eos;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * Status: Early implementation
 *
 * TODO:
 *   testing.
 */

var ShapeMapSymbols = (function () {
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
/* 19 */
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
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

// **ShExUtil** provides ShEx utility functions

var ShExUtil = (function () {
var RdfTerm = __webpack_require__(7);
// var util = require('util');
const Hierarchy = __webpack_require__(45)

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
var UNBOUNDED = -1;

function extend (base) {
  if (!base) base = {};
  for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (var name in arg)
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

var ShExUtil = {

  SX: SX,
  RDF: RDF,
  version: function () {
    return "0.5.0";
  },

  Visitor: function () {
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
        _ShExUtil._expect(schema, "type", "Schema");
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
        _ShExUtil._expect(semAct, "type", "SemAct");

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
        _ShExUtil._expect(shape, "type", "Shape");

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
        _ShExUtil._expect(shape, "type", "NodeConstraint");

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
        return extend("id" in expr ? { id: expr.id } : {}, { type: "ShapeExternal" });
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
        // _ShExUtil._expect(t, "type", "IriStemRange");
              if (!("type" in t))
                _Visitor.runtimeError(Error("expected "+JSON.stringify(t)+" to have a 'type' attribute."));
        var stemRangeTypes = ["IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
              if (stemRangeTypes.indexOf(t.type) === -1)
                _Visitor.runtimeError(Error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'."));
        var stem;
        if (isTerm(t)) {
          _ShExUtil._expect(t.stem, "type", "Wildcard");
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
          // _ShExUtil._expect(c, "type", "IriStem");
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
  },

  // tests
  // console.warn("HERE:", ShExJtoAS({"type":"Schema","shapes":[{"id":"http://all.example/S1","type":"Shape","expression":
  //  { "id":"http://all.example/S1e", "type":"EachOf","expressions":[ ] },
  // // { "id":"http://all.example/S1e","type":"TripleConstraint","predicate":"http://all.example/p1"},
  // "extra":["http://all.example/p3","http://all.example/p1","http://all.example/p2"]
  // }]}).shapes['http://all.example/S1']);

  ShExJtoAS: function (schema) {
    var _ShExUtil = this;
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
    var v = ShExUtil.Visitor();
    var knownExpressions = {};
    var oldVisitShapeExpr = v.visitShapeExpr,
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
      var ret = oldVisitExpression.call(this, expr);
      // Everything from RDF has an ID, usually a BNode.
      knownExpressions[expr.id] = { refCount: 1, expr: ret };
      return ret;
    }

    v.cleanIds = function () {
      for (var k in knownExpressions) {
        var known = knownExpressions[k];
        if (known.refCount === 1 && RdfTerm.isBlank(known.expr.id))
          delete known.expr.id;
      };
    }

    return v;
  },


  // tests
  // var shexr = ShExUtil.ShExRtoShExJ({ "type": "Schema", "shapes": [
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
    var knownShapeExprs = [];
    if ("shapes" in schema)
      knownShapeExprs = knownShapeExprs.concat(schema.shapes.map(sh => { return sh.id; }));

    // normalize references to those shapeExprs
    var v = this.ShExRVisitor(knownShapeExprs);
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
    var _ShExUtil = this;
    var ret = [];
    for (var i in obj) {
      var o = obj[i];
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
      RdfTerm.isIRI(node) ? "<" + node + ">" :
      RdfTerm.isBlank(node) ? node :
      "???";
    }
    return this.valGrep(res, "TestedTriple", function (t) {
      return ["subject", "predicate", "object"].map(k => {
        return termToLex(t[k]);
      }).join(" ")+" .";
    });
  },

  valToN3js: function (res) {
    return this.valGrep(res, "TestedTriple", function (t) {
      var ret = JSON.parse(JSON.stringify(t));
      if (typeof t.object === "object")
        ret.object = ("\"" + t.object.value + "\"" + (
          "type" in t.object ? "^^" + t.object.type :
            "language" in t.object ? "@" + t.object.language :
            ""
        ));
      return ret;
    });
  },

  n3jsToTurtle: function (n3js) {
    function termToLex (node) {
      if (RdfTerm.isIRI(node))
        return "<" + node + ">";
      if (RdfTerm.isBlank(node))
        return node;
      var t = RdfTerm.getLiteralType(node);
      if (t && t !== "http://www.w3.org/2001/XMLSchema#string")
        return "\"" + RdfTerm.getLiteralValue(node) + "\"" +
        "^^<" + t + ">";
      return node;
    }
    return n3js.map(function (t) {
      return ["subject", "predicate", "object"].map(k => {
        return termToLex(t[k]);
      }).join(" ")+" .";
    });
  },

  /** create indexes for schema
   */
  index: function (schema) {
    let index = {
      shapeExprs: {},
      tripleExprs: {}
    };
    let v = ShExUtil.Visitor();

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
  },

  /* canonicalize: move all tripleExpression references to their first expression.
   *
   */
  canonicalize: function (schema, trimIRI) {
    var ret = JSON.parse(JSON.stringify(schema));
    ret["@context"] = ret["@context"] || "http://www.w3.org/ns/shex.jsonld";
    delete ret._prefixes;
    delete ret._base;
    let index = ret._index || this.index(schema);
    delete ret._index;
    let sourceMap = ret._sourceMap;
    delete ret._sourceMap;
    // Don't delete ret.productions as it's part of the AS.
    var v = ShExUtil.Visitor();
    var knownExpressions = [];
    var oldVisitInclusion = v.visitInclusion, oldVisitExpression = v.visitExpression;
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
        function expect (l, r) { var ls = JSON.stringify(l), rs = JSON.stringify(r); if (ls !== rs) throw Error(ls+" !== "+rs); }
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
        var r = this;
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
          for (var i = a.length-1; i > -1; --i)
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
    var _ShExUtil = this;
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
    var _ShExUtil = this;

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
    var partition = {};
    for (var k in schema)
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
    var v = this.Visitor();
    return v.visitSchema(schema);
  },

  // @@ put predicateUsage here

  emptySchema: function () {
    return {
      type: "Schema"
    };
  },
  merge: function (left, right, overwrite, inPlace) {
    var ret = inPlace ? left : this.emptySchema();

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
    // !! duplicate of Validation-test.js:84: var referenceResult = parseJSONFile(resultsFile...)
    function mapFunction (k, obj) {
      // resolve relative URLs in results file
      if (["shape", "reference", "node", "subject", "predicate", "object"].indexOf(k) !== -1 &&
          RdfTerm.isIRI(obj[k])) {
        obj[k] = RdfTerm.resolveRelativeIRI(base, obj[k]);
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
      if (solns.type === "NodeTest" || solns.type === "NodeConstraintTest") {
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
          var s2 = s;
          if (typeof s2.object === "object")
            s2.object = "\"" + s2.object.value.replace(/"/g, "\\\"") + "\""
            + (s2.object.language ? ("@" + s2.object.language) : 
               s2.object.type ? ("^^" + s2.object.type) :
               "");
          db.addQuad(RdfTerm.externalTriple(s2, dataFactory))
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
    var _ShExUtil = this;
    var visitor = this.Visitor();
    var currentLabel = currentExtra = null;
    var currentNegated = false;
    var dependsOn = { };
    var inTE = false;
    var oldVisitShape = visitor.visitShape;
    var negativeDeps = Hierarchy.create();
    var positiveDeps = Hierarchy.create();
    let index = schema.index || this.index(schema);

    visitor.visitShape = function (shape, label) {
      var lastExtra = currentExtra;
      currentExtra = shape.extra;
      var ret = oldVisitShape.call(visitor, shape, label);
      currentExtra = lastExtra;
      return ret;
    }

    var oldVisitShapeNot = visitor.visitShapeNot;
    visitor.visitShapeNot = function (shapeNot, label) {
      var lastNegated = currentNegated;
      currentNegated ^= true;
      var ret = oldVisitShapeNot.call(visitor, shapeNot, label);
      currentNegated = lastNegated;
      return ret;
    }

    var oldVisitTripleConstraint = visitor.visitTripleConstraint;
    visitor.visitTripleConstraint = function (expr) {
      var lastNegated = currentNegated;
      if (currentExtra && currentExtra.indexOf(expr.predicate) !== -1)
        currentNegated ^= true;
      inTE = true;
      var ret = oldVisitTripleConstraint.call(visitor, expr);
      inTE = false;
      currentNegated = lastNegated;
      return ret;
    };

    var oldVisitShapeRef = visitor.visitShapeRef;
    visitor.visitShapeRef = function (shapeRef) {
      if (!(shapeRef in index.shapeExprs))
        throw firstError(Error("Structural error: reference to " + JSON.stringify(shapeRef) + " not found in schema shape expressions:\n" + dumpKeys(index.shapeExprs) + "."), shapeRef);
      if (!inTE && shapeRef === currentLabel)
        throw firstError(Error("Structural error: circular reference to " + currentLabel + "."), shapeRef);
      (currentNegated ? negativeDeps : positiveDeps).add(currentLabel, shapeRef)
      return oldVisitShapeRef.call(visitor, shapeRef);
    }

    var oldVisitInclusion = visitor.visitInclusion;
    visitor.visitInclusion = function (inclusion) {
      var refd;
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
    // var deps = this.getDependencies(schema);
    return schema;
  },

  walkVal: function (val, cb) {
    var _ShExUtil = this;
    if (val.type === "NodeTest") {
      return null;
    } else if (val.type === "ShapeTest") {
      return "solution" in val ? _ShExUtil.walkVal(val.solution, cb) : null;
    } else if (val.type === "ShapeOrResults") {
      return _ShExUtil.walkVal(val.solution || val.solutions, cb);
    } else if (val.type === "ShapeAndResults") {
      return val.solutions.reduce((ret, exp) => {
        var n = _ShExUtil.walkVal(exp, cb);
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
          var n = _ShExUtil.walkVal(exp, cb);
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
        var ret = {};
        var vals = [];
        ret[val.predicate] = vals;
        val.solutions.forEach(sln => {
          var toAdd = [];
          if (chaseList(sln.referenced, toAdd)) {
            vals = vals.concat(toAdd);
          } else {
            var newElt = cb(sln);
            if ("referenced" in sln) {
              var t = _ShExUtil.walkVal(sln.referenced, cb);
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
              var expressions = li.solution.solutions[0].expressions;
              var ent = expressions[0];
              var rest = expressions[1].solutions[0];
              var member = ent.solutions[0];
              var newElt = cb(member);
              if ("referenced" in member) {
                var t = _ShExUtil.walkVal(member.referenced, cb);
                if (t)
                  newElt.nested = t;
              }
              vals.push(newElt);
              return rest.object === RDF.nil ?
                true :
                chaseList(rest.referenced);
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
    var map = this.walkVal (val, function (sln) {
      return { extensions: sln.extensions };
    });
    function extensions (obj) {
      var list = [];
      var crushed = {};
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
          crushed[k] = elt[k];
        }
        return elt;
      }
      for (var k in obj) {
        if (k === "extensions") {
          if (obj[k])
            list.push(crush(obj[k][lookfor]));
        } else if (k === "nested") {
          var nested = extensions(obj[k]);
          if (nested.constructor === Array)
            nested.forEach(crush);
          else
            crush(nested);
          list = list.concat(nested);
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
    var v = values;
    var t = values[RDF.type][0].ldterm;
    if (t === SX.Schema) {
      /* Schema { "@context":"http://www.w3.org/ns/shex.jsonld"
       *           startActs:[SemAct+]? start:(shapeExpr|labeledShapeExpr)?
       *           shapes:[labeledShapeExpr+]? }
       */
      var ret = {
        "@context": "http://www.w3.org/ns/shex.jsonld",
        type: "Schema"
      }
      if (SX.startActs in v)
        ret.startActs = v[SX.startActs].map(e => {
          var ret = {
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
      var shapes = values[SX.shapes];
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
      var t = v[RDF.type][0].ldterm.substr(SX._namespace.length);
      var elt = elts[t];
      if (!elt)
        return Missed;
      if (elt.nary) {
        var ret = {
          type: t,
        };
        ret[elt.prop] = v[SX[elt.prop]].map(e => {
          return valueOf(e);
        });
        return ret;
      } else {
        var ret = {
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
      var elts = { "ShapeAnd"     : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeOr"      : { nary: true , expr: true , prop: "shapeExprs" },
                   "ShapeNot"     : { nary: false, expr: true , prop: "shapeExpr"  },
                   "ShapeRef"     : { nary: false, expr: false, prop: "reference"  },
                   "ShapeExternal": { nary: false, expr: false, prop: null         } };
      var ret = findType(v, elts, shapeExpr);
      if (ret !== Missed)
        return ret;

      var t = v[RDF.type][0].ldterm;
      if (t === SX.Shape) {
        var ret = { type: "Shape" };
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
            var ret = {
              type: "SemAct",
              name: e.nested[SX.name][0].ldterm
            };
            if (SX.code in e.nested)
              ret.code = e.nested[SX.code][0].ldterm.value;
            return ret;
          });
        return ret;
      } else if (t === SX.NodeConstraint) {
        var ret = { type: "NodeConstraint" };
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
        var t = v.nested[RDF.type][0].ldterm;
        if ([SX.IriStem, SX.LiteralStem, SX.LanguageStem].indexOf(t) !== -1) {
          var ldterm = v.nested[SX.stem][0].ldterm.value;
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
          var st = v.nested[SX.stem][0];
          var stem = st;
          if (typeof st === "object") {
            if (typeof st.ldterm === "object") {
              stem = st.ldterm;
            } else if (st.ldterm.startsWith("_:")) {
              stem = { type: "Wildcard" };
            }
          }
          var ret = {
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
      var elts = { "EachOf"   : { nary: true , expr: true , prop: "expressions" },
                   "OneOf"    : { nary: true , expr: true , prop: "expressions" },
                   "Inclusion": { nary: false, expr: false, prop: "include"     } };
      var ret = findType(v, elts, tripleExpr);
      if (ret !== Missed) {
        minMaxAnnotSemActs(v, ret);
        return ret;
      }

      var t = v[RDF.type][0].ldterm;
      if (t === SX.TripleConstraint) {
        var ret = {
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
          var ret = {
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
    var _ShExUtil = this;
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
          var toAdd = {};
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
              var expressions = li.solution.solutions[0].expressions;
              var ent = expressions[0];
              var rest = expressions[1].solutions[0];
              var member = ent.solutions[0];
              var newElt = { ldterm: member.object };
              if ("referenced" in member) {
                var t = _ShExUtil.valToSimple(member.referenced);
                if (t)
                  newElt.nested = t;
              }
              toAdd = _join(toAdd, newElt);
              return rest.object === RDF.nil ?
                true :
                chaseList(rest.referenced);
            }
          }
        }, []);
      } else {
        return [];
      }
    } else if (["TripleConstraintSolutions"].indexOf(val.type) !== -1) {
      return {  };
    } else if (val.type === "NodeTest") {
      var thisNode = {  };
      thisNode[n3ify(val.node)] = [val.shape];
      return thisNode;
    } else if (val.type === "ShapeTest") {
      var thisNode = {  };
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
        node: RdfTerm.resolveRelativeIRI(base, elt.node),
        shape: RdfTerm.resolveRelativeIRI(base, elt.shape)
      });
    });
  },

  errsToSimple: function (val, node, shape) {
    var _ShExUtil = this;
    if (val.type === "FailureList") {
      return val.errors.reduce((ret, e) => {
        return ret.concat(_ShExUtil.errsToSimple(e));
      }, []);
    } else if (val.type === "Failure") {
      return ["validating " + val.node + " as " + val.shape + ":"].concat(errorList(val.errors).reduce((ret, e) => {
        var nested = _ShExUtil.errsToSimple(e).map(s => "  " + s);
        return ret.length > 0 ? ret.concat(["  OR"]).concat(nested) : nested.map(s => "  " + s);
      }, []));
    } else if (val.type === "TypeMismatch") {
      var nested = val.errors.constructor === Array ?
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
      var w = __webpack_require__(21)();
      w._write(w._writeNodeConstraint(val.shapeExpr).join(""));
      var txt;
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
        var nested = _ShExUtil.errsToSimple(e).map(s => "  " + s);
        return ret.length ? ret.concat(["AND"]).concat(nested) : nested;
      }, []);
    } else if (val.type === "SemActFailure") {
      var nested = val.errors.constructor === Array ?
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
        var attrs = Object.keys(e);
        return acc.concat(
          (attrs.length === 1 && attrs[0] === "errors")
            ? errorList(e.errors)
            : e);
      }, []);
    }
  },

  resolveRelativeIRI: RdfTerm.resolveRelativeIRI,

  resolvePrefixedIRI: function (prefixedIri, prefixes) {
    var colon = prefixedIri.indexOf(":");
    if (colon === -1)
      return null;
    var prefix = prefixes[prefixedIri.substr(0, colon)];
    return prefix === undefined ? null : prefix + prefixedIri.substr(colon+1);
  },

  parsePassedNode: function (passedValue, meta, deflt, known, reportUnknown) {
    if (passedValue === undefined || passedValue.length === 0)
      return known && known(meta.base) ? meta.base : deflt ? deflt() : this.NotSupplied;
    if (passedValue[0] === "_" && passedValue[1] === ":")
      return passedValue;
    if (passedValue[0] === "\"") {
      var m = passedValue.match(/^"((?:[^"\\]|\\")*)"(?:@(.+)|\^\^(?:<(.*)>|([^:]*):(.*)))?$/);
      if (!m)
        throw Error("malformed literal: " + passedValue);
      var lex = m[1], lang = m[2], rel = m[3], pre = m[4], local = m[5];
      // Turn the literal into an N3.js atom.
      var quoted = "\""+lex+"\"";
      if (lang !== undefined)
        return quoted + "@" + lang;
      if (pre !== undefined) {
        if (!(pre in meta.prefixes))
          throw Error("error parsing node "+passedValue+" no prefix for \"" + pre + "\"");
        return quoted + "^^" + meta.prefixes[pre] + local;
      }
      if (rel !== undefined)
        return quoted + "^^" + RdfTerm.resolveRelativeIRI(meta.base, rel);
      return quoted;
    }
    if (!meta)
      return known(passedValue) ? passedValue : this.UnknownIRI;
    var relIRI = passedValue[0] === "<" && passedValue[passedValue.length-1] === ">";
    if (relIRI)
      passedValue = passedValue.substr(1, passedValue.length-2);
    var t = RdfTerm.resolveRelativeIRI(meta.base || "", passedValue); // fall back to base-less mode
    if (known(t))
      return t;
    if (!relIRI) {
      var t2 = this.resolvePrefixedIRI(passedValue, meta.prefixes);
      if (t2 !== null && known(t2))
        return t2;
    }
    return reportUnknown ? reportUnknown(t) : this.UnknownIRI;
  },

  executeQueryPromise: function (query, endpoint) {
    var rows;

    var queryURL = endpoint + "?query=" + encodeURIComponent(query);
    return fetch(queryURL, {
      headers: {
        'Accept': 'application/sparql-results+json'
      }}).then(resp => resp.json()).then(t => {
        var selects = t.head.vars;
        return t.results.bindings.map(row => {
          return selects.map(sel => {
            var elt = row[sel];
            switch (elt.type) {
            case "uri": return elt.value;
            case "bnode": return "_:" + elt.value;
            case "literal":
              var datatype = elt.datatype;
              var lang = elt["xml:lang"];
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
    var rows, t, j;
    var queryURL = endpoint + "?query=" + encodeURIComponent(query);
    if (__webpack_require__(22)) {
      var request = __webpack_require__(22);
      var res = request('GET', queryURL, {
        headers: {
          'Accept': 'application/sparql-results+json'
        },
      });
      t = res.getBody().toString('utf-8');
    } else {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", queryURL, false);
    xhr.setRequestHeader('Accept', 'application/sparql-results+json');
    xhr.send();
    // var selectsBlock = query.match(/SELECT\s*(.*?)\s*{/)[1];
    // var selects = selectsBlock.match(/\?[^\s?]+/g);
    t = xhr.responseText;
    }
    var j = JSON.parse(t);
    var selects = j.head.vars;
    return j.results.bindings.map(row => {
      return selects.map(sel => {
        var elt = row[sel];
        switch (elt.type) {
        case "uri": return elt.value;
        case "bnode": return "_:" + elt.value;
        case "literal":
          var datatype = elt.datatype;
          var lang = elt["xml:lang"];
          return "\"" + elt.value + "\"" + (
            lang ? "@" + lang :
              datatype ? "^^" + datatype :
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
                var text = elt.text();
                switch (elt.prop("tagName")) {
                case "uri": return text;
                case "bnode": return "_:" + text;
                case "literal":
                  var datatype = elt.attr("datatype");
                  var lang = elt.attr("xml:lang");
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

  makeN3DB: function (db, queryTracker) {

    function getSubjects () { return db.getSubjects().map(RdfTerm.internalTerm); }
    function getPredicates () { return db.getPredicates().map(RdfTerm.internalTerm); }
    function getObjects () { return db.getObjects().map(RdfTerm.internalTerm); }
    function getQuads () { return db.getQuads.apply(db, arguments).map(RdfTerm.internalTriple); }

    function getNeighborhood (point, shapeLabel/*, shape */) {
      // I'm guessing a local DB doesn't benefit from shape optimization.
      var startTime;
      if (queryTracker) {
        startTime = new Date();
        queryTracker.start(false, point, shapeLabel);
      }
      var outgoing = db.getQuads(point, null, null, null).map(RdfTerm.internalTriple);
      if (queryTracker) {
        var time = new Date();
        queryTracker.end(outgoing, time - startTime);
        startTime = time;
      }
      if (queryTracker) {
        queryTracker.start(true, point, shapeLabel);
      }
      var incoming = db.getQuads(null, null, point, null).map(RdfTerm.internalTriple);
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
      //   var quads = db.getQuads(s, p, o, graph)
      //   if (queryTracker)
      //     queryTracker.end(quads, new Date() - startTime);
      //   return quads;
      // }
    }
  },
  /** emulate N3Store().getQuads() with additional parm.
   */
  makeQueryDB: function (endpoint, queryTracker) {
    var _ShExUtil = this;
    // Need to inspect the schema to calculate the relevant neighborhood.
    var schemaIndex = null

    function getQuads(s, p, o, g) {
      return mapQueryToTriples("SELECT " + [
        (s?"":"?s"), (p?"":"?p"), (o?"":"?o"),
        "{",
        (s?s:"?s"), (p?p:"?s"), (o?o:"?s"),
        "}"].join(" "), s, o)
    }

    function mapQueryToTriples (query, s, o) {
      var rows = _ShExUtil.executeQuery(query, endpoint);
      var triples = rows.map(row =>  {
        return s ? {
          subject: s,
          predicate: row[0],
          object: row[1]
        } : {
          subject: row[0],
          predicate: row[1],
          object: o
        };
      });
      return triples;
    }

    function getTripleConstraints (tripleExpr) {
      var visitor = _ShExUtil.Visitor();
      var ret = {
        out: [],
        inc: []
      };
      visitor.visitTripleConstraint = function (expr) {
        ret[expr.inverse ? "inc" : "out"].push(expr);
        return expr;
      };

      visitor.visitInclusion = function (inclusion) {
        return visitor.visitExpression(schemaIndex.tripleExprs[inclusion]);
      }

      if (tripleExpr)
        visitor.visitExpression(tripleExpr);
      return ret;
    }

    function getNeighborhood (point, shapeLabel, shape) {
      // I'm guessing a local DB doesn't benefit from shape optimization.
      var startTime;
      var tcs = getTripleConstraints(shape.expression);
      var pz = tcs.out.map(t => t.predicate);
      pz = pz.filter((p, idx) => pz.lastIndexOf(p) === idx);
      if (queryTracker) {
        startTime = new Date();
        queryTracker.start(false, point, shapeLabel);
      }
      var outgoing = (tcs.out.length > 0 || shape.closed)
          ? mapQueryToTriples(
            shape.closed
              ? `SELECT ?p ?o { <${point}> ?p ?o }`
              : "SELECT ?p ?o {\n" +
              pz.map(
                p => `  {<${point}> <${p}> ?o BIND(<${p}> AS ?p)}`
              ).join(" UNION\n") +
              "\n}",
            point, null
          )
          : [];
      if (queryTracker) {
        var time = new Date();
        queryTracker.end(outgoing, time - startTime);
        startTime = time;
      }
      if (queryTracker) {
        queryTracker.start(true, point, shapeLabel);
      }
      var incoming = tcs.inc.length > 0
          ? mapQueryToTriples(`SELECT ?s ?p { ?s ?p <${point}> }`, null, point)
          : []
      if (queryTracker) {
        queryTracker.end(incoming, new Date() - startTime);
      }
      return  {
        outgoing: outgoing,
        incoming: incoming
      };
    }

    return {
      getNeighborhood: getNeighborhood,
      getQuads: getQuads,
      getSubjects: function () { return ["!Query DB can't index subjects"] },
      getPredicates: function () { return ["!Query DB can't index predicates"] },
      getObjects: function () { return ["!Query DB can't index objects"] },
      get size() { return undefined; },
      setSchema: function (schema) { schemaIndex = schema._index || _ShExUtil.index(schema) },
    };
  },

  NotSupplied: "-- not supplied --", UnknownIRI: "-- not found --",

  // Expect property p with value v in object o
  _expect: function (o, p, v) {
    if (!(p in o))
      this._error("expected "+JSON.stringify(o)+" to have a ."+p);
    if (arguments.length > 2 && o[p] !== v)
      this._error("expected "+o[o]+" to equal ."+v);
  },

  _error: function (str) {
    throw new Error(str);
  },

  /**
   * unescape numerics and allowed single-character escapes.
   * throws: if there are any unallowed sequences
   */
  unescapeText: function (string, replacements) {
    var regex = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g;
    try {
      string = string.replace(regex, function (sequence, unicode4, unicode8, escapedChar) {
        var charCode;
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
          var replacement = replacements[escapedChar];
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
  var ret = "\"" + ldterm.value + "\"";
  if ("language" in ldterm)
    return ret + "@" + ldterm.language;
  if ("type" in ldterm)
    return ret + "^^" + ldterm.type;
  return ret;
}

// Add the ShExUtil functions to the given object or its prototype
function AddShExUtil(parent, toPrototype) {
  for (var name in ShExUtil)
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
  module.exports = ShExUtil; // node environment


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

// **ShExWriter** writes ShEx documents.

var ShExWriter = (function () {
var util = __webpack_require__(12);
var UNBOUNDED = -1;

// Matches a literal as represented in memory by the ShEx library
var ShExLiteralMatcher = /^"([^]*)"(?:\^\^(.+)|@([\-a-z]+))?$/i;

// rdf:type predicate (for 'a' abbreviation)
var RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    RDF_TYPE   = RDF_PREFIX + 'type';

// Characters in literals that require escaping
var ESCAPE_1 = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    ESCAPE_g = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    ESCAPE_replacements = { '\\': '\\\\', '"': '\\"', '/': '\\/', '\t': '\\t',
                            '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f' };

var nodeKinds = {
  'iri': "IRI",
  'bnode': "BNODE",
  'literal': "LITERAL",
  'nonliteral': "NONLITERAL"
};
var nonLitNodeKinds = {
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
    var output = '';
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
    var _ShExWriter = this;
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
    var _ShExWriter = this;
    var pieces = [];
    if (typeof shapeExpr === "string") // ShapeRef
      pieces.push("@", _ShExWriter._encodeShapeName(shapeExpr));
    // !!! []s for precedence!
    else if (shapeExpr.type === "ShapeExternal")
      pieces.push("EXTERNAL");
    else if (shapeExpr.type === "ShapeAnd") {
      if (parentPrec >= 3)
        pieces.push("(");
      var lastAndElided = false;
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
        pieces = pieces.concat(_ShExWriter._writeShapeExpr(expr, done, false, 3));
      });
      if (parentPrec >= 3)
        pieces.push(")");
    } else if (shapeExpr.type === "ShapeOr") {
      if (parentPrec >= 2)
        pieces.push("(");
      shapeExpr.shapeExprs.forEach(function (expr, ord) {
        if (ord > 0)
          pieces.push(" OR ");
        pieces = pieces.concat(_ShExWriter._writeShapeExpr(expr, done, forceBraces, 2));
      });
      if (parentPrec >= 2)
        pieces.push(")");
    } else if (shapeExpr.type === "ShapeNot") {
      if (parentPrec >= 4)
        pieces.push("(");
      pieces.push("NOT ");
      pieces = pieces.concat(_ShExWriter._writeShapeExpr(shapeExpr.shapeExpr, done, forceBraces, 4));
      if (parentPrec >= 4)
        pieces.push(")");
    } else if (shapeExpr.type === "Shape") {
      pieces = pieces.concat(_ShExWriter._writeShape(shapeExpr, done, forceBraces));
    } else if (shapeExpr.type === "NodeConstraint") {
      pieces = pieces.concat(_ShExWriter._writeNodeConstraint(shapeExpr, done, forceBraces));
    } else
      throw Error("expected Shape{,And,Or,Ref} or NodeConstraint in " + util.inspect(shapeExpr));
    return pieces;
  },

  // ### `_writeShape` writes the shape to the output stream
  _writeShape: function (shape, done, forceBraces) {
    var _ShExWriter = this;
    try {
      var pieces = []; // guessing push/join is faster than concat
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
      var empties = ["values", "length", "minlength", "maxlength", "pattern", "flags"];
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
          var needsParens = precedence < parentPrecedence || forceParens;
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
            pieces = pieces.concat(_ShExWriter._writeShapeExpr(expr.valueExpr, done, true, 0));
          else
            pieces.push(". ");

          _writeCardinality(expr.min, expr.max);
          _ShExWriter._annotations(pieces, expr.annotations, indent);
          _writeExpressionActions(expr.semActs);
        }

        else if (expr.type === "OneOf") {
          var needsParens = "id" in expr || "min" in expr || "max" in expr || "annotations" in expr || "semActs" in expr;
          _exprGroup(expr.expressions, "\n"+indent+"| ", 1, needsParens || _ShExWriter.forceParens);
          _writeCardinality(expr.min, expr.max); // t: open1dotclosecardOpt
          _ShExWriter._annotations(pieces, expr.annotations, indent);
          _writeExpressionActions(expr.semActs);
        }

        else if (expr.type === "EachOf") {
          var needsParens = "id" in expr || "min" in expr || "max" in expr || "annotations" in expr || "semActs" in expr;
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
    var _ShExWriter = this;
    try {
      _ShExWriter._expect(v, "type", "NodeConstraint");

      var pieces = [];
      if (v.nodeKind in nodeKinds)       pieces.push(nodeKinds[v.nodeKind], " ");
      else if (v.nodeKind !== undefined) _ShExWriter._error("unexpected nodeKind: " + v.nodeKind); // !!!!

      this._fillNodeConstraint(pieces, v, done);
      this._annotations(pieces, v.annotations, "  ");
      return pieces;
    }
    catch (error) { done && done(error); }

  },

  _annotations: function (pieces, annotations, indent) {
    var _ShExWriter = this;
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
    var _ShExWriter = this;
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
          var stemRangeTypes = ["Language", "IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
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
                    var stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
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
      var pattern = v.pattern.
          replace(/\//g, "\\/");
      // if (ESCAPE_1.test(pattern))
      //   pattern = pattern.replace(ESCAPE_g, characterReplacer);
      var flags = 'flags' in v ? v.flags : "";
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
    var prefixMatch = this._prefixRegex.exec(iri);
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
    for (var i = 0; i < shapes.length; i++)
      this.addShape(shapes[i]);
  },

  // ### `addPrefix` adds the prefix to the output stream
  addPrefix: function (prefix, iri, done) {
    var prefixes = {};
    prefixes[prefix] = iri;
    this.addPrefixes(prefixes, done);
  },

  // ### `addPrefixes` adds the prefixes to the output stream
  addPrefixes: function (prefixes, done) {
    // Add all useful prefixes
    var prefixIRIs = this._prefixIRIs, hasPrefixes = false;
    for (var prefix in prefixes) {
      // Verify whether the prefix can be used and does not exist yet
      var iri = prefixes[prefix];
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
      var IRIlist = '', prefixList = '';
      for (var prefixIRI in prefixIRIs) {
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
    var singleDone = done && function (error, result) { singleDone = null, done(error, result); };
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
  var result = ESCAPE_replacements[character];
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
  var e = new Error(str);
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
  module.exports = ShExWriter; // node environment


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var handle_qs_js_1 = __webpack_require__(48);
var GenericResponse = __webpack_require__(52);
var fd = FormData;
exports.FormData = fd;
function doRequest(method, url, options) {
    var xhr = new XMLHttpRequest();
    // check types of arguments
    if (typeof method !== 'string') {
        throw new TypeError('The method must be a string.');
    }
    if (url && typeof url === 'object') {
        url = url.href;
    }
    if (typeof url !== 'string') {
        throw new TypeError('The URL/path must be a string.');
    }
    if (options === null || options === undefined) {
        options = {};
    }
    if (typeof options !== 'object') {
        throw new TypeError('Options must be an object (or null).');
    }
    method = method.toUpperCase();
    options.headers = options.headers || {};
    // handle cross domain
    var match;
    var crossDomain = !!((match = /^([\w-]+:)?\/\/([^\/]+)/.exec(url)) && match[2] != location.host);
    if (!crossDomain)
        options.headers['X-Requested-With'] = 'XMLHttpRequest';
    // handle query string
    if (options.qs) {
        url = handle_qs_js_1["default"](url, options.qs);
    }
    // handle json body
    if (options.json) {
        options.body = JSON.stringify(options.json);
        options.headers['content-type'] = 'application/json';
    }
    if (options.form) {
        options.body = options.form;
    }
    // method, url, async
    xhr.open(method, url, false);
    for (var name in options.headers) {
        xhr.setRequestHeader(name.toLowerCase(), '' + options.headers[name]);
    }
    // avoid sending empty string (#319)
    xhr.send(options.body ? options.body : null);
    var headers = {};
    xhr
        .getAllResponseHeaders()
        .split('\r\n')
        .forEach(function (header) {
        var h = header.split(':');
        if (h.length > 1) {
            headers[h[0].toLowerCase()] = h
                .slice(1)
                .join(':')
                .trim();
        }
    });
    return new GenericResponse(xhr.status, headers, xhr.responseText, url);
}
exports["default"] = doRequest;
module.exports = doRequest;
module.exports["default"] = doRequest;
module.exports.FormData = fd;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var has = Object.prototype.hasOwnProperty;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    var obj;

    while (queue.length) {
        var item = queue.pop();
        obj = item.obj[item.prop];

        if (Array.isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }

    return obj;
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        } else if (typeof target === 'object') {
            if (options.plainObjects || options.allowPrototypes || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (Array.isArray(target) && !Array.isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (Array.isArray(target) && Array.isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                if (target[i] && typeof target[i] === 'object') {
                    target[i] = merge(target[i], item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

var encode = function encode(str) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = typeof str === 'string' ? str : String(str);

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D // -
            || c === 0x2E // .
            || c === 0x5F // _
            || c === 0x7E // ~
            || (c >= 0x30 && c <= 0x39) // 0-9
            || (c >= 0x41 && c <= 0x5A) // a-z
            || (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)]
            + hexTable[0x80 | ((c >> 12) & 0x3F)]
            + hexTable[0x80 | ((c >> 6) & 0x3F)]
            + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    return compactQueue(queue);
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (obj === null || typeof obj === 'undefined') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    merge: merge
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var replace = String.prototype.replace;
var percentTwenties = /%20/g;

module.exports = {
    'default': 'RFC3986',
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return value;
        }
    },
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var ThreadedValNErr = (function () {
var RdfTerm = __webpack_require__(7);
var UNBOUNDED = -1;

function vpEngine (schema, shape, index) {
    var outerExpression = shape.expression;
    return {
      match:match
    };

    function match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, recurse, direct, semActHandler, checkValueExpr, trace) {

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
              if (sub.length > 0 && sub[0].errors.length === 0) {
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
            thread.avail[constraintNo] = constraintToTripleMapping[constraintNo].slice();
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
              ret.push({
                avail: thread.avail.map(a => { // copy parent thread's avail vector
                  return a.slice();
                }), // was: extend({}, thread.avail)
                errors: thread.errors.slice(),
                matched: matched.concat({
                  tNos: taken.slice()
                }),
                expression: extend(
                  {
                    type: "TripleConstraintSolutions",
                    predicate: expr.predicate,
                    solutions: taken.map(tripleNo =>  {
                      return { type: "halfTestedTriple", tripleNo: tripleNo, constraintNo: constraintNo };
                    })
                    // map(triple => {
                    //   var t = neighborhood[triple];
                    //   return {
                    //     type: "TestedTriple", subject: t.subject, predicate: t.predicate, object: t.object
                    //   }
                    // })
                  },
                  "valueExpr" in expr ? { valueExpr: expr.valueExpr } : {},
                  "productionLabel" in expr ? { productionLabel: expr.productionLabel } : {},
                  minmax)
              });
            } while ((function () {
              if (thread.avail[constraintNo].length > 0 && taken.length < max) {
                taken.push(thread.avail[constraintNo].shift());
                return true;
              } else {
                return false;
              }
            })());
          } else {
            var valueExpr = null;
            if (typeof expr.valueExpr === "string") { // ShapeRef
              valueExpr = expr.valueExpr;
              if (RdfTerm.isBlank(valueExpr))
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
              if (sub[0].errors.length === 0) {
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
          return validateRept("EachOfSolutions", (th) => {
            // Iterate through nested expressions, exprThreads starts as [th].
            return expr.expressions.reduce((exprThreads, nested) => {
              // Iterate through current thread list composing nextThreads.
              // Consider e.g.
              // <S1> { <p1> . | <p2> .; <p3> . } / { <x> <p2> 2; <p3> 3 } (should pass)
              // <S1> { <p1> .; <p2> . }          / { <s1> <p1> 1 }        (should fail)
              return exprThreads.reduce((nextThreads, exprThread) => {
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
              }, []);
            }, [th]);
          });
        }

        runtimeError("unexpected expr type: " + expr.type);
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
              if (tripleToConstraintMapping[k] !== undefined)
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
               neighborhood, recurse, direct, semActHandler, checkValueExpr) :
        ret.length > 1 ? {
          type: "PossibleErrors",
          errors: ret.reduce((all, e) => {
            return all.concat([e.errors]);
          }, [])
        } : ret[0];
    }

    function finish (fromValidatePoint, constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr) {
      function _dive (solns) {
        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          var ret = { value: RdfTerm.getLiteralValue(term) };
          var dt = RdfTerm.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          var lang = RdfTerm.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }
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
                if (typeof shapeLabel === "string" && RdfTerm.isBlank(shapeLabel))
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

function extend(base) {
  if (!base) base = {};
  for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (var name in arg)
      base[name] = arg[name];
  return base;
}

return {
  name: "threaded-val-nerr",
  description: "emulation of regular expression engine with error permutations",
  compile: vpEngine
};
})();

if (true)
  module.exports = ThreadedValNErr;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var ShExParser = (function () {

var RdfTerm = __webpack_require__(11).RdfTerm;
var ShExJison = __webpack_require__(56).Parser;

// Creates a ShEx parser with the given pre-defined prefixes
var prepareParser = function (baseIRI, prefixes, schemaOptions) {
  schemaOptions = schemaOptions || {};
  // Create a copy of the prefixes
  var prefixesCopy = {};
  for (var prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

  // Create a copy of the labelResolvers
  var termResolver = "termResolver" in schemaOptions ?
      schemaOptions.termResolver :
      makeDisabledTermResolver();

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  var parser = new ShExJison();

  function runParser () {
    // ShExJison.base = baseIRI || "";
    // ShExJison.basePath = ShExJison.base.replace(/[^\/]*$/, '');
    // ShExJison.baseRoot = ShExJison.base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    ShExJison._prefixes = Object.create(prefixesCopy);
    ShExJison._imports = [];
    ShExJison._setBase(baseIRI);
    ShExJison._setFileName(baseIRI);
    ShExJison.options = schemaOptions;
    if (!ShExJison._termResolver)
      ShExJison._termResolver = termResolver;
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
  parser._setTermResolver = ShExJison._setTermResolver;
  parser._setOptions = function (opts) { ShExJison.options = opts; };
  parser._resetBlanks = ShExJison._resetBlanks;
  parser.reset = ShExJison.reset;
  ShExJison.options = schemaOptions;
  return parser;

  function contextError (e, lexer) {
    // use the lexer's pretty-printing
    var line = e.location.first_line;
    var col  = e.location.first_column + 1;
    var posStr = "pos" in e.hash ? "\n" + e.hash.pos : ""
    return `${baseIRI}\n line: ${line}, column: ${col}: ${e.message}${posStr}`;
  }
}

var makeDBTermResolver = function (db) {
  var _db = db;
  var _lookFor = [];
  return {
    add: function (iri) {
      _lookFor.push(iri);
    },
    resolve: function (pair, prefixes) {
      var x = _lookFor.reduce((lfacc, lf) => {
        var found1 = _db.getQuads(null, lf, '"' + pair.label.value + '"');
        if (found1.length)
          return pair.prefix === null ?
          {prefix: null, length: null, term: RdfTerm.internalTerm(found1[0].subject)}:
          found1.reduce((tripacc, triple) => {
            var s = RdfTerm.internalTerm(triple.subject);
            return Object.keys(prefixes).reduce((prefacc, prefix) => {
              var ns = prefixes[prefix];
              var sw = s.startsWith(ns);
              if (sw && ns.length > prefacc.length && pair.prefix === prefix)
                return {prefix: prefix, length: prefacc.length, term: s};
              return prefacc;
            }, tripacc);
          }, lfacc);
        else
          return lfacc;
      }, {prefix: null, length: 0, term: null});
      if (x.term)
        return x.term;
      throw Error("no term found for `" + JSON.stringify(pair) + "`");
    }
  };
}

var makeDisabledTermResolver = function () {
  return {
    add: function (iri) {
      throw Error("no term resolver to accept <" + iri + ">");
    },
    resolve: function (label, prefixes) {
      throw Error("no term resolver to resolve `" + label + "`");
    }
  };
}

return {
  construct: prepareParser,
  dbTermResolver: makeDBTermResolver,
  disabledTermResolver: makeDisabledTermResolver
};
})();

if (true)
  module.exports = ShExParser;


/***/ }),
/* 27 */
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

var fs = __webpack_require__(3)
var rp = __webpack_require__(28)
var minimatch = __webpack_require__(14)
var Minimatch = minimatch.Minimatch
var inherits = __webpack_require__(61)
var EE = __webpack_require__(15).EventEmitter
var path = __webpack_require__(2)
var assert = __webpack_require__(29)
var isAbsolute = __webpack_require__(16)
var globSync = __webpack_require__(63)
var common = __webpack_require__(30)
var alphasort = common.alphasort
var alphasorti = common.alphasorti
var setopts = common.setopts
var ownProp = common.ownProp
var inflight = __webpack_require__(64)
var util = __webpack_require__(12)
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

var once = __webpack_require__(32)

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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {module.exports = realpath
realpath.realpath = realpath
realpath.sync = realpathSync
realpath.realpathSync = realpathSync
realpath.monkeypatch = monkeypatch
realpath.unmonkeypatch = unmonkeypatch

var fs = __webpack_require__(3)
var origRealpath = fs.realpath
var origRealpathSync = fs.realpathSync

var version = process.version
var ok = /^v[0-5]\./.test(version)
var old = __webpack_require__(57)

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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var objectAssign = __webpack_require__(62);

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

var util = __webpack_require__(12);
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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(8)))

/***/ }),
/* 30 */
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

var path = __webpack_require__(2)
var minimatch = __webpack_require__(14)
var isAbsolute = __webpack_require__(16)
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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 31 */
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
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var wrappy = __webpack_require__(31)
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
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
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


module.exports = Readable;
/*<replacement>*/

var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;
/*<replacement>*/

var EE = __webpack_require__(15).EventEmitter;

var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/


var Stream = __webpack_require__(34);
/*</replacement>*/


var Buffer = __webpack_require__(9).Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*<replacement>*/


var debugUtil = __webpack_require__(69);

var debug;

if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/


var BufferList = __webpack_require__(70);

var destroyImpl = __webpack_require__(35);

var _require = __webpack_require__(36),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = __webpack_require__(4).codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT; // Lazy loaded to improve the startup performance.


var StringDecoder;
var createReadableStreamAsyncIterator;
var from;

__webpack_require__(10)(Readable, Stream);

var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.

  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || __webpack_require__(5);
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"

  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex); // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()

  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false; // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.

  this.sync = true; // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.

  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'end' (and potentially 'finish')

  this.autoDestroy = !!options.autoDestroy; // has it been destroyed

  this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // the number of writers that are awaiting a drain event in .pipe()s

  this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;

  if (options.encoding) {
    if (!StringDecoder) StringDecoder = __webpack_require__(38).StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || __webpack_require__(5);
  if (!(this instanceof Readable)) return new Readable(options); // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex); // legacy

  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }

    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;

Readable.prototype._destroy = function (err, cb) {
  cb(err);
}; // Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.


Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;

      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }

      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
}; // Unshift should *always* be something directly out of read()


Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;

  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);

    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;

        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  } // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.


  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }

  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;

  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }

  return er;
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
}; // backwards compatibility.


Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = __webpack_require__(38).StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder; // If setEncoding(null), decoder.encoding equals utf8

  this._readableState.encoding = this._readableState.decoder.encoding; // Iterate over current buffer to convert already stored Buffers:

  var p = this._readableState.buffer.head;
  var content = '';

  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }

  this._readableState.buffer.clear();

  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
}; // Don't raise the hwm > 1GB


var MAX_HWM = 0x40000000;

function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }

  return n;
} // This function is designed to be inlinable, so please take care when making
// changes to the function body.


function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;

  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  } // If we're asking for more than the current hwm, then raise the hwm.


  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n; // Don't have enough

  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }

  return state.length;
} // you can override either this method, or the async _read(n) below.


Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.

  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state); // if we've ended, and we're now clear, then finish it up.

  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  } // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.
  // if we need a readable event, then we need to do some reading.


  var doRead = state.needReadable;
  debug('need readable', doRead); // if we currently have less than the highWaterMark, then also read some

  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  } // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.


  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true; // if the length is currently zero, then we *need* a readable event.

    if (state.length === 0) state.needReadable = true; // call internal read method

    this._read(state.highWaterMark);

    state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.

    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);
  return ret;
};

function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;

  if (state.decoder) {
    var chunk = state.decoder.end();

    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }

  state.ended = true;

  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;

    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
} // Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.


function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;

  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}

function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);

  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  } // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.


  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
} // at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.


function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length) // didn't get any data, stop spinning.
      break;
  }

  state.readingMore = false;
} // abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.


Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;

    case 1:
      state.pipes = [state.pipes, dest];
      break;

    default:
      state.pipes.push(dest);
      break;
  }

  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);

  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');

    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  } // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.


  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;

  function cleanup() {
    debug('cleanup'); // cleanup event handlers once the pipe is broken

    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true; // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.

    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  src.on('data', ondata);

  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);

    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }

      src.pause();
    }
  } // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.


  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  } // Make sure our error handler is attached before userland ones.


  prependListener(dest, 'error', onerror); // Both close and finish should trigger unpipe, but only once.

  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }

  dest.once('close', onclose);

  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }

  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  } // tell the dest that it's being piped to


  dest.emit('pipe', src); // start the flow if it hasn't been started already.

  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;

    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  }; // if we're not piping anywhere, then do nothing.

  if (state.pipesCount === 0) return this; // just one destination.  most common case.

  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes; // got a match.

    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  } // slow case. multiple pipe destinations.


  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, {
        hasUnpiped: false
      });
    }

    return this;
  } // try to find the right one.


  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
}; // set up data events if they are asked for
// Ensure readable listeners eventually get something


Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;

  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0; // Try start flowing on next tick if stream isn't explicitly paused

    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);

      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }

  return res;
};

Readable.prototype.addListener = Readable.prototype.on;

Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);

  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);

  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;

  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true; // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
} // pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.


Readable.prototype.resume = function () {
  var state = this._readableState;

  if (!state.flowing) {
    debug('resume'); // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()

    state.flowing = !state.readableListening;
    resume(this, state);
  }

  state.paused = false;
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  debug('resume', state.reading);

  if (!state.reading) {
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);

  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }

  this._readableState.paused = true;
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);

  while (state.flowing && stream.read() !== null) {
    ;
  }
} // wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.


Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');

    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);

    if (!ret) {
      paused = true;
      stream.pause();
    }
  }); // proxy all the other methods.
  // important when wrapping filters and duplexes.

  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  } // proxy certain important events.


  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  } // when we try to consume some more bytes, simply unpause the
  // underlying stream.


  this._read = function (n) {
    debug('wrapped _read', n);

    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = __webpack_require__(74);
    }

    return createReadableStreamAsyncIterator(this);
  };
}

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
}); // exposed for testing purposes only.

Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
}); // Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.

function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length); // Check that we didn't get one last unshift.

  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');

    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;

      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}

if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = __webpack_require__(75);
    }

    return from(Readable, iterable, opts);
  };
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }

  return -1;
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(8), __webpack_require__(1)))

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(15).EventEmitter;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) { // undocumented cb() API, needed for core, not for public API

function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  } // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks


  if (this._readableState) {
    this._readableState.destroyed = true;
  } // if this is a duplex stream mark the writable part as destroyed as well


  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });

  return this;
}

function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}

function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.
  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ERR_INVALID_OPT_VALUE = __webpack_require__(4).codes.ERR_INVALID_OPT_VALUE;

function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}

function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }

    return Math.floor(hwm);
  } // Default value


  return state.objectMode ? 16 : 16 * 1024;
}

module.exports = {
  getHighWaterMark: getHighWaterMark
};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
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
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.


module.exports = Writable;
/* <replacement> */

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
} // It seems a linked list but it is not
// there will be only 2 of these for each stream


function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/


var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;
/*<replacement>*/

var internalUtil = {
  deprecate: __webpack_require__(72)
};
/*</replacement>*/

/*<replacement>*/

var Stream = __webpack_require__(34);
/*</replacement>*/


var Buffer = __webpack_require__(9).Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

var destroyImpl = __webpack_require__(35);

var _require = __webpack_require__(36),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = __webpack_require__(4).codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
    ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

var errorOrDestroy = destroyImpl.errorOrDestroy;

__webpack_require__(10)(Writable, Stream);

function nop() {}

function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || __webpack_require__(5);
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag to indicate whether or not this stream
  // contains buffers or objects.

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()

  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex); // if _final has been called

  this.finalCalled = false; // drain event flag.

  this.needDrain = false; // at the start of calling end()

  this.ending = false; // when end() has been called, and returned

  this.ended = false; // when 'finish' is emitted

  this.finished = false; // has it been destroyed

  this.destroyed = false; // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.

  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.

  this.length = 0; // a flag to see when we're in the middle of a write.

  this.writing = false; // when true all writes will be buffered until .uncork() call

  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.

  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

  this.onwrite = function (er) {
    onwrite(stream, er);
  }; // the callback that the user supplies to write(chunk,encoding,cb)


  this.writecb = null; // the amount that is being written when _write is called.

  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted

  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams

  this.prefinished = false; // True if the error was already emitted and should not be thrown again

  this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'finish' (and potentially 'end')

  this.autoDestroy = !!options.autoDestroy; // count buffered requests

  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two

  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})(); // Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.


var realHasInstance;

if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || __webpack_require__(5); // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.
  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex); // legacy.

  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
} // Otherwise people can pipe Writable streams, which is just wrong.


Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};

function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
} // Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.


function validChunk(stream, state, chunk, cb) {
  var er;

  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }

  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }

  return true;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  this._writableState.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }

  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
}); // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);

    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }

  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er); // this can emit finish, and it will always happen
    // after error

    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er); // this can emit finish, but finish must
    // always follow error

    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.


function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
} // if there's something in the buffer waiting, then process it


function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;

    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }

    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite

    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }

    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  } // ignore unnecessary end() calls.


  if (!state.ending) endWritable(this, state, cb);
  return this;
};

Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;

    if (err) {
      errorOrDestroy(stream, err);
    }

    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}

function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    prefinish(stream, state);

    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');

      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;

        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;

  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  } // reuse the free corkReq.


  state.corkedRequestsFree.next = corkReq;
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }

    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;

Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(8), __webpack_require__(1)))

/***/ }),
/* 38 */
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



/*<replacement>*/

var Buffer = __webpack_require__(73).Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

/***/ }),
/* 39 */
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
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.


module.exports = Transform;

var _require$codes = __webpack_require__(4).codes,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
    ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;

var Duplex = __webpack_require__(5);

__webpack_require__(10)(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;

  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }

  ts.writechunk = null;
  ts.writecb = null;
  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;

  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  }; // start out asking for a readable event once data is transformed.

  this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.

  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  } // When the writable side finishes, then flush out anything remaining.


  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
}; // This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.


Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;

  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
}; // Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.


Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;

    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided

  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}

/***/ }),
/* 40 */
/***/ (function(module, exports) {

/*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
let promise

module.exports = typeof queueMicrotask === 'function'
  ? queueMicrotask
  // reuse resolved promise, and allocate it lazily
  : cb => (promise || (promise = Promise.resolve()))
    .then(cb)
    .catch(err => setTimeout(() => { throw err }, 0))


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

ShExWebApp = (function () {
  let shapeMap = __webpack_require__(42)
  return Object.assign(__webpack_require__(11), {
    Api: __webpack_require__(55),
    Parser: __webpack_require__(26),
    ShapeMap: shapeMap,
    ShapeMapParser: shapeMap.Parser,
    N3: __webpack_require__(78)
  })
})()

if (true)
  module.exports = ShExWebApp;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * See README for description.
 */

var ShapeMap = (function () {
  const symbols = __webpack_require__(18)

  // Write the parser object directly into the symbols so the caller shares a
  // symbol space with ShapeMapJison for e.g. start and focus.
  symbols.Parser = __webpack_require__(43)
  return symbols
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShapeMap;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

var ShapeMapParser = (function () {

// stolen as much as possible from SPARQL.js
if (true) {
  ShapeMapJison = __webpack_require__(44).Parser; // node environment
} else {}

// Creates a ShEx parser with the given pre-defined prefixes
var prepareParser = function (baseIRI, schemaMeta, dataMeta) {
  // Create a copy of the prefixes
  var schemaBase = schemaMeta.base;
  var schemaPrefixesCopy = {};
  for (var prefix in schemaMeta.prefixes || {})
    schemaPrefixesCopy[prefix] = schemaMeta.prefixes[prefix];
  var dataBase = dataMeta.base;
  var dataPrefixesCopy = {};
  for (var prefix in dataMeta.prefixes || {})
    dataPrefixesCopy[prefix] = dataMeta.prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  var parser = new ShapeMapJison();

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
      var lineNo = "lexer" in parser.yy ? parser.yy.lexer.yylineno + 1 : 1;
      var pos = "lexer" in parser.yy ? parser.yy.lexer.showPosition() : "";
      var t = Error(`${baseIRI}(${lineNo}): ${e.message}\n${pos}`);
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
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, module) {/* parser generated by jison 0.4.16 */
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
        var namePos = $$[$0].indexOf(':');
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
        var t = $$[$0-1].substr(0, $$[$0-1].length - 1).trim(); // remove trailing ':' and spaces
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

        var unesc = unescapeText($$[$0].slice(1,-1), {});
        this.$ = Parser._dataBase === null || absoluteIRI.test(unesc) ? unesc : _resolveDataIRI(unesc)
      
break;
case 85: case 86: case 90:

        var namePos = $$[$0].indexOf(':');
        this.$ = expandPrefix(Parser._dataPrefixes, $$[$0].substr(0, namePos)) + unescapeText($$[$0].substr(namePos + 1), pnameEscapeReplacements);
    
break;
case 87:

        this.$ = expandPrefix(Parser._dataPrefixes, $$[$0].substr(0, $$[$0].length - 1));
    
break;
case 88:

        var unesc = unescapeText($$[$0].slice(1,-1), {});
        this.$ = Parser._schemaBase === null || absoluteIRI.test(unesc) ? unesc : _resolveSchemaIRI(unesc)
      
break;
case 89:

        var namePos = $$[$0].indexOf(':');
        this.$ = expandPrefix(Parser._schemaPrefixes, $$[$0].substr(0, namePos)) + unescapeText($$[$0].substr(namePos + 1), pnameEscapeReplacements);
    
break;
case 91:

        this.$ = expandPrefix(Parser._schemaPrefixes, $$[$0].substr(0, $$[$0].length - 1));
    
break;
}
},
table: [{3:1,4:[1,2],5:3,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},{1:[3]},{1:[2,1]},o($Vg,[2,4],{6:30}),{11:31,16:[1,32],19:[1,33],20:[1,34],21:[1,35]},o($Vh,[2,19]),o($Vh,[2,20]),{26:36,56:$V9,76:$Va,77:$Vb,78:$Vc},o($Vh,$Vi,{26:37,56:$V9,76:$Va,77:$Vb,78:$Vc}),o($Vj,[2,27]),o($Vj,[2,28]),{27:42,30:40,31:$V1,34:[1,38],38:39,39:[1,41],46:$V3,80:$Vd,81:$Ve,82:$Vf},o($Vk,[2,84]),o($Vk,[2,85]),o($Vk,[2,86]),o($Vk,[2,87]),o([16,19,20,21,37,46,79,80,81,82],[2,26]),o($Vj,[2,65]),o($Vj,[2,66]),o($Vj,[2,67]),o($Vj,[2,74],{72:43,73:44,74:[1,45],75:[1,46]}),o($Vj,[2,68]),o($Vj,[2,69]),o($Vj,[2,70]),o($Vj,[2,76]),o($Vj,[2,77]),o($Vl,[2,78]),o($Vl,[2,79]),o($Vl,[2,80]),o($Vl,[2,81]),{4:[2,6],7:47,8:48,9:[1,49]},o($Vm,[2,9],{12:50,14:51,42:[1,52]}),o($Vn,[2,17],{17:53,22:54,40:[1,55],41:[1,56]}),o($Vo,[2,14]),o($Vo,[2,15]),o($Vo,[2,16]),o($Vh,[2,21]),o($Vh,[2,22]),{27:58,35:57,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},{27:58,35:60,46:$V3,79:$Vp,80:$Vd,81:$Ve,82:$Vf},o($Vq,[2,33]),o($Vq,[2,34]),o([37,46,79,80,81,82],$Vi),o($Vj,[2,71]),o($Vj,[2,75]),o($Vj,[2,72]),{27:61,46:$V3,80:$Vd,81:$Ve,82:$Vf},{4:[1,62]},o($Vg,[2,5]),{4:[2,7],5:63,10:4,23:5,24:6,25:$V0,26:20,27:8,30:9,31:$V1,32:10,33:$V2,46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vg,[2,11],{13:64,15:65,43:[1,66]}),o($Vm,[2,10]),{26:67,56:$V9,76:$Va,77:$Vb,78:$Vc},{18:68,28:69,29:[1,70],46:[1,73],80:[1,71],81:[1,72],82:[1,74]},o($Vn,[2,18]),o($Vn,[2,35]),o($Vn,[2,36]),{23:76,26:20,27:42,30:9,31:$V1,32:10,36:75,39:[1,77],46:$V3,48:$V4,50:$V5,53:$V6,54:$V7,55:$V8,56:$V9,69:17,70:18,71:19,76:$Va,77:$Vb,78:$Vc,80:$Vd,81:$Ve,82:$Vf},o($Vr,[2,82]),o($Vr,[2,83]),{34:[1,78]},o($Vj,[2,73]),{1:[2,2]},o($Vg,[2,3]),o($Vg,[2,8]),o($Vg,[2,12]),{44:79,46:[1,80],47:[1,81]},o($Vm,[2,37]),o($Vo,[2,13]),o($Vo,[2,23]),o($Vo,[2,24]),o($Vo,[2,88]),o($Vo,[2,89]),o($Vo,[2,90]),o($Vo,[2,91]),{37:[1,82]},{37:[2,31]},{37:[2,32]},{37:[1,83]},{33:$Vs,45:84,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VB,[2,39]),o($VB,[2,40]),o($Vh,[2,29]),o($Vh,[2,30]),o($Vg,[2,38]),o($VC,[2,41]),o($VC,[2,42]),o($VC,[2,43]),o($VC,[2,44]),o($VC,[2,45]),o($VC,[2,46]),o($VC,[2,47]),o($VC,[2,48]),o($VC,[2,49]),{37:[2,55],57:96,59:98,61:97,62:$VD},{33:$Vs,45:102,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA,64:100,65:[2,63],68:101},{37:[1,103]},{37:[2,56]},o($VE,[2,52],{60:104}),{33:$Vs,45:105,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},{65:[1,106]},{65:[2,64]},o($VF,[2,60],{67:107}),o($VC,[2,50]),{9:[1,109],37:[2,54],58:108},o($VE,[2,57]),o($VC,[2,58]),{9:[1,111],65:[2,62],66:110},o($VE,[2,53]),{59:112,62:$VD},o($VF,[2,61]),{33:$Vs,45:113,48:$Vt,49:$Vu,50:$Vv,51:88,52:89,53:$Vw,54:$Vx,55:$Vy,56:$Vz,63:$VA},o($VE,[2,51]),o($VF,[2,59])],
defaultActions: {2:[2,1],62:[2,2],76:[2,31],77:[2,32],97:[2,56],101:[2,64]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        function _parseError (msg, hash) {
            this.message = msg;
            this.hash = hash;
        }
        _parseError.prototype = new Error();

        throw new _parseError(str, hash);
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
                    loc: yyloc,
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

  var ShapeMap = __webpack_require__(18);

  // Common namespaces and entities
  var XSD = 'http://www.w3.org/2001/XMLSchema#',
      XSD_INTEGER  = XSD + 'integer',
      XSD_DECIMAL  = XSD + 'decimal',
      XSD_FLOAT   = XSD + 'float',
      XSD_DOUBLE   = XSD + 'double',
      XSD_BOOLEAN  = XSD + 'boolean';

  var numericDatatypes = [
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

  var absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
    schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

  var numericFacets = ["mininclusive", "minexclusive",
                       "maxinclusive", "maxexclusive"];

  // Extends a base object with properties of other objects
  function extend(base) {
    if (!base) base = {};
    for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (var name in arg)
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
    var result = '', length = iri.length, i = -1, pathStart = -1, segmentStart = 0, next = '/';

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
    var ret = {  };
    for (var i = 0; i < arguments.length; i+= 2) {
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
  var blankId = 0;
  Parser._resetBlanks = function () { blankId = 0; }
  Parser.reset = function () {
    Parser._prefixes = Parser._imports = Parser.valueExprDefns = Parser.shapes = Parser.productions = Parser.start = Parser.startActs = null; // Reset state.
    Parser._schemaBase = Parser._schemaBasePath = Parser._schemaBaseRoot = Parser._schemaBaseIRIScheme = null;
  }
  var _fileName; // for debugging
  Parser._setFileName = function (fn) { _fileName = fn; }

  // Regular expression and replacement strings to escape strings
  var stringEscapeReplacements = { '\\': '\\', "'": "'", '"': '"',
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
    var at = string.lastIndexOf("@");
    var lang = string.substr(at);
    string = string.substr(0, at);
    var u = unescapeString(string, trimLength);
    return extend(u, obj("@language", lang.substr(1).toLowerCase()));
  }

  function error (msg) {
    Parser.reset();
    throw new Error(msg);
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

  var EmptyObject = {  };
  var EmptyShape = { type: "Shape" };

  // <?INCLUDE from ShExUtil. Factor into `rdf-token` module? ?>
  /**
   * unescape numerics and allowed single-character escapes.
   * throws: if there are any unallowed sequences
   */
  function unescapeText (string, replacements) {
    var regex = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g;
    try {
      string = string.replace(regex, function (sequence, unicode4, unicode8, escapedChar) {
        var charCode;
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
          var replacement = replacements[escapedChar];
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
rules: [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^\/]|\\\/))*\*\/))/,/^(?:(appinfo[\u0020\u000A\u0009]+:))/,/^(?:("([^\u0022\u005C\u000A\u000D]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"[\u0020\u000A\u0009]*:))/,/^(?:([Ff][Oo][Cc][Uu][Ss]))/,/^(?:([Ss][Tt][Aa][Rr][Tt]))/,/^(?:(@[Ss][Tt][Aa][Rr][Tt]))/,/^(?:([Ss][Pp][Aa][Rr][Qq][Ll]))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(appinfo:))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:a\b)/,/^(?:,)/,/^(?:\{)/,/^(?:\})/,/^(?:@)/,/^(?:!)/,/^(?:\?)/,/^(?:\/)/,/^(?:\$)/,/^(?:\[)/,/^(?:\])/,/^(?:\^\^)/,/^(?:_\b)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:null\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/],
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
    var source = __webpack_require__(3).readFileSync(__webpack_require__(2).normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if ( true && __webpack_require__.c[__webpack_require__.s] === module) {
  exports.main(process.argv.slice(1));
}
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1), __webpack_require__(19)(module)))

/***/ }),
/* 45 */
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
/* 46 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 47 */
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
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var qs_1 = __webpack_require__(49);
function handleQs(url, query) {
    var _a = url.split('?'), start = _a[0], part2 = _a[1];
    var qs = (part2 || '').split('#')[0];
    var end = part2 && part2.split('#').length > 1 ? '#' + part2.split('#')[1] : '';
    var baseQs = qs_1.parse(qs);
    for (var i in query) {
        baseQs[i] = query[i];
    }
    qs = qs_1.stringify(baseQs);
    if (qs !== '') {
        qs = '?' + qs;
    }
    return start + qs + end;
}
exports["default"] = handleQs;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var stringify = __webpack_require__(50);
var parse = __webpack_require__(51);
var formats = __webpack_require__(24);

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(23);
var formats = __webpack_require__(24);

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) { // eslint-disable-line func-name-matching
        return prefix + '[]';
    },
    indices: function indices(prefix, key) { // eslint-disable-line func-name-matching
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) { // eslint-disable-line func-name-matching
        return prefix;
    }
};

var toISO = Date.prototype.toISOString;

var defaults = {
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    serializeDate: function serializeDate(date) { // eslint-disable-line func-name-matching
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var stringify = function stringify( // eslint-disable-line func-name-matching
    object,
    prefix,
    generateArrayPrefix,
    strictNullHandling,
    skipNulls,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    formatter,
    encodeValuesOnly
) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(stringify(
                obj[key],
                generateArrayPrefix(prefix, key),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly
            ));
        } else {
            values = values.concat(stringify(
                obj[key],
                prefix + (allowDots ? '.' + key : '[' + key + ']'),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly
            ));
        }
    }

    return values;
};

module.exports = function (object, opts) {
    var obj = object;
    var options = opts ? utils.assign({}, opts) : {};

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = typeof options.encoder === 'function' ? options.encoder : defaults.encoder;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    var encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults.encodeValuesOnly;
    if (typeof options.format === 'undefined') {
        options.format = formats['default'];
    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    var formatter = formats.formatters[options.format];
    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(stringify(
            obj[key],
            key,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encode ? encoder : null,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter,
            encodeValuesOnly
        ));
    }

    var joined = keys.join(delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    return joined.length > 0 ? prefix + joined : '';
};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(23);

var has = Object.prototype.hasOwnProperty;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    parameterLimit: 1000,
    plainObjects: false,
    strictNullHandling: false
};

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);

    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder);
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder);
            val = options.decoder(part.slice(pos + 1), defaults.decoder);
        }
        if (has.call(obj, key)) {
            obj[key] = [].concat(obj[key]).concat(val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options) {
    var leaf = val;

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]') {
            obj = [];
            obj = obj.concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (
                !isNaN(index)
                && root !== cleanRoot
                && String(index) === cleanRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options);
};

module.exports = function (str, opts) {
    var options = opts ? utils.assign({}, opts) : {};

    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    options.ignoreQueryPrefix = options.ignoreQueryPrefix === true;
    options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : defaults.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults.decoder;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * A response from a web request
 */
var Response = /** @class */ (function () {
    function Response(statusCode, headers, body, url) {
        if (typeof statusCode !== 'number') {
            throw new TypeError('statusCode must be a number but was ' + typeof statusCode);
        }
        if (headers === null) {
            throw new TypeError('headers cannot be null');
        }
        if (typeof headers !== 'object') {
            throw new TypeError('headers must be an object but was ' + typeof headers);
        }
        this.statusCode = statusCode;
        var headersToLowerCase = {};
        for (var key in headers) {
            headersToLowerCase[key.toLowerCase()] = headers[key];
        }
        this.headers = headersToLowerCase;
        this.body = body;
        this.url = url;
    }
    Response.prototype.isError = function () {
        return this.statusCode === 0 || this.statusCode >= 400;
    };
    Response.prototype.getBody = function (encoding) {
        if (this.statusCode === 0) {
            var err = new Error('This request to ' +
                this.url +
                ' resulted in a status code of 0. This usually indicates some kind of network error in a browser (e.g. CORS not being set up or the DNS failing to resolve):\n' +
                this.body.toString());
            err.statusCode = this.statusCode;
            err.headers = this.headers;
            err.body = this.body;
            err.url = this.url;
            throw err;
        }
        if (this.statusCode >= 300) {
            var err = new Error('Server responded to ' +
                this.url +
                ' with status code ' +
                this.statusCode +
                ':\n' +
                this.body.toString());
            err.statusCode = this.statusCode;
            err.headers = this.headers;
            err.body = this.body;
            err.url = this.url;
            throw err;
        }
        if (!encoding || typeof this.body === 'string') {
            return this.body;
        }
        return this.body.toString(encoding);
    };
    return Response;
}());
module.exports = Response;


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */

var ShExValidator = (function () {
var UNBOUNDED = -1;

// interface constants
var Start = { term: "START" }
var InterfaceOptions = {
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

var VERBOSE = "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

var ProgramFlowError = { type: "ProgramFlowError", errors: { type: "UntrackedError" } };

var RdfTerm = __webpack_require__(7);
let ShExUtil = __webpack_require__(20);

function getLexicalValue (term) {
  return RdfTerm.isIRI(term) ? term :
    RdfTerm.isLiteral(term) ? RdfTerm.getLiteralValue(term) :
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

testRange = function (value, datatype, parseError) {
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
          var ret = { value: RdfTerm.getLiteralValue(term) };
          var dt = RdfTerm.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          var lang = RdfTerm.getLiteralLanguage(term)
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
  let index = schema._index || ShExUtil.index(schema)
  this.type = "ShExValidator";
  options = options || {};
  this.options = options;
  this.options.or = this.options.or || "someOf";
  this.options.partition = this.options.partition || "exhaustive";
  if (!("noCache" in options && options.noCache))
    this.known = {};

  var _ShExValidator = this;
  this.schema = schema;
  this._expect = this.options.lax ? noop : expect; // report errors on missing types.
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function () {  }; // included in case we need it later.
  // var regexModule = this.options.regexModule || require("../lib/regex/nfax-val-1err");
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
        indexTripleConstraints_dive(index.tripleExprs[expr]);

      else if (expr.type === "TripleConstraint")
        tripleConstraints.push(expr)-1;

      else if (expr.type === "OneOf" || expr.type === "EachOf")
        expr.expressions.forEach(function (nested) {
          indexTripleConstraints_dive(nested);
        });

      // @@TODO shape.virtual, shape.inherit
      else
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
  this.validate = function (db, point, label, tracker, seen) {
    // default to schema's start shape
    if (typeof point === "object" && "termType" in point) {
      point = RdfTerm.internalTerm(point)
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
      if (results.failures.length) {
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

    if (seen === undefined)
      seen = {};
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
    var ret = this._validateShapeExpr(db, point, shape, label, tracker, seen);
    tracker.exit(point, label, ret);
    delete seen[seenKey];
    if ("known" in this)
      this.known[seenKey] = ret;
    if ("startActs" in schema && outside) {
      ret.startActs = schema.startActs;
    }
    return ret;
  }

  this._validateShapeExpr = function (db, point, shapeExpr, shapeLabel, tracker, seen) {
    if (point === "")
      throw Error("validation needs a valid focus node");
    if (typeof shapeExpr === "string") { // ShapeRef
      return this._validateShapeExpr(db, point, index.shapeExprs[shapeExpr], shapeExpr, tracker, seen);
    } else if (shapeExpr.type === "NodeConstraint") {
      var errors = this._errorsMatchingNodeConstraint(point, shapeExpr, null);
      return errors.length ? {
        type: "Failure",
        node: ldify(point),
        shape: shapeLabel,
        errors: errors.map(function (error) {
          return {
            type: "NodeConstraintViolation",
            shapeExpr: shapeExpr,
            error: error
          };
        })
      } : {
        type: "NodeTest",
        node: ldify(point),
        shape: shapeLabel,
        shapeExpr: shapeExpr
      };
    } else if (shapeExpr.type === "Shape") {
      return this._validateShape(db, point, regexModule.compile(schema, shapeExpr, index),
                                 shapeExpr, shapeLabel, tracker, seen);
    } else if (shapeExpr.type === "ShapeExternal") {
      return this.options.validateExtern(db, point, shapeLabel, tracker, seen);
    } else if (shapeExpr.type === "ShapeOr") {
      var errors = [];
      for (var i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        var nested = shapeExpr.shapeExprs[i];
        var sub = this._validateShapeExpr(db, point, nested, shapeLabel, tracker, seen);
        if ("errors" in sub)
          errors.push(sub);
        else
          return { type: "ShapeOrResults", solution: sub };
      }
      return { type: "ShapeOrFailure", errors: errors };
    } else if (shapeExpr.type === "ShapeNot") {
      var sub = this._validateShapeExpr(db, point, shapeExpr.shapeExpr, shapeLabel, tracker, seen);
      if ("errors" in sub)
          return { type: "ShapeNotResults", solution: sub };
        else
          return { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      var passes = [];
      var errors = [];
      for (var i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        var nested = shapeExpr.shapeExprs[i];
        var sub = this._validateShapeExpr(db, point, nested, shapeLabel, tracker, seen);
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

  this._validateShape = function (db, point, regexEngine, shape, shapeLabel, tracker, seen) {
    var _ShExValidator = this;

    var ret = null;
    var startAcionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in schema) {
      const semActErrors = this.semActHandler.dispatchAll(schema.startActs, null, startAcionStorage)
      if (semActErrors.length)
        return {
          type: "Failure",
          node: ldify(point),
          shape: shapeLabel,
          errors: semActErrors
        }; // some semAct aborted !! return real error
    }
    // @@ add to tracker: f("validating <" + point + "> as <" + shapeLabel + ">");

    var fromDB  = db.getNeighborhood(point, shapeLabel, shape);
    var outgoing = indexNeighborhood(fromDB.outgoing.sort(
      (l, r) => sparqlOrder(l.object, r.object)
    ));
    var incoming = indexNeighborhood(fromDB.incoming.sort(
      (l, r) => sparqlOrder(l.subject, r.subject)
    ));
    var outgoingLength = fromDB.outgoing.length;
    var neighborhood = fromDB.outgoing.concat(fromDB.incoming);

    var constraintList = this.indexTripleConstraints(shape.expression);
    var tripleList = constraintList.reduce(function (ret, constraint, ord) {

      // subject and object depend on direction of constraint.
      var searchSubject = constraint.inverse ? null : point;
      var searchObject = constraint.inverse ? point : null;
      var index = constraint.inverse ? incoming : outgoing;

      // get triples matching predciate
      var matchPredicate = index.byPredicate[constraint.predicate] ||
        []; // empty list when no triple matches that constraint

      function _errorsByShapeLabel (focus, shapeLabel) {
        var sub = _ShExValidator.validate(db, focus, shapeLabel, tracker, seen);
        return "errors" in sub ? sub.errors : [];
      }
      function _errorsByShapeExpr (focus, shapeExpr) {
        var sub = _ShExValidator._validateShapeExpr(db, focus, shapeExpr, shapeLabel, tracker, seen);
        return "errors" in sub ? sub.errors : [];
      }
      // strip to triples matching value constraints (apart from @<someShape>)
      var matchConstraints = _ShExValidator._triplesMatchingShapeExpr(
        matchPredicate,
        constraint.valueExpr,
        constraint.inverse,
        /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeLabel,
        /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeExpr
      );

      matchConstraints.hits.forEach(function (t) {
        ret.constraintList[neighborhood.indexOf(t)].push(ord);
      });
      matchConstraints.misses.forEach(function (t) {
        ret.misses[neighborhood.indexOf(t.triple)] = {constraintNo: ord, errors: t.errors};
      });
      return ret;
    }, { misses: {}, constraintList:_seq(neighborhood.length).map(function () { return []; }) }); // start with [[],[]...]

    // @@ add to tracker: f("constraints by triple: ", JSON.stringify(tripleList.constraintList));

    var extras = []; // triples accounted for by EXTRA
    var misses = tripleList.constraintList.reduce(function (ret, constraints, ord) {
      if (constraints.length === 0 &&                       // matches no constraints
          ord < outgoingLength &&                           // not an incoming triple
          ord in tripleList.misses) {                       // predicate matched some constraint(s)
        if (shape.extra !== undefined &&
            shape.extra.indexOf(neighborhood[ord].predicate) !== -1) {
          extras.push(ord);
        } else {                                            // not declared extra
          ret.push({                                        // so it's a missed triple.
            tripleNo: ord,
            constraintNo: tripleList.misses[ord].constraintNo,
            errors: tripleList.misses[ord].errors
          });
        }
      }
      return ret;
    }, []);

    var xp = crossProduct(tripleList.constraintList);
    var partitionErrors = [];
    while ((misses.length === 0 || this.options.partition !== "greedy") && xp.next() && ret === null) {
      // caution: early continues

      var usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      var constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
        _seq(neighborhood.length).map(function () { return 0; });
      var tripleToConstraintMapping = xp.get(); // [0,1,0,3] mapping from triple to constraint

      // Triples not mapped to triple constraints are not allowed in closed shapes.
      if (shape.closed) {
        var unexpectedTriples = neighborhood.slice(0, outgoingLength).filter((t, i) => {
          return tripleToConstraintMapping[i] === undefined && // didn't match a constraint
          extras.indexOf(i) === -1; // wasn't in EXTRAs.
        });
        if (unexpectedTriples.length > 0) {
          partitionErrors.push({
            errors: [
              {
                type: "ClosedShapeViolation",
                unexpectedTriples: unexpectedTriples
              }
            ]
          });
          continue; // closed shape violation.
        }
      }

      // Set usedTriples and constraintMatchCount.
      tripleToConstraintMapping.forEach(function (tpNumber, ord) {
        if (tpNumber !== undefined) {
          usedTriples.push(neighborhood[ord]);
          ++constraintMatchCount[tpNumber];
        }
      });

      // Pivot to triples by constraint.
      function _constraintToTriples () {
        var cll = constraintList.length;
        return tripleToConstraintMapping.slice().
          reduce(function (ret, c, ord) {
            if (c !== undefined)
              ret[c].push(ord);
            return ret;
          }, _seq(cll).map(function () { return []; }));
      }

      tripleToConstraintMapping.slice().sort(function (a,b) { return a-b; }).filter(function (i) { // sort constraint numbers
        return i !== undefined;
      }).map(function (n) { return n + " "; }).join(""); // e.g. 0 0 1 3

      function _recurse (point, shapeLabel) {
        return _ShExValidator.validate(db, point, shapeLabel, tracker, seen);
      }
      function _direct (point, shapeExpr) {
        return _ShExValidator._validateShapeExpr(db, point, shapeExpr, shapeLabel, tracker, seen);
      }
      function _testExpr (term, valueExpr, recurse, direct) {
        return _ShExValidator._errorsMatchingShapeExpr(term, valueExpr, recurse, direct)
      }
      var results = regexEngine.match(db, point, constraintList, _constraintToTriples(), tripleToConstraintMapping, neighborhood, _recurse, _direct, this.semActHandler, _testExpr, null);
      if (false) { var fromNFA, nfa; }
      if ("errors" in results) {
        partitionErrors.push({
          errors: results.errors
        });
        if (_ShExValidator.options.partition !== "exhaustive")
          break;
        else
          continue;
      }

      // @@ add to tracker: f("post-regexp " + usedTriples.join(" "));

      var possibleRet = { type: "ShapeTest", node: ldify(point), shape: shapeLabel };
      if (Object.keys(results).length > 0) // only include .solution for non-empty pattern
        possibleRet.solution = results;
      if ("semActs" in shape) {
        const semActErrors = this.semActHandler.dispatchAll(shape.semActs, results, possibleRet)
        if (semActErrors.length) {
          // some semAct aborted
          partitionErrors.push({
            errors: semActErrors
          });
          if (_ShExValidator.options.partition !== "exhaustive")
            break;
          else
            continue;
        }
      }
      // @@ add to tracker: f("final " + usedTriples.join(" "));

      ret = possibleRet;
      partitionErrors = [];
      // alts.push(tripleToConstraintMapping);
    }
    var missErrors = misses.map(function (miss) {
      var t = neighborhood[miss.tripleNo];
      return {
        type: "TypeMismatch",
        triple: {type: "TestedTriple", subject: t.subject, predicate: t.predicate, object: ldify(t.object)},
        constraint: constraintList[miss.constraintNo],
        errors: miss.errors
      };
    });
    let errors = missErrors.concat(partitionErrors.length === 1 ? partitionErrors[0].errors : partitionErrors);
    if (errors.length > 0) {
      ret = {
        type: "Failure",
        node: ldify(point),
        shape: shapeLabel,
        errors: errors
      };
    }

    if (VERBOSE) { // remove N3jsTripleToString
      neighborhood.forEach(function (t) {
        delete t.toString;
      });
    }
    // @@ add to tracker: f("</" + shapeLabel + ">");
    return addShapeAttributes(ret);

    function addShapeAttributes (ret) {
      if ("annotations" in shape)
        ret.annotations = shape.annotations;
      return ret;
    }
  };

  this._triplesMatchingShapeExpr = function (triples, valueExpr, inverse, recurse, direct) {
    var _ShExValidator = this;
    var misses = [];
    var hits = [];
    triples.forEach(function (triple) {
      var value = inverse ? triple.subject : triple.object;
      var errors = valueExpr === undefined ?
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
    var _ShExValidator = this;
    if (typeof valueExpr === "string") { // ShapeRef
      return recurse ? recurse(value, valueExpr) : [];
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return direct === undefined ? [] : direct(value, valueExpr);
    } else if (valueExpr.type === "ShapeOr") {
      var ret = [];
      for (var i = 0; i < valueExpr.shapeExprs.length; ++i) {
        var nested = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExprs[i], recurse, direct);
        if (nested.length === 0)
          return nested;
        ret = ret.concat(nested);
      }
      return ret;
    } else if (valueExpr.type === "ShapeAnd") {
      return valueExpr.shapeExprs.reduce(function (ret, nested, iter) {
        return ret.concat(_ShExValidator._errorsMatchingShapeExpr(value, nested, recurse, direct, true));
      }, []);
    } else if (valueExpr.type === "ShapeNot") {
      var ret = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExpr, recurse, direct, true);
      return ret.length ?
        [] :
        ["Error validating " + value + " as " + JSON.stringify(valueExpr) + ": expected NOT to pass"];
    } else {
      throw Error("unknown value expression type '" + valueExpr.type + "'");
    }
  };

  /* _errorsMatchingNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  this._errorsMatchingNodeConstraint = function (value, valueExpr, recurse) {
    var errors = [];
    var label = RdfTerm.isLiteral(value) ? RdfTerm.getLiteralValue(value) :
      RdfTerm.isBlank(value) ? value.substring(2) :
      value;
    var dt = RdfTerm.isLiteral(value) ? RdfTerm.getLiteralType(value) : null;
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
        if (RdfTerm.isBlank(value)) {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (RdfTerm.isLiteral(value)) {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }

      if (valueExpr.datatype  && valueExpr.values  ) validationError("found both datatype and values in "   +tripleConstraint);

      if (valueExpr.datatype) {
        if (!RdfTerm.isLiteral(value)) {
          validationError("mismatched datatype: " + value + " is not a literal with datatype " + valueExpr.datatype);
        }
        else if (RdfTerm.getLiteralType(value) !== valueExpr.datatype) {
          validationError("mismatched datatype: " + RdfTerm.getLiteralType(value) + " !== " + valueExpr.datatype);
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
        if (RdfTerm.isLiteral(value) && valueExpr.values.reduce((ret, v) => {
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
                if (RdfTerm.isLiteral(val)) {
                  if (["LiteralStem", "LiteralStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(RdfTerm.getLiteralValue(val), ref);
                  } else if (["LanguageStem", "LanguageStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(RdfTerm.getLiteralLanguage(val) || null, ref);
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
    return errors;
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
          const response = _semActHanlder.handlers[semAct.name].dispatch(code, ctx, extensionStorage); debugger
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
function crossProduct(sets) {
  var n = sets.length, carets = [], args = null;

  function init() {
    args = [];
    for (var i = 0; i < n; i++) {
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
var N3jsTripleToString = function () {
  function fmt (n) {
    return RdfTerm.isLiteral(n) ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(RdfTerm.getLiteralType(n)) !== -1 ?
      parseInt(RdfTerm.getLiteralValue(n)) :
      n :
    RdfTerm.isBlank(n) ?
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
    x => RdfTerm.isBlank(x) ? 1 : RdfTerm.isLiteral(x) ? 2 : 3
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

  return {
    construct: ShExValidator_constructor,
    start: Start,
    options: InterfaceOptions
  };
})();

// Export the `ShExValidator` class as a whole.
if (true)
  module.exports = ShExValidator;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

var NFAXVal1Err = (function () {
  var RdfTerm = __webpack_require__(7);

  var Split = "<span class='keyword' title='Split'>|</span>";
  var Rept  = "<span class='keyword' title='Repeat'>×</span>";
  var Match = "<span class='keyword' title='Match'>␃</span>";
  /* compileNFA - compile regular expression and index triple constraints
   */
  var UNBOUNDED = -1;

  function compileNFA (schema, shape, index) {
    var expression = shape.expression;
    return NFA();

    function NFA () {
      // wrapper for states, startNo and matchstate
      var states = [];
      var matchstate = State_make(Match, []);
      var startNo = matchstate;
      var stack = [];
      var pair;
      if (expression) {
        var pair = walkExpr(expression, []);
        patch(pair.tail, matchstate);
        startNo = pair.start;
      }
      var ret = {
        algorithm: "rbenx",
        end: matchstate,
        states: states,
        start: startNo,
        match: rbenx_match
      }
      matchstate = states = startNo = null;
      return ret;

      function walkExpr (expr, stack) {
        var s, starts;
        var lastTail;
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

        if (typeof expr === "string") { // Inclusion
          var included = index.tripleExprs[expr];
          return walkExpr(included, stack);
        }

        else if (expr.type === "TripleConstraint") {
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

        throw Error("unexpected expr type: " + expr.type);
      };

      function State_make (c, outs, negated) {
        var ret = states.length;
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
      var known = {OneOf: [], EachOf: []};
      function dumpTripleConstraint (tc) {
        return "<" + tc.predicate + ">";
      }
      function card (obj) {
        var x = "";
        if ("min" in obj) x += obj.min;
        if ("max" in obj) x += "," + obj.max;
        return x ? "{" + x + "}" : "";
      }
      function junct (j) {
        var id = known[j.type].indexOf(j);
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

    function rbenx_match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, recurse, direct, semActHandler, checkValueExpr, trace) {
      var rbenx = this;
      var clist = [], nlist = []; // list of {state:state number, repeats:stateNo->repetitionCount}

      function localExpect (list) {
        return list.map(st => {
          var s = rbenx.states[st.state]; // simpler threads are a list of states.
          return renderAtom(s.c, s.negated);
        });
      }

      if (rbenx.states.length === 1)
        return matchedToResult([], constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr);

      var chosen = null;
      // var dump = nfaToString();
      // console.log(dump.nfa(this.states, this.start));
      addstate(rbenx, clist, this.start, {repeats:{}, avail:[], matched:[], stack:[], errors:[]});
      while (clist.length) {
        nlist = [];
        if (trace)
          trace.push({threads:[]});
        for (var threadno = 0; threadno < clist.length; ++threadno) {
          var thread = clist[threadno];
          if (thread.state === rbenx.end)
            continue;
          var state = rbenx.states[thread.state];
          var nlistlen = nlist.length;
          var constraintNo = constraintList.indexOf(state.c);
          // may be Accept!
            var min = "min" in state.c ? state.c.min : 1;
            var max = "max" in state.c ? state.c.max === UNBOUNDED ? Infinity : state.c.max : 1;
            if ("negated" in state.c && state.c.negated)
              min = max = 0;
            if (thread.avail[constraintNo] === undefined)
              thread.avail[constraintNo] = constraintToTripleMapping[constraintNo].slice();
            var taken = thread.avail[constraintNo].splice(0, max);
            if (taken.length >= min) {
              do {
                addStates(rbenx, nlist, thread, taken);
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
        var t = clist;
        clist = nlist;
        nlist = t;
        var longerChosen = clist.reduce((ret, elt) => {
          var matchedAll =
              elt.matched.reduce((ret, m) => {
                return ret + m.triples.length; // count matched triples
              }, 0) === tripleToConstraintMapping.reduce((ret, t) => {
                return t === undefined ? ret : ret + 1; // count expected
              }, 0);
          return ret !== null ? ret : (elt.state === rbenx.end && matchedAll) ? elt : null;
        }, null)
        if (longerChosen)
          chosen = longerChosen;
        // if (longerChosen !== null)
        //   console.log(JSON.stringify(matchedToResult(longerChosen.matched)));
      }
      if (chosen === null)
        return reportError();
      function reportError () { return {
        type: "Failure",
        node: node,
        errors: localExpect(clist, rbenx.states)
      } }
      function localExpect () {
        return clist.map(t => {
          var c = rbenx.states[t.state].c;
          // if (c === Match)
          //   return { type: "EndState999" };
          var valueExpr = null;
          if (typeof c.valueExpr === "string") { // ShapeRef
            valueExpr = c.valueExpr;
            if (RdfTerm.isBlank(valueExpr))
              valueExpr = schema.shapes[valueExpr];
          } else if (c.valueExpr) {
            valueExpr = extend({}, c.valueExpr)
          }
          return extend({
            type: state.c.negated ? "NegatedProperty" :
              t.state === rbenx.end ? "ExcessTripleViolation" :
              "MissingProperty",
            property: state.c.predicate
          }, valueExpr ? { valueExpr: valueExpr } : {});
        });
      }
      // console.log("chosen:", dump.thread(chosen));
      return "errors" in chosen.matched ?
        chosen.matched :
        matchedToResult(chosen.matched, constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr);
    }

    function addStates (rbenx, nlist, thread, taken) {
      var state = rbenx.states[thread.state];
      // find the exprs that require repetition
      var exprs = rbenx.states.map(x => { return x.c === Rept ? x.expr : null; });
      var newStack = state.stack.map(e => {
        var i = thread.repeats[exprs.indexOf(e.c)];
        if (i === undefined)
          i = 0; // expr has no repeats
        else
          i = i-1;
        return { c:e.c, e:e.e, i:i };
      });
      var withIndexes = {
        c: state.c,
        triples: taken,
        stack: newStack
      };
      thread.matched = thread.matched.concat(withIndexes);
      state.outs.forEach(o => { // single out if NFA includes epsilons
        addstate(rbenx, nlist, o, thread);
      });
    }

    function addstate (rbenx, list, stateNo, thread, seen) {
      seen = seen || [];
      var seenkey = stateString(stateNo, thread.repeats);
      if (seen.indexOf(seenkey) !== -1)
        return;
      seen.push(seenkey);

      var s = rbenx.states[stateNo];
      if (s.c === Split) {
        return s.outs.reduce((ret, o, idx) => {
          return ret.concat(addstate(rbenx, list, o, thread, seen));
        }, []);
        // } else if (s.c.type === "OneOf" || s.c.type === "EachOf") { // don't need Rept
      } else if (s.c === Rept) {
        var ret = [];
        // matched = [matched].concat("Rept" + s.expr);
        if (!(stateNo in thread.repeats))
          thread.repeats[stateNo] = 0;
        var repetitions = thread.repeats[stateNo];
        // add(r < s.min ? outs[0] : r >= s.min && < s.max ? outs[0], outs[1] : outs[1])
        if (repetitions < s.max)
          ret = ret.concat(addstate(rbenx, list, s.outs[0], incrmRepeat(thread, stateNo), seen)); // outs[0] to repeat
        if (repetitions >= s.min && repetitions <= s.max)
          ret = ret.concat(addstate(rbenx, list, s.outs[1], resetRepeat(thread, stateNo), seen)); // outs[1] when done
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

    function resetRepeat (thread, repeatedState) {
      var trimmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
        if (parseInt(k) !== repeatedState) // ugh, hash keys are strings
          r[k] = thread.repeats[k];
        return r;
      }, {});
      return {state:thread.state/*???*/, repeats:trimmedRepeats, matched:thread.matched, avail:thread.avail.slice(), stack:thread.stack};
    }

    function incrmRepeat (thread, repeatedState) {
      var incrmedRepeats = Object.keys(thread.repeats).reduce((r, k) => {
        r[k] = parseInt(k) == repeatedState ? thread.repeats[k] + 1 : thread.repeats[k];
        return r;
      }, {});
      return {state:thread.state/*???*/, repeats:incrmedRepeats, matched:thread.matched, avail:thread.avail.slice(), stack:thread.stack};
    }

    function stateString (state, repeats) {
      var rs = Object.keys(repeats).map(rpt => {
        return rpt+":"+repeats[rpt];
      }).join(",");
      return rs.length ? state + "-" + rs : ""+state;
    }

    function matchedToResult (matched, constraintList, neighborhood, recurse, direct, semActHandler, checkValueExpr) {
      var last = [];
      var errors = [];
      var skips = [];
      var ret = matched.reduce((out, m) => {
        var mis = 0;
        var ptr = out, t;
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
              const errors = semActHandler.dispatchAll(m.stack[mis].c.semActs, "???", ptr);
              if (errors.length)
                throw errors;
            }
            if (ret && "semActs" in expr) { ret.semActs = expr.semActs; }
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
            ptr = ptr[last[mis].e];
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
          var triple = neighborhood[tno];
          var ret = {
            type: "TestedTriple",
            subject: triple.subject,
            predicate: triple.predicate,
            object: ldify(triple.object)
          };

        function ldify (term) {
          if (term[0] !== "\"")
            return term;
          var ret = { value: RdfTerm.getLiteralValue(term) };
          var dt = RdfTerm.getLiteralType(term);
          if (dt &&
              dt !== "http://www.w3.org/2001/XMLSchema#string" &&
              dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
            ret.type = dt;
          var lang = RdfTerm.getLiteralLanguage(term)
          if (lang)
            ret.language = lang;
          return ret;
        }
          function diver (focus, shape, dive) {
            var sub = dive(focus, shape);
            if ("errors" in sub) {
              // console.dir(sub);
              var err = {
                type: "ReferenceError", focus: focus,
                shape: shape, errors: sub
              };
              if (typeof shapeLabel === "string" && RdfTerm.isBlank(shapeLabel))
                err.referencedShape = shape;
              return [err];
            }
            if (("solution" in sub || "solutions" in sub) && Object.keys(sub.solution || sub.solutions).length !== 0 ||
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
          if ("valueExpr" in ptr)
            errors = errors.concat(checkValueExpr(ptr.inverse ? triple.subject : triple.object, ptr.valueExpr, diveRecurse, diveDirect));

          if (errors.length === 0 && "semActs" in m.c)
            [].push.apply(errors, semActHandler.dispatchAll(m.c.semActs, triple, ret));
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
        for (var exprNo = 0; exprNo < skip.length; ++exprNo)
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
  for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
    for (var name in arg)
      base[name] = arg[name];
  return base;
}

// ## Exports

return exports = {
  name: "nfax-val-1err",
  description: "simple regular expression engine with n out states",
  compile: compileNFA
};

})();

if (true)
  module.exports = NFAXVal1Err;


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

var ShExApi = function (config) {

  var ShEx = __webpack_require__(11);
  var ShExUtil = ShEx.Util;
  var ShExParser = __webpack_require__(26);

  const api = { load: LoadPromise, loadExtensions: LoadExtensions, GET: GET, loadShExImports_NotUsed: loadShExImports_NotUsed };
  return api
  
  async function GET (url, mediaType) {
    var m;
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
      var meta = addMeta(obj.url, mediaType)
      try {
        ShExUtil.merge(target, obj.schema, true, true)
        meta._prefixes = target._prefixes || {}
        meta.base = target._base
        loadImports(obj.schema)
        return [mediaType, obj.url]
      } catch (e) {
        var e2 = Error("error merging schema object " + obj.schema + ": " + e)
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
      var meta = {
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
    var returns = {
      schema: ShExUtil.emptySchema(),
      data: new config.rdfjs.Store(),
      schemaMeta: [],
      dataMeta: []
    }
    var promises = []
    var schemasSeen = shex.concat(json).map(p => {
      // might be already loaded objects with a url property.
      return typeof p === "object" ? p.url : p
    })
    var transform = null
    if (schemaOptions && "iriTransform" in schemaOptions) {
      transform = schemaOptions.iriTransform
      delete schemaOptions.iriTransform
    }

    var allLoaded = DynamicPromise()
    function loadImports (schema) {
      if (!("imports" in schema))
        return schema
      if (schemaOptions.keepImports) {
        return schema
      }
      var ret = Object.assign({}, schema)
      var imports = ret.imports
      delete ret.imports
      schema.imports.map(function (i) {
        return transform ? transform(i) : i
      }).filter(function (i) {
        return schemasSeen.indexOf(i) === -1
      }).map(i => {
        schemasSeen.push(i)
        allLoaded.add(api.GET(i).then(function (loaded) {
          var meta = {
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
    // If there's a termResolver,
    if (schemaOptions && "termResolver" in schemaOptions) {
      returns.resolver = new config.rdfjs.Store()
      returns.resolverMeta = []
      // load the resolver then the schema sources,
      promises = [Promise.all(loadList(schemaOptions.termResolver, returns.resolverMeta, "text/turtle",
                                       parseTurtle, returns.resolver, dataOptions)).
                  then(function (x) {
                    return Promise.all(loadList(shex, returns.schemaMeta, "text/shex",
                                                parseShExC, returns.schema, schemaOptions, loadImports))
                  })]
      schemaOptions.termResolver = ShExParser.dbTermResolver(returns.resolver)
    } else {
      // else just load the schema sources.
      promises = loadList(shex, returns.schemaMeta, "text/shex",
                          parseShExC, returns.schema, schemaOptions, loadImports)
    }
    promises = promises.
      concat(loadList(json, returns.schemaMeta, "text/json",
                      parseShExJ, returns.schema, schemaOptions, loadImports)).
      concat(loadList(turtle, returns.dataMeta, "text/turtle",
                      parseTurtle, returns.data, dataOptions)).
      concat(loadList(jsonld, returns.dataMeta, "application/ld+json",
                      parseJSONLD, returns.data, dataOptions))
    return allLoaded.all(promises).then(function (resources) {
      if (returns.schemaMeta.length > 0)
        ShExUtil.isWellDefined(returns.schema)
      return returns
    })
  }

  function DynamicPromise () {
    var promises = []
    var results = []
    var completedPromises = 0
    var resolveSelf, rejectSelf
    var self = new Promise(function (resolve, reject) {
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
    var parser = schemaOptions && "parser" in schemaOptions ?
        schemaOptions.parser :
        ShExParser.construct(url, {}, schemaOptions)
    try {
      var s = parser.parse(text)
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
    var schemasSeen = [from]
    var ret = { type: "Schema" }
    return api.GET(from).then(load999Imports).then(function () {
      ShExUtil.isWellDefined(ret)
      return ret
    })
    function load999Imports (loaded) {
      var schema = parser.parse(loaded.text)
      var imports = schema.imports
      delete schema.imports
      ShExUtil.merge(ret, schema, false, true)
      if (imports) {
        var rest = imports
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
      var s = ShExUtil.ShExJtoAS(JSON.parse(text))
      ShExUtil.merge(schema, s, true, true)
      meta.prefixes = schema._prefixes
      meta.base = schema.base
      loadImports(s)
      return Promise.resolve([mediaType, url])
    } catch (e) {
      var e2 = Error("error parsing JSON " + url + ": " + e)
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
      var p = new config.rdfjs.Parser({baseIRI: url, blankNodePrefix: "", format: "text/turtle"})
      var triples = p.parse(text)
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
      var struct = JSON.parse(text)
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
        list.concat(__webpack_require__(27).glob.sync(glob))
      , []).
      reduce(function (ret, path) {
        try {
	  var t = __webpack_require__(65)(path)
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
  module.exports = ShExApi


/***/ }),
/* 56 */
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
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[7,19,20,21,22,24,25,32,195,217,218],$V1=[1,27],$V2=[1,31],$V3=[1,26],$V4=[1,30],$V5=[1,29],$V6=[2,12],$V7=[2,13],$V8=[2,14],$V9=[2,15],$Va=[7,19,20,21,22,24,25,32,217,218],$Vb=[1,37],$Vc=[1,40],$Vd=[1,39],$Ve=[2,24],$Vf=[2,25],$Vg=[20,22,28,71,73,87,98,99,100,103,104,105,106,114,115,116,117,118,119,121,127,129,166,190,217,221],$Vh=[2,63],$Vi=[1,52],$Vj=[1,53],$Vk=[1,54],$Vl=[20,22,28,41,45,71,73,81,82,83,87,98,99,100,103,104,105,106,114,115,116,117,118,119,121,127,129,166,190,217,221],$Vm=[2,241],$Vn=[2,242],$Vo=[1,56],$Vp=[1,59],$Vq=[1,58],$Vr=[2,263],$Vs=[2,264],$Vt=[2,271],$Vu=[2,265],$Vv=[2,266],$Vw=[2,16],$Vx=[2,18],$Vy=[2,19],$Vz=[2,22],$VA=[20,22,29,217],$VB=[2,20],$VC=[20,22,28,71,73,81,82,83,87,98,99,100,103,104,105,106,114,115,116,117,118,119,121,127,129,166,190,217,221],$VD=[1,80],$VE=[2,32],$VF=[2,33],$VG=[2,34],$VH=[121,127,129,190,221],$VI=[2,141],$VJ=[1,106],$VK=[1,108],$VL=[1,102],$VM=[1,92],$VN=[1,97],$VO=[1,98],$VP=[1,99],$VQ=[1,105],$VR=[1,112],$VS=[1,113],$VT=[1,114],$VU=[1,115],$VV=[1,116],$VW=[1,117],$VX=[1,118],$VY=[1,119],$VZ=[1,120],$V_=[1,109],$V$=[1,107],$V01=[2,64],$V11=[1,122],$V21=[1,123],$V31=[1,124],$V41=[1,130],$V51=[1,131],$V61=[53,55],$V71=[2,93],$V81=[2,94],$V91=[195,197],$Va1=[1,146],$Vb1=[1,149],$Vc1=[1,148],$Vd1=[2,17],$Ve1=[1,162],$Vf1=[1,165],$Vg1=[1,164],$Vh1=[7,19,20,21,22,24,25,32,53,217,218],$Vi1=[2,49],$Vj1=[7,19,20,21,22,24,25,32,53,55,217,218],$Vk1=[2,56],$Vl1=[2,38],$Vm1=[2,71],$Vn1=[2,76],$Vo1=[2,73],$Vp1=[1,192],$Vq1=[1,193],$Vr1=[1,194],$Vs1=[1,197],$Vt1=[1,200],$Vu1=[2,79],$Vv1=[7,19,20,21,22,24,25,32,53,55,81,82,83,121,127,129,190,191,195,217,218,221],$Vw1=[2,97],$Vx1=[7,19,20,21,22,24,25,32,53,55,191,195,217,218],$Vy1=[7,19,20,21,22,24,25,32,53,55,98,99,100,103,104,105,106,191,195,217,218],$Vz1=[7,19,20,21,22,24,25,32,53,55,81,82,83,103,104,105,106,121,127,129,190,191,195,217,218,221],$VA1=[2,110],$VB1=[2,109],$VC1=[7,19,20,21,22,24,25,32,53,55,103,104,105,106,114,115,116,117,118,119,191,195,217,218],$VD1=[2,104],$VE1=[2,103],$VF1=[1,215],$VG1=[1,217],$VH1=[1,219],$VI1=[1,218],$VJ1=[2,114],$VK1=[2,115],$VL1=[2,116],$VM1=[2,112],$VN1=[2,240],$VO1=[20,22,29,73,83,102,110,111,166,186,206,207,208,209,210,211,212,213,214,215,217],$VP1=[2,185],$VQ1=[7,19,20,21,22,24,25,32,53,55,114,115,116,117,118,119,191,195,217,218],$VR1=[2,106],$VS1=[2,120],$VT1=[2,267],$VU1=[2,268],$VV1=[2,269],$VW1=[2,270],$VX1=[1,227],$VY1=[1,228],$VZ1=[1,229],$V_1=[1,230],$V$1=[102,110,111,208,209,210,211],$V02=[2,37],$V12=[2,41],$V22=[2,44],$V32=[2,47],$V42=[2,95],$V52=[2,232],$V62=[2,233],$V72=[2,234],$V82=[1,279],$V92=[1,281],$Va2=[1,275],$Vb2=[1,265],$Vc2=[1,270],$Vd2=[1,271],$Ve2=[1,272],$Vf2=[1,278],$Vg2=[1,282],$Vh2=[1,280],$Vi2=[1,286],$Vj2=[1,287],$Vk2=[1,288],$Vl2=[1,294],$Vm2=[1,295],$Vn2=[2,23],$Vo2=[2,26],$Vp2=[2,55],$Vq2=[2,62],$Vr2=[2,67],$Vs2=[2,70],$Vt2=[7,19,20,21,22,24,25,32,53,55,98,99,100,103,104,105,106,217,218],$Vu2=[2,89],$Vv2=[2,90],$Vw2=[2,35],$Vx2=[2,39],$Vy2=[2,75],$Vz2=[2,72],$VA2=[2,77],$VB2=[2,74],$VC2=[7,19,20,21,22,24,25,32,53,55,103,104,105,106,191,195,217,218],$VD2=[1,340],$VE2=[1,348],$VF2=[1,349],$VG2=[1,350],$VH2=[1,356],$VI2=[1,357],$VJ2=[7,19,20,21,22,24,25,32,53,55,81,82,83,121,127,129,190,195,217,218,221],$VK2=[2,230],$VL2=[7,19,20,21,22,24,25,32,53,55,195,217,218],$VM2=[1,365],$VN2=[7,19,20,21,22,24,25,32,53,55,98,99,100,103,104,105,106,195,217,218],$VO2=[2,108],$VP2=[2,113],$VQ2=[2,100],$VR2=[1,375],$VS2=[2,101],$VT2=[2,102],$VU2=[2,107],$VV2=[20,22,71,162,166,201,217],$VW2=[2,169],$VX2=[2,143],$VY2=[1,390],$VZ2=[1,389],$V_2=[1,395],$V$2=[1,399],$V03=[1,398],$V13=[1,397],$V23=[1,404],$V33=[1,406],$V43=[1,407],$V53=[1,403],$V63=[1,405],$V73=[20,22,217,218],$V83=[1,419],$V93=[1,425],$Va3=[1,414],$Vb3=[1,418],$Vc3=[1,428],$Vd3=[1,429],$Ve3=[1,430],$Vf3=[1,411],$Vg3=[1,417],$Vh3=[1,431],$Vi3=[1,432],$Vj3=[1,437],$Vk3=[1,438],$Vl3=[1,439],$Vm3=[1,440],$Vn3=[1,433],$Vo3=[1,434],$Vp3=[1,435],$Vq3=[1,436],$Vr3=[1,424],$Vs3=[2,119],$Vt3=[2,124],$Vu3=[2,126],$Vv3=[2,127],$Vw3=[2,128],$Vx3=[2,255],$Vy3=[2,256],$Vz3=[2,257],$VA3=[2,258],$VB3=[2,125],$VC3=[2,36],$VD3=[2,45],$VE3=[2,42],$VF3=[2,48],$VG3=[2,43],$VH3=[1,472],$VI3=[2,46],$VJ3=[1,508],$VK3=[1,542],$VL3=[1,543],$VM3=[1,544],$VN3=[1,547],$VO3=[2,50],$VP3=[2,57],$VQ3=[2,66],$VR3=[2,68],$VS3=[2,78],$VT3=[53,55,72],$VU3=[1,607],$VV3=[53,55,72,81,82,83,121,127,129,190,191,195,221],$VW3=[53,55,72,191,195],$VX3=[53,55,72,98,99,100,103,104,105,106,191,195],$VY3=[53,55,72,81,82,83,103,104,105,106,121,127,129,190,191,195,221],$VZ3=[53,55,72,103,104,105,106,114,115,116,117,118,119,191,195],$V_3=[53,55,72,114,115,116,117,118,119,191,195],$V$3=[53,72],$V04=[7,19,20,21,22,24,25,32,53,55,81,82,83,121,127,129,190,217,218,221],$V14=[2,99],$V24=[2,98],$V34=[2,229],$V44=[1,649],$V54=[1,651],$V64=[1,652],$V74=[1,648],$V84=[1,650],$V94=[2,96],$Va4=[2,136],$Vb4=[2,111],$Vc4=[2,105],$Vd4=[2,117],$Ve4=[2,118],$Vf4=[2,148],$Vg4=[2,149],$Vh4=[1,669],$Vi4=[2,150],$Vj4=[123,137],$Vk4=[2,155],$Vl4=[2,156],$Vm4=[2,158],$Vn4=[1,672],$Vo4=[1,673],$Vp4=[20,22,166,201,217],$Vq4=[2,177],$Vr4=[1,681],$Vs4=[123,137,142,143],$Vt4=[2,167],$Vu4=[20,22,121,127,129,190,217,218,221],$Vv4=[20,22,121,127,129,166,190,201,217,221],$Vw4=[2,238],$Vx4=[2,239],$Vy4=[2,184],$Vz4=[1,716],$VA4=[20,22,29,73,83,102,110,111,166,179,186,206,207,208,209,210,211,212,213,214,215,217],$VB4=[2,235],$VC4=[2,236],$VD4=[2,237],$VE4=[2,248],$VF4=[2,251],$VG4=[2,245],$VH4=[2,246],$VI4=[2,247],$VJ4=[2,253],$VK4=[2,254],$VL4=[2,259],$VM4=[2,260],$VN4=[2,261],$VO4=[2,262],$VP4=[20,22,29,73,83,102,110,111,113,166,179,186,206,207,208,209,210,211,212,213,214,215,217],$VQ4=[1,748],$VR4=[1,795],$VS4=[1,850],$VT4=[1,860],$VU4=[1,896],$VV4=[1,932],$VW4=[2,69],$VX4=[53,55,72,103,104,105,106,191,195],$VY4=[53,55,72,81,82,83,121,127,129,190,195,221],$VZ4=[53,55,72,195],$V_4=[1,954],$V$4=[53,55,72,98,99,100,103,104,105,106,195],$V05=[1,964],$V15=[1,1001],$V25=[1,1037],$V35=[2,231],$V45=[1,1048],$V55=[1,1050],$V65=[1,1051],$V75=[1,1049],$V85=[20,22,102,110,111,166,206,207,208,209,210,211,212,213,214,215,217],$V95=[1,1074],$Va5=[1,1076],$Vb5=[1,1077],$Vc5=[1,1075],$Vd5=[1,1100],$Ve5=[1,1102],$Vf5=[1,1103],$Vg5=[1,1101],$Vh5=[2,137],$Vi5=[2,151],$Vj5=[2,153],$Vk5=[2,157],$Vl5=[2,159],$Vm5=[2,160],$Vn5=[2,164],$Vo5=[2,166],$Vp5=[2,171],$Vq5=[2,172],$Vr5=[1,1132],$Vs5=[1,1134],$Vt5=[1,1135],$Vu5=[1,1131],$Vv5=[1,1133],$Vw5=[1,1145],$Vx5=[2,225],$Vy5=[2,243],$Vz5=[2,244],$VA5=[1,1147],$VB5=[1,1149],$VC5=[1,1151],$VD5=[20,22,29,73,83,102,110,111,166,180,186,206,207,208,209,210,211,212,213,214,215,217],$VE5=[1,1155],$VF5=[1,1161],$VG5=[1,1164],$VH5=[1,1165],$VI5=[1,1166],$VJ5=[1,1154],$VK5=[1,1167],$VL5=[1,1168],$VM5=[1,1173],$VN5=[1,1174],$VO5=[1,1175],$VP5=[1,1176],$VQ5=[1,1169],$VR5=[1,1170],$VS5=[1,1171],$VT5=[1,1172],$VU5=[1,1160],$VV5=[2,249],$VW5=[2,252],$VX5=[2,129],$VY5=[1,1210],$VZ5=[1,1216],$V_5=[1,1248],$V$5=[1,1254],$V06=[1,1313],$V16=[1,1360],$V26=[53,55,72,81,82,83,121,127,129,190,221],$V36=[53,55,72,98,99,100,103,104,105,106],$V46=[1,1436],$V56=[1,1483],$V66=[2,226],$V76=[2,227],$V86=[2,228],$V96=[7,19,20,21,22,24,25,32,53,55,81,82,83,113,121,127,129,190,191,195,217,218,221],$Va6=[7,19,20,21,22,24,25,32,53,55,113,191,195,217,218],$Vb6=[7,19,20,21,22,24,25,32,53,55,98,99,100,103,104,105,106,113,191,195,217,218],$Vc6=[2,154],$Vd6=[2,152],$Ve6=[2,161],$Vf6=[2,165],$Vg6=[2,162],$Vh6=[2,163],$Vi6=[20,22,28,45,71,73,81,82,83,87,98,99,100,103,104,105,106,114,115,116,117,118,119,121,127,129,166,190,217,221],$Vj6=[1,1543],$Vk6=[72,137],$Vl6=[1,1546],$Vm6=[1,1547],$Vn6=[72,137,142,143],$Vo6=[2,208],$Vp6=[1,1563],$Vq6=[20,22,29,73,83,102,110,111,166,179,180,186,206,207,208,209,210,211,212,213,214,215,217],$Vr6=[20,22,29,73,83,102,110,111,113,166,179,180,186,206,207,208,209,210,211,212,213,214,215,217],$Vs6=[2,250],$Vt6=[1,1601],$Vu6=[1,1667],$Vv6=[1,1669],$Vw6=[1,1670],$Vx6=[1,1668],$Vy6=[1,1693],$Vz6=[1,1695],$VA6=[1,1696],$VB6=[1,1694],$VC6=[1,1719],$VD6=[1,1721],$VE6=[1,1722],$VF6=[1,1720],$VG6=[1,1766],$VH6=[1,1772],$VI6=[1,1804],$VJ6=[1,1810],$VK6=[1,1825],$VL6=[1,1827],$VM6=[1,1828],$VN6=[1,1826],$VO6=[1,1851],$VP6=[1,1853],$VQ6=[1,1854],$VR6=[1,1852],$VS6=[1,1877],$VT6=[1,1879],$VU6=[1,1880],$VV6=[1,1878],$VW6=[1,1924],$VX6=[1,1930],$VY6=[1,1962],$VZ6=[1,1968],$V_6=[123,137,142,143,191,195],$V$6=[2,174],$V07=[1,1986],$V17=[1,1987],$V27=[1,1988],$V37=[1,1989],$V47=[123,137,142,143,158,159,160,161,191,195],$V57=[2,40],$V67=[53,123,137,142,143,158,159,160,161,191,195],$V77=[2,53],$V87=[53,55,123,137,142,143,158,159,160,161,191,195],$V97=[2,60],$Va7=[1,2018],$Vb7=[1,2059],$Vc7=[1,2092],$Vd7=[1,2094],$Ve7=[1,2095],$Vf7=[1,2093],$Vg7=[1,2118],$Vh7=[1,2120],$Vi7=[1,2121],$Vj7=[1,2119],$Vk7=[1,2145],$Vl7=[1,2147],$Vm7=[1,2148],$Vn7=[1,2146],$Vo7=[1,2172],$Vp7=[1,2174],$Vq7=[1,2175],$Vr7=[1,2173],$Vs7=[1,2198],$Vt7=[1,2200],$Vu7=[1,2201],$Vv7=[1,2199],$Vw7=[1,2225],$Vx7=[1,2227],$Vy7=[1,2228],$Vz7=[1,2226],$VA7=[1,2300],$VB7=[53,55,72,81,82,83,113,121,127,129,190,191,195,221],$VC7=[53,55,72,113,191,195],$VD7=[53,55,72,98,99,100,103,104,105,106,113,191,195],$VE7=[1,2414],$VF7=[2,175],$VG7=[2,179],$VH7=[2,180],$VI7=[2,181],$VJ7=[2,182],$VK7=[2,51],$VL7=[2,58],$VM7=[2,65],$VN7=[2,85],$VO7=[2,81],$VP7=[2,87],$VQ7=[1,2497],$VR7=[2,84],$VS7=[53,55,81,82,83,103,104,105,106,121,123,127,129,137,142,143,158,159,160,161,190,191,195,221],$VT7=[53,55,81,82,83,121,123,127,129,137,142,143,158,159,160,161,190,191,195,221],$VU7=[53,55,103,104,105,106,114,115,116,117,118,119,123,137,142,143,158,159,160,161,191,195],$VV7=[53,55,98,99,100,103,104,105,106,123,137,142,143,158,159,160,161,191,195],$VW7=[2,91],$VX7=[2,92],$VY7=[53,55,114,115,116,117,118,119,123,137,142,143,158,159,160,161,191,195],$VZ7=[1,2551],$V_7=[1,2557],$V$7=[1,2640],$V08=[1,2673],$V18=[1,2675],$V28=[1,2676],$V38=[1,2674],$V48=[1,2699],$V58=[1,2701],$V68=[1,2702],$V78=[1,2700],$V88=[1,2726],$V98=[1,2728],$Va8=[1,2729],$Vb8=[1,2727],$Vc8=[1,2753],$Vd8=[1,2755],$Ve8=[1,2756],$Vf8=[1,2754],$Vg8=[1,2779],$Vh8=[1,2781],$Vi8=[1,2782],$Vj8=[1,2780],$Vk8=[1,2806],$Vl8=[1,2808],$Vm8=[1,2809],$Vn8=[1,2807],$Vo8=[1,2853],$Vp8=[1,2886],$Vq8=[1,2888],$Vr8=[1,2889],$Vs8=[1,2887],$Vt8=[1,2912],$Vu8=[1,2914],$Vv8=[1,2915],$Vw8=[1,2913],$Vx8=[1,2939],$Vy8=[1,2941],$Vz8=[1,2942],$VA8=[1,2940],$VB8=[1,2966],$VC8=[1,2968],$VD8=[1,2969],$VE8=[1,2967],$VF8=[1,2992],$VG8=[1,2994],$VH8=[1,2995],$VI8=[1,2993],$VJ8=[1,3019],$VK8=[1,3021],$VL8=[1,3022],$VM8=[1,3020],$VN8=[123,137,142,143,195],$VO8=[1,3044],$VP8=[2,54],$VQ8=[2,61],$VR8=[2,80],$VS8=[2,86],$VT8=[2,82],$VU8=[2,88],$VV8=[53,55,103,104,105,106,123,137,142,143,158,159,160,161,191,195],$VW8=[1,3068],$VX8=[72,137,142,143,191,195],$VY8=[1,3077],$VZ8=[1,3078],$V_8=[1,3079],$V$8=[1,3080],$V09=[72,137,142,143,158,159,160,161,191,195],$V19=[53,72,137,142,143,158,159,160,161,191,195],$V29=[53,55,72,137,142,143,158,159,160,161,191,195],$V39=[1,3109],$V49=[1,3178],$V59=[1,3184],$V69=[1,3264],$V79=[1,3270],$V89=[2,176],$V99=[2,52],$Va9=[1,3358],$Vb9=[2,59],$Vc9=[1,3391],$Vd9=[2,83],$Ve9=[2,173],$Vf9=[1,3436],$Vg9=[53,55,72,81,82,83,103,104,105,106,121,127,129,137,142,143,158,159,160,161,190,191,195,221],$Vh9=[53,55,72,81,82,83,121,127,129,137,142,143,158,159,160,161,190,191,195,221],$Vi9=[53,55,72,103,104,105,106,114,115,116,117,118,119,137,142,143,158,159,160,161,191,195],$Vj9=[53,55,72,98,99,100,103,104,105,106,137,142,143,158,159,160,161,191,195],$Vk9=[53,55,72,114,115,116,117,118,119,137,142,143,158,159,160,161,191,195],$Vl9=[1,3467],$Vm9=[1,3469],$Vn9=[1,3470],$Vo9=[1,3468],$Vp9=[1,3493],$Vq9=[1,3495],$Vr9=[1,3496],$Vs9=[1,3494],$Vt9=[1,3520],$Vu9=[1,3522],$Vv9=[1,3523],$Vw9=[1,3521],$Vx9=[1,3624],$Vy9=[1,3626],$Vz9=[1,3627],$VA9=[1,3625],$VB9=[1,3665],$VC9=[1,3707],$VD9=[72,137,142,143,195],$VE9=[1,3737],$VF9=[53,55,72,103,104,105,106,137,142,143,158,159,160,161,191,195],$VG9=[1,3761],$VH9=[1,3797],$VI9=[1,3799],$VJ9=[1,3800],$VK9=[1,3798],$VL9=[1,3823],$VM9=[1,3825],$VN9=[1,3826],$VO9=[1,3824],$VP9=[1,3850],$VQ9=[1,3852],$VR9=[1,3853],$VS9=[1,3851],$VT9=[1,3877],$VU9=[1,3879],$VV9=[1,3880],$VW9=[1,3878],$VX9=[1,3903],$VY9=[1,3905],$VZ9=[1,3906],$V_9=[1,3904],$V$9=[1,3930],$V0a=[1,3932],$V1a=[1,3933],$V2a=[1,3931],$V3a=[113,123,137,142,143,191,195],$V4a=[1,3978],$V5a=[1,4002],$V6a=[1,4044],$V7a=[1,4077],$V8a=[1,4182],$V9a=[1,4225],$Vaa=[1,4227],$Vba=[1,4228],$Vca=[1,4226],$Vda=[1,4266],$Vea=[1,4308],$Vfa=[1,4364],$Vga=[72,113,137,142,143,191,195],$Vha=[1,4419],$Via=[1,4443],$Vja=[1,4473],$Vka=[1,4519],$Vla=[1,4591],$Vma=[1,4640];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"labelDecl":18,"IT_BASE":19,"IRIREF":20,"IT_PREFIX":21,"PNAME_NS":22,"iri":23,"IT_IMPORT":24,"IT_LABEL":25,"O_Qiri_E_Or_QGT_LBRACKET_E_S_Qiri_E_Star_S_QGT_RBRACKET_E_C":26,"Qiri_E_Star":27,"[":28,"]":29,"start":30,"shapeExprDecl":31,"IT_start":32,"=":33,"shapeAnd":34,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":35,"QcodeDecl_E_Plus":36,"codeDecl":37,"shapeExprLabel":38,"O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C":39,"shapeExpression":40,"IT_EXTERNAL":41,"QIT_NOT_E_Opt":42,"shapeAtomNoRef":43,"QshapeOr_E_Opt":44,"IT_NOT":45,"shapeRef":46,"shapeOr":47,"inlineShapeExpression":48,"inlineShapeOr":49,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":50,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":51,"O_QIT_OR_E_S_QshapeAnd_E_C":52,"IT_OR":53,"O_QIT_AND_E_S_QshapeNot_E_C":54,"IT_AND":55,"shapeNot":56,"inlineShapeAnd":57,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":58,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":59,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":60,"inlineShapeNot":61,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":62,"O_QIT_AND_E_S_QinlineShapeNot_E_C":63,"shapeAtom":64,"inlineShapeAtom":65,"nonLitNodeConstraint":66,"QshapeOrRef_E_Opt":67,"litNodeConstraint":68,"shapeOrRef":69,"QnonLitNodeConstraint_E_Opt":70,"(":71,")":72,".":73,"shapeDefinition":74,"nonLitInlineNodeConstraint":75,"QinlineShapeOrRef_E_Opt":76,"litInlineNodeConstraint":77,"inlineShapeOrRef":78,"QnonLitInlineNodeConstraint_E_Opt":79,"inlineShapeDefinition":80,"ATPNAME_LN":81,"ATPNAME_NS":82,"@":83,"Qannotation_E_Star":84,"semanticActions":85,"annotation":86,"IT_LITERAL":87,"QxsFacet_E_Star":88,"datatype":89,"valueSet":90,"QnumericFacet_E_Plus":91,"xsFacet":92,"numericFacet":93,"nonLiteralKind":94,"QstringFacet_E_Star":95,"QstringFacet_E_Plus":96,"stringFacet":97,"IT_IRI":98,"IT_BNODE":99,"IT_NONLITERAL":100,"stringLength":101,"INTEGER":102,"REGEXP":103,"IT_LENGTH":104,"IT_MINLENGTH":105,"IT_MAXLENGTH":106,"numericRange":107,"rawNumeric":108,"numericLength":109,"DECIMAL":110,"DOUBLE":111,"string":112,"^^":113,"IT_MININCLUSIVE":114,"IT_MINEXCLUSIVE":115,"IT_MAXINCLUSIVE":116,"IT_MAXEXCLUSIVE":117,"IT_TOTALDIGITS":118,"IT_FRACTIONDIGITS":119,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":120,"{":121,"QtripleExpression_E_Opt":122,"}":123,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":124,"extension":125,"extraPropertySet":126,"IT_CLOSED":127,"tripleExpression":128,"IT_EXTRA":129,"Qpredicate_E_Plus":130,"predicate":131,"oneOfTripleExpr":132,"groupTripleExpr":133,"multiElementOneOf":134,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":135,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":136,"|":137,"singleElementGroup":138,"multiElementGroup":139,"unaryTripleExpr":140,"QGT_SEMI_E_Opt":141,",":142,";":143,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":144,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":145,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":146,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":147,"include":148,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":149,"$":150,"tripleExprLabel":151,"tripleConstraint":152,"bracketedTripleExpr":153,"Qcardinality_E_Opt":154,"cardinality":155,"QsenseFlags_E_Opt":156,"senseFlags":157,"*":158,"+":159,"?":160,"REPEAT_RANGE":161,"^":162,"QvalueSetValue_E_Star":163,"valueSetValue":164,"iriRange":165,"STRING_GRAVE":166,"literalRange":167,"languageRange":168,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":169,"QiriExclusion_E_Plus":170,"iriExclusion":171,"QliteralExclusion_E_Plus":172,"literalExclusion":173,"QlanguageExclusion_E_Plus":174,"languageExclusion":175,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":176,"QiriExclusion_E_Star":177,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":178,"~":179,"-":180,"QGT_TILDE_E_Opt":181,"literal":182,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":183,"QliteralExclusion_E_Star":184,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":185,"LANGTAG":186,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":187,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":188,"QlanguageExclusion_E_Star":189,"&":190,"//":191,"O_QiriOrLabel_E_Or_Qliteral_E_C":192,"iriOrLabel":193,"QcodeDecl_E_Star":194,"%":195,"O_QCODE_E_Or_QGT_MODULO_E_C":196,"CODE":197,"rdfLiteral":198,"numericLiteral":199,"booleanLiteral":200,"a":201,"blankNode":202,"langString":203,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":204,"O_QGT_DTYPE_E_S_Qdatatype_E_C":205,"IT_true":206,"IT_false":207,"STRING_LITERAL1":208,"STRING_LITERAL_LONG1":209,"STRING_LITERAL2":210,"STRING_LITERAL_LONG2":211,"LANG_STRING_LITERAL1":212,"LANG_STRING_LITERAL_LONG1":213,"LANG_STRING_LITERAL2":214,"LANG_STRING_LITERAL_LONG2":215,"prefixedName":216,"PNAME_LN":217,"BLANK_NODE_LABEL":218,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":219,"QshapeExprLabel_E_Plus":220,"IT_EXTENDS":221,"$accept":0,"$end":1},
terminals_: {2:"error",7:"EOF",19:"IT_BASE",20:"IRIREF",21:"IT_PREFIX",22:"PNAME_NS",24:"IT_IMPORT",25:"IT_LABEL",28:"[",29:"]",32:"IT_start",33:"=",41:"IT_EXTERNAL",45:"IT_NOT",53:"IT_OR",55:"IT_AND",71:"(",72:")",73:".",81:"ATPNAME_LN",82:"ATPNAME_NS",83:"@",87:"IT_LITERAL",98:"IT_IRI",99:"IT_BNODE",100:"IT_NONLITERAL",102:"INTEGER",103:"REGEXP",104:"IT_LENGTH",105:"IT_MINLENGTH",106:"IT_MAXLENGTH",110:"DECIMAL",111:"DOUBLE",113:"^^",114:"IT_MININCLUSIVE",115:"IT_MINEXCLUSIVE",116:"IT_MAXINCLUSIVE",117:"IT_MAXEXCLUSIVE",118:"IT_TOTALDIGITS",119:"IT_FRACTIONDIGITS",121:"{",123:"}",127:"IT_CLOSED",129:"IT_EXTRA",137:"|",142:",",143:";",150:"$",158:"*",159:"+",160:"?",161:"REPEAT_RANGE",162:"^",166:"STRING_GRAVE",179:"~",180:"-",186:"LANGTAG",190:"&",191:"//",195:"%",197:"CODE",201:"a",206:"IT_true",207:"IT_false",208:"STRING_LITERAL1",209:"STRING_LITERAL_LONG1",210:"STRING_LITERAL2",211:"STRING_LITERAL_LONG2",212:"LANG_STRING_LITERAL1",213:"LANG_STRING_LITERAL_LONG1",214:"LANG_STRING_LITERAL2",215:"LANG_STRING_LITERAL_LONG2",217:"PNAME_LN",218:"BLANK_NODE_LABEL",221:"IT_EXTENDS"},
productions_: [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[18,2],[27,0],[27,2],[26,1],[26,3],[10,1],[10,1],[30,4],[11,1],[36,1],[36,2],[13,1],[13,1],[31,2],[39,1],[39,1],[40,3],[40,3],[40,2],[44,0],[44,1],[48,1],[47,1],[47,2],[52,2],[50,1],[50,2],[54,2],[51,1],[51,2],[35,0],[35,2],[49,2],[59,2],[58,0],[58,2],[34,2],[60,0],[60,2],[57,2],[63,2],[62,0],[62,2],[56,2],[42,0],[42,1],[61,2],[64,2],[64,1],[64,2],[64,3],[64,1],[67,0],[67,1],[70,0],[70,1],[43,2],[43,1],[43,2],[43,3],[43,1],[65,2],[65,1],[65,2],[65,3],[65,1],[76,0],[76,1],[79,0],[79,1],[69,1],[69,1],[78,1],[78,1],[46,1],[46,1],[46,2],[68,3],[84,0],[84,2],[66,3],[77,2],[77,2],[77,2],[77,1],[88,0],[88,2],[91,1],[91,2],[75,2],[75,1],[95,0],[95,2],[96,1],[96,2],[94,1],[94,1],[94,1],[92,1],[92,1],[97,2],[97,1],[101,1],[101,1],[101,1],[93,2],[93,2],[108,1],[108,1],[108,1],[108,3],[107,1],[107,1],[107,1],[107,1],[109,1],[109,1],[74,3],[80,4],[124,1],[124,1],[124,1],[120,0],[120,2],[122,0],[122,1],[126,2],[130,1],[130,2],[128,1],[132,1],[132,1],[134,2],[136,2],[135,1],[135,2],[133,1],[133,1],[138,2],[141,0],[141,1],[141,1],[139,3],[145,2],[145,2],[144,1],[144,2],[140,2],[140,1],[149,2],[146,0],[146,1],[147,1],[147,1],[153,6],[154,0],[154,1],[152,6],[156,0],[156,1],[155,1],[155,1],[155,1],[155,1],[157,1],[90,3],[163,0],[163,2],[164,1],[164,1],[164,1],[164,1],[164,2],[170,1],[170,2],[172,1],[172,2],[174,1],[174,2],[169,1],[169,1],[169,1],[165,2],[177,0],[177,2],[178,2],[176,0],[176,1],[171,3],[181,0],[181,1],[167,2],[184,0],[184,2],[185,2],[183,0],[183,1],[173,3],[168,2],[168,2],[189,0],[189,2],[188,2],[187,0],[187,1],[175,3],[148,2],[86,3],[192,1],[192,1],[85,1],[194,0],[194,2],[37,3],[196,1],[196,1],[182,1],[182,1],[182,1],[131,1],[131,1],[89,1],[38,1],[38,1],[151,1],[151,1],[199,1],[199,1],[199,1],[198,1],[198,2],[205,2],[204,0],[204,1],[200,1],[200,1],[112,1],[112,1],[112,1],[112,1],[203,1],[203,1],[203,1],[203,1],[23,1],[23,1],[216,1],[216,1],[193,1],[193,1],[193,1],[193,1],[202,1],[125,2],[219,1],[219,1],[220,1],[220,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

        let imports = Object.keys(Parser._imports).length ? { imports: Parser._imports } : {}
        var startObj = Parser.start ? { start: Parser.start } : {};
        var startActs = Parser.startActs ? { startActs: Parser.startActs } : {};
        let shapes = Parser.shapes ? { shapes: Object.values(Parser.shapes) } : {};
        var shexj = Object.assign(
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
case 16:
 // t: @@
        Parser._setBase(Parser._base === null ||
                    absoluteIRI.test($$[$0].slice(1, -1)) ? $$[$0].slice(1, -1) : _resolveIRI($$[$0].slice(1, -1)));
      
break;
case 17:
 // t: ShExParser-test.js/with pre-defined prefixes
        Parser._prefixes[$$[$0-1].slice(0, -1)] = $$[$0];
      
break;
case 18:
 // t: @@
        Parser._imports.push($$[$0]);
      
break;
case 19:

        $$[$0].forEach(function (elt) {
	  Parser._termResolver.add(elt);
        });
      
break;
case 20: case 49: case 53: case 56: case 60:
this.$ = [];
break;
case 21: case 45: case 48: case 50: case 54: case 57: case 61:
this.$ = $$[$0-1].concat($$[$0]);
break;
case 22: case 44: case 47:
this.$ = [$$[$0]];
break;
case 23: case 157:
this.$ = $$[$0-1];
break;
case 26:

        if (Parser.start)
          error(new Error("Parse error: start already defined"), yy);
        Parser.start = shapeJunction("ShapeOr", $$[$0-1], $$[$0]); // t: startInline
      
break;
case 27:

        Parser.startActs = $$[$0]; // t: startCode1
      
break;
case 28:
this.$ = [$$[$0]] // t: startCode1;
break;
case 29:
this.$ = appendTo($$[$0-1], $$[$0]) // t: startCode3;
break;
case 32:
 // t: 1dot 1val1vsMinusiri3??
        addShape($$[$0-1],  $$[$0], yy);
      
break;
case 33:

        this.$ = nonest($$[$0]);
      
break;
case 34:
this.$ = { type: "ShapeExternal" };
break;
case 35:

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
case 36:

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
case 37:

        $$[$0].needsAtom.unshift(nonest($$[$0-1]));
        delete $$[$0].needsAtom;
        this.$ = $$[$0]; // { type: "ShapeOr", "shapeExprs": [$$[$0-1]].concat($$[$0]) };
      
break;
case 38: case 234: case 251:
this.$ = null;
break;
case 39: case 43: case 46: case 52: case 59: case 191: case 250:
this.$ = $$[$0];
break;
case 41:
 // returns a ShapeOr
        var disjuncts = $$[$0].map(nonest);
        this.$ = { type: "ShapeOr", shapeExprs: disjuncts, needsAtom: disjuncts }; // t: @@
      
break;
case 42:
 // returns a ShapeAnd
        // $$[$0-1] could have implicit conjuncts and explicit nested ANDs (will have .nested: true)
        $$[$0-1].filter(c => c.type === "ShapeAnd").length === $$[$0-1].length
        var and = {
          type: "ShapeAnd",
          shapeExprs: $$[$0-1].reduce(
            (acc, elt) =>
              acc.concat(elt.type === 'ShapeAnd' && !elt.nested ? elt.shapeExprs : nonest(elt)), []
          )
        };
        this.$ = $$[$0].length > 0 ? { type: "ShapeOr", shapeExprs: [and].concat($$[$0].map(nonest)) } : and; // t: @@
        this.$.needsAtom = and.shapeExprs;
      
break;
case 51:
this.$ = shapeJunction("ShapeOr", $$[$0-1], $$[$0]);
break;
case 55: case 58:
this.$ = shapeJunction("ShapeAnd", $$[$0-1], $$[$0]) // t: @@;
break;
case 62:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t:@@ */ : $$[$0];
break;
case 63:
this.$ = false;
break;
case 64:
this.$ = true;
break;
case 65:
this.$ = $$[$0-1] ? { type: "ShapeNot", "shapeExpr": nonest($$[$0]) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $$[$0];
break;
case 66: case 75: case 80:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1];
break;
case 68:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t: 1dotRef1 */ : $$[$0-1] // t:@@;
break;
case 69: case 78: case 83:
this.$ = Object.assign($$[$0-1], {nested: true}) // t: 1val1vsMinusiri3;
break;
case 70: case 79: case 84:
this.$ = EmptyShape // t: 1dot;
break;
case 77:
this.$ = $$[$0] ? shapeJunction("ShapeAnd", $$[$0-1], [$$[$0]]) /* t:@@ */ : $$[$0-1]	 // t: 1dotRef1 -- use _QnonLitNodeConstraint_E_Opt like below?;
break;
case 82:
this.$ = $$[$0] ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $$[$0-1]), $$[$0] ] } : $$[$0-1] // t: !! look to 1dotRef1;
break;
case 93:
 // t: 1dotRefLNex@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        var namePos = $$[$0].indexOf(':');
        this.$ = addSourceMap(expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1), yy); // ShapeRef
      
break;
case 94:
 // t: 1dotRefNS1@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = addSourceMap(expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy), yy); // ShapeRef
      
break;
case 95:
this.$ = addSourceMap($$[$0], yy) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
break;
case 96: case 99:
 // t: !!
        this.$ = $$[$0-2]
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !!
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !!
      
break;
case 97:
this.$ = [] // t: 1dot, 1dotAnnot3;
break;
case 98:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotAnnot3;
break;
case 100:
this.$ = extend({ type: "NodeConstraint", nodeKind: "literal" }, $$[$0]) // t: 1literalPattern;
break;
case 101:

        if (numericDatatypes.indexOf($$[$0-1]) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $$[$0])
              error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]), yy);
          });
        this.$ = extend({ type: "NodeConstraint", datatype: $$[$0-1] }, $$[$0]) // t: 1datatype
      
break;
case 102:
this.$ = { type: "NodeConstraint", values: $$[$0-1] } // t: 1val1IRIREF;
break;
case 103:
this.$ = extend({ type: "NodeConstraint"}, $$[$0]);
break;
case 104:
this.$ = {} // t: 1literalPattern;
break;
case 105:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1literalLength
      
break;
case 107: case 113:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: !! look to 1literalLength
      
break;
case 108:
this.$ = extend({ type: "NodeConstraint" }, $$[$0-1], $$[$0] ? $$[$0] : {}) // t: 1iriPattern;
break;
case 109:
this.$ = extend({ type: "NodeConstraint" }, $$[$0]) // t: @@;
break;
case 110:
this.$ = {};
break;
case 111:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error(new Error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times"), yy);
        }
        this.$ = extend($$[$0-1], $$[$0])
      
break;
case 114:
this.$ = { nodeKind: "iri" } // t: 1iriPattern;
break;
case 115:
this.$ = { nodeKind: "bnode" } // t: 1bnodeLength;
break;
case 116:
this.$ = { nodeKind: "nonliteral" } // t: 1nonliteralLength;
break;
case 119:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalLength;
break;
case 120:
this.$ = unescapeRegexp($$[$0]) // t: 1literalPattern;
break;
case 121:
this.$ = "length" // t: 1literalLength;
break;
case 122:
this.$ = "minlength" // t: 1literalMinlength;
break;
case 123:
this.$ = "maxlength" // t: 1literalMaxlength;
break;
case 124:
this.$ = keyValObject($$[$0-1], $$[$0]) // t: 1literalMininclusive;
break;
case 125:
this.$ = keyValObject($$[$0-1], parseInt($$[$0], 10)) // t: 1literalTotaldigits;
break;
case 126:
this.$ = parseInt($$[$0], 10);
break;
case 127: case 128:
this.$ = parseFloat($$[$0]);
break;
case 129:
 // ## deprecated
        if ($$[$0] === XSD_DECIMAL || $$[$0] === XSD_FLOAT || $$[$0] === XSD_DOUBLE)
          this.$ = parseFloat($$[$0-2].value);
        else if (numericDatatypes.indexOf($$[$0]) !== -1)
          this.$ = parseInt($$[$0-2].value)
        else
          error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]), yy);
      
break;
case 130:
this.$ = "mininclusive" // t: 1literalMininclusive;
break;
case 131:
this.$ = "minexclusive" // t: 1literalMinexclusive;
break;
case 132:
this.$ = "maxinclusive" // t: 1literalMaxinclusive;
break;
case 133:
this.$ = "maxexclusive" // t: 1literalMaxexclusive;
break;
case 134:
this.$ = "totaldigits" // t: 1literalTotaldigits;
break;
case 135:
this.$ = "fractiondigits" // t: 1literalFractiondigits;
break;
case 136:
 // t: 1dotInherit3
        this.$ = $$[$0-2] === EmptyShape ? { type: "Shape" } : $$[$0-2]; // t: 0
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 137:
 // t: 1dotInherit3
        var exprObj = $$[$0-1] ? { expression: $$[$0-1] } : EmptyObject; // t: 0, 0Inherit1
        this.$ = (exprObj === EmptyObject && $$[$0-3] === EmptyObject) ?
	  EmptyShape :
	  extend({ type: "Shape" }, exprObj, $$[$0-3]);
      
break;
case 138:
this.$ = [ "inherit", $$[$0] ] // t: 1dotInherit1;
break;
case 139:
this.$ = [ "extra", $$[$0] ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 140:
this.$ = [ "closed", true ] // t: 1dotClosed;
break;
case 141:
this.$ = EmptyObject;
break;
case 142:

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
case 145:
this.$ = $$[$0] // t: 1dotExtra1, 3groupdot3Extra;
break;
case 146:
this.$ = [$$[$0]] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3;
break;
case 147:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 3groupdotExtra3;
break;
case 151:
this.$ = { type: "OneOf", expressions: unionAll([$$[$0-1]], $$[$0]) } // t: 2oneOfdot;
break;
case 152:
this.$ = $$[$0] // t: 2oneOfdot;
break;
case 153:
this.$ = [$$[$0]] // t: 2oneOfdot;
break;
case 154:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2oneOfdot;
break;
case 161:
this.$ = { type: "EachOf", expressions: unionAll([$$[$0-2]], $$[$0-1]) } // t: 2groupOfdot;
break;
case 162:
this.$ = $$[$0] // ## deprecated // t: 2groupOfdot;
break;
case 163:
this.$ = $$[$0] // t: 2groupOfdot;
break;
case 164:
this.$ = [$$[$0]] // t: 2groupOfdot;
break;
case 165:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 2groupOfdot;
break;
case 166:

        if ($$[$0-1]) {
          this.$ = extend({ id: $$[$0-1] }, $$[$0]);
          addProduction($$[$0-1],  this.$, yy);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 168:
this.$ = addSourceMap($$[$0], yy);
break;
case 173:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 174:
this.$ = {} // t: 1dot;
break;
case 176:

        // $$[$0]: t: 1dotCode1
	if ($$[$0-3] !== EmptyShape && false) {
	  var t = blank();
	  addShape(t, $$[$0-3], yy);
	  $$[$0-3] = t; // ShapeRef
	}
        // %6: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5] ? $$[$0-5] : {}, { predicate: $$[$0-4] }, ($$[$0-3] === EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot // t: 1inversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3 // t: 1inversedotAnnot3
      
break;
case 179:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 180:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 181:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 182:

        $$[$0] = $$[$0].substr(1, $$[$0].length-2);
        var nums = $$[$0].match(/(\d+)/g);
        this.$ = { min: parseInt(nums[0], 10) }; // t: 1card2blank, 1card2Star
        if (nums.length === 2)
            this.$["max"] = parseInt(nums[1], 10); // t: 1card23
        else if ($$[$0].indexOf(',') === -1) // t: 1card2
            this.$["max"] = parseInt(nums[0], 10);
        else
            this.$["max"] = UNBOUNDED;
      
break;
case 183:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 184:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 185:
this.$ = [] // t: 1val1IRIREF;
break;
case 186:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 188:
this.$ = Parser._termResolver.resolve($$[$0], Parser._prefixes);
break;
case 192:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 193:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 194:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 195:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 196:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 197:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 198:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 199:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 200:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 201:

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
case 202:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 203:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 204:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 207:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 210:

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
case 211:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 212:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 213:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 216:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 217:

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
case 218:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 219:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 220:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 221:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 224:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 225:
this.$ = addSourceMap($$[$0], yy) // Inclusion // t: 2groupInclude1;
break;
case 226:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 229:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null // t: 1dotCode1/2oneOfDot;
break;
case 230:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 231:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 232:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 239:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 245:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 246:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 247:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 249:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1] // t: 1val1Datatype;
break;
case 253:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 254:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 255:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 256:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 257:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 258:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 259:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 260:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 261:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 262:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 263:
 // t: 1dot
        var unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = Parser._base === null || absoluteIRI.test(unesc) ? unesc : _resolveIRI(unesc)
      
break;
case 265:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        var namePos = $$[$0].indexOf(':');
        this.$ = expandPrefix($$[$0].substr(0, namePos), yy) + ShExUtil.unescapeText($$[$0].substr(namePos + 1), pnameEscapeReplacements);
      
break;
case 266:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
      
break;
case 267:
this.$ = this._base === null || absoluteIRI.test($$[$0].slice(1, -1)) ? ShExUtil.unescapeText($$[$0].slice(1,-1), {}) : _resolveIRI(ShExUtil.unescapeText($$[$0].slice(1,-1), {})) // t: 1dot;
break;
case 268:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        var namePos = $$[$0].indexOf(':');
      this.$ = expandPrefix($$[$0].substr(0, namePos), yy) + $$[$0].substr(namePos + 1);
    
break;
case 269:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
      this.$ = expandPrefix($$[$0].substr(0, $$[$0].length - 1), yy);
    
break;
case 270:

        this.$ = Parser._termResolver.resolve($$[$0], Parser._prefixes);
    
break;
case 272:
this.$ = $$[$0] // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3;
break;
case 275:
this.$ = [$$[$0]] // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3;
break;
case 276:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotInherit3;
break;
}
},
table: [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),{6:4,7:[2,10],8:5,9:11,10:16,11:17,14:6,15:7,16:8,17:9,18:10,19:[1,12],20:$V1,21:[1,13],22:$V2,23:24,24:[1,14],25:[1,15],30:18,31:19,32:[1,21],36:20,37:23,38:22,195:$V3,202:25,216:28,217:$V4,218:$V5},{7:[1,32]},o($V0,[2,4]),{7:[2,11]},o($V0,$V6),o($V0,$V7),o($V0,$V8),o($V0,$V9),o($Va,[2,7],{12:33}),{20:[1,34]},{22:[1,35]},{20:$Vb,22:$Vc,23:36,216:38,217:$Vd},{20:$Vb,22:$Vc,23:42,26:41,28:[1,43],216:38,217:$Vd},o($Va,[2,5]),o($Va,[2,6]),o($Va,$Ve),o($Va,$Vf),o($Va,[2,27],{37:44,195:$V3}),{33:[1,45]},o($Vg,$Vh,{39:46,40:47,42:49,46:51,41:[1,48],45:[1,50],81:$Vi,82:$Vj,83:$Vk}),o($V0,[2,28]),o($Vl,$Vm),o($Vl,$Vn),{20:$Vo,22:$Vp,23:55,216:57,217:$Vq},o($Vl,$Vr),o($Vl,$Vs),o($Vl,$Vt),o($Vl,$Vu),o($Vl,$Vv),{1:[2,1]},{7:[2,9],8:61,10:62,13:60,15:63,16:64,17:65,18:66,19:[1,69],20:$V1,21:[1,70],22:$V2,23:24,24:[1,71],25:[1,72],30:67,31:68,32:[1,73],38:74,202:25,216:28,217:$V4,218:$V5},o($V0,$Vw),{20:$Vb,22:$Vc,23:75,216:38,217:$Vd},o($V0,$Vx),o($V0,$Vr),o($V0,$Vs),o($V0,$Vu),o($V0,$Vv),o($V0,$Vy),o($V0,$Vz),o($VA,$VB,{27:76}),o($V0,[2,29]),o($VC,$Vh,{34:77,56:78,42:79,45:$VD}),o($Va,$VE),o($Va,$VF),o($Va,$VG),o($VH,$VI,{43:81,66:82,68:83,74:84,75:87,77:88,80:89,94:90,96:91,89:93,90:94,91:95,120:96,97:100,193:101,93:103,101:104,107:110,109:111,20:$VJ,22:$VK,28:$VL,71:[1,85],73:[1,86],87:$VM,98:$VN,99:$VO,100:$VP,103:$VQ,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:$V_,217:$V$}),o($Vg,$V01,{46:121,81:$V11,82:$V21,83:$V31}),{47:125,50:126,51:127,52:128,53:$V41,54:129,55:$V51},o($V61,$V71),o($V61,$V81),{20:[1,135],22:[1,139],23:133,38:132,202:134,216:136,217:[1,138],218:[1,137]},{195:[1,142],196:140,197:[1,141]},o($V91,$Vr),o($V91,$Vs),o($V91,$Vu),o($V91,$Vv),o($Va,[2,8]),o($Va,[2,30]),o($Va,[2,31]),o($Va,$V6),o($Va,$V7),o($Va,$V8),o($Va,$V9),o($Va,$Ve),o($Va,$Vf),{20:[1,143]},{22:[1,144]},{20:$Va1,22:$Vb1,23:145,216:147,217:$Vc1},{20:$Va1,22:$Vb1,23:151,26:150,28:[1,152],216:147,217:$Vc1},{33:[1,153]},o($Vg,$Vh,{39:154,40:155,42:157,46:159,41:[1,156],45:[1,158],81:$Vi,82:$Vj,83:$Vk}),o($V0,$Vd1),{20:$Ve1,22:$Vf1,23:161,29:[1,160],216:163,217:$Vg1},o($Vh1,$Vi1,{35:166}),o($Vj1,$Vk1,{60:167}),o($VH,$VI,{75:87,77:88,80:89,94:90,96:91,89:93,90:94,91:95,120:96,97:100,193:101,93:103,101:104,107:110,109:111,64:168,66:169,68:170,69:171,74:174,46:175,20:$VJ,22:$VK,28:$VL,71:[1,172],73:[1,173],81:[1,176],82:[1,177],83:[1,178],87:$VM,98:$VN,99:$VO,100:$VP,103:$VQ,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:$V_,217:$V$}),o($VC,$V01),o($Va,$Vl1,{50:126,51:127,52:128,54:129,44:179,47:180,53:$V41,55:$V51}),o($Vj1,$Vm1,{67:181,69:182,74:183,46:184,80:185,120:186,81:$V11,82:$V21,83:$V31,121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vn1),o($Vj1,$Vo1,{70:187,66:188,75:189,94:190,96:191,97:195,101:196,98:$Vp1,99:$Vq1,100:$Vr1,103:$Vs1,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{40:198,42:199,46:201,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vu1),o($Vv1,$Vw1,{84:202}),o($Vx1,$Vw1,{84:203}),o($Vy1,$Vw1,{84:204}),o($Vz1,$VA1,{95:205}),o($Vv1,$VB1,{101:104,97:206,103:$VQ,104:$VR,105:$VS,106:$VT}),o($VC1,$VD1,{88:207}),o($VC1,$VD1,{88:208}),o($VC1,$VD1,{88:209}),o($Vx1,$VE1,{107:110,109:111,93:210,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),{121:[1,211],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vz1,$VJ1),o($Vz1,$VK1),o($Vz1,$VL1),o($Vz1,$VM1),o($VC1,$VN1),o($VO1,$VP1,{163:220}),o($VQ1,$VR1),{102:[1,221]},o($Vz1,$VS1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),{102:[1,223],108:222,110:[1,224],111:[1,225],112:226,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,231]},{102:[2,121]},{102:[2,122]},{102:[2,123]},o($V$1,[2,130]),o($V$1,[2,131]),o($V$1,[2,132]),o($V$1,[2,133]),{102:[2,134]},{102:[2,135]},o($Va,$Vl1,{50:126,51:127,52:128,54:129,47:180,44:232,53:$V41,55:$V51}),o($Vj1,$V71),o($Vj1,$V81),{20:[1,236],22:[1,240],23:234,38:233,202:235,216:237,217:[1,239],218:[1,238]},o($Va,$V02),o($Va,$V12,{52:241,53:$V41}),o($Vh1,$Vi1,{35:242,54:243,55:$V51}),o($Vh1,$V22),o($Vj1,$V32),o($VC,$Vh,{34:244,56:245,42:246,45:$VD}),o($VC,$Vh,{56:247,42:248,45:$VD}),o($V61,$V42),o($V61,$Vm),o($V61,$Vn),o($V61,$Vr),o($V61,$Vs),o($V61,$Vt),o($V61,$Vu),o($V61,$Vv),o($V0,$V52),o($V0,$V62),o($V0,$V72),o($Va,$Vw),{20:$Va1,22:$Vb1,23:249,216:147,217:$Vc1},o($Va,$Vx),o($Va,$Vr),o($Va,$Vs),o($Va,$Vu),o($Va,$Vv),o($Va,$Vy),o($Va,$Vz),o($VA,$VB,{27:250}),o($VC,$Vh,{34:251,56:252,42:253,45:$VD}),o($Va,$VE),o($Va,$VF),o($Va,$VG),o($VH,$VI,{43:254,66:255,68:256,74:257,75:260,77:261,80:262,94:263,96:264,89:266,90:267,91:268,120:269,97:273,193:274,93:276,101:277,107:283,109:284,20:$V82,22:$V92,28:$Va2,71:[1,258],73:[1,259],87:$Vb2,98:$Vc2,99:$Vd2,100:$Ve2,103:$Vf2,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:$Vg2,217:$Vh2}),o($Vg,$V01,{46:285,81:$Vi2,82:$Vj2,83:$Vk2}),{47:289,50:290,51:291,52:292,53:$Vl2,54:293,55:$Vm2},o($V0,$Vn2),o($VA,[2,21]),o($VA,$Vr),o($VA,$Vs),o($VA,$Vu),o($VA,$Vv),o($Va,$Vo2,{52:296,53:$V41}),o($Vh1,$Vp2,{54:297,55:$V51}),o($Vj1,$Vq2),o($Vj1,$Vm1,{69:182,74:183,46:184,80:185,120:186,67:298,81:$V11,82:$V21,83:$V31,121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vr2),o($Vj1,$Vo1,{66:188,75:189,94:190,96:191,97:195,101:196,70:299,98:$Vp1,99:$Vq1,100:$Vr1,103:$Vs1,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:300,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vs2),o($Vt2,$Vu2),o($Vt2,$Vv2),o($Vt2,$V71),o($Vt2,$V81),{20:[1,304],22:[1,308],23:302,38:301,202:303,216:305,217:[1,307],218:[1,306]},o($Va,$Vw2),o($Va,$Vx2),o($Vj1,$Vy2),o($Vj1,$Vz2),o($Vj1,$Vu2),o($Vj1,$Vv2),o($Vx1,$Vw1,{84:309}),{121:[1,310],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj1,$VA2),o($Vj1,$VB2),o($Vx1,$Vw1,{84:311}),o($VC2,$VA1,{95:312}),o($Vx1,$VB1,{101:196,97:313,103:$Vs1,104:$VR,105:$VS,106:$VT}),o($VC2,$VJ1),o($VC2,$VK1),o($VC2,$VL1),o($VC2,$VM1),{102:[1,314]},o($VC2,$VS1),{72:[1,315]},o($VH,$VI,{43:316,66:317,68:318,74:319,75:322,77:323,80:324,94:325,96:326,89:328,90:329,91:330,120:331,97:335,193:336,93:338,101:339,107:345,109:346,20:[1,341],22:[1,343],28:[1,337],71:[1,320],73:[1,321],87:[1,327],98:[1,332],99:[1,333],100:[1,334],103:$VD2,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,344],217:[1,342]}),o($Vg,$V01,{46:347,81:$VE2,82:$VF2,83:$VG2}),{47:351,50:352,51:353,52:354,53:$VH2,54:355,55:$VI2},o($VJ2,$VK2,{85:358,86:359,194:360,191:[1,361]}),o($VL2,$VK2,{85:362,86:363,194:364,191:$VM2}),o($VN2,$VK2,{85:366,86:367,194:368,191:[1,369]}),o($Vv1,$VO2,{101:104,97:370,103:$VQ,104:$VR,105:$VS,106:$VT}),o($Vz1,$VP2),o($Vx1,$VQ2,{92:371,97:372,93:373,101:374,107:376,109:377,103:$VR2,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VS2,{92:371,97:372,93:373,101:374,107:376,109:377,103:$VR2,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VT2,{92:371,97:372,93:373,101:374,107:376,109:377,103:$VR2,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VQ1,$VU2),o($VV2,$VW2,{122:378,128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,123:$VX2,150:$VY2,190:$VZ2}),o($VH,[2,142]),o($VH,[2,138]),o($VH,[2,139]),o($VH,[2,140]),{20:$V_2,22:$V$2,23:393,38:392,202:394,216:396,217:$V03,218:$V13,220:391},{20:$V23,22:$V33,130:400,131:401,166:$V43,193:402,201:$V53,217:$V63},o($V73,[2,273]),o($V73,[2,274]),{20:$V83,22:$V93,23:415,29:[1,408],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($Vz1,$Vs3),o($VQ1,$Vt3),o($VQ1,$Vu3),o($VQ1,$Vv3),o($VQ1,$Vw3),{113:[1,441]},{113:$Vx3},{113:$Vy3},{113:$Vz3},{113:$VA3},o($VQ1,$VB3),o($Va,$VC3),o($Vj1,$V42),o($Vj1,$Vm),o($Vj1,$Vn),o($Vj1,$Vr),o($Vj1,$Vs),o($Vj1,$Vt),o($Vj1,$Vu),o($Vj1,$Vv),o($Vh1,$VD3),o($Va,$VE3,{52:296,53:$V41}),o($Vj1,$VF3),o($Vh1,$VG3),o($Vj1,$Vk1,{60:442}),o($VH,$VI,{64:443,66:444,68:445,69:446,75:449,77:450,74:451,46:452,94:453,96:454,89:456,90:457,91:458,80:459,97:466,193:467,93:469,120:470,101:471,107:477,109:478,20:[1,473],22:[1,475],28:[1,468],71:[1,447],73:[1,448],81:[1,460],82:[1,461],83:[1,462],87:[1,455],98:[1,463],99:[1,464],100:[1,465],103:$VH3,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,476],217:[1,474]}),o($Vj1,$VI3),o($VH,$VI,{64:479,66:480,68:481,69:482,75:485,77:486,74:487,46:488,94:489,96:490,89:492,90:493,91:494,80:495,97:502,193:503,93:505,120:506,101:507,107:513,109:514,20:[1,509],22:[1,511],28:[1,504],71:[1,483],73:[1,484],81:[1,496],82:[1,497],83:[1,498],87:[1,491],98:[1,499],99:[1,500],100:[1,501],103:$VJ3,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,512],217:[1,510]}),o($Va,$Vd1),{20:$Ve1,22:$Vf1,23:161,29:[1,515],216:163,217:$Vg1},o($Vh1,$Vi1,{35:516}),o($Vj1,$Vk1,{60:517}),o($VH,$VI,{75:260,77:261,80:262,94:263,96:264,89:266,90:267,91:268,120:269,97:273,193:274,93:276,101:277,107:283,109:284,64:518,66:519,68:520,69:521,74:524,46:525,20:$V82,22:$V92,28:$Va2,71:[1,522],73:[1,523],81:[1,526],82:[1,527],83:[1,528],87:$Vb2,98:$Vc2,99:$Vd2,100:$Ve2,103:$Vf2,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:$Vg2,217:$Vh2}),o($Va,$Vl1,{50:290,51:291,52:292,54:293,44:529,47:530,53:$Vl2,55:$Vm2}),o($Vj1,$Vm1,{67:531,69:532,74:533,46:534,80:535,120:536,81:$Vi2,82:$Vj2,83:$Vk2,121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vn1),o($Vj1,$Vo1,{70:537,66:538,75:539,94:540,96:541,97:545,101:546,98:$VK3,99:$VL3,100:$VM3,103:$VN3,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:548,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vu1),o($Vv1,$Vw1,{84:549}),o($Vx1,$Vw1,{84:550}),o($Vy1,$Vw1,{84:551}),o($Vz1,$VA1,{95:552}),o($Vv1,$VB1,{101:277,97:553,103:$Vf2,104:$VR,105:$VS,106:$VT}),o($VC1,$VD1,{88:554}),o($VC1,$VD1,{88:555}),o($VC1,$VD1,{88:556}),o($Vx1,$VE1,{107:283,109:284,93:557,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),{121:[1,558],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vz1,$VJ1),o($Vz1,$VK1),o($Vz1,$VL1),o($Vz1,$VM1),o($VC1,$VN1),o($VO1,$VP1,{163:559}),o($VQ1,$VR1),{102:[1,560]},o($Vz1,$VS1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),{102:[1,562],108:561,110:[1,563],111:[1,564],112:565,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,566]},o($Va,$Vl1,{50:290,51:291,52:292,54:293,47:530,44:567,53:$Vl2,55:$Vm2}),o($Vj1,$V71),o($Vj1,$V81),{20:[1,571],22:[1,575],23:569,38:568,202:570,216:572,217:[1,574],218:[1,573]},o($Va,$V02),o($Va,$V12,{52:576,53:$Vl2}),o($Vh1,$Vi1,{35:577,54:578,55:$Vm2}),o($Vh1,$V22),o($Vj1,$V32),o($VC,$Vh,{34:579,56:580,42:581,45:$VD}),o($VC,$Vh,{56:582,42:583,45:$VD}),o($Vh1,$VO3),o($Vj1,$VP3),o($Vj1,$VQ3),o($Vj1,$VR3),{72:[1,584]},o($Vt2,$V42),o($Vt2,$Vm),o($Vt2,$Vn),o($Vt2,$Vr),o($Vt2,$Vs),o($Vt2,$Vt),o($Vt2,$Vu),o($Vt2,$Vv),o($VL2,$VK2,{86:363,194:364,85:585,191:$VM2}),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:586,123:$VX2,150:$VY2,190:$VZ2}),o($VL2,$VK2,{86:363,194:364,85:587,191:$VM2}),o($Vx1,$VO2,{101:196,97:588,103:$Vs1,104:$VR,105:$VS,106:$VT}),o($VC2,$VP2),o($VC2,$Vs3),o($Vj1,$VS3),{44:589,47:590,50:352,51:353,52:354,53:$VH2,54:355,55:$VI2,72:$Vl1},o($VH,$VI,{67:591,69:592,74:593,46:594,80:595,120:596,53:$Vm1,55:$Vm1,72:$Vm1,81:$VE2,82:$VF2,83:$VG2}),o($VT3,$Vn1),o($VT3,$Vo1,{70:597,66:598,75:599,94:600,96:601,97:605,101:606,98:[1,602],99:[1,603],100:[1,604],103:$VU3,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:608,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($VT3,$Vu1),o($VV3,$Vw1,{84:609}),o($VW3,$Vw1,{84:610}),o($VX3,$Vw1,{84:611}),o($VY3,$VA1,{95:612}),o($VV3,$VB1,{101:339,97:613,103:$VD2,104:$VR,105:$VS,106:$VT}),o($VZ3,$VD1,{88:614}),o($VZ3,$VD1,{88:615}),o($VZ3,$VD1,{88:616}),o($VW3,$VE1,{107:345,109:346,93:617,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),{121:[1,618],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($VY3,$VJ1),o($VY3,$VK1),o($VY3,$VL1),o($VY3,$VM1),o($VZ3,$VN1),o($VO1,$VP1,{163:619}),o($V_3,$VR1),{102:[1,620]},o($VY3,$VS1),o($VZ3,$VT1),o($VZ3,$VU1),o($VZ3,$VV1),o($VZ3,$VW1),{102:[1,622],108:621,110:[1,623],111:[1,624],112:625,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,626]},{44:627,47:590,50:352,51:353,52:354,53:$VH2,54:355,55:$VI2,72:$Vl1},o($VT3,$V71),o($VT3,$V81),{20:[1,631],22:[1,635],23:629,38:628,202:630,216:632,217:[1,634],218:[1,633]},{72:$V02},{52:636,53:$VH2,72:$V12},o($V$3,$Vi1,{35:637,54:638,55:$VI2}),o($V$3,$V22),o($VT3,$V32),o($VC,$Vh,{34:639,56:640,42:641,45:$VD}),o($VC,$Vh,{56:642,42:643,45:$VD}),o($V04,$V14),o($Vv1,$V24),o($V04,$V34,{37:644,195:[1,645]}),{20:$V44,22:$V54,131:646,166:$V64,193:647,201:$V74,217:$V84},o($Vj1,$V94),o($Vx1,$V24),o($Vj1,$V34,{37:653,195:[1,654]}),{20:$V44,22:$V54,131:655,166:$V64,193:647,201:$V74,217:$V84},o($Vt2,$Va4),o($Vy1,$V24),o($Vt2,$V34,{37:656,195:[1,657]}),{20:$V44,22:$V54,131:658,166:$V64,193:647,201:$V74,217:$V84},o($Vz1,$Vb4),o($VC1,$Vc4),o($VC1,$Vd4),o($VC1,$Ve4),{102:[1,659]},o($VC1,$VS1),{102:[1,661],108:660,110:[1,662],111:[1,663],112:664,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,665]},{123:[1,666]},{123:[2,144]},{123:$Vf4},{123:$Vg4,135:667,136:668,137:$Vh4},{123:$Vi4},o($Vj4,$Vk4),o($Vj4,$Vl4),o($Vj4,$Vm4,{141:670,144:671,145:674,142:$Vn4,143:$Vo4}),o($Vp4,$Vq4,{147:675,152:676,153:677,156:678,157:680,71:[1,679],162:$Vr4}),o($Vs4,$Vt4),o($VV2,[2,170]),{20:[1,685],22:[1,689],23:683,151:682,202:684,216:686,217:[1,688],218:[1,687]},{20:[1,693],22:[1,697],23:691,151:690,202:692,216:694,217:[1,696],218:[1,695]},o($VH,[2,272],{23:393,202:394,216:396,38:698,20:$V_2,22:$V$2,217:$V03,218:$V13}),o($Vu4,[2,275]),o($Vu4,$Vm),o($Vu4,$Vn),o($Vu4,$Vr),o($Vu4,$Vs),o($Vu4,$Vt),o($Vu4,$Vu),o($Vu4,$Vv),o($VH,[2,145],{193:402,131:699,20:$V23,22:$V33,166:$V43,201:$V53,217:$V63}),o($Vv4,[2,146]),o($Vv4,$Vw4),o($Vv4,$Vx4),o($Vv4,$VT1),o($Vv4,$VU1),o($Vv4,$VV1),o($Vv4,$VW1),o($VC1,$Vy4),o($VO1,[2,186]),o($VO1,[2,187]),o($VO1,[2,188]),o($VO1,[2,189]),o($VO1,[2,190]),{169:700,170:701,171:704,172:702,173:705,174:703,175:706,180:[1,707]},o($VO1,[2,205],{176:708,178:709,179:[1,710]}),o($VO1,[2,214],{183:711,185:712,179:[1,713]}),o($VO1,[2,222],{187:714,188:715,179:$Vz4}),{179:$Vz4,188:717},o($VA4,$Vr),o($VA4,$Vs),o($VA4,$VB4),o($VA4,$VC4),o($VA4,$VD4),o($VA4,$Vu),o($VA4,$Vv),o($VA4,$VE4),o($VA4,$VF4,{204:718,205:719,113:[1,720]}),o($VA4,$VG4),o($VA4,$VH4),o($VA4,$VI4),o($VA4,$VJ4),o($VA4,$VK4),o($VA4,$VL4),o($VA4,$VM4),o($VA4,$VN4),o($VA4,$VO4),o($VP4,$Vx3),o($VP4,$Vy3),o($VP4,$Vz3),o($VP4,$VA3),{20:[1,723],22:[1,725],89:721,166:[1,726],193:722,217:[1,724]},o($Vh1,$Vp2,{54:727,55:[1,728]}),o($Vj1,$Vq2),o($Vj1,$Vm1,{67:729,69:730,74:731,46:732,80:733,120:737,81:[1,734],82:[1,735],83:[1,736],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vr2),o($Vj1,$Vo1,{70:738,66:739,75:740,94:741,96:742,97:746,101:747,98:[1,743],99:[1,744],100:[1,745],103:$VQ4,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:749,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vs2),o($Vv1,$Vw1,{84:750}),o($Vx1,$Vw1,{84:751}),o($Vt2,$Vu2),o($Vt2,$Vv2),o($Vz1,$VA1,{95:752}),o($Vv1,$VB1,{101:471,97:753,103:$VH3,104:$VR,105:$VS,106:$VT}),o($VC1,$VD1,{88:754}),o($VC1,$VD1,{88:755}),o($VC1,$VD1,{88:756}),o($Vx1,$VE1,{107:477,109:478,93:757,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vy1,$Vw1,{84:758}),o($Vt2,$V71),o($Vt2,$V81),{20:[1,762],22:[1,766],23:760,38:759,202:761,216:763,217:[1,765],218:[1,764]},o($Vz1,$VJ1),o($Vz1,$VK1),o($Vz1,$VL1),o($Vz1,$VM1),o($VC1,$VN1),o($VO1,$VP1,{163:767}),o($VQ1,$VR1),{121:[1,768],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},{102:[1,769]},o($Vz1,$VS1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),{102:[1,771],108:770,110:[1,772],111:[1,773],112:774,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,775]},o($Vj1,$Vq2),o($Vj1,$Vm1,{67:776,69:777,74:778,46:779,80:780,120:784,81:[1,781],82:[1,782],83:[1,783],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vr2),o($Vj1,$Vo1,{70:785,66:786,75:787,94:788,96:789,97:793,101:794,98:[1,790],99:[1,791],100:[1,792],103:$VR4,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:796,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vs2),o($Vv1,$Vw1,{84:797}),o($Vx1,$Vw1,{84:798}),o($Vt2,$Vu2),o($Vt2,$Vv2),o($Vz1,$VA1,{95:799}),o($Vv1,$VB1,{101:507,97:800,103:$VJ3,104:$VR,105:$VS,106:$VT}),o($VC1,$VD1,{88:801}),o($VC1,$VD1,{88:802}),o($VC1,$VD1,{88:803}),o($Vx1,$VE1,{107:513,109:514,93:804,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vy1,$Vw1,{84:805}),o($Vt2,$V71),o($Vt2,$V81),{20:[1,809],22:[1,813],23:807,38:806,202:808,216:810,217:[1,812],218:[1,811]},o($Vz1,$VJ1),o($Vz1,$VK1),o($Vz1,$VL1),o($Vz1,$VM1),o($VC1,$VN1),o($VO1,$VP1,{163:814}),o($VQ1,$VR1),{121:[1,815],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},{102:[1,816]},o($Vz1,$VS1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),{102:[1,818],108:817,110:[1,819],111:[1,820],112:821,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,822]},o($Va,$Vn2),o($Va,$Vo2,{52:823,53:$Vl2}),o($Vh1,$Vp2,{54:824,55:$Vm2}),o($Vj1,$Vq2),o($Vj1,$Vm1,{69:532,74:533,46:534,80:535,120:536,67:825,81:$Vi2,82:$Vj2,83:$Vk2,121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vr2),o($Vj1,$Vo1,{66:538,75:539,94:540,96:541,97:545,101:546,70:826,98:$VK3,99:$VL3,100:$VM3,103:$VN3,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:827,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vs2),o($Vt2,$Vu2),o($Vt2,$Vv2),o($Vt2,$V71),o($Vt2,$V81),{20:[1,831],22:[1,835],23:829,38:828,202:830,216:832,217:[1,834],218:[1,833]},o($Va,$Vw2),o($Va,$Vx2),o($Vj1,$Vy2),o($Vj1,$Vz2),o($Vj1,$Vu2),o($Vj1,$Vv2),o($Vx1,$Vw1,{84:836}),{121:[1,837],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj1,$VA2),o($Vj1,$VB2),o($Vx1,$Vw1,{84:838}),o($VC2,$VA1,{95:839}),o($Vx1,$VB1,{101:546,97:840,103:$VN3,104:$VR,105:$VS,106:$VT}),o($VC2,$VJ1),o($VC2,$VK1),o($VC2,$VL1),o($VC2,$VM1),{102:[1,841]},o($VC2,$VS1),{72:[1,842]},o($VJ2,$VK2,{85:843,86:844,194:845,191:[1,846]}),o($VL2,$VK2,{85:847,86:848,194:849,191:$VS4}),o($VN2,$VK2,{85:851,86:852,194:853,191:[1,854]}),o($Vv1,$VO2,{101:277,97:855,103:$Vf2,104:$VR,105:$VS,106:$VT}),o($Vz1,$VP2),o($Vx1,$VQ2,{92:856,97:857,93:858,101:859,107:861,109:862,103:$VT4,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VS2,{92:856,97:857,93:858,101:859,107:861,109:862,103:$VT4,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VT2,{92:856,97:857,93:858,101:859,107:861,109:862,103:$VT4,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VQ1,$VU2),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:863,123:$VX2,150:$VY2,190:$VZ2}),{20:$V83,22:$V93,23:415,29:[1,864],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($Vz1,$Vs3),o($VQ1,$Vt3),o($VQ1,$Vu3),o($VQ1,$Vv3),o($VQ1,$Vw3),{113:[1,865]},o($VQ1,$VB3),o($Va,$VC3),o($Vj1,$V42),o($Vj1,$Vm),o($Vj1,$Vn),o($Vj1,$Vr),o($Vj1,$Vs),o($Vj1,$Vt),o($Vj1,$Vu),o($Vj1,$Vv),o($Vh1,$VD3),o($Va,$VE3,{52:823,53:$Vl2}),o($Vj1,$VF3),o($Vh1,$VG3),o($Vj1,$Vk1,{60:866}),o($VH,$VI,{64:867,66:868,68:869,69:870,75:873,77:874,74:875,46:876,94:877,96:878,89:880,90:881,91:882,80:883,97:890,193:891,93:893,120:894,101:895,107:901,109:902,20:[1,897],22:[1,899],28:[1,892],71:[1,871],73:[1,872],81:[1,884],82:[1,885],83:[1,886],87:[1,879],98:[1,887],99:[1,888],100:[1,889],103:$VU4,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,900],217:[1,898]}),o($Vj1,$VI3),o($VH,$VI,{64:903,66:904,68:905,69:906,75:909,77:910,74:911,46:912,94:913,96:914,89:916,90:917,91:918,80:919,97:926,193:927,93:929,120:930,101:931,107:937,109:938,20:[1,933],22:[1,935],28:[1,928],71:[1,907],73:[1,908],81:[1,920],82:[1,921],83:[1,922],87:[1,915],98:[1,923],99:[1,924],100:[1,925],103:$VV4,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,936],217:[1,934]}),o($Vj1,$VW4),o($Vj1,$Va4),{123:[1,939]},o($Vj1,$V14),o($VC2,$Vb4),{72:$Vw2},{72:$Vx2},o($VT3,$Vy2),o($VT3,$Vz2),o($VT3,$Vu2),o($VT3,$Vv2),o($VW3,$Vw1,{84:940}),{121:[1,941],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($VT3,$VA2),o($VT3,$VB2),o($VW3,$Vw1,{84:942}),o($VX4,$VA1,{95:943}),o($VW3,$VB1,{101:606,97:944,103:$VU3,104:$VR,105:$VS,106:$VT}),o($VX4,$VJ1),o($VX4,$VK1),o($VX4,$VL1),o($VX4,$VM1),{102:[1,945]},o($VX4,$VS1),{72:[1,946]},o($VY4,$VK2,{85:947,86:948,194:949,191:[1,950]}),o($VZ4,$VK2,{85:951,86:952,194:953,191:$V_4}),o($V$4,$VK2,{85:955,86:956,194:957,191:[1,958]}),o($VV3,$VO2,{101:339,97:959,103:$VD2,104:$VR,105:$VS,106:$VT}),o($VY3,$VP2),o($VW3,$VQ2,{92:960,97:961,93:962,101:963,107:965,109:966,103:$V05,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VW3,$VS2,{92:960,97:961,93:962,101:963,107:965,109:966,103:$V05,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VW3,$VT2,{92:960,97:961,93:962,101:963,107:965,109:966,103:$V05,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V_3,$VU2),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:967,123:$VX2,150:$VY2,190:$VZ2}),{20:$V83,22:$V93,23:415,29:[1,968],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VY3,$Vs3),o($V_3,$Vt3),o($V_3,$Vu3),o($V_3,$Vv3),o($V_3,$Vw3),{113:[1,969]},o($V_3,$VB3),{72:$VC3},o($VT3,$V42),o($VT3,$Vm),o($VT3,$Vn),o($VT3,$Vr),o($VT3,$Vs),o($VT3,$Vt),o($VT3,$Vu),o($VT3,$Vv),o($V$3,$VD3),{52:970,53:$VH2,72:$VE3},o($VT3,$VF3),o($V$3,$VG3),o($VT3,$Vk1,{60:971}),o($VH,$VI,{64:972,66:973,68:974,69:975,75:978,77:979,74:980,46:981,94:982,96:983,89:985,90:986,91:987,80:988,97:995,193:996,93:998,120:999,101:1000,107:1006,109:1007,20:[1,1002],22:[1,1004],28:[1,997],71:[1,976],73:[1,977],81:[1,989],82:[1,990],83:[1,991],87:[1,984],98:[1,992],99:[1,993],100:[1,994],103:$V15,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,1005],217:[1,1003]}),o($VT3,$VI3),o($VH,$VI,{64:1008,66:1009,68:1010,69:1011,75:1014,77:1015,74:1016,46:1017,94:1018,96:1019,89:1021,90:1022,91:1023,80:1024,97:1031,193:1032,93:1034,120:1035,101:1036,107:1042,109:1043,20:[1,1038],22:[1,1040],28:[1,1033],71:[1,1012],73:[1,1013],81:[1,1025],82:[1,1026],83:[1,1027],87:[1,1020],98:[1,1028],99:[1,1029],100:[1,1030],103:$V25,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,1041],217:[1,1039]}),o($VJ2,$V35),{20:$Vo,22:$Vp,23:1044,216:57,217:$Vq},{20:$V45,22:$V55,102:[1,1057],110:[1,1058],111:[1,1059],112:1056,166:$V65,182:1047,192:1045,193:1046,198:1052,199:1053,200:1054,203:1055,206:[1,1060],207:[1,1061],208:[1,1066],209:[1,1067],210:[1,1068],211:[1,1069],212:[1,1062],213:[1,1063],214:[1,1064],215:[1,1065],217:$V75},o($V85,$Vw4),o($V85,$Vx4),o($V85,$VT1),o($V85,$VU1),o($V85,$VV1),o($V85,$VW1),o($VL2,$V35),{20:$Vo,22:$Vp,23:1070,216:57,217:$Vq},{20:$V95,22:$Va5,102:[1,1083],110:[1,1084],111:[1,1085],112:1082,166:$Vb5,182:1073,192:1071,193:1072,198:1078,199:1079,200:1080,203:1081,206:[1,1086],207:[1,1087],208:[1,1092],209:[1,1093],210:[1,1094],211:[1,1095],212:[1,1088],213:[1,1089],214:[1,1090],215:[1,1091],217:$Vc5},o($VN2,$V35),{20:$Vo,22:$Vp,23:1096,216:57,217:$Vq},{20:$Vd5,22:$Ve5,102:[1,1109],110:[1,1110],111:[1,1111],112:1108,166:$Vf5,182:1099,192:1097,193:1098,198:1104,199:1105,200:1106,203:1107,206:[1,1112],207:[1,1113],208:[1,1118],209:[1,1119],210:[1,1120],211:[1,1121],212:[1,1114],213:[1,1115],214:[1,1116],215:[1,1117],217:$Vg5},o($VC1,$Vs3),o($VC1,$Vt3),o($VC1,$Vu3),o($VC1,$Vv3),o($VC1,$Vw3),{113:[1,1122]},o($VC1,$VB3),o($Vy1,$Vh5),{123:$Vi5,136:1123,137:$Vh4},o($Vj4,$Vj5),o($VV2,$VW2,{138:383,139:384,140:385,146:386,148:387,149:388,133:1124,150:$VY2,190:$VZ2}),o($Vj4,$Vk5),o($Vj4,$Vm4,{141:1125,145:1126,142:$Vn4,143:$Vo4}),o($VV2,$VW2,{146:386,148:387,149:388,140:1127,123:$Vl5,137:$Vl5,150:$VY2,190:$VZ2}),o($VV2,$VW2,{146:386,148:387,149:388,140:1128,123:$Vm5,137:$Vm5,150:$VY2,190:$VZ2}),o($Vs4,$Vn5),o($Vs4,$Vo5),o($Vs4,$Vp5),o($Vs4,$Vq5),{20:$Vr5,22:$Vs5,131:1129,166:$Vt5,193:1130,201:$Vu5,217:$Vv5},o($VV2,$VW2,{149:388,128:1136,132:1137,133:1138,134:1139,138:1140,139:1141,140:1142,146:1143,148:1144,150:$VY2,190:$Vw5}),o($Vp4,[2,178]),o($Vp4,[2,183]),o($Vs4,$Vx5),o($Vs4,$Vy5),o($Vs4,$Vz5),o($Vs4,$Vr),o($Vs4,$Vs),o($Vs4,$Vt),o($Vs4,$Vu),o($Vs4,$Vv),o($VV2,[2,168]),o($VV2,$Vy5),o($VV2,$Vz5),o($VV2,$Vr),o($VV2,$Vs),o($VV2,$Vt),o($VV2,$Vu),o($VV2,$Vv),o($Vu4,[2,276]),o($Vv4,[2,147]),o($VO1,[2,191]),o($VO1,[2,198],{171:1146,180:$VA5}),o($VO1,[2,199],{173:1148,180:$VB5}),o($VO1,[2,200],{175:1150,180:$VC5}),o($VD5,[2,192]),o($VD5,[2,194]),o($VD5,[2,196]),{20:$VE5,22:$VF5,23:1152,102:$VG5,110:$VH5,111:$VI5,112:1163,182:1153,186:$VJ5,198:1157,199:1158,200:1159,203:1162,206:$VK5,207:$VL5,208:$VM5,209:$VN5,210:$VO5,211:$VP5,212:$VQ5,213:$VR5,214:$VS5,215:$VT5,216:1156,217:$VU5},o($VO1,[2,201]),o($VO1,[2,206]),o($VD5,[2,202],{177:1177}),o($VO1,[2,210]),o($VO1,[2,215]),o($VD5,[2,211],{184:1178}),o($VO1,[2,217]),o($VO1,[2,223]),o($VD5,[2,219],{189:1179}),o($VO1,[2,218]),o($VA4,$VV5),o($VA4,$VW5),{20:[1,1182],22:[1,1184],89:1180,166:[1,1185],193:1181,217:[1,1183]},o($VQ1,$VX5),o($VQ1,$VN1),o($VQ1,$VT1),o($VQ1,$VU1),o($VQ1,$VV1),o($VQ1,$VW1),o($Vj1,$VP3),o($VC,$Vh,{56:1186,42:1187,45:$VD}),o($Vj1,$VQ3),o($Vj1,$Vz2),o($Vj1,$Vu2),o($Vj1,$Vv2),o($Vx1,$Vw1,{84:1188}),o($Vj1,$V71),o($Vj1,$V81),{20:[1,1192],22:[1,1196],23:1190,38:1189,202:1191,216:1193,217:[1,1195],218:[1,1194]},{121:[1,1197],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj1,$VR3),o($Vj1,$VB2),o($Vx1,$Vw1,{84:1198}),o($VC2,$VA1,{95:1199}),o($Vx1,$VB1,{101:747,97:1200,103:$VQ4,104:$VR,105:$VS,106:$VT}),o($VC2,$VJ1),o($VC2,$VK1),o($VC2,$VL1),o($VC2,$VM1),{102:[1,1201]},o($VC2,$VS1),{72:[1,1202]},o($VJ2,$VK2,{85:1203,86:1204,194:1205,191:[1,1206]}),o($VL2,$VK2,{85:1207,86:1208,194:1209,191:$VY5}),o($Vv1,$VO2,{101:471,97:1211,103:$VH3,104:$VR,105:$VS,106:$VT}),o($Vz1,$VP2),o($Vx1,$VQ2,{92:1212,97:1213,93:1214,101:1215,107:1217,109:1218,103:$VZ5,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VS2,{92:1212,97:1213,93:1214,101:1215,107:1217,109:1218,103:$VZ5,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VT2,{92:1212,97:1213,93:1214,101:1215,107:1217,109:1218,103:$VZ5,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VQ1,$VU2),o($VN2,$VK2,{85:1219,86:1220,194:1221,191:[1,1222]}),o($Vt2,$V42),o($Vt2,$Vm),o($Vt2,$Vn),o($Vt2,$Vr),o($Vt2,$Vs),o($Vt2,$Vt),o($Vt2,$Vu),o($Vt2,$Vv),{20:$V83,22:$V93,23:415,29:[1,1223],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1224,123:$VX2,150:$VY2,190:$VZ2}),o($Vz1,$Vs3),o($VQ1,$Vt3),o($VQ1,$Vu3),o($VQ1,$Vv3),o($VQ1,$Vw3),{113:[1,1225]},o($VQ1,$VB3),o($Vj1,$VQ3),o($Vj1,$Vz2),o($Vj1,$Vu2),o($Vj1,$Vv2),o($Vx1,$Vw1,{84:1226}),o($Vj1,$V71),o($Vj1,$V81),{20:[1,1230],22:[1,1234],23:1228,38:1227,202:1229,216:1231,217:[1,1233],218:[1,1232]},{121:[1,1235],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj1,$VR3),o($Vj1,$VB2),o($Vx1,$Vw1,{84:1236}),o($VC2,$VA1,{95:1237}),o($Vx1,$VB1,{101:794,97:1238,103:$VR4,104:$VR,105:$VS,106:$VT}),o($VC2,$VJ1),o($VC2,$VK1),o($VC2,$VL1),o($VC2,$VM1),{102:[1,1239]},o($VC2,$VS1),{72:[1,1240]},o($VJ2,$VK2,{85:1241,86:1242,194:1243,191:[1,1244]}),o($VL2,$VK2,{85:1245,86:1246,194:1247,191:$V_5}),o($Vv1,$VO2,{101:507,97:1249,103:$VJ3,104:$VR,105:$VS,106:$VT}),o($Vz1,$VP2),o($Vx1,$VQ2,{92:1250,97:1251,93:1252,101:1253,107:1255,109:1256,103:$V$5,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VS2,{92:1250,97:1251,93:1252,101:1253,107:1255,109:1256,103:$V$5,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VT2,{92:1250,97:1251,93:1252,101:1253,107:1255,109:1256,103:$V$5,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VQ1,$VU2),o($VN2,$VK2,{85:1257,86:1258,194:1259,191:[1,1260]}),o($Vt2,$V42),o($Vt2,$Vm),o($Vt2,$Vn),o($Vt2,$Vr),o($Vt2,$Vs),o($Vt2,$Vt),o($Vt2,$Vu),o($Vt2,$Vv),{20:$V83,22:$V93,23:415,29:[1,1261],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1262,123:$VX2,150:$VY2,190:$VZ2}),o($Vz1,$Vs3),o($VQ1,$Vt3),o($VQ1,$Vu3),o($VQ1,$Vv3),o($VQ1,$Vw3),{113:[1,1263]},o($VQ1,$VB3),o($Vh1,$VO3),o($Vj1,$VP3),o($Vj1,$VQ3),o($Vj1,$VR3),{72:[1,1264]},o($Vt2,$V42),o($Vt2,$Vm),o($Vt2,$Vn),o($Vt2,$Vr),o($Vt2,$Vs),o($Vt2,$Vt),o($Vt2,$Vu),o($Vt2,$Vv),o($VL2,$VK2,{86:848,194:849,85:1265,191:$VS4}),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1266,123:$VX2,150:$VY2,190:$VZ2}),o($VL2,$VK2,{86:848,194:849,85:1267,191:$VS4}),o($Vx1,$VO2,{101:546,97:1268,103:$VN3,104:$VR,105:$VS,106:$VT}),o($VC2,$VP2),o($VC2,$Vs3),o($Vj1,$VS3),o($V04,$V14),o($Vv1,$V24),o($V04,$V34,{37:1269,195:[1,1270]}),{20:$V44,22:$V54,131:1271,166:$V64,193:647,201:$V74,217:$V84},o($Vj1,$V94),o($Vx1,$V24),o($Vj1,$V34,{37:1272,195:[1,1273]}),{20:$V44,22:$V54,131:1274,166:$V64,193:647,201:$V74,217:$V84},o($Vt2,$Va4),o($Vy1,$V24),o($Vt2,$V34,{37:1275,195:[1,1276]}),{20:$V44,22:$V54,131:1277,166:$V64,193:647,201:$V74,217:$V84},o($Vz1,$Vb4),o($VC1,$Vc4),o($VC1,$Vd4),o($VC1,$Ve4),{102:[1,1278]},o($VC1,$VS1),{102:[1,1280],108:1279,110:[1,1281],111:[1,1282],112:1283,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,1284]},{123:[1,1285]},o($VC1,$Vy4),{20:[1,1288],22:[1,1290],89:1286,166:[1,1291],193:1287,217:[1,1289]},o($Vh1,$Vp2,{54:1292,55:[1,1293]}),o($Vj1,$Vq2),o($Vj1,$Vm1,{67:1294,69:1295,74:1296,46:1297,80:1298,120:1302,81:[1,1299],82:[1,1300],83:[1,1301],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vr2),o($Vj1,$Vo1,{70:1303,66:1304,75:1305,94:1306,96:1307,97:1311,101:1312,98:[1,1308],99:[1,1309],100:[1,1310],103:$V06,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:1314,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vs2),o($Vv1,$Vw1,{84:1315}),o($Vx1,$Vw1,{84:1316}),o($Vt2,$Vu2),o($Vt2,$Vv2),o($Vz1,$VA1,{95:1317}),o($Vv1,$VB1,{101:895,97:1318,103:$VU4,104:$VR,105:$VS,106:$VT}),o($VC1,$VD1,{88:1319}),o($VC1,$VD1,{88:1320}),o($VC1,$VD1,{88:1321}),o($Vx1,$VE1,{107:901,109:902,93:1322,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vy1,$Vw1,{84:1323}),o($Vt2,$V71),o($Vt2,$V81),{20:[1,1327],22:[1,1331],23:1325,38:1324,202:1326,216:1328,217:[1,1330],218:[1,1329]},o($Vz1,$VJ1),o($Vz1,$VK1),o($Vz1,$VL1),o($Vz1,$VM1),o($VC1,$VN1),o($VO1,$VP1,{163:1332}),o($VQ1,$VR1),{121:[1,1333],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},{102:[1,1334]},o($Vz1,$VS1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),{102:[1,1336],108:1335,110:[1,1337],111:[1,1338],112:1339,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,1340]},o($Vj1,$Vq2),o($Vj1,$Vm1,{67:1341,69:1342,74:1343,46:1344,80:1345,120:1349,81:[1,1346],82:[1,1347],83:[1,1348],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vr2),o($Vj1,$Vo1,{70:1350,66:1351,75:1352,94:1353,96:1354,97:1358,101:1359,98:[1,1355],99:[1,1356],100:[1,1357],103:$V16,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:1361,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vs2),o($Vv1,$Vw1,{84:1362}),o($Vx1,$Vw1,{84:1363}),o($Vt2,$Vu2),o($Vt2,$Vv2),o($Vz1,$VA1,{95:1364}),o($Vv1,$VB1,{101:931,97:1365,103:$VV4,104:$VR,105:$VS,106:$VT}),o($VC1,$VD1,{88:1366}),o($VC1,$VD1,{88:1367}),o($VC1,$VD1,{88:1368}),o($Vx1,$VE1,{107:937,109:938,93:1369,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vy1,$Vw1,{84:1370}),o($Vt2,$V71),o($Vt2,$V81),{20:[1,1374],22:[1,1378],23:1372,38:1371,202:1373,216:1375,217:[1,1377],218:[1,1376]},o($Vz1,$VJ1),o($Vz1,$VK1),o($Vz1,$VL1),o($Vz1,$VM1),o($VC1,$VN1),o($VO1,$VP1,{163:1379}),o($VQ1,$VR1),{121:[1,1380],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},{102:[1,1381]},o($Vz1,$VS1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),{102:[1,1383],108:1382,110:[1,1384],111:[1,1385],112:1386,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,1387]},o($Vx1,$Vh5),o($VZ4,$VK2,{86:952,194:953,85:1388,191:$V_4}),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1389,123:$VX2,150:$VY2,190:$VZ2}),o($VZ4,$VK2,{86:952,194:953,85:1390,191:$V_4}),o($VW3,$VO2,{101:606,97:1391,103:$VU3,104:$VR,105:$VS,106:$VT}),o($VX4,$VP2),o($VX4,$Vs3),o($VT3,$VS3),o($V26,$V14),o($VV3,$V24),o($V26,$V34,{37:1392,195:[1,1393]}),{20:$V44,22:$V54,131:1394,166:$V64,193:647,201:$V74,217:$V84},o($VT3,$V94),o($VW3,$V24),o($VT3,$V34,{37:1395,195:[1,1396]}),{20:$V44,22:$V54,131:1397,166:$V64,193:647,201:$V74,217:$V84},o($V36,$Va4),o($VX3,$V24),o($V36,$V34,{37:1398,195:[1,1399]}),{20:$V44,22:$V54,131:1400,166:$V64,193:647,201:$V74,217:$V84},o($VY3,$Vb4),o($VZ3,$Vc4),o($VZ3,$Vd4),o($VZ3,$Ve4),{102:[1,1401]},o($VZ3,$VS1),{102:[1,1403],108:1402,110:[1,1404],111:[1,1405],112:1406,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,1407]},{123:[1,1408]},o($VZ3,$Vy4),{20:[1,1411],22:[1,1413],89:1409,166:[1,1414],193:1410,217:[1,1412]},o($V$3,$VO3),o($V$3,$Vp2,{54:1415,55:[1,1416]}),o($VT3,$Vq2),o($VH,$VI,{67:1417,69:1418,74:1419,46:1420,80:1421,120:1425,53:$Vm1,55:$Vm1,72:$Vm1,81:[1,1422],82:[1,1423],83:[1,1424]}),o($VT3,$Vr2),o($VT3,$Vo1,{70:1426,66:1427,75:1428,94:1429,96:1430,97:1434,101:1435,98:[1,1431],99:[1,1432],100:[1,1433],103:$V46,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:1437,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($VT3,$Vs2),o($VV3,$Vw1,{84:1438}),o($VW3,$Vw1,{84:1439}),o($V36,$Vu2),o($V36,$Vv2),o($VY3,$VA1,{95:1440}),o($VV3,$VB1,{101:1000,97:1441,103:$V15,104:$VR,105:$VS,106:$VT}),o($VZ3,$VD1,{88:1442}),o($VZ3,$VD1,{88:1443}),o($VZ3,$VD1,{88:1444}),o($VW3,$VE1,{107:1006,109:1007,93:1445,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VX3,$Vw1,{84:1446}),o($V36,$V71),o($V36,$V81),{20:[1,1450],22:[1,1454],23:1448,38:1447,202:1449,216:1451,217:[1,1453],218:[1,1452]},o($VY3,$VJ1),o($VY3,$VK1),o($VY3,$VL1),o($VY3,$VM1),o($VZ3,$VN1),o($VO1,$VP1,{163:1455}),o($V_3,$VR1),{121:[1,1456],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},{102:[1,1457]},o($VY3,$VS1),o($VZ3,$VT1),o($VZ3,$VU1),o($VZ3,$VV1),o($VZ3,$VW1),{102:[1,1459],108:1458,110:[1,1460],111:[1,1461],112:1462,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,1463]},o($VT3,$Vq2),o($VH,$VI,{67:1464,69:1465,74:1466,46:1467,80:1468,120:1472,53:$Vm1,55:$Vm1,72:$Vm1,81:[1,1469],82:[1,1470],83:[1,1471]}),o($VT3,$Vr2),o($VT3,$Vo1,{70:1473,66:1474,75:1475,94:1476,96:1477,97:1481,101:1482,98:[1,1478],99:[1,1479],100:[1,1480],103:$V56,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:1484,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($VT3,$Vs2),o($VV3,$Vw1,{84:1485}),o($VW3,$Vw1,{84:1486}),o($V36,$Vu2),o($V36,$Vv2),o($VY3,$VA1,{95:1487}),o($VV3,$VB1,{101:1036,97:1488,103:$V25,104:$VR,105:$VS,106:$VT}),o($VZ3,$VD1,{88:1489}),o($VZ3,$VD1,{88:1490}),o($VZ3,$VD1,{88:1491}),o($VW3,$VE1,{107:1042,109:1043,93:1492,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VX3,$Vw1,{84:1493}),o($V36,$V71),o($V36,$V81),{20:[1,1497],22:[1,1501],23:1495,38:1494,202:1496,216:1498,217:[1,1500],218:[1,1499]},o($VY3,$VJ1),o($VY3,$VK1),o($VY3,$VL1),o($VY3,$VM1),o($VZ3,$VN1),o($VO1,$VP1,{163:1502}),o($V_3,$VR1),{121:[1,1503],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},{102:[1,1504]},o($VY3,$VS1),o($VZ3,$VT1),o($VZ3,$VU1),o($VZ3,$VV1),o($VZ3,$VW1),{102:[1,1506],108:1505,110:[1,1507],111:[1,1508],112:1509,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,1510]},{195:[1,1513],196:1511,197:[1,1512]},o($Vv1,$V66),o($Vv1,$V76),o($Vv1,$V86),o($Vv1,$VT1),o($Vv1,$VU1),o($Vv1,$VV1),o($Vv1,$VW1),o($Vv1,$VB4),o($Vv1,$VC4),o($Vv1,$VD4),o($Vv1,$VE4),o($Vv1,$VF4,{204:1514,205:1515,113:[1,1516]}),o($Vv1,$VG4),o($Vv1,$VH4),o($Vv1,$VI4),o($Vv1,$VJ4),o($Vv1,$VK4),o($Vv1,$VL4),o($Vv1,$VM4),o($Vv1,$VN4),o($Vv1,$VO4),o($V96,$Vx3),o($V96,$Vy3),o($V96,$Vz3),o($V96,$VA3),{195:[1,1519],196:1517,197:[1,1518]},o($Vx1,$V66),o($Vx1,$V76),o($Vx1,$V86),o($Vx1,$VT1),o($Vx1,$VU1),o($Vx1,$VV1),o($Vx1,$VW1),o($Vx1,$VB4),o($Vx1,$VC4),o($Vx1,$VD4),o($Vx1,$VE4),o($Vx1,$VF4,{204:1520,205:1521,113:[1,1522]}),o($Vx1,$VG4),o($Vx1,$VH4),o($Vx1,$VI4),o($Vx1,$VJ4),o($Vx1,$VK4),o($Vx1,$VL4),o($Vx1,$VM4),o($Vx1,$VN4),o($Vx1,$VO4),o($Va6,$Vx3),o($Va6,$Vy3),o($Va6,$Vz3),o($Va6,$VA3),{195:[1,1525],196:1523,197:[1,1524]},o($Vy1,$V66),o($Vy1,$V76),o($Vy1,$V86),o($Vy1,$VT1),o($Vy1,$VU1),o($Vy1,$VV1),o($Vy1,$VW1),o($Vy1,$VB4),o($Vy1,$VC4),o($Vy1,$VD4),o($Vy1,$VE4),o($Vy1,$VF4,{204:1526,205:1527,113:[1,1528]}),o($Vy1,$VG4),o($Vy1,$VH4),o($Vy1,$VI4),o($Vy1,$VJ4),o($Vy1,$VK4),o($Vy1,$VL4),o($Vy1,$VM4),o($Vy1,$VN4),o($Vy1,$VO4),o($Vb6,$Vx3),o($Vb6,$Vy3),o($Vb6,$Vz3),o($Vb6,$VA3),{20:[1,1531],22:[1,1533],89:1529,166:[1,1534],193:1530,217:[1,1532]},o($Vj4,$Vc6),o($Vj4,$Vd6),o($Vj4,$Ve6),o($Vs4,$Vf6),o($Vs4,$Vg6),o($Vs4,$Vh6),o($VC,$Vh,{48:1535,49:1536,57:1537,61:1538,42:1539,45:$VD}),o($Vi6,$Vw4),o($Vi6,$Vx4),o($Vi6,$VT1),o($Vi6,$VU1),o($Vi6,$VV1),o($Vi6,$VW1),{72:[1,1540]},{72:$Vf4},{72:$Vg4,135:1541,136:1542,137:$Vj6},{72:$Vi4},o($Vk6,$Vk4),o($Vk6,$Vl4),o($Vk6,$Vm4,{141:1544,144:1545,145:1548,142:$Vl6,143:$Vm6}),o($Vp4,$Vq4,{157:680,147:1549,152:1550,153:1551,156:1552,71:[1,1553],162:$Vr4}),o($Vn6,$Vt4),{20:[1,1557],22:[1,1561],23:1555,151:1554,202:1556,216:1558,217:[1,1560],218:[1,1559]},o($VD5,[2,193]),{20:$VE5,22:$VF5,23:1152,216:1156,217:$VU5},o($VD5,[2,195]),{102:$VG5,110:$VH5,111:$VI5,112:1163,182:1153,198:1157,199:1158,200:1159,203:1162,206:$VK5,207:$VL5,208:$VM5,209:$VN5,210:$VO5,211:$VP5,212:$VQ5,213:$VR5,214:$VS5,215:$VT5},o($VD5,[2,197]),{186:$VJ5},o($VD5,$Vo6,{181:1562,179:$Vp6}),o($VD5,$Vo6,{181:1564,179:$Vp6}),o($VD5,$Vo6,{181:1565,179:$Vp6}),o($Vq6,$Vr),o($Vq6,$Vs),o($Vq6,$VB4),o($Vq6,$VC4),o($Vq6,$VD4),o($Vq6,$Vu),o($Vq6,$Vv),o($Vq6,$VE4),o($Vq6,$VF4,{204:1566,205:1567,113:[1,1568]}),o($Vq6,$VG4),o($Vq6,$VH4),o($Vq6,$VI4),o($Vq6,$VJ4),o($Vq6,$VK4),o($Vq6,$VL4),o($Vq6,$VM4),o($Vq6,$VN4),o($Vq6,$VO4),o($Vr6,$Vx3),o($Vr6,$Vy3),o($Vr6,$Vz3),o($Vr6,$VA3),o($VO1,[2,204],{171:1569,180:$VA5}),o($VO1,[2,213],{173:1570,180:$VB5}),o($VO1,[2,221],{175:1571,180:$VC5}),o($VA4,$Vs6),o($VA4,$VN1),o($VA4,$VT1),o($VA4,$VU1),o($VA4,$VV1),o($VA4,$VW1),o($Vj1,$VI3),o($VH,$VI,{64:1572,66:1573,68:1574,69:1575,75:1578,77:1579,74:1580,46:1581,94:1582,96:1583,89:1585,90:1586,91:1587,80:1588,97:1595,193:1596,93:1598,120:1599,101:1600,107:1606,109:1607,20:[1,1602],22:[1,1604],28:[1,1597],71:[1,1576],73:[1,1577],81:[1,1589],82:[1,1590],83:[1,1591],87:[1,1584],98:[1,1592],99:[1,1593],100:[1,1594],103:$Vt6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,1605],217:[1,1603]}),o($VL2,$VK2,{86:1208,194:1209,85:1608,191:$VY5}),o($Vj1,$V42),o($Vj1,$Vm),o($Vj1,$Vn),o($Vj1,$Vr),o($Vj1,$Vs),o($Vj1,$Vt),o($Vj1,$Vu),o($Vj1,$Vv),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1609,123:$VX2,150:$VY2,190:$VZ2}),o($VL2,$VK2,{86:1208,194:1209,85:1610,191:$VY5}),o($Vx1,$VO2,{101:747,97:1611,103:$VQ4,104:$VR,105:$VS,106:$VT}),o($VC2,$VP2),o($VC2,$Vs3),o($Vj1,$VW4),o($V04,$V14),o($Vv1,$V24),o($V04,$V34,{37:1612,195:[1,1613]}),{20:$V44,22:$V54,131:1614,166:$V64,193:647,201:$V74,217:$V84},o($Vj1,$V94),o($Vx1,$V24),o($Vj1,$V34,{37:1615,195:[1,1616]}),{20:$V44,22:$V54,131:1617,166:$V64,193:647,201:$V74,217:$V84},o($Vz1,$Vb4),o($VC1,$Vc4),o($VC1,$Vd4),o($VC1,$Ve4),{102:[1,1618]},o($VC1,$VS1),{102:[1,1620],108:1619,110:[1,1621],111:[1,1622],112:1623,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,1624]},o($Vt2,$Va4),o($Vy1,$V24),o($Vt2,$V34,{37:1625,195:[1,1626]}),{20:$V44,22:$V54,131:1627,166:$V64,193:647,201:$V74,217:$V84},o($VC1,$Vy4),{123:[1,1628]},{20:[1,1631],22:[1,1633],89:1629,166:[1,1634],193:1630,217:[1,1632]},o($VL2,$VK2,{86:1246,194:1247,85:1635,191:$V_5}),o($Vj1,$V42),o($Vj1,$Vm),o($Vj1,$Vn),o($Vj1,$Vr),o($Vj1,$Vs),o($Vj1,$Vt),o($Vj1,$Vu),o($Vj1,$Vv),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1636,123:$VX2,150:$VY2,190:$VZ2}),o($VL2,$VK2,{86:1246,194:1247,85:1637,191:$V_5}),o($Vx1,$VO2,{101:794,97:1638,103:$VR4,104:$VR,105:$VS,106:$VT}),o($VC2,$VP2),o($VC2,$Vs3),o($Vj1,$VW4),o($V04,$V14),o($Vv1,$V24),o($V04,$V34,{37:1639,195:[1,1640]}),{20:$V44,22:$V54,131:1641,166:$V64,193:647,201:$V74,217:$V84},o($Vj1,$V94),o($Vx1,$V24),o($Vj1,$V34,{37:1642,195:[1,1643]}),{20:$V44,22:$V54,131:1644,166:$V64,193:647,201:$V74,217:$V84},o($Vz1,$Vb4),o($VC1,$Vc4),o($VC1,$Vd4),o($VC1,$Ve4),{102:[1,1645]},o($VC1,$VS1),{102:[1,1647],108:1646,110:[1,1648],111:[1,1649],112:1650,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,1651]},o($Vt2,$Va4),o($Vy1,$V24),o($Vt2,$V34,{37:1652,195:[1,1653]}),{20:$V44,22:$V54,131:1654,166:$V64,193:647,201:$V74,217:$V84},o($VC1,$Vy4),{123:[1,1655]},{20:[1,1658],22:[1,1660],89:1656,166:[1,1661],193:1657,217:[1,1659]},o($Vj1,$VW4),o($Vj1,$Va4),{123:[1,1662]},o($Vj1,$V14),o($VC2,$Vb4),o($VJ2,$V35),{20:$Vo,22:$Vp,23:1663,216:57,217:$Vq},{20:$Vu6,22:$Vv6,102:[1,1676],110:[1,1677],111:[1,1678],112:1675,166:$Vw6,182:1666,192:1664,193:1665,198:1671,199:1672,200:1673,203:1674,206:[1,1679],207:[1,1680],208:[1,1685],209:[1,1686],210:[1,1687],211:[1,1688],212:[1,1681],213:[1,1682],214:[1,1683],215:[1,1684],217:$Vx6},o($VL2,$V35),{20:$Vo,22:$Vp,23:1689,216:57,217:$Vq},{20:$Vy6,22:$Vz6,102:[1,1702],110:[1,1703],111:[1,1704],112:1701,166:$VA6,182:1692,192:1690,193:1691,198:1697,199:1698,200:1699,203:1700,206:[1,1705],207:[1,1706],208:[1,1711],209:[1,1712],210:[1,1713],211:[1,1714],212:[1,1707],213:[1,1708],214:[1,1709],215:[1,1710],217:$VB6},o($VN2,$V35),{20:$Vo,22:$Vp,23:1715,216:57,217:$Vq},{20:$VC6,22:$VD6,102:[1,1728],110:[1,1729],111:[1,1730],112:1727,166:$VE6,182:1718,192:1716,193:1717,198:1723,199:1724,200:1725,203:1726,206:[1,1731],207:[1,1732],208:[1,1737],209:[1,1738],210:[1,1739],211:[1,1740],212:[1,1733],213:[1,1734],214:[1,1735],215:[1,1736],217:$VF6},o($VC1,$Vs3),o($VC1,$Vt3),o($VC1,$Vu3),o($VC1,$Vv3),o($VC1,$Vw3),{113:[1,1741]},o($VC1,$VB3),o($Vy1,$Vh5),o($VQ1,$VX5),o($VQ1,$VN1),o($VQ1,$VT1),o($VQ1,$VU1),o($VQ1,$VV1),o($VQ1,$VW1),o($Vj1,$VP3),o($VC,$Vh,{56:1742,42:1743,45:$VD}),o($Vj1,$VQ3),o($Vj1,$Vz2),o($Vj1,$Vu2),o($Vj1,$Vv2),o($Vx1,$Vw1,{84:1744}),o($Vj1,$V71),o($Vj1,$V81),{20:[1,1748],22:[1,1752],23:1746,38:1745,202:1747,216:1749,217:[1,1751],218:[1,1750]},{121:[1,1753],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj1,$VR3),o($Vj1,$VB2),o($Vx1,$Vw1,{84:1754}),o($VC2,$VA1,{95:1755}),o($Vx1,$VB1,{101:1312,97:1756,103:$V06,104:$VR,105:$VS,106:$VT}),o($VC2,$VJ1),o($VC2,$VK1),o($VC2,$VL1),o($VC2,$VM1),{102:[1,1757]},o($VC2,$VS1),{72:[1,1758]},o($VJ2,$VK2,{85:1759,86:1760,194:1761,191:[1,1762]}),o($VL2,$VK2,{85:1763,86:1764,194:1765,191:$VG6}),o($Vv1,$VO2,{101:895,97:1767,103:$VU4,104:$VR,105:$VS,106:$VT}),o($Vz1,$VP2),o($Vx1,$VQ2,{92:1768,97:1769,93:1770,101:1771,107:1773,109:1774,103:$VH6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VS2,{92:1768,97:1769,93:1770,101:1771,107:1773,109:1774,103:$VH6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VT2,{92:1768,97:1769,93:1770,101:1771,107:1773,109:1774,103:$VH6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VQ1,$VU2),o($VN2,$VK2,{85:1775,86:1776,194:1777,191:[1,1778]}),o($Vt2,$V42),o($Vt2,$Vm),o($Vt2,$Vn),o($Vt2,$Vr),o($Vt2,$Vs),o($Vt2,$Vt),o($Vt2,$Vu),o($Vt2,$Vv),{20:$V83,22:$V93,23:415,29:[1,1779],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1780,123:$VX2,150:$VY2,190:$VZ2}),o($Vz1,$Vs3),o($VQ1,$Vt3),o($VQ1,$Vu3),o($VQ1,$Vv3),o($VQ1,$Vw3),{113:[1,1781]},o($VQ1,$VB3),o($Vj1,$VQ3),o($Vj1,$Vz2),o($Vj1,$Vu2),o($Vj1,$Vv2),o($Vx1,$Vw1,{84:1782}),o($Vj1,$V71),o($Vj1,$V81),{20:[1,1786],22:[1,1790],23:1784,38:1783,202:1785,216:1787,217:[1,1789],218:[1,1788]},{121:[1,1791],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj1,$VR3),o($Vj1,$VB2),o($Vx1,$Vw1,{84:1792}),o($VC2,$VA1,{95:1793}),o($Vx1,$VB1,{101:1359,97:1794,103:$V16,104:$VR,105:$VS,106:$VT}),o($VC2,$VJ1),o($VC2,$VK1),o($VC2,$VL1),o($VC2,$VM1),{102:[1,1795]},o($VC2,$VS1),{72:[1,1796]},o($VJ2,$VK2,{85:1797,86:1798,194:1799,191:[1,1800]}),o($VL2,$VK2,{85:1801,86:1802,194:1803,191:$VI6}),o($Vv1,$VO2,{101:931,97:1805,103:$VV4,104:$VR,105:$VS,106:$VT}),o($Vz1,$VP2),o($Vx1,$VQ2,{92:1806,97:1807,93:1808,101:1809,107:1811,109:1812,103:$VJ6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VS2,{92:1806,97:1807,93:1808,101:1809,107:1811,109:1812,103:$VJ6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VT2,{92:1806,97:1807,93:1808,101:1809,107:1811,109:1812,103:$VJ6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VQ1,$VU2),o($VN2,$VK2,{85:1813,86:1814,194:1815,191:[1,1816]}),o($Vt2,$V42),o($Vt2,$Vm),o($Vt2,$Vn),o($Vt2,$Vr),o($Vt2,$Vs),o($Vt2,$Vt),o($Vt2,$Vu),o($Vt2,$Vv),{20:$V83,22:$V93,23:415,29:[1,1817],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1818,123:$VX2,150:$VY2,190:$VZ2}),o($Vz1,$Vs3),o($VQ1,$Vt3),o($VQ1,$Vu3),o($VQ1,$Vv3),o($VQ1,$Vw3),{113:[1,1819]},o($VQ1,$VB3),o($VT3,$Va4),{123:[1,1820]},o($VT3,$V14),o($VX4,$Vb4),o($VY4,$V35),{20:$Vo,22:$Vp,23:1821,216:57,217:$Vq},{20:$VK6,22:$VL6,102:[1,1834],110:[1,1835],111:[1,1836],112:1833,166:$VM6,182:1824,192:1822,193:1823,198:1829,199:1830,200:1831,203:1832,206:[1,1837],207:[1,1838],208:[1,1843],209:[1,1844],210:[1,1845],211:[1,1846],212:[1,1839],213:[1,1840],214:[1,1841],215:[1,1842],217:$VN6},o($VZ4,$V35),{20:$Vo,22:$Vp,23:1847,216:57,217:$Vq},{20:$VO6,22:$VP6,102:[1,1860],110:[1,1861],111:[1,1862],112:1859,166:$VQ6,182:1850,192:1848,193:1849,198:1855,199:1856,200:1857,203:1858,206:[1,1863],207:[1,1864],208:[1,1869],209:[1,1870],210:[1,1871],211:[1,1872],212:[1,1865],213:[1,1866],214:[1,1867],215:[1,1868],217:$VR6},o($V$4,$V35),{20:$Vo,22:$Vp,23:1873,216:57,217:$Vq},{20:$VS6,22:$VT6,102:[1,1886],110:[1,1887],111:[1,1888],112:1885,166:$VU6,182:1876,192:1874,193:1875,198:1881,199:1882,200:1883,203:1884,206:[1,1889],207:[1,1890],208:[1,1895],209:[1,1896],210:[1,1897],211:[1,1898],212:[1,1891],213:[1,1892],214:[1,1893],215:[1,1894],217:$VV6},o($VZ3,$Vs3),o($VZ3,$Vt3),o($VZ3,$Vu3),o($VZ3,$Vv3),o($VZ3,$Vw3),{113:[1,1899]},o($VZ3,$VB3),o($VX3,$Vh5),o($V_3,$VX5),o($V_3,$VN1),o($V_3,$VT1),o($V_3,$VU1),o($V_3,$VV1),o($V_3,$VW1),o($VT3,$VP3),o($VC,$Vh,{56:1900,42:1901,45:$VD}),o($VT3,$VQ3),o($VT3,$Vz2),o($VT3,$Vu2),o($VT3,$Vv2),o($VW3,$Vw1,{84:1902}),o($VT3,$V71),o($VT3,$V81),{20:[1,1906],22:[1,1910],23:1904,38:1903,202:1905,216:1907,217:[1,1909],218:[1,1908]},{121:[1,1911],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($VT3,$VR3),o($VT3,$VB2),o($VW3,$Vw1,{84:1912}),o($VX4,$VA1,{95:1913}),o($VW3,$VB1,{101:1435,97:1914,103:$V46,104:$VR,105:$VS,106:$VT}),o($VX4,$VJ1),o($VX4,$VK1),o($VX4,$VL1),o($VX4,$VM1),{102:[1,1915]},o($VX4,$VS1),{72:[1,1916]},o($VY4,$VK2,{85:1917,86:1918,194:1919,191:[1,1920]}),o($VZ4,$VK2,{85:1921,86:1922,194:1923,191:$VW6}),o($VV3,$VO2,{101:1000,97:1925,103:$V15,104:$VR,105:$VS,106:$VT}),o($VY3,$VP2),o($VW3,$VQ2,{92:1926,97:1927,93:1928,101:1929,107:1931,109:1932,103:$VX6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VW3,$VS2,{92:1926,97:1927,93:1928,101:1929,107:1931,109:1932,103:$VX6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VW3,$VT2,{92:1926,97:1927,93:1928,101:1929,107:1931,109:1932,103:$VX6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V_3,$VU2),o($V$4,$VK2,{85:1933,86:1934,194:1935,191:[1,1936]}),o($V36,$V42),o($V36,$Vm),o($V36,$Vn),o($V36,$Vr),o($V36,$Vs),o($V36,$Vt),o($V36,$Vu),o($V36,$Vv),{20:$V83,22:$V93,23:415,29:[1,1937],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1938,123:$VX2,150:$VY2,190:$VZ2}),o($VY3,$Vs3),o($V_3,$Vt3),o($V_3,$Vu3),o($V_3,$Vv3),o($V_3,$Vw3),{113:[1,1939]},o($V_3,$VB3),o($VT3,$VQ3),o($VT3,$Vz2),o($VT3,$Vu2),o($VT3,$Vv2),o($VW3,$Vw1,{84:1940}),o($VT3,$V71),o($VT3,$V81),{20:[1,1944],22:[1,1948],23:1942,38:1941,202:1943,216:1945,217:[1,1947],218:[1,1946]},{121:[1,1949],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($VT3,$VR3),o($VT3,$VB2),o($VW3,$Vw1,{84:1950}),o($VX4,$VA1,{95:1951}),o($VW3,$VB1,{101:1482,97:1952,103:$V56,104:$VR,105:$VS,106:$VT}),o($VX4,$VJ1),o($VX4,$VK1),o($VX4,$VL1),o($VX4,$VM1),{102:[1,1953]},o($VX4,$VS1),{72:[1,1954]},o($VY4,$VK2,{85:1955,86:1956,194:1957,191:[1,1958]}),o($VZ4,$VK2,{85:1959,86:1960,194:1961,191:$VY6}),o($VV3,$VO2,{101:1036,97:1963,103:$V25,104:$VR,105:$VS,106:$VT}),o($VY3,$VP2),o($VW3,$VQ2,{92:1964,97:1965,93:1966,101:1967,107:1969,109:1970,103:$VZ6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VW3,$VS2,{92:1964,97:1965,93:1966,101:1967,107:1969,109:1970,103:$VZ6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VW3,$VT2,{92:1964,97:1965,93:1966,101:1967,107:1969,109:1970,103:$VZ6,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V_3,$VU2),o($V$4,$VK2,{85:1971,86:1972,194:1973,191:[1,1974]}),o($V36,$V42),o($V36,$Vm),o($V36,$Vn),o($V36,$Vr),o($V36,$Vs),o($V36,$Vt),o($V36,$Vu),o($V36,$Vv),{20:$V83,22:$V93,23:415,29:[1,1975],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:1976,123:$VX2,150:$VY2,190:$VZ2}),o($VY3,$Vs3),o($V_3,$Vt3),o($V_3,$Vu3),o($V_3,$Vv3),o($V_3,$Vw3),{113:[1,1977]},o($V_3,$VB3),o($VJ2,$V52),o($VJ2,$V62),o($VJ2,$V72),o($Vv1,$VV5),o($Vv1,$VW5),{20:$V45,22:$V55,89:1978,166:$V65,193:1979,217:$V75},o($VL2,$V52),o($VL2,$V62),o($VL2,$V72),o($Vx1,$VV5),o($Vx1,$VW5),{20:$V95,22:$Va5,89:1980,166:$Vb5,193:1981,217:$Vc5},o($VN2,$V52),o($VN2,$V62),o($VN2,$V72),o($Vy1,$VV5),o($Vy1,$VW5),{20:$Vd5,22:$Ve5,89:1982,166:$Vf5,193:1983,217:$Vg5},o($VC1,$VX5),o($VC1,$VN1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),o($V_6,$V$6,{154:1984,155:1985,158:$V07,159:$V17,160:$V27,161:$V37}),o($V47,$V57),o($V67,$V77,{58:1990}),o($V87,$V97,{62:1991}),o($VH,$VI,{65:1992,75:1993,77:1994,78:1995,94:1998,96:1999,89:2001,90:2002,91:2003,80:2004,46:2005,97:2009,193:2010,93:2012,120:2013,101:2017,107:2023,109:2024,20:[1,2019],22:[1,2021],28:[1,2011],71:[1,1996],73:[1,1997],81:[1,2014],82:[1,2015],83:[1,2016],87:[1,2000],98:[1,2006],99:[1,2007],100:[1,2008],103:$Va7,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,2022],217:[1,2020]}),o($V_6,$V$6,{155:1985,154:2025,158:$V07,159:$V17,160:$V27,161:$V37}),{72:$Vi5,136:2026,137:$Vj6},o($Vk6,$Vj5),o($VV2,$VW2,{149:388,138:1140,139:1141,140:1142,146:1143,148:1144,133:2027,150:$VY2,190:$Vw5}),o($Vk6,$Vk5),o($Vk6,$Vm4,{141:2028,145:2029,142:$Vl6,143:$Vm6}),o($VV2,$VW2,{149:388,146:1143,148:1144,140:2030,72:$Vl5,137:$Vl5,150:$VY2,190:$Vw5}),o($VV2,$VW2,{149:388,146:1143,148:1144,140:2031,72:$Vm5,137:$Vm5,150:$VY2,190:$Vw5}),o($Vn6,$Vn5),o($Vn6,$Vo5),o($Vn6,$Vp5),o($Vn6,$Vq5),{20:$Vr5,22:$Vs5,131:2032,166:$Vt5,193:1130,201:$Vu5,217:$Vv5},o($VV2,$VW2,{149:388,132:1137,133:1138,134:1139,138:1140,139:1141,140:1142,146:1143,148:1144,128:2033,150:$VY2,190:$Vw5}),o($Vn6,$Vx5),o($Vn6,$Vy5),o($Vn6,$Vz5),o($Vn6,$Vr),o($Vn6,$Vs),o($Vn6,$Vt),o($Vn6,$Vu),o($Vn6,$Vv),o($VD5,[2,207]),o($VD5,[2,209]),o($VD5,[2,216]),o($VD5,[2,224]),o($Vq6,$VV5),o($Vq6,$VW5),{20:[1,2036],22:[1,2038],89:2034,166:[1,2039],193:2035,217:[1,2037]},o($VD5,[2,203]),o($VD5,[2,212]),o($VD5,[2,220]),o($Vj1,$Vq2),o($Vj1,$Vm1,{67:2040,69:2041,74:2042,46:2043,80:2044,120:2048,81:[1,2045],82:[1,2046],83:[1,2047],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vr2),o($Vj1,$Vo1,{70:2049,66:2050,75:2051,94:2052,96:2053,97:2057,101:2058,98:[1,2054],99:[1,2055],100:[1,2056],103:$Vb7,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:2060,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vs2),o($Vv1,$Vw1,{84:2061}),o($Vx1,$Vw1,{84:2062}),o($Vt2,$Vu2),o($Vt2,$Vv2),o($Vz1,$VA1,{95:2063}),o($Vv1,$VB1,{101:1600,97:2064,103:$Vt6,104:$VR,105:$VS,106:$VT}),o($VC1,$VD1,{88:2065}),o($VC1,$VD1,{88:2066}),o($VC1,$VD1,{88:2067}),o($Vx1,$VE1,{107:1606,109:1607,93:2068,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vy1,$Vw1,{84:2069}),o($Vt2,$V71),o($Vt2,$V81),{20:[1,2073],22:[1,2077],23:2071,38:2070,202:2072,216:2074,217:[1,2076],218:[1,2075]},o($Vz1,$VJ1),o($Vz1,$VK1),o($Vz1,$VL1),o($Vz1,$VM1),o($VC1,$VN1),o($VO1,$VP1,{163:2078}),o($VQ1,$VR1),{121:[1,2079],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},{102:[1,2080]},o($Vz1,$VS1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),{102:[1,2082],108:2081,110:[1,2083],111:[1,2084],112:2085,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,2086]},o($Vj1,$Va4),{123:[1,2087]},o($Vj1,$V14),o($VC2,$Vb4),o($VJ2,$V35),{20:$Vo,22:$Vp,23:2088,216:57,217:$Vq},{20:$Vc7,22:$Vd7,102:[1,2101],110:[1,2102],111:[1,2103],112:2100,166:$Ve7,182:2091,192:2089,193:2090,198:2096,199:2097,200:2098,203:2099,206:[1,2104],207:[1,2105],208:[1,2110],209:[1,2111],210:[1,2112],211:[1,2113],212:[1,2106],213:[1,2107],214:[1,2108],215:[1,2109],217:$Vf7},o($VL2,$V35),{20:$Vo,22:$Vp,23:2114,216:57,217:$Vq},{20:$Vg7,22:$Vh7,102:[1,2127],110:[1,2128],111:[1,2129],112:2126,166:$Vi7,182:2117,192:2115,193:2116,198:2122,199:2123,200:2124,203:2125,206:[1,2130],207:[1,2131],208:[1,2136],209:[1,2137],210:[1,2138],211:[1,2139],212:[1,2132],213:[1,2133],214:[1,2134],215:[1,2135],217:$Vj7},o($VC1,$Vs3),o($VC1,$Vt3),o($VC1,$Vu3),o($VC1,$Vv3),o($VC1,$Vw3),{113:[1,2140]},o($VC1,$VB3),o($VN2,$V35),{20:$Vo,22:$Vp,23:2141,216:57,217:$Vq},{20:$Vk7,22:$Vl7,102:[1,2154],110:[1,2155],111:[1,2156],112:2153,166:$Vm7,182:2144,192:2142,193:2143,198:2149,199:2150,200:2151,203:2152,206:[1,2157],207:[1,2158],208:[1,2163],209:[1,2164],210:[1,2165],211:[1,2166],212:[1,2159],213:[1,2160],214:[1,2161],215:[1,2162],217:$Vn7},o($Vy1,$Vh5),o($VQ1,$VX5),o($VQ1,$VN1),o($VQ1,$VT1),o($VQ1,$VU1),o($VQ1,$VV1),o($VQ1,$VW1),o($Vj1,$Va4),{123:[1,2167]},o($Vj1,$V14),o($VC2,$Vb4),o($VJ2,$V35),{20:$Vo,22:$Vp,23:2168,216:57,217:$Vq},{20:$Vo7,22:$Vp7,102:[1,2181],110:[1,2182],111:[1,2183],112:2180,166:$Vq7,182:2171,192:2169,193:2170,198:2176,199:2177,200:2178,203:2179,206:[1,2184],207:[1,2185],208:[1,2190],209:[1,2191],210:[1,2192],211:[1,2193],212:[1,2186],213:[1,2187],214:[1,2188],215:[1,2189],217:$Vr7},o($VL2,$V35),{20:$Vo,22:$Vp,23:2194,216:57,217:$Vq},{20:$Vs7,22:$Vt7,102:[1,2207],110:[1,2208],111:[1,2209],112:2206,166:$Vu7,182:2197,192:2195,193:2196,198:2202,199:2203,200:2204,203:2205,206:[1,2210],207:[1,2211],208:[1,2216],209:[1,2217],210:[1,2218],211:[1,2219],212:[1,2212],213:[1,2213],214:[1,2214],215:[1,2215],217:$Vv7},o($VC1,$Vs3),o($VC1,$Vt3),o($VC1,$Vu3),o($VC1,$Vv3),o($VC1,$Vw3),{113:[1,2220]},o($VC1,$VB3),o($VN2,$V35),{20:$Vo,22:$Vp,23:2221,216:57,217:$Vq},{20:$Vw7,22:$Vx7,102:[1,2234],110:[1,2235],111:[1,2236],112:2233,166:$Vy7,182:2224,192:2222,193:2223,198:2229,199:2230,200:2231,203:2232,206:[1,2237],207:[1,2238],208:[1,2243],209:[1,2244],210:[1,2245],211:[1,2246],212:[1,2239],213:[1,2240],214:[1,2241],215:[1,2242],217:$Vz7},o($Vy1,$Vh5),o($VQ1,$VX5),o($VQ1,$VN1),o($VQ1,$VT1),o($VQ1,$VU1),o($VQ1,$VV1),o($VQ1,$VW1),o($Vx1,$Vh5),{195:[1,2249],196:2247,197:[1,2248]},o($Vv1,$V66),o($Vv1,$V76),o($Vv1,$V86),o($Vv1,$VT1),o($Vv1,$VU1),o($Vv1,$VV1),o($Vv1,$VW1),o($Vv1,$VB4),o($Vv1,$VC4),o($Vv1,$VD4),o($Vv1,$VE4),o($Vv1,$VF4,{204:2250,205:2251,113:[1,2252]}),o($Vv1,$VG4),o($Vv1,$VH4),o($Vv1,$VI4),o($Vv1,$VJ4),o($Vv1,$VK4),o($Vv1,$VL4),o($Vv1,$VM4),o($Vv1,$VN4),o($Vv1,$VO4),o($V96,$Vx3),o($V96,$Vy3),o($V96,$Vz3),o($V96,$VA3),{195:[1,2255],196:2253,197:[1,2254]},o($Vx1,$V66),o($Vx1,$V76),o($Vx1,$V86),o($Vx1,$VT1),o($Vx1,$VU1),o($Vx1,$VV1),o($Vx1,$VW1),o($Vx1,$VB4),o($Vx1,$VC4),o($Vx1,$VD4),o($Vx1,$VE4),o($Vx1,$VF4,{204:2256,205:2257,113:[1,2258]}),o($Vx1,$VG4),o($Vx1,$VH4),o($Vx1,$VI4),o($Vx1,$VJ4),o($Vx1,$VK4),o($Vx1,$VL4),o($Vx1,$VM4),o($Vx1,$VN4),o($Vx1,$VO4),o($Va6,$Vx3),o($Va6,$Vy3),o($Va6,$Vz3),o($Va6,$VA3),{195:[1,2261],196:2259,197:[1,2260]},o($Vy1,$V66),o($Vy1,$V76),o($Vy1,$V86),o($Vy1,$VT1),o($Vy1,$VU1),o($Vy1,$VV1),o($Vy1,$VW1),o($Vy1,$VB4),o($Vy1,$VC4),o($Vy1,$VD4),o($Vy1,$VE4),o($Vy1,$VF4,{204:2262,205:2263,113:[1,2264]}),o($Vy1,$VG4),o($Vy1,$VH4),o($Vy1,$VI4),o($Vy1,$VJ4),o($Vy1,$VK4),o($Vy1,$VL4),o($Vy1,$VM4),o($Vy1,$VN4),o($Vy1,$VO4),o($Vb6,$Vx3),o($Vb6,$Vy3),o($Vb6,$Vz3),o($Vb6,$VA3),{20:[1,2267],22:[1,2269],89:2265,166:[1,2270],193:2266,217:[1,2268]},o($Vj1,$VI3),o($VH,$VI,{64:2271,66:2272,68:2273,69:2274,75:2277,77:2278,74:2279,46:2280,94:2281,96:2282,89:2284,90:2285,91:2286,80:2287,97:2294,193:2295,93:2297,120:2298,101:2299,107:2305,109:2306,20:[1,2301],22:[1,2303],28:[1,2296],71:[1,2275],73:[1,2276],81:[1,2288],82:[1,2289],83:[1,2290],87:[1,2283],98:[1,2291],99:[1,2292],100:[1,2293],103:$VA7,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,2304],217:[1,2302]}),o($VL2,$VK2,{86:1764,194:1765,85:2307,191:$VG6}),o($Vj1,$V42),o($Vj1,$Vm),o($Vj1,$Vn),o($Vj1,$Vr),o($Vj1,$Vs),o($Vj1,$Vt),o($Vj1,$Vu),o($Vj1,$Vv),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:2308,123:$VX2,150:$VY2,190:$VZ2}),o($VL2,$VK2,{86:1764,194:1765,85:2309,191:$VG6}),o($Vx1,$VO2,{101:1312,97:2310,103:$V06,104:$VR,105:$VS,106:$VT}),o($VC2,$VP2),o($VC2,$Vs3),o($Vj1,$VW4),o($V04,$V14),o($Vv1,$V24),o($V04,$V34,{37:2311,195:[1,2312]}),{20:$V44,22:$V54,131:2313,166:$V64,193:647,201:$V74,217:$V84},o($Vj1,$V94),o($Vx1,$V24),o($Vj1,$V34,{37:2314,195:[1,2315]}),{20:$V44,22:$V54,131:2316,166:$V64,193:647,201:$V74,217:$V84},o($Vz1,$Vb4),o($VC1,$Vc4),o($VC1,$Vd4),o($VC1,$Ve4),{102:[1,2317]},o($VC1,$VS1),{102:[1,2319],108:2318,110:[1,2320],111:[1,2321],112:2322,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,2323]},o($Vt2,$Va4),o($Vy1,$V24),o($Vt2,$V34,{37:2324,195:[1,2325]}),{20:$V44,22:$V54,131:2326,166:$V64,193:647,201:$V74,217:$V84},o($VC1,$Vy4),{123:[1,2327]},{20:[1,2330],22:[1,2332],89:2328,166:[1,2333],193:2329,217:[1,2331]},o($VL2,$VK2,{86:1802,194:1803,85:2334,191:$VI6}),o($Vj1,$V42),o($Vj1,$Vm),o($Vj1,$Vn),o($Vj1,$Vr),o($Vj1,$Vs),o($Vj1,$Vt),o($Vj1,$Vu),o($Vj1,$Vv),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:2335,123:$VX2,150:$VY2,190:$VZ2}),o($VL2,$VK2,{86:1802,194:1803,85:2336,191:$VI6}),o($Vx1,$VO2,{101:1359,97:2337,103:$V16,104:$VR,105:$VS,106:$VT}),o($VC2,$VP2),o($VC2,$Vs3),o($Vj1,$VW4),o($V04,$V14),o($Vv1,$V24),o($V04,$V34,{37:2338,195:[1,2339]}),{20:$V44,22:$V54,131:2340,166:$V64,193:647,201:$V74,217:$V84},o($Vj1,$V94),o($Vx1,$V24),o($Vj1,$V34,{37:2341,195:[1,2342]}),{20:$V44,22:$V54,131:2343,166:$V64,193:647,201:$V74,217:$V84},o($Vz1,$Vb4),o($VC1,$Vc4),o($VC1,$Vd4),o($VC1,$Ve4),{102:[1,2344]},o($VC1,$VS1),{102:[1,2346],108:2345,110:[1,2347],111:[1,2348],112:2349,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,2350]},o($Vt2,$Va4),o($Vy1,$V24),o($Vt2,$V34,{37:2351,195:[1,2352]}),{20:$V44,22:$V54,131:2353,166:$V64,193:647,201:$V74,217:$V84},o($VC1,$Vy4),{123:[1,2354]},{20:[1,2357],22:[1,2359],89:2355,166:[1,2360],193:2356,217:[1,2358]},o($VW3,$Vh5),{195:[1,2363],196:2361,197:[1,2362]},o($VV3,$V66),o($VV3,$V76),o($VV3,$V86),o($VV3,$VT1),o($VV3,$VU1),o($VV3,$VV1),o($VV3,$VW1),o($VV3,$VB4),o($VV3,$VC4),o($VV3,$VD4),o($VV3,$VE4),o($VV3,$VF4,{204:2364,205:2365,113:[1,2366]}),o($VV3,$VG4),o($VV3,$VH4),o($VV3,$VI4),o($VV3,$VJ4),o($VV3,$VK4),o($VV3,$VL4),o($VV3,$VM4),o($VV3,$VN4),o($VV3,$VO4),o($VB7,$Vx3),o($VB7,$Vy3),o($VB7,$Vz3),o($VB7,$VA3),{195:[1,2369],196:2367,197:[1,2368]},o($VW3,$V66),o($VW3,$V76),o($VW3,$V86),o($VW3,$VT1),o($VW3,$VU1),o($VW3,$VV1),o($VW3,$VW1),o($VW3,$VB4),o($VW3,$VC4),o($VW3,$VD4),o($VW3,$VE4),o($VW3,$VF4,{204:2370,205:2371,113:[1,2372]}),o($VW3,$VG4),o($VW3,$VH4),o($VW3,$VI4),o($VW3,$VJ4),o($VW3,$VK4),o($VW3,$VL4),o($VW3,$VM4),o($VW3,$VN4),o($VW3,$VO4),o($VC7,$Vx3),o($VC7,$Vy3),o($VC7,$Vz3),o($VC7,$VA3),{195:[1,2375],196:2373,197:[1,2374]},o($VX3,$V66),o($VX3,$V76),o($VX3,$V86),o($VX3,$VT1),o($VX3,$VU1),o($VX3,$VV1),o($VX3,$VW1),o($VX3,$VB4),o($VX3,$VC4),o($VX3,$VD4),o($VX3,$VE4),o($VX3,$VF4,{204:2376,205:2377,113:[1,2378]}),o($VX3,$VG4),o($VX3,$VH4),o($VX3,$VI4),o($VX3,$VJ4),o($VX3,$VK4),o($VX3,$VL4),o($VX3,$VM4),o($VX3,$VN4),o($VX3,$VO4),o($VD7,$Vx3),o($VD7,$Vy3),o($VD7,$Vz3),o($VD7,$VA3),{20:[1,2381],22:[1,2383],89:2379,166:[1,2384],193:2380,217:[1,2382]},o($VT3,$VI3),o($VH,$VI,{64:2385,66:2386,68:2387,69:2388,75:2391,77:2392,74:2393,46:2394,94:2395,96:2396,89:2398,90:2399,91:2400,80:2401,97:2408,193:2409,93:2411,120:2412,101:2413,107:2419,109:2420,20:[1,2415],22:[1,2417],28:[1,2410],71:[1,2389],73:[1,2390],81:[1,2402],82:[1,2403],83:[1,2404],87:[1,2397],98:[1,2405],99:[1,2406],100:[1,2407],103:$VE7,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,2418],217:[1,2416]}),o($VZ4,$VK2,{86:1922,194:1923,85:2421,191:$VW6}),o($VT3,$V42),o($VT3,$Vm),o($VT3,$Vn),o($VT3,$Vr),o($VT3,$Vs),o($VT3,$Vt),o($VT3,$Vu),o($VT3,$Vv),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:2422,123:$VX2,150:$VY2,190:$VZ2}),o($VZ4,$VK2,{86:1922,194:1923,85:2423,191:$VW6}),o($VW3,$VO2,{101:1435,97:2424,103:$V46,104:$VR,105:$VS,106:$VT}),o($VX4,$VP2),o($VX4,$Vs3),o($VT3,$VW4),o($V26,$V14),o($VV3,$V24),o($V26,$V34,{37:2425,195:[1,2426]}),{20:$V44,22:$V54,131:2427,166:$V64,193:647,201:$V74,217:$V84},o($VT3,$V94),o($VW3,$V24),o($VT3,$V34,{37:2428,195:[1,2429]}),{20:$V44,22:$V54,131:2430,166:$V64,193:647,201:$V74,217:$V84},o($VY3,$Vb4),o($VZ3,$Vc4),o($VZ3,$Vd4),o($VZ3,$Ve4),{102:[1,2431]},o($VZ3,$VS1),{102:[1,2433],108:2432,110:[1,2434],111:[1,2435],112:2436,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,2437]},o($V36,$Va4),o($VX3,$V24),o($V36,$V34,{37:2438,195:[1,2439]}),{20:$V44,22:$V54,131:2440,166:$V64,193:647,201:$V74,217:$V84},o($VZ3,$Vy4),{123:[1,2441]},{20:[1,2444],22:[1,2446],89:2442,166:[1,2447],193:2443,217:[1,2445]},o($VZ4,$VK2,{86:1960,194:1961,85:2448,191:$VY6}),o($VT3,$V42),o($VT3,$Vm),o($VT3,$Vn),o($VT3,$Vr),o($VT3,$Vs),o($VT3,$Vt),o($VT3,$Vu),o($VT3,$Vv),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:2449,123:$VX2,150:$VY2,190:$VZ2}),o($VZ4,$VK2,{86:1960,194:1961,85:2450,191:$VY6}),o($VW3,$VO2,{101:1482,97:2451,103:$V56,104:$VR,105:$VS,106:$VT}),o($VX4,$VP2),o($VX4,$Vs3),o($VT3,$VW4),o($V26,$V14),o($VV3,$V24),o($V26,$V34,{37:2452,195:[1,2453]}),{20:$V44,22:$V54,131:2454,166:$V64,193:647,201:$V74,217:$V84},o($VT3,$V94),o($VW3,$V24),o($VT3,$V34,{37:2455,195:[1,2456]}),{20:$V44,22:$V54,131:2457,166:$V64,193:647,201:$V74,217:$V84},o($VY3,$Vb4),o($VZ3,$Vc4),o($VZ3,$Vd4),o($VZ3,$Ve4),{102:[1,2458]},o($VZ3,$VS1),{102:[1,2460],108:2459,110:[1,2461],111:[1,2462],112:2463,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,2464]},o($V36,$Va4),o($VX3,$V24),o($V36,$V34,{37:2465,195:[1,2466]}),{20:$V44,22:$V54,131:2467,166:$V64,193:647,201:$V74,217:$V84},o($VZ3,$Vy4),{123:[1,2468]},{20:[1,2471],22:[1,2473],89:2469,166:[1,2474],193:2470,217:[1,2472]},o($Vv1,$Vs6),o($Vv1,$VN1),o($Vx1,$Vs6),o($Vx1,$VN1),o($Vy1,$Vs6),o($Vy1,$VN1),o($V_6,$Vw1,{84:2475}),o($V_6,$VF7),o($V_6,$VG7),o($V_6,$VH7),o($V_6,$VI7),o($V_6,$VJ7),o($V47,$VK7,{59:2476,53:[1,2477]}),o($V67,$VL7,{63:2478,55:[1,2479]}),o($V87,$VM7),o($V87,$VN7,{76:2480,78:2481,80:2482,46:2483,120:2484,81:[1,2485],82:[1,2486],83:[1,2487],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($V87,$VO7),o($V87,$VP7,{79:2488,75:2489,94:2490,96:2491,97:2495,101:2496,98:[1,2492],99:[1,2493],100:[1,2494],103:$VQ7,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:2498,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($V87,$VR7),o($VS7,$VA1,{95:2499}),o($VT7,$VB1,{101:2017,97:2500,103:$Va7,104:$VR,105:$VS,106:$VT}),o($VU7,$VD1,{88:2501}),o($VU7,$VD1,{88:2502}),o($VU7,$VD1,{88:2503}),o($V87,$VE1,{107:2023,109:2024,93:2504,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VV7,$VW7),o($VV7,$VX7),o($VS7,$VJ1),o($VS7,$VK1),o($VS7,$VL1),o($VS7,$VM1),o($VU7,$VN1),o($VO1,$VP1,{163:2505}),o($VY7,$VR1),{121:[1,2506],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($VV7,$V71),o($VV7,$V81),{20:[1,2510],22:[1,2514],23:2508,38:2507,202:2509,216:2511,217:[1,2513],218:[1,2512]},{102:[1,2515]},o($VS7,$VS1),o($VU7,$VT1),o($VU7,$VU1),o($VU7,$VV1),o($VU7,$VW1),{102:[1,2517],108:2516,110:[1,2518],111:[1,2519],112:2520,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,2521]},o($V_6,$Vw1,{84:2522}),o($Vk6,$Vc6),o($Vk6,$Vd6),o($Vk6,$Ve6),o($Vn6,$Vf6),o($Vn6,$Vg6),o($Vn6,$Vh6),o($VC,$Vh,{48:2523,49:2524,57:2525,61:2526,42:2527,45:$VD}),{72:[1,2528]},o($Vq6,$Vs6),o($Vq6,$VN1),o($Vq6,$VT1),o($Vq6,$VU1),o($Vq6,$VV1),o($Vq6,$VW1),o($Vj1,$VQ3),o($Vj1,$Vz2),o($Vj1,$Vu2),o($Vj1,$Vv2),o($Vx1,$Vw1,{84:2529}),o($Vj1,$V71),o($Vj1,$V81),{20:[1,2533],22:[1,2537],23:2531,38:2530,202:2532,216:2534,217:[1,2536],218:[1,2535]},{121:[1,2538],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj1,$VR3),o($Vj1,$VB2),o($Vx1,$Vw1,{84:2539}),o($VC2,$VA1,{95:2540}),o($Vx1,$VB1,{101:2058,97:2541,103:$Vb7,104:$VR,105:$VS,106:$VT}),o($VC2,$VJ1),o($VC2,$VK1),o($VC2,$VL1),o($VC2,$VM1),{102:[1,2542]},o($VC2,$VS1),{72:[1,2543]},o($VJ2,$VK2,{85:2544,86:2545,194:2546,191:[1,2547]}),o($VL2,$VK2,{85:2548,86:2549,194:2550,191:$VZ7}),o($Vv1,$VO2,{101:1600,97:2552,103:$Vt6,104:$VR,105:$VS,106:$VT}),o($Vz1,$VP2),o($Vx1,$VQ2,{92:2553,97:2554,93:2555,101:2556,107:2558,109:2559,103:$V_7,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VS2,{92:2553,97:2554,93:2555,101:2556,107:2558,109:2559,103:$V_7,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VT2,{92:2553,97:2554,93:2555,101:2556,107:2558,109:2559,103:$V_7,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VQ1,$VU2),o($VN2,$VK2,{85:2560,86:2561,194:2562,191:[1,2563]}),o($Vt2,$V42),o($Vt2,$Vm),o($Vt2,$Vn),o($Vt2,$Vr),o($Vt2,$Vs),o($Vt2,$Vt),o($Vt2,$Vu),o($Vt2,$Vv),{20:$V83,22:$V93,23:415,29:[1,2564],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:2565,123:$VX2,150:$VY2,190:$VZ2}),o($Vz1,$Vs3),o($VQ1,$Vt3),o($VQ1,$Vu3),o($VQ1,$Vv3),o($VQ1,$Vw3),{113:[1,2566]},o($VQ1,$VB3),o($Vx1,$Vh5),{195:[1,2569],196:2567,197:[1,2568]},o($Vv1,$V66),o($Vv1,$V76),o($Vv1,$V86),o($Vv1,$VT1),o($Vv1,$VU1),o($Vv1,$VV1),o($Vv1,$VW1),o($Vv1,$VB4),o($Vv1,$VC4),o($Vv1,$VD4),o($Vv1,$VE4),o($Vv1,$VF4,{204:2570,205:2571,113:[1,2572]}),o($Vv1,$VG4),o($Vv1,$VH4),o($Vv1,$VI4),o($Vv1,$VJ4),o($Vv1,$VK4),o($Vv1,$VL4),o($Vv1,$VM4),o($Vv1,$VN4),o($Vv1,$VO4),o($V96,$Vx3),o($V96,$Vy3),o($V96,$Vz3),o($V96,$VA3),{195:[1,2575],196:2573,197:[1,2574]},o($Vx1,$V66),o($Vx1,$V76),o($Vx1,$V86),o($Vx1,$VT1),o($Vx1,$VU1),o($Vx1,$VV1),o($Vx1,$VW1),o($Vx1,$VB4),o($Vx1,$VC4),o($Vx1,$VD4),o($Vx1,$VE4),o($Vx1,$VF4,{204:2576,205:2577,113:[1,2578]}),o($Vx1,$VG4),o($Vx1,$VH4),o($Vx1,$VI4),o($Vx1,$VJ4),o($Vx1,$VK4),o($Vx1,$VL4),o($Vx1,$VM4),o($Vx1,$VN4),o($Vx1,$VO4),o($Va6,$Vx3),o($Va6,$Vy3),o($Va6,$Vz3),o($Va6,$VA3),{20:[1,2581],22:[1,2583],89:2579,166:[1,2584],193:2580,217:[1,2582]},{195:[1,2587],196:2585,197:[1,2586]},o($Vy1,$V66),o($Vy1,$V76),o($Vy1,$V86),o($Vy1,$VT1),o($Vy1,$VU1),o($Vy1,$VV1),o($Vy1,$VW1),o($Vy1,$VB4),o($Vy1,$VC4),o($Vy1,$VD4),o($Vy1,$VE4),o($Vy1,$VF4,{204:2588,205:2589,113:[1,2590]}),o($Vy1,$VG4),o($Vy1,$VH4),o($Vy1,$VI4),o($Vy1,$VJ4),o($Vy1,$VK4),o($Vy1,$VL4),o($Vy1,$VM4),o($Vy1,$VN4),o($Vy1,$VO4),o($Vb6,$Vx3),o($Vb6,$Vy3),o($Vb6,$Vz3),o($Vb6,$VA3),o($Vx1,$Vh5),{195:[1,2593],196:2591,197:[1,2592]},o($Vv1,$V66),o($Vv1,$V76),o($Vv1,$V86),o($Vv1,$VT1),o($Vv1,$VU1),o($Vv1,$VV1),o($Vv1,$VW1),o($Vv1,$VB4),o($Vv1,$VC4),o($Vv1,$VD4),o($Vv1,$VE4),o($Vv1,$VF4,{204:2594,205:2595,113:[1,2596]}),o($Vv1,$VG4),o($Vv1,$VH4),o($Vv1,$VI4),o($Vv1,$VJ4),o($Vv1,$VK4),o($Vv1,$VL4),o($Vv1,$VM4),o($Vv1,$VN4),o($Vv1,$VO4),o($V96,$Vx3),o($V96,$Vy3),o($V96,$Vz3),o($V96,$VA3),{195:[1,2599],196:2597,197:[1,2598]},o($Vx1,$V66),o($Vx1,$V76),o($Vx1,$V86),o($Vx1,$VT1),o($Vx1,$VU1),o($Vx1,$VV1),o($Vx1,$VW1),o($Vx1,$VB4),o($Vx1,$VC4),o($Vx1,$VD4),o($Vx1,$VE4),o($Vx1,$VF4,{204:2600,205:2601,113:[1,2602]}),o($Vx1,$VG4),o($Vx1,$VH4),o($Vx1,$VI4),o($Vx1,$VJ4),o($Vx1,$VK4),o($Vx1,$VL4),o($Vx1,$VM4),o($Vx1,$VN4),o($Vx1,$VO4),o($Va6,$Vx3),o($Va6,$Vy3),o($Va6,$Vz3),o($Va6,$VA3),{20:[1,2605],22:[1,2607],89:2603,166:[1,2608],193:2604,217:[1,2606]},{195:[1,2611],196:2609,197:[1,2610]},o($Vy1,$V66),o($Vy1,$V76),o($Vy1,$V86),o($Vy1,$VT1),o($Vy1,$VU1),o($Vy1,$VV1),o($Vy1,$VW1),o($Vy1,$VB4),o($Vy1,$VC4),o($Vy1,$VD4),o($Vy1,$VE4),o($Vy1,$VF4,{204:2612,205:2613,113:[1,2614]}),o($Vy1,$VG4),o($Vy1,$VH4),o($Vy1,$VI4),o($Vy1,$VJ4),o($Vy1,$VK4),o($Vy1,$VL4),o($Vy1,$VM4),o($Vy1,$VN4),o($Vy1,$VO4),o($Vb6,$Vx3),o($Vb6,$Vy3),o($Vb6,$Vz3),o($Vb6,$VA3),o($VJ2,$V52),o($VJ2,$V62),o($VJ2,$V72),o($Vv1,$VV5),o($Vv1,$VW5),{20:$Vu6,22:$Vv6,89:2615,166:$Vw6,193:2616,217:$Vx6},o($VL2,$V52),o($VL2,$V62),o($VL2,$V72),o($Vx1,$VV5),o($Vx1,$VW5),{20:$Vy6,22:$Vz6,89:2617,166:$VA6,193:2618,217:$VB6},o($VN2,$V52),o($VN2,$V62),o($VN2,$V72),o($Vy1,$VV5),o($Vy1,$VW5),{20:$VC6,22:$VD6,89:2619,166:$VE6,193:2620,217:$VF6},o($VC1,$VX5),o($VC1,$VN1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),o($Vj1,$Vq2),o($Vj1,$Vm1,{67:2621,69:2622,74:2623,46:2624,80:2625,120:2629,81:[1,2626],82:[1,2627],83:[1,2628],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($Vj1,$Vr2),o($Vj1,$Vo1,{70:2630,66:2631,75:2632,94:2633,96:2634,97:2638,101:2639,98:[1,2635],99:[1,2636],100:[1,2637],103:$V$7,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:2641,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($Vj1,$Vs2),o($Vv1,$Vw1,{84:2642}),o($Vx1,$Vw1,{84:2643}),o($Vt2,$Vu2),o($Vt2,$Vv2),o($Vz1,$VA1,{95:2644}),o($Vv1,$VB1,{101:2299,97:2645,103:$VA7,104:$VR,105:$VS,106:$VT}),o($VC1,$VD1,{88:2646}),o($VC1,$VD1,{88:2647}),o($VC1,$VD1,{88:2648}),o($Vx1,$VE1,{107:2305,109:2306,93:2649,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vy1,$Vw1,{84:2650}),o($Vt2,$V71),o($Vt2,$V81),{20:[1,2654],22:[1,2658],23:2652,38:2651,202:2653,216:2655,217:[1,2657],218:[1,2656]},o($Vz1,$VJ1),o($Vz1,$VK1),o($Vz1,$VL1),o($Vz1,$VM1),o($VC1,$VN1),o($VO1,$VP1,{163:2659}),o($VQ1,$VR1),{121:[1,2660],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},{102:[1,2661]},o($Vz1,$VS1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),{102:[1,2663],108:2662,110:[1,2664],111:[1,2665],112:2666,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,2667]},o($Vj1,$Va4),{123:[1,2668]},o($Vj1,$V14),o($VC2,$Vb4),o($VJ2,$V35),{20:$Vo,22:$Vp,23:2669,216:57,217:$Vq},{20:$V08,22:$V18,102:[1,2682],110:[1,2683],111:[1,2684],112:2681,166:$V28,182:2672,192:2670,193:2671,198:2677,199:2678,200:2679,203:2680,206:[1,2685],207:[1,2686],208:[1,2691],209:[1,2692],210:[1,2693],211:[1,2694],212:[1,2687],213:[1,2688],214:[1,2689],215:[1,2690],217:$V38},o($VL2,$V35),{20:$Vo,22:$Vp,23:2695,216:57,217:$Vq},{20:$V48,22:$V58,102:[1,2708],110:[1,2709],111:[1,2710],112:2707,166:$V68,182:2698,192:2696,193:2697,198:2703,199:2704,200:2705,203:2706,206:[1,2711],207:[1,2712],208:[1,2717],209:[1,2718],210:[1,2719],211:[1,2720],212:[1,2713],213:[1,2714],214:[1,2715],215:[1,2716],217:$V78},o($VC1,$Vs3),o($VC1,$Vt3),o($VC1,$Vu3),o($VC1,$Vv3),o($VC1,$Vw3),{113:[1,2721]},o($VC1,$VB3),o($VN2,$V35),{20:$Vo,22:$Vp,23:2722,216:57,217:$Vq},{20:$V88,22:$V98,102:[1,2735],110:[1,2736],111:[1,2737],112:2734,166:$Va8,182:2725,192:2723,193:2724,198:2730,199:2731,200:2732,203:2733,206:[1,2738],207:[1,2739],208:[1,2744],209:[1,2745],210:[1,2746],211:[1,2747],212:[1,2740],213:[1,2741],214:[1,2742],215:[1,2743],217:$Vb8},o($Vy1,$Vh5),o($VQ1,$VX5),o($VQ1,$VN1),o($VQ1,$VT1),o($VQ1,$VU1),o($VQ1,$VV1),o($VQ1,$VW1),o($Vj1,$Va4),{123:[1,2748]},o($Vj1,$V14),o($VC2,$Vb4),o($VJ2,$V35),{20:$Vo,22:$Vp,23:2749,216:57,217:$Vq},{20:$Vc8,22:$Vd8,102:[1,2762],110:[1,2763],111:[1,2764],112:2761,166:$Ve8,182:2752,192:2750,193:2751,198:2757,199:2758,200:2759,203:2760,206:[1,2765],207:[1,2766],208:[1,2771],209:[1,2772],210:[1,2773],211:[1,2774],212:[1,2767],213:[1,2768],214:[1,2769],215:[1,2770],217:$Vf8},o($VL2,$V35),{20:$Vo,22:$Vp,23:2775,216:57,217:$Vq},{20:$Vg8,22:$Vh8,102:[1,2788],110:[1,2789],111:[1,2790],112:2787,166:$Vi8,182:2778,192:2776,193:2777,198:2783,199:2784,200:2785,203:2786,206:[1,2791],207:[1,2792],208:[1,2797],209:[1,2798],210:[1,2799],211:[1,2800],212:[1,2793],213:[1,2794],214:[1,2795],215:[1,2796],217:$Vj8},o($VC1,$Vs3),o($VC1,$Vt3),o($VC1,$Vu3),o($VC1,$Vv3),o($VC1,$Vw3),{113:[1,2801]},o($VC1,$VB3),o($VN2,$V35),{20:$Vo,22:$Vp,23:2802,216:57,217:$Vq},{20:$Vk8,22:$Vl8,102:[1,2815],110:[1,2816],111:[1,2817],112:2814,166:$Vm8,182:2805,192:2803,193:2804,198:2810,199:2811,200:2812,203:2813,206:[1,2818],207:[1,2819],208:[1,2824],209:[1,2825],210:[1,2826],211:[1,2827],212:[1,2820],213:[1,2821],214:[1,2822],215:[1,2823],217:$Vn8},o($Vy1,$Vh5),o($VQ1,$VX5),o($VQ1,$VN1),o($VQ1,$VT1),o($VQ1,$VU1),o($VQ1,$VV1),o($VQ1,$VW1),o($VY4,$V52),o($VY4,$V62),o($VY4,$V72),o($VV3,$VV5),o($VV3,$VW5),{20:$VK6,22:$VL6,89:2828,166:$VM6,193:2829,217:$VN6},o($VZ4,$V52),o($VZ4,$V62),o($VZ4,$V72),o($VW3,$VV5),o($VW3,$VW5),{20:$VO6,22:$VP6,89:2830,166:$VQ6,193:2831,217:$VR6},o($V$4,$V52),o($V$4,$V62),o($V$4,$V72),o($VX3,$VV5),o($VX3,$VW5),{20:$VS6,22:$VT6,89:2832,166:$VU6,193:2833,217:$VV6},o($VZ3,$VX5),o($VZ3,$VN1),o($VZ3,$VT1),o($VZ3,$VU1),o($VZ3,$VV1),o($VZ3,$VW1),o($VT3,$Vq2),o($VH,$VI,{67:2834,69:2835,74:2836,46:2837,80:2838,120:2842,53:$Vm1,55:$Vm1,72:$Vm1,81:[1,2839],82:[1,2840],83:[1,2841]}),o($VT3,$Vr2),o($VT3,$Vo1,{70:2843,66:2844,75:2845,94:2846,96:2847,97:2851,101:2852,98:[1,2848],99:[1,2849],100:[1,2850],103:$Vo8,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:2854,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($VT3,$Vs2),o($VV3,$Vw1,{84:2855}),o($VW3,$Vw1,{84:2856}),o($V36,$Vu2),o($V36,$Vv2),o($VY3,$VA1,{95:2857}),o($VV3,$VB1,{101:2413,97:2858,103:$VE7,104:$VR,105:$VS,106:$VT}),o($VZ3,$VD1,{88:2859}),o($VZ3,$VD1,{88:2860}),o($VZ3,$VD1,{88:2861}),o($VW3,$VE1,{107:2419,109:2420,93:2862,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VX3,$Vw1,{84:2863}),o($V36,$V71),o($V36,$V81),{20:[1,2867],22:[1,2871],23:2865,38:2864,202:2866,216:2868,217:[1,2870],218:[1,2869]},o($VY3,$VJ1),o($VY3,$VK1),o($VY3,$VL1),o($VY3,$VM1),o($VZ3,$VN1),o($VO1,$VP1,{163:2872}),o($V_3,$VR1),{121:[1,2873],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},{102:[1,2874]},o($VY3,$VS1),o($VZ3,$VT1),o($VZ3,$VU1),o($VZ3,$VV1),o($VZ3,$VW1),{102:[1,2876],108:2875,110:[1,2877],111:[1,2878],112:2879,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,2880]},o($VT3,$Va4),{123:[1,2881]},o($VT3,$V14),o($VX4,$Vb4),o($VY4,$V35),{20:$Vo,22:$Vp,23:2882,216:57,217:$Vq},{20:$Vp8,22:$Vq8,102:[1,2895],110:[1,2896],111:[1,2897],112:2894,166:$Vr8,182:2885,192:2883,193:2884,198:2890,199:2891,200:2892,203:2893,206:[1,2898],207:[1,2899],208:[1,2904],209:[1,2905],210:[1,2906],211:[1,2907],212:[1,2900],213:[1,2901],214:[1,2902],215:[1,2903],217:$Vs8},o($VZ4,$V35),{20:$Vo,22:$Vp,23:2908,216:57,217:$Vq},{20:$Vt8,22:$Vu8,102:[1,2921],110:[1,2922],111:[1,2923],112:2920,166:$Vv8,182:2911,192:2909,193:2910,198:2916,199:2917,200:2918,203:2919,206:[1,2924],207:[1,2925],208:[1,2930],209:[1,2931],210:[1,2932],211:[1,2933],212:[1,2926],213:[1,2927],214:[1,2928],215:[1,2929],217:$Vw8},o($VZ3,$Vs3),o($VZ3,$Vt3),o($VZ3,$Vu3),o($VZ3,$Vv3),o($VZ3,$Vw3),{113:[1,2934]},o($VZ3,$VB3),o($V$4,$V35),{20:$Vo,22:$Vp,23:2935,216:57,217:$Vq},{20:$Vx8,22:$Vy8,102:[1,2948],110:[1,2949],111:[1,2950],112:2947,166:$Vz8,182:2938,192:2936,193:2937,198:2943,199:2944,200:2945,203:2946,206:[1,2951],207:[1,2952],208:[1,2957],209:[1,2958],210:[1,2959],211:[1,2960],212:[1,2953],213:[1,2954],214:[1,2955],215:[1,2956],217:$VA8},o($VX3,$Vh5),o($V_3,$VX5),o($V_3,$VN1),o($V_3,$VT1),o($V_3,$VU1),o($V_3,$VV1),o($V_3,$VW1),o($VT3,$Va4),{123:[1,2961]},o($VT3,$V14),o($VX4,$Vb4),o($VY4,$V35),{20:$Vo,22:$Vp,23:2962,216:57,217:$Vq},{20:$VB8,22:$VC8,102:[1,2975],110:[1,2976],111:[1,2977],112:2974,166:$VD8,182:2965,192:2963,193:2964,198:2970,199:2971,200:2972,203:2973,206:[1,2978],207:[1,2979],208:[1,2984],209:[1,2985],210:[1,2986],211:[1,2987],212:[1,2980],213:[1,2981],214:[1,2982],215:[1,2983],217:$VE8},o($VZ4,$V35),{20:$Vo,22:$Vp,23:2988,216:57,217:$Vq},{20:$VF8,22:$VG8,102:[1,3001],110:[1,3002],111:[1,3003],112:3000,166:$VH8,182:2991,192:2989,193:2990,198:2996,199:2997,200:2998,203:2999,206:[1,3004],207:[1,3005],208:[1,3010],209:[1,3011],210:[1,3012],211:[1,3013],212:[1,3006],213:[1,3007],214:[1,3008],215:[1,3009],217:$VI8},o($VZ3,$Vs3),o($VZ3,$Vt3),o($VZ3,$Vu3),o($VZ3,$Vv3),o($VZ3,$Vw3),{113:[1,3014]},o($VZ3,$VB3),o($V$4,$V35),{20:$Vo,22:$Vp,23:3015,216:57,217:$Vq},{20:$VJ8,22:$VK8,102:[1,3028],110:[1,3029],111:[1,3030],112:3027,166:$VL8,182:3018,192:3016,193:3017,198:3023,199:3024,200:3025,203:3026,206:[1,3031],207:[1,3032],208:[1,3037],209:[1,3038],210:[1,3039],211:[1,3040],212:[1,3033],213:[1,3034],214:[1,3035],215:[1,3036],217:$VM8},o($VX3,$Vh5),o($V_3,$VX5),o($V_3,$VN1),o($V_3,$VT1),o($V_3,$VU1),o($V_3,$VV1),o($V_3,$VW1),o($VN8,$VK2,{85:3041,86:3042,194:3043,191:$VO8}),o($V67,$VP8),o($VC,$Vh,{57:3045,61:3046,42:3047,45:$VD}),o($V87,$VQ8),o($VC,$Vh,{61:3048,42:3049,45:$VD}),o($V87,$VR8),o($V87,$VS8),o($V87,$VW7),o($V87,$VX7),{121:[1,3050],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($V87,$V71),o($V87,$V81),{20:[1,3054],22:[1,3058],23:3052,38:3051,202:3053,216:3055,217:[1,3057],218:[1,3056]},o($V87,$VT8),o($V87,$VU8),o($VV8,$VA1,{95:3059}),o($V87,$VB1,{101:2496,97:3060,103:$VQ7,104:$VR,105:$VS,106:$VT}),o($VV8,$VJ1),o($VV8,$VK1),o($VV8,$VL1),o($VV8,$VM1),{102:[1,3061]},o($VV8,$VS1),{72:[1,3062]},o($VT7,$VO2,{101:2017,97:3063,103:$Va7,104:$VR,105:$VS,106:$VT}),o($VS7,$VP2),o($V87,$VQ2,{92:3064,97:3065,93:3066,101:3067,107:3069,109:3070,103:$VW8,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V87,$VS2,{92:3064,97:3065,93:3066,101:3067,107:3069,109:3070,103:$VW8,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V87,$VT2,{92:3064,97:3065,93:3066,101:3067,107:3069,109:3070,103:$VW8,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VY7,$VU2),{20:$V83,22:$V93,23:415,29:[1,3071],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:3072,123:$VX2,150:$VY2,190:$VZ2}),o($VV7,$V42),o($VV7,$Vm),o($VV7,$Vn),o($VV7,$Vr),o($VV7,$Vs),o($VV7,$Vt),o($VV7,$Vu),o($VV7,$Vv),o($VS7,$Vs3),o($VY7,$Vt3),o($VY7,$Vu3),o($VY7,$Vv3),o($VY7,$Vw3),{113:[1,3073]},o($VY7,$VB3),o($VN8,$VK2,{86:3042,194:3043,85:3074,191:$VO8}),o($VX8,$V$6,{154:3075,155:3076,158:$VY8,159:$VZ8,160:$V_8,161:$V$8}),o($V09,$V57),o($V19,$V77,{58:3081}),o($V29,$V97,{62:3082}),o($VH,$VI,{65:3083,75:3084,77:3085,78:3086,94:3089,96:3090,89:3092,90:3093,91:3094,80:3095,46:3096,97:3100,193:3101,93:3103,120:3104,101:3108,107:3114,109:3115,20:[1,3110],22:[1,3112],28:[1,3102],71:[1,3087],73:[1,3088],81:[1,3105],82:[1,3106],83:[1,3107],87:[1,3091],98:[1,3097],99:[1,3098],100:[1,3099],103:$V39,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,3113],217:[1,3111]}),o($VX8,$V$6,{155:3076,154:3116,158:$VY8,159:$VZ8,160:$V_8,161:$V$8}),o($VL2,$VK2,{86:2549,194:2550,85:3117,191:$VZ7}),o($Vj1,$V42),o($Vj1,$Vm),o($Vj1,$Vn),o($Vj1,$Vr),o($Vj1,$Vs),o($Vj1,$Vt),o($Vj1,$Vu),o($Vj1,$Vv),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:3118,123:$VX2,150:$VY2,190:$VZ2}),o($VL2,$VK2,{86:2549,194:2550,85:3119,191:$VZ7}),o($Vx1,$VO2,{101:2058,97:3120,103:$Vb7,104:$VR,105:$VS,106:$VT}),o($VC2,$VP2),o($VC2,$Vs3),o($Vj1,$VW4),o($V04,$V14),o($Vv1,$V24),o($V04,$V34,{37:3121,195:[1,3122]}),{20:$V44,22:$V54,131:3123,166:$V64,193:647,201:$V74,217:$V84},o($Vj1,$V94),o($Vx1,$V24),o($Vj1,$V34,{37:3124,195:[1,3125]}),{20:$V44,22:$V54,131:3126,166:$V64,193:647,201:$V74,217:$V84},o($Vz1,$Vb4),o($VC1,$Vc4),o($VC1,$Vd4),o($VC1,$Ve4),{102:[1,3127]},o($VC1,$VS1),{102:[1,3129],108:3128,110:[1,3130],111:[1,3131],112:3132,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,3133]},o($Vt2,$Va4),o($Vy1,$V24),o($Vt2,$V34,{37:3134,195:[1,3135]}),{20:$V44,22:$V54,131:3136,166:$V64,193:647,201:$V74,217:$V84},o($VC1,$Vy4),{123:[1,3137]},{20:[1,3140],22:[1,3142],89:3138,166:[1,3143],193:3139,217:[1,3141]},o($VJ2,$V52),o($VJ2,$V62),o($VJ2,$V72),o($Vv1,$VV5),o($Vv1,$VW5),{20:$Vc7,22:$Vd7,89:3144,166:$Ve7,193:3145,217:$Vf7},o($VL2,$V52),o($VL2,$V62),o($VL2,$V72),o($Vx1,$VV5),o($Vx1,$VW5),{20:$Vg7,22:$Vh7,89:3146,166:$Vi7,193:3147,217:$Vj7},o($VC1,$VX5),o($VC1,$VN1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),o($VN2,$V52),o($VN2,$V62),o($VN2,$V72),o($Vy1,$VV5),o($Vy1,$VW5),{20:$Vk7,22:$Vl7,89:3148,166:$Vm7,193:3149,217:$Vn7},o($VJ2,$V52),o($VJ2,$V62),o($VJ2,$V72),o($Vv1,$VV5),o($Vv1,$VW5),{20:$Vo7,22:$Vp7,89:3150,166:$Vq7,193:3151,217:$Vr7},o($VL2,$V52),o($VL2,$V62),o($VL2,$V72),o($Vx1,$VV5),o($Vx1,$VW5),{20:$Vs7,22:$Vt7,89:3152,166:$Vu7,193:3153,217:$Vv7},o($VC1,$VX5),o($VC1,$VN1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),o($VN2,$V52),o($VN2,$V62),o($VN2,$V72),o($Vy1,$VV5),o($Vy1,$VW5),{20:$Vw7,22:$Vx7,89:3154,166:$Vy7,193:3155,217:$Vz7},o($Vv1,$Vs6),o($Vv1,$VN1),o($Vx1,$Vs6),o($Vx1,$VN1),o($Vy1,$Vs6),o($Vy1,$VN1),o($Vj1,$VQ3),o($Vj1,$Vz2),o($Vj1,$Vu2),o($Vj1,$Vv2),o($Vx1,$Vw1,{84:3156}),o($Vj1,$V71),o($Vj1,$V81),{20:[1,3160],22:[1,3164],23:3158,38:3157,202:3159,216:3161,217:[1,3163],218:[1,3162]},{121:[1,3165],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj1,$VR3),o($Vj1,$VB2),o($Vx1,$Vw1,{84:3166}),o($VC2,$VA1,{95:3167}),o($Vx1,$VB1,{101:2639,97:3168,103:$V$7,104:$VR,105:$VS,106:$VT}),o($VC2,$VJ1),o($VC2,$VK1),o($VC2,$VL1),o($VC2,$VM1),{102:[1,3169]},o($VC2,$VS1),{72:[1,3170]},o($VJ2,$VK2,{85:3171,86:3172,194:3173,191:[1,3174]}),o($VL2,$VK2,{85:3175,86:3176,194:3177,191:$V49}),o($Vv1,$VO2,{101:2299,97:3179,103:$VA7,104:$VR,105:$VS,106:$VT}),o($Vz1,$VP2),o($Vx1,$VQ2,{92:3180,97:3181,93:3182,101:3183,107:3185,109:3186,103:$V59,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VS2,{92:3180,97:3181,93:3182,101:3183,107:3185,109:3186,103:$V59,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vx1,$VT2,{92:3180,97:3181,93:3182,101:3183,107:3185,109:3186,103:$V59,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VQ1,$VU2),o($VN2,$VK2,{85:3187,86:3188,194:3189,191:[1,3190]}),o($Vt2,$V42),o($Vt2,$Vm),o($Vt2,$Vn),o($Vt2,$Vr),o($Vt2,$Vs),o($Vt2,$Vt),o($Vt2,$Vu),o($Vt2,$Vv),{20:$V83,22:$V93,23:415,29:[1,3191],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:3192,123:$VX2,150:$VY2,190:$VZ2}),o($Vz1,$Vs3),o($VQ1,$Vt3),o($VQ1,$Vu3),o($VQ1,$Vv3),o($VQ1,$Vw3),{113:[1,3193]},o($VQ1,$VB3),o($Vx1,$Vh5),{195:[1,3196],196:3194,197:[1,3195]},o($Vv1,$V66),o($Vv1,$V76),o($Vv1,$V86),o($Vv1,$VT1),o($Vv1,$VU1),o($Vv1,$VV1),o($Vv1,$VW1),o($Vv1,$VB4),o($Vv1,$VC4),o($Vv1,$VD4),o($Vv1,$VE4),o($Vv1,$VF4,{204:3197,205:3198,113:[1,3199]}),o($Vv1,$VG4),o($Vv1,$VH4),o($Vv1,$VI4),o($Vv1,$VJ4),o($Vv1,$VK4),o($Vv1,$VL4),o($Vv1,$VM4),o($Vv1,$VN4),o($Vv1,$VO4),o($V96,$Vx3),o($V96,$Vy3),o($V96,$Vz3),o($V96,$VA3),{195:[1,3202],196:3200,197:[1,3201]},o($Vx1,$V66),o($Vx1,$V76),o($Vx1,$V86),o($Vx1,$VT1),o($Vx1,$VU1),o($Vx1,$VV1),o($Vx1,$VW1),o($Vx1,$VB4),o($Vx1,$VC4),o($Vx1,$VD4),o($Vx1,$VE4),o($Vx1,$VF4,{204:3203,205:3204,113:[1,3205]}),o($Vx1,$VG4),o($Vx1,$VH4),o($Vx1,$VI4),o($Vx1,$VJ4),o($Vx1,$VK4),o($Vx1,$VL4),o($Vx1,$VM4),o($Vx1,$VN4),o($Vx1,$VO4),o($Va6,$Vx3),o($Va6,$Vy3),o($Va6,$Vz3),o($Va6,$VA3),{20:[1,3208],22:[1,3210],89:3206,166:[1,3211],193:3207,217:[1,3209]},{195:[1,3214],196:3212,197:[1,3213]},o($Vy1,$V66),o($Vy1,$V76),o($Vy1,$V86),o($Vy1,$VT1),o($Vy1,$VU1),o($Vy1,$VV1),o($Vy1,$VW1),o($Vy1,$VB4),o($Vy1,$VC4),o($Vy1,$VD4),o($Vy1,$VE4),o($Vy1,$VF4,{204:3215,205:3216,113:[1,3217]}),o($Vy1,$VG4),o($Vy1,$VH4),o($Vy1,$VI4),o($Vy1,$VJ4),o($Vy1,$VK4),o($Vy1,$VL4),o($Vy1,$VM4),o($Vy1,$VN4),o($Vy1,$VO4),o($Vb6,$Vx3),o($Vb6,$Vy3),o($Vb6,$Vz3),o($Vb6,$VA3),o($Vx1,$Vh5),{195:[1,3220],196:3218,197:[1,3219]},o($Vv1,$V66),o($Vv1,$V76),o($Vv1,$V86),o($Vv1,$VT1),o($Vv1,$VU1),o($Vv1,$VV1),o($Vv1,$VW1),o($Vv1,$VB4),o($Vv1,$VC4),o($Vv1,$VD4),o($Vv1,$VE4),o($Vv1,$VF4,{204:3221,205:3222,113:[1,3223]}),o($Vv1,$VG4),o($Vv1,$VH4),o($Vv1,$VI4),o($Vv1,$VJ4),o($Vv1,$VK4),o($Vv1,$VL4),o($Vv1,$VM4),o($Vv1,$VN4),o($Vv1,$VO4),o($V96,$Vx3),o($V96,$Vy3),o($V96,$Vz3),o($V96,$VA3),{195:[1,3226],196:3224,197:[1,3225]},o($Vx1,$V66),o($Vx1,$V76),o($Vx1,$V86),o($Vx1,$VT1),o($Vx1,$VU1),o($Vx1,$VV1),o($Vx1,$VW1),o($Vx1,$VB4),o($Vx1,$VC4),o($Vx1,$VD4),o($Vx1,$VE4),o($Vx1,$VF4,{204:3227,205:3228,113:[1,3229]}),o($Vx1,$VG4),o($Vx1,$VH4),o($Vx1,$VI4),o($Vx1,$VJ4),o($Vx1,$VK4),o($Vx1,$VL4),o($Vx1,$VM4),o($Vx1,$VN4),o($Vx1,$VO4),o($Va6,$Vx3),o($Va6,$Vy3),o($Va6,$Vz3),o($Va6,$VA3),{20:[1,3232],22:[1,3234],89:3230,166:[1,3235],193:3231,217:[1,3233]},{195:[1,3238],196:3236,197:[1,3237]},o($Vy1,$V66),o($Vy1,$V76),o($Vy1,$V86),o($Vy1,$VT1),o($Vy1,$VU1),o($Vy1,$VV1),o($Vy1,$VW1),o($Vy1,$VB4),o($Vy1,$VC4),o($Vy1,$VD4),o($Vy1,$VE4),o($Vy1,$VF4,{204:3239,205:3240,113:[1,3241]}),o($Vy1,$VG4),o($Vy1,$VH4),o($Vy1,$VI4),o($Vy1,$VJ4),o($Vy1,$VK4),o($Vy1,$VL4),o($Vy1,$VM4),o($Vy1,$VN4),o($Vy1,$VO4),o($Vb6,$Vx3),o($Vb6,$Vy3),o($Vb6,$Vz3),o($Vb6,$VA3),o($VV3,$Vs6),o($VV3,$VN1),o($VW3,$Vs6),o($VW3,$VN1),o($VX3,$Vs6),o($VX3,$VN1),o($VT3,$VQ3),o($VT3,$Vz2),o($VT3,$Vu2),o($VT3,$Vv2),o($VW3,$Vw1,{84:3242}),o($VT3,$V71),o($VT3,$V81),{20:[1,3246],22:[1,3250],23:3244,38:3243,202:3245,216:3247,217:[1,3249],218:[1,3248]},{121:[1,3251],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($VT3,$VR3),o($VT3,$VB2),o($VW3,$Vw1,{84:3252}),o($VX4,$VA1,{95:3253}),o($VW3,$VB1,{101:2852,97:3254,103:$Vo8,104:$VR,105:$VS,106:$VT}),o($VX4,$VJ1),o($VX4,$VK1),o($VX4,$VL1),o($VX4,$VM1),{102:[1,3255]},o($VX4,$VS1),{72:[1,3256]},o($VY4,$VK2,{85:3257,86:3258,194:3259,191:[1,3260]}),o($VZ4,$VK2,{85:3261,86:3262,194:3263,191:$V69}),o($VV3,$VO2,{101:2413,97:3265,103:$VE7,104:$VR,105:$VS,106:$VT}),o($VY3,$VP2),o($VW3,$VQ2,{92:3266,97:3267,93:3268,101:3269,107:3271,109:3272,103:$V79,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VW3,$VS2,{92:3266,97:3267,93:3268,101:3269,107:3271,109:3272,103:$V79,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VW3,$VT2,{92:3266,97:3267,93:3268,101:3269,107:3271,109:3272,103:$V79,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V_3,$VU2),o($V$4,$VK2,{85:3273,86:3274,194:3275,191:[1,3276]}),o($V36,$V42),o($V36,$Vm),o($V36,$Vn),o($V36,$Vr),o($V36,$Vs),o($V36,$Vt),o($V36,$Vu),o($V36,$Vv),{20:$V83,22:$V93,23:415,29:[1,3277],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:3278,123:$VX2,150:$VY2,190:$VZ2}),o($VY3,$Vs3),o($V_3,$Vt3),o($V_3,$Vu3),o($V_3,$Vv3),o($V_3,$Vw3),{113:[1,3279]},o($V_3,$VB3),o($VW3,$Vh5),{195:[1,3282],196:3280,197:[1,3281]},o($VV3,$V66),o($VV3,$V76),o($VV3,$V86),o($VV3,$VT1),o($VV3,$VU1),o($VV3,$VV1),o($VV3,$VW1),o($VV3,$VB4),o($VV3,$VC4),o($VV3,$VD4),o($VV3,$VE4),o($VV3,$VF4,{204:3283,205:3284,113:[1,3285]}),o($VV3,$VG4),o($VV3,$VH4),o($VV3,$VI4),o($VV3,$VJ4),o($VV3,$VK4),o($VV3,$VL4),o($VV3,$VM4),o($VV3,$VN4),o($VV3,$VO4),o($VB7,$Vx3),o($VB7,$Vy3),o($VB7,$Vz3),o($VB7,$VA3),{195:[1,3288],196:3286,197:[1,3287]},o($VW3,$V66),o($VW3,$V76),o($VW3,$V86),o($VW3,$VT1),o($VW3,$VU1),o($VW3,$VV1),o($VW3,$VW1),o($VW3,$VB4),o($VW3,$VC4),o($VW3,$VD4),o($VW3,$VE4),o($VW3,$VF4,{204:3289,205:3290,113:[1,3291]}),o($VW3,$VG4),o($VW3,$VH4),o($VW3,$VI4),o($VW3,$VJ4),o($VW3,$VK4),o($VW3,$VL4),o($VW3,$VM4),o($VW3,$VN4),o($VW3,$VO4),o($VC7,$Vx3),o($VC7,$Vy3),o($VC7,$Vz3),o($VC7,$VA3),{20:[1,3294],22:[1,3296],89:3292,166:[1,3297],193:3293,217:[1,3295]},{195:[1,3300],196:3298,197:[1,3299]},o($VX3,$V66),o($VX3,$V76),o($VX3,$V86),o($VX3,$VT1),o($VX3,$VU1),o($VX3,$VV1),o($VX3,$VW1),o($VX3,$VB4),o($VX3,$VC4),o($VX3,$VD4),o($VX3,$VE4),o($VX3,$VF4,{204:3301,205:3302,113:[1,3303]}),o($VX3,$VG4),o($VX3,$VH4),o($VX3,$VI4),o($VX3,$VJ4),o($VX3,$VK4),o($VX3,$VL4),o($VX3,$VM4),o($VX3,$VN4),o($VX3,$VO4),o($VD7,$Vx3),o($VD7,$Vy3),o($VD7,$Vz3),o($VD7,$VA3),o($VW3,$Vh5),{195:[1,3306],196:3304,197:[1,3305]},o($VV3,$V66),o($VV3,$V76),o($VV3,$V86),o($VV3,$VT1),o($VV3,$VU1),o($VV3,$VV1),o($VV3,$VW1),o($VV3,$VB4),o($VV3,$VC4),o($VV3,$VD4),o($VV3,$VE4),o($VV3,$VF4,{204:3307,205:3308,113:[1,3309]}),o($VV3,$VG4),o($VV3,$VH4),o($VV3,$VI4),o($VV3,$VJ4),o($VV3,$VK4),o($VV3,$VL4),o($VV3,$VM4),o($VV3,$VN4),o($VV3,$VO4),o($VB7,$Vx3),o($VB7,$Vy3),o($VB7,$Vz3),o($VB7,$VA3),{195:[1,3312],196:3310,197:[1,3311]},o($VW3,$V66),o($VW3,$V76),o($VW3,$V86),o($VW3,$VT1),o($VW3,$VU1),o($VW3,$VV1),o($VW3,$VW1),o($VW3,$VB4),o($VW3,$VC4),o($VW3,$VD4),o($VW3,$VE4),o($VW3,$VF4,{204:3313,205:3314,113:[1,3315]}),o($VW3,$VG4),o($VW3,$VH4),o($VW3,$VI4),o($VW3,$VJ4),o($VW3,$VK4),o($VW3,$VL4),o($VW3,$VM4),o($VW3,$VN4),o($VW3,$VO4),o($VC7,$Vx3),o($VC7,$Vy3),o($VC7,$Vz3),o($VC7,$VA3),{20:[1,3318],22:[1,3320],89:3316,166:[1,3321],193:3317,217:[1,3319]},{195:[1,3324],196:3322,197:[1,3323]},o($VX3,$V66),o($VX3,$V76),o($VX3,$V86),o($VX3,$VT1),o($VX3,$VU1),o($VX3,$VV1),o($VX3,$VW1),o($VX3,$VB4),o($VX3,$VC4),o($VX3,$VD4),o($VX3,$VE4),o($VX3,$VF4,{204:3325,205:3326,113:[1,3327]}),o($VX3,$VG4),o($VX3,$VH4),o($VX3,$VI4),o($VX3,$VJ4),o($VX3,$VK4),o($VX3,$VL4),o($VX3,$VM4),o($VX3,$VN4),o($VX3,$VO4),o($VD7,$Vx3),o($VD7,$Vy3),o($VD7,$Vz3),o($VD7,$VA3),o($Vs4,$V89),o($V_6,$V24),o($Vs4,$V34,{37:3328,195:[1,3329]}),{20:$V44,22:$V54,131:3330,166:$V64,193:647,201:$V74,217:$V84},o($V67,$V99),o($V87,$V97,{62:3331}),o($VH,$VI,{65:3332,75:3333,77:3334,78:3335,94:3338,96:3339,89:3341,90:3342,91:3343,80:3344,46:3345,97:3349,193:3350,93:3352,120:3353,101:3357,107:3363,109:3364,20:[1,3359],22:[1,3361],28:[1,3351],71:[1,3336],73:[1,3337],81:[1,3354],82:[1,3355],83:[1,3356],87:[1,3340],98:[1,3346],99:[1,3347],100:[1,3348],103:$Va9,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,3362],217:[1,3360]}),o($V87,$Vb9),o($VH,$VI,{65:3365,75:3366,77:3367,78:3368,94:3371,96:3372,89:3374,90:3375,91:3376,80:3377,46:3378,97:3382,193:3383,93:3385,120:3386,101:3390,107:3396,109:3397,20:[1,3392],22:[1,3394],28:[1,3384],71:[1,3369],73:[1,3370],81:[1,3387],82:[1,3388],83:[1,3389],87:[1,3373],98:[1,3379],99:[1,3380],100:[1,3381],103:$Vc9,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,3395],217:[1,3393]}),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:3398,123:$VX2,150:$VY2,190:$VZ2}),o($V87,$V42),o($V87,$Vm),o($V87,$Vn),o($V87,$Vr),o($V87,$Vs),o($V87,$Vt),o($V87,$Vu),o($V87,$Vv),o($V87,$VO2,{101:2496,97:3399,103:$VQ7,104:$VR,105:$VS,106:$VT}),o($VV8,$VP2),o($VV8,$Vs3),o($V87,$Vd9),o($VS7,$Vb4),o($VU7,$Vc4),o($VU7,$Vd4),o($VU7,$Ve4),{102:[1,3400]},o($VU7,$VS1),{102:[1,3402],108:3401,110:[1,3403],111:[1,3404],112:3405,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,3406]},o($VU7,$Vy4),{123:[1,3407]},{20:[1,3410],22:[1,3412],89:3408,166:[1,3413],193:3409,217:[1,3411]},o($Vs4,$Ve9),o($VX8,$Vw1,{84:3414}),o($VX8,$VF7),o($VX8,$VG7),o($VX8,$VH7),o($VX8,$VI7),o($VX8,$VJ7),o($V09,$VK7,{59:3415,53:[1,3416]}),o($V19,$VL7,{63:3417,55:[1,3418]}),o($V29,$VM7),o($V29,$VN7,{76:3419,78:3420,80:3421,46:3422,120:3423,81:[1,3424],82:[1,3425],83:[1,3426],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($V29,$VO7),o($V29,$VP7,{79:3427,75:3428,94:3429,96:3430,97:3434,101:3435,98:[1,3431],99:[1,3432],100:[1,3433],103:$Vf9,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:3437,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($V29,$VR7),o($Vg9,$VA1,{95:3438}),o($Vh9,$VB1,{101:3108,97:3439,103:$V39,104:$VR,105:$VS,106:$VT}),o($Vi9,$VD1,{88:3440}),o($Vi9,$VD1,{88:3441}),o($Vi9,$VD1,{88:3442}),o($V29,$VE1,{107:3114,109:3115,93:3443,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vj9,$VW7),o($Vj9,$VX7),o($Vg9,$VJ1),o($Vg9,$VK1),o($Vg9,$VL1),o($Vg9,$VM1),o($Vi9,$VN1),o($VO1,$VP1,{163:3444}),o($Vk9,$VR1),{121:[1,3445],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj9,$V71),o($Vj9,$V81),{20:[1,3449],22:[1,3453],23:3447,38:3446,202:3448,216:3450,217:[1,3452],218:[1,3451]},{102:[1,3454]},o($Vg9,$VS1),o($Vi9,$VT1),o($Vi9,$VU1),o($Vi9,$VV1),o($Vi9,$VW1),{102:[1,3456],108:3455,110:[1,3457],111:[1,3458],112:3459,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,3460]},o($VX8,$Vw1,{84:3461}),o($Vj1,$Va4),{123:[1,3462]},o($Vj1,$V14),o($VC2,$Vb4),o($VJ2,$V35),{20:$Vo,22:$Vp,23:3463,216:57,217:$Vq},{20:$Vl9,22:$Vm9,102:[1,3476],110:[1,3477],111:[1,3478],112:3475,166:$Vn9,182:3466,192:3464,193:3465,198:3471,199:3472,200:3473,203:3474,206:[1,3479],207:[1,3480],208:[1,3485],209:[1,3486],210:[1,3487],211:[1,3488],212:[1,3481],213:[1,3482],214:[1,3483],215:[1,3484],217:$Vo9},o($VL2,$V35),{20:$Vo,22:$Vp,23:3489,216:57,217:$Vq},{20:$Vp9,22:$Vq9,102:[1,3502],110:[1,3503],111:[1,3504],112:3501,166:$Vr9,182:3492,192:3490,193:3491,198:3497,199:3498,200:3499,203:3500,206:[1,3505],207:[1,3506],208:[1,3511],209:[1,3512],210:[1,3513],211:[1,3514],212:[1,3507],213:[1,3508],214:[1,3509],215:[1,3510],217:$Vs9},o($VC1,$Vs3),o($VC1,$Vt3),o($VC1,$Vu3),o($VC1,$Vv3),o($VC1,$Vw3),{113:[1,3515]},o($VC1,$VB3),o($VN2,$V35),{20:$Vo,22:$Vp,23:3516,216:57,217:$Vq},{20:$Vt9,22:$Vu9,102:[1,3529],110:[1,3530],111:[1,3531],112:3528,166:$Vv9,182:3519,192:3517,193:3518,198:3524,199:3525,200:3526,203:3527,206:[1,3532],207:[1,3533],208:[1,3538],209:[1,3539],210:[1,3540],211:[1,3541],212:[1,3534],213:[1,3535],214:[1,3536],215:[1,3537],217:$Vw9},o($Vy1,$Vh5),o($VQ1,$VX5),o($VQ1,$VN1),o($VQ1,$VT1),o($VQ1,$VU1),o($VQ1,$VV1),o($VQ1,$VW1),o($Vv1,$Vs6),o($Vv1,$VN1),o($Vx1,$Vs6),o($Vx1,$VN1),o($Vy1,$Vs6),o($Vy1,$VN1),o($Vv1,$Vs6),o($Vv1,$VN1),o($Vx1,$Vs6),o($Vx1,$VN1),o($Vy1,$Vs6),o($Vy1,$VN1),o($VL2,$VK2,{86:3176,194:3177,85:3542,191:$V49}),o($Vj1,$V42),o($Vj1,$Vm),o($Vj1,$Vn),o($Vj1,$Vr),o($Vj1,$Vs),o($Vj1,$Vt),o($Vj1,$Vu),o($Vj1,$Vv),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:3543,123:$VX2,150:$VY2,190:$VZ2}),o($VL2,$VK2,{86:3176,194:3177,85:3544,191:$V49}),o($Vx1,$VO2,{101:2639,97:3545,103:$V$7,104:$VR,105:$VS,106:$VT}),o($VC2,$VP2),o($VC2,$Vs3),o($Vj1,$VW4),o($V04,$V14),o($Vv1,$V24),o($V04,$V34,{37:3546,195:[1,3547]}),{20:$V44,22:$V54,131:3548,166:$V64,193:647,201:$V74,217:$V84},o($Vj1,$V94),o($Vx1,$V24),o($Vj1,$V34,{37:3549,195:[1,3550]}),{20:$V44,22:$V54,131:3551,166:$V64,193:647,201:$V74,217:$V84},o($Vz1,$Vb4),o($VC1,$Vc4),o($VC1,$Vd4),o($VC1,$Ve4),{102:[1,3552]},o($VC1,$VS1),{102:[1,3554],108:3553,110:[1,3555],111:[1,3556],112:3557,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,3558]},o($Vt2,$Va4),o($Vy1,$V24),o($Vt2,$V34,{37:3559,195:[1,3560]}),{20:$V44,22:$V54,131:3561,166:$V64,193:647,201:$V74,217:$V84},o($VC1,$Vy4),{123:[1,3562]},{20:[1,3565],22:[1,3567],89:3563,166:[1,3568],193:3564,217:[1,3566]},o($VJ2,$V52),o($VJ2,$V62),o($VJ2,$V72),o($Vv1,$VV5),o($Vv1,$VW5),{20:$V08,22:$V18,89:3569,166:$V28,193:3570,217:$V38},o($VL2,$V52),o($VL2,$V62),o($VL2,$V72),o($Vx1,$VV5),o($Vx1,$VW5),{20:$V48,22:$V58,89:3571,166:$V68,193:3572,217:$V78},o($VC1,$VX5),o($VC1,$VN1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),o($VN2,$V52),o($VN2,$V62),o($VN2,$V72),o($Vy1,$VV5),o($Vy1,$VW5),{20:$V88,22:$V98,89:3573,166:$Va8,193:3574,217:$Vb8},o($VJ2,$V52),o($VJ2,$V62),o($VJ2,$V72),o($Vv1,$VV5),o($Vv1,$VW5),{20:$Vc8,22:$Vd8,89:3575,166:$Ve8,193:3576,217:$Vf8},o($VL2,$V52),o($VL2,$V62),o($VL2,$V72),o($Vx1,$VV5),o($Vx1,$VW5),{20:$Vg8,22:$Vh8,89:3577,166:$Vi8,193:3578,217:$Vj8},o($VC1,$VX5),o($VC1,$VN1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),o($VN2,$V52),o($VN2,$V62),o($VN2,$V72),o($Vy1,$VV5),o($Vy1,$VW5),{20:$Vk8,22:$Vl8,89:3579,166:$Vm8,193:3580,217:$Vn8},o($VZ4,$VK2,{86:3262,194:3263,85:3581,191:$V69}),o($VT3,$V42),o($VT3,$Vm),o($VT3,$Vn),o($VT3,$Vr),o($VT3,$Vs),o($VT3,$Vt),o($VT3,$Vu),o($VT3,$Vv),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:3582,123:$VX2,150:$VY2,190:$VZ2}),o($VZ4,$VK2,{86:3262,194:3263,85:3583,191:$V69}),o($VW3,$VO2,{101:2852,97:3584,103:$Vo8,104:$VR,105:$VS,106:$VT}),o($VX4,$VP2),o($VX4,$Vs3),o($VT3,$VW4),o($V26,$V14),o($VV3,$V24),o($V26,$V34,{37:3585,195:[1,3586]}),{20:$V44,22:$V54,131:3587,166:$V64,193:647,201:$V74,217:$V84},o($VT3,$V94),o($VW3,$V24),o($VT3,$V34,{37:3588,195:[1,3589]}),{20:$V44,22:$V54,131:3590,166:$V64,193:647,201:$V74,217:$V84},o($VY3,$Vb4),o($VZ3,$Vc4),o($VZ3,$Vd4),o($VZ3,$Ve4),{102:[1,3591]},o($VZ3,$VS1),{102:[1,3593],108:3592,110:[1,3594],111:[1,3595],112:3596,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,3597]},o($V36,$Va4),o($VX3,$V24),o($V36,$V34,{37:3598,195:[1,3599]}),{20:$V44,22:$V54,131:3600,166:$V64,193:647,201:$V74,217:$V84},o($VZ3,$Vy4),{123:[1,3601]},{20:[1,3604],22:[1,3606],89:3602,166:[1,3607],193:3603,217:[1,3605]},o($VY4,$V52),o($VY4,$V62),o($VY4,$V72),o($VV3,$VV5),o($VV3,$VW5),{20:$Vp8,22:$Vq8,89:3608,166:$Vr8,193:3609,217:$Vs8},o($VZ4,$V52),o($VZ4,$V62),o($VZ4,$V72),o($VW3,$VV5),o($VW3,$VW5),{20:$Vt8,22:$Vu8,89:3610,166:$Vv8,193:3611,217:$Vw8},o($VZ3,$VX5),o($VZ3,$VN1),o($VZ3,$VT1),o($VZ3,$VU1),o($VZ3,$VV1),o($VZ3,$VW1),o($V$4,$V52),o($V$4,$V62),o($V$4,$V72),o($VX3,$VV5),o($VX3,$VW5),{20:$Vx8,22:$Vy8,89:3612,166:$Vz8,193:3613,217:$VA8},o($VY4,$V52),o($VY4,$V62),o($VY4,$V72),o($VV3,$VV5),o($VV3,$VW5),{20:$VB8,22:$VC8,89:3614,166:$VD8,193:3615,217:$VE8},o($VZ4,$V52),o($VZ4,$V62),o($VZ4,$V72),o($VW3,$VV5),o($VW3,$VW5),{20:$VF8,22:$VG8,89:3616,166:$VH8,193:3617,217:$VI8},o($VZ3,$VX5),o($VZ3,$VN1),o($VZ3,$VT1),o($VZ3,$VU1),o($VZ3,$VV1),o($VZ3,$VW1),o($V$4,$V52),o($V$4,$V62),o($V$4,$V72),o($VX3,$VV5),o($VX3,$VW5),{20:$VJ8,22:$VK8,89:3618,166:$VL8,193:3619,217:$VM8},o($VN8,$V35),{20:$Vo,22:$Vp,23:3620,216:57,217:$Vq},{20:$Vx9,22:$Vy9,102:[1,3633],110:[1,3634],111:[1,3635],112:3632,166:$Vz9,182:3623,192:3621,193:3622,198:3628,199:3629,200:3630,203:3631,206:[1,3636],207:[1,3637],208:[1,3642],209:[1,3643],210:[1,3644],211:[1,3645],212:[1,3638],213:[1,3639],214:[1,3640],215:[1,3641],217:$VA9},o($V67,$VL7,{63:3646,55:[1,3647]}),o($V87,$VM7),o($V87,$VN7,{76:3648,78:3649,80:3650,46:3651,120:3652,81:[1,3653],82:[1,3654],83:[1,3655],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($V87,$VO7),o($V87,$VP7,{79:3656,75:3657,94:3658,96:3659,97:3663,101:3664,98:[1,3660],99:[1,3661],100:[1,3662],103:$VB9,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:3666,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($V87,$VR7),o($VS7,$VA1,{95:3667}),o($VT7,$VB1,{101:3357,97:3668,103:$Va9,104:$VR,105:$VS,106:$VT}),o($VU7,$VD1,{88:3669}),o($VU7,$VD1,{88:3670}),o($VU7,$VD1,{88:3671}),o($V87,$VE1,{107:3363,109:3364,93:3672,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VV7,$VW7),o($VV7,$VX7),o($VS7,$VJ1),o($VS7,$VK1),o($VS7,$VL1),o($VS7,$VM1),o($VU7,$VN1),o($VO1,$VP1,{163:3673}),o($VY7,$VR1),{121:[1,3674],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($VV7,$V71),o($VV7,$V81),{20:[1,3678],22:[1,3682],23:3676,38:3675,202:3677,216:3679,217:[1,3681],218:[1,3680]},{102:[1,3683]},o($VS7,$VS1),o($VU7,$VT1),o($VU7,$VU1),o($VU7,$VV1),o($VU7,$VW1),{102:[1,3685],108:3684,110:[1,3686],111:[1,3687],112:3688,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,3689]},o($V87,$VM7),o($V87,$VN7,{76:3690,78:3691,80:3692,46:3693,120:3694,81:[1,3695],82:[1,3696],83:[1,3697],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($V87,$VO7),o($V87,$VP7,{79:3698,75:3699,94:3700,96:3701,97:3705,101:3706,98:[1,3702],99:[1,3703],100:[1,3704],103:$VC9,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:3708,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($V87,$VR7),o($VS7,$VA1,{95:3709}),o($VT7,$VB1,{101:3390,97:3710,103:$Vc9,104:$VR,105:$VS,106:$VT}),o($VU7,$VD1,{88:3711}),o($VU7,$VD1,{88:3712}),o($VU7,$VD1,{88:3713}),o($V87,$VE1,{107:3396,109:3397,93:3714,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VV7,$VW7),o($VV7,$VX7),o($VS7,$VJ1),o($VS7,$VK1),o($VS7,$VL1),o($VS7,$VM1),o($VU7,$VN1),o($VO1,$VP1,{163:3715}),o($VY7,$VR1),{121:[1,3716],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($VV7,$V71),o($VV7,$V81),{20:[1,3720],22:[1,3724],23:3718,38:3717,202:3719,216:3721,217:[1,3723],218:[1,3722]},{102:[1,3725]},o($VS7,$VS1),o($VU7,$VT1),o($VU7,$VU1),o($VU7,$VV1),o($VU7,$VW1),{102:[1,3727],108:3726,110:[1,3728],111:[1,3729],112:3730,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,3731]},{123:[1,3732]},o($VV8,$Vb4),o($VU7,$Vs3),o($VU7,$Vt3),o($VU7,$Vu3),o($VU7,$Vv3),o($VU7,$Vw3),{113:[1,3733]},o($VU7,$VB3),o($VV7,$Vh5),o($VY7,$VX5),o($VY7,$VN1),o($VY7,$VT1),o($VY7,$VU1),o($VY7,$VV1),o($VY7,$VW1),o($VD9,$VK2,{85:3734,86:3735,194:3736,191:$VE9}),o($V19,$VP8),o($VC,$Vh,{57:3738,61:3739,42:3740,45:$VD}),o($V29,$VQ8),o($VC,$Vh,{61:3741,42:3742,45:$VD}),o($V29,$VR8),o($V29,$VS8),o($V29,$VW7),o($V29,$VX7),{121:[1,3743],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($V29,$V71),o($V29,$V81),{20:[1,3747],22:[1,3751],23:3745,38:3744,202:3746,216:3748,217:[1,3750],218:[1,3749]},o($V29,$VT8),o($V29,$VU8),o($VF9,$VA1,{95:3752}),o($V29,$VB1,{101:3435,97:3753,103:$Vf9,104:$VR,105:$VS,106:$VT}),o($VF9,$VJ1),o($VF9,$VK1),o($VF9,$VL1),o($VF9,$VM1),{102:[1,3754]},o($VF9,$VS1),{72:[1,3755]},o($Vh9,$VO2,{101:3108,97:3756,103:$V39,104:$VR,105:$VS,106:$VT}),o($Vg9,$VP2),o($V29,$VQ2,{92:3757,97:3758,93:3759,101:3760,107:3762,109:3763,103:$VG9,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V29,$VS2,{92:3757,97:3758,93:3759,101:3760,107:3762,109:3763,103:$VG9,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V29,$VT2,{92:3757,97:3758,93:3759,101:3760,107:3762,109:3763,103:$VG9,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vk9,$VU2),{20:$V83,22:$V93,23:415,29:[1,3764],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:3765,123:$VX2,150:$VY2,190:$VZ2}),o($Vj9,$V42),o($Vj9,$Vm),o($Vj9,$Vn),o($Vj9,$Vr),o($Vj9,$Vs),o($Vj9,$Vt),o($Vj9,$Vu),o($Vj9,$Vv),o($Vg9,$Vs3),o($Vk9,$Vt3),o($Vk9,$Vu3),o($Vk9,$Vv3),o($Vk9,$Vw3),{113:[1,3766]},o($Vk9,$VB3),o($VD9,$VK2,{86:3735,194:3736,85:3767,191:$VE9}),o($Vx1,$Vh5),{195:[1,3770],196:3768,197:[1,3769]},o($Vv1,$V66),o($Vv1,$V76),o($Vv1,$V86),o($Vv1,$VT1),o($Vv1,$VU1),o($Vv1,$VV1),o($Vv1,$VW1),o($Vv1,$VB4),o($Vv1,$VC4),o($Vv1,$VD4),o($Vv1,$VE4),o($Vv1,$VF4,{204:3771,205:3772,113:[1,3773]}),o($Vv1,$VG4),o($Vv1,$VH4),o($Vv1,$VI4),o($Vv1,$VJ4),o($Vv1,$VK4),o($Vv1,$VL4),o($Vv1,$VM4),o($Vv1,$VN4),o($Vv1,$VO4),o($V96,$Vx3),o($V96,$Vy3),o($V96,$Vz3),o($V96,$VA3),{195:[1,3776],196:3774,197:[1,3775]},o($Vx1,$V66),o($Vx1,$V76),o($Vx1,$V86),o($Vx1,$VT1),o($Vx1,$VU1),o($Vx1,$VV1),o($Vx1,$VW1),o($Vx1,$VB4),o($Vx1,$VC4),o($Vx1,$VD4),o($Vx1,$VE4),o($Vx1,$VF4,{204:3777,205:3778,113:[1,3779]}),o($Vx1,$VG4),o($Vx1,$VH4),o($Vx1,$VI4),o($Vx1,$VJ4),o($Vx1,$VK4),o($Vx1,$VL4),o($Vx1,$VM4),o($Vx1,$VN4),o($Vx1,$VO4),o($Va6,$Vx3),o($Va6,$Vy3),o($Va6,$Vz3),o($Va6,$VA3),{20:[1,3782],22:[1,3784],89:3780,166:[1,3785],193:3781,217:[1,3783]},{195:[1,3788],196:3786,197:[1,3787]},o($Vy1,$V66),o($Vy1,$V76),o($Vy1,$V86),o($Vy1,$VT1),o($Vy1,$VU1),o($Vy1,$VV1),o($Vy1,$VW1),o($Vy1,$VB4),o($Vy1,$VC4),o($Vy1,$VD4),o($Vy1,$VE4),o($Vy1,$VF4,{204:3789,205:3790,113:[1,3791]}),o($Vy1,$VG4),o($Vy1,$VH4),o($Vy1,$VI4),o($Vy1,$VJ4),o($Vy1,$VK4),o($Vy1,$VL4),o($Vy1,$VM4),o($Vy1,$VN4),o($Vy1,$VO4),o($Vb6,$Vx3),o($Vb6,$Vy3),o($Vb6,$Vz3),o($Vb6,$VA3),o($Vj1,$Va4),{123:[1,3792]},o($Vj1,$V14),o($VC2,$Vb4),o($VJ2,$V35),{20:$Vo,22:$Vp,23:3793,216:57,217:$Vq},{20:$VH9,22:$VI9,102:[1,3806],110:[1,3807],111:[1,3808],112:3805,166:$VJ9,182:3796,192:3794,193:3795,198:3801,199:3802,200:3803,203:3804,206:[1,3809],207:[1,3810],208:[1,3815],209:[1,3816],210:[1,3817],211:[1,3818],212:[1,3811],213:[1,3812],214:[1,3813],215:[1,3814],217:$VK9},o($VL2,$V35),{20:$Vo,22:$Vp,23:3819,216:57,217:$Vq},{20:$VL9,22:$VM9,102:[1,3832],110:[1,3833],111:[1,3834],112:3831,166:$VN9,182:3822,192:3820,193:3821,198:3827,199:3828,200:3829,203:3830,206:[1,3835],207:[1,3836],208:[1,3841],209:[1,3842],210:[1,3843],211:[1,3844],212:[1,3837],213:[1,3838],214:[1,3839],215:[1,3840],217:$VO9},o($VC1,$Vs3),o($VC1,$Vt3),o($VC1,$Vu3),o($VC1,$Vv3),o($VC1,$Vw3),{113:[1,3845]},o($VC1,$VB3),o($VN2,$V35),{20:$Vo,22:$Vp,23:3846,216:57,217:$Vq},{20:$VP9,22:$VQ9,102:[1,3859],110:[1,3860],111:[1,3861],112:3858,166:$VR9,182:3849,192:3847,193:3848,198:3854,199:3855,200:3856,203:3857,206:[1,3862],207:[1,3863],208:[1,3868],209:[1,3869],210:[1,3870],211:[1,3871],212:[1,3864],213:[1,3865],214:[1,3866],215:[1,3867],217:$VS9},o($Vy1,$Vh5),o($VQ1,$VX5),o($VQ1,$VN1),o($VQ1,$VT1),o($VQ1,$VU1),o($VQ1,$VV1),o($VQ1,$VW1),o($Vv1,$Vs6),o($Vv1,$VN1),o($Vx1,$Vs6),o($Vx1,$VN1),o($Vy1,$Vs6),o($Vy1,$VN1),o($Vv1,$Vs6),o($Vv1,$VN1),o($Vx1,$Vs6),o($Vx1,$VN1),o($Vy1,$Vs6),o($Vy1,$VN1),o($VT3,$Va4),{123:[1,3872]},o($VT3,$V14),o($VX4,$Vb4),o($VY4,$V35),{20:$Vo,22:$Vp,23:3873,216:57,217:$Vq},{20:$VT9,22:$VU9,102:[1,3886],110:[1,3887],111:[1,3888],112:3885,166:$VV9,182:3876,192:3874,193:3875,198:3881,199:3882,200:3883,203:3884,206:[1,3889],207:[1,3890],208:[1,3895],209:[1,3896],210:[1,3897],211:[1,3898],212:[1,3891],213:[1,3892],214:[1,3893],215:[1,3894],217:$VW9},o($VZ4,$V35),{20:$Vo,22:$Vp,23:3899,216:57,217:$Vq},{20:$VX9,22:$VY9,102:[1,3912],110:[1,3913],111:[1,3914],112:3911,166:$VZ9,182:3902,192:3900,193:3901,198:3907,199:3908,200:3909,203:3910,206:[1,3915],207:[1,3916],208:[1,3921],209:[1,3922],210:[1,3923],211:[1,3924],212:[1,3917],213:[1,3918],214:[1,3919],215:[1,3920],217:$V_9},o($VZ3,$Vs3),o($VZ3,$Vt3),o($VZ3,$Vu3),o($VZ3,$Vv3),o($VZ3,$Vw3),{113:[1,3925]},o($VZ3,$VB3),o($V$4,$V35),{20:$Vo,22:$Vp,23:3926,216:57,217:$Vq},{20:$V$9,22:$V0a,102:[1,3939],110:[1,3940],111:[1,3941],112:3938,166:$V1a,182:3929,192:3927,193:3928,198:3934,199:3935,200:3936,203:3937,206:[1,3942],207:[1,3943],208:[1,3948],209:[1,3949],210:[1,3950],211:[1,3951],212:[1,3944],213:[1,3945],214:[1,3946],215:[1,3947],217:$V2a},o($VX3,$Vh5),o($V_3,$VX5),o($V_3,$VN1),o($V_3,$VT1),o($V_3,$VU1),o($V_3,$VV1),o($V_3,$VW1),o($VV3,$Vs6),o($VV3,$VN1),o($VW3,$Vs6),o($VW3,$VN1),o($VX3,$Vs6),o($VX3,$VN1),o($VV3,$Vs6),o($VV3,$VN1),o($VW3,$Vs6),o($VW3,$VN1),o($VX3,$Vs6),o($VX3,$VN1),{195:[1,3954],196:3952,197:[1,3953]},o($V_6,$V66),o($V_6,$V76),o($V_6,$V86),o($V_6,$VT1),o($V_6,$VU1),o($V_6,$VV1),o($V_6,$VW1),o($V_6,$VB4),o($V_6,$VC4),o($V_6,$VD4),o($V_6,$VE4),o($V_6,$VF4,{204:3955,205:3956,113:[1,3957]}),o($V_6,$VG4),o($V_6,$VH4),o($V_6,$VI4),o($V_6,$VJ4),o($V_6,$VK4),o($V_6,$VL4),o($V_6,$VM4),o($V_6,$VN4),o($V_6,$VO4),o($V3a,$Vx3),o($V3a,$Vy3),o($V3a,$Vz3),o($V3a,$VA3),o($V87,$VQ8),o($VC,$Vh,{61:3958,42:3959,45:$VD}),o($V87,$VR8),o($V87,$VS8),o($V87,$VW7),o($V87,$VX7),{121:[1,3960],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($V87,$V71),o($V87,$V81),{20:[1,3964],22:[1,3968],23:3962,38:3961,202:3963,216:3965,217:[1,3967],218:[1,3966]},o($V87,$VT8),o($V87,$VU8),o($VV8,$VA1,{95:3969}),o($V87,$VB1,{101:3664,97:3970,103:$VB9,104:$VR,105:$VS,106:$VT}),o($VV8,$VJ1),o($VV8,$VK1),o($VV8,$VL1),o($VV8,$VM1),{102:[1,3971]},o($VV8,$VS1),{72:[1,3972]},o($VT7,$VO2,{101:3357,97:3973,103:$Va9,104:$VR,105:$VS,106:$VT}),o($VS7,$VP2),o($V87,$VQ2,{92:3974,97:3975,93:3976,101:3977,107:3979,109:3980,103:$V4a,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V87,$VS2,{92:3974,97:3975,93:3976,101:3977,107:3979,109:3980,103:$V4a,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V87,$VT2,{92:3974,97:3975,93:3976,101:3977,107:3979,109:3980,103:$V4a,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VY7,$VU2),{20:$V83,22:$V93,23:415,29:[1,3981],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:3982,123:$VX2,150:$VY2,190:$VZ2}),o($VV7,$V42),o($VV7,$Vm),o($VV7,$Vn),o($VV7,$Vr),o($VV7,$Vs),o($VV7,$Vt),o($VV7,$Vu),o($VV7,$Vv),o($VS7,$Vs3),o($VY7,$Vt3),o($VY7,$Vu3),o($VY7,$Vv3),o($VY7,$Vw3),{113:[1,3983]},o($VY7,$VB3),o($V87,$VR8),o($V87,$VS8),o($V87,$VW7),o($V87,$VX7),{121:[1,3984],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($V87,$V71),o($V87,$V81),{20:[1,3988],22:[1,3992],23:3986,38:3985,202:3987,216:3989,217:[1,3991],218:[1,3990]},o($V87,$VT8),o($V87,$VU8),o($VV8,$VA1,{95:3993}),o($V87,$VB1,{101:3706,97:3994,103:$VC9,104:$VR,105:$VS,106:$VT}),o($VV8,$VJ1),o($VV8,$VK1),o($VV8,$VL1),o($VV8,$VM1),{102:[1,3995]},o($VV8,$VS1),{72:[1,3996]},o($VT7,$VO2,{101:3390,97:3997,103:$Vc9,104:$VR,105:$VS,106:$VT}),o($VS7,$VP2),o($V87,$VQ2,{92:3998,97:3999,93:4000,101:4001,107:4003,109:4004,103:$V5a,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V87,$VS2,{92:3998,97:3999,93:4000,101:4001,107:4003,109:4004,103:$V5a,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V87,$VT2,{92:3998,97:3999,93:4000,101:4001,107:4003,109:4004,103:$V5a,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VY7,$VU2),{20:$V83,22:$V93,23:415,29:[1,4005],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4006,123:$VX2,150:$VY2,190:$VZ2}),o($VV7,$V42),o($VV7,$Vm),o($VV7,$Vn),o($VV7,$Vr),o($VV7,$Vs),o($VV7,$Vt),o($VV7,$Vu),o($VV7,$Vv),o($VS7,$Vs3),o($VY7,$Vt3),o($VY7,$Vu3),o($VY7,$Vv3),o($VY7,$Vw3),{113:[1,4007]},o($VY7,$VB3),o($V87,$Vh5),{20:[1,4010],22:[1,4012],89:4008,166:[1,4013],193:4009,217:[1,4011]},o($Vn6,$V89),o($VX8,$V24),o($Vn6,$V34,{37:4014,195:[1,4015]}),{20:$V44,22:$V54,131:4016,166:$V64,193:647,201:$V74,217:$V84},o($V19,$V99),o($V29,$V97,{62:4017}),o($VH,$VI,{65:4018,75:4019,77:4020,78:4021,94:4024,96:4025,89:4027,90:4028,91:4029,80:4030,46:4031,97:4035,193:4036,93:4038,120:4039,101:4043,107:4049,109:4050,20:[1,4045],22:[1,4047],28:[1,4037],71:[1,4022],73:[1,4023],81:[1,4040],82:[1,4041],83:[1,4042],87:[1,4026],98:[1,4032],99:[1,4033],100:[1,4034],103:$V6a,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,4048],217:[1,4046]}),o($V29,$Vb9),o($VH,$VI,{65:4051,75:4052,77:4053,78:4054,94:4057,96:4058,89:4060,90:4061,91:4062,80:4063,46:4064,97:4068,193:4069,93:4071,120:4072,101:4076,107:4082,109:4083,20:[1,4078],22:[1,4080],28:[1,4070],71:[1,4055],73:[1,4056],81:[1,4073],82:[1,4074],83:[1,4075],87:[1,4059],98:[1,4065],99:[1,4066],100:[1,4067],103:$V7a,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,4081],217:[1,4079]}),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4084,123:$VX2,150:$VY2,190:$VZ2}),o($V29,$V42),o($V29,$Vm),o($V29,$Vn),o($V29,$Vr),o($V29,$Vs),o($V29,$Vt),o($V29,$Vu),o($V29,$Vv),o($V29,$VO2,{101:3435,97:4085,103:$Vf9,104:$VR,105:$VS,106:$VT}),o($VF9,$VP2),o($VF9,$Vs3),o($V29,$Vd9),o($Vg9,$Vb4),o($Vi9,$Vc4),o($Vi9,$Vd4),o($Vi9,$Ve4),{102:[1,4086]},o($Vi9,$VS1),{102:[1,4088],108:4087,110:[1,4089],111:[1,4090],112:4091,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4092]},o($Vi9,$Vy4),{123:[1,4093]},{20:[1,4096],22:[1,4098],89:4094,166:[1,4099],193:4095,217:[1,4097]},o($Vn6,$Ve9),o($VJ2,$V52),o($VJ2,$V62),o($VJ2,$V72),o($Vv1,$VV5),o($Vv1,$VW5),{20:$Vl9,22:$Vm9,89:4100,166:$Vn9,193:4101,217:$Vo9},o($VL2,$V52),o($VL2,$V62),o($VL2,$V72),o($Vx1,$VV5),o($Vx1,$VW5),{20:$Vp9,22:$Vq9,89:4102,166:$Vr9,193:4103,217:$Vs9},o($VC1,$VX5),o($VC1,$VN1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),o($VN2,$V52),o($VN2,$V62),o($VN2,$V72),o($Vy1,$VV5),o($Vy1,$VW5),{20:$Vt9,22:$Vu9,89:4104,166:$Vv9,193:4105,217:$Vw9},o($Vx1,$Vh5),{195:[1,4108],196:4106,197:[1,4107]},o($Vv1,$V66),o($Vv1,$V76),o($Vv1,$V86),o($Vv1,$VT1),o($Vv1,$VU1),o($Vv1,$VV1),o($Vv1,$VW1),o($Vv1,$VB4),o($Vv1,$VC4),o($Vv1,$VD4),o($Vv1,$VE4),o($Vv1,$VF4,{204:4109,205:4110,113:[1,4111]}),o($Vv1,$VG4),o($Vv1,$VH4),o($Vv1,$VI4),o($Vv1,$VJ4),o($Vv1,$VK4),o($Vv1,$VL4),o($Vv1,$VM4),o($Vv1,$VN4),o($Vv1,$VO4),o($V96,$Vx3),o($V96,$Vy3),o($V96,$Vz3),o($V96,$VA3),{195:[1,4114],196:4112,197:[1,4113]},o($Vx1,$V66),o($Vx1,$V76),o($Vx1,$V86),o($Vx1,$VT1),o($Vx1,$VU1),o($Vx1,$VV1),o($Vx1,$VW1),o($Vx1,$VB4),o($Vx1,$VC4),o($Vx1,$VD4),o($Vx1,$VE4),o($Vx1,$VF4,{204:4115,205:4116,113:[1,4117]}),o($Vx1,$VG4),o($Vx1,$VH4),o($Vx1,$VI4),o($Vx1,$VJ4),o($Vx1,$VK4),o($Vx1,$VL4),o($Vx1,$VM4),o($Vx1,$VN4),o($Vx1,$VO4),o($Va6,$Vx3),o($Va6,$Vy3),o($Va6,$Vz3),o($Va6,$VA3),{20:[1,4120],22:[1,4122],89:4118,166:[1,4123],193:4119,217:[1,4121]},{195:[1,4126],196:4124,197:[1,4125]},o($Vy1,$V66),o($Vy1,$V76),o($Vy1,$V86),o($Vy1,$VT1),o($Vy1,$VU1),o($Vy1,$VV1),o($Vy1,$VW1),o($Vy1,$VB4),o($Vy1,$VC4),o($Vy1,$VD4),o($Vy1,$VE4),o($Vy1,$VF4,{204:4127,205:4128,113:[1,4129]}),o($Vy1,$VG4),o($Vy1,$VH4),o($Vy1,$VI4),o($Vy1,$VJ4),o($Vy1,$VK4),o($Vy1,$VL4),o($Vy1,$VM4),o($Vy1,$VN4),o($Vy1,$VO4),o($Vb6,$Vx3),o($Vb6,$Vy3),o($Vb6,$Vz3),o($Vb6,$VA3),o($VW3,$Vh5),{195:[1,4132],196:4130,197:[1,4131]},o($VV3,$V66),o($VV3,$V76),o($VV3,$V86),o($VV3,$VT1),o($VV3,$VU1),o($VV3,$VV1),o($VV3,$VW1),o($VV3,$VB4),o($VV3,$VC4),o($VV3,$VD4),o($VV3,$VE4),o($VV3,$VF4,{204:4133,205:4134,113:[1,4135]}),o($VV3,$VG4),o($VV3,$VH4),o($VV3,$VI4),o($VV3,$VJ4),o($VV3,$VK4),o($VV3,$VL4),o($VV3,$VM4),o($VV3,$VN4),o($VV3,$VO4),o($VB7,$Vx3),o($VB7,$Vy3),o($VB7,$Vz3),o($VB7,$VA3),{195:[1,4138],196:4136,197:[1,4137]},o($VW3,$V66),o($VW3,$V76),o($VW3,$V86),o($VW3,$VT1),o($VW3,$VU1),o($VW3,$VV1),o($VW3,$VW1),o($VW3,$VB4),o($VW3,$VC4),o($VW3,$VD4),o($VW3,$VE4),o($VW3,$VF4,{204:4139,205:4140,113:[1,4141]}),o($VW3,$VG4),o($VW3,$VH4),o($VW3,$VI4),o($VW3,$VJ4),o($VW3,$VK4),o($VW3,$VL4),o($VW3,$VM4),o($VW3,$VN4),o($VW3,$VO4),o($VC7,$Vx3),o($VC7,$Vy3),o($VC7,$Vz3),o($VC7,$VA3),{20:[1,4144],22:[1,4146],89:4142,166:[1,4147],193:4143,217:[1,4145]},{195:[1,4150],196:4148,197:[1,4149]},o($VX3,$V66),o($VX3,$V76),o($VX3,$V86),o($VX3,$VT1),o($VX3,$VU1),o($VX3,$VV1),o($VX3,$VW1),o($VX3,$VB4),o($VX3,$VC4),o($VX3,$VD4),o($VX3,$VE4),o($VX3,$VF4,{204:4151,205:4152,113:[1,4153]}),o($VX3,$VG4),o($VX3,$VH4),o($VX3,$VI4),o($VX3,$VJ4),o($VX3,$VK4),o($VX3,$VL4),o($VX3,$VM4),o($VX3,$VN4),o($VX3,$VO4),o($VD7,$Vx3),o($VD7,$Vy3),o($VD7,$Vz3),o($VD7,$VA3),o($VN8,$V52),o($VN8,$V62),o($VN8,$V72),o($V_6,$VV5),o($V_6,$VW5),{20:$Vx9,22:$Vy9,89:4154,166:$Vz9,193:4155,217:$VA9},o($V87,$Vb9),o($VH,$VI,{65:4156,75:4157,77:4158,78:4159,94:4162,96:4163,89:4165,90:4166,91:4167,80:4168,46:4169,97:4173,193:4174,93:4176,120:4177,101:4181,107:4187,109:4188,20:[1,4183],22:[1,4185],28:[1,4175],71:[1,4160],73:[1,4161],81:[1,4178],82:[1,4179],83:[1,4180],87:[1,4164],98:[1,4170],99:[1,4171],100:[1,4172],103:$V8a,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,4186],217:[1,4184]}),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4189,123:$VX2,150:$VY2,190:$VZ2}),o($V87,$V42),o($V87,$Vm),o($V87,$Vn),o($V87,$Vr),o($V87,$Vs),o($V87,$Vt),o($V87,$Vu),o($V87,$Vv),o($V87,$VO2,{101:3664,97:4190,103:$VB9,104:$VR,105:$VS,106:$VT}),o($VV8,$VP2),o($VV8,$Vs3),o($V87,$Vd9),o($VS7,$Vb4),o($VU7,$Vc4),o($VU7,$Vd4),o($VU7,$Ve4),{102:[1,4191]},o($VU7,$VS1),{102:[1,4193],108:4192,110:[1,4194],111:[1,4195],112:4196,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4197]},o($VU7,$Vy4),{123:[1,4198]},{20:[1,4201],22:[1,4203],89:4199,166:[1,4204],193:4200,217:[1,4202]},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4205,123:$VX2,150:$VY2,190:$VZ2}),o($V87,$V42),o($V87,$Vm),o($V87,$Vn),o($V87,$Vr),o($V87,$Vs),o($V87,$Vt),o($V87,$Vu),o($V87,$Vv),o($V87,$VO2,{101:3706,97:4206,103:$VC9,104:$VR,105:$VS,106:$VT}),o($VV8,$VP2),o($VV8,$Vs3),o($V87,$Vd9),o($VS7,$Vb4),o($VU7,$Vc4),o($VU7,$Vd4),o($VU7,$Ve4),{102:[1,4207]},o($VU7,$VS1),{102:[1,4209],108:4208,110:[1,4210],111:[1,4211],112:4212,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4213]},o($VU7,$Vy4),{123:[1,4214]},{20:[1,4217],22:[1,4219],89:4215,166:[1,4220],193:4216,217:[1,4218]},o($VU7,$VX5),o($VU7,$VN1),o($VU7,$VT1),o($VU7,$VU1),o($VU7,$VV1),o($VU7,$VW1),o($VD9,$V35),{20:$Vo,22:$Vp,23:4221,216:57,217:$Vq},{20:$V9a,22:$Vaa,102:[1,4234],110:[1,4235],111:[1,4236],112:4233,166:$Vba,182:4224,192:4222,193:4223,198:4229,199:4230,200:4231,203:4232,206:[1,4237],207:[1,4238],208:[1,4243],209:[1,4244],210:[1,4245],211:[1,4246],212:[1,4239],213:[1,4240],214:[1,4241],215:[1,4242],217:$Vca},o($V19,$VL7,{63:4247,55:[1,4248]}),o($V29,$VM7),o($V29,$VN7,{76:4249,78:4250,80:4251,46:4252,120:4253,81:[1,4254],82:[1,4255],83:[1,4256],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($V29,$VO7),o($V29,$VP7,{79:4257,75:4258,94:4259,96:4260,97:4264,101:4265,98:[1,4261],99:[1,4262],100:[1,4263],103:$Vda,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:4267,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($V29,$VR7),o($Vg9,$VA1,{95:4268}),o($Vh9,$VB1,{101:4043,97:4269,103:$V6a,104:$VR,105:$VS,106:$VT}),o($Vi9,$VD1,{88:4270}),o($Vi9,$VD1,{88:4271}),o($Vi9,$VD1,{88:4272}),o($V29,$VE1,{107:4049,109:4050,93:4273,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vj9,$VW7),o($Vj9,$VX7),o($Vg9,$VJ1),o($Vg9,$VK1),o($Vg9,$VL1),o($Vg9,$VM1),o($Vi9,$VN1),o($VO1,$VP1,{163:4274}),o($Vk9,$VR1),{121:[1,4275],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj9,$V71),o($Vj9,$V81),{20:[1,4279],22:[1,4283],23:4277,38:4276,202:4278,216:4280,217:[1,4282],218:[1,4281]},{102:[1,4284]},o($Vg9,$VS1),o($Vi9,$VT1),o($Vi9,$VU1),o($Vi9,$VV1),o($Vi9,$VW1),{102:[1,4286],108:4285,110:[1,4287],111:[1,4288],112:4289,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4290]},o($V29,$VM7),o($V29,$VN7,{76:4291,78:4292,80:4293,46:4294,120:4295,81:[1,4296],82:[1,4297],83:[1,4298],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($V29,$VO7),o($V29,$VP7,{79:4299,75:4300,94:4301,96:4302,97:4306,101:4307,98:[1,4303],99:[1,4304],100:[1,4305],103:$Vea,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:4309,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($V29,$VR7),o($Vg9,$VA1,{95:4310}),o($Vh9,$VB1,{101:4076,97:4311,103:$V7a,104:$VR,105:$VS,106:$VT}),o($Vi9,$VD1,{88:4312}),o($Vi9,$VD1,{88:4313}),o($Vi9,$VD1,{88:4314}),o($V29,$VE1,{107:4082,109:4083,93:4315,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vj9,$VW7),o($Vj9,$VX7),o($Vg9,$VJ1),o($Vg9,$VK1),o($Vg9,$VL1),o($Vg9,$VM1),o($Vi9,$VN1),o($VO1,$VP1,{163:4316}),o($Vk9,$VR1),{121:[1,4317],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj9,$V71),o($Vj9,$V81),{20:[1,4321],22:[1,4325],23:4319,38:4318,202:4320,216:4322,217:[1,4324],218:[1,4323]},{102:[1,4326]},o($Vg9,$VS1),o($Vi9,$VT1),o($Vi9,$VU1),o($Vi9,$VV1),o($Vi9,$VW1),{102:[1,4328],108:4327,110:[1,4329],111:[1,4330],112:4331,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4332]},{123:[1,4333]},o($VF9,$Vb4),o($Vi9,$Vs3),o($Vi9,$Vt3),o($Vi9,$Vu3),o($Vi9,$Vv3),o($Vi9,$Vw3),{113:[1,4334]},o($Vi9,$VB3),o($Vj9,$Vh5),o($Vk9,$VX5),o($Vk9,$VN1),o($Vk9,$VT1),o($Vk9,$VU1),o($Vk9,$VV1),o($Vk9,$VW1),o($Vv1,$Vs6),o($Vv1,$VN1),o($Vx1,$Vs6),o($Vx1,$VN1),o($Vy1,$Vs6),o($Vy1,$VN1),o($VJ2,$V52),o($VJ2,$V62),o($VJ2,$V72),o($Vv1,$VV5),o($Vv1,$VW5),{20:$VH9,22:$VI9,89:4335,166:$VJ9,193:4336,217:$VK9},o($VL2,$V52),o($VL2,$V62),o($VL2,$V72),o($Vx1,$VV5),o($Vx1,$VW5),{20:$VL9,22:$VM9,89:4337,166:$VN9,193:4338,217:$VO9},o($VC1,$VX5),o($VC1,$VN1),o($VC1,$VT1),o($VC1,$VU1),o($VC1,$VV1),o($VC1,$VW1),o($VN2,$V52),o($VN2,$V62),o($VN2,$V72),o($Vy1,$VV5),o($Vy1,$VW5),{20:$VP9,22:$VQ9,89:4339,166:$VR9,193:4340,217:$VS9},o($VY4,$V52),o($VY4,$V62),o($VY4,$V72),o($VV3,$VV5),o($VV3,$VW5),{20:$VT9,22:$VU9,89:4341,166:$VV9,193:4342,217:$VW9},o($VZ4,$V52),o($VZ4,$V62),o($VZ4,$V72),o($VW3,$VV5),o($VW3,$VW5),{20:$VX9,22:$VY9,89:4343,166:$VZ9,193:4344,217:$V_9},o($VZ3,$VX5),o($VZ3,$VN1),o($VZ3,$VT1),o($VZ3,$VU1),o($VZ3,$VV1),o($VZ3,$VW1),o($V$4,$V52),o($V$4,$V62),o($V$4,$V72),o($VX3,$VV5),o($VX3,$VW5),{20:$V$9,22:$V0a,89:4345,166:$V1a,193:4346,217:$V2a},o($V_6,$Vs6),o($V_6,$VN1),o($V87,$VM7),o($V87,$VN7,{76:4347,78:4348,80:4349,46:4350,120:4351,81:[1,4352],82:[1,4353],83:[1,4354],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($V87,$VO7),o($V87,$VP7,{79:4355,75:4356,94:4357,96:4358,97:4362,101:4363,98:[1,4359],99:[1,4360],100:[1,4361],103:$Vfa,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:4365,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($V87,$VR7),o($VS7,$VA1,{95:4366}),o($VT7,$VB1,{101:4181,97:4367,103:$V8a,104:$VR,105:$VS,106:$VT}),o($VU7,$VD1,{88:4368}),o($VU7,$VD1,{88:4369}),o($VU7,$VD1,{88:4370}),o($V87,$VE1,{107:4187,109:4188,93:4371,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VV7,$VW7),o($VV7,$VX7),o($VS7,$VJ1),o($VS7,$VK1),o($VS7,$VL1),o($VS7,$VM1),o($VU7,$VN1),o($VO1,$VP1,{163:4372}),o($VY7,$VR1),{121:[1,4373],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($VV7,$V71),o($VV7,$V81),{20:[1,4377],22:[1,4381],23:4375,38:4374,202:4376,216:4378,217:[1,4380],218:[1,4379]},{102:[1,4382]},o($VS7,$VS1),o($VU7,$VT1),o($VU7,$VU1),o($VU7,$VV1),o($VU7,$VW1),{102:[1,4384],108:4383,110:[1,4385],111:[1,4386],112:4387,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4388]},{123:[1,4389]},o($VV8,$Vb4),o($VU7,$Vs3),o($VU7,$Vt3),o($VU7,$Vu3),o($VU7,$Vv3),o($VU7,$Vw3),{113:[1,4390]},o($VU7,$VB3),o($VV7,$Vh5),o($VY7,$VX5),o($VY7,$VN1),o($VY7,$VT1),o($VY7,$VU1),o($VY7,$VV1),o($VY7,$VW1),{123:[1,4391]},o($VV8,$Vb4),o($VU7,$Vs3),o($VU7,$Vt3),o($VU7,$Vu3),o($VU7,$Vv3),o($VU7,$Vw3),{113:[1,4392]},o($VU7,$VB3),o($VV7,$Vh5),o($VY7,$VX5),o($VY7,$VN1),o($VY7,$VT1),o($VY7,$VU1),o($VY7,$VV1),o($VY7,$VW1),{195:[1,4395],196:4393,197:[1,4394]},o($VX8,$V66),o($VX8,$V76),o($VX8,$V86),o($VX8,$VT1),o($VX8,$VU1),o($VX8,$VV1),o($VX8,$VW1),o($VX8,$VB4),o($VX8,$VC4),o($VX8,$VD4),o($VX8,$VE4),o($VX8,$VF4,{204:4396,205:4397,113:[1,4398]}),o($VX8,$VG4),o($VX8,$VH4),o($VX8,$VI4),o($VX8,$VJ4),o($VX8,$VK4),o($VX8,$VL4),o($VX8,$VM4),o($VX8,$VN4),o($VX8,$VO4),o($Vga,$Vx3),o($Vga,$Vy3),o($Vga,$Vz3),o($Vga,$VA3),o($V29,$VQ8),o($VC,$Vh,{61:4399,42:4400,45:$VD}),o($V29,$VR8),o($V29,$VS8),o($V29,$VW7),o($V29,$VX7),{121:[1,4401],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($V29,$V71),o($V29,$V81),{20:[1,4405],22:[1,4409],23:4403,38:4402,202:4404,216:4406,217:[1,4408],218:[1,4407]},o($V29,$VT8),o($V29,$VU8),o($VF9,$VA1,{95:4410}),o($V29,$VB1,{101:4265,97:4411,103:$Vda,104:$VR,105:$VS,106:$VT}),o($VF9,$VJ1),o($VF9,$VK1),o($VF9,$VL1),o($VF9,$VM1),{102:[1,4412]},o($VF9,$VS1),{72:[1,4413]},o($Vh9,$VO2,{101:4043,97:4414,103:$V6a,104:$VR,105:$VS,106:$VT}),o($Vg9,$VP2),o($V29,$VQ2,{92:4415,97:4416,93:4417,101:4418,107:4420,109:4421,103:$Vha,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V29,$VS2,{92:4415,97:4416,93:4417,101:4418,107:4420,109:4421,103:$Vha,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V29,$VT2,{92:4415,97:4416,93:4417,101:4418,107:4420,109:4421,103:$Vha,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vk9,$VU2),{20:$V83,22:$V93,23:415,29:[1,4422],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4423,123:$VX2,150:$VY2,190:$VZ2}),o($Vj9,$V42),o($Vj9,$Vm),o($Vj9,$Vn),o($Vj9,$Vr),o($Vj9,$Vs),o($Vj9,$Vt),o($Vj9,$Vu),o($Vj9,$Vv),o($Vg9,$Vs3),o($Vk9,$Vt3),o($Vk9,$Vu3),o($Vk9,$Vv3),o($Vk9,$Vw3),{113:[1,4424]},o($Vk9,$VB3),o($V29,$VR8),o($V29,$VS8),o($V29,$VW7),o($V29,$VX7),{121:[1,4425],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($V29,$V71),o($V29,$V81),{20:[1,4429],22:[1,4433],23:4427,38:4426,202:4428,216:4430,217:[1,4432],218:[1,4431]},o($V29,$VT8),o($V29,$VU8),o($VF9,$VA1,{95:4434}),o($V29,$VB1,{101:4307,97:4435,103:$Vea,104:$VR,105:$VS,106:$VT}),o($VF9,$VJ1),o($VF9,$VK1),o($VF9,$VL1),o($VF9,$VM1),{102:[1,4436]},o($VF9,$VS1),{72:[1,4437]},o($Vh9,$VO2,{101:4076,97:4438,103:$V7a,104:$VR,105:$VS,106:$VT}),o($Vg9,$VP2),o($V29,$VQ2,{92:4439,97:4440,93:4441,101:4442,107:4444,109:4445,103:$Via,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V29,$VS2,{92:4439,97:4440,93:4441,101:4442,107:4444,109:4445,103:$Via,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V29,$VT2,{92:4439,97:4440,93:4441,101:4442,107:4444,109:4445,103:$Via,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vk9,$VU2),{20:$V83,22:$V93,23:415,29:[1,4446],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4447,123:$VX2,150:$VY2,190:$VZ2}),o($Vj9,$V42),o($Vj9,$Vm),o($Vj9,$Vn),o($Vj9,$Vr),o($Vj9,$Vs),o($Vj9,$Vt),o($Vj9,$Vu),o($Vj9,$Vv),o($Vg9,$Vs3),o($Vk9,$Vt3),o($Vk9,$Vu3),o($Vk9,$Vv3),o($Vk9,$Vw3),{113:[1,4448]},o($Vk9,$VB3),o($V29,$Vh5),{20:[1,4451],22:[1,4453],89:4449,166:[1,4454],193:4450,217:[1,4452]},o($Vv1,$Vs6),o($Vv1,$VN1),o($Vx1,$Vs6),o($Vx1,$VN1),o($Vy1,$Vs6),o($Vy1,$VN1),o($VV3,$Vs6),o($VV3,$VN1),o($VW3,$Vs6),o($VW3,$VN1),o($VX3,$Vs6),o($VX3,$VN1),o($V87,$VR8),o($V87,$VS8),o($V87,$VW7),o($V87,$VX7),{121:[1,4455],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($V87,$V71),o($V87,$V81),{20:[1,4459],22:[1,4463],23:4457,38:4456,202:4458,216:4460,217:[1,4462],218:[1,4461]},o($V87,$VT8),o($V87,$VU8),o($VV8,$VA1,{95:4464}),o($V87,$VB1,{101:4363,97:4465,103:$Vfa,104:$VR,105:$VS,106:$VT}),o($VV8,$VJ1),o($VV8,$VK1),o($VV8,$VL1),o($VV8,$VM1),{102:[1,4466]},o($VV8,$VS1),{72:[1,4467]},o($VT7,$VO2,{101:4181,97:4468,103:$V8a,104:$VR,105:$VS,106:$VT}),o($VS7,$VP2),o($V87,$VQ2,{92:4469,97:4470,93:4471,101:4472,107:4474,109:4475,103:$Vja,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V87,$VS2,{92:4469,97:4470,93:4471,101:4472,107:4474,109:4475,103:$Vja,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V87,$VT2,{92:4469,97:4470,93:4471,101:4472,107:4474,109:4475,103:$Vja,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($VY7,$VU2),{20:$V83,22:$V93,23:415,29:[1,4476],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4477,123:$VX2,150:$VY2,190:$VZ2}),o($VV7,$V42),o($VV7,$Vm),o($VV7,$Vn),o($VV7,$Vr),o($VV7,$Vs),o($VV7,$Vt),o($VV7,$Vu),o($VV7,$Vv),o($VS7,$Vs3),o($VY7,$Vt3),o($VY7,$Vu3),o($VY7,$Vv3),o($VY7,$Vw3),{113:[1,4478]},o($VY7,$VB3),o($V87,$Vh5),{20:[1,4481],22:[1,4483],89:4479,166:[1,4484],193:4480,217:[1,4482]},o($V87,$Vh5),{20:[1,4487],22:[1,4489],89:4485,166:[1,4490],193:4486,217:[1,4488]},o($VD9,$V52),o($VD9,$V62),o($VD9,$V72),o($VX8,$VV5),o($VX8,$VW5),{20:$V9a,22:$Vaa,89:4491,166:$Vba,193:4492,217:$Vca},o($V29,$Vb9),o($VH,$VI,{65:4493,75:4494,77:4495,78:4496,94:4499,96:4500,89:4502,90:4503,91:4504,80:4505,46:4506,97:4510,193:4511,93:4513,120:4514,101:4518,107:4524,109:4525,20:[1,4520],22:[1,4522],28:[1,4512],71:[1,4497],73:[1,4498],81:[1,4515],82:[1,4516],83:[1,4517],87:[1,4501],98:[1,4507],99:[1,4508],100:[1,4509],103:$Vka,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ,166:[1,4523],217:[1,4521]}),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4526,123:$VX2,150:$VY2,190:$VZ2}),o($V29,$V42),o($V29,$Vm),o($V29,$Vn),o($V29,$Vr),o($V29,$Vs),o($V29,$Vt),o($V29,$Vu),o($V29,$Vv),o($V29,$VO2,{101:4265,97:4527,103:$Vda,104:$VR,105:$VS,106:$VT}),o($VF9,$VP2),o($VF9,$Vs3),o($V29,$Vd9),o($Vg9,$Vb4),o($Vi9,$Vc4),o($Vi9,$Vd4),o($Vi9,$Ve4),{102:[1,4528]},o($Vi9,$VS1),{102:[1,4530],108:4529,110:[1,4531],111:[1,4532],112:4533,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4534]},o($Vi9,$Vy4),{123:[1,4535]},{20:[1,4538],22:[1,4540],89:4536,166:[1,4541],193:4537,217:[1,4539]},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4542,123:$VX2,150:$VY2,190:$VZ2}),o($V29,$V42),o($V29,$Vm),o($V29,$Vn),o($V29,$Vr),o($V29,$Vs),o($V29,$Vt),o($V29,$Vu),o($V29,$Vv),o($V29,$VO2,{101:4307,97:4543,103:$Vea,104:$VR,105:$VS,106:$VT}),o($VF9,$VP2),o($VF9,$Vs3),o($V29,$Vd9),o($Vg9,$Vb4),o($Vi9,$Vc4),o($Vi9,$Vd4),o($Vi9,$Ve4),{102:[1,4544]},o($Vi9,$VS1),{102:[1,4546],108:4545,110:[1,4547],111:[1,4548],112:4549,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4550]},o($Vi9,$Vy4),{123:[1,4551]},{20:[1,4554],22:[1,4556],89:4552,166:[1,4557],193:4553,217:[1,4555]},o($Vi9,$VX5),o($Vi9,$VN1),o($Vi9,$VT1),o($Vi9,$VU1),o($Vi9,$VV1),o($Vi9,$VW1),o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4558,123:$VX2,150:$VY2,190:$VZ2}),o($V87,$V42),o($V87,$Vm),o($V87,$Vn),o($V87,$Vr),o($V87,$Vs),o($V87,$Vt),o($V87,$Vu),o($V87,$Vv),o($V87,$VO2,{101:4363,97:4559,103:$Vfa,104:$VR,105:$VS,106:$VT}),o($VV8,$VP2),o($VV8,$Vs3),o($V87,$Vd9),o($VS7,$Vb4),o($VU7,$Vc4),o($VU7,$Vd4),o($VU7,$Ve4),{102:[1,4560]},o($VU7,$VS1),{102:[1,4562],108:4561,110:[1,4563],111:[1,4564],112:4565,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4566]},o($VU7,$Vy4),{123:[1,4567]},{20:[1,4570],22:[1,4572],89:4568,166:[1,4573],193:4569,217:[1,4571]},o($VU7,$VX5),o($VU7,$VN1),o($VU7,$VT1),o($VU7,$VU1),o($VU7,$VV1),o($VU7,$VW1),o($VU7,$VX5),o($VU7,$VN1),o($VU7,$VT1),o($VU7,$VU1),o($VU7,$VV1),o($VU7,$VW1),o($VX8,$Vs6),o($VX8,$VN1),o($V29,$VM7),o($V29,$VN7,{76:4574,78:4575,80:4576,46:4577,120:4578,81:[1,4579],82:[1,4580],83:[1,4581],121:$VI,127:$VI,129:$VI,190:$VI,221:$VI}),o($V29,$VO7),o($V29,$VP7,{79:4582,75:4583,94:4584,96:4585,97:4589,101:4590,98:[1,4586],99:[1,4587],100:[1,4588],103:$Vla,104:$VR,105:$VS,106:$VT}),o($Vg,$Vh,{42:199,46:201,40:4592,45:$Vt1,81:$Vi,82:$Vj,83:$Vk}),o($V29,$VR7),o($Vg9,$VA1,{95:4593}),o($Vh9,$VB1,{101:4518,97:4594,103:$Vka,104:$VR,105:$VS,106:$VT}),o($Vi9,$VD1,{88:4595}),o($Vi9,$VD1,{88:4596}),o($Vi9,$VD1,{88:4597}),o($V29,$VE1,{107:4524,109:4525,93:4598,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vj9,$VW7),o($Vj9,$VX7),o($Vg9,$VJ1),o($Vg9,$VK1),o($Vg9,$VL1),o($Vg9,$VM1),o($Vi9,$VN1),o($VO1,$VP1,{163:4599}),o($Vk9,$VR1),{121:[1,4600],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($Vj9,$V71),o($Vj9,$V81),{20:[1,4604],22:[1,4608],23:4602,38:4601,202:4603,216:4605,217:[1,4607],218:[1,4606]},{102:[1,4609]},o($Vg9,$VS1),o($Vi9,$VT1),o($Vi9,$VU1),o($Vi9,$VV1),o($Vi9,$VW1),{102:[1,4611],108:4610,110:[1,4612],111:[1,4613],112:4614,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4615]},{123:[1,4616]},o($VF9,$Vb4),o($Vi9,$Vs3),o($Vi9,$Vt3),o($Vi9,$Vu3),o($Vi9,$Vv3),o($Vi9,$Vw3),{113:[1,4617]},o($Vi9,$VB3),o($Vj9,$Vh5),o($Vk9,$VX5),o($Vk9,$VN1),o($Vk9,$VT1),o($Vk9,$VU1),o($Vk9,$VV1),o($Vk9,$VW1),{123:[1,4618]},o($VF9,$Vb4),o($Vi9,$Vs3),o($Vi9,$Vt3),o($Vi9,$Vu3),o($Vi9,$Vv3),o($Vi9,$Vw3),{113:[1,4619]},o($Vi9,$VB3),o($Vj9,$Vh5),o($Vk9,$VX5),o($Vk9,$VN1),o($Vk9,$VT1),o($Vk9,$VU1),o($Vk9,$VV1),o($Vk9,$VW1),{123:[1,4620]},o($VV8,$Vb4),o($VU7,$Vs3),o($VU7,$Vt3),o($VU7,$Vu3),o($VU7,$Vv3),o($VU7,$Vw3),{113:[1,4621]},o($VU7,$VB3),o($VV7,$Vh5),o($VY7,$VX5),o($VY7,$VN1),o($VY7,$VT1),o($VY7,$VU1),o($VY7,$VV1),o($VY7,$VW1),o($V29,$VR8),o($V29,$VS8),o($V29,$VW7),o($V29,$VX7),{121:[1,4622],124:212,125:213,126:214,127:$VF1,129:$VG1,190:$VH1,219:216,221:$VI1},o($V29,$V71),o($V29,$V81),{20:[1,4626],22:[1,4630],23:4624,38:4623,202:4625,216:4627,217:[1,4629],218:[1,4628]},o($V29,$VT8),o($V29,$VU8),o($VF9,$VA1,{95:4631}),o($V29,$VB1,{101:4590,97:4632,103:$Vla,104:$VR,105:$VS,106:$VT}),o($VF9,$VJ1),o($VF9,$VK1),o($VF9,$VL1),o($VF9,$VM1),{102:[1,4633]},o($VF9,$VS1),{72:[1,4634]},o($Vh9,$VO2,{101:4518,97:4635,103:$Vka,104:$VR,105:$VS,106:$VT}),o($Vg9,$VP2),o($V29,$VQ2,{92:4636,97:4637,93:4638,101:4639,107:4641,109:4642,103:$Vma,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V29,$VS2,{92:4636,97:4637,93:4638,101:4639,107:4641,109:4642,103:$Vma,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($V29,$VT2,{92:4636,97:4637,93:4638,101:4639,107:4641,109:4642,103:$Vma,104:$VR,105:$VS,106:$VT,114:$VU,115:$VV,116:$VW,117:$VX,118:$VY,119:$VZ}),o($Vk9,$VU2),{20:$V83,22:$V93,23:415,29:[1,4643],73:$Va3,83:$Vb3,102:$Vc3,110:$Vd3,111:$Ve3,112:427,164:409,165:410,166:$Vf3,167:412,168:413,182:416,186:$Vg3,198:421,199:422,200:423,203:426,206:$Vh3,207:$Vi3,208:$Vj3,209:$Vk3,210:$Vl3,211:$Vm3,212:$Vn3,213:$Vo3,214:$Vp3,215:$Vq3,216:420,217:$Vr3},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4644,123:$VX2,150:$VY2,190:$VZ2}),o($Vj9,$V42),o($Vj9,$Vm),o($Vj9,$Vn),o($Vj9,$Vr),o($Vj9,$Vs),o($Vj9,$Vt),o($Vj9,$Vu),o($Vj9,$Vv),o($Vg9,$Vs3),o($Vk9,$Vt3),o($Vk9,$Vu3),o($Vk9,$Vv3),o($Vk9,$Vw3),{113:[1,4645]},o($Vk9,$VB3),o($V29,$Vh5),{20:[1,4648],22:[1,4650],89:4646,166:[1,4651],193:4647,217:[1,4649]},o($V29,$Vh5),{20:[1,4654],22:[1,4656],89:4652,166:[1,4657],193:4653,217:[1,4655]},o($V87,$Vh5),{20:[1,4660],22:[1,4662],89:4658,166:[1,4663],193:4659,217:[1,4661]},o($VV2,$VW2,{128:379,132:380,133:381,134:382,138:383,139:384,140:385,146:386,148:387,149:388,122:4664,123:$VX2,150:$VY2,190:$VZ2}),o($V29,$V42),o($V29,$Vm),o($V29,$Vn),o($V29,$Vr),o($V29,$Vs),o($V29,$Vt),o($V29,$Vu),o($V29,$Vv),o($V29,$VO2,{101:4590,97:4665,103:$Vla,104:$VR,105:$VS,106:$VT}),o($VF9,$VP2),o($VF9,$Vs3),o($V29,$Vd9),o($Vg9,$Vb4),o($Vi9,$Vc4),o($Vi9,$Vd4),o($Vi9,$Ve4),{102:[1,4666]},o($Vi9,$VS1),{102:[1,4668],108:4667,110:[1,4669],111:[1,4670],112:4671,208:$VX1,209:$VY1,210:$VZ1,211:$V_1},{102:[1,4672]},o($Vi9,$Vy4),{123:[1,4673]},{20:[1,4676],22:[1,4678],89:4674,166:[1,4679],193:4675,217:[1,4677]},o($Vi9,$VX5),o($Vi9,$VN1),o($Vi9,$VT1),o($Vi9,$VU1),o($Vi9,$VV1),o($Vi9,$VW1),o($Vi9,$VX5),o($Vi9,$VN1),o($Vi9,$VT1),o($Vi9,$VU1),o($Vi9,$VV1),o($Vi9,$VW1),o($VU7,$VX5),o($VU7,$VN1),o($VU7,$VT1),o($VU7,$VU1),o($VU7,$VV1),o($VU7,$VW1),{123:[1,4680]},o($VF9,$Vb4),o($Vi9,$Vs3),o($Vi9,$Vt3),o($Vi9,$Vu3),o($Vi9,$Vv3),o($Vi9,$Vw3),{113:[1,4681]},o($Vi9,$VB3),o($Vj9,$Vh5),o($Vk9,$VX5),o($Vk9,$VN1),o($Vk9,$VT1),o($Vk9,$VU1),o($Vk9,$VV1),o($Vk9,$VW1),o($V29,$Vh5),{20:[1,4684],22:[1,4686],89:4682,166:[1,4687],193:4683,217:[1,4685]},o($Vi9,$VX5),o($Vi9,$VN1),o($Vi9,$VT1),o($Vi9,$VU1),o($Vi9,$VV1),o($Vi9,$VW1)],
defaultActions: {6:[2,11],32:[2,1],112:[2,121],113:[2,122],114:[2,123],119:[2,134],120:[2,135],227:[2,255],228:[2,256],229:[2,257],230:[2,258],351:[2,37],379:[2,144],380:[2,148],382:[2,150],589:[2,35],590:[2,39],627:[2,36],1137:[2,148],1139:[2,150]},
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

  var UNBOUNDED = -1;

  var ShExUtil = __webpack_require__(11).Util;

  // Common namespaces and entities
  var RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
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

  var numericDatatypes = [
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

  var absoluteIRI = /^[a-z][a-z0-9+.-]*:/i,
    schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

  var numericFacets = ["mininclusive", "minexclusive",
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
    for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (var name in arg)
        base[name] = arg[name];
    return base;
  }

  // Creates an array that contains all items of the given arrays
  function unionAll() {
    var union = [];
    for (var i = 0, l = arguments.length; i < l; i++)
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
    var result = '', length = iri.length, i = -1, pathStart = -1, segmentStart = 0, next = '/';

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

  Parser._setTermResolver = function (res) {
    Parser._termResolver = res;
  }

  // Creates an expression with the given type and attributes
  function expression(expr, attr) {
    var expression = { expression: expr };
    if (attr)
      for (var a in attr)
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
  var blankId = 0;
  Parser._resetBlanks = function () { blankId = 0; }
  Parser.reset = function () {
    Parser._prefixes = Parser._imports = Parser._sourceMap = Parser._termResolver = Parser.shapes = Parser.productions = Parser.start = Parser.startActs = null; // Reset state.
    Parser._base = Parser._baseIRI = Parser._baseIRIPath = Parser._baseIRIRoot = null;
  }
  var _fileName; // for debugging
  Parser._setFileName = function (fn) { _fileName = fn; }

  // Regular expression and replacement strings to escape strings
  var stringEscapeReplacements = { '\\': '\\', "'": "'", '"': '"',
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
    var at = string.lastIndexOf("@");
    var lang = string.substr(at);
    string = string.substr(0, at);
    var u = unescapeString(string, trimLength);
    return extend(u, { language: lowercase(lang.substr(1)) });
  }

  // Translates regular expression escape codes in the string into their textual equivalent
  function unescapeRegexp (regexp) {
    var end = regexp.lastIndexOf("/");
    var s = regexp.substr(1, end-1);
    var regexpEscapeReplacements = {
      '.': "\\.", '\\': "\\\\", '?': "\\?", '*': "\\*", '+': "\\+",
      '{': "\\{", '}': "\\}", '(': "\\(", ')': "\\)", '|': "\\|",
      '^': "\\^", '$': "\\$", '[': "\\[", ']': "\\]", '/': "\\/",
      't': '\\t', 'n': '\\n', 'r': '\\r', '-': "\\-", '/': '/'
    };
    s = ShExUtil.unescapeText(s, regexpEscapeReplacements)
    var ret = {
      pattern: s
    };
    if (regexp.length > end+1)
      ret.flags = regexp.substr(end+1);
    return ret;
  }

  // Convenience function to return object with p1 key, value p2
  function keyValObject(key, val) {
    var ret = {};
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

  var EmptyObject = {  };
  var EmptyShape = { type: "Shape" };
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
case 0:
  var iBacktick = yy_.yytext.indexOf('`');
  var prefix = null;
  if (iBacktick > 0) {
    prefix = yy_.yytext.substr(0, iBacktick-1);
    yy_.yytext = yy_.yytext.substr(iBacktick);
  }
  yy_.yytext = { prefix: prefix, label: unescapeString(yy_.yytext, 1) };
  return 166;

break;
case 1:/**/
break;
case 2:return 81;
break;
case 3:return 82;
break;
case 4: yy_.yytext = yy_.yytext.substr(1); return 186; 
break;
case 5:return 83;
break;
case 6:return 217;
break;
case 7:return 161;
break;
case 8:return 111;
break;
case 9:return 110;
break;
case 10:return 102;
break;
case 11:return 'ANON';
break;
case 12:return 20;
break;
case 13:return 22;
break;
case 14:return 201;
break;
case 15:return 103;
break;
case 16:return 218;
break;
case 17:return 197;
break;
case 18:return 213;
break;
case 19:return 215;
break;
case 20:return 212;
break;
case 21:return 214;
break;
case 22:return 209;
break;
case 23:return 211;
break;
case 24:return 208;
break;
case 25:return 210;
break;
case 26:return 19;
break;
case 27:return 21;
break;
case 28:return 24;
break;
case 29:return 25;
break;
case 30:return 32;
break;
case 31:return 41;
break;
case 32:return 'IT_VIRTUAL';
break;
case 33:return 127;
break;
case 34:return 129;
break;
case 35:return 87;
break;
case 36:return 99;
break;
case 37:return 98;
break;
case 38:return 100;
break;
case 39:return 55;
break;
case 40:return 53;
break;
case 41:return 45;
break;
case 42:return 114;
break;
case 43:return 115;
break;
case 44:return 116;
break;
case 45:return 117;
break;
case 46:return 104;
break;
case 47:return 105;
break;
case 48:return 106;
break;
case 49:return 118;
break;
case 50:return 119;
break;
case 51:return 33;
break;
case 52:return 191;
break;
case 53:return 121;
break;
case 54:return 123;
break;
case 55:return 190;
break;
case 56:return '||';
break;
case 57:return 137;
break;
case 58:return 142;
break;
case 59:return 71;
break;
case 60:return 72;
break;
case 61:return 28;
break;
case 62:return 29;
break;
case 63:return 150;
break;
case 64:return '!';
break;
case 65:return 113;
break;
case 66:return 162;
break;
case 67:return 73;
break;
case 68:return 179;
break;
case 69:return 143;
break;
case 70:return 158;
break;
case 71:return 159;
break;
case 72:return 160;
break;
case 73:return 180;
break;
case 74:return 195;
break;
case 75:return 206;
break;
case 76:return 207;
break;
case 77:return 7;
break;
case 78:return 'unexpected word "'+yy_.yytext+'"';
break;
case 79:return 'invalid character '+yy_.yytext;
break;
}
},
rules: [/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)?`([^\u0060\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*`))/,/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([Ll][Aa][Bb][Ee][Ll]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Vv][Ii][Rr][Tt][Uu][Aa][Ll]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79],"inclusive":true}}
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
    var source = __webpack_require__(3).readFileSync(__webpack_require__(2).normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if ( true && __webpack_require__.c[__webpack_require__.s] === module) {
  exports.main(process.argv.slice(1));
}
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1), __webpack_require__(19)(module)))

/***/ }),
/* 57 */
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

var pathModule = __webpack_require__(2);
var isWindows = process.platform === 'win32';
var fs = __webpack_require__(3);

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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var concatMap = __webpack_require__(59);
var balanced = __webpack_require__(60);

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
/* 59 */
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
/* 60 */
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
/* 61 */
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
/* 62 */
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
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {module.exports = globSync
globSync.GlobSync = GlobSync

var fs = __webpack_require__(3)
var rp = __webpack_require__(28)
var minimatch = __webpack_require__(14)
var Minimatch = minimatch.Minimatch
var Glob = __webpack_require__(27).Glob
var util = __webpack_require__(12)
var path = __webpack_require__(2)
var assert = __webpack_require__(29)
var isAbsolute = __webpack_require__(16)
var common = __webpack_require__(30)
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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var wrappy = __webpack_require__(31)
var reqs = Object.create(null)
var once = __webpack_require__(32)

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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 65 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 65;

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),
/* 67 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 68 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 69 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = __webpack_require__(9),
    Buffer = _require.Buffer;

var _require2 = __webpack_require__(71),
    inspect = _require2.inspect;

var custom = inspect && inspect.custom || 'inspect';

function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}

module.exports =
/*#__PURE__*/
function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;

      while (p = p.next) {
        ret += s + p.data;
      }

      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;

      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }

      return ret;
    } // Consumes a specified amount of bytes or characters from the buffered data.

  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;

      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }

      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    } // Consumes a specified amount of characters from the buffered data.

  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;

      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;

        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Consumes a specified amount of bytes from the buffered data.

  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;

      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;

        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Make sure the linked list only shows the minimal necessary information.

  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread({}, options, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);

  return BufferList;
}();

/***/ }),
/* 71 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(8)))

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(9)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var _Object$setPrototypeO;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var finished = __webpack_require__(17);

var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');

function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}

function readAndResolve(iter) {
  var resolve = iter[kLastResolve];

  if (resolve !== null) {
    var data = iter[kStream].read(); // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'

    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}

function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}

function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }

      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}

var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },

  next: function next() {
    var _this = this;

    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];

    if (error !== null) {
      return Promise.reject(error);
    }

    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }

    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    } // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time


    var lastPromise = this[kLastPromise];
    var promise;

    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();

      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }

      promise = new Promise(this[kHandlePromise]);
    }

    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;

  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);

var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;

  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();

      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject]; // reject if we are waiting for data in the Promise
      // returned by next() and store the error

      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }

      iterator[kError] = err;
      return;
    }

    var resolve = iterator[kLastResolve];

    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }

    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};

module.exports = createReadableStreamAsyncIterator;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 75 */
/***/ (function(module, exports) {

module.exports = function () {
  throw new Error('Readable.from is not available in the browser')
};


/***/ }),
/* 76 */
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
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.


module.exports = PassThrough;

var Transform = __webpack_require__(39);

__webpack_require__(10)(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).


var eos;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}

var _require$codes = __webpack_require__(4).codes,
    ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;

function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = __webpack_require__(17);
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true; // request.destroy just do .end - .abort is what we want

    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}

function call(fn) {
  fn();
}

function pipe(from, to) {
  return from.pipe(to);
}

function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}

function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];

  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}

module.exports = pipeline;

/***/ }),
/* 78 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "Lexer", function() { return /* reexport */ N3Lexer["a" /* default */]; });
__webpack_require__.d(__webpack_exports__, "Parser", function() { return /* reexport */ N3Parser_N3Parser; });
__webpack_require__.d(__webpack_exports__, "Writer", function() { return /* reexport */ N3Writer_N3Writer; });
__webpack_require__.d(__webpack_exports__, "Store", function() { return /* reexport */ N3Store_N3Store; });
__webpack_require__.d(__webpack_exports__, "StreamParser", function() { return /* reexport */ N3StreamParser_N3StreamParser; });
__webpack_require__.d(__webpack_exports__, "StreamWriter", function() { return /* reexport */ N3StreamWriter_N3StreamWriter; });
__webpack_require__.d(__webpack_exports__, "Util", function() { return /* reexport */ N3Util_namespaceObject; });
__webpack_require__.d(__webpack_exports__, "DataFactory", function() { return /* reexport */ N3DataFactory; });
__webpack_require__.d(__webpack_exports__, "Term", function() { return /* reexport */ Term; });
__webpack_require__.d(__webpack_exports__, "NamedNode", function() { return /* reexport */ NamedNode; });
__webpack_require__.d(__webpack_exports__, "Literal", function() { return /* reexport */ Literal; });
__webpack_require__.d(__webpack_exports__, "BlankNode", function() { return /* reexport */ BlankNode; });
__webpack_require__.d(__webpack_exports__, "Variable", function() { return /* reexport */ Variable; });
__webpack_require__.d(__webpack_exports__, "DefaultGraph", function() { return /* reexport */ DefaultGraph; });
__webpack_require__.d(__webpack_exports__, "Quad", function() { return /* reexport */ Quad; });
__webpack_require__.d(__webpack_exports__, "Triple", function() { return /* reexport */ Quad; });
__webpack_require__.d(__webpack_exports__, "termFromId", function() { return /* reexport */ termFromId; });
__webpack_require__.d(__webpack_exports__, "termToId", function() { return /* reexport */ termToId; });

// NAMESPACE OBJECT: ./node_modules/n3/src/N3Util.js
var N3Util_namespaceObject = {};
__webpack_require__.r(N3Util_namespaceObject);
__webpack_require__.d(N3Util_namespaceObject, "isNamedNode", function() { return isNamedNode; });
__webpack_require__.d(N3Util_namespaceObject, "isBlankNode", function() { return isBlankNode; });
__webpack_require__.d(N3Util_namespaceObject, "isLiteral", function() { return isLiteral; });
__webpack_require__.d(N3Util_namespaceObject, "isVariable", function() { return isVariable; });
__webpack_require__.d(N3Util_namespaceObject, "isDefaultGraph", function() { return isDefaultGraph; });
__webpack_require__.d(N3Util_namespaceObject, "inDefaultGraph", function() { return inDefaultGraph; });
__webpack_require__.d(N3Util_namespaceObject, "prefix", function() { return N3Util_prefix; });
__webpack_require__.d(N3Util_namespaceObject, "prefixes", function() { return N3Util_prefixes; });

// EXTERNAL MODULE: ./node_modules/n3/src/N3Lexer.js
var N3Lexer = __webpack_require__(13);

// EXTERNAL MODULE: ./node_modules/n3/src/IRIs.js
var IRIs = __webpack_require__(0);

// CONCATENATED MODULE: ./node_modules/n3/src/N3Util.js
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

// Tests whether the given term represents the default graph
function isDefaultGraph(term) {
  return !!term && term.termType === 'DefaultGraph';
}

// Tests whether the given quad is in the default graph
function inDefaultGraph(quad) {
  return isDefaultGraph(quad.graph);
}

// Creates a function that prepends the given IRI to a local name
function N3Util_prefix(iri, factory) {
  return N3Util_prefixes({ '': iri }, factory)('');
}

// Creates a function that allows registering and expanding prefixes
function N3Util_prefixes(defaultPrefixes, factory) {
  // Add all of the default prefixes
  var prefixes = Object.create(null);
  for (var prefix in defaultPrefixes)
    processPrefix(prefix, defaultPrefixes[prefix]);
  // Set the default factory if none was specified
  factory = factory || N3DataFactory;

  // Registers a new prefix (if an IRI was specified)
  // or retrieves a function that expands an existing prefix (if no IRI was specified)
  function processPrefix(prefix, iri) {
    // Create a new prefix if an IRI is specified or the prefix doesn't exist
    if (typeof iri === 'string') {
      // Create a function that expands the prefix
      var cache = Object.create(null);
      prefixes[prefix] = function (local) {
        return cache[local] || (cache[local] = factory.namedNode(iri + local));
      };
    }
    else if (!(prefix in prefixes)) {
      throw new Error('Unknown prefix: ' + prefix);
    }
    return prefixes[prefix];
  }
  return processPrefix;
}

// CONCATENATED MODULE: ./node_modules/n3/src/N3DataFactory.js
// N3.js implementations of the RDF/JS core data types
// See https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md



const { rdf, xsd } = IRIs["a" /* default */];

let DEFAULTGRAPH;
let _blankNodeCounter = 0;

const escapedLiteral = /^"(.*".*)(?="[^"]*$)/;
const quadId = /^<<("(?:""|[^"])*"[^ ]*|[^ ]+) ("(?:""|[^"])*"[^ ]*|[^ ]+) ("(?:""|[^"])*"[^ ]*|[^ ]+) ?("(?:""|[^"])*"[^ ]*|[^ ]+)?>>$/;

// ## DataFactory singleton
const DataFactory = {
  namedNode: N3DataFactory_namedNode,
  blankNode,
  variable,
  literal,
  defaultGraph,
  quad: N3DataFactory_quad,
  triple: N3DataFactory_quad,
};
/* harmony default export */ var N3DataFactory = (DataFactory);

// ## Term constructor
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
    if (other instanceof Term)
      return this.id === other.id;
    // Otherwise, compare term type and value
    return !!other && this.termType === other.termType &&
                      this.value    === other.value;
  }

  // ### Returns a plain object representation of this term
  toJSON() {
    return {
      termType: this.termType,
      value:    this.value,
    };
  }
}


// ## NamedNode constructor
class NamedNode extends Term {
  // ### The term type of this term
  get termType() {
    return 'NamedNode';
  }
}

// ## Literal constructor
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
    var id = this.id, atPos = id.lastIndexOf('"') + 1;
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
    var id = this.id, dtPos = id.lastIndexOf('"') + 1, ch;
    // If "^" it follows, return the remaining substring
    return dtPos < id.length && (ch = id[dtPos]) === '^' ? id.substr(dtPos + 2) :
           // If "@" follows, return rdf:langString; xsd:string otherwise
           (ch !== '@' ? xsd.string : rdf.langString);
  }

  // ### Returns whether this object represents the same term as the other
  equals(other) {
    // If both literals were created by this library,
    // equality can be computed through ids
    if (other instanceof Literal)
      return this.id === other.id;
    // Otherwise, compare term type, value, language, and datatype
    return !!other && !!other.datatype &&
                      this.termType === other.termType &&
                      this.value    === other.value    &&
                      this.language === other.language &&
                      this.datatype.value === other.datatype.value;
  }

  toJSON() {
    return {
      termType: this.termType,
      value:    this.value,
      language: this.language,
      datatype: { termType: 'NamedNode', value: this.datatypeString },
    };
  }
}

// ## BlankNode constructor
class BlankNode extends Term {
  constructor(name) {
    super('_:' + name);
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

class Variable extends Term {
  constructor(name) {
    super('?' + name);
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
    return (this === other) || (!!other && (this.termType === other.termType));
  }
}

// ## DefaultGraph singleton
DEFAULTGRAPH = new DefaultGraph();


// ### Constructs a term from the given internal string ID
function termFromId(id, factory) {
  factory = factory || DataFactory;

  // Falsy value or empty string indicate the default graph
  if (!id)
    return factory.defaultGraph();

  // Identify the term type based on the first character
  switch (id[0]) {
  case '?':
    return factory.variable(id.substr(1));
  case '_':
    return factory.blankNode(id.substr(2));
  case '"':
    // Shortcut for internal literals
    if (factory === DataFactory)
      return new Literal(id);
    // Literal without datatype or language
    if (id[id.length - 1] === '"')
      return factory.literal(id.substr(1, id.length - 2));
    // Literal with datatype or language
    var endPos = id.lastIndexOf('"', id.length - 1);
    return factory.literal(id.substr(1, endPos - 1),
            id[endPos + 1] === '@' ? id.substr(endPos + 2)
                                   : factory.namedNode(id.substr(endPos + 3)));
  case '<':
    const components = quadId.exec(id);
    return factory.quad(
      termFromId(unescapeQuotes(components[1]), factory),
      termFromId(unescapeQuotes(components[2]), factory),
      termFromId(unescapeQuotes(components[3]), factory),
      components[4] && termFromId(unescapeQuotes(components[4]), factory)
    );
  default:
    return factory.namedNode(id);
  }
}

// ### Constructs an internal string ID from the given term or ID string
function termToId(term) {
  if (typeof term === 'string')
    return term;
  if (term instanceof Term && term.termType !== 'Quad')
    return term.id;
  if (!term)
    return DEFAULTGRAPH.id;

  // Term instantiated with another library
  switch (term.termType) {
  case 'NamedNode':    return term.value;
  case 'BlankNode':    return '_:' + term.value;
  case 'Variable':     return '?' + term.value;
  case 'DefaultGraph': return '';
  case 'Literal':      return '"' + term.value + '"' +
    (term.language ? '@' + term.language :
      (term.datatype && term.datatype.value !== xsd.string ? '^^' + term.datatype.value : ''));
  case 'Quad':
    // To identify RDF* quad components, we escape quotes by doubling them.
    // This avoids the overhead of backslash parsing of Turtle-like syntaxes.
    return `<<${
        escapeQuotes(termToId(term.subject))
      } ${
        escapeQuotes(termToId(term.predicate))
      } ${
        escapeQuotes(termToId(term.object))
      }${
        (isDefaultGraph(term.graph)) ? '' : ` ${termToId(term.graph)}`
      }>>`;
  default: throw new Error('Unexpected termType: ' + term.termType);
  }
}


// ## Quad constructor
class Quad extends Term {
  constructor(subject, predicate, object, graph) {
    super('');
    this.subject   = subject;
    this.predicate = predicate;
    this.object    = object;
    this.graph     = graph || DEFAULTGRAPH;
  }

  // ### The term type of this term
  get termType() {
    return 'Quad';
  }

  // ### Returns a plain object representation of this quad
  toJSON() {
    return {
      termType:  this.termType,
      subject:   this.subject.toJSON(),
      predicate: this.predicate.toJSON(),
      object:    this.object.toJSON(),
      graph:     this.graph.toJSON(),
    };
  }

  // ### Returns whether this object represents the same quad as the other
  equals(other) {
    return !!other && this.subject.equals(other.subject)     &&
                      this.predicate.equals(other.predicate) &&
                      this.object.equals(other.object)       &&
                      this.graph.equals(other.graph);
  }
}


// ### Escapes the quotes within the given literal
function escapeQuotes(id) {
  return id.replace(escapedLiteral, (_, quoted) => `"${quoted.replace(/"/g, '""')}`);
}

// ### Unescapes the quotes within the given literal
function unescapeQuotes(id) {
  return id.replace(escapedLiteral, (_, quoted) => `"${quoted.replace(/""/g, '"')}`);
}

// ### Creates an IRI
function N3DataFactory_namedNode(iri) {
  return new NamedNode(iri);
}

// ### Creates a blank node
function blankNode(name) {
  return new BlankNode(name || `n3-${_blankNodeCounter++}`);
}

// ### Creates a literal
function literal(value, languageOrDataType) {
  // Create a language-tagged string
  if (typeof languageOrDataType === 'string')
    return new Literal('"' + value + '"@' + languageOrDataType.toLowerCase());

  // Automatically determine datatype for booleans and numbers
  let datatype = languageOrDataType ? languageOrDataType.value : '';
  if (datatype === '') {
    // Convert a boolean
    if (typeof value === 'boolean')
      datatype = xsd.boolean;
    // Convert an integer or double
    else if (typeof value === 'number') {
      if (Number.isFinite(value))
        datatype = Number.isInteger(value) ? xsd.integer : xsd.double;
      else {
        datatype = xsd.double;
        if (!Number.isNaN(value))
          value = value > 0 ? 'INF' : '-INF';
      }
    }
  }

  // Create a datatyped literal
  return (datatype === '' || datatype === xsd.string) ?
    new Literal('"' + value + '"') :
    new Literal('"' + value + '"^^' + datatype);
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
function N3DataFactory_quad(subject, predicate, object, graph) {
  return new Quad(subject, predicate, object, graph);
}

// CONCATENATED MODULE: ./node_modules/n3/src/N3Parser.js
// **N3Parser** parses N3 documents.




let blankNodePrefix = 0;

// ## Constructor
class N3Parser_N3Parser {
  constructor(options) {
    this._contextStack = [];
    this._graph = null;

    // Set the document IRI
    options = options || {};
    this._setBase(options.baseIRI);
    options.factory && initDataFactory(this, options.factory);

    // Set supported features depending on the format
    var format = (typeof options.format === 'string') ?
                 options.format.match(/\w*$/)[0].toLowerCase() : '',
        isTurtle = /turtle/.test(format), isTriG = /trig/.test(format),
        isNTriples = /triple/.test(format), isNQuads = /quad/.test(format),
        isN3 = this._n3Mode = /n3/.test(format),
        isLineMode = isNTriples || isNQuads;
    if (!(this._supportsNamedGraphs = !(isTurtle || isN3)))
      this._readPredicateOrNamedGraph = this._readPredicate;
    // Support triples in other graphs
    this._supportsQuads = !(isTurtle || isTriG || isNTriples || isN3);
    // Support nesting of triples
    this._supportsRDFStar = format === '' || /star|\*$/.test(format);
    // Disable relative IRIs in N-Triples or N-Quads mode
    if (isLineMode)
      this._resolveRelativeIRI = function (iri) { return null; };
    this._blankNodePrefix = typeof options.blankNodePrefix !== 'string' ? '' :
                              options.blankNodePrefix.replace(/^(?!_:)/, '_:');
    this._lexer = options.lexer || new N3Lexer["a" /* default */]({ lineMode: isLineMode, n3: isN3 });
    // Disable explicit quantifiers by default
    this._explicitQuantifiers = !!options.explicitQuantifiers;
  }

  // ## Static class methods

  // ### `_resetBlankNodePrefix` restarts blank node prefix identification
  static _resetBlankNodePrefix() {
    blankNodePrefix = 0;
  }

  // ## Private methods

  // ### `_setBase` sets the base IRI to resolve relative IRIs
  _setBase(baseIRI) {
    if (!baseIRI) {
      this._base = '';
      this._basePath = '';
    }
    else {
      // Remove fragment if present
      var fragmentPos = baseIRI.indexOf('#');
      if (fragmentPos >= 0)
        baseIRI = baseIRI.substr(0, fragmentPos);
      // Set base IRI and its components
      this._base = baseIRI;
      this._basePath   = baseIRI.indexOf('/') < 0 ? baseIRI :
                         baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(/^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i);
      this._baseRoot   = baseIRI[0];
      this._baseScheme = baseIRI[1];
    }
  }

  // ### `_saveContext` stores the current parsing context
  // when entering a new scope (list, blank node, formula)
  _saveContext(type, graph, subject, predicate, object) {
    var n3Mode = this._n3Mode;
    this._contextStack.push({
      subject: subject, predicate: predicate, object: object,
      graph: graph, type: type,
      inverse: n3Mode ? this._inversePredicate : false,
      blankPrefix: n3Mode ? this._prefixes._ : '',
      quantified: n3Mode ? this._quantified : null,
    });
    // The settings below only apply to N3 streams
    if (n3Mode) {
      // Every new scope resets the predicate direction
      this._inversePredicate = false;
      // In N3, blank nodes are scoped to a formula
      // (using a dot as separator, as a blank node label cannot start with it)
      this._prefixes._ = (this._graph ? this._graph.id.substr(2) + '.' : '.');
      // Quantifiers are scoped to a formula
      this._quantified = Object.create(this._quantified);
    }
  }

  // ### `_restoreContext` restores the parent context
  // when leaving a scope (list, blank node, formula)
  _restoreContext() {
    var context = this._contextStack.pop(), n3Mode = this._n3Mode;
    this._subject   = context.subject;
    this._predicate = context.predicate;
    this._object    = context.object;
    this._graph     = context.graph;
    // The settings below only apply to N3 streams
    if (n3Mode) {
      this._inversePredicate = context.inverse;
      this._prefixes._ = context.blankPrefix;
      this._quantified = context.quantified;
    }
  }

  // ### `_readInTopContext` reads a token when in the top context
  _readInTopContext(token) {
    switch (token.type) {
    // If an EOF token arrives in the top context, signal that we're done
    case 'eof':
      if (this._graph !== null)
        return this._error('Unclosed graph', token);
      delete this._prefixes._;
      return this._callback(null, null, this._prefixes);
    // It could be a prefix declaration
    case 'PREFIX':
      this._sparqlStyle = true;
    case '@prefix':
      return this._readPrefix;
    // It could be a base declaration
    case 'BASE':
      this._sparqlStyle = true;
    case '@base':
      return this._readBaseIRI;
    // It could be a graph
    case '{':
      if (this._supportsNamedGraphs) {
        this._graph = '';
        this._subject = null;
        return this._readSubject;
      }
    case 'GRAPH':
      if (this._supportsNamedGraphs)
        return this._readNamedGraphLabel;
    // Otherwise, the next token must be a subject
    default:
      return this._readSubject(token);
    }
  }

  // ### `_readEntity` reads an IRI, prefixed name, blank node, or variable
  _readEntity(token, quantifier) {
    var value;
    switch (token.type) {
    // Read a relative or absolute IRI
    case 'IRI':
    case 'typeIRI':
      var iri = this._resolveIRI(token.value);
      if (iri === null)
        return this._error('Invalid IRI', token);
      value = this._namedNode(iri);
      break;
    // Read a prefixed name
    case 'type':
    case 'prefixed':
      var prefix = this._prefixes[token.prefix];
      if (prefix === undefined)
        return this._error('Undefined prefix "' + token.prefix + ':"', token);
      value = this._namedNode(prefix + token.value);
      break;
    // Read a blank node
    case 'blank':
      value = this._blankNode(this._prefixes[token.prefix] + token.value);
      break;
    // Read a variable
    case 'var':
      value = this._variable(token.value.substr(1));
      break;
    // Everything else is not an entity
    default:
      return this._error('Expected entity but got ' + token.type, token);
    }
    // In N3 mode, replace the entity if it is quantified
    if (!quantifier && this._n3Mode && (value.id in this._quantified))
      value = this._quantified[value.id];
    return value;
  }

  // ### `_readSubject` reads a quad's subject
  _readSubject(token) {
    this._predicate = null;
    switch (token.type) {
    case '[':
      // Start a new quad with a new blank node as subject
      this._saveContext('blank', this._graph,
                        this._subject = this._blankNode(), null, null);
      return this._readBlankNodeHead;
    case '(':
      // Start a new list
      this._saveContext('list', this._graph, this.RDF_NIL, null, null);
      this._subject = null;
      return this._readListItem;
    case '{':
      // Start a new formula
      if (!this._n3Mode)
        return this._error('Unexpected graph', token);
      this._saveContext('formula', this._graph,
                        this._graph = this._blankNode(), null, null);
      return this._readSubject;
    case '}':
       // No subject; the graph in which we are reading is closed instead
      return this._readPunctuation(token);
    case '@forSome':
      if (!this._n3Mode)
        return this._error('Unexpected "@forSome"', token);
      this._subject = null;
      this._predicate = this.N3_FORSOME;
      this._quantifier = this._blankNode;
      return this._readQuantifierList;
    case '@forAll':
      if (!this._n3Mode)
        return this._error('Unexpected "@forAll"', token);
      this._subject = null;
      this._predicate = this.N3_FORALL;
      this._quantifier = this._variable;
      return this._readQuantifierList;
    case 'literal':
      if (!this._n3Mode)
        return this._error('Unexpected literal', token);

      if (token.prefix.length === 0) {
        this._literalValue = token.value;
        return this._completeSubjectLiteral;
      }
      else
        this._subject = this._literal(token.value, this._namedNode(token.prefix));

      break;
    case '<<':
      if (!this._supportsRDFStar)
        return this._error('Unexpected RDF* syntax', token);
      this._saveContext('<<', this._graph, null, null, null);
      this._graph = null;
      return this._readSubject;
    default:
      // Read the subject entity
      if ((this._subject = this._readEntity(token)) === undefined)
        return;
      // In N3 mode, the subject might be a path
      if (this._n3Mode)
        return this._getPathReader(this._readPredicateOrNamedGraph);
    }

    // The next token must be a predicate,
    // or, if the subject was actually a graph IRI, a named graph
    return this._readPredicateOrNamedGraph;
  }

  // ### `_readPredicate` reads a quad's predicate
  _readPredicate(token) {
    var type = token.type;
    switch (type) {
    case 'inverse':
      this._inversePredicate = true;
    case 'abbreviation':
      this._predicate = this.ABBREVIATIONS[token.value];
      break;
    case '.':
    case ']':
    case '}':
      // Expected predicate didn't come, must have been trailing semicolon
      if (this._predicate === null)
        return this._error('Unexpected ' + type, token);
      this._subject = null;
      return type === ']' ? this._readBlankNodeTail(token) : this._readPunctuation(token);
    case ';':
      // Additional semicolons can be safely ignored
      return this._predicate !== null ? this._readPredicate :
             this._error('Expected predicate but got ;', token);
    case 'blank':
      if (!this._n3Mode)
        return this._error('Disallowed blank node as predicate', token);
    default:
      if ((this._predicate = this._readEntity(token)) === undefined)
        return;
    }
    // The next token must be an object
    return this._readObject;
  }

  // ### `_readObject` reads a quad's object
  _readObject(token) {
    switch (token.type) {
    case 'literal':
      // Regular literal, can still get a datatype or language
      if (token.prefix.length === 0) {
        this._literalValue = token.value;
        return this._readDataTypeOrLang;
      }
      // Pre-datatyped string literal (prefix stores the datatype)
      else
        this._object = this._literal(token.value, this._namedNode(token.prefix));
      break;
    case '[':
      // Start a new quad with a new blank node as subject
      this._saveContext('blank', this._graph, this._subject, this._predicate,
                        this._subject = this._blankNode());
      return this._readBlankNodeHead;
    case '(':
      // Start a new list
      this._saveContext('list', this._graph, this._subject, this._predicate, this.RDF_NIL);
      this._subject = null;
      return this._readListItem;
    case '{':
      // Start a new formula
      if (!this._n3Mode)
        return this._error('Unexpected graph', token);
      this._saveContext('formula', this._graph, this._subject, this._predicate,
                        this._graph = this._blankNode());
      return this._readSubject;
    case '<<':
      if (!this._supportsRDFStar)
        return this._error('Unexpected RDF* syntax', token);
      this._saveContext('<<', this._graph, this._subject, this._predicate, null);
      this._graph = null;
      return this._readSubject;
    default:
      // Read the object entity
      if ((this._object = this._readEntity(token)) === undefined)
        return;
      // In N3 mode, the object might be a path
      if (this._n3Mode)
        return this._getPathReader(this._getContextEndReader());
    }
    return this._getContextEndReader();
  }

  // ### `_readPredicateOrNamedGraph` reads a quad's predicate, or a named graph
  _readPredicateOrNamedGraph(token) {
    return token.type === '{' ? this._readGraph(token) : this._readPredicate(token);
  }

  // ### `_readGraph` reads a graph
  _readGraph(token) {
    if (token.type !== '{')
      return this._error('Expected graph but got ' + token.type, token);
    // The "subject" we read is actually the GRAPH's label
    this._graph = this._subject, this._subject = null;
    return this._readSubject;
  }

  // ### `_readBlankNodeHead` reads the head of a blank node
  _readBlankNodeHead(token) {
    if (token.type === ']') {
      this._subject = null;
      return this._readBlankNodeTail(token);
    }
    else {
      this._predicate = null;
      return this._readPredicate(token);
    }
  }

  // ### `_readBlankNodeTail` reads the end of a blank node
  _readBlankNodeTail(token) {
    if (token.type !== ']')
      return this._readBlankNodePunctuation(token);

    // Store blank node quad
    if (this._subject !== null)
      this._emit(this._subject, this._predicate, this._object, this._graph);

    // Restore the parent context containing this blank node
    var empty = this._predicate === null;
    this._restoreContext();
    // If the blank node was the subject, continue reading the predicate
    if (this._object === null)
      // If the blank node was empty, it could be a named graph label
      return empty ? this._readPredicateOrNamedGraph : this._readPredicateAfterBlank;
    // If the blank node was the object, restore previous context and read punctuation
    else
      return this._getContextEndReader();
  }

  // ### `_readPredicateAfterBlank` reads a predicate after an anonymous blank node
  _readPredicateAfterBlank(token) {
    switch (token.type) {
    case '.':
    case '}':
      // No predicate is coming if the triple is terminated here
      this._subject = null;
      return this._readPunctuation(token);
    default:
      return this._readPredicate(token);
    }
  }

  // ### `_readListItem` reads items from a list
  _readListItem(token) {
    var item = null,                      // The item of the list
        list = null,                      // The list itself
        previousList = this._subject,     // The previous list that contains this list
        stack = this._contextStack,       // The stack of parent contexts
        parent = stack[stack.length - 1], // The parent containing the current list
        next = this._readListItem;        // The next function to execute

    switch (token.type) {
    case '[':
      // Stack the current list quad and start a new quad with a blank node as subject
      this._saveContext('blank', this._graph,
                        list = this._blankNode(), this.RDF_FIRST,
                        this._subject = item = this._blankNode());
      next = this._readBlankNodeHead;
      break;
    case '(':
      // Stack the current list quad and start a new list
      this._saveContext('list', this._graph,
                        list = this._blankNode(), this.RDF_FIRST, this.RDF_NIL);
      this._subject = null;
      break;
    case ')':
      // Closing the list; restore the parent context
      this._restoreContext();
      // If this list is contained within a parent list, return the membership quad here.
      // This will be `<parent list element> rdf:first <this list>.`.
      if (stack.length !== 0 && stack[stack.length - 1].type === 'list')
        this._emit(this._subject, this._predicate, this._object, this._graph);
      // Was this list the parent's subject?
      if (this._predicate === null) {
        // The next token is the predicate
        next = this._readPredicate;
        // No list tail if this was an empty list
        if (this._subject === this.RDF_NIL)
          return next;
      }
      // The list was in the parent context's object
      else {
        next = this._getContextEndReader();
        // No list tail if this was an empty list
        if (this._object === this.RDF_NIL)
          return next;
      }
      // Close the list by making the head nil
      list = this.RDF_NIL;
      break;
    case 'literal':
      // Regular literal, can still get a datatype or language
      if (token.prefix.length === 0) {
        this._literalValue = token.value;
        next = this._readListItemDataTypeOrLang;
      }
      // Pre-datatyped string literal (prefix stores the datatype)
      else {
        item = this._literal(token.value, this._namedNode(token.prefix));
        next = this._getContextEndReader();
      }
      break;
    case '{':
      // Start a new formula
      if (!this._n3Mode)
        return this._error('Unexpected graph', token);
      this._saveContext('formula', this._graph, this._subject, this._predicate,
                        this._graph = this._blankNode());
      return this._readSubject;
    default:
      if ((item = this._readEntity(token)) === undefined)
        return;
    }

     // Create a new blank node if no item head was assigned yet
    if (list === null)
      this._subject = list = this._blankNode();

    // Is this the first element of the list?
    if (previousList === null) {
      // This list is either the subject or the object of its parent
      if (parent.predicate === null)
        parent.subject = list;
      else
        parent.object = list;
    }
    else {
      // Continue the previous list with the current list
      this._emit(previousList, this.RDF_REST, list, this._graph);
    }
    // If an item was read, add it to the list
    if (item !== null) {
      // In N3 mode, the item might be a path
      if (this._n3Mode && (token.type === 'IRI' || token.type === 'prefixed')) {
        // Create a new context to add the item's path
        this._saveContext('item', this._graph, list, this.RDF_FIRST, item);
        this._subject = item, this._predicate = null;
        // _readPath will restore the context and output the item
        return this._getPathReader(this._readListItem);
      }
      // Output the item
      this._emit(list, this.RDF_FIRST, item, this._graph);
    }
    return next;
  }

  // ### `_readDataTypeOrLang` reads an _optional_ datatype or language
  _readDataTypeOrLang(token) {
    return this._completeObjectLiteral(token, false);
  }


  // ### `_readListItemDataTypeOrLang` reads an _optional_ datatype or language in a list
  _readListItemDataTypeOrLang(token) {
    return this._completeObjectLiteral(token, true);
  }

  // ### `_completeLiteral` completes a literal with an optional datatype or language
  _completeLiteral(token) {
    // Create a simple string literal by default
    let literal = this._literal(this._literalValue);

    switch (token.type) {
    // Create a datatyped literal
    case 'type':
    case 'typeIRI':
      var datatype = this._readEntity(token);
      if (datatype === undefined) return; // No datatype means an error occurred
      literal = this._literal(this._literalValue, datatype);
      token = null;
      break;
    // Create a language-tagged string
    case 'langcode':
      literal = this._literal(this._literalValue, token.value);
      token = null;
      break;
    }

    return { token, literal };
  }

  // Completes a literal in subject position
  _completeSubjectLiteral(token) {
    this._subject = this._completeLiteral(token).literal;
    return this._readPredicateOrNamedGraph;
  }

  // Completes a literal in object position
  _completeObjectLiteral(token, listItem) {
    const completed = this._completeLiteral(token);
    if (!completed)
      return;
    this._object = completed.literal;

    // If this literal was part of a list, write the item
    // (we could also check the context stack, but passing in a flag is faster)
    if (listItem)
      this._emit(this._subject, this.RDF_FIRST, this._object, this._graph);
    // If the token was consumed, continue with the rest of the input
    if (completed.token === null)
      return this._getContextEndReader();
    // Otherwise, consume the token now
    else {
      this._readCallback = this._getContextEndReader();
      return this._readCallback(completed.token);
    }
  }

  // ### `_readFormulaTail` reads the end of a formula
  _readFormulaTail(token) {
    if (token.type !== '}')
      return this._readPunctuation(token);

    // Store the last quad of the formula
    if (this._subject !== null)
      this._emit(this._subject, this._predicate, this._object, this._graph);

    // Restore the parent context containing this formula
    this._restoreContext();
    // If the formula was the subject, continue reading the predicate.
    // If the formula was the object, read punctuation.
    return this._object === null ? this._readPredicate : this._getContextEndReader();
  }

  // ### `_readPunctuation` reads punctuation between quads or quad parts
  _readPunctuation(token) {
    var next, subject = this._subject, graph = this._graph,
        inversePredicate = this._inversePredicate;
    switch (token.type) {
    // A closing brace ends a graph
    case '}':
      if (this._graph === null)
        return this._error('Unexpected graph closing', token);
      if (this._n3Mode)
        return this._readFormulaTail(token);
      this._graph = null;
    // A dot just ends the statement, without sharing anything with the next
    case '.':
      this._subject = null;
      next = this._contextStack.length ? this._readSubject : this._readInTopContext;
      if (inversePredicate) this._inversePredicate = false;
      break;
    // Semicolon means the subject is shared; predicate and object are different
    case ';':
      next = this._readPredicate;
      break;
    // Comma means both the subject and predicate are shared; the object is different
    case ',':
      next = this._readObject;
      break;
    default:
      // An entity means this is a quad (only allowed if not already inside a graph)
      if (this._supportsQuads && this._graph === null && (graph = this._readEntity(token)) !== undefined) {
        next = this._readQuadPunctuation;
        break;
      }
      return this._error('Expected punctuation to follow "' + this._object.id + '"', token);
    }
    // A quad has been completed now, so return it
    if (subject !== null) {
      var predicate = this._predicate, object = this._object;
      if (!inversePredicate)
        this._emit(subject, predicate, object,  graph);
      else
        this._emit(object,  predicate, subject, graph);
    }
    return next;
  }

    // ### `_readBlankNodePunctuation` reads punctuation in a blank node
  _readBlankNodePunctuation(token) {
    var next;
    switch (token.type) {
    // Semicolon means the subject is shared; predicate and object are different
    case ';':
      next = this._readPredicate;
      break;
    // Comma means both the subject and predicate are shared; the object is different
    case ',':
      next = this._readObject;
      break;
    default:
      return this._error('Expected punctuation to follow "' + this._object.id + '"', token);
    }
    // A quad has been completed now, so return it
    this._emit(this._subject, this._predicate, this._object, this._graph);
    return next;
  }

  // ### `_readQuadPunctuation` reads punctuation after a quad
  _readQuadPunctuation(token) {
    if (token.type !== '.')
      return this._error('Expected dot to follow quad', token);
    return this._readInTopContext;
  }

  // ### `_readPrefix` reads the prefix of a prefix declaration
  _readPrefix(token) {
    if (token.type !== 'prefix')
      return this._error('Expected prefix to follow @prefix', token);
    this._prefix = token.value;
    return this._readPrefixIRI;
  }

  // ### `_readPrefixIRI` reads the IRI of a prefix declaration
  _readPrefixIRI(token) {
    if (token.type !== 'IRI')
      return this._error('Expected IRI to follow prefix "' + this._prefix + ':"', token);
    var prefixNode = this._readEntity(token);
    this._prefixes[this._prefix] = prefixNode.value;
    this._prefixCallback(this._prefix, prefixNode);
    return this._readDeclarationPunctuation;
  }

  // ### `_readBaseIRI` reads the IRI of a base declaration
  _readBaseIRI(token) {
    var iri = token.type === 'IRI' && this._resolveIRI(token.value);
    if (!iri)
      return this._error('Expected valid IRI to follow base declaration', token);
    this._setBase(iri);
    return this._readDeclarationPunctuation;
  }

  // ### `_readNamedGraphLabel` reads the label of a named graph
  _readNamedGraphLabel(token) {
    switch (token.type) {
    case 'IRI':
    case 'blank':
    case 'prefixed':
      return this._readSubject(token), this._readGraph;
    case '[':
      return this._readNamedGraphBlankLabel;
    default:
      return this._error('Invalid graph label', token);
    }
  }

  // ### `_readNamedGraphLabel` reads a blank node label of a named graph
  _readNamedGraphBlankLabel(token) {
    if (token.type !== ']')
      return this._error('Invalid graph label', token);
    this._subject = this._blankNode();
    return this._readGraph;
  }

  // ### `_readDeclarationPunctuation` reads the punctuation of a declaration
  _readDeclarationPunctuation(token) {
    // SPARQL-style declarations don't have punctuation
    if (this._sparqlStyle) {
      this._sparqlStyle = false;
      return this._readInTopContext(token);
    }

    if (token.type !== '.')
      return this._error('Expected declaration to end with a dot', token);
    return this._readInTopContext;
  }

  // Reads a list of quantified symbols from a @forSome or @forAll statement
  _readQuantifierList(token) {
    var entity;
    switch (token.type) {
    case 'IRI':
    case 'prefixed':
      if ((entity = this._readEntity(token, true)) !== undefined)
        break;
    default:
      return this._error('Unexpected ' + token.type, token);
    }
    // Without explicit quantifiers, map entities to a quantified entity
    if (!this._explicitQuantifiers)
      this._quantified[entity.id] = this._quantifier(this._blankNode().value);
    // With explicit quantifiers, output the reified quantifier
    else {
      // If this is the first item, start a new quantifier list
      if (this._subject === null)
        this._emit(this._graph || this.DEFAULTGRAPH, this._predicate,
                   this._subject = this._blankNode(), this.QUANTIFIERS_GRAPH);
      // Otherwise, continue the previous list
      else
        this._emit(this._subject, this.RDF_REST,
                   this._subject = this._blankNode(), this.QUANTIFIERS_GRAPH);
      // Output the list item
      this._emit(this._subject, this.RDF_FIRST, entity, this.QUANTIFIERS_GRAPH);
    }
    return this._readQuantifierPunctuation;
  }

  // Reads punctuation from a @forSome or @forAll statement
  _readQuantifierPunctuation(token) {
    // Read more quantifiers
    if (token.type === ',')
      return this._readQuantifierList;
    // End of the quantifier list
    else {
      // With explicit quantifiers, close the quantifier list
      if (this._explicitQuantifiers) {
        this._emit(this._subject, this.RDF_REST, this.RDF_NIL, this.QUANTIFIERS_GRAPH);
        this._subject = null;
      }
      // Read a dot
      this._readCallback = this._getContextEndReader();
      return this._readCallback(token);
    }
  }

  // ### `_getPathReader` reads a potential path and then resumes with the given function
  _getPathReader(afterPath) {
    this._afterPath = afterPath;
    return this._readPath;
  }

  // ### `_readPath` reads a potential path
  _readPath(token) {
    switch (token.type) {
    // Forward path
    case '!': return this._readForwardPath;
    // Backward path
    case '^': return this._readBackwardPath;
    // Not a path; resume reading where we left off
    default:
      var stack = this._contextStack, parent = stack.length && stack[stack.length - 1];
      // If we were reading a list item, we still need to output it
      if (parent && parent.type === 'item') {
        // The list item is the remaining subejct after reading the path
        var item = this._subject;
        // Switch back to the context of the list
        this._restoreContext();
        // Output the list item
        this._emit(this._subject, this.RDF_FIRST, item, this._graph);
      }
      return this._afterPath(token);
    }
  }

  // ### `_readForwardPath` reads a '!' path
  _readForwardPath(token) {
    var subject, predicate, object = this._blankNode();
    // The next token is the predicate
    if ((predicate = this._readEntity(token)) === undefined)
      return;
    // If we were reading a subject, replace the subject by the path's object
    if (this._predicate === null)
      subject = this._subject, this._subject = object;
    // If we were reading an object, replace the subject by the path's object
    else
      subject = this._object,  this._object  = object;
    // Emit the path's current quad and read its next section
    this._emit(subject, predicate, object, this._graph);
    return this._readPath;
  }

  // ### `_readBackwardPath` reads a '^' path
  _readBackwardPath(token) {
    var subject = this._blankNode(), predicate, object;
    // The next token is the predicate
    if ((predicate = this._readEntity(token)) === undefined)
      return;
    // If we were reading a subject, replace the subject by the path's subject
    if (this._predicate === null)
      object = this._subject, this._subject = subject;
    // If we were reading an object, replace the subject by the path's subject
    else
      object = this._object,  this._object  = subject;
    // Emit the path's current quad and read its next section
    this._emit(subject, predicate, object, this._graph);
    return this._readPath;
  }

  // ### `_readRDFStarTailOrGraph` reads the graph of a nested RDF* quad or the end of a nested RDF* triple
  _readRDFStarTailOrGraph(token) {
    if (token.type !== '>>') {
      // An entity means this is a quad (only allowed if not already inside a graph)
      if (this._supportsQuads && this._graph === null && (this._graph = this._readEntity(token)) !== undefined)
        return this._readRDFStarTail;
      return this._error('Expected >> to follow "' + this._object.id + '"', token);
    }
    return this._readRDFStarTail(token);
  }

  // ### `_readRDFStarTail` reads the end of a nested RDF* triple
  _readRDFStarTail(token) {
    if (token.type !== '>>')
      return this._error(`Expected >> but got ${token.type}`, token);
    // Read the quad and restore the previous context
    const quad = this._quad(this._subject, this._predicate, this._object,
      this._graph || this.DEFAULTGRAPH);
    this._restoreContext();
    // If the triple was the subject, continue by reading the predicate.
    if (this._subject === null) {
      this._subject = quad;
      return this._readPredicate;
    }
    // If the triple was the object, read context end.
    else {
      this._object = quad;
      return this._getContextEndReader();
    }
  }

  // ### `_getContextEndReader` gets the next reader function at the end of a context
  _getContextEndReader() {
    var contextStack = this._contextStack;
    if (!contextStack.length)
      return this._readPunctuation;

    switch (contextStack[contextStack.length - 1].type) {
    case 'blank':
      return this._readBlankNodeTail;
    case 'list':
      return this._readListItem;
    case 'formula':
      return this._readFormulaTail;
    case '<<':
      return this._readRDFStarTailOrGraph;
    }
  }

  // ### `_emit` sends a quad through the callback
  _emit(subject, predicate, object, graph) {
    this._callback(null, this._quad(subject, predicate, object, graph || this.DEFAULTGRAPH));
  }

  // ### `_error` emits an error message through the callback
  _error(message, token) {
    var err = new Error(message + ' on line ' + token.line + '.');
    err.context = {
      token: token,
      line: token.line,
      previousToken: this._lexer.previousToken,
    };
    this._callback(err);
    this._callback = noop;
  }

  // ### `_resolveIRI` resolves an IRI against the base path
  _resolveIRI(iri) {
    return /^[a-z][a-z0-9+.-]*:/i.test(iri) ? iri : this._resolveRelativeIRI(iri);
  }

  // ### `_resolveRelativeIRI` resolves an IRI against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative
  _resolveRelativeIRI(iri) {
    // An empty relative IRI indicates the base IRI
    if (!iri.length)
      return this._base;
    // Decide resolving strategy based in the first character
    switch (iri[0]) {
    // Resolve relative fragment IRIs against the base IRI
    case '#': return this._base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return this._base.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? this._baseScheme : this._baseRoot) + this._removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default:
      // Relative IRIs cannot contain a colon in the first path segment
      return (/^[^/:]*:/.test(iri)) ? null : this._removeDotSegments(this._basePath + iri);
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986
  _removeDotSegments(iri) {
    // Don't modify the IRI if it does not contain any dot segments
    if (!/(^|\/)\.\.?($|[/#?])/.test(iri))
      return iri;

    // Start with an imaginary slash before the IRI in order to resolve trailing './' and '../'
    var result = '', length = iri.length, i = -1, pathStart = -1, segmentStart = 0, next = '/';

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

  // ## Public methods

  // ### `parse` parses the N3 input and emits each parsed quad through the callback
  parse(input, quadCallback, prefixCallback) {
    var self = this;
    // The read callback is the next function to be executed when a token arrives.
    // We start reading in the top context.
    this._readCallback = this._readInTopContext;
    this._sparqlStyle = false;
    this._prefixes = Object.create(null);
    this._prefixes._ = this._blankNodePrefix ? this._blankNodePrefix.substr(2)
                                             : 'b' + blankNodePrefix++ + '_';
    this._prefixCallback = prefixCallback || noop;
    this._inversePredicate = false;
    this._quantified = Object.create(null);

    // Parse synchronously if no quad callback is given
    if (!quadCallback) {
      var quads = [], error;
      this._callback = function (e, t) { e ? (error = e) : t && quads.push(t); };
      this._lexer.tokenize(input).every(function (token) {
        return self._readCallback = self._readCallback(token);
      });
      if (error) throw error;
      return quads;
    }

    // Parse asynchronously otherwise, executing the read callback when a token arrives
    this._callback = quadCallback;
    this._lexer.tokenize(input, function (error, token) {
      if (error !== null)
        self._callback(error), self._callback = noop;
      else if (self._readCallback)
        self._readCallback = self._readCallback(token);
    });
  }
}

// The empty function
function noop() {}

// Initializes the parser with the given data factory
function initDataFactory(parser, factory) {
  // Set factory methods
  var namedNode = factory.namedNode;
  parser._namedNode   = namedNode;
  parser._blankNode   = factory.blankNode;
  parser._literal     = factory.literal;
  parser._variable    = factory.variable;
  parser._quad        = factory.quad;
  parser.DEFAULTGRAPH = factory.defaultGraph();

  // Set common named nodes
  parser.RDF_FIRST  = namedNode(IRIs["a" /* default */].rdf.first);
  parser.RDF_REST   = namedNode(IRIs["a" /* default */].rdf.rest);
  parser.RDF_NIL    = namedNode(IRIs["a" /* default */].rdf.nil);
  parser.N3_FORALL  = namedNode(IRIs["a" /* default */].r.forAll);
  parser.N3_FORSOME = namedNode(IRIs["a" /* default */].r.forSome);
  parser.ABBREVIATIONS = {
    'a': namedNode(IRIs["a" /* default */].rdf.type),
    '=': namedNode(IRIs["a" /* default */].owl.sameAs),
    '>': namedNode(IRIs["a" /* default */].log.implies),
  };
  parser.QUANTIFIERS_GRAPH = namedNode('urn:n3:quantifiers');
}
initDataFactory(N3Parser_N3Parser.prototype, N3DataFactory);

// CONCATENATED MODULE: ./node_modules/n3/src/N3Writer.js
// **N3Writer** writes N3 documents.




const N3Writer_DEFAULTGRAPH = N3DataFactory.defaultGraph();

const { rdf: N3Writer_rdf, xsd: N3Writer_xsd } = IRIs["a" /* default */];

// Characters in literals that require escaping
var N3Writer_escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapedCharacters = {
      '\\': '\\\\', '"': '\\"', '\t': '\\t',
      '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
    };

// ## Placeholder class to represent already pretty-printed terms
class N3Writer_SerializedTerm extends Term {
  // Pretty-printed nodes are not equal to any other node
  // (e.g., [] does not equal [])
  equals() {
    return false;
  }
}

// ## Constructor
class N3Writer_N3Writer {
  constructor(outputStream, options) {
    // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
    this._prefixRegex = /$0^/;

    // Shift arguments if the first argument is not a stream
    if (outputStream && typeof outputStream.write !== 'function')
      options = outputStream, outputStream = null;
    options = options || {};
    this._lists = options.lists;

    // If no output stream given, send the output as string through the end callback
    if (!outputStream) {
      var output = '';
      this._outputStream = {
        write(chunk, encoding, done) { output += chunk; done && done(); },
        end:   function (done) { done && done(null, output); },
      };
      this._endStream = true;
    }
    else {
      this._outputStream = outputStream;
      this._endStream = options.end === undefined ? true : !!options.end;
    }

    // Initialize writer, depending on the format
    this._subject = null;
    if (!(/triple|quad/i).test(options.format)) {
      this._graph = N3Writer_DEFAULTGRAPH;
      this._prefixIRIs = Object.create(null);
      options.prefixes && this.addPrefixes(options.prefixes);
    }
    else {
      this._writeQuad = this._writeQuadLine;
    }
  }

  // ## Private methods

  // ### Whether the current graph is the default graph
  get _inDefaultGraph() {
    return N3Writer_DEFAULTGRAPH.equals(this._graph);
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
        this._write((this._subject === null ? '' : (this._inDefaultGraph ? '.\n' : '\n}\n')) +
                    (N3Writer_DEFAULTGRAPH.equals(graph) ? '' : this._encodeIriOrBlank(graph) + ' {\n'));
        this._graph = graph;
        this._subject = null;
      }
      // Don't repeat the subject if it's the same
      if (subject.equals(this._subject)) {
        // Don't repeat the predicate if it's the same
        if (predicate.equals(this._predicate))
          this._write(', ' + this._encodeObject(object), done);
        // Same subject, different predicate
        else
          this._write(';\n    ' +
                      this._encodePredicate(this._predicate = predicate) + ' ' +
                      this._encodeObject(object), done);
      }
      // Different subject; write the whole quad
      else
        this._write((this._subject === null ? '' : '.\n') +
                    this._encodeSubject(this._subject = subject) + ' ' +
                    this._encodePredicate(this._predicate = predicate) + ' ' +
                    this._encodeObject(object), done);
    }
    catch (error) { done && done(error); }
  }

  // ### `_writeQuadLine` writes the quad to the output stream as a single line
  _writeQuadLine(subject, predicate, object, graph, done) {
    // Write the quad without prefixes
    delete this._prefixMatch;
    this._write(this.quadToString(subject, predicate, object, graph), done);
  }

  // ### `quadToString` serializes a quad as a string
  quadToString(subject, predicate, object, graph) {
    return  this._encodeSubject(subject)   + ' ' +
            this._encodeIriOrBlank(predicate) + ' ' +
            this._encodeObject(object) +
            (graph && graph.value ? ' ' + this._encodeIriOrBlank(graph) + ' .\n' : ' .\n');
  }

  // ### `quadsToString` serializes an array of quads as a string
  quadsToString(quads) {
    return quads.map(function (t) {
      return this.quadToString(t.subject, t.predicate, t.object, t.graph);
    }, this).join('');
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
      if (this._lists && (entity.value in this._lists))
        entity = this.list(this._lists[entity.value]);
      return 'id' in entity ? entity.id : '_:' + entity.value;
    }
    // Escape special characters
    var iri = entity.value;
    if (N3Writer_escape.test(iri))
      iri = iri.replace(escapeAll, characterReplacer);
    // Try to represent the IRI as prefixed name
    var prefixMatch = this._prefixRegex.exec(iri);
    return !prefixMatch ? '<' + iri + '>' :
           (!prefixMatch[1] ? iri : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2]);
  }

  // ### `_encodeLiteral` represents a literal
  _encodeLiteral(literal) {
    // Escape special characters
    var value = literal.value;
    if (N3Writer_escape.test(value))
      value = value.replace(escapeAll, characterReplacer);
    // Write the literal, possibly with type or language
    if (literal.language)
      return '"' + value + '"@' + literal.language;
    else if (literal.datatype.value !== N3Writer_xsd.string)
      return '"' + value + '"^^' + this._encodeIriOrBlank(literal.datatype);
    else
      return '"' + value + '"';
  }

  // ### `_encodePredicate` represents a predicate
  _encodePredicate(predicate) {
    return predicate.value === N3Writer_rdf.type ? 'a' : this._encodeIriOrBlank(predicate);
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
      this._writeQuad(subject, predicate, object, N3Writer_DEFAULTGRAPH, graph);
    // The `graph` parameter was provided
    else
      this._writeQuad(subject, predicate, object, graph || N3Writer_DEFAULTGRAPH, done);
  }

  // ### `addQuads` adds the quads to the output stream
  addQuads(quads) {
    for (var i = 0; i < quads.length; i++)
      this.addQuad(quads[i]);
  }

  // ### `addPrefix` adds the prefix to the output stream
  addPrefix(prefix, iri, done) {
    var prefixes = {};
    prefixes[prefix] = iri;
    this.addPrefixes(prefixes, done);
  }

  // ### `addPrefixes` adds the prefixes to the output stream
  addPrefixes(prefixes, done) {
    var prefixIRIs = this._prefixIRIs, hasPrefixes = false;
    for (var prefix in prefixes) {
      var iri = prefixes[prefix];
      if (typeof iri !== 'string')
        iri = iri.value;
      hasPrefixes = true;
      // Finish a possible pending quad
      if (this._subject !== null) {
        this._write(this._inDefaultGraph ? '.\n' : '\n}\n');
        this._subject = null, this._graph = '';
      }
      // Store and write the prefix
      prefixIRIs[iri] = (prefix += ':');
      this._write('@prefix ' + prefix + ' <' + iri + '>.\n');
    }
    // Recreate the prefix matcher
    if (hasPrefixes) {
      var IRIlist = '', prefixList = '';
      for (var prefixIRI in prefixIRIs) {
        IRIlist += IRIlist ? '|' + prefixIRI : prefixIRI;
        prefixList += (prefixList ? '|' : '') + prefixIRIs[prefixIRI];
      }
      IRIlist = IRIlist.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
      this._prefixRegex = new RegExp('^(?:' + prefixList + ')[^\/]*$|' +
                                     '^(' + IRIlist + ')([a-zA-Z][\\-_a-zA-Z0-9]*)$');
    }
    // End a prefix block with a newline
    this._write(hasPrefixes ? '\n' : '', done);
  }

  // ### `blank` creates a blank node with the given content
  blank(predicate, object) {
    var children = predicate, child, length;
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
      return new N3Writer_SerializedTerm('[]');
    // Generate a non-nested one-triple blank node
    case 1:
      child = children[0];
      if (!(child.object instanceof N3Writer_SerializedTerm))
        return new N3Writer_SerializedTerm('[ ' + this._encodePredicate(child.predicate) + ' ' +
                                  this._encodeObject(child.object) + ' ]');
    // Generate a multi-triple or nested blank node
    default:
      var contents = '[';
      // Write all triples in order
      for (var i = 0; i < length; i++) {
        child = children[i];
        // Write only the object is the predicate is the same as the previous
        if (child.predicate.equals(predicate))
          contents += ', ' + this._encodeObject(child.object);
        // Otherwise, write the predicate and the object
        else {
          contents += (i ? ';\n  ' : '\n  ') +
                      this._encodePredicate(child.predicate) + ' ' +
                      this._encodeObject(child.object);
          predicate = child.predicate;
        }
      }
      return new N3Writer_SerializedTerm(contents + '\n]');
    }
  }

  // ### `list` creates a list node with the given content
  list(elements) {
    var length = elements && elements.length || 0, contents = new Array(length);
    for (var i = 0; i < length; i++)
      contents[i] = this._encodeObject(elements[i]);
    return new N3Writer_SerializedTerm('(' + contents.join(' ') + ')');
  }

  // ### `end` signals the end of the output stream
  end(done) {
    // Finish a possible pending quad
    if (this._subject !== null) {
      this._write(this._inDefaultGraph ? '.\n' : '\n}\n');
      this._subject = null;
    }
    // Disallow further writing
    this._write = this._blockedWrite;

    // Try to end the underlying stream, ensuring done is called exactly one time
    var singleDone = done && function (error, result) { singleDone = null, done(error, result); };
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
  var result = escapedCharacters[character];
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

// EXTERNAL MODULE: ./node_modules/readable-stream/readable-browser.js
var readable_browser = __webpack_require__(6);

// CONCATENATED MODULE: ./node_modules/n3/src/N3Store.js
// **N3Store** objects store N3 quads by graph in memory.




// ## Constructor
class N3Store_N3Store {
  constructor(quads, options) {
    // The number of quads is initially zero
    this._size = 0;
    // `_graphs` contains subject, predicate, and object indexes per graph
    this._graphs = Object.create(null);
    // `_ids` maps entities such as `http://xmlns.com/foaf/0.1/name` to numbers,
    // saving memory by using only numbers as keys in `_graphs`
    this._id = 0;
    this._ids = Object.create(null);
    this._ids['><'] = 0; // dummy entry, so the first actual key is non-zero
    this._entities = Object.create(null); // inverse of `_ids`
    // `_blankNodeIndex` is the index of the last automatically named blank node
    this._blankNodeIndex = 0;

    // Shift parameters if `quads` is not given
    if (!options && quads && !quads[0])
      options = quads, quads = null;
    options = options || {};
    this._factory = options.factory || N3DataFactory;

    // Add quads if passed
    if (quads)
      this.addQuads(quads);
  }

  // ## Public properties

  // ### `size` returns the number of quads in the store
  get size() {
    // Return the quad count if if was cached
    var size = this._size;
    if (size !== null)
      return size;

    // Calculate the number of quads by counting to the deepest level
    size = 0;
    var graphs = this._graphs, subjects, subject;
    for (var graphKey in graphs)
      for (var subjectKey in (subjects = graphs[graphKey].subjects))
        for (var predicateKey in (subject = subjects[subjectKey]))
          size += Object.keys(subject[predicateKey]).length;
    return this._size = size;
  }

  // ## Private methods

  // ### `_addToIndex` adds a quad to a three-layered index.
  // Returns if the index has changed, if the entry did not already exist.
  _addToIndex(index0, key0, key1, key2) {
    // Create layers as necessary
    var index1 = index0[key0] || (index0[key0] = {});
    var index2 = index1[key1] || (index1[key1] = {});
    // Setting the key to _any_ value signals the presence of the quad
    var existed = key2 in index2;
    if (!existed)
      index2[key2] = null;
    return !existed;
  }

  // ### `_removeFromIndex` removes a quad from a three-layered index
  _removeFromIndex(index0, key0, key1, key2) {
    // Remove the quad from the index
    var index1 = index0[key0], index2 = index1[key1], key;
    delete index2[key2];

    // Remove intermediary index layers if they are empty
    for (key in index2) return;
    delete index1[key1];
    for (key in index1) return;
    delete index0[key0];
  }

  // ### `_findInIndex` finds a set of quads in a three-layered index.
  // The index base is `index0` and the keys at each level are `key0`, `key1`, and `key2`.
  // Any of these keys can be undefined, which is interpreted as a wildcard.
  // `name0`, `name1`, and `name2` are the names of the keys at each level,
  // used when reconstructing the resulting quad
  // (for instance: _subject_, _predicate_, and _object_).
  // Finally, `graph` will be the graph of the created quads.
  // If `callback` is given, each result is passed through it
  // and iteration halts when it returns truthy for any quad.
  // If instead `array` is given, each result is added to the array.
  _findInIndex(index0, key0, key1, key2, name0, name1, name2, graph, callback, array) {
    var tmp, index1, index2, varCount = !key0 + !key1 + !key2,
        // depending on the number of variables, keys or reverse index are faster
        entityKeys = varCount > 1 ? Object.keys(this._ids) : this._entities;

    // If a key is specified, use only that part of index 0.
    if (key0) (tmp = index0, index0 = {})[key0] = tmp[key0];
    for (var value0 in index0) {
      var entity0 = entityKeys[value0];

      if (index1 = index0[value0]) {
        // If a key is specified, use only that part of index 1.
        if (key1) (tmp = index1, index1 = {})[key1] = tmp[key1];
        for (var value1 in index1) {
          var entity1 = entityKeys[value1];

          if (index2 = index1[value1]) {
            // If a key is specified, use only that part of index 2, if it exists.
            var values = key2 ? (key2 in index2 ? [key2] : []) : Object.keys(index2);
            // Create quads for all items found in index 2.
            for (var l = 0; l < values.length; l++) {
              var parts = { subject: null, predicate: null, object: null };
              parts[name0] = termFromId(entity0, this._factory);
              parts[name1] = termFromId(entity1, this._factory);
              parts[name2] = termFromId(entityKeys[values[l]], this._factory);
              var quad = this._factory.quad(
                parts.subject, parts.predicate, parts.object, termFromId(graph, this._factory));
              if (array)
                array.push(quad);
              else if (callback(quad))
                return true;
            }
          }
        }
      }
    }
    return array;
  }

  // ### `_loop` executes the callback on all keys of index 0
  _loop(index0, callback) {
    for (var key0 in index0)
      callback(key0);
  }

  // ### `_loopByKey0` executes the callback on all keys of a certain entry in index 0
  _loopByKey0(index0, key0, callback) {
    var index1, key1;
    if (index1 = index0[key0]) {
      for (key1 in index1)
        callback(key1);
    }
  }

  // ### `_loopByKey1` executes the callback on given keys of all entries in index 0
  _loopByKey1(index0, key1, callback) {
    var key0, index1;
    for (key0 in index0) {
      index1 = index0[key0];
      if (index1[key1])
        callback(key0);
    }
  }

  // ### `_loopBy2Keys` executes the callback on given keys of certain entries in index 2
  _loopBy2Keys(index0, key0, key1, callback) {
    var index1, index2, key2;
    if ((index1 = index0[key0]) && (index2 = index1[key1])) {
      for (key2 in index2)
        callback(key2);
    }
  }

  // ### `_countInIndex` counts matching quads in a three-layered index.
  // The index base is `index0` and the keys at each level are `key0`, `key1`, and `key2`.
  // Any of these keys can be undefined, which is interpreted as a wildcard.
  _countInIndex(index0, key0, key1, key2) {
    var count = 0, tmp, index1, index2;

    // If a key is specified, count only that part of index 0
    if (key0) (tmp = index0, index0 = {})[key0] = tmp[key0];
    for (var value0 in index0) {
      if (index1 = index0[value0]) {
        // If a key is specified, count only that part of index 1
        if (key1) (tmp = index1, index1 = {})[key1] = tmp[key1];
        for (var value1 in index1) {
          if (index2 = index1[value1]) {
            // If a key is specified, count the quad if it exists
            if (key2) (key2 in index2) && count++;
            // Otherwise, count all quads
            else count += Object.keys(index2).length;
          }
        }
      }
    }
    return count;
  }

  // ### `_getGraphs` returns an array with the given graph,
  // or all graphs if the argument is null or undefined.
  _getGraphs(graph) {
    if (!isString(graph))
      return this._graphs;
    var graphs = {};
    graphs[graph] = this._graphs[graph];
    return graphs;
  }

  // ### `_uniqueEntities` returns a function that accepts an entity ID
  // and passes the corresponding entity to callback if it hasn't occurred before.
  _uniqueEntities(callback) {
    var uniqueIds = Object.create(null), entities = this._entities;
    return function (id) {
      if (!(id in uniqueIds)) {
        uniqueIds[id] = true;
        callback(termFromId(entities[id]));
      }
    };
  }

  // ## Public methods

  // ### `addQuad` adds a new quad to the store.
  // Returns if the quad index has changed, if the quad did not already exist.
  addQuad(subject, predicate, object, graph) {
    // Shift arguments if a quad object is given instead of components
    if (!predicate)
      graph = subject.graph, object = subject.object,
        predicate = subject.predicate, subject = subject.subject;

    // Convert terms to internal string representation
    subject = termToId(subject);
    predicate = termToId(predicate);
    object = termToId(object);
    graph = termToId(graph);

    // Find the graph that will contain the triple
    var graphItem = this._graphs[graph];
    // Create the graph if it doesn't exist yet
    if (!graphItem) {
      graphItem = this._graphs[graph] = { subjects: {}, predicates: {}, objects: {} };
      // Freezing a graph helps subsequent `add` performance,
      // and properties will never be modified anyway
      Object.freeze(graphItem);
    }

    // Since entities can often be long IRIs, we avoid storing them in every index.
    // Instead, we have a separate index that maps entities to numbers,
    // which are then used as keys in the other indexes.
    var ids = this._ids;
    var entities = this._entities;
    subject   = ids[subject]   || (ids[entities[++this._id] = subject]   = this._id);
    predicate = ids[predicate] || (ids[entities[++this._id] = predicate] = this._id);
    object    = ids[object]    || (ids[entities[++this._id] = object]    = this._id);

    var changed = this._addToIndex(graphItem.subjects,   subject,   predicate, object);
    this._addToIndex(graphItem.predicates, predicate, object,    subject);
    this._addToIndex(graphItem.objects,    object,    subject,   predicate);

    // The cached quad count is now invalid
    this._size = null;
    return changed;
  }

  // ### `addQuads` adds multiple quads to the store
  addQuads(quads) {
    for (var i = 0; i < quads.length; i++)
      this.addQuad(quads[i]);
  }

  // ### `import` adds a stream of quads to the store
  import(stream) {
    var self = this;
    stream.on('data', function (quad) { self.addQuad(quad); });
    return stream;
  }

  // ### `removeQuad` removes a quad from the store if it exists
  removeQuad(subject, predicate, object, graph) {
    // Shift arguments if a quad object is given instead of components
    if (!predicate)
      graph = subject.graph, object = subject.object,
        predicate = subject.predicate, subject = subject.subject;

    // Convert terms to internal string representation
    subject = termToId(subject);
    predicate = termToId(predicate);
    object = termToId(object);
    graph = termToId(graph);

    // Find internal identifiers for all components
    // and verify the quad exists.
    var graphItem, ids = this._ids, graphs = this._graphs, subjects, predicates;
    if (!(subject    = ids[subject]) || !(predicate = ids[predicate]) ||
        !(object     = ids[object])  || !(graphItem = graphs[graph])  ||
        !(subjects   = graphItem.subjects[subject]) ||
        !(predicates = subjects[predicate]) ||
        !(object in predicates))
      return false;

    // Remove it from all indexes
    this._removeFromIndex(graphItem.subjects,   subject,   predicate, object);
    this._removeFromIndex(graphItem.predicates, predicate, object,    subject);
    this._removeFromIndex(graphItem.objects,    object,    subject,   predicate);
    if (this._size !== null) this._size--;

    // Remove the graph if it is empty
    for (subject in graphItem.subjects) return true;
    delete graphs[graph];
    return true;
  }

  // ### `removeQuads` removes multiple quads from the store
  removeQuads(quads) {
    for (var i = 0; i < quads.length; i++)
      this.removeQuad(quads[i]);
  }

  // ### `remove` removes a stream of quads from the store
  remove(stream) {
    var self = this;
    stream.on('data', function (quad) { self.removeQuad(quad); });
    return stream;
  }

  // ### `removeMatches` removes all matching quads from the store
  // Setting any field to `undefined` or `null` indicates a wildcard.
  removeMatches(subject, predicate, object, graph) {
    return this.remove(this.match(subject, predicate, object, graph));
  }

  // ### `deleteGraph` removes all triples with the given graph from the store
  deleteGraph(graph) {
    return this.removeMatches(null, null, null, graph);
  }

  // ### `getQuads` returns an array of quads matching a pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  getQuads(subject, predicate, object, graph) {
    // Convert terms to internal string representation
    subject = subject && termToId(subject);
    predicate = predicate && termToId(predicate);
    object = object && termToId(object);
    graph = graph && termToId(graph);

    var quads = [], graphs = this._getGraphs(graph), content,
        ids = this._ids, subjectId, predicateId, objectId;

    // Translate IRIs to internal index keys.
    if (isString(subject)   && !(subjectId   = ids[subject])   ||
        isString(predicate) && !(predicateId = ids[predicate]) ||
        isString(object)    && !(objectId    = ids[object]))
      return quads;

    for (var graphId in graphs) {
      // Only if the specified graph contains triples, there can be results
      if (content = graphs[graphId]) {
        // Choose the optimal index, based on what fields are present
        if (subjectId) {
          if (objectId)
            // If subject and object are given, the object index will be the fastest
            this._findInIndex(content.objects, objectId, subjectId, predicateId,
                              'object', 'subject', 'predicate', graphId, null, quads);
          else
            // If only subject and possibly predicate are given, the subject index will be the fastest
            this._findInIndex(content.subjects, subjectId, predicateId, null,
                              'subject', 'predicate', 'object', graphId, null, quads);
        }
        else if (predicateId)
          // If only predicate and possibly object are given, the predicate index will be the fastest
          this._findInIndex(content.predicates, predicateId, objectId, null,
                            'predicate', 'object', 'subject', graphId, null, quads);
        else if (objectId)
          // If only object is given, the object index will be the fastest
          this._findInIndex(content.objects, objectId, null, null,
                            'object', 'subject', 'predicate', graphId, null, quads);
        else
          // If nothing is given, iterate subjects and predicates first
          this._findInIndex(content.subjects, null, null, null,
                            'subject', 'predicate', 'object', graphId, null, quads);
      }
    }
    return quads;
  }

  // ### `match` returns a stream of quads matching a pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  match(subject, predicate, object, graph) {
    var stream = new readable_browser["Readable"]({ objectMode: true });

    // Initialize stream once it is being read
    stream._read = () => {
      for (var quad of this.getQuads(subject, predicate, object, graph))
        stream.push(quad);
      stream.push(null);
    };

    return stream;
  }

  // ### `countQuads` returns the number of quads matching a pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  countQuads(subject, predicate, object, graph) {
    // Convert terms to internal string representation
    subject = subject && termToId(subject);
    predicate = predicate && termToId(predicate);
    object = object && termToId(object);
    graph = graph && termToId(graph);

    var count = 0, graphs = this._getGraphs(graph), content,
        ids = this._ids, subjectId, predicateId, objectId;

    // Translate IRIs to internal index keys.
    if (isString(subject)   && !(subjectId   = ids[subject])   ||
        isString(predicate) && !(predicateId = ids[predicate]) ||
        isString(object)    && !(objectId    = ids[object]))
      return 0;

    for (var graphId in graphs) {
      // Only if the specified graph contains triples, there can be results
      if (content = graphs[graphId]) {
        // Choose the optimal index, based on what fields are present
        if (subject) {
          if (object)
            // If subject and object are given, the object index will be the fastest
            count += this._countInIndex(content.objects, objectId, subjectId, predicateId);
          else
            // If only subject and possibly predicate are given, the subject index will be the fastest
            count += this._countInIndex(content.subjects, subjectId, predicateId, objectId);
        }
        else if (predicate) {
          // If only predicate and possibly object are given, the predicate index will be the fastest
          count += this._countInIndex(content.predicates, predicateId, objectId, subjectId);
        }
        else {
          // If only object is possibly given, the object index will be the fastest
          count += this._countInIndex(content.objects, objectId, subjectId, predicateId);
        }
      }
    }
    return count;
  }

  // ### `forEach` executes the callback on all quads.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  forEach(callback, subject, predicate, object, graph) {
    this.some(function (quad) {
      callback(quad);
      return false;
    }, subject, predicate, object, graph);
  }

  // ### `every` executes the callback on all quads,
  // and returns `true` if it returns truthy for all them.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  every(callback, subject, predicate, object, graph) {
    var some = false;
    var every = !this.some(function (quad) {
      some = true;
      return !callback(quad);
    }, subject, predicate, object, graph);
    return some && every;
  }

  // ### `some` executes the callback on all quads,
  // and returns `true` if it returns truthy for any of them.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  some(callback, subject, predicate, object, graph) {
    // Convert terms to internal string representation
    subject = subject && termToId(subject);
    predicate = predicate && termToId(predicate);
    object = object && termToId(object);
    graph = graph && termToId(graph);

    var graphs = this._getGraphs(graph), content,
        ids = this._ids, subjectId, predicateId, objectId;

    // Translate IRIs to internal index keys.
    if (isString(subject)   && !(subjectId   = ids[subject])   ||
        isString(predicate) && !(predicateId = ids[predicate]) ||
        isString(object)    && !(objectId    = ids[object]))
      return false;

    for (var graphId in graphs) {
      // Only if the specified graph contains triples, there can be results
      if (content = graphs[graphId]) {
        // Choose the optimal index, based on what fields are present
        if (subjectId) {
          if (objectId) {
          // If subject and object are given, the object index will be the fastest
            if (this._findInIndex(content.objects, objectId, subjectId, predicateId,
                                  'object', 'subject', 'predicate', graphId, callback, null))
              return true;
          }
          else
            // If only subject and possibly predicate are given, the subject index will be the fastest
            if (this._findInIndex(content.subjects, subjectId, predicateId, null,
                                  'subject', 'predicate', 'object', graphId, callback, null))
              return true;
        }
        else if (predicateId) {
          // If only predicate and possibly object are given, the predicate index will be the fastest
          if (this._findInIndex(content.predicates, predicateId, objectId, null,
                                'predicate', 'object', 'subject', graphId, callback, null)) {
            return true;
          }
        }
        else if (objectId) {
          // If only object is given, the object index will be the fastest
          if (this._findInIndex(content.objects, objectId, null, null,
                                'object', 'subject', 'predicate', graphId, callback, null)) {
            return true;
          }
        }
        else
        // If nothing is given, iterate subjects and predicates first
        if (this._findInIndex(content.subjects, null, null, null,
                              'subject', 'predicate', 'object', graphId, callback, null)) {
          return true;
        }
      }
    }
    return false;
  }

  // ### `getSubjects` returns all subjects that match the pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  getSubjects(predicate, object, graph) {
    var results = [];
    this.forSubjects(function (s) { results.push(s); }, predicate, object, graph);
    return results;
  }

  // ### `forSubjects` executes the callback on all subjects that match the pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  forSubjects(callback, predicate, object, graph) {
    // Convert terms to internal string representation
    predicate = predicate && termToId(predicate);
    object = object && termToId(object);
    graph = graph && termToId(graph);

    var ids = this._ids, graphs = this._getGraphs(graph), content, predicateId, objectId;
    callback = this._uniqueEntities(callback);

    // Translate IRIs to internal index keys.
    if (isString(predicate) && !(predicateId = ids[predicate]) ||
        isString(object)    && !(objectId    = ids[object]))
      return;

    for (graph in graphs) {
      // Only if the specified graph contains triples, there can be results
      if (content = graphs[graph]) {
        // Choose optimal index based on which fields are wildcards
        if (predicateId) {
          if (objectId)
            // If predicate and object are given, the POS index is best.
            this._loopBy2Keys(content.predicates, predicateId, objectId, callback);
          else
            // If only predicate is given, the SPO index is best.
            this._loopByKey1(content.subjects, predicateId, callback);
        }
        else if (objectId)
          // If only object is given, the OSP index is best.
          this._loopByKey0(content.objects, objectId, callback);
        else
          // If no params given, iterate all the subjects
          this._loop(content.subjects, callback);
      }
    }
  }

  // ### `getPredicates` returns all predicates that match the pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  getPredicates(subject, object, graph) {
    var results = [];
    this.forPredicates(function (p) { results.push(p); }, subject, object, graph);
    return results;
  }

  // ### `forPredicates` executes the callback on all predicates that match the pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  forPredicates(callback, subject, object, graph) {
    // Convert terms to internal string representation
    subject = subject && termToId(subject);
    object = object && termToId(object);
    graph = graph && termToId(graph);

    var ids = this._ids, graphs = this._getGraphs(graph), content, subjectId, objectId;
    callback = this._uniqueEntities(callback);

    // Translate IRIs to internal index keys.
    if (isString(subject) && !(subjectId = ids[subject]) ||
        isString(object)  && !(objectId  = ids[object]))
      return;

    for (graph in graphs) {
      // Only if the specified graph contains triples, there can be results
      if (content = graphs[graph]) {
        // Choose optimal index based on which fields are wildcards
        if (subjectId) {
          if (objectId)
            // If subject and object are given, the OSP index is best.
            this._loopBy2Keys(content.objects, objectId, subjectId, callback);
          else
            // If only subject is given, the SPO index is best.
            this._loopByKey0(content.subjects, subjectId, callback);
        }
        else if (objectId)
          // If only object is given, the POS index is best.
          this._loopByKey1(content.predicates, objectId, callback);
        else
          // If no params given, iterate all the predicates.
          this._loop(content.predicates, callback);
      }
    }
  }

  // ### `getObjects` returns all objects that match the pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  getObjects(subject, predicate, graph) {
    var results = [];
    this.forObjects(function (o) { results.push(o); }, subject, predicate, graph);
    return results;
  }

  // ### `forObjects` executes the callback on all objects that match the pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  forObjects(callback, subject, predicate, graph) {
    // Convert terms to internal string representation
    subject = subject && termToId(subject);
    predicate = predicate && termToId(predicate);
    graph = graph && termToId(graph);

    var ids = this._ids, graphs = this._getGraphs(graph), content, subjectId, predicateId;
    callback = this._uniqueEntities(callback);

    // Translate IRIs to internal index keys.
    if (isString(subject)   && !(subjectId   = ids[subject]) ||
        isString(predicate) && !(predicateId = ids[predicate]))
      return;

    for (graph in graphs) {
      // Only if the specified graph contains triples, there can be results
      if (content = graphs[graph]) {
        // Choose optimal index based on which fields are wildcards
        if (subjectId) {
          if (predicateId)
            // If subject and predicate are given, the SPO index is best.
            this._loopBy2Keys(content.subjects, subjectId, predicateId, callback);
          else
            // If only subject is given, the OSP index is best.
            this._loopByKey1(content.objects, subjectId, callback);
        }
        else if (predicateId)
          // If only predicate is given, the POS index is best.
          this._loopByKey0(content.predicates, predicateId, callback);
        else
          // If no params given, iterate all the objects.
          this._loop(content.objects, callback);
      }
    }
  }

  // ### `getGraphs` returns all graphs that match the pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  getGraphs(subject, predicate, object) {
    var results = [];
    this.forGraphs(function (g) { results.push(g); }, subject, predicate, object);
    return results;
  }

  // ### `forGraphs` executes the callback on all graphs that match the pattern.
  // Setting any field to `undefined` or `null` indicates a wildcard.
  forGraphs(callback, subject, predicate, object) {
    for (var graph in this._graphs) {
      this.some(function (quad) {
        callback(quad.graph);
        return true; // Halt iteration of some()
      }, subject, predicate, object, graph);
    }
  }

  // ### `createBlankNode` creates a new blank node, returning its name
  createBlankNode(suggestedName) {
    var name, index;
    // Generate a name based on the suggested name
    if (suggestedName) {
      name = suggestedName = '_:' + suggestedName, index = 1;
      while (this._ids[name])
        name = suggestedName + index++;
    }
    // Generate a generic blank node name
    else {
      do { name = '_:b' + this._blankNodeIndex++; }
      while (this._ids[name]);
    }
    // Add the blank node to the entities, avoiding the generation of duplicates
    this._ids[name] = ++this._id;
    this._entities[this._id] = name;
    return this._factory.blankNode(name.substr(2));
  }

  // ### `extractLists` finds and removes all list triples
  // and returns the items per list.
  extractLists({ remove = false, ignoreErrors = false } = {}) {
    var lists = {}; // has scalar keys so could be a simple Object
    var onError = ignoreErrors ? (() => true) :
                  ((node, message) => { throw new Error(`${node.value} ${message}`); });

    // Traverse each list from its tail
    var tails = this.getQuads(null, IRIs["a" /* default */].rdf.rest, IRIs["a" /* default */].rdf.nil, null);
    var toRemove = remove ? [...tails] : [];
    tails.forEach(tailQuad => {
      var items = [];             // the members found as objects of rdf:first quads
      var malformed = false;      // signals whether the current list is malformed
      var head;                   // the head of the list (_:b1 in above example)
      var headPos;                // set to subject or object when head is set
      var graph = tailQuad.graph; // make sure list is in exactly one graph

      // Traverse the list from tail to end
      var current = tailQuad.subject;
      while (current && !malformed) {
        var objectQuads = this.getQuads(null, null, current, null);
        var subjectQuads = this.getQuads(current, null, null, null);
        var i, quad, first = null, rest = null, parent = null;

        // Find the first and rest of this list node
        for (i = 0; i < subjectQuads.length && !malformed; i++) {
          quad = subjectQuads[i];
          if (!quad.graph.equals(graph))
            malformed = onError(current, 'not confined to single graph');
          else if (head)
            malformed = onError(current, 'has non-list arcs out');

          // one rdf:first
          else if (quad.predicate.value === IRIs["a" /* default */].rdf.first) {
            if (first)
              malformed = onError(current, 'has multiple rdf:first arcs');
            else
              toRemove.push(first = quad);
          }

          // one rdf:rest
          else if (quad.predicate.value === IRIs["a" /* default */].rdf.rest) {
            if (rest)
              malformed = onError(current, 'has multiple rdf:rest arcs');
            else
              toRemove.push(rest = quad);
          }

          // alien triple
          else if (objectQuads.length)
            malformed = onError(current, 'can\'t be subject and object');
          else {
            head = quad; // e.g. { (1 2 3) :p :o }
            headPos = 'subject';
          }
        }

        // { :s :p (1 2) } arrives here with no head
        // { (1 2) :p :o } arrives here with head set to the list.
        for (i = 0; i < objectQuads.length && !malformed; ++i) {
          quad = objectQuads[i];
          if (head)
            malformed = onError(current, 'can\'t have coreferences');
          // one rdf:rest
          else if (quad.predicate.value === IRIs["a" /* default */].rdf.rest) {
            if (parent)
              malformed = onError(current, 'has incoming rdf:rest arcs');
            else
              parent = quad;
          }
          else {
            head = quad; // e.g. { :s :p (1 2) }
            headPos = 'object';
          }
        }

        // Store the list item and continue with parent
        if (!first)
          malformed = onError(current, 'has no list head');
        else
          items.unshift(first.object);
        current = parent && parent.subject;
      }

      // Don't remove any quads if the list is malformed
      if (malformed)
        remove = false;
      // Store the list under the value of its head
      else if (head)
        lists[head[headPos].value] = items;
    });

    // Remove list quads if requested
    if (remove)
      this.removeQuads(toRemove);
    return lists;
  }
}

// Determines whether the argument is a string
function isString(s) {
  return typeof s === 'string' || s instanceof String;
}

// CONCATENATED MODULE: ./node_modules/n3/src/N3StreamParser.js
// **N3StreamParser** parses a text stream into a quad stream.



// ## Constructor
class N3StreamParser_N3StreamParser extends readable_browser["Transform"] {
  constructor(options) {
    super({ decodeStrings: true });
    this._readableState.objectMode = true;

    // Set up parser with dummy stream to obtain `data` and `end` callbacks
    var self = this, parser = new N3Parser_N3Parser(options), onData, onEnd;
    parser.parse({
      on: function (event, callback) {
        switch (event) {
        case 'data': onData = callback; break;
        case 'end':   onEnd = callback; break;
        }
      },
    },
      // Handle quads by pushing them down the pipeline
      function (error, quad) { error && self.emit('error', error) || quad && self.push(quad); },
      // Emit prefixes through the `prefix` event
      function (prefix, uri) { self.emit('prefix', prefix, uri); }
    );

    // Implement Transform methods through parser callbacks
    this._transform = function (chunk, encoding, done) { onData(chunk); done(); };
    this._flush = function (done) { onEnd(); done(); };
  }

  // ### Parses a stream of strings
  import(stream) {
    var self = this;
    stream.on('data',  function (chunk) { self.write(chunk); });
    stream.on('end',   function ()      { self.end(); });
    stream.on('error', function (error) { self.emit('error', error); });
    return this;
  }
}

// CONCATENATED MODULE: ./node_modules/n3/src/N3StreamWriter.js
// **N3StreamWriter** serializes a quad stream into a text stream.



// ## Constructor
class N3StreamWriter_N3StreamWriter extends readable_browser["Transform"] {
  constructor(options) {
    super({ encoding: 'utf8' });
    this._writableState.objectMode = true;

    // Set up writer with a dummy stream object
    var self = this;
    var writer = this._writer = new N3Writer_N3Writer({
      write: function (quad, encoding, callback) { self.push(quad); callback && callback(); },
      end: function (callback) { self.push(null); callback && callback(); },
    }, options);

    // Implement Transform methods on top of writer
    this._transform = function (quad, encoding, done) { writer.addQuad(quad, done); };
    this._flush = function (done) { writer.end(done); };
  }

// ### Serializes a stream of quads
  import(stream) {
    var self = this;
    stream.on('data',   function (quad)  { self.write(quad); });
    stream.on('end',    function ()      { self.end(); });
    stream.on('error',  function (error) { self.emit('error', error); });
    stream.on('prefix', function (prefix, iri) { self._writer.addPrefix(prefix, iri); });
    return this;
  }
}

// CONCATENATED MODULE: ./node_modules/n3/src/index.js













/***/ })
/******/ ]);