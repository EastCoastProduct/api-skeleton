'use strict';

/*
  These are the english response messages
*/

const messageBuilder = require('./messageBuilder');
const prependKeyword = messageBuilder.prependKeyword;

module.exports = {
  // All model names
  models: {
    emailUpdate: 'Change email',
    emailConfirmation: 'Confirmation email',
    forgotPassword: 'Recovery token',
    user: 'User'
  },

  // Validation error messages
  unrecognizedParameter: 'unrecognized parameter',
  required: 'required',

  // Error messages
  alreadyExists: prependKeyword('already exists'),
  emailInUse: 'Email is already in use',
  cannotDeleteSelf: 'You cannot delete yourself',
  doesNotExist: prependKeyword('does not exist'),
  invalidToken: 'Invalid token',
  parametersError: 'Parameters error',
  notAuthorized: 'Not authorized',
  notConfirmed: prependKeyword('is not confirmed'),
  notFound: prependKeyword('not found'),
  wrongPassword: 'Wrong password',

  // Successfull response messages
  passwordChanged: 'Your password has been updated',
  passwordRecovery: 'Your password recovery email has been sent',
  successfullyRemoved: prependKeyword('successfully removed'),
  sentConfirmationEmail: 'Your confirmation email has been sent',
  emailConfirmed: 'Email confirmed'
};
