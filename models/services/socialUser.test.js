'use strict';

const services = require('.');
const tests = require('tape');

const User = require('../').user;

tests('Social user tests', socialUser => {

  socialUser.test('Facebook user test', facebookUser => {

    facebookUser.test('Get existing user', test => {
      let testProfile = {
        name: {
          givenName: 'facebookName',
          familyName: 'facebookLastName'
        },
        id: '130331354110247'
      };
      services.socialUser.getOrCreateFacebookUser(testProfile, 'TestToken')
      .then( user => {
        test.same(
          [user.firstname, user.lastname],
          ['facebookName', 'facebookLastName']
        );
        test.end();
      });
    });

    facebookUser.test('Create non-existing user', test => {
      let testProfile = {
        name: {
          givenName: 'newFacebookName',
          familyName: 'newFacebookLastName'
        },
        emails: [],
        id: '1111111111'
      };

      services.socialUser.getOrCreateFacebookUser(testProfile, 'NewTestToken')
      .then( user => {
        test.same(
          [user.firstname, user.lastname],
          ['newFacebookName', 'newFacebookLastName']
        );
        test.end();
      });
    });

    facebookUser.test('Check database', test => {

      User.unscoped().count({ where: { facebookId: { $ne: null }}})
      .then( count => {
        test.same(count, 2);
        test.end();
      });
    });

  });
});
