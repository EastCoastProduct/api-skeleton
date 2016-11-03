'use strict';

const sequlizeInstance = require('../models').sequelize;
const Umzug = require('umzug');
const fs = require('fs');

/* istanbul ignore next */
/* eslint-disable no-console */
function run(version, method, specific) {
  let specificMigrations = specific ? specific.split(',') : [];

  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: { sequelize: sequlizeInstance },
    migrations: {
      params: [
        sequlizeInstance.getQueryInterface(),
        sequlizeInstance.constructor, function() {
          throw new Error('Migration tried to use old style "done" callback.' +
            ' Please upgrade to "umzug" and return a promise instead.');
        }
      ],
      path: `./migrations/${version}`,
      pattern: /\.js$/
    }
  });

  if (method === 'up') {
    if (specificMigrations.length > 0) {
      umzug.up(specificMigrations).then( () => {
        console.log('Migration complete!');
        process.exit(0);
      });
    } else {
      umzug.up().then( () => {
        console.log('Migration complete!');
        process.exit(0);
      });
    }
  } else if (method === 'down') {
    if (specificMigrations.length > 0) {
      umzug.down(specificMigrations).then( () => {
        console.log('Migration complete!');
        process.exit(0);
      });
    } else {
      let migrations = fs.readdirSync(`${__dirname}/${version}`);

      if (migrations.lenght > 0) {
        console.log('Error: migrations version folder not found');
        process.exit(1);
      }

      let firstMigration = migrations[0].substr(0,
         migrations[0].lastIndexOf('.')
      );
      umzug.down({ to: `${firstMigration}` }).then( () => {
        console.log('Migration complete!');
        process.exit(0);
      });
    }
  } else {
    console.log('Error: unrecognized migrations method');
    process.exit(1);
  }
}

function initialize() {
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: { sequelize: sequlizeInstance },
    migrations: {
      params: [
        sequlizeInstance.getQueryInterface(),
        sequlizeInstance.constructor, function() {
          throw new Error('Migration tried to use old style "done" callback.' +
          ' Please upgrade to "umzug" and return a promise instead.');
        }
      ],
      path: './migrations/initial',
      pattern: /\.js$/
    }
  });

  umzug.up().then( () => {
    console.log('Migration complete!');
    process.exit(0);
  });
}

module.exports = {
  run: run,
  initialize: initialize
};
