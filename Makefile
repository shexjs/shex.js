
# Hand-maintained.  It began as the output of a generator over the
# packages' dependencies (tools/makeMake.js, 2023) and outgrew it: the
# parsers, the Lezer grammar, the app's own tsc run and the ordering
# between them are what it is for now.  Add a rule beside its neighbours.

JISON=./node_modules/.bin/ts-jison

# @shexjs/eval-validator-api
packages/eval-validator-api/lib/validator-api.js: packages/eval-validator-api/src/validator-api.ts packages/shex-term/lib/shex-term.js packages/shex-term/shexv.d.ts packages/eval-validator-api/package.json packages/eval-validator-api/tsconfig.json
	(cd packages/eval-validator-api && tsc)

# @shexjs/neighborhood-api
packages/neighborhood-api/lib/neighborhood-api.js: packages/neighborhood-api/src/neighborhood-api.ts packages/shex-term/lib/shex-term.js packages/shex-term/shexv.d.ts packages/neighborhood-api/package.json packages/neighborhood-api/tsconfig.json
	(cd packages/neighborhood-api && tsc)

# @shexjs/neighborhood-rdfjs
packages/neighborhood-rdfjs/lib/neighborhood-rdfjs.js: packages/neighborhood-rdfjs/src/neighborhood-rdfjs.ts packages/neighborhood-api/lib/neighborhood-api.js packages/neighborhood-rdfjs/package.json packages/neighborhood-rdfjs/tsconfig.json
	(cd packages/neighborhood-rdfjs && tsc)

# @shexjs/neighborhood-sparql
packages/neighborhood-sparql/lib/neighborhood-sparql.js: packages/neighborhood-sparql/src/neighborhood-sparql.ts packages/neighborhood-api/lib/neighborhood-api.js packages/shex-term/lib/shex-term.js packages/shex-visitor/lib/shex-visitor.js packages/neighborhood-sparql/package.json packages/neighborhood-sparql/tsconfig.json
	(cd packages/neighborhood-sparql && tsc)

# @shexjs/neighborhood-wikibase
packages/neighborhood-wikibase/lib/neighborhood-wikibase.js: packages/neighborhood-wikibase/src/neighborhood-wikibase.ts packages/neighborhood-wikibase/src/wikibase-rdf.ts packages/neighborhood-api/lib/neighborhood-api.js packages/neighborhood-wikibase/package.json packages/neighborhood-wikibase/tsconfig.json
	(cd packages/neighborhood-wikibase && tsc)

# @shexjs/term
packages/shex-term/lib/shex-term.js: packages/shex-term/src/shex-term.ts packages/shex-term/shexv.d.ts packages/shex-term/package.json packages/shex-term/tsconfig.json
	(cd packages/shex-term && tsc)

# @shexjs/visitor
packages/shex-visitor/lib/shex-visitor.js: packages/shex-visitor/src/shex-visitor.ts packages/shex-term/lib/shex-term.js packages/shex-term/shexv.d.ts packages/shex-visitor/package.json packages/shex-visitor/tsconfig.json
	(cd packages/shex-visitor && tsc)

# @shexjs/util
packages/shex-util/lib/shex-util.js packages/shex-util/lib/Merger.js packages/shex-util/lib/error-messages.js: $(wildcard packages/shex-util/src/*.ts) packages/shex-term/lib/shex-term.js packages/shex-visitor/lib/shex-visitor.js packages/shex-writer/lib/shex-writer.js packages/shex-util/package.json packages/shex-util/tsconfig.json
	(cd packages/shex-util && tsc)

# @shexjs/writer
packages/shex-writer/lib/shex-writer.js: packages/shex-writer/src/shex-writer.ts packages/shex-writer/package.json packages/shex-writer/tsconfig.json
	(cd packages/shex-writer && tsc)

# @shexjs/loader
packages/shex-loader/lib/shex-loader.js: packages/shex-loader/src/shex-loader.ts packages/shex-parser/lib/shex-parser.js packages/shex-loader/package.json packages/shex-loader/tsconfig.json
	(cd packages/shex-loader && tsc)

# @shexjs/node
packages/shex-node/lib/shex-node.js: packages/shex-node/src/shex-node.ts packages/shex-loader/lib/shex-loader.js packages/shex-node/package.json packages/shex-node/tsconfig.json
	(cd packages/shex-node && tsc)

# @shexjs/extension-eval
packages/extension-eval/lib/shex-extension-eval.js: packages/extension-eval/src/shex-extension-eval.ts packages/extension-eval/package.json packages/extension-eval/tsconfig.json
	(cd packages/extension-eval && tsc)

# @shexjs/extension-test
packages/extension-test/lib/shex-extension-test.js: packages/extension-test/src/shex-extension-test.ts packages/extension-test/package.json packages/extension-test/tsconfig.json
	(cd packages/extension-test && tsc)

# @shexjs/extension-wasi-test
packages/extension-wasi-test/lib/shex-extension-wasi-test.js: packages/extension-wasi-test/src/shex-extension-wasi-test.ts packages/extension-wasi-test/package.json packages/extension-wasi-test/tsconfig.json
	(cd packages/extension-wasi-test && tsc)

# @shexjs/extension-wasi
packages/extension-wasi/lib/shex-extension-wasi.js: packages/extension-wasi/src/shex-extension-wasi.ts packages/extension-wasi/package.json packages/extension-wasi/tsconfig.json
	(cd packages/extension-wasi && tsc)

# @shexjs/extension-map
packages/extension-map/lib/shex-extension-map.js: $(wildcard packages/extension-map/src/*.ts) packages/shex-term/lib/shex-term.js packages/shex-visitor/lib/shex-visitor.js packages/shex-util/lib/shex-util.js packages/extension-map/package.json packages/extension-map/tsconfig.json
	(cd packages/extension-map && tsc)

# @shexjs/semact-overlay
packages/semact-overlay/lib/semact-overlay.js: packages/semact-overlay/src/semact-overlay.ts packages/shex-visitor/lib/shex-visitor.js packages/semact-overlay/package.json packages/semact-overlay/tsconfig.json
	(cd packages/semact-overlay && tsc)

# @shexjs/extension-reduce-js
packages/extension-reduce-js/lib/shex-extension-reduce-js.js: packages/extension-reduce-js/src/shex-extension-reduce-js.ts packages/extension-reduce-js/package.json packages/extension-reduce-js/tsconfig.json
	(cd packages/extension-reduce-js && tsc)

# @shexjs/extension-reduce
packages/extension-reduce/lib/shex-extension-reduce.js: packages/extension-reduce/src/shex-extension-reduce.ts packages/extension-reduce/package.json packages/extension-reduce/tsconfig.json
	(cd packages/extension-reduce && tsc)

# @shexjs/shape-path-query
packages/shex-shape-path-query/lib/shape-path-query.js: packages/shex-shape-path-query/src/shape-path-query.ts packages/shex-validator/lib/shex-validator.js packages/shex-util/lib/shex-util.js packages/shex-term/lib/shex-term.js packages/shex-shape-path-query/package.json packages/shex-shape-path-query/tsconfig.json
	(cd packages/shex-shape-path-query && tsc)

# shex (meta-package)
packages/shex/lib/shex.js: packages/shex/src/shex.ts packages/shex-parser/lib/shex-parser.js packages/shex-writer/lib/shex-writer.js packages/shex-validator/lib/shex-validator.js packages/neighborhood-rdfjs/lib/neighborhood-rdfjs.js packages/shex-loader/lib/shex-loader.js packages/shex-node/lib/shex-node.js packages/shex-term/lib/shex-term.js packages/shex-util/lib/shex-util.js packages/shex-visitor/lib/shex-visitor.js packages/shape-map/lib/shape-map.js packages/shex/package.json packages/shex/tsconfig.json
	(cd packages/shex && tsc)

# @shexjs/eval-simple-1err
packages/eval-simple-1err/lib/eval-simple-1err.js: packages/eval-simple-1err/src/eval-simple-1err.ts packages/eval-validator-api/lib/validator-api.js packages/shex-term/lib/shex-term.js packages/shex-term/shexv.d.ts packages/shex-visitor/lib/shex-visitor.js packages/eval-simple-1err/package.json packages/eval-simple-1err/tsconfig.json
	(cd packages/eval-simple-1err && tsc)

# @shexjs/eval-threaded-nerr
packages/eval-threaded-nerr/lib/eval-threaded-nerr.js: packages/eval-threaded-nerr/src/eval-threaded-nerr.ts packages/eval-validator-api/lib/validator-api.js packages/shex-term/lib/shex-term.js packages/shex-term/shexv.d.ts packages/shex-visitor/lib/shex-visitor.js packages/eval-threaded-nerr/package.json packages/eval-threaded-nerr/tsconfig.json
	(cd packages/eval-threaded-nerr && tsc)

# @shexjs/validator
packages/shex-validator/lib/shex-validator.js packages/shex-validator/lib/shex-xsd.js packages/shex-validator/lib/feasibility.js packages/shex-validator/lib/repairs.js: $(wildcard packages/shex-validator/src/*.ts) packages/neighborhood-api/lib/neighborhood-api.js packages/eval-validator-api/lib/validator-api.js packages/shex-term/lib/shex-term.js packages/shex-term/shexv.d.ts packages/shex-visitor/lib/shex-visitor.js packages/shex-validator/package.json packages/shex-validator/tsconfig.json
	(cd packages/shex-validator && tsc)

packages/shex-parser/lib/ShExJison.js: packages/shex-parser/lib/ShExJison.jison
	$(JISON) -n ShExJison -t javascript -p lr -o $@ $^

# @shexjs/parser (wrapper around the generated ShExJison parser)
packages/shex-parser/lib/shex-parser.js: packages/shex-parser/src/shex-parser.ts packages/shex-parser/lib/ShExJison.js packages/shex-parser/package.json packages/shex-parser/tsconfig.json
	(cd packages/shex-parser && tsc)

packages/shape-map/lib/ShapeMapJison.js: packages/shape-map/lib/ShapeMapJison.jison
	$(JISON) -n ShapeMapJison -t javascript -p lalr -o $@ $^

# shape-map (wrapper around the generated ShapeMapJison parser)
packages/shape-map/lib/shape-map.js: packages/shape-map/src/shape-map.ts packages/shape-map/src/ShapeMapParser.ts packages/shape-map/src/ShapeMapSymbols.ts packages/shape-map/lib/ShapeMapJison.js packages/shape-map/package.json packages/shape-map/tsconfig.json
	(cd packages/shape-map && tsc)

.PHONY: ALL
ALL: packages/eval-validator-api/lib/validator-api.js packages/neighborhood-api/lib/neighborhood-api.js packages/neighborhood-rdfjs/lib/neighborhood-rdfjs.js packages/neighborhood-sparql/lib/neighborhood-sparql.js packages/neighborhood-wikibase/lib/neighborhood-wikibase.js packages/shex-term/lib/shex-term.js packages/shex-visitor/lib/shex-visitor.js packages/shex-util/lib/shex-util.js packages/shex-util/lib/error-messages.js packages/shex-writer/lib/shex-writer.js packages/shex-loader/lib/shex-loader.js packages/shex-node/lib/shex-node.js packages/extension-eval/lib/shex-extension-eval.js packages/extension-test/lib/shex-extension-test.js packages/extension-wasi-test/lib/shex-extension-wasi-test.js packages/extension-wasi/lib/shex-extension-wasi.js packages/extension-map/lib/shex-extension-map.js packages/semact-overlay/lib/semact-overlay.js packages/extension-reduce/lib/shex-extension-reduce.js packages/extension-reduce-js/lib/shex-extension-reduce-js.js packages/shex-shape-path-query/lib/shape-path-query.js packages/shex/lib/shex.js packages/eval-simple-1err/lib/eval-simple-1err.js packages/eval-threaded-nerr/lib/eval-threaded-nerr.js packages/shex-validator/lib/shex-validator.js packages/shex-validator/lib/shex-xsd.js packages/shex-validator/lib/feasibility.js packages/shex-validator/lib/repairs.js packages/shex-parser/lib/ShExJison.js packages/shex-parser/lib/shex-parser.js packages/shape-map/lib/ShapeMapJison.js packages/shape-map/lib/shape-map.js packages/shex-editor-services/lib/editor-services.js packages/shex-webapp/lib/shex-serve.js packages/shex-cli/lib/validate.js
#ALL: packages/eval-validator-api/lib/validator-api.js packages/neighborhood-api/lib/neighborhood-api.js packages/shex-term/lib/shex-term.js packages/eval-simple-1err/lib/eval-simple-1err.js packages/shex-validator/lib/shex-validator.js packages/shex-validator/lib/shex-xsd.js


# @shexjs/editor-services
packages/shex-editor-services/lib/editor-services.js: packages/shex-editor-services/src/editor-services.ts packages/shex-editor-services/src/editor-panes.ts packages/shex-editor-services/package.json packages/shex-editor-services/tsconfig.json
	(cd packages/shex-editor-services && npm run build)

# @shexjs/webapp shex-serve
packages/shex-webapp/lib/shex-serve.js: packages/shex-webapp/src/shex-serve.ts packages/shex-webapp/package.json packages/shex-webapp/tsconfig.json
	(cd packages/shex-webapp && npm run build)

# @shexjs/webapp: the app's page scripts written in TypeScript (src/app/ -> doc/)
packages/shex-webapp/doc/%.js: packages/shex-webapp/src/app/%.ts packages/shex-webapp/src/app/globals.d.ts packages/shex-webapp/tsconfig.app.json
	(cd packages/shex-webapp && npx tsc -p tsconfig.app.json)

# the ShExMap plugin, a page script built the same way
packages/extension-map/doc/ShExMapPlugin.js: packages/extension-map/src/plugin/ShExMapPlugin.ts packages/extension-map/src/plugin/globals.d.ts packages/extension-map/tsconfig.plugin.json
	(cd packages/extension-map && npx tsc -p tsconfig.plugin.json)

# @shexjs/cli shex-validate (bin/validate is a two-line shim over lib/validate.js)
packages/shex-cli/lib/validate.js: packages/shex-cli/src/validate.ts packages/shex-cli/src/untyped-modules.d.ts packages/neighborhood-api/lib/neighborhood-api.js packages/neighborhood-rdfjs/lib/neighborhood-rdfjs.js packages/shex-node/lib/shex-node.js packages/shex-validator/lib/shex-validator.js packages/shex-util/lib/shex-util.js packages/shex-term/lib/shex-term.js packages/shex-visitor/lib/shex-visitor.js packages/shex-writer/lib/shex-writer.js packages/shex-parser/lib/shex-parser.js packages/shape-map/lib/shape-map.js packages/shex-cli/package.json packages/shex-cli/tsconfig.json
	(cd packages/shex-cli && tsc)
