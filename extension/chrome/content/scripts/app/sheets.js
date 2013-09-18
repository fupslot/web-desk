define(
    [
        'jquery',
        'app/Events'
    ],

function ($, Events) {
    
    function sheet_onClick (e) {
        var sheetIdx = $(e.currentTarget).parent().children().index(e.currentTarget);
        this.trigger('onSheetChanged', sheetIdx);
    }

    function init () {
        this.$el.find('[role=sheet]').on('click', sheet_onClick.bind(this));
    }

    function Sheets(layout) {
        this.$el = $('#sheets');
        this.$el.load('scripts/template/sheets.html', function (html) {
            init.call(this);
        }.bind(this));
    }

    Sheets.prototype = {
        // body...
    };

    Sheets.prototype = $.extend(Sheets.prototype, Events);

    return Sheets;
});