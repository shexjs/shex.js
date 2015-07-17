../lib/ShExJison.js: ../lib/ShExJison.jison
	jison $^ -o $@ -p lalr

Parser-Writer-test: ../lib/ShExJison.js Parser-Writer-test.js
	mocha -C Parser-Writer-test.js

Partition-test: ../lib/ShExJison.js Partition-test.js
	mocha -C Partition-test.js

test: Parser-Writer-test Partition-test

