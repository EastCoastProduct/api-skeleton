'use strict';

const tests = require('tape');
const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');

tests('POST /authenticate', authenticate => {

  authenticate.test('Failed', failed => {
    failed.test('Invalid parameters', test => {
      helpers.json('post', '/superAdmin/authenticate')
        .send({ invalidParam: 'wrong' })
        .end( (err, res) => {
          const debugInfoError = [
            { path: 'invalidParam', message: lang.errors.unrecognizedParameter },
            { path: 'email', message: lang.errors.required },
            { path: 'password', message: lang.errors.required }
          ];

          test.same({
            status: res.status,
            message: res.body.message,
            debugInfo: res.body.debugInfo
          }, {
            status: 400,
            message: lang.errors.parametersError,
            debugInfo: debugInfoError
          });
          test.end();
        });
    });

    failed.test('User does not exist', test => {
      helpers.json('post', '/superAdmin/authenticate')
        .send({
          email: 'not.user@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.errors.notFound(lang.models.user) });
          test.end();
        });
    });

    failed.test('Wrong password', test => {
      helpers.json('post', '/superAdmin/authenticate')
        .send({
          email: 'super.admin@mail.com',
          password: 'Wrong123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.wrongPassword }
          );
          test.end();
        });
    });

  });

  authenticate.test('Success', success => {

    success.test('Successfull login super admin user', test => {
      helpers.json('post', '/superAdmin/authenticate')
        .send({
          email: 'super.admin@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(res.status, 200);
          test.error(!res.body.token, 'No token');
          test.error(!res.body.user, 'No user');
          test.end();
        });
    });

  });
});
