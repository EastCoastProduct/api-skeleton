'use strict';

const _ = require('lodash');
const utils = require('../utils/migrations');

module.exports = {
  up: function(queryInterface, Sequelize) {
    const baseSchema = {
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mimetype: {
        type: Sequelize.STRING,
        allowNull: false
      },
      extension: {
        type: Sequelize.STRING,
        allowNull: false
      }
    };

    return queryInterface.createTable('resources', _.extend({},
      utils.id,
      baseSchema,
      utils.timestamps
    ))
    .then(function() {
      return queryInterface.addColumn('users', 'resourceId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'resources',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'SET NULL',
        onUpdate: 'SET NULL'
      });
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'resourceId')
      .then(function() {
        return queryInterface.dropTable('resources');
      });
  }
};
