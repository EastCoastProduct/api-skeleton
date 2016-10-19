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
  services.emailConfirmation.getUserAndCheckPassword({
    email: req.body.oldEmail,
    password: req.body.password
  })
  .then( user =>
    services.emailConfirmation.checkIfEmailInUse(req.body.newEmail)
    .then( () => services.emailConfirmation.createWithEmail({
      email: req.body.newEmail,
      id: user.id
    }))
    .then( () => {
      res.status(200);
      res.locals.message = lang.messages.requestChangeEmail;
      next();
    })
  )
  .catch(err => next(err));
}

module.exports = {
  create: create,
  validate: validate
};
