define(

    ["jquery"],

function ($) {
    var $el = $('#bin'),
        
        pos  = null,
        size = {width: 64, height: 64},

        hoveredByItem = false,
        isBinAppear = false,
        offset = null;


    // coords - {x, y}
    function status(coords) {
        if (pos == null || offset == null) { return; }
        
        var status = coords.x >= (pos.left - offset.x) && coords.x <= ((pos.left - offset.x) + size.width) &&
                     coords.y >= (pos.top - offset.y) && coords.y <= ((pos.top - offset.y) + size.height);
                     
        if (hoveredByItem && !status) {
            hoveredByItem = !hoveredByItem;
            return 'left';
        }
        
        if (!hoveredByItem && status) {
            hoveredByItem = !hoveredByItem;
            return 'enter';
        }
    }

    function showBin() {
        if (isBinAppear) { return; }

        $el.addClass('show');
        isBinAppear = true;

        setTimeout(function() {
            pos    = $el.position();
            offset = {
                x: parseInt($el.css('right')),
                y: parseInt($el.css('bottom'))
            };

            if (isNaN(offset.x)) { offset.x = 0; }
            if (isNaN(offset.y)) { offset.y = 0; }
        }, 350);
    }

    function hideBin() {
        if (!isBinAppear) { return; }

        $el.removeClass('show');
        isBinAppear = false;

        pos = null;
        offset = null;
    }

    return {
        show: showBin,
        hide: hideBin,
        status: status
    };
});