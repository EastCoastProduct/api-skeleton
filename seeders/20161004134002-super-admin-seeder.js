'use strict';

const superAdmins = require('../utils/fixtures/superAdmins');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('super_admins', superAdmins, {}),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('super_admins', null, {})
};
