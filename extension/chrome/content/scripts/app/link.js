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
    function Link(page, data, animated) {
        this.page   = page;
        this.layout = page.layout;
        this.data = data || {};

        if (!this.data.pageId) {
            data.pageId = page.id;
        }

        if (!this.data.type) {
            this.data.type = 'link';
        }

        // Inherited from Pageable Class
        this.initPageable(t_link);
        
        if (this.data.draggable) {
            // Inherited from Dragable
            this.initDraggable();
        }
    }


    Link.prototype = $.extend(Link.prototype, Pageable);
    Link.prototype = $.extend(Link.prototype, Dragable);
    Link.prototype = $.extend(Link.prototype, Events);


    return Link;
});