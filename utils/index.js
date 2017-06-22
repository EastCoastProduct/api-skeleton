'use strict';

const jwt = require('jsonwebtoken');

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

const promisifyControllerMethod = method => function(req, res, next) {
  new Promise(resolve => {
    resolve(method.apply(this, arguments));
  })
  .then(result => {
    res.locals = result;
  })
  .then(next, next);
};

function createController(body) {
  const controller = {};

  for (const name in body) {
    const val = body[name];

    controller[name] = (typeof val === 'function' && val.length < 3)
      ? promisifyControllerMethod(val)
      : val;
  }

  return controller;
}

module.exports = {
  defaultValue,
  middleware: { chain: chainMiddleware },
  userFromJwtHeader,
  createController
};
