/*!
 * Class: Page
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */
 
define(

	[
		"jquery",
		"app/config",
		"app/surface",
		// "app/dd",
		"app/events",
		"app/link"
	],


function ($, config, Surface, Events, Link) {
	"use strict";
	// ==========================
	// = PAGE PRIVATE FUNCTIONS =
	// ==========================
	var setPageEvents = function() {
		this.$el.on("dblclick.itemClickEvent", function(e) {
			pageItemOnClick.call(this, e);
		}.bind(this));

		// this.DD = new DDHandler(this.layout, this);
		// DDHandler($el).done();
	};

	var pageItemOnClick = function(e) {
		// ==================
		// = FOR DEBUG ONLY =
		// ==================
		// var cell = this.layout.getCellPosByXY(cursor.x, cursor.y);
		// allocate space on surface
		
		// var pos = this.surface.allocate(this.__cell.coll,this.__cell.row);
		// if (pos !== null) {
		// 	var coords = this.layout.getCellCoordsByPos(pos.coll, pos.row);
		// 	var dims   = this.layout.getCellsDimention(this.__cell.coll,this.__cell.row);

		// 	var $item = $("<div>", {
		// 		// "data-pos":  pos.coll+ "," + pos.row,
		// 		// "data-size": this.__cell.coll + "," + this.__cell.row,
		// 		"draggable": true,
		// 		"class": "item"
		// 	}).css({
		// 		"top": coords.top,
		// 		"left": coords.left,
		// 		"width": dims.width,
		// 		"height": dims.height
		// 	});

		if (!$.isArray(this.links)) { this.links = []; }
		this.links.push(new Link(this));

		// 	$item.data("pos", {'coll': pos.coll, 'row': pos.row});	
		// 	$item.data("size", {'width': this.__cell.coll, 'height': this.__cell.row});

		// 	this.$el.append($item);

			// this.DD.registerEvents($item.get(0));
		// }
		// ==================
	};
	// ==========================

	var Page = function (layout, pageCtrl) {
		this.layout = layout;
		this.pctrl = pageCtrl;
		
		this.index = this.pctrl.pages.length;
		this.surface = null;

		// placeholder
		this.$ph = null;

		this.hasResized = true;
		// this point contains the coordinates for the page's initial position
		// by default all pages initialize out of the screen 
		this.initPoint = {
			top: this.layout.padding.top,
			left: -this.layout.size.width
		};

		// !!!
		this.__cell = {coll:3, row:2}
		
		this.init();
	};

	Page.prototype = {
		init: function () {
			this.$el = $("<div>")
				.addClass("page animated")
				.attr("data-idx", this.index);

			this.layout.$el.append(this.$el);

			this.resize();

			// ===========================
			// = ALLOCATE PAGE'S SURFACE =
			// ===========================
			this.surface = new Surface(this.collCount, this.rowCount);
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
			if ( ! this.hasResized ) {
				this.resize();
			}

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
		},

		resize: function () {
			var layoutInner = this.layout.inner;
			var clp = this.layout.padding;

			this.rowCount  = this.layout.rowCount  || 0;
			this.collCount = this.layout.collCount || 0;
			
			this.$el.css({
				"top": clp.top,
				"left": clp.left,
				"width": layoutInner.width,
				"height":layoutInner.height
			});

			if (this.surface) {
				this.surface.resize(this.collCount, this.rowCount);
			}

			this.$el.children().each(function (idx, elem) {
				var pos = $(elem).data('pos');
				var coords = this.layout.getCellCoordsByPos(pos);
				elem.style.top  = coords.top  + "px";
				elem.style.left = coords.left + "px";
			}.bind(this));
		},

		contain: function (x, y, w, h) {
			var inner = this.layout.inner;

			return x >= 0 && y >= 0 && (x + w) <= inner.width && (y + h) <= inner.height;
		},

		// create a new item on a page
		create: function (item) {
			// item.size - {row, coll};

			// 1. calculate the size of the section.
			// 2. find a certain size on the page for the section
			// 2.1 if there is no enought space a new page would be created
			// 
		}
	};

	Page.prototype = $.extend(Page.prototype, Events);

	return Page;
});