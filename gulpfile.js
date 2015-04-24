/*jslint node: true */
'use strict';

var fs = require('fs'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    plugins = require('gulp-load-plugins')(),
    sgc = require('./index');

var config = {
	root: '',
	tests: 'tests',
	sass: '_source/sass',
	css: '_client/css',
	partials: 'partials'
};

/* creds are used for the table of contents in the main scss file generated */
var creds = {
	Site: 'Code Computerlove',
	Author: 'Andrew Brandwood'
}


/* ============================================================ *\
    SCRIPTS / JS
\* ============================================================ */

gulp.task('scripts:lint', function () {
	gulp.src([config.js_file, config.tests + '/**/*.js'])
			.pipe(plugins.jshint());
});

gulp.task('sass-generate-contents', function(){
	gulp.src([config.sass + '/**/*.scss', config.partials + '/**/*.scss'])
	.pipe(sgc(config.sass + '/_main.scss', creds))
	.pipe(gulp.dest(config.sass));
});


/* ============================================================ *\
    MAIN TASKS
\* ============================================================ */

gulp.task('watch', function () {
	gulp.watch([config.js_file, config.tests + '/**/*.js']);
});

gulp.task('default', ['sass-generate-contents']);
