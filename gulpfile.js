var gulp = require('gulp'),
	less = require('gulp-less'),
	rename = require('gulp-rename'),
	clean = require('gulp-clean'),
	concat = require('gulp-concat'),
	cache = require('gulp-cache'),
	watch = require('gulp-watch'),
	autoprefixer = require('gulp-autoprefixer');

var src = {
	css: 'src/css/style.less',
	js: ['src/js/UsualSlider.js',
		'src/js/main.js']
};

//Compile Less
gulp.task('css', function () {
	return gulp.src(src.css)
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['last 2 versions', 'Explorer >= 8'],
			cascade: false
		}))
		.pipe(gulp.dest('css'));
});

//Concat js
gulp.task('js', function() {
	return gulp.src(src.js)
		.pipe(concat('main.js'))
		.pipe(gulp.dest('js'));
});

// Clean destination folders
gulp.task('clean', function() {
	return gulp.src(['css', 'js'], {read: false})
		.pipe(clean());
});

//Watch
gulp.task('watch', function() {
	gulp.watch('src/css/**/*.less', ['css']);
	gulp.watch('src/js/**/*.js', ['js']);
});

// Default task
gulp.task('default', ['clean'], function() {
	gulp.start('css', 'js');
});