'use strict';

const _ = require('lodash');
const utils = require('../utils/migrations');

module.exports = {
  up: function(queryInterface, Sequelize) {
    const baseSchema = {
      email: {
        type: Sequelize.STRING
      },
      token: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      }
    };

    return queryInterface.createTable('email_confirmations', _.extend({},
      baseSchema,
      utils.timestamps
    ))
    .then(function() {
      return queryInterface.addColumn('email_confirmations', 'userId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('email_confirmations', 'userId')
      .then(() => queryInterface.dropTable('email_confirmations'));
  }
};
