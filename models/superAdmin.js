'use strict';

const bcrypt = require('bcrypt');
const config = require('../config');

/* istanbul ignore next */
module.exports = function(sequelize, DataTypes) {

  const superAdmin = sequelize.define('superAdmin', {
    bio: {
      type: DataTypes.STRING(1000)
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set: function(v) {
        this.setDataValue('email', v.toLowerCase());
      }
    },
    firstname: {
      type: DataTypes.STRING
    },
    lastname: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set: function(v) {
        const salt = bcrypt.genSaltSync(config.genSaltRounds);
        const hash = bcrypt.hashSync(v, salt);

        this.setDataValue('password', hash);
      }
    }
  }, {
    instanceMethods: {
      toJSON: function() {
        var values = this.dataValues;

        values.password = undefined;

        return values;
      }
    },
    tableName: 'super_admins'
  });

  return superAdmin;
};
