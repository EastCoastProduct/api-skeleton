'use strict';

const _ = require('lodash');
const utils = require('../utils/migrations');

module.exports = {
  up: function(queryInterface, Sequelize) {
    const baseSchema = {
      token: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      }
    };

    return queryInterface.createTable('email_updates', _.extend({},
      baseSchema,
      utils.timestamps
    ))
    .then(function() {
      return queryInterface.addColumn('email_updates', 'userId', {
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
    return queryInterface.removeColumn('email_updates', 'userId')
      .then(function() {
        return queryInterface.dropTable('email_updates');
      });
  }
};
