/*!
 * PageSurface
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(function () {
	// |o|o|o|x|o|o|o|o|o|o|o|o|
	// |x|x|o|o|o|o|x|x|x|o|o|o|
	// |x|x|o|o|o|o|x|x|x|o|o|o|
	// |o|o|o|o|o|o|x|x|x|o|o|o|
	// |o|o|o|o|o|o|o|o|o|o|o|o|
	// |o|o|o|o|o|o|o|o|o|o|o|o|
	// |o|o|o|o|o|o|o|o|o|o|o|o|
	// |o|o|o|o|o|o|o|o|o|o|o|o|

	function PageSurface (width, height) {
		this.width  = width;
		this.height = height;
		this.surface = null;
		this.initialize();
	}

	PageSurface.prototype = {
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

		hasBorderCollision: function (row, coll, width, height) {
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

		testPos: function (rowStart, collStart, width, height) {
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
						test = this.testPos(row, coll, width, height);
						// console.log(test);
						if (test === 0) {
							pos = {"row": row, "coll": coll};
							break;
						}
						// jump to next row, if width went beyond the surface
						if (test === -2) { break; } 
					}
				}
				// stop seek process if height went beyond the surface
				// or if position was found
				if (test === 0) { break; }
				test = null;
			}
			return pos;
		},

		allocate: function (width, height) {
			var pos = this.findPos.apply(this, arguments);
			// console.dir(pos);
			if (pos !== null) {
				// fill the surface
				for (var row = pos.row, rl = row + height; row < rl; row++) {
					for (var coll = pos.coll, cl = coll + width; coll < cl; coll++) {
						this.surface[row][coll] = 1;
					}
				}
			}
			return pos;
		},

		release: function (argument) {
			// body...
		}
	};

	return PageSurface;
});