'use strict';

const test = require('tape');
const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');
const superAdminAuth = helpers.getAuthorizationHeader(1);
const adminAuth = helpers.getAuthorizationHeader(3);
const normalAuth = helpers.getAuthorizationHeader(4);

test('POST /users', t => {

  t.test('Failed', f => {
    f.test('Invalid params', ft => {
      helpers.json('post', '/users')
        .send({
          confirmed: true
        })
        .end((err, res) => {
          const debugInfoError = [
            {path: 'confirmed', message: lang.unrecognizedParameter},
            {path: 'email', message: lang.required},
            {path: 'password', message: lang.required}
          ];

          ft.same(
            {status: res.status, debugInfo: res.body.debugInfo},
            {status: 400, debugInfo: debugInfoError}
          );
          ft.end();
        });
    });

    f.test('User already exists', ft => {
      helpers.json('post', '/users')
        .send({
          email: 'john.doe@ecp.io',
          password: 'Sifra123!',
          firstname: 'Name',
          lastname: 'Surname'
        })
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.alreadyExists(lang.models.user)}
          );
          ft.end();
        });
    });
  });

  t.test('Success', s => {
    s.test('User successfully created', st => {
      let emailStub = helpers.stubMailer('success');
      let newUser = {
        email: 'new.user@ecp.io',
        password: 'Sifra123!',
        firstname: 'Name',
        lastname: 'Surname'
      };

      helpers.json('post', '/users')
        .send(newUser)
        .end((err, res) => {
          st.same({
            status: res.status,
            bio: res.body.bio,
            email: res.body.email,
            confirmed: res.body.confirmed,
            firstname: res.body.firstname,
            lastname: res.body.lastname
          }, {
            status: 201,
            bio: null,
            confirmed: false,
            email: newUser.email,
            firstname: newUser.firstname,
            lastname: newUser.lastname
          });
          helpers.resetMailer(emailStub);
          st.end();
        });
    });
  });
});


test('GET /users', t => {
  t.test('List users', s => {
    helpers.json('get', '/users').end((err, res) => {
      s.same(res.status, 200);
      s.end();
    });
  });
});


test('GET /users/:userId', t => {

  t.test('Failed', f => {
    f.test('Fail to get one user', ft => {
      helpers.json('get', '/users/1950').end((err, res) => {
        ft.same(
          {status: res.status, message: res.body.message},
          {status: 404, message: lang.notFound(lang.models.user)}
        );
        ft.end();
      });
    });
  });

  t.test('Success', s => {
    s.test('Get one user', st => {
      helpers.json('get', '/users/1').end((err, res) => {
        st.same({
          status: res.status,
          email: res.body.email,
          firstname: res.body.firstname,
          lastname: res.body.lastname,
          confirmed: res.body.confirmed
        }, {
          status: 200,
          email: 'john.doe@ecp.io',
          firstname: 'Harry',
          lastname: 'Richardson',
          confirmed: true
        });
        st.end();
      });
    });
  });
});


test('POST /users/:userId', t => {

  t.test('Failed', f => {
    f.test('User with no token', ft => {
      helpers.json('post', '/users/1')
        .send({firstname: 'tryToChange'})
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 401, message: 'No authorization token was found'}
          );
          ft.end();
        });
    });

    f.test('User not authorized to update other user', ft => {
      helpers.json('post', '/users/2')
        .set('Authorization', normalAuth)
        .send({firstname: 'tryToChange'})
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 403, message: lang.notAuthorized}
          );
          ft.end();
        });
    });

    f.test('Invalid params', ft => {
      helpers.json('post', '/users/1')
        .set('Authorization', superAdminAuth)
        .send({email: 'cantDo@it.likethis'})
        .end((err, res) => {
          const debugInfoError = [
            {path: 'email', message: lang.unrecognizedParameter}
          ];

          ft.same(
            {status: res.status, debugInfo: res.body.debugInfo},
            {status: 400, debugInfo: debugInfoError}
          );
          ft.end();
        });
    });

    f.test('User not found for update', ft => {
      helpers.json('post', '/users/1950')
        .set('Authorization', superAdminAuth)
        .send({firstname: 'no user'})
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
    s.test('User successfully updated', st => {
      helpers.json('post', '/users/1')
        .set('Authorization', superAdminAuth)
        .send({firstname: 'Changed'})
        .end((err, res) => {
          st.same(
            {status: res.status, firstname: res.body.firstname},
            {status: 200, firstname: 'Changed'}
          );
          st.end();
        });
    });

    s.test('User successfully updated by admin', st => {
      helpers.json('post', '/users/2')
        .set('Authorization', adminAuth)
        .send({firstname: 'Changed by admin'})
        .end((err, res) => {
          st.same(
            {status: res.status, firstname: res.body.firstname},
            {status: 200, firstname: 'Changed by admin'}
          );
          st.end();
        });
    });

    s.test('User successfully updated by superadmin', st => {
      helpers.json('post', '/users/2')
        .set('Authorization', superAdminAuth)
        .send({firstname: 'Changed by superadmin'})
        .end((err, res) => {
          st.same(
            {status: res.status, firstname: res.body.firstname},
            {status: 200, firstname: 'Changed by superadmin'}
          );
          st.end();
        });
    });
  });
});

test('DELETE /users/:userId', t => {

  t.test('Failed', f => {
    f.test('Fail to delete user because not admin', ft => {
      helpers.json('delete', '/users/2')
        .set('Authorization', normalAuth)
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 403, message: lang.notAuthorized}
          );
          ft.end();
        });
    });

    f.test('Fail to delete self', ft => {
      helpers.json('delete', '/users/1')
        .set('Authorization', superAdminAuth)
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 403, message: lang.cannotDeleteSelf}
          );
          ft.end();
        });
    });

    f.test('Fail to delete because no user found', ft => {
      helpers.json('delete', '/users/1950')
        .set('Authorization', adminAuth)
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
    s.test('User successfully deleted', st => {
      helpers.json('delete', '/users/4')
        .set('Authorization', superAdminAuth)
        .end((err, res) => {
          st.same(
            {status: res.status, message: res.body.message},
            {status: 200, message: lang.successfullyRemoved(lang.models.user)}
          );
          st.end();
        });
    });
  });
});
