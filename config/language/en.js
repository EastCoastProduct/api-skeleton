'use strict';

/*
  These are the english response messages
*/

const messageBuilder = require('./messageBuilder');
const appendKeyword = messageBuilder.appendKeyword;
const prependKeyword = messageBuilder.prependKeyword;

module.exports = {
  // All model names
  models: {
    emailConfirmation: 'Confirmation email',
    forgotPassword: 'Recovery token',
    resource: 'Resource',
    user: 'User'
  },

  // Error messages

  // A
  alreadyExists: prependKeyword('already exists'),
  // C
  cannotDeleteSelf: 'You cannot delete yourself',
  // D
  doesNotExist: prependKeyword('does not exist'),
  // E
  emailInUse: 'Email is already in use',
  // F
  fileNotProvided: 'File was not provided',
  filesNotProvided: 'Files not provided',
  // I
  invalidToken: 'Invalid token',
  // N
  notAuthorized: 'Not authorized',
  notFound: prependKeyword('not found'),
  notConfirmed: prependKeyword('is not confirmed'),
  // P
  parametersError: 'Parameters error',
  // R
  required: 'required',
  routeNotFound: 'Not found',
  // T
  tooManyFiles: appendKeyword('Max number of files for upload is'),
  // U
  unrecognizedFileField: appendKeyword('Unrecognized field'),
  unrecognizedParameter: 'unrecognized parameter',
  unsupportedImageExtension: 'Unsupported image extension',
  unsupportedDocumentExtension: 'Unsupported document extension',
  // W
  wrongPassword: 'Wrong password',


  // Successfull response messages
  // C
  changedEmail: 'Chaned email',
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
