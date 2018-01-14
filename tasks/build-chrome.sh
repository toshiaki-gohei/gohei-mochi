#!/bin/bash
set -eu

. ./tasks/common.sh

build_dir=$DIST_DIR/$PKG_NAME-chrome
src_dir=$DIST_DIR/$PKG_NAME-firefox

rm -rf "$build_dir"
cp -r "$src_dir" "$build_dir"
