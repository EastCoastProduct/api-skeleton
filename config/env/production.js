'use strict'

const _ = require('lodash');
const defaultConfig = require('./development');

// TODO edit when ready for production
const production = {
  env: 'development',

  apiUrl: 'http://192.168.50.4:3000',
  webUrl: 'http://192.168.50.4:7000',
  superAdminUrl: 'http://192.168.50.4:7001',
  mockTmpDir: false,

  // mail option (mailtrap service)
  mailOptions: {
    host: 'mailtrap.io',
    port: 2525,
    auth: {
      user: '50367760f5d53dcd7',
      pass: '4b653808929fcb'
    }
  }
}


module.exports = _.merge({}, production, defaultConfig);
