/*
  Copyright (c) Microsoft. All rights reserved.  
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/

var path = require("path");
var request = require("request");
var tl = require("vso-task-lib");
var fs = require("fs");

var hockyAppUploadUrl = "https://rink.hockeyapp.net/api/2/apps/upload";

var binaryPath = tl.getInput("binaryPath", true);
var symbolsPath = tl.getInput("symbolsPath", false);
var notesPath = tl.getInput("notesPath", false);
var notes = tl.getInput("notes", false);
var mandatory = tl.getInput("mandatory", false);
var notify = tl.getInput("notify", false);
var tags = tl.getInput("tags", false);
var teams = tl.getInput("teams", false);
var users = tl.getInput("users", false);

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