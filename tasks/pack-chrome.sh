#!/bin/bash
set -eu

. ./tasks/common.sh

dist_name=$PKG_NAME-chrome
dist_file=$dist_name-$PKG_VERSION.zip
src_dir=$dist_name

cd "$DIST_DIR"

if [ ! -d "$src_dir" ]; then
    echo "pack-chrome: no such dir: $src_dir" >&2
    return
fi

rm -f "$dist_file"

zip -qr "$dist_file" "$src_dir"
