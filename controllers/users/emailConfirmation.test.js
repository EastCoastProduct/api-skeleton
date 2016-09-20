'use strict';

const test = require('tape');
const uuid = require('node-uuid');
const helpers = require('../../utils/test/helper');
const EmailConfirmation = require('../../models').emailConfirmation;
const lang = require('../../config/language');
const routes = {
  resendConfirmation: '/resendConfirmation',
  emailConfirm: '/emailConfirm'
};

/*
  POST /resendConfirmation
*/
test(`${routes.resendConfirmation} invalid params`, t => {
  helpers.json('post', routes.resendConfirmation)
    .send({wrong: 'invalid'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 400, message: lang.parametersError}
      );
      t.end();
    });
});

test(`${routes.resendConfirmation} token not found`, t => {
  helpers.json('post', routes.resendConfirmation)
    .send({email: 'jack@ecp.io'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 404, message: lang.notFound(lang.models.user)}
      );
      t.end();
    });
});

test(`${routes.resendConfirmation} successfully resent email`, t => {
  let emailStub = helpers.stubMailer({});

  helpers.json('post', routes.resendConfirmation)
    .send({email: 'confirmed.one@ecp.io'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 201, message: lang.sentConfirmationEmail}
      );
      helpers.resetMailer(emailStub);
      t.end();
    });
});


/*
  POST /emailConfirm
*/
test(`${routes.emailConfirm} invalid params`, t => {
  helpers.json('post', routes.emailConfirm)
    .send({wrong: 'invalid'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 400, message: lang.parametersError}
      );
      t.end();
    });
});

test(`${routes.emailConfirm} token not found`, t => {
  helpers.json('post', routes.emailConfirm)
    .send({token: uuid.v1()})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 404, message: lang.notFound(lang.models.emailConfirmation)}
      );
      t.end();
    });
});

test(`${routes.emailConfirm} successfully confirmed user`, t => {
  EmailConfirmation.findOne({where: {userId: 9}}).then(ec => {
    helpers.json('post', routes.emailConfirm)
      .send({token: ec.token})
      .end((err, res) => {
        t.same(
          {status: res.status, message: res.body.message},
          {status: 200, message: lang.emailConfirmed}
        );
        ec.getUser().then(user => {
          t.error(!user.confirmed, 'User not confirmed');
          t.end();
        });
      });
  });
});
