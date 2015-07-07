../lib/ShExParser.js: ../lib/ShExParser.jison
	jison $^ -o $@ -p lalr

test: ../lib/ShExParser.js
	mocha -C ShExParser-test.js
