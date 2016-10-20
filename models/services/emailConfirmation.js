'use strict';

const bcrypt = require('bcrypt');
const errors = require('../../utils/errors');
const User = require('../').user;
const EmailConfirmation = require('../').emailConfirmation;
const lang = require('../../config/language');
const emailConfirmationLang = lang.models.emailConfirmation;
const mailer = require('../../utils/mailer');
const generic = require('./_generic')(EmailConfirmation, emailConfirmationLang);

const removeEmailConfirmation = function(userId) {
  return EmailConfirmation.destroy({ where: { userId: userId }});
};

function confirm(token) {

  const checkIfNewEmailInUse = function(email) {
    return User.count({ where: { email: email }}).then(function(userCount) {
      if (userCount > 0) {
        throw errors.Error400(lang.alreadyExists(lang.models.user));
      }
    });
  };

  return generic.getOne({ token: token })
    .then(function(emailConfirmation) {
      this.emailConfirmation = emailConfirmation;

      if (emailConfirmation.email) {
        return checkIfNewEmailInUse(emailConfirmation.email);
      }
    })
    .then(function() {
      return this.emailConfirmation.getUser();
    })
    .then(function(user) {
      if (this.emailConfirmation.email) {
        user.email = this.emailConfirmation.email;
      }
      user.confirmed = true;

      return user.save();
    })
    .then(function(user) {
      return removeEmailConfirmation(user.id);
    });
}

function sendMail(user, type) {
  let options = { user: { email: user.email }, token: user.token };

  if (type === 'emailUpdate') return mailer.emailUpdate(options);
  return mailer.emailConfirm(options);
}

function resendEmailConfirmation(userId) {

  return generic.getOne({ userId: userId })
    .bind({})
    .then(function(emailConfirmation) {
      this.emailConfirmationData = {
        email: emailConfirmation.email
      };
      return removeEmailConfirmation(userId);
    })
    .then(function() {
      let newEmailConfirmationData = {
        email: this.emailConfirmationData.email,
        userId: userId
      };

      return generic.create(newEmailConfirmationData);
    })
    .then(function(newEmailConfirmation) {
      this.emailConfirmationData.token = newEmailConfirmation.token;

      if (this.emailConfirmationData.email) {
        this.emailConfirmationData.mailType = 'emailUpdate';
        return;
      }

      return newEmailConfirmation.getUser().bind(this).then(function(user) {
        this.emailConfirmationData.email = user.email;
      });
    })
    .then(function() {
      return sendMail({
        email: this.emailConfirmationData.email,
        token: this.emailConfirmationData.token
      }, this.emailConfirmationData.mailType);
    });
}

function createEmailConfirmationWithEmail(userId, newEmail, userPassword) {

  const checkIfEmailInUse = () =>
    User.count({ where: { email: newEmail }})
    .then(function(userCount) {
      if (userCount > 0) throw errors.Error400(lang.emailInUse);

      return EmailConfirmation.count({ where: { email: newEmail }})
        .then(function(emailConfirmationCount) {
          if (emailConfirmationCount > 0) {
            throw errors.Error400(lang.emailInUse);
          }
        });
    });

  return User.findById(userId)
    .then( user => {
      const oldPassword = user.password.trim();
      let isCorrectPassword = bcrypt.compareSync(userPassword, oldPassword);

      if (!isCorrectPassword) throw errors.Error400(lang.wrongPassword);
    })
    .then( () => checkIfEmailInUse())
    .then( () => removeEmailConfirmation(userId))
    .then( () => generic.create({ email: newEmail, userId: userId }))
    .then( newEmailConfirmation => sendMail(
      { email: newEmail, token: newEmailConfirmation.token }, 'emailUpdate'
    ));
}

// TODO remove with users controller refactor
function createToken(user) {
  return generic.create({ userId: user.id });
}

module.exports = {
  confirm: confirm,
  sendMail: sendMail,
  resendEmailConfirmation: resendEmailConfirmation,
  createEmailConfirmationWithEmail: createEmailConfirmationWithEmail,
  createToken: createToken
};
