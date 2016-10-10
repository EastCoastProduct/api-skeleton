'use strict';

const ForgotPassword = require('../').forgotPassword;
const services = require('.');
const tests = require('tape');
const lang = require('../../config/language');
const helpers = require('../../utils/test/helper');

tests('Forgot password service', forgotPassword => {

  forgotPassword.test('Failed', failed => {
    failed.test('Forgot password get user by token failure', test => {
      services.forgotPassword.getByToken().catch(err => {
        test.same(err, {
          status: 404,
          message: lang.notFound(lang.models.forgotPassword)
        });
        test.end();
      });
    });

    failed.test('Forgot password get user and remove his tokens failure', test => {
      services.forgotPassword.getUserAndRemoveTokens('not@real.io')
      .catch(err => {
        test.same(err, {
          status: 404,
          message: lang.notFound(lang.models.user)
        });
        test.end();
      });
    });
  });

  forgotPassword.test('Success', success => {

    success.test('Forgot password get user by token success', test => {
      ForgotPassword.findOne({ where: { userId: 1 }}).then(helper =>
        services.forgotPassword.getByToken(helper.token).then(fps => {
          test.same({email: fps.email}, {email: 'regular@mail.com'});
          test.end();
        })
      );
    });


    success.test('Forgot password create', test => {
      let emailStub = helpers.stubMailer({status: 200});
      services.forgotPassword.create({ id: 6 }).then(fps => {
        test.same(fps, {status: 200});
        helpers.resetStub(emailStub);
        test.end();
      });
    });

    success.test('Forgot password get user and remove his tokens success', test => {
      services.forgotPassword.getUserAndRemoveTokens('not.confirmed@mail.com')
      .then(user => {
        test.same({ firstname: user.firstname }, { firstname: 'firstname3'});
        test.end();
      });
    });

    success.test('Forgot password remove by token', test => {
      ForgotPassword.findOne({ where: { userId: 6 }}).then(helper =>
        services.forgotPassword.removeByToken(helper.token).then(fps => {
          test.same(fps, 1);
          test.end();
        })
      );
    });
  });
});
