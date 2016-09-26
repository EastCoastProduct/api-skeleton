'use strict';

const resources = require('../utils/fixtures/resources');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('resources', resources, {}),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('resources', null, {})
};
