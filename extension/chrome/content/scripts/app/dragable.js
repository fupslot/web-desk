define(["jquery"], function ($) {
    
    function onDragstart (e) {
        e.preventDefault();

        this.__DD = {
            evt_OnDragend:      DD_onDragend.bind(this),
            evt_OnMousemove:    DD_onMousemove.bind(this),
            dx: 0, 
            dy: 0
        };

        this.pos   = $.extend({}, this.$el.data('pos'));
        this.size  = this.$el.data('size');

        $el = null;

        this.__DD.cachedPos = $.extend({}, this.pos);
        this.__DD.dim = this.layout.getCellsDimention(this.size);

        this.$el.css('z-index', 100);
        this.$el.removeData('pos');

        // release a place that it takes on a surface
        this.page.surface.release(this.pos.coll, this.pos.row, this.size.coll, this.size.row);
        
        var cursor  = this.layout.cursor;
        var padding = this.layout.padding;

        this.__DD.dx = cursor.x - parseInt(this.$el.get(0).style.left);
        this.__DD.dy = cursor.y - parseInt(this.$el.get(0).style.top);

        setPlaceholder.call(this);

        this.page.$el.get(0).addEventListener("mousemove", this.__DD.evt_OnMousemove, false);
        document.addEventListener("mouseup", this.__DD.evt_OnDragend, false);
    }

    function DD_onDragend (e) {
        // console.log("dragend");

        var pos = this.layout.getCellCoordsByPos(this.pos.coll, this.pos.row);
        this.$el.get(0).style.top  = pos.top   + "px";
        this.$el.get(0).style.left = pos.left  + "px";

        this.page.surface.hold(this.pos.coll, this.pos.row, this.size.coll, this.size.row);

        unsetPlaceholder.call(this);

        this.$el.data('pos', this.pos);
        this.$el.css('z-index', '');

        document.removeEventListener("mouseup", this.__DD.evt_OnDragend, false);
        this.page.$el.get(0).removeEventListener("mousemove", this.__DD.evt_OnMousemove, false);

        delete this.__DD;
    }

    function DD_onMousemove (e) {
        var cursor  = this.layout.cursor;

        var coords = glideIt.call(
            this,
            cursor.x - this.__DD.dx,
            cursor.y - this.__DD.dy,
            this.__DD.dim.width,
            this.__DD.dim.height 
        );


        this.$el.get(0).style.top  = coords.y + "px";
        this.$el.get(0).style.left = coords.x + "px";

            
        var newPos = this.layout.getCellPosByXY(coords.x, coords.y);

        if (notEquals(this.__DD.cachedPos, newPos)) {
            this.__DD.cachedPos.coll    = newPos.coll;
            this.__DD.cachedPos.row     = newPos.row;
            
                
            var testResult = this.page.surface.testPos(
                newPos.coll,
                newPos.row, 
                this.size.coll,
                this.size.row
            );

            if (testResult === 0) {
                this.pos.coll  = newPos.coll;
                this.pos.row   = newPos.row;
                setPlaceholder.call(this);
            }
        }
    }

    function notEquals (pos1, pos2) {
        return pos1.coll !== pos2.coll || pos1.row !== pos2.row;
    }

    function glideIt (x, y, w, h) {
        var inner = this.layout.inner;
        var coords = {x:x, y:y};

        if (x < 0) {
            coords.x = 0;
        }

        if (y < 0) {
            coords.y = 0;
        }

        if ( (x + w) > inner.width ) {
            coords.x = inner.width - w;
        }

        if ( (y + h) > inner.height ) {
            coords.y = inner.height - h;
        }

        return coords;
    }

    function setPlaceholder() {
        if ( ! this.$ph) {
            this.$ph = $("<div>", {"class": "placeholder", });
            this.page.$el.append(this.$ph);
        }

        var coords  = this.layout.getCellCoordsByPos(this.pos);
        var dim     = this.layout.getCellsDimention(this.size);

        this.$ph.css({
            'top': coords.top + 'px',
            'left': coords.left + 'px',
            'width': dim.width + 'px',
            'height': dim.height + 'px'
        });
    }

    function unsetPlaceholder() {
        if (this.$ph) {
            this.$ph.remove();
            this.$ph = null;
        }
    }

    return {
        pos : null,
        size : null,

        isDraggable: false,

        setAsDraggable: function() {
            if (this.isDraggable) { return; }
            this.isDraggable = true;
            this.$el.get(0).addEventListener("dragstart", onDragstart.bind(this), true);
        }
    };
});