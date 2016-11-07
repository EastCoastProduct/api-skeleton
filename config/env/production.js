'use strict'

const _ = require('lodash');
const defaultConfig = require('./development');

// TODO edit when ready for production
const production = {
  env: 'production',

  syslog: {
    host: process.env.SYSLOG_HOST,
    port: process.env.SYSLOG_PORT
  }
};


module.exports = _.merge({}, defaultConfig, production);
