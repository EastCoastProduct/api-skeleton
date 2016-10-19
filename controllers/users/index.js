'use strict';

const _ = require('lodash');
const services = require('../../models/services');
const Resource = require('../../models').resource;
const lang = require('../../config/language');
const validator = require('../../middleware/validator');
const prependS3 = require('../../utils/s3').prependS3;

const validate = {
  create: validator.validation('body', {
    rules: {
      bio: { type: 'norule', length: { max: 1000 }},
      email: { type: 'email' },
      firstname: { type: 'norule', length: { max: 30 }},
      lastname: { type: 'norule', length: { max: 30 }},
      password: { type: 'password' }
    },
    required: ['email', 'password']
  }),
  update: validator.validation('body', {
    rules: {
      bio: { type: 'norule', length: { max: 1000 }},
      firstname: { type: 'norule', length: { max: 30 }},
      lastname: { type: 'norule', length: { max: 30 }},
      resourceId: { type: 'positive'}
    }
  }),
  list: validator.validation('query', {
    rules: {
      page: 'positive',
      limit: 'positive'
    }
  }, true)
};

function create(req, res, next) {
  services.user.doesNotExist({ where: { email: req.body.email }})
  .then( () => services.user.create(req.body))
  .then( user => services.emailConfirmation.createToken(user)
    .then( emailConfirmation => services.emailConfirmation.sendMail({
      email: user.email, token: emailConfirmation.token
    }))
    .then(() => {
      res.status(201);
      res.locals = user;
      next();
    })
  )
  .catch(err => next(err));
}

function list(req, res, next) {
  services.user.listWithPagination(
    req.query,
    { include: { model: Resource, required: false }}
  )
  .then( users => {
    res.status(200);
    res.locals = {
      count: users.count,
      rows: _.forEach(users.rows, user => prependS3(user, 'image'))
    };
    next();
  })
  .catch(err => next(err));
}

function remove(req, res, next) {

  services.user.removeById(req.params.userId)
    .then( () => {
      res.status(200);
      res.locals.message = lang.messages.successfullyRemoved(lang.models.user);
      next();
    })
    .catch(err => next(err));
}

function show(req, res, next) {
  services.user.getById(
    req.params.userId,
    { include: [{ model: Resource, required: false }]}
  )
  .then( user => {
    res.locals = prependS3(user, 'image');
    res.status(200);
    next();
  })
  .catch(err => next(err));
}

function update(req, res, next) {

  services.user.getById(req.params.userId)
  .then( () =>
    services.user.update(req.body, { id: req.params.userId })
      .then( updatedUser => {
        return updatedUser.getResource()
        .then( resource => {
          updatedUser.resource = resource;
          res.status(200);
          res.locals = prependS3(updatedUser, 'image');
          next();
        });
      })
  )
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
