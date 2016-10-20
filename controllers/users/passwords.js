'use strict';

const bcrypt = require('bcrypt');
const Error400 = require('../../utils/errors').Error400;
const services = require('../../models/services');
const validator = require('../../middleware/validator');
const lang = require('../../config/language');

const validate = {
  change: validator.validation('body', {
    rules: {
      oldPassword: 'password',
      newPassword: 'password'
    },
    required: ['oldPassword', 'newPassword']
  }),
  changeWithToken: validator.validation('body', {
    rules: {
      password: 'password'
    },
    required: ['password']
  }),
  reset: validator.validation('body', {
    rules: {
      email: 'email'
    },
    required: ['email']
  })
};

function change(req, res, next) {
  services.user.getById(req.user.userId)
    .then( user => {
      const oldPassword = req.body.oldPassword.trim();
      let isCorrectPassword = bcrypt.compareSync(oldPassword, user.password);

      if (!isCorrectPassword) throw Error400(lang.errors.wrongPassword);
      user.password = req.body.newPassword.trim();

      return user.save()
      .then( () => {
        res.status(200);
        res.locals.message = lang.messages.passwordChanged;
        next();
      });
    })
    .catch(err => next(err));
}

function changeWithToken(req, res, next) {
  services.passwords.changeWithToken(req)
  .then( () => {
    res.status(200);
    res.locals.message = lang.messages.passwordChanged;
    next();
  })
  .catch(err => next(err));
}

function reset(req, res, next) {
  services.passwords.reset(req)
  .then( () => {
    res.status(200);
    res.locals.message = lang.messages.passwordRecovery;
    next();
  })
  .catch(err => next(err));
}

module.exports = {
  change: change,
  changeWithToken: changeWithToken,
  reset: reset,
  validate: validate
};
