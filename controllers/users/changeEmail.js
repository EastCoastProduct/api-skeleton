'use strict';

const services = require('../../models/services');
const validator = require('../../middleware/validator');
const lang = require('../../config/language');

const validate = {
  create: validator.validation('body', {
    rules: {
      newEmail: 'email',
      password: 'password'
    },
    required: ['newEmail', 'password']
  })
};

function create(req, res, next) {
  services.emailConfirmation.createEmailConfirmationWithEmail(
    req.params.userId,
    req.body.newEmail.toLowerCase(),
    req.body.password
  )
  .then( () => {
    res.status(200);
    res.locals.message = lang.messages.requestChangeEmail;
    next();
  })
  .catch(err => next(err));
}

module.exports = {
  create: create,
  validate: validate
};
