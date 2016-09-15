'use strict';

const User = require('../models').user;
const lang = require('../config/language');
const errors = require('../utils/errors');
const Error403 = errors.Error403;
const Error404 = errors.Error404;
const utils = require('../utils');

function userFromToken(req, res, next) {
  if (req.user) return next();

  if (req.headers && req.headers.authorization) {
    req.user = utils.userFromJwtHeader(req.headers);
  }

  next();
}

function getUser(req, res, next) {
  if (!req.user) return next(Error403(lang.invalidToken));

  User.findById(req.user.userId).then(user => {
    if (!user) throw Error404(lang.notFound(lang.models.user));
    if (!user.confirmed) throw Error403(lang.invalidToken);

    req.user.dao = user;
    next();
  })
  .catch(err => next(err));
}

function checkAdminAndSuperAdmin(onlyAdmin) {

  function _checkAdminAndSuperAdmin(req, res, next) {
    const user = req.user.dao;
    const admin = user.admin;
    const superAdmin = user.superAdmin;

    if ((onlyAdmin && !admin && !superAdmin) || (!onlyAdmin && !superAdmin)) {
      return next(Error403(lang.notAuthorized));
    }
    next();
  }

  return utils.middleware.chain([
    userFromToken,
    getUser,
    _checkAdminAndSuperAdmin
  ]);
}

module.exports = {
  isAdmin: checkAdminAndSuperAdmin(true),
  isSuperAdmin: checkAdminAndSuperAdmin()
};
