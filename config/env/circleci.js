'use strict';

const _ = require('lodash');
const defaultConfig = require('./development');

const circleci = {
  env: 'circleci',

  files: {
    size: 0.2, // in MBs
    maxNum: 5
  }
};

module.exports = _.merge({}, defaultConfig, circleci);
