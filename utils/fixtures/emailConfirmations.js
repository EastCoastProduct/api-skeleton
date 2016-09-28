'use strict';

const uuid = require('node-uuid');
const populatePresets = require('../migrations').populatePresets;

const preset = () => ({
  token: uuid.v1()
});

const emailConfirmations = [
  {
    // this mail is used for change email test
    email: 'some.random@ecp.io',
    userId: 1
  },
  {
    userId: 2
  },
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
  },
  {
    // this email is in use and will fail confirmation
    email: 'john.doe@ecp.io',
    userId: 17
  }
];

module.exports = populatePresets(emailConfirmations, preset);
