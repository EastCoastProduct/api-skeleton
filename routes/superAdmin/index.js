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

  router.route('/superAdmin/authenticate')
    .post(
      authentication.superAdmin.validate.authenticate,
      authentication.superAdmin.authenticate
    );
};
