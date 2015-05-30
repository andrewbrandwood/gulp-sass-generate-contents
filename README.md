<a href="https://travis-ci.org/andrewbrandwood/sass-generate-contents"><img align="right" src="https://travis-ci.org/andrewbrandwood/sass-generate-contents.svg?branch=master" alt="Build status" /></a>

# sass-generate-contents
Gulp plugin to generate an imports file with a  table of contents

```javascript
gulp.task('sass-generate-contents', function(){
	gulp.src('css/**/*.scss')
	.pipe(sgc('_main.scss', creds))
	.pipe(gulp.dest('css'));
});
```
