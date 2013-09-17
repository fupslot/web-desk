/*!
 * Class: Jumper
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(
[
    'jquery',
    'app/config',
    'app/events'
],

function ($, config, Events) {

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

    function Jumper(layout) {
        this.layout = layout;
        this.$el = $('#jumper');
        this.$el.hide().addClass('animated quick');

        // store jumper state, like a current page and last search results
        this._cache = {};

        // this.$el.find('[role=menu-vertical] li').on('click', onMenuItemClick.bind(this));
        init.call(this);
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

    function _show() {
        this.trigger('onShow');
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
            draggable = item.pageId != layout.selectedPage;

        var $li = $('<li>')
            .attr('draggable', draggable)
            .css(dim)
            .addClass(function(){
                return (item.size.coll == 2) ? 'link wide' : 'link';
            });

        if (draggable) {
            $li.get(0).addEventListener('dragstart', onDragstart.bind(this), true);
            // $li.get(0).addEventListener('dragend', onDragend.bind(this), true);
        }

        // mark item if it's already located on the page
        if (item.pageId == this.layout.selectedPage) {
            $li.css('backgroundColor', 'red');
        }
        return $li;
    }

    function onDragstart (e) {
        e.preventDefault();
        this.__DD = {
            evt_OnDragend: onDragend.bind(this)
        };

        document.addEventListener('mouseup', this.__DD.evt_OnDragend, false);
        
        console.log('onDragstart');
        
    }

    function onDragend (e) {
        console.log(e);
        if ($(e.target).hasClass('page')) {
            console.log('page');
        }
        //this.layout.$el.get(0);
        document.removeEventListener('mouseup', this.__DD.evt_OnDragend, false);
        delete this.__DD;
    }

    Jumper.prototype = {
        show: function () {
            if (!this.initialized) {
                this.$el.load('scripts/template/jumper.html', loadContent.bind(this));
            }
            else {
                _show.call(this);
            }
        },

        hide: function () {
            this.trigger('onHide');
            this.$el.removeClass('popIn active').addClass('popOut');
            setTimeout(function () {
                this.$el.hide().removeClass('popOut');
                this.$el.find('[name=search]').blur();
                reset.call(this);
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