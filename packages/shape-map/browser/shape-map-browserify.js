(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shapeMap = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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
},{"_process":3}],3:[function(require,module,exports){
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

  var ShapeMap = require("./ShapeMapSymbols");

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


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = ShapeMapJison;
exports.Parser = ShapeMapJison.Parser;
exports.parse = function () { return ShapeMapJison.parse.apply(ShapeMapJison, arguments); };
exports.main = function commonjsMain (args) {
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
},{"./ShapeMapSymbols":6,"_process":3,"fs":1,"path":2}],5:[function(require,module,exports){
var ShapeMapParser = (function () {

// stolen as much as possible from SPARQL.js
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  ShapeMapJison = require('./ShapeMapJison').Parser; // node environment
} else {
  ShapeMapJison = ShapeMapJison.Parser; // browser environment
}

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

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShapeMapParser;

},{"./ShapeMapJison":4}],6:[function(require,module,exports){
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
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShapeMapSymbols;

},{}],7:[function(require,module,exports){
/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * See README for description.
 */

var ShapeMap = (function () {
  const symbols = require("./lib/ShapeMapSymbols")

  // Write the parser object directly into the symbols so the caller shares a
  // symbol space with ShapeMapJison for e.g. start and focus.
  symbols.Parser = require("./lib/ShapeMapParser")
  return symbols
})();

// Export the `ShExValidator` class as a whole.
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShapeMap;

},{"./lib/ShapeMapParser":5,"./lib/ShapeMapSymbols":6}]},{},[7])(7)
});
