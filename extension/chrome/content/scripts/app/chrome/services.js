define(function () {
    return function (name, callback) {
        chrome.runtime.getBackgroundPage(function (win) {
            callback(win[name]);
        });
    }
});