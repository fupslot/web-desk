/*!
 * Main Script
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

require.config({
	"baseUrl": "scripts/lib",
	"paths": {
		"jquery": "jquery/jquery",
		"mustache": "mustache/mustache",
		"text": "requirejs-text/text",
		"app": "../app",
		"template": "../template"
	}
});

require(["app/app"], function (app) {
	app.run();
});