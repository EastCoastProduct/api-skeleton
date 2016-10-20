'use strict';

const tests = require('tape');
const helpers = require('../../utils/test/helper');
const normalAuth = helpers.getAuthorizationHeader(15);
const lang = require('../../config/language');
const uuid = require('node-uuid');
const ForgotPassword = require('../../models').forgotPassword;

tests('POST /resetPassword', resetPassword => {

  resetPassword.test('Failed', failed => {
    failed.test('Invalid parameters', test => {
      helpers.json('post', '/recoverPassword')
        .send({ wrong: 'forgot.password@mail.com' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.parametersError }
          );
          test.end();
        });
    });

    failed.test('User not found', test => {
      helpers.json('post', '/recoverPassword')
        .send({ email: 'forgot.wrong@ecp.io' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.errors.notFound(lang.models.user) }
          );
          test.end();
        });
    });
  });

  resetPassword.test('Success', success => {
    success.test('Successfully reset password', test => {
      let emailStub = helpers.stubMailer({ message: 'Success' });
      helpers.json('post', '/recoverPassword')
        .send({ email: 'forgot.password@mail.com' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 200, message: lang.messages.passwordRecovery }
          );
          helpers.resetStub(emailStub);
          test.end();
        });
    });
  });
});

tests('POST /changePassword', changePassword => {

  changePassword.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', '/users/15/changePassword')
        .set('Authorization', normalAuth)
        .send({ wrong: 'invalid' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.parametersError }
          );
          test.end();
        });
    });

    failed.test('Wrong password', test => {
      helpers.json('post', '/users/15/changePassword')
        .set('Authorization', normalAuth)
        .send({
          oldPassword: 'wrongPassword123',
          newPassword: 'Password12345'
        })
        .end((err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.wrongPassword }
          );
          test.end();
        });
    });
  });

  changePassword.test('Success', success => {
    success.test('Successfully changed password', test => {
      helpers.json('post', '/users/15/changePassword')
        .set('Authorization', normalAuth)
        .send({
          oldPassword: 'Password123',
          newPassword: 'Password12345'
        })
        .end((err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 200, message: lang.messages.passwordChanged }
          );
          test.end();
        });
    });
  });
});

tests('POST /recoverPassword/:token', passwordRecovery => {

  passwordRecovery.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', `/recoverPassword/${uuid.v1()}`)
        .send({ wrong: 'invalid' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.parametersError }
          );
          test.end();
        });
    });

    failed.test('Token not found', test => {
      helpers.json('post', `/recoverPassword/${uuid.v1()}`)
        .send({ password: 'NewPassword123!' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.errors.notFound(lang.models.forgotPassword) }
          );
          test.end();
        });
    });
  });

  passwordRecovery.test('Success', success => {
    success.test('Successfully changed password', test => {
      ForgotPassword.findOne({ where: { userId: 6 }})
        .then(forgotPassword => {
          helpers.json('post', `/recoverPassword/${forgotPassword.token}`)
            .send({ password: 'NewPassword123!' })
            .end( (err, res) => {
              test.same(
                { status: res.status, message: res.body.message },
                { status: 200, message: lang.messages.passwordChanged }
              );
              test.end();
            });
        });
    });
  });
});
