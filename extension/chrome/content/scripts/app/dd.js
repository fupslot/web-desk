define(["jquery"], function ($) {
	
	function onDragstart (e) {
		e.preventDefault();

		this.__DD = {
			el: e.currentTarget,
			evt_OnDragend: 		DD_onDragend.bind(this),
			evt_OnMousemove: 	DD_onMousemove.bind(this),
			dx: 0, 
			dy: 0
		};

		// var elem = e.currentTarget;

		var dataPos = /(\d+)\,(\d+)/.exec(this.__DD.el.getAttribute("data-pos"));
		this.__DD.pos = {
			"coll": parseInt(dataPos[1]),
			"row": 	parseInt(dataPos[2])
		};

		this.__DD.cachedPos = {
			coll: this.__DD.pos.coll, 
			row: this.__DD.pos.row 
		};

		var dataSize = /(\d+)\,(\d+)/.exec(this.__DD.el.getAttribute("data-size"));
		this.__DD.size = {
			"width": 	parseInt(dataSize[1]),
			"height": parseInt(dataSize[2])
		};

		this.__DD.dim = this.layout.getCellsDimention(this.__DD.size.width, this.__DD.size.height);

		this.__DD.el.removeAttribute("data-pos");

		this.page.surface.release(
			this.__DD.pos.coll,
			this.__DD.pos.row,
			this.__DD.size.width,
			this.__DD.size.height
		);
		
		var cursor 	= this.layout.cursor;
		var padding = this.layout.padding;

		this.__DD.dx = cursor.x - parseInt(this.__DD.el.style.left);
		this.__DD.dy = cursor.y - parseInt(this.__DD.el.style.top);

		// console.log("start");

		this.page.showPlaceholder();

		this.page.$el.get(0).addEventListener("mousemove", this.__DD.evt_OnMousemove, false);
		document.addEventListener("mouseup", this.__DD.evt_OnDragend, false);
	}

	function DD_onDragend (e) {
		// console.log("dragend");

		var pos = this.layout.getCellCoordsByPos(this.__DD.pos.coll, this.__DD.pos.row);
		this.__DD.el.style.top 	= pos.top 	+ "px";
		this.__DD.el.style.left = pos.left 	+ "px";

		this.page.surface.hold(
			this.__DD.pos.coll,
			this.__DD.pos.row,
			this.__DD.size.width,
			this.__DD.size.height
		);	

		this.page.hidePlaceholder();

		this.__DD.el.setAttribute("data-pos", this.__DD.pos.coll + "," + this.__DD.pos.row);

		document.removeEventListener("mouseup", this.__DD.evt_OnDragend, false);
		this.page.$el.get(0).removeEventListener("mousemove", this.__DD.evt_OnMousemove, false);

		delete this.__DD;
	}

	function DD_onMousemove (e) {
		var cursor 	= this.layout.cursor;

		var coords = glideIt.call(
			this,
			cursor.x - this.__DD.dx,
			cursor.y - this.__DD.dy,
			this.__DD.dim.width,
			this.__DD.dim.height 
		);


		this.__DD.el.style.top 	= coords.y + "px";
		this.__DD.el.style.left = coords.x + "px";

			
		var newPos = this.layout.getCellPosByXY(coords.x, coords.y);

		if (notEquals(this.__DD.cachedPos, newPos)) {
			this.__DD.cachedPos.coll 	= newPos.coll;
			this.__DD.cachedPos.row 	= newPos.row;
			
				
			var testResult = this.page.surface.testPos(
				newPos.coll,
				newPos.row, 
				this.__DD.size.width,
				this.__DD.size.height
			);

			if (testResult === 0) {
				this.__DD.pos.coll 	= newPos.coll;
				this.__DD.pos.row 	= newPos.row;
				this.page.showPlaceholder();
			}
		}
	}

	function notEquals (pos1, pos2) {
		return pos1.coll !== pos2.coll || pos1.row !== pos2.row;
	}

	function glideIt (x, y, w, h) {
		var inner = this.layout.inner;
		var coords = {x:x, y:y};

		if (x < 0) {
			coords.x = 0;
		}

		if (y < 0) {
			coords.y = 0;
		}

		if ( (x + w) > inner.width ) {
			coords.x = inner.width - w;
		}

		if ( (y + h) > inner.height ) {
			coords.y = inner.height - h;
		}

		return coords;
	}

	function DD(layout, page) {
		this.layout = layout;
		this.page = page;

		this.pos = null;
		this.size = null;

		page.$el.children().each(function (idx, item) {
			this.registerEvents(item);
		}.bind(this));
	}

	DD.prototype = {
		registerEvents: function (item) {
			item.addEventListener("dragstart", onDragstart.bind(this));
		}
	};

	return DD;
});