const through = require('through2');
const path = require('path');
const objectAssign = require('object-assign');
const log = require('fancy-log');
const Vinyl = require('vinyl');
const PluginError = require('plugin-error');

// Consts
const PLUGIN_NAME = 'sass-generate-contents';

const defaults = {
	forceComments: true,
	contentsTable: true,
	excludeExtension: false
};

function shouldIncludeImport(existingImports, newImport) {
	return existingImports.indexOf(newImport) < 0;
}

function getSpacer(length, spacer) {
	return spacer.repeat(length);
}

function getLongest(propList) {
	return Object.keys(propList).reduce(function(maxLength, currentProperty) {
		return maxLength > currentProperty.length ? maxLength : currentProperty.length
	}, 0);
}

function getSection(filePath){
	return path.parse(filePath).dir.split(path.sep).pop();
}

function getFileName(filePath) {
	return path.basename(filePath);
}

function createFile(destFileName, fileContent){
	return new Vinyl({
		cwd: '',
		path: destFileName,
		contents: Buffer.from(fileContent)
	});
}

function throwWarning(fileName) {
	log.warn(`${PLUGIN_NAME} Comments missing or malformed in file: ${fileName} - File not included`)
}

function generateImportString(filePath, excludeExtension) {
	if (excludeExtension) {
		const pathObject = path.parse(filePath);
		filePath = path.join(pathObject.dir, pathObject.name);
	}

	const pathArray = path.normalize(filePath).split(path.sep);

	return `'@import "${pathArray.join('/')}";`;
}

function getFileIntrocomment(file, forceComments) {
	const content = file.contents.toString('utf8');
	let comments = content.split('\n')[0];
	const firstChars = comments.charAt(0) + comments.charAt(1);

	if(String(firstChars) !== '//' && forceComments) {
		throw new Error();
	}

	if(String(firstChars) !== '//' && !forceComments) {
		comments = '* ';
	}

	comments = comments.replace('//', '* ');

	return comments;
}

function createCreds(credsObj){
	if(!credsObj) {
		return [];
	}

	const credArray = ['/* ============================================================ *\\\n'];
	credArray.push('  #MAIN\n');
	const credLongest = getLongest(credsObj);

	for (let cred in credsObj){
		if (credsObj.hasOwnProperty(cred)) {
			const spacer = getSpacer(credLongest - cred.length, ' ');
			credArray.push(`  ${cred}: ${spacer}${credsObj[cred]}`);
		}
	}
	credArray.push('\n/* ============================================================ */\n');

	return credArray;
}

function constructOutput(imports, creds, comments, contentsTable){
	// build site credentials if passed in
	const credsArr = createCreds(creds);

	// Add the comments to the top of the file if required
	if(contentsTable) {
		credsArr.push('/**\n* CONTENTS');
		credsArr.concat(comments);
		credsArr.push('*\n*/\n\n\n\n');
	}

	// Return the generated file string
	return credsArr.concat(imports).join('\n');
}

function sassGenerateContents(destFilePath, credsSettings, options){
	const opts = objectAssign(defaults, options);
	const destFileName = getFileName(destFilePath);
	const currentSection = '';
	const importArr = [];
	const commentsArr = [];
	const creds = typeof credsSettings === 'object' ? credsSettings : {};

	function addSection(currentFilePath) {
		const section = getSection(currentFilePath);
		if (section !== currentSection) {
			currentSection = section;
			commentsArr.push('* \n* ' + currentSection.toUpperCase());
		}
	}

	function addImportToList(currentFilePath, file, fileName, opts) {
		const importString = generateImportString(currentFilePath, opts.excludeExtension);

		// Check if this import has already been included
		if (shouldIncludeImport(importArr, importString)) {

			try {
				if(opts.contentsTable) {
					const comment = getFileIntrocomment(file, opts.forceComments);
					// Add a section to the comments if needed
					addSection(currentFilePath);
		
					// Add the comment to the group
					commentsArr.push(comment);
				}

				//if the import doesn't exist add a new one
				importArr.push(importString);
			} catch (error) {
				// Comment errored so don't bother adding to the imports and warn about it
				throwWarning(fileName);
			}
		}
	}


	/* main function */

	function buildString(file, enc, cb) {
		const currentFilePath = file.path;
		const fileName = getFileName(currentFilePath);

		//don't read the destination path (if in same folder)
		if (fileName === destFileName || file.isNull()) {
			cb();
			return;
		}

		if (file.isStream()) {
			cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}

		addImportToList(currentFilePath, file, fileName, opts);
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
			constructOutput(importArr, creds, commentsArr, opts.contentsTable)
		));

		cb();
	}

	return through.obj(buildString, onStreamEnd);
}

module.exports = sassGenerateContents;
