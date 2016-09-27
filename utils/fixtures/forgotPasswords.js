'use strict';

const uuid = require('node-uuid');
const populatePresets = require('../migrations').populatePresets;

const preset = () => ({
  token: uuid.v1()
});

const forgotPasswords = [
  {
    userId: 1
  },
  {
    // this token will be removed
    userId: 2
  },
  {
    // this token will be removed
    userId: 3
  },
  {
    // this token will be used
    userId: 8
  }
];

module.exports = populatePresets(forgotPasswords, preset);
