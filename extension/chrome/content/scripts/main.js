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

require(["jquery", "app/app", "text!template/text."], function ($, app, t_1) {
	console.log(t_1);
	app.run();
});