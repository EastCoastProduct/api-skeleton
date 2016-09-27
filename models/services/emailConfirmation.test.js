'use strict';

const EmailConfirmation = require('../').emailConfirmation;
const services = require('.');
const tests = require('tape');
const lang = require('../../config/language');
const helpers = require('../../utils/test/helper');

tests('Email confirmation service', emailConfirmation => {

  emailConfirmation.test('Failed', failed => {
    failed.test('Email confirmation get user by token failure', test => {
      services.emailConfirmation.getByToken().catch(err => {
        test.same(err, {
          status: 404,
          message: lang.notFound(lang.models.emailConfirmation)
        });
        test.end();
      });
    });

    failed.test('Email confirmation get user and remove his tokens failure', test => {
      services.emailConfirmation.getUserAndRemoveTokens('not@real.io')
        .catch(err => {
          test.same(err, {
            status: 404,
            message: lang.notFound(lang.models.user)
          });
          test.end();
        });
    });
  });

  emailConfirmation.test('Success', success => {
    success.test('Email confirmation get user by token success', test => {
      EmailConfirmation.findOne({where: {userId: 16}}).then(helper =>
        services.emailConfirmation.getByToken(helper.token).then(fps => {
          test.same({email: fps.email}, {email: null});
          test.end();
        })
      );
    });

    success.test('Email confirmation create', test => {
      let emailStub = helpers.stubMailer({status: 200});

      services.emailConfirmation.create({id: 5}).then(fps => {
        test.same(fps, {status: 200});
        helpers.resetStub(emailStub);
        test.end();
      });
    });

    success.test('Email confirmation get user and remove his tokens success', test => {
      services.emailConfirmation.getUserAndRemoveTokens('confirmed.one@ecp.io')
        .then(user => {
          test.same({firstname: user.firstname}, {firstname: 'McFirstname8'});
          test.end();
        });
    });

    success.test('Email confirmation remove by token', test => {
      EmailConfirmation.findOne({where: {userId: 8}}).then(helper =>
        services.emailConfirmation.removeByToken(helper.token).then(fps => {
          test.same(fps, 1);
          test.end();
        })
      );
    });
  });
});










