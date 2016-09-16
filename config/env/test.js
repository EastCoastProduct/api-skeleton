'use strict';

const _ = require('lodash');
const defaultConfig = require('./development');

const test = {
  env: 'test'
};

module.exports = _.merge({}, test, defaultConfig);
