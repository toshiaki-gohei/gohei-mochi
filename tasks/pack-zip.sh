#!/bin/bash
set -eu

. ./tasks/common.sh

pkg_name=$(load_pkg_name)
pkg_version=$(load_pkg_version)

work_dir=$DIST_DIR
src_dir=$pkg_name
dist_file=$pkg_name-$pkg_version.zip

cd $work_dir

if [ ! -d "$src_dir" ]; then
    echo "no such build-dir: $work_dir/$src_dir" >&2
    exit 1
fi

rm -f "$dist_file"
zip -r "$dist_file" "$src_dir"
