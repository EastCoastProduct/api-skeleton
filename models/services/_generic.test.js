'use strict';

const services = require('.');
const tests = require('tape');
const lang = require('../../config/language');

tests('Generic model tests', generic => {

  generic.test('Failed', failed => {
    failed.test('Generic check if model exists fail', test => {
      services.user.exists({where: {email: 'some@guy.io'}}).catch(err => {
        test.same(
          {status: err.status, message: err.message},
          {status: 400, message: lang.doesNotExist(lang.models.user)}
        );
        test.end();
      });
    });

    failed.test('Generic check if model does not exist fail', test => {
      services.user.doesNotExist({where: {email: 'john.doe@ecp.io'}})
      .catch(err => {
        test.same(
          err,
          {status: 400, message: lang.alreadyExists(lang.models.user)}
        );
        test.end();
      });
    });

    failed.test('Generic remove failure', test => {
      services.user.remove({email: 'asd.one@ecp.io'}).catch(err => {
        test.same(err, {status: 404, message: lang.notFound(lang.models.user)});
        test.end();
      });
    });

    failed.test('Generic remove by id failure', test => {
      services.user.removeById(1950).catch(err => {
        test.same(err, {status: 404, message: lang.notFound(lang.models.user)});
        test.end();
      });
    });

    failed.test('Generic update failure', test => {
      services.user.update(
        {firstname: 'New firstname', lastname: 'New lastname'},
        {email: 'not.user@ecp.io'}
      ).catch(err => {
        test.same(err, {status: 404, message: lang.notFound(lang.models.user)});
        test.end();
      });
    });
  });

  generic.test('Success', success => {
    success.test('Generic bulk create', test => {
      let users = [
        {email: 'bulkcreate1@ecp.io', password: 'Password123'},
        {email: 'bulkcreate2@ecp.io', password: 'Password123'},
        {email: 'bulkcreate3@ecp.io', password: 'Password123'}
      ];
      services.user.bulkCreate(users).then(resp => {
        test.same(
          [resp[0].email, resp[1].email, resp[2].email],
          [users[0].email, users[1].email, users[2].email]
        );
        test.end();
      });
    });

    success.test('Generic model create', test => {
      services.user.create({
        email: 'created.guy@ecp.io',
        firstname: 'Harry',
        lastname: 'Richardson',
        password: 'Password123'
      })
      .then(resp => {
        test.same({
          email: resp.email,
          firstname: resp.firstname,
          lastname: resp.lastname
        }, {
          email: 'created.guy@ecp.io',
          firstname: 'Harry',
          lastname: 'Richardson'
        });
        test.end();
      });
    });

    success.test('Generic check if model exists success', test => {
      services.user.exists({where: {email: 'john.doe@ecp.io'}}).then(resp => {
        test.same(resp, 1);
        test.end();
      });
    });

    success.test('Generic check if model does not exist success', test => {
      services.user.doesNotExist({where: {email: 'some@guy.io'}}).then(resp => {
        test.same(resp, 0);
        test.end();
      });
    });

    success.test('Generic list', test => {
      services.user.list({limit: 1}).then(users => {
        test.error(!users.rows, 'No users');
        test.end();
      });
    });

    success.test('Generic remove success', test => {
      services.user.remove({email: 'delete.one@ecp.io'}).then(resp => {
        test.same(resp, 1);
        test.end();
      });
    });

    success.test('Generic remove by id success', test => {
      services.user.removeById(7).then(resp => {
        test.same(resp, 1);
        test.end();
      });
    });

    success.test('Generic get one success', test => {
      services.user.getOne({email: 'john.doe@ecp.io'}).then(user => {
        test.same({email: user.email}, {email: 'john.doe@ecp.io'});
        test.end();
      });
    });

    success.test('Generic update success', test => {
      services.user.update(
        {firstname: 'New firstname', lastname: 'New lastname'},
        {email: 'update.one@ecp.io'}
      ).then(user => {
        test.same(
          {firstname: user.firstname, lastname: user.lastname},
          {firstname: 'New firstname', lastname: 'New lastname'}
        );
        test.end();
      });
    });
  });
});

