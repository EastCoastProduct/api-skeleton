'use strict';

const ForgotPassword = require('../').forgotPassword;
const services = require('.');
const test = require('tape');
const lang = require('../../config/language');
const helpers = require('../../utils/test/helper');

test('Forgot password get user by token failure', t => {
  services.forgotPassword.getByToken().catch(err => {
    t.same(err, {
      status: 404,
      message: lang.notFound(lang.models.forgotPassword)
    });
    t.end();
  });
});

test('Forgot password get user by token success', t => {
  ForgotPassword.findOne({where: {userId: 1}}).then(helper =>
    services.forgotPassword.getByToken(helper.token).then(fps => {
      t.same({email: fps.email}, {email: 'john.doe@ecp.io'});
      t.end();
    })
  );
});

test('Forgot password create', t => {
  let emailStub = helpers.stubMailer({status: 200});
  services.forgotPassword.create({id: 5}).then(fps => {
    t.same(fps, {status: 200});
    helpers.resetMailer(emailStub);
    t.end();
  });
});

test('Forgot password get user and remove his tokens success', t => {
  services.forgotPassword.getUserAndRemoveTokens('user3@ecp.io').then(user => {
    t.same({firstname: user.firstname}, {firstname: 'Jacqueline'});
    t.end();
  });
});

test('Forgot password get user and remove his tokens failure', t => {
  services.forgotPassword.getUserAndRemoveTokens('not@real.io').catch(err => {
    t.same(err, {
      status: 404,
      message: lang.notFound(lang.models.user)
    });
    t.end();
  });
});

test('Forgot password remove by token', t => {
  ForgotPassword.findOne({where: {userId: 5}}).then(helper =>
    services.forgotPassword.removeByToken(helper.token).then(fps => {
      t.same(fps, 1);
      t.end();
    })
  );
});
