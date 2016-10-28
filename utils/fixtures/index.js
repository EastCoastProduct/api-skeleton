'use strict';
/* eslint-disable no-console */
const pg = require('pg');
const Promise = require('bluebird');
const cleaner = require('postgres-cleaner');

const dbArgument = () => (process.argv[3] === 'dev')
  ? 'dev_db'
  : 'test_db';

function recreateDatabase() {
  var connectionString =
    `postgres://postgres:ecp1950@ecp_${dbArgument()}/${dbArgument()}`;

  pg.connect(connectionString)
    .then( connection => {
      return connection.query(
        'SELECT table_name FROM information_schema.tables ' +
        'WHERE table_schema = \'public\''
      )
      .then( tables => {
        if (tables.rows.length === 0) return;

        let promises = tables.rows.map(table =>
         connection.query(`DROP TABLE "${table.table_name}" CASCADE`)
        );

        return Promise.all(promises);
      });
    })
    .then( () => process.exit(0))
    .catch( err => {
      console.log(err);
      process.exit(1);
    });
}

function cleanDatabase() {
  var connectionString =
    `postgres://postgres:ecp1950@ecp_${dbArgument()}/${dbArgument()}`;

  pg.connect(connectionString, (err, connection) => {
    if (err) throw err;
    var options = {
      type: 'delete',
      skipTables: ['SequelizeMeta']
    };

    cleaner(options, connection, error => {
      if (error) {
        console.log(error);
        process.exit(1);
      }
      process.exit(0);
    });
  });
}

if (require.main === module) {
  var arg = process.argv[2];
  var toExecute;

  switch (arg) {
  case 'recreate':
    toExecute = recreateDatabase; break;
  case 'delete':
    toExecute = cleanDatabase; break;
  default:
    console.log('I require an argument: recreate or delete!');
    process.exit(1);
  }

  toExecute((err) => {
    if (err) {
      console.log(arg + ' error', err);
      process.exit(1);
    }

    console.log(arg + ' successfull');
    process.exit(0);
  });
}
