define(function () {
	// ==============================================
	// = CALCULATES AN OFFSET FOR THE GIVEN ELEMENT =
	// ==============================================
	var offset = function (el) {
			if ( !el ) { return {x:0, y:0}; }
			
			var result = {x:0, y:0};
			if ( el.offsetParent ) { result = offset(el.offsetParent); }

			result.x += el.offsetLeft;
			result.y += el.offsetTop;
			
			return result;
	};
	// ==============================================
	
	return {
		offset: offset
	};
});