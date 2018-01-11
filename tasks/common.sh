#!/bin/bash
set +u
[ -n "$__COMMON_SH__" ] && return
set -eu
readonly __COMMON_SH__=common.sh

readonly PACKAGE_JSON=./package.json
readonly DIST_DIR=./dist

function load_pkg_name() {
    node -e "console.log(require('$PACKAGE_JSON').name);"
}

function load_pkg_version() {
    node -e "console.log(require('$PACKAGE_JSON').version);"
}

function load_pkg_author() {
    node -e "console.log(require('$PACKAGE_JSON').author);"
}

function banner() {
    local pkg_name pkg_version pkg_author
    pkg_name=$(load_pkg_name)
    pkg_version=$(load_pkg_version)
    pkg_author=$(load_pkg_author)

    echo "\
/*!
 * $pkg_name $pkg_version
 * (C) 2017 $pkg_author
 */\
"
}
