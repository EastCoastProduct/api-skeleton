'use strict';

const services = require('../../models/services');
const validator = require('../../middleware/validator');
const lang = require('../../config/language');

const validate = {
  create: validator.validation('body', {
    rules: {
      oldEmail: 'email',
      newEmail: 'email',
      password: 'password'
    },
    required: ['oldEmail', 'newEmail', 'password']
  })
};

function create(req, res, next) {
  services.emailConfirmation.getUserAndRemoveTokens(req.body.oldEmail)
    .then(user => services.emailConfirmation.checkAndCreate({
      dbPassword: user.password,
      userId: user.id,
      oldEmail: req.body.oldEmail.toLowerCase(),
      newEmail: req.body.newEmail.toLowerCase(),
      password: req.body.password
    }))
    .then(() => {
      res.status(200);
      res.locals.message = lang.requestChangeEmail;
      next();
    })
    .catch(err => next(err));
}

module.exports = {
  create: create,
  validate: validate
};
