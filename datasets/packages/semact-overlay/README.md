# @shexjs/semact-overlay

[![npm version](https://img.shields.io/npm/v/@shexjs/semact-overlay)](https://www.npmjs.com/package/@shexjs/semact-overlay)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

Semantic actions, kept out of the schema.

``` shell
npm install @shexjs/semact-overlay
```

A ShExC schema with `%<ext>{ code %}` sprinkled through it is a schema only one
program can read comfortably: everyone else has to step over somebody else's
code to see the shapes. An **overlay** says the same thing from outside — an RDF
document naming schema elements and the actions to hang on them — so the schema
stays the thing several tools can share.

```turtle
PREFIX sa: <http://shex.io/ns/semact#>

<#compile> a sa:Overlay ;
  sa:extension <http://shex.io/extensions/Reduce/> ;
  sa:action
    [ sa:ref  <http://a.example/calc#Num> ;
      sa:code "{op: 'num', value: num(one(':value'))}" ] ,
    [ sa:path "@<http://a.example/calc#BinOp>~<http://a.example/calc#left>" ;
      sa:code "['left', value]" ] .
```

```js
const {applyOverlay} = require('@shexjs/semact-overlay');
applyOverlay(schema, overlayStore);          // the actions are now in the schema
```

The idea, the vocabulary shape and the two ways of naming an element come from
[ericprud/shex-form](https://github.com/ericprud/shex-form), which does this for
`ui:` annotations on a schema it turns into a web form.

## The vocabulary

`http://shex.io/ns/semact#`

| term | on | means |
| --- | --- | --- |
| `sa:Overlay` | the document root | a set of actions to apply |
| `sa:extension` | an overlay, or one action | the SemAct `name` — which extension runs it |
| `sa:action` | an overlay | one action binding |
| `sa:ref` | an action | the element with this ShExJ `id` |
| `sa:path` | an action | the element this [ShapePath](https://github.com/shexSpec/ShapePath.js) selects |
| `sa:start` | an action | the schema's `startActs` |
| `sa:code` | an action | the SemAct `code` |
| `sa:order` | an action | where it goes among the actions on the same element |

An action names its element exactly one way: `sa:ref`, `sa:path` or `sa:start`.

`sa:ref` finds a label in the schema's index, so it reaches anything ShExC gave
a name — `<#Shape>` and `$<#tripleExpr>`. Everything else needs a `sa:path`; the
predicate shortcut is usually the readable one:

    @<http://a.example/S1>~<http://a.example/p2>       the constraint on :p2 in <S1>
    @<http://a.example/S1>/expression/expressions/*    every constraint in <S1>
    @<http://a.example/S1>/expression/expressions/*[0] the first of them

A `sa:ref` to a shape label lands on the shape *expression*, since ShExJ puts
`semActs` there rather than on the `ShapeDecl` around it. ShExJ has `semActs` on
`Shape`, `NodeConstraint`, `TripleConstraint`, `EachOf` and `OneOf`; an action
aimed anywhere else is refused, and the message says so.

## Ordering

RDF has no document order, so two actions on the same element are ordered by
`sa:order` and then by their code, which is arbitrary but the same every run.
Say `sa:order` when it matters.

## Two modes

Where the actions end up is the caller's choice, and it is the only difference
between the two:

```js
applyOverlay(schema, overlay);                // writes them into the schema
const index = indexOverlay(schema, overlay);  // keys them by element instead
```

`applyOverlay` costs the schema its innocence: an element the overlay names
comes away carrying `semActs`, and everything else holding that schema sees
them. It returns the schema, so a caller may read it either way.

`indexOverlay` leaves the schema exactly as it found it and answers with a
`Map` from element to actions. The keys are that schema's own objects, so the
Map means nothing without it — hand both to the validator:

```js
const validator = new ShExValidator(schema, db, {semActIndex: index});
```

The validator asks the dispatcher what applies to an element rather than
reading its `semActs`, so indexed actions are dispatched exactly where written
ones would be — *and* alongside them, since a schema may carry its own. Which
mode to use is a question about the schema, not about the actions: index it
when the schema is shared, on disk, or read again by something else; write on
it when the overlaid schema is the thing you are going to use.

`replace` has nothing to do in index mode: it is for keeping a second run from
stacking actions onto the schema, and a run of `indexOverlay` builds a new Map.

## Options

```js
applyOverlay(schema, overlay, {  // indexOverlay takes the same options
  base: 'http://a.example/',   // for resolving ShapePaths
  prefixes: {ex: '...'},       // for resolving ShapePaths
  replace: true,               // take over an element's actions instead of adding to them
  only: 'http://.../#compile', // read one sa:Overlay out of a document with several
})
```

`overlay` is anything with `getQuads(s, p, o)`; an `N3.Store` will do.

## The way back

A schema that already has `%<ext>{...%}` written through it can be taken apart:

```js
const {extractOverlay, overlayTurtle} = require('@shexjs/semact-overlay');
const {schema, actions, left} = extractOverlay(schemaWithActions);
Fs.writeFileSync('actions.ttl', overlayTurtle(actions, {subject: '<#compile>'}));
```

`schema` is a copy with the actions taken out, and `actions` puts them back.
Each is named the way an overlay can find it again: `sa:start` for the schema's
own, `sa:ref` for anything with an id, and `@<Shape>~<predicate>` for an
unlabelled constraint in a labelled shape.

An element with none of those — a constraint inside a `ShapeAnd`, say — has no
name an overlay can use, so its actions stay where they are and it is listed in
`left`. Saying nothing beats guessing wrong.

## See also

- [`@shexjs/extension-reduce`](../extension-reduce) — the extension these
  examples are written for: ShEx as a parser generator.

---

`@shexjs/semact-overlay` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
