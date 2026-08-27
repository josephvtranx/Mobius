#!/bin/bash
set -euo pipefail
umask 077
SANDBOX_ROOT="$(cd -- "$(dirname -- "$0")/../.." && pwd)"
SANDBOX_CACHE="${HOME}/Library/Caches/MobiusSandbox"
SANDBOX_STAGE=''
cleanup() { if [ -n "$SANDBOX_STAGE" ]; then rm -rf -- "$SANDBOX_STAGE"; fi; }
failed() {
  cleanup
  echo 'Mobius could not start. Check your internet connection and try again.'
  echo 'If it still fails, send the message above to Joseph. Your normal app data is untouched.'
  if [ -t 0 ]; then read -r -p 'Press Return to close. ' _; fi
}
trap failed ERR
trap 'cleanup; exit 130' INT TERM HUP
if [ "$(uname -s)" != Darwin ]; then echo 'This launcher supports macOS only.'; exit 1; fi
# Pinned official Node release. Hashes from nodejs.org/dist/v22.23.2/SHASUMS256.txt.
SANDBOX_NODE_VERSION=v22.23.2
case "$(uname -m)" in
  arm64) SANDBOX_ARCH=arm64; SANDBOX_SHA=61130f394c1630d211dd50aecc4353d379480f36d3ac913cd85dbba1aed585c6 ;;
  x86_64) SANDBOX_ARCH=x64; SANDBOX_SHA=58e99022c2ff89395576cc7fd4d98cea24bb68081475d5f88b801ee8729fb026 ;;
  *) echo 'Unsupported Mac processor.'; exit 1 ;;
esac
SANDBOX_NAME="node-${SANDBOX_NODE_VERSION}-darwin-${SANDBOX_ARCH}"
SANDBOX_RUNTIME="$SANDBOX_CACHE/$SANDBOX_NAME"
mkdir -p "$SANDBOX_CACHE"
if [ ! -x "$SANDBOX_RUNTIME/bin/node" ]; then
  echo 'First launch: downloading a private Node.js runtime. No administrator password needed.'
  SANDBOX_STAGE="$(mktemp -d "$SANDBOX_CACHE/download.XXXXXX")"
  curl --fail --location --proto '=https' --tlsv1.2 --connect-timeout 15 --max-time 300 --retry 2 \
    "https://nodejs.org/dist/${SANDBOX_NODE_VERSION}/${SANDBOX_NAME}.tar.gz" -o "$SANDBOX_STAGE/node.tar.gz"
  SANDBOX_ACTUAL="$(shasum -a 256 "$SANDBOX_STAGE/node.tar.gz" | awk '{print $1}')"
  if [ "$SANDBOX_ACTUAL" != "$SANDBOX_SHA" ]; then echo 'Download verification failed. Nothing was installed.'; false; fi
  tar -xzf "$SANDBOX_STAGE/node.tar.gz" -C "$SANDBOX_STAGE"
  # Another checkout may have finished downloading while this one ran.
  if [ ! -d "$SANDBOX_RUNTIME" ]; then mv "$SANDBOX_STAGE/$SANDBOX_NAME" "$SANDBOX_RUNTIME"; fi
  cleanup
  SANDBOX_STAGE=''
fi
export PATH="$SANDBOX_RUNTIME/bin:/usr/bin:/bin:/usr/sbin:/sbin"
unset NODE_OPTIONS NODE_PATH
"$SANDBOX_RUNTIME/bin/node" --version
exec "$SANDBOX_RUNTIME/bin/node" "$SANDBOX_ROOT/scripts/sandbox/launch.mjs" "$@"
