../lib/ShExJison.js: ../lib/ShExJison.jison
	jison $^ -o $@ -p lalr

test: ../lib/ShExJison.js
	mocha -C Parser-Writer-test.js
