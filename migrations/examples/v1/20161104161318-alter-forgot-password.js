'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('forgot_passwords', 'testExpirationDate', {
      type: 'timestamp',
      defaultValue: Sequelize.fn('NOW')
    });
  },

  down: function(queryInterface) {
    return queryInterface.removeColumn(
      'forgot_passwords',
      'testExpirationDate'
    );
  }
};
