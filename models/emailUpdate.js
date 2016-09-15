'use strict';

module.exports = function(sequelize, DataTypes) {
  const emailUpdate = sequelize.define('emailUpdate', {
    token: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV1,
      type: DataTypes.UUID,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        emailUpdate.belongsTo(models.user);
      }
    },
    tableName: 'email_updates'
  });

  return emailUpdate;
};
