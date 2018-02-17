#!/bin/bash
set -eu

. ./tasks/common.sh

dist_name=$PKG_NAME-firefox
dist_file=$dist_name-$PKG_VERSION.zip
src_dir=$dist_name

cd "$DIST_DIR/$src_dir"

rm -f "$dist_file"

zip -qr "$dist_file" ./*

mv "$dist_file" ..
