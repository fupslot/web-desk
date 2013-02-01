/*!
 * Class: PageCtrl
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(["app/page"], function (Page) {
		// Page controller is managing the pages
	var PageCtrl = function (layout) {
		this.layout = layout;
		this.pages = [];
		this.currentIdx = -1;
	};

	PageCtrl.prototype = {
		// {setAsCurrent} - boolean
		// if set to 'true' new page become a current
		new: function (setAsCurrent) {
			var page = new Page(this.layout, this);
			this.pages.push(page);
			// this determines a page size 
			// page.init();

			// if just one page in a row, it will be set as current
			if (this.pages.length === 1) {
				this.currentIdx = 0;
				this.pages[this.currentIdx].show();
			}
			
			if (setAsCurrent) {
				return this.current(this.pages.length - 1);
			}
			return page;
		},
		// set current page by its number
		// get current page
		current: function (num) {
			// 'num' cannot be negative
			num = Math.abs(num);
			// if 'num' is not specified a current page will be return
			if (num === undefined && this.currentIdx !== -1) {
				return this.pages[this.currentIdx];
			}
			else if (this.currentIdx !== num) {
				console.log("from: %s to: %s", this.currentIdx, num);
				var that = this;
				// hide current page
				this.pages[this.currentIdx].hide(function() {
				// switch a current page index to 'num' 
					that.currentIdx = num;
					// show a page with 'num' index
					that.pages[that.currentIdx].show();
				});
							
				return this.pages[this.currentIdx];
			}
			else {
				return undefined;
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

		// adds a section into a page
		// {section.address} - by a section address page controller knows 
		// on which page it should be drawn
		add: function (section) {
			// 1. calculate the size of the section.
			// 2. find a certain size on the page for the section
			// 2.1 if there is no enought space a new page would be created
		} 
	};

	return PageCtrl;
});