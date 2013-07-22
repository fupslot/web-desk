/*!
 * Main Script
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

// ==================================================
// = WILL PREVENT SCRIPT CACHEING IN GOOGLE CHROME  =
// ==================================================
// var require = {
// 	"waitSeconds": "15",
// 	"urlArgs": "bust="+(new Date()).getTime()
// };
// ==================================================

require.config({
	"waitSeconds": "15",
	"urlArgs": "bust="+(new Date()).getTime(),
	"baseUrl": "scripts/lib",
	"paths": {
		"jquery": "jquery/jquery",
		"mustache": "mustache/mustache",
		"text": "requirejs-text/text",
		"app": "../app",
		"data": "../app/data",
		"template": "../template"
	}
});

require(
[
	"jquery",
	"app/helper",
	"app/config",
	"app/layout",
	"app/Events"
],

function ($, helper, config, Layout, Events) {
	window.layout = null;

		layout = new Layout($("div.layout"));
		// ==========================
		// = ON WINDOW RESIZE EVENT =
		// ==========================
		$(window).on("resize", function() {
			if (layout !== undefined) {
				layout.calculate();
			}
		});
		// ==========================


	chrome.runtime.getBackgroundPage(function(win){
		console.log(win.DATA_LOADED);
	});


});