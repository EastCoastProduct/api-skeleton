'use strict';

const tests = require('tape');
const helpers = require('../../utils/test/helper');
const EmailConfirmation = require('../../models').emailConfirmation;
const lang = require('../../config/language');

tests('POST /changeEmail', changeEmail => {

  changeEmail.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', '/changeEmail')
        .send({wrong: 'asd'})
        .end((err, res) => {
          const debugInfoError = [
            { message: lang.unrecognizedParameter, path: 'wrong' },
            { message: lang.required, path: 'oldEmail' },
            { message: lang.required, path: 'newEmail' },
            { message: lang.required, path: 'password' }
          ];

          test.same({
            debugInfo: res.body.debugInfo,
            status: res.status,
            message: res.body.message
          }, {
            debugInfo: debugInfoError,
            status: 400,
            message: lang.parametersError
          });
          test.end();
        });
    });

    failed.test('User not found', test => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'not.a.user@ecp.io',
          newEmail: 'totaly.changed@ecp.io',
          password: 'Password123'
        })
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.notFound(lang.models.user)}
          );
          test.end();
        });
    });

    failed.test('User sent wrong password', test => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'user3@ecp.io',
          newEmail: 'totaly.changed123@ecp.io',
          password: 'WrongPassword123'
        })
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.wrongPassword}
          );
          test.end();
        });
    });

    failed.test('User sent an email that is in use', test => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'user3@ecp.io',
          newEmail: 'change.password@ecp.io',
          password: 'Password123'
        })
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.emailInUse}
          );
          test.end();
        });
    });
  });

  changeEmail.test('Success', success => {
    let emailStub = helpers.stubMailer({status: 200});
    success.test('User request for email change success', test => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'change.email4@ecp.io',
          newEmail: 'try.changed123@ecp.io',
          password: 'Password123'
        })
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 200, message: lang.requestChangeEmail}
          );
          test.error(!emailStub.calledOnce, 'Mailer should have been called');
          helpers.resetStub(emailStub);
          test.end();
        });
    });

    success.test('User successfully changed email', test => {
      EmailConfirmation.findOne({where: {email: 'cool.mail@ecp.io'}})
        .then(ecs => {
          helpers.json('post', '/emailConfirm')
            .send({token: ecs.token})
            .end((err, res) => {
              test.same(
                {status: res.status, message: res.body.message},
                {status: 200, message: lang.emailConfirmed}
              );
              test.end();
            });
        });
    });
  });
});
