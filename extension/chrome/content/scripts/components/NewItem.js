/*!
 * Class: NewItem
 * Copyright 2013 Fupslot
 * Released under the MIT license
 */

define(
[
    'jquery',
    'app/events'
],

function ($, Events) {

    function init () {
        centralize.call(this);

        window.addEventListener('resize', function () {
            centralize.call(this);
        }.bind(this));
    }

    function centralize () {
        var top = ( window.innerHeight - this.$el.innerHeight() ) / 2;
        var left = ( window.innerWidth - this.$el.innerWidth() ) / 2;

        this.$el.css({
            top: top + 'px',
            left: left + 'px'
        });
    }

    function onSend (e) {
        e.preventDefault();

        var URL = this.$url.val();
        if (!/^(http|https|ftp)/.test(URL)) {
            URL = 'http://' + URL;
        }

        $.ajax({
            url: 'http://www.web4devs.com/extension/gallery',
            headers: {
                'extension-id' : 'user-id',
                'source-action': 'galleryItemRequiest'
            },
            data: {'url': URL},
            dataType: 'json',
            beforeSend: onBeforeSend.bind(this),
            complete:   onSendComplete.bind(this)
        });
    }

    function onBeforeSend () {
        this.$url.prop('readonly', true);
    }

    function onSendComplete (xhr, textStatus) {
        this.$url.prop('readonly', false);
        
        if (textStatus === 'success') {
            if (this.response) {
                delete this.response;
            }

            try {
                this.response = JSON.parse(xhr.responseText);
                // concatenate baseURL with an image's name
                var images = this.response.images;
                if (images.map) {
                    this.response.images = images.map(function(image) {
                        return this.response.baseURL + image;
                    }.bind(this));
                }
                this.showResponse();
            }
            catch (ex) {
                console.log(ex.message);
                return;
            }
        }
        else { /*error*/ }
    }

    function onImageScroll (e) {
        if (this.imageScrollAnimating) { return; }
        
        var $butt       = $(e.currentTarget)
            , images    = this.response.images
            , length    = this.response.images.length
            , index     = images.indexOf(this.$image.attr('src'));

            // console.log(index);
        if ($butt.attr('role') === 'scroll-left') {
            // <
            if ((index - 1) < 0) { return; }
            index -= 1;
        }
        else {
            // >
            if ((index + 1) > length - 1) { return; }
            index += 1;
        }

        this.$el.find('span[role=scroll-left]').attr('disabled', (index === 0));
        this.$el.find('span[role=scroll-right]').attr('disabled', (index === length - 1));

        this.imageScrollAnimating = true;
        this.$image.addClass('bounceOut');

        setTimeout(function (){
            this.$image.removeClass('bounceOut');
            
            var imageSrc = this.response.images[index];
            this.$image.attr('src', imageSrc);

            setTimeout(function () {
                this.imageScrollAnimating = false;
            }.bind(this), 500);
        }.bind(this), 1000);
    }

    function NewItem (elem) {
        this.imageScrollAnimating = false;
        this.$el = $(elem);
        this.$el.hide().addClass('animated quick');

        this.$form  = this.$el.find('form');
        this.$url   = this.$el.find('[name=url]');
        this.$title = this.$el.find('[name=title]');
        this.$image = this.$el.find('img');

        this.$el.find('[role=close]').on('click', function() {
            this.hide();
        }.bind(this));

        this.$el.find('span[role*=scroll]').on('click', onImageScroll.bind(this));

        this.$image.on('load', function () {
            this.$image.addClass('bounceIn');
        }.bind(this));

        this.$el.find('form').on('submit', onSend.bind(this));

        init.call(this);
    }

    NewItem.prototype = {
        show: function () {
            this.$el.show().removeClass('popOut').addClass('popIn');
            this.$el.find('[name=url]').focus();
        },

        hide: function () {
            this.$el.removeClass('popIn').addClass('popOut');
            setTimeout(function () {
                this.$el.hide().removeClass('popOut');
            }.bind(this), 500);
        },

        showResponse: function () {
            if (!this.response) { return; }

            this.$el.find('.option-panel').show().css('height', '165px');

            this.$url.val(this.response.url);
            this.$title.val(this.response.title);

            if (this.response.images.length > 0) {
                var imageSrc = this.response.images[0];
                this.$image.attr('src', imageSrc);
            }
        }
    };

    NewItem.prototype = $.extend(NewItem.prototype, Events);

    return NewItem;
});