'use strict';

const services = require('.');
const tests = require('tape');
const lang = require('../../config/language');

tests('Generic model tests', generic => {

  generic.test('Failed', failed => {
    failed.test('Generic check if model exists fail', test => {
      services.user.exists({ where: { email: 'some@guy.io' }})
      .catch( err => {
        test.same(
          { status: err.status, message: err.message },
          { status: 400, message: lang.errors.doesNotExist(lang.models.user) }
        );
        test.end();
      });
    });

    failed.test('Generic check if model does not exist fail', test => {
      services.user.doesNotExist({ where: { email: 'regular@mail.com' }})
      .catch( err => {
        test.same(
          err,
          { status: 400, message: lang.errors.alreadyExists(lang.models.user) }
        );
        test.end();
      });
    });

    failed.test('Generic remove failure', test => {
      services.user.remove({ email: 'asd.one@mail.com' })
      .catch( err => {
        test.same(err, { status: 404, message: lang.errors.notFound(lang.models.user) });
        test.end();
      });
    });

    failed.test('Generic remove by id failure', test => {
      services.user.removeById(1950)
      .catch( err => {
        test.same(err, { status: 404, message: lang.errors.notFound(lang.models.user) });
        test.end();
      });
    });

    failed.test('Generic update failure', test => {
      services.user.update(
        { firstname: 'New firstname', lastname: 'New lastname' },
        { email: 'not.user@mail.com' }
      )
      .catch( err => {
        test.same(err, { status: 404, message: lang.errors.notFound(lang.models.user) });
        test.end();
      });
    });
  });

  generic.test('Success', success => {
    success.test('Generic bulk create', test => {
      let users = [
        { email: 'bulkcreate1@mail.com', password: 'Password123' },
        { email: 'bulkcreate2@mail.com', password: 'Password123' },
        { email: 'bulkcreate3@mail.com', password: 'Password123' }
      ];
      services.user.bulkCreate(users)
      .then( result => {
        test.same(
          [result[0].email, result[1].email, result[2].email],
          [users[0].email, users[1].email, users[2].email]
        );
        test.end();
      });
    });

    success.test('Generic model create', test => {
      services.user.create({
        email: 'awesome.created.guy@mail.com',
        firstname: 'Harry',
        lastname: 'Richardson',
        password: 'Password123'
      })
      .then( result => {
        test.same({
          email: result.email,
          firstname: result.firstname,
          lastname: result.lastname
        }, {
          email: 'awesome.created.guy@mail.com',
          firstname: 'Harry',
          lastname: 'Richardson'
        });
        test.end();
      });
    });

    success.test('Generic check if model exists success', test => {
      services.user.exists({ where: { email: 'regular@mail.com' }})
      .then( result => {
        test.same(result, 1);
        test.end();
      });
    });

    success.test('Generic check if model does not exist success', test => {
      services.user.doesNotExist({ where: { email: 'some@guy.com' }})
      .then( result => {
        test.same(result, 0);
        test.end();
      });
    });

    success.test('Generic list', test => {
      services.user.list({ limit: 1 })
      .then( users => {
        test.error(!users.rows, 'No users');
        test.end();
      });
    });

    success.test('Generic remove success', test => {
      services.user.remove({ email: 'delete.one@mail.com' })
      .then( result => {
        test.same(result, 1);
        test.end();
      });
    });

    success.test('Generic remove by id success', test => {
      services.user.removeById(8)
      .then( result => {
        test.same(result, 1);
        test.end();
      });
    });

    success.test('Generic get one success', test => {
      services.user.getOne({ email: 'regular@mail.com' })
      .then( user => {
        test.same({ email: user.email }, { email: 'regular@mail.com' });
        test.end();
      });
    });

    success.test('Generic update success', test => {
      services.user.update(
        { firstname: 'New firstname', lastname: 'New lastname' },
        { email: 'update.one@mail.com' }
      )
      .then( user => {
        test.same(
          { firstname: user.firstname, lastname: user.lastname },
          { firstname: 'New firstname', lastname: 'New lastname' }
        );
        test.end();
      });
    });
  });
});
