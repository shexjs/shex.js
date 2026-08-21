# @shexjs/extension-reduce-js

The JavaScript evaluator for [`@shexjs/extension-reduce`](../extension-reduce).

`extension-reduce` folds one action per production over a validation result and
hands each action a scope of plain data — which production reduced, and what its
arcs reduced to. It has no opinion about what an action is written in. This is
the half that does: it puts that scope in scope as JavaScript names and runs
the code.

```js
const Reduce = require('@shexjs/extension-reduce');
const evaluate = require('@shexjs/extension-reduce-js');

Reduce.reduce(result, {evaluate, prefixes: {'': 'http://a.example/calc#'}});
```

## What an action can say

An action is an **expression** if it parses as one and a **function body** if it
doesn't, so both of these work and neither needs a keyword you have to remember:

```js
{op: 'num', value: num(one(':value'))}

const v = one(':value');
return v > 0 ? {op: 'pos', v} : {op: 'neg', v};
```

(An object literal at the head of a statement is a block in JavaScript, which is
why the expression reading is tried first.)

On a **shape**:

| name | is |
| --- | --- |
| `node` | the focus term |
| `shape` | the label it matched |
| `one(p)` | the one value the arc on `p` reduced to; complains if there isn't exactly one, and names the arcs there were |
| `opt(p)` | that value or `undefined`; complains if there is more than one |
| `all(p)` | every value, as an array |
| `has(p)` | whether there is one |
| `arcs` | all of them, by full predicate IRI |

On a **triple constraint**: `subject`, `predicate`, `object`, and `value` — what
the object reduced to. What the action returns stands in for that arc.

In both: `str` `num` `iri` `local` `lang` `datatype` `isBnode` for reading a
term, `RDF` `XSD` `nil` `expand`, and whatever the caller passed as `api`.

A predicate is written as a full IRI, as `a` (always `rdf:type`), or with a
prefix from `reduce`'s `prefixes` option.

`$sx:nodeKind`, `$1` and `$` are
[extension-reduce's](../extension-reduce#naming-what-a-production-matched) —
they are ordinary names by the time the code gets here. All this does about
them is put `scope.bindings` in scope and, when `scope.ret` says the action
assigns to a name, answer with what that name ended up holding rather than
with the code's own value. `with` writes an assignment through to the object
when the name is one of its own, so `$ = ...` needs nothing else.

## Writing another one

An evaluator is `(code, scope) => value`. The scope is documented in
[`extension-reduce`](../extension-reduce#this-module-has-no-action-language);
`namesFor(scope)` here is the object this one builds from it, exported so a
variant can reuse the accessors and bring a different way of running the code.

Running code that arrived with a document is a decision the caller makes by
passing this evaluator at all — another one can run something safer.
