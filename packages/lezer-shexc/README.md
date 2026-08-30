# lezer-shexc

An incremental, error-tolerant [Lezer](https://lezer.codemirror.net/)
grammar for ShEx Compact Syntax (ShExC), with highlighting tags for
CodeMirror 6.

```js
import {parser} from "lezer-shexc";
const tree = parser.parse(schemaText);   // a @lezer/common Tree
```

The grammar follows the ShExC grammar in the
[ShEx specification](https://shex.io/shex-semantics/#shexc), in the LALR
shape [shex.js's own parser](../shex-parser/lib/ShExJison.jison) gives it,
so what parses here is what the validator accepts: every schema in the
ShEx test suite parses without an error node, and a schema the validator
refuses shows where.  Being Lezer, a half-typed schema still parses around
the error, and an edit re-parses only what it touched.

This is the editor's parse -- colour, folding, bracket matching, the
structure under the cursor.  The schema itself still comes from
`@shexjs/parser`; `@shexjs/editor-services` uses both.

`src/parser.js` is generated from `src/shexc.grammar` by `npm run build`
(`@lezer/generator`).
