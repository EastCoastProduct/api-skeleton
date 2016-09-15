'use strict';

module.exports = function(sequelize, DataTypes) {
  const forgotPassword = sequelize.define('forgotPassword', {
    token: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV1,
      type: DataTypes.UUID,
      primaryKey: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        forgotPassword.belongsTo(models.user);
      }
    },
    tableName: 'forgot_passwords'
  });

  return forgotPassword;
};
