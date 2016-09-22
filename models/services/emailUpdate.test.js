'use strict';

const test = require('tape');
const helpers = require('../../utils/test/helper');
const User = require('../').user;
const EmailUpdate = require('../').emailUpdate;
const lang = require('../../config/language');
const services = require('.');

test('Email update service', t => {

  t.test('Failed', f => {
    f.test('Email update check and create fail because mail in use', ft => {
      services.emailUpdate.checkAndCreate({newEmail: 'john.doe@ecp.io'})
        .catch(err => {
          ft.same(err, {status: 400, message: lang.emailInUse});
          ft.end();
        });
    });

    f.test('Email update check and create fail because wrong password', ft => {
      services.emailUpdate.checkAndCreate({
        newEmail: 'wrong@ecp.io',
        dbPassword: 'Password123',
        password: 'Password123'
      }).catch(err => {
        ft.same(err, {status: 400, message: lang.wrongPassword});
        ft.end();
      });
    });

    f.test('Email update get by token and edit fail, email in use', ft => {
      EmailUpdate.findOne({where: {email: 'john.doe@ecp.io'}}).then(eus => {
        services.emailUpdate.getByTokenAndEdit(eus.token).catch(err => {
          ft.same(err, {status: 400, message: lang.emailInUse});
          ft.end();
        });
      });
    });

    f.test('Email update get user and remove token failure', ft => {
      services.emailUpdate.getUserAndRemoveTokens('wrong@ecp.io').catch(err => {
        ft.same(err, {status: 404, message: lang.notFound(lang.models.user)});
        ft.end();
      });
    });
  });

  t.test('Success', s => {
    s.test('Email update check and create success', st => {
      let emailStub = helpers.stubMailer({status: 200});
      User.findOne({where: {email: 'change.email2@ecp.io'}}).then(user => {
        services.emailUpdate.checkAndCreate({
          newEmail: 'cool.mailTwo@ecp.io',
          dbPassword: user.password,
          password: 'Password123',
          userId: user.id
        }).then(resp => {
          st.same(resp, {status: 200});
          helpers.resetMailer(emailStub);
          st.end();
        });
      });
    });

    s.test('Email update get by token and edit success', st => {
      EmailUpdate.findOne({where: {email: 'cool.mail@ecp.io'}}).then(eus => {
        services.emailUpdate.getByTokenAndEdit(eus.token).then(resp => {
          eus.getUser().then(user => {
            st.same(
              {email: user.email, confirmed: user.confirmed},
              {email: 'cool.mail@ecp.io', confirmed: false}
            );
            st.end();
          });
        });
      });
    });

    s.test('Email update get user and remove token success', st => {
      services.emailUpdate.getUserAndRemoveTokens('user3@ecp.io').then(eus => {
        st.same(eus.email, 'user3@ecp.io');
        st.end();
      });
    });


    s.test('Email update remove token', st => {
      EmailUpdate.findOne({where: {email: 'will.remove@ecp.io'}}).then(eus => {
        services.emailUpdate.removeByToken(eus.token).then(resp => {
          st.same(resp, 1);
          st.end();
        });
      });
    });
  });
});
