(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shexCore = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var parse = require('./parse');
var formats = require('./formats');

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

},{"./formats":4,"./parse":6,"./stringify":7}],6:[function(require,module,exports){
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

},{"./utils":8}],7:[function(require,module,exports){
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

},{"./formats":4,"./utils":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"http-response-object":1,"then-request/lib/handle-qs.js":10}],10:[function(require,module,exports){
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

},{"qs":5}],11:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],12:[function(require,module,exports){
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
},{"./support/isBuffer":11,"_process":3,"inherits":2}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"../lib/ShExWriter":16,"./RdfTerm":13,"hierarchy-closure":19,"sync-request":9}],15:[function(require,module,exports){
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
},{"../lib/regex/nfax-val-1err":17,"../lib/regex/threaded-val-nerr":18,"./RdfTerm":13,"_process":3}],16:[function(require,module,exports){
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

},{"util":12}],17:[function(require,module,exports){
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

},{"../RdfTerm":13}],18:[function(require,module,exports){
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

},{"../RdfTerm":13}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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


},{"./lib/RdfTerm":13,"./lib/ShExUtil":14,"./lib/ShExValidator":15,"./lib/ShExWriter":16,"./lib/regex/nfax-val-1err":17,"./lib/regex/threaded-val-nerr":18}]},{},[20])(20)
});
