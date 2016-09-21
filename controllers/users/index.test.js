'use strict';

const test = require('tape');
const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');
const superAdminAuth = helpers.getAuthorizationHeader(1);
const adminAuth = helpers.getAuthorizationHeader(3);
const normalAuth = helpers.getAuthorizationHeader(4);
const routes = {
  users: '/users',
  userId: '/users/:userId'
};

/*
  /POST users
*/

test(`${routes.users} Invalid params`, t => {
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

      t.same(
        {status: res.status, debugInfo: res.body.debugInfo},
        {status: 400, debugInfo: debugInfoError}
      );
      t.end();
    });
});

test(`${routes.users} User already exists`, t => {
  helpers.json('post', '/users')
    .send({
      email: 'john.doe@ecp.io',
      password: 'Sifra123!',
      firstname: 'Name',
      lastname: 'Surname'
    })
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 400, message: lang.alreadyExists(lang.models.user)}
      );
      t.end();
    });
});

test(`${routes.users} User successfully created`, t => {
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
      t.same(res.status, 201);
      t.same({
        bio: res.body.bio,
        email: res.body.email,
        confirmed: res.body.confirmed,
        firstname: res.body.firstname,
        lastname: res.body.lastname
      }, {
        bio: null,
        confirmed: false,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname
      });
      helpers.resetMailer(emailStub);
      t.end();
    });
});


/*
  GET /users
*/
test(`${routes.users} List users`, t => {
  helpers.json('get', '/users').end((err, res) => {
    t.same(res.status, 200);
    t.end();
  });
});


/*
  GET /users/:userId
*/
test(`${routes.userId} Fail to get one user`, t => {
  helpers.json('get', '/users/1950').end((err, res) => {
    t.same(
      {status: res.status, message: res.body.message},
      {status: 404, message: lang.notFound(lang.models.user)}
    );
    t.end();
  });
});

test(`${routes.userId} Get one user`, t => {
  helpers.json('get', '/users/1').end((err, res) => {
    t.same(res.status, 200);
    t.same({
      email: res.body.email,
      firstname: res.body.firstname,
      lastname: res.body.lastname,
      confirmed: res.body.confirmed
    }, {
      email: 'john.doe@ecp.io',
      firstname: 'Harry',
      lastname: 'Richardson',
      confirmed: true
    });
    t.end();
  });
});


/*
  POST /users/:userId
*/
test(`${routes.userId} User with no token`, t => {
  helpers.json('post', '/users/1')
    .send({firstname: 'tryToChange'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 401, message: 'No authorization token was found'}
      );
      t.end();
    });
});

test(`${routes.userId} User not authorized to update other user`, t => {
  helpers.json('post', '/users/2')
    .set('Authorization', normalAuth)
    .send({firstname: 'tryToChange'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 403, message: lang.notAuthorized}
      );
      t.end();
    });
});

test(`${routes.userId} Invalid params`, t => {
  helpers.json('post', '/users/1')
    .set('Authorization', superAdminAuth)
    .send({email: 'cantDo@it.likethis'})
    .end((err, res) => {
      const debugInfoError = [
        {path: 'email', message: lang.unrecognizedParameter}
      ];

      t.same(
        {status: res.status, debugInfo: res.body.debugInfo},
        {status: 400, debugInfo: debugInfoError}
      );
      t.end();
    });
});

test(`${routes.userId} User not found for update`, t => {
  helpers.json('post', '/users/1950')
    .set('Authorization', superAdminAuth)
    .send({firstname: 'no user'})
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 404, message: lang.notFound(lang.models.user)}
      );
      t.end();
    });
});

test(`${routes.userId} User successfully updated`, t => {
  helpers.json('post', '/users/1')
    .set('Authorization', superAdminAuth)
    .send({firstname: 'Changed'})
    .end((err, res) => {
      t.same(
        {status: res.status, firstname: res.body.firstname},
        {status: 200, firstname: 'Changed'}
      );
      t.end();
    });
});

test(`${routes.userId} User successfully updated by admin`, t => {
  helpers.json('post', '/users/2')
    .set('Authorization', adminAuth)
    .send({firstname: 'Changed by admin'})
    .end((err, res) => {
      t.same(
        {status: res.status, firstname: res.body.firstname},
        {status: 200, firstname: 'Changed by admin'}
      );
      t.end();
    });
});

test(`${routes.userId} User successfully updated by superadmin`, t => {
  helpers.json('post', '/users/2')
    .set('Authorization', superAdminAuth)
    .send({firstname: 'Changed by superadmin'})
    .end((err, res) => {
      t.same(
        {status: res.status, firstname: res.body.firstname},
        {status: 200, firstname: 'Changed by superadmin'}
      );
      t.end();
    });
});


/*
  DELETE /users/:userId
*/

// Failed requests
test(`${routes.userId} Fail to delete user because not admin`, t => {
  helpers.json('delete', '/users/2')
    .set('Authorization', normalAuth)
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 403, message: lang.notAuthorized}
      );
      t.end();
    });
});

test(`${routes.userId} Fail to delete self`, t => {
  helpers.json('delete', '/users/1')
    .set('Authorization', superAdminAuth)
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 403, message: lang.cannotDeleteSelf}
      );
      t.end();
    });
});

test(`${routes.userId} Fail to delete because no user found`, t => {
  helpers.json('delete', '/users/1950')
    .set('Authorization', adminAuth)
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 404, message: lang.notFound(lang.models.user)}
      );
      t.end();
    });
});

// Successfull requests
test(`${routes.userId} User successfully deleted`, t => {
  helpers.json('delete', '/users/4')
    .set('Authorization', superAdminAuth)
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 200, message: lang.successfullyRemoved(lang.models.user)}
      );
      t.end();
    });
});
