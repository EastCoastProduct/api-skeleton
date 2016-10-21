'use strict';

const tests = require('tape');
const lang = require('../../config/language');
const helpers = require('../../utils/test/helper');
const models = require('../../models');
const User = models.user;
const ForgotPassword = models.forgotPassword;
const superAdminAuth = helpers.getSuperAdminAuthorizationHeader(1);
const normalAuth = helpers.getAuthorizationHeader(1);

tests('POST /superAdmin/users', superAdmin => {
  superAdmin.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', '/superAdmin/users')
        .set('Authorization', superAdminAuth)
        .send({ wrong: 'Wrong parameter' })
        .end( (err, res) => {

          const validationError = {
            message: 'Parameters error',
            debugInfo: [{
              message: 'unrecognized parameter',
              path: 'wrong'
            }, {
              message: 'required',
              path: 'email'
            }],
            error: {
              message: 'Parameters error',
              status: 400,
              debugInfo: [{
                message: 'unrecognized parameter',
                path: 'wrong'
              }, {
                message: 'required',
                path: 'email'
              }]
            }
          };

          test.same(res.body, validationError);
          test.end();
        });
    });

    failed.test('Not authorized', test => {
      helpers.json('post', '/superAdmin/users')
        .set('Authorization', normalAuth)
        .send({ email: 'some@mail.com' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 403, message: lang.errors.notAuthorized }
          );
          test.end();
        });
    });

    failed.test('User email taken', test => {
      helpers.json('post', '/superAdmin/users')
        .set('Authorization', superAdminAuth)
        .send({ email: 'regular@mail.com' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.alreadyExists(lang.models.user) }
          );
          test.end();
        });
    });
  });

  superAdmin.test('Success', success => {
    success.test('Successfully created user', test => {
      let emailStub = helpers.stubMailer();

      helpers.json('post', '/superAdmin/users')
        .set('Authorization', superAdminAuth)
        .send({ email: 'super.admin.created.user@mail.com' })
        .end( (err, res) => {
          User.findOne({ where: { email: 'super.admin.created.user@mail.com' }})
          .then( newUser => {
            test.error(!newUser.confirmed, 'User should be confirmed');
            ForgotPassword.count({ where: { userId: newUser.id }})
            .then( forgotPasswordCount => {
              test.error(
                forgotPasswordCount !== 1,
                'There should be a forgot password entry for this user so he can reset password'
              );
              helpers.resetStub(emailStub);
              test.end();
            });
          });
        });
    });
  });
});
