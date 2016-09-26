'use strict';

const ForgotPassword = require('../').forgotPassword;
const services = require('.');
const test = require('tape');
const lang = require('../../config/language');
const helpers = require('../../utils/test/helper');

test('Forgot password service', t => {

  t.test('Failed', f => {
    f.test('Forgot password get user by token failure', ft => {
      services.forgotPassword.getByToken().catch(err => {
        ft.same(err, {
          status: 404,
          message: lang.notFound(lang.models.forgotPassword)
        });
        ft.end();
      });
    });

    f.test('Forgot password get user and remove his tokens failure', ft => {
      services.forgotPassword.getUserAndRemoveTokens('not@real.io')
      .catch(err => {
        ft.same(err, {
          status: 404,
          message: lang.notFound(lang.models.user)
        });
        ft.end();
      });
    });
  });

  t.test('Success', s => {

    s.test('Forgot password get user by token success', st => {
      ForgotPassword.findOne({where: {userId: 1}}).then(helper =>
        services.forgotPassword.getByToken(helper.token).then(fps => {
          st.same({email: fps.email}, {email: 'john.doe@ecp.io'});
          st.end();
        })
      );
    });


    s.test('Forgot password create', st => {
      let emailStub = helpers.stubMailer({status: 200});
      services.forgotPassword.create({id: 5}).then(fps => {
        st.same(fps, {status: 200});
        helpers.resetStub(emailStub);
        st.end();
      });
    });

    s.test('Forgot password get user and remove his tokens success', st => {
      services.forgotPassword.getUserAndRemoveTokens('user3@ecp.io')
      .then(user => {
        st.same({firstname: user.firstname}, {firstname: 'Jacqueline'});
        st.end();
      });
    });

    s.test('Forgot password remove by token', st => {
      ForgotPassword.findOne({where: {userId: 5}}).then(helper =>
        services.forgotPassword.removeByToken(helper.token).then(fps => {
          st.same(fps, 1);
          st.end();
        })
      );
    });
  });
});
