'use strict';

const tests = require('tape');
const uuid = require('node-uuid');
const User = require('../../models').user;
const helpers = require('../../utils/test/helper');
const EmailConfirmation = require('../../models').emailConfirmation;
const lang = require('../../config/language');

tests('POST /resendConfirmation', resendConfirmation => {
  resendConfirmation.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', '/resendConfirmation')
        .send({wrong: 'invalid'})
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.parametersError}
          );
          test.end();
        });
    });

    failed.test('Token not found', test => {
      helpers.json('post', '/resendConfirmation')
        .send({email: 'jack@ecp.io'})
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.notFound(lang.models.user)}
          );
          test.end();
        });
    });
  });

  resendConfirmation.test('Success', success => {
    success.test('Successfully resent email', test => {
      let emailStub = helpers.stubMailer();

      helpers.json('post', '/resendConfirmation')
        .send({email: 'confirmed.one@ecp.io'})
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 201, message: lang.sentConfirmationEmail}
          );
          User.count(
            {where: {$and: [{email: 'confirmed.one@ecp.io'}, {confirmed: false}]}}
          ).then(users => {
            test.error(!users, 'The user should not be confirmed');
            helpers.resetStub(emailStub);
            test.end();
          });
        });
    });
  });
});

tests('POST /emailConfirm', emailConfirmation => {

  emailConfirmation.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', '/emailConfirm')
        .send({wrong: 'invalid'})
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.parametersError}
          );
          test.end();
        });
    });

    failed.test('Token not found', test => {
      helpers.json('post', '/emailConfirm')
        .send({token: uuid.v1()})
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.notFound(lang.models.emailConfirmation)}
          );
          test.end();
        });
    });

    failed.test('Failed to change user email because it is in use', test => {
      EmailConfirmation.findOne({where: {userId: 17}}).then(ec => {
        helpers.json('post', '/emailConfirm')
          .send({token: ec.token})
          .end((err, res) => {
            test.same(
              {status: res.status, message: res.body.message},
              {status: 400, message: lang.alreadyExists(lang.models.user)}
            );
            ec.getUser().then(user => {
              test.error(!user.confirmed, 'User not confirmed');
              test.end();
            });
          });
      });
    });
  });

  emailConfirmation.test('Success', success => {
    success.test('Successfully confirmed user', test => {
      EmailConfirmation.findOne({where: {userId: 9}}).then(ec => {
        helpers.json('post', '/emailConfirm')
          .send({token: ec.token})
          .end((err, res) => {
            test.same(
              {status: res.status, message: res.body.message},
              {status: 200, message: lang.emailConfirmed}
            );
            ec.getUser().then(user => {
              test.error(!user.confirmed, 'User not confirmed');
              test.end();
            });
          });
      });
    });
  });
});
