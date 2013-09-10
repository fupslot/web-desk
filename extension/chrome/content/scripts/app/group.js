/*!
 * Group Class
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
    function Group(page, data, silent) {
        this.page   = page;
        this.layout = page.layout;
        this.data = data || {};

        if (!this.data.type) {
            this.data.type = 'group';
        }

        if (!this.data.data) {
            this.data.data = [];
        }

        // Inherited from Pageable Class
        this.initPageable(t_link);
        
        if (this.data.draggable) {
            // Inherited from Dragable
            this.initDraggable();
        }

        appearance.call(this);


        this.$el.on('click', function(e) {
            console.log(this.data);
            this.layout.pctrl.show(this.data.id);
            this.layout.trigger('onItemClicked', this);
            return true;
        }.bind(this));
    }


    Group.prototype = $.extend(Group.prototype, Pageable);
    Group.prototype = $.extend(Group.prototype, Dragable);
    Group.prototype = $.extend(Group.prototype, Events);


    return Group;
});