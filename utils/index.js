'use strict';

const _ = require('lodash');
const jwt = require('jsonwebtoken');

function responseMiddleware(req, res, next) {

  if (_.isEmpty(res.locals)) return next();
  res.json(res.locals);
}

const defaultValue = (field, value) => field !== void 0 ? field : value;

/* istanbul ignore next */
function userFromJwtHeader(headers) {
  var user;

  var parts = headers.authorization.split(' ');

  if (parts.length === 2) {
    var scheme = parts[0];
    var credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      var token = credentials;
      var dtoken = jwt.decode(token, { complete: true }) || {};
      user = dtoken.payload;
    }
  }

  return user;
}

function chainMiddleware(middlewares) {
  var chain = require('connect')();

  middlewares.forEach(middleware => chain.use(middleware));

  return chain;
}

module.exports = {
  responseMiddleware: responseMiddleware,
  defaultValue: defaultValue,
  middleware: { chain: chainMiddleware },
  userFromJwtHeader: userFromJwtHeader
};
