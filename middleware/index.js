'use strict';

const _ = require('lodash'),
  logger = require('../utils/logger'),
  lang = require('../config/language'),
  deleteHangingFiles = require('./remove').deleteHangingFiles,
  utils = require('../utils'),
  uuid = require('node-uuid');


// add headers to every response
function addHeaders(req, res, next) {
  // add headers to every response to stop cacheing
  res.setHeader('Expires', 'Tue, 03 Jul 2001 06:00:00 GMT');
  res.setHeader('Last-Modified', '{now} GMT');
  var cacheControl = 'max-age=0, no-cache, must-revalidate, proxy-revalidate';
  res.setHeader('Cache-Control', cacheControl);
  next();
}

function catch404(req, res, next) {
  var err = new Error(lang.errors.routeNotFound);
  err.status = 404;
  next(err);
}

function _responseMiddleware(req, res, next) {
  delete res.locals._uploaded;
  delete res.locals._delete;

  if (_.isEmpty(res.locals)) return next();
  logger.logRequest({ req, res });
  res.json(res.locals).end();
}

function logMiddleware(req, res, next) {
  // add request id for whole request
  req.log = logger.child({ requestId: uuid.v4() });

  next();
}

const responseMiddleware = () =>
  utils.middleware.chain([deleteHangingFiles, _responseMiddleware]);

module.exports = {
  addHeaders: addHeaders,
  catch404: catch404,
  responseMiddleware: responseMiddleware(),
  logMiddleware: logMiddleware
};
