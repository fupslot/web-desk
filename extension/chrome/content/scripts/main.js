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
	'app/chrome/services',
	'components/NewItem',
	'components/Jumper'
],

function ($, helper, config, Layout, Events, Bin, Services, NewItem, Jumper) {
	window.layout = null;

	window.newItem = new NewItem('#new-item');

	$('body > form').on('submit', function(e){
		e.preventDefault();
		
		var ct = e.currentTarget;
// debugger;
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
		Services('storage', function(storage) {
			callback(storage.getItems({pageId:page.id}));
		});
	}

	function onItemRemoved (page, item, canceled) {
		Services('storage', function(storage) {
			storage.removeItem(item.data, page.id);
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

		window.jumper = new Jumper(layout);

		window.jumper.on('onSearchRequest', function(value, keyCode) {
			Services('storage', function(storage) {
				jumper._cache.items = storage.getItems(value);
				jumper.showItems();
			});
		});
	});
});