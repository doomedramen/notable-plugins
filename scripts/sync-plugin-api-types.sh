#!/usr/bin/env bash
# Refresh types/notable-plugin-api.d.ts from a local notable checkout.
#
# Usage: scripts/sync-plugin-api-types.sh [path-to-notable-checkout]
# Defaults to ../notable-scaffold (sibling checkout of doomedramen/notable).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_repo="${1:-$repo_root/../notable-scaffold}"
source_file="$source_repo/frontend/src/plugin-api/index.ts"
dest_file="$repo_root/types/notable-plugin-api.d.ts"

if [ ! -f "$source_file" ]; then
  echo "error: $source_file not found" >&2
  echo "pass the path to a notable checkout, e.g.:" >&2
  echo "  scripts/sync-plugin-api-types.sh ../notable" >&2
  exit 1
fi

{
  printf '%s\n' \
    '/**' \
    ' * Vendored copy of the Notable plugin API contract, for type-checking only.' \
    ' *' \
    ' * Source of truth: `frontend/src/plugin-api/index.ts` in the' \
    ' * `doomedramen/notable` repository. Refresh with' \
    ' * `scripts/sync-plugin-api-types.sh` when the host API changes.' \
    ' *'
  tail -n +2 "$source_file"
} > "$dest_file"

echo "synced $dest_file from $source_file"
