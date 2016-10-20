'use strict';

const config = require('../config');
const lang = require('../config/language');
const jwt = require('express-jwt');
const utils = require('../utils');

const errors = require('../utils/errors');
const Error403 = errors.Error403;
const Error404 = errors.Error404;

const models = require('../models');
const User = models.user;
const SuperAdmin = models.superAdmin;

function getUser() {
  const getSuperAdmin = (req) => {
    return SuperAdmin.findById(req.user.userId)
      .then( superAdmin => {
        if (!superAdmin) {
          throw Error404(lang.errors.notFound(lang.models.user));
        }

        return superAdmin;
      });
  };

  const getRegularUser = (req) => {
    return User.findById(req.user.userId)
      .then( user => {
        if (!user) throw Error404(lang.errors.notFound(lang.models.user));

        return user;
      });
  };

  return function(req, res, next) {
    if (req.user.isSuperAdmin) {
      getSuperAdmin(req)
        .then(function(superAdmin) {
          req.user.dao = superAdmin;
          next();
        })
        .catch(err => next(err));
    } else {
      getRegularUser(req)
        .then(function(user) {
          req.user.dao = user;
          next();
        })
        .catch(err => next(err));
    }
  };
}

function setUserPrivilege(type) {
  return (req, res, next) => {
    const user = req.user.dao;
    const tokenUser = req.user;

    if (tokenUser.isSuperAdmin) return next();

    // regular user requesting super admin route
    if (type === 'superAdmin' && !tokenUser.isSuperAdmin) {
      throw Error403(lang.errors.notAuthorized);
    }

    // check if user is confirmed
    if (type === 'confirmed' && !user.confirmed) {
      throw Error403(lang.errors.notConfirmed(lang.models.user));
    }

    // check user (self) specific routes
    if (type === 'isOwner' && parseInt(req.params.userId) !== user.id) {
      throw Error403(lang.errors.notAuthorized);
    }

    next();
  };
}

// this function chains middleware for authorization
function authorization(type) {
  let middlewareChain = [
    jwt({secret: config.jwtKey}),
    getUser(),
    setUserPrivilege(type)
  ];

  return utils.middleware.chain(middlewareChain);
}

module.exports = {
  // TODO check if we need isUser
  isUser: authorization(),
  isConfirmed: authorization('confirmed'),
  isSuperAdmin: authorization('superAdmin'),
  isOwner: authorization('isOwner')
};
