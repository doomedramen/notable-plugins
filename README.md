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

Minimal manifest:

```json
{
  "id": "my-plugin",
  "name": "My plugin",
  "version": "1.0.0",
  "description": "What it does",
  "entry": "main.js",
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
- **Insert date and time** - inserts local date/time values from commands
- **Random note** - opens a random vault note
- **Reading time** - estimates reading time in the status bar
- **Templates** - inserts reusable note templates with dynamic variables
