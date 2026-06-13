# Notable community plugins

This repository is the community plugin registry for
[Notable](https://github.com/doomedramen/notable).

Each plugin lives in `plugins/<id>/` and contains a Notable `manifest.json`,
its browser ES module entry point, and any runtime assets. Pull requests to
`main` are the publication mechanism: CI builds every plugin, creates
deterministic `.tar.gz` packages, generates `plugins.json`, and uploads the
artifacts to the rolling `plugins-latest` GitHub release.

## Add a plugin

1. Create `plugins/<id>/manifest.json` and its entry module.
2. Use a lowercase, hyphen-separated ID matching the directory name.
3. Use a semantic version and bump it whenever package contents change.
4. Include `author` and `homepage` in the manifest.
5. Open a pull request.

### TypeScript plugins

Plugins are written in TypeScript against the types in
[`types/notable-plugin-api.d.ts`](types/notable-plugin-api.d.ts) (a vendored
copy of `frontend/src/plugin-api/index.ts` from the `doomedramen/notable`
repository — refresh it with `scripts/sync-plugin-api-types.sh` when the host
API changes).

Each plugin has:

- `src/main.ts` - the plugin source, importing types from
  `notable-plugin-api`
- `tsconfig.json` - extends the shared `tsconfig.base.json` and maps
  `notable-plugin-api` to the vendored types
- `package.json` / `build.mjs` - `npm run build` type-checks `src/main.ts`
  and bundles it to `main.js` with esbuild, marking `@codemirror/*` and `yjs`
  external (same convention as Notable core plugins — read shared host
  modules from `api.modules` rather than bundling your own)

`manifest.json` still points `entry` at `main.js`. Built `main.js` files are
git-ignored; CI builds them (`npm --prefix plugins/<id> ci && npm --prefix
plugins/<id> run build`) before packaging. The packaged `.tar.gz` excludes
`src/`, `tsconfig.json`, `package.json`, `package-lock.json`, and `build.mjs`
— only the bundled `entry` and runtime assets ship.

Minimal manifest:

```json
{
  "id": "my-plugin",
  "name": "My plugin",
  "version": "1.0.0",
  "description": "What it does",
  "entry": "main.js",
  "apiVersion": 2,
  "categories": ["productivity"],
  "author": "Your name",
  "homepage": "https://github.com/you/my-plugin"
}
```

Plugins run with full access to the Notable browser application and the user's
notes. Submissions must be readable, narrowly scoped, and free of minified or
obfuscated code.

Run the publisher locally with:

```bash
python3 scripts/build_registry.py
```

The generated files are written to `dist/`.

## Current plugins

- **Copy note link** - copies a wiki link to the active note
- **Daily notes** - opens or creates today's note
- **Homepage** - opens a chosen note on command or app startup
- **Iconize** - assigns icon-pack or emoji icons to notes and folders
- **Phosphor icons** - searchable icon pack and app icon theme
- **Insert date and time** - inserts local date/time values from commands
- **Random note** - opens a random vault note
- **Reading time** - estimates reading time in the status bar
- **Tabler icons** - searchable icon pack and app icon theme
- **Templates** - inserts reusable note templates with dynamic variables
- **Dracula theme** - configurable Dracula-inspired colors
- **Nord theme** - configurable Nord colors
- **Solarized theme** - configurable Solarized light and dark colors
