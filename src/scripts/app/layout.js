/*!
 * Class: Layout
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(
[
	"jquery", 
	"app/helper", 
	"app/config",
	"app/pagectrl"
],

function ($, helper, config, PageCtrl) {
	// ===========================
	// = LAYOUT PRIVATE FUNCTION =
	// ===========================
	var normalizeCoordinates = function (x, y) {
		x -= this.offset.x;
		y -= this.offset.y;
		// prevent negative value for current coordinates
		x = (x < 0) ? 0 : x;
		y = (y < 0) ? 0 : y;
		// prevent coordinates recalculation out of the layout border
		x = (x > this.size.width) ? this.size.width : x;
		y = (y > this.size.height) ? this.size.height : y;
		return {x:x, y:y};
	};

	var layoutOnMouseMoveEvent = function(e) {
		this.cursor = normalizeCoordinates.call(this, e.clientX, e.clientY);
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
		this.pctrl = new PageCtrl(this);
		this.pctrl.new(true);
		this.pctrl.new();
		// ==========================
		
		// layout should contain at least one page
		// this.pages.push(new Page(this));
		// $(window).on("resize.layout", function() { self.resize(); });
	};
	// ===========================

	var Layout = function(el) {
		this.$el = el;

		this.cursor = {x:0, y:0};
		
		this.offset = helper.offset(this.$el[0]);
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
	
	return Layout;
});