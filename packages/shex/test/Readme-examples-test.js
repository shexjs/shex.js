"use strict";
// The quick starts in packages/*/README.md are promises; this suite keeps them.
// Each spec names a fenced code block by its README and first line, runs it,
// and asserts the output the README shows. Blocks that reach the network run
// only under TEST_network=true.

const Fs = require("fs");
const Path = require("path");
const Os = require("os");
const {execSync} = require("child_process");
const {expect} = require("chai");

const RepoRoot = Path.join(__dirname, "../../..");
const TEST_network = process.env.TEST_network === "true";

const Specs = [
  {
    readme: "shex-validator",
    first: 'const {ShExValidator} = require("@shexjs/validator");',
    expect: ["http://a.example/n1 conformant", "http://a.example/n2 nonconformant"],
  },
  {
    readme: "neighborhood-rdfjs",
    first: 'const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");',
    expect: ["conformant"],
  },
  {
    readme: "shape-map",
    first: 'const ShapeMap = require("shape-map");',
    expect: ["http://my.example/url/#n", "conformant"],
  },
  {
    readme: "shape-map",
    first: 'const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");',
    expect: ["http://my.example/data#n conformant"],
  },
  { // smoke: the term conversions run without throwing
    readme: "shex-term",
    first: 'const Term = require("@shexjs/term");',
    expect: [],
  },
  {
    readme: "shex-shape-path-query",
    first: 'const Fs = require("fs");',
    expect: ["http://instance.example/project1/img1.jpg"],
  },
  { // `node -e '…'` one-liners run as shell commands from the repo root
    readme: "shex-parser",
    lang: "sh",
    first: "node -e 'console.log(",
    nth: 0, // three blocks share this first line; the quick start is first
    shell: true,
    expect: ['"type": "Schema"', '"predicate": "http://a.example/p1"'],
  },
  {
    readme: "shex-parser",
    lang: "sh",
    first: "node -e 'console.log(",
    nth: 3, // the index-option example
    shell: true,
    expect: ['"_base": "http://a.example/path/path3"', '"_locations"'],
  },
  {
    readme: "shex-writer",
    lang: "sh",
    first: 'node -e \'new (require("@shexjs/writer"))()',
    shell: true,
    expect: ["<http://a.example/S1> {", "<http://a.example/p1> [1 2]"],
  },
  {
    readme: "shex-visitor",
    lang: "sh",
    first: 'node -e \'console.log(JSON.stringify(new (require("@shexjs/visitor").ShExVisitor)()',
    shell: true,
    expect: ['"type": "ShapeDecl"'],
  },
  {
    readme: "shex-util",
    lang: "sh",
    first: "node -e 'const base = \"http://a.example/\"",
    shell: true,
    expect: ["<S2> {", "<p4> @<S1>"],
  },
  {
    readme: "shex",
    first: 'const ShEx = require("shex");',
    network: true,
    expect: ['"status": "conformant"'],
  },
  {
    readme: "shex-loader",
    first: "const N3 = require('n3'); // used for graph API example",
    network: true,
    expect: ["http://a.example/S1 is a Shape", "p1-0"],
  },
  {
    readme: "shex-node",
    first: 'const ShExLoader = require("@shexjs/node")({',
    network: true,
    files: { // the local files the README's example loads
      "1dotOr2dot.shex": 'PREFIX : <http://a.example/> :S1 { :p1 . | :p2 .; :p3 . }\n',
      "p2p3.ttl": 'PREFIX : <http://a.example/> <x> :p2 "p2-0" ; :p3 "p3-0" .\n',
    },
    expect: ["shapes:  http://a.example/S1", "p2-0"],
  },
];

function extract (readme, lang, first, nth) {
  const path = Path.join(RepoRoot, "packages", readme, "README.md");
  const text = Fs.readFileSync(path, "utf8");
  const fence = new RegExp("``` ?" + (lang || "js") + "\\n([\\s\\S]*?)```", "g");
  const blocks = [];
  let m;
  while ((m = fence.exec(text)) !== null)
    blocks.push(m[1]);
  const hits = blocks.filter(b => b.split("\n", 1)[0] === first);
  if (nth === undefined && hits.length !== 1)
    throw Error(`${path}: ${hits.length} ${lang || "js"} blocks starting with ${JSON.stringify(first)}`);
  return hits[nth || 0];
}

describe("README examples", function () {
  this.timeout(20000);
  let tmpDir;
  before(() => { tmpDir = Fs.mkdtempSync(Path.join(Os.tmpdir(), "shex-readme-")); });
  after(() => { Fs.rmSync(tmpDir, {recursive: true, force: true}); });

  Specs.forEach((spec, i) => {
    const title = `${spec.readme}: ${spec.first.slice(0, 60)}…`;
    const run = spec.network && !TEST_network ? it.skip : it;
    run(title, () => {
      const code = extract(spec.readme, spec.lang, spec.first, spec.nth);
      let out;
      if (spec.shell) {
        out = execSync(code, {cwd: RepoRoot, encoding: "utf8"});
      } else {
        // run from inside the repo so require() finds the workspace packages
        const dir = Path.join(RepoRoot, "packages/shex/test", Path.basename(tmpDir));
        Fs.mkdirSync(dir, {recursive: true});
        try {
          for (const [name, content] of Object.entries(spec.files || {}))
            Fs.writeFileSync(Path.join(dir, name), content);
          const script = Path.join(dir, `readme-${i}.js`);
          Fs.writeFileSync(script, code);
          out = execSync(`node ${JSON.stringify(script)}`, {cwd: dir, encoding: "utf8"});
        } finally {
          Fs.rmSync(dir, {recursive: true, force: true});
        }
      }
      spec.expect.forEach(needle => expect(out).to.include(needle));
    });
  });
});
