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
	"app/Events",
	'app/chrome/services'
],

function ($, helper, config, Layout, Events, Services) {
	window.layout = null;

	// ==========================
	// = ON WINDOW RESIZE EVENT =
	// ==========================
	$(window).on("resize", function() {
		if (layout !== undefined) {
			layout.calculate();
		}
	});

	function onPageChanged (pageId) {
		Services('storage', function(storage) {
			storage.selectedPage = pageId;
		});
	}

	function onItemDrop(item) {
		Services('storage', function(storage) {
			storage.save();
		});
	}

	function onLinkCreated(page, link) {
		Services('storage', function(storage) {
			console.log(link.data);
			storage.addItem(link.data);
		});
	}

	function onPageData(pageId, callback) {
		Services('storage', function(storage) {
			callback(storage.getItems({type:'link', pageId:pageId}));
		});
	}
	
	Services('storage', function(storage) {
		layout = new Layout($("div.layout"), {
			selectedPage: storage.selectedPage.toString()
		});

		layout.on('onItemDrop', onItemDrop);
		layout.on('onPageData', onPageData);
		layout.on('onLinkCreated', onLinkCreated);
		layout.on('onPageChanged', onPageChanged);
		
		layout.load();
	});
});