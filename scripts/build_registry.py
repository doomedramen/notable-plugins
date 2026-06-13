#!/usr/bin/env python3

import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import re
import tarfile
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PLUGINS = ROOT / "plugins"
DIST = ROOT / "dist"
REPOSITORY = os.environ.get("GITHUB_REPOSITORY", "doomedramen/notable-plugins")
RELEASE_TAG = os.environ.get("RELEASE_TAG", "plugins-latest")
ID_PATTERN = re.compile(r"^[a-z][a-z0-9-]*$")
VERSION_PATTERN = re.compile(r"^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$")
EXCLUDED_PARTS = {
    ".git",
    "dist",
    "node_modules",
    "__pycache__",
    # TypeScript build inputs - only the bundled `entry` ships. The build
    # config itself lives at the repo root (package.json, tsconfig.json,
    # build.mjs); these entries only matter for per-plugin leftovers.
    "src",
    "tsconfig.json",
    "package.json",
    "package-lock.json",
    "build.mjs",
    "mapping.json",
}


def fail(message):
    raise SystemExit(message)


def plugin_files(directory):
    files = []
    for path in directory.rglob("*"):
        if any(part in EXCLUDED_PARTS for part in path.relative_to(directory).parts):
            continue
        if path.is_symlink():
            fail(f"{directory.name}: symlinks are not allowed ({path})")
        if path.is_file():
            files.append(path)
    return sorted(files, key=lambda path: path.relative_to(directory).as_posix())


def package_plugin(directory, output):
    raw_tar = io.BytesIO()
    with tarfile.open(fileobj=raw_tar, mode="w") as archive:
        for path in plugin_files(directory):
            relative = path.relative_to(directory).as_posix()
            info = archive.gettarinfo(str(path), arcname=relative)
            info.uid = 0
            info.gid = 0
            info.uname = ""
            info.gname = ""
            info.mtime = 0
            info.mode = 0o644
            with path.open("rb") as source:
                archive.addfile(info, source)

    with output.open("wb") as target:
        with gzip.GzipFile(filename="", mode="wb", fileobj=target, mtime=0) as compressed:
            compressed.write(raw_tar.getvalue())


def load_manifest(directory):
    manifest_path = directory / "manifest.json"
    if not manifest_path.is_file():
        fail(f"{directory.name}: missing manifest.json")
    try:
        manifest = json.loads(manifest_path.read_text())
    except (OSError, json.JSONDecodeError) as error:
        fail(f"{directory.name}: invalid manifest.json: {error}")

    required = ["id", "name", "version", "description", "author", "homepage"]
    missing = [field for field in required if not str(manifest.get(field, "")).strip()]
    if missing:
        fail(f"{directory.name}: missing manifest fields: {', '.join(missing)}")
    if manifest["id"] != directory.name or not ID_PATTERN.fullmatch(manifest["id"]):
        fail(f"{directory.name}: id must match its lowercase hyphenated directory")
    if not VERSION_PATTERN.fullmatch(manifest["version"]):
        fail(f"{directory.name}: version must be semantic")
    api_version = manifest.get("apiVersion", 1)
    if not isinstance(api_version, int) or api_version < 1:
        fail(f"{directory.name}: apiVersion must be a positive integer")
    categories = manifest.get("categories", [])
    if not isinstance(categories, list) or any(
        not isinstance(category, str) or not ID_PATTERN.fullmatch(category)
        for category in categories
    ):
        fail(f"{directory.name}: categories must be lowercase hyphenated ids")
    if len(categories) != len(set(categories)):
        fail(f"{directory.name}: categories must be unique")
    homepage = urlparse(manifest["homepage"])
    if homepage.scheme not in {"http", "https"} or not homepage.netloc:
        fail(f"{directory.name}: homepage must be an HTTP(S) URL")
    entry = Path(manifest.get("entry", "main.js"))
    if entry.is_absolute() or ".." in entry.parts or not (directory / entry).is_file():
        fail(f"{directory.name}: entry must name a file inside the plugin")
    return manifest


def main():
    DIST.mkdir(exist_ok=True)
    for old in DIST.iterdir():
        if old.is_file():
            old.unlink()

    registry = {"plugins": []}
    for directory in sorted(path for path in PLUGINS.iterdir() if path.is_dir()):
        manifest = load_manifest(directory)
        package_path = DIST / f"{manifest['id']}.tar.gz"
        package_plugin(directory, package_path)
        package_bytes = package_path.read_bytes()
        registry["plugins"].append(
            {
                "id": manifest["id"],
                "name": manifest["name"],
                "version": manifest["version"],
                "description": manifest["description"],
                "author": manifest["author"],
                "homepage": manifest["homepage"],
                "apiVersion": manifest.get("apiVersion", 1),
                "categories": manifest.get("categories", []),
                "package": {
                    "url": (
                        f"https://github.com/{REPOSITORY}/releases/download/"
                        f"{RELEASE_TAG}/{package_path.name}"
                    ),
                    "sha256": hashlib.sha256(package_bytes).hexdigest(),
                    "size": len(package_bytes),
                },
            }
        )
        print(f"Built {package_path.relative_to(ROOT)} ({len(package_bytes)} bytes)")

    registry_path = DIST / "plugins.json"
    registry_path.write_text(json.dumps(registry, indent=2) + "\n")
    print(f"Generated {registry_path.relative_to(ROOT)} with {len(registry['plugins'])} plugins")


if __name__ == "__main__":
    main()
