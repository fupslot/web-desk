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
	"baseUrl": "scripts",
	"paths": {
		"jquery":     "lib/jquery",
		"mustache":   "lib/mustache",
		"text":       "lib/text",
		"app":        "app",
		"components": "components",
		"data":       "app/data",
		"template":   "template"
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
			isGroup 	= ct.querySelector('[type=checkbox]').checked;

		if (!isGroup) {
			layout.pctrl.pages[layout.selectedPageId].createLink({
				data: {
					url: url,
					title: title,
					imageURL: imageURL
				}
			});
		}
		else {
			layout.pctrl.pages[layout.selectedPageId].createGroup({
				data: {
					title: title,
					imageURL: imageURL
				}
			});	
		}
	});
	// ==================

	var keywordsURL = 'http://nytimes-adapted.appspot.com/UserAssist?ref=h&Action=GetRec&uid=A01';
	$.get(keywordsURL, function (data) {
		if (typeof data !== 'string') { return; }
		Services('storage', function (storage) {
			storage.keywords = data.split(',');
		});
	});


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
			storage.selectedPageId = page.id;

			if (!layout.isPagePredefined(page.id)) {
				sheets.pin(page);
			}
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
			// touchItem -> changeAccessTime(item)
			storage.touchItem(item);
		});
	}

	function onItemCreated(page, item) {
		Services('storage', function(storage) {
			storage.addItem(item.data);
		});
	}

	function onPageData(page, callback) {
		Services('storage', function(storage) {
			// if selectedPage is a group than on its first run 
			// fetch its group object from storage
			if (!page.group && !page.layout.isPagePredefined(page.id)) {
				page.group = storage.getItemById(page.id);
			}
			
			callback(storage.getItemsByPageId(page.id));
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
			selectedPageId: storage.selectedPageId.toString()
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
			// Services('storage', function (storage) {
				jumper._cache.items = storage.getAllItems();
				
				jumper.showItems();
			// });
		});

		jumper.on('onSearchRequest', function (value, keyCode) {
			// Services('storage', function (storage) {
				jumper._cache.items = storage.searchItems(value);
				jumper.showItems();
			// });
		});

		// this event occurs when item was dragged from jumper to a page
		jumper.on('onItemPlaced', function (item, page, pos) {
			// Services('storage', function (storage) {
				storage.touchItem(item);
			// });
		});
	});
});