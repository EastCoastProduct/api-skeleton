'use strict';

const test = require('tape');
const helpers = require('../../utils/test/helper');
const EmailConfirmation = require('../../models').emailConfirmation;
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

    f.test('User sent wrong password', ft => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'user3@ecp.io',
          newEmail: 'totaly.changed123@ecp.io',
          password: 'WrongPassword123'
        })
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.wrongPassword}
          );
          ft.end();
        });
    });

    f.test('User sent an email that is in use', ft => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'user3@ecp.io',
          newEmail: 'change.password@ecp.io',
          password: 'Password123'
        })
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.emailInUse}
          );
          ft.end();
        });
    });
  });

  t.test('Success', s => {
    let emailStub = helpers.stubMailer({status: 200});
    s.test('User request for email change success', st => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'change.email4@ecp.io',
          newEmail: 'try.changed123@ecp.io',
          password: 'Password123'
        })
        .end((err, res) => {
          st.same(
            {status: res.status, message: res.body.message},
            {status: 200, message: lang.requestChangeEmail}
          );
          st.error(!emailStub.calledOnce, 'Mailer should have been called');
          helpers.resetStub(emailStub);
          st.end();
        });
    });

    s.test('User successfully changed email', st => {
      EmailConfirmation.findOne({where: {email: 'cool.mail@ecp.io'}})
        .then(ecs => {
          helpers.json('post', '/emailConfirm')
            .send({token: ecs.token})
            .end((err, res) => {
              st.same(
                {status: res.status, message: res.body.message},
                {status: 200, message: lang.emailConfirmed}
              );
              st.end();
            });
        });
    });
  });
});
