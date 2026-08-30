# @shexjs/editor-services

What an editor needs from ShEx.js without being one: parsing with source
locations (`parseShExC`, `parseTurtle`, `parseShapeMap`, `locateInParsed`),
live diagnostics (`lintSchema`), validation results anchored in the schema
and data texts (`mapValidationErrors`: which constraint, which triple, and
the repairs pinned on the constraints they are about), completions, and the
`DebugRepl` the two terminal debuggers share.

```sh
npm install @shexjs/editor-services
```

`@shexjs/editor-services/lib/editor-panes` builds CodeMirror 6 panes over
textareas -- ShExC (highlighted by [`lezer-shexc`](../lezer-shexc)), Turtle,
ShapeMap, JSON -- with hover highlighting, tooltips and gutter breakpoints;
the web app (`@shexjs/webapp`) is its main client.  Compiled from `src/`
into `lib/` by `npm run build`.
