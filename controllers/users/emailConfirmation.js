'use strict';

const services = require('../../models/services');
const validator = require('../../middleware/validator');
const lang = require('../../config/language');

const validate = {
  confirm: validator.validation('body', {
    rules: {token: 'uuid'},
    required: ['token']
  })
};

function confirm(req, res, next) {
  services.emailConfirmation.confirm(req.body.token)
  .then( userEmail => {
    res.status(200);
    res.locals.email = userEmail;
    next();
  })
  .catch(err => next(err));
}

function resend(req, res, next) {
  services.emailConfirmation.resendEmailConfirmation(req.params.userId)
  .then( () => {
    res.status(201);
    res.locals.message = lang.messages.sentConfirmationEmail;
    next();
  })
  .catch(err => next(err));
}


module.exports = {
  confirm: confirm,
  resend: resend,
  validate: validate
};
