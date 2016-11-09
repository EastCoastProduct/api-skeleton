'use strict';

const _ = require('lodash');
const utils = require('../../utils/migrations');

module.exports = {
  up: function(queryInterface, Sequelize) {
    const baseSchema = {
      bio: {
        type: Sequelize.STRING(1000)
      },
      confirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      facebookId: {
        type: Sequelize.INTEGER
      },
      facebookToken: {
        type: Sequelize.STRING
      }
    };

    return queryInterface.createTable('users', _.extend({},
      utils.id,
      baseSchema,
      utils.timestamps
    ));
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};
