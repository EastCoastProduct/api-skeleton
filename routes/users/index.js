'use strict';

const authorization = require('../../middleware/authorization');
const config = require('../../config');
const users = require('../../controllers').users;
const jwt = require('express-jwt');

module.exports = function(router) {
  router.route('/users')
    .get(users.list)
    .post(
      users.validate.create,
      users.create
    );

  router.route('/users/:userId')
    .get(users.show)
    .post(
      jwt({secret: config.jwtKey}),
      authorization.isAdmin(),
      users.validate.update,
      users.update
    )
    .delete(
      jwt({secret: config.jwtKey}),
      authorization.isAdmin(true),
      users.remove
    );

  router.route('/changeEmail')
    .post(
      users.emailUpdate.validate.create,
      users.emailUpdate.create
    );

  router.route('/changeEmail/:token')
    .post(users.emailUpdate.confirm);

  router.route('/changePassword')
    .post(
      users.passwords.validate.change,
      users.passwords.change
    );

  router.route('/resetPassword')
    .post(
      users.passwords.validate.reset,
      users.passwords.reset
    );

  router.route('/resendConfirmation')
    .post(
      users.emailConfirmation.validate.resend,
      users.emailConfirmation.resend
    );

  router.route('/emailConfirm')
    .post(
      users.emailConfirmation.validate.confirm,
      users.emailConfirmation.confirm
    );
};
