'use strict';

const test = require('tape');
const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');

/*
  Invalid params
*/
test('/authenticate Invalid parameters', t => {
  helpers.json('post', '/authenticate')
    .send({invalidParam: 'cow'})
    .end((err, res) => {
      const debugInfoError = [
        {path: 'invalidParam', message: lang.unrecognizedParameter},
        {path: 'email', message: lang.required},
        {path: 'password', message: lang.required}
      ];

      t.same({
        status: res.status,
        message: res.body.message,
        debugInfo: res.body.debugInfo
      }, {
        status: 400,
        message: lang.parametersError,
        debugInfo: debugInfoError
      });
      t.end();
    });
});

/*
  Valid params
*/

test('/authenticate User does not exist', t => {
  helpers.json('post', '/authenticate')
    .send({
      email: 'not.user@ecp.io',
      password: 'password123'
    })
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 404, message: lang.notFound(lang.models.user)});
      t.end();
    });
});

test('/authenticate User not confirmed', t => {
  helpers.json('post', '/authenticate')
    .send({
      email: 'not.confirmed@ecp.io',
      password: 'password123'
    })
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 400, message: lang.notConfirmed(lang.models.user)}
      );
      t.end();
    });
});

test('/authenticate Wrong password', t => {
  helpers.json('post', '/authenticate')
    .send({
      email: 'john.doe@ecp.io',
      password: 'wrong'
    })
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 400, message: lang.wrongPassword}
      );
      t.end();
    });
});

test('/authenticate Successfull login', t => {
  helpers.json('post', '/authenticate')
    .send({
      email: 'john.doe@ecp.io',
      password: 'password123'
    })
    .end((err, res) => {
      t.same(res.status, 200);
      t.error(!res.body.token, 'No token');
      t.error(!res.body.user, 'No user');
      t.end();
    });
});
