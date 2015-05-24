/*jslint node: true */
'use strict';

var fs = require('fs'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    plugins = require('gulp-load-plugins')(),
    config = require('./_config/project.json'),
    creds = require('./_config/creds'),
    sgc = require('./index');

/* ============================================================ *\
    SCRIPTS / JS
\* ============================================================ */

gulp.task('scripts:lint', function () {
	gulp.src([config.js_file, config.tests + '/**/*.js'])
			.pipe(plugins.jshint());
});

gulp.task('sass-generate-contents', function(){
	gulp.src([config.src + '/' + config.dirs.styles + '/**/*.scss', config.dirs.partials + '/**/*.scss'])
	.pipe(sgc(config.src + '/' + config.dirs.styles + '/_main.scss', creds))
	.pipe(gulp.dest(config.src + '/' + config.dirs.styles));
});


/* ============================================================ *\
    MAIN TASKS
\* ============================================================ */

gulp.task('watch', function () {
	gulp.watch([config.js_file, config.tests + '/**/*.js']);
});

gulp.task('default', ['sass-generate-contents']);
