'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('../config');
const Sequelize = require('sequelize');

var id = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  }
};

const encryptPassword = (password) => {
  const salt = bcrypt.genSaltSync(config.genSaltRounds);
  return bcrypt.hashSync(password, salt);
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
  if (o.password) o.password = encryptPassword(o.password);
  o.createdAt = new Date().toUTCString();
  o.updatedAt = new Date().toUTCString();
  return o;
});

module.exports = {
  id: id,
  encryptPassword: encryptPassword,
  timestamps: timestamps,
  populateTimestamps: populateTimestamps
};
