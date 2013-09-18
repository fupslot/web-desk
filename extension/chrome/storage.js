;(function(storage, _) {
    'use strict';

    window.dataItems       = [];

    if (localStorage && localStorage['items']) {
        try {
          dataItems = _.extend(dataItems, JSON.parse(localStorage['items']));
        }
        catch(ex) { throw 'Bad layout data format'; }
    }
    else {
        localStorage['items'] = '[]';
    }

    if (_.isUndefined(localStorage['selectedPageId'])) {
        localStorage['selectedPageId'] = '0';
    }

    storage.__defineGetter__('selectedPageId', function() {
        return localStorage['selectedPageId'];
    });

    storage.__defineSetter__('selectedPageId', function(num) {
        localStorage['selectedPageId'] = num;
    });

    storage.save = function() {
        localStorage['items'] = JSON.stringify(dataItems);
    }

    /*
        getItems(options) - returns items from a storage
            options - object
                {'page': number}  - returns items for a specific page
                {'group': number} - return items for a specific group
            query - string
                  - object {pageId: id}
    */

    storage.getItemById = function (itemId) {
        return _.findWhere(dataItems, {id: itemId});
    }

    storage.getItemsByPageId = function (pageId) {
        var items = _.filter(dataItems, function (item) {
            return _.contains(item.pages, pageId);
        });

        return _.sortBy(items, function(item) {
            return item.lastAccess || 0;
        });
    }

    storage.getAllItems = function () {
        return _.sortBy(dataItems, function(item) {
            return item.lastAccess || 0;
        });
    }

    storage.searchItems = function (query) {
        var items = _.filter(dataItems, function(item) {
            var url   = item.data.url   || ''
              , title = item.data.title || '';

            return (url.indexOf(query)   !== -1) || 
                   (title.indexOf(query) !== -1);
        });

        return _.sortBy(items, function(item) {
            return item.lastAccess || 0;
        });
    }

    // storage.getItems = function(query) {
    //     var items = [];

    //     if (_.isObject(query)) {
    //         items = _.filter(dataItems, function (item) {
    //             return _.contains(item.pages, query.pageId);
    //         });
    //     }

    //     if (_.isString(query)) {
    //         items = searchItems(query);
    //     }

    //     if(_.isUndefined(query)) {
    //         items = dataItems;
    //     }

    //     return _.sortBy(items, function(item) {
    //         return item.lastAccess || 0;
    //     });
    // }

    // function searchItems (query) {
    //     return _.filter(dataItems, function(item) {
    //         var url   = item.data.url   || ''
    //           , title = item.data.title || '';

    //         return (url.indexOf(query)   !== -1) || 
    //                (title.indexOf(query) !== -1);
    //     });
    // }

    // updates item last access
    storage.touchItem = function(item) {
        var item = _.findWhere(dataItems, {id: item.id});
        if (!_.isEmpty(item)) {
            item.lastAccess = (new Date()).getTime();
            this.save();
        }
    }

    /*
        addItem(item) - adds a new item into a storage
    */
    storage.addItem = function(item) {
        dataItems.push(item);
        this.save();
    }


    // force - [boolean] delete item and its links on all pages 
    // not emplemented yet
    storage.removeItem = function(page, item, force) {
        // console.log(item);
        var item = _.findWhere(dataItems, {id: item.id});

        // remove an items from specified page
        item.pages.splice(item.pages.indexOf(page.id), 1);
        delete item.pos[page.id];

        var isGroupEmpty = true;
        if (item.type == 'group') {
            var groupItems = this.getItems({pageId: item.id});
            isGroupEmpty = groupItems.length === 0;
        }
        
        // remove an item from storage if it has no references anymore
        // only empty groups will be deleted
        if ((item.type == 'link'  && item.pages.length == 0) || 
            (item.type == 'group' && item.pages.length == 0 && isGroupEmpty == true)) {
            var index = _.indexOf(dataItems, item);
            // console.log(index);
            dataItems.splice(index, 1);
        }

        console.log('storage', [item.pages, item.pos]);

        this.save();
    }

    function dataURL2ab(dataUrl) {
        var base64String = dataUrl.replace(';base64,', '');

        var atob    = window.atob(base64String)
          , buf     = new Uint8Array(new ArrayBuffer(atob.length));

        for (var i = 0, strLen = atob.length; i < strLen; i++) {
            buf[i] = atob.charCodeAt(i);
        }
        
        return buf;
    }

    function errorHandler(e) {
        var msg = '';
        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
            break;
        };
        console.log('Error: ' + msg);
    }

    function saveBlob(category, fileName, blob, success, error) {
        var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        requestFileSystem(window.PERSISTENT, null, function(fs) {
            console.log('FS');
            
            fs.root.getDirectory(category, {create: true}, function(dirEntry) {
                console.log('Directory has been created');
                dirEntry.getFile(fileName, {create: true}, function(fileEntry) {
                    console.log('File has been created');
                    fileEntry.createWriter(function(fileWriter) {
                        fileWriter.onwriteend = success;
                        fileWriter.onerror = error;
                        fileWriter.write(blob);
                    }, errorHandler);
                }, errorHandler);
            }, errorHandler);

        }, errorHandler);   
    }


    storage.saveThumbnail = function (fileName, url, success, error) {
        var image = new Image;
        image.addEventListener('load', function () {
            var canvas = document.createElement('canvas');
            canvas.width  = this.width;
            canvas.height = this.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0, this.width, this.height);
            
            var dataURL     = canvas.toDataURL('image/png')
              , arrayBuffer = dataURL2ab(dataURL)
              , blob        = new Blob([arrayBuffer.buffer], {type:'image/png'});

            saveBlob('Thumbnails', fileName, blob, success, error);
        });
        
        image.addEventListener('error', error);
        image.src = url;
    }

})(window.storage = window.storage || {}, window._)