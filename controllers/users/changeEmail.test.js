'use strict';

const tests = require('tape');
const helpers = require('../../utils/test/helper');
const EmailConfirmation = require('../../models').emailConfirmation;
const lang = require('../../config/language');

tests('POST /changeEmail', changeEmail => {

  changeEmail.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', '/changeEmail')
        .send({ wrong: 'asd' })
        .end( (err, res) => {
          const debugInfoError = [
            { message: lang.errors.unrecognizedParameter, path: 'wrong' },
            { message: lang.errors.required, path: 'oldEmail' },
            { message: lang.errors.required, path: 'newEmail' },
            { message: lang.errors.required, path: 'password' }
          ];

          test.same({
            debugInfo: res.body.debugInfo,
            status: res.status,
            message: res.body.message
          }, {
            debugInfo: debugInfoError,
            status: 400,
            message: lang.errors.parametersError
          });
          test.end();
        });
    });

    failed.test('User not found', test => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'not.a.user@mail.com',
          newEmail: 'totaly.changed@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.errors.notFound(lang.models.user) }
          );
          test.end();
        });
    });

    failed.test('User sent wrong password', test => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'user@mail.com',
          newEmail: 'totaly.changed123@mail.com',
          password: 'WrongPassword123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.wrongPassword }
          );
          test.end();
        });
    });

    failed.test('User sent an email that is already in use', test => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'user@mail.com',
          newEmail: 'forgot.password@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.emailInUse }
          );
          test.end();
        });
    });

    failed.test('User sent an email that will be in use', test => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'regular@mail.com',
          newEmail: 'change3.email@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.emailInUse }
          );
          test.end();
        });
    });
  });

  changeEmail.test('Success', success => {
    let emailStub = helpers.stubMailer({ status: 200 });

    success.test('User request for email change success', test => {
      helpers.json('post', '/changeEmail')
        .send({
          oldEmail: 'change.email@mail.com',
          newEmail: 'new_changed.email@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 200, message: lang.messages.requestChangeEmail }
          );
          test.error(!emailStub.calledOnce, 'Mailer should have been called');
          helpers.resetStub(emailStub);
          test.end();
        });
    });

    success.test('User successfully changed email', test => {
      EmailConfirmation.findOne({ where: { email: 'cool.mail@mail.com' }})
        .then( emailConfirmation => {
          helpers.json('post', '/emailConfirm')
            .send({ token: emailConfirmation.token })
            .end( (err, res) => {
              test.same(
                { status: res.status, message: res.body.message },
                { status: 200, message: lang.messages.emailConfirmed }
              );
              test.end();
            });
        });
    });
  });
});
