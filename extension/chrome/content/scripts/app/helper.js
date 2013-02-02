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
	// ==============================================
	
	return {
		offset: offset
	};
});