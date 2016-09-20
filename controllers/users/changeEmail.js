'use strict';

const services = require('../../models/services');
const validator = require('../../middleware/validator');
const lang = require('../../config/language');

const validate = {
  create: validator.validation('body', {
    rules: {
      oldEmail: 'email',
      newEmail: 'email',
      password: 'norule'
    },
    required: ['oldEmail', 'newEmail', 'password']
  })
};

function create(req, res, next) {
  services.emailUpdate.getUserAndRemoveTokens(req.body.oldEmail)
    .then(user => services.emailUpdate.checkAndCreate({
      dbPassword: user.password,
      userId: user.id,
      oldEmail: req.body.oldEmail.toLowerCase(),
      newEmail: req.body.newEmail.toLowerCase(),
      password: req.body.password
    }))
    .then(() => res.status(200).json({message: lang.requestChangeEmail}))
    .catch(err => next(err));
}

function confirm(req, res, next) {
  services.emailUpdate.getByTokenAndEdit(req.params.token)
    .then(user =>
      services.emailUpdate.removeByToken(req.params.token)
        .then(() =>
          services.emailConfirmation.create({id: user.id, email: user.email})
        )
        .then(() => res.status(200).json({message: lang.changedEmail}))
    )
    .catch(err => next(err));
}

module.exports = {
  create: create,
  confirm: confirm,
  validate: validate
};
