all:
	node node_modules/webpack/bin/webpack.js
	cp client/html/* public

.PHONY: all