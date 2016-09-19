'use strict';

const User = require('../models').user;
const lang = require('../config/language');
const errors = require('../utils/errors');
const Error403 = errors.Error403;
const utils = require('../utils');

function userFromToken(req, res, next) {
  if (req.user) return next();

  if (req.headers && req.headers.authorization) {
    req.user = utils.userFromJwtHeader(req.headers);
  }

  next();
}

function checkAdminAndSuperAdmin(isAdminRoute = false, onlyAdmin) {
  function _checkAdminAndSuperAdmin(req, res, next) {
    if (!req.user) return next(Error403(lang.invalidToken));
    const queryParams = onlyAdmin
      ? {$or: [{admin: true}, {superAdmin: true}]}
      : {superAdmin: true};

    User.count({where: {$and: [{id: req.user.userId}, queryParams]}})
      .then(user => {
        if (!user && isAdminRoute) throw Error403(lang.notAuthorized);
        if (user) req.user.hasPrivilege = true;
        next();
      })
      .catch(err => next(err));
  }

  return utils.middleware.chain([
    userFromToken,
    _checkAdminAndSuperAdmin
  ]);
}

module.exports = {
  isAdmin: (isAdminRoute) => checkAdminAndSuperAdmin(isAdminRoute, true),
  isSuperAdmin: (isAdminRoute) => checkAdminAndSuperAdmin(isAdminRoute)
};
