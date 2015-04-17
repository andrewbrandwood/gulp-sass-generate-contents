/*jslint node: true */
'use strict';

var fs = require('fs'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    plugins = require('gulp-load-plugins')(),
    sgc = require('./tasks/sass-generate-contents');

var config = {
	root: '',
	js_file: 'sass_compile_imports.js',
	tests: 'tests'
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
	gulp.src(config.tests + '/**/*.scss')
	.pipe(sgc('_main.scss', creds))
	.pipe(gulp.dest(config.tests));
});


/* ============================================================ *\
    MAIN TASKS
\* ============================================================ */

gulp.task('watch', function () {
	gulp.watch([config.js_file, config.tests + '/**/*.js']);
});

gulp.task('default', ['sass-generate-contents']);
