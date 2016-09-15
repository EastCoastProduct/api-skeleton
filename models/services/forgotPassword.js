'use strict';

const User = require('../').user;
const Error404 = require('../../utils/errors').Error404;
const ForgotPassword = require('../').forgotPassword;
const lang = require('../../config/language');
const langForgotPassword = lang.models.forgotPassword;
const generic = require('./_generic')(ForgotPassword, langForgotPassword);
const mailer = require('../../utils/mailer');

const create = user =>
  generic.create({userId: user.id})
    .then(confirmation =>
      mailer.forgotPassword({
        user: {email: user.email}, token: confirmation.token
      }));

const getByToken = token => generic.getOne({token: token})
  .then(user => {
    if (!user) throw Error404(lang.notFound(lang.models.user));
    return user.getUser();
  });

const getUserAndRemoveTokens = email =>
  User.findOne({where: {email: email}}).then(user => {
    if (!user) throw Error404(lang.notFound(lang.models.user));
    return user;
  })
  .then(user =>
    ForgotPassword.destroy({where: {userId: user.id}}).then(() => user)
  );

const removeByToken = token => generic.remove({token: token});

module.exports = {
  create: create,
  getByToken: getByToken,
  getUserAndRemoveTokens: getUserAndRemoveTokens,
  removeByToken: removeByToken
};
