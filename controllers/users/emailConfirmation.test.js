'use strict';

const tests = require('tape');
const uuid = require('node-uuid');
const User = require('../../models').user;
const helpers = require('../../utils/test/helper');
const user4Auth = helpers.getAuthorizationHeader(4);
const user10Auth = helpers.getAuthorizationHeader(10);
const user19Auth = helpers.getAuthorizationHeader(19);
const EmailConfirmation = require('../../models').emailConfirmation;
const lang = require('../../config/language');

tests('POST /users/:userId/resendConfirmation', resendConfirmation => {
  resendConfirmation.test('Failed', failed => {
    failed.test('Token not found', test => {
      helpers.json('post', '/users/4/resendConfirmation')
        .set('Authorization', user4Auth)
        .send({ email: 'not.real.user@mail.com' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.notFound(lang.models.emailConfirmation) }
          );
          test.end();
        });
    });
  });

  resendConfirmation.test('Success', success => {
    let emailStub = helpers.stubMailer();

    success.test('Successfully resent email', test => {
      helpers.json('post', '/users/10/resendConfirmation')
        .set('Authorization', user10Auth)
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 201, message: lang.sentConfirmationEmail }
          );
          User.count({
            where: {
              $and: [
                { email: 'confirmed.one@mail.com' },
                { confirmed: false }
              ]
            }
          })
          .then( users => {
            test.error(!users, 'The user should not be confirmed');
            helpers.resetStub(emailStub, false);
            test.end();
          });
        });
    });

    success.test('Successfully resent change email', test => {
      EmailConfirmation.findOne({ where: { userId: 19 }})
        .then( oldEmailConfirmation => {
          let oldToken = oldEmailConfirmation.token;

          helpers.json('post', '/users/19/resendConfirmation')
            .set('Authorization', user19Auth)
            .end( (err, res) => {
              test.same(
                { status: res.status, message: res.body.message },
                { status: 201, message: lang.sentConfirmationEmail }
              );

              EmailConfirmation.findOne({ where: { userId: 19 }})
                .then( updatedEmailConfirmation => {
                  test.error(
                    updatedEmailConfirmation.token === oldToken,
                    'Tokens should not be the same'
                  );
                  helpers.resetStub(emailStub);
                  test.end();
                });
            });
        });
    });
  });
});

tests('POST /emailConfirm', emailConfirmation => {

  emailConfirmation.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', '/emailConfirm')
        .send({ wrong: 'invalid' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.parametersError }
          );
          test.end();
        });
    });

    failed.test('Token not found', test => {
      helpers.json('post', '/emailConfirm')
        .send({ token: uuid.v1() })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.notFound(lang.models.emailConfirmation) }
          );
          test.end();
        });
    });

    failed.test('Failed to change user email because it is in use', test => {
      EmailConfirmation.findOne({ where: { userId: 17 }})
        .then(emailConfirmationData => {
          helpers.json('post', '/emailConfirm')
            .send({ token: emailConfirmationData.token })
            .end( (err, res) => {
              test.same(
                { status: res.status, message: res.body.message },
                { status: 400, message: lang.alreadyExists(lang.models.user) }
              );
              emailConfirmationData.getUser().then( user => {
                test.error(!user.confirmed, 'User not confirmed');
                test.end();
              });
            });
        });
    });
  });

  emailConfirmation.test('Success', success => {
    success.test('Successfully confirmed user', test => {
      EmailConfirmation.findOne({ where: { userId: 9 }}).then( emailConfirmationData => {
        helpers.json('post', '/emailConfirm')
          .send({ token: emailConfirmationData.token })
          .end( (err, res) => {
            test.same(
              { status: res.status, message: res.body.message },
              { status: 200, message: lang.emailConfirmed }
            );
            emailConfirmationData.getUser().then( user => {
              test.error(!user.confirmed, 'User not confirmed');
              test.end();
            });
          });
      });
    });
  });
});
