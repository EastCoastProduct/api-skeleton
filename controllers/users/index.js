'use strict';

const _ = require('lodash');
const services = require('../../models/services');
const Resource = require('../../models').resource;
const lang = require('../../config/language');
const validator = require('../../middleware/validator');
const prependS3 = require('../../utils/s3').prependS3;
const createController = require('../../utils').createController;

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
      bio: { type: 'norule', length: { max: 1000 }, allowEmpty: true },
      firstname: { type: 'norule', length: { max: 30 }, allowEmpty: true },
      lastname: { type: 'norule', length: { max: 30 }, allowEmpty: true },
      resourceId: { type: 'positive'}
    }
  }),
  list: validator.validation('query', {
    rules: {
      page: 'positive',
      limit: 'positive',
      search: 'norule',
      confirmed: 'stringBoolean'
    }
  }, true)
};

function create(req, res) {
  return services.user.doesNotExist({ where: { email: req.body.email }})
  .then(() => services.user.create(req.body))
  .then(user =>
    services.emailConfirmation.createToken(user)
      .then(emailConfirmation => services.emailConfirmation.sendMail({
        email: user.email, token: emailConfirmation.token
      }))
      .then(() => {
        res.status(201);
        return user;
      })
  );
}

function list(req) {
  return services.user.listWithSearchAndFilter(
    req,
    ['firstname', 'lastname', 'email'],
    { confirmed: req.query.confirmed },
    { include: { model: Resource, required: false }}
  )
  .then(users => ({
    count: users.count,
    rows: _.forEach(users.rows, user => prependS3(user, 'image'))
  }));
}

function remove(req) {
  return services.user.removeById(req.params.userId)
    .then(() => ({
      message: lang.messages.successfullyRemoved(lang.models.user)
    }));
}

function show(req) {
  return services.user.getById(
    req.params.userId,
    { include: [{ model: Resource, required: false }]}
  )
  .then(user => prependS3(user, 'image'));
}

function update(req) {
  return services.user.getById(req.params.userId)
  .then(() =>
    services.user.update(req.body, { id: req.params.userId })
      .then(updatedUser =>
        updatedUser.getResource()
        .then(resource => {
          updatedUser.resource = resource;
          return prependS3(updatedUser, 'image');
        })
      )
  );
}

module.exports = createController({
  emailUpdate: require('./changeEmail'),
  create,
  emailConfirmation: require('./emailConfirmation'),
  list,
  passwords: require('./passwords'),
  superAdmin: require('./superAdmin'),
  remove,
  show,
  update,
  validate
});
