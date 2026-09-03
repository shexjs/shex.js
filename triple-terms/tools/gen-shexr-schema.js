#!/usr/bin/env node
/** packages/shex-util/ShExR.shex -> packages/shex-util/src/ShExRSchema.ts
 *
 * The .shex is the one copy of shexTest's doc/ShExR.shex in this repository
 * (a test in shex-util checks that); the app and the CLIs read it as
 * ShExUtil.ShExRSchema, and a browser bundle cannot read a file, so the
 * text is compiled in.  Edit the .shex, run this, then `npx tsc` in
 * packages/shex-util.
 */
const Fs = require("fs");
const Path = require("path");
const dir = Path.join(__dirname, "..", "packages", "shex-util");
const text = Fs.readFileSync(Path.join(dir, "ShExR.shex"), "utf8");
Fs.writeFileSync(Path.join(dir, "src", "ShExRSchema.ts"),
  "// GENERATED from ../ShExR.shex by tools/gen-shexr-schema.js -- edit that, not this.\n"
  + "/** ShExR.shex: the ShEx schema for ShEx schemas written as RDF (ShExR). */\n"
  + "export const ShExRSchema: string = " + JSON.stringify(text) + ";\n");
console.log("packages/shex-util/src/ShExRSchema.ts: " + text.length + " chars");
