#\!/usr/bin/env bash
set -e

cd "$(dirname "$0")/esteira-dev-gp-vscode-extension"

npm install
npx -- node esbuild.js --production
npx vsce package --no-dependencies

ls -t *.vsix | head -1 | xargs -I{} echo "Gerado: {}"
