'use strict';
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var bulkify = require('bulkify');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var args = require('yargs').argv;
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var order = require('gulp-order');
var del = require('del');
var cache = require('gulp-cache');
var sourcemaps = require('gulp-sourcemaps');
var fs = require('fs');

var release = args.release ? true : false;
if (release) {
  console.log('Building in release!');
}

gulp.task('clean', function () {
  return del.sync('build');
});

gulp.task('css-libs', function() {
  return gulp.src('src/styles/libs/*.css')
    .pipe(concat('libs.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream())
    .pipe(gulpif(release, sourcemaps.write()));
});

gulp.task('stylus', function () {
  return gulp.src('src/styles/**/*')
    .pipe(stylus())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream())
    .pipe(gulpif(release, sourcemaps.write()));
});

gulp.task('jade', function () {
  return gulp.src('src/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream())
    .pipe(gulpif(release, sourcemaps.write()));
});

gulp.task('libs', function () {
  return gulp.src('src/libs/*.js')
    .pipe(order([
      "src/libs/jquery.js",
      "src/libs/bootstrap.js",
      "src/libs/lodash.js",
      "src/libs/angular.min.js",
      "src/libs/angular-ui-router.js",
      "src/libs/ui-bootstrap-tpls-2.1.3.js",
      "src/libs/signature_pad.js",
      "src/libs/signature-pad-angular.js",
      "src/libs/api-check.js",
      "src/libs/formly.js",
      "src/libs/angular-formly-templates-bootstrap.js",
      "src/libs/angular-momentjs-service.js",
      "src/libs/*.js"
    ], {base: './'}))
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('build/libs'))
    .pipe(gulpif(release, sourcemaps.write()));
});

gulp.task('other-js', function () {
  return gulp.src('src/js/noangular/*.js')
    .pipe(gulpif(release, uglify())) // only minify if production (gulp --release)
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream())
    .pipe(gulpif(release, sourcemaps.write()));
});

gulp.task('xhrEnv', function () {
  return gulpif(release,
      gulp.src('src/js/xhrEnv/xhrEnvRelease.js'),
      gulp.src('src/js/xhrEnv/xhrEnvDev.js'))
    .pipe(concat('xhrEnv.js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('js', function () {
  return gulp.src('src/js/*.js')
    .pipe(concat('main.js'))
    .pipe(gulpif(release, uglify())) // only minify if production (gulp --release)
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream())
    .pipe(gulpif(release, sourcemaps.write()));
});

gulp.task('browserify', ['js'], function () {
  return browserify(['src/formly-fields.js'], {
      transform: [bulkify],
      debug: true
    })
    .bundle()
    .pipe(fs.createWriteStream('build/js/main.js', {'flags': 'a'}));
});

gulp.task('fonts', function () {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('icons', function () {
  return gulp.src('src/icons/**/*.+(png|jpg|gif|svg)')
    .pipe(gulp.dest('build/icons'))
});

gulp.task('initBrowserSync', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: 'build'
    }
  })
});

gulp.task('watch', ['build', 'initBrowserSync'], function () {
  gulp.watch('src/js/*.js', ['js', 'other-js']);
  gulp.watch('src/styles/**/*.styl', ['stylus']);
  gulp.watch('src/**/*.jade', ['jade']);
});

gulp.task('build', ['clean', 'fonts', 'icons', 'libs', 'xhrEnv', 'js', 'other-js', 'css-libs', 'stylus', 'jade', 'browserify']);

gulp.task('default', ['clean', 'build', 'initBrowserSync', 'watch']);
