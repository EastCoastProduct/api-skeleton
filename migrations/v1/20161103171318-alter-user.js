'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'testSessionToken', {
      type: Sequelize.STRING,
      defaultValue: '0x00000f'
    });
  },

  down: function(queryInterface) {
    return queryInterface.removeColumn('users', 'testSessionToken');
  }
};
