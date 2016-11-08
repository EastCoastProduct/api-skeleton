'use strict';

const _ = require('lodash');
const logger = require('../utils/logger');

/* istanbul ignore next */
function formatErrors(errors) {
  return _.map(errors, error => {
    if (error.path !== 'lower(email::text)') return error;

    return _.extend({}, error, {
      message: 'Email must be unique',
      path: 'email'
    });
  });
}

/* istanbul ignore next */
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

    if (!err.status) logger.logError({ err, req, res });

    res.status(err.status || 500);

    res.json({
      message: err.message,
      debugInfo: err.debugInfo,
      // TODO check if we want to log whole error in tests
      error: (options.env !== 'production') ? err : undefined
    });
  };
}

module.exports = ErrorHandler;
