// Declares a process warning a suite provokes on purpose, so it isn't
// printed in the middle of the run.  Node reports these through
// process.emitWarning; this passes every other warning through untouched.
//
//   before(() => { quiet = require("…/expectWarning.js")(/WASI is an experimental feature/); });
//   after(() => quiet.restore());
//
// `seen` lists the ones it held back.  Node warns about a feature once per
// process, so a suite can't count on being the one that sees it.
module.exports = function expectWarning (pattern) {
  const seen = [];
  const emitWarning = process.emitWarning;
  process.emitWarning = function (warning, ...rest) {
    const text = typeof warning === "string" ? warning : warning && warning.message;
    if (pattern.test(String(text))) {
      seen.push(text);
      return;
    }
    return emitWarning.call(this, warning, ...rest);
  };
  return {seen, restore () { process.emitWarning = emitWarning; }};
};
