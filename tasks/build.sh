#!/bin/bash
set -eu

./tasks/build-firefox.sh

./tasks/build-chrome.sh
