'use strict';
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var bulkify = require('bulkify');
var pug = require('gulp-pug');
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
var eslint = require('gulp-eslint');
var bannerConfig = require('./bannerConfig');
var source = require('vinyl-source-stream');

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
    .pipe(sourcemaps.write());
});

gulp.task('stylus', function () {
  return gulp.src('src/styles/**/*')
    .pipe(stylus())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream())
    .pipe(sourcemaps.write());
});

gulp.task('pug', function () {
  return gulp.src('src/**/*.pug')
    .pipe(pug({
      data: {
        showBanner: bannerConfig.showBanner,
        bannerMessage: bannerConfig.bannerMessage
      }
    }))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream())
    .pipe(sourcemaps.write());
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
    .pipe(sourcemaps.write());
});

gulp.task('other-js', function () {
  return gulp.src('src/js/noangular/*.js')
    //.pipe(gulpif(release, uglify())) // only minify if production (gulp --release)
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream())
    .pipe(sourcemaps.write());
});

gulp.task('xhrEnv', function () {
  return gulpif(release,
      gulp.src('src/js/xhrEnv/xhrEnvRelease.js'),
      gulp.src('src/js/xhrEnv/xhrEnvDev.js'))
    .pipe(concat('xhrEnv.js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('js', ['xhrEnv'], function () {
  return gulp.src('src/js/*.js')
    .pipe(concat('main.js'))
    //.pipe(gulpif(release, uglify())) // only minify if production (gulp --release)
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream())
    .pipe(sourcemaps.write());
});

gulp.task('lint', ['xhrEnv'], function () {
  return gulp.src('src/js/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    //.pipe(eslint.failAfterError()) -- enable this when all code is correctly formatted
    ;
});

gulp.task('browserify', ['js'], function () {
  return browserify(['src/formly-fields.js'], {
      transform: [bulkify],
      debug: true
    })
    .bundle()
    .pipe(source('js/formly-fields.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('fonts', function () {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('icons', function () {
  return gulp.src('src/icons/**/*.+(png|jpg|gif|svg|ico)')
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
  gulp.watch('src/**/*.pug', ['pug']);
});

gulp.task('build', ['clean', 'fonts', 'icons', 'libs', 'xhrEnv', 'js', 'other-js', 'css-libs', 'stylus', 'pug', 'browserify', 'lint']);

gulp.task('default', ['clean', 'build', 'initBrowserSync', 'watch']);
