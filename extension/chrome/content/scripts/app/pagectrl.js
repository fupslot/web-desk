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
	"use strict";

	// Page controller is managing the pages
	var PageCtrl = function (layout) {
		this.layout = layout;
		this.pages = [];
		this.currentIdx = 0;

		this.pages.push(new Page(layout, this));

		if (this.pages[this.currentIdx]) { this.pages[this.currentIdx].show(); }
	};

	PageCtrl.prototype = {
		// sets a current page
		// gets a current page
		current: function (num) {
			// 'num' cannot be negative
			if (num !== undefined) {
				num = Math.abs(num);
			}
				
			// if 'num' is not specified a current page will be return
			if (num === undefined && this.currentIdx !== -1) {
				return this.pages[this.currentIdx];
			}
			
			if (num !== undefined && this.currentIdx !== -1 && this.currentIdx !== num) {
				console.log("from: %s to: %s", this.currentIdx, num);
				
				// hide current page
				this.pages[this.currentIdx].hide(function() {
				// switch a current page index to 'num' 
					this.currentIdx = num;
					// show a page with 'num' index
					this.pages[this.currentIdx].show();
				}.bind(this));
							
				return this.pages[this.currentIdx];
			}

			if (this.currentIdx === -1 && num !== undefined) {
					this.currentIdx = num;
					// show a page with 'num' index
					this.pages[this.currentIdx].show();				
			} 
		},
		// shows a last page
		last: function () {
			return this.current(this.pages.length - 1);
		},
			
		// shows a first page
		first: function () {
			return this.current(0);
		},

		resize: function () {
			this.pages.forEach(function (page, pageIdx) {
				if (this.currentIdx === pageIdx) {
					page.resize();
				}
				else {
					page.hasResized = false;
				}
			}.bind(this));
		},

		contentSize: function () {
			var size = {"width": 0, "height": 0};

			this.pages.forEach(function (page) {
				var pageGrid = page.surface.contentSize();

				size.width  = (pageGrid.width  - size.width)  > 0 ? pageGrid.width  : size.width;
				size.height = (pageGrid.height - size.height) > 0 ? pageGrid.height : size.height;

				pageGrid = null;
			});

			return size;
		},

		// adds a section into a page
		// {section.address} - by a section address page controller knows 
		// on which page it should be drawn
		add: function (section) {
			// 1. calculate the size of the section.
			// 2. find a certain size on the page for the section
			// |o|o|o|x|o|o|o|o|o|o|o|o|
			// |x|x|o|o|o|o|x|x|x|o|o|o|
			// |x|x|o|o|o|o|x|x|x|o|o|o|
			// |o|o|o|o|o|o|x|x|x|o|o|o|
			// |o|o|o|o|o|o|o|o|o|o|o|o|
			// |o|o|o|o|o|o|o|o|o|o|o|o|
			// |o|o|o|o|o|o|o|o|o|o|o|o|
			// |o|o|o|o|o|o|o|o|o|o|o|o|

			// |x|x|x|
			// |x|x|x|
		} 
	};

	PageCtrl.prototype = $.extend(PageCtrl.prototype, Events);

	return PageCtrl;
});