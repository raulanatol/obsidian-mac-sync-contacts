# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (see `packageManager` in `package.json` and `pnpm-lock.yaml` — don't run plain `npm install`, it'll create a conflicting `package-lock.json`).

- `pnpm dev` — esbuild in watch mode, outputs `main.js` with inline sourcemap.
- `pnpm build` — type-check (`tsc -noEmit`) then production esbuild bundle.
- `pnpm test` — run vitest once (`CI=true`). For a single test file: `npx vitest run src/contacts/__tests__/Contact.test.ts`. Watch mode: `npx vitest`.
- `pnpm lint` / `pnpm fmt:check` — oxlint / oxfmt, both run in CI (`.github/workflows/build.yml`).
- `make build` runs tests, lint, fmt-check, then `pnpm build`. `make release[_minor|_major]` invokes `.scripts/finish-release`, which requires a clean tree on `main`, bumps the version, builds, runs `pnpm publish`, and pushes tags — `.github/workflows/release.yml` then creates a GitHub release on the pushed tag with `main.js` and `manifest.json` attached.

## Architecture

This is an Obsidian plugin (`isDesktopOnly: true`, macOS-only) that syncs entries from the macOS Contacts.app into the user's vault as Markdown notes.

**Bundle**: `main.ts` is a thin re-export of `MacSyncContactsPlugin`. esbuild bundles to `main.js` at the repo root with `obsidian` and Electron/CodeMirror packages marked external — this layout (root-level `main.js` + `manifest.json` + `styles.css`) is what Obsidian loads.

**Sync flow** (triggered by the ribbon icon in `MacSyncContactsPlugin.onload`):

1. `SyncContactsAction` calls `getContacts()` in `src/contacts/contacts.ts`, which **spawns `osascript`** with a hard-coded AppleScript that reads vCards from **every person** in Contacts.app (no group filter — all contacts are imported).
2. The raw output is split with a `BEGIN:VCARD…END:VCARD` regex and each chunk parsed via `vcard-parser` (untyped, `@ts-ignore` import) into `Contact` instances (`src/contacts/Contact.ts`). Values are lowercased and spaces stripped via `cleanup` — be aware this is lossy for things like addresses.
3. For each contact, `SyncContactAction` resolves a target path (`<contactsFolder>/<name>.md`) and either creates a new file or — only if `settings.updateContacts` is true, or `forceUpdate` was passed to its constructor — updates the existing one. Each call returns a `SyncResult` (`created`/`updated`/`skipped`/`failed`).
4. `SyncContactsAction` aggregates results (using `Promise.allSettled` so one failure doesn't kill the batch). If `settings.generateSummary` is on (default), it writes `<contactsFolder>/_sync-summary.md` via `buildSyncSummary` (`src/actions/SyncSummary.ts`) — a pure builder with its own tests. The summary file is overwritten each run.

**Reverse sync** (command palette, single active note, not the bulk ribbon flow):

- `SyncContactToMacAction` (Obsidian → Mac) reads only the active file's YAML frontmatter (`buildPayloadFromFrontmatter`), looks up `contactUID` in Contacts.app, and overwrites that contact — or creates one and writes the new `contactUID` back to frontmatter if the UID is missing/stale.
- `SyncContactFromMacAction` (Mac → Obsidian) reads `contactUID` from the active file's frontmatter, fetches that one contact via `getContactByUid` (`src/contacts/contacts.ts`), and runs it through `SyncContactAction` with `forceUpdate: true` — this bypasses `settings.updateContacts` since it's an explicit single-note action, not the bulk safeguard. Note: it resolves the write path from `slugify(contact.name)`, not from the active file's own path, so a Mac-side rename can make it target a different file than the one that was open.
- `getContactByUid` looks up a person in Contacts.app by `id` via AppleScript. `Contact.ts`'s `uidFromRaw` strips the trailing `:ABPerson` suffix Contacts.app appends to vCard UIDs so the stored `contactUID` matches the plain `id` used for this lookup.

**Template + update model**: The Markdown body comes from `settings.contactTemplate`, and the YAML frontmatter from `settings.propertiesTemplate`. Both go through `replaceTemplateVariables` (`{{contactName}}`, `{{contactNickname}}`, `{{contactUID}}`, `{{contactURL}}`, `{{contactEmail}}`, `{{contactPhone}}`, `{{contactWebsite}}`, `{{contactAddress}}`, `{{contactBirthday}}`, `{{snake_contactName}}`). On create/update, the plugin rewrites the whole contact file with the rendered frontmatter + rendered body, so manual edits are not preserved when `settings.updateContacts` is enabled.

**Settings & DI**: `Context` (`src/obsidian/Context.ts`) bundles settings + `App` + `FileHelper` and is passed to actions instead of reaching into the plugin globally. New actions should follow this pattern.

## Conventions

- TypeScript target ES2018, indented with tabs (see `.editorconfig`). Linting/formatting are `oxlint`/`oxfmt` (`.oxlintrc.json`), run via `pnpm lint` / `pnpm fmt:check`.
- Tests live under `src/**/__tests__/` and use vitest, covering most actions (`Contact`, `SyncSummary`, `contactFields`, `formatBirthday`, `buildReverseSyncScript`, `buildPayloadFromFrontmatter`, `slugify`, `applescript`).
- When adding a new template variable, update **three** places: the replacement in `SyncContactAction.replaceTemplateVariables`, the parser in `Contact.ts`/`contacts.ts` if it needs new vCard data, and the table in `README.md`.
- `manifest.json` and `package.json` versions are kept in sync by `version-bump.mjs` (invoked by `pnpm version`). Don't edit `manifest.json`/`versions.json` by hand.
