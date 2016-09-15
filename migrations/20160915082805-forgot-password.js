'use strict';

const _ = require('lodash');
const utils = require('../utils/migrations');

module.exports = {
  up: function(queryInterface, Sequelize) {
    const baseSchema = {
      token: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      }
    };

    return queryInterface.createTable('forgot_passwords', _.extend({},
      baseSchema,
      utils.timestamps
    ))
    .then(function() {
      return queryInterface.addColumn('forgot_passwords', 'userId', {
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
    return queryInterface.removeColumn('forgot_passwords', 'userId')
      .then(function() {
        return queryInterface.dropTable('forgot_passwords');
      });
  }
};
