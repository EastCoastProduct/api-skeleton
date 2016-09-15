'use strict';

const _ = require('lodash');

function formatErrors(errors) {
  return _.map(errors, error => {
    if (error.path !== 'lower(email::text)') return error;

    return _.extend({}, error, {
      message: 'Email must be unique',
      path: 'email'
    });
  });
}

function ErrorHandler(options) {

  /* eslint-disable no-unused-vars */
  return function errorHandler(err, req, res, next) {

  /* eslint-enable */

    // recognize sequelize validation error
    switch (err.name) {
    case 'SequelizeValidationError':
      err.status = 400;
      err.message = 'Validation Error';
      err.debugInfo = _.map(err.errors, error => _.omit(error, '__raw'));
      break;
    case 'SequelizeUniqueConstraintError':
      err.status = 400;
      err.message = 'Validation Error';
      err.debugInfo = formatErrors(err.errors);
      break;
    case 'SequelizeDatabaseError':
      if (err.parent && err.parent.routine === 'string_to_uuid') {
        err.status = 400;
        err.message = 'Not valid uuid';
        err.debugInfo = err.errors;
      }
      break;
    }

    res.status(err.status || 500);

    res.json({
      message: err.message,
      debugInfo: err.debugInfo,
      error: (options.env === 'development') ? err : undefined
    });
  };
}

module.exports = ErrorHandler;
