/*
  Copyright (c) Microsoft. All rights reserved.  
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/

var path = require("path");
var request = require("request");
var tl = require("vso-task-lib");
var fs = require("fs");

var hockyAppUploadUrl = "https://rink.hockeyapp.net/api/2/apps/upload";

var binaryPath = tl.getPathInput("binaryPath", /*required=*/ true, /*check=*/ true);
var symbolsPath = tl.getPathInput("symbolsPath", /*required=*/ false, /*check=*/ false);
var notesPath = tl.getPathInput("notesPath", /*required=*/ false, /*check=*/ false);
var notes = tl.getInput("notes", /*required=*/ false);
var mandatory = tl.getInput("mandatory", /*required=*/ false);
var notify = tl.getInput("notify", /*required=*/ false);
var tags = tl.getInput("tags", /*required=*/ false);
var teams = tl.getInput("teams", /*required=*/ false);
var users = tl.getInput("users", /*required=*/ false);

symbolsPath = checkAndFixOptionalFilePath(symbolsPath);
notesPath = checkAndFixOptionalFilePath(notesPath);

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

// Remove any formData entries that has no value
for (var key in formData) {
	if (!formData[key])
		delete formData[key];
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
		tl.error("Failed to upload the package: " + err.message);
		tl.exit(1);
	}
});

function checkAndFixOptionalFilePath(path) {
	if (path) {
		if (fs.lstatSync(path).isDirectory()) {
			// Path doesn't point to a file
			path = null;
		} else if (!fs.existsSync(path)) {
			console.error('invalid path: ' + path);
			tl.exit(1);
		}
	}
	
	return path;
}