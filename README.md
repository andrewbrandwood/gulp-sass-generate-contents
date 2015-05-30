
# sass-generate-contents <a href="https://travis-ci.org/andrewbrandwood/sass-generate-contents"><img align="right" src="https://travis-ci.org/andrewbrandwood/sass-generate-contents.svg?branch=master" alt="Build status" /></a>
Gulp plugin to generate an imports file with a  table of contents 

This plugin was written to help with large scale website builds that use a CSS preprocessor and Gulp as a task runner.

It's purpose is to create a master SASS file to hold the css @imports of all the specified SASS files.  It also generates a list of contents of all SASS files with a description (<sup>*</sup>manual).

The contents are generated from the first line of each individual SASS file.

<sup>*</sup> The plugin requires a comment at the top of each SASS file formatted starting with // (double slash).

The plugin will ignore any files that do not have this on the first line of the file to be imported.


### Example of SASS file to be imported

```SASS
// Navigation Primary ..... CSS styles for the primary navigation

.navigation-primary {
	background: red;
}

```

### Example of Gulp task

```javascript

// Settings 
var sgc = require('sass-generate-contents');
var creds = {
	"Author": 	"Andrew Brandwood",
	"Website": 	"www.Brandwood.com"
}
// *creds are optional*

// Gulp task

gulp.task('sass-generate-contents', function () {
	gulp.src(['sass/**/*.scss','partials/**/*.scss'])
	.pipe(sgc('css/main.scss', creds))
	.pipe(gulp.dest('css'));
});

```
