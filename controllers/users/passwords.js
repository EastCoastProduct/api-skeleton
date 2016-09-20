'use strict';

const services = require('../../models/services');
const validator = require('../../middleware/validator');
const lang = require('../../config/language');

const validate = {
  change: validator.validation('body', {
    rules: {
      token: 'uuid',
      password: 'password'
    },
    required: ['token', 'password']
  }),
  reset: validator.validation('body', {
    rules: {
      email: 'email'
    },
    required: ['email']
  })
};

function reset(req, res, next) {
  services.forgotPassword.getUserAndRemoveTokens(req.body.email).then(user =>
    services.forgotPassword.create(user)
      .then(() => {
        res.status(200);
        res.locals.message = lang.passwordRecovery;
        next();
      }))
      .catch(err => next(err));
}

function change(req, res, next) {
  services.forgotPassword.getByToken(req.body.token)
    .then(userFromToken => {
      userFromToken.password = req.body.password;
      return userFromToken.save();
    })
    .then(() => services.forgotPassword.removeByToken(req.body.token))
    .then(() => {
      res.status(200);
      res.locals.message = lang.passwordChanged;
      next();
    })
    .catch(err => next(err));
}

module.exports = {
  change: change,
  reset: reset,
  validate: validate
};
