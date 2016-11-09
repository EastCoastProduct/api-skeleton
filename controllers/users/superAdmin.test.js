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
          test.same(
            { email: res.body.email, confirmed: res.body.confirmed },
            { email: 'super.admin.created.user@mail.com', confirmed: true }
          );
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

tests('POST /superAdmin/users/:userId/changeEmail', changeEmail => {

  changeEmail.test('Failed', failed => {

    failed.test('Validation error', test => {
      let validationError = {
        message: 'Parameters error',
        debugInfo: [{
          path: 'wrong',
          message: 'unrecognized parameter'
        }, {
          path: 'newEmail',
          message: 'required'
        }],
        error: {
          message: 'Parameters error',
          status: 400,
          debugInfo: [{
            path: 'wrong',
            message: 'unrecognized parameter'
          }, {
            path: 'newEmail',
            message: 'required'
          }]
        }
      };

      helpers.json('post', '/superAdmin/users/20/changeEmail')
        .set('Authorization', superAdminAuth)
        .send({ wrong: 'wrong' })
        .end( (err, res) => {
          test.same(res.body, validationError);
          test.end();
        });
    });

    failed.test('Not authorized', test => {
      helpers.json('post', '/superAdmin/users/20/changeEmail')
        .set('Authorization', normalAuth)
        .send({ confirmed: 'true' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 403, message: lang.errors.notAuthorized }
          );
          test.end();
        });
    });

    failed.test('Fail to change user email because it is in use', test => {
      helpers.json('post', '/superAdmin/users/21/changeEmail')
        .set('Authorization', superAdminAuth)
        .send({ newEmail: 'regular@mail.com' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.alreadyExists(lang.models.user) }
          );
          test.end();
        });
    });

    failed.test('Fail to change user email because user does not exist', test => {
      helpers.json('post', '/superAdmin/users/1950/changeEmail')
        .set('Authorization', superAdminAuth)
        .send({ newEmail: 'regular@mail.com' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.errors.notFound(lang.models.user) }
          );
          test.end();
        });
    });
  });

  changeEmail.test('Success', success => {

    let emailStub = helpers.stubMailer('success');

    success.test('User email successfully changed', test => {
      helpers.json('post', '/superAdmin/users/22/changeEmail')
        .set('Authorization', superAdminAuth)
        .send({ newEmail: 'super.admin.set.new.email@mail.com' })
        .end( (err, res) => {
          test.same(res.body.message, lang.messages.userEmailUpdated);
          test.error(!emailStub.calledOnce, 'Email should have been sent');
          User.findById(22).then( user => {
            helpers.resetStub(emailStub);
            test.same(
              { email: user.email, confirmed: user.confirmed },
              { email: 'super.admin.set.new.email@mail.com', confirmed: true }
            );
            test.end();
          });
        });
    });
  });
});

tests('POST /superAdmin/users/:userId/changeStatus', changeStatus => {

  changeStatus.test('Failed', failed => {

    failed.test('Validation error', test => {
      let validationError = {
        message: 'Parameters error',
        debugInfo: [{
          path: 'wrong',
          message: 'unrecognized parameter'
        }, {
          path: 'confirmed',
          message: 'required'
        }],
        error: {
          message: 'Parameters error',
          status: 400,
          debugInfo: [{
            path: 'wrong',
            message: 'unrecognized parameter'
          }, {
            path: 'confirmed',
            message: 'required'
          }]
        }
      };

      helpers.json('post', '/superAdmin/users/20/changeStatus')
        .set('Authorization', superAdminAuth)
        .send({ wrong: 'wrong' })
        .end( (err, res) => {
          test.same(res.body, validationError);
          test.end();
        });
    });

    failed.test('Not authorized', test => {
      helpers.json('post', '/superAdmin/users/20/changeStatus')
        .set('Authorization', normalAuth)
        .send({ confirmed: 'true' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 403, message: lang.errors.notAuthorized }
          );
          test.end();
        });
    });

    failed.test('User does not exist', test => {
      helpers.json('post', '/superAdmin/users/1950/changeStatus')
        .set('Authorization', superAdminAuth)
        .send({ confirmed: 'true' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.doesNotExist(lang.models.user) }
          );
          test.end();
        });
    });
  });

  changeStatus.test('Success', success => {

    success.test('Changed user status to confirmed', test => {
      helpers.json('post', '/superAdmin/users/20/changeStatus')
        .set('Authorization', superAdminAuth)
        .send({ confirmed: 'true' })
        .end( (err, res) => {

          test.same(res.body, { message: lang.messages.userStatusUpdated });
          User.findById(20).then( user => {
            test.error(!user.confirmed, 'User was not confirmed');
            test.end();
          });
        });
    });

    success.test('Changed user status to not confirmed', test => {
      helpers.json('post', '/superAdmin/users/21/changeStatus')
        .set('Authorization', superAdminAuth)
        .send({ confirmed: 'false' })
        .end( (err, res) => {

          test.same(res.body, { message: lang.messages.userStatusUpdated });
          User.findById(21).then( user => {
            test.error(user.confirmed, 'User is still confirmed');
            test.end();
          });
        });
    });
  });
});
