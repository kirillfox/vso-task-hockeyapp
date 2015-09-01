#
#  Copyright (c) Microsoft. All rights reserved.  
#  Licensed under the MIT license. See LICENSE file in the project root for full license information.
#

param (
    [string]$apiToken,
    [string]$binaryPath,
    [string]$symbolsPath,
    [string]$notesPath,
    [string]$notes,
    [string]$mandatory,
    [string]$notify,
    [string]$tags,
    [string]$teams,
    [string]$users
)

echo "Entering HockyApp Task"
echo "apiToken = $apiToken"
echo "binaryPath = $binaryPath"
echo "symbolsPath = $symbolsPath"
echo "notesPath = $notesPath"
echo "notes = $notes"
echo "mandatory = $mandatory"
echo "notify = $notify"
echo "tags = $tags"
echo "teams = $teams"
echo "users = $users"   
  
$env:INPUT_apiToken = $apiToken
$env:INPUT_binaryPath = $binaryPath
$env:INPUT_symbolsPath = $symbolsPath
$env:INPUT_notesPath = $notesPath
$env:INPUT_notes = $notes
$env:INPUT_tags = $tags
$env:INPUT_teams = $teams
$env:INPUT_users = $users
If ($mandatory -eq "true") { $env:INPUT_mandatory = 1 }
If ($notify -eq "true") { $env:INPUT_notify = 1 }

node hockeyApp.js