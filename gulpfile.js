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
    MAIN TASKS
\* ============================================================ */

gulp.task('sass-generate-contents', function(){
	gulp.src([config.src + '/' + config.dirs.styles + '/**/*.scss', config.dirs.partials + '/**/*.scss'])
	.pipe(sgc(config.src + '/' + config.dirs.styles + '/_main.scss', creds))
	.pipe(gulp.dest(config.src + '/' + config.dirs.styles));
});


gulp.task('default', ['sass-generate-contents']);
