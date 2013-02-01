/*!
 * Application
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */
 
define(
[
	"jquery",
	"app/helper",
	"app/config",
	"app/layout"
],

function ($, helper, config, Layout) {

	// =========================
	// = RUNS THE APPLICATION! =
	// =========================
	var run = function() {
		var layout = new Layout($("div.layout"));
	};
	// =========================

	return {
		"run": run
	};
});