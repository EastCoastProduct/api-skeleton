'use strict';

const generic = require('./_generic');
const models = require('../');
const langModel = require('../../config/language').models;

module.exports = {
  emailUpdate: require('./emailUpdate'),
  emailConfirmation: require('./emailConfirmation'),
  forgotPassword: require('./forgotPassword'),
  user: generic(models.user, langModel.user)
};
