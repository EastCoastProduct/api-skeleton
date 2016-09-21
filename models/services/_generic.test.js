'use strict';

const services = require('.');
const test = require('tape');
const lang = require('../../config/language');

test('Generic model tests', t => {

  t.test('Failed', f => {
    f.test('Generic model create', ft => {
      services.user.create({
        email: 'created.guy@ecp.io',
        firstname: 'Harry',
        lastname: 'Richardson',
        password: 'password123'
      })
      .then(resp => {
        ft.same({
          email: resp.email,
          firstname: resp.firstname,
          lastname: resp.lastname
        }, {
          email: 'created.guy@ecp.io',
          firstname: 'Harry',
          lastname: 'Richardson'
        });
        ft.end();
      });
    });

    f.test('Generic check if model exists fail', ft => {
      services.user.exists({where: {email: 'some@guy.io'}}).catch(err => {
        ft.same(
          {status: err.status, message: err.message},
          {status: 400, message: lang.doesNotExist(lang.models.user)}
        );
        ft.end();
      });
    });

    f.test('Generic check if model does not exist fail', ft => {
      services.user.doesNotExist({where: {email: 'john.doe@ecp.io'}})
      .catch(err => {
        ft.same(
          err,
          {status: 400, message: lang.alreadyExists(lang.models.user)}
        );
        ft.end();
      });
    });

    f.test('Generic remove failure', ft => {
      services.user.remove({email: 'asd.one@ecp.io'}).catch(err => {
        ft.same(err, {status: 404, message: lang.notFound(lang.models.user)});
        ft.end();
      });
    });

    f.test('Generic remove by id failure', ft => {
      services.user.removeById(1950).catch(err => {
        ft.same(err, {status: 404, message: lang.notFound(lang.models.user)});
        ft.end();
      });
    });

    f.test('Generic update failure', ft => {
      services.user.update(
        {firstname: 'New firstname', lastname: 'New lastname'},
        {email: 'not.user@ecp.io'}
      ).catch(err => {
        ft.same(err, {status: 404, message: lang.notFound(lang.models.user)});
        ft.end();
      });
    });
  });

  t.test('Success', s => {
    s.test('Generic check if model exists success', st => {
      services.user.exists({where: {email: 'john.doe@ecp.io'}}).then(resp => {
        st.same(resp, 1);
        st.end();
      });
    });

    s.test('Generic check if model does not exist success', st => {
      services.user.doesNotExist({where: {email: 'some@guy.io'}}).then(resp => {
        st.same(resp, 0);
        st.end();
      });
    });

    s.test('Generic list', st => {
      services.user.list({limit: 1}).then(users => {
        st.error(!users.rows, 'No users');
        st.end();
      });
    });

    s.test('Generic remove success', st => {
      services.user.remove({email: 'delete.one@ecp.io'}).then(resp => {
        st.same(resp, 1);
        st.end();
      });
    });

    s.test('Generic remove by id success', st => {
      services.user.removeById(7).then(resp => {
        st.same(resp, 1);
        st.end();
      });
    });

    s.test('Generic get one success', st => {
      services.user.getOne({email: 'john.doe@ecp.io'}).then(user => {
        st.same({email: user.email}, {email: 'john.doe@ecp.io'});
        st.end();
      });
    });

    s.test('Generic update success', st => {
      services.user.update(
        {firstname: 'New firstname', lastname: 'New lastname'},
        {email: 'update.one@ecp.io'}
      ).then(user => {
        st.same(
          {firstname: user.firstname, lastname: user.lastname},
          {firstname: 'New firstname', lastname: 'New lastname'}
        );
        st.end();
      });
    });
  });
});

