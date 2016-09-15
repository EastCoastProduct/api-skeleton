'use strict';

const Sequelize = require('sequelize');

var id = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  }
};

var timestamps = {
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE
  }
};

module.exports = {
  id: id,
  timestamps: timestamps
};
