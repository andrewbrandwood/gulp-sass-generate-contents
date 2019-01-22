var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var objectAssign = require('object-assign');

// Consts
const PLUGIN_NAME = 'sass-generate-contents';

var defaults = {
	forceComments: true,
	contentsTable: true,
	excludeExtension: false
};

function shouldIncludeImport(existingImports, newImport) {
	return existingImports.indexOf(newImport) < 0;
}

function getSpacer(len, spacer, minWidth){
	var spaceArr = [];
	var mw = minWidth || 0;
	var len = len + mw;
	for(var i = 0; i < len; i++){
		spaceArr.push(spacer);
	}

	return spaceArr.join('');
}

function getLongest(propList) {
	return Object.keys(propList).reduce(function(maxLength, currentProperty) {
		return maxLength > currentProperty.length ? maxLength : currentProperty.length
	}, 0);
}

function getSection(filePath){
	var fileDirArray = path.parse(filePath).dir.split(path.sep);

	return fileDirArray[fileDirArray.length - 1];
}

function getFileName(filePath) {
	return path.basename(filePath);
}

function createFile(destFileName, fileContent){
	return new gutil.File({
		cwd: '',
		base: '',
		path: destFileName,
		contents: Buffer.from(fileContent)
	});
}

function throwWarning(fileName){
	gutil.log(PLUGIN_NAME + ' Comments missing or malformed in file: ' + fileName + ' - File not included\n');
}

function generateImportString(filePath, excludeExtension) {
	if (excludeExtension) {
		var pathObject = path.parse(filePath);
		filePath = path.join(pathObject.dir, pathObject.name);
	}

	var pathArray = path.normalize(filePath).split(path.sep);

	return '@import "' + pathArray.join('/') + '";';
}

function sassGenerateContents(destFilePath, creds, options){

	var opts = objectAssign(defaults, options);
	var imports = '';
	var destFileName = getFileName(destFilePath);
	var currentFilePath = '';
	var currentSection = '';
	var importArr = [];
	var commentsArr = [];
	var creds = typeof creds === 'object' ? creds : {};


	function createCreds(credsObj){

		if(!credsObj) {
			return;
		}

		var credStr = ['/* ============================================================ *\\\n'];
		credStr.push('  #MAIN\n');
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
		credStr.push('\n/* ============================================================ */\n');

		return credStr;
	}

	function addSection(currentFilePath) {
		var section = getSection(currentFilePath);
		if (section !== currentSection) {
			currentSection = section;
			commentsArr.push('* \n* ' + currentSection.toUpperCase());
		}
	}

	function addImportToList(importString, comment, currentFilePath) {
		// Check if this import has already been included
		if (shouldIncludeImport(importArr, importString)) {
			//if the import doesn't exist add a new one
			importArr.push(importString);

			// Add a section to the comments if needed
			addSection(currentFilePath);

			// Add the comment to the group
			commentsArr.push(comment);
		}
	}

	function constructOutput(imports, comments){

		// build site credentials iff passed in
		var credsArr = createCreds(creds);

		//Hack - quick array splitter
		var startArr = ['/**\n* CONTENTS'];
		var splitterArr = ['*\n*/\n\n\n\n'];
		var newContents;
		if(opts.contentsTable) {
			newContents = credsArr.concat(startArr, comments, splitterArr, imports).join('\n');
		} else {
			newContents = credsArr.concat(imports).join('\n');
		}

		return newContents;
	}


	/* main function */

	function buildString(file, enc, cb){

		currentFilePath = file.path;

		var fileName = getFileName(currentFilePath);

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

		var content = file.contents.toString('utf8');

		var comments = content.split('\n')[0];
		var firstChars = comments.charAt(0) + comments.charAt(1);
		if(String(firstChars) !== '//' && opts.forceComments){
			throwWarning(fileName);
			return cb();
		}

		if(String(firstChars) !== '//' && !opts.forceComments){
			comments = '* ';
		}

		comments = comments.replace('//', '* ');

		imports = generateImportString(currentFilePath, opts.excludeExtension);

		addImportToList(imports, comments, currentFilePath);

		return cb();
	};

	function onStreamEnd(cb) {
		// Check that we actually have any imports
		if (!importArr.length) {
			cb();
			return;
		}

		// Create the file buffer to pass on down the stream
		this.push(createFile(
			destFileName,
			constructOutput(importArr, commentsArr)
		));

		cb();
	}

	return through.obj(buildString, onStreamEnd);
}

module.exports = sassGenerateContents;
