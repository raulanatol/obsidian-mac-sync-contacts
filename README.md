# Obsidian mac sync contacts plugin

Sync contacts from your mac contacts app to obsidian, and push updates back the other way.

## Requirements

- **macOS only.** The plugin talks to Contacts.app through AppleScript (`osascript`), so it only works on the desktop app on macOS (`isDesktopOnly: true`) — it cannot run on mobile or other platforms.
- **Contacts access permission.** The first time you sync, macOS will prompt you to grant Obsidian access to your Contacts. You need to allow it for the plugin to work.
- **No third-party network calls.** All syncing happens locally between Contacts.app and your vault via AppleScript; the plugin does not send your data anywhere.

## Installation

Until the plugin is available in Obsidian's Community Plugins directory, install it manually:

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/raulanatol/obsidian-mac-sync-contacts/releases/latest).
2. Copy both files into `<your-vault>/.obsidian/plugins/obsidian-mac-sync-contacts/`.
3. Reload Obsidian and enable **Mac Sync Contacts** under Settings → Community plugins.

## Setup

1. In the plugin settings, set **Contacts folder** to the vault folder where notes should be written (default: `People`).
2. Optionally enable **Update contacts?** to overwrite existing notes when contacts change in Contacts.app. With this off, existing notes are left untouched.
3. Optionally enable **Group by first letter** to nest each note under a subfolder named after the first letter of the contact (e.g. `People/A/alejandro-fernandez.md`).
4. **Generate sync summary** is on by default — after each sync the plugin writes a `_sync-summary.md` inside the contacts folder listing what was created, updated, skipped or failed. Disable it in settings if you don't want it.
5. Click the contacts icon in the ribbon to run a sync. All contacts from macOS Contacts.app are imported.

The plugin adds three commands to the command palette (`Cmd+P`):

| Command                                     | Direction         | Scope             |
| -------------------------------------------- | ------------------ | ----------------- |
| *(ribbon icon)*                              | Mac → Obsidian     | All contacts       |
| **Sync active contact to Mac Contacts**      | Obsidian → Mac      | Currently open note |
| **Sync active contact from Mac Contacts**    | Mac → Obsidian     | Currently open note |

Filenames are always normalized to lowercase, hyphen-separated, ASCII-safe (e.g. `Álvaro Núñez` → `alvaro-nunez.md`).

## Template variables

| Variable                | Description                          | Example                           |
| ----------------------- | ------------------------------------ | --------------------------------- |
| `{{contactName}}`       | Name of the contact                  | John Doe                          |
| `{{contactNickname}}`   | Nickname of the contact              | Johnny                            |
| `{{contactUID}}`        | UID of the contact in Mac Contacts   | AB-CD-EF-12                       |
| `{{contactURL}}`        | Deep link to the contact in Contacts | addressbook://AB-CD-EF-12         |
| `{{contactEmail}}`      | First email of the contact           | john@doe.com                      |
| `{{contactPhone}}`      | First phone of the contact           | +1 234 567 890                    |
| `{{contactWebsite}}`    | First website of the contact         | https://doe.com                   |
| `{{contactAddress}}`    | First address of the contact         | 123 Main St, City, State, Country |
| `{{contactEmails}}`     | All emails as a YAML inline array    | `['a@b.com', 'c@d.com']`          |
| `{{contactPhones}}`     | All phones as a YAML inline array    | `['+34123', '+34999']`            |
| `{{contactWebsites}}`   | All websites as a YAML inline array  | `['https://a.com']`               |
| `{{contactAddresses}}`  | All addresses as a YAML inline array | `['123 Main St, City']`           |
| `{{contactBirthday}}`   | Birthday of the contact (ISO)        | 2021-01-01                        |
|                         |                                      |                                   |
| `{{snake_contactName}}` | Name of the contact in snake case    | john_doe                          |

### Custom field mappings

If the built-in variables aren't enough, you can define your own under **Settings → Field mappings**. Each row maps a Contacts field to a variable name of your choice, which you can then interpolate in either template as `{{yourAlias}}`.

For example, mapping `Name → username` lets you write:

```yaml
username: '{{username}}'
```

For multivalued fields (emails, phones, websites, addresses) the **first value** is used, just like `{{contactEmail}}`/`{{contactPhone}}`.

## Sync from Obsidian to Mac Contacts

You can push a contact back to macOS Contacts.app using the command **Sync active contact to Mac Contacts** (open the command palette with `Cmd+P` while a contact note is open).

The reverse sync reads **only the YAML frontmatter** — the body of the note is ignored. The default properties template now includes the fields needed for the round trip (`contactUID`, `contactURL`, `name`, `nickname`, `emails`, `phones`, `websites`, `addresses`, `birthday`). If you customized your properties template you'll need to add at least `contactUID` and any fields you want pushed back.

Behavior:

- The plugin looks up the contact in Mac Contacts by `contactUID` across the entire address book.
- If the contact is found, its `emails`, `phones`, `websites`, `addresses`, `birthday` and name are **overwritten** with the frontmatter values.
- If the contact is not found (missing `contactUID` or the UID points to a deleted record), a new contact is created in "All Contacts" and the freshly generated `contactUID` is written back to the frontmatter.

## Sync a single contact from Mac Contacts to Obsidian

To pull the latest data for one contact without running a full sync, open its note and run **Sync active contact from Mac Contacts** from the command palette.

- The note must already have a `contactUID` in its frontmatter (it does after the first sync). If it's missing, the command fails with a notice instead of guessing which Mac contact to use.
- The plugin looks up that `contactUID` directly in Contacts.app and rewrites the note's frontmatter and body from the current Mac data.
- This command **always overwrites the note**, regardless of the global **Update contacts?** setting — it's an explicit, single-note action, so it doesn't defer to the bulk-sync safeguard.
