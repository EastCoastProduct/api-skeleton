'use strict';

const lang = require('../../config/language');
const services = require('../../models/services');
const validator = require('../../middleware/validator');

const validate = {
  create: validator.validation('body', {
    rules: {
      email: { type: 'email' }
    },
    required: ['email']
  }),
  changeUserStatus: validator.validation('body', {
    rules: {
      confirmed: 'stringBoolean'
    },
    required: ['confirmed']
  })
};

function create(req, res, next) {
  services.superAdmin.createUser(req)
  .then( newUser => {
    res.status(201);
    res.locals = newUser;
    next();
  })
  .catch(err => next(err));
}

function changeUserStatus(req, res, next) {
  services.superAdmin.changeUserStatus(req)
    .then( () => {
      res.status(200);
      res.locals.message = lang.messages.userStatusUpdated;
      next();
    })
    .catch(err => next(err));
}

module.exports = {
  create: create,
  changeUserStatus: changeUserStatus,
  validate: validate
};
