'use strict';

const uuid = require('node-uuid');
const populatePresets = require('../migrations').populatePresets;

const preset = () => ({
  token: uuid.v1()
});

const emailConfirmations = [
  {
    userId: 3
  },
  {
    // this token will be removed
    userId: 8
  },
  {
    // this token will be deleted
    userId: 9
  },
  {
    // this will change the email
    email: 'cool.mail@ecp.io',
    userId: 10
  }
];

module.exports = populatePresets(emailConfirmations, preset);
