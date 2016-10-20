'use strict';

const authorization = require('./authorization');
const tests = require('tape');
const lang = require('../config/language');
const helpers = require('../utils/test/helper');
const mock = require('node-mocks-http');

tests('Authorization', authorizationTest => {

  authorizationTest.test('Failed', failed => {
    failed.test('It should return 403 User not confirmed', test => {
      const { req, res } = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(4);

      authorization.isConfirmed(req, res, err => {
        test.same(
          err,
          { status: 403, message: lang.errors.notConfirmed(lang.models.user) }
        );
        test.end();
      });
    });

    failed.test('It should fail because the user does not exist', test => {
      const { req, res } = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(1950);

      authorization.isConfirmed(req, res, err => {
        test.same(err, { status: 404, message: lang.errors.notFound(lang.models.user) });
        test.end();
      });
    });

    failed.test('It should fail because super admin user does not exist', test => {
      const { req, res } = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getSuperAdminAuthorizationHeader(1950);

      authorization.isSuperAdmin(req, res, err => {
        test.same(err, { status: 404, message: lang.errors.notFound(lang.models.user) });
        test.end();
      });
    });

    failed.test('It should fail if user is not super admin', test => {
      const { req, res } = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(3);

      authorization.isSuperAdmin(req, res, err => {
        test.same(err, { status: 403, message: lang.errors.notAuthorized });
        test.end();
      });
    });

    failed.test('It should fail because user is not the owner', test => {
      const req = mock.createRequest({
        method: 'POST',
        url: '/dummy/:userId',
        params: { userId: 1 }
      });
      const res = mock.createResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(3);

      authorization.isOwner(req, res, err => {
        test.same(err, { status: 403, message: lang.errors.notAuthorized });
        test.end();
      });
    });
  });

  authorizationTest.test('Success', success => {
    success.test('It should succeed because user is confirmed', test => {
      const { req, res } = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(3);

      authorization.isConfirmed(req, res, err => {
        test.error(err, 'There should be no error because user is confirmed');
        test.end();
      });
    });

    success.test('It should succeed because user is superadmin', test => {
      const { req, res } = helpers.generateRequestAndResponse();
      req.headers.authorization = helpers.getSuperAdminAuthorizationHeader(1);

      authorization.isSuperAdmin(req, res, err => {
        test.error(err, 'There should be no error because user is superadmin');
        test.end();
      });
    });

    success.test('It should succeed because user is the owner', test => {
      const req = mock.createRequest({
        method: 'POST',
        url: '/dummy/:userId',
        params: { userId: 3 }
      });
      const res = mock.createResponse();
      req.headers.authorization = helpers.getAuthorizationHeader(3);

      authorization.isOwner(req, res, err => {
        test.error(err, 'There should be no error becase user is owner');
        test.end();
      });
    });
  });
});
