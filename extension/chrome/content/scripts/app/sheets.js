define(
    [
        'jquery',
        'app/Events'
    ],

function ($, Events) {
    
    function sheet_onClick (e) {
        var $sheet = $(e.currentTarget);

        if ($sheet.hasClass('selected')) { return; }

        var sheetIdx = $sheet
                        .parent()
                        .children()
                        .removeClass('selected')
                        .index($sheet);

        $sheet.addClass('selected');
        this.trigger('onSheetChanged', sheetIdx);

    }

    function init () {
        this.$el.find('[role=sheet]').on('click', sheet_onClick.bind(this));

        // this.selectedPageId = this.layout.selectedPageId;
// debugger
        // if selected one of the predefined pages
        if (this.layout.isPagePredefined()) {
            var selectedPageId = parseInt(this.layout.selectedPageId);
            this.$el.find('[role=sheet]').eq(selectedPageId).addClass('selected');
        }

        this.pin(this.layout.selectedPage());
    }

    function Sheets(layout) {
        this.layout = layout;
        this.$el = $('#sheets');
        this.$el.load('scripts/template/sheets.html', function (html) {
            init.call(this);
        }.bind(this));
    }

    Sheets.prototype = {
        pin: function (page) {
            if (!page.group) { return; }

            // 
            this.$el.find('[role=group]').remove();
            var $el = $('<div>').attr('role', 'group');
            this.$el.append($el);
        }
    };

    Sheets.prototype = $.extend(Sheets.prototype, Events);

    return Sheets;
});