'use strict';

const uuid = require('node-uuid');
const populateTimestamps = require('../migrations').populateTimestamps;
const forgotPasswords = [
  {
    token: uuid.v1(),
    userId: 1
  },
  {
    // this token will be removed
    token: uuid.v1(),
    userId: 2
  },
  {
    // this token will be removed
    token: uuid.v1(),
    userId: 3
  },
  {
    // this token will be used
    token: uuid.v1(),
    userId: 8
  }
];

module.exports = populateTimestamps(forgotPasswords);
