# debugging: MOCHA='mocha --debug-brk'

JISON?=../node_modules/jison/lib/cli.js
MOCHA?=mocha
TESTDIR?=../../shexTest/ # needs trailing '/'
GENJSON?=../../test-suite/tests/genJSON.js
REPORTER?=dot

ValidationManifest=$(join $(TESTDIR), validations/manifest.jsonld) # isn't there an easier way to construct filenames?

../lib/ShExJison.js: ../lib/ShExJison.jison
	$(JISON) $^ -o $@ -p lalr

Parser-Writer-test: ../lib/ShExJison.js Parser-Writer-test.js
	$(MOCHA) -C -R $(REPORTER) Parser-Writer-test.js

Partition-test: ../lib/ShExJison.js Partition-test.js
	$(MOCHA) -C -R $(REPORTER) Partition-test.js

Compilation-test: ../lib/ShExJison.js ../lib/ShExUtil.js Compilation-test.js
	$(MOCHA) -C -R $(REPORTER) Compilation-test.js


$(ValidationManifest): $(join $(TESTDIR), validations/manifest.ttl) $(GENJSON)
	$(GENJSON) $< > $@

Validation-test: ../lib/ShExJison.js ../lib/ShExValidator.js Validation-test.js $(ValidationManifest)
	$(MOCHA) -C -R $(REPORTER) Validation-test.js

test: Parser-Writer-test Partition-test Compilation-test Validation-test

