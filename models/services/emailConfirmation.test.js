'use strict';

const EmailConfirmation = require('../').emailConfirmation;
const services = require('.');
const test = require('tape');
const lang = require('../../config/language');
const helpers = require('../../utils/test/helper');

test('Email confirmation service', t => {

  t.test('Failed', f => {
    f.test('Email confirmation get user by token failure', ft => {
      services.emailConfirmation.getByToken().catch(err => {
        ft.same(err, {
          status: 404,
          message: lang.notFound(lang.models.emailConfirmation)
        });
        ft.end();
      });
    });

    f.test('Email confirmation get user and remove his tokens failure', ft => {
      services.emailConfirmation.getUserAndRemoveTokens('not@real.io')
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
    s.test('Email confirmation get user by token success', st => {
      EmailConfirmation.findOne({where: {userId: 16}}).then(helper =>
        services.emailConfirmation.getByToken(helper.token).then(fps => {
          st.same({email: fps.email}, {email: null});
          st.end();
        })
      );
    });

    s.test('Email confirmation create', st => {
      let emailStub = helpers.stubMailer({status: 200});

      services.emailConfirmation.create({id: 5}).then(fps => {
        st.same(fps, {status: 200});
        helpers.resetStub(emailStub);
        st.end();
      });
    });

    s.test('Email confirmation get user and remove his tokens success', st => {
      services.emailConfirmation.getUserAndRemoveTokens('confirmed.one@ecp.io')
        .then(user => {
          st.same({firstname: user.firstname}, {firstname: 'McFirstname8'});
          st.end();
        });
    });

    s.test('Email confirmation remove by token', st => {
      EmailConfirmation.findOne({where: {userId: 8}}).then(helper =>
        services.emailConfirmation.removeByToken(helper.token).then(fps => {
          st.same(fps, 1);
          st.end();
        })
      );
    });
  });
});










