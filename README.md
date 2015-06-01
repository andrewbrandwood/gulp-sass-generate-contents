
# gulp-sass-generate-contents <a href="https://travis-ci.org/andrewbrandwood/gulp-sass-generate-contents"><img align="right" src="https://travis-ci.org/andrewbrandwood/gulp-sass-generate-contents.svg?branch=master" alt="Build status" /></a>
Gulp plugin to generate an imports file with a  table of contents 

This plugin was written to help with large scale website builds that use a CSS preprocessor and Gulp as a task runner.

It's purpose is to create a master SASS file to hold the css @imports of all the specified SASS files.  It also generates a list of contents of all SASS files with a description (<sup>*</sup>manual).

The contents are generated from the first line of each individual SASS file.

<sup>*</sup> The plugin requires a comment at the top of each SASS file formatted starting with // (double slash). The task will ignore files if they don't follow this format.

### Install 
```
npm install gulp-sass-generate-contents

```

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
var gsgc = require('gulp-sass-generate-contents');
var creds = {
	"Author": 	"Andrew Brandwood",
	"Website": 	"www.Brandwood.com"
}
// *creds are optional*

// Gulp task

gulp.task('gulp-sass-generate-contents', function () {
	gulp.src(['sass/**/*.scss','partials/**/*.scss'])
	.pipe(gsgc('css/main.scss', creds))
	.pipe(gulp.dest('css'));
});

```
### Example of Output
Based on Harry Roberts' @csswizardry ITCSS - 
[Link to Harry explaining the concept to creative block](http://www.creativebloq.com/web-design/manage-large-scale-web-projects-new-css-architecture-itcss-41514731)

```
/*------------------------------------*\
    
    #MAIN
    Site:   www.brandwood.com
    Author: Andrew Brandwood

\*------------------------------------*/

/**
 * CONTENTS
 *
 * SETTINGS
 * Config...............Configuration and environment settings.
 * Global...............Globally-available variables and settings/config.
 * Colors...............Manage our color palette in isolation.
 *
 * TOOLS
 * Functions............Some simple helper functions.
 * Mixins...............Globally available mixins.
 * Aliases..............Some shorter aliases onto longer variables.
 *
 * GENERIC
 * Normalize.css........A level playing field.
 * Box-sizing...........Better default `box-sizing`.
 * Reset................A pared back reset to remove margins.
 * Shared...............Sensibly and tersely share global commonalities.
 *
 * ELEMENTS
 * Page.................Page-level styles (HTML element).
 * Headings.............Heading styles.
 * Links................Hyperlink styles.
 * Lists................Default list styles.
 * Images...............Base image styles.
 * Quotes...............Styling for blockquotes, etc.
 *
 * OBJECTS
 * Wrappers.............Wrappers and page constraints.
 * Layout...............Generic layout module.
 * Headline.............Simple object for structuring heading pairs.
 * Media................The media object.
 * List-inline..........Simple abstraction for setting lists out in a line.
 *
 * COMPONENTS
 * Page-head............Page header styles.
 * Page-foot............Page footer styles.
 * Logo.................Make our logo a reusable component.
 * Nav primary..........The site’s main nav.
 * Nav secondary........Secondary nav styles.
 * Masthead.............Site’s main masthead.
 * Panel................Simple panelled boxout.
 * Score................Score lozenge for place ratings.
 * Buttons..............Button styles.
 * Avatar...............General avatar styles.
 * Testimonial..........Quote styles.
 * Calendar.............Simple static calendar component.
 * Headline.............Basic heading style for generic headlines.
 * Promo................Promotional box styling.
 *
 * SCOPES
 * Prose................Set up a new styling context for long-format text.
 *
 * TRUMPS
 * Headings.............Assigning our heading styles to helper classes.
 * Widths...............Simple width helper classes.
 */





@import "settings.config";
@import "settings.global";
@import "settings.colors";

@import "tools.functions";
@import "tools.mixins";
@import "tools.typography";
@import "tools.aliases";

@import "generic.normalize";
@import "generic.box-sizing";
@import "generic.reset";
@import "generic.shared";

@import "elements.page";
@import "elements.headings";
@import "elements.links";
@import "elements.lists";
@import "elements.images";
@import "elements.quotes";

@import "objects.wrappers";
@import "objects.layout";
@import "objects.headline";
@import "objects.media";
@import "objects.list-inline";

@import "components.page-head";
@import "components.page-foot";
@import "components.logo";
@import "components.nav-primary";
@import "components.nav-secondary";
@import "components.masthead";
@import "components.panel";
@import "components.score";
@import "components.buttons";
@import "components.avatar";
@import "components.testimonials";
@import "components.calendar";
@import "components.headline";
@import "components.promo";

@import "scope.prose";

@import "trumps.headings";
@import "trumps.widths";
```