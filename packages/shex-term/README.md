# @shexjs/term

[![npm version](https://img.shields.io/npm/v/@shexjs/term)](https://www.npmjs.com/package/@shexjs/term)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

RDF terms as ShEx uses them: conversions between [RDF/JS terms](https://rdf.js.org/data-model-spec/), [ShExJ](https://shex.io/shex-semantics/#shexj)'s JSON-LD-style values, and Turtle lexical forms — plus the `Start` sentinel and the string-unescaping shared by the ShExC and ShapeMap parsers.

## Install

``` shell
npm install @shexjs/term
```

## Quick start

``` js
const Term = require("@shexjs/term");
const {DataFactory} = require("n3");

// RDF/JS term → ShExJ value (an IRI is a string; a literal is an object)
Term.rdfJsTerm2Ld(DataFactory.namedNode("http://a.example/n1"));
// 'http://a.example/n1'
Term.rdfJsTerm2Ld(DataFactory.literal("chat", "fr"));
// { value: 'chat', language: 'fr' }

// … and back
Term.ld2RdfJsTerm({value: "chat", language: "fr"});
// a Literal RDF/JS term for "chat"@fr

// either form → Turtle lexical form
Term.rdfJsTerm2Turtle(DataFactory.literal("chat", "fr"));   // '"chat"@fr'
Term.shExJsTerm2Turtle("http://a.example/n1");              // '<http://a.example/n1>'
```

## What's here

* **`rdfJsTerm2Ld(term)` / `ld2RdfJsTerm(ld)`** — between RDF/JS terms and the values ShExJ writes (IRI as string, `_:`‑prefixed blank node, literal as `{value, type?, language?}`).
* **`rdfJsTerm2Turtle(term, meta?)` / `shExJsTerm2Turtle(term, meta?)`** — render a term in Turtle, abbreviating with `meta`'s `base` and `prefixes` when given.
* **`Start` / `isStart(x)`** — the sentinel a [shape map](https://shexspec.github.io/shape-map/) uses to say "the schema's start shape": `{node, shape: Start}`. There is one frozen `Start` object; `isStart` also recognizes a structural clone (`{term: "START"}`), which is what survives a `postMessage` across a worker boundary.
* **`unescapeText(string, replacements)`** — the `\uXXXX`/`\U…` (and caller-supplied) escape decoding that the ShExC and ShapeMap grammars share.
* **`RdfLangString`, `XsdString`** — the two implicit literal datatypes.
* **`Terminals`** — regular expressions for RDF terminal productions (`IRIREF`, `PNAME_LN`, …).
* Types used across the suite: `SchemaIndex`, `ShapeMapEntry`, `Meta` and friends.

This package sits under everything else in the suite (the parsers, the validator, the neighborhoods), so it is versioned independently and depends on nothing else in it.

---

`@shexjs/term` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
