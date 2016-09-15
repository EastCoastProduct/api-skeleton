'use strict';

const services = require('../../models/services');
const lang = require('../../config/language');
const Error400 = require('../../utils/errors').Error400;
const Error403 = require('../../utils/errors').Error403;
const validator = require('../../middleware/validator');

const validate = {
  create: validator.validation('body', {
    rules: {
      bio: {type: 'norule', length: 1000},
      email: {type: 'email'},
      firstname: {type: 'norule', length: {max: 30}},
      lastname: {type: 'norule', length: {max: 30}},
      password: {type: 'password'}
    },
    required: ['firstname', 'lastname', 'email', 'password']
  }),
  update: validator.validation('body', {
    rules: {
      bio: {type: 'norule', length: 1000},
      firstname: {type: 'norule', length: {max: 30}},
      lastname: {type: 'norule', length: {max: 30}},
      password: {type: 'password'}
    }
  })
};

function create(req, res, next) {
  services.user.doesNotExist({where: {email: req.body.email}})
    .then(() => services.user.create(req.body))
    .then(user => {
      services.emailConfirmation.create(user).then(() =>
        res.status(201).json(user)
      );
    })
    .catch(err => next(err));
}

function list(req, res, next) {
  services.user.list()
    .then(users => res.status(200).json(users))
    .catch(err => next(err));
}

function remove(req, res, next) {
  if (parseInt(req.params.userId) === req.user.userId) {
    return next(Error400(lang.cannotDeleteSelf));
  }

  services.user.removeById(req.params.userId)
    .then(() => res.status(200).json({
      message: lang.successfullyRemoved(lang.models.user)
    }))
    .catch(err => next(err));
}

function show(req, res, next) {
  services.user.getById(req.params.userId)
    .then(user => res.status(200).json(user))
    .catch(err => next(err));
}

function update(req, res, next) {
  const user = req.user;

  if ((user.userId !== req.params.userId) && !user.admin && !user.superadmin) {
    return next(Error403(lang.notAuthorized));
  }

  services.user.update(req.body, {id: req.params.userId})
    .then(response => res.status(200).json(response))
    .catch(err => next(err));
}

module.exports = {
  emailUpdate: require('./changeEmail'),
  create: create,
  emailConfirmation: require('./emailConfirmation'),
  list: list,
  passwords: require('./passwords'),
  remove: remove,
  show: show,
  update: update,
  validate: validate
};
