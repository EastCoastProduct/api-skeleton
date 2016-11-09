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
  .bind({})
  .then( () => _createUser())
  .then( newUser => {
    this.newUser = newUser;
    return createPasswordToken(newUser.id);
  })
  .then( newPasswordToken => mailer.superAdminCreatedUser({
    user: { email: userEmail },
    token: newPasswordToken.token
  }))
  .then(() => this.newUser);
}

function changeUserEmail(req) {

  let newEmail = req.body.newEmail.toLowerCase();

  function _updateUserEmail() {
    this.user.email = newEmail;
    this.user.confirmed = true;

    return this.user.save();
  }

  return genericUser.getById(req.params.userId)
    .bind({})
    .then( user => {
      this.user = user;
      return genericUser.doesNotExist({ where: { email: newEmail }});
    })
    .then( () => _updateUserEmail.call(this))
    .then( () => mailer.superAdminChangedUserEmail({
      user: { email: newEmail }
    }));
}

function changeUserStatus(req) {

  const _updateUserStatus = () =>
    genericUser.update({
      confirmed: req.body.confirmed
    }, {
      id: req.params.userId
    });

  return genericUser.exists({ where: { id: req.params.userId }})
    .then( () => _updateUserStatus());
}

module.exports = {
  createUser: createUser,
  changeUserEmail: changeUserEmail,
  changeUserStatus: changeUserStatus
};
