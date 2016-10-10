'use strict';

const populatePresets = require('../migrations').populatePresets;

const preset = index => ({
  firstname: `superadmin${index}`,
  lastname: `superadmin${index}`,
  password: 'Password123',
  email: `superadmin${index}@mail.com`
});

const superAdmins = [{
  // check super admin login and authorization middleware
  // id: 1,
  email: 'super.admin@mail.com',
  firstname: 'superadmin',
  lastname: 'superadmin',
  password: 'Password123'
}, {
  // check super admin login and authorization middleware
  // id: 2,
  email: 'super.admin2@mail.com',
  password: 'Password123'
}];

module.exports = populatePresets(superAdmins, preset);
