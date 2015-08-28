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
