'use strict';

module.exports = function(sequelize, DataTypes) {
  const emailConfirmation = sequelize.define('emailConfirmation', {
    email: {
      type: DataTypes.STRING
    },
    token: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV1,
      type: DataTypes.UUID,
      primaryKey: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        emailConfirmation.belongsTo(models.user);
      }
    },
    tableName: 'email_confirmations'
  });

  return emailConfirmation;
};
