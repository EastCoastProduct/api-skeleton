'use strict';

const lang = require('../../config/language');
const uuid = require('node-uuid');
const models = require('../');
const User = models.user;
const genericUser = require('./_generic')(User, lang.models.user);
const ForgotPassword = models.forgotPassword;
const mailer = require('../../utils/mailer');

function createUser(req) {
  let userEmail = req.body.email.toLowerCase();

  const _createUser = () =>
    User.create({ email: userEmail, password: uuid.v1(), confirmed: true });

  const createPasswordToken = userId =>
    ForgotPassword.create({ userId: userId });

  return genericUser.doesNotExist({ where: { email: userEmail }})
  .then( () => _createUser())
  .then( newUser => createPasswordToken(newUser.id))
  .then( newPasswordToken => mailer.superAdminCreatedUser({
    user: { email: userEmail },
    token: newPasswordToken.token
  }));
}

module.exports = {
  createUser: createUser
};
