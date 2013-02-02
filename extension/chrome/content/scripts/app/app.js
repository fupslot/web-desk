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
	var layout = undefined;
	// =========================
	// = RUNS THE APPLICATION! =
	// =========================
	var run = function() {
		layout = new Layout($("div.layout"));
	};
	// =========================

	// ==========================
	// = ON WINDOW RESIZE EVENT =
	// ==========================
	$(window).on("resize", function() {
		if (layout !== undefined) {
			layout.calculate();
		}
	});
	// ==========================

	return {
		"run": run
	};
});