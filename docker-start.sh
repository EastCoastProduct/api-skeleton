#!/bin/bash

npm install

if [ ! -f 'seedManifest.js' ]; then
  sequelize db:migrate
  sequelize db:seed:all
fi

npm run dev-start
