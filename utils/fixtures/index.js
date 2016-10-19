'use strict';
/* eslint-disable no-console */
const pg = require('pg');
const cleaner = require('postgres-cleaner');

const dbArgument = () => (process.argv[3] === 'dev')
  ? 'dev_db'
  : 'test_db';

function recreateDatabase() {
  var connectionString = 'postgres://postgres@localhost/postgres';

  pg.connect(connectionString)
    .then(connection =>
      connection.query(`drop database ${dbArgument()}`).then( () => connection)
    )
    .then(connection =>
      connection.query(`create database ${dbArgument()}`)
      .then( () => process.exit(0))
    )
    .catch( err => {
      console.log(err);
      process.exit(1);
    });
}

function cleanDatabase() {
  var connectionString = `postgres://postgres@localhost/${dbArgument()}`;

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
