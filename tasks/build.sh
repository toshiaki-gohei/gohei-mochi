#!/bin/bash
set -eu

. ./tasks/common.sh

pkg_name=$(load_pkg_name)
build_dir=$DIST_DIR/$pkg_name
ac_dir=$build_dir/resources
bg_dir=$build_dir/background
cs_dir=$build_dir/content-scripts

[ -d "$build_dir" ] && rm -rf "$build_dir"
mkdir -p "$build_dir"

mkdir "$ac_dir"
mkdir "$bg_dir"
mkdir "$cs_dir"

function build_manifest() {
    node tasks/build-manifest.js > "$build_dir/manifest.json"
}

function build_js() {
    local browserify
    local browserify_opts=(-t babelify -t envify -p licensify)

    browserify=$(npm bin)/browserify

    $browserify "${browserify_opts[@]}" --outfile "$bg_dir/$pkg_name.js" src/background/index.js
    $browserify "${browserify_opts[@]}" --outfile "$cs_dir/$pkg_name.js" src/content/index.js

    local dist_file
    for file in src/resources/*.js; do
        dist_file=$(basename "$file")
        $browserify "${browserify_opts[@]}" --outfile "$ac_dir/$dist_file" "$file"
    done
}

function build_css() {
    cp node_modules/normalize.css/normalize.css "$cs_dir"

    local dist_file="$cs_dir/$pkg_name.css"
    banner > "$dist_file"
    cat "css/$pkg_name.css" >> "$dist_file"
}

build_manifest
build_js
build_css
