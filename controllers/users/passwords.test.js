'use strict';

const test = require('tape');
const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');
const uuid = require('node-uuid');
const ForgotPassword = require('../../models').forgotPassword;

test('POST /resetPassword', t => {

  t.test('Failed', f => {
    f.test('Invalid parameters', ft => {
      helpers.json('post', '/resetPassword')
        .send({wrong: 'forgot.password@ecp.io'})
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.parametersError}
          );
          ft.end();
        });
    });

    f.test('User not found', ft => {
      helpers.json('post', '/resetPassword')
        .send({email: 'forgot.wrong@ecp.io'})
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
    s.test('Successfully reset password', st => {
      let emailStub = helpers.stubMailer({message: 'Success'});
      helpers.json('post', '/resetPassword')
        .send({email: 'forgot.password@ecp.io'})
        .end((err, res) => {
          st.same(
            {status: res.status, message: res.body.message},
            {status: 200, message: lang.passwordRecovery}
          );
          helpers.resetMailer(emailStub);
          st.end();
        });
    });
  });
});

test('POST /changePassword', t => {

  t.test('Failed', f => {
    f.test('Invalid params', ft => {
      helpers.json('post', '/changePassword')
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
      helpers.json('post', '/changePassword')
        .send({token: uuid.v1(), password: 'NewPassword123!'})
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.notFound(lang.models.forgotPassword)}
          );
          ft.end();
        });
    });
  });

  t.test('Success', s => {
    s.test('Successfully changed password', st => {
      ForgotPassword.findOne({where: {userId: 5}})
        .then(fps => {
          helpers.json('post', '/changePassword')
            .send({token: fps.token, password: 'NewPassword123!'})
            .end((err, res) => {
              st.same(
                {status: res.status, message: res.body.message},
                {status: 200, message: lang.passwordChanged}
              );
              st.end();
            });
        });
    });
  });
});
