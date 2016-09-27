'use strict';

const authorization = require('./authorization');
const tests = require('tape');
const lang = require('../config/language');
const helpers = require('../utils/test/helper');

tests('Authorization', authorizationTest => {

  authorizationTest.test('Failed', failed => {
    failed.test('It should return 403 User not confirmed', test => {
      const {req, res} = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(2);

      authorization.isConfirmed(req, res, err => {
        test.same(
          err,
          {status: 403, message: lang.notConfirmed(lang.models.user)}
        );
        test.end();
      });
    });

    failed.test('It should fail because the user does not exist', test => {
      const {req, res} = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(1950);

      authorization.isConfirmed(req, res, err => {
        test.same(err, {status: 404, message: lang.notFound(lang.models.user)});
        test.end();
      });
    });

    failed.test('It should fail but not break because user is not admin', test => {
      const {req, res} = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(13);

      authorization.isAdmin()(req, res, err => {
        test.error(err, 'There should be no error');
        test.end();
      });
    });

    failed.test('It should fail because user is not admin', test => {
      const {req, res} = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(13);

      authorization.isAdmin(true)(req, res, err => {
        test.same(err, {status: 403, message: lang.notAuthorized});
        test.end();
      });
    });
  });

  authorizationTest.test('Success', success => {
    success.test('It should succeed because user is confirmed', test => {
      const {req, res} = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(13);

      authorization.isConfirmed(req, res, err => {
        test.error(err, 'There should be no error because user is confirmed');
        test.end();
      });
    });

    success.test('It should succeed because user is admin', test => {
      const {req, res} = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(3);

      authorization.isAdmin()(req, res, err => {
        test.error(err, 'There should be no error because user is admin');
        test.end();
      });
    });

    success.test('It should succeed because user is superadmin', test => {
      const {req, res} = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(1);

      authorization.isSuperAdmin()(req, res, err => {
        test.error(err, 'There should be no error because user is superadmin');
        test.end();
      });
    });
  });
});
