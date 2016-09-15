'use strict';

const authentication = require('../../controllers').authentication;

module.exports = function(router) {
  router.route('/authenticate')
    .post(authentication.authenticate);
};
