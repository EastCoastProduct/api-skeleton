'use strict';

const bcrypt = require('bcrypt');
const errors = require('../../utils/errors');
const User = require('../').user;
const EmailConfirmation = require('../').emailConfirmation;
const lang = require('../../config/language');
const emailConfirmationLang = lang.models.emailConfirmation;
const mailer = require('../../utils/mailer');
const generic = require('./_generic')(EmailConfirmation, emailConfirmationLang);

const create = user =>
  generic.create({userId: user.id})
    .then(confirmation => mailer.emailConfirm({
      user: {email: user.email}, token: confirmation.token
    }));

const checkAndCreate = data =>
  User.count({where: {email: data.newEmail}})
    .then(user => {
      if (user) throw errors.Error400(lang.emailInUse);
    })
    .then(() => {
      const sentPassword = data.password;
      const oldPassword = data.dbPassword.trim();
      let isCorrectPassword = bcrypt.compareSync(sentPassword, oldPassword);

      if (!isCorrectPassword) throw errors.Error400(lang.wrongPassword);
    })
    .then(() => generic.create({email: data.newEmail, userId: data.userId})
      .then(confirmation => mailer.emailUpdate({
        user: {email: data.newEmail}, token: confirmation.token
      }))
    );

const getByToken = token => generic.getOne({token: token}).then(user => user);

const getUserAndRemoveTokens = email =>
  User.findOne({where: {email: email}}).then(user => {
    if (!user) throw errors.Error404(lang.notFound(lang.models.user));
    return user;
  })
  .then(user =>
    EmailConfirmation.destroy({where: {userId: user.id}}).then(() => user)
  );

const removeByToken = token => generic.remove({token: token});

module.exports = {
  create: create,
  checkAndCreate: checkAndCreate,
  getByToken: getByToken,
  getUserAndRemoveTokens: getUserAndRemoveTokens,
  removeByToken: removeByToken
};
