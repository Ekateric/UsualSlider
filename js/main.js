/**
 * Created by Ekaterina Radakina on 27.02.2015.
 * JQuery plugin for traditional slide show
 * Animation is set by css "transition" property
 */
;(function ($) {
    var pluginName = 'jUsualSlider';
    /**
     * Create UsualSlider
     * @param elem {object} slides' wrapper object
     * @param params {object} a set of parameters
     * @constructor
     */
    var UsualSlider = function(elem, params) {
        this.elem = $(elem);
        this.params = $.extend({
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
        this.init();
    };

    UsualSlider.prototype = {
        /**
         * Plugin initialization
         */
        init: function() {
            this.slides = this.elem.find('.' + this.params.slideClass);
            this.slider = this.slides.closest('ul');
            this.params.tabsActiveClass = this.params.tabsElems == null ? null : this.params.tabsElems.attr('class') + '_active';


            this.isSliding = false; //true if slides are animating
            this.isStop = true;     //true if auto sliding was stopped manually
            this.interval = null;   //auto sliding timer

            //For touch events
            this.isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints > 0));
            this.isLongTouch = false;

            var _this = this;

            //set initial positions
            _this.slides.each(function(indx) {
                var $elem = $(this);
                $elem.css({'left':  (indx * 100 / _this.params.slidesPerPage).toFixed(2) + '%'});
            });
            _this.slider.css({'left': -_this.slides.width()*_this.params.activeIndx});

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
                var $firstActiveTab =  _this.params.tabsElems.parent().find('[data-index=' + _this.params.activeIndx + ']');
                $firstActiveTab.addClass(_this.params.tabsActiveClass);
            }

            if ($.isFunction(_this.params.afterSlide)) {
                _this.params.afterSlide(_this.params.activeIndx);
            }
        },

        /**
         * All events
         */
        attachEvents: function() {
            var _this = this;

            if (_this.slides.length - _this.params.slidesPerPage > 0 && _this.params.autoSlide) {
                _this.isStop = false;
                _this._autoSlideStart();
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

                        _this._slideTo(direction);

                        if (_this.params.autoSlide && !_this.isStop) {
                            _this._autoSlideStop();
                            _this._autoSlideStart();
                        }
                    }
                })
            }

            if (_this.params.autoSlide) {
                //Stop auto sliding on mouse enter event
                _this.slides.on('mouseenter', function () {
                    _this._autoSlideStop();
                })
                    .on('mouseleave', function () {
                        if (!_this.isStop) _this._autoSlideStart();
                    });
            }

            if(_this.params.tabs && _this.params.tabsElems != null) {
                _this.params.tabsElems.on('click', function(e) {
                    e.preventDefault();
                    var $tab = $(this);

                    if (!_this.isSliding && $tab.attr('class').indexOf('active') < 0) {
                        var newIndex = $tab.attr('data-index'),
                            direction = 'next';

                        if (typeof newIndex != 'undefined' && _this.slides.eq(newIndex).length) {
                            if (_this.params.activeIndx - newIndex > 0) {
                                direction = 'prev';
                            }
                            _this.params.activeIndx = newIndex;
                            _this._slideTo(direction);

                            if (_this.params.autoSlide && !_this.isStop) {
                                _this._autoSlideStop();
                                _this._autoSlideStart();
                            }
                        }
                    }
                });
            }

            if (_this.isTouch) {
                _this.slides.on('touchstart', function (e) {
                    if (!_this.isSliding) {
                        _this._touchStart(e);
                    }
                })
                    .on('touchmove', function (e) {
                        _this._touchMove(e);
                    })
                    .on('touchend', function (e) {
                        _this._touchEnd(e);
                    })
            }

            $(window).resize(function() {
                _this.slider.css({
                    'left': -_this.slides.width()*_this.params.activeIndx,
                    'transitionDuration': '0ms'
                });
            });
        },

        /**
         * Start auto sliding
         * @bublic
         */
        start: function() {
            var _this = this;
            _this.isStop = false;
            _this._autoSlideStart();
        },

        /**
         * Stop auto sliding
         * @bublic
         */
        stop: function() {
            var _this = this;
            _this.isStop = true;
            _this._autoSlideStop();
        },

        /**
         * Start auto sliding
         * @private
         */
        _autoSlideStart: function() {
            var _this = this;
            if(_this.interval) return;
            _this.interval = setInterval(function() {
                if (_this.slides.eq(parseInt(_this.params.activeIndx) + 1).length) {
                    _this.params.activeIndx ++
                } else {
                    _this.params.activeIndx = 0
                }
                _this._slideTo('next');
            }, _this.params.timerTime);
        },

        /**
         * Stop auto sliding
         * @private
         */
        _autoSlideStop: function() {
            var _this = this;
            if(!_this.interval) return;
            clearInterval(_this.interval);
            _this.interval = null;
        },

        /**
         * In which way slider should go
         * @param direction
         * @private
         */
        _slideTo: function(direction) {
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

            if(_this.params.tabs && _this.params.tabsElems != null) {
                _this.params.tabsElems.filter('.' + _this.params.tabsActiveClass).removeClass(_this.params.tabsActiveClass);
            }

            setTimeout(function() {
                if (_this.slides.length > 1) {
                    $activeSlide.removeClass(_this.params.slideClass + '_active');
                }
                if(_this.params.tabs && _this.params.tabsElems != null) {
                    _this.params.tabsElems.filter('[data-index=' + _this.params.activeIndx + ']').addClass(_this.params.tabsActiveClass);
                }
                if ($.isFunction(_this.params.afterSlide)) {
                    _this.params.afterSlide(_this.params.activeIndx);
                }

                _this.isSliding = false;
            }, _this.params.animationTime);
        },

        /**
         * Touch events
         */
        _touchStart: function(e) {
            var _this = this;

            _this.isLongTouch = false;
            setTimeout(function () {
                _this.isLongTouch = true;
            }, 250);

            _this.touchStartX = e.originalEvent.touches[0].pageX;
        },

        _touchMove: function(e) {
            var _this = this;
            _this.touchMoveX = e.originalEvent.touches[0].pageX;
        },

        _touchEnd: function (e) {
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
                _this._slideTo(direction);
            }
        }
    };


    $.fn[pluginName] = function (params) {

        if (params === 'undefined' || typeof params === 'object' || typeof params === 'undefined') {
            //Создаем новый экземпляр объекта плагина,
            //если ранее плагин на этом объекте не был инициализирован
            return this.each(function() {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new UsualSlider(this, params));
                }
            });
        } else if (typeof params === 'string' && params[0] !== '_' && params !== 'init') {
            //Вызываем публичный метод
            if (Array.prototype.slice.call(arguments, 1).length == 0 && $.inArray(params, $.fn[pluginName].getters)) {
                //Если нет параметров или вызван метод-геттер,
                // то возвращаем значение, вместо ссылки на элемент
                var instance = $.data(this[0], 'plugin_' + pluginName);
                return instance[params].apply(instance, Array.prototype.slice.call(arguments, 1));
            } else {
                //Вызов обычного публичного метода
                return this.each(function() {
                    var instance = $.data(this, 'plugin_' + pluginName);
                    if (instance instanceof UsualSlider && typeof instance[params] === 'function') {
                        instance[params].apply(instance, Array.prototype.slice.call(arguments, 1));
                    }
                });
            }
        }
    }

    //Методы - геттеры
    $.fn[pluginName].getters = [];

})(jQuery, undefined, document);

/**
 * Main.js
 */
(function() {
	//Basic usage
	$('.slider_1').jUsualSlider();

	//Add navigation & change timer and animation time value
	$('.slider_2').jUsualSlider({
        slideClass: 'slider__item',
        btns: $('.slider_2 .slider__nav'),
        timerTime: 10000,
        animationTime: 400,
        tabs: true,
        tabsElems: $('.slider_2 .slider__tabs__item')
    });

    //Change slides count per page & show callback 'afterSlide' & disable auto sliding & change start position
    $('.slider_3').jUsualSlider({
        slideClass: 'slider__item',
        btns: $('.slider_3 .slider__nav'),
        activeIndx: 4,
        slidesPerPage: 4,
        autoSlide: false,
        afterSlide: function(indx) {
            $('.slider_3 .slider__info').text('Slide ' + (indx + 1))
        }
    });

    //Show public methods 'stop' and 'start' to manipulate auto sliding
    $('.slider_4').jUsualSlider({
        slideClass: 'slider__item',
        btns: $('.slider_4 .slider__nav'),
        timerTime: 2000
    });

    $('.slider-control_4').on('click', function(e) {
        e.preventDefault();
        var $btn = $(this),
            slider4 = $('.slider_4');

        if ($btn.hasClass('slider-control_stop')) {
            slider4.jUsualSlider('stop');
        } else if ($btn.hasClass('slider-control_start')) {
            slider4.jUsualSlider('start');
        }
    })
})();
