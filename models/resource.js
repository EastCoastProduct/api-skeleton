'use strict';

const s3 = require('./services/s3');

module.exports = function(sequelize, DataTypes) {
  const resource = sequelize.define('resource', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false
    },
    extension: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        resource.hasOne(models.user);
      }
    },
    hooks: {
      beforeDestroy: function(file, options, cb) {
        s3.remove({_filename: file.path});
        cb();
      }
    },
    tableName: 'resources'
  });

  return resource;
};
