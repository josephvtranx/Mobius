#!/bin/bash
# Distributed inside Mobius-Test-Kit.zip; placeholders are filled by package-kit.py.
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin
unset NODE_OPTIONS NODE_PATH
KIT_DIR="$(cd -- "$(dirname -- "$0")" && pwd -P)"
REPO_ROOT="$(dirname -- "$KIT_DIR")"
BASE_COMMIT='@BASE_COMMIT@'
PATCH_SHA='@PATCH_SHA@'
fail() { echo "Mobius testing kit: $1" >&2; exit 1; }

[ -f "$REPO_ROOT/package.json" ] || fail 'Put the unzipped Mobius-Test-Kit folder inside your cloned Mobius folder, then try again.'
command -v git >/dev/null || fail 'Git is required for the clone step. Ask Joseph for help installing it.'
ACTUAL_ROOT="$(git -C "$REPO_ROOT" rev-parse --show-toplevel 2>/dev/null)" || fail 'This folder is not a Git clone. Clone Mobius first.'
[ "$(cd -- "$ACTUAL_ROOT" && pwd -P)" = "$REPO_ROOT" ] || fail 'Move Mobius-Test-Kit to the top level of the Mobius repo.'
[ -f "$KIT_DIR/app.patch" ] || fail 'The testing kit is incomplete. Download and unzip it again.'
ACTUAL_SHA="$(shasum -a 256 "$KIT_DIR/app.patch" | awk '{print $1}')"
[ "$ACTUAL_SHA" = "$PATCH_SHA" ] || fail 'The testing kit failed verification. Download and unzip it again.'
[ "$(git -C "$REPO_ROOT" rev-parse HEAD)" = "$BASE_COMMIT" ] || fail 'This kit is for a different repo version. Ask Joseph for a matching kit; no files were changed.'

# Apply all-or-nothing and only once. No reset, stash, checkout, commit or push.
# git apply preserves unrelated edits and rejects conflicting files/hunks.
if git -C "$REPO_ROOT" apply --reverse --check "$KIT_DIR/app.patch" >/dev/null 2>&1; then
  echo 'Testing kit already installed.'
elif git -C "$REPO_ROOT" apply --check "$KIT_DIR/app.patch" >/dev/null 2>&1; then
  echo 'Installing the testing kit and current app updates…'
  git -C "$REPO_ROOT" apply --whitespace=nowarn "$KIT_DIR/app.patch"
else
  fail 'The kit conflicts with files in this clone. Use a fresh clone or ask Joseph for help; no files were changed.'
fi

exec /bin/bash "$REPO_ROOT/Start Mobius.command" "$@"
