# debugging: MOCHA='mocha --debug-brk'

JISON?=../node_modules/jison/lib/cli.js
MOCHA?=mocha

../lib/ShExJison.js: ../lib/ShExJison.jison
	$(JISON) $^ -o $@ -p lalr

Parser-Writer-test: ../lib/ShExJison.js Parser-Writer-test.js
	$(MOCHA) -C -R dot Parser-Writer-test.js

Partition-test: ../lib/ShExJison.js Partition-test.js
	$(MOCHA) -C -R dot Partition-test.js

Compilation-test: ../lib/ShExJison.js ../lib/ShExUtil.js Compilation-test.js
	$(MOCHA) -C -R dot Compilation-test.js

Validation-test: ../lib/ShExJison.js ../lib/ShExValidator.js ../lib/ShExResults.js Validation-test.js
	$(MOCHA) -C -R dot Validation-test.js

test: Parser-Writer-test Partition-test Compilation-test Validation-test

