JISON?=./node_modules/jison/lib/cli.js

./lib/ShExJison.js: ./lib/ShExJison.jison
	$(JISON) $^ -o $@ -p lalr

build: ./lib/ShExJison.js

test: build
	(cd test && make test)

publish-npm: ./lib/ShExJison.js
	npm publish

