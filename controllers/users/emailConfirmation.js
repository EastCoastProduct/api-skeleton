'use strict';

const services = require('../../models/services');
const validator = require('../../middleware/validator');
const lang = require('../../config/language');

const validate = {
  confirm: validator.validation('body', {
    rules: {token: 'uuid'},
    required: ['token']
  }),
  resend: validator.validation('body', {
    rules: {email: 'email'},
    required: ['email']
  })
};

function confirm(req, res, next) {
  services.emailConfirmation.getByToken(req.body.token)
    .then(ec => {
      return ec.getUser().then(user => {
        if (ec.email) user.email = ec.email;
        user.confirmed = true;
        return user.save();
      });
    })
    .then(() => services.emailConfirmation.removeByToken(req.body.token))
    .then(() => {
      res.status(200);
      res.locals.message = lang.emailConfirmed;
      next();
    })
    .catch(err => next(err));
}

function resend(req, res, next) {
  services.emailConfirmation.getUserAndRemoveTokens(req.body.email)
    .then(user =>
      services.emailConfirmation.create(user)
        .then(() => {
          res.status(201);
          res.locals.message = lang.sentConfirmationEmail;
          next();
        }))
    .catch(err => next(err));
}


module.exports = {
  confirm: confirm,
  resend: resend,
  validate: validate
};
