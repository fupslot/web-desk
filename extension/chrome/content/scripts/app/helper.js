define(function () {
	var appInfo = chrome.app.getDetails();
	// ==============================================
	// = CALCULATES AN OFFSET FOR THE GIVEN ELEMENT =
	// ==============================================
	var offset = function (el) {
			if ( !el ) { return {"top": 0, "left": 0}; }
			
			var result = {"top": 0, "left": 0};
			if ( el.offsetParent ) { result = offset(el.offsetParent); }

			result.top += el.offsetTop;
			result.left += el.offsetLeft;
			
			return result;
	};

	var is = function (type, obj) {
		var clas = Object.prototype.toString.call(obj).slice(8, -1);
		return obj !== undefined && obj !== null && clas === type;
	};
	// ==============================================

	// Returns a function that will be executed at most one time, no matter how
	// often you call it. Useful for lazy initialization.
	var once = function(func) {
		var ran = false, memo;
		return function() {
			if (ran) return memo;
			ran = true;
			memo = func.apply(this, arguments);
			func = null;
			return memo;
		};
	};

	function genNewID() {
		return 'xxxxxxxx'.replace(/[x]/g, function(c) {
			var r = Math.random()*16|0;
			return r.toString(16);
		});
	}

	function isPosNotEqual (pos1, pos2) {
        return pos1.coll !== pos2.coll || pos1.row !== pos2.row;
    }
	
	return {
		"offset": offset,
		"genNewID": genNewID,
		"once": once,

		'getThumbnailUrl': function (fileName) {
			return 'filesystem:chrome-extension://'+appInfo.id+'/persistent/Thumbnails/' + fileName;
		},
		
		"isArray": function (obj) {
			return is("Array", obj);
		},

		'isObject': function (obj) {
			return is("Object", obj);
		},

		"isArray": function (obj) {
			return is("Array", obj);
		},

		'isPosNotEqual': isPosNotEqual
	};
});