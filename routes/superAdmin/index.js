'use strict';

const authorization = require('../../middleware/authorization');
const authentication = require('../../controllers').authentication;
const users = require('../../controllers').users;

module.exports = function(router) {

  router.route('/superAdmin/users')
    .get(
      authorization.isSuperAdmin,
      users.validate.list,
      users.list
    )
    .post(
      authorization.isSuperAdmin,
      users.superAdmin.validate.create,
      users.superAdmin.create
    )

  router.route('/superAdmin/users/:userId/changeStatus')
    .post(
      authorization.isSuperAdmin,
      users.superAdmin.validate.changeUserStatus,
      users.superAdmin.changeUserStatus
    );

  router.route('/superAdmin/authenticate')
    .post(
      authentication.superAdmin.validate.authenticate,
      authentication.superAdmin.authenticate
    );
};
