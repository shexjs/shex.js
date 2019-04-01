(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shexParser = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
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

}).call(this,require('_process'))
},{"_process":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
'use strict';

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

},{}],7:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var parse = require('./parse');
var formats = require('./formats');

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

},{"./formats":6,"./parse":8,"./stringify":9}],8:[function(require,module,exports){
'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictNullHandling: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset);
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset);
            val = options.decoder(part.slice(pos + 1), defaults.decoder, charset);
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(val);
        }

        if (val && options.comma && val.indexOf(',') > -1) {
            val = val.split(',');
        }

        if (has.call(obj, key)) {
            obj[key] = utils.combine(obj[key], val);
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

        if (root === '[]' && options.parseArrays) {
            obj = [].concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (!options.parseArrays && cleanRoot === '') {
                obj = { 0: leaf };
            } else if (
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
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
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

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new Error('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    return {
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        depth: typeof opts.depth === 'number' ? opts.depth : defaults.depth,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

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

},{"./utils":10}],9:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var formats = require('./formats');
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) { // eslint-disable-line func-name-matching
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) { // eslint-disable-line func-name-matching
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) { // eslint-disable-line func-name-matching
        return prefix;
    }
};

var isArray = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    formatter: formats.formatters[formats['default']],
    // deprecated
    indices: false,
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
    encodeValuesOnly,
    charset
) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = obj.join(',');
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (isArray(filter)) {
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

        if (isArray(obj)) {
            pushToArray(values, stringify(
                obj[key],
                typeof generateArrayPrefix === 'function' ? generateArrayPrefix(prefix, key) : prefix,
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly,
                charset
            ));
        } else {
            pushToArray(values, stringify(
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
                encodeValuesOnly,
                charset
            ));
        }
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.encoder !== null && opts.encoder !== undefined && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (opts && opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if (opts && 'indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        pushToArray(keys, stringify(
            obj[key],
            key,
            generateArrayPrefix,
            options.strictNullHandling,
            options.skipNulls,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.formatter,
            options.encodeValuesOnly,
            options.charset
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};

},{"./formats":6,"./utils":10}],10:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
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
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
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

var decode = function (str, decoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var encode = function encode(str, defaultEncoder, charset) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = typeof str === 'string' ? str : String(str);

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

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

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    merge: merge
};

},{}],11:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var handle_qs_js_1 = require("then-request/lib/handle-qs.js");
var GenericResponse = require("http-response-object");
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

},{"http-response-object":2,"then-request/lib/handle-qs.js":12}],12:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var qs_1 = require("qs");
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

},{"qs":7}],13:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],14:[function(require,module,exports){
(function (process,global){
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
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
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

exports.isBuffer = require('./support/isBuffer');

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
exports.inherits = require('inherits');

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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":13,"_process":5,"inherits":3}],15:[function(require,module,exports){
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
    return {
      subject: externalTerm(triple.subject, factory),
      predicate: externalTerm(triple.predicate, factory),
      object: externalTerm(triple.object, factory)
    };
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
        return pref + node.substr(prefixes[pref].length);
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

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = RdfTerm; // node environment

},{}],16:[function(require,module,exports){
// **ShExUtil** provides ShEx utility functions

var ShExUtil = (function () {
var RdfTerm = require("./RdfTerm");
// var util = require('util');
const Hierarchy = require('hierarchy-closure')

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
                       ["prefixes", "base", "imports", "startActs", "start", "shapes", "productions"]);
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
        var ret = {}
        Object.keys(shapes).forEach(function (label) {
          ret[label] = _Visitor.visitShapeExpr(shapes[label], label);
        });
        return ret;
      },

      visitProductions: function (productions) {
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
        var r =
            expr.type === "Shape" ? this.visitShape(expr, label) :
            expr.type === "NodeConstraint" ? this.visitNodeConstraint(expr, label) :
            expr.type === "ShapeAnd" ? this.visitShapeAnd(expr, label) :
            expr.type === "ShapeOr" ? this.visitShapeOr(expr, label) :
            expr.type === "ShapeNot" ? this.visitShapeNot(expr, label) :
            expr.type === "ShapeRef" ? this.visitShapeRef(expr) :
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

      visitShapeRef: function (expr) {
        this._testUnknownAttributes(expr, ["reference"], "ShapeRef", this.visitShapeNot)
        return { type: "ShapeRef", reference: expr.reference };
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
        var r = expr.type === "TripleConstraint" ? this.visitTripleConstraint(expr) :
          expr.type === "OneOf" ? this.visitOneOf(expr) :
          expr.type === "EachOf" ? this.visitEachOf(expr) :
          expr.type === "Inclusion" ? this.visitInclusion(expr) :
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
        var ret = { type: "Inclusion" };
        _ShExUtil._expect(inclusion, "type", "Inclusion");

        this._maybeSet(inclusion, ret, "Inclusion",
                       ["include"]);
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
    r.visitBase = r.visitStart = r.visitVirtual = r.visitClosed = r._visitValue;
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

  ShExJVisitor: function (idMap) {
    var v = ShExUtil.Visitor();
    var oldVisitShapeExpr = v.visitShapeExpr,
        oldVisitShape = v.visitShape,
        oldVisitExpression = v.visitExpression;

    v.visitShapeExpr = v.visitValueExpr = function (expr, label) {
      var ret =
          (typeof expr === "string") ?
          { type: "ShapeRef", reference: expr } :
          oldVisitShapeExpr.call(this, expr, label);
      return ret;
    };

    v.visitShape = function (shape, label) {
      var ret =
        oldVisitShape.call(this, shape, label);
      if ("extra" in shape)
        ret.extra.sort();
      return ret;
    };

    v.visitExpression = function (expr) {
      var ret =
          (typeof expr === "string") ?
          { type: "Inclusion", include: expr } :
          oldVisitExpression.call(this, expr);
      if (typeof expr === "object" && "id" in expr)
        idMap[expr.id] = ret;
      return ret;
    };
    return v;
  },


  // tests
  // console.warn("HERE:", ShExJtoAS({"type":"Schema","shapes":[{"id":"http://all.example/S1","type":"Shape","expression":
  //  { "id":"http://all.example/S1e", "type":"EachOf","expressions":[ ] },
  // // { "id":"http://all.example/S1e","type":"TripleConstraint","predicate":"http://all.example/p1"},
  // "extra":["http://all.example/p3","http://all.example/p1","http://all.example/p2"]
  // }]}).shapes['http://all.example/S1']);

  ShExJtoAS: function (schema) {
    var _ShExUtil = this;
    delete schema["@context"];
    var newProductions = {};
    if ("start" in schema) {
      var v = _ShExUtil.ShExJVisitor(newProductions);
      schema.start = v.visitShapeExpr(schema.start);
    }
    if ("shapes" in schema) {
      var newShapes = {}
      schema.shapes.forEach(sh => {
        var key = sh.id;
        delete sh.id;
        var v = _ShExUtil.ShExJVisitor(newProductions);
        newShapes[key] = v.visitShapeExpr(sh);
      });
      schema.shapes = newShapes;
    }
    if (Object.keys(newProductions).length > 0) // should they always be present?
      schema.productions = newProductions;
    return schema;
  },

  AStoShExJ: function (schema, abbreviate) {
    if (!abbreviate) {
      delete schema.prefixes;
      delete schema.base;
    }
    delete schema.productions;
    schema["@context"] = "http://www.w3.org/ns/shex.jsonld";

    var v = ShExUtil.Visitor();
    // change { "type": "ShapeRef", "reference": X } to X
    v.visitShapeRef = function (inclusion) { return inclusion.reference; };
    // change { "type": "Inclusion", "include": X } to X
    v.visitInclusion = function (inclusion) { return inclusion.include; };

    if ("start" in schema)
      schema.start = v.visitShapeExpr(schema.start);

    if ("shapes" in schema) {
      var newShapes = []
      for (var key in schema.shapes) {
        newShapes.push(Object.assign(
          {id: key},
          v.visitShapeExpr(schema.shapes[key])
        ));
      };
      schema.shapes = newShapes;
    }

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

  /* canonicalize: move all tripleExpression references to their first expression.
   *
   */
  canonicalize: function (schema, trimIRI) {
    var ret = JSON.parse(JSON.stringify(schema));
    delete ret.prefixes;
    delete ret.base;
    // Don't delete ret.productions as it's part of the AS.
    var v = ShExUtil.Visitor();
    var knownExpressions = [];
    var oldVisitInclusion = v.visitInclusion, oldVisitExpression = v.visitExpression;
    v.visitInclusion = function (inclusion) {
      if (knownExpressions.indexOf(inclusion.include) === -1 &&
          "productions" in schema &&
          inclusion.include in schema.productions) {
        knownExpressions.push(inclusion.include)
        return oldVisitExpression.call(v, schema.productions[inclusion.include]);
      }
      return oldVisitInclusion.call(v, inclusion);
    };
    v.visitExpression = function (expression) {
      if ("id" in expression) {
        if (knownExpressions.indexOf(expression.id) === -1) {
          knownExpressions.push(expression.id)
          return oldVisitExpression.call(v, schema.productions[expression.id]);
        }
        return { type: "Inclusion", include: expression.id};
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
      Object.keys(ret.shapes).sort().forEach(k => {
        if ("extra" in ret.shapes[k])
          ret.shapes[k].extra.sort();
        ret.shapes[k] = v.visitShapeExpr(ret.shapes[k]);
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
    if (!('no' in options)) { options.no = false }

    let shapeLabels = Object.keys(schema.shapes || [])
    let shapeReferences = {}
    shapeLabels.forEach(label => {
      let shape = schema.shapes[label]
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
        && _ShExUtil.skipDecl(schema.shapes[label]).type === 'Shape' // Don't nest e.g. valuesets for now
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
        let shapeExpr = schema.shapes[oldName]
        let newName = options.transform(oldName, shapeExpr)
        oldToNew[oldName] = newName
        shapeLabels[shapeLabels.indexOf(oldName)] = newName
        nestables[newName] = nestables[oldName]
        nestables[newName].was = oldName
        delete nestables[oldName]
        schema.shapes[newName] = schema.shapes[oldName]
        delete schema.shapes[oldName]
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
      shapeLabels.forEach(label => shapesCopy[label] = schema.shapes[label])
      schema.shapes = shapesCopy
      } else {
        Object.keys(nestables).forEach(oldName => {
          shapeReferences[oldName][0].tc.valueExpr = schema.shapes[oldName].shapeExpr
          delete schema.shapes[oldName]
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
    Object.keys(schema.shapes || []).forEach(function (label) {
      function _walkShapeExpression (shapeExpr, negated) {
        if (shapeExpr.type === "ShapeOr" || shapeExpr.type === "ShapeAnd") {
          shapeExpr.shapeExprs.forEach(function (expr) {
            _walkShapeExpression(expr, negated);
          });
        } else if (shapeExpr.type === "ShapeNot") {
          _walkShapeExpression(shapeExpr.shapeExpr, negated ^ 1); // !!! test negation
        } else if (shapeExpr.type === "Shape") {
          _walkShape(shapeExpr, negated);
        } else if (shapeExpr.type === "NodeConstraint") {
          // no impact on dependencies
        } else if (shapeExpr.type === "ShapeRef") {
          ret.add(label, shapeExpr.reference);
        } else if (shapeExpr.type === "ShapeExternal") {
        } else
          throw Error("expected Shape{And,Or,Ref,External} or NodeConstraint in " + util.inspect(shapeExpr));
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
            if (negated && ret.inCycle.indexOf(label) !== -1) // illDefined/negatedRefCycle.err
              throw Error("Structural error: " + label + " appears in negated cycle");
          }

          if ("id" in tripleExpr)
            ret.addIn(tripleExpr.id, label)
          if (tripleExpr.type === "TripleConstraint") {
            _walkTripleConstraint(tripleExpr, negated);
          } else if (tripleExpr.type === "OneOf" || tripleExpr.type === "EachOf") {
            _exprGroup(tripleExpr.expressions);
          } else if (tripleExpr.type === "Inclusion") {
            ret.add(label, tripleExpr.include);
          } else
            throw Error("expected {TripleConstraint,OneOf,EachOf,Inclusion} in " + tripleExpr);
        }

        if (shape.inherit && shape.inherit.length > 0)
          shape.inherit.forEach(function (i) {
            ret.add(label, i);
          });
        if (shape.expression)
          _walkTripleExpression(shape.expression, negated);
      }
      _walkShapeExpression(schema.shapes[label], 0); // 0 means false for bitwise XOR
    });
    return ret;
  },

  /** partition: create subset of a schema with only desired shapes and
   * their dependencies.
   *
   * @schema: input schema
   * @partition: shape name or array of desired shape names
   * @deps: (optional) dependency tree from getDependencies.
   */
  partition: function (schema, includes, deps, cantFind) {
    includes = includes instanceof Array ? includes : [includes];
    deps = deps || this.getDependencies(schema);
    cantFind = cantFind || function (what, why) {
      throw new Error("Error: can't find shape "+
                      (why ?
                       why + " dependency " + what :
                       what));
    };
    var partition = {};
    for (var k in schema)
      partition[k] = k === "shapes" ? {} : schema[k];
    includes.forEach(function (i) {
      if (i in schema.shapes) {
        partition.shapes[i] = schema.shapes[i];
        if (i in deps.needs)
          deps.needs[i].forEach(function (n) {
            if (n in schema.shapes)
              partition.shapes[n] = schema.shapes[n];
            else if (n in schema.productions) {
              var s = deps.foundIn[n]
              partition.shapes[s] = schema.shapes[s];
              partition.productions[n] = schema.productions[n];
            } else
              cantFind(n, i);
          });
      } else {
        cantFind(i);
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

    function copy (attr) {
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

    // productions
    if ("productions" in left)
      ret.productions = left.productions;
    if ("productions" in right)
      if (!("productions" in left) || overwrite)
        ret.productions = right.productions;

    // base
    if ("base" in left)
      ret.base = left.base;
    if ("base" in right)
      if (!("base" in left) || overwrite)
        ret.base = right.base;

    copy("prefixes");

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

    // shapes
    Object.keys(left.shapes || {}).forEach(function (key) {
      if (!("shapes" in ret))
        ret.shapes = {};
      ret.shapes[key] = left.shapes[key];
    });
    Object.keys(right.shapes || {}).forEach(function (key) {
      if (!("shapes"  in left) || !(key in left.shapes) || overwrite) {
        if (!("shapes" in ret))
          ret.shapes = {};
        ret.shapes[key] = right.shapes[key];
      }
    });

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
      if (!(shapeRef.reference in schema.shapes))
        throw Error("Structural error: reference to " + JSON.stringify(shapeRef) + " not found in schema shape expressions:\n" + dumpKeys(schema.shapes) + ".");
      if (!inTE && shapeRef.reference === currentLabel)
        throw Error("Structural error: circular reference to " + currentLabel + ".");
      (currentNegated ? negativeDeps : positiveDeps).add(currentLabel, shapeRef.reference)
      return oldVisitShapeRef.call(visitor, shapeRef);
    }

    var oldVisitInclusion = visitor.visitInclusion;
    visitor.visitInclusion = function (inclusion) {
      var refd;
      if (!("productions" in schema) || !(refd = schema.productions[inclusion.include]))
        throw Error("Structural error: included shape " + inclusion.include + " not found in schema triple expressions:\n" + dumpKeys(schema.productions) + ".");
      // if (refd.type !== "Shape")
      //   throw Error("Structural error: " + inclusion.include + " is not a simple shape.");
      return oldVisitInclusion.call(visitor, inclusion);
    };

    Object.keys(schema.shapes || []).forEach(function (label) {
      currentLabel = label;
      visitor.visitShapeExpr(schema.shapes[label], label);
    });
    let circs = Object.keys(negativeDeps.children).filter(
      k => negativeDeps.children[k].filter(
        k2 => k2 in negativeDeps.children && negativeDeps.children[k2].indexOf(k) !== -1
          || k2 in positiveDeps.children && positiveDeps.children[k2].indexOf(k) !== -1
      ).length > 0
    );
    if (circs.length)
      throw Error("Structural error: circular negative dependencies on " + circs.join(',') + ".");

    function dumpKeys (obj) {
      return obj ? Object.keys(obj).map(
        u => u.substr(0, 2) === '_:' ? u : '<' + u + '>'
      ).join("\n        ") : '- none defined -'
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
      return _ShExUtil.walkVal(val.solution, cb);
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
      var w = require("../lib/ShExWriter")();
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
    if (require('sync-request')) {
      var request = require('sync-request');
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
      return  {
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
      get size() { return undefined; }
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
  }

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

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExUtil; // node environment

},{"../lib/ShExWriter":18,"./RdfTerm":15,"hierarchy-closure":21,"sync-request":11}],17:[function(require,module,exports){
(function (process){
/* ShExValidator - javascript module to validate a graph with respect to Shape Expressions
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

var RdfTerm = require("./RdfTerm");

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
  var regexModule = this.options.regexModule || require("../lib/regex/threaded-val-nerr");

  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  this.getAST = function () {
    return {
      type: "AST",
      shapes: Object.keys(this.schema.shapes).reduce(function (ret, label) {
        ret[label] = {
          type: "ASTshape",
          expression: _compileShapeToAST(_ShExValidator.schema.shapes[label].expression, [], _ShExValidator.schema)
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
      if (expr.type === "TripleConstraint")
        tripleConstraints.push(expr)-1;

      else if (expr.type === "OneOf" || expr.type === "EachOf")
        expr.expressions.forEach(function (nested) {
          indexTripleConstraints_dive(nested);
        });

      else if (expr.type === "Inclusion")
        indexTripleConstraints_dive(schema.productions[expr.include]);

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
        var res = this.validate(db, pair.node, pair.shape, tracker, seen);
        return "errors" in res ?
          { passes: ret.passes, failures: ret.failures.concat(res) } :
          { passes: ret.passes.concat(res), failures: ret.failures } ;
      }, {passes: [], failures: []});
      if (false && this.options.results === "api") {
        var ret = {};
        function _add (n, s, r) {
          if (!(n in ret)) {
            ret[n] = [{shape: s, result: r}];
            return;
          }
          if (ret[n].filter(p => { return p.shape === s; }))
            return;
          ret[n].push({shape: s, results: r});
        }
        results.passes.forEach(p => { _add(p.node, p.shape, true); });
        results.failures.forEach(p => { _add(p.node, p.shape, false); });
        return ret;
      }
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
    } else if (label in this.schema.shapes) {
      shape = schema.shapes[label]
    } else {
      runtimeError("shape " + label + " not found in:\n" + Object.keys(this.schema.shapes || []).map(s => "  " + s).join("\n"));
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
    if (shapeExpr.type === "NodeConstraint") {
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
      return this._validateShape(db, point, regexModule.compile(schema, shapeExpr),
                                 shapeExpr, shapeLabel, tracker, seen);
    } else if (shapeExpr.type === "ShapeRef") {
      return this._validateShapeExpr(db, point, schema.shapes[shapeExpr.reference], shapeExpr.reference, tracker, seen);
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
      for (var i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        var nested = shapeExpr.shapeExprs[i];
        var sub = this._validateShapeExpr(db, point, nested, shapeLabel, tracker, seen);
        if ("errors" in sub)
          return { type: "ShapeAndFailure", errors: [sub] };
        else
          passes.push(sub);
      }
      return { type: "ShapeAndResults", solutions: passes };
    } else
      throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
  }

  this._validateShape = function (db, point, regexEngine, shape, shapeLabel, tracker, seen) {
    var _ShExValidator = this;

    var ret = null;
    var startAcionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in schema && !this.semActHandler.dispatchAll(schema.startActs, null, startAcionStorage))
      return {
        type: "Failure",
        node: ldify(point),
        shape: shapeLabel,
        errors: ['semact failure']
      }; // some semAct aborted !! return real error
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
    while (misses.length === 0 && xp.next() && ret === null) {
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
      if (false) {// testing parity between two engines
        var nfa = require("../lib/regex/nfax-val-1err").compile(schema, shape);
        var fromNFA = nfa.match(db, point, constraintList, _constraintToTriples(), tripleToConstraintMapping, neighborhood, _recurse, this.semActHandler, _testExpr, null);
        if ("errors" in fromNFA !== "errors" in results)
          { throw Error(JSON.stringify(results) + " vs " + JSON.stringify(fromNFA)); }
      }
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
      // @@ add to tracker: f("final " + usedTriples.join(" "));

      ret = possibleRet;
      // alts.push(tripleToConstraintMapping);
    }
    if (ret === null/* !! && this.options.diagnose */) {
      var missErrors = misses.map(function (miss) {
        var t = neighborhood[miss.tripleNo];
        return {
          type: "TypeMismatch",
          triple: {type: "TestedTriple", subject: t.subject, predicate: t.predicate, object: ldify(t.object)},
          constraint: constraintList[miss.constraintNo],
          errors: miss.errors
        };
      });
      ret = {
        type: "Failure",
        node: ldify(point),
        shape: shapeLabel,
        errors: missErrors.concat(partitionErrors.length === 1 ? partitionErrors[0].errors : partitionErrors) 
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
    if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return direct === undefined ? [] : direct(value, valueExpr);
    } else if (valueExpr.type === "ShapeRef") {
      return recurse ? recurse(value, valueExpr.reference) : [];
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
    if (false) {
      // wildcard -- ignore
    } else {
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
        if (ret && semAct.name in _semActHanlder.handlers) {
          var code = "code" in semAct ? semAct.code : _ShExValidator.options.semActs[semAct.name];
          var existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
          var extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
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

    if (expr.type === "TripleConstraint") {
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

    else if (expr.type === "Inclusion") {
      var included = schema.shapes[expr.include].expression;
      return _compileExpression(included, schema);
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
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShExValidator;

}).call(this,require('_process'))
},{"../lib/regex/nfax-val-1err":19,"../lib/regex/threaded-val-nerr":20,"./RdfTerm":15,"_process":5}],18:[function(require,module,exports){
// **ShExWriter** writes ShEx documents.

var ShExWriter = (function () {
var util = require('util');
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
      Object.keys(schema.shapes).forEach(function (label) {
        _ShExWriter._write(
          _ShExWriter._encodeShapeName(label, false) +
            " " +
            _ShExWriter._writeShapeExpr(schema.shapes[label], done, true, 0).join("")+"\n",
          done
        );
      })
  },

  _writeShapeExpr: function (shapeExpr, done, forceBraces, parentPrec) {
    var _ShExWriter = this;
    var pieces = [];
    if (shapeExpr.type === "ShapeRef")
      pieces.push("@", _ShExWriter._encodeShapeName(shapeExpr.reference));
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

        else if (expr.type === "Inclusion") {
          pieces.push("&");
          pieces.push(_ShExWriter._encodeShapeName(expr.include, false));
        }

        else throw Error("unexpected expr type: " + expr.type);
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
if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExWriter; // node environment

},{"util":14}],19:[function(require,module,exports){
var NFAXVal1Err = (function () {
  var RdfTerm = require("../RdfTerm");

  var Split = "<span class='keyword' title='Split'>|</span>";
  var Rept  = "<span class='keyword' title='Repeat'>×</span>";
  var Match = "<span class='keyword' title='Match'>␃</span>";
  /* compileNFA - compile regular expression and index triple constraints
   */
  var UNBOUNDED = -1;

  function compileNFA (schema, shape) {
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
          var included = schema.productions[expr.include];
          return walkExpr(included, stack);
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
          var valueExpr = extend({}, c.valueExpr);
          if ("reference" in valueExpr) {
            var ref = valueExpr.reference;
            if (RdfTerm.isBlank(ref))
              valueExpr.reference = schema.shapes[ref];
          }
          return extend({
            type: state.c.negated ? "NegatedProperty" :
              t.state === rbenx.end ? "ExcessTripleViolation" :
              "MissingProperty",
            property: state.c.predicate
          }, Object.keys(valueExpr).length > 0 ? { valueExpr: valueExpr } : {});
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
              if (!semActHandler.dispatchAll(m.stack[mis].c.semActs, "???", ptr))
                throw { type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] };
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
          if ("valueExpr" in ptr)
            errors = errors.concat(checkValueExpr(ptr.inverse ? triple.subject : triple.object, ptr.valueExpr, diveRecurse, diveDirect));

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

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = NFAXVal1Err;

},{"../RdfTerm":15}],20:[function(require,module,exports){
var ThreadedValNErr = (function () {
var RdfTerm = require("../RdfTerm");
var UNBOUNDED = -1;

function vpEngine (schema, shape) {
    var outerExpression = shape.expression;
    return {
      match:match
    };

    function match (graph, node, constraintList, constraintToTripleMapping, tripleToConstraintMapping, neighborhood, recurse, direct, semActHandler, checkValueExpr, trace) {

      /*
       * returns: list of passing or failing threads (no heterogeneous lists)
       */
      function validateExpr (expr, thread) {
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
              if (semActHandler.dispatchAll(expr.semActs, "???", newThread)) {
                passes.push(newThread)
              } else {
                newThread.errors.push({ type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] });
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
            var valueExpr = extend({}, expr.valueExpr);
            if ("reference" in valueExpr) {
              var ref = valueExpr.reference;
              if (RdfTerm.isBlank(ref))
                valueExpr.reference = schema.shapes[ref];
            }
            ret.push({
              avail: thread.avail,
              errors: thread.errors.concat([
                extend({
                  type: negated ? "NegatedProperty" : "MissingProperty",
                  property: expr.predicate
                }, Object.keys(valueExpr).length > 0 ? { valueExpr: valueExpr } : {})
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

        else if (expr.type === "Inclusion") {
          var included = schema.productions[expr.include];
          return validateExpr(included, thread);
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
            var subErrors = "valueExpr" in expr ?
                checkValueExpr(expr.inverse ? t.subject : t.object, expr.valueExpr, diveRecurse, diveDirect) :
                [];
            if (subErrors.length === 0 && "semActs" in expr &&
                !semActHandler.dispatchAll(expr.semActs, t, ret))
              subErrors.push({ type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] }) // some semAct aborted
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

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ThreadedValNErr;

},{"../RdfTerm":15}],21:[function(require,module,exports){
var HierarchyClosure = (function () {
  /**
   * @@ should be its own package
   */
  function makeHierarchy () {
    let roots = {}
    let parents = {}
    let children = {}
    let holders = {}
    return {
      add: function (parent, child) {
        if (parent in children && children[parent].indexOf(child) !== -1) {
          // already seen
          return
        }
        let target = parent in holders
          ? getNode(parent)
          : (roots[parent] = getNode(parent)) // add new parents to roots.
        let value = getNode(child)

        target[child] = value
        if (child in roots) {
          delete roots[child]
        }

        // // maintain hierarchy (direct and confusing)
        // children[parent] = children[parent].concat(child, children[child])
        // children[child].forEach(c => parents[c] = parents[c].concat(parent, parents[parent]))
        // parents[child] = parents[child].concat(parent, parents[parent])
        // parents[parent].forEach(p => children[p] = children[p].concat(child, children[child]))

        // maintain hierarchy (generic and confusing)
        updateClosure(children, parents, child, parent)
        updateClosure(parents, children, parent, child)
        function updateClosure (container, members, near, far) {
          container[far] = container[far].concat(near, container[near])
          container[near].forEach(
            n => (members[n] = members[n].concat(far, members[far]))
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

  function walkHierarchy (n, f, p) {
    return Object.keys(n).reduce((ret, k) => {
      return ret.concat(
        walkHierarchy(n[k], f, k),
        p ? f(k, p) : []) // outer invocation can have null parent
    }, [])
  }

  return { create: makeHierarchy, walk: walkHierarchy }
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  module.exports = HierarchyClosure
}

},{}],22:[function(require,module,exports){
var ShExCore = {
  RdfTerm:    require('./lib/RdfTerm'),
  Util:         require('./lib/ShExUtil'),
  Validator:    require('./lib/ShExValidator'),
  Writer:    require('./lib/ShExWriter'),
  'nfax-val-1err':     require('./lib/regex/nfax-val-1err'),
  'threaded-val-nerr': require('./lib/regex/threaded-val-nerr')
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExCore;


},{"./lib/RdfTerm":15,"./lib/ShExUtil":16,"./lib/ShExValidator":17,"./lib/ShExWriter":18,"./lib/regex/nfax-val-1err":19,"./lib/regex/threaded-val-nerr":20}],23:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.16 */
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
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[7,18,19,20,21,23,26,189,211,212],$V1=[1,25],$V2=[1,29],$V3=[1,24],$V4=[1,28],$V5=[1,27],$V6=[2,12],$V7=[2,13],$V8=[2,14],$V9=[7,18,19,20,21,23,26,211,212],$Va=[1,35],$Vb=[1,38],$Vc=[1,37],$Vd=[2,18],$Ve=[2,19],$Vf=[19,21,65,67,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,121,123,157,185,211,215],$Vg=[2,57],$Vh=[1,47],$Vi=[1,48],$Vj=[1,49],$Vk=[19,21,35,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,121,123,157,185,211,215],$Vl=[2,234],$Vm=[2,235],$Vn=[1,51],$Vo=[1,54],$Vp=[1,53],$Vq=[2,256],$Vr=[2,257],$Vs=[2,260],$Vt=[2,258],$Vu=[2,259],$Vv=[2,15],$Vw=[2,17],$Vx=[19,21,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,121,123,157,185,211,215],$Vy=[1,72],$Vz=[2,26],$VA=[2,27],$VB=[2,28],$VC=[115,121,123,185,215],$VD=[2,135],$VE=[1,98],$VF=[1,106],$VG=[1,84],$VH=[1,89],$VI=[1,90],$VJ=[1,91],$VK=[1,97],$VL=[1,102],$VM=[1,103],$VN=[1,104],$VO=[1,107],$VP=[1,108],$VQ=[1,109],$VR=[1,110],$VS=[1,111],$VT=[1,112],$VU=[1,94],$VV=[1,105],$VW=[2,58],$VX=[1,114],$VY=[1,115],$VZ=[1,116],$V_=[1,122],$V$=[1,123],$V01=[47,49],$V11=[2,87],$V21=[2,88],$V31=[189,191],$V41=[1,138],$V51=[1,141],$V61=[1,140],$V71=[2,16],$V81=[7,18,19,20,21,23,26,47,211,212],$V91=[2,43],$Va1=[7,18,19,20,21,23,26,47,49,211,212],$Vb1=[2,50],$Vc1=[2,32],$Vd1=[2,65],$Ve1=[2,70],$Vf1=[2,67],$Vg1=[1,175],$Vh1=[1,176],$Vi1=[1,177],$Vj1=[1,180],$Vk1=[1,183],$Vl1=[2,73],$Vm1=[7,18,19,20,21,23,26,47,49,75,76,77,115,121,123,185,186,189,211,212,215],$Vn1=[2,91],$Vo1=[7,18,19,20,21,23,26,47,49,186,189,211,212],$Vp1=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,186,189,211,212],$Vq1=[7,18,19,20,21,23,26,47,49,75,76,77,97,98,99,100,115,121,123,185,186,189,211,212,215],$Vr1=[2,104],$Vs1=[2,103],$Vt1=[7,18,19,20,21,23,26,47,49,97,98,99,100,108,109,110,111,112,113,186,189,211,212],$Vu1=[2,98],$Vv1=[2,97],$Vw1=[1,198],$Vx1=[1,200],$Vy1=[1,202],$Vz1=[1,201],$VA1=[2,108],$VB1=[2,109],$VC1=[2,110],$VD1=[2,106],$VE1=[2,233],$VF1=[19,21,67,77,96,104,105,159,181,200,201,202,203,204,205,206,207,208,209,211],$VG1=[2,179],$VH1=[7,18,19,20,21,23,26,47,49,108,109,110,111,112,113,186,189,211,212],$VI1=[2,100],$VJ1=[2,114],$VK1=[1,210],$VL1=[1,211],$VM1=[1,212],$VN1=[1,213],$VO1=[96,104,105,202,203,204,205],$VP1=[2,31],$VQ1=[2,35],$VR1=[2,38],$VS1=[2,41],$VT1=[2,89],$VU1=[2,225],$VV1=[2,226],$VW1=[2,227],$VX1=[1,261],$VY1=[1,266],$VZ1=[1,247],$V_1=[1,252],$V$1=[1,253],$V02=[1,254],$V12=[1,260],$V22=[1,257],$V32=[1,265],$V42=[1,268],$V52=[1,269],$V62=[1,270],$V72=[1,276],$V82=[1,277],$V92=[2,20],$Va2=[2,49],$Vb2=[2,56],$Vc2=[2,61],$Vd2=[2,64],$Ve2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,211,212],$Vf2=[2,83],$Vg2=[2,84],$Vh2=[2,29],$Vi2=[2,33],$Vj2=[2,69],$Vk2=[2,66],$Vl2=[2,71],$Vm2=[2,68],$Vn2=[7,18,19,20,21,23,26,47,49,97,98,99,100,186,189,211,212],$Vo2=[1,322],$Vp2=[1,330],$Vq2=[1,331],$Vr2=[1,332],$Vs2=[1,338],$Vt2=[1,339],$Vu2=[7,18,19,20,21,23,26,47,49,75,76,77,115,121,123,185,189,211,212,215],$Vv2=[2,223],$Vw2=[7,18,19,20,21,23,26,47,49,189,211,212],$Vx2=[1,347],$Vy2=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,189,211,212],$Vz2=[2,102],$VA2=[2,107],$VB2=[2,94],$VC2=[1,357],$VD2=[2,95],$VE2=[2,96],$VF2=[2,101],$VG2=[19,21,65,156,195,211],$VH2=[2,163],$VI2=[2,137],$VJ2=[1,372],$VK2=[1,371],$VL2=[1,377],$VM2=[1,381],$VN2=[1,380],$VO2=[1,379],$VP2=[1,386],$VQ2=[1,389],$VR2=[1,385],$VS2=[1,388],$VT2=[19,21,211,212],$VU2=[1,400],$VV2=[1,406],$VW2=[1,395],$VX2=[1,399],$VY2=[1,409],$VZ2=[1,410],$V_2=[1,411],$V$2=[1,398],$V03=[1,412],$V13=[1,413],$V23=[1,418],$V33=[1,419],$V43=[1,420],$V53=[1,421],$V63=[1,414],$V73=[1,415],$V83=[1,416],$V93=[1,417],$Va3=[1,405],$Vb3=[2,113],$Vc3=[2,118],$Vd3=[2,120],$Ve3=[2,121],$Vf3=[2,122],$Vg3=[2,248],$Vh3=[2,249],$Vi3=[2,250],$Vj3=[2,251],$Vk3=[2,119],$Vl3=[2,30],$Vm3=[2,39],$Vn3=[2,36],$Vo3=[2,42],$Vp3=[2,37],$Vq3=[1,453],$Vr3=[2,40],$Vs3=[1,489],$Vt3=[1,522],$Vu3=[1,523],$Vv3=[1,524],$Vw3=[1,527],$Vx3=[2,44],$Vy3=[2,51],$Vz3=[2,60],$VA3=[2,62],$VB3=[2,72],$VC3=[47,49,66],$VD3=[1,587],$VE3=[47,49,66,75,76,77,115,121,123,185,186,189,215],$VF3=[47,49,66,186,189],$VG3=[47,49,66,92,93,94,97,98,99,100,186,189],$VH3=[47,49,66,75,76,77,97,98,99,100,115,121,123,185,186,189,215],$VI3=[47,49,66,97,98,99,100,108,109,110,111,112,113,186,189],$VJ3=[47,49,66,108,109,110,111,112,113,186,189],$VK3=[47,66],$VL3=[7,18,19,20,21,23,26,47,49,75,76,77,115,121,123,185,211,212,215],$VM3=[2,93],$VN3=[2,92],$VO3=[2,222],$VP3=[1,629],$VQ3=[1,632],$VR3=[1,628],$VS3=[1,631],$VT3=[2,90],$VU3=[2,130],$VV3=[2,105],$VW3=[2,99],$VX3=[2,111],$VY3=[2,112],$VZ3=[2,142],$V_3=[2,143],$V$3=[1,649],$V04=[2,144],$V14=[117,131],$V24=[2,149],$V34=[2,150],$V44=[2,152],$V54=[1,652],$V64=[1,653],$V74=[19,21,195,211],$V84=[2,171],$V94=[1,661],$Va4=[117,131,136,137],$Vb4=[2,161],$Vc4=[19,21,115,121,123,185,211,212,215],$Vd4=[19,21,115,121,123,185,195,211,215],$Ve4=[2,231],$Vf4=[2,232],$Vg4=[2,178],$Vh4=[1,696],$Vi4=[19,21,67,77,96,104,105,159,174,181,200,201,202,203,204,205,206,207,208,209,211],$Vj4=[2,228],$Vk4=[2,229],$Vl4=[2,230],$Vm4=[2,241],$Vn4=[2,244],$Vo4=[2,238],$Vp4=[2,239],$Vq4=[2,240],$Vr4=[2,246],$Vs4=[2,247],$Vt4=[2,252],$Vu4=[2,253],$Vv4=[2,254],$Vw4=[2,255],$Vx4=[19,21,67,77,96,104,105,107,159,174,181,200,201,202,203,204,205,206,207,208,209,211],$Vy4=[1,728],$Vz4=[1,775],$VA4=[1,830],$VB4=[1,840],$VC4=[1,876],$VD4=[1,912],$VE4=[2,63],$VF4=[47,49,66,97,98,99,100,186,189],$VG4=[47,49,66,75,76,77,115,121,123,185,189,215],$VH4=[47,49,66,189],$VI4=[1,934],$VJ4=[47,49,66,92,93,94,97,98,99,100,189],$VK4=[1,944],$VL4=[1,981],$VM4=[1,1017],$VN4=[2,224],$VO4=[1,1028],$VP4=[1,1034],$VQ4=[1,1033],$VR4=[19,21,96,104,105,200,201,202,203,204,205,206,207,208,209,211],$VS4=[1,1054],$VT4=[1,1060],$VU4=[1,1059],$VV4=[1,1080],$VW4=[1,1086],$VX4=[1,1085],$VY4=[2,131],$VZ4=[2,145],$V_4=[2,147],$V$4=[2,151],$V05=[2,153],$V15=[2,154],$V25=[2,158],$V35=[2,160],$V45=[2,165],$V55=[2,166],$V65=[1,1112],$V75=[1,1115],$V85=[1,1111],$V95=[1,1114],$Va5=[1,1125],$Vb5=[2,218],$Vc5=[2,236],$Vd5=[2,237],$Ve5=[1,1127],$Vf5=[1,1129],$Vg5=[1,1131],$Vh5=[19,21,67,77,96,104,105,159,175,181,200,201,202,203,204,205,206,207,208,209,211],$Vi5=[1,1135],$Vj5=[1,1141],$Vk5=[1,1144],$Vl5=[1,1145],$Vm5=[1,1146],$Vn5=[1,1134],$Vo5=[1,1147],$Vp5=[1,1148],$Vq5=[1,1153],$Vr5=[1,1154],$Vs5=[1,1155],$Vt5=[1,1156],$Vu5=[1,1149],$Vv5=[1,1150],$Vw5=[1,1151],$Vx5=[1,1152],$Vy5=[1,1140],$Vz5=[2,242],$VA5=[2,245],$VB5=[2,123],$VC5=[1,1186],$VD5=[1,1192],$VE5=[1,1224],$VF5=[1,1230],$VG5=[1,1289],$VH5=[1,1336],$VI5=[47,49,66,75,76,77,115,121,123,185,215],$VJ5=[47,49,66,92,93,94,97,98,99,100],$VK5=[1,1412],$VL5=[1,1459],$VM5=[2,219],$VN5=[2,220],$VO5=[2,221],$VP5=[7,18,19,20,21,23,26,47,49,75,76,77,107,115,121,123,185,186,189,211,212,215],$VQ5=[7,18,19,20,21,23,26,47,49,107,186,189,211,212],$VR5=[7,18,19,20,21,23,26,47,49,92,93,94,97,98,99,100,107,186,189,211,212],$VS5=[2,148],$VT5=[2,146],$VU5=[2,155],$VV5=[2,159],$VW5=[2,156],$VX5=[2,157],$VY5=[19,21,39,65,67,75,76,77,81,92,93,94,97,98,99,100,108,109,110,111,112,113,115,121,123,157,185,211,215],$VZ5=[1,1519],$V_5=[66,131],$V$5=[1,1522],$V06=[1,1523],$V16=[66,131,136,137],$V26=[2,201],$V36=[1,1539],$V46=[19,21,67,77,96,104,105,159,174,175,181,200,201,202,203,204,205,206,207,208,209,211],$V56=[19,21,67,77,96,104,105,107,159,174,175,181,200,201,202,203,204,205,206,207,208,209,211],$V66=[2,243],$V76=[1,1577],$V86=[1,1643],$V96=[1,1649],$Va6=[1,1648],$Vb6=[1,1669],$Vc6=[1,1675],$Vd6=[1,1674],$Ve6=[1,1695],$Vf6=[1,1701],$Vg6=[1,1700],$Vh6=[1,1742],$Vi6=[1,1748],$Vj6=[1,1780],$Vk6=[1,1786],$Vl6=[1,1801],$Vm6=[1,1807],$Vn6=[1,1806],$Vo6=[1,1827],$Vp6=[1,1833],$Vq6=[1,1832],$Vr6=[1,1853],$Vs6=[1,1859],$Vt6=[1,1858],$Vu6=[1,1900],$Vv6=[1,1906],$Vw6=[1,1938],$Vx6=[1,1944],$Vy6=[117,131,136,137,186,189],$Vz6=[2,168],$VA6=[1,1962],$VB6=[1,1963],$VC6=[1,1964],$VD6=[1,1965],$VE6=[117,131,136,137,152,153,154,155,186,189],$VF6=[2,34],$VG6=[47,117,131,136,137,152,153,154,155,186,189],$VH6=[2,47],$VI6=[47,49,117,131,136,137,152,153,154,155,186,189],$VJ6=[2,54],$VK6=[1,1994],$VL6=[1,2031],$VM6=[1,2064],$VN6=[1,2070],$VO6=[1,2069],$VP6=[1,2090],$VQ6=[1,2096],$VR6=[1,2095],$VS6=[1,2117],$VT6=[1,2123],$VU6=[1,2122],$VV6=[1,2144],$VW6=[1,2150],$VX6=[1,2149],$VY6=[1,2170],$VZ6=[1,2176],$V_6=[1,2175],$V$6=[1,2197],$V07=[1,2203],$V17=[1,2202],$V27=[1,2272],$V37=[47,49,66,75,76,77,107,115,121,123,185,186,189,215],$V47=[47,49,66,107,186,189],$V57=[47,49,66,92,93,94,97,98,99,100,107,186,189],$V67=[1,2386],$V77=[2,169],$V87=[2,173],$V97=[2,174],$Va7=[2,175],$Vb7=[2,176],$Vc7=[2,45],$Vd7=[2,52],$Ve7=[2,59],$Vf7=[2,79],$Vg7=[2,75],$Vh7=[2,81],$Vi7=[1,2469],$Vj7=[2,78],$Vk7=[47,49,75,76,77,97,98,99,100,115,117,121,123,131,136,137,152,153,154,155,185,186,189,215],$Vl7=[47,49,75,76,77,115,117,121,123,131,136,137,152,153,154,155,185,186,189,215],$Vm7=[47,49,97,98,99,100,108,109,110,111,112,113,117,131,136,137,152,153,154,155,186,189],$Vn7=[47,49,92,93,94,97,98,99,100,117,131,136,137,152,153,154,155,186,189],$Vo7=[2,85],$Vp7=[2,86],$Vq7=[47,49,108,109,110,111,112,113,117,131,136,137,152,153,154,155,186,189],$Vr7=[1,2523],$Vs7=[1,2529],$Vt7=[1,2612],$Vu7=[1,2645],$Vv7=[1,2651],$Vw7=[1,2650],$Vx7=[1,2671],$Vy7=[1,2677],$Vz7=[1,2676],$VA7=[1,2698],$VB7=[1,2704],$VC7=[1,2703],$VD7=[1,2725],$VE7=[1,2731],$VF7=[1,2730],$VG7=[1,2751],$VH7=[1,2757],$VI7=[1,2756],$VJ7=[1,2778],$VK7=[1,2784],$VL7=[1,2783],$VM7=[1,2825],$VN7=[1,2858],$VO7=[1,2864],$VP7=[1,2863],$VQ7=[1,2884],$VR7=[1,2890],$VS7=[1,2889],$VT7=[1,2911],$VU7=[1,2917],$VV7=[1,2916],$VW7=[1,2938],$VX7=[1,2944],$VY7=[1,2943],$VZ7=[1,2964],$V_7=[1,2970],$V$7=[1,2969],$V08=[1,2991],$V18=[1,2997],$V28=[1,2996],$V38=[117,131,136,137,189],$V48=[1,3016],$V58=[2,48],$V68=[2,55],$V78=[2,74],$V88=[2,80],$V98=[2,76],$Va8=[2,82],$Vb8=[47,49,97,98,99,100,117,131,136,137,152,153,154,155,186,189],$Vc8=[1,3040],$Vd8=[66,131,136,137,186,189],$Ve8=[1,3049],$Vf8=[1,3050],$Vg8=[1,3051],$Vh8=[1,3052],$Vi8=[66,131,136,137,152,153,154,155,186,189],$Vj8=[47,66,131,136,137,152,153,154,155,186,189],$Vk8=[47,49,66,131,136,137,152,153,154,155,186,189],$Vl8=[1,3081],$Vm8=[1,3150],$Vn8=[1,3156],$Vo8=[1,3236],$Vp8=[1,3242],$Vq8=[2,170],$Vr8=[2,46],$Vs8=[1,3330],$Vt8=[2,53],$Vu8=[1,3363],$Vv8=[2,77],$Vw8=[2,167],$Vx8=[1,3408],$Vy8=[47,49,66,75,76,77,97,98,99,100,115,121,123,131,136,137,152,153,154,155,185,186,189,215],$Vz8=[47,49,66,75,76,77,115,121,123,131,136,137,152,153,154,155,185,186,189,215],$VA8=[47,49,66,97,98,99,100,108,109,110,111,112,113,131,136,137,152,153,154,155,186,189],$VB8=[47,49,66,92,93,94,97,98,99,100,131,136,137,152,153,154,155,186,189],$VC8=[47,49,66,108,109,110,111,112,113,131,136,137,152,153,154,155,186,189],$VD8=[1,3439],$VE8=[1,3445],$VF8=[1,3444],$VG8=[1,3465],$VH8=[1,3471],$VI8=[1,3470],$VJ8=[1,3492],$VK8=[1,3498],$VL8=[1,3497],$VM8=[1,3596],$VN8=[1,3602],$VO8=[1,3601],$VP8=[1,3637],$VQ8=[1,3679],$VR8=[66,131,136,137,189],$VS8=[1,3709],$VT8=[47,49,66,97,98,99,100,131,136,137,152,153,154,155,186,189],$VU8=[1,3733],$VV8=[1,3769],$VW8=[1,3775],$VX8=[1,3774],$VY8=[1,3795],$VZ8=[1,3801],$V_8=[1,3800],$V$8=[1,3822],$V09=[1,3828],$V19=[1,3827],$V29=[1,3849],$V39=[1,3855],$V49=[1,3854],$V59=[1,3875],$V69=[1,3881],$V79=[1,3880],$V89=[1,3902],$V99=[1,3908],$Va9=[1,3907],$Vb9=[107,117,131,136,137,186,189],$Vc9=[1,3950],$Vd9=[1,3974],$Ve9=[1,4016],$Vf9=[1,4049],$Vg9=[1,4154],$Vh9=[1,4197],$Vi9=[1,4203],$Vj9=[1,4202],$Vk9=[1,4238],$Vl9=[1,4280],$Vm9=[1,4336],$Vn9=[66,107,131,136,137,186,189],$Vo9=[1,4391],$Vp9=[1,4415],$Vq9=[1,4445],$Vr9=[1,4491],$Vs9=[1,4563],$Vt9=[1,4612];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"shexDoc":3,"initParser":4,"Qdirective_E_Star":5,"Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt":6,"EOF":7,"directive":8,"O_QnotStartAction_E_Or_QstartActions_E_C":9,"notStartAction":10,"startActions":11,"Qstatement_E_Star":12,"statement":13,"O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C":14,"baseDecl":15,"prefixDecl":16,"importDecl":17,"IT_BASE":18,"IRIREF":19,"IT_PREFIX":20,"PNAME_NS":21,"iri":22,"IT_IMPORT":23,"start":24,"shapeExprDecl":25,"IT_start":26,"=":27,"shapeAnd":28,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star":29,"QcodeDecl_E_Plus":30,"codeDecl":31,"shapeExprLabel":32,"O_QshapeExpression_E_Or_QIT_EXTERNAL_E_C":33,"shapeExpression":34,"IT_EXTERNAL":35,"QIT_NOT_E_Opt":36,"shapeAtomNoRef":37,"QshapeOr_E_Opt":38,"IT_NOT":39,"shapeRef":40,"shapeOr":41,"inlineShapeExpression":42,"inlineShapeOr":43,"Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus":44,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus":45,"O_QIT_OR_E_S_QshapeAnd_E_C":46,"IT_OR":47,"O_QIT_AND_E_S_QshapeNot_E_C":48,"IT_AND":49,"shapeNot":50,"inlineShapeAnd":51,"Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star":52,"O_QIT_OR_E_S_QinlineShapeAnd_E_C":53,"Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star":54,"inlineShapeNot":55,"Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star":56,"O_QIT_AND_E_S_QinlineShapeNot_E_C":57,"shapeAtom":58,"inlineShapeAtom":59,"nonLitNodeConstraint":60,"QshapeOrRef_E_Opt":61,"litNodeConstraint":62,"shapeOrRef":63,"QnonLitNodeConstraint_E_Opt":64,"(":65,")":66,".":67,"shapeDefinition":68,"nonLitInlineNodeConstraint":69,"QinlineShapeOrRef_E_Opt":70,"litInlineNodeConstraint":71,"inlineShapeOrRef":72,"QnonLitInlineNodeConstraint_E_Opt":73,"inlineShapeDefinition":74,"ATPNAME_LN":75,"ATPNAME_NS":76,"@":77,"Qannotation_E_Star":78,"semanticActions":79,"annotation":80,"IT_LITERAL":81,"QxsFacet_E_Star":82,"datatype":83,"valueSet":84,"QnumericFacet_E_Plus":85,"xsFacet":86,"numericFacet":87,"nonLiteralKind":88,"QstringFacet_E_Star":89,"QstringFacet_E_Plus":90,"stringFacet":91,"IT_IRI":92,"IT_BNODE":93,"IT_NONLITERAL":94,"stringLength":95,"INTEGER":96,"REGEXP":97,"IT_LENGTH":98,"IT_MINLENGTH":99,"IT_MAXLENGTH":100,"numericRange":101,"rawNumeric":102,"numericLength":103,"DECIMAL":104,"DOUBLE":105,"string":106,"^^":107,"IT_MININCLUSIVE":108,"IT_MINEXCLUSIVE":109,"IT_MAXINCLUSIVE":110,"IT_MAXEXCLUSIVE":111,"IT_TOTALDIGITS":112,"IT_FRACTIONDIGITS":113,"Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star":114,"{":115,"QtripleExpression_E_Opt":116,"}":117,"O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C":118,"extension":119,"extraPropertySet":120,"IT_CLOSED":121,"tripleExpression":122,"IT_EXTRA":123,"Qpredicate_E_Plus":124,"predicate":125,"oneOfTripleExpr":126,"groupTripleExpr":127,"multiElementOneOf":128,"Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus":129,"O_QGT_PIPE_E_S_QgroupTripleExpr_E_C":130,"|":131,"singleElementGroup":132,"multiElementGroup":133,"unaryTripleExpr":134,"QGT_SEMI_E_Opt":135,",":136,";":137,"Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus":138,"O_QGT_SEMI_E_S_QunaryTripleExpr_E_C":139,"Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt":140,"O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C":141,"include":142,"O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C":143,"$":144,"tripleExprLabel":145,"tripleConstraint":146,"bracketedTripleExpr":147,"Qcardinality_E_Opt":148,"cardinality":149,"QsenseFlags_E_Opt":150,"senseFlags":151,"*":152,"+":153,"?":154,"REPEAT_RANGE":155,"^":156,"[":157,"QvalueSetValue_E_Star":158,"]":159,"valueSetValue":160,"iriRange":161,"literalRange":162,"languageRange":163,"O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C":164,"QiriExclusion_E_Plus":165,"iriExclusion":166,"QliteralExclusion_E_Plus":167,"literalExclusion":168,"QlanguageExclusion_E_Plus":169,"languageExclusion":170,"Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt":171,"QiriExclusion_E_Star":172,"O_QGT_TILDE_E_S_QiriExclusion_E_Star_C":173,"~":174,"-":175,"QGT_TILDE_E_Opt":176,"literal":177,"Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt":178,"QliteralExclusion_E_Star":179,"O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C":180,"LANGTAG":181,"Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt":182,"O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C":183,"QlanguageExclusion_E_Star":184,"&":185,"//":186,"O_Qiri_E_Or_Qliteral_E_C":187,"QcodeDecl_E_Star":188,"%":189,"O_QCODE_E_Or_QGT_MODULO_E_C":190,"CODE":191,"rdfLiteral":192,"numericLiteral":193,"booleanLiteral":194,"a":195,"blankNode":196,"langString":197,"Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt":198,"O_QGT_DTYPE_E_S_Qdatatype_E_C":199,"IT_true":200,"IT_false":201,"STRING_LITERAL1":202,"STRING_LITERAL_LONG1":203,"STRING_LITERAL2":204,"STRING_LITERAL_LONG2":205,"LANG_STRING_LITERAL1":206,"LANG_STRING_LITERAL_LONG1":207,"LANG_STRING_LITERAL2":208,"LANG_STRING_LITERAL_LONG2":209,"prefixedName":210,"PNAME_LN":211,"BLANK_NODE_LABEL":212,"O_QIT_EXTENDS_E_Or_QGT_AMP_E_C":213,"QshapeExprLabel_E_Plus":214,"IT_EXTENDS":215,"$accept":0,"$end":1},
terminals_: {2:"error",7:"EOF",18:"IT_BASE",19:"IRIREF",20:"IT_PREFIX",21:"PNAME_NS",23:"IT_IMPORT",26:"IT_start",27:"=",35:"IT_EXTERNAL",39:"IT_NOT",47:"IT_OR",49:"IT_AND",65:"(",66:")",67:".",75:"ATPNAME_LN",76:"ATPNAME_NS",77:"@",81:"IT_LITERAL",92:"IT_IRI",93:"IT_BNODE",94:"IT_NONLITERAL",96:"INTEGER",97:"REGEXP",98:"IT_LENGTH",99:"IT_MINLENGTH",100:"IT_MAXLENGTH",104:"DECIMAL",105:"DOUBLE",107:"^^",108:"IT_MININCLUSIVE",109:"IT_MINEXCLUSIVE",110:"IT_MAXINCLUSIVE",111:"IT_MAXEXCLUSIVE",112:"IT_TOTALDIGITS",113:"IT_FRACTIONDIGITS",115:"{",117:"}",121:"IT_CLOSED",123:"IT_EXTRA",131:"|",136:",",137:";",144:"$",152:"*",153:"+",154:"?",155:"REPEAT_RANGE",156:"^",157:"[",159:"]",174:"~",175:"-",181:"LANGTAG",185:"&",186:"//",189:"%",191:"CODE",195:"a",200:"IT_true",201:"IT_false",202:"STRING_LITERAL1",203:"STRING_LITERAL_LONG1",204:"STRING_LITERAL2",205:"STRING_LITERAL_LONG2",206:"LANG_STRING_LITERAL1",207:"LANG_STRING_LITERAL_LONG1",208:"LANG_STRING_LITERAL2",209:"LANG_STRING_LITERAL_LONG2",211:"PNAME_LN",212:"BLANK_NODE_LABEL",215:"IT_EXTENDS"},
productions_: [0,[3,4],[4,0],[5,0],[5,2],[9,1],[9,1],[12,0],[12,2],[14,2],[6,0],[6,1],[8,1],[8,1],[8,1],[15,2],[16,3],[17,2],[10,1],[10,1],[24,4],[11,1],[30,1],[30,2],[13,1],[13,1],[25,2],[33,1],[33,1],[34,3],[34,3],[34,2],[38,0],[38,1],[42,1],[41,1],[41,2],[46,2],[44,1],[44,2],[48,2],[45,1],[45,2],[29,0],[29,2],[43,2],[53,2],[52,0],[52,2],[28,2],[54,0],[54,2],[51,2],[57,2],[56,0],[56,2],[50,2],[36,0],[36,1],[55,2],[58,2],[58,1],[58,2],[58,3],[58,1],[61,0],[61,1],[64,0],[64,1],[37,2],[37,1],[37,2],[37,3],[37,1],[59,2],[59,1],[59,2],[59,3],[59,1],[70,0],[70,1],[73,0],[73,1],[63,1],[63,1],[72,1],[72,1],[40,1],[40,1],[40,2],[62,3],[78,0],[78,2],[60,3],[71,2],[71,2],[71,2],[71,1],[82,0],[82,2],[85,1],[85,2],[69,2],[69,1],[89,0],[89,2],[90,1],[90,2],[88,1],[88,1],[88,1],[86,1],[86,1],[91,2],[91,1],[95,1],[95,1],[95,1],[87,2],[87,2],[102,1],[102,1],[102,1],[102,3],[101,1],[101,1],[101,1],[101,1],[103,1],[103,1],[68,3],[74,4],[118,1],[118,1],[118,1],[114,0],[114,2],[116,0],[116,1],[120,2],[124,1],[124,2],[122,1],[126,1],[126,1],[128,2],[130,2],[129,1],[129,2],[127,1],[127,1],[132,2],[135,0],[135,1],[135,1],[133,3],[139,2],[139,2],[138,1],[138,2],[134,2],[134,1],[143,2],[140,0],[140,1],[141,1],[141,1],[147,6],[148,0],[148,1],[146,6],[150,0],[150,1],[149,1],[149,1],[149,1],[149,1],[151,1],[84,3],[158,0],[158,2],[160,1],[160,1],[160,1],[160,2],[165,1],[165,2],[167,1],[167,2],[169,1],[169,2],[164,1],[164,1],[164,1],[161,2],[172,0],[172,2],[173,2],[171,0],[171,1],[166,3],[176,0],[176,1],[162,2],[179,0],[179,2],[180,2],[178,0],[178,1],[168,3],[163,2],[163,2],[184,0],[184,2],[183,2],[182,0],[182,1],[170,3],[142,2],[80,3],[187,1],[187,1],[79,1],[188,0],[188,2],[31,3],[190,1],[190,1],[177,1],[177,1],[177,1],[125,1],[125,1],[83,1],[32,1],[32,1],[145,1],[145,1],[193,1],[193,1],[193,1],[192,1],[192,2],[199,2],[198,0],[198,1],[194,1],[194,1],[106,1],[106,1],[106,1],[106,1],[197,1],[197,1],[197,1],[197,1],[22,1],[22,1],[210,1],[210,1],[196,1],[119,2],[213,1],[213,1],[214,1],[214,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

        var valueExprDefns = Parser.valueExprDefns ? { valueExprDefns: Parser.valueExprDefns } : {};
        var startObj = Parser.start ? { start: Parser.start } : {};
        var startActs = Parser.startActs ? { startActs: Parser.startActs } : {};
        var ret = extend({ type: "Schema"},
                         Object.keys(Parser._prefixes).length ? { prefixes: Parser._prefixes } : {}, // Properties ordered here to
                         Object.keys(Parser._imports).length ? { imports: Parser._imports } : {}, // build return object from
                         valueExprDefns, startActs, startObj,                  // components in parser state
                         Parser.shapes ? {shapes: Parser.shapes} : {},         // maintaining intuitve order.
                         Parser.productions ? {productions: Parser.productions} : {});
        if (Parser._base !== null)
          ret.base = Parser._base;
        Parser.reset();
//console.log(JSON.stringify(ret));
        return ret;
      
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
          error("Parse error: start already defined");
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
        addShape($$[$0-1],  $$[$0]);
      
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
case 32: case 227: case 244:
this.$ = null;
break;
case 33: case 37: case 40: case 46: case 53: case 162: case 184: case 243:
this.$ = $$[$0];
break;
case 35:
 // returns a ShapeOr
        var disjuncts = $$[$0].map(nonest);
        this.$ = { type: "ShapeOr", shapeExprs: disjuncts, needsAtom: disjuncts }; // t: @@
      
break;
case 36:
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
        var namePos = $$[$0].indexOf(':');
        this.$ = { type: "ShapeRef", reference: expandPrefix($$[$0].substr(0, namePos)) + $$[$0].substr(namePos + 1) };
      
break;
case 88:
 // t: 1dotRefNS1@@
        $$[$0] = $$[$0].substr(1, $$[$0].length-1);
        this.$ = { type: "ShapeRef", reference: expandPrefix($$[$0].substr(0, $$[$0].length - 1)) };
      
break;
case 89:
this.$ = { type: "ShapeRef", reference: $$[$0] } // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1;
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
              error("Parse error: facet " + facet + " not allowed for unknown datatype " + $$[$0-1]);
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
          error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times");
        }
        this.$ = extend($$[$0-1], $$[$0]) // t: 1literalLength
      
break;
case 101: case 107:

        if (Object.keys($$[$0-1]).indexOf(Object.keys($$[$0])[0]) !== -1) {
          error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times");
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
          error("Parse error: facet "+Object.keys($$[$0])[0]+" defined multiple times");
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
this.$ = parseInt($$[$0], 10);;
break;
case 121: case 122:
this.$ = parseFloat($$[$0]);;
break;
case 123:
 // ## deprecated
        if ($$[$0] === XSD_DECIMAL || $$[$0] === XSD_FLOAT || $$[$0] === XSD_DOUBLE)
          this.$ = parseFloat($$[$0-2].value);
        else if (numericDatatypes.indexOf($$[$0]) !== -1)
          this.$ = parseInt($$[$0-2].value)
        else
          error("Parse error: numeric range facet expected numeric datatype instead of " + $$[$0]);
      
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
        this.$ = $$[$0-2]
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: !! look to open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = $$[$0].semActs; } // t: !! look to open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 131:
 // t: 1dotInherit3
        var exprObj = $$[$0-1] ? { expression: $$[$0-1] } : EmptyObject; // t: 0, 0Inherit1
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
          addProduction($$[$0-1],  this.$);
        } else {
          this.$ = $$[$0]
        }
      
break;
case 167:

        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        this.$ = $$[$0-4];
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $$[$0-2]) { this.$.min = $$[$0-2].min; } // t: open3groupdotclosecard23Annot3Code2
        if ("max" in $$[$0-2]) { this.$.max = $$[$0-2].max; } // t: open3groupdotclosecard23Annot3Code2
        if ($$[$0-1].length) { this.$.annotations = $$[$0-1]; } // t: open3groupdotcloseAnnot3, open3groupdotclosecard23Annot3Code2
        if ($$[$0]) { this.$.semActs = "semActs" in $$[$0-4] ? $$[$0-4].semActs.concat($$[$0].semActs) : $$[$0].semActs; } // t: open3groupdotcloseCode1, !open1dotOr1dot
      
break;
case 168:
this.$ = {} // t: 1dot;
break;
case 170:

        // $$[$0]: t: 1dotCode1
	if ($$[$0-3] !== EmptyShape && false) {
	  var t = blank();
	  addShape(t, $$[$0-3]);
	  $$[$0-3] = { type: "ShapeRef", reference: t };
	}
        // %6: t: 1inversedotCode1
        this.$ = extend({ type: "TripleConstraint" }, $$[$0-5] ? $$[$0-5] : {}, { predicate: $$[$0-4] }, ($$[$0-3] === EmptyShape ? {} : { valueExpr: $$[$0-3] }), $$[$0-2], $$[$0]); // t: 1dot // t: 1inversedot
        if ($$[$0-1].length)
          this.$["annotations"] = $$[$0-1]; // t: 1dotAnnot3 // t: 1inversedotAnnot3
      
break;
case 173:
this.$ = { min:0, max:UNBOUNDED } // t: 1cardStar;
break;
case 174:
this.$ = { min:1, max:UNBOUNDED } // t: 1cardPlus;
break;
case 175:
this.$ = { min:0, max:1 } // t: 1cardOpt;
break;
case 176:

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
case 177:
this.$ = { inverse: true } // t: 1inversedot;
break;
case 178:
this.$ = $$[$0-1] // t: 1val1IRIREF;
break;
case 179:
this.$ = [] // t: 1val1IRIREF;
break;
case 180:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1IRIREF;
break;
case 185:
this.$ = [$$[$0]] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 186:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3;
break;
case 187:
this.$ = [$$[$0]] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 188:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3;
break;
case 189:
this.$ = [$$[$0]] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 190:
this.$ = appendTo($$[$0-1], $$[$0]) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3;
break;
case 191:
this.$ = { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 192:
this.$ = { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 193:
this.$ = { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $$[$0] };
break;
case 194:

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
case 195:
this.$ = [] // t: 1val1iriStem, 1val1iriStemMinusiri3;
break;
case 196:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1iriStemMinusiri3;
break;
case 197:
this.$ = $$[$0] // t: 1val1iriStemMinusiri3;
break;
case 200:
this.$ = $$[$0] ? { type: "IriStem", stem: $$[$0-1] } /* t: 1val1iriStemMinusiriStem3 */ : $$[$0-1] // t: 1val1iriStemMinusiri3;
break;
case 203:

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
case 204:
this.$ = [] // t: 1val1literalStem, 1val1literalStemMinusliteral3;
break;
case 205:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1literalStemMinusliteral3;
break;
case 206:
this.$ = $$[$0] // t: 1val1literalStemMinusliteral3;
break;
case 209:
this.$ = $$[$0] ? { type: "LiteralStem", stem: $$[$0-1].value } /* t: 1val1literalStemMinusliteral3 */ : $$[$0-1].value // t: 1val1literalStemMinusliteralStem3;
break;
case 210:

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
case 211:

        this.$ = {  // t: @@
          type: $$[$0].length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($$[$0].length)
          this.$["exclusions"] = $$[$0]; // t: @@
      
break;
case 212:
this.$ = [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3;
break;
case 213:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1val1languageStemMinuslanguage3;
break;
case 214:
this.$ = $$[$0] // t: 1val1languageStemMinuslanguage3;
break;
case 217:
this.$ = $$[$0] ? { type: "LanguageStem", stem: $$[$0-1] } /* t: 1val1languageStemMinuslanguageStem3 */ : $$[$0-1] // t: 1val1languageStemMinuslanguage3;
break;
case 218:
this.$ = { type: "Inclusion", "include": $$[$0] } // t: 2groupInclude1;
break;
case 219:
this.$ = { type: "Annotation", predicate: $$[$0-1], object: $$[$0] } // t: 1dotAnnotIRIREF;
break;
case 222:
this.$ = $$[$0].length ? { semActs: $$[$0] } : null; // t: 1dotCode1/2oneOfDot;
break;
case 223:
this.$ = [] // t: 1dot, 1dotCode1;
break;
case 224:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotCode1;
break;
case 225:
this.$ = $$[$0] ? unescapeSemanticAction($$[$0-1], $$[$0]) /* t: 1dotCode1 */ : { type: "SemAct", name: $$[$0-1] } // t: 1dotNoCode1;
break;
case 232:
this.$ = RDF_TYPE // t: 1AvalA;
break;
case 238:
this.$ = createLiteral($$[$0], XSD_INTEGER) // t: 1val1INTEGER;
break;
case 239:
this.$ = createLiteral($$[$0], XSD_DECIMAL) // t: 1val1DECIMAL;
break;
case 240:
this.$ = createLiteral($$[$0], XSD_DOUBLE) // t: 1val1DOUBLE;
break;
case 242:
this.$ = $$[$0] ? extend($$[$0-1], { type: $$[$0] }) : $$[$0-1]; // t: 1val1Datatype;
break;
case 246:
this.$ = { value: "true", type: XSD_BOOLEAN } // t: 1val1true;
break;
case 247:
this.$ = { value: "false", type: XSD_BOOLEAN } // t: 1val1false;
break;
case 248:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL2;
break;
case 249:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL1;
break;
case 250:
this.$ = unescapeString($$[$0], 1)	// t: 1val1STRING_LITERAL_LONG2;
break;
case 251:
this.$ = unescapeString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG1;
break;
case 252:
this.$ = unescapeLangString($$[$0], 1)	// t: @@;
break;
case 253:
this.$ = unescapeLangString($$[$0], 3)	// t: @@;
break;
case 254:
this.$ = unescapeLangString($$[$0], 1)	// t: 1val1LANGTAG;
break;
case 255:
this.$ = unescapeLangString($$[$0], 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG;
break;
case 256:
 // t: 1dot
        var unesc = ShExUtil.unescapeText($$[$0].slice(1,-1), {});
        this.$ = Parser._base === null || absoluteIRI.test(unesc) ? unesc : _resolveIRI(unesc)
      
break;
case 258:
 // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        var namePos = $$[$0].indexOf(':');
        this.$ = expandPrefix($$[$0].substr(0, namePos)) + ShExUtil.unescapeText($$[$0].substr(namePos + 1), pnameEscapeReplacements);
      
break;
case 259:
 // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        this.$ = expandPrefix($$[$0].substr(0, $$[$0].length - 1));
      
break;
case 261:
this.$ = $$[$0] // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3;
break;
case 264:
this.$ = [$$[$0]] // t: 1dotInherit1, 1dot3Inherit, 1dotInherit3;
break;
case 265:
this.$ = appendTo($$[$0-1], $$[$0]) // t: 1dotInherit3;
break;
}
},
table: [o($V0,[2,2],{3:1,4:2}),{1:[3]},o($V0,[2,3],{5:3}),{6:4,7:[2,10],8:5,9:10,10:14,11:15,14:6,15:7,16:8,17:9,18:[1,11],19:$V1,20:[1,12],21:$V2,22:22,23:[1,13],24:16,25:17,26:[1,19],30:18,31:21,32:20,189:$V3,196:23,210:26,211:$V4,212:$V5},{7:[1,30]},o($V0,[2,4]),{7:[2,11]},o($V0,$V6),o($V0,$V7),o($V0,$V8),o($V9,[2,7],{12:31}),{19:[1,32]},{21:[1,33]},{19:$Va,21:$Vb,22:34,210:36,211:$Vc},o($V9,[2,5]),o($V9,[2,6]),o($V9,$Vd),o($V9,$Ve),o($V9,[2,21],{31:39,189:$V3}),{27:[1,40]},o($Vf,$Vg,{33:41,34:42,36:44,40:46,35:[1,43],39:[1,45],75:$Vh,76:$Vi,77:$Vj}),o($V0,[2,22]),o($Vk,$Vl),o($Vk,$Vm),{19:$Vn,21:$Vo,22:50,210:52,211:$Vp},o($Vk,$Vq),o($Vk,$Vr),o($Vk,$Vs),o($Vk,$Vt),o($Vk,$Vu),{1:[2,1]},{7:[2,9],8:56,10:57,13:55,15:58,16:59,17:60,18:[1,63],19:$V1,20:[1,64],21:$V2,22:22,23:[1,65],24:61,25:62,26:[1,66],32:67,196:23,210:26,211:$V4,212:$V5},o($V0,$Vv),{19:$Va,21:$Vb,22:68,210:36,211:$Vc},o($V0,$Vw),o($V0,$Vq),o($V0,$Vr),o($V0,$Vt),o($V0,$Vu),o($V0,[2,23]),o($Vx,$Vg,{28:69,50:70,36:71,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:73,60:74,62:75,68:76,69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,210:99,101:100,103:101,19:$VE,21:$VF,65:[1,77],67:[1,78],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$VU,211:$VV}),o($Vf,$VW,{40:113,75:$VX,76:$VY,77:$VZ}),{41:117,44:118,45:119,46:120,47:$V_,48:121,49:$V$},o($V01,$V11),o($V01,$V21),{19:[1,127],21:[1,131],22:125,32:124,196:126,210:128,211:[1,130],212:[1,129]},{189:[1,134],190:132,191:[1,133]},o($V31,$Vq),o($V31,$Vr),o($V31,$Vt),o($V31,$Vu),o($V9,[2,8]),o($V9,[2,24]),o($V9,[2,25]),o($V9,$V6),o($V9,$V7),o($V9,$V8),o($V9,$Vd),o($V9,$Ve),{19:[1,135]},{21:[1,136]},{19:$V41,21:$V51,22:137,210:139,211:$V61},{27:[1,142]},o($Vf,$Vg,{33:143,34:144,36:146,40:148,35:[1,145],39:[1,147],75:$Vh,76:$Vi,77:$Vj}),o($V0,$V71),o($V81,$V91,{29:149}),o($Va1,$Vb1,{54:150}),o($VC,$VD,{69:79,71:80,74:81,88:82,90:83,83:85,84:86,85:87,114:88,91:92,22:93,87:95,95:96,210:99,101:100,103:101,58:151,60:152,62:153,63:154,68:157,40:158,19:$VE,21:$VF,65:[1,155],67:[1,156],75:[1,159],76:[1,160],77:[1,161],81:$VG,92:$VH,93:$VI,94:$VJ,97:$VK,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$VU,211:$VV}),o($Vx,$VW),o($V9,$Vc1,{44:118,45:119,46:120,48:121,38:162,41:163,47:$V_,49:$V$}),o($Va1,$Vd1,{61:164,63:165,68:166,40:167,74:168,114:169,75:$VX,76:$VY,77:$VZ,115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:170,60:171,69:172,88:173,90:174,91:178,95:179,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{34:181,36:182,40:184,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:185}),o($Vo1,$Vn1,{78:186}),o($Vp1,$Vn1,{78:187}),o($Vq1,$Vr1,{89:188}),o($Vm1,$Vs1,{95:96,91:189,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:190}),o($Vt1,$Vu1,{82:191}),o($Vt1,$Vu1,{82:192}),o($Vo1,$Vv1,{101:100,103:101,87:193,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,194],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{158:203}),o($VH1,$VI1),{96:[1,204]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,206],102:205,104:[1,207],105:[1,208],106:209,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,214]},{96:[2,115]},{96:[2,116]},{96:[2,117]},o($Vt1,$Vt),o($Vt1,$Vu),o($VO1,[2,124]),o($VO1,[2,125]),o($VO1,[2,126]),o($VO1,[2,127]),{96:[2,128]},{96:[2,129]},o($V9,$Vc1,{44:118,45:119,46:120,48:121,41:163,38:215,47:$V_,49:$V$}),o($Va1,$V11),o($Va1,$V21),{19:[1,219],21:[1,223],22:217,32:216,196:218,210:220,211:[1,222],212:[1,221]},o($V9,$VP1),o($V9,$VQ1,{46:224,47:$V_}),o($V81,$V91,{29:225,48:226,49:$V$}),o($V81,$VR1),o($Va1,$VS1),o($Vx,$Vg,{28:227,50:228,36:229,39:$Vy}),o($Vx,$Vg,{50:230,36:231,39:$Vy}),o($V01,$VT1),o($V01,$Vl),o($V01,$Vm),o($V01,$Vq),o($V01,$Vr),o($V01,$Vs),o($V01,$Vt),o($V01,$Vu),o($V0,$VU1),o($V0,$VV1),o($V0,$VW1),o($V9,$Vv),{19:$V41,21:$V51,22:232,210:139,211:$V61},o($V9,$Vw),o($V9,$Vq),o($V9,$Vr),o($V9,$Vt),o($V9,$Vu),o($Vx,$Vg,{28:233,50:234,36:235,39:$Vy}),o($V9,$Vz),o($V9,$VA),o($V9,$VB),o($VC,$VD,{37:236,60:237,62:238,68:239,69:242,71:243,74:244,88:245,90:246,83:248,84:249,85:250,114:251,91:255,22:256,87:258,95:259,210:262,101:263,103:264,19:$VX1,21:$VY1,65:[1,240],67:[1,241],81:$VZ1,92:$V_1,93:$V$1,94:$V02,97:$V12,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$V22,211:$V32}),o($Vf,$VW,{40:267,75:$V42,76:$V52,77:$V62}),{41:271,44:272,45:273,46:274,47:$V72,48:275,49:$V82},o($V9,$V92,{46:278,47:$V_}),o($V81,$Va2,{48:279,49:$V$}),o($Va1,$Vb2),o($Va1,$Vd1,{63:165,68:166,40:167,74:168,114:169,61:280,75:$VX,76:$VY,77:$VZ,115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{60:171,69:172,88:173,90:174,91:178,95:179,64:281,92:$Vg1,93:$Vh1,94:$Vi1,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:282,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Ve2,$V11),o($Ve2,$V21),{19:[1,286],21:[1,290],22:284,32:283,196:285,210:287,211:[1,289],212:[1,288]},o($V9,$Vh2),o($V9,$Vi2),o($Va1,$Vj2),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:291}),{115:[1,292],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Va1,$Vl2),o($Va1,$Vm2),o($Vo1,$Vn1,{78:293}),o($Vn2,$Vr1,{89:294}),o($Vo1,$Vs1,{95:179,91:295,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,296]},o($Vn2,$VJ1),{66:[1,297]},o($VC,$VD,{37:298,60:299,62:300,68:301,69:304,71:305,74:306,88:307,90:308,83:310,84:311,85:312,114:313,91:317,22:318,87:320,95:321,210:324,101:325,103:326,19:[1,323],21:[1,328],65:[1,302],67:[1,303],81:[1,309],92:[1,314],93:[1,315],94:[1,316],97:$Vo2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,319],211:[1,327]}),o($Vf,$VW,{40:329,75:$Vp2,76:$Vq2,77:$Vr2}),{41:333,44:334,45:335,46:336,47:$Vs2,48:337,49:$Vt2},o($Vu2,$Vv2,{79:340,80:341,188:342,186:[1,343]}),o($Vw2,$Vv2,{79:344,80:345,188:346,186:$Vx2}),o($Vy2,$Vv2,{79:348,80:349,188:350,186:[1,351]}),o($Vm1,$Vz2,{95:96,91:352,97:$VK,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:353,91:354,87:355,95:356,101:358,103:359,97:$VC2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:353,91:354,87:355,95:356,101:358,103:359,97:$VC2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:353,91:354,87:355,95:356,101:358,103:359,97:$VC2,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($VG2,$VH2,{116:360,122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,117:$VI2,144:$VJ2,185:$VK2}),o($VC,[2,136]),o($VC,[2,132]),o($VC,[2,133]),o($VC,[2,134]),{19:$VL2,21:$VM2,22:375,32:374,196:376,210:378,211:$VN2,212:$VO2,214:373},{19:$VP2,21:$VQ2,22:384,124:382,125:383,195:$VR2,210:387,211:$VS2},o($VT2,[2,262]),o($VT2,[2,263]),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,390],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($Vq1,$Vb3),o($VH1,$Vc3),o($VH1,$Vd3),o($VH1,$Ve3),o($VH1,$Vf3),{107:[1,422]},{107:$Vg3},{107:$Vh3},{107:$Vi3},{107:$Vj3},o($VH1,$Vk3),o($V9,$Vl3),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vm3),o($V9,$Vn3,{46:278,47:$V_}),o($Va1,$Vo3),o($V81,$Vp3),o($Va1,$Vb1,{54:423}),o($VC,$VD,{58:424,60:425,62:426,63:427,69:430,71:431,68:432,40:433,88:434,90:435,83:437,84:438,85:439,74:440,91:447,22:448,87:450,114:451,95:452,210:455,101:456,103:457,19:[1,454],21:[1,459],65:[1,428],67:[1,429],75:[1,441],76:[1,442],77:[1,443],81:[1,436],92:[1,444],93:[1,445],94:[1,446],97:$Vq3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,449],211:[1,458]}),o($Va1,$Vr3),o($VC,$VD,{58:460,60:461,62:462,63:463,69:466,71:467,68:468,40:469,88:470,90:471,83:473,84:474,85:475,74:476,91:483,22:484,87:486,114:487,95:488,210:491,101:492,103:493,19:[1,490],21:[1,495],65:[1,464],67:[1,465],75:[1,477],76:[1,478],77:[1,479],81:[1,472],92:[1,480],93:[1,481],94:[1,482],97:$Vs3,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,485],211:[1,494]}),o($V9,$V71),o($V81,$V91,{29:496}),o($Va1,$Vb1,{54:497}),o($VC,$VD,{69:242,71:243,74:244,88:245,90:246,83:248,84:249,85:250,114:251,91:255,22:256,87:258,95:259,210:262,101:263,103:264,58:498,60:499,62:500,63:501,68:504,40:505,19:$VX1,21:$VY1,65:[1,502],67:[1,503],75:[1,506],76:[1,507],77:[1,508],81:$VZ1,92:$V_1,93:$V$1,94:$V02,97:$V12,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:$V22,211:$V32}),o($V9,$Vc1,{44:272,45:273,46:274,48:275,38:509,41:510,47:$V72,49:$V82}),o($Va1,$Vd1,{61:511,63:512,68:513,40:514,74:515,114:516,75:$V42,76:$V52,77:$V62,115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Ve1),o($Va1,$Vf1,{64:517,60:518,69:519,88:520,90:521,91:525,95:526,92:$Vt3,93:$Vu3,94:$Vv3,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:528,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vl1),o($Vm1,$Vn1,{78:529}),o($Vo1,$Vn1,{78:530}),o($Vp1,$Vn1,{78:531}),o($Vq1,$Vr1,{89:532}),o($Vm1,$Vs1,{95:259,91:533,97:$V12,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:534}),o($Vt1,$Vu1,{82:535}),o($Vt1,$Vu1,{82:536}),o($Vo1,$Vv1,{101:263,103:264,87:537,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,538],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{158:539}),o($VH1,$VI1),{96:[1,540]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,542],102:541,104:[1,543],105:[1,544],106:545,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,546]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$Vc1,{44:272,45:273,46:274,48:275,41:510,38:547,47:$V72,49:$V82}),o($Va1,$V11),o($Va1,$V21),{19:[1,551],21:[1,555],22:549,32:548,196:550,210:552,211:[1,554],212:[1,553]},o($V9,$VP1),o($V9,$VQ1,{46:556,47:$V72}),o($V81,$V91,{29:557,48:558,49:$V82}),o($V81,$VR1),o($Va1,$VS1),o($Vx,$Vg,{28:559,50:560,36:561,39:$Vy}),o($Vx,$Vg,{50:562,36:563,39:$Vy}),o($V81,$Vx3),o($Va1,$Vy3),o($Va1,$Vz3),o($Va1,$VA3),{66:[1,564]},o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),o($Vw2,$Vv2,{80:345,188:346,79:565,186:$Vx2}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:566,117:$VI2,144:$VJ2,185:$VK2}),o($Vw2,$Vv2,{80:345,188:346,79:567,186:$Vx2}),o($Vo1,$Vz2,{95:179,91:568,97:$Vj1,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Vb3),o($Va1,$VB3),{38:569,41:570,44:334,45:335,46:336,47:$Vs2,48:337,49:$Vt2,66:$Vc1},o($VC,$VD,{61:571,63:572,68:573,40:574,74:575,114:576,47:$Vd1,49:$Vd1,66:$Vd1,75:$Vp2,76:$Vq2,77:$Vr2}),o($VC3,$Ve1),o($VC3,$Vf1,{64:577,60:578,69:579,88:580,90:581,91:585,95:586,92:[1,582],93:[1,583],94:[1,584],97:$VD3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:588,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VC3,$Vl1),o($VE3,$Vn1,{78:589}),o($VF3,$Vn1,{78:590}),o($VG3,$Vn1,{78:591}),o($VH3,$Vr1,{89:592}),o($VE3,$Vs1,{95:321,91:593,97:$Vo2,98:$VL,99:$VM,100:$VN}),o($VI3,$Vu1,{82:594}),o($VI3,$Vu1,{82:595}),o($VI3,$Vu1,{82:596}),o($VF3,$Vv1,{101:325,103:326,87:597,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),{115:[1,598],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VH3,$VA1),o($VH3,$VB1),o($VH3,$VC1),o($VH3,$VD1),o($VI3,$VE1),o($VF1,$VG1,{158:599}),o($VJ3,$VI1),{96:[1,600]},o($VH3,$VJ1),o($VI3,$Vq),o($VI3,$Vr),{96:[1,602],102:601,104:[1,603],105:[1,604],106:605,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,606]},o($VI3,$Vt),o($VI3,$Vu),{38:607,41:570,44:334,45:335,46:336,47:$Vs2,48:337,49:$Vt2,66:$Vc1},o($VC3,$V11),o($VC3,$V21),{19:[1,611],21:[1,615],22:609,32:608,196:610,210:612,211:[1,614],212:[1,613]},{66:$VP1},{46:616,47:$Vs2,66:$VQ1},o($VK3,$V91,{29:617,48:618,49:$Vt2}),o($VK3,$VR1),o($VC3,$VS1),o($Vx,$Vg,{28:619,50:620,36:621,39:$Vy}),o($Vx,$Vg,{50:622,36:623,39:$Vy}),o($VL3,$VM3),o($Vm1,$VN3),o($VL3,$VO3,{31:624,189:[1,625]}),{19:$VP3,21:$VQ3,22:627,125:626,195:$VR3,210:630,211:$VS3},o($Va1,$VT3),o($Vo1,$VN3),o($Va1,$VO3,{31:633,189:[1,634]}),{19:$VP3,21:$VQ3,22:627,125:635,195:$VR3,210:630,211:$VS3},o($Ve2,$VU3),o($Vp1,$VN3),o($Ve2,$VO3,{31:636,189:[1,637]}),{19:$VP3,21:$VQ3,22:627,125:638,195:$VR3,210:630,211:$VS3},o($Vq1,$VV3),o($Vt1,$VW3),o($Vt1,$VX3),o($Vt1,$VY3),{96:[1,639]},o($Vt1,$VJ1),{96:[1,641],102:640,104:[1,642],105:[1,643],106:644,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,645]},{117:[1,646]},{117:[2,138]},{117:$VZ3},{117:$V_3,129:647,130:648,131:$V$3},{117:$V04},o($V14,$V24),o($V14,$V34),o($V14,$V44,{135:650,138:651,139:654,136:$V54,137:$V64}),o($V74,$V84,{141:655,146:656,147:657,150:658,151:660,65:[1,659],156:$V94}),o($Va4,$Vb4),o($VG2,[2,164]),{19:[1,665],21:[1,669],22:663,145:662,196:664,210:666,211:[1,668],212:[1,667]},{19:[1,673],21:[1,677],22:671,145:670,196:672,210:674,211:[1,676],212:[1,675]},o($VC,[2,261],{22:375,196:376,210:378,32:678,19:$VL2,21:$VM2,211:$VN2,212:$VO2}),o($Vc4,[2,264]),o($Vc4,$Vl),o($Vc4,$Vm),o($Vc4,$Vq),o($Vc4,$Vr),o($Vc4,$Vs),o($Vc4,$Vt),o($Vc4,$Vu),o($VC,[2,139],{22:384,210:387,125:679,19:$VP2,21:$VQ2,195:$VR2,211:$VS2}),o($Vd4,[2,140]),o($Vd4,$Ve4),o($Vd4,$Vf4),o($Vd4,$Vq),o($Vd4,$Vr),o($Vd4,$Vt),o($Vd4,$Vu),o($Vt1,$Vg4),o($VF1,[2,180]),o($VF1,[2,181]),o($VF1,[2,182]),o($VF1,[2,183]),{164:680,165:681,166:684,167:682,168:685,169:683,170:686,175:[1,687]},o($VF1,[2,198],{171:688,173:689,174:[1,690]}),o($VF1,[2,207],{178:691,180:692,174:[1,693]}),o($VF1,[2,215],{182:694,183:695,174:$Vh4}),{174:$Vh4,183:697},o($Vi4,$Vq),o($Vi4,$Vr),o($Vi4,$Vj4),o($Vi4,$Vk4),o($Vi4,$Vl4),o($Vi4,$Vt),o($Vi4,$Vu),o($Vi4,$Vm4),o($Vi4,$Vn4,{198:698,199:699,107:[1,700]}),o($Vi4,$Vo4),o($Vi4,$Vp4),o($Vi4,$Vq4),o($Vi4,$Vr4),o($Vi4,$Vs4),o($Vi4,$Vt4),o($Vi4,$Vu4),o($Vi4,$Vv4),o($Vi4,$Vw4),o($Vx4,$Vg3),o($Vx4,$Vh3),o($Vx4,$Vi3),o($Vx4,$Vj3),{19:[1,703],21:[1,706],22:702,83:701,210:704,211:[1,705]},o($V81,$Va2,{48:707,49:[1,708]}),o($Va1,$Vb2),o($Va1,$Vd1,{61:709,63:710,68:711,40:712,74:713,114:717,75:[1,714],76:[1,715],77:[1,716],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:718,60:719,69:720,88:721,90:722,91:726,95:727,92:[1,723],93:[1,724],94:[1,725],97:$Vy4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:729,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:730}),o($Vo1,$Vn1,{78:731}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:732}),o($Vm1,$Vs1,{95:452,91:733,97:$Vq3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:734}),o($Vt1,$Vu1,{82:735}),o($Vt1,$Vu1,{82:736}),o($Vo1,$Vv1,{101:456,103:457,87:737,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:738}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,742],21:[1,746],22:740,32:739,196:741,210:743,211:[1,745],212:[1,744]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{158:747}),o($VH1,$VI1),{115:[1,748],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},{96:[1,749]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,751],102:750,104:[1,752],105:[1,753],106:754,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,755]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$Vb2),o($Va1,$Vd1,{61:756,63:757,68:758,40:759,74:760,114:764,75:[1,761],76:[1,762],77:[1,763],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:765,60:766,69:767,88:768,90:769,91:773,95:774,92:[1,770],93:[1,771],94:[1,772],97:$Vz4,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:776,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:777}),o($Vo1,$Vn1,{78:778}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:779}),o($Vm1,$Vs1,{95:488,91:780,97:$Vs3,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:781}),o($Vt1,$Vu1,{82:782}),o($Vt1,$Vu1,{82:783}),o($Vo1,$Vv1,{101:492,103:493,87:784,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:785}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,789],21:[1,793],22:787,32:786,196:788,210:790,211:[1,792],212:[1,791]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{158:794}),o($VH1,$VI1),{115:[1,795],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},{96:[1,796]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,798],102:797,104:[1,799],105:[1,800],106:801,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,802]},o($Vt1,$Vt),o($Vt1,$Vu),o($V9,$V92,{46:803,47:$V72}),o($V81,$Va2,{48:804,49:$V82}),o($Va1,$Vb2),o($Va1,$Vd1,{63:512,68:513,40:514,74:515,114:516,61:805,75:$V42,76:$V52,77:$V62,115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{60:518,69:519,88:520,90:521,91:525,95:526,64:806,92:$Vt3,93:$Vu3,94:$Vv3,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:807,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Ve2,$V11),o($Ve2,$V21),{19:[1,811],21:[1,815],22:809,32:808,196:810,210:812,211:[1,814],212:[1,813]},o($V9,$Vh2),o($V9,$Vi2),o($Va1,$Vj2),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:816}),{115:[1,817],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Va1,$Vl2),o($Va1,$Vm2),o($Vo1,$Vn1,{78:818}),o($Vn2,$Vr1,{89:819}),o($Vo1,$Vs1,{95:526,91:820,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,821]},o($Vn2,$VJ1),{66:[1,822]},o($Vu2,$Vv2,{79:823,80:824,188:825,186:[1,826]}),o($Vw2,$Vv2,{79:827,80:828,188:829,186:$VA4}),o($Vy2,$Vv2,{79:831,80:832,188:833,186:[1,834]}),o($Vm1,$Vz2,{95:259,91:835,97:$V12,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:836,91:837,87:838,95:839,101:841,103:842,97:$VB4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:836,91:837,87:838,95:839,101:841,103:842,97:$VB4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:836,91:837,87:838,95:839,101:841,103:842,97:$VB4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:843,117:$VI2,144:$VJ2,185:$VK2}),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,844],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($Vq1,$Vb3),o($VH1,$Vc3),o($VH1,$Vd3),o($VH1,$Ve3),o($VH1,$Vf3),{107:[1,845]},o($VH1,$Vk3),o($V9,$Vl3),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($V81,$Vm3),o($V9,$Vn3,{46:803,47:$V72}),o($Va1,$Vo3),o($V81,$Vp3),o($Va1,$Vb1,{54:846}),o($VC,$VD,{58:847,60:848,62:849,63:850,69:853,71:854,68:855,40:856,88:857,90:858,83:860,84:861,85:862,74:863,91:870,22:871,87:873,114:874,95:875,210:878,101:879,103:880,19:[1,877],21:[1,882],65:[1,851],67:[1,852],75:[1,864],76:[1,865],77:[1,866],81:[1,859],92:[1,867],93:[1,868],94:[1,869],97:$VC4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,872],211:[1,881]}),o($Va1,$Vr3),o($VC,$VD,{58:883,60:884,62:885,63:886,69:889,71:890,68:891,40:892,88:893,90:894,83:896,84:897,85:898,74:899,91:906,22:907,87:909,114:910,95:911,210:914,101:915,103:916,19:[1,913],21:[1,918],65:[1,887],67:[1,888],75:[1,900],76:[1,901],77:[1,902],81:[1,895],92:[1,903],93:[1,904],94:[1,905],97:$VD4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,908],211:[1,917]}),o($Va1,$VE4),o($Va1,$VU3),{117:[1,919]},o($Va1,$VM3),o($Vn2,$VV3),{66:$Vh2},{66:$Vi2},o($VC3,$Vj2),o($VC3,$Vk2),o($VC3,$Vf2),o($VC3,$Vg2),o($VF3,$Vn1,{78:920}),{115:[1,921],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VC3,$Vl2),o($VC3,$Vm2),o($VF3,$Vn1,{78:922}),o($VF4,$Vr1,{89:923}),o($VF3,$Vs1,{95:586,91:924,97:$VD3,98:$VL,99:$VM,100:$VN}),o($VF4,$VA1),o($VF4,$VB1),o($VF4,$VC1),o($VF4,$VD1),{96:[1,925]},o($VF4,$VJ1),{66:[1,926]},o($VG4,$Vv2,{79:927,80:928,188:929,186:[1,930]}),o($VH4,$Vv2,{79:931,80:932,188:933,186:$VI4}),o($VJ4,$Vv2,{79:935,80:936,188:937,186:[1,938]}),o($VE3,$Vz2,{95:321,91:939,97:$Vo2,98:$VL,99:$VM,100:$VN}),o($VH3,$VA2),o($VF3,$VB2,{86:940,91:941,87:942,95:943,101:945,103:946,97:$VK4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VD2,{86:940,91:941,87:942,95:943,101:945,103:946,97:$VK4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VE2,{86:940,91:941,87:942,95:943,101:945,103:946,97:$VK4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VJ3,$VF2),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:947,117:$VI2,144:$VJ2,185:$VK2}),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,948],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VH3,$Vb3),o($VJ3,$Vc3),o($VJ3,$Vd3),o($VJ3,$Ve3),o($VJ3,$Vf3),{107:[1,949]},o($VJ3,$Vk3),{66:$Vl3},o($VC3,$VT1),o($VC3,$Vl),o($VC3,$Vm),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vs),o($VC3,$Vt),o($VC3,$Vu),o($VK3,$Vm3),{46:950,47:$Vs2,66:$Vn3},o($VC3,$Vo3),o($VK3,$Vp3),o($VC3,$Vb1,{54:951}),o($VC,$VD,{58:952,60:953,62:954,63:955,69:958,71:959,68:960,40:961,88:962,90:963,83:965,84:966,85:967,74:968,91:975,22:976,87:978,114:979,95:980,210:983,101:984,103:985,19:[1,982],21:[1,987],65:[1,956],67:[1,957],75:[1,969],76:[1,970],77:[1,971],81:[1,964],92:[1,972],93:[1,973],94:[1,974],97:$VL4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,977],211:[1,986]}),o($VC3,$Vr3),o($VC,$VD,{58:988,60:989,62:990,63:991,69:994,71:995,68:996,40:997,88:998,90:999,83:1001,84:1002,85:1003,74:1004,91:1011,22:1012,87:1014,114:1015,95:1016,210:1019,101:1020,103:1021,19:[1,1018],21:[1,1023],65:[1,992],67:[1,993],75:[1,1005],76:[1,1006],77:[1,1007],81:[1,1000],92:[1,1008],93:[1,1009],94:[1,1010],97:$VM4,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,1013],211:[1,1022]}),o($Vu2,$VN4),{19:$Vn,21:$Vo,22:1024,210:52,211:$Vp},{19:$VO4,21:$VP4,22:1026,96:[1,1037],104:[1,1038],105:[1,1039],106:1036,177:1027,187:1025,192:1030,193:1031,194:1032,197:1035,200:[1,1040],201:[1,1041],202:[1,1046],203:[1,1047],204:[1,1048],205:[1,1049],206:[1,1042],207:[1,1043],208:[1,1044],209:[1,1045],210:1029,211:$VQ4},o($VR4,$Ve4),o($VR4,$Vf4),o($VR4,$Vq),o($VR4,$Vr),o($VR4,$Vt),o($VR4,$Vu),o($Vw2,$VN4),{19:$Vn,21:$Vo,22:1050,210:52,211:$Vp},{19:$VS4,21:$VT4,22:1052,96:[1,1063],104:[1,1064],105:[1,1065],106:1062,177:1053,187:1051,192:1056,193:1057,194:1058,197:1061,200:[1,1066],201:[1,1067],202:[1,1072],203:[1,1073],204:[1,1074],205:[1,1075],206:[1,1068],207:[1,1069],208:[1,1070],209:[1,1071],210:1055,211:$VU4},o($Vy2,$VN4),{19:$Vn,21:$Vo,22:1076,210:52,211:$Vp},{19:$VV4,21:$VW4,22:1078,96:[1,1089],104:[1,1090],105:[1,1091],106:1088,177:1079,187:1077,192:1082,193:1083,194:1084,197:1087,200:[1,1092],201:[1,1093],202:[1,1098],203:[1,1099],204:[1,1100],205:[1,1101],206:[1,1094],207:[1,1095],208:[1,1096],209:[1,1097],210:1081,211:$VX4},o($Vt1,$Vb3),o($Vt1,$Vc3),o($Vt1,$Vd3),o($Vt1,$Ve3),o($Vt1,$Vf3),{107:[1,1102]},o($Vt1,$Vk3),o($Vp1,$VY4),{117:$VZ4,130:1103,131:$V$3},o($V14,$V_4),o($VG2,$VH2,{132:365,133:366,134:367,140:368,142:369,143:370,127:1104,144:$VJ2,185:$VK2}),o($V14,$V$4),o($V14,$V44,{135:1105,139:1106,136:$V54,137:$V64}),o($VG2,$VH2,{140:368,142:369,143:370,134:1107,117:$V05,131:$V05,144:$VJ2,185:$VK2}),o($VG2,$VH2,{140:368,142:369,143:370,134:1108,117:$V15,131:$V15,144:$VJ2,185:$VK2}),o($Va4,$V25),o($Va4,$V35),o($Va4,$V45),o($Va4,$V55),{19:$V65,21:$V75,22:1110,125:1109,195:$V85,210:1113,211:$V95},o($VG2,$VH2,{143:370,122:1116,126:1117,127:1118,128:1119,132:1120,133:1121,134:1122,140:1123,142:1124,144:$VJ2,185:$Va5}),o($V74,[2,172]),o($V74,[2,177]),o($Va4,$Vb5),o($Va4,$Vc5),o($Va4,$Vd5),o($Va4,$Vq),o($Va4,$Vr),o($Va4,$Vs),o($Va4,$Vt),o($Va4,$Vu),o($VG2,[2,162]),o($VG2,$Vc5),o($VG2,$Vd5),o($VG2,$Vq),o($VG2,$Vr),o($VG2,$Vs),o($VG2,$Vt),o($VG2,$Vu),o($Vc4,[2,265]),o($Vd4,[2,141]),o($VF1,[2,184]),o($VF1,[2,191],{166:1126,175:$Ve5}),o($VF1,[2,192],{168:1128,175:$Vf5}),o($VF1,[2,193],{170:1130,175:$Vg5}),o($Vh5,[2,185]),o($Vh5,[2,187]),o($Vh5,[2,189]),{19:$Vi5,21:$Vj5,22:1132,96:$Vk5,104:$Vl5,105:$Vm5,106:1143,177:1133,181:$Vn5,192:1137,193:1138,194:1139,197:1142,200:$Vo5,201:$Vp5,202:$Vq5,203:$Vr5,204:$Vs5,205:$Vt5,206:$Vu5,207:$Vv5,208:$Vw5,209:$Vx5,210:1136,211:$Vy5},o($VF1,[2,194]),o($VF1,[2,199]),o($Vh5,[2,195],{172:1157}),o($VF1,[2,203]),o($VF1,[2,208]),o($Vh5,[2,204],{179:1158}),o($VF1,[2,210]),o($VF1,[2,216]),o($Vh5,[2,212],{184:1159}),o($VF1,[2,211]),o($Vi4,$Vz5),o($Vi4,$VA5),{19:$VU2,21:$VV2,22:1161,83:1160,210:401,211:$Va3},o($VH1,$VB5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Va1,$Vy3),o($Vx,$Vg,{50:1162,36:1163,39:$Vy}),o($Va1,$Vz3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:1164}),o($Va1,$V11),o($Va1,$V21),{19:[1,1168],21:[1,1172],22:1166,32:1165,196:1167,210:1169,211:[1,1171],212:[1,1170]},{115:[1,1173],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Va1,$VA3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:1174}),o($Vn2,$Vr1,{89:1175}),o($Vo1,$Vs1,{95:727,91:1176,97:$Vy4,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,1177]},o($Vn2,$VJ1),{66:[1,1178]},o($Vu2,$Vv2,{79:1179,80:1180,188:1181,186:[1,1182]}),o($Vw2,$Vv2,{79:1183,80:1184,188:1185,186:$VC5}),o($Vm1,$Vz2,{95:452,91:1187,97:$Vq3,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:1188,91:1189,87:1190,95:1191,101:1193,103:1194,97:$VD5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:1188,91:1189,87:1190,95:1191,101:1193,103:1194,97:$VD5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:1188,91:1189,87:1190,95:1191,101:1193,103:1194,97:$VD5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:1195,80:1196,188:1197,186:[1,1198]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,1199],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1200,117:$VI2,144:$VJ2,185:$VK2}),o($Vq1,$Vb3),o($VH1,$Vc3),o($VH1,$Vd3),o($VH1,$Ve3),o($VH1,$Vf3),{107:[1,1201]},o($VH1,$Vk3),o($Va1,$Vz3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:1202}),o($Va1,$V11),o($Va1,$V21),{19:[1,1206],21:[1,1210],22:1204,32:1203,196:1205,210:1207,211:[1,1209],212:[1,1208]},{115:[1,1211],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Va1,$VA3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:1212}),o($Vn2,$Vr1,{89:1213}),o($Vo1,$Vs1,{95:774,91:1214,97:$Vz4,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,1215]},o($Vn2,$VJ1),{66:[1,1216]},o($Vu2,$Vv2,{79:1217,80:1218,188:1219,186:[1,1220]}),o($Vw2,$Vv2,{79:1221,80:1222,188:1223,186:$VE5}),o($Vm1,$Vz2,{95:488,91:1225,97:$Vs3,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:1226,91:1227,87:1228,95:1229,101:1231,103:1232,97:$VF5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:1226,91:1227,87:1228,95:1229,101:1231,103:1232,97:$VF5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:1226,91:1227,87:1228,95:1229,101:1231,103:1232,97:$VF5,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:1233,80:1234,188:1235,186:[1,1236]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,1237],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1238,117:$VI2,144:$VJ2,185:$VK2}),o($Vq1,$Vb3),o($VH1,$Vc3),o($VH1,$Vd3),o($VH1,$Ve3),o($VH1,$Vf3),{107:[1,1239]},o($VH1,$Vk3),o($V81,$Vx3),o($Va1,$Vy3),o($Va1,$Vz3),o($Va1,$VA3),{66:[1,1240]},o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),o($Vw2,$Vv2,{80:828,188:829,79:1241,186:$VA4}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1242,117:$VI2,144:$VJ2,185:$VK2}),o($Vw2,$Vv2,{80:828,188:829,79:1243,186:$VA4}),o($Vo1,$Vz2,{95:526,91:1244,97:$Vw3,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Vb3),o($Va1,$VB3),o($VL3,$VM3),o($Vm1,$VN3),o($VL3,$VO3,{31:1245,189:[1,1246]}),{19:$VP3,21:$VQ3,22:627,125:1247,195:$VR3,210:630,211:$VS3},o($Va1,$VT3),o($Vo1,$VN3),o($Va1,$VO3,{31:1248,189:[1,1249]}),{19:$VP3,21:$VQ3,22:627,125:1250,195:$VR3,210:630,211:$VS3},o($Ve2,$VU3),o($Vp1,$VN3),o($Ve2,$VO3,{31:1251,189:[1,1252]}),{19:$VP3,21:$VQ3,22:627,125:1253,195:$VR3,210:630,211:$VS3},o($Vq1,$VV3),o($Vt1,$VW3),o($Vt1,$VX3),o($Vt1,$VY3),{96:[1,1254]},o($Vt1,$VJ1),{96:[1,1256],102:1255,104:[1,1257],105:[1,1258],106:1259,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,1260]},{117:[1,1261]},o($Vt1,$Vg4),{19:[1,1264],21:[1,1267],22:1263,83:1262,210:1265,211:[1,1266]},o($V81,$Va2,{48:1268,49:[1,1269]}),o($Va1,$Vb2),o($Va1,$Vd1,{61:1270,63:1271,68:1272,40:1273,74:1274,114:1278,75:[1,1275],76:[1,1276],77:[1,1277],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:1279,60:1280,69:1281,88:1282,90:1283,91:1287,95:1288,92:[1,1284],93:[1,1285],94:[1,1286],97:$VG5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1290,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:1291}),o($Vo1,$Vn1,{78:1292}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:1293}),o($Vm1,$Vs1,{95:875,91:1294,97:$VC4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1295}),o($Vt1,$Vu1,{82:1296}),o($Vt1,$Vu1,{82:1297}),o($Vo1,$Vv1,{101:879,103:880,87:1298,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1299}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,1303],21:[1,1307],22:1301,32:1300,196:1302,210:1304,211:[1,1306],212:[1,1305]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{158:1308}),o($VH1,$VI1),{115:[1,1309],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},{96:[1,1310]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1312],102:1311,104:[1,1313],105:[1,1314],106:1315,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,1316]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$Vb2),o($Va1,$Vd1,{61:1317,63:1318,68:1319,40:1320,74:1321,114:1325,75:[1,1322],76:[1,1323],77:[1,1324],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:1326,60:1327,69:1328,88:1329,90:1330,91:1334,95:1335,92:[1,1331],93:[1,1332],94:[1,1333],97:$VH5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1337,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:1338}),o($Vo1,$Vn1,{78:1339}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:1340}),o($Vm1,$Vs1,{95:911,91:1341,97:$VD4,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:1342}),o($Vt1,$Vu1,{82:1343}),o($Vt1,$Vu1,{82:1344}),o($Vo1,$Vv1,{101:915,103:916,87:1345,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:1346}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,1350],21:[1,1354],22:1348,32:1347,196:1349,210:1351,211:[1,1353],212:[1,1352]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{158:1355}),o($VH1,$VI1),{115:[1,1356],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},{96:[1,1357]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,1359],102:1358,104:[1,1360],105:[1,1361],106:1362,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,1363]},o($Vt1,$Vt),o($Vt1,$Vu),o($Vo1,$VY4),o($VH4,$Vv2,{80:932,188:933,79:1364,186:$VI4}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1365,117:$VI2,144:$VJ2,185:$VK2}),o($VH4,$Vv2,{80:932,188:933,79:1366,186:$VI4}),o($VF3,$Vz2,{95:586,91:1367,97:$VD3,98:$VL,99:$VM,100:$VN}),o($VF4,$VA2),o($VF4,$Vb3),o($VC3,$VB3),o($VI5,$VM3),o($VE3,$VN3),o($VI5,$VO3,{31:1368,189:[1,1369]}),{19:$VP3,21:$VQ3,22:627,125:1370,195:$VR3,210:630,211:$VS3},o($VC3,$VT3),o($VF3,$VN3),o($VC3,$VO3,{31:1371,189:[1,1372]}),{19:$VP3,21:$VQ3,22:627,125:1373,195:$VR3,210:630,211:$VS3},o($VJ5,$VU3),o($VG3,$VN3),o($VJ5,$VO3,{31:1374,189:[1,1375]}),{19:$VP3,21:$VQ3,22:627,125:1376,195:$VR3,210:630,211:$VS3},o($VH3,$VV3),o($VI3,$VW3),o($VI3,$VX3),o($VI3,$VY3),{96:[1,1377]},o($VI3,$VJ1),{96:[1,1379],102:1378,104:[1,1380],105:[1,1381],106:1382,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,1383]},{117:[1,1384]},o($VI3,$Vg4),{19:[1,1387],21:[1,1390],22:1386,83:1385,210:1388,211:[1,1389]},o($VK3,$Vx3),o($VK3,$Va2,{48:1391,49:[1,1392]}),o($VC3,$Vb2),o($VC,$VD,{61:1393,63:1394,68:1395,40:1396,74:1397,114:1401,47:$Vd1,49:$Vd1,66:$Vd1,75:[1,1398],76:[1,1399],77:[1,1400]}),o($VC3,$Vc2),o($VC3,$Vf1,{64:1402,60:1403,69:1404,88:1405,90:1406,91:1410,95:1411,92:[1,1407],93:[1,1408],94:[1,1409],97:$VK5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1413,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VC3,$Vd2),o($VE3,$Vn1,{78:1414}),o($VF3,$Vn1,{78:1415}),o($VJ5,$Vf2),o($VJ5,$Vg2),o($VH3,$Vr1,{89:1416}),o($VE3,$Vs1,{95:980,91:1417,97:$VL4,98:$VL,99:$VM,100:$VN}),o($VI3,$Vu1,{82:1418}),o($VI3,$Vu1,{82:1419}),o($VI3,$Vu1,{82:1420}),o($VF3,$Vv1,{101:984,103:985,87:1421,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VG3,$Vn1,{78:1422}),o($VJ5,$V11),o($VJ5,$V21),{19:[1,1426],21:[1,1430],22:1424,32:1423,196:1425,210:1427,211:[1,1429],212:[1,1428]},o($VH3,$VA1),o($VH3,$VB1),o($VH3,$VC1),o($VH3,$VD1),o($VI3,$VE1),o($VF1,$VG1,{158:1431}),o($VJ3,$VI1),{115:[1,1432],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},{96:[1,1433]},o($VH3,$VJ1),o($VI3,$Vq),o($VI3,$Vr),{96:[1,1435],102:1434,104:[1,1436],105:[1,1437],106:1438,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,1439]},o($VI3,$Vt),o($VI3,$Vu),o($VC3,$Vb2),o($VC,$VD,{61:1440,63:1441,68:1442,40:1443,74:1444,114:1448,47:$Vd1,49:$Vd1,66:$Vd1,75:[1,1445],76:[1,1446],77:[1,1447]}),o($VC3,$Vc2),o($VC3,$Vf1,{64:1449,60:1450,69:1451,88:1452,90:1453,91:1457,95:1458,92:[1,1454],93:[1,1455],94:[1,1456],97:$VL5,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:1460,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VC3,$Vd2),o($VE3,$Vn1,{78:1461}),o($VF3,$Vn1,{78:1462}),o($VJ5,$Vf2),o($VJ5,$Vg2),o($VH3,$Vr1,{89:1463}),o($VE3,$Vs1,{95:1016,91:1464,97:$VM4,98:$VL,99:$VM,100:$VN}),o($VI3,$Vu1,{82:1465}),o($VI3,$Vu1,{82:1466}),o($VI3,$Vu1,{82:1467}),o($VF3,$Vv1,{101:1020,103:1021,87:1468,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VG3,$Vn1,{78:1469}),o($VJ5,$V11),o($VJ5,$V21),{19:[1,1473],21:[1,1477],22:1471,32:1470,196:1472,210:1474,211:[1,1476],212:[1,1475]},o($VH3,$VA1),o($VH3,$VB1),o($VH3,$VC1),o($VH3,$VD1),o($VI3,$VE1),o($VF1,$VG1,{158:1478}),o($VJ3,$VI1),{115:[1,1479],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},{96:[1,1480]},o($VH3,$VJ1),o($VI3,$Vq),o($VI3,$Vr),{96:[1,1482],102:1481,104:[1,1483],105:[1,1484],106:1485,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,1486]},o($VI3,$Vt),o($VI3,$Vu),{189:[1,1489],190:1487,191:[1,1488]},o($Vm1,$VM5),o($Vm1,$VN5),o($Vm1,$VO5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vm4),o($Vm1,$Vn4,{198:1490,199:1491,107:[1,1492]}),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vr4),o($Vm1,$Vs4),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($VP5,$Vg3),o($VP5,$Vh3),o($VP5,$Vi3),o($VP5,$Vj3),{189:[1,1495],190:1493,191:[1,1494]},o($Vo1,$VM5),o($Vo1,$VN5),o($Vo1,$VO5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vm4),o($Vo1,$Vn4,{198:1496,199:1497,107:[1,1498]}),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vr4),o($Vo1,$Vs4),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($VQ5,$Vg3),o($VQ5,$Vh3),o($VQ5,$Vi3),o($VQ5,$Vj3),{189:[1,1501],190:1499,191:[1,1500]},o($Vp1,$VM5),o($Vp1,$VN5),o($Vp1,$VO5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vm4),o($Vp1,$Vn4,{198:1502,199:1503,107:[1,1504]}),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vr4),o($Vp1,$Vs4),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($VR5,$Vg3),o($VR5,$Vh3),o($VR5,$Vi3),o($VR5,$Vj3),{19:[1,1507],21:[1,1510],22:1506,83:1505,210:1508,211:[1,1509]},o($V14,$VS5),o($V14,$VT5),o($V14,$VU5),o($Va4,$VV5),o($Va4,$VW5),o($Va4,$VX5),o($Vx,$Vg,{42:1511,43:1512,51:1513,55:1514,36:1515,39:$Vy}),o($VY5,$Ve4),o($VY5,$Vf4),o($VY5,$Vq),o($VY5,$Vr),o($VY5,$Vt),o($VY5,$Vu),{66:[1,1516]},{66:$VZ3},{66:$V_3,129:1517,130:1518,131:$VZ5},{66:$V04},o($V_5,$V24),o($V_5,$V34),o($V_5,$V44,{135:1520,138:1521,139:1524,136:$V$5,137:$V06}),o($V74,$V84,{151:660,141:1525,146:1526,147:1527,150:1528,65:[1,1529],156:$V94}),o($V16,$Vb4),{19:[1,1533],21:[1,1537],22:1531,145:1530,196:1532,210:1534,211:[1,1536],212:[1,1535]},o($Vh5,[2,186]),{19:$Vi5,21:$Vj5,22:1132,210:1136,211:$Vy5},o($Vh5,[2,188]),{96:$Vk5,104:$Vl5,105:$Vm5,106:1143,177:1133,192:1137,193:1138,194:1139,197:1142,200:$Vo5,201:$Vp5,202:$Vq5,203:$Vr5,204:$Vs5,205:$Vt5,206:$Vu5,207:$Vv5,208:$Vw5,209:$Vx5},o($Vh5,[2,190]),{181:$Vn5},o($Vh5,$V26,{176:1538,174:$V36}),o($Vh5,$V26,{176:1540,174:$V36}),o($Vh5,$V26,{176:1541,174:$V36}),o($V46,$Vq),o($V46,$Vr),o($V46,$Vj4),o($V46,$Vk4),o($V46,$Vl4),o($V46,$Vt),o($V46,$Vu),o($V46,$Vm4),o($V46,$Vn4,{198:1542,199:1543,107:[1,1544]}),o($V46,$Vo4),o($V46,$Vp4),o($V46,$Vq4),o($V46,$Vr4),o($V46,$Vs4),o($V46,$Vt4),o($V46,$Vu4),o($V46,$Vv4),o($V46,$Vw4),o($V56,$Vg3),o($V56,$Vh3),o($V56,$Vi3),o($V56,$Vj3),o($VF1,[2,197],{166:1545,175:$Ve5}),o($VF1,[2,206],{168:1546,175:$Vf5}),o($VF1,[2,214],{170:1547,175:$Vg5}),o($Vi4,$V66),o($Vi4,$VE1),o($Va1,$Vr3),o($VC,$VD,{58:1548,60:1549,62:1550,63:1551,69:1554,71:1555,68:1556,40:1557,88:1558,90:1559,83:1561,84:1562,85:1563,74:1564,91:1571,22:1572,87:1574,114:1575,95:1576,210:1579,101:1580,103:1581,19:[1,1578],21:[1,1583],65:[1,1552],67:[1,1553],75:[1,1565],76:[1,1566],77:[1,1567],81:[1,1560],92:[1,1568],93:[1,1569],94:[1,1570],97:$V76,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,1573],211:[1,1582]}),o($Vw2,$Vv2,{80:1184,188:1185,79:1584,186:$VC5}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1585,117:$VI2,144:$VJ2,185:$VK2}),o($Vw2,$Vv2,{80:1184,188:1185,79:1586,186:$VC5}),o($Vo1,$Vz2,{95:727,91:1587,97:$Vy4,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Vb3),o($Va1,$VE4),o($VL3,$VM3),o($Vm1,$VN3),o($VL3,$VO3,{31:1588,189:[1,1589]}),{19:$VP3,21:$VQ3,22:627,125:1590,195:$VR3,210:630,211:$VS3},o($Va1,$VT3),o($Vo1,$VN3),o($Va1,$VO3,{31:1591,189:[1,1592]}),{19:$VP3,21:$VQ3,22:627,125:1593,195:$VR3,210:630,211:$VS3},o($Vq1,$VV3),o($Vt1,$VW3),o($Vt1,$VX3),o($Vt1,$VY3),{96:[1,1594]},o($Vt1,$VJ1),{96:[1,1596],102:1595,104:[1,1597],105:[1,1598],106:1599,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,1600]},o($Ve2,$VU3),o($Vp1,$VN3),o($Ve2,$VO3,{31:1601,189:[1,1602]}),{19:$VP3,21:$VQ3,22:627,125:1603,195:$VR3,210:630,211:$VS3},o($Vt1,$Vg4),{117:[1,1604]},{19:[1,1607],21:[1,1610],22:1606,83:1605,210:1608,211:[1,1609]},o($Vw2,$Vv2,{80:1222,188:1223,79:1611,186:$VE5}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1612,117:$VI2,144:$VJ2,185:$VK2}),o($Vw2,$Vv2,{80:1222,188:1223,79:1613,186:$VE5}),o($Vo1,$Vz2,{95:774,91:1614,97:$Vz4,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Vb3),o($Va1,$VE4),o($VL3,$VM3),o($Vm1,$VN3),o($VL3,$VO3,{31:1615,189:[1,1616]}),{19:$VP3,21:$VQ3,22:627,125:1617,195:$VR3,210:630,211:$VS3},o($Va1,$VT3),o($Vo1,$VN3),o($Va1,$VO3,{31:1618,189:[1,1619]}),{19:$VP3,21:$VQ3,22:627,125:1620,195:$VR3,210:630,211:$VS3},o($Vq1,$VV3),o($Vt1,$VW3),o($Vt1,$VX3),o($Vt1,$VY3),{96:[1,1621]},o($Vt1,$VJ1),{96:[1,1623],102:1622,104:[1,1624],105:[1,1625],106:1626,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,1627]},o($Ve2,$VU3),o($Vp1,$VN3),o($Ve2,$VO3,{31:1628,189:[1,1629]}),{19:$VP3,21:$VQ3,22:627,125:1630,195:$VR3,210:630,211:$VS3},o($Vt1,$Vg4),{117:[1,1631]},{19:[1,1634],21:[1,1637],22:1633,83:1632,210:1635,211:[1,1636]},o($Va1,$VE4),o($Va1,$VU3),{117:[1,1638]},o($Va1,$VM3),o($Vn2,$VV3),o($Vu2,$VN4),{19:$Vn,21:$Vo,22:1639,210:52,211:$Vp},{19:$V86,21:$V96,22:1641,96:[1,1652],104:[1,1653],105:[1,1654],106:1651,177:1642,187:1640,192:1645,193:1646,194:1647,197:1650,200:[1,1655],201:[1,1656],202:[1,1661],203:[1,1662],204:[1,1663],205:[1,1664],206:[1,1657],207:[1,1658],208:[1,1659],209:[1,1660],210:1644,211:$Va6},o($Vw2,$VN4),{19:$Vn,21:$Vo,22:1665,210:52,211:$Vp},{19:$Vb6,21:$Vc6,22:1667,96:[1,1678],104:[1,1679],105:[1,1680],106:1677,177:1668,187:1666,192:1671,193:1672,194:1673,197:1676,200:[1,1681],201:[1,1682],202:[1,1687],203:[1,1688],204:[1,1689],205:[1,1690],206:[1,1683],207:[1,1684],208:[1,1685],209:[1,1686],210:1670,211:$Vd6},o($Vy2,$VN4),{19:$Vn,21:$Vo,22:1691,210:52,211:$Vp},{19:$Ve6,21:$Vf6,22:1693,96:[1,1704],104:[1,1705],105:[1,1706],106:1703,177:1694,187:1692,192:1697,193:1698,194:1699,197:1702,200:[1,1707],201:[1,1708],202:[1,1713],203:[1,1714],204:[1,1715],205:[1,1716],206:[1,1709],207:[1,1710],208:[1,1711],209:[1,1712],210:1696,211:$Vg6},o($Vt1,$Vb3),o($Vt1,$Vc3),o($Vt1,$Vd3),o($Vt1,$Ve3),o($Vt1,$Vf3),{107:[1,1717]},o($Vt1,$Vk3),o($Vp1,$VY4),o($VH1,$VB5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Va1,$Vy3),o($Vx,$Vg,{50:1718,36:1719,39:$Vy}),o($Va1,$Vz3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:1720}),o($Va1,$V11),o($Va1,$V21),{19:[1,1724],21:[1,1728],22:1722,32:1721,196:1723,210:1725,211:[1,1727],212:[1,1726]},{115:[1,1729],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Va1,$VA3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:1730}),o($Vn2,$Vr1,{89:1731}),o($Vo1,$Vs1,{95:1288,91:1732,97:$VG5,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,1733]},o($Vn2,$VJ1),{66:[1,1734]},o($Vu2,$Vv2,{79:1735,80:1736,188:1737,186:[1,1738]}),o($Vw2,$Vv2,{79:1739,80:1740,188:1741,186:$Vh6}),o($Vm1,$Vz2,{95:875,91:1743,97:$VC4,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:1744,91:1745,87:1746,95:1747,101:1749,103:1750,97:$Vi6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:1744,91:1745,87:1746,95:1747,101:1749,103:1750,97:$Vi6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:1744,91:1745,87:1746,95:1747,101:1749,103:1750,97:$Vi6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:1751,80:1752,188:1753,186:[1,1754]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,1755],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1756,117:$VI2,144:$VJ2,185:$VK2}),o($Vq1,$Vb3),o($VH1,$Vc3),o($VH1,$Vd3),o($VH1,$Ve3),o($VH1,$Vf3),{107:[1,1757]},o($VH1,$Vk3),o($Va1,$Vz3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:1758}),o($Va1,$V11),o($Va1,$V21),{19:[1,1762],21:[1,1766],22:1760,32:1759,196:1761,210:1763,211:[1,1765],212:[1,1764]},{115:[1,1767],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Va1,$VA3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:1768}),o($Vn2,$Vr1,{89:1769}),o($Vo1,$Vs1,{95:1335,91:1770,97:$VH5,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,1771]},o($Vn2,$VJ1),{66:[1,1772]},o($Vu2,$Vv2,{79:1773,80:1774,188:1775,186:[1,1776]}),o($Vw2,$Vv2,{79:1777,80:1778,188:1779,186:$Vj6}),o($Vm1,$Vz2,{95:911,91:1781,97:$VD4,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:1782,91:1783,87:1784,95:1785,101:1787,103:1788,97:$Vk6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:1782,91:1783,87:1784,95:1785,101:1787,103:1788,97:$Vk6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:1782,91:1783,87:1784,95:1785,101:1787,103:1788,97:$Vk6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:1789,80:1790,188:1791,186:[1,1792]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,1793],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1794,117:$VI2,144:$VJ2,185:$VK2}),o($Vq1,$Vb3),o($VH1,$Vc3),o($VH1,$Vd3),o($VH1,$Ve3),o($VH1,$Vf3),{107:[1,1795]},o($VH1,$Vk3),o($VC3,$VU3),{117:[1,1796]},o($VC3,$VM3),o($VF4,$VV3),o($VG4,$VN4),{19:$Vn,21:$Vo,22:1797,210:52,211:$Vp},{19:$Vl6,21:$Vm6,22:1799,96:[1,1810],104:[1,1811],105:[1,1812],106:1809,177:1800,187:1798,192:1803,193:1804,194:1805,197:1808,200:[1,1813],201:[1,1814],202:[1,1819],203:[1,1820],204:[1,1821],205:[1,1822],206:[1,1815],207:[1,1816],208:[1,1817],209:[1,1818],210:1802,211:$Vn6},o($VH4,$VN4),{19:$Vn,21:$Vo,22:1823,210:52,211:$Vp},{19:$Vo6,21:$Vp6,22:1825,96:[1,1836],104:[1,1837],105:[1,1838],106:1835,177:1826,187:1824,192:1829,193:1830,194:1831,197:1834,200:[1,1839],201:[1,1840],202:[1,1845],203:[1,1846],204:[1,1847],205:[1,1848],206:[1,1841],207:[1,1842],208:[1,1843],209:[1,1844],210:1828,211:$Vq6},o($VJ4,$VN4),{19:$Vn,21:$Vo,22:1849,210:52,211:$Vp},{19:$Vr6,21:$Vs6,22:1851,96:[1,1862],104:[1,1863],105:[1,1864],106:1861,177:1852,187:1850,192:1855,193:1856,194:1857,197:1860,200:[1,1865],201:[1,1866],202:[1,1871],203:[1,1872],204:[1,1873],205:[1,1874],206:[1,1867],207:[1,1868],208:[1,1869],209:[1,1870],210:1854,211:$Vt6},o($VI3,$Vb3),o($VI3,$Vc3),o($VI3,$Vd3),o($VI3,$Ve3),o($VI3,$Vf3),{107:[1,1875]},o($VI3,$Vk3),o($VG3,$VY4),o($VJ3,$VB5),o($VJ3,$VE1),o($VJ3,$Vq),o($VJ3,$Vr),o($VJ3,$Vt),o($VJ3,$Vu),o($VC3,$Vy3),o($Vx,$Vg,{50:1876,36:1877,39:$Vy}),o($VC3,$Vz3),o($VC3,$Vk2),o($VC3,$Vf2),o($VC3,$Vg2),o($VF3,$Vn1,{78:1878}),o($VC3,$V11),o($VC3,$V21),{19:[1,1882],21:[1,1886],22:1880,32:1879,196:1881,210:1883,211:[1,1885],212:[1,1884]},{115:[1,1887],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VC3,$VA3),o($VC3,$Vm2),o($VF3,$Vn1,{78:1888}),o($VF4,$Vr1,{89:1889}),o($VF3,$Vs1,{95:1411,91:1890,97:$VK5,98:$VL,99:$VM,100:$VN}),o($VF4,$VA1),o($VF4,$VB1),o($VF4,$VC1),o($VF4,$VD1),{96:[1,1891]},o($VF4,$VJ1),{66:[1,1892]},o($VG4,$Vv2,{79:1893,80:1894,188:1895,186:[1,1896]}),o($VH4,$Vv2,{79:1897,80:1898,188:1899,186:$Vu6}),o($VE3,$Vz2,{95:980,91:1901,97:$VL4,98:$VL,99:$VM,100:$VN}),o($VH3,$VA2),o($VF3,$VB2,{86:1902,91:1903,87:1904,95:1905,101:1907,103:1908,97:$Vv6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VD2,{86:1902,91:1903,87:1904,95:1905,101:1907,103:1908,97:$Vv6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VE2,{86:1902,91:1903,87:1904,95:1905,101:1907,103:1908,97:$Vv6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VJ3,$VF2),o($VJ4,$Vv2,{79:1909,80:1910,188:1911,186:[1,1912]}),o($VJ5,$VT1),o($VJ5,$Vl),o($VJ5,$Vm),o($VJ5,$Vq),o($VJ5,$Vr),o($VJ5,$Vs),o($VJ5,$Vt),o($VJ5,$Vu),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,1913],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1914,117:$VI2,144:$VJ2,185:$VK2}),o($VH3,$Vb3),o($VJ3,$Vc3),o($VJ3,$Vd3),o($VJ3,$Ve3),o($VJ3,$Vf3),{107:[1,1915]},o($VJ3,$Vk3),o($VC3,$Vz3),o($VC3,$Vk2),o($VC3,$Vf2),o($VC3,$Vg2),o($VF3,$Vn1,{78:1916}),o($VC3,$V11),o($VC3,$V21),{19:[1,1920],21:[1,1924],22:1918,32:1917,196:1919,210:1921,211:[1,1923],212:[1,1922]},{115:[1,1925],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VC3,$VA3),o($VC3,$Vm2),o($VF3,$Vn1,{78:1926}),o($VF4,$Vr1,{89:1927}),o($VF3,$Vs1,{95:1458,91:1928,97:$VL5,98:$VL,99:$VM,100:$VN}),o($VF4,$VA1),o($VF4,$VB1),o($VF4,$VC1),o($VF4,$VD1),{96:[1,1929]},o($VF4,$VJ1),{66:[1,1930]},o($VG4,$Vv2,{79:1931,80:1932,188:1933,186:[1,1934]}),o($VH4,$Vv2,{79:1935,80:1936,188:1937,186:$Vw6}),o($VE3,$Vz2,{95:1016,91:1939,97:$VM4,98:$VL,99:$VM,100:$VN}),o($VH3,$VA2),o($VF3,$VB2,{86:1940,91:1941,87:1942,95:1943,101:1945,103:1946,97:$Vx6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VD2,{86:1940,91:1941,87:1942,95:1943,101:1945,103:1946,97:$Vx6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VE2,{86:1940,91:1941,87:1942,95:1943,101:1945,103:1946,97:$Vx6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VJ3,$VF2),o($VJ4,$Vv2,{79:1947,80:1948,188:1949,186:[1,1950]}),o($VJ5,$VT1),o($VJ5,$Vl),o($VJ5,$Vm),o($VJ5,$Vq),o($VJ5,$Vr),o($VJ5,$Vs),o($VJ5,$Vt),o($VJ5,$Vu),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,1951],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:1952,117:$VI2,144:$VJ2,185:$VK2}),o($VH3,$Vb3),o($VJ3,$Vc3),o($VJ3,$Vd3),o($VJ3,$Ve3),o($VJ3,$Vf3),{107:[1,1953]},o($VJ3,$Vk3),o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$Vz5),o($Vm1,$VA5),{19:$VO4,21:$VP4,22:1955,83:1954,210:1029,211:$VQ4},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$Vz5),o($Vo1,$VA5),{19:$VS4,21:$VT4,22:1957,83:1956,210:1055,211:$VU4},o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$Vz5),o($Vp1,$VA5),{19:$VV4,21:$VW4,22:1959,83:1958,210:1081,211:$VX4},o($Vt1,$VB5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy6,$Vz6,{148:1960,149:1961,152:$VA6,153:$VB6,154:$VC6,155:$VD6}),o($VE6,$VF6),o($VG6,$VH6,{52:1966}),o($VI6,$VJ6,{56:1967}),o($VC,$VD,{59:1968,69:1969,71:1970,72:1971,88:1974,90:1975,83:1977,84:1978,85:1979,74:1980,40:1981,91:1985,22:1986,87:1988,114:1989,95:1993,210:1996,101:1997,103:1998,19:[1,1995],21:[1,2000],65:[1,1972],67:[1,1973],75:[1,1990],76:[1,1991],77:[1,1992],81:[1,1976],92:[1,1982],93:[1,1983],94:[1,1984],97:$VK6,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,1987],211:[1,1999]}),o($Vy6,$Vz6,{149:1961,148:2001,152:$VA6,153:$VB6,154:$VC6,155:$VD6}),{66:$VZ4,130:2002,131:$VZ5},o($V_5,$V_4),o($VG2,$VH2,{143:370,132:1120,133:1121,134:1122,140:1123,142:1124,127:2003,144:$VJ2,185:$Va5}),o($V_5,$V$4),o($V_5,$V44,{135:2004,139:2005,136:$V$5,137:$V06}),o($VG2,$VH2,{143:370,140:1123,142:1124,134:2006,66:$V05,131:$V05,144:$VJ2,185:$Va5}),o($VG2,$VH2,{143:370,140:1123,142:1124,134:2007,66:$V15,131:$V15,144:$VJ2,185:$Va5}),o($V16,$V25),o($V16,$V35),o($V16,$V45),o($V16,$V55),{19:$V65,21:$V75,22:1110,125:2008,195:$V85,210:1113,211:$V95},o($VG2,$VH2,{143:370,126:1117,127:1118,128:1119,132:1120,133:1121,134:1122,140:1123,142:1124,122:2009,144:$VJ2,185:$Va5}),o($V16,$Vb5),o($V16,$Vc5),o($V16,$Vd5),o($V16,$Vq),o($V16,$Vr),o($V16,$Vs),o($V16,$Vt),o($V16,$Vu),o($Vh5,[2,200]),o($Vh5,[2,202]),o($Vh5,[2,209]),o($Vh5,[2,217]),o($V46,$Vz5),o($V46,$VA5),{19:$Vi5,21:$Vj5,22:2011,83:2010,210:1136,211:$Vy5},o($Vh5,[2,196]),o($Vh5,[2,205]),o($Vh5,[2,213]),o($Va1,$Vb2),o($Va1,$Vd1,{61:2012,63:2013,68:2014,40:2015,74:2016,114:2020,75:[1,2017],76:[1,2018],77:[1,2019],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:2021,60:2022,69:2023,88:2024,90:2025,91:2029,95:2030,92:[1,2026],93:[1,2027],94:[1,2028],97:$VL6,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2032,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:2033}),o($Vo1,$Vn1,{78:2034}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:2035}),o($Vm1,$Vs1,{95:1576,91:2036,97:$V76,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2037}),o($Vt1,$Vu1,{82:2038}),o($Vt1,$Vu1,{82:2039}),o($Vo1,$Vv1,{101:1580,103:1581,87:2040,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2041}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,2045],21:[1,2049],22:2043,32:2042,196:2044,210:2046,211:[1,2048],212:[1,2047]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{158:2050}),o($VH1,$VI1),{115:[1,2051],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},{96:[1,2052]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2054],102:2053,104:[1,2055],105:[1,2056],106:2057,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,2058]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VU3),{117:[1,2059]},o($Va1,$VM3),o($Vn2,$VV3),o($Vu2,$VN4),{19:$Vn,21:$Vo,22:2060,210:52,211:$Vp},{19:$VM6,21:$VN6,22:2062,96:[1,2073],104:[1,2074],105:[1,2075],106:2072,177:2063,187:2061,192:2066,193:2067,194:2068,197:2071,200:[1,2076],201:[1,2077],202:[1,2082],203:[1,2083],204:[1,2084],205:[1,2085],206:[1,2078],207:[1,2079],208:[1,2080],209:[1,2081],210:2065,211:$VO6},o($Vw2,$VN4),{19:$Vn,21:$Vo,22:2086,210:52,211:$Vp},{19:$VP6,21:$VQ6,22:2088,96:[1,2099],104:[1,2100],105:[1,2101],106:2098,177:2089,187:2087,192:2092,193:2093,194:2094,197:2097,200:[1,2102],201:[1,2103],202:[1,2108],203:[1,2109],204:[1,2110],205:[1,2111],206:[1,2104],207:[1,2105],208:[1,2106],209:[1,2107],210:2091,211:$VR6},o($Vt1,$Vb3),o($Vt1,$Vc3),o($Vt1,$Vd3),o($Vt1,$Ve3),o($Vt1,$Vf3),{107:[1,2112]},o($Vt1,$Vk3),o($Vy2,$VN4),{19:$Vn,21:$Vo,22:2113,210:52,211:$Vp},{19:$VS6,21:$VT6,22:2115,96:[1,2126],104:[1,2127],105:[1,2128],106:2125,177:2116,187:2114,192:2119,193:2120,194:2121,197:2124,200:[1,2129],201:[1,2130],202:[1,2135],203:[1,2136],204:[1,2137],205:[1,2138],206:[1,2131],207:[1,2132],208:[1,2133],209:[1,2134],210:2118,211:$VU6},o($Vp1,$VY4),o($VH1,$VB5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Va1,$VU3),{117:[1,2139]},o($Va1,$VM3),o($Vn2,$VV3),o($Vu2,$VN4),{19:$Vn,21:$Vo,22:2140,210:52,211:$Vp},{19:$VV6,21:$VW6,22:2142,96:[1,2153],104:[1,2154],105:[1,2155],106:2152,177:2143,187:2141,192:2146,193:2147,194:2148,197:2151,200:[1,2156],201:[1,2157],202:[1,2162],203:[1,2163],204:[1,2164],205:[1,2165],206:[1,2158],207:[1,2159],208:[1,2160],209:[1,2161],210:2145,211:$VX6},o($Vw2,$VN4),{19:$Vn,21:$Vo,22:2166,210:52,211:$Vp},{19:$VY6,21:$VZ6,22:2168,96:[1,2179],104:[1,2180],105:[1,2181],106:2178,177:2169,187:2167,192:2172,193:2173,194:2174,197:2177,200:[1,2182],201:[1,2183],202:[1,2188],203:[1,2189],204:[1,2190],205:[1,2191],206:[1,2184],207:[1,2185],208:[1,2186],209:[1,2187],210:2171,211:$V_6},o($Vt1,$Vb3),o($Vt1,$Vc3),o($Vt1,$Vd3),o($Vt1,$Ve3),o($Vt1,$Vf3),{107:[1,2192]},o($Vt1,$Vk3),o($Vy2,$VN4),{19:$Vn,21:$Vo,22:2193,210:52,211:$Vp},{19:$V$6,21:$V07,22:2195,96:[1,2206],104:[1,2207],105:[1,2208],106:2205,177:2196,187:2194,192:2199,193:2200,194:2201,197:2204,200:[1,2209],201:[1,2210],202:[1,2215],203:[1,2216],204:[1,2217],205:[1,2218],206:[1,2211],207:[1,2212],208:[1,2213],209:[1,2214],210:2198,211:$V17},o($Vp1,$VY4),o($VH1,$VB5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Vo1,$VY4),{189:[1,2221],190:2219,191:[1,2220]},o($Vm1,$VM5),o($Vm1,$VN5),o($Vm1,$VO5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vm4),o($Vm1,$Vn4,{198:2222,199:2223,107:[1,2224]}),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vr4),o($Vm1,$Vs4),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($VP5,$Vg3),o($VP5,$Vh3),o($VP5,$Vi3),o($VP5,$Vj3),{189:[1,2227],190:2225,191:[1,2226]},o($Vo1,$VM5),o($Vo1,$VN5),o($Vo1,$VO5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vm4),o($Vo1,$Vn4,{198:2228,199:2229,107:[1,2230]}),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vr4),o($Vo1,$Vs4),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($VQ5,$Vg3),o($VQ5,$Vh3),o($VQ5,$Vi3),o($VQ5,$Vj3),{189:[1,2233],190:2231,191:[1,2232]},o($Vp1,$VM5),o($Vp1,$VN5),o($Vp1,$VO5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vm4),o($Vp1,$Vn4,{198:2234,199:2235,107:[1,2236]}),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vr4),o($Vp1,$Vs4),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($VR5,$Vg3),o($VR5,$Vh3),o($VR5,$Vi3),o($VR5,$Vj3),{19:[1,2239],21:[1,2242],22:2238,83:2237,210:2240,211:[1,2241]},o($Va1,$Vr3),o($VC,$VD,{58:2243,60:2244,62:2245,63:2246,69:2249,71:2250,68:2251,40:2252,88:2253,90:2254,83:2256,84:2257,85:2258,74:2259,91:2266,22:2267,87:2269,114:2270,95:2271,210:2274,101:2275,103:2276,19:[1,2273],21:[1,2278],65:[1,2247],67:[1,2248],75:[1,2260],76:[1,2261],77:[1,2262],81:[1,2255],92:[1,2263],93:[1,2264],94:[1,2265],97:$V27,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,2268],211:[1,2277]}),o($Vw2,$Vv2,{80:1740,188:1741,79:2279,186:$Vh6}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:2280,117:$VI2,144:$VJ2,185:$VK2}),o($Vw2,$Vv2,{80:1740,188:1741,79:2281,186:$Vh6}),o($Vo1,$Vz2,{95:1288,91:2282,97:$VG5,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Vb3),o($Va1,$VE4),o($VL3,$VM3),o($Vm1,$VN3),o($VL3,$VO3,{31:2283,189:[1,2284]}),{19:$VP3,21:$VQ3,22:627,125:2285,195:$VR3,210:630,211:$VS3},o($Va1,$VT3),o($Vo1,$VN3),o($Va1,$VO3,{31:2286,189:[1,2287]}),{19:$VP3,21:$VQ3,22:627,125:2288,195:$VR3,210:630,211:$VS3},o($Vq1,$VV3),o($Vt1,$VW3),o($Vt1,$VX3),o($Vt1,$VY3),{96:[1,2289]},o($Vt1,$VJ1),{96:[1,2291],102:2290,104:[1,2292],105:[1,2293],106:2294,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,2295]},o($Ve2,$VU3),o($Vp1,$VN3),o($Ve2,$VO3,{31:2296,189:[1,2297]}),{19:$VP3,21:$VQ3,22:627,125:2298,195:$VR3,210:630,211:$VS3},o($Vt1,$Vg4),{117:[1,2299]},{19:[1,2302],21:[1,2305],22:2301,83:2300,210:2303,211:[1,2304]},o($Vw2,$Vv2,{80:1778,188:1779,79:2306,186:$Vj6}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:2307,117:$VI2,144:$VJ2,185:$VK2}),o($Vw2,$Vv2,{80:1778,188:1779,79:2308,186:$Vj6}),o($Vo1,$Vz2,{95:1335,91:2309,97:$VH5,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Vb3),o($Va1,$VE4),o($VL3,$VM3),o($Vm1,$VN3),o($VL3,$VO3,{31:2310,189:[1,2311]}),{19:$VP3,21:$VQ3,22:627,125:2312,195:$VR3,210:630,211:$VS3},o($Va1,$VT3),o($Vo1,$VN3),o($Va1,$VO3,{31:2313,189:[1,2314]}),{19:$VP3,21:$VQ3,22:627,125:2315,195:$VR3,210:630,211:$VS3},o($Vq1,$VV3),o($Vt1,$VW3),o($Vt1,$VX3),o($Vt1,$VY3),{96:[1,2316]},o($Vt1,$VJ1),{96:[1,2318],102:2317,104:[1,2319],105:[1,2320],106:2321,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,2322]},o($Ve2,$VU3),o($Vp1,$VN3),o($Ve2,$VO3,{31:2323,189:[1,2324]}),{19:$VP3,21:$VQ3,22:627,125:2325,195:$VR3,210:630,211:$VS3},o($Vt1,$Vg4),{117:[1,2326]},{19:[1,2329],21:[1,2332],22:2328,83:2327,210:2330,211:[1,2331]},o($VF3,$VY4),{189:[1,2335],190:2333,191:[1,2334]},o($VE3,$VM5),o($VE3,$VN5),o($VE3,$VO5),o($VE3,$Vq),o($VE3,$Vr),o($VE3,$Vj4),o($VE3,$Vk4),o($VE3,$Vl4),o($VE3,$Vt),o($VE3,$Vu),o($VE3,$Vm4),o($VE3,$Vn4,{198:2336,199:2337,107:[1,2338]}),o($VE3,$Vo4),o($VE3,$Vp4),o($VE3,$Vq4),o($VE3,$Vr4),o($VE3,$Vs4),o($VE3,$Vt4),o($VE3,$Vu4),o($VE3,$Vv4),o($VE3,$Vw4),o($V37,$Vg3),o($V37,$Vh3),o($V37,$Vi3),o($V37,$Vj3),{189:[1,2341],190:2339,191:[1,2340]},o($VF3,$VM5),o($VF3,$VN5),o($VF3,$VO5),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vj4),o($VF3,$Vk4),o($VF3,$Vl4),o($VF3,$Vt),o($VF3,$Vu),o($VF3,$Vm4),o($VF3,$Vn4,{198:2342,199:2343,107:[1,2344]}),o($VF3,$Vo4),o($VF3,$Vp4),o($VF3,$Vq4),o($VF3,$Vr4),o($VF3,$Vs4),o($VF3,$Vt4),o($VF3,$Vu4),o($VF3,$Vv4),o($VF3,$Vw4),o($V47,$Vg3),o($V47,$Vh3),o($V47,$Vi3),o($V47,$Vj3),{189:[1,2347],190:2345,191:[1,2346]},o($VG3,$VM5),o($VG3,$VN5),o($VG3,$VO5),o($VG3,$Vq),o($VG3,$Vr),o($VG3,$Vj4),o($VG3,$Vk4),o($VG3,$Vl4),o($VG3,$Vt),o($VG3,$Vu),o($VG3,$Vm4),o($VG3,$Vn4,{198:2348,199:2349,107:[1,2350]}),o($VG3,$Vo4),o($VG3,$Vp4),o($VG3,$Vq4),o($VG3,$Vr4),o($VG3,$Vs4),o($VG3,$Vt4),o($VG3,$Vu4),o($VG3,$Vv4),o($VG3,$Vw4),o($V57,$Vg3),o($V57,$Vh3),o($V57,$Vi3),o($V57,$Vj3),{19:[1,2353],21:[1,2356],22:2352,83:2351,210:2354,211:[1,2355]},o($VC3,$Vr3),o($VC,$VD,{58:2357,60:2358,62:2359,63:2360,69:2363,71:2364,68:2365,40:2366,88:2367,90:2368,83:2370,84:2371,85:2372,74:2373,91:2380,22:2381,87:2383,114:2384,95:2385,210:2388,101:2389,103:2390,19:[1,2387],21:[1,2392],65:[1,2361],67:[1,2362],75:[1,2374],76:[1,2375],77:[1,2376],81:[1,2369],92:[1,2377],93:[1,2378],94:[1,2379],97:$V67,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,2382],211:[1,2391]}),o($VH4,$Vv2,{80:1898,188:1899,79:2393,186:$Vu6}),o($VC3,$VT1),o($VC3,$Vl),o($VC3,$Vm),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vs),o($VC3,$Vt),o($VC3,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:2394,117:$VI2,144:$VJ2,185:$VK2}),o($VH4,$Vv2,{80:1898,188:1899,79:2395,186:$Vu6}),o($VF3,$Vz2,{95:1411,91:2396,97:$VK5,98:$VL,99:$VM,100:$VN}),o($VF4,$VA2),o($VF4,$Vb3),o($VC3,$VE4),o($VI5,$VM3),o($VE3,$VN3),o($VI5,$VO3,{31:2397,189:[1,2398]}),{19:$VP3,21:$VQ3,22:627,125:2399,195:$VR3,210:630,211:$VS3},o($VC3,$VT3),o($VF3,$VN3),o($VC3,$VO3,{31:2400,189:[1,2401]}),{19:$VP3,21:$VQ3,22:627,125:2402,195:$VR3,210:630,211:$VS3},o($VH3,$VV3),o($VI3,$VW3),o($VI3,$VX3),o($VI3,$VY3),{96:[1,2403]},o($VI3,$VJ1),{96:[1,2405],102:2404,104:[1,2406],105:[1,2407],106:2408,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,2409]},o($VJ5,$VU3),o($VG3,$VN3),o($VJ5,$VO3,{31:2410,189:[1,2411]}),{19:$VP3,21:$VQ3,22:627,125:2412,195:$VR3,210:630,211:$VS3},o($VI3,$Vg4),{117:[1,2413]},{19:[1,2416],21:[1,2419],22:2415,83:2414,210:2417,211:[1,2418]},o($VH4,$Vv2,{80:1936,188:1937,79:2420,186:$Vw6}),o($VC3,$VT1),o($VC3,$Vl),o($VC3,$Vm),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vs),o($VC3,$Vt),o($VC3,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:2421,117:$VI2,144:$VJ2,185:$VK2}),o($VH4,$Vv2,{80:1936,188:1937,79:2422,186:$Vw6}),o($VF3,$Vz2,{95:1458,91:2423,97:$VL5,98:$VL,99:$VM,100:$VN}),o($VF4,$VA2),o($VF4,$Vb3),o($VC3,$VE4),o($VI5,$VM3),o($VE3,$VN3),o($VI5,$VO3,{31:2424,189:[1,2425]}),{19:$VP3,21:$VQ3,22:627,125:2426,195:$VR3,210:630,211:$VS3},o($VC3,$VT3),o($VF3,$VN3),o($VC3,$VO3,{31:2427,189:[1,2428]}),{19:$VP3,21:$VQ3,22:627,125:2429,195:$VR3,210:630,211:$VS3},o($VH3,$VV3),o($VI3,$VW3),o($VI3,$VX3),o($VI3,$VY3),{96:[1,2430]},o($VI3,$VJ1),{96:[1,2432],102:2431,104:[1,2433],105:[1,2434],106:2435,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,2436]},o($VJ5,$VU3),o($VG3,$VN3),o($VJ5,$VO3,{31:2437,189:[1,2438]}),{19:$VP3,21:$VQ3,22:627,125:2439,195:$VR3,210:630,211:$VS3},o($VI3,$Vg4),{117:[1,2440]},{19:[1,2443],21:[1,2446],22:2442,83:2441,210:2444,211:[1,2445]},o($Vm1,$V66),o($Vm1,$VE1),o($Vo1,$V66),o($Vo1,$VE1),o($Vp1,$V66),o($Vp1,$VE1),o($Vy6,$Vn1,{78:2447}),o($Vy6,$V77),o($Vy6,$V87),o($Vy6,$V97),o($Vy6,$Va7),o($Vy6,$Vb7),o($VE6,$Vc7,{53:2448,47:[1,2449]}),o($VG6,$Vd7,{57:2450,49:[1,2451]}),o($VI6,$Ve7),o($VI6,$Vf7,{70:2452,72:2453,74:2454,40:2455,114:2456,75:[1,2457],76:[1,2458],77:[1,2459],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($VI6,$Vg7),o($VI6,$Vh7,{73:2460,69:2461,88:2462,90:2463,91:2467,95:2468,92:[1,2464],93:[1,2465],94:[1,2466],97:$Vi7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2470,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VI6,$Vj7),o($Vk7,$Vr1,{89:2471}),o($Vl7,$Vs1,{95:1993,91:2472,97:$VK6,98:$VL,99:$VM,100:$VN}),o($Vm7,$Vu1,{82:2473}),o($Vm7,$Vu1,{82:2474}),o($Vm7,$Vu1,{82:2475}),o($VI6,$Vv1,{101:1997,103:1998,87:2476,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vn7,$Vo7),o($Vn7,$Vp7),o($Vk7,$VA1),o($Vk7,$VB1),o($Vk7,$VC1),o($Vk7,$VD1),o($Vm7,$VE1),o($VF1,$VG1,{158:2477}),o($Vq7,$VI1),{115:[1,2478],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vn7,$V11),o($Vn7,$V21),{19:[1,2482],21:[1,2486],22:2480,32:2479,196:2481,210:2483,211:[1,2485],212:[1,2484]},{96:[1,2487]},o($Vk7,$VJ1),o($Vm7,$Vq),o($Vm7,$Vr),{96:[1,2489],102:2488,104:[1,2490],105:[1,2491],106:2492,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,2493]},o($Vm7,$Vt),o($Vm7,$Vu),o($Vy6,$Vn1,{78:2494}),o($V_5,$VS5),o($V_5,$VT5),o($V_5,$VU5),o($V16,$VV5),o($V16,$VW5),o($V16,$VX5),o($Vx,$Vg,{42:2495,43:2496,51:2497,55:2498,36:2499,39:$Vy}),{66:[1,2500]},o($V46,$V66),o($V46,$VE1),o($Va1,$Vz3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:2501}),o($Va1,$V11),o($Va1,$V21),{19:[1,2505],21:[1,2509],22:2503,32:2502,196:2504,210:2506,211:[1,2508],212:[1,2507]},{115:[1,2510],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Va1,$VA3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:2511}),o($Vn2,$Vr1,{89:2512}),o($Vo1,$Vs1,{95:2030,91:2513,97:$VL6,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,2514]},o($Vn2,$VJ1),{66:[1,2515]},o($Vu2,$Vv2,{79:2516,80:2517,188:2518,186:[1,2519]}),o($Vw2,$Vv2,{79:2520,80:2521,188:2522,186:$Vr7}),o($Vm1,$Vz2,{95:1576,91:2524,97:$V76,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:2525,91:2526,87:2527,95:2528,101:2530,103:2531,97:$Vs7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:2525,91:2526,87:2527,95:2528,101:2530,103:2531,97:$Vs7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:2525,91:2526,87:2527,95:2528,101:2530,103:2531,97:$Vs7,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:2532,80:2533,188:2534,186:[1,2535]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,2536],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:2537,117:$VI2,144:$VJ2,185:$VK2}),o($Vq1,$Vb3),o($VH1,$Vc3),o($VH1,$Vd3),o($VH1,$Ve3),o($VH1,$Vf3),{107:[1,2538]},o($VH1,$Vk3),o($Vo1,$VY4),{189:[1,2541],190:2539,191:[1,2540]},o($Vm1,$VM5),o($Vm1,$VN5),o($Vm1,$VO5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vm4),o($Vm1,$Vn4,{198:2542,199:2543,107:[1,2544]}),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vr4),o($Vm1,$Vs4),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($VP5,$Vg3),o($VP5,$Vh3),o($VP5,$Vi3),o($VP5,$Vj3),{189:[1,2547],190:2545,191:[1,2546]},o($Vo1,$VM5),o($Vo1,$VN5),o($Vo1,$VO5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vm4),o($Vo1,$Vn4,{198:2548,199:2549,107:[1,2550]}),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vr4),o($Vo1,$Vs4),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($VQ5,$Vg3),o($VQ5,$Vh3),o($VQ5,$Vi3),o($VQ5,$Vj3),{19:[1,2553],21:[1,2556],22:2552,83:2551,210:2554,211:[1,2555]},{189:[1,2559],190:2557,191:[1,2558]},o($Vp1,$VM5),o($Vp1,$VN5),o($Vp1,$VO5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vm4),o($Vp1,$Vn4,{198:2560,199:2561,107:[1,2562]}),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vr4),o($Vp1,$Vs4),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($VR5,$Vg3),o($VR5,$Vh3),o($VR5,$Vi3),o($VR5,$Vj3),o($Vo1,$VY4),{189:[1,2565],190:2563,191:[1,2564]},o($Vm1,$VM5),o($Vm1,$VN5),o($Vm1,$VO5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vm4),o($Vm1,$Vn4,{198:2566,199:2567,107:[1,2568]}),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vr4),o($Vm1,$Vs4),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($VP5,$Vg3),o($VP5,$Vh3),o($VP5,$Vi3),o($VP5,$Vj3),{189:[1,2571],190:2569,191:[1,2570]},o($Vo1,$VM5),o($Vo1,$VN5),o($Vo1,$VO5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vm4),o($Vo1,$Vn4,{198:2572,199:2573,107:[1,2574]}),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vr4),o($Vo1,$Vs4),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($VQ5,$Vg3),o($VQ5,$Vh3),o($VQ5,$Vi3),o($VQ5,$Vj3),{19:[1,2577],21:[1,2580],22:2576,83:2575,210:2578,211:[1,2579]},{189:[1,2583],190:2581,191:[1,2582]},o($Vp1,$VM5),o($Vp1,$VN5),o($Vp1,$VO5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vm4),o($Vp1,$Vn4,{198:2584,199:2585,107:[1,2586]}),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vr4),o($Vp1,$Vs4),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($VR5,$Vg3),o($VR5,$Vh3),o($VR5,$Vi3),o($VR5,$Vj3),o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$Vz5),o($Vm1,$VA5),{19:$V86,21:$V96,22:2588,83:2587,210:1644,211:$Va6},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$Vz5),o($Vo1,$VA5),{19:$Vb6,21:$Vc6,22:2590,83:2589,210:1670,211:$Vd6},o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$Vz5),o($Vp1,$VA5),{19:$Ve6,21:$Vf6,22:2592,83:2591,210:1696,211:$Vg6},o($Vt1,$VB5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$Vb2),o($Va1,$Vd1,{61:2593,63:2594,68:2595,40:2596,74:2597,114:2601,75:[1,2598],76:[1,2599],77:[1,2600],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Va1,$Vc2),o($Va1,$Vf1,{64:2602,60:2603,69:2604,88:2605,90:2606,91:2610,95:2611,92:[1,2607],93:[1,2608],94:[1,2609],97:$Vt7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2613,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Va1,$Vd2),o($Vm1,$Vn1,{78:2614}),o($Vo1,$Vn1,{78:2615}),o($Ve2,$Vf2),o($Ve2,$Vg2),o($Vq1,$Vr1,{89:2616}),o($Vm1,$Vs1,{95:2271,91:2617,97:$V27,98:$VL,99:$VM,100:$VN}),o($Vt1,$Vu1,{82:2618}),o($Vt1,$Vu1,{82:2619}),o($Vt1,$Vu1,{82:2620}),o($Vo1,$Vv1,{101:2275,103:2276,87:2621,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vp1,$Vn1,{78:2622}),o($Ve2,$V11),o($Ve2,$V21),{19:[1,2626],21:[1,2630],22:2624,32:2623,196:2625,210:2627,211:[1,2629],212:[1,2628]},o($Vq1,$VA1),o($Vq1,$VB1),o($Vq1,$VC1),o($Vq1,$VD1),o($Vt1,$VE1),o($VF1,$VG1,{158:2631}),o($VH1,$VI1),{115:[1,2632],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},{96:[1,2633]},o($Vq1,$VJ1),o($Vt1,$Vq),o($Vt1,$Vr),{96:[1,2635],102:2634,104:[1,2636],105:[1,2637],106:2638,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,2639]},o($Vt1,$Vt),o($Vt1,$Vu),o($Va1,$VU3),{117:[1,2640]},o($Va1,$VM3),o($Vn2,$VV3),o($Vu2,$VN4),{19:$Vn,21:$Vo,22:2641,210:52,211:$Vp},{19:$Vu7,21:$Vv7,22:2643,96:[1,2654],104:[1,2655],105:[1,2656],106:2653,177:2644,187:2642,192:2647,193:2648,194:2649,197:2652,200:[1,2657],201:[1,2658],202:[1,2663],203:[1,2664],204:[1,2665],205:[1,2666],206:[1,2659],207:[1,2660],208:[1,2661],209:[1,2662],210:2646,211:$Vw7},o($Vw2,$VN4),{19:$Vn,21:$Vo,22:2667,210:52,211:$Vp},{19:$Vx7,21:$Vy7,22:2669,96:[1,2680],104:[1,2681],105:[1,2682],106:2679,177:2670,187:2668,192:2673,193:2674,194:2675,197:2678,200:[1,2683],201:[1,2684],202:[1,2689],203:[1,2690],204:[1,2691],205:[1,2692],206:[1,2685],207:[1,2686],208:[1,2687],209:[1,2688],210:2672,211:$Vz7},o($Vt1,$Vb3),o($Vt1,$Vc3),o($Vt1,$Vd3),o($Vt1,$Ve3),o($Vt1,$Vf3),{107:[1,2693]},o($Vt1,$Vk3),o($Vy2,$VN4),{19:$Vn,21:$Vo,22:2694,210:52,211:$Vp},{19:$VA7,21:$VB7,22:2696,96:[1,2707],104:[1,2708],105:[1,2709],106:2706,177:2697,187:2695,192:2700,193:2701,194:2702,197:2705,200:[1,2710],201:[1,2711],202:[1,2716],203:[1,2717],204:[1,2718],205:[1,2719],206:[1,2712],207:[1,2713],208:[1,2714],209:[1,2715],210:2699,211:$VC7},o($Vp1,$VY4),o($VH1,$VB5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Va1,$VU3),{117:[1,2720]},o($Va1,$VM3),o($Vn2,$VV3),o($Vu2,$VN4),{19:$Vn,21:$Vo,22:2721,210:52,211:$Vp},{19:$VD7,21:$VE7,22:2723,96:[1,2734],104:[1,2735],105:[1,2736],106:2733,177:2724,187:2722,192:2727,193:2728,194:2729,197:2732,200:[1,2737],201:[1,2738],202:[1,2743],203:[1,2744],204:[1,2745],205:[1,2746],206:[1,2739],207:[1,2740],208:[1,2741],209:[1,2742],210:2726,211:$VF7},o($Vw2,$VN4),{19:$Vn,21:$Vo,22:2747,210:52,211:$Vp},{19:$VG7,21:$VH7,22:2749,96:[1,2760],104:[1,2761],105:[1,2762],106:2759,177:2750,187:2748,192:2753,193:2754,194:2755,197:2758,200:[1,2763],201:[1,2764],202:[1,2769],203:[1,2770],204:[1,2771],205:[1,2772],206:[1,2765],207:[1,2766],208:[1,2767],209:[1,2768],210:2752,211:$VI7},o($Vt1,$Vb3),o($Vt1,$Vc3),o($Vt1,$Vd3),o($Vt1,$Ve3),o($Vt1,$Vf3),{107:[1,2773]},o($Vt1,$Vk3),o($Vy2,$VN4),{19:$Vn,21:$Vo,22:2774,210:52,211:$Vp},{19:$VJ7,21:$VK7,22:2776,96:[1,2787],104:[1,2788],105:[1,2789],106:2786,177:2777,187:2775,192:2780,193:2781,194:2782,197:2785,200:[1,2790],201:[1,2791],202:[1,2796],203:[1,2797],204:[1,2798],205:[1,2799],206:[1,2792],207:[1,2793],208:[1,2794],209:[1,2795],210:2779,211:$VL7},o($Vp1,$VY4),o($VH1,$VB5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($VG4,$VU1),o($VG4,$VV1),o($VG4,$VW1),o($VE3,$Vz5),o($VE3,$VA5),{19:$Vl6,21:$Vm6,22:2801,83:2800,210:1802,211:$Vn6},o($VH4,$VU1),o($VH4,$VV1),o($VH4,$VW1),o($VF3,$Vz5),o($VF3,$VA5),{19:$Vo6,21:$Vp6,22:2803,83:2802,210:1828,211:$Vq6},o($VJ4,$VU1),o($VJ4,$VV1),o($VJ4,$VW1),o($VG3,$Vz5),o($VG3,$VA5),{19:$Vr6,21:$Vs6,22:2805,83:2804,210:1854,211:$Vt6},o($VI3,$VB5),o($VI3,$VE1),o($VI3,$Vq),o($VI3,$Vr),o($VI3,$Vt),o($VI3,$Vu),o($VC3,$Vb2),o($VC,$VD,{61:2806,63:2807,68:2808,40:2809,74:2810,114:2814,47:$Vd1,49:$Vd1,66:$Vd1,75:[1,2811],76:[1,2812],77:[1,2813]}),o($VC3,$Vc2),o($VC3,$Vf1,{64:2815,60:2816,69:2817,88:2818,90:2819,91:2823,95:2824,92:[1,2820],93:[1,2821],94:[1,2822],97:$VM7,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:2826,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VC3,$Vd2),o($VE3,$Vn1,{78:2827}),o($VF3,$Vn1,{78:2828}),o($VJ5,$Vf2),o($VJ5,$Vg2),o($VH3,$Vr1,{89:2829}),o($VE3,$Vs1,{95:2385,91:2830,97:$V67,98:$VL,99:$VM,100:$VN}),o($VI3,$Vu1,{82:2831}),o($VI3,$Vu1,{82:2832}),o($VI3,$Vu1,{82:2833}),o($VF3,$Vv1,{101:2389,103:2390,87:2834,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VG3,$Vn1,{78:2835}),o($VJ5,$V11),o($VJ5,$V21),{19:[1,2839],21:[1,2843],22:2837,32:2836,196:2838,210:2840,211:[1,2842],212:[1,2841]},o($VH3,$VA1),o($VH3,$VB1),o($VH3,$VC1),o($VH3,$VD1),o($VI3,$VE1),o($VF1,$VG1,{158:2844}),o($VJ3,$VI1),{115:[1,2845],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},{96:[1,2846]},o($VH3,$VJ1),o($VI3,$Vq),o($VI3,$Vr),{96:[1,2848],102:2847,104:[1,2849],105:[1,2850],106:2851,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,2852]},o($VI3,$Vt),o($VI3,$Vu),o($VC3,$VU3),{117:[1,2853]},o($VC3,$VM3),o($VF4,$VV3),o($VG4,$VN4),{19:$Vn,21:$Vo,22:2854,210:52,211:$Vp},{19:$VN7,21:$VO7,22:2856,96:[1,2867],104:[1,2868],105:[1,2869],106:2866,177:2857,187:2855,192:2860,193:2861,194:2862,197:2865,200:[1,2870],201:[1,2871],202:[1,2876],203:[1,2877],204:[1,2878],205:[1,2879],206:[1,2872],207:[1,2873],208:[1,2874],209:[1,2875],210:2859,211:$VP7},o($VH4,$VN4),{19:$Vn,21:$Vo,22:2880,210:52,211:$Vp},{19:$VQ7,21:$VR7,22:2882,96:[1,2893],104:[1,2894],105:[1,2895],106:2892,177:2883,187:2881,192:2886,193:2887,194:2888,197:2891,200:[1,2896],201:[1,2897],202:[1,2902],203:[1,2903],204:[1,2904],205:[1,2905],206:[1,2898],207:[1,2899],208:[1,2900],209:[1,2901],210:2885,211:$VS7},o($VI3,$Vb3),o($VI3,$Vc3),o($VI3,$Vd3),o($VI3,$Ve3),o($VI3,$Vf3),{107:[1,2906]},o($VI3,$Vk3),o($VJ4,$VN4),{19:$Vn,21:$Vo,22:2907,210:52,211:$Vp},{19:$VT7,21:$VU7,22:2909,96:[1,2920],104:[1,2921],105:[1,2922],106:2919,177:2910,187:2908,192:2913,193:2914,194:2915,197:2918,200:[1,2923],201:[1,2924],202:[1,2929],203:[1,2930],204:[1,2931],205:[1,2932],206:[1,2925],207:[1,2926],208:[1,2927],209:[1,2928],210:2912,211:$VV7},o($VG3,$VY4),o($VJ3,$VB5),o($VJ3,$VE1),o($VJ3,$Vq),o($VJ3,$Vr),o($VJ3,$Vt),o($VJ3,$Vu),o($VC3,$VU3),{117:[1,2933]},o($VC3,$VM3),o($VF4,$VV3),o($VG4,$VN4),{19:$Vn,21:$Vo,22:2934,210:52,211:$Vp},{19:$VW7,21:$VX7,22:2936,96:[1,2947],104:[1,2948],105:[1,2949],106:2946,177:2937,187:2935,192:2940,193:2941,194:2942,197:2945,200:[1,2950],201:[1,2951],202:[1,2956],203:[1,2957],204:[1,2958],205:[1,2959],206:[1,2952],207:[1,2953],208:[1,2954],209:[1,2955],210:2939,211:$VY7},o($VH4,$VN4),{19:$Vn,21:$Vo,22:2960,210:52,211:$Vp},{19:$VZ7,21:$V_7,22:2962,96:[1,2973],104:[1,2974],105:[1,2975],106:2972,177:2963,187:2961,192:2966,193:2967,194:2968,197:2971,200:[1,2976],201:[1,2977],202:[1,2982],203:[1,2983],204:[1,2984],205:[1,2985],206:[1,2978],207:[1,2979],208:[1,2980],209:[1,2981],210:2965,211:$V$7},o($VI3,$Vb3),o($VI3,$Vc3),o($VI3,$Vd3),o($VI3,$Ve3),o($VI3,$Vf3),{107:[1,2986]},o($VI3,$Vk3),o($VJ4,$VN4),{19:$Vn,21:$Vo,22:2987,210:52,211:$Vp},{19:$V08,21:$V18,22:2989,96:[1,3000],104:[1,3001],105:[1,3002],106:2999,177:2990,187:2988,192:2993,193:2994,194:2995,197:2998,200:[1,3003],201:[1,3004],202:[1,3009],203:[1,3010],204:[1,3011],205:[1,3012],206:[1,3005],207:[1,3006],208:[1,3007],209:[1,3008],210:2992,211:$V28},o($VG3,$VY4),o($VJ3,$VB5),o($VJ3,$VE1),o($VJ3,$Vq),o($VJ3,$Vr),o($VJ3,$Vt),o($VJ3,$Vu),o($V38,$Vv2,{79:3013,80:3014,188:3015,186:$V48}),o($VG6,$V58),o($Vx,$Vg,{51:3017,55:3018,36:3019,39:$Vy}),o($VI6,$V68),o($Vx,$Vg,{55:3020,36:3021,39:$Vy}),o($VI6,$V78),o($VI6,$V88),o($VI6,$Vo7),o($VI6,$Vp7),{115:[1,3022],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VI6,$V11),o($VI6,$V21),{19:[1,3026],21:[1,3030],22:3024,32:3023,196:3025,210:3027,211:[1,3029],212:[1,3028]},o($VI6,$V98),o($VI6,$Va8),o($Vb8,$Vr1,{89:3031}),o($VI6,$Vs1,{95:2468,91:3032,97:$Vi7,98:$VL,99:$VM,100:$VN}),o($Vb8,$VA1),o($Vb8,$VB1),o($Vb8,$VC1),o($Vb8,$VD1),{96:[1,3033]},o($Vb8,$VJ1),{66:[1,3034]},o($Vl7,$Vz2,{95:1993,91:3035,97:$VK6,98:$VL,99:$VM,100:$VN}),o($Vk7,$VA2),o($VI6,$VB2,{86:3036,91:3037,87:3038,95:3039,101:3041,103:3042,97:$Vc8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI6,$VD2,{86:3036,91:3037,87:3038,95:3039,101:3041,103:3042,97:$Vc8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI6,$VE2,{86:3036,91:3037,87:3038,95:3039,101:3041,103:3042,97:$Vc8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vq7,$VF2),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,3043],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3044,117:$VI2,144:$VJ2,185:$VK2}),o($Vn7,$VT1),o($Vn7,$Vl),o($Vn7,$Vm),o($Vn7,$Vq),o($Vn7,$Vr),o($Vn7,$Vs),o($Vn7,$Vt),o($Vn7,$Vu),o($Vk7,$Vb3),o($Vq7,$Vc3),o($Vq7,$Vd3),o($Vq7,$Ve3),o($Vq7,$Vf3),{107:[1,3045]},o($Vq7,$Vk3),o($V38,$Vv2,{80:3014,188:3015,79:3046,186:$V48}),o($Vd8,$Vz6,{148:3047,149:3048,152:$Ve8,153:$Vf8,154:$Vg8,155:$Vh8}),o($Vi8,$VF6),o($Vj8,$VH6,{52:3053}),o($Vk8,$VJ6,{56:3054}),o($VC,$VD,{59:3055,69:3056,71:3057,72:3058,88:3061,90:3062,83:3064,84:3065,85:3066,74:3067,40:3068,91:3072,22:3073,87:3075,114:3076,95:3080,210:3083,101:3084,103:3085,19:[1,3082],21:[1,3087],65:[1,3059],67:[1,3060],75:[1,3077],76:[1,3078],77:[1,3079],81:[1,3063],92:[1,3069],93:[1,3070],94:[1,3071],97:$Vl8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3074],211:[1,3086]}),o($Vd8,$Vz6,{149:3048,148:3088,152:$Ve8,153:$Vf8,154:$Vg8,155:$Vh8}),o($Vw2,$Vv2,{80:2521,188:2522,79:3089,186:$Vr7}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3090,117:$VI2,144:$VJ2,185:$VK2}),o($Vw2,$Vv2,{80:2521,188:2522,79:3091,186:$Vr7}),o($Vo1,$Vz2,{95:2030,91:3092,97:$VL6,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Vb3),o($Va1,$VE4),o($VL3,$VM3),o($Vm1,$VN3),o($VL3,$VO3,{31:3093,189:[1,3094]}),{19:$VP3,21:$VQ3,22:627,125:3095,195:$VR3,210:630,211:$VS3},o($Va1,$VT3),o($Vo1,$VN3),o($Va1,$VO3,{31:3096,189:[1,3097]}),{19:$VP3,21:$VQ3,22:627,125:3098,195:$VR3,210:630,211:$VS3},o($Vq1,$VV3),o($Vt1,$VW3),o($Vt1,$VX3),o($Vt1,$VY3),{96:[1,3099]},o($Vt1,$VJ1),{96:[1,3101],102:3100,104:[1,3102],105:[1,3103],106:3104,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,3105]},o($Ve2,$VU3),o($Vp1,$VN3),o($Ve2,$VO3,{31:3106,189:[1,3107]}),{19:$VP3,21:$VQ3,22:627,125:3108,195:$VR3,210:630,211:$VS3},o($Vt1,$Vg4),{117:[1,3109]},{19:[1,3112],21:[1,3115],22:3111,83:3110,210:3113,211:[1,3114]},o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$Vz5),o($Vm1,$VA5),{19:$VM6,21:$VN6,22:3117,83:3116,210:2065,211:$VO6},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$Vz5),o($Vo1,$VA5),{19:$VP6,21:$VQ6,22:3119,83:3118,210:2091,211:$VR6},o($Vt1,$VB5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$Vz5),o($Vp1,$VA5),{19:$VS6,21:$VT6,22:3121,83:3120,210:2118,211:$VU6},o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$Vz5),o($Vm1,$VA5),{19:$VV6,21:$VW6,22:3123,83:3122,210:2145,211:$VX6},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$Vz5),o($Vo1,$VA5),{19:$VY6,21:$VZ6,22:3125,83:3124,210:2171,211:$V_6},o($Vt1,$VB5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$Vz5),o($Vp1,$VA5),{19:$V$6,21:$V07,22:3127,83:3126,210:2198,211:$V17},o($Vm1,$V66),o($Vm1,$VE1),o($Vo1,$V66),o($Vo1,$VE1),o($Vp1,$V66),o($Vp1,$VE1),o($Va1,$Vz3),o($Va1,$Vk2),o($Va1,$Vf2),o($Va1,$Vg2),o($Vo1,$Vn1,{78:3128}),o($Va1,$V11),o($Va1,$V21),{19:[1,3132],21:[1,3136],22:3130,32:3129,196:3131,210:3133,211:[1,3135],212:[1,3134]},{115:[1,3137],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Va1,$VA3),o($Va1,$Vm2),o($Vo1,$Vn1,{78:3138}),o($Vn2,$Vr1,{89:3139}),o($Vo1,$Vs1,{95:2611,91:3140,97:$Vt7,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA1),o($Vn2,$VB1),o($Vn2,$VC1),o($Vn2,$VD1),{96:[1,3141]},o($Vn2,$VJ1),{66:[1,3142]},o($Vu2,$Vv2,{79:3143,80:3144,188:3145,186:[1,3146]}),o($Vw2,$Vv2,{79:3147,80:3148,188:3149,186:$Vm8}),o($Vm1,$Vz2,{95:2271,91:3151,97:$V27,98:$VL,99:$VM,100:$VN}),o($Vq1,$VA2),o($Vo1,$VB2,{86:3152,91:3153,87:3154,95:3155,101:3157,103:3158,97:$Vn8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VD2,{86:3152,91:3153,87:3154,95:3155,101:3157,103:3158,97:$Vn8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vo1,$VE2,{86:3152,91:3153,87:3154,95:3155,101:3157,103:3158,97:$Vn8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VH1,$VF2),o($Vy2,$Vv2,{79:3159,80:3160,188:3161,186:[1,3162]}),o($Ve2,$VT1),o($Ve2,$Vl),o($Ve2,$Vm),o($Ve2,$Vq),o($Ve2,$Vr),o($Ve2,$Vs),o($Ve2,$Vt),o($Ve2,$Vu),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,3163],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3164,117:$VI2,144:$VJ2,185:$VK2}),o($Vq1,$Vb3),o($VH1,$Vc3),o($VH1,$Vd3),o($VH1,$Ve3),o($VH1,$Vf3),{107:[1,3165]},o($VH1,$Vk3),o($Vo1,$VY4),{189:[1,3168],190:3166,191:[1,3167]},o($Vm1,$VM5),o($Vm1,$VN5),o($Vm1,$VO5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vm4),o($Vm1,$Vn4,{198:3169,199:3170,107:[1,3171]}),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vr4),o($Vm1,$Vs4),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($VP5,$Vg3),o($VP5,$Vh3),o($VP5,$Vi3),o($VP5,$Vj3),{189:[1,3174],190:3172,191:[1,3173]},o($Vo1,$VM5),o($Vo1,$VN5),o($Vo1,$VO5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vm4),o($Vo1,$Vn4,{198:3175,199:3176,107:[1,3177]}),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vr4),o($Vo1,$Vs4),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($VQ5,$Vg3),o($VQ5,$Vh3),o($VQ5,$Vi3),o($VQ5,$Vj3),{19:[1,3180],21:[1,3183],22:3179,83:3178,210:3181,211:[1,3182]},{189:[1,3186],190:3184,191:[1,3185]},o($Vp1,$VM5),o($Vp1,$VN5),o($Vp1,$VO5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vm4),o($Vp1,$Vn4,{198:3187,199:3188,107:[1,3189]}),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vr4),o($Vp1,$Vs4),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($VR5,$Vg3),o($VR5,$Vh3),o($VR5,$Vi3),o($VR5,$Vj3),o($Vo1,$VY4),{189:[1,3192],190:3190,191:[1,3191]},o($Vm1,$VM5),o($Vm1,$VN5),o($Vm1,$VO5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vm4),o($Vm1,$Vn4,{198:3193,199:3194,107:[1,3195]}),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vr4),o($Vm1,$Vs4),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($VP5,$Vg3),o($VP5,$Vh3),o($VP5,$Vi3),o($VP5,$Vj3),{189:[1,3198],190:3196,191:[1,3197]},o($Vo1,$VM5),o($Vo1,$VN5),o($Vo1,$VO5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vm4),o($Vo1,$Vn4,{198:3199,199:3200,107:[1,3201]}),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vr4),o($Vo1,$Vs4),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($VQ5,$Vg3),o($VQ5,$Vh3),o($VQ5,$Vi3),o($VQ5,$Vj3),{19:[1,3204],21:[1,3207],22:3203,83:3202,210:3205,211:[1,3206]},{189:[1,3210],190:3208,191:[1,3209]},o($Vp1,$VM5),o($Vp1,$VN5),o($Vp1,$VO5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vm4),o($Vp1,$Vn4,{198:3211,199:3212,107:[1,3213]}),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vr4),o($Vp1,$Vs4),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($VR5,$Vg3),o($VR5,$Vh3),o($VR5,$Vi3),o($VR5,$Vj3),o($VE3,$V66),o($VE3,$VE1),o($VF3,$V66),o($VF3,$VE1),o($VG3,$V66),o($VG3,$VE1),o($VC3,$Vz3),o($VC3,$Vk2),o($VC3,$Vf2),o($VC3,$Vg2),o($VF3,$Vn1,{78:3214}),o($VC3,$V11),o($VC3,$V21),{19:[1,3218],21:[1,3222],22:3216,32:3215,196:3217,210:3219,211:[1,3221],212:[1,3220]},{115:[1,3223],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VC3,$VA3),o($VC3,$Vm2),o($VF3,$Vn1,{78:3224}),o($VF4,$Vr1,{89:3225}),o($VF3,$Vs1,{95:2824,91:3226,97:$VM7,98:$VL,99:$VM,100:$VN}),o($VF4,$VA1),o($VF4,$VB1),o($VF4,$VC1),o($VF4,$VD1),{96:[1,3227]},o($VF4,$VJ1),{66:[1,3228]},o($VG4,$Vv2,{79:3229,80:3230,188:3231,186:[1,3232]}),o($VH4,$Vv2,{79:3233,80:3234,188:3235,186:$Vo8}),o($VE3,$Vz2,{95:2385,91:3237,97:$V67,98:$VL,99:$VM,100:$VN}),o($VH3,$VA2),o($VF3,$VB2,{86:3238,91:3239,87:3240,95:3241,101:3243,103:3244,97:$Vp8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VD2,{86:3238,91:3239,87:3240,95:3241,101:3243,103:3244,97:$Vp8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VF3,$VE2,{86:3238,91:3239,87:3240,95:3241,101:3243,103:3244,97:$Vp8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VJ3,$VF2),o($VJ4,$Vv2,{79:3245,80:3246,188:3247,186:[1,3248]}),o($VJ5,$VT1),o($VJ5,$Vl),o($VJ5,$Vm),o($VJ5,$Vq),o($VJ5,$Vr),o($VJ5,$Vs),o($VJ5,$Vt),o($VJ5,$Vu),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,3249],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3250,117:$VI2,144:$VJ2,185:$VK2}),o($VH3,$Vb3),o($VJ3,$Vc3),o($VJ3,$Vd3),o($VJ3,$Ve3),o($VJ3,$Vf3),{107:[1,3251]},o($VJ3,$Vk3),o($VF3,$VY4),{189:[1,3254],190:3252,191:[1,3253]},o($VE3,$VM5),o($VE3,$VN5),o($VE3,$VO5),o($VE3,$Vq),o($VE3,$Vr),o($VE3,$Vj4),o($VE3,$Vk4),o($VE3,$Vl4),o($VE3,$Vt),o($VE3,$Vu),o($VE3,$Vm4),o($VE3,$Vn4,{198:3255,199:3256,107:[1,3257]}),o($VE3,$Vo4),o($VE3,$Vp4),o($VE3,$Vq4),o($VE3,$Vr4),o($VE3,$Vs4),o($VE3,$Vt4),o($VE3,$Vu4),o($VE3,$Vv4),o($VE3,$Vw4),o($V37,$Vg3),o($V37,$Vh3),o($V37,$Vi3),o($V37,$Vj3),{189:[1,3260],190:3258,191:[1,3259]},o($VF3,$VM5),o($VF3,$VN5),o($VF3,$VO5),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vj4),o($VF3,$Vk4),o($VF3,$Vl4),o($VF3,$Vt),o($VF3,$Vu),o($VF3,$Vm4),o($VF3,$Vn4,{198:3261,199:3262,107:[1,3263]}),o($VF3,$Vo4),o($VF3,$Vp4),o($VF3,$Vq4),o($VF3,$Vr4),o($VF3,$Vs4),o($VF3,$Vt4),o($VF3,$Vu4),o($VF3,$Vv4),o($VF3,$Vw4),o($V47,$Vg3),o($V47,$Vh3),o($V47,$Vi3),o($V47,$Vj3),{19:[1,3266],21:[1,3269],22:3265,83:3264,210:3267,211:[1,3268]},{189:[1,3272],190:3270,191:[1,3271]},o($VG3,$VM5),o($VG3,$VN5),o($VG3,$VO5),o($VG3,$Vq),o($VG3,$Vr),o($VG3,$Vj4),o($VG3,$Vk4),o($VG3,$Vl4),o($VG3,$Vt),o($VG3,$Vu),o($VG3,$Vm4),o($VG3,$Vn4,{198:3273,199:3274,107:[1,3275]}),o($VG3,$Vo4),o($VG3,$Vp4),o($VG3,$Vq4),o($VG3,$Vr4),o($VG3,$Vs4),o($VG3,$Vt4),o($VG3,$Vu4),o($VG3,$Vv4),o($VG3,$Vw4),o($V57,$Vg3),o($V57,$Vh3),o($V57,$Vi3),o($V57,$Vj3),o($VF3,$VY4),{189:[1,3278],190:3276,191:[1,3277]},o($VE3,$VM5),o($VE3,$VN5),o($VE3,$VO5),o($VE3,$Vq),o($VE3,$Vr),o($VE3,$Vj4),o($VE3,$Vk4),o($VE3,$Vl4),o($VE3,$Vt),o($VE3,$Vu),o($VE3,$Vm4),o($VE3,$Vn4,{198:3279,199:3280,107:[1,3281]}),o($VE3,$Vo4),o($VE3,$Vp4),o($VE3,$Vq4),o($VE3,$Vr4),o($VE3,$Vs4),o($VE3,$Vt4),o($VE3,$Vu4),o($VE3,$Vv4),o($VE3,$Vw4),o($V37,$Vg3),o($V37,$Vh3),o($V37,$Vi3),o($V37,$Vj3),{189:[1,3284],190:3282,191:[1,3283]},o($VF3,$VM5),o($VF3,$VN5),o($VF3,$VO5),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vj4),o($VF3,$Vk4),o($VF3,$Vl4),o($VF3,$Vt),o($VF3,$Vu),o($VF3,$Vm4),o($VF3,$Vn4,{198:3285,199:3286,107:[1,3287]}),o($VF3,$Vo4),o($VF3,$Vp4),o($VF3,$Vq4),o($VF3,$Vr4),o($VF3,$Vs4),o($VF3,$Vt4),o($VF3,$Vu4),o($VF3,$Vv4),o($VF3,$Vw4),o($V47,$Vg3),o($V47,$Vh3),o($V47,$Vi3),o($V47,$Vj3),{19:[1,3290],21:[1,3293],22:3289,83:3288,210:3291,211:[1,3292]},{189:[1,3296],190:3294,191:[1,3295]},o($VG3,$VM5),o($VG3,$VN5),o($VG3,$VO5),o($VG3,$Vq),o($VG3,$Vr),o($VG3,$Vj4),o($VG3,$Vk4),o($VG3,$Vl4),o($VG3,$Vt),o($VG3,$Vu),o($VG3,$Vm4),o($VG3,$Vn4,{198:3297,199:3298,107:[1,3299]}),o($VG3,$Vo4),o($VG3,$Vp4),o($VG3,$Vq4),o($VG3,$Vr4),o($VG3,$Vs4),o($VG3,$Vt4),o($VG3,$Vu4),o($VG3,$Vv4),o($VG3,$Vw4),o($V57,$Vg3),o($V57,$Vh3),o($V57,$Vi3),o($V57,$Vj3),o($Va4,$Vq8),o($Vy6,$VN3),o($Va4,$VO3,{31:3300,189:[1,3301]}),{19:$VP3,21:$VQ3,22:627,125:3302,195:$VR3,210:630,211:$VS3},o($VG6,$Vr8),o($VI6,$VJ6,{56:3303}),o($VC,$VD,{59:3304,69:3305,71:3306,72:3307,88:3310,90:3311,83:3313,84:3314,85:3315,74:3316,40:3317,91:3321,22:3322,87:3324,114:3325,95:3329,210:3332,101:3333,103:3334,19:[1,3331],21:[1,3336],65:[1,3308],67:[1,3309],75:[1,3326],76:[1,3327],77:[1,3328],81:[1,3312],92:[1,3318],93:[1,3319],94:[1,3320],97:$Vs8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3323],211:[1,3335]}),o($VI6,$Vt8),o($VC,$VD,{59:3337,69:3338,71:3339,72:3340,88:3343,90:3344,83:3346,84:3347,85:3348,74:3349,40:3350,91:3354,22:3355,87:3357,114:3358,95:3362,210:3365,101:3366,103:3367,19:[1,3364],21:[1,3369],65:[1,3341],67:[1,3342],75:[1,3359],76:[1,3360],77:[1,3361],81:[1,3345],92:[1,3351],93:[1,3352],94:[1,3353],97:$Vu8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,3356],211:[1,3368]}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3370,117:$VI2,144:$VJ2,185:$VK2}),o($VI6,$VT1),o($VI6,$Vl),o($VI6,$Vm),o($VI6,$Vq),o($VI6,$Vr),o($VI6,$Vs),o($VI6,$Vt),o($VI6,$Vu),o($VI6,$Vz2,{95:2468,91:3371,97:$Vi7,98:$VL,99:$VM,100:$VN}),o($Vb8,$VA2),o($Vb8,$Vb3),o($VI6,$Vv8),o($Vk7,$VV3),o($Vm7,$VW3),o($Vm7,$VX3),o($Vm7,$VY3),{96:[1,3372]},o($Vm7,$VJ1),{96:[1,3374],102:3373,104:[1,3375],105:[1,3376],106:3377,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,3378]},o($Vm7,$Vg4),{117:[1,3379]},{19:[1,3382],21:[1,3385],22:3381,83:3380,210:3383,211:[1,3384]},o($Va4,$Vw8),o($Vd8,$Vn1,{78:3386}),o($Vd8,$V77),o($Vd8,$V87),o($Vd8,$V97),o($Vd8,$Va7),o($Vd8,$Vb7),o($Vi8,$Vc7,{53:3387,47:[1,3388]}),o($Vj8,$Vd7,{57:3389,49:[1,3390]}),o($Vk8,$Ve7),o($Vk8,$Vf7,{70:3391,72:3392,74:3393,40:3394,114:3395,75:[1,3396],76:[1,3397],77:[1,3398],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Vk8,$Vg7),o($Vk8,$Vh7,{73:3399,69:3400,88:3401,90:3402,91:3406,95:3407,92:[1,3403],93:[1,3404],94:[1,3405],97:$Vx8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3409,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vk8,$Vj7),o($Vy8,$Vr1,{89:3410}),o($Vz8,$Vs1,{95:3080,91:3411,97:$Vl8,98:$VL,99:$VM,100:$VN}),o($VA8,$Vu1,{82:3412}),o($VA8,$Vu1,{82:3413}),o($VA8,$Vu1,{82:3414}),o($Vk8,$Vv1,{101:3084,103:3085,87:3415,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB8,$Vo7),o($VB8,$Vp7),o($Vy8,$VA1),o($Vy8,$VB1),o($Vy8,$VC1),o($Vy8,$VD1),o($VA8,$VE1),o($VF1,$VG1,{158:3416}),o($VC8,$VI1),{115:[1,3417],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VB8,$V11),o($VB8,$V21),{19:[1,3421],21:[1,3425],22:3419,32:3418,196:3420,210:3422,211:[1,3424],212:[1,3423]},{96:[1,3426]},o($Vy8,$VJ1),o($VA8,$Vq),o($VA8,$Vr),{96:[1,3428],102:3427,104:[1,3429],105:[1,3430],106:3431,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,3432]},o($VA8,$Vt),o($VA8,$Vu),o($Vd8,$Vn1,{78:3433}),o($Va1,$VU3),{117:[1,3434]},o($Va1,$VM3),o($Vn2,$VV3),o($Vu2,$VN4),{19:$Vn,21:$Vo,22:3435,210:52,211:$Vp},{19:$VD8,21:$VE8,22:3437,96:[1,3448],104:[1,3449],105:[1,3450],106:3447,177:3438,187:3436,192:3441,193:3442,194:3443,197:3446,200:[1,3451],201:[1,3452],202:[1,3457],203:[1,3458],204:[1,3459],205:[1,3460],206:[1,3453],207:[1,3454],208:[1,3455],209:[1,3456],210:3440,211:$VF8},o($Vw2,$VN4),{19:$Vn,21:$Vo,22:3461,210:52,211:$Vp},{19:$VG8,21:$VH8,22:3463,96:[1,3474],104:[1,3475],105:[1,3476],106:3473,177:3464,187:3462,192:3467,193:3468,194:3469,197:3472,200:[1,3477],201:[1,3478],202:[1,3483],203:[1,3484],204:[1,3485],205:[1,3486],206:[1,3479],207:[1,3480],208:[1,3481],209:[1,3482],210:3466,211:$VI8},o($Vt1,$Vb3),o($Vt1,$Vc3),o($Vt1,$Vd3),o($Vt1,$Ve3),o($Vt1,$Vf3),{107:[1,3487]},o($Vt1,$Vk3),o($Vy2,$VN4),{19:$Vn,21:$Vo,22:3488,210:52,211:$Vp},{19:$VJ8,21:$VK8,22:3490,96:[1,3501],104:[1,3502],105:[1,3503],106:3500,177:3491,187:3489,192:3494,193:3495,194:3496,197:3499,200:[1,3504],201:[1,3505],202:[1,3510],203:[1,3511],204:[1,3512],205:[1,3513],206:[1,3506],207:[1,3507],208:[1,3508],209:[1,3509],210:3493,211:$VL8},o($Vp1,$VY4),o($VH1,$VB5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Vm1,$V66),o($Vm1,$VE1),o($Vo1,$V66),o($Vo1,$VE1),o($Vp1,$V66),o($Vp1,$VE1),o($Vm1,$V66),o($Vm1,$VE1),o($Vo1,$V66),o($Vo1,$VE1),o($Vp1,$V66),o($Vp1,$VE1),o($Vw2,$Vv2,{80:3148,188:3149,79:3514,186:$Vm8}),o($Va1,$VT1),o($Va1,$Vl),o($Va1,$Vm),o($Va1,$Vq),o($Va1,$Vr),o($Va1,$Vs),o($Va1,$Vt),o($Va1,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3515,117:$VI2,144:$VJ2,185:$VK2}),o($Vw2,$Vv2,{80:3148,188:3149,79:3516,186:$Vm8}),o($Vo1,$Vz2,{95:2611,91:3517,97:$Vt7,98:$VL,99:$VM,100:$VN}),o($Vn2,$VA2),o($Vn2,$Vb3),o($Va1,$VE4),o($VL3,$VM3),o($Vm1,$VN3),o($VL3,$VO3,{31:3518,189:[1,3519]}),{19:$VP3,21:$VQ3,22:627,125:3520,195:$VR3,210:630,211:$VS3},o($Va1,$VT3),o($Vo1,$VN3),o($Va1,$VO3,{31:3521,189:[1,3522]}),{19:$VP3,21:$VQ3,22:627,125:3523,195:$VR3,210:630,211:$VS3},o($Vq1,$VV3),o($Vt1,$VW3),o($Vt1,$VX3),o($Vt1,$VY3),{96:[1,3524]},o($Vt1,$VJ1),{96:[1,3526],102:3525,104:[1,3527],105:[1,3528],106:3529,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,3530]},o($Ve2,$VU3),o($Vp1,$VN3),o($Ve2,$VO3,{31:3531,189:[1,3532]}),{19:$VP3,21:$VQ3,22:627,125:3533,195:$VR3,210:630,211:$VS3},o($Vt1,$Vg4),{117:[1,3534]},{19:[1,3537],21:[1,3540],22:3536,83:3535,210:3538,211:[1,3539]},o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$Vz5),o($Vm1,$VA5),{19:$Vu7,21:$Vv7,22:3542,83:3541,210:2646,211:$Vw7},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$Vz5),o($Vo1,$VA5),{19:$Vx7,21:$Vy7,22:3544,83:3543,210:2672,211:$Vz7},o($Vt1,$VB5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$Vz5),o($Vp1,$VA5),{19:$VA7,21:$VB7,22:3546,83:3545,210:2699,211:$VC7},o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$Vz5),o($Vm1,$VA5),{19:$VD7,21:$VE7,22:3548,83:3547,210:2726,211:$VF7},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$Vz5),o($Vo1,$VA5),{19:$VG7,21:$VH7,22:3550,83:3549,210:2752,211:$VI7},o($Vt1,$VB5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$Vz5),o($Vp1,$VA5),{19:$VJ7,21:$VK7,22:3552,83:3551,210:2779,211:$VL7},o($VH4,$Vv2,{80:3234,188:3235,79:3553,186:$Vo8}),o($VC3,$VT1),o($VC3,$Vl),o($VC3,$Vm),o($VC3,$Vq),o($VC3,$Vr),o($VC3,$Vs),o($VC3,$Vt),o($VC3,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3554,117:$VI2,144:$VJ2,185:$VK2}),o($VH4,$Vv2,{80:3234,188:3235,79:3555,186:$Vo8}),o($VF3,$Vz2,{95:2824,91:3556,97:$VM7,98:$VL,99:$VM,100:$VN}),o($VF4,$VA2),o($VF4,$Vb3),o($VC3,$VE4),o($VI5,$VM3),o($VE3,$VN3),o($VI5,$VO3,{31:3557,189:[1,3558]}),{19:$VP3,21:$VQ3,22:627,125:3559,195:$VR3,210:630,211:$VS3},o($VC3,$VT3),o($VF3,$VN3),o($VC3,$VO3,{31:3560,189:[1,3561]}),{19:$VP3,21:$VQ3,22:627,125:3562,195:$VR3,210:630,211:$VS3},o($VH3,$VV3),o($VI3,$VW3),o($VI3,$VX3),o($VI3,$VY3),{96:[1,3563]},o($VI3,$VJ1),{96:[1,3565],102:3564,104:[1,3566],105:[1,3567],106:3568,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,3569]},o($VJ5,$VU3),o($VG3,$VN3),o($VJ5,$VO3,{31:3570,189:[1,3571]}),{19:$VP3,21:$VQ3,22:627,125:3572,195:$VR3,210:630,211:$VS3},o($VI3,$Vg4),{117:[1,3573]},{19:[1,3576],21:[1,3579],22:3575,83:3574,210:3577,211:[1,3578]},o($VG4,$VU1),o($VG4,$VV1),o($VG4,$VW1),o($VE3,$Vz5),o($VE3,$VA5),{19:$VN7,21:$VO7,22:3581,83:3580,210:2859,211:$VP7},o($VH4,$VU1),o($VH4,$VV1),o($VH4,$VW1),o($VF3,$Vz5),o($VF3,$VA5),{19:$VQ7,21:$VR7,22:3583,83:3582,210:2885,211:$VS7},o($VI3,$VB5),o($VI3,$VE1),o($VI3,$Vq),o($VI3,$Vr),o($VI3,$Vt),o($VI3,$Vu),o($VJ4,$VU1),o($VJ4,$VV1),o($VJ4,$VW1),o($VG3,$Vz5),o($VG3,$VA5),{19:$VT7,21:$VU7,22:3585,83:3584,210:2912,211:$VV7},o($VG4,$VU1),o($VG4,$VV1),o($VG4,$VW1),o($VE3,$Vz5),o($VE3,$VA5),{19:$VW7,21:$VX7,22:3587,83:3586,210:2939,211:$VY7},o($VH4,$VU1),o($VH4,$VV1),o($VH4,$VW1),o($VF3,$Vz5),o($VF3,$VA5),{19:$VZ7,21:$V_7,22:3589,83:3588,210:2965,211:$V$7},o($VI3,$VB5),o($VI3,$VE1),o($VI3,$Vq),o($VI3,$Vr),o($VI3,$Vt),o($VI3,$Vu),o($VJ4,$VU1),o($VJ4,$VV1),o($VJ4,$VW1),o($VG3,$Vz5),o($VG3,$VA5),{19:$V08,21:$V18,22:3591,83:3590,210:2992,211:$V28},o($V38,$VN4),{19:$Vn,21:$Vo,22:3592,210:52,211:$Vp},{19:$VM8,21:$VN8,22:3594,96:[1,3605],104:[1,3606],105:[1,3607],106:3604,177:3595,187:3593,192:3598,193:3599,194:3600,197:3603,200:[1,3608],201:[1,3609],202:[1,3614],203:[1,3615],204:[1,3616],205:[1,3617],206:[1,3610],207:[1,3611],208:[1,3612],209:[1,3613],210:3597,211:$VO8},o($VG6,$Vd7,{57:3618,49:[1,3619]}),o($VI6,$Ve7),o($VI6,$Vf7,{70:3620,72:3621,74:3622,40:3623,114:3624,75:[1,3625],76:[1,3626],77:[1,3627],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($VI6,$Vg7),o($VI6,$Vh7,{73:3628,69:3629,88:3630,90:3631,91:3635,95:3636,92:[1,3632],93:[1,3633],94:[1,3634],97:$VP8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3638,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VI6,$Vj7),o($Vk7,$Vr1,{89:3639}),o($Vl7,$Vs1,{95:3329,91:3640,97:$Vs8,98:$VL,99:$VM,100:$VN}),o($Vm7,$Vu1,{82:3641}),o($Vm7,$Vu1,{82:3642}),o($Vm7,$Vu1,{82:3643}),o($VI6,$Vv1,{101:3333,103:3334,87:3644,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vn7,$Vo7),o($Vn7,$Vp7),o($Vk7,$VA1),o($Vk7,$VB1),o($Vk7,$VC1),o($Vk7,$VD1),o($Vm7,$VE1),o($VF1,$VG1,{158:3645}),o($Vq7,$VI1),{115:[1,3646],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vn7,$V11),o($Vn7,$V21),{19:[1,3650],21:[1,3654],22:3648,32:3647,196:3649,210:3651,211:[1,3653],212:[1,3652]},{96:[1,3655]},o($Vk7,$VJ1),o($Vm7,$Vq),o($Vm7,$Vr),{96:[1,3657],102:3656,104:[1,3658],105:[1,3659],106:3660,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,3661]},o($Vm7,$Vt),o($Vm7,$Vu),o($VI6,$Ve7),o($VI6,$Vf7,{70:3662,72:3663,74:3664,40:3665,114:3666,75:[1,3667],76:[1,3668],77:[1,3669],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($VI6,$Vg7),o($VI6,$Vh7,{73:3670,69:3671,88:3672,90:3673,91:3677,95:3678,92:[1,3674],93:[1,3675],94:[1,3676],97:$VQ8,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:3680,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VI6,$Vj7),o($Vk7,$Vr1,{89:3681}),o($Vl7,$Vs1,{95:3362,91:3682,97:$Vu8,98:$VL,99:$VM,100:$VN}),o($Vm7,$Vu1,{82:3683}),o($Vm7,$Vu1,{82:3684}),o($Vm7,$Vu1,{82:3685}),o($VI6,$Vv1,{101:3366,103:3367,87:3686,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vn7,$Vo7),o($Vn7,$Vp7),o($Vk7,$VA1),o($Vk7,$VB1),o($Vk7,$VC1),o($Vk7,$VD1),o($Vm7,$VE1),o($VF1,$VG1,{158:3687}),o($Vq7,$VI1),{115:[1,3688],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vn7,$V11),o($Vn7,$V21),{19:[1,3692],21:[1,3696],22:3690,32:3689,196:3691,210:3693,211:[1,3695],212:[1,3694]},{96:[1,3697]},o($Vk7,$VJ1),o($Vm7,$Vq),o($Vm7,$Vr),{96:[1,3699],102:3698,104:[1,3700],105:[1,3701],106:3702,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,3703]},o($Vm7,$Vt),o($Vm7,$Vu),{117:[1,3704]},o($Vb8,$VV3),o($Vm7,$Vb3),o($Vm7,$Vc3),o($Vm7,$Vd3),o($Vm7,$Ve3),o($Vm7,$Vf3),{107:[1,3705]},o($Vm7,$Vk3),o($Vn7,$VY4),o($Vq7,$VB5),o($Vq7,$VE1),o($Vq7,$Vq),o($Vq7,$Vr),o($Vq7,$Vt),o($Vq7,$Vu),o($VR8,$Vv2,{79:3706,80:3707,188:3708,186:$VS8}),o($Vj8,$V58),o($Vx,$Vg,{51:3710,55:3711,36:3712,39:$Vy}),o($Vk8,$V68),o($Vx,$Vg,{55:3713,36:3714,39:$Vy}),o($Vk8,$V78),o($Vk8,$V88),o($Vk8,$Vo7),o($Vk8,$Vp7),{115:[1,3715],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vk8,$V11),o($Vk8,$V21),{19:[1,3719],21:[1,3723],22:3717,32:3716,196:3718,210:3720,211:[1,3722],212:[1,3721]},o($Vk8,$V98),o($Vk8,$Va8),o($VT8,$Vr1,{89:3724}),o($Vk8,$Vs1,{95:3407,91:3725,97:$Vx8,98:$VL,99:$VM,100:$VN}),o($VT8,$VA1),o($VT8,$VB1),o($VT8,$VC1),o($VT8,$VD1),{96:[1,3726]},o($VT8,$VJ1),{66:[1,3727]},o($Vz8,$Vz2,{95:3080,91:3728,97:$Vl8,98:$VL,99:$VM,100:$VN}),o($Vy8,$VA2),o($Vk8,$VB2,{86:3729,91:3730,87:3731,95:3732,101:3734,103:3735,97:$VU8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vk8,$VD2,{86:3729,91:3730,87:3731,95:3732,101:3734,103:3735,97:$VU8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vk8,$VE2,{86:3729,91:3730,87:3731,95:3732,101:3734,103:3735,97:$VU8,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC8,$VF2),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,3736],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3737,117:$VI2,144:$VJ2,185:$VK2}),o($VB8,$VT1),o($VB8,$Vl),o($VB8,$Vm),o($VB8,$Vq),o($VB8,$Vr),o($VB8,$Vs),o($VB8,$Vt),o($VB8,$Vu),o($Vy8,$Vb3),o($VC8,$Vc3),o($VC8,$Vd3),o($VC8,$Ve3),o($VC8,$Vf3),{107:[1,3738]},o($VC8,$Vk3),o($VR8,$Vv2,{80:3707,188:3708,79:3739,186:$VS8}),o($Vo1,$VY4),{189:[1,3742],190:3740,191:[1,3741]},o($Vm1,$VM5),o($Vm1,$VN5),o($Vm1,$VO5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vm4),o($Vm1,$Vn4,{198:3743,199:3744,107:[1,3745]}),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vr4),o($Vm1,$Vs4),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($VP5,$Vg3),o($VP5,$Vh3),o($VP5,$Vi3),o($VP5,$Vj3),{189:[1,3748],190:3746,191:[1,3747]},o($Vo1,$VM5),o($Vo1,$VN5),o($Vo1,$VO5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vm4),o($Vo1,$Vn4,{198:3749,199:3750,107:[1,3751]}),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vr4),o($Vo1,$Vs4),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($VQ5,$Vg3),o($VQ5,$Vh3),o($VQ5,$Vi3),o($VQ5,$Vj3),{19:[1,3754],21:[1,3757],22:3753,83:3752,210:3755,211:[1,3756]},{189:[1,3760],190:3758,191:[1,3759]},o($Vp1,$VM5),o($Vp1,$VN5),o($Vp1,$VO5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vm4),o($Vp1,$Vn4,{198:3761,199:3762,107:[1,3763]}),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vr4),o($Vp1,$Vs4),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($VR5,$Vg3),o($VR5,$Vh3),o($VR5,$Vi3),o($VR5,$Vj3),o($Va1,$VU3),{117:[1,3764]},o($Va1,$VM3),o($Vn2,$VV3),o($Vu2,$VN4),{19:$Vn,21:$Vo,22:3765,210:52,211:$Vp},{19:$VV8,21:$VW8,22:3767,96:[1,3778],104:[1,3779],105:[1,3780],106:3777,177:3768,187:3766,192:3771,193:3772,194:3773,197:3776,200:[1,3781],201:[1,3782],202:[1,3787],203:[1,3788],204:[1,3789],205:[1,3790],206:[1,3783],207:[1,3784],208:[1,3785],209:[1,3786],210:3770,211:$VX8},o($Vw2,$VN4),{19:$Vn,21:$Vo,22:3791,210:52,211:$Vp},{19:$VY8,21:$VZ8,22:3793,96:[1,3804],104:[1,3805],105:[1,3806],106:3803,177:3794,187:3792,192:3797,193:3798,194:3799,197:3802,200:[1,3807],201:[1,3808],202:[1,3813],203:[1,3814],204:[1,3815],205:[1,3816],206:[1,3809],207:[1,3810],208:[1,3811],209:[1,3812],210:3796,211:$V_8},o($Vt1,$Vb3),o($Vt1,$Vc3),o($Vt1,$Vd3),o($Vt1,$Ve3),o($Vt1,$Vf3),{107:[1,3817]},o($Vt1,$Vk3),o($Vy2,$VN4),{19:$Vn,21:$Vo,22:3818,210:52,211:$Vp},{19:$V$8,21:$V09,22:3820,96:[1,3831],104:[1,3832],105:[1,3833],106:3830,177:3821,187:3819,192:3824,193:3825,194:3826,197:3829,200:[1,3834],201:[1,3835],202:[1,3840],203:[1,3841],204:[1,3842],205:[1,3843],206:[1,3836],207:[1,3837],208:[1,3838],209:[1,3839],210:3823,211:$V19},o($Vp1,$VY4),o($VH1,$VB5),o($VH1,$VE1),o($VH1,$Vq),o($VH1,$Vr),o($VH1,$Vt),o($VH1,$Vu),o($Vm1,$V66),o($Vm1,$VE1),o($Vo1,$V66),o($Vo1,$VE1),o($Vp1,$V66),o($Vp1,$VE1),o($Vm1,$V66),o($Vm1,$VE1),o($Vo1,$V66),o($Vo1,$VE1),o($Vp1,$V66),o($Vp1,$VE1),o($VC3,$VU3),{117:[1,3844]},o($VC3,$VM3),o($VF4,$VV3),o($VG4,$VN4),{19:$Vn,21:$Vo,22:3845,210:52,211:$Vp},{19:$V29,21:$V39,22:3847,96:[1,3858],104:[1,3859],105:[1,3860],106:3857,177:3848,187:3846,192:3851,193:3852,194:3853,197:3856,200:[1,3861],201:[1,3862],202:[1,3867],203:[1,3868],204:[1,3869],205:[1,3870],206:[1,3863],207:[1,3864],208:[1,3865],209:[1,3866],210:3850,211:$V49},o($VH4,$VN4),{19:$Vn,21:$Vo,22:3871,210:52,211:$Vp},{19:$V59,21:$V69,22:3873,96:[1,3884],104:[1,3885],105:[1,3886],106:3883,177:3874,187:3872,192:3877,193:3878,194:3879,197:3882,200:[1,3887],201:[1,3888],202:[1,3893],203:[1,3894],204:[1,3895],205:[1,3896],206:[1,3889],207:[1,3890],208:[1,3891],209:[1,3892],210:3876,211:$V79},o($VI3,$Vb3),o($VI3,$Vc3),o($VI3,$Vd3),o($VI3,$Ve3),o($VI3,$Vf3),{107:[1,3897]},o($VI3,$Vk3),o($VJ4,$VN4),{19:$Vn,21:$Vo,22:3898,210:52,211:$Vp},{19:$V89,21:$V99,22:3900,96:[1,3911],104:[1,3912],105:[1,3913],106:3910,177:3901,187:3899,192:3904,193:3905,194:3906,197:3909,200:[1,3914],201:[1,3915],202:[1,3920],203:[1,3921],204:[1,3922],205:[1,3923],206:[1,3916],207:[1,3917],208:[1,3918],209:[1,3919],210:3903,211:$Va9},o($VG3,$VY4),o($VJ3,$VB5),o($VJ3,$VE1),o($VJ3,$Vq),o($VJ3,$Vr),o($VJ3,$Vt),o($VJ3,$Vu),o($VE3,$V66),o($VE3,$VE1),o($VF3,$V66),o($VF3,$VE1),o($VG3,$V66),o($VG3,$VE1),o($VE3,$V66),o($VE3,$VE1),o($VF3,$V66),o($VF3,$VE1),o($VG3,$V66),o($VG3,$VE1),{189:[1,3926],190:3924,191:[1,3925]},o($Vy6,$VM5),o($Vy6,$VN5),o($Vy6,$VO5),o($Vy6,$Vq),o($Vy6,$Vr),o($Vy6,$Vj4),o($Vy6,$Vk4),o($Vy6,$Vl4),o($Vy6,$Vt),o($Vy6,$Vu),o($Vy6,$Vm4),o($Vy6,$Vn4,{198:3927,199:3928,107:[1,3929]}),o($Vy6,$Vo4),o($Vy6,$Vp4),o($Vy6,$Vq4),o($Vy6,$Vr4),o($Vy6,$Vs4),o($Vy6,$Vt4),o($Vy6,$Vu4),o($Vy6,$Vv4),o($Vy6,$Vw4),o($Vb9,$Vg3),o($Vb9,$Vh3),o($Vb9,$Vi3),o($Vb9,$Vj3),o($VI6,$V68),o($Vx,$Vg,{55:3930,36:3931,39:$Vy}),o($VI6,$V78),o($VI6,$V88),o($VI6,$Vo7),o($VI6,$Vp7),{115:[1,3932],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VI6,$V11),o($VI6,$V21),{19:[1,3936],21:[1,3940],22:3934,32:3933,196:3935,210:3937,211:[1,3939],212:[1,3938]},o($VI6,$V98),o($VI6,$Va8),o($Vb8,$Vr1,{89:3941}),o($VI6,$Vs1,{95:3636,91:3942,97:$VP8,98:$VL,99:$VM,100:$VN}),o($Vb8,$VA1),o($Vb8,$VB1),o($Vb8,$VC1),o($Vb8,$VD1),{96:[1,3943]},o($Vb8,$VJ1),{66:[1,3944]},o($Vl7,$Vz2,{95:3329,91:3945,97:$Vs8,98:$VL,99:$VM,100:$VN}),o($Vk7,$VA2),o($VI6,$VB2,{86:3946,91:3947,87:3948,95:3949,101:3951,103:3952,97:$Vc9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI6,$VD2,{86:3946,91:3947,87:3948,95:3949,101:3951,103:3952,97:$Vc9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI6,$VE2,{86:3946,91:3947,87:3948,95:3949,101:3951,103:3952,97:$Vc9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vq7,$VF2),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,3953],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3954,117:$VI2,144:$VJ2,185:$VK2}),o($Vn7,$VT1),o($Vn7,$Vl),o($Vn7,$Vm),o($Vn7,$Vq),o($Vn7,$Vr),o($Vn7,$Vs),o($Vn7,$Vt),o($Vn7,$Vu),o($Vk7,$Vb3),o($Vq7,$Vc3),o($Vq7,$Vd3),o($Vq7,$Ve3),o($Vq7,$Vf3),{107:[1,3955]},o($Vq7,$Vk3),o($VI6,$V78),o($VI6,$V88),o($VI6,$Vo7),o($VI6,$Vp7),{115:[1,3956],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VI6,$V11),o($VI6,$V21),{19:[1,3960],21:[1,3964],22:3958,32:3957,196:3959,210:3961,211:[1,3963],212:[1,3962]},o($VI6,$V98),o($VI6,$Va8),o($Vb8,$Vr1,{89:3965}),o($VI6,$Vs1,{95:3678,91:3966,97:$VQ8,98:$VL,99:$VM,100:$VN}),o($Vb8,$VA1),o($Vb8,$VB1),o($Vb8,$VC1),o($Vb8,$VD1),{96:[1,3967]},o($Vb8,$VJ1),{66:[1,3968]},o($Vl7,$Vz2,{95:3362,91:3969,97:$Vu8,98:$VL,99:$VM,100:$VN}),o($Vk7,$VA2),o($VI6,$VB2,{86:3970,91:3971,87:3972,95:3973,101:3975,103:3976,97:$Vd9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI6,$VD2,{86:3970,91:3971,87:3972,95:3973,101:3975,103:3976,97:$Vd9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI6,$VE2,{86:3970,91:3971,87:3972,95:3973,101:3975,103:3976,97:$Vd9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vq7,$VF2),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,3977],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:3978,117:$VI2,144:$VJ2,185:$VK2}),o($Vn7,$VT1),o($Vn7,$Vl),o($Vn7,$Vm),o($Vn7,$Vq),o($Vn7,$Vr),o($Vn7,$Vs),o($Vn7,$Vt),o($Vn7,$Vu),o($Vk7,$Vb3),o($Vq7,$Vc3),o($Vq7,$Vd3),o($Vq7,$Ve3),o($Vq7,$Vf3),{107:[1,3979]},o($Vq7,$Vk3),o($VI6,$VY4),{19:[1,3982],21:[1,3985],22:3981,83:3980,210:3983,211:[1,3984]},o($V16,$Vq8),o($Vd8,$VN3),o($V16,$VO3,{31:3986,189:[1,3987]}),{19:$VP3,21:$VQ3,22:627,125:3988,195:$VR3,210:630,211:$VS3},o($Vj8,$Vr8),o($Vk8,$VJ6,{56:3989}),o($VC,$VD,{59:3990,69:3991,71:3992,72:3993,88:3996,90:3997,83:3999,84:4000,85:4001,74:4002,40:4003,91:4007,22:4008,87:4010,114:4011,95:4015,210:4018,101:4019,103:4020,19:[1,4017],21:[1,4022],65:[1,3994],67:[1,3995],75:[1,4012],76:[1,4013],77:[1,4014],81:[1,3998],92:[1,4004],93:[1,4005],94:[1,4006],97:$Ve9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4009],211:[1,4021]}),o($Vk8,$Vt8),o($VC,$VD,{59:4023,69:4024,71:4025,72:4026,88:4029,90:4030,83:4032,84:4033,85:4034,74:4035,40:4036,91:4040,22:4041,87:4043,114:4044,95:4048,210:4051,101:4052,103:4053,19:[1,4050],21:[1,4055],65:[1,4027],67:[1,4028],75:[1,4045],76:[1,4046],77:[1,4047],81:[1,4031],92:[1,4037],93:[1,4038],94:[1,4039],97:$Vf9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4042],211:[1,4054]}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4056,117:$VI2,144:$VJ2,185:$VK2}),o($Vk8,$VT1),o($Vk8,$Vl),o($Vk8,$Vm),o($Vk8,$Vq),o($Vk8,$Vr),o($Vk8,$Vs),o($Vk8,$Vt),o($Vk8,$Vu),o($Vk8,$Vz2,{95:3407,91:4057,97:$Vx8,98:$VL,99:$VM,100:$VN}),o($VT8,$VA2),o($VT8,$Vb3),o($Vk8,$Vv8),o($Vy8,$VV3),o($VA8,$VW3),o($VA8,$VX3),o($VA8,$VY3),{96:[1,4058]},o($VA8,$VJ1),{96:[1,4060],102:4059,104:[1,4061],105:[1,4062],106:4063,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4064]},o($VA8,$Vg4),{117:[1,4065]},{19:[1,4068],21:[1,4071],22:4067,83:4066,210:4069,211:[1,4070]},o($V16,$Vw8),o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$Vz5),o($Vm1,$VA5),{19:$VD8,21:$VE8,22:4073,83:4072,210:3440,211:$VF8},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$Vz5),o($Vo1,$VA5),{19:$VG8,21:$VH8,22:4075,83:4074,210:3466,211:$VI8},o($Vt1,$VB5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$Vz5),o($Vp1,$VA5),{19:$VJ8,21:$VK8,22:4077,83:4076,210:3493,211:$VL8},o($Vo1,$VY4),{189:[1,4080],190:4078,191:[1,4079]},o($Vm1,$VM5),o($Vm1,$VN5),o($Vm1,$VO5),o($Vm1,$Vq),o($Vm1,$Vr),o($Vm1,$Vj4),o($Vm1,$Vk4),o($Vm1,$Vl4),o($Vm1,$Vt),o($Vm1,$Vu),o($Vm1,$Vm4),o($Vm1,$Vn4,{198:4081,199:4082,107:[1,4083]}),o($Vm1,$Vo4),o($Vm1,$Vp4),o($Vm1,$Vq4),o($Vm1,$Vr4),o($Vm1,$Vs4),o($Vm1,$Vt4),o($Vm1,$Vu4),o($Vm1,$Vv4),o($Vm1,$Vw4),o($VP5,$Vg3),o($VP5,$Vh3),o($VP5,$Vi3),o($VP5,$Vj3),{189:[1,4086],190:4084,191:[1,4085]},o($Vo1,$VM5),o($Vo1,$VN5),o($Vo1,$VO5),o($Vo1,$Vq),o($Vo1,$Vr),o($Vo1,$Vj4),o($Vo1,$Vk4),o($Vo1,$Vl4),o($Vo1,$Vt),o($Vo1,$Vu),o($Vo1,$Vm4),o($Vo1,$Vn4,{198:4087,199:4088,107:[1,4089]}),o($Vo1,$Vo4),o($Vo1,$Vp4),o($Vo1,$Vq4),o($Vo1,$Vr4),o($Vo1,$Vs4),o($Vo1,$Vt4),o($Vo1,$Vu4),o($Vo1,$Vv4),o($Vo1,$Vw4),o($VQ5,$Vg3),o($VQ5,$Vh3),o($VQ5,$Vi3),o($VQ5,$Vj3),{19:[1,4092],21:[1,4095],22:4091,83:4090,210:4093,211:[1,4094]},{189:[1,4098],190:4096,191:[1,4097]},o($Vp1,$VM5),o($Vp1,$VN5),o($Vp1,$VO5),o($Vp1,$Vq),o($Vp1,$Vr),o($Vp1,$Vj4),o($Vp1,$Vk4),o($Vp1,$Vl4),o($Vp1,$Vt),o($Vp1,$Vu),o($Vp1,$Vm4),o($Vp1,$Vn4,{198:4099,199:4100,107:[1,4101]}),o($Vp1,$Vo4),o($Vp1,$Vp4),o($Vp1,$Vq4),o($Vp1,$Vr4),o($Vp1,$Vs4),o($Vp1,$Vt4),o($Vp1,$Vu4),o($Vp1,$Vv4),o($Vp1,$Vw4),o($VR5,$Vg3),o($VR5,$Vh3),o($VR5,$Vi3),o($VR5,$Vj3),o($VF3,$VY4),{189:[1,4104],190:4102,191:[1,4103]},o($VE3,$VM5),o($VE3,$VN5),o($VE3,$VO5),o($VE3,$Vq),o($VE3,$Vr),o($VE3,$Vj4),o($VE3,$Vk4),o($VE3,$Vl4),o($VE3,$Vt),o($VE3,$Vu),o($VE3,$Vm4),o($VE3,$Vn4,{198:4105,199:4106,107:[1,4107]}),o($VE3,$Vo4),o($VE3,$Vp4),o($VE3,$Vq4),o($VE3,$Vr4),o($VE3,$Vs4),o($VE3,$Vt4),o($VE3,$Vu4),o($VE3,$Vv4),o($VE3,$Vw4),o($V37,$Vg3),o($V37,$Vh3),o($V37,$Vi3),o($V37,$Vj3),{189:[1,4110],190:4108,191:[1,4109]},o($VF3,$VM5),o($VF3,$VN5),o($VF3,$VO5),o($VF3,$Vq),o($VF3,$Vr),o($VF3,$Vj4),o($VF3,$Vk4),o($VF3,$Vl4),o($VF3,$Vt),o($VF3,$Vu),o($VF3,$Vm4),o($VF3,$Vn4,{198:4111,199:4112,107:[1,4113]}),o($VF3,$Vo4),o($VF3,$Vp4),o($VF3,$Vq4),o($VF3,$Vr4),o($VF3,$Vs4),o($VF3,$Vt4),o($VF3,$Vu4),o($VF3,$Vv4),o($VF3,$Vw4),o($V47,$Vg3),o($V47,$Vh3),o($V47,$Vi3),o($V47,$Vj3),{19:[1,4116],21:[1,4119],22:4115,83:4114,210:4117,211:[1,4118]},{189:[1,4122],190:4120,191:[1,4121]},o($VG3,$VM5),o($VG3,$VN5),o($VG3,$VO5),o($VG3,$Vq),o($VG3,$Vr),o($VG3,$Vj4),o($VG3,$Vk4),o($VG3,$Vl4),o($VG3,$Vt),o($VG3,$Vu),o($VG3,$Vm4),o($VG3,$Vn4,{198:4123,199:4124,107:[1,4125]}),o($VG3,$Vo4),o($VG3,$Vp4),o($VG3,$Vq4),o($VG3,$Vr4),o($VG3,$Vs4),o($VG3,$Vt4),o($VG3,$Vu4),o($VG3,$Vv4),o($VG3,$Vw4),o($V57,$Vg3),o($V57,$Vh3),o($V57,$Vi3),o($V57,$Vj3),o($V38,$VU1),o($V38,$VV1),o($V38,$VW1),o($Vy6,$Vz5),o($Vy6,$VA5),{19:$VM8,21:$VN8,22:4127,83:4126,210:3597,211:$VO8},o($VI6,$Vt8),o($VC,$VD,{59:4128,69:4129,71:4130,72:4131,88:4134,90:4135,83:4137,84:4138,85:4139,74:4140,40:4141,91:4145,22:4146,87:4148,114:4149,95:4153,210:4156,101:4157,103:4158,19:[1,4155],21:[1,4160],65:[1,4132],67:[1,4133],75:[1,4150],76:[1,4151],77:[1,4152],81:[1,4136],92:[1,4142],93:[1,4143],94:[1,4144],97:$Vg9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4147],211:[1,4159]}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4161,117:$VI2,144:$VJ2,185:$VK2}),o($VI6,$VT1),o($VI6,$Vl),o($VI6,$Vm),o($VI6,$Vq),o($VI6,$Vr),o($VI6,$Vs),o($VI6,$Vt),o($VI6,$Vu),o($VI6,$Vz2,{95:3636,91:4162,97:$VP8,98:$VL,99:$VM,100:$VN}),o($Vb8,$VA2),o($Vb8,$Vb3),o($VI6,$Vv8),o($Vk7,$VV3),o($Vm7,$VW3),o($Vm7,$VX3),o($Vm7,$VY3),{96:[1,4163]},o($Vm7,$VJ1),{96:[1,4165],102:4164,104:[1,4166],105:[1,4167],106:4168,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4169]},o($Vm7,$Vg4),{117:[1,4170]},{19:[1,4173],21:[1,4176],22:4172,83:4171,210:4174,211:[1,4175]},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4177,117:$VI2,144:$VJ2,185:$VK2}),o($VI6,$VT1),o($VI6,$Vl),o($VI6,$Vm),o($VI6,$Vq),o($VI6,$Vr),o($VI6,$Vs),o($VI6,$Vt),o($VI6,$Vu),o($VI6,$Vz2,{95:3678,91:4178,97:$VQ8,98:$VL,99:$VM,100:$VN}),o($Vb8,$VA2),o($Vb8,$Vb3),o($VI6,$Vv8),o($Vk7,$VV3),o($Vm7,$VW3),o($Vm7,$VX3),o($Vm7,$VY3),{96:[1,4179]},o($Vm7,$VJ1),{96:[1,4181],102:4180,104:[1,4182],105:[1,4183],106:4184,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4185]},o($Vm7,$Vg4),{117:[1,4186]},{19:[1,4189],21:[1,4192],22:4188,83:4187,210:4190,211:[1,4191]},o($Vm7,$VB5),o($Vm7,$VE1),o($Vm7,$Vq),o($Vm7,$Vr),o($Vm7,$Vt),o($Vm7,$Vu),o($VR8,$VN4),{19:$Vn,21:$Vo,22:4193,210:52,211:$Vp},{19:$Vh9,21:$Vi9,22:4195,96:[1,4206],104:[1,4207],105:[1,4208],106:4205,177:4196,187:4194,192:4199,193:4200,194:4201,197:4204,200:[1,4209],201:[1,4210],202:[1,4215],203:[1,4216],204:[1,4217],205:[1,4218],206:[1,4211],207:[1,4212],208:[1,4213],209:[1,4214],210:4198,211:$Vj9},o($Vj8,$Vd7,{57:4219,49:[1,4220]}),o($Vk8,$Ve7),o($Vk8,$Vf7,{70:4221,72:4222,74:4223,40:4224,114:4225,75:[1,4226],76:[1,4227],77:[1,4228],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Vk8,$Vg7),o($Vk8,$Vh7,{73:4229,69:4230,88:4231,90:4232,91:4236,95:4237,92:[1,4233],93:[1,4234],94:[1,4235],97:$Vk9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4239,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vk8,$Vj7),o($Vy8,$Vr1,{89:4240}),o($Vz8,$Vs1,{95:4015,91:4241,97:$Ve9,98:$VL,99:$VM,100:$VN}),o($VA8,$Vu1,{82:4242}),o($VA8,$Vu1,{82:4243}),o($VA8,$Vu1,{82:4244}),o($Vk8,$Vv1,{101:4019,103:4020,87:4245,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB8,$Vo7),o($VB8,$Vp7),o($Vy8,$VA1),o($Vy8,$VB1),o($Vy8,$VC1),o($Vy8,$VD1),o($VA8,$VE1),o($VF1,$VG1,{158:4246}),o($VC8,$VI1),{115:[1,4247],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VB8,$V11),o($VB8,$V21),{19:[1,4251],21:[1,4255],22:4249,32:4248,196:4250,210:4252,211:[1,4254],212:[1,4253]},{96:[1,4256]},o($Vy8,$VJ1),o($VA8,$Vq),o($VA8,$Vr),{96:[1,4258],102:4257,104:[1,4259],105:[1,4260],106:4261,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4262]},o($VA8,$Vt),o($VA8,$Vu),o($Vk8,$Ve7),o($Vk8,$Vf7,{70:4263,72:4264,74:4265,40:4266,114:4267,75:[1,4268],76:[1,4269],77:[1,4270],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Vk8,$Vg7),o($Vk8,$Vh7,{73:4271,69:4272,88:4273,90:4274,91:4278,95:4279,92:[1,4275],93:[1,4276],94:[1,4277],97:$Vl9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4281,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vk8,$Vj7),o($Vy8,$Vr1,{89:4282}),o($Vz8,$Vs1,{95:4048,91:4283,97:$Vf9,98:$VL,99:$VM,100:$VN}),o($VA8,$Vu1,{82:4284}),o($VA8,$Vu1,{82:4285}),o($VA8,$Vu1,{82:4286}),o($Vk8,$Vv1,{101:4052,103:4053,87:4287,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB8,$Vo7),o($VB8,$Vp7),o($Vy8,$VA1),o($Vy8,$VB1),o($Vy8,$VC1),o($Vy8,$VD1),o($VA8,$VE1),o($VF1,$VG1,{158:4288}),o($VC8,$VI1),{115:[1,4289],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VB8,$V11),o($VB8,$V21),{19:[1,4293],21:[1,4297],22:4291,32:4290,196:4292,210:4294,211:[1,4296],212:[1,4295]},{96:[1,4298]},o($Vy8,$VJ1),o($VA8,$Vq),o($VA8,$Vr),{96:[1,4300],102:4299,104:[1,4301],105:[1,4302],106:4303,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4304]},o($VA8,$Vt),o($VA8,$Vu),{117:[1,4305]},o($VT8,$VV3),o($VA8,$Vb3),o($VA8,$Vc3),o($VA8,$Vd3),o($VA8,$Ve3),o($VA8,$Vf3),{107:[1,4306]},o($VA8,$Vk3),o($VB8,$VY4),o($VC8,$VB5),o($VC8,$VE1),o($VC8,$Vq),o($VC8,$Vr),o($VC8,$Vt),o($VC8,$Vu),o($Vm1,$V66),o($Vm1,$VE1),o($Vo1,$V66),o($Vo1,$VE1),o($Vp1,$V66),o($Vp1,$VE1),o($Vu2,$VU1),o($Vu2,$VV1),o($Vu2,$VW1),o($Vm1,$Vz5),o($Vm1,$VA5),{19:$VV8,21:$VW8,22:4308,83:4307,210:3770,211:$VX8},o($Vw2,$VU1),o($Vw2,$VV1),o($Vw2,$VW1),o($Vo1,$Vz5),o($Vo1,$VA5),{19:$VY8,21:$VZ8,22:4310,83:4309,210:3796,211:$V_8},o($Vt1,$VB5),o($Vt1,$VE1),o($Vt1,$Vq),o($Vt1,$Vr),o($Vt1,$Vt),o($Vt1,$Vu),o($Vy2,$VU1),o($Vy2,$VV1),o($Vy2,$VW1),o($Vp1,$Vz5),o($Vp1,$VA5),{19:$V$8,21:$V09,22:4312,83:4311,210:3823,211:$V19},o($VG4,$VU1),o($VG4,$VV1),o($VG4,$VW1),o($VE3,$Vz5),o($VE3,$VA5),{19:$V29,21:$V39,22:4314,83:4313,210:3850,211:$V49},o($VH4,$VU1),o($VH4,$VV1),o($VH4,$VW1),o($VF3,$Vz5),o($VF3,$VA5),{19:$V59,21:$V69,22:4316,83:4315,210:3876,211:$V79},o($VI3,$VB5),o($VI3,$VE1),o($VI3,$Vq),o($VI3,$Vr),o($VI3,$Vt),o($VI3,$Vu),o($VJ4,$VU1),o($VJ4,$VV1),o($VJ4,$VW1),o($VG3,$Vz5),o($VG3,$VA5),{19:$V89,21:$V99,22:4318,83:4317,210:3903,211:$Va9},o($Vy6,$V66),o($Vy6,$VE1),o($VI6,$Ve7),o($VI6,$Vf7,{70:4319,72:4320,74:4321,40:4322,114:4323,75:[1,4324],76:[1,4325],77:[1,4326],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($VI6,$Vg7),o($VI6,$Vh7,{73:4327,69:4328,88:4329,90:4330,91:4334,95:4335,92:[1,4331],93:[1,4332],94:[1,4333],97:$Vm9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4337,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($VI6,$Vj7),o($Vk7,$Vr1,{89:4338}),o($Vl7,$Vs1,{95:4153,91:4339,97:$Vg9,98:$VL,99:$VM,100:$VN}),o($Vm7,$Vu1,{82:4340}),o($Vm7,$Vu1,{82:4341}),o($Vm7,$Vu1,{82:4342}),o($VI6,$Vv1,{101:4157,103:4158,87:4343,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vn7,$Vo7),o($Vn7,$Vp7),o($Vk7,$VA1),o($Vk7,$VB1),o($Vk7,$VC1),o($Vk7,$VD1),o($Vm7,$VE1),o($VF1,$VG1,{158:4344}),o($Vq7,$VI1),{115:[1,4345],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vn7,$V11),o($Vn7,$V21),{19:[1,4349],21:[1,4353],22:4347,32:4346,196:4348,210:4350,211:[1,4352],212:[1,4351]},{96:[1,4354]},o($Vk7,$VJ1),o($Vm7,$Vq),o($Vm7,$Vr),{96:[1,4356],102:4355,104:[1,4357],105:[1,4358],106:4359,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4360]},o($Vm7,$Vt),o($Vm7,$Vu),{117:[1,4361]},o($Vb8,$VV3),o($Vm7,$Vb3),o($Vm7,$Vc3),o($Vm7,$Vd3),o($Vm7,$Ve3),o($Vm7,$Vf3),{107:[1,4362]},o($Vm7,$Vk3),o($Vn7,$VY4),o($Vq7,$VB5),o($Vq7,$VE1),o($Vq7,$Vq),o($Vq7,$Vr),o($Vq7,$Vt),o($Vq7,$Vu),{117:[1,4363]},o($Vb8,$VV3),o($Vm7,$Vb3),o($Vm7,$Vc3),o($Vm7,$Vd3),o($Vm7,$Ve3),o($Vm7,$Vf3),{107:[1,4364]},o($Vm7,$Vk3),o($Vn7,$VY4),o($Vq7,$VB5),o($Vq7,$VE1),o($Vq7,$Vq),o($Vq7,$Vr),o($Vq7,$Vt),o($Vq7,$Vu),{189:[1,4367],190:4365,191:[1,4366]},o($Vd8,$VM5),o($Vd8,$VN5),o($Vd8,$VO5),o($Vd8,$Vq),o($Vd8,$Vr),o($Vd8,$Vj4),o($Vd8,$Vk4),o($Vd8,$Vl4),o($Vd8,$Vt),o($Vd8,$Vu),o($Vd8,$Vm4),o($Vd8,$Vn4,{198:4368,199:4369,107:[1,4370]}),o($Vd8,$Vo4),o($Vd8,$Vp4),o($Vd8,$Vq4),o($Vd8,$Vr4),o($Vd8,$Vs4),o($Vd8,$Vt4),o($Vd8,$Vu4),o($Vd8,$Vv4),o($Vd8,$Vw4),o($Vn9,$Vg3),o($Vn9,$Vh3),o($Vn9,$Vi3),o($Vn9,$Vj3),o($Vk8,$V68),o($Vx,$Vg,{55:4371,36:4372,39:$Vy}),o($Vk8,$V78),o($Vk8,$V88),o($Vk8,$Vo7),o($Vk8,$Vp7),{115:[1,4373],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vk8,$V11),o($Vk8,$V21),{19:[1,4377],21:[1,4381],22:4375,32:4374,196:4376,210:4378,211:[1,4380],212:[1,4379]},o($Vk8,$V98),o($Vk8,$Va8),o($VT8,$Vr1,{89:4382}),o($Vk8,$Vs1,{95:4237,91:4383,97:$Vk9,98:$VL,99:$VM,100:$VN}),o($VT8,$VA1),o($VT8,$VB1),o($VT8,$VC1),o($VT8,$VD1),{96:[1,4384]},o($VT8,$VJ1),{66:[1,4385]},o($Vz8,$Vz2,{95:4015,91:4386,97:$Ve9,98:$VL,99:$VM,100:$VN}),o($Vy8,$VA2),o($Vk8,$VB2,{86:4387,91:4388,87:4389,95:4390,101:4392,103:4393,97:$Vo9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vk8,$VD2,{86:4387,91:4388,87:4389,95:4390,101:4392,103:4393,97:$Vo9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vk8,$VE2,{86:4387,91:4388,87:4389,95:4390,101:4392,103:4393,97:$Vo9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC8,$VF2),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,4394],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4395,117:$VI2,144:$VJ2,185:$VK2}),o($VB8,$VT1),o($VB8,$Vl),o($VB8,$Vm),o($VB8,$Vq),o($VB8,$Vr),o($VB8,$Vs),o($VB8,$Vt),o($VB8,$Vu),o($Vy8,$Vb3),o($VC8,$Vc3),o($VC8,$Vd3),o($VC8,$Ve3),o($VC8,$Vf3),{107:[1,4396]},o($VC8,$Vk3),o($Vk8,$V78),o($Vk8,$V88),o($Vk8,$Vo7),o($Vk8,$Vp7),{115:[1,4397],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vk8,$V11),o($Vk8,$V21),{19:[1,4401],21:[1,4405],22:4399,32:4398,196:4400,210:4402,211:[1,4404],212:[1,4403]},o($Vk8,$V98),o($Vk8,$Va8),o($VT8,$Vr1,{89:4406}),o($Vk8,$Vs1,{95:4279,91:4407,97:$Vl9,98:$VL,99:$VM,100:$VN}),o($VT8,$VA1),o($VT8,$VB1),o($VT8,$VC1),o($VT8,$VD1),{96:[1,4408]},o($VT8,$VJ1),{66:[1,4409]},o($Vz8,$Vz2,{95:4048,91:4410,97:$Vf9,98:$VL,99:$VM,100:$VN}),o($Vy8,$VA2),o($Vk8,$VB2,{86:4411,91:4412,87:4413,95:4414,101:4416,103:4417,97:$Vp9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vk8,$VD2,{86:4411,91:4412,87:4413,95:4414,101:4416,103:4417,97:$Vp9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vk8,$VE2,{86:4411,91:4412,87:4413,95:4414,101:4416,103:4417,97:$Vp9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC8,$VF2),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,4418],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4419,117:$VI2,144:$VJ2,185:$VK2}),o($VB8,$VT1),o($VB8,$Vl),o($VB8,$Vm),o($VB8,$Vq),o($VB8,$Vr),o($VB8,$Vs),o($VB8,$Vt),o($VB8,$Vu),o($Vy8,$Vb3),o($VC8,$Vc3),o($VC8,$Vd3),o($VC8,$Ve3),o($VC8,$Vf3),{107:[1,4420]},o($VC8,$Vk3),o($Vk8,$VY4),{19:[1,4423],21:[1,4426],22:4422,83:4421,210:4424,211:[1,4425]},o($Vm1,$V66),o($Vm1,$VE1),o($Vo1,$V66),o($Vo1,$VE1),o($Vp1,$V66),o($Vp1,$VE1),o($VE3,$V66),o($VE3,$VE1),o($VF3,$V66),o($VF3,$VE1),o($VG3,$V66),o($VG3,$VE1),o($VI6,$V78),o($VI6,$V88),o($VI6,$Vo7),o($VI6,$Vp7),{115:[1,4427],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VI6,$V11),o($VI6,$V21),{19:[1,4431],21:[1,4435],22:4429,32:4428,196:4430,210:4432,211:[1,4434],212:[1,4433]},o($VI6,$V98),o($VI6,$Va8),o($Vb8,$Vr1,{89:4436}),o($VI6,$Vs1,{95:4335,91:4437,97:$Vm9,98:$VL,99:$VM,100:$VN}),o($Vb8,$VA1),o($Vb8,$VB1),o($Vb8,$VC1),o($Vb8,$VD1),{96:[1,4438]},o($Vb8,$VJ1),{66:[1,4439]},o($Vl7,$Vz2,{95:4153,91:4440,97:$Vg9,98:$VL,99:$VM,100:$VN}),o($Vk7,$VA2),o($VI6,$VB2,{86:4441,91:4442,87:4443,95:4444,101:4446,103:4447,97:$Vq9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI6,$VD2,{86:4441,91:4442,87:4443,95:4444,101:4446,103:4447,97:$Vq9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VI6,$VE2,{86:4441,91:4442,87:4443,95:4444,101:4446,103:4447,97:$Vq9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vq7,$VF2),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,4448],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4449,117:$VI2,144:$VJ2,185:$VK2}),o($Vn7,$VT1),o($Vn7,$Vl),o($Vn7,$Vm),o($Vn7,$Vq),o($Vn7,$Vr),o($Vn7,$Vs),o($Vn7,$Vt),o($Vn7,$Vu),o($Vk7,$Vb3),o($Vq7,$Vc3),o($Vq7,$Vd3),o($Vq7,$Ve3),o($Vq7,$Vf3),{107:[1,4450]},o($Vq7,$Vk3),o($VI6,$VY4),{19:[1,4453],21:[1,4456],22:4452,83:4451,210:4454,211:[1,4455]},o($VI6,$VY4),{19:[1,4459],21:[1,4462],22:4458,83:4457,210:4460,211:[1,4461]},o($VR8,$VU1),o($VR8,$VV1),o($VR8,$VW1),o($Vd8,$Vz5),o($Vd8,$VA5),{19:$Vh9,21:$Vi9,22:4464,83:4463,210:4198,211:$Vj9},o($Vk8,$Vt8),o($VC,$VD,{59:4465,69:4466,71:4467,72:4468,88:4471,90:4472,83:4474,84:4475,85:4476,74:4477,40:4478,91:4482,22:4483,87:4485,114:4486,95:4490,210:4493,101:4494,103:4495,19:[1,4492],21:[1,4497],65:[1,4469],67:[1,4470],75:[1,4487],76:[1,4488],77:[1,4489],81:[1,4473],92:[1,4479],93:[1,4480],94:[1,4481],97:$Vr9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT,157:[1,4484],211:[1,4496]}),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4498,117:$VI2,144:$VJ2,185:$VK2}),o($Vk8,$VT1),o($Vk8,$Vl),o($Vk8,$Vm),o($Vk8,$Vq),o($Vk8,$Vr),o($Vk8,$Vs),o($Vk8,$Vt),o($Vk8,$Vu),o($Vk8,$Vz2,{95:4237,91:4499,97:$Vk9,98:$VL,99:$VM,100:$VN}),o($VT8,$VA2),o($VT8,$Vb3),o($Vk8,$Vv8),o($Vy8,$VV3),o($VA8,$VW3),o($VA8,$VX3),o($VA8,$VY3),{96:[1,4500]},o($VA8,$VJ1),{96:[1,4502],102:4501,104:[1,4503],105:[1,4504],106:4505,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4506]},o($VA8,$Vg4),{117:[1,4507]},{19:[1,4510],21:[1,4513],22:4509,83:4508,210:4511,211:[1,4512]},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4514,117:$VI2,144:$VJ2,185:$VK2}),o($Vk8,$VT1),o($Vk8,$Vl),o($Vk8,$Vm),o($Vk8,$Vq),o($Vk8,$Vr),o($Vk8,$Vs),o($Vk8,$Vt),o($Vk8,$Vu),o($Vk8,$Vz2,{95:4279,91:4515,97:$Vl9,98:$VL,99:$VM,100:$VN}),o($VT8,$VA2),o($VT8,$Vb3),o($Vk8,$Vv8),o($Vy8,$VV3),o($VA8,$VW3),o($VA8,$VX3),o($VA8,$VY3),{96:[1,4516]},o($VA8,$VJ1),{96:[1,4518],102:4517,104:[1,4519],105:[1,4520],106:4521,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4522]},o($VA8,$Vg4),{117:[1,4523]},{19:[1,4526],21:[1,4529],22:4525,83:4524,210:4527,211:[1,4528]},o($VA8,$VB5),o($VA8,$VE1),o($VA8,$Vq),o($VA8,$Vr),o($VA8,$Vt),o($VA8,$Vu),o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4530,117:$VI2,144:$VJ2,185:$VK2}),o($VI6,$VT1),o($VI6,$Vl),o($VI6,$Vm),o($VI6,$Vq),o($VI6,$Vr),o($VI6,$Vs),o($VI6,$Vt),o($VI6,$Vu),o($VI6,$Vz2,{95:4335,91:4531,97:$Vm9,98:$VL,99:$VM,100:$VN}),o($Vb8,$VA2),o($Vb8,$Vb3),o($VI6,$Vv8),o($Vk7,$VV3),o($Vm7,$VW3),o($Vm7,$VX3),o($Vm7,$VY3),{96:[1,4532]},o($Vm7,$VJ1),{96:[1,4534],102:4533,104:[1,4535],105:[1,4536],106:4537,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4538]},o($Vm7,$Vg4),{117:[1,4539]},{19:[1,4542],21:[1,4545],22:4541,83:4540,210:4543,211:[1,4544]},o($Vm7,$VB5),o($Vm7,$VE1),o($Vm7,$Vq),o($Vm7,$Vr),o($Vm7,$Vt),o($Vm7,$Vu),o($Vm7,$VB5),o($Vm7,$VE1),o($Vm7,$Vq),o($Vm7,$Vr),o($Vm7,$Vt),o($Vm7,$Vu),o($Vd8,$V66),o($Vd8,$VE1),o($Vk8,$Ve7),o($Vk8,$Vf7,{70:4546,72:4547,74:4548,40:4549,114:4550,75:[1,4551],76:[1,4552],77:[1,4553],115:$VD,121:$VD,123:$VD,185:$VD,215:$VD}),o($Vk8,$Vg7),o($Vk8,$Vh7,{73:4554,69:4555,88:4556,90:4557,91:4561,95:4562,92:[1,4558],93:[1,4559],94:[1,4560],97:$Vs9,98:$VL,99:$VM,100:$VN}),o($Vf,$Vg,{36:182,40:184,34:4564,39:$Vk1,75:$Vh,76:$Vi,77:$Vj}),o($Vk8,$Vj7),o($Vy8,$Vr1,{89:4565}),o($Vz8,$Vs1,{95:4490,91:4566,97:$Vr9,98:$VL,99:$VM,100:$VN}),o($VA8,$Vu1,{82:4567}),o($VA8,$Vu1,{82:4568}),o($VA8,$Vu1,{82:4569}),o($Vk8,$Vv1,{101:4494,103:4495,87:4570,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VB8,$Vo7),o($VB8,$Vp7),o($Vy8,$VA1),o($Vy8,$VB1),o($Vy8,$VC1),o($Vy8,$VD1),o($VA8,$VE1),o($VF1,$VG1,{158:4571}),o($VC8,$VI1),{115:[1,4572],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($VB8,$V11),o($VB8,$V21),{19:[1,4576],21:[1,4580],22:4574,32:4573,196:4575,210:4577,211:[1,4579],212:[1,4578]},{96:[1,4581]},o($Vy8,$VJ1),o($VA8,$Vq),o($VA8,$Vr),{96:[1,4583],102:4582,104:[1,4584],105:[1,4585],106:4586,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4587]},o($VA8,$Vt),o($VA8,$Vu),{117:[1,4588]},o($VT8,$VV3),o($VA8,$Vb3),o($VA8,$Vc3),o($VA8,$Vd3),o($VA8,$Ve3),o($VA8,$Vf3),{107:[1,4589]},o($VA8,$Vk3),o($VB8,$VY4),o($VC8,$VB5),o($VC8,$VE1),o($VC8,$Vq),o($VC8,$Vr),o($VC8,$Vt),o($VC8,$Vu),{117:[1,4590]},o($VT8,$VV3),o($VA8,$Vb3),o($VA8,$Vc3),o($VA8,$Vd3),o($VA8,$Ve3),o($VA8,$Vf3),{107:[1,4591]},o($VA8,$Vk3),o($VB8,$VY4),o($VC8,$VB5),o($VC8,$VE1),o($VC8,$Vq),o($VC8,$Vr),o($VC8,$Vt),o($VC8,$Vu),{117:[1,4592]},o($Vb8,$VV3),o($Vm7,$Vb3),o($Vm7,$Vc3),o($Vm7,$Vd3),o($Vm7,$Ve3),o($Vm7,$Vf3),{107:[1,4593]},o($Vm7,$Vk3),o($Vn7,$VY4),o($Vq7,$VB5),o($Vq7,$VE1),o($Vq7,$Vq),o($Vq7,$Vr),o($Vq7,$Vt),o($Vq7,$Vu),o($Vk8,$V78),o($Vk8,$V88),o($Vk8,$Vo7),o($Vk8,$Vp7),{115:[1,4594],118:195,119:196,120:197,121:$Vw1,123:$Vx1,185:$Vy1,213:199,215:$Vz1},o($Vk8,$V11),o($Vk8,$V21),{19:[1,4598],21:[1,4602],22:4596,32:4595,196:4597,210:4599,211:[1,4601],212:[1,4600]},o($Vk8,$V98),o($Vk8,$Va8),o($VT8,$Vr1,{89:4603}),o($Vk8,$Vs1,{95:4562,91:4604,97:$Vs9,98:$VL,99:$VM,100:$VN}),o($VT8,$VA1),o($VT8,$VB1),o($VT8,$VC1),o($VT8,$VD1),{96:[1,4605]},o($VT8,$VJ1),{66:[1,4606]},o($Vz8,$Vz2,{95:4490,91:4607,97:$Vr9,98:$VL,99:$VM,100:$VN}),o($Vy8,$VA2),o($Vk8,$VB2,{86:4608,91:4609,87:4610,95:4611,101:4613,103:4614,97:$Vt9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vk8,$VD2,{86:4608,91:4609,87:4610,95:4611,101:4613,103:4614,97:$Vt9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($Vk8,$VE2,{86:4608,91:4609,87:4610,95:4611,101:4613,103:4614,97:$Vt9,98:$VL,99:$VM,100:$VN,108:$VO,109:$VP,110:$VQ,111:$VR,112:$VS,113:$VT}),o($VC8,$VF2),{19:$VU2,21:$VV2,22:396,67:$VW2,77:$VX2,96:$VY2,104:$VZ2,105:$V_2,106:408,159:[1,4615],160:391,161:392,162:393,163:394,177:397,181:$V$2,192:402,193:403,194:404,197:407,200:$V03,201:$V13,202:$V23,203:$V33,204:$V43,205:$V53,206:$V63,207:$V73,208:$V83,209:$V93,210:401,211:$Va3},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4616,117:$VI2,144:$VJ2,185:$VK2}),o($VB8,$VT1),o($VB8,$Vl),o($VB8,$Vm),o($VB8,$Vq),o($VB8,$Vr),o($VB8,$Vs),o($VB8,$Vt),o($VB8,$Vu),o($Vy8,$Vb3),o($VC8,$Vc3),o($VC8,$Vd3),o($VC8,$Ve3),o($VC8,$Vf3),{107:[1,4617]},o($VC8,$Vk3),o($Vk8,$VY4),{19:[1,4620],21:[1,4623],22:4619,83:4618,210:4621,211:[1,4622]},o($Vk8,$VY4),{19:[1,4626],21:[1,4629],22:4625,83:4624,210:4627,211:[1,4628]},o($VI6,$VY4),{19:[1,4632],21:[1,4635],22:4631,83:4630,210:4633,211:[1,4634]},o($VG2,$VH2,{122:361,126:362,127:363,128:364,132:365,133:366,134:367,140:368,142:369,143:370,116:4636,117:$VI2,144:$VJ2,185:$VK2}),o($Vk8,$VT1),o($Vk8,$Vl),o($Vk8,$Vm),o($Vk8,$Vq),o($Vk8,$Vr),o($Vk8,$Vs),o($Vk8,$Vt),o($Vk8,$Vu),o($Vk8,$Vz2,{95:4562,91:4637,97:$Vs9,98:$VL,99:$VM,100:$VN}),o($VT8,$VA2),o($VT8,$Vb3),o($Vk8,$Vv8),o($Vy8,$VV3),o($VA8,$VW3),o($VA8,$VX3),o($VA8,$VY3),{96:[1,4638]},o($VA8,$VJ1),{96:[1,4640],102:4639,104:[1,4641],105:[1,4642],106:4643,202:$VK1,203:$VL1,204:$VM1,205:$VN1},{96:[1,4644]},o($VA8,$Vg4),{117:[1,4645]},{19:[1,4648],21:[1,4651],22:4647,83:4646,210:4649,211:[1,4650]},o($VA8,$VB5),o($VA8,$VE1),o($VA8,$Vq),o($VA8,$Vr),o($VA8,$Vt),o($VA8,$Vu),o($VA8,$VB5),o($VA8,$VE1),o($VA8,$Vq),o($VA8,$Vr),o($VA8,$Vt),o($VA8,$Vu),o($Vm7,$VB5),o($Vm7,$VE1),o($Vm7,$Vq),o($Vm7,$Vr),o($Vm7,$Vt),o($Vm7,$Vu),{117:[1,4652]},o($VT8,$VV3),o($VA8,$Vb3),o($VA8,$Vc3),o($VA8,$Vd3),o($VA8,$Ve3),o($VA8,$Vf3),{107:[1,4653]},o($VA8,$Vk3),o($VB8,$VY4),o($VC8,$VB5),o($VC8,$VE1),o($VC8,$Vq),o($VC8,$Vr),o($VC8,$Vt),o($VC8,$Vu),o($Vk8,$VY4),{19:[1,4656],21:[1,4659],22:4655,83:4654,210:4657,211:[1,4658]},o($VA8,$VB5),o($VA8,$VE1),o($VA8,$Vq),o($VA8,$Vr),o($VA8,$Vt),o($VA8,$Vu)],
defaultActions: {6:[2,11],30:[2,1],102:[2,115],103:[2,116],104:[2,117],111:[2,128],112:[2,129],210:[2,248],211:[2,249],212:[2,250],213:[2,251],333:[2,31],361:[2,138],362:[2,142],364:[2,144],569:[2,29],570:[2,33],607:[2,30],1117:[2,142],1119:[2,144]},
parseError: function parseError(str, hash) {
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
    ShEx parser in the Jison parser generator format.
  */

  var UNBOUNDED = -1;

  var ShExUtil = require("@shexjs/core").Util;

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
    Parser._prefixes = Parser._imports = Parser.valueExprDefns = Parser.shapes = Parser.productions = Parser.start = Parser.startActs = null; // Reset state.
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

  function error (msg) {
    Parser.reset();
    throw new Error(msg);
  }

  // Expand declared prefix or throw Error
  function expandPrefix (prefix) {
    if (!(prefix in Parser._prefixes))
      error('Parse error; unknown prefix: ' + prefix);
    return Parser._prefixes[prefix];
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
test_match:function (match, indexed_rule) {
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
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
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
case 6:return 155;
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
case 49:return 27;
break;
case 50:return 186;
break;
case 51:return 115;
break;
case 52:return 117;
break;
case 53:return 185;
break;
case 54:return '||';
break;
case 55:return 131;
break;
case 56:return 136;
break;
case 57:return 65;
break;
case 58:return 66;
break;
case 59:return 157;
break;
case 60:return 159;
break;
case 61:return 144;
break;
case 62:return '!';
break;
case 63:return 107;
break;
case 64:return 156;
break;
case 65:return 67;
break;
case 66:return 174;
break;
case 67:return 137;
break;
case 68:return 152;
break;
case 69:return 153;
break;
case 70:return 154;
break;
case 71:return 175;
break;
case 72:return 189;
break;
case 73:return 200;
break;
case 74:return 201;
break;
case 75:return 7;
break;
case 76:return 'unexpected word "'+yy_.yytext+'"';
break;
case 77:return 'invalid character '+yy_.yytext;
break;
}
},
rules: [/^(?:\s+|(#[^\u000a\u000d]*|\/\*([^*]|\*([^\/]|\\\/))*\*\/))/,/^(?:(@(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*))))/,/^(?:(@((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)))/,/^(?:(@([A-Za-z])+((-([0-9A-Za-z])+))*))/,/^(?:@)/,/^(?:(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:)(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*)))/,/^(?:(\{((([+-])?([0-9])+))((,(((([+-])?([0-9])+))|\*)?))?\}))/,/^(?:(([+-])?((([0-9])+\.([0-9])*(([Ee]([+-])?([0-9])+)))|((\.)?([0-9])+(([Ee]([+-])?([0-9])+))))))/,/^(?:(([+-])?([0-9])*\.([0-9])+))/,/^(?:(([+-])?([0-9])+))/,/^(?:{ANON})/,/^(?:(<([^\u0000-\u0020<>\"{}|^`\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*>))/,/^(?:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?)?:))/,/^(?:a\b)/,/^(?:(\/([^\u002f\u005C\u000A\u000D]|\\[nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E\/]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))+\/[smix]*))/,/^(?:(_:((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|[0-9])((((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040])|\.)*((([A-Z]|[a-z]|[\u00c0-\u00d6]|[\u00d8-\u00f6]|[\u00f8-\u02ff]|[\u0370-\u037d]|[\u037f-\u1fff]|[\u200c-\u200d]|[\u2070-\u218f]|[\u2c00-\u2fef]|[\u3001-\ud7ff]|[\uf900-\ufdcf]|[\ufdf0-\ufffd]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_|_\b)|-|[0-9]|[\u00b7]|[\u0300-\u036f]|[\u203f-\u2040]))?))/,/^(?:(\{([^%\\]|\\[%\\]|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*%\}))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"(@([A-Za-z])+((-([0-9A-Za-z])+))*)))/,/^(?:('''(('|'')?([^\'\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/,/^(?:("""(("|"")?([^\"\\]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/,/^(?:('([^\u0027\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/,/^(?:("([^\u0022\u005c\u000a\u000d]|(\\[\"\'\\bfnrt])|(\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/,/^(?:([Bb][Aa][Ss][Ee]))/,/^(?:([Pp][Rr][Ee][Ff][Ii][Xx]))/,/^(?:([iI][mM][pP][oO][rR][tT]))/,/^(?:([sS][tT][aA][rR][tT]))/,/^(?:([eE][xX][tT][eE][rR][nN][aA][lL]))/,/^(?:([Vv][Ii][Rr][Tt][Uu][Aa][Ll]))/,/^(?:([Cc][Ll][Oo][Ss][Ee][Dd]))/,/^(?:([Ee][Xx][Tt][Rr][Aa]))/,/^(?:([Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Bb][Nn][Oo][Dd][Ee]))/,/^(?:([Ii][Rr][Ii]))/,/^(?:([Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]))/,/^(?:([Aa][Nn][Dd]))/,/^(?:([Oo][Rr]))/,/^(?:([No][Oo][Tt]))/,/^(?:([Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]))/,/^(?:([Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]))/,/^(?:([Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:([Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]))/,/^(?:=)/,/^(?:\/\/)/,/^(?:\{)/,/^(?:\})/,/^(?:&)/,/^(?:\|\|)/,/^(?:\|)/,/^(?:,)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\$)/,/^(?:!)/,/^(?:\^\^)/,/^(?:\^)/,/^(?:\.)/,/^(?:~)/,/^(?:;)/,/^(?:\*)/,/^(?:\+)/,/^(?:\?)/,/^(?:-)/,/^(?:%)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:$)/,/^(?:[a-zA-Z0-9_-]+)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77],"inclusive":true}}
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


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = ShExJison;
exports.Parser = ShExJison.Parser;
exports.parse = function () { return ShExJison.parse.apply(ShExJison, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}

}).call(this,require('_process'))
},{"@shexjs/core":22,"_process":5,"fs":1,"path":4}],24:[function(require,module,exports){
var ShExParser = (function () {

// stolen as much as possible from SPARQL.js
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  ShExJison = require('./lib/ShExJison').Parser; // node environment
} else {
  ShExJison = ShExJison.Parser; // browser environment
}

// Creates a ShEx parser with the given pre-defined prefixes
var prepareParser = function (baseIRI, prefixes, schemaOptions) {
  schemaOptions = schemaOptions || {};
  // Create a copy of the prefixes
  var prefixesCopy = {};
  for (var prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

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
    try {
      return ShExJison.prototype.parse.apply(parser, arguments);
    } catch (e) {
      // use the lexer's pretty-printing
      var lineNo = "lexer" in parser.yy ? parser.yy.lexer.yylineno + 1 : 1;
      var pos = "lexer" in parser.yy ? parser.yy.lexer.showPosition() : "";
      var t = Error(`${baseIRI}(${lineNo}): ${e.message}\n${pos}`);
      t.lineNo = lineNo;
      t.context = pos;
      if ("lexer" in parser.yy) {
        parser.yy.lexer.matched = parser.yy.lexer.matched || "";
        t.offset = parser.yy.lexer.matched.length;
        t.width = parser.yy.lexer.match.length
        t.lloc = parser.yy.lexer.yylloc;
      } else {
        // Failed before the Jison call to `yy.parser.yy = { lexer: yy.lexer}`
        t.offset = t.width = t.lloc = 0;
      }
      Error.captureStackTrace(t, runParser);
      parser.reset();
      throw t;
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
}

return {
  construct: prepareParser
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExParser;

},{"./lib/ShExJison":23}]},{},[24])(24)
});
