/*!
 * Application
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */
 
require(
[
	"jquery",
	"app/helper",
	"app/config",
	"app/layout"
],

function ($, helper, config, Layout) {
	var changeBackgroundColor = function(color) {
		$("body").css("background-color", color);
	};

	return {
		"changeBackgroundColor": changeBackgroundColor
	};
});