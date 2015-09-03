/*
  Copyright (c) Microsoft. All rights reserved.  
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/

var fs = require("fs");
var glob = require("glob");
var path = require("path");
var request = require("request");
var tl = require("vso-task-lib");
var zip = new require('node-zip')();

// Output all env variables
//for (var envName in process.env) {
//	console.log(envName + " = " + process.env[envName]);
//}

var hockyAppUploadUrl = "https://rink.hockeyapp.net/api/2/apps/upload";

var binaryPath = resolveGlobPath(tl.getPathInput("binaryPath", /*required=*/ true, /*check=*/ false));
var symbolsPath = resolveGlobPath(tl.getPathInput("symbolsPath", /*required=*/ false, /*check=*/ false));
var notesPath = resolveGlobPath(tl.getPathInput("notesPath", /*required=*/ false, /*check=*/ false));
var notes = tl.getInput("notes", /*required=*/ false);
var mandatory = tl.getInput("mandatory", /*required=*/ false) === "true";
var notify = tl.getInput("notify", /*required=*/ false) === "true";
var tags = tl.getInput("tags", /*required=*/ false);
var teams = tl.getInput("teams", /*required=*/ false);
var users = tl.getInput("users", /*required=*/ false);

binaryPath = checkAndFixFilePath(binaryPath, "symbolsPath");
symbolsPath = checkAndFixFilePath(symbolsPath, "symbolsPath");
notesPath = checkAndFixFilePath(notesPath, "notesPath");

if (symbolsPath && fs.lstatSync(symbolsPath).isDirectory()) {
	symbolsPath = packageSymbols(symbolsPath);
}

tl.debug("binaryPath: " + binaryPath || "");
tl.debug("symbolsPath: " + symbolsPath || "");
tl.debug("notesPath: " + notesPath || "");

var formData = {
	ipa: fs.createReadStream(binaryPath),
	dsym: symbolsPath ? fs.createReadStream(symbolsPath) : null,
	notes: notesPath ? fs.readFileSync(notesPath) : notes,
	notes_type: "1", // Markdown
	mandatory: mandatory ? "1" : "0",
	notify: notify ? "1" :"0",
	tags: tags,
	teams: teams,
	users: users,
	status: "2", // Available for download
	commit_sha: null, // TODO: Can we automatically retreive this info from tl?
	build_server_url: null, // TODO: Can we automatically retreive this info from tl?
	repository_url: null // TODO: Can we automatically retreive this info from tl?
};

// Remove any formData entries that has no value since request.post call doesn't like null values
for (var key in formData) {
	if (!formData[key]) {
		delete formData[key];
	}
}

request.post({
	url: hockyAppUploadUrl,
	headers: {
		"X-HockeyAppToken": tl.getInput("apiToken", true)
	},
	formData: formData
}, function (err, res, body) {
	if (!err && res.statusCode === 201) {
		tl.exit(0);
	} else {
		tl.error("Failed to upload the package. Status code = " + res.statusCode + ", err = " + (err ? err.message : "unknown"));
		tl.exit(1);
	}
});

function arePathEqual(p1, p2) {
	if (!p1 && !p2) return true;
	else if (!p1 || !p2) return false;
	else return path.normalize(p1 || "") === path.normalize(p2 || "");
}

function checkAndFixFilePath(p, name) {
	if (p) {
		if (arePathEqual(p, tl.getVariable("BUILD_SOURCEDIRECTORY")) || 
			arePathEqual(p, tl.getVariable("BUILD_SOURCESDIRECTORY"))) {
			// Path points to the source root, ignore it
			p = null;
		} else {
			// will error and fail task if it doesn't exist.
			tl.checkPath(p, name);
		}
	}
	
	return p;
}

function getAllFiles(rootPath, recursive) {
	var files = [];
	
	var folders = [];
	folders.push(rootPath);
	
	while (folders.length > 0) {
		var folderPath = folders.shift();
		
		var children = fs.readdirSync(folderPath);
		for (var i = 0; i < children.length; i++) {
			var childPath = path.join(folderPath, children[i]);
			if (fs.statSync(childPath).isDirectory()) {
				if (recursive) {
					folders.push(childPath);
				}
			} else {
				files.push(childPath);
			}
		}
	}
	
	return files;
}

function packageSymbols(symbolsPath) {
	var packageName = path.basename(symbolsPath) + ".zip"
	var packagePath = path.join(symbolsPath, "..", packageName);
	
	tl.debug("Creating a symbols package file: " + packagePath);
	
	var filePaths = getAllFiles(symbolsPath, /*recursive=*/ true);
	for (var i = 0; i < filePaths.length; i++) {
		var filePath = filePaths[i];
		var relativePath = path.relative(symbolsPath, filePath);
		zip.file(relativePath, fs.readFileSync(filePath));
	}
	
	var data = zip.generate({ base64: false, compression: 'DEFLATE' });
	fs.writeFileSync(packagePath, data, 'binary');
	
	return packagePath;
}

function resolveGlobPath(path) {
	if (path) {
		var filesList = glob.sync(path);
		if (filesList.length > 0) {
			path = filesList[0];
		}
	}
	
	return path;
}