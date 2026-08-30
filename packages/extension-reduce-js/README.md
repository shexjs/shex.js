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
term, `key` for using one as a key, `RDF` `XSD` `nil` `expand`, `state` for
what an action wants the next one to know, `reject` and `cut` for saying no,
and whatever the caller passed as `api`.

`reject(why)` refuses the production the action is on — the match goes on to
whatever else that node could be — and `cut(why)` says no other reading will
do either, so the node/shape pair fails where the action stood. Both work from
wherever the action found out, a loop or a helper included:

```js
if (num($1) === state.before(subject))
  reject('the sum of the numbers before it, so it ends the expression');
$$ = state.note(subject, num($1));
```

They are this package's rather than
[extension-reduce's](../extension-reduce#registereager--while-matching):
exceptions are a fact about *this* action language, and the scope that crosses
between the two is plain data. What they throw is caught here and handed back
as the value an action could have returned instead — `{failure: why}` or
`{failure: why, cut: true}` — which is what an evaluator for another language
would produce with whatever that language has. Refusing only means anything
while the matcher is matching (`registerEager`); folding a parse that already
happened, the value is a value like any other.

`key(term)` earns its place because an IRI and a blank node reach an action as
strings and a literal reaches it as `{value, type?, language?}` — and an object
used as a key is `"[object Object]"`, the same key for every literal there is.
`key` answers with the term as N-Triples writes it, so no two terms share one.

A predicate is written as a full IRI, as `a` (always `rdf:type`), or with a
prefix from `reduce`'s `prefixes` option.

`$sx:nodeKind`, `$1` and `$$` are
[extension-reduce's](../extension-reduce#naming-what-a-production-matched) —
they are ordinary names by the time the code gets here. All this does about
them is put `scope.bindings` in scope and, when `scope.ret` says the action
assigns to a name, answer with what that name ended up holding rather than
with the code's own value. `with` writes an assignment through to the object
when the name is one of its own, so `$$ = ...` needs nothing else.

## Writing another one

An evaluator is `(code, scope) => value`. The scope is documented in
[`extension-reduce`](../extension-reduce#this-module-has-no-action-language);
`namesFor(scope)` here is the object this one builds from it, exported so a
variant can reuse the accessors and bring a different way of running the code.

Running code that arrived with a document is a decision the caller makes by
passing this evaluator at all — another one can run something safer.
