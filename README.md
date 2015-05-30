<a href="https://travis-ci.org/andrewbrandwood/sass-generate-contents"><img align="right" src="https://travis-ci.org/andrewbrandwood/sass-generate-contents.svg?branch=master" alt="Build status" /></a>

# sass-generate-contents
Gulp plugin to generate an imports file with a  table of contents

This plugin was written to help with large scale website builds that use a CSS preprocessor.

It's purpose is to create a master SASS file to hold the css @imports of all the specified SASS files.

It also generates a list of contents decribing each SASS file.

The contents are generated from the first line of each individual SASS file.

The plugin requires a comment at the top of each SASS file formatted starting with // (double slash).

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
