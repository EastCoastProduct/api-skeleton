'use strict';

const messageBuilder = require('../messageBuilder');
const appendKeyword = messageBuilder.appendKeyword;
const prependKeyword = messageBuilder.prependKeyword;

module.exports = {

  // Errors 400 familly

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
  unableToDeletePreviousImage: 'Unable to delete previous image',

  unableToDeleteUserResource: 'Unable to delete user resource',

  unrecognizedFileField: appendKeyword('Unrecognized field'),

  unrecognizedParameter: 'unrecognized parameter',

  unsupportedImageExtension: 'Unsupported image extension',

  unsupportedDocumentExtension: 'Unsupported document extension',

  // W
  wrongPassword: 'Wrong password',


  // Errors 500
  searchParametersError: appendKeyword('Search values sent without search conditions in service for')

};
