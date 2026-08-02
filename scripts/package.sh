#!/usr/bin/env bash
# Build a Chrome Web Store zip with files at the archive root (no wrapper folder).
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

stage="$(mktemp -d "${TMPDIR:-/tmp}/jsd-package.XXXXXX")"
cleanup() { rm -rf "$stage"; }
trap cleanup EXIT

mkdir -p "$stage/src/shared" "$stage/icons" dist

# Strip AppleDouble / resource-fork noise from icons before packaging.
xattr -c icons/*.png 2>/dev/null || true

cp manifest.json LICENSE README.md "$stage/"
cp src/background.js src/bubble.js src/content.js "$stage/src/"
cp src/shared/*.js "$stage/src/shared/"
cp icons/icon-16.png icons/icon-48.png icons/icon-128.png "$stage/icons/"

# Fail fast if icons did not copy.
for size in 16 48 128; do
  test -f "$stage/icons/icon-${size}.png" || {
    echo "missing icons/icon-${size}.png in staging area" >&2
    exit 1
  }
done

out="$root/dist/japanese-selection-dictionary.zip"
rm -f "$out"
(
  cd "$stage"
  # -X omits extra file attributes that can confuse store validation on macOS.
  zip -X -r "$out" manifest.json LICENSE README.md src icons
)

echo "Wrote $out"
unzip -l "$out"
