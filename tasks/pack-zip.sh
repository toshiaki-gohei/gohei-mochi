#!/bin/bash
set -eu

. ./tasks/common.sh

firefox_dir=$DIST_DIR/$PKG_NAME-firefox
chrome_dir=$DIST_DIR/$PKG_NAME-chrome

function pack_zip() {
    local src_dir work_dir
    src_dir=$(basename "$1")
    work_dir=$1/..

    cd "$work_dir"

    if [ ! -d "$src_dir" ]; then
        echo "pack_zip: no such src_dir: $src_dir" >&2
        return
    fi

    local dist_file=$src_dir-$PKG_VERSION.zip

    rm -f "$dist_file"
    zip -qr "$dist_file" "$src_dir"
}

(pack_zip "$firefox_dir")
(pack_zip "$chrome_dir")
