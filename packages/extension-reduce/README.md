# @shexjs/extension-reduce

ShEx as a parser generator: the schema recognizes, the actions reduce.

A ShEx schema recognizes a subgraph the way a grammar recognizes a string, and a
validation result is the parse tree it recognized it by. This is the other half
a parser generator has: an action per production, run bottom-up over that tree,
each one reducing what its children produced into one value. What comes out is
an AST.

> Working title while this was being built: `extension-yacc`. It is named for
> the half of yacc it is — the `$$ = $1 + $3` half — rather than for the parser
> generator, since ShEx is already the parser generator here.

## The calculator

`examples/calc/` has three files that never mention each other.

The grammar, `calc.shex`:

```shex
<#Expr> @<#BinOp> OR @<#Num>
<#BinOp> { a [:Add :Sub :Mul :Div] ; :left @<#Expr> ; :right @<#Expr> }
<#Num>   { a [:Num] ; :value xsd:integer }
```

A graph in that language, `expr1.ttl` — `(1 + 2) * 3`:

```turtle
<#e1> a :Mul ; :left <#e2> ; :right <#e3> .
<#e2> a :Add ; :left <#e4> ; :right <#e5> .
<#e3> a :Num ; :value 3 .
```

And a compiler, `calc-actions.ttl`, as a
[`@shexjs/semact-overlay`](../semact-overlay):

```turtle
<#compile> a sa:Overlay ; sa:extension <http://shex.io/extensions/Reduce/> ;
  sa:action
  [ sa:ref <http://a.example/calc#Num> ;
    sa:code "{op: 'num', value: num(one(':value'))}" ] ,
  [ sa:ref <http://a.example/calc#BinOp> ;
    sa:code "{op: local(one('a')), left: one(':left'), right: one(':right')}" ] .
```

Recognizing the graph against the grammar and folding the actions over the
result gives:

```json
{"op": "Mul",
 "left": {"op": "Add", "left": {"op": "num", "value": 1}, "right": {"op": "num", "value": 2}},
 "right": {"op": "num", "value": 3}}
```

which an evaluator that has never heard of RDF can then run. Compiled, not
evaluated as it matched — the grammar and the compiler are separate documents,
and a second overlay could compile the same grammar to something else.

## Using it

```js
const Reduce = require('@shexjs/extension-reduce');

const validator = new ShExValidator(schema, db, {});
Reduce.register(validator);
const res = validator.validateShapeMap(shapeMap);
const ast = Reduce.reduce(res, {prefixes: {'': 'http://a.example/calc#'}});
```

`reduce` returns one value per node/shape pair in the map.

## What an action sees

An action is JavaScript: an expression if it parses as one, a function body
otherwise, so both of these work.

    {op: 'num', value: num(one(':value'))}

    const v = one(':value');
    return v > 0 ? {op: 'pos', v} : {op: 'neg', v};

On a **shape**:

| name | is |
| --- | --- |
| `node` | the focus term |
| `shape` | the label it matched |
| `one(p)` | the one value the arc on `p` reduced to; complains if there isn't exactly one |
| `opt(p)` | that value or `undefined`; complains if there is more than one |
| `all(p)` | every value, as an array |
| `has(p)` | whether there is one |
| `arcs` | all of them, by predicate |

On a **triple constraint**: `subject`, `predicate`, `object`, and `value` — what
the object reduced to. What the action returns stands in for that arc.

Reading terms, in both: `str` `num` `iri` `local` `lang` `datatype` `isBnode`,
plus `RDF`, `XSD` and `nil`. A predicate is written as a full IRI, as `a`, or
with a prefix from `reduce`'s `prefixes` option.

## What a production reduces to

- a shape with an action: what the action returned
- **a shape without one: its node** — so you write actions only for the
  productions you care about, and the rest give you what they matched
- an `OR`: whichever branch matched
- an `AND`: whichever conjunct had something to say, since an AND is several
  constraints on one node. `IRI /pattern/` and `BNODE CLOSED {...}` are the
  everyday shapes of this
- a cycle in the data: the node, so that a language whose references are IRIs
  gets its reference back. `{onRecursion: 'marker' | 'throw'}` says otherwise

## When the actions run

**After the match, not during it.** The matcher backtracks, and an action that
fired on a partition it later abandoned would have built part of an AST for a
parse that never happened. Dispatch only records that an action applies at a
place in the result; `reduce()` folds the result that survived.

So an action cannot reject a match — that is the schema's job — and it is free
to be as effectful as it likes. Actions on `EachOf`/`OneOf` groups are not run:
a shape's action already sees everything its body matched, by predicate.

Actions are code that arrived with a document. Registering this extension is
where you decide to run it.

## ShExR

`examples/shexr/` is the same trick on a bigger grammar: `ShExR.shex` is the
schema for ShEx schemas written as RDF, and `shexr-actions.ttl` is one action
per production saying what that production means in ShExJ. Together they read
ShExR, which `ShExUtil.valuesToSchema` does in about 280 lines of hand-written
walking.

It reads 440 of the 441 ShExR documents in shexTest's `schemas/`. The one it
doesn't, `3circRefS2-IS3.ttl`, doesn't comply with `ShExR.shex`; its entry in
`schemas/manifest.ttl` is commented out for the same reason.

RDF lists come out of the same mechanism as everything else — a list shape
recurses on `rdf:rest`, so its action conses the head onto what the tail
reduced to:

```js
[one('rdf:first')].concat(one('rdf:rest') === nil ? [] : one('rdf:rest'))
```
