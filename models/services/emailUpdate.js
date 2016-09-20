'use strict';

const bcrypt = require('bcrypt');
const errors = require('../../utils/errors');
const Error400 = errors.Error400;
const Error404 = errors.Error404;
const User = require('../').user;
const EmailUpdate = require('../').emailUpdate;
const lang = require('../../config/language');
const mailer = require('../../utils/mailer');
const generic = require('./_generic')(EmailUpdate, lang.models.emailUpdate);

const checkAndCreate = data =>
  User.count({where: {email: data.newEmail}})
    .then(user => {
      if (user) throw Error400(lang.emailInUse);
    })
    .then(() => {
      const sentPassword = data.password;
      const oldPassword = data.dbPassword.trim();
      let isCorrectPassword = bcrypt.compareSync(sentPassword, oldPassword);

      if (!isCorrectPassword) throw Error400(lang.wrongPassword);
    })
    .then(() => generic.create({email: data.newEmail, userId: data.userId})
      .then(confirmation => mailer.emailUpdate({
        user: {email: data.newEmail}, token: confirmation.token
      }))
    );

const getByTokenAndEdit = token => generic.getOne({token: token})
    .then(user =>
      User.count({where: {email: user.email}}).then(numUsers => {
        if (numUsers) throw Error400(lang.emailInUse);
        let newEmail = user.email;

        return user.getUser().then(userModel => {
          userModel.email = newEmail;
          userModel.confirmed = false;
          return userModel.save();
        });
      })
    );

const getUserAndRemoveTokens = email =>
  User.findOne({where: {email: email}}).then(user => {
    if (!user) throw Error404(lang.notFound(lang.models.user));
    return user;
  })
  .then(user =>
    EmailUpdate.destroy({where: {userId: user.id}}).then(() => user)
  );

const removeByToken = token => generic.remove({token: token});

module.exports = {
  checkAndCreate: checkAndCreate,
  getByTokenAndEdit: getByTokenAndEdit,
  getUserAndRemoveTokens: getUserAndRemoveTokens,
  removeByToken: removeByToken
};
