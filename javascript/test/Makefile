../lib/ShExJison.js: ../lib/ShExJison.jison
	jison $^ -o $@ -p lalr

test: ../lib/ShExJison.js
	mocha -C ShExParser-test.js
