/*!
 * Class: Layout
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(
[
	"jquery",
	"mustache",
	"app/helper", 
	"app/config",
	"app/pagectrl",
	"app/events",
	"text!template/innercell.html"
],

function ($, Mustache, helper, config, PageCtrl, Events, t_innerCell) {
	// ===========================
	// = LAYOUT PRIVATE FUNCTION =
	// ===========================
	var normalizeCoordinates = function (x, y) {
		x -= this.offset.left + this.padding.left;
		y -= this.offset.top + this.padding.top;
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
		if (config.showStatus) {
			var currCell = this.getCellPosByXY(this.cursor.x,this.cursor.y);
			var status = [
				"x: "+this.cursor.x+" y: "+this.cursor.y,
				"rows:"+this.rowCount+" colls:"+this.collCount,
				"w:"+this.size.width+" h:"+this.size.height,
				"current: row:"+currCell.row+" coll:"+currCell.coll
			].join(" ");
			$(".status", this.$el).text(status);
		}
		// =================
	};

	var layoutInit = function() {
		// cache this values, to prevent recalculate cell's outer size
		this.cellSize = outerCellSize.call(this);
		
		// temporary code
		if (config.showStatus) {
			this.$el.append("<div class=\"status\"></div>");
		}

		this.$el.on({
			'mousemove': function (e) { layoutOnMouseMoveEvent.call(this, e); }.bind(this)
		});

		this.calculate();
	};

	// returns a cell size including its margin
	var outerCellSize = function () {
		var cs = config.cellSize;
		var cm = config.cellMargin;
		return {
			width:  cs.width  + cm.left + cm.right,
			height: cs.height + cm.top  + cm.bottom
		};
	};
	// ===========================

	var Layout = function(el, prop) {
		this.$el = el;

		this.cursor = {x:0, y:0};
		
		this.rowCount  = 0;
		this.collCount = 0;
		this.pctrl = null;

		this.padding = {"left":0, "right":0, "top":0, "bottom":0};
		this.inner = {"width":0, "height":0};
		this.size  = {"width":0, "height":0};

		// prpblems with number type
		this.selectedPage = prop.selectedPage || '0';

		layoutInit.call(this);
	};

	Layout.prototype = {
		load: function() {
			this.pctrl = new PageCtrl(this);
		},

		calculate: function () {
			var clp = config.layoutPadding;
			// the layout size should always fit its parent element
			// gets a size of a parent element
			var parentSize = {
				"width": this.$el.parent().width(),
				"height": this.$el.parent().height()
			};

			// layout size according its parent and a padding set in a config file
			var parentInner = {
				width:  parentSize.width  - clp.left - clp.right,
				height: parentSize.height - clp.top  - clp.bottom
			};

			// gets a rows and colls amount that can be fit on layout
			var grid = {
				"rows": Math.floor(parentInner.height / this.cellSize.height),
				"colls": Math.floor(parentInner.width  / this.cellSize.width)
			};

			// !!!
			if (this.pctrl) {
				var cSize = this.pctrl.contentSize();
				if (grid.rows < cSize.height || grid.colls < cSize.width ) { return; }
			}

			this.rowCount  = grid.rows;
			this.collCount = grid.colls;

			// add a layout margin to offset
			this.offset = helper.offset(this.$el[0]);

			// gets layout inner dimentions
			this.inner.width  = (this.collCount * this.cellSize.width);
			this.inner.height = (this.rowCount * this.cellSize.height);

			// by knowing a rows and colls amount
			// get a delta padding top and delta padding left
			var delta = {
				"v": Math.floor((parentInner.height - this.inner.height) / 2),
				"h": Math.floor((parentInner.width  - this.inner.width) / 2)
			};

			// an actuall layoutPadding
			this.padding.left   = clp.left   + delta.h;
			this.padding.right  = clp.right  + delta.h;
			this.padding.top    = clp.top    + delta.v;
			this.padding.bottom = clp.bottom + delta.v;

			// after we know the actual amount of the rows and collumns 
			// that the current layout can fit, set its the certain size
			// this.size = layoutOuterSize.call(this);
			this.size = parentSize;
			this.$el.css({"width": this.size.width, "height": this.size.height });

			if ( this.pctrl ) {
				this.pctrl.resize();
			};

			if (config.showGrid) {
				this.showInnerCells();
			}
		},

		getCellPosByXY: function (x, y) {
			return {
				row:  Math.floor(y / this.cellSize.height),
				coll: Math.floor(x / this.cellSize.width)
			};
		},

		getCellCoordsByPos: function(coll, row) {
			var pos;

			if (typeof arguments[0] === 'object') { 
				pos = $.extend({}, arguments[0]);
			} else {
				pos = {coll:coll, row:row};
			}

			var margin = config.cellMargin;
			var size   = config.cellSize;

			var row  = pos.row  + 1;
			var coll = pos.coll + 1;

			var topShift  = (row - 1)  * (size.height + margin.bottom);
			var leftShift = (coll - 1) * (size.width  + margin.right);

			var top  = (row  * margin.top)  + topShift;
			var left = (coll * margin.left) + leftShift;
			
			return {'top':top, 'left':left};
		},

		getCellsDimention: function (coll, row) {
			var dims;

			if (typeof arguments[0] === 'object') { 
				dims = $.extend({}, arguments[0]);
			} else {
				dims = {coll:coll, row:row};
			}

			var margin = config.cellMargin;
			var size   = config.cellSize;

			var width  = (size.width  * dims.coll) + ((margin.left + margin.right) * (dims.coll - 1));
			var height = (size.height * dims.row)  + ((margin.top  + margin.bottom)  * (dims.row  - 1));

			return {
				"width":  width,
				"height": height
			};
		},
		
		// draws cells, outerSize would be apply
		showInnerCells: function () {
			// if layout padding set add it to a start point
			var startX = this.padding.left;
			var startY = this.padding.top;
			
			var ocs = this.cellSize;
			var ics = config.cellSize;
			var cm  = config.cellMargin;

			this.$el.find("div.inner-cell").remove();

			var html = "";
			for (var r = 0; r < this.rowCount; r++) {
				for (var c = 0; c < this.collCount; c++) {
					var dimention = {
						"top": startY  + (r * ocs.height) + cm.top,
						"left": startX + (c * ocs.width)  + cm.left,
						"width": ics.width,
						"height":ics.height
					};
					html += Mustache.render(t_innerCell, dimention);
				}
			}
			this.$el.append(html);
		},

		stayFit: function (x, y, w, h) {
	        var coords = {x:x, y:y};

	        if (x < 0) {
	            coords.x = 0;
	        }

	        if (y < 0) {
	            coords.y = 0;
	        }

	        if ( (x + w) > this.inner.width ) {
	            coords.x = this.inner.width - w;
	        }

	        if ( (y + h) > this.inner.height ) {
	            coords.y = this.inner.height - h;
	        }

	        return coords;
	    }

		// destroy: function () { $(window).off("resize.layout"); }
	};

	Layout.prototype = $.extend(Layout.prototype, Events);
	
	return Layout;
});