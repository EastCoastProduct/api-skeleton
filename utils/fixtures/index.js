'use strict';
/* eslint-disable no-console */
const pg = require('pg');

const dbArgument = () => (process.argv[3] === 'dev')
  ? 'dev_db'
  : 'test_db';

function recreateDatabase() {
  var connectionString = 'postgres://postgres@localhost/postgres';

  pg.connect(connectionString)
    .then(con =>
      con.query(`drop database ${dbArgument()}`).then(() => con)
    )
    .then(con =>
      con.query(`create database ${dbArgument()}`).then(() => process.exit(0))
    )
    .catch(err => {
      console.log(err);
      process.exit(1);
    });
}

if (require.main === module) {
  var arg = process.argv[2];
  var toExecute;

  switch (arg) {
  case 'recreate':
    toExecute = recreateDatabase; break;
  default:
    console.log('I require an argument: recreate!');
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
