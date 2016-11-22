'use strict';

const bcrypt = require('bcrypt');
const config = require('../config');
const hookServices = require('./services/_hooks');

module.exports = function(sequelize, DataTypes) {
  let resourceId;

  const user = sequelize.define('user', {
    bio: {
      type: DataTypes.STRING(1000)
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      set: function(value) {
        this.setDataValue('email', value.toLowerCase());
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
      set: function(value) {
        if (!value) return undefined;

        const salt = bcrypt.genSaltSync(config.genSaltRounds);
        const hash = bcrypt.hashSync(value, salt);

        this.setDataValue('password', hash);
      }
    },
    facebookId: {
      type: DataTypes.STRING,
      unique: true
    },
    facebookToken: {
      type: DataTypes.STRING
    },
    facebookEmail: {
      type: DataTypes.STRING
    }
  }, {
    instanceMethods: {
      toJSON: function() {
        var values = this.dataValues;

        values.password = undefined;
        values.facebookId = undefined;
        values.facebookToken = undefined;
        values.facebookEmail = undefined;

        return values;
      }
    },
    defaultScope: {
      where: {
        password: { $ne: null }
      }
    },
    scopes: {
      socialUsers: {
        where: { password: null }
      }
    },
    classMethods: {
      associate: function(models) {
        user.hasOne(models.forgotPassword);
        user.hasOne(models.emailConfirmation);
        user.belongsTo(models.resource);
      }
    },
    hooks: {
      beforeUpdate: function(model, options, callback) {
        resourceId = model._previousDataValues.resourceId;
        callback();
      },
      afterUpdate: function(model, options, callback) {
        let resource = hookServices(this, 'resource');
        if (resourceId) resource.remove({ id: resourceId });
        callback();
      },
      afterDestroy: function(model, options, callback) {
        if (!model.resourceId) return callback();
        let resource = hookServices(this, 'resource');
        resource.remove({ id: model.resourceId });
        callback();
      }
    }
  });

  return user;
};
