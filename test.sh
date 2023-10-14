#!/bin/sh

set -eu


osascript <<EOF
	tell application "Contacts"
		activate
		set vCardText to (get vcard of every person in group "obsidian") as text
	end tell
EOF
