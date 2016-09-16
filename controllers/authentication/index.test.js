'use strict';

const test = require('tape');
const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');

/*
  Invalid params
*/
test('authentication invalid parameters', t => {
  helpers.json('post', '/authenticate')
    .send({invalidParam: 'cow'})
    .expect(400)
    .end((err, res) => {
      const debugInfoError = [
        {path: 'invalidParam', message: lang.unrecognizedParameter},
        {path: 'email', message: lang.required},
        {path: 'password', message: lang.required}
      ];

      t.same(res.body.message, lang.parametersError);
      t.same(res.body.debugInfo, debugInfoError);
      t.end();
    });
});

/*
  Valid params
*/

// User does not exist
test('authentication user does not exist', t => {
  helpers.json('post', '/authenticate')
    .send({
      email: 'john.doe@jd.com',
      password: 'password123'
    })
    .expect(404)
    .end((err, res) => {
      t.same(res.body.message, lang.notFound(lang.models.user));
      t.end();
    });
});

// User not confirmed

