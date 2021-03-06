'use strict';

const populatePresets = require('../migrations').populatePresets;

const preset = index => ({
  firstname: `firstname${index}`,
  lastname: `lastname${index}`,
  password: 'Password123',
  email: `firstname${index}.lastname${index}@mail.com`,
  confirmed: true
});

const users = [{
  // regular user will not change
  // id: 1,
  firstname: 'regular',
  lastname: 'regular',
  email: 'regular@mail.com'
}, {
  // regular user
  // will update firstname in test
  // id: 2,
  firstname: 'name',
  lastname: 'lastname',
  email: 'user@mail.com',
  resourceId: 1
}, {
  // user for Q&A testing (do not change)
  // id: 3,
  firstname: 'John',
  lastname: 'Doe',
  password: 'Password123!',
  email: 'john@doe.com'
}, {
  // user not confirmed
  // id: 4,
  email: 'not.confirmed@mail.com',
  confirmed: false
}, {
  // this user will be deleted in test
  // id: 5,
  resourceId: 2
}, {
  // forgot password test
  // change mail to existing test
  // id: 6,
  email: 'forgot.password@mail.com'
}, {
  // this user will be deleted in test
  // id: 7,
  email: 'delete.one@mail.com'
}, {
  // this user will be deleted in test
  // id: 8,
  email: 'delete.two@mail.com'
}, {
  // this user will be updated in test
  // id: 9,
  email: 'update.one@mail.com'
}, {
  // this user will be confirmed in test
  // id: 10,
  email: 'confirmed.one@mail.com',
  confirmed: false
}, {
  // id: 11,
  // this user will change his email in test
  email: 'change.email@mail.com'
}, {
  // this user will request mail change in test
  // id: 12,
  email: 'change.email2@mail.com'
}, {
  // this user will request mail change in test
  // id: 13,
  email: 'change.email3@mail.com'
}, {
  // this user needs to stay confirmed
  // this user needs to have his resource
  // id: 14,
  email: 'stay.confirmed@mail.com',
  resourceId: 8
}, {
  // this user will change password in test
  // this email is used for a failed email change in test
  // id: 15,
  email: 'change.password@mail.com'
}, {
  // this user will request change email in test
  // id: 16,
  email: 'change.email4@mail.com'
}, {
  // id: 17,
  // this user has resorces and will get deleted in test
  email: 'delete.three@mail.com',
  resourceId: 7
}, {
  // id: 18
  // this user will fail to change his email in test
  email: 'change.email5@mail.com'
}, {
  // id: 19
  // this user will want to resend his confirmation
  email: 'resend@mail.com'
}, {
  // id: 20
  // this user be confirmed by superadmin
  email: 'confirmed.superadmin@mail.com',
  confirmed: false
}, {
  // id: 21
  // this user will be unconfirmed by superadmin
  // superadmin will fail to change this user email
  email: 'not.confirmed.superadmin@mail.com'
}, {
  // id: 22
  // this user will have his email changed by superadmin and confirmed
  email: 'superadmin.mail.change@mail.com',
  confirmed: false
}];

module.exports = populatePresets(users, preset);
