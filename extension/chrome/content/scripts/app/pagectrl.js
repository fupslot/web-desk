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
		this.pages[this.layout.selectedPage].hide(function() {
		// switch a current page index to 'num' 
			this.layout.selectedPage = id;
			// show a page with 'num' index
			this.pages[id].show();
		}.bind(this));
	}

	// Page controller is managing the pages
	var PageCtrl = function (layout) {
		this.layout = layout;
		this.pages = {};

		var pageId = this.layout.selectedPage;
		this.pages[pageId] = new Page(this, pageId);

		// ask a group data from the storage
		this.layout.trigger('onPageData', pageId, function(pageData) {
			this.pages[this.layout.selectedPage].load(pageData);
			this.pages[this.layout.selectedPage].show(true);
		}.bind(this));
	};

	PageCtrl.prototype = {
		resize: function () {
			for (var id in this.pages) {
				if (id === this.layout.selectedPage) { 
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
			// if (this.layout.selectedPage == id) { return; }
			if (typeof this.pages[id] === 'undefined') {
				this.pages[id] = new Page(this, id, group);
				// ask a group data from 
				this.layout.trigger('onPageData', id, function(pageData) {
					if (!pageData) { return; }
					
					this.pages[id].load(pageData);
					animatedPageSwitch.call(this, id);
				}.bind(this));
			}
			else {
				animatedPageSwitch.call(this, id);
			}
			this.layout.trigger('onPageChanged', id);
		}
	};

	PageCtrl.prototype = $.extend(PageCtrl.prototype, Events);

	return PageCtrl;
});