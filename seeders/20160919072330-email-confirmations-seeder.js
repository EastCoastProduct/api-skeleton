'use strict';

const emailConfirmations = require('../utils/fixtures/emailConfirmations');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('email_confirmations', emailConfirmations, {}),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('email_confirmations', emailConfirmations, {})
};
