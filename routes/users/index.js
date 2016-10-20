'use strict';

const authorization = require('../../middleware/authorization');
const config = require('../../config');
const resources = require('../../controllers').resources;
const upload = require('../../middleware/upload');
const users = require('../../controllers').users;

module.exports = function(router) {
  router.route('/users')
    .get(
      users.validate.list,
      users.list
    )
    .post(
      users.validate.create,
      users.create
    );

  router.route('/users/:userId')
    .get(users.show)
    .post(
      authorization.isConfirmed,
      authorization.isOwner,
      upload.uploadImage('image'),
      resources.mapSingle(),
      users.validate.update,
      users.update
    )
    .delete(
      authorization.isOwner,
      users.remove
    );

  router.route('/users/:userId/changeEmail')
    .post(
      authorization.isOwner,
      users.emailUpdate.validate.create,
      users.emailUpdate.create
    );

  router.route('/changePassword')
    .post(
      authorization.isConfirmed,
      users.passwords.validate.change,
      users.passwords.change
    );

  router.route('/recoverPassword/:token')
    .post(
      users.passwords.validate.changeWithToken,
      users.passwords.changeWithToken
    );

  router.route('/resetPassword')
    .post(
      users.passwords.validate.reset,
      users.passwords.reset
    );

  router.route('/users/:userId/resendConfirmation')
    .post(
      authorization.isOwner,
      users.emailConfirmation.resend
    );

  router.route('/emailConfirm')
    .post(
      users.emailConfirmation.validate.confirm,
      users.emailConfirmation.confirm
    );
};
