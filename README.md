# Obsidian mac sync contacts plugin

Sync contacts from your mac contacts app to obsidian.

## Setup

1. In macOS Contacts.app, create a group containing the contacts you want to sync. By default the plugin looks for a group named `obsidian` — you can change the group name in the plugin settings (**Contacts group**).
2. In the plugin settings, set **Contacts folder** to the vault folder where notes should be written (default: `People`).
3. Optionally enable **Update contacts?** to overwrite existing notes when contacts change in Contacts.app. With this off, existing notes are left untouched.
4. Click the contacts icon in the ribbon to run a sync.

## Template variables

| Variable                | Description                       | Example                           |
|-------------------------|-----------------------------------|-----------------------------------|
| `{{contactName}}`       | Name of the contact               | John Doe                          |
| `{{contactEmail}}`      | First email of the contact        | john@doe.com                      |
| `{{contactPhone}}`      | First phone of the contact        | +1 234 567 890                    |
| `{{contactWebsite}}`    | First website of the contact      | https://doe.com                   |
| `{{contactAddress}}`    | First address of the contact      | 123 Main St, City, State, Country |
| `{{contactBirthday}}`   | Birthday of the contact (ISO)     | 2021-01-01                        |
|                         |                                   |                                   |
| `{{snake_contactName}}` | Name of the contact in snake case | john_doe                          |
