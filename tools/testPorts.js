/**
 * The fixed ports the test suites listen on, and how a development session
 * moves them out of another session's way.
 *
 *   const {testPort} = require("../../../tools/testPorts");
 *   startServer([{url: `http://localhost:${testPort(9999)}/shex.js/`, fromDir}]);
 *
 * Unset, `testPort(n)` is `n`: the ports are the ones the suites have always
 * used.  Two checkouts (worktrees, or two sessions working at once) testing
 * together then fight over them, and the second run dies with EADDRINUSE.
 * Give each session its own range instead:
 *
 *   SHEXJS_TEST_PORTS=20100 npm test          # 20100, 20101, ...
 *   SHEXJS_TEST_PORTS=20100-20109 npm test    # the same, bounded
 *
 * Each fixed port below takes the slot at its index: 9999 -> 20100,
 * 9994 -> 20101, and so on.  A range too small for the table is an error,
 * as is a malformed value -- better loud than tests on ports nobody chose.
 *
 * The ports stay *fixed* within a session on purpose.  An ephemeral port
 * (listen(0)) never collides, but it also never notices a hung run: the
 * orphan keeps its port and the next run quietly takes another.  A fixed
 * port makes the next run of the same session fail at once, naming the
 * port -- `node tools/testPorts.js` shows which ones are held.
 */
"use strict";

const EnvVar = "SHEXJS_TEST_PORTS";

/** the fixed ports, in slot order; append new ones (reordering moves
 * every session's ports) */
const Slots = [
  {port: 9999, what: "the repo's pages and files (tools/testServer.js, shex-webapp/test/harness.js)"},
  {port: 9994, what: "plugin-cross-origin-test: somebody else's host"},
  {port: 9993, what: "plugin-cross-origin-test: a whole plugin from elsewhere"},
  {port: 8088, what: "shex-cli Server-test: validate -S"},
];

/** the session's range from the environment, or null to use the defaults */
function parseRange (raw) {
  if (raw === undefined || raw.trim() === "")
    return null;
  const m = raw.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
  if (!m)
    throw Error(`${EnvVar}=${raw}: expected a first port (20100) or a range (20100-20109)`);
  const from = parseInt(m[1], 10);
  const to = m[2] === undefined ? from + Slots.length - 1 : parseInt(m[2], 10);
  if (from < 1024 || to > 65535 || to < from)
    throw Error(`${EnvVar}=${raw}: ports must satisfy 1024 <= first <= last <= 65535`);
  if (to - from + 1 < Slots.length)
    throw Error(`${EnvVar}=${raw}: the tests need ${Slots.length} ports (${from}-${from + Slots.length - 1})`);
  return {from, to, raw};
}

const Range = parseRange(process.env[EnvVar]);

/** where `defaultPort` goes in `range` (null: nowhere, it stays put) */
function portIn (range, defaultPort) {
  const slot = Slots.findIndex(s => s.port === defaultPort);
  if (slot === -1)
    throw Error(`testPort(${defaultPort}): not a known test port; add it to Slots in tools/testPorts.js`);
  return range ? range.from + slot : defaultPort;
}

/** where the suite that has always used `defaultPort` listens in this session */
function testPort (defaultPort) {
  return portIn(Range, defaultPort);
}

/** a line of advice for an EADDRINUSE on one of these ports */
function portInUseHint (port) {
  return `port ${port} is taken -- by another checkout's test run, or a hung one of this checkout's.`
    + ` See who: lsof -nP -iTCP:${port} -sTCP:LISTEN.`
    + (Range
       ? ` (This session's ports come from ${EnvVar}=${Range.raw}.)`
       : ` To test beside another checkout, give this one its own ports: ${EnvVar}=<first port> (tools/testPorts.js).`);
}

module.exports = {testPort, portInUseHint, Slots, EnvVar, parseRange, portIn};

// `node tools/testPorts.js`: this session's ports, and whether each is free
if (require.main === module) {
  const Net = require("net");
  console.log(Range ? `${EnvVar}=${Range.raw}` : `${EnvVar} unset: the default ports`);
  (async () => {
    for (const {port, what} of Slots) {
      const actual = testPort(port);
      const free = await new Promise(resolve => {
        const probe = Net.createServer()
              .once("error", () => resolve(false))
              .once("listening", () => probe.close(() => resolve(true)))
              .listen(actual);
      });
      console.log(`${String(actual).padStart(5)} ${free ? "free " : "TAKEN"}  ${what}`);
    }
  })();
}
