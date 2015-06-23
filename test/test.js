/* global describe, it */

'use strict';

var assert = require('stream-assert'),
    es = require('event-stream'),
    should = require('should'),

    gulp = require('gulp'),
    gutil = require('gulp-util'),
    File = gutil.File,
    PassThrough = require('stream').PassThrough,
    config = require('../_config/project.json'),
    creds = require('../_config/creds'),
    gsgc = require('../index');


describe('gulp-sass-generate-contents', function() {
    it('should emit error on streamed file', function (done) {
        gulp.src([config.src + '/' + config.dirs.styles + '/**/*.scss', config.dirs.components + '/**/*.scss'], { buffer: false })
        .pipe(gsgc(config.src + '/' + config.dirs.styles + '/_main.scss', creds))
        .on('error', function (err) {
          err.message.should.eql('Streaming not supported');
          done();
        });
    });

    it('should ignore null files', function (done) {
        gulp.src([config.src + '/' + config.dirs.styles + '/phantom-file.scss'])
        .pipe(gsgc(config.src + '/' + config.dirs.styles + '/_main.scss', creds))
        .pipe(assert.length(0))
        .pipe(assert.end(done))
        .write(new File());
    });

    it('should allow a file with no comments', function(done){

        var testText = 'no-comments-file.scss';
        var testFile = config.src + '/' + config.dirs.styles + '/**/*.scss';
        var generatedFile = config.src + '/' + config.dirs.styles + '/_main.scss';

        gulp.src([testFile])
        .pipe(gsgc(generatedFile, creds, { forceComments: false }))
        .pipe(gulp.dest(config.src + '/' + config.dirs.styles))
        .on('end', function(callback){
            var hasFile = 0,
            fs = require('fs');
            fs.readFile(generatedFile, 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }

                if(data.indexOf(testText) > 0){
                    hasFile = 1;
                }

                hasFile.should.be.exactly(1);
                done();
                
            });

            

        });
    });

});