var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var hint = "Use following commands: [print, exit]";

console.log(hint);

rl.on("line", function (cmd) {
	switch(cmd) {
		case "print":
			printSurface(surface);
			break;
		case "add":
			addBlock(surface, 3, 2, "%");
			addBlock(surface, 9, 1, "A");
			addBlock(surface, 2, 2, "-");
			addBlock(surface, 3, 2, "R");
			addBlock(surface, 4, 2, "H");
			addBlock(surface, 2, 2, "*");
			break;
		case "exit":
			rl.close();
			return;
	}
	console.log(hint);
});







var surface = [];
// var surfaceSize = {width: 32, height: 32};
var surfaceSize = {width: 15, height: 7};
// surface initialization
for (var row = 0, rl = surfaceSize.height; row < rl; row++) {
	surface.push([]);
	for (var coll = 0, cl = surfaceSize.width; coll < cl; coll++) {
		surface[row].push(0);
	};
};

function printSurface (surface) {
	console.log("");
	var line = null;
	for (var row = 0, l = surface.length; row < rl; row++) {
		line = "";
		for (var coll = 0, l = surface[row].length; coll < cl; coll++) {
			line += "|";
			line += surface[row][coll];
			if (coll === l - 1) {
				line += "|";
			}
		};
		console.log(line);
	};
	console.log("");
}

function hasBorderCollision (surface, row, coll, width, height) {
	if ( (row + height) > surfaceSize.height ) {
		return -1; // row collision
	}
	else if ( (coll + width) > surfaceSize.width ) {
		console.dir([row, coll, width, height]);
		return -2; // coll collision
	}
	else {
		return 0; // no collisions
	}
}

function testPos (surface, rowStart, collStart, width, height) {
	// check border collisions
	var collision = hasBorderCollision.apply(this, arguments);
	console.log("collision " + collision);
	if ( collision < 0 ) {
		return collision;
	}

	var test = 0; // empty
	for (var row = rowStart, rl = rowStart + height; row < rl; row++) {
		for (var coll = collStart, cl = collStart + width; coll < cl; coll++) {
			test = surface[row][coll];
			if ( test !== 0 ) { break; }
		}
		if (test !== 0) { break; }
	}
	return test;
}

function findPos (surface, width, height) {
	var test = null;
	var pos = null;

	for (var row = 0, rl = surfaceSize.height; row < rl; row++) {
		for (var coll = 0, cl = surfaceSize.width; coll < cl; coll++) {
			if (surface[row][coll] === 0) {
				test = testPos(surface, row, coll, width, height);
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
}

function addBlock (surface, width, height, mark) {
	var pos = findPos.apply(this, arguments);
	console.dir(pos);
	if (pos !== null) {
		// fill the surface
		for (var row = pos.row, rl = row + height; row < rl; row++) {
			for (var coll = pos.coll, cl = coll + width; coll < cl; coll++) {
				surface[row][coll] = mark;
			}
		}
	}
}




