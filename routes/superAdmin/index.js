'use strict';

const authentication = require('../../controllers').authentication;

module.exports = function(router) {
  router.route('/superAdmin/authenticate')
    .post(
      authentication.superAdmin.validate.authenticate,
      authentication.superAdmin.authenticate
    );
};
