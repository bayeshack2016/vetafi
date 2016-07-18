'use strict';
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var args   = require('yargs').argv;
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var order = require('gulp-order');
var del = require('del');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var runSequence = require('run-sequence');

var release = args.release ? true : false;

gulp.task('clean', function() {
	return del.sync('build');
});

gulp.task('js', function() {
  return gulp.src('src/js/*.js')
    .pipe(concat('main.js'))
    .pipe(gulpif(release, uglify())) // only minify if production (gulp --release)
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream());
});
gulp.task('other-js', function() {
	return gulp.src('src/js/other/**/*.js')
		.pipe(gulpif(release, uglify())) // only minify if production (gulp --release)
		.pipe(gulp.dest('build/js'))
		.pipe(browserSync.stream());
});

gulp.task('stylus', function() {
  return gulp.src('src/styles/*.styl')
    .pipe(stylus({
        'include css': true
    }))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream());
});

gulp.task('jade', function() {
  return gulp.src('src/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
});

gulp.task('libs', function() {
  return gulp.src('src/libs/**/*')
    .pipe(order([
      "jquery-2.2.3.min.js",
      "lodash-v411-1.js",
      "angular.min.js",
      "angular-route.min.js"
    ]))
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('build/libs'));
});

gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
  	.pipe(gulp.dest('build/fonts'));
});

gulp.task('icons', function(){
  return gulp.src('src/icons/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin()))
  .pipe(gulp.dest('build/icons'))
});

gulp.task('initBrowserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'build'
    },
  })
});

gulp.task('watch', function () {
  gulp.watch('src/js/**/*.js', ['js', 'other-js']);
  gulp.watch('src/styles/*.styl', ['stylus']);
  gulp.watch('src/**/*.jade', ['jade']);
});

gulp.task('build', function() {
	runSequence('clean', ['fonts', 'icons'], 'libs', 'js', 'other-js', 'stylus', 'jade');
});

gulp.task('default', function() {
  runSequence('build', 'initBrowserSync', 'watch');
});
