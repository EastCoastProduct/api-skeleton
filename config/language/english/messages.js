'use strict';

const messageBuilder = require('../messageBuilder');
const appendKeyword = messageBuilder.appendKeyword;
const prependKeyword = messageBuilder.prependKeyword;

module.exports = {
  // C
  changedEmail: 'Email changed',

  // E
  emailConfirmed: 'Email confirmed',

  // P
  passwordChanged: 'Your password has been updated',

  passwordRecovery: 'Your password recovery email has been sent',

  // R
  requestChangeEmail: 'An email has been sent to your new email address',

  // S
  sentConfirmationEmail: 'Your confirmation email has been sent',

  successfullyRemoved: prependKeyword('successfully removed')
};
