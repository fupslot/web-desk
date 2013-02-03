define(function () {
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
	
	return {
		"offset": offset,
		"isArray": function (obj) {
			return is("Array", obj);
		}
	};
});