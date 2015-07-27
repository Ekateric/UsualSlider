/**
 * Created by Ekaterina Radakina on 27.02.2015.
 * JQuery plugin for traditional slide show
 * Animation is set by css "transition" property
 */
;(function ($) {
    /**
     * Create UsualSlider
     * @param elem {object} slides' wrapper object
     * @param params {object} a set of parameters
     * @constructor
     */
    var UsualSlider = function(elem, params) {
        this.elem = $(elem);
        this.params = params;
        this.init();
    };

    /**
     * Plugin initialization
     */
    UsualSlider.prototype.init = function() {
        this.slides = this.elem.find('.' + this.params.slideClass);
        this.slider = this.slides.closest('ul');

        //true if slides are animating
        this.isSliding = false;
        this.interval = null;

        //For touch events
        this.isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints > 0));
        this.isLongTouch = false;

        var _this = this;


        //set initial positions
        _this.slides.each(function(indx) {
            var $elem = $(this);
            $elem.css({'left':  (indx * 100 / _this.params.slidesPerPage).toFixed(2) + '%'});
        });
        _this.slider.css({'left': _this.slides.width()*_this.params.activeIndx});

        if (_this.slides.length - _this.params.slidesPerPage > 0) {
            _this.slides.slice(0, _this.params.slidesPerPage).clone().each(function(indx) {
                var $elem = $(this);
                $elem.addClass('cloned')
                    .css({'left': ((_this.slides.length + indx) * 100 / _this.params.slidesPerPage).toFixed(2) + '%'})
                    .appendTo(_this.slider);
            });

            for (var i = 0; i < _this.params.slidesPerPage; i ++) {
                _this.slides.eq(-(i + 1)).clone().addClass('cloned')
                    .css({'left': -((i + 1) * 100 / _this.params.slidesPerPage).toFixed(2) + '%'})
                    .prependTo(_this.slider);
            }

            _this.attachEvents();

        } else {
            if (typeof _this.params.btns != 'undefined') {
                _this.params.btns.hide();
            }
        }

        _this.slides.eq(_this.params.activeIndx).addClass(_this.params.slideClass + '_active');
        if(_this.params.tabs && _this.params.tabsElems != null) {
            var $firstActiveTab =  _this.params.tabsElems.closest('ul').find('[data-index=' + _this.params.activeIndx + ']').parent();
            $firstActiveTab.addClass($firstActiveTab.attr('class') + '_active');
        }
    };

    /**
     * All events
     */
    UsualSlider.prototype.attachEvents = function() {
        var _this = this;

        if (_this.slides.length - _this.params.slidesPerPage > 0 && _this.params.autoSlide) {
           _this.autoSlideStart();
        }

        if (typeof _this.params.btns != 'undefined') {
            _this.params.btns.on('click', function(e) {
                e.preventDefault();

                if (!_this.isSliding) {
                    var $btn = $(this),
                        direction = 'next';

                    //To next slide
                    if ($btn.attr('class').indexOf('next') > -1 || $btn.attr('class').indexOf('right') > -1) {
                        if (_this.params.activeIndx - _this.slides.length >= -1) {
                            _this.params.activeIndx = 0
                        } else {
                            _this.params.activeIndx++
                        }

                    //To previous slide
                    } else if ($btn.attr('class').indexOf('prev') > -1 || $btn.attr('class').indexOf('left') > -1) {
                        if (_this.params.activeIndx <= 0) {
                            _this.params.activeIndx = _this.slides.length - 1
                        } else {
                            _this.params.activeIndx--
                        }
                        direction = 'prev';
                    }

                    _this.slideTo(direction);
                    if (_this.params.autoSlide) {
                        _this.autoSlideStop();
                        _this.autoSlideStart();
                    }
                }
            })
        }

        if (_this.params.autoSlide) {
            //Stop auto sliding on mouse enter event
            _this.slides.on('mouseenter', function () {
                _this.autoSlideStop();
            })
                .on('mouseleave', function () {
                    _this.autoSlideStart();
                });
        }

        if(_this.params.tabs && _this.params.tabsElems != null) {
            _this.params.tabsElems.on('click', function(e) {
                e.preventDefault();
                var $btn = $(this);
                if (!_this.isSliding && $btn.parent().attr('class').indexOf('active') < 0) {
                    var newIndex = $btn.attr('data-index'),
                        direction = 'next';
                    if (typeof newIndex != 'undefined' && _this.slides.eq(newIndex).length) {
                        if (_this.params.activeIndx - newIndex > 0) {
                            direction = 'prev';
                        }
                        _this.params.activeIndx = newIndex;
                        _this.slideTo(direction);
                        $btn.closest('ul').find('.' + $btn.parent().attr('class') + '_active').removeClass($btn.parent().attr('class') + '_active');

                        if (_this.params.autoSlide) {
                            _this.autoSlideStop();
                        }

                        setTimeout(function() {
                            if ($btn.parent().attr('class').indexOf('active') < 0) {
                                $btn.parent().addClass($btn.parent().attr('class') + '_active');
                            }
                            if (_this.params.autoSlide) {
                                _this.autoSlideStart();
                            }
                        }, _this.params.animationTime);
                    }
                }
            });
        }

        if (_this.isTouch) {
            _this.slides.on('touchstart', function (e) {
                if (!_this.isSliding) {
                    _this.touchStart(e);
                }
            })
                .on('touchmove', function (e) {
                    _this.touchMove(e);
                })
                .on('touchend', function (e) {
                    _this.touchEnd(e);
                })
        }

        $(window).resize(function() {
            _this.slider.css({
                'left': -_this.slides.width()*_this.params.activeIndx,
                'transitionDuration': '0ms'
            });
        });
    };

    UsualSlider.prototype.autoSlideStart = function() {
        var _this = this;
        if(_this.interval) return;
        _this.interval = setInterval(function() {
            if (_this.slides.eq(parseInt(_this.params.activeIndx) + 1).length) {
                _this.params.activeIndx ++
            } else {
                _this.params.activeIndx = 0
            }
            _this.slideTo('next');
        }, _this.params.timerTime);
    };

    UsualSlider.prototype.autoSlideStop = function() {
        var _this = this;
        if(!_this.interval) return;
        clearInterval(_this.interval);
        _this.interval = null;
    };

    UsualSlider.prototype.slideTo = function(direction) {
        var _this = this,
            $activeSlide = _this.slides.filter('.' + _this.params.slideClass + '_active'),
            $nextActiveSlide = _this.slides.eq(_this.params.activeIndx),
            delta = $activeSlide.index() - $nextActiveSlide.index();

        _this.isSliding = true;

        //End of list
        if (direction == 'next' && _this.params.activeIndx - _this.params.slidesPerPage < 0 && _this.slides.length - $activeSlide.index() <= 0) {
            delta = -1;
            setTimeout(function() {
                _this.slider.css({
                    'left': _this.slides.width()*_this.params.activeIndx,
                    'transitionDuration': '0ms'
                });
            }, _this.params.animationTime);
            //Start of list
        } else if (direction == 'prev' && _this.slides.length - _this.params.activeIndx - _this.params.slidesPerPage <= 0) {
            delta = 1;
            setTimeout(function() {
                _this.slider.css({
                    'left': -_this.slides.width()*_this.params.activeIndx,
                    'transitionDuration': '0ms'
                });
            }, _this.params.animationTime);
        }

        _this.slider.css({
            'left': _this.slider.position().left + _this.slides.width()*delta,
            'transitionDuration': _this.params.animationTime + 'ms'
        });

        $nextActiveSlide.addClass(_this.params.slideClass + '_active');

        setTimeout(function() {
            if (_this.slides.length > 1) {
                $activeSlide.removeClass(_this.params.slideClass + '_active');
            }
            if ($.isFunction(_this.params.afterSlide)) {
                _this.params.afterSlide(_this.params.activeIndx);
            }

            _this.isSliding = false;
        }, _this.params.animationTime);
    };

    /**
     * Touch events
     */
    UsualSlider.prototype.touchStart = function(e) {
        var _this = this;

        _this.isLongTouch = false;
        setTimeout(function () {
            _this.isLongTouch = true;
        }, 250);

        _this.touchStartX = e.originalEvent.touches[0].pageX;
    };

    UsualSlider.prototype.touchMove = function(e) {
        var _this = this;
        _this.touchMoveX = e.originalEvent.touches[0].pageX;
    };

    UsualSlider.prototype.touchEnd = function(e) {
        var _this = this;

        if (!(_this.isLongTouch || _this.isSliding)) {
            var direction = 'next';

            if (_this.touchMoveX - _this.touchStartX > 0) {
                if (_this.params.activeIndx <= 0) {
                    _this.params.activeIndx = _this.slides.length - 1
                } else {
                    _this.params.activeIndx--
                }
                direction = 'prev';
            } else {
                if (_this.slides.eq(parseInt(_this.params.activeIndx) + 1).length) {
                    _this.params.activeIndx ++
                } else {
                    _this.params.activeIndx = 0
                }
            }
            _this.slideTo(direction);
        }
    };


    $.fn.usualSlider = function (params) {
        params = $.extend({
            //values
            activeIndx: 0,
            animationTime: 500,
            timerTime: 5000,
            slidesPerPage: 1,
            autoSlide: true,

            //elements
            slideClass: 'slider__item',
            btns: $('.slider__btn'),
            tabs: false,
            tabsElems: null,

            //callbacks
            afterSlide: null //will be performed when the sliding had ended

        }, params);

        return this.each(function () {
            new UsualSlider(this, params);
        });
    }
})(jQuery, undefined, document);
