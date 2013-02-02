/*!
 * Class: Page
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */
 
define(["jquery", "app/config"], function ($, config) {
	// ==========================
	// = PAGE PRIVATE FUNCTIONS =
	// ==========================
	var setPageEvents = function() {
		var self = this;
		this.$el.on("click.itemClickEvent", function(e) {
			pageItemOnClick.call(self, e);
		});
	};

	var pageItemOnClick = function(e) {
		var cursor = this.layout.cursor;
		// console.dir(cursor);
		var cell = this.layout.getCellPosByXY(cursor.x, cursor.y);
		var coords = this.layout.getCellCoordsByPos(cell.row, cell.coll);
		console.dir(cell);
		console.dir(coords);
	};
	// ==========================

	// ========
	// = !!!! =
	// ========
	// page fits layout
	// can be multiple pages per layout
	// Page containes sections
	// ========

	var Page = function (layout, pageController) {
		this.$el = $("<div>").addClass("page animated");
		this.layout = layout;
		this.pctrl = pageController;
		this.index = this.pctrl.pages.length;
		this.rowCount  = this.layout.rowCount  || 0;
		this.collCount = this.layout.collCount || 0;
		this.layout.$el.append(this.$el);
		// this point contains the coordinates for the page's initial position
		// by default all pages initialize out of the screen 
		this.initPoint = {
			top: this.layout.padding.top,
			left: -this.layout.size.width
		};
		// this.layout = [];
		this.init();
		// initialization of the page
		// for (var r = 0; r < this.rowCount; r++) {
			// this.layout[r] = [];
			// for (var c = 0; c < this.collCount; c++) {
				// this.layout[r][c] = 0;
			// }
		// }
		// !!! layout tells to a page how many sections it has to fit
		// !!! page should tell how many space it has
	};

	Page.prototype = {
		init: function () {
			var layoutInner = this.layout.inner;
			var clp = this.layout.padding;
			this.$el.css({
				"top": clp.top,
				"left": clp.left,
				"width": layoutInner.width,
				"height":layoutInner.height
			});

			var $item = $("<div>").addClass("item");
			this.$el.append($item);
			// ====================
			// = SETS PAGE EVENTS =
			// ====================
			setPageEvents.call(this);
			// ====================
		},
		isCurrent: function () {
			return this.$el.hasClass("current");
		},
		// this method allocates enough space for given section size
		// width, height - dimentions of a new section, in cells
		allocate: function (width, height) {
			// body...
		},

		show: function () {
			this.$el.show().addClass("current "+config.pageInAnimateClass);
			setTimeout(function () {
				this.$el.removeClass(config.pageInAnimateClass);
			}.bind(this), 1000);
		},

		hide: function (callback) {
			this.$el.removeClass("current").addClass(config.pageOutAnimateClass);
			setTimeout(function () {
				this.$el.hide().removeClass(config.pageOutAnimateClass);
			}.bind(this), 1000);
			setTimeout(callback.bind(this), 600);
		}

		// add: function (section) {
			// 1. calculate the size of the section.
			// 2. find a certain size on the page for the section
			// 2.1 if there is no enought space a new page would be created
			// 
		// }
	};

	return Page;
});