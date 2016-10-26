'use strict';

const _ = require('lodash');
const tests = require('tape');
const config = require('../../config');
const helpers = require('../../utils/test/helper');
const Resource = require('../../models').resource;
const lang = require('../../config/language');
const normalAuth = helpers.getAuthorizationHeader(1);
const secondNormalAuth = helpers.getAuthorizationHeader(2);
const fifthNormalAuth = helpers.getAuthorizationHeader(5);
const superAdminAuth = helpers.getSuperAdminAuthorizationHeader(1);

const files = helpers.filePaths({
  image: 'ecp.jpg',
  imageUppercase: 'ecp.JPG'
});

tests('POST /users', userCreate => {

  userCreate.test('Failed', failed => {
    failed.test('Invalid params', test => {
      helpers.json('post', '/users')
        .send({
          confirmed: true
        })
        .end( (err, res) => {
          const debugInfoError = [
            { path: 'confirmed', message: lang.errors.unrecognizedParameter },
            { path: 'email', message: lang.errors.required },
            { path: 'password', message: lang.errors.required }
          ];

          test.same(
            { status: res.status, debugInfo: res.body.debugInfo },
            { status: 400, debugInfo: debugInfoError }
          );
          test.end();
        });
    });

    failed.test('User already exists', test => {
      helpers.json('post', '/users')
        .send({
          email: 'regular@mail.com',
          password: 'Passwrd123!',
          firstname: 'Name',
          lastname: 'Surname'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.alreadyExists(lang.models.user) }
          );
          test.end();
        });
    });
  });

  userCreate.test('Success', success => {
    success.test('User successfully created', test => {
      let emailStub = helpers.stubMailer('success');
      let newUser = {
        email: 'new.user@mail.com',
        password: 'Passwrd123!',
        firstname: 'Name',
        lastname: 'Surname'
      };

      helpers.json('post', '/users')
        .send(newUser)
        .end( (err, res) => {
          test.same({
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
          helpers.resetStub(emailStub);
          test.end();
        });
    });
  });
});

tests('GET /superAdmin/users', usersList => {

  usersList.test('Failed', failed => {
    failed.test('invalid query parameters', test => {
      helpers.json('get', '/superAdmin/users?page=string&limit=3')
      .set('Authorization', superAdminAuth)
      .end( (err, res) => {
        test.same(
          { status: res.status, message: res.body.debugInfo[0].message },
          // TODO change message upon validator update
          { status: 400, message: 'has to be positive' }
        );
        test.end();
      });
    });

    failed.test('invalid query parameters', test => {
      helpers.json('get', '/superAdmin/users?page=1&limit=string')
      .set('Authorization', superAdminAuth)
      .end( (err, res) => {
        test.same(
          { status: res.status, message: res.body.debugInfo[0].message },
          // TODO change message upon validator update
          { status: 400, message: 'has to be positive' }
        );
        test.end();
      });
    });

    failed.test('user not super admin', test => {
      helpers.json('get', '/superAdmin/users')
      .set('Authorization', normalAuth)
      .end( (err, res) => {
        test.same(
          { status: res.status, message: res.body.message },
          { status: 403, message: lang.errors.notAuthorized }
        );
        test.end();
      });
    });

  });

  usersList.test('Success', success => {

    success.test('List users with default pagination', test => {
      helpers.json('get', '/superAdmin/users')
      .set('Authorization', superAdminAuth)
      .end( (err, res) => {
        test.same({
          status: res.status,
          count: res.body.rows.length,
          firstMemberId: res.body.rows[0].id,
          lastMemberId: _.last(res.body.rows).id
        }, {
          status: 200,
          count: config.paginate.limit,
          firstMemberId: 1,
          lastMemberId: 10
        });
        test.end();
      });
    });

    success.test('List users with custom limit and page', test => {
      helpers.json('get', '/superAdmin/users?page=1&limit=3')
      .set('Authorization', superAdminAuth)
      .end( (err, res) => {
        test.same({
          status: res.status,
          count: res.body.rows.length,
          firstMemberId: res.body.rows[0].id,
          lastMemberId: _.last(res.body.rows).id
        }, {
          status: 200,
          count: 3,
          firstMemberId: 1,
          lastMemberId: 3
        });
        test.end();
      });
    });

    success.test('List users for page 2 and custom limit', test => {
      helpers.json('get', '/superAdmin/users?page=2&limit=7')
      .set('Authorization', superAdminAuth)
      .end( (err, res) => {
        test.same({
          status: res.status,
          count: res.body.rows.length,
          firstMemberId: res.body.rows[0].id,
          lastMemberId: _.last(res.body.rows).id
        }, {
          status: 200,
          count: 7,
          firstMemberId: 8,
          lastMemberId: 14
        });
        test.end();
      });
    });

    success.test('List users with custom pagination and search', test => {
      helpers.json('get', '/superAdmin/users')
      .set('Authorization', superAdminAuth)
      .query({ page: '1', limit: '3', search: 'regular,not.confirmed@mail.com' })
      .end( (err, res) => {
        test.error(!res.body.rows.length, 'No users');
        test.same(res.body.rows.length, 2);
        test.end();
      });
    });

    success.test('List users with custom pagination and filter', test => {
      helpers.json('get', '/superAdmin/users')
      .set('Authorization', superAdminAuth)
      .query({ page: '1', limit: '4', confirmed: 'false' })
      .end( (err, res) => {
        test.error(!res.body.rows.length, 'No users');
        _.forEach(res.body.rows, (user) => {
          test.same(user.confirmed, false);
        });
        test.end();
      });
    });

    success.test('List users with custom pagination, filter, search and optional arguments', test => {
      helpers.json('get', '/superAdmin/users')
      .set('Authorization', superAdminAuth)
      .query({ page: '1', limit: '4', confirmed: 'true', search: 'regular,not.confirmed@mail.com' })
      .end( (err, res) => {
        test.error(!res.body.rows.length, 'No users');
        test.same(res.body.rows.length, 1);
        test.end();
      });
    });

  });
});

tests('GET /users/:userId', userShow => {

  userShow.test('Failed', failed => {
    failed.test('Fail to get one user', test => {
      helpers.json('get', '/users/1950').end((err, res) => {
        test.same(
          { status: res.status, message: res.body.message },
          { status: 404, message: lang.errors.notFound(lang.models.user) }
        );
        test.end();
      });
    });
  });

  userShow.test('Success', success => {
    success.test('Get one user', test => {
      helpers.json('get', '/users/1').end((err, res) => {
        test.same({
          status: res.status,
          email: res.body.email,
          firstname: res.body.firstname,
          lastname: res.body.lastname,
          confirmed: res.body.confirmed
        }, {
          status: 200,
          email: 'regular@mail.com',
          firstname: 'regular',
          lastname: 'regular',
          confirmed: true
        });
        test.end();
      });
    });
  });
});

tests('POST /users/:userId', userEdit => {

  userEdit.test('Failed', failed => {
    failed.test('User with no token', test => {
      helpers.json('post', '/users/1')
        .send({ firstname: 'tryToChange' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 401, message: 'No authorization token was found' }
          );
          test.end();
        });
    });

    failed.test('User updating other user', test => {
      helpers.json('post', '/users/2')
        .set('Authorization', normalAuth)
        .send({ firstname: 'tryToChange' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 403, message: lang.errors.notAuthorized }
          );
          test.end();
        });
    });

    failed.test('Invalid params', test => {
      helpers.json('post', '/users/1')
        .set('Authorization', normalAuth)
        .send({ email: 'cantDo@it.likethis' })
        .end( (err, res) => {
          const debugInfoError = [
            { path: 'email', message: lang.errors.unrecognizedParameter }
          ];

          test.same(
            { status: res.status, debugInfo: res.body.debugInfo },
            { status: 400, debugInfo: debugInfoError }
          );
          test.end();
        });
    });

    failed.test('User not found for update', test => {
      helpers.json('post', '/users/1950')
        .set('Authorization', superAdminAuth)
        .send({ firstname: 'no user' })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.errors.notFound(lang.models.user) }
          );
          test.end();
        });
    });

    failed.test('Wrong image name', test => {
      helpers.json('post', '/users/1')
        .set('Authorization', normalAuth)
        .attach('wrongImage', files.image)
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.unrecognizedFileField('wrongImage') }
          );
          test.end();
        });
    });
  });

  userEdit.test('Success', success => {
    let stubS3 = helpers.stubS3({image: 'someImage'});

    success.test('User successfully updated', test => {
      helpers.json('post', '/users/2')
        .set('Authorization', secondNormalAuth)
        .send({ firstname: 'Changed' })
        .end( (err, res) => {
          test.same(
            { status: res.status, firstname: res.body.firstname },
            { status: 200, firstname: 'Changed' }
          );
          test.end();
        });
    });

    success.test('User successfully updated by superadmin', test => {
      helpers.json('post', '/users/2')
        .set('Authorization', superAdminAuth)
        .send({ firstname: 'Changed by superadmin' })
        .end( (err, res) => {
          test.same(
            { status: res.status, firstname: res.body.firstname },
            { status: 200, firstname: 'Changed by superadmin' }
          );
          test.end();
        });
    });

    success.test('User updated with image and remove previous', test => {
      helpers.json('post', '/users/2')
        .set('Authorization', secondNormalAuth)
        .attach('image', files.image)
        .end( (err, res) => {
          test.same({ status: res.status }, { status: 200 });
          test.error(!res.body.image, 'Image not mapped properly');
          Resource.findById(1)
          .then( resource => {
            helpers.resetStub(stubS3);
            test.error(resource, 'Resource should not exist');
            test.end();
          });
        });
    });
  });
});

tests('DELETE /users/:userId', userDelete => {

  userDelete.test('Failed', failed => {
    failed.test('Fail to delete other user', test => {
      helpers.json('delete', '/users/2')
        .set('Authorization', normalAuth)
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 403, message: lang.errors.notAuthorized }
          );
          test.end();
        });
    });

    failed.test('Fail to delete because no user found', test => {
      helpers.json('delete', '/users/1950')
        .set('Authorization', superAdminAuth)
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.errors.notFound(lang.models.user) }
          );
          test.end();
        });
    });
  });

  userDelete.test('Success', success => {
    let s3Stub = helpers.stubS3();
    success.test('User successfully deleted', test => {
      helpers.json('delete', '/users/5')
        .set('Authorization', fifthNormalAuth)
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 200, message: lang.messages.successfullyRemoved(lang.models.user) }
          );
          helpers.resetStub(s3Stub, false);
          test.end();
        });
    });

    success.test('User and resource successfully deleted', test => {
      helpers.json('delete', '/users/17')
        .set('Authorization', superAdminAuth)
        .end( (err, res) => {
          test.error(!s3Stub.calledOnce, 'S3 delete should have been called');
          test.same(
            { status: res.status, message: res.body.message },
            { status: 200, message: lang.messages.successfullyRemoved(lang.models.user) }
          );
          helpers.resetStub(s3Stub);
          test.end();
        });
    });
  });
});
