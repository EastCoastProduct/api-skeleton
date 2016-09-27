'use strict';

const authorization = require('../../middleware/authorization');
const config = require('../../config');
const resources = require('../../controllers').resources;
const upload = require('../../middleware/upload');
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
      authorization.isAdmin(),
      upload.uploadImage('image'),
      resources.mapSingle(),
      users.validate.update,
      users.update
    )
    .delete(
      authorization.isAdmin(true),
      users.remove
    );

  router.route('/changeEmail')
    .post(
      users.emailUpdate.validate.create,
      users.emailUpdate.create
    );

  router.route('/changePassword')
    .post(
      authorization.isConfirmed,
      users.passwords.validate.change,
      users.passwords.change
    );

  router.route('/changePassword/:token')
    .post(
      users.passwords.validate.changeWithToken,
      users.passwords.changeWithToken
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
