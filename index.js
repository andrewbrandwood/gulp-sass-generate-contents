var through = require('through2');
var path = require('path');
var gulp = require('gulp');
var fs = require('fs');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;

// Consts
const PLUGIN_NAME = 'sass-generate-contents';

function sassGenerateContents(destFilePath, creds){

	var comments = '';
	var imports = '';
	var destFileName = getFileName(destFilePath);
	var newFile = createFile(destFilePath);	
	var importArr = [];
	var commentsArr = [];
	var creds = typeof creds === 'object' ? creds : {};

	function getSpacer(len, spacer, minWidth){
		var spaceArr = [];
		var mw = minWidth || 0;
		var len = len + mw;
		for(var i = 0; i < len; i++){
			spaceArr.push(spacer);
		}
		return spaceArr.join('');
	}

	function getLongest(propList){
		var longest = 0;
		for (var prop in propList){
			if (propList.hasOwnProperty(prop)) {
		    	var propLength = prop.length
		    	if(propLength > longest) {
		    		longest = propLength;
		    	}
		    }
		}
		return longest;
	}

	function createCreds(credsObj){
		
		var credStr = ['/* ============================================================ *\\\n'];
		credStr.push('  #MAIN\n')
		var count = 0;
		var credLongest = getLongest(credsObj);
		

		for (var cred in credsObj){
			if (credsObj.hasOwnProperty(cred)) {
		       
		       var val = credsObj[cred];
		       var credLength = cred.length;
		       var diff = credLongest - credLength;
		       var spacer = getSpacer(diff, ' ');
		       credStr.push('  ' + cred + ': ' + spacer + '' + val);
		       
		    }
		}
		credStr.push('\n/* ============================================================ *\\\n\n');

		return credStr;
	}

	function updateFile(newFile, imports, comments){
		// get the contents of the imports array
		if(importArr.indexOf(imports) < 0){
			//if the import doesn't exist add a new one
			importArr.push(imports);
		}
		//get the contents of the comments array
		if(commentsArr.indexOf(comments) < 0){
			//if the comments don't exist add new ones
			commentsArr.push(comments);
		}
		
		// build site credentials iff passed in
		var credsArr = createCreds(creds);

		//Hack - quick array splitter
		var startArr = ['/**\n* CONTENTS\n*'];
		var splitterArr = ['*\n*/\n\n\n\n'];
		var newContents = credsArr.concat(startArr, commentsArr, splitterArr, importArr).join('\n');

		newFile.contents = new Buffer(newContents);

		return;
	}

	function getFileName(filePath){
		return filePath.substring(filePath.length, filePath.lastIndexOf('/')+1);
	}

	function createFile(destFilePath){
		var base = destFilePath.substring(0,destFilePath.lastIndexOf('/')+1);
		var newFile = new gutil.File({
			cwd: '',
			base: '',
			path: destFilePath,
			contents: new Buffer('')
		});

		return newFile;
	}

	function getBase(filePath){
		return filePath.substring(0, filePath.lastIndexOf('/'));
	}


	/* main function */

	function buildString(file, enc, cb){
	
		var fileName = getFileName(file.path);
		//don't read the destination path (if in same folder)
		if (fileName === destFileName) {
			cb();
			return;
		}

		if (file.isNull()) {
			cb();
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}

		var content = file.contents.toString('utf8'),
			relPath = file.path.replace(file.cwd,'');
		comments = content.split('\n')[0]
		if(comments.charAt(0) !== '/' && comments.charAt(1) !== '/'){
			process.stdout.write(PLUGIN_NAME + ' Comments missing from file: ' + fileName + ' - File not included\n');
			return cb();
		}
		comments.replace('//', '* ');
		imports = '@import "' + relPath + '"';

		updateFile(newFile, imports, comments);
		//set the destination based on the file path
		//this.pipe(gulp.dest('.' + getBase(destFilePath) + '/'));
		this.push(newFile);
		return cb();
	};

	return through.obj(buildString);
}

module.exports = sassGenerateContents;
