'use strict';

const config = require('../config');
const User = require('../models').user;
const lang = require('../config/language');
const errors = require('../utils/errors');
const Error403 = errors.Error403;
const Error404 = errors.Error404;
const jwt = require('express-jwt');
const utils = require('../utils');

const getUser = (checking) => {
  const attributes = ['admin', 'confirmed', 'superAdmin'];

  return (req, res, next) => {
    User.findById(req.user.userId, {attributes: attributes}).then(user => {
      if (!user) throw Error404(lang.notFound(lang.models.user));

      if (checking === 'confirmed' && !user.confirmed) {
        throw Error403(lang.notConfirmed(lang.models.user));
      }

      if (checking === 'admin' || checking === 'superAdmin') {
        req.user.privileges = {admin: user.admin, superAdmin: user.superAdmin};
      }

      next();
    })
    .catch(err => next(err));
  };
};

function doesUserHavePrivilege(type, adminRoute) {
  return (req, res, next) => {
    const privileges = req.user.privileges;
    const hasPrivilege = privileges.superAdmin || privileges[type];

    if (adminRoute && !hasPrivilege) return next(Error403(lang.notAuthorized));

    req.user.privileges = undefined;

    if (hasPrivilege) req.user.hasPrivilege = true;

    next();
  };
}

const checkAdmin = (adminRoute = false) =>
  doesUserHavePrivilege('admin', adminRoute);

const checkSuperAdmin = (adminRoute = false) =>
  doesUserHavePrivilege('superAdmin', adminRoute);

// this function chains middleware for authorization
function authorization(type, adminRoute = false) {
  let middlewareChain = [
    jwt({secret: config.jwtKey}),
    getUser(type)
  ];

  switch (type) {
  case 'admin':
    middlewareChain.push(checkAdmin(adminRoute)); break;
  case 'superAdmin':
    middlewareChain.push(checkSuperAdmin(adminRoute)); break;
  }

  return utils.middleware.chain(middlewareChain);
}

module.exports = {
  isUser: authorization(),
  isConfirmed: authorization('confirmed'),
  isAdmin: (adminRoute) => authorization('admin', adminRoute),
  isSuperAdmin: (adminRoute) => authorization('superAdmin', adminRoute)
};
