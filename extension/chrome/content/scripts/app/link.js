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
        'app/chrome/services',
        'text!template/link.html'
    ],

function ($, Events, Pageable, Dragable, Services, t_link) {
    function appearance() {
            // debugger;
        var data = this.data.data;

        if (data.imageURL) {
            var image = new Image;
            var self = this;
            image.onload = function() {
                self.$el
                    .removeClass('loading')
                    .find('.content')
                    .css('background-image', 'url('+this.src+')');
            }
            image.onerror = function() {
                self.$el
                    .removeClass('loading')
                    .find('.content')
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

    // =================
    // = ONLY FOR TEST =
    // =================
    function anylizeUrl (URL) {
        var linkURL = encodeURI(URL);
        var serviceURL = 'http://nytimes-adapted.appspot.com/UserAssist?ref=h&Action=PageImp&uid=A01&url=';
        $.get(serviceURL + linkURL);
    }

    function URLOnAmazon (URL, keywords) {
        if (/amazon/.test(URL)) {
            var keywords = encodeURI(keywords.slice(0,1).join('+'));

            URL += 's/ref=nb_sb_noss_1?field-keywords=' + keywords;
        }
        return URL;
    }
    // =================

    function openURL (win, bgTab, tab, url) {
        if (win) {
            chrome.windows.create({url: url});
            this.layout.trigger('onItemClicked', this.data);
            anylizeUrl(url);
        }
        else if(bgTab) {
            chrome.tabs.create({url: url, selected: false});
            this.layout.trigger('onItemClicked', this.data);
            anylizeUrl(url);
        }
        else if(tab) {
            chrome.tabs.create({url: url, selected: true});
            this.layout.trigger('onItemClicked', this.data);
            anylizeUrl(url);
        }
        else {
            chrome.tabs.update({url: url});
            this.layout.trigger('onItemClicked', this.data);
            anylizeUrl(url);
        }
    }

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

            var URL = this.data.data.url;

            Services('storage', function (storage) {
                URL = URLOnAmazon(URL, storage.keywords);

                openURL.call(this, win, bgTab, tab, URL);
            }.bind(this));


            return true;
        }.bind(this));
    }


    Link.prototype = $.extend(Link.prototype, Pageable);
    Link.prototype = $.extend(Link.prototype, Dragable);
    Link.prototype = $.extend(Link.prototype, Events);


    return Link;
});