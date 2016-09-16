'use strict';

const forgotPasswords = require('../utils/fixtures/forgotPasswords');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('forgot_passwords', forgotPasswords, {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('forgot_passwords', null, {});
  }
};
