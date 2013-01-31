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
		"app": "../app"
	}
});

require(["jquery", "app/app"], function ($, app) {
	app.run();
});