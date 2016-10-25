'use strict';
const _ = require('lodash');
const services = require('.');
const tests = require('tape');
const lang = require('../../config/language');

const Resource = require('../').resource;

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

    success.test('Generic list tests', listTest => {

      // list service tests

      listTest.test('Generic list - custom pagination', test => {
        services.user.list({ limit: 2, offset: 2 })
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.same(users.rows.length, 2);
          test.same(users.rows[0].id, 3);
          test.end();
        });
      });

      listTest.test('Generic list - custom pagination and optional arguments', test => {
        services.user.list(
          { offset: 2, limit: 2 },
          { include: { model: Resource, required: false }}
        )
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.same(users.rows.length, 2);
          test.same(users.rows[0].id, 3);
          test.end();
        });
      });

      // listWithSearchAndFilter service tests
      listTest.test('Generic list with search and filter - error in sending arguments', test => {
        services.user.listWithSearchAndFilter(
          { paginate: { offset: 0, limit: 3 }, query: { search: 'regular,not.confirmed@mail.com' }},
          [],
          { confirmed: 'true' },
          { include: { model: Resource, required: false }}
        )
        .catch( err => {
          test.same(err, { status: 500, message: 'Search values sent without search conditions in service for User' });
          test.end();
        });
      });

      listTest.test('Generic list with search and filter - empty parameters', test => {
        services.user.listWithSearchAndFilter()
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.end();
        });
      });

      listTest.test('Generic list with search and filter - custom pagination', test => {
        services.user.listWithSearchAndFilter({ paginate: { offset: 2, limit: 3 }})
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.same(users.rows.length, 3);
          test.same(users.rows[0].id, 3);
          test.end();
        });
      });

      listTest.test('Generic list with search and filter - custom pagination and search', test => {
        services.user.listWithSearchAndFilter(
          { paginate: { offset: 0, limit: 3 }, query: { search: 'regular,not.confirmed@mail.com' }},
          ['firstname', 'lastname', 'email']
        )
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.same(users.rows.length, 2);
          test.end();
        });
      });

      listTest.test('Generic list with search and filter - custom pagination and filter', test => {
        services.user.listWithSearchAndFilter(
          { paginate: { offset: 0, limit: 4 }},
          ['firstname', 'lastname', 'email'],
          { confirmed: 'false' }
        )
        .then( users => {
          test.error(!users.rows.length, 'No users');
          _.forEach(users.rows, (user) => {
            test.same(user.confirmed, false);
          });
          test.end();
        });
      });

      listTest.test('Generic list with search and filter - custom pagination, filter, search and optional arguments', test => {
        services.user.listWithSearchAndFilter(
          { paginate: { offset: 0, limit: 4 }, query: { search: 'regular,not.confirmed@mail.com' }},
          ['firstname', 'lastname', 'email'],
          { confirmed: 'true' },
          { include: { model: Resource, required: false }}
        )
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.same(users.rows.length, 1);
          test.end();
        });
      });

      //listWithSearch service tests

      listTest.test('Generic list with search and filter - error in sending arguments', test => {
        services.user.listWithSearch(
          { paginate: { offset: 0, limit: 3 }, query: { search: 'regular,not.confirmed@mail.com' }},
          [],
          { include: { model: Resource, required: false }}
        )
        .catch( err => {
          test.same(err, { status: 500, message: 'Search values sent without search conditions in service for User' });
          test.end();
        });
      });

      listTest.test('Generic list with search - empty parameters', test => {
        services.user.listWithSearch()
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.end();
        });
      });

      listTest.test('Generic list with search - custom pagination', test => {
        services.user.listWithSearch({ paginate: { offset: 1, limit: 3 }})
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.same(users.rows.length, 3);
          test.same(users.rows[0].id, 2);
          test.end();
        });
      });

      listTest.test('Generic list with search - custom pagination and search', test => {
        services.user.listWithSearch(
          { paginate: { offset: 0, limit: 3 }, query: { search: 'regular,not.confirmed@mail.com' }},
          ['firstname', 'lastname', 'email']
        )
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.same(users.rows.length, 2);
          test.end();
        });
      });

      listTest.test('Generic list with search - custom pagination, search and optional arguments', test => {
        services.user.listWithSearch(
          { paginate: { offset: 0, limit: 4 }, query: { search: 'regular,not.confirmed@mail.com' }},
          ['firstname', 'lastname', 'email'],
          { include: { model: Resource, required: false }}
        )
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.same(users.rows.length, 2);
          test.end();
        });
      });

      // listWithFilter service tests

      listTest.test('Generic list with filter - empty parameters', test => {
        services.user.listWithFilter()
        .then( users => {
          test.error(!users.rows, 'No users');
          test.end();
        });
      });

      listTest.test('Generic list with search and filter - custom pagination', test => {
        services.user.listWithFilter({ paginate: { offset: 3, limit: 3 }})
        .then( users => {
          test.error(!users.rows.length, 'No users');
          test.same(users.rows.length, 3);
          test.same(users.rows[0].id, 4);
          test.end();
        });
      });

      listTest.test('Generic list with filter - custom pagination and filter', test => {
        services.user.listWithFilter(
          { paginate: { offset: 1, limit: 4 }},
          { confirmed: 'false' }
        )
        .then( users => {
          test.error(!users.rows.length, 'No users');
          _.forEach(users.rows, (user) => {
            test.same(user.confirmed, false);
          });
          test.end();
        });
      });

      listTest.test('Generic list with filter - custom pagination, filter and optional arguments', test => {
        services.user.listWithFilter(
          { paginate: { page: 1, limit: 4 }},
          { confirmed: 'true' },
          { include: { model: Resource, required: false }}
        )
        .then( users => {
          test.error(!users.rows, 'No users');
          _.forEach(users.rows, (user) => {
            test.same(user.confirmed, true);
          });
          test.end();
        });
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
