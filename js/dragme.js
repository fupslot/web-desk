(function($) {

	var defaults =
	{
		showGrid: true,
		cellSize: {width:15, height:15},
		cellMargin: {top:0, left:0, bottom:1, right:1},

		layoutPadding: {top:10, left:10, bottom:25, right:10}
	};

	var config = { };

	// _i static class
	var _i =
	{
		// calculates an offset for the given element
		offset:
		function (el)
		{
			if ( !el ) { return {x:0, y:0}; }
			
			var result = {x:0, y:0};
			if ( el.offsetParent ) { result = this.offset(el.offsetParent); }

			result.x += el.offsetLeft;
			result.y += el.offsetTop;
			
			return result;
		}
	};

	function Layout(el) {
		this.$el = el;
		
		this.offset = _i.offset(this.$el[0]);
		// add a layout margin to offset
		this.offset.x += config.layoutPadding.left;
		this.offset.y += config.layoutPadding.top;
		
		this.rowCount  = 0;
		this.collCount = 0;
		this.pctrl;
	};

	Layout.prototype = {
		init: function () {
			// cache this values, to prevent recalculate cell's outer size
			this.cellSize = this.outerCellSize();
			
			var self = this;
			this.$el.on({
				// "mousedown": function (e) { self.onMouseDown(e); },
				// "mouseup":   function (e) { self.onMouseUp(e); },
				"mousemove": function (e) { self.onMouseMove(e); }
			});

			this.calculate();
			
			this.pctrl = new PageController(this);
			this.pctrl.new();
			this.pctrl.new(true);
			// layout should contain at least one page
			// this.pages.push(new Page(this));
			// $(window).on("resize.layout", function() { self.resize(); });
		},

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
		},

		onMouseMove: function (e) {
			var axis = this.normalizeCoordinates(e.clientX, e.clientY);
			var currCell = this.getCellPosByXY(axis.x,axis.y);
			var status = [
				"x: "+axis.x+" y: "+axis.y,
				"rows:"+this.rowCount+" colls:"+this.collCount,
				"w:"+this.size.width+" h:"+this.size.height,
				"current: row:"+currCell.row+" coll:"+currCell.coll
			].join(" ");
			$(".status", this.$el).text(status);
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
		// {current} - boolean
		// if set to 'true' new page become a current
		new: function (current) {
			var page = new Page(this.layout, this);
			this.pages.push(page);
			
			page.init();

			if (current) {
				return this.current(this.pages.length - 1);
			}
			return page;
		},
		// set current page by its number
		// get current page
		current: function (num) {
			if (!num && (this.currentIdx !== -1)) {
				return this.pages[this.currentIdx];
			}
			else if (num && (this.currentIdx !== num)) {
				// look for current page, remove class "current"
				this.pages.forEach(function (page) {
					if (page.isCurrent()) { page.$el.removeClass("current"); }
				});
				this.currentIdx = (num >= this.pages.length) ? this.pages.length -1 : num;
				// set class "current" to the page which under 'num' index
				this.pages[this.currentIdx].$el.addClass("current");
				return this.pages[num];
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

	// page fits layout
	// can be multiple pages per layout
	// Page containes sections
	function Page (layout, pageController)
	{
		this.$el = $("<div>").addClass("page");
		this.layout = layout;
		this.pctrl = pageController;
		this.index = this.pctrl.pages.length;
		this.rowCount  = this.layout.rowCount  || 0;
		this.collCount = this.layout.collCount || 0;
		this.layout.$el.append(this.$el);
		// this.layout = [];

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
		},
		isCurrent: function () {
			return this.$el.hasClass("current");
		},
		// this method allocates enough space for given section size
		// width, height - dimentions of a new section, in cells
		allocate: function (width, height) {
			// body...
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
	function Dragme (el)
	{
		this.element  = el;
		this.dragging = false;
		
		// element's offset
		this.offset = {x:0, y:0};
		// start coordinates
		this.start  = {x:0, y:0};
	}
	// methods
	Dragme.prototype = 
	{

		init:
		function ()
		{
			var self = this;
			// set default cursor
			this.element.css("cursor", "pointer");
			this.element.on({
				"mousedown": function (e) { self.onMouseDown(e); },
				"mouseup":   function (e) { self.onMouseUp(e); },
				"mousemove": function (e) { self.onMouseMove(e); }
			});
		},

		onMouseDown:
		function (e)
		{
			var $target =  $(e.currentTarget);

			// gets offset for a target element
			this.offset = _i.offset($target[0]);
			console.dir(this.offset);
			// set start coordinates
			this.start.x = e.clientX;
			this.start.y = e.clientY;

			// wrap the element by place holder
			// this.element.wrap($("<div>").addClass("dragly-placeholder"));

			// detach the drag element 
			$target.detach();
			
			// make sure that nothing be over the element
			$target.css({
				"zIndex": 10000,
				"position": "absolute",
				"top" : this.offset.y,
				"left": this.offset.x
			});
			
			// move into body element as absolut positioned
			$target.prependTo("body");

			// console.log(this.offset);
			// add a placeholder for current 
			// TODO
			this.dragging = true;

			if ( e.preventDefault ) { e.preventDefault(); }
		},

		onMouseUp:
		function (e)
		{
			this.offset = {x:0, y:0};
			// sets a start point
			this.start  = {x:0, y:0};

			this.dragging = false;
		},

		onMouseMove:
		function (e)
		{
			if ( !this.dragging ) { return; }
			
			var dx = 0, dy = 0;
			dx = (this.offset.x + e.clientX - this.start.x);
			dy = (this.offset.y + e.clientY - this.start.y);
			

		},

		destroy:
		function ()
		{
			this.element.off("mousedown mouseup");
		}
	};


	$.fn.Layout = function(options)
	{

		config = $.extend({}, defaults, options);

		return this.each(function () {
			var element = $(this);
			
			// first initialization
			if ( !element.data("layout") )
			{
				var layout = new Layout(element);
				layout.init();

				if (config.showGrid) {
					layout.showInnerCells();
				}

				element.data("layout", layout);
			}
		});
		// Method calling logic
		// if ( methods[method] ) {
		// 	return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		// } else if ( typeof method === 'object' || ! method ) {
		// 	return methods.init.apply( this, arguments );
		// } else {
		// 	$.error( 'Method ' +  method + ' does not exist on jQuery.cropping' );
		// } 
	}

})(jQuery)