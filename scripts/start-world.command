#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js 22 or newer, then open this launcher again."
  exit 1
fi
if [ ! -d node_modules/ws ]; then npm ci; fi
npm run host -- --host 0.0.0.0 "$@"
