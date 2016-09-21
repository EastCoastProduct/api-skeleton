'use strict';

const authorization = require('./authorization');
const mock = require('node-mocks-http');
const test = require('tape');
const lang = require('../config/language');
const helpers = require('../utils/test/helper');

test('Authorization', t => {

  t.test('Failed', f => {
    f.test('It should return 403 User not confirmed', ft => {
      let req = mock.createRequest({
        method: 'POST',
        url: '/users/1',
        params: { userId: 1 }
      });
      req.headers.authorization = helpers.getAuthorizationHeader(2);
      let res = mock.createResponse();

      authorization.isConfirmed(req, res, err => {
        ft.same(
          err,
          {status: 403, message: lang.notConfirmed(lang.models.user)}
        );
        ft.end();
      });
    });

    f.test('It should fail because the user does not exist', ft => {
      let req = mock.createRequest({
        method: 'GET',
        url: '/users'
      });
      req.headers.authorization = helpers.getAuthorizationHeader(1950);
      let res = mock.createResponse();

      authorization.isConfirmed(req, res, err => {
        ft.same(err, {status: 404, message: lang.notFound(lang.models.user)});
        ft.end();
      });
    });

    f.test('It should fail but not break because user is not admin', ft => {
      let req = mock.createRequest({
        method: 'GET',
        url: '/users'
      });
      req.headers.authorization = helpers.getAuthorizationHeader(13);
      let res = mock.createResponse();

      authorization.isAdmin()(req, res, err => {
        ft.error(err, 'There should be no error');
        ft.end();
      });
    });

    f.test('It should fail because user is not admin', ft => {
      let req = mock.createRequest({
        method: 'GET',
        url: '/users'
      });
      req.headers.authorization = helpers.getAuthorizationHeader(13);
      let res = mock.createResponse();

      authorization.isAdmin(true)(req, res, err => {
        ft.same(err, {status: 403, message: lang.notAuthorized});
        ft.end();
      });
    });
  });

  t.test('Success', s => {
    s.test('It should succeed because user is confirmed', st => {
      let req = mock.createRequest({
        method: 'POST',
        url: '/users/1',
        params: { userId: 1 }
      });
      req.headers.authorization = helpers.getAuthorizationHeader(13);
      let res = mock.createResponse();

      authorization.isConfirmed(req, res, err => {
        st.error(err, 'There should be no error because user is confirmed');
        st.end();
      });
    });

    s.test('It should succeed because user is admin', st => {
      let req = mock.createRequest({
        method: 'GET',
        url: '/users'
      });
      req.headers.authorization = helpers.getAuthorizationHeader(3);
      let res = mock.createResponse();

      authorization.isAdmin()(req, res, err => {
        st.error(err, 'There should be no error because user is admin');
        st.end();
      });
    });

    s.test('It should succeed because user is superadmin', st => {
      let req = mock.createRequest({
        method: 'GET',
        url: '/users'
      });
      req.headers.authorization = helpers.getAuthorizationHeader(1);
      let res = mock.createResponse();

      authorization.isSuperAdmin()(req, res, err => {
        st.error(err, 'There should be no error because user is superadmin');
        st.end();
      });
    });
  });
});
