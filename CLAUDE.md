# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — esbuild in watch mode, outputs `main.js` with inline sourcemap.
- `npm run build` — type-check (`tsc -noEmit`) then production esbuild bundle.
- `npm test` — run vitest once (`CI=true`). For a single test file: `npx vitest run src/contacts/__tests__/Contact.test.ts`. Watch mode: `npx vitest`.
- `make build` runs tests then `npm run build`. `make release[_minor|_major]` invokes `.scripts/finish-release`, which requires a clean tree on `main`, bumps the version, builds, runs `npm publish`, and pushes tags.

## Architecture

This is an Obsidian plugin (`isDesktopOnly: true`, macOS-only) that syncs entries from the macOS Contacts.app into the user's vault as Markdown notes.

**Bundle**: `main.ts` is a thin re-export of `MacSyncContactsPlugin`. esbuild bundles to `main.js` at the repo root with `obsidian` and Electron/CodeMirror packages marked external — this layout (root-level `main.js` + `manifest.json` + `styles.css`) is what Obsidian loads.

**Sync flow** (triggered by the ribbon icon in `MacSyncContactsPlugin.onload`):

1. `SyncContactsAction` calls `getContacts()` in `src/contacts/contacts.ts`, which **spawns `osascript`** with a hard-coded AppleScript that reads vCards from **every person** in Contacts.app (no group filter — all contacts are imported).
2. The raw output is split with a `BEGIN:VCARD…END:VCARD` regex and each chunk parsed via `vcard-parser` (untyped, `@ts-ignore` import) into `Contact` instances (`src/contacts/Contact.ts`). Values are lowercased and spaces stripped via `cleanup` — be aware this is lossy for things like addresses.
3. For each contact, `SyncContactAction` resolves a target path (`<contactsFolder>/<name>.md`) and either creates a new file or — only if `settings.updateContacts` is true — updates the existing one. Each call returns a `SyncResult` (`created`/`updated`/`skipped`/`failed`).
4. `SyncContactsAction` aggregates results (using `Promise.allSettled` so one failure doesn't kill the batch). If `settings.generateSummary` is on (default), it writes `<contactsFolder>/_sync-summary.md` via `buildSyncSummary` (`src/actions/SyncSummary.ts`) — a pure builder with its own tests. The summary file is overwritten each run.

**Template + update model**: The Markdown body comes from `settings.contactTemplate`, and the YAML frontmatter from `settings.propertiesTemplate`. Both go through `replaceTemplateVariables` (`{{contactName}}`, `{{contactNickname}}`, `{{contactUID}}`, `{{contactURL}}`, `{{contactEmail}}`, `{{contactPhone}}`, `{{contactWebsite}}`, `{{contactAddress}}`, `{{contactBirthday}}`, `{{snake_contactName}}`). On create/update, the plugin rewrites the whole contact file with the rendered frontmatter + rendered body, so manual edits are not preserved when `settings.updateContacts` is enabled.

**Settings & DI**: `Context` (`src/obsidian/Context.ts`) bundles settings + `App` + `FileHelper` and is passed to actions instead of reaching into the plugin globally. New actions should follow this pattern.

## Conventions

- TypeScript target ES2018, indented with tabs (see `.editorconfig`). ESLint config exists but there's no `lint` npm script.
- Tests live under `src/**/__tests__/` and use vitest. Coverage is sparse; `Contact.fromRaw` is the only thing currently covered.
- When adding a new template variable, update **three** places: the replacement in `SyncContactAction.replaceTemplateVariables`, the parser in `Contact.ts`/`contacts.ts` if it needs new vCard data, and the table in `README.md`.
- `manifest.json` and `package.json` versions are kept in sync by `version-bump.mjs` (invoked by `npm version`). Don't edit `manifest.json`/`versions.json` by hand.
