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
        unique: true
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      facebookId: {
        type: Sequelize.STRING,
        unique: true
      },
      facebookToken: {
        type: Sequelize.STRING
      },
      facebookEmail: {
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
