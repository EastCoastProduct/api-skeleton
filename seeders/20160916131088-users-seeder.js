'use strict';

const users = require('../utils/fixtures/users');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('users', users, {}),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('users', null, {})
};
