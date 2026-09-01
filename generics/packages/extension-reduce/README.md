# @shexjs/extension-reduce

[![npm version](https://img.shields.io/npm/v/@shexjs/extension-reduce)](https://www.npmjs.com/package/@shexjs/extension-reduce)
[![CI](https://github.com/shexjs/shex.js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shexjs/shex.js/actions/workflows/ci.yml)

ShEx as a parser generator: the schema recognizes, the actions reduce.

``` shell
npm install @shexjs/extension-reduce
```

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
  sa:code "$$ = Object.assign({type: 'NodeConstraint'},
                             ...($sx:nodeKind || []), ...($sx:datatype || []))" ] ,
[ sa:path "@sx:NodeConstraint~sx:nodeKind" ; sa:code "$$ = {nodeKind: local($1)}" ] ,
[ sa:path "@sx:NodeConstraint~sx:datatype" ; sa:code "$$ = {datatype: $1}" ] ,
```

| | |
| --- | --- |
| `$sx:nodeKind` `$<http://…#nodeKind>` `$:local` | what the arc on that predicate reduced to — the value itself where the schema gives that shape at most one such arc, and the array of them where it may have several. `undefined` if the arc didn't match, so `\|\| []` reads as "however many of these there were" |
| `$1` `$2` | the values in the order the body matched them, numbered from 1 as in yacc. This is for the sub-productions that share a name, which is the case a name can't address; on a triple constraint, `$1` is its object |
| `$*` | all of them, in the order the body matched them — `Object.assign({}, ...$*)` is a production written as its sub-expressions without naming any of them |
| `$$` `$` | this production's value, which the action may assign to |

An arc reference is an array unless the schema says it cannot be: a constraint
that may match more than once, two constraints on one predicate, or a repeated
group around either. Reading it takes the schema, which `registerEager` has (it
is the validator's) and `reduce()` takes as the `schema` option — without one
every arc reference is an array, since nothing has said otherwise.

So where the schema allows one, `$:value` *is* the value and an evaluator's
`one(':value')` says the same thing the long way. What `one` is still for:

- an arc the schema allows more than one of, where "exactly one, and say what
  I did match if not" is the check the action wants to make;
- a predicate the action computes rather than writes — a `$`-reference is
  rewritten before anything runs, so its predicate is literal text;
- a fold with no schema to read the arities from, where `$:value` is the list
  and `one(':value')` is the value either way.

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
- A bare `$` where a value ends — before whitespace, `=`, `;`, `,`, `.`, a
  bracket, or the end of the code — is this production's value.
- A `$` with anything else after it is an **error**: `$@`, `$&`, `$#`, `$!`,
  `$^`, `$~`, `$+`. Passing those through is what makes a new `$X` a breaking
  change: an action that wrote `$@` would mean whatever the action language
  made of it, until the day `$@` meant a reference here. Perl learned that
  about `\q` in regular expressions the slow way. They are refused while they
  are free, which is also why `$$` is the spelling for a production's value:
  it has nothing after it to reinterpret.
- Anywhere else, `$1` is a reference — inside a string literal too.

`$$` and `$` are the same thing — yacc's left-hand side is `$$`, so an action
ported from one reads unchanged — but they are not equally future-proof, and
the examples here all write `$$`. A `$` with something after it is a reference
if this knows the something and left alone if it doesn't; give `${`, `$/` or
`$'` a meaning later and an action that wrote a bare `$` there says something
new. `$$` is a reference in every position and has nothing after it to
reinterpret, so an action written with it means today what it will mean then.

(`$*` is the shell's "all the arguments", which is what a production's values
are. make(1) is the other way round: its `$@` is the *target* — the left-hand
side, our `$$` — and `$^` is the whole right-hand side.)

## Using it

```js
const Reduce = require('@shexjs/extension-reduce');
const evaluate = require('@shexjs/extension-reduce-js');       // or your own
const {indexOverlay} = require('@shexjs/semact-overlay');

const validator = new ShExValidator(schema, db,
                                    {semActIndex: indexOverlay(schema, actions)});
Reduce.register(validator);
const res = validator.validateShapeMap(shapeMap);
const ast = Reduce.reduce(res, {evaluate, prefixes: {'': 'http://a.example/calc#'}});
```

`reduce` returns one value per node/shape pair in the map.

The overlay is where the actions come from, and it has two modes: `indexOverlay`
keys them by element and hands the validator the Map, as above, leaving the
schema untouched; `applyOverlay(schema, actions)` writes them into the schema
instead, and then the validator needs nothing. Either way `register` is what
makes the actions run: an action nobody registered a handler for is never
dispatched.

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
| `state` | one object for the run, handed to every action in it: where an action puts what the next one needs to know |
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

Which is why `examples/` is here and not there, though every action in it is
written in JavaScript and none of them runs without that package: what the
examples demonstrate is this one — the two bargains, refusing a match, a
production written as its arcs, actions in a document of their own — and
the JavaScript is the vehicle. Port the evaluator and the schemas, the data
and the manifest stay, with different code in the `%Reduce:{…%}` blocks.
The claim that holds that up is a pair of tests rather than a directory:
`Reduce-test` checks that no functions cross the line above, and `Calc-test`
compiles `calc.shex` and `expr1.ttl` — the example files, unchanged — with a
second overlay whose actions are JSON templates and a six-line evaluator for
them, to the same AST the JavaScript actions build.

(The JavaScript one is a *dependency* of this package rather than a
devDependency for one reason: `shexreduce-webapp.js`, the browser bundle
the plugin loads, has to put an evaluator on the page, and that is the one
it ships.)

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

Two bargains, and you pick one when you register.

**`register` — after the match.** The matcher backtracks, and an action that
fired on a partition it later abandoned would have built part of an AST for a
parse that never happened. Dispatch only records that an action applies at a
place in the result; `reduce()` folds the result that survived. So an action
runs exactly once, for a parse that actually happened — and an action cannot
reject a match, which is the schema's job. This is LR's bargain: defer the
reduction until the parse is decided.

**`registerEager` — while matching.** The action runs at dispatch, its value is
kept on the result so the fold takes it rather than running the code again, and
a value the `rejects` test recognizes *fails the match* — which sends an `OR`
to its next branch exactly as a node constraint that didn't hold would. This is
PEG's bargain, and it costs what PEG's costs: an action may run inside an
attempt that is then thrown away, and may run more than once for one node.

```js
Reduce.registerEager(validator, {evaluate, prefixes, rejects});
```

`rejects(value)` defaults to "a value with a `failure` key". Everything else is
a value, and becomes what that production reduced to.

There are two ways of saying no, and they differ in what happens next:

| | | |
| --- | --- | --- |
| **reject** | `{failure: why}` | this production is not it; the match goes on to whatever else the node could be |
| **cut** | `{failure: why, cut: true}` | ...and no other reading will do: the node/shape pair fails where the action stood |

A cut is the parser-combinator one (nom's `Err::Failure`, Prolog's `!`): the
alternatives that are left cannot be right, and each one tried buries the
reason this one failed under its own. Thrown rather than returned, it unwinds
whatever the matcher was in the middle of — a nested shape, a partition, a fork
— and lands at the node/shape pair the validator was asked about, which is
reported nonconformant with the action's reason. The other pairs of the shape
map are none of its business.

An evaluator may offer the same two as control flow, so an action can refuse
from wherever it finds out rather than arranging for a refusal to be its return
value; [the JavaScript one](../extension-reduce-js#what-an-action-can-say)
does, as `reject(why)` and `cut(why)`. That is the evaluator's to offer because
exceptions are a fact about the action language, and what crosses the line
between this module and one is plain data.

A refusal is a value; an **exception** is a bug in the action, and it takes the
fold (or the validation it was steering) with it. What it throws says which
production, which node and what the action said, and an `onError` option is
told about it before the throw goes on — a caller with somewhere to show it
gets to, without having to catch what it cannot usefully continue from.

`examples/calc-semact/` is the worked pair, two schemas over the same data and
the same rule — *the number that ends an expression is the sum of the numbers
before it*, which no schema can say, because it is a fact about what has been
read rather than about the number:

| | |
| --- | --- |
| `guide.shex` | `<#MidNum>` and `<#LastNum>` have the same body, so the schema leaves the choice open and the actions **steer** it: `<#MidNum>` rejects the number that is the sum, and the `OR` goes on to `<#LastNum>` |
| `falsify.shex` | `<#LastExpr>` is an operator whose right is another `<#LastExpr>`, so the schema **chooses** the last number structurally, and the action only checks it — a check that fails cuts, since the schema has already chosen and no other reading is left to try |

Both carry their actions inline (`%Reduce:{ … %}`), so the schema is the whole
example: it needs nothing of the caller but an evaluator, and nothing of you
but a look at it.

The running sum they keep is `state`, and a **start action** — one that runs
before the match rather than at some place in it — is what sets it up:

```shex
%Reduce:{
  state.noted = {};
  state.note = (node, value) => { state.noted[node] = value; return value; };
  state.before = node => Object.keys(state.noted)
    .filter(at => at !== node)
    .reduce((sum, at) => sum + state.noted[at], 0);
%}
```

Keyed by node rather than added up, because an eager action runs inside an
attempt that may be abandoned and may run twice for one node: `+=` would count
a node twice where noting it twice notes it once. What that keying can't undo
is a note taken down a branch that is then abandoned — state outliving an
attempt is the bill for an action that can decide one.

Either way, actions on `EachOf`/`OneOf` groups are not run: a shape's action
already sees everything its body matched, by predicate.

Actions are code that arrived with a document. Passing an evaluator is where
you decide to run it — and which language you run.

## ShExR

`examples/shexr/` is the same trick on a bigger grammar: `ShExR.shex` is the
schema for ShEx schemas written as RDF, and `shexr-actions.ttl` is one action
per production saying what that production means in ShExJ. Together they read
ShExR, which `ShExUtil.valuesToSchema` does in about 280 lines of hand-written
walking. (The `ShExR.shex` it reads is `@shexjs/util`'s copy of shexTest's
`doc/ShExR.shex` — the one the app and the CLIs read too, and a test there
checks it against the original.)

The actions bring their own helper rather than asking the caller for one: the
merging productions below are written with `state.merge`, and a **start
action** in the overlay is what defines it. So `issue-schema.ttl` — a small
schema, written as RDF — reads as the ShExJ it means given nothing but those
two files and an evaluator, which is what the manifest entry does.

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

---

`@shexjs/extension-reduce` is one of the [shex.js](https://github.com/shexjs/shex.js#readme) packages; installing [`shex`](https://www.npmjs.com/package/shex) pulls in the whole suite, and [its README](https://github.com/shexjs/shex.js/tree/main/packages/shex#the-shexjs-packages) maps them.
