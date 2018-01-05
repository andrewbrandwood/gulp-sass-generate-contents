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
    gsgc = require('../index'),
    readFiles = require('read-vinyl-file-stream');

should.Assertion.add('containWithin', function (matchString) {
    this.params = { operator: 'to contain', expected: matchString};

    should(this.obj.indexOf(matchString)).be.above(0);
});

function prepTestSrc(paths) {
    paths = Array.isArray(paths) ? paths : [paths];

    return paths.map(function (currentPath) {
        return getStylePath(currentPath);
    })
}

function gulpTestRunner(runconfig) {
    runconfig.dest = getStylePath(runconfig.dest);
    runconfig.src = prepTestSrc(runconfig.src);

    return gulp.src(runconfig.src)
        .pipe(gsgc(runconfig.dest, creds, runconfig.settings))
        // Uncomment if you need to generate the files to debug
        // .pipe(gulp.dest(config.src + '/' + config.dirs.styles))
        .pipe(readFiles(function (content, file, stream, cb) {
            runconfig.assertion(content);
            cb(null, content);
        }));
}

function getStylePath(filename) {
    return config.src + '/' + config.dirs.styles + filename;
}

describe('gulp-sass-generate-contents', function() {
    it('should emit error on streamed file', function (done) {
        gulp.src([getStylePath('/**/*.scss'), config.dirs.components + '/**/*.scss'], { buffer: false })
        .pipe(gsgc(getStylePath('/_main.scss'), creds))
        .on('error', function (err) {
          err.message.should.eql('Streaming not supported');
          done();
        });
    });

    it('should ignore null files', function (done) {
        gulp.src([getStylePath('/phantom-file.scss')])
        .pipe(gsgc(getStylePath('/_main.scss'), creds))
        .pipe(assert.length(0))
        .pipe(assert.end(done))
        .write(new File());
    });

    it('should allow a file with no comments', function(done) {
        gulpTestRunner({
            src: '/**/*.scss',
            dest: '/_allow-blank-comments.scss',
            settings: { forceComments: false },
            assertion: function (fileContent) {
                fileContent.should.containWithin('no-comments-file.scss');
                }
        })
            .pipe(assert.end(done));
    });

    it('should output table of contents comment block', function (done) {
        gulpTestRunner({
            src: [
                '/components/_test.scss',
                '/components/_test2.scss'
            ],
            dest: '/_has-contents-table.scss',
            settings: { contentsTable: true },
            assertion: function (fileContent) {
                fileContent.should.containWithin('* CONTENTS');
            }
        })
            .pipe(assert.end(done));
            });

    it('should not output table of contents comment block', function (done) {
        gulpTestRunner({
            src: [
                '/components/_test.scss',
                '/components/_test2.scss'
            ],
            dest: '/_no-contents-table.scss',
            settings: { contentsTable: false },
            assertion: function (fileContent) {
                fileContent.should.not.containWithin('* CONTENTS');
            }
        })
            .pipe(assert.end(done));
    });

                if (err) {
                    return console.log(err);
                }

                if(data.indexOf(testText) > 0){
                    hasTestText = 1;
                }

                hasTestText.should.be.exactly(1);
                done();
                
            });
        });
    });

    it('should not output table of contents comment block', function (done) {

        var testText = '* CONTENTS';
        var testFiles = [
            config.src + '/' + config.dirs.styles + '/components/_test.scss',
            config.src + '/' + config.dirs.styles + '/components/_test2.scss'
        ];
        var generatedFile = config.src + '/' + config.dirs.styles + '/_no-contents-table.scss';

        gulp.src(testFiles)
        .pipe(gsgc(generatedFile, creds, { contentsTable: false }))
        .pipe(gulp.dest(config.src + '/' + config.dirs.styles))
        .on('end', function(callback){
            var hasTestText = 0,
                fs = require('fs');
            fs.readFile(generatedFile, 'utf8', function (err,data) {

                if (err) {
                    return console.log(err);
                }

                if(data.indexOf(testText) < 0){
                    hasTestText = 1;
                }

                hasTestText.should.be.exactly(1);
                done();
                
            });
        });
    });

});