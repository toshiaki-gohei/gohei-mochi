#!/bin/bash
set -eu

. ./tasks/common.sh

build_dir=$DIST_DIR/$PKG_NAME-firefox
ar_dir=$build_dir/resources
bg_dir=$build_dir/background
cs_dir=$build_dir/content-scripts

rm -rf "$build_dir"
mkdir -p "$build_dir"

mkdir "$ar_dir"
mkdir "$bg_dir"
mkdir "$cs_dir"

function build_manifest() {
    node tasks/build-manifest.js > "$build_dir/manifest.json"
}

function build_js() {
    local browserify
    local opts=(-t babelify -t envify -p licensify)

    browserify=$(npm bin)/browserify

    $browserify "${opts[@]}" --outfile "$bg_dir/$PKG_NAME.js" src/background/index.js
    $browserify "${opts[@]}" --outfile "$cs_dir/$PKG_NAME.js" src/content/index.js

    local dist_file
    for file in src/resources/*.js; do
        dist_file=$(basename "$file")
        $browserify "${opts[@]}" --outfile "$ar_dir/$dist_file" "$file"
    done
}

function build_css() {
    local banner="\
/*!
 * $PKG_NAME $PKG_VERSION
 * (C) 2017 $PKG_AUTHOR
 */
"

    cp node_modules/normalize.css/normalize.css "$cs_dir"

    local dist_file="$cs_dir/$PKG_NAME.css"
    echo -n "$banner" > "$dist_file"
    cat "css/$PKG_NAME.css" >> "$dist_file"
}

build_manifest
build_js
build_css
