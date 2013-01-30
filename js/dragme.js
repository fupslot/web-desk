(function($) {

	var defaults = {
		showGrid: true,
		cellSize: {width:15, height:15},
		cellMargin: {top:0, left:0, bottom:1, right:1},

		layoutPadding: {top:10, left:10, bottom:25, right:10},
		pageInAnimateClass: "bounceIn",
		pageOutAnimateClass: "bounceOut"
	};

	var config = { };

	// _i static class
	var _i = {
		// calculates an offset for the given element
		offset: function (el) {
			if ( !el ) { return {x:0, y:0}; }
			
			var result = {x:0, y:0};
			if ( el.offsetParent ) { result = this.offset(el.offsetParent); }

			result.x += el.offsetLeft;
			result.y += el.offsetTop;
			
			return result;
		},

		normalizeCoordinates: function (x, y) {
			x -= this.offset.x;
			y -= this.offset.y;
			// prevent negative value for current coordinates
			x = (x < 0) ? 0 : x;
			y = (y < 0) ? 0 : y;
			// prevent coordinates recalculation out of the layout border
			x = (x > this.size.width) ? this.size.width : x;
			y = (y > this.size.height) ? this.size.height : y;
			return {x:x, y:y};
		}
	};

	// ===========================
	// = LAYOUT PRIVATE FUNCTION =
	// ===========================
	var layoutOnMouseMoveEvent = function(e) {
		this.cursor = _i.normalizeCoordinates.call(this, e.clientX, e.clientY);
		// =================
		// = !!! TEMP CODE =
		// =================
		var currCell = this.getCellPosByXY(this.cursor.x,this.cursor.y);
		var status = [
			"x: "+this.cursor.x+" y: "+this.cursor.y,
			"rows:"+this.rowCount+" colls:"+this.collCount,
			"w:"+this.size.width+" h:"+this.size.height,
			"current: row:"+currCell.row+" coll:"+currCell.coll
		].join(" ");
		$(".status", this.$el).text(status);
		// =================
	};

	var layoutInit = function(){
		// cache this values, to prevent recalculate cell's outer size
		this.cellSize = this.outerCellSize();
		
		var self = this;
		this.$el.on({
			// "mousedown": function (e) { self.onMouseDown(e); },
			// "mouseup":   function (e) { self.onMouseUp(e); },
			"mousemove": function (e) { layoutOnMouseMoveEvent.call(self, e); }
		});

		this.calculate();
		
		// ==========================
		// = CREATES 7 LAYOUT PAGES =
		// ==========================
		this.pctrl = new PageController(this);
		this.pctrl.new(true);
		this.pctrl.new();
		// ==========================
		
		// layout should contain at least one page
		// this.pages.push(new Page(this));
		// $(window).on("resize.layout", function() { self.resize(); });
	};
	// ===========================

	function Layout(el) {
		this.$el = el;

		this.cursor = {x:0, y:0};
		
		this.offset = _i.offset(this.$el[0]);
		// add a layout margin to offset
		this.offset.x += config.layoutPadding.left;
		this.offset.y += config.layoutPadding.top;
		
		this.rowCount  = 0;
		this.collCount = 0;
		this.pctrl;

		// {data} - contains actual User's layout data
		this.data = undefined;

		layoutInit.call(this);
	};

	Layout.prototype = {
		calculate: function () {
			var clp = config.layoutPadding;
			// initial size on the layout, is a el size minus its padding
			// use only for to calculate actual  size of the rows and collumns
			var initSize = {
				width:  this.$el.width()  - clp.left - clp.right,
				height: this.$el.height() - clp.top  - clp.bottom
			};

			// gets a rows and colls amount that can be fit on layout
			this.rowCount  = Math.floor(initSize.height / this.cellSize.height);
			this.collCount = Math.floor(initSize.width  / this.cellSize.width);

			// after we know the actual amount of the rows and collumns 
			// that the current layout can fit, set its the certain size
			this.size = this.outerSize();
			this.$el.css({"width": this.size.width, "height": this.size.height });
		},

		// returns a cell size including its margin
		outerCellSize: function () {
			var cs = config.cellSize;
			var cm = config.cellMargin;
			return {
				width:  cs.width  + cm.left + cm.right,
				height: cs.height + cm.top  + cm.bottom
			};
		},

		// returns a layout size including its padding
		outerSize: function () {
			var lp = config.layoutPadding;
			var cellSize = this.outerCellSize();
			return {
				width:  this.collCount * cellSize.width  + lp.left + lp.right,
				height:	this.rowCount  * cellSize.height + lp.top  + lp.bottom
			};
		},

		innerSize: function () {
			var cellSize = this.outerCellSize();
			return {
				width:  this.collCount * cellSize.width,
				height:	this.rowCount  * cellSize.height
			};
		},

		getCellPosByXY: function (x, y) {
			var outerCellSize = this.outerCellSize();
			
			return {
				row:  Math.floor(y / outerCellSize.height),
				coll: Math.floor(x / outerCellSize.width)
			};
		},
		
		// draws cells, outerSize would be apply
		showInnerCells: function () {
			// if layout padding set add it to a start point
			var startX = config.layoutPadding.left;
			var startY = config.layoutPadding.top;
			
			var ocs = this.cellSize;
			var ics = config.cellSize;
			var cm  = config.cellMargin;

			$("div.inner-cell", this.$el).remove();

			for (var r = 0; r < this.rowCount; r++) {
				for (var c = 0; c < this.collCount; c++) {
					$("<div>")
						.addClass("inner-cell")
						.css({
							"top": startY  + (r * ocs.height) + cm.top,
							"left": startX + (c * ocs.width)  + cm.left,
							"width": ics.width,
							"height":ics.height
						})
						.appendTo(this.$el);
				}
			}
		},

		generate: function (argument) { },

		// destroy: function () { $(window).off("resize.layout"); }
	};

	// Page controller is managing the pages
	function PageController (layout) {
		this.layout = layout;
		this.pages = [];
		this.currentIdx = -1;
	};

	PageController.prototype = {
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

	// ==========================
	// = PAGE PRIVATE FUNCTIONS =
	// ==========================
	var setPageEvents = function() {
		var self = this;
		this.$el.on("click.itemClickEvent", function(e){
			pageItemOnClick.call(self, e);
		});
	};

	var pageItemOnClick = function(e) {
		var cursor = this.layout.cursor;
		console.dir(cursor);
	};
	// ==========================


	// page fits layout
	// can be multiple pages per layout
	// Page containes sections
	function Page (layout, pageController) {
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
			top: config.layoutPadding.top,
			left: -this.layout.outerSize().width
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
			var layoutInnerSize = this.layout.innerSize();
			var clp = config.layoutPadding;
			this.$el.css({
				"top": clp.top,
				"left": clp.left,
				"width": layoutInnerSize.width,
				"height":layoutInnerSize.height
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

	// Sections are groups of cells


	// widget
	// function Dragme (el) {
	// 	this.$el = el;
	// 	this.dragging = false;
		
	// 	// element's offset
	// 	this.offset = {x:0, y:0};
	// 	// start coordinates
	// 	this.start  = {x:0, y:0};
	// 	this.init();
	// }
	// // methods
	// Dragme.prototype = {

	// 	init: function () {
	// 		var self = this;
	// 		// set default cursor
	// 		this.$el.css("cursor", "pointer");
	// 		this.$el.on({
	// 			"mousedown": function (e) { self.onMouseDown(e); },
	// 			"mouseup":   function (e) { self.onMouseUp(e); },
	// 			"mousemove": function (e) { self.onMouseMove(e); },
	// 			"mouseleave": function (e) { self.onMouseUp(e); }
	// 		});
	// 	},

	// 	onMouseDown: function (e) {
	// 		var $target =  $(e.currentTarget);

	// 		// gets offset for a target element
	// 		this.offset = _i.offset($target[0]);
	// 		console.dir(this.offset);
	// 		// set start coordinates
	// 		this.start.x = e.clientX;
	// 		this.start.y = e.clientY;
	// 		console.dir({
	// 			"this.start.x": e.clientX,
	// 			"this.start.y": e.clientY
	// 		});
				

	// 		// wrap the $el by place holder
	// 		// this.$el.wrap($("<div>").addClass("dragly-placeholder"));

	// 		// detach the drag element 
	// 		// $target.detach();
			
	// 		// make sure that nothing be over the element
	// 		$target.css({
	// 			"zIndex": 10000,
	// 			"position": "absolute",
	// 			"top" : this.offset.y,
	// 			"left": this.offset.x
	// 		});
			
	// 		// move into body $el as absolut positioned
	// 		// $target.prependTo("body");

	// 		// console.log(this.offset);
	// 		// add a placeholder for current 
	// 		// TODO
	// 		this.dragging = true;

	// 		e.preventDefault();
	// 	},

	// 	onMouseUp: function (e) {
	// 		// back to init point
	// 		this.start  = {x:0, y:0};
	// 		this.offset = {x:0, y:0};

	// 		this.dragging = false;
	// 	},

	// 	onMouseMove: function (e) {
	// 		if ( !this.dragging ) { return; }
	// 		var $target =  $(e.currentTarget);
			
	// 		var dx = 0, dy = 0;
	// 		dx = (this.offset.x + e.clientX - this.start.x);
	// 		dy = (this.offset.y + e.clientY - this.start.y);

	// 		$target.css({"top" : dy, "left": dx});
	// 	},

	// 	destroy: function () {
	// 		this.$el.off("mousedown mouseup mousemove");
	// 	}
	// };

	var actions = {
		init: function(options) {
			config = $.extend({}, defaults, options);

			return this.each(function() {
				var $element = $(this);
				// first initialization
				if (!$element.data("layout")){
					var layout = new Layout($element);

					if (config.showGrid) {
						layout.showInnerCells();
					}

					$element.data("layout", layout);
				}
			});
		},

		page: function (num) {
			var $element = $(this);
			var layout = $element.data("layout");
			if (layout) {
				layout.pctrl.current(num);
			}
			return this;
		}
	};

	$.fn.Layout = function(method) {

		// config = $.extend({}, defaults, options);

		// return this.each(function () {
			// Method calling logic
		if ( actions[method] ) {
			return actions[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return actions.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.cropping' );
		} 
		// });
	};

})(jQuery);