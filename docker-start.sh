#!/bin/bash

if [ ! -d 'node_modules' ]; then
  npm install
fi

if [ ! -f 'seedManifest.js' ]; then
  sequelize db:migrate
  sequelize db:seed:all
fi

npm run dev-start
