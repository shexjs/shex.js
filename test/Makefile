JISON?=../node_modules/jison/lib/cli.js

../lib/ShExJison.js: ../lib/ShExJison.jison
	$(JISON) $^ -o $@ -p lalr

Parser-Writer-test: ../lib/ShExJison.js Parser-Writer-test.js
	mocha -C -R dot Parser-Writer-test.js

Partition-test: ../lib/ShExJison.js Partition-test.js
	mocha -C -R dot Partition-test.js

Validation-test: ../lib/ShExJison.js ../lib/ShExValidator.js ../lib/ShExResults.js Validation-test.js
	mocha -C -R dot Validation-test.js

test: Parser-Writer-test Partition-test Validation-test

