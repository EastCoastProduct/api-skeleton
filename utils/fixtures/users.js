'use strict';

const populateTimestamps = require('../migrations').populateTimestamps;
const users = [
  {
    // id: 1,
    // user is super admin
    email: 'john.doe@ecp.io',
    firstname: 'Harry',
    lastname: 'Richardson',
    password: 'password123',
    confirmed: true,
    admin: true,
    superAdmin: true
  },
  // user not confirmed
  {
    // id: 2,
    email: 'not.confirmed@ecp.io',
    firstname: 'Theresa',
    lastname: 'Bennett',
    password: 'password123',
    confirmed: false
  },
  {
    // id: 3,
    // user is admin
    email: 'user3@ecp.io',
    firstname: 'Jacqueline',
    lastname: 'Wright',
    password: 'password123',
    confirmed: true,
    admin: true
  },
  {
    // id: 4,
    // this user will be deleted
    email: 'user4@ecp.io',
    firstname: 'Helen',
    lastname: 'Arnold',
    password: 'password123',
    confirmed: true
  }
];

module.exports = populateTimestamps(users);
