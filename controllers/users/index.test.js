'use strict';

const tests = require('tape');
const helpers = require('../../utils/test/helper');
const Resource = require('../../models').resource;
const lang = require('../../config/language');
const superAdminAuth = helpers.getAuthorizationHeader(1);
const adminAuth = helpers.getAuthorizationHeader(3);
const normalAuth = helpers.getAuthorizationHeader(4);
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
        .end((err, res) => {
          const debugInfoError = [
            {path: 'confirmed', message: lang.unrecognizedParameter},
            {path: 'email', message: lang.required},
            {path: 'password', message: lang.required}
          ];

          test.same(
            {status: res.status, debugInfo: res.body.debugInfo},
            {status: 400, debugInfo: debugInfoError}
          );
          test.end();
        });
    });

    failed.test('User already exists', test => {
      helpers.json('post', '/users')
        .send({
          email: 'john.doe@ecp.io',
          password: 'Sifra123!',
          firstname: 'Name',
          lastname: 'Surname'
        })
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.alreadyExists(lang.models.user)}
          );
          test.end();
        });
    });
  });

  userCreate.test('Success', success => {
    success.test('User successfully created', test => {
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


tests('GET /users', usersList => {
  usersList.test('List users', test => {
    helpers.json('get', '/users').end((err, res) => {
      test.same(res.status, 200);
      test.end();
    });
  });
});


tests('GET /users/:userId', userShow => {

  userShow.test('Failed', failed => {
    failed.test('Fail to get one user', test => {
      helpers.json('get', '/users/1950').end((err, res) => {
        test.same(
          {status: res.status, message: res.body.message},
          {status: 404, message: lang.notFound(lang.models.user)}
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
          email: 'john.doe@ecp.io',
          firstname: 'McFirstname0',
          lastname: 'McLastname0',
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
        .send({firstname: 'tryToChange'})
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 401, message: 'No authorization token was found'}
          );
          test.end();
        });
    });

    failed.test('User not authorized to update other user', test => {
      helpers.json('post', '/users/2')
        .set('Authorization', normalAuth)
        .send({firstname: 'tryToChange'})
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 403, message: lang.notAuthorized}
          );
          test.end();
        });
    });

    failed.test('Invalid params', test => {
      helpers.json('post', '/users/1')
        .set('Authorization', superAdminAuth)
        .send({email: 'cantDo@it.likethis'})
        .end((err, res) => {
          const debugInfoError = [
            {path: 'email', message: lang.unrecognizedParameter}
          ];

          test.same(
            {status: res.status, debugInfo: res.body.debugInfo},
            {status: 400, debugInfo: debugInfoError}
          );
          test.end();
        });
    });

    failed.test('User not found for update', test => {
      helpers.json('post', '/users/1950')
        .set('Authorization', superAdminAuth)
        .send({firstname: 'no user'})
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.notFound(lang.models.user)}
          );
          test.end();
        });
    });

    failed.test('Wrong image name', test => {
      helpers.json('post', '/users/1')
        .set('Authorization', superAdminAuth)
        .attach('wrongImage', files.image)
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 400, message: lang.unrecognizedFileField('wrongImage')}
          );
          test.end();
        });
    });
  });

  userEdit.test('Success', success => {
    let stubS3 = helpers.stubS3({image: 'someImage'});

    success.test('User successfully updated', test => {
      helpers.json('post', '/users/1')
        .set('Authorization', superAdminAuth)
        .send({firstname: 'Changed'})
        .end((err, res) => {
          test.same(
            {status: res.status, firstname: res.body.firstname},
            {status: 200, firstname: 'Changed'}
          );
          test.end();
        });
    });

    success.test('User successfully updated by admin', test => {
      helpers.json('post', '/users/2')
        .set('Authorization', adminAuth)
        .send({firstname: 'Changed by admin'})
        .end((err, res) => {
          test.same(
            {status: res.status, firstname: res.body.firstname},
            {status: 200, firstname: 'Changed by admin'}
          );
          test.end();
        });
    });

    success.test('User successfully updated by superadmin', test => {
      helpers.json('post', '/users/2')
        .set('Authorization', superAdminAuth)
        .send({firstname: 'Changed by superadmin'})
        .end((err, res) => {
          test.same(
            {status: res.status, firstname: res.body.firstname},
            {status: 200, firstname: 'Changed by superadmin'}
          );
          test.end();
        });
    });

    success.test('User updated with image and remove previous', test => {
      helpers.json('post', '/users/1')
        .set('Authorization', superAdminAuth)
        .attach('image', files.image)
        .end((err, res) => {
          test.same({status: res.status}, {status: 200});
          test.error(!res.body.image, 'Image not mapped properly');
          Resource.findById(1).then(resource => {
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
    failed.test('Fail to delete user because not admin', test => {
      helpers.json('delete', '/users/2')
        .set('Authorization', normalAuth)
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 403, message: lang.notAuthorized}
          );
          test.end();
        });
    });

    failed.test('Fail to delete self', test => {
      helpers.json('delete', '/users/1')
        .set('Authorization', superAdminAuth)
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 403, message: lang.cannotDeleteSelf}
          );
          test.end();
        });
    });

    failed.test('Fail to delete because no user found', test => {
      helpers.json('delete', '/users/1950')
        .set('Authorization', adminAuth)
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.notFound(lang.models.user)}
          );
          test.end();
        });
    });
  });

  userDelete.test('Success', success => {
    let s3Stub = helpers.stubS3();
    success.test('User successfully deleted', test => {
      helpers.json('delete', '/users/4')
        .set('Authorization', superAdminAuth)
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 200, message: lang.successfullyRemoved(lang.models.user)}
          );
          helpers.resetStub(s3Stub);
          test.end();
        });
    });
  });
});
