/*!
 * Class: Page
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */
 
define(["jquery", "app/config", "app/pagesurface"], 

function ($, config, PageSurface) {
	"use strict";
	// ==========================
	// = PAGE PRIVATE FUNCTIONS =
	// ==========================
	var setPageEvents = function() {
		this.$el.on("click.itemClickEvent", function(e) {
			pageItemOnClick.call(this, e);
		}.bind(this));
	};

	var pageItemOnClick = function(e) {
		// var cursor = this.layout.cursor;
		
		// ==================
		// = FOR DEBUG ONLY =
		// ==================
		// var cell = this.layout.getCellPosByXY(cursor.x, cursor.y);
		// allocate space on surface
		var pos = this.surface.allocate(2, 2);
		if (pos !== null) {
			var coords = this.layout.getCellCoordsByPos(pos.row, pos.coll);

			var $item = $("<div>")
				.addClass("item")
				.css({
					"top": coords.top,
					"left": coords.left
				});
			this.$el.append($item);
		}
		// ==================
	};
	// ==========================

	// ========
	// = !!!! =
	// ========
	// Page must store an information about sections that lay on its surface
	// 
	// 
	// ========

	var Page = function (layout, pageController) {
		this.layout = layout;
		this.pctrl = pageController;
		this.index = this.pctrl.pages.length;
		this.rowCount  = this.layout.rowCount  || 0;
		this.collCount = this.layout.collCount || 0;
		this.surface = null;
		// this point contains the coordinates for the page's initial position
		// by default all pages initialize out of the screen 
		this.initPoint = {
			top: this.layout.padding.top,
			left: -this.layout.size.width
		};
		
		this.init();
	};

	Page.prototype = {
		init: function () {
			var layoutInner = this.layout.inner;
			var clp = this.layout.padding;
			
			this.$el = $("<div>")
				.addClass("page animated")
				.attr("data-idx", this.index);

			this.layout.$el.append(this.$el);
			this.$el.css({
				"top": clp.top,
				"left": clp.left,
				"width": layoutInner.width,
				"height":layoutInner.height
			});

			// ===========================
			// = ALLOCATE PAGE'S SURFACE =
			// ===========================
			this.surface = new PageSurface(this.collCount, this.rowCount);
			// ===========================

			// ====================
			// = SETS PAGE EVENTS =
			// ====================
			setPageEvents.call(this);
			// ====================
		},
		isCurrent: function () {
			return this.$el.hasClass("current");
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