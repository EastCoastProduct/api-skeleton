'use strict';

const forgotPasswords = require('../utils/fixtures/forgotPasswords');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('forgot_passwords', forgotPasswords, {}),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('forgot_passwords', null, {})
};
