# @shexjs/extension-reduce

ShEx as a parser generator: the schema recognizes, the actions reduce.

A ShEx schema recognizes a subgraph the way a grammar recognizes a string, and a
validation result is the parse tree it recognized it by. This is the other half
a parser generator has: an action per production, run bottom-up over that tree,
each one reducing what its children produced into one value. What comes out is
an AST.

> Working title while this was being built: `extension-yacc`. It is named for
> the half of yacc it is — the `$$ = $1 + $3` half — rather than for the parser
> generator, since ShEx is already the parser generator here. Unlike yacc,
> which splices action text into the C it emits, this hands each action a
> scope of data and asks a pluggable evaluator to run it; the actions in the
> examples are JavaScript because `@shexjs/extension-reduce-js` is, not because the fold
> is.

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
result — with `@shexjs/extension-reduce-js` running the code between the quotes — gives:

```json
{"op": "Mul",
 "left": {"op": "Add", "left": {"op": "num", "value": 1}, "right": {"op": "num", "value": 2}},
 "right": {"op": "num", "value": 3}}
```

which an evaluator that has never heard of RDF can then run. Compiled, not
evaluated as it matched — the grammar and the compiler are separate documents,
and a second overlay could compile the same grammar to something else.

## Naming what a production matched

yacc writes `$$ = $1 + $3`. A ShEx production's parts have names rather than
positions — they are arcs — so the name is the usual way to reach one, and a
production can be written as its sub-expressions:

```turtle
[ sa:ref sx:NodeConstraint ;
  sa:code "$ = Object.assign({type: 'NodeConstraint'},
                             ...($sx:nodeKind || []), ...($sx:datatype || []))" ] ,
[ sa:path "@sx:NodeConstraint~sx:nodeKind" ; sa:code "$ = {nodeKind: local($1)}" ] ,
[ sa:path "@sx:NodeConstraint~sx:datatype" ; sa:code "$ = {datatype: $1}" ] ,
```

| | |
| --- | --- |
| `$sx:nodeKind` `$<http://…#nodeKind>` `$:local` | what the arc on that predicate reduced to, as an array — and `undefined` if the arc didn't match, so `\|\| []` reads as "however many of these there were" |
| `$1` `$2` | the values in the order the body matched them, numbered from 1 as in yacc. This is for the sub-productions that share a name, which is the case a name can't address; on a triple constraint, `$1` is its object |
| `$` `$$` | this production's value, which the action may assign to |

This is *this module's* doing rather than the evaluator's: the code is rewritten
to ordinary names — `_nodeKind`, `_1`, `_ret` — and the values arrive beside it
as `bindings`. So the syntax is the same whatever the actions are written in,
and an implementation of this fold in another language gets it by doing the
same rewrite.

It is a textual substitution. yacc splices `$1` into the C it emits because it
knows what C is; this doesn't know what your actions are written in, so:

- `$name` with no prefix is left alone — `$` starts an identifier in several
  action languages, and a name with no prefix is not a predicate.
- A bare `$` before `{`, `/` or a quote is left alone: far more likely a
  template literal, the end of a regular expression, or a dollar sign in a
  string than a reference.
- Anywhere else, `$1` is a reference — inside a string literal too.

## Using it

```js
const Reduce = require('@shexjs/extension-reduce');
const evaluate = require('@shexjs/extension-reduce-js');       // or your own

const validator = new ShExValidator(schema, db, {});
Reduce.register(validator);
const res = validator.validateShapeMap(shapeMap);
const ast = Reduce.reduce(res, {evaluate, prefixes: {'': 'http://a.example/calc#'}});
```

`reduce` returns one value per node/shape pair in the map.

## This module has no action language

`evaluate` is required, and it is the only language-dependent part. Everything
above it — which production reduced, what its arcs reduced to — is the same
whatever the actions are written in, which is what makes the fold portable: an
implementation in Rust or Python or Java reimplements *this* and brings its own
evaluator.

So no functions cross the line. An evaluator is handed plain data:

| | |
| --- | --- |
| `kind` | `'shape'` or `'tripleConstraint'` |
| `node`, `shape` | the focus term and the label it matched |
| `arcs` | what each arc reduced to, keyed by **full predicate IRI** |
| `subject`, `predicate`, `object`, `value` | for a constraint: the triple, and what its object reduced to |
| `bindings` | what each `$…` in the code was rewritten to, and what it stands for |
| `ret` | the name the action assigns its value to, if it used `$` |
| `prefixes`, `api` | what the caller passed |
| `where` | where in the result this is, for error messages |

An evaluator puts `bindings` in scope by name and is done with `$…`; the one
thing it has to say for itself is `ret`, since "the name the action assigned
to" is a question only the language can answer.

Everything an action author expects — `one(':left')`, `str`, `num`, prefix
expansion, "an expression if it parses as one" — is the *evaluator's* doing,
not this module's. [`@shexjs/extension-reduce-js`](../extension-reduce-js) is the JavaScript one,
and its README is the list.

An evaluator is a function, so a second action language is not a fork:

```js
// a JSON template whose "$p" strings name arcs
const template = (code, scope) => JSON.parse(code, (k, v) =>
  typeof v === 'string' && v[0] === '$'
    ? (scope.arcs[scope.prefixes[''] + v.substr(1)] || [])[0]
    : v);
```

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

Actions are code that arrived with a document. Passing an evaluator is where
you decide to run it — and which language you run.

## ShExR

`examples/shexr/` is the same trick on a bigger grammar: `ShExR.shex` is the
schema for ShEx schemas written as RDF, and `shexr-actions.ttl` is one action
per production saying what that production means in ShExJ. Together they read
ShExR, which `ShExUtil.valuesToSchema` does in about 280 lines of hand-written
walking.

It reads 440 of the 441 ShExR documents in shexTest's `schemas/`. The one it
doesn't, `3circRefS2-IS3.ttl`, doesn't comply with `ShExR.shex`; its entry in
`schemas/manifest.ttl` is commented out for the same reason.

`NodeConstraint` there is written as its sub-expressions — one action per
attribute saying what that attribute means in ShExJ, and the production
merging what they said — and the rest are written as one action each, so the
file has both styles side by side.

RDF lists come out of the same mechanism as everything else — a list shape
recurses on `rdf:rest`, so its action conses the head onto what the tail
reduced to:

```js
[one('rdf:first')].concat(one('rdf:rest') === nil ? [] : one('rdf:rest'))
```
