'use strict';

const bcrypt = require('bcrypt');
const errors = require('../../utils/errors');
const User = require('../').user;
const EmailConfirmation = require('../').emailConfirmation;
const lang = require('../../config/language');
const emailConfirmationLang = lang.models.emailConfirmation;
const mailer = require('../../utils/mailer');
const generic = require('./_generic')(EmailConfirmation, emailConfirmationLang);

const sendMail = (user, type) => {
  let options = {user: {email: user.email}, token: user.token};
  if (type) return mailer.emailUpdate(options);
  return mailer.emailConfirm(options);
};

const createToken = user =>
  User.update({confirmed: false}, {where: {id: user.id}})
    .then(() => generic.create({userId: user.id}));

const checkIfEmailInUse = newEmail =>
  User.count({where: {email: newEmail}}).then(user => {
    if (user) throw errors.Error400(lang.emailInUse);
    return EmailConfirmation.count({where: {email: newEmail}}).then(ecs => {
      if (ecs) throw errors.Error400(lang.emailInUse);
    });
  });

const createWithEmail = data =>
  generic.create({email: data.email, userId: data.id})
    .then(ecs => sendMail(
      {user: {email: data.email, token: ecs.token}}, 'emailUpdate'
    ));

const getUserAndCheckPassword = data =>
  User.findOne({where: {email: data.email}}).then(user => {
    if (!user) throw errors.Error404(lang.notFound(lang.models.user));
    const sentPassword = data.password;
    const oldPassword = user.password.trim();
    let isCorrectPassword = bcrypt.compareSync(sentPassword, oldPassword);

    if (!isCorrectPassword) throw errors.Error400(lang.wrongPassword);
    return user;
  });

const getByToken = token => generic.getOne({token: token}).then(user => user);

const getUserAndCreateToken = email =>
  User.findOne({where: {email: email}}).then(user => {
    if (!user) throw errors.Error404(lang.notFound(lang.models.user));
    return user;
  })
  .then(user =>
    EmailConfirmation.findOne({where: {userId: user.id}}).then(ecs => {
      if (ecs) return ecs.save();
      return createToken({id: user.id, email: email});
    }))
  .then(ecs => ({
    email: ecs.email || email, token: ecs.token, newEmail: !!ecs.email
  }));

const removeByToken = token => generic.remove({token: token});

module.exports = {
  createToken: createToken,
  checkIfEmailInUse: checkIfEmailInUse,
  createWithEmail: createWithEmail,
  getUserAndCheckPassword: getUserAndCheckPassword,
  getByToken: getByToken,
  getUserAndCreateToken: getUserAndCreateToken,
  removeByToken: removeByToken,
  sendMail: sendMail
};
