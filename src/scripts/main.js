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

require(["jquery", "mustache", "app/app"], function ($, Mustache, app) {
	var html = Mustache.render("<p>{{name}}</p>", {"name": "Eugene Brodsky"});
	$("body").append(html);
	app.changeBackgroundColor("#e6e");
});