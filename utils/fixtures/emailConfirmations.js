'use strict';

const uuid = require('node-uuid');
const populateTimestamps = require('../migrations').populateTimestamps;
const emailConfirmations = [
  {
    token: uuid.v1(),
    userId: 1
  },
  {
    token: uuid.v1(),
    userId: 2
  }
];

module.exports = populateTimestamps(emailConfirmations);
