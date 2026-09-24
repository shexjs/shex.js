# Builds every package's lib/ (and the web apps' committed page scripts)
# from source.  `npm run compile` runs `make ALL`; `npm ci` does too.
#
# Each TypeScript package is one line in the table below:
#   $(eval $(call package,DIR,OUTPUT,UPSTREAM...))
# DIR is the directory under packages/, OUTPUT the file tsc writes into its
# lib/ (normally package.json's `main`), and UPSTREAM the workspace packages
# it depends on at runtime (package.json dependencies + peerDependencies).
# A package is rebuilt when any of its src/*.ts, its package.json or
# tsconfig.json, or an upstream package's OUTPUT changes.  Lines are in
# dependency order: a package comes after everything it lists.
# packages/shex/test/Makefile-test.js checks the table against the
# package.json files, so a new package or dependency fails `npm test` until
# it is listed here.

TSC   := $(CURDIR)/node_modules/.bin/tsc
JISON := $(CURDIR)/node_modules/.bin/ts-jison

# $(call package,DIR,OUTPUT,UPSTREAM...): the lib/ rule for one package.
# The recipe is `tsc` unless BUILD.DIR names another command.
# (The table pads its columns, so each argument is $(strip)ped.)
define package
OUTPUT.$(strip $(1)) := packages/$(strip $(1))/lib/$(strip $(2))
PACKAGE_OUTPUTS += packages/$(strip $(1))/lib/$(strip $(2))
packages/$(strip $(1))/lib/$(strip $(2)): $(wildcard packages/$(strip $(1))/src/*.ts) packages/$(strip $(1))/package.json packages/$(strip $(1))/tsconfig.json $(foreach u,$(3),$(OUTPUT.$(u)))
	cd packages/$(strip $(1)) && $(if $(BUILD.$(strip $(1))),$(BUILD.$(strip $(1))),$(TSC))
endef

# Packages whose build is more than tsc.
# extension-wasi: gen-prelude embeds lib/prelude.wat as src/prelude-wat.ts, then tsc
BUILD.extension-wasi := npm run build

# ----------------------------------------------------------------------------
#                   DIR                    OUTPUT                        UPSTREAM
$(eval $(call package,shex-term,            shex-term.js,))
$(eval $(call package,eval-validator-api,   validator-api.js,            shex-term))
$(eval $(call package,eval-simple-1err,     eval-simple-1err.js,         eval-validator-api shex-term))
$(eval $(call package,eval-threaded-nerr,   eval-threaded-nerr.js,       eval-validator-api shex-term))
$(eval $(call package,extension-eval,       shex-extension-eval.js,))
$(eval $(call package,shape-map,            shape-map.js,                shex-term))
$(eval $(call package,shex-parser,          shex-parser.js,              shex-term))
$(eval $(call package,shex-visitor,         shex-visitor.js,             shex-term))
$(eval $(call package,shex-writer,          shex-writer.js,))
$(eval $(call package,shex-util,            shex-util.js,                shex-term shex-visitor shex-writer))
$(eval $(call package,shex-editor-services, editor-services.js,          shape-map shex-parser shex-util))
$(eval $(call package,shex-loader,          shex-loader.js,              shex-parser shex-util))
$(eval $(call package,shex-node,            shex-node.js,                shex-loader))
$(eval $(call package,neighborhood-api,     neighborhood-api.js,         shex-term))
$(eval $(call package,neighborhood-rdfjs,   neighborhood-rdfjs.js,       eval-validator-api neighborhood-api shex-term))
$(eval $(call package,neighborhood-sparql,  neighborhood-sparql.js,      eval-validator-api neighborhood-api shex-term shex-util shex-visitor))
$(eval $(call package,neighborhood-wikibase,neighborhood-wikibase.js,    neighborhood-api))
$(eval $(call package,shex-validator,       shex-validator.js,           eval-simple-1err eval-threaded-nerr eval-validator-api \
                                                                         neighborhood-api shex-term shex-visitor))
$(eval $(call package,shex-webapp,          shex-serve.js,               eval-simple-1err eval-threaded-nerr eval-validator-api \
                                                                         neighborhood-api neighborhood-rdfjs neighborhood-sparql \
                                                                         neighborhood-wikibase shape-map shex-editor-services \
                                                                         shex-loader shex-parser shex-term shex-util \
                                                                         shex-validator shex-visitor shex-writer))
$(eval $(call package,extension-map,        shex-extension-map.js,       eval-simple-1err shex-editor-services shex-node \
                                                                         shex-parser shex-term shex-util shex-visitor shex-webapp))
$(eval $(call package,extension-reduce,     shex-extension-reduce.js,))
$(eval $(call package,extension-reduce-js,  shex-extension-reduce-js.js,))
$(eval $(call package,extension-test,       shex-extension-test.js,))
$(eval $(call package,extension-wasi,       shex-extension-wasi.js,))
$(eval $(call package,extension-wasi-test,  shex-extension-wasi-test.js,))
$(eval $(call package,semact-overlay,       semact-overlay.js,           shex-visitor))
$(eval $(call package,shex-cli,             validate.js,                 eval-simple-1err eval-threaded-nerr eval-validator-api \
                                                                         extension-eval extension-map extension-test \
                                                                         neighborhood-api neighborhood-rdfjs neighborhood-sparql \
                                                                         neighborhood-wikibase shape-map shex-editor-services \
                                                                         shex-node shex-parser shex-term shex-util \
                                                                         shex-validator shex-visitor shex-writer))
$(eval $(call package,shex-shape-path-query,shape-path-query.js,         extension-map neighborhood-rdfjs shape-map shex-term \
                                                                         shex-util shex-validator))
$(eval $(call package,shex,                 shex.js,                     eval-simple-1err eval-threaded-nerr eval-validator-api \
                                                                         extension-eval extension-map extension-reduce \
                                                                         extension-reduce-js extension-test extension-wasi \
                                                                         extension-wasi-test neighborhood-api neighborhood-rdfjs \
                                                                         neighborhood-sparql neighborhood-wikibase semact-overlay \
                                                                         shape-map shex-cli shex-editor-services shex-loader \
                                                                         shex-node shex-parser shex-shape-path-query shex-term \
                                                                         shex-util shex-validator shex-visitor shex-webapp shex-writer))
$(eval $(call package,shex-language-server, server.js,                   neighborhood-rdfjs shex-editor-services shex-util shex-validator))
$(eval $(call package,shex-vscode,          extension.js,                shex-language-server))
# ----------------------------------------------------------------------------

# Inputs outside src/ that a package's build reads.
$(OUTPUT.shex-term):      packages/shex-term/shexv.d.ts
$(OUTPUT.shex-parser):    packages/shex-parser/lib/ShExJison.js
$(OUTPUT.shape-map):      packages/shape-map/lib/ShapeMapJison.js
$(OUTPUT.extension-wasi): packages/extension-wasi/lib/prelude.wat

# The generated parsers (edit the .jison, never the .js).
packages/shex-parser/lib/ShExJison.js: packages/shex-parser/lib/ShExJison.jison
	$(JISON) -n ShExJison -t javascript -p lr -o $@ $^

packages/shape-map/lib/ShapeMapJison.js: packages/shape-map/lib/ShapeMapJison.jison
	$(JISON) -n ShapeMapJison -t javascript -p lalr -o $@ $^

# The web apps' page scripts: TypeScript compiled with `module: none` into
# the COMMITTED doc/*.js a page (or a worker) loads as-is.  Each group is one
# tsconfig over one src/ subdirectory, and one tsc run writes all of it; CI
# rebuilds them (npm run check-page-scripts) and fails if the committed
# copies differ.
#   $(call page-scripts,DIR,SUBDIR,TSCONFIG): packages/DIR/src/SUBDIR/*.ts -> packages/DIR/doc/*.js
page-sources = $(wildcard packages/$(1)/src/$(2)/*.ts)
page-outputs = $(patsubst packages/$(1)/src/$(2)/%.ts,packages/$(1)/doc/%.js,$(filter-out %.d.ts,$(call page-sources,$(1),$(2))))
define page-scripts
PAGE_SCRIPTS += $(call page-outputs,$(1),$(2))
PAGE_GROUPS += page-scripts/$(1)/$(2)
$(call page-outputs,$(1),$(2)): $(call page-sources,$(1),$(2)) packages/$(1)/$(3)
	cd packages/$(1) && $(TSC) -p $(3)
.PHONY: page-scripts/$(1)/$(2)
page-scripts/$(1)/$(2):
	cd packages/$(1) && $(TSC) -p $(3)
endef

$(eval $(call page-scripts,shex-webapp,app,tsconfig.app.json))           # the app
$(eval $(call page-scripts,shex-webapp,worker,tsconfig.worker.json))     # its validation worker
$(eval $(call page-scripts,extension-map,plugin,tsconfig.plugin.json))   # the ShExMap plugin
$(eval $(call page-scripts,extension-reduce,plugin,tsconfig.plugin.json)) # the ShExReduce plugin

.PHONY: ALL page-scripts
ALL: $(PACKAGE_OUTPUTS) $(PAGE_SCRIPTS)

# Rebuild the page scripts unconditionally (CI's freshness check).
page-scripts: $(PAGE_GROUPS)
