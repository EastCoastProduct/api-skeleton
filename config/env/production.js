'use strict'

const _ = require('lodash');
const defaultConfig = require('./development');

// TODO edit when ready for production
const production = {
  env: 'production'
};


module.exports = _.merge({}, production, defaultConfig);
