"use strict";

const expect = require("chai").expect;
const Fs = require("fs");
const Os = require("os");
const Path = require("path");

const WasiTest = require("../shex-extension-wasi-test");
// The reference implementation this package mirrors.
const TestJs = require("@shexjs/extension-test");

const TestExt = "http://shex.io/extensions/Test/";

function haveNodeWasi () {
  try { require("node:wasi"); return true; } catch (e) { return false; }
}

function mockValidator () {
  return {semActHandler: {
    results: {},
    handlers: {},
    register: function (name, handler) { this.handlers[name] = handler; },
  }};
}

function tripleCtx (s, p, o) {
  return {triples: [{subject: {value: s}, predicate: {value: p}, object: {value: o}}]};
}

/** A fresh module whose WASI stdout lands in a temp file we can read back. */
function captured (impl) {
  const dir = Fs.mkdtempSync(Path.join(Os.tmpdir(), "shex-wasi-test-"));
  const path = Path.join(dir, "out.txt");
  const fd = Fs.openSync(path, "w");
  return {
    mod: WasiTest.configure({stdout: fd, impl: impl}),
    read: function () { return Fs.readFileSync(path, "utf8"); },
    close: function () { Fs.closeSync(fd); Fs.rmSync(dir, {recursive: true, force: true}); },
  };
}

const T = tripleCtx("http://a.example/n1", "http://a.example/p1", "val-1");
const U = tripleCtx("Δ☃", "", "😀"); // non-ASCII, empty and astral term values

describe("@shexjs/extension-wasi-test", function () {
  this.timeout(10000);

  describe("module shape", function () {
    it("should look like a ShEx semantic-action extension", function () {
      expect(WasiTest.url).to.equal(TestExt);
      expect(WasiTest.name).to.equal("TestWasi");
      expect(WasiTest.register).to.be.a("function");
      expect(WasiTest.done).to.be.a("function");
      expect(WasiTest.configure).to.be.a("function");
    });

    it("should demand an api argument like the reference implementation", function () {
      expect(() => WasiTest.register(mockValidator())).to.throw(/SemAct extensions must be called/);
      expect(() => TestJs.register(mockValidator())).to.throw(/SemAct extensions must be called/);
    });

    it("should return the live results array from register()", function () {
      const validator = mockValidator();
      const results = WasiTest.register(validator, {ShExTerm: {}});
      expect(results).to.equal(validator.semActHandler.results[TestExt]);
      validator.semActHandler.handlers[TestExt].dispatch('print("x")', null, {});
      expect(results).to.deep.equal(["x"]);
    });

    it("should implement done() like the reference implementation", function () {
      const validator = mockValidator();
      WasiTest.register(validator, {ShExTerm: {}});
      WasiTest.done(validator);
      expect(validator.semActHandler.results).to.not.have.property(TestExt);

      const validator2 = mockValidator();
      WasiTest.register(validator2, {ShExTerm: {}});
      validator2.semActHandler.handlers[TestExt].dispatch('print("x")', null, {});
      WasiTest.done(validator2);
      expect(validator2.semActHandler.results[TestExt]).to.deep.equal(["x"]);
    });
  });

  const impls = ["shim"].concat(haveNodeWasi() ? ["wasi"] : []);
  impls.forEach(impl => describe(`dispatch semantics (impl: ${impl})`, function () {
    let cap, validator, dispatch, results;
    before(function () {
      cap = captured(impl);
      validator = mockValidator();
      results = cap.mod.register(validator, {ShExTerm: {}});
      dispatch = (code, ctx) => validator.semActHandler.handlers[TestExt].dispatch(code, ctx, {});
    });
    after(function () { cap.close(); });

    it("should print a string literal", function () {
      expect(dispatch('print("abc")', T)).to.deep.equal([]);
      expect(results).to.deep.equal(["abc"]);
    });

    it("should report a SemActFailure for fail()", function () {
      expect(dispatch("fail('nope')", T)).to.deep.equal(
        [{type: "SemActFailure", errors: ["fail(nope)"]}]);
    });

    it("should resolve s, p and o against the matched triple", function () {
      expect(dispatch("print(s, ' ', o)", T)).to.deep.equal([]);
      expect(results[results.length - 1]).to.equal("http://a.example/n1 val-1");
    });

    it("should concatenate mixed argument lists", function () {
      dispatch("print(\"a\",'b' , s ,o)", T);
      expect(results[results.length - 1]).to.equal("abhttp://a.example/n1val-1");
    });

    it("should decode the sanctioned escape sequences like the reference parseStr()", function () {
      dispatch('print("a\\"b\\\\c")', T); // code: print("a\"b\\c")
      expect(results[results.length - 1]).to.equal('a"b\\c');
    });

    it("should round-trip non-ASCII arguments and term values", function () {
      dispatch("print(\"é\", s, p, o)", U);
      expect(results[results.length - 1]).to.equal("éΔ☃😀");
    });

    it("should throw an invocation error on codes outside the grammar", function () {
      ["print(q)", "print()", 'Print("a")', 'print("a"x)', 'print("a) ', "print\t(\"a\")"]
        .forEach(code =>
          expect(() => dispatch(code, T), code).to.throw(/didn't match/));
    });

    it("should throw when a position is referenced with no triple in scope", function () {
      expect(() => dispatch("print(s)", null)).to.throw(/refers to s with no triple in scope/);
    });

    it("should throw when there is no code to dispatch", function () {
      expect(() => dispatch(null, T)).to.throw(/expected code to dispatch/);
    });

    it("should have printed each line plus a newline through WASI fd_write", function () {
      expect(cap.read()).to.equal([
        "abc", "nope", "http://a.example/n1 val-1", "abhttp://a.example/n1val-1",
        'a"b\\c', "éΔ☃😀",
      ].map(line => line + "\n").join(""));
    });
  }));

  describe("parity with @shexjs/extension-test", function () {
    // Run the same invocation against both implementations on fresh mock
    // validators and compare outcome, returned failures and collected results.
    function runBoth (extension, code, ctx) {
      const validator = mockValidator();
      extension.register(validator, {ShExTerm: {}});
      try {
        const ret = validator.semActHandler.handlers[TestExt].dispatch(code, ctx, {});
        return {threw: false, ret: ret, results: validator.semActHandler.results[TestExt]};
      } catch (e) {
        return {threw: true};
      }
    }

    const contexts = {"triple": T, "unicode triple": U, "null ctx": null,
                      "empty ctx": {}, "empty triples": {triples: []}};
    const codes = [
      'print("abc")', "fail('nope')", "  print( 'a b c' )  ", "print (\"a\")",
      "print(s)", "print(p)", "print(o)", "fail(s,p,o)", "print(s, ' ', o)",
      'print("")', "fail('')", "print('don\"t')", 'print("it\'s")',
      'print("a\\"b")', "print('a\\\\b')", 'print("ab)cd")', 'print("a\nb")',
      "print(q)", "print()", 'Print("a")', 'print("a"x)', 'print("a) ',
      'print("a\\nb")', 'printx("a")', "print(sp)", 'print("a" "b")',
      "print\n(\"a\")", "fail", "", 'print("a",)',
    ];

    Object.entries(contexts).forEach(([ctxName, ctx]) =>
      it(`should agree with the reference implementation against ${ctxName}`, function () {
        codes.forEach(code => {
          const shim = runBoth(WasiTest.configure({impl: "shim", stdout: nullFd()}), code, ctx);
          const reference = runBoth(TestJs, code, ctx);
          expect(shim.threw, `threw for ${JSON.stringify(code)}`).to.equal(reference.threw);
          if (!reference.threw) {
            expect(shim.ret, `return for ${JSON.stringify(code)}`).to.deep.equal(reference.ret);
            expect(shim.results, `results for ${JSON.stringify(code)}`).to.deep.equal(reference.results);
          }
        });
      }));

    let _nullFd = null;
    function nullFd () {
      if (_nullFd === null)
        _nullFd = Fs.openSync("/dev/null", "w");
      return _nullFd;
    }
    after(function () { if (_nullFd !== null) Fs.closeSync(_nullFd); });
  });

  describe("WASI plumbing", function () {
    it("should pick a host implementation automatically", function () {
      const host = WasiTest._internals.makeInstance({stdout: 1});
      expect(["wasi", "shim"]).to.include(host.impl);
      if (haveNodeWasi())
        expect(host.impl).to.equal("wasi");
    });

    it("should report the position letter for NO_TRIPLE at the Wasm ABI", function () {
      const cap = captured("shim");
      const host = WasiTest._internals.makeInstance({impl: "shim", stdout: 1});
      const res = WasiTest._internals.dispatchWasm(host.exports, "print(p)", null);
      expect(res.status).to.equal(WasiTest._internals.Statuses.NO_TRIPLE);
      expect(String.fromCharCode(res.errCode)).to.equal("p");
      cap.close();
    });

    it("should grow linear memory for large lines", function () {
      const cap = captured("shim");
      const validator = mockValidator();
      const results = cap.mod.register(validator, {ShExTerm: {}});
      const big = tripleCtx("s", "p", "x".repeat(300000));
      validator.semActHandler.handlers[TestExt].dispatch("print(o,o)", big, {});
      expect(results[0]).to.equal("x".repeat(600000));
      expect(cap.read()).to.equal("x".repeat(600000) + "\n");
      cap.close();
    });

    it("should handle many arguments", function () {
      const cap = captured("shim");
      const validator = mockValidator();
      const results = cap.mod.register(validator, {ShExTerm: {}});
      const code = "print(" + Array(1000).fill("'x'").join(",") + ")";
      validator.semActHandler.handlers[TestExt].dispatch(code, T, {});
      expect(results[0]).to.equal("x".repeat(1000));
      cap.close();
    });

    it("should surface fd_write failures as WASI errnos", function () {
      const dir = Fs.mkdtempSync(Path.join(Os.tmpdir(), "shex-wasi-test-"));
      const fd = Fs.openSync(Path.join(dir, "out.txt"), "w");
      Fs.closeSync(fd); // writing must now fail
      const validator = mockValidator();
      WasiTest.configure({impl: "shim", stdout: fd}).register(validator, {ShExTerm: {}});
      expect(() => validator.semActHandler.handlers[TestExt].dispatch('print("x")', T, {}))
        .to.throw(/fd_write failed with WASI errno 29/);
      Fs.rmSync(dir, {recursive: true, force: true});
    });
  });

  describe("integration with ShExValidator", function () {
    const ShExParser = require("@shexjs/parser");
    const {ShExValidator} = require("@shexjs/validator");
    const {ctor: RdfJsDb} = require("@shexjs/neighborhood-rdfjs");
    const ShExTerm = require("@shexjs/term");
    const N3 = require("n3");

    const dataText = '<http://ex.example/#n1> <http://ex.example/#p1> "val1" .\n';
    function validate (extension, schemaText, shape) {
      const schema = ShExParser.construct("http://ex.example/", {}).parse(schemaText);
      const db = RdfJsDb(new N3.Store(new N3.Parser().parse(dataText)));
      const validator = new ShExValidator(schema, db, {noCache: true});
      const results = extension.register(validator, {ShExTerm});
      const resultMap = validator.validateShapeMap(
        [{node: "http://ex.example/#n1", shape: shape}]);
      extension.done(validator);
      return {status: resultMap[0].status, results: results};
    }

    it("should print through the whole validation stack", function () {
      const cap = captured("auto");
      const res = validate(cap.mod, `
        PREFIX ex: <http://ex.example/#>
        %<http://shex.io/extensions/Test/>{ print("startup") %}
        ex:S { ex:p1 . %<http://shex.io/extensions/Test/>{ print(s, ' ', o) %} }
      `, "http://ex.example/#S");
      expect(res.status).to.equal("conformant");
      expect(res.results).to.deep.equal(["startup", "http://ex.example/#n1 val1"]);
      expect(cap.read()).to.equal("startup\nhttp://ex.example/#n1 val1\n");
      cap.close();
    });

    it("should make validation fail on fail()", function () {
      const cap = captured("auto");
      const res = validate(cap.mod, `
        PREFIX ex: <http://ex.example/#>
        ex:F { ex:p1 . %<http://shex.io/extensions/Test/>{ fail(o) %} }
      `, "http://ex.example/#F");
      expect(res.status).to.equal("nonconformant");
      expect(res.results).to.deep.equal(["val1"]);
      expect(cap.read()).to.equal("val1\n");
      cap.close();
    });
  });
});
