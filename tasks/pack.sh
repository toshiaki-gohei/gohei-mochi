#!/bin/bash
set -eu

./tasks/pack-firefox.sh

./tasks/pack-chrome.sh
