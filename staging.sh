#!/bin/bash

if ! rm seedManifest.js; then
  echo 'File does not exist!'
fi

if ! node_modules/.bin/sequelize db:migrate:undo:all; then
  echo 'Migration rollback error!'
fi

if ! node_modules/.bin/sequelize db:migrate; then
  echo 'Migration error!'
fi

if ! node_modules/.bin/sequelize db:seed:all; then
  echo 'Seed error!'
fi
