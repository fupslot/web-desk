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
		"components": "../components",
		"data": "../app/data",
		"template": "../template"
	}
});

require(
[
	'jquery',
	'app/helper',
	'app/config',
	'app/layout',
	'app/Events',
	'app/bin',
	'app/sheets',
	'app/chrome/services',
	'components/NewItem',
	'components/Jumper'
],

function ($, helper, config, Layout, Events, Bin, Sheets, Services, NewItem, Jumper) {
	window.layout = null;

	window.jumper = null;
	window.sheets = null;


	window.newItem = new NewItem('#new-item');

	// ==================
	// = temporary code =
	// ==================
	$('body > form').on('submit', function(e){
		e.preventDefault();
	
		var ct = e.currentTarget;

		var 
			url 		= ct.querySelector('[name=url]').value,
			title 		= ct.querySelector('[name=title]').value,
			imageURL 	= ct.querySelector('[name=image]').value,
			isGroup 	= ct.querySelector('[type=checkbox]').value;

		if (!isGroup) {
			layout.pctrl.pages[layout.selectedPage].createLink({
				data: {
					url: url,
					title: title,
					imageURL: imageURL
				}
			});
		}
		else {
			layout.pctrl.pages[layout.selectedPage].createGroup({
				data: {
					title: title,
					imageURL: imageURL
				}
			});	
		}
	});
	// ==================	


	// ==========================
	// = ON WINDOW RESIZE EVENT =
	// ==========================
	$(window).on("resize", function() {
		if (layout !== undefined) {
			layout.calculate();
		}
	});
	// ==========================

	// =================
	// = Layout Events =
	// =================
	function onPageChanged (page) {
		Services('storage', function(storage) {
			storage.selectedPage = page.id;
		});
	}
	
	function onItemDragStart () {
		// close jumper
		if (jumper.isShown()) {
			jumper.hide();
		}
	}

	function onItemDrop(item) {
		Services('storage', function(storage) {
			storage.save();
		});
	}

	function onItemClicked(item) {
		Services('storage', function(storage) {
			storage.touchItem(item);
		});
	}

	function onItemCreated(page, item) {
		Services('storage', function(storage) {
			storage.addItem(item.data);
		});
	}

	function onPageData(page, callback) {
		console.log('onPageData', page);
		Services('storage', function(storage) {
			callback(storage.getItems({pageId:page.id}));
		});
	}

	function onItemRemoved (page, item, canceled) {
		Services('storage', function(storage) {
			storage.removeItem(page, item.data);
		});
	}

	function onPageDblClick(page, evt) {
		if (!jumper.isShown()) {
			jumper.show();
		}
		else {
			jumper.hide();
		}
	}
	// =================
	
	Services('storage', function(storage) {
		layout = new Layout($("div.layout"), {
			selectedPage: storage.selectedPage.toString()
		});

		layout.on('onItemDragStart', onItemDragStart);
		layout.on('onItemDrop', onItemDrop);
		layout.on('onItemClicked', onItemClicked);
		layout.on('onPageData', onPageData);
		layout.on('onLinkCreated', onItemCreated);
		layout.on('onGroupCreated', onItemCreated);
		layout.on('onPageChanged', onPageChanged);
		layout.on('onItemRemoved', onItemRemoved);
		layout.on('onPageDblClick', onPageDblClick);
		
		layout.load();

		sheets = new Sheets(layout);
		sheets.on('onSheetChanged', function (sheetIdx) {
			layout.pctrl.show(sheetIdx);
		});

		jumper = new Jumper(layout);
		jumper.on('onShow', function () {
			Services('storage', function (storage) {
				jumper._cache.items = storage.getItems();
				
				jumper.showItems();
			});
		});

		jumper.on('onSearchRequest', function (value, keyCode) {
			Services('storage', function (storage) {
				jumper._cache.items = storage.getItems(value);
				jumper.showItems();
			});
		});

		// this event occurs when item was dragged from jumper to a page
		jumper.on('onItemPlaced', function (item, page, pos) {
			Services('storage', function (storage) {
				// storage.updateItemPosition(item, page, pos);
				storage.touchItem(item);
			});
		});
	});
});