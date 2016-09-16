'use strict';

const users = require('../utils/fixtures/users');

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.bulkInsert('users', users, {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
