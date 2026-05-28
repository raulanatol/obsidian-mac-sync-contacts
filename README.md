# Obsidian mac sync contacts plugin

Sync contacts from your mac contacts app to obsidian.

## Setup

1. In macOS Contacts.app, create a group containing the contacts you want to sync. By default the plugin looks for a group named `obsidian` — you can change the group name in the plugin settings (**Contacts group**).
2. In the plugin settings, set **Contacts folder** to the vault folder where notes should be written (default: `People`).
3. Optionally enable **Update contacts?** to overwrite existing notes when contacts change in Contacts.app. With this off, existing notes are left untouched.
4. Optionally enable **Group by first letter** to nest each note under a subfolder named after the first letter of the contact (e.g. `People/A/alejandro-fernandez.md`).
5. Click the contacts icon in the ribbon to run a sync.

Filenames are always normalized to lowercase, hyphen-separated, ASCII-safe (e.g. `Álvaro Núñez` → `alvaro-nunez.md`).

## Template variables

| Variable                | Description                          | Example                           |
| ----------------------- | ------------------------------------ | --------------------------------- |
| `{{contactName}}`       | Name of the contact                  | John Doe                          |
| `{{contactUID}}`        | UID of the contact in Mac Contacts   | AB-CD-EF-12                       |
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

## Sync from Obsidian to Mac Contacts

You can push a contact back to macOS Contacts.app using the command **Sync active contact to Mac Contacts** (open the command palette with `Cmd+P` while a contact note is open).

The reverse sync reads **only the YAML frontmatter** — the body of the note is ignored. The default properties template now includes the fields needed for the round trip (`contactUID`, `name`, `emails`, `phones`, `websites`, `addresses`, `birthday`). If you customized your properties template you'll need to add at least `contactUID` and any fields you want pushed back.

Behavior:

- The plugin looks up the contact in Mac Contacts by `contactUID` (across the entire address book, not just the configured sync group).
- If the contact is found, its `emails`, `phones`, `websites`, `addresses`, `birthday` and name are **overwritten** with the frontmatter values.
- If the contact is not found (missing `contactUID` or the UID points to a deleted record), a new contact is created in "All Contacts" (no group is assigned) and the freshly generated `contactUID` is written back to the frontmatter.
