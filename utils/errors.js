'use strict';

/**
 * Custom error
 * status and message arguments are mandatory, error handler will throw
 * Error if they are not found
 * debug info is optional data that can help user for debugging
 */
function CustomError(status, message, debugInfo) {
  Error.call(this, message);
  this.message = message;
  this.status = status;
  if (debugInfo) this.debugInfo = debugInfo;
}

CustomError.prototype.constructor = CustomError;
CustomError.prototype = Object.create(Error.prototype);

// Base error that takes care of creating new error object
// and is used by other shortcut error functions
function BaseError(status, message, debug) {
  return new CustomError(status, message, debug);
}

function Error400(message) {
  return BaseError(400, message);
}

function Error403(message, debug) {
  message = message || 'Not authorized';
  return BaseError(403, message, debug);
}

function Error404(message) {
  return BaseError(404, message);
}

function ParametersError(debug) {
  return BaseError(400, 'Parameters error', debug);
}

function Error500(message, debug) {
  message = message || 'Data integrity compromised';
  return BaseError(500, message, debug);
}

module.exports = {
  ParametersError: ParametersError,
  Error400: Error400,
  Error403: Error403,
  Error404: Error404,
  Error500: Error500
};
