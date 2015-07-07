./lib/ShExJison.js: ./lib/ShExJison.jison
	jison $^ -o $@ -p lalr

test: ./lib/ShExJison.js
	(cd test && mocha -C ShExParser-test.js)

publish-npm: ./lib/ShExJison.js
	npm publish

