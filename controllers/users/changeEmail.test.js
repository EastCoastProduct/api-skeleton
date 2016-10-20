'use strict';

const tests = require('tape');
const helpers = require('../../utils/test/helper');
const EmailConfirmation = require('../../models').emailConfirmation;
const user1Auth = helpers.getAuthorizationHeader(1);
const user11Auth = helpers.getAuthorizationHeader(11);
const lang = require('../../config/language');

tests('POST /users/:userId/changeEmail', changeEmail => {

  changeEmail.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', '/users/1/changeEmail')
        .set('Authorization', user1Auth)
        .send({ wrong: 'asd' })
        .end( (err, res) => {
          const debugInfoError = [{
            message: lang.errors.unrecognizedParameter,
            path: 'wrong'
          }, {
            message: lang.errors.required,
            path: 'newEmail'
          }, {
            message: lang.errors.required,
            path: 'password'
          }];

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

    failed.test('User not authorized', test => {
      helpers.json('post', '/users/2/changeEmail')
        .set('Authorization', user1Auth)
        .send({
          newEmail: 'totaly.changed@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 403, message: lang.errors.notAuthorized }
          );
          test.end();
        });
    });

    failed.test('User sent wrong password', test => {
      helpers.json('post', '/users/1/changeEmail')
        .set('Authorization', user1Auth)
        .send({
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
      helpers.json('post', '/users/1/changeEmail')
        .set('Authorization', user1Auth)
        .send({
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
      helpers.json('post', '/users/1/changeEmail')
        .set('Authorization', user1Auth)
        .send({
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
      helpers.json('post', '/users/11/changeEmail')
        .set('Authorization', user11Auth)
        .send({
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
                { status: res.status, email: res.body.email },
                { status: 200, email: 'cool.mail@mail.com' }
              );
              test.end();
            });
        });
    });
  });
});
