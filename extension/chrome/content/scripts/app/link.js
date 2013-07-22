/*!
 * Link Class
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(
    [
        "jquery",
        "mustache",
        "app/dragable",
        "text!template/link.html"
    ],

function ($, Mustache, Dragable, t_link) {
    
    var DEF_SIZE = {coll: 3, row: 2};

    /*
        options - {pos: {top:0, left:0}, size:{coll:0, row:0}}
    */
    function Link(page, options) {
        this.page   = page;
        this.layout = page.layout;

        var pos, coords, dims, size;

        if (typeof options === 'object') {
            pos  = options.pos;
            size = options.size;
        }
        else {
            pos = this.page.surface.allocate(DEF_SIZE.coll, DEF_SIZE.row);
            if (pos === null) { throw 'No space available on the page'; }

            size = DEF_SIZE;
        }

        coords = this.layout.getCellCoordsByPos(pos);
        dims   = this.layout.getCellsDimention(DEF_SIZE);

        this.$el = $(Mustache.render(t_link, $.extend({'draggable':true}, dims, coords)));

        this.$el.data("pos", pos);
        this.$el.data("size", size);

        this.page.$el.append(this.$el);
        

        // Inherited from Dragable
        this.setAsDraggable();
    }

    Link.prototype = $.extend(Link.prototype, Dragable);


    return Link;
});