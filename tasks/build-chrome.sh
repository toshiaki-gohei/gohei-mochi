#!/bin/bash
set -eu

. ./tasks/common.sh

build_dir=$DIST_DIR/$PKG_NAME-chrome
src_dir=$DIST_DIR/$PKG_NAME-firefox

rm -rf "$build_dir"
cp -r "$src_dir" "$build_dir"

function build_css() {
    local src_file="$src_dir/content-scripts/gohei-mochi.css"
    local dist_file="$build_dir/content-scripts/gohei-mochi.css"

    < "$src_file" \
      sed -e 's/moz-extension:\/\//chrome-extension:\/\//' \
      > "$dist_file"
}

build_css
