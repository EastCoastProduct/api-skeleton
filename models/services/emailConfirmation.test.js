'use strict';

const EmailConfirmation = require('../').emailConfirmation;
const services = require('.');
const test = require('tape');
const lang = require('../../config/language');
const helpers = require('../../utils/test/helper');

test('Email confirmation get user by token failure', t => {
  services.emailConfirmation.getByToken().catch(err => {
    t.same(err, {
      status: 404,
      message: lang.notFound(lang.models.emailConfirmation)
    });
    t.end();
  });
});

test('Email confirmation get user by token success', t => {
  EmailConfirmation.findOne({where: {userId: 3}}).then(helper =>
    services.emailConfirmation.getByToken(helper.token).then(fps => {
      t.same({email: fps.email}, {email: 'user3@ecp.io'});
      t.end();
    })
  );
});

test('Email confirmation create', t => {
  let emailStub = helpers.stubMailer({status: 200});
  services.emailConfirmation.create({id: 5}).then(fps => {
    t.same(fps, {status: 200});
    helpers.resetMailer(emailStub);
    t.end();
  });
});

test('Email confirmation get user and remove his tokens success', t => {
  services.emailConfirmation.getUserAndRemoveTokens('confirmed.one@ecp.io')
    .then(user => {
      t.same({firstname: user.firstname}, {firstname: 'confirmed'});
      t.end();
    });
});

test('Email confirmation get user and remove his tokens failure', t => {
  services.emailConfirmation.getUserAndRemoveTokens('not@real.io')
    .catch(err => {
      t.same(err, {
        status: 404,
        message: lang.notFound(lang.models.user)
      });
      t.end();
    });
});

test('Email confirmation remove by token', t => {
  EmailConfirmation.findOne({where: {userId: 8}}).then(helper =>
    services.emailConfirmation.removeByToken(helper.token).then(fps => {
      t.same(fps, 1);
      t.end();
    })
  );
});
