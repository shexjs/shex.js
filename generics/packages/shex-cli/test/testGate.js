// Reads a TEST_* environment gate the same way in every suite:
//   unset                          -> the default (normally false)
//   true, 1, yes, on               -> true
//   false, 0, no, off, "" (empty)  -> false
// (case-insensitive).  Anything else throws, so a typo can't quietly turn a
// suite on or off.
//
//   const TEST_cli = require("../../shex-cli/test/testGate.js")("TEST_cli");
const TRUE = ["true", "1", "yes", "on"];
const FALSE = ["false", "0", "no", "off", ""];

module.exports = function testGate (name, dflt = false) {
  if (!(name in process.env))
    return dflt;
  const value = process.env[name].trim().toLowerCase();
  if (TRUE.includes(value))
    return true;
  if (FALSE.includes(value))
    return false;
  throw Error(`${name}=${JSON.stringify(process.env[name])}: expected one of ${TRUE.concat(FALSE.slice(0, -1)).join(", ")} or empty`);
};
