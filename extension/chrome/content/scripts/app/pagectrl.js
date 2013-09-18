/*!
 * Class: PageCtrl
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(

	[
		"app/page",
		"app/helper",
		"app/events"
	], 

function (Page, helper, Events) {
	'use strict';

	function animatedPageSwitch (id) {
		// hide current page
		this.pages[this.layout.selectedPageId].hide(function() {
		// switch a current page index to 'num' 
			this.layout.selectedPageId = id;
			// show a page with 'num' index
			this.pages[id].show();
		}.bind(this));
	}

	// Page controller is managing the pages
	var PageCtrl = function (layout) {
		this.layout = layout;
		this.pages = {};

		var pageId = this.layout.selectedPageId;
		this.pages[pageId] = new Page(this, pageId);

		// ask a group data from the storage
		this.layout.trigger('onPageData', this.pages[pageId], function(items) {
			this.pages[this.layout.selectedPageId].load(items);
			this.pages[this.layout.selectedPageId].show(true);
		}.bind(this));
	};

	PageCtrl.prototype = {
		resize: function () {
			for (var id in this.pages) {
				if (id === this.layout.selectedPageId) { 
					this.pages[id].resize();
				}
				else {
					this.pages[id].hasResized = false;
				}
			}
		},

		contentSize: function () {
			var size = {"width": 0, "height": 0};

			for (var id in this.pages) {
				var pageGrid = this.pages[id].surface.contentSize();

				size.width  = pageGrid.width  > size.width ? pageGrid.width  : size.width;
				size.height = pageGrid.height > size.height ? pageGrid.height : size.height;

				pageGrid = null;
			}

			return size;
		},

		show: function(id, group) {
			id += '';

			var page = this.pages[id];

			if (this.layout.selectedPageId === id) { return; }
			if (typeof page === 'undefined') {
				page = new Page(this, id, group);
				this.pages[id] = page;
				// ask a group's data from storage
				this.layout.trigger('onPageData', page, function(pageData) {
					if (!pageData) { return; }
					
					page.load(pageData);
					animatedPageSwitch.call(this, id);
				}.bind(this));
			}
			else {
				animatedPageSwitch.call(this, id);
			}
			this.layout.trigger('onPageChanged', page);
		}
	};

	PageCtrl.prototype = $.extend(PageCtrl.prototype, Events);

	return PageCtrl;
});