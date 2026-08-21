# @shexjs/semact-overlay

Semantic actions, kept out of the schema.

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
const withActions = applyOverlay(schema, overlayStore);   // schema is not modified
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

## Options

```js
applyOverlay(schema, overlay, {
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
