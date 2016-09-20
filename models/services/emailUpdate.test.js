'use strict';

const test = require('tape');
const helpers = require('../../utils/test/helper');
const User = require('../').user;
const EmailUpdate = require('../').emailUpdate;
const lang = require('../../config/language');
const services = require('.');

test('Email update check and create failure because mail in use', t => {
  services.emailUpdate.checkAndCreate({newEmail: 'john.doe@ecp.io'})
    .catch(err => {
      t.same(err, {status: 400, message: lang.emailInUse});
      t.end();
    });
});

test('Email update check and create failure because wrong password', t => {
  services.emailUpdate.checkAndCreate({
    newEmail: 'wrong@ecp.io',
    dbPassword: 'password123',
    password: 'password123'
  }).catch(err => {
    t.same(err, {status: 400, message: lang.wrongPassword});
    t.end();
  });
});

test('Email update check and create success', t => {
  let emailStub = helpers.stubMailer({status: 200});
  User.findOne({where: {email: 'change.email2@ecp.io'}}).then(user => {
    services.emailUpdate.checkAndCreate({
      newEmail: 'cool.mailTwo@ecp.io',
      dbPassword: user.password,
      password: 'password123',
      userId: user.id
    }).then(resp => {
      t.same(resp, {status: 200});
      helpers.resetMailer(emailStub);
      t.end();
    });
  });
});

test('Email update get by token and edit success', t => {
  EmailUpdate.findOne({where: {email: 'cool.mail@ecp.io'}}).then(eus => {
    services.emailUpdate.getByTokenAndEdit(eus.token).then(resp => {
      eus.getUser().then(user => {
        t.same(
          {email: user.email, confirmed: user.confirmed},
          {email: 'cool.mail@ecp.io', confirmed: false}
        );
        t.end();
      });
    });
  });
});

test('Email update get by token and edit failure, because email in use', t => {
  EmailUpdate.findOne({where: {email: 'john.doe@ecp.io'}}).then(eus => {
    services.emailUpdate.getByTokenAndEdit(eus.token).catch(err => {
      t.same(err, {status: 400, message: lang.emailInUse});
      t.end();
    });
  });
});

test('Email update get user and remove token failure', t => {
  services.emailUpdate.getUserAndRemoveTokens('wrong@ecp.io').catch(err => {
    t.same(err, {status: 404, message: lang.notFound(lang.models.user)});
    t.end();
  });
});

test('Email update get user and remove token success', t => {
  services.emailUpdate.getUserAndRemoveTokens('user3@ecp.io').then(eus => {
    t.same(eus.email, 'user3@ecp.io');
    t.end();
  });
});

test('Email update remove token', t => {
  EmailUpdate.findOne({where: {email: 'will.remove@ecp.io'}}).then(eus => {
    services.emailUpdate.removeByToken(eus.token).then(resp => {
      t.same(resp, 1);
      t.end();
    });
  });
});
