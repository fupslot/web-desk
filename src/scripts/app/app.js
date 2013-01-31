/*!
 * App Module Definition
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */
 
define(["jquery"], function ($) {
	var changeBackgroundColor = function(color) {
		$("body").css("background-color", color);
	};

	return {
		"changeBackgroundColor": changeBackgroundColor
	};
});