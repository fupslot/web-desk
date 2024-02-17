;(function (win) {
	'use strict';

	// chrome.management.onInstalled.addListener(function (extensionInfo) {
	// 	console.log("extensionInfo");
	// });

chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
    console.log(details);
});

  


})(window);