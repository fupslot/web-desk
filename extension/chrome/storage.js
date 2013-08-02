;(function(storage, _) {
    'use strict';

    var dataItems       = [];

    if (localStorage && localStorage['items']) {
        try {
          dataItems = _.extend(dataItems, JSON.parse(localStorage['items']));
        }
        catch(ex) { throw 'Bad layout data format'; }
    }

    storage.__defineGetter__('selectedPage', function() {
        return localStorage['selectedPage'];
    });

    storage.__defineSetter__('selectedPage', function(num) {
        localStorage['selectedPage'] = num;
    });

    storage.save = function() {
        localStorage['items'] = JSON.stringify(dataItems);
    }

    /*
        getItems(options) - returns items from a storage
            options - object
                {'page': number}  - returns items for a specific page
                {'group': number} - return items for a specific group
    */
    storage.getItems = function(options) {
        return _.where(dataItems, options || {});
    }

    /*
        addItem(item) - adds a new item into a storage
    */
    storage.addItem = function(item) {
        dataItems.push(item);
        this.save();
    }

})(window.storage = window.storage || {}, window._)