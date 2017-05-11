#!/usr/bin/env bash

set -e

npm i

if [ ! -f 'seedManifest.js' ]; then
	npm run dev-rebuild
fi

npm run dev-start
