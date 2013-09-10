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

    function onMenuItemClick(e) {
        var $butt = $(e.currentTarget);

        if ($butt.hasClass('selected') || 
            $butt.hasClass('non-selectable')) { 
                return; 
            }

        $('li', e.currentTarget.parent).removeClass('selected');

        $butt.addClass('selected');

        this.trigger('onMenuItemClick', $butt);
    }

    function Jumper(layout, elem) {
        this.layout = layout;
        this.$el = $(elem);
        this.$el.hide().addClass('animated quick');

        this.$el.find('[role=menu-vertical] li').on('click', onMenuItemClick.bind(this));
        this.$el.find('[name=search]').on('keyup', function(e) {
            this.trigger('onSearchRequest', e.currentTarget.value, e.keyCode);
        }.bind(this));

        this.linkDim = this.layout.getCellsDimention({coll:3,row:2});

        init.call(this);
    }

    Jumper.prototype = {
        show: function () {
            this.$el.show().removeClass('popOut').addClass('popIn');
            this.$el.find('[name=search]').focus();
        },

        hide: function () {
            this.$el.removeClass('popIn').addClass('popOut');
            setTimeout(function () {
                this.$el.hide().removeClass('popOut');
                this.$el.find('[name=search]').blur();
            }.bind(this), 500);
        },

        showItems: function(items) {
            var $content = this.$el.find('.content');
            $content.empty();

            if (!items.length) { return; }

            var $ul = $('<ul>', {'role': 'menu-vertical'});

            items.forEach(function(item) {
                var $li = $('<li>', {
                    'draggable': 'true',
                    'class': 'link'
                }).css(this.linkDim);

                // mark item if it's already located on the page
                if (item.pageId == this.layout.selectedPage) {
                    $li.css('backgroundColor', 'red');
                }

                $ul.append($li);
            }.bind(this));

            $content.append($ul);
        }
    };

    Jumper.prototype = $.extend(Jumper.prototype, Events);

    return Jumper;
});