'use strict';

const populateTimestamps = require('../migrations').populateTimestamps;
const users = [
  {
    // id: 1,
    // user is super admin
    // will update firstname
    email: 'john.doe@ecp.io',
    firstname: 'Harry',
    lastname: 'Richardson',
    password: 'Password123',
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
    password: 'Password123',
    confirmed: false
  },
  {
    // id: 3,
    // user is admin
    email: 'user3@ecp.io',
    firstname: 'Jacqueline',
    lastname: 'Wright',
    password: 'Password123',
    confirmed: true,
    admin: true
  },
  {
    // id: 4,
    // this user will be deleted
    email: 'user4@ecp.io',
    firstname: 'Helen',
    lastname: 'Arnold',
    password: 'Password123',
    confirmed: true
  },
  {
    // id: 5,
    // this user forgot his password
    // this user is trying to change mail to existing
    email: 'forgot.password@ecp.io',
    firstname: 'Forgety',
    lastname: 'Forget',
    password: 'Password123',
    confirmed: true
  },
  {
    // id: 6,
    // this user will be deleted
    email: 'delete.one@ecp.io',
    firstname: 'delete',
    lastname: 'deletey',
    password: 'Password123',
    confirmed: true
  },
  {
    // id: 7,
    // this user will be deleted
    email: 'delete.two@ecp.io',
    firstname: 'delete',
    lastname: 'deletey2',
    password: 'Password123',
    confirmed: true
  },
  {
    // id: 8,
    // this user will be updated
    email: 'update.one@ecp.io',
    firstname: 'update',
    lastname: 'updatey2',
    password: 'Password123',
    confirmed: true
  },
  {
    // id: 9,
    // this user will be confirmed
    email: 'confirmed.one@ecp.io',
    firstname: 'confirmed',
    lastname: 'user',
    password: 'Password123',
    confirmed: false
  },
  {
    // id: 10,
    // this user will change his email
    email: 'change.email@ecp.io',
    firstname: 'change',
    lastname: 'emailUser',
    password: 'Password123',
    confirmed: true
  },
  {
    // id: 11,
    // this user will want to change his email
    email: 'change.email2@ecp.io',
    firstname: 'change',
    lastname: 'changeTwo',
    password: 'Password123',
    confirmed: true
  },
  {
    // id: 12,
    // this user will want to change his email
    email: 'change.email3@ecp.io',
    firstname: 'change',
    lastname: 'changeThree',
    password: 'Password123',
    confirmed: true
  },
  {
    // id: 13,
    // this user needs to stay confirmed
    email: 'stay.confirmed@ecp.io',
    firstname: 'change',
    lastname: 'stay',
    password: 'Password123',
    confirmed: true
  },
  {
    // id: 14,
    // this user will change password
    email: 'change.password123@ecp.io',
    firstname: 'change',
    lastname: 'passChange',
    password: 'Password123',
    confirmed: true
  }
];

module.exports = populateTimestamps(users);
