'use strict';

const bcrypt = require('bcrypt');
const config = require('../config');

module.exports = function(sequelize, DataTypes) {
  const user = sequelize.define('user', {
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    bio: {
      type: DataTypes.STRING(1000)
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set: function(v) {
        const salt = bcrypt.genSaltSync(config.genSaltRounds);
        const hash = bcrypt.hashSync(v, salt);

        this.setDataValue('password', hash);
      }
    },
    superAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    instanceMethods: {
      toJSON: function() {
        var values = this.dataValues;

        values.admin = undefined;
        values.password = undefined;
        values.superAdmin = undefined;

        return values;
      }
    },
    classMethods: {
      associate: function(models) {
        user.hasOne(models.forgotPassword);
        user.hasOne(models.emailUpdate);
      }
    }
  });

  return user;
};
