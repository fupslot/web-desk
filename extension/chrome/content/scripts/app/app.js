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
	"app/layout",
	"data/DataLoader",
	"data/LayoutDataManager",

],

function ($, helper, config, Layout, DataLoader, LayoutDataManager) {
	window.layout = null;

	// DataLoader(function(data){
	// 	console.log(data);
	// 	LayoutDataManager.loadData(data);
	// });

	// =========================
	// = RUNS THE APPLICATION! =
	// =========================
	var run = function() {
		layout = new Layout($("div.layout"), LayoutDataManager);
		// ==========================
		// = ON WINDOW RESIZE EVENT =
		// ==========================
		$(window).on("resize", function() {
			if (layout !== undefined) {
				layout.calculate();
			}
		});
		// ==========================
	};
	// =========================

	return {
		"run": run
	};
});