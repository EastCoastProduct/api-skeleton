'use strict';

const test = require('tape');
const uuid = require('node-uuid');
const helpers = require('../../utils/test/helper');
const EmailUpdate = require('../../models').emailUpdate;
const lang = require('../../config/language');

test('POST /changeEmail', t => {

  t.test('Failed', f => {
    f.test('Invalid params', ft => {
      helpers.json('post', '/changeEmail')
        .send({wrong: 'asd'})
        .end((err, res) => {
          const debugInfoError = [
            { message: lang.unrecognizedParameter, path: 'wrong' },
            { message: lang.required, path: 'oldEmail' },
            { message: lang.required, path: 'newEmail' },
            { message: lang.required, path: 'password' }
          ];

          ft.same({
            debugInfo: res.body.debugInfo,
            status: res.status,
            message: res.body.message
          }, {
            debugInfo: debugInfoError,
            status: 400,
            message: lang.parametersError
          });
          ft.end();
        });
    });

    f.test('User not found', ft => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'not.a.user@ecp.io',
          newEmail: 'totaly.changed@ecp.io',
          password: 'Password123'
        })
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.notFound(lang.models.user)}
          );
          ft.end();
        });
    });
  });

  t.test('Success', s => {
    s.test('User request for email change success', st => {
      let emailStub = helpers.stubMailer({status: 200});
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'change.email2@ecp.io',
          newEmail: 'try.changed@ecp.io',
          password: 'Password123'
        })
        .end((err, res) => {
          st.same(
            {status: res.status, message: res.body.message},
            {status: 200, message: lang.requestChangeEmail}
          );
          helpers.resetStub(emailStub);
          st.end();
        });
    });
  });
});

test('POST /changeEmail/:token', t => {
  t.test('Failed', f => {
    f.test('Token does not exist', ft => {
      helpers.json('post', `/changeEmail/${uuid.v1()}`).end((err, res) => {
        ft.same(
          {status: res.status, message: res.body.message},
          {status: 404, message: lang.notFound(lang.models.emailUpdate)}
        );
        ft.end();
      });
    });
  });

  t.test('Success', s => {
    s.test('Successfully changed user email', st => {
      let emailStub = helpers.stubMailer({status: 200});
      EmailUpdate.findOne({where: {email: 'totaly.changed@ecp.io'}})
      .then(eus => {
        helpers.json('post', `/changeEmail/${eus.token}`).end((err, res) => {
          st.same(
            {status: res.status, message: res.body.message},
            {status: 200, message: lang.changedEmail}
          );
          helpers.resetStub(emailStub);
          st.end();
        });
      });
    });
  });
});
