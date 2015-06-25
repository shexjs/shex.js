shExDoc.js: shExDoc.jison
	jison $^ -o $@ -p lalr

js: shExDoc.js kitchenSink.shex
	node shex_parser_node.js kitchenSink.shex

