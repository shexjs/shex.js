# debugging: MOCHA='mocha --debug-brk'

JISON?=../node_modules/jison/lib/cli.js
MOCHA?=mocha
TESTDIR?=../../shexTest/ # needs trailing '/'
GENJSON?=$(join $(TESTDIR), bin/genJSON.js)
REPORTER?=dot
HTTP_CLI_TEMPLATE?="http://raw.githubusercontent.com/shexSpec/shex.js/BRANCH/test/"

ValidationManifest=$(join $(TESTDIR), validation/manifest.jsonld) # isn't there an easier way to construct filenames?

../lib/ShExJison.js: ../lib/ShExJison.jison
	$(JISON) $^ -o $@ -p lalr

Parser-Writer-test: ../lib/ShExJison.js Parser-Writer-test.js
	$(MOCHA) -C -R $(REPORTER) Parser-Writer-test.js

Partition-test: ../lib/ShExJison.js Partition-test.js
	$(MOCHA) -C -R $(REPORTER) Partition-test.js

Compilation-test: ../lib/ShExJison.js ../lib/ShExUtil.js Compilation-test.js
	$(MOCHA) -C -R $(REPORTER) Compilation-test.js

$(ValidationManifest): $(join $(TESTDIR), validation/manifest.ttl) $(GENJSON)
	$(GENJSON) $< -o $@ -e # suppress output if there are errors

Validation-test: ../lib/ShExJison.js ../lib/ShExValidator.js Validation-test.js $(ValidationManifest)
	$(MOCHA) -C -R $(REPORTER) Validation-test.js

Map-test: ../lib/ShExJison.js Map-test.js
	(cd .. && $(MOCHA) -C -R $(REPORTER) test/Map-test.js)

cli-test: ../lib/ShExJison.js cli-test.js
	HTTPTEST=$(subst BRANCH,$(shell git rev-parse --abbrev-ref HEAD),$(HTTP_CLI_TEMPLATE)) \
	$(MOCHA) -C -R $(REPORTER) cli-test.js

test: Parser-Writer-test Partition-test Compilation-test Validation-test Map-test cli-test

