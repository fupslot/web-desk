/*!
 * Surface
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(function () {
	// |o|o|o|x|o|o|o|o|o|o|o|o|
	// |x|x|o|o|o|o|x|x|x|o|o|o|
	// |x|x|o|o|o|o|x|x|x|o|o|o|
	// |o|o|o|o|o|o|x|x|x|o|o|o|
	// |o|o|o|o|o|o|o|o|o|o|o|o|
	// |o|o|o|o|x|x|o|o|o|o|o|o|
	// |o|o|o|o|o|o|o|o|o|o|o|o|
	// |o|o|o|o|o|o|o|o|o|o|o|o|

	// var items = [];
	function changeSurface (coll, row, width, height, value) {
		for (var r = 0; r < height; r++) {
			for (var c = 0; c < width; c++) {
				this.surface[row + r][coll + c] = value;
			}
		}
	}

	function Surface (width, height) {
		this.width  = width;
		this.height = height;
		this.surface = null;
		this.initialize();
	}

	Surface.prototype = {
		initialize: function () {
			this.surface = [];

			// surface initialization
			for (var row = 0; row < this.height; row++) {
				this.surface.push([]);
				for (var coll = 0; coll < this.width; coll++) {
					this.surface[row].push(0);
				}
			}
		},

		// ===========================
		// = FOR DEBUG PORPOUSE ONLY =
		// ===========================
		print: function () {
			console.log("");
			var line = null;
			for (var row = 0; row < this.height; row++) {
				line = "";
				for (var coll = 0; coll < this.width; coll++) {
					line += "|";
					line += this.surface[row][coll];
					if (coll === this.width - 1) {
						line += "|";
					}
				};
				console.log(line);
			};
			console.log("");
		},
		// ===========================

		hasBorderCollision: function (coll, row, width, height) {
			if ( (row + height) > this.height ) {
				return -1; // row collision
			}
			else if ( (coll + width) > this.width ) {
				// console.dir([row, coll, width, height]);
				return -2; // coll collision
			}
			else {
				return 0; // no collisions
			}
		},

		testPos: function (collStart, rowStart, width, height) {
			// check border collisions
			var collision = this.hasBorderCollision.apply(this, arguments);
			// console.log("collision " + collision);
			if ( collision < 0 ) {
				return collision;
			}

			var test = 0; // empty
			for (var row = rowStart, rl = rowStart + height; row < rl; row++) {
				for (var coll = collStart, cl = collStart + width; coll < cl; coll++) {
					// console.dir([row, coll]);
					test = this.surface[row][coll];
					if ( test !== 0 ) { break; }
				}
				if (test !== 0) { break; }
			}
			return test;
		},

		findPos: function (width, height) {
			var test = null;
			var pos = null;

			for (var row = 0, rl = this.height; row < rl; row++) {
				for (var coll = 0, cl = this.width; coll < cl; coll++) {
					if (this.surface[row][coll] === 0) {
						// The cell is empty.
						// Testing if it has enough space around 
						// to fit a rectangle of given size.
						test = this.testPos(coll, row, width, height);
						
						if (test === 0) {
							pos = {"row": row, "coll": coll};
							break;
						}
						// jump to next row, if the width went beyond the surface
						if (test === -2) { break; } 
					}
				}
				// stop a seeking process if height went beyond the surface
				// or if position was found
				if (test === 0) { break; }
				test = null;
			}
			return pos;
		},

		allocate: function (colls, rows) {
			var pos = this.findPos(colls, rows);
			
			if (pos !== null) {
				changeSurface.call(this, pos.coll, pos.row, colls, rows, 1);
			}
			return pos;
		},

		hold: function (coll, row, width, height) {
			changeSurface.call(this, coll, row, width, height, 1);
		},

		release: function (coll, row, width, height) {
			changeSurface.call(this, coll, row, width, height, 0);
		},

		contentSize: function () {
			var height = -1;
			var width  = -1;
			
			for (var r = this.height - 1; r >= 0; r--) {
				if (height === -1 && this.surface[r].lastIndexOf(1) !== -1) {
					height = r;
				}

				if (width < this.surface[r].lastIndexOf(1)) {
					width = this.surface[r].lastIndexOf(1);
				}

				if (height !== -1 && width === this.width) {
					break;
				}
			}

			return {"width": width + 1, "height": height + 1};
		},

		resize: function (colls, rows) {
			if (this.width == colls && this.height == rows) { return; }

			var rDiff = rows  - this.height;
			var cDiff = colls - this.width;

			if (rDiff > 0) {
				for (var r = 0; r < rDiff; r++) {
					this.surface.push([]);
					for (var c = 0; c < this.width; c++) {
						this.surface[this.surface.length-1].push(0);
					}
				}

				this.height = rows;
			}

			if (rDiff < 0) {
				this.surface.splice(this.surface.length - Math.abs(rDiff))
				this.height = rows;
			}

			if (cDiff > 0) {
				for (var r = 0; r < this.height; r++) {
					for (var c = 0; c < cDiff; c++) {
						this.surface[r].push(0);
					}
				}

				this.width = colls;
			}

			if (cDiff < 0) {
				for (var r = 0; r < this.height; r++) {
					this.surface[r].splice(this.surface[r].length - Math.abs(cDiff));
				}

				this.width = colls;
			}
		}
	};

	return Surface;
});