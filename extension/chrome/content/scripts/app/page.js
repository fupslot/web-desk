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
		"app/link",
		"app/group"
	],


function ($, config, Surface, Events, Link, Group) {
	"use strict";
	// ==========================
	// = PAGE PRIVATE FUNCTIONS =
	// ==========================
	var setPageEvents = function() {
		this.$el.on("dblclick.itemClickEvent", function(e) {
			this.layout.trigger('onPageDblClick', this, e);
		}.bind(this));
	};

	// var pageItemOnClick = function(e) {

	// 	this.createLink({size: {coll:2, row:2}});
	// };
	// ==========================

	var Page = function (pageCtrl, id, group) {
		this.layout = pageCtrl.layout;
		this.pctrl = pageCtrl;
		this.id = id;

		if (typeof group != 'indefined') {
			this.group = group;
		}
		// this.group = typeof group === 'boolean' ? group : false;
		// this.index = this.pctrl.pages.length;
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

		
		this.init();
	};

	Page.prototype = {
		init: function () {
			this.$el = $("<div>", {'class': 'page animated'});

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

		show: function (silent) {
			if ( ! this.hasResized ) {
				this.resize();
			}

			if (!silent) {
				this.$el.show().addClass("current "+config.pageInAnimateClass);

				setTimeout(function () {
					this.$el.removeClass(config.pageInAnimateClass);
				}.bind(this), 1000);				
			}
			else {
				this.$el.show().addClass("current");
			}
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

		// pageData - array
		load: function(items) {
			if (!items.forEach) { return; }
			items.forEach(function(item){
				if (item.type === 'link') {
					this.createLink(item, true); // no animation needed
				}
				if (item.type === 'group') {
					this.createGroup(item, true); // no animation needed
				}
			}.bind(this));
		},

		/*
			creates a new link on a page
			data : {
				size: {coll:2, row:2},
				data: {
					url: '',
					imageURL: ''	
				}
			}

			silent - no event, no visual animation 
		*/
		createLink: function (data, silent) {
			if (!$.isArray(this.links)) { this.links = []; }

			var link = new Link(this, data, silent);
			this.links.push(link);
			if (!silent) { this.layout.trigger('onLinkCreated', /*page*/this, link); }
		},

		removeItem: function(item) {
			var map	 = {'link': 'links', 'group': 'groups'},
				type = map[item.data.type];

			var foundItemIdx = null;
			for (var i = this[type].length - 1; i >= 0; i--) {
				if (this[type][i] === item) {
					foundItemIdx = i;
					break;
                }
			}
			// if null the end of the story
			if (foundItemIdx == null) { return; }

			var canceled = {value: false};
			this.layout.trigger('onItemRemoved', this, item, canceled);

			if (canceled.value === false) {
				this[type][foundItemIdx].$el.remove();
				this[type].splice(foundItemIdx, 1);
			}
		},

		createGroup: function(data, silent) {
			if (!$.isArray(this.groups)) { this.groups = []; }

			var group = new Group(this, data, silent);
			this.groups.push(group);
			if (!silent) { this.layout.trigger('onGroupCreated', /*page*/this, group); }	
		}
	};

	Page.prototype = $.extend(Page.prototype, Events);

	return Page;
});