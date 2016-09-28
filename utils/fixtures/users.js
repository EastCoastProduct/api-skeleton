'use strict';

const populatePresets = require('../migrations').populatePresets;

const preset = index => ({
  firstname: `McFirstname${index}`,
  lastname: `McLastname${index}`,
  password: 'Password123',
  confirmed: false
});

const users = [
  {
    // id: 1,
    // user is super admin
    // will update firstname
    email: 'john.doe@ecp.io',
    confirmed: true,
    admin: true,
    superAdmin: true,
    resourceId: 1
  },
  // user not confirmed
  {
    // id: 2,
    email: 'not.confirmed@ecp.io'
  },
  {
    // id: 3,
    // user is admin
    email: 'user3@ecp.io',
    confirmed: true,
    admin: true
  },
  {
    // id: 4,
    // this user will be deleted
    email: 'user4@ecp.io',
    confirmed: true
  },
  {
    // id: 5,
    // this user forgot his password
    // this user is trying to change mail to existing
    email: 'forgot.password@ecp.io',
    confirmed: true
  },
  {
    // id: 6,
    // this user will be deleted
    email: 'delete.one@ecp.io',
    confirmed: true
  },
  {
    // id: 7,
    // this user will be deleted
    email: 'delete.two@ecp.io',
    confirmed: true
  },
  {
    // id: 8,
    // this user will be updated
    email: 'update.one@ecp.io',
    confirmed: true
  },
  {
    // id: 9,
    // this user will be confirmed
    email: 'confirmed.one@ecp.io'
  },
  {
    // id: 10,
    // this user will change his email
    email: 'change.email@ecp.io',
    confirmed: true
  },
  {
    // id: 11,
    // this user will want to change his email
    email: 'change.email2@ecp.io',
    confirmed: true
  },
  {
    // id: 12,
    // this user will want to change his email
    email: 'change.email3@ecp.io',
    confirmed: true
  },
  {
    // id: 13,
    // this user needs to stay confirmed
    email: 'stay.confirmed@ecp.io',
    confirmed: true
  },
  {
    // id: 14,
    // this user will change password
    // this email is used for a failed email change
    email: 'change.password@ecp.io',
    confirmed: true
  },
  {
    // id: 15,
    // this user will want to change his email
    email: 'change.email4@ecp.io',
    confirmed: true
  },
  {
    // id: 16,
    // this user has an image and will get deleted
    email: 'delete.three@ecp.io',
    confirmed: true,
    resourceId: 7
  },
  {
    // id: 17
    // this user will fail to change his email
    email: 'change.email5@ecp.io',
    confirmed: true
  }
];

module.exports = populatePresets(users, preset);
