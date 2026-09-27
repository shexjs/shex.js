# Materialization by iteration scopes

`ThreadedMaterializer` (`lib/ThreadedMaterializer.js`) builds an instance of an output
schema from a ShExMap binding tree.  Since 2026-09 it does so by *iteration scopes*, the
model this document describes; the frame-cursor search it replaces is described in
[threaded-materializer.md](threaded-materializer.md), together with why it could not
preserve the input's structure once cardinality went above one.  The same model is
implemented in PyShEx (`pyshex.shexmap`), whose tests run every example here through
both implementations.

## 1. Binding trees

### 1.1 Terms

An IRI is a string, a blank node `"_:label"`, a literal `{"value": …}` with optional
`"type"` (a datatype IRI) or `"language"`.

### 1.2 Structure

A binding tree is a **scope**:

    Scope      ::= Object                     -- own bindings, no repeated parts
                 | [ Object, List* ]          -- own bindings (possibly {}), then one list per
                                              --   repeated constraint or group, in schema order
    List       ::= [ Object* ] | [ ScopeArray* ]   -- iterations, all objects or all arrays
    ScopeArray ::= [ Object, List* ]

An **object** maps variable IRIs to terms, plus reserved keys.  A **list** has one element
per iteration of a repeated constraint or group (max other than 1), each element a scope;
it is written even when nothing matched (empty), so a list's position says which
expression it came from whatever the data.  A list's elements are **uniform**: when some
iterations are arrays, a lone object iteration is written as `[object]`.  A non-repeated
nested shape merges into the scope that matched it.  The root is a scope.

Reading is position-directed: in scope position an array's first element is the
own-bindings object and the rest are lists; in list position an array is a list whose
elements are scopes, an object being a scope without lists.

Reserved keys begin with `@`.  They are never variables: no `%Map` code can read them, and
`normalizeBindingTree` drops them.  Readers must ignore reserved keys they do not know.

A **variable's depth** is the number of lists on the path from the root to the object that
binds it: bound once for the whole tree at depth 0, once per iteration of the enclosing
list at depth *n*.

### 1.3 `@node`

An iteration produced by a repeated shape-valued constraint carries `"@node": <term>`: the
node the nested shape was matched against (the object of the matched triple, or its
subject for an inverse constraint).  It is the natural key of the iteration; materialization
uses it for node identity (§2.4) and `id(@node)` (§2.4) reuses it.  Iterations of a repeated
group have no `@node`; the root has none.

### 1.4 Producing the tree

`bindingTree(validationResult)` (`lib/bindingTree.js`, exported by the module) builds the
tree from a validation result: the `%Map` bindings of a tested triple are the scope's own
bindings; a non-repeated shape-valued constraint's nested result merges; a repeated one
(`max` other than 1) makes a list with one iteration per tested triple, `@node` first; a
repeated group makes a list with one iteration per group solution; `ExtendedResults`
(EXTENDS) merges the extended shapes' bindings and the local ones.  `bin/materialize
--bindings` prints it.

`ShExUtil.valToExtension` remains for the legacy materializers; ThreadedMaterializer also
reads the two layouts it writes (a root written as its one list; a nested scope written as
a sibling of the constraint's own binding), and PyShEx's earlier `[[…]]` root.

## 2. Materialization

### 2.1 Definitions

*scope(v)*, for a variable *v*: the list it is bound at (its list path).  For a repetition
*R* in the output schema (any cardinality but exactly one, `?` included): *direct(R)* is the
variables read by constraints inside *R*'s body and not inside a nested repetition;
*nested(R)* the repetitions directly inside; **scope(R)** = the deepest of { scope(v) : v ∈
direct(R) } ∪ { parent list of scope(R') : R' ∈ nested(R) }.  A repetition with no
variables anywhere in its body iterates once.  *R* is **ill-formed** when two of those lists
lie in unrelated branches (neither contains the other): a MaterializationError names the two
variables.

### 2.2 Evaluation

Materialize the start shape at the root scope with the root node.

* A constraint with a `%Map` variable, evaluated at scope σ, **reads** it from σ's own
  bindings or from the nearest ancestor scope that binds it.  Reading marks nothing.  If no
  such binding exists the constraint fails.  A function code reads each variable it needs
  the same way; a static variable is read from `options.staticVars`.
* A non-repeated shape-valued constraint at σ creates its node (§2.4), asserts the link,
  and materializes the nested shape at σ.
* A repetition *R* at σ iterates the scopes below σ that are iterations of scope(R), in
  document order (so a repetition over a deeper list flattens).  For each it materializes
  *R*'s body at that scope.  An iteration whose body fails contributes nothing.  The number
  *k* of successful iterations must reach `min` or *R* fails; *R* stops at `max` (and at
  `options.maxRepeat`, when given).  When scope(R) is at or above σ, *R* runs its body once,
  at σ.
* A constraint without `%Map` code whose value expression names a single value asserts it;
  with any other value expression it fails.
* `OneOf`, `ShapeOr`, an optional constraint and a shape with extensions yield
  alternatives, per scope instance; the alternatives of the parts of a group or conjunction
  combine by product, pruned to the best `maxAccepts` as they combine.  Every complete
  alternative is an accept, ranked by distinct bindings read, then quads, then schema
  order; `materialize()` returns the first (or what `options.prefer` ranks first) and keeps
  the rest in `accepts`.

### 2.3 Value expressions

A value a `%Map` code produces must satisfy the constraint's value expression when that is
a node constraint (directly, by reference, or as the node-constraint parts of an `AND`,
`OR` or `NOT`).  A plain literal (no datatype, no language) whose lexical form is valid for
the expression's datatype is retyped to it, which is how `regex()` and `hashmap()` results
land in typed constraints; a typed literal is never retyped.  Any other mismatch fails the
constraint as an unbound variable does.  `options.checkValues = false` turns this off.

### 2.4 Node identity

* **Named** — the constraint carries a `%Map` variable: the variable's value is the node
  and the nested shape is materialized on it.
* **Keyed** — `%Map:{ id(arg, …) %}`, the constraint's only Map code; arguments are
  variables, `@node` (the input node the enclosing iteration matched), or IRI templates
  `<http://a.example/person/{v:mrn}>` whose placeholders take the values' lexical forms,
  percent-encoded except letters, digits and `-._~` (R2RML's rule).  One argument that is
  an IRI or blank node is the node itself; otherwise the node is a blank node keyed by the
  referenced shape and the values, so equal keys make one node and their arcs merge
  (grouping by value; a shared reference), and two shapes with equal keys stay apart.  With
  `id(@node)` a schema maps a graph onto itself node for node.  On the input side `id()`
  binds nothing, so one schema serves both directions.
* **Minted** — otherwise, a blank node determined by the root, the constraint, its call
  depth and the scope (its `@node` when it is an iteration, else its path).  Two runs over
  the same bindings and root agree; materializing the same root twice adds nothing.

### 2.5 Provenance

Every quad carries `tc` (the constraint) and `src`: `scope` (the input iteration's path),
`node` (the node it matched, or the nearest one above), `reads` (the `[scope path,
variable]` bindings read for the object), `statics` (the static variables read), and one of
`variables` (a variable's value), `code` (a function code's result), `constant`,
`structural` (a link to a minted node), `named`, or `keyed`.  `materializer.provenance` is
parallel to the chosen quads; every accept carries its own.

### 2.6 Updating a graph in place

`materializer.update(store, bindings, root, shape, rebind)` materializes into an RdfJs
store, replacing what the output schema currently holds at the root: `rebind(root, shape)`
(supplied by the caller: a validator over the store, as `bin/materialize --into` does)
returns the validation result of the store at that root, or null when the root holds
nothing on the schema's predicates; the triples it matched and no longer produced are
removed, the new ones added, the rest left alone.  A root that holds something not
conforming to the output schema is refused rather than guessed at.  Since minted nodes are
deterministic, an unchanged part of the input leaves its output unchanged.

### 2.7 Static checks

`analyse(inputSchema, outputSchema, {staticVars, inputStart, outputStart})`
(`lib/analysis.js`; `bin/shexmap-check`) decides before any data whether a pair maps
coherently: a repetition reading from unrelated lists; a constraint reading a variable bound
deeper than the scope it is evaluated at ("which one?"), or in a list not below it; a
variable read but never bound and not static; a variable with two binding sites; `id()`
misuse; undefined or abstract-without-extensions shapes are errors; bindings the output
never reads and unread static variables are warnings.

### 2.8 Round-trip laws

1. A schema maps to itself: `bind(materialize(S, bind(G, S)), S)` binds what `bind(G, S)`
   binds (lists compared as bags).
2. A schema binds back what it wrote: used as an input schema on its own output, *T* binds
   exactly the `(variable, value)` pairs, statics included, that materializing *T* read.
3. A pair recovers its bindings: for *S* and *T* sharing variables,
   `bind(materialize(S, bind(materialize(T, bind(G, S)), T)), S)` binds what `bind(G, S)`
   binds; the returned graph equals *G* up to the identity of nodes no variable carried
   through *T*.

## 3. The debugger's events

`run()` yields `{type: "tripleConstraint", tc, thread}` before a constraint, `fail` when
it fails, `{type: "enter", tc, thread, scope}` when a repetition's body starts on an
iteration, `return` when a subshape completes, and `accept` for each complete alternative
at the end.  The thread view is `{subject, depth, frame, scope, consumed, skipped,
emitted, used}`: `frame` is the scope's index in walk order (what `materializer.frames`
lists), `scope` its path, `skipped` always 0, `used` the `"<frame> <variable>"` marks of
the bindings read so far on this branch.
