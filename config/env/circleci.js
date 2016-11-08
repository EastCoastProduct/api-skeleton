'use strict';

const _ = require('lodash');
const defaultConfig = require('./development');

const circleci = {
  env: 'circleci'
};

module.exports = _.merge({}, defaultConfig, circleci);
