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

      if (!isCorrectPassword) throw Error400(lang.wrongPassword);
      user.password = req.body.newPassword.trim();

      return user.save().then(resp => {
        res.locals = resp;
        next();
      });
    })
    .catch(err => next(err));
}

function changeWithToken(req, res, next) {
  services.forgotPassword.getByToken(req.params.token)
    .then(userFromToken => {
      userFromToken.password = req.body.password;
      return userFromToken.save();
    })
    .then( () => services.forgotPassword.removeByToken(req.params.token))
    .then( () => {
      res.status(200);
      res.locals.message = lang.passwordChanged;
      next();
    })
    .catch(err => next(err));
}

function reset(req, res, next) {
  services.forgotPassword.getUserAndRemoveTokens(req.body.email).then(user =>
    services.forgotPassword.create(user)
      .then( () => {
        res.status(200);
        res.locals.message = lang.passwordRecovery;
        next();
      }))
      .catch(err => next(err));
}

module.exports = {
  change: change,
  changeWithToken: changeWithToken,
  reset: reset,
  validate: validate
};
