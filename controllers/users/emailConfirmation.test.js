'use strict';

const test = require('tape');
const uuid = require('node-uuid');
const helpers = require('../../utils/test/helper');
const EmailConfirmation = require('../../models').emailConfirmation;
const lang = require('../../config/language');

test('POST /resendConfirmation', t => {
  t.test('Failed', f => {
    f.test('Invalid params', ft => {
      helpers.json('post', '/resendConfirmation')
        .send({wrong: 'invalid'})
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.parametersError}
          );
          ft.end();
        });
    });

    f.test('Token not found', ft => {
      helpers.json('post', '/resendConfirmation')
        .send({email: 'jack@ecp.io'})
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.notFound(lang.models.user)}
          );
          ft.end();
        });
    });
  });

  t.test('Success', s => {
    s.test('Successfully resent email', st => {
      let emailStub = helpers.stubMailer();

      helpers.json('post', '/resendConfirmation')
        .send({email: 'confirmed.one@ecp.io'})
        .end((err, res) => {
          st.same(
            {status: res.status, message: res.body.message},
            {status: 201, message: lang.sentConfirmationEmail}
          );
          helpers.resetStub(emailStub);
          st.end();
        });
    });
  });
});


test('POST /emailConfirm', t => {

  t.test('Failed', f => {
    f.test('Invalid params', ft => {
      helpers.json('post', '/emailConfirm')
        .send({wrong: 'invalid'})
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.parametersError}
          );
          ft.end();
        });
    });

    f.test('Token not found', ft => {
      helpers.json('post', '/emailConfirm')
        .send({token: uuid.v1()})
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.notFound(lang.models.emailConfirmation)}
          );
          ft.end();
        });
    });
  });

  t.test('Success', s => {
    s.test('Successfully confirmed user', st => {
      EmailConfirmation.findOne({where: {userId: 9}}).then(ec => {
        helpers.json('post', '/emailConfirm')
          .send({token: ec.token})
          .end((err, res) => {
            st.same(
              {status: res.status, message: res.body.message},
              {status: 200, message: lang.emailConfirmed}
            );
            ec.getUser().then(user => {
              st.error(!user.confirmed, 'User not confirmed');
              st.end();
            });
          });
      });
    });
  });
});
