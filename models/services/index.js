'use strict';

const generic = require('./_generic');
const models = require('../');
const langModel = require('../../config/language').models;

module.exports = {
  emailConfirmation: require('./emailConfirmation'),
  forgotPassword: require('./forgotPassword'),
  resource: require('./resource'),
  s3: require('./s3'),
  user: generic(models.user, langModel.user),
  superAdmin: generic(models.superAdmin)

};
