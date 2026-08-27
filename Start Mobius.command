#!/bin/bash
# Finder launches .command files in Terminal. No system Node or Homebrew needed.
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin
unset NODE_OPTIONS NODE_PATH
cd -- "$(dirname -- "$0")"
exec /bin/bash scripts/sandbox/bootstrap.sh "$@"
