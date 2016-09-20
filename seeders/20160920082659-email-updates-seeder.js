'use strict';

const emailUpdates = require('../utils/fixtures/emailUpdates');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('email_updates', emailUpdates, {}),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('email_updates', emailUpdates, {})
};
