'use strict';

const uuid = require('node-uuid');
const populateTimestamps = require('../migrations').populateTimestamps;
const emailUpdates = [
  {
    // this token will be deleted
    token: uuid.v1(),
    email: 'will.remove@ecp.io',
    userId: 1
  },
  {
    // this token will be removed
    token: uuid.v1(),
    email: 'will.remove2@ecp.io',
    userId: 3
  },
  {
    // this will fail to update email
    token: uuid.v1(),
    email: 'john.doe@ecp.io',
    userId: 5
  },
  {
    // this will change the email
    token: uuid.v1(),
    email: 'cool.mail@ecp.io',
    userId: 10
  },
  {
    token: uuid.v1(),
    email: 'totaly.changed@ecp.io',
    userId: 12
  }
];

module.exports = populateTimestamps(emailUpdates);
