/*!
 * Class: Layout Data Manager
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(
[
	"app/helper"
],

function(helper) {
/*    layoutDataManager.pages(2).setAsCurrent();
    layoutDataManager.pages(2).items();
    layoutDataManager.pages(2).items(1).moveTo(0, 0, pageId);
    layoutDataManager.pages(2).createItem(); // {id}

    layoutDataManager.createPage(); // {id}
*/

    function LayoutItemDataManager(item, LayoutPageDataManager, _layoutDataManager) {
        this._item               = item;
        this._page               = LayoutPageDataManager;
        this._layoutDataManager  = _layoutDataManager;
    }
    LayoutItemDataManager.prototype = {
        isGroup: function() {
            return typeof this._item.group !== 'undefined';
        },

        getSize: function() {
            return this.item.size;
        },

        setSize: function(coll, row) {
            this._item.size = [coll, row];
        },

        getPosition: function() {
            return this._item.position;
        },

        setPosition: function(coll, row) {
            this._item.position = [coll, row];
        },

        getPageIdx: function() {
            return this._item.pageIdx;
        },

        setPageIdx: function(index) {
            if (index === this._item.pageIdx) { return; }

            var length = this._layoutDataManager.pages.length;
            if (index >= length || index < 0) { return; }

            this._item.pageIdx = index;
        },

        getID: function() {
            return this._item.id;
        }
    };

    function LayoutPageDataManager(page, _layoutDataManager) {
        this._page               = page;
        this._layoutDataManager  = _layoutDataManager;
        this._items              = {};

        this._page.items.forEach(function(item,idx) {
            this._items[item.id] = new LayoutItemDataManager(item, this, this._layoutDataManager);
        }.bind(this));
    }
    LayoutPageDataManager.prototype = {
        setAsCurrent: function() {
            this.layoutDataManager._layoutData.pageSelected = this._page.index;
        },

        createItem: function() {
            // create a new item
        }
    };

    function LayoutDataManager() {
        this._layoutData = null;
        this.pages      = null;
    }
    LayoutDataManager.prototype = {

        loadData: function(data) {
            if (typeof data === 'undefined') {
                var layoutDataJSON  = localStorage['layout'];

                if (typeof layoutDataJSON === 'string') {
                    try {
                        this._layoutData = JSON.parse(layoutDataJSON);
                    }
                    catch(e) { }
                }                
            }
            else {
                this._layoutData = data;
            }

            if (!this.isValid()) { return; }

            this.pages = [];
            this._layoutData.pages.forEach(function(page, idx) {
                this.pages[idx] = new LayoutPageDataManager(page, this);
            }.bind(this));

            console.log('Data was loaded');
        },

        getPageSelected: function() {
            return this._layoutData.pageSelected;
        },

        setPageSelected: function(pageIndex) {
            if (this._layoutData.pageSelected === pageIndex) { return; }

            var length  = this._layoutData.pages.length;
            if (pageIndex <= length || pageIndex < 0) { return; }

            this._layoutData.pageSelected = pageIndex;
        },

        isValid: function() {
            // JSON scheme validation is needed here
            return typeof this._layoutData === 'object';
        },

        saveData: function() {
            if (typeof this._layoutData === 'object') {
                localStorage['layout'] = JSON.stringify(this._layoutData);
            }
        }
        
    };



    var layoutDataManager = new LayoutDataManager();
    return layoutDataManager;
});