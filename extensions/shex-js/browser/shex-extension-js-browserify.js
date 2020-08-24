(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jsExtension = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var JsExt = "http://shex.io/extensions/Eval/";

function register (validator) {

  validator.semActHandler.results[JsExt] = [];
  validator.semActHandler.register(
    JsExt,
    {
      /**
       * Callback for extension invocation.
       *
       * @param {string} code - text of the semantic action.
       * @param {object} ctx - matched triple or results subset.
       * @param {object} extensionStorage - place where the extension writes into the result structure.
       * @return {bool | [{type: SemActViolation, msg: "..."}]} false if the extension failed or did not accept the ctx object.
       */
      dispatch: function (code, ctx, extensionStorage) {
        return eval(code);
      }
    }
  );
  return validator.semActHandler.results[JsExt];
}

function done (validator) {
  if (validator.semActHandler.results[JsExt].length === 0)
    delete validator.semActHandler.results[JsExt];
}

module.exports = {
  name: "Eval",
  description: `Simple javascript eval.
Each SemAct should return either:
  bool - false if the extension failed or did not accept the ctx object.
  [{type: "SemActViolation", msg: "..."}] - (ideally empty) list of structured errors

url: ${JsExt}`,
  name: "Eval",
  register: register,
  done: done,
  url: JsExt
};

},{}]},{},[1])(1)
});
