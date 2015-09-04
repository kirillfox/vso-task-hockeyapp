# Visual Studio Online deployment task for HockeyApp

This task allows you to automate deployment to HockyApp from Visual Studio Online.

## Prerequisites

In order to deploy the task, you would need to install [tfx-cli](https://github.com/Microsoft/tfs-cli). 

## Deployment

Login to your VSO project through the tfx-cli.

Install the package using npm: 

```bash
npm install http://aka.ms/vsohockeytask
```

(<i>Alternatively, you can clone the repo and run ```npm install```)

Navigate to newly created directory (usually, node_modules/vso-hockyapp-task) and run the following command:

```bash
tfx build tasks upload ./ --overwrite
```

## Usage

Once deployed, you should see a new build step named "HockyApp" under the Deploy group inside Build Steps. After you add it, configure it with these values:

* <b>HockeyApp API token</b> - required, The API token generated from HockeyApp to authenticate your account.
* <b>App ID</b> - The ID of the app you’d like to upload a new build for. Leave empty to allow HockeyApp to infer the app ID automatically.
* <b>Binary File Path</b> - required, Path to the apk or ipa file you want to publish.
* <b>Symbols File Path</b> - Path to the dSYM folder (iOS) or mappings.txt file (Android) file you want to publish.
* <b>Release Notes (File)</b> - Path to the file where to get the release notes. If this is provided then 'Release notes' is ignored.
* <b>Release Notes</b> - What are the release notes for this app version.
* <b>Publish?</b> - Is this app downloadable by users?
* <b>Mandatory?</b> - Is this app mandatory by users?
* <b>Notify users?</b> - Would you like to notify your users that an update is available?
* <b>Tag(s)</b> - Restrict download to comma-separated list of tags.
* <b>Team(s)</b> - Restrict download to comma-separated list of team IDs; example: 12,23,34
* <b>User(s)</b> - Restrict download to comma-separated list of user IDs; example: 1234,5678
