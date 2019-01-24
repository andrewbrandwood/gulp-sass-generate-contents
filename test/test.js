/* global describe, it */

'use strict';

var assert = require('stream-assert');
var should = require('should');
var gulp = require('gulp');
var config = require('../_config/project.json');
var creds = require('../_config/creds');
var readFiles = require('read-vinyl-file-stream');
var mockery = require('mockery');


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

function gulpTestRunner(runconfig, gsgc) {
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
    var gsgc;
    let logText = '';
    let logCalled = false;

    const testLog = {
        warn: function(logString) {
            logCalled = true;
            logText = logString;
            return;
        }
    };

    before(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        mockery.registerMock('fancy-log', testLog);
        gsgc = require('../index');
    })

    after(function() {
        mockery.disable();
    });

    it('should emit error on streamed file', function (done) {
        gulp.src([getStylePath('/**/*.scss'), config.dirs.components + '/**/*.scss'], { buffer: false })
        .pipe(gsgc(getStylePath('/_main.scss'), creds))
        .on('error', function (err) {
          err.message.should.eql('Streaming not supported');
          done();
        });
    });

    it('should ignore null files', function (done) {
        gulp.src([getStylePath('/phantom-file.scss')], { allowEmpty: true })
        .pipe(gsgc(getStylePath('/_main.scss'), creds))
        .pipe(assert.length(0))
        .pipe(assert.end(done))
    });

    it('should allow a file with no comments', function(done) {
        gulpTestRunner({
            src: '/**/*.scss',
            dest: '/_allow-blank-comments.scss',
            settings: { forceComments: false },
            assertion: function (fileContent) {
                fileContent.should.containWithin('no-comments-file.scss');
            }
        }, gsgc)
        .pipe(assert.end(done));
    });

    it('should warn if a file has no comments', function(done) {
        const testMessage = 'sass-generate-contents Comments missing or malformed in file: no-comments-file.scss - File not included';

        logText = '';
        logCalled = false;

        gulp.src([getStylePath('/components/*.scss')])
            .pipe(gsgc(getStylePath('/_require-comments.scss'), creds, { forceComments: true }))
            .on('end', () => {
                logCalled.should.be.true;
                testMessage.should.eql(logText)
            })
            .pipe(assert.end(done))
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
        }, gsgc)
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
        }, gsgc)
            .pipe(assert.end(done));
    });

    it('should not output file extensions', function (done) {
        gulpTestRunner({
            src: '/components/_test.scss',
            dest: '/_no-extensions.scss',
            settings: { excludeExtension: true },
            assertion: function (fileContent) {
                fileContent.should.not.match(/@import "((?:\/|\\)[\w\W]+).scss";/gi);
            }
        }, gsgc)
            .pipe(assert.end(done));
    });

    it('should output file extensions', function (done) {
        gulpTestRunner({
            src: '/components/_test.scss',
            dest: '/_has-extensions.scss',
            settings: { excludeExtension: false },
            assertion: function (fileContent) {
                fileContent.should.match(/@import "((?:\/|\\)[\w\W]+).scss";/gi);
            }
        }, gsgc)
            .pipe(assert.end(done));
    });
});