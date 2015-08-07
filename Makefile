JISON?=./node_modules/jison/lib/cli.js

./lib/ShExJison.js: ./lib/ShExJison.jison
	$(JISON) $^ -o $@ -p lalr

test: ./lib/ShExJison.js
	(cd test && mocha -R dot -C Parser-Writer-test.js)

publish-npm: ./lib/ShExJison.js
	npm publish

