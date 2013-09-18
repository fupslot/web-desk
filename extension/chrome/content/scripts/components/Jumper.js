/*!
 * Class: Jumper
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(
[
    'jquery',
    'app/config',
    'app/events',
    'app/helper'
],

function ($, config, Events, helper) {

    var itemsPerPage = 12;

    function init () {
        centralize.call(this);

        window.addEventListener('resize', function () {
            centralize.call(this);
        }.bind(this));
    }

    function centralize () {
        var top = ( window.innerHeight - this.$el.innerHeight() ) / 2;
        var left = ( window.innerWidth - this.$el.innerWidth() ) / 2;

        this.$el.css({
            top: top + 'px',
            left: left + 'px'
        });
    }

    function drawPagination(pageCount, activePage) {
        var $parent = this.$el.find('[role=pagination]').empty(),
            $ul = $('<ul>', {role: 'menu-vertical'});

        for (var i = 1; i <= pageCount; i++) {
            var $li = $('<li>')
                .text(i)
                .addClass(function () {
                    return (i === activePage) ? 'selected' : '';
                })
                .click(pagination_onPageClick.bind(this));
            $ul.append($li);
        };

        $parent.append($ul);
    }

    function pagination_onPageClick (e) {
        var $el = $(e.currentTarget);
        if ($el.hasClass('selected')) { return; }

        $el.parent().children().removeClass('selected');
        $el.addClass('selected');
        // switch active page index
        this._cache.pageidx = $el.parent().children().index($el);
        // read items from cache
        this.showItems(true);
    }

    function reset() {
        this._cache = {};
        this.$el.find('[name=search]').val('');
        this.$el.find('.content').empty();
        this.$el.find('[role=pagination]').empty();
    }

    function loadContent (html) {
        this.initialized = true;

        this.$el.find('[name=search]').on('keyup', function(e) {
            // before new search we reset a cache
            this._cache = {};
            this.trigger('onSearchRequest', e.currentTarget.value, e.keyCode);
        }.bind(this));

        _show.call(this);
    }

    function _show(soft) {
        if (soft != true) {
            this.trigger('onShow');
        }

        this.$el.show().removeClass('popOut').addClass('popIn active');
        this.$el.find('[name=search]').focus();
    }

    function drawItems ($content, items) {
        var $ul = $('<ul>', {'role': 'menu-vertical'});

        items.forEach(function(item) {
            var $li = newItem.call(this, item);
            $ul.append($li);
        }.bind(this));

        $content.append($ul);
    }

    function newItem (item) {
        var dim    = this.layout.getCellsDimention(item.size),
            layout = this.layout,

            draggable = item.pages.indexOf(layout.selectedPage) == -1;

        // don't draw item if it's a current page
        if (item.id == layout.selectedPage) { return; }

        var $li = $('<li>')
            .attr('draggable', draggable)
            .css(dim)
            .addClass(function(){
                return (item.size.coll == 2) ? 'link wide' : 'link';
            });

        if (item.type == 'link') {
            $li.on('click', link_onClick.bind(this));
        }
        else if(item.type == 'group') {
            $li.on('click', group_onClick.bind(this));
        }

        if (draggable) {
            $li.get(0).addEventListener('dragstart', onDragstart.bind(this), true);
        }

        return $li;
    }

    function link_onClick (e) {
        if (e.which != 1 && e.which != 2) { return false; }

        var win = bgTab = tab = false;

        win     = e.which === 1 && e.shiftKey;
        bgTab   = e.which === 2 && !e.shiftKey;
        tab     = e.which === 2 && e.shiftKey;

        var itemIdx = getItemIdxByElement.call(this, e.target),
            item    = this._cache.items[itemIdx];

        if (win) {
            chrome.windows.create({url: item.data.url});
            this.layout.trigger('onItemClicked', item.data);
        }
        else if(bgTab) {
            chrome.tabs.create({url: item.data.url, selected: false});
            this.layout.trigger('onItemClicked', item.data);
        }
        else if(tab) {
            chrome.tabs.create({url: item.data.url, selected: true});
            this.layout.trigger('onItemClicked', item.data);
        }
        else {
            chrome.tabs.update({url: item.data.url});
            this.layout.trigger('onItemClicked', item.data);
        }

        return true;
    }

    function group_onClick (e) {
        var itemIdx = getItemIdxByElement.call(this, e.target),
            item    = this._cache.items[itemIdx];
        
        this.hide(true);

        this.layout.pctrl.show(item.id);
        this.layout.trigger('onItemClicked', item);
        return true;
    }

    function getItemIdxByElement (element) {
        var idxOffset   = (this._cache.pageidx || 0) * itemsPerPage;
        return idxOffset + $(element).parent().children().index(element);
    }

    function onDragstart (e) {
        e.preventDefault();

        // var idxOffset   = (this._cache.pageidx || 0) * itemsPerPage,
        var idx  = getItemIdxByElement.call(this, e.target),
            item = $.extend({}, this._cache.items[idx]);

        var page = layout.pctrl.pages[layout.selectedPage];
        
        // before drag start check if page has a place 
        var pos = page.surface.findPos(item.size.coll, item.size.row);
        if (pos == null) { return; /*no place on the page*/}

        var dim = this.layout.getCellsDimention(item.size);

        var cursor  = this.layout.cursor,
            $el     = $('<div>')
                        .addClass('link broken')
                        .css({top: cursor.y, left: cursor.x})
                        .attr('style', $(e.target).attr('style'));
            
        page.$el.append($el);

        this.__DD = {
            page: page,
            originElement: e.currentTarget,
            $el: $el,
            
            evt_OnDragend: onDragend.bind(this),
            evt_OnMousemove: onMousemove.bind(this),
            
            itemIdx: idx,
            item: item,

            dx: (dim.width / 2), //cursor.x,// - parseInt($el.get(0).style.left),
            dy: (dim.height / 2), //cursor.y,// - parseInt($el.get(0).style.top),

            pos: pos,
            dim: dim
        };

        console.log(this.__DD);

        document.addEventListener('mouseup', this.__DD.evt_OnDragend, false);
        document.addEventListener('mousemove', this.__DD.evt_OnMousemove, false);
        // hide jumper softly, w/o reset the cache
        this.hide(true);
    }

    function onDragend (e) {
        // make sure that item has been relised on a page
        this.__DD.$el.remove();

        // element cannot be dragged more than once
        $(this.__DD.originElement).attr('draggable', false);

        var page = this.__DD.page,
            item = this.__DD.item,
            pos  = $.extend({}, this.__DD.pos);


        item.pages.push(page.id);
        item.pos[page.id] = pos;

        console.log('jumper', [page.id, pos]);

        // create an item on a page silently
        if (item.type == 'link') {
            this.__DD.page.createLink(item, true);
        }
        else if (item.type == 'group') {
            this.__DD.page.createGroup(item, true);
        }

        // refresh position information for an item
        this.trigger('onItemPlaced', item, page, pos);
        
        document.removeEventListener('mouseup', this.__DD.evt_OnDragend, false);
        document.removeEventListener('mousemove', this.__DD.evt_OnMousemove, false);

        delete this.__DD;
        // show jumper softly, all items will read from the cache
        this.show(true);
    }

    function onMousemove (e) {
        var cursor  = this.layout.cursor;

        var coords = this.layout.stayFit(
            cursor.x - this.__DD.dx,
            cursor.y - this.__DD.dy,
            this.__DD.dim.width,
            this.__DD.dim.height 
        );
// debugger
        // console.log(coords);

        this.__DD.$el.get(0).style.top  = coords.y + "px";
        this.__DD.$el.get(0).style.left = coords.x + "px";

            
        var pos = this.layout.getCellPosByXY(coords.x, coords.y);
        if (helper.isPosNotEqual(this.__DD.pos, pos)) {
            // this.__DD.cachedPos.coll    = newPos.coll;
            // this.__DD.cachedPos.row     = newPos.row;
            
            // see if we can place an item here
            var test = this.__DD.page.surface.testPos(
                pos.coll,
                pos.row, 
                this.__DD.item.size.coll,
                this.__DD.item.size.row
            );

            if (test === 0) {
                this.__DD.pos = $.extend({}, pos);
        //         this.__DD.pos.row   = newPos.row;
        //         // setPlaceholder.call(this);
            }
        }
    }

    // Class defenition
    function Jumper(layout) {
        this.layout = layout;
        this.$el = $('#jumper');
        this.$el.hide().addClass('animated quick');

        // store jumper state, like a current page and last search results
        this._cache = {};

        // this.$el.find('[role=menu-vertical] li').on('click', onMenuItemClick.bind(this));
        init.call(this);
    }

    Jumper.prototype = {
        show: function (soft) {
            if (!this.initialized) {
                this.$el.load('scripts/template/jumper.html', loadContent.bind(this));
            }
            else {
                _show.call(this, soft);
            }
        },
        // if soft equals true no cache be removed
        hide: function (soft) {
            this.trigger('onHide');
            this.$el.removeClass('popIn active').addClass('popOut');
            setTimeout(function () {
                this.$el.hide().removeClass('popOut');
                this.$el.find('[name=search]').blur();

                if (soft != true) {
                    reset.call(this);
                }
            }.bind(this), 500);
        },

        isShown: function() {
            return this.$el.hasClass('active');
        },

        showItems: function(cached) {
            var items = this._cache.items || [];

            // clean previous results
            var $content = this.$el.find('.content');
            $content.empty();

            if (!items.length) { return; }

            var paginationNeeded = (items.length > 12);
            // if more than 12 items devide them on pages
            if (paginationNeeded) {
                var pageTail = (items.length % itemsPerPage) > 0 ? 1 : 0;
                this._cache.pagesCount = Math.floor(items.length / itemsPerPage) + pageTail;

                var pageidx = this._cache.pageidx || 0;
                items = items.slice((pageidx * itemsPerPage), ((pageidx +1) * itemsPerPage));

                // draw pagination only for not cached items
                if (cached !== true) {
                    drawPagination.call(this, this._cache.pagesCount, pageidx);
                }
            }
            drawItems.call(this, $content, items);
        }
    };

    Jumper.prototype = $.extend(Jumper.prototype, Events);

    return Jumper;
});