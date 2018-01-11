#!/bin/bash
set -eu

npm run clean
echo "clean: done"

npm run lint
echo "lint: done"

(NODE_ENV=development npm test >/dev/null)
echo "test: done"

npm run build
echo "build: done"

. ./tasks/pack-zip.sh
echo "pack-zip: done"
