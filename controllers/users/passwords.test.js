'use strict';

const test = require('tape');
const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');
const uuid = require('node-uuid');
const ForgotPassword = require('../../models').forgotPassword;
const routes = {
  changePassword: '/changePassword',
  resetPassword: '/resetPassword'
};

/*
  POST /resetPassword
*/
test(`${routes.resetPassword} invalid parameters`, t => {
  helpers.json('post', routes.resetPassword)
    .send({wrong: 'forgot.password@ecp.io'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 400, message: lang.parametersError}
      );
      t.end();
    });
});

test(`${routes.resetPassword} successfully reset password`, t => {
  let emailStub = helpers.stubMailer({message: 'Success'});
  helpers.json('post', routes.resetPassword)
    .send({email: 'forgot.password@ecp.io'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 200, message: lang.passwordRecovery}
      );
      helpers.resetMailer(emailStub);
      t.end();
    });
});

test(`${routes.resetPassword} user not found parameters`, t => {
  helpers.json('post', routes.resetPassword)
    .send({email: 'forgot.wrong@ecp.io'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 404, message: lang.notFound(lang.models.user)}
      );
      t.end();
    });
});


/*
  POST /changePassword
*/
test(`${routes.changePassword} invalid params`, t => {
  helpers.json('post', routes.changePassword)
    .send({wrong: 'invalid'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 400, message: lang.parametersError}
      );
      t.end();
    });
});

test(`${routes.changePassword} successfully changed password`, t => {
  ForgotPassword.findOne({where: {userId: 5}})
    .then(fps => {
      helpers.json('post', routes.changePassword)
        .send({token: fps.token, password: 'NewPassword123!'})
        .end((err, res) => {
          t.same(
            {status: res.status, message: res.body.message},
            {status: 200, message: lang.passwordChanged}
          );
          t.end();
        });
    });
});

test(`${routes.changePassword} token not found`, t => {
  helpers.json('post', routes.changePassword)
    .send({token: uuid.v1(), password: 'NewPassword123!'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 404, message: lang.notFound(lang.models.forgotPassword)}
      );
      t.end();
    });
});
