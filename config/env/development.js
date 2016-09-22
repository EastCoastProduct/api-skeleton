'use strict';

/*
  Default configuration file
  Used for development and for overriding
*/
module.exports = {
  env: 'development',

  // s3 configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'notToday',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'notToday'
  },

  s3Url: {
    bucketName: process.env.BUCKET_NAME || 'ecp-boilerplate',
    prefix: process.env.IMAGE_PREFIX || 'aPrefix'
  },

  apiUrl: 'http://192.168.50.4:3000',
  webUrl: 'http://192.168.50.4:7000',
  superAdminUrl: 'http://192.168.50.4:7001',
  mockTmpDir: false,

  genSaltRounds: 10,
  jwtKey: 'shhhhhhhared-secret',

  // tokenExpiration : 60 * 60 * 24 * 7 // 7 days in seconds
  tokenExpiration: 60 * 60 * 24 * 7 * 1000,

  files: {
    size: 1, // in MBs
    maxNum: process.env.MAX_NUM_FILES || 5
  },

  statusTimeout: 1500,

  paginate: {
    offset: 0,
    limit: 20
  },

  supportedImageExtensions:  ['.jpeg', '.jpg', '.png', '.gif', '.bmp'],
  supportedDocumentsExtensions: ['.pdf', '.csv', '.xls', '.xlsx', '.doc',
   '.docx', '.txt', '.ods', '.odt', '.zip', '.gif', '.jpg', '.png'],

  // mail option (mailtrap service)
  mailOptions: {
    host: 'mailtrap.io',
    port: 2525,
    auth: {
      user: 'c4c74a71ddb99c',
      pass: 'ebe4e4f099829b'
    }
  },

  language: 'en'
};
