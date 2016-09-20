'use strict';

const uuid = require('node-uuid');
const populateTimestamps = require('../migrations').populateTimestamps;
const emailConfirmations = [
  {
    token: uuid.v1(),
    userId: 3
  },
  {
    // this token will be removed
    token: uuid.v1(),
    userId: 8
  },
  {
    // this token will be deleted
    token: uuid.v1(),
    userId: 9
  }
];

module.exports = populateTimestamps(emailConfirmations);
