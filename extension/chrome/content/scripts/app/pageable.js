/*!
 * Pageable Abstract Class
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(
    
    [
        'jquery',
        'mustache',
        'app/helper'
    ],

function ($, Mustache, helper) {
    return {
        initPageable: function(HTMLtemplate) {
            var DEF_SIZE = {coll: 3, row: 2};
// debugger            
            // if (!this.data.pageId) {
            //     this.data.pageId = this.page.id;
            // }

            if (!this.data.pages) {
                this.data.pages = [this.page.id];
            }

            if (typeof this.data.id === 'undefined') {
                this.data.id = helper.genNewID();
            }

            if (typeof this.data.draggable !== 'boolean') {
                this.data.draggable = true;
            }

            if (!this.data.size) {
                this.data.size = DEF_SIZE;
            }
            
            if (!this.data.pos) {
                // as soon as the item can be placed 
                // on many places
                this.data.pos = {};
                this.data.pos[this.page.id] = 
                    this.page.surface.allocate(
                        this.data.size.coll,
                        this.data.size.row
                    );
            }
            else {
                // on item load it will hold a peace of the surface
                this.page.surface.hold(
                    this.data.pos[this.page.id].coll,
                    this.data.pos[this.page.id].row,
                    this.data.size.coll,
                    this.data.size.row
                );
            }

            
            if (this.data.pos === null) {
                console.log('No space available on the page id \'%s\'', this.page.id);
                return;
            }

            var coords, dims;
            coords = this.layout.getCellCoordsByPos(this.data.pos[this.page.id]);
            dims   = this.layout.getCellsDimention(this.data.size);

            this.$el = $(Mustache.render(HTMLtemplate,
                $.extend({}, dims, coords, this.data)));

            this.page.$el.append(this.$el);
        }
    }
});