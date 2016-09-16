'use strict';

const _ = require('lodash');
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

const populateTimestamps = objArray => _.map(objArray, o => {
  o.createdAt = new Date().toUTCString();
  o.updatedAt = new Date().toUTCString();
  return o;
});

module.exports = {
  id: id,
  timestamps: timestamps,
  populateTimestamps: populateTimestamps
};
