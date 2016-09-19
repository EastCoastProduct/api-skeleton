'use strict';

const Error404 = require('../../utils/errors').Error404;
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

const getByToken = token => generic.getOne({token: token})
  .then(user => user.getUser());


const getUserAndRemoveTokens = email =>
  User.findOne({where: {email: email}}).then(user => {
    if (!user) throw Error404(lang.notFound(lang.models.user));
    return user;
  })
  .then(user =>
    EmailConfirmation.destroy({where: {userId: user.id}}).then(() => user)
  );

const removeByToken = token => generic.remove({token: token});

module.exports = {
  create: create,
  getByToken: getByToken,
  getUserAndRemoveTokens: getUserAndRemoveTokens,
  removeByToken: removeByToken
};
