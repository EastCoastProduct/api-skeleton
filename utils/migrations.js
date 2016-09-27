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

const populatePresets = (fixtureArray, presetFunction, hasTimestamps = true) =>
  _.map(fixtureArray, (fixture, index) => {
    fixture = _.merge({}, presetFunction(index), fixture);
    if (fixture.password) fixture.password = encryptPassword(fixture.password);

    if (hasTimestamps) {
      fixture.createdAt = new Date().toUTCString();
      fixture.updatedAt = new Date().toUTCString();
    }
    return fixture;
  });

module.exports = {
  id: id,
  encryptPassword: encryptPassword,
  timestamps: timestamps,
  populatePresets: populatePresets
};
