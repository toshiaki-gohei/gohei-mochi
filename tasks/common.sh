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

readonly PKG_NAME=$(load_pkg_name)
readonly PKG_VERSION=$(load_pkg_version)
readonly PKG_AUTHOR=$(load_pkg_author)
