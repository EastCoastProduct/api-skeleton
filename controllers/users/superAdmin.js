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
  })
};

function create(req, res, next) {
  services.superAdmin.createUser(req)
  .then( () => {
    res.status(201);
    res.locals.message = lang.messages.userCreated;
    next();
  })
  .catch(err => next(err));
}

module.exports = {
  create: create,
  validate: validate
};
