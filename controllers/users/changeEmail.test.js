'use strict';

const test = require('tape');
const uuid = require('node-uuid');
const helpers = require('../../utils/test/helper');
const EmailUpdate = require('../../models').emailUpdate;
const lang = require('../../config/language');
const routes = {
  changeEmail: '/changeEmail',
  changeEmailToken: '/changeEmail/:token'
};

/*
  POST /changeEmail
*/
test(`${routes.changeEmail} invalid params`, t => {
  helpers.json('post', routes.changeEmail)
    .send({wrong: 'asd'})
    .end((err, res) => {
      const debugInfoError = [
        { message: lang.unrecognizedParameter, path: 'wrong' },
        { message: lang.required, path: 'oldEmail' },
        { message: lang.required, path: 'newEmail' },
        { message: lang.required, path: 'password' }
      ];

      t.same({
        debugInfo: res.body.debugInfo,
        status: res.status,
        message: res.body.message
      }, {
        debugInfo: debugInfoError,
        status: 400,
        message: lang.parametersError
      });
      t.end();
    });
});

test(`${routes.changeEmail} user not found`, t => {
  helpers.json('post', routes.changeEmail)
    .send({
      oldEmail: 'not.a.user@ecp.io',
      newEmail: 'totaly.changed@ecp.io',
      password: 'password123'
    })
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 404, message: lang.notFound(lang.models.user)}
      );
      t.end();
    });
});

test(`${routes.changeEmail} user request for email change success`, t => {
  let emailStub = helpers.stubMailer({status: 200});
  helpers.json('post', routes.changeEmail)
    .send({
      oldEmail: 'change.email2@ecp.io',
      newEmail: 'try.changed@ecp.io',
      password: 'password123'
    })
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 200, message: lang.requestChangeEmail}
      );
      helpers.resetMailer(emailStub);
      t.end();
    });
});

/*
  POST /changeEmail/:token
*/
test(`${routes.changeEmailToken} token does not exist`, t => {
  helpers.json('post', `/changeEmail/${uuid.v1()}`).end((err, res) => {
    t.same(
      {status: res.status, message: res.body.message},
      {status: 404, message: lang.notFound(lang.models.emailUpdate)}
    );
    t.end();
  });
});

test(`${routes.changeEmailToken} successfully changed user email`, t => {
  let emailStub = helpers.stubMailer({status: 200});
  EmailUpdate.findOne({where: {email: 'totaly.changed@ecp.io'}}).then(eus => {
    helpers.json('post', `/changeEmail/${eus.token}`).end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 200, message: lang.changedEmail}
      );
      helpers.resetMailer(emailStub);
      t.end();
    });
  });
});
