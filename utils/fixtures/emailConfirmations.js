'use strict';

const uuid = require('node-uuid');
const populatePresets = require('../migrations').populatePresets;

const preset = () => ({
  token: uuid.v1()
});

const emailConfirmations = [{
  // this mail is used for change email test
  email: 'change.email@mail.com',
  userId: 1
}, {
  userId: 2
}, {
  userId: 3,
  email: 'change3.email@mail.com'
}, {
  // this token will be removed
  userId: 9
}, {
  // this token will be deleted
  userId: 10
}, {
  // this will change the email
  email: 'cool.mail@mail.com',
  userId: 12
}, {
  // this email is in use and will fail confirmation
  email: 'regular@mail.com',
  userId: 17
}, {
  email: 'resend.change@mail.com',
  userId: 19
}];

module.exports = populatePresets(emailConfirmations, preset);
