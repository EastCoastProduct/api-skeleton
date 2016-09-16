'use strict';

const populateTimestamps = require('../migrations').populateTimestamps;
const users = [
  {
    email: 'hrichardson0@plala.or.jp',
    firstname: 'Harry',
    lastname: 'Richardson',
    password: 'iDcltEHzR2MA'
  }, {
    email: 'tbennett1@fotki.com',
    firstname: 'Theresa',
    lastname: 'Bennett',
    password: 'GJpdXURha'
  }, {
    email: 'jwright2@google.it',
    firstname: 'Jacqueline',
    lastname: 'Wright',
    password: 'liH1xKb'
  }, {
    email: 'harnold3@goo.ne.jp',
    firstname: 'Helen',
    lastname: 'Arnold',
    password: 'L2bUQR1Dl1L'
  }
];

module.exports = populateTimestamps(users);
