'use strict'

const _ = require('lodash');
const defaultConfig = require('./development');

const staging = {
  env: 'staging'
};


module.exports = _.merge({}, staging, defaultConfig);
