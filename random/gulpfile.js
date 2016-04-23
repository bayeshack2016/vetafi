var gulp = require('gulp'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    concat = require('gulp-concat'),
    useref = require('gulp-useref'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    livereload = require('gulp-livereload'),
    browserSync = require('browser-sync').create();

// Build JADE templates into HTML files
gulp.task('jade', function() {
    return gulp.src('src/**/*.jade')
        .pipe(jade()) 						// pipe to jade plugin
        .pipe(gulp.dest('build'))			// tell gulp our output folder
        .pipe(livereload()) 				// automatic live reload
        .pipe(browserSync.reload({			// browser-sync
      		stream: true
    	}));
});

// Build STYLUS files into one css file
gulp.task('styl', function() {
	return gulp.src(['src/**/*.styl', 'src/**/*.css'])
		.pipe(stylus())						// pipe to stylus plugin
        .pipe(concat('out.css'))			// append file name
        .pipe(gulp.dest('src'))		   // output folder
        .pipe(livereload())					// automatic live reload
        .pipe(browserSync.reload({			// browser-sync
      		stream: true
    	}));				
});

// Runs through HTML files to concatenate <script> tags
gulp.task('useref', function(){
  return gulp.src('src/**/*.html')
    .pipe(useref())
    .pipe(gulp.dest('build'));
});

// Pre-compiles javascript files for any errors
gulp.task('lint', function() {
  return gulp.src('src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Clean auto-generated files in directory
gulp.task('clean', function() {
  return del.sync('build');
});

// Move font files
gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('build/fonts'))
});

// Optimize images
gulp.task('images', function(){
  return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('dist/images'))
});


gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'build/templates'
    },
  })
});


gulp.task('watch', ['browserSync', 'jade', 'styl'], function() {
	// livereload.listen();
	gulp.watch('src/**/*.jade', ['jade']); 	// reloads browser when JADE files are edited
	gulp.watch('src/**/*.styl', ['styl']);  // reloads browser when STYLUS files are edited
});

gulp.task('update', ['lint', 'jade', 'styl']);
gulp.task('default', ['clean', 'watch']);
gulp.task('all', ['default', 'images']);
