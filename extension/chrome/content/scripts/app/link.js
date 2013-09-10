/*!
 * Link Class
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(
    [
        'jquery',
        'app/Events',
        'app/pageable',
        'app/dragable',
        'text!template/link.html'
    ],

function ($, Events, Pageable, Dragable, t_link) {
    function appearance() {
            // debugger;
        var data = this.data.data;

        if (data.imageURL) {
            var image = new Image;
            var self = this;
            image.onload = function() {
                self.$el
                    .removeClass('loading')
                    .css('background-image', 'url('+this.src+')');
            }
            image.onerror = function() {
                self.$el
                    .removeClass('loading')
                    .addClass('broken');
            }
            image.src = data.imageURL;
        }
        else {
            this.$el
                .removeClass('loading')
                .addClass('broken');
        }
    } 

    /*
        data : {
            pos: {top:0, left:0},
            size:{coll:0, row:0}, 
            draggable: true|false,
            data: {
                url:'', 
                imageURL: ''
            }
        }
    */
    function Link(page, data, silent) {
        this.page   = page;
        this.layout = page.layout;
        this.data = data || {};

        if (!this.data.type) {
            this.data.type = 'link';
        }

        if (!this.data.data) {
            this.data.data = {};
        }

        // Inherited from Pageable Class
        this.initPageable(t_link);
        
        if (this.data.draggable) {
            // Inherited from Dragable
            this.initDraggable();
        }

        appearance.call(this);


        this.$el.on('click', function(e) {
            if (e.which != 1 && e.which != 2) { return false; }

            var win = bgTab = tab = false;

            win     = e.which === 1 && e.shiftKey;
            bgTab   = e.which === 2 && !e.shiftKey;
            tab     = e.which === 2 && e.shiftKey;

            if (win) {
                chrome.windows.create({url: this.data.url});
                this.layout.trigger('onItemClicked', this.data);
            }
            else if(bgTab) {
                chrome.tabs.create({url: this.data.url, selected: false});
                this.layout.trigger('onItemClicked', this.data);
            }
            else if(tab) {
                chrome.tabs.create({url: this.data.url, selected: true});
                this.layout.trigger('onItemClicked', this.data);
            }
            else {
                chrome.tabs.update({url: this.data.url});
                this.layout.trigger('onItemClicked', this.data);
            }

            return true;
        }.bind(this));
    }


    Link.prototype = $.extend(Link.prototype, Pageable);
    Link.prototype = $.extend(Link.prototype, Dragable);
    Link.prototype = $.extend(Link.prototype, Events);


    return Link;
});