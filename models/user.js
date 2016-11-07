'use strict';

const bcrypt = require('bcrypt');
const config = require('../config');
const logger = require('../utils/logger');
const lang = require('../config/language');
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
        if (resourceId !== model.resourceId) {
          resource.remove({ id: resourceId })
            .catch( err => logger.logAppError(
              lang.errors.unableToDeletePreviousImage,
              err
            ));
        }
        callback();
      },
      afterDestroy: function(model, options, callback) {
        if (!model.resourceId) return callback();
        let resource = hookServices(this, 'resource');
        resource.remove({ id: model.resourceId })
          .catch( err => logger.logAppError(
            lang.errors.unableToDeleteUserResource,
            err
          ));
        callback();
      }
    }
  });

  return user;
};
