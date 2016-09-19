'use strict';

const services = require('.');
const test = require('tape');
const lang = require('../../config/language');

test('Generic model create', t => {
  services.user.create({
    email: 'created.guy@ecp.io',
    firstname: 'Harry',
    lastname: 'Richardson',
    password: 'password123'
  })
  .then(resp => {
    t.same({
      email: resp.email,
      firstname: resp.firstname,
      lastname: resp.lastname
    }, {
      email: 'created.guy@ecp.io',
      firstname: 'Harry',
      lastname: 'Richardson'
    });
    t.end();
  });
});

test('Generic check if model exists fail', t => {
  services.user.exists({where: {email: 'some@guy.io'}}).catch(err => {
    t.same(err.status, 400);
    t.same(err.message, lang.doesNotExist(lang.models.user));
    t.end();
  });
});

test('Generic check if model exists success', t => {
  services.user.exists({where: {email: 'john.doe@ecp.io'}}).then(resp => {
    t.same(resp, 1);
    t.end();
  });
});

test('Generic check if model does not exist fail', t => {
  services.user.doesNotExist({where: {email: 'john.doe@ecp.io'}}).catch(err => {
    t.same(err, {status: 400, message: lang.alreadyExists(lang.models.user)});
    t.end();
  });
});

test('Generic check if model does not exist success', t => {
  services.user.doesNotExist({where: {email: 'some@guy.io'}}).then(resp => {
    t.same(resp, 0);
    t.end();
  });
});

test('Generic list', t => {
  services.user.list({limit: 1}).then(users => {
    t.error(!users.rows, 'No users');
    t.end();
  });
});

test('Generic remove success', t => {
  services.user.remove({email: 'delete.one@ecp.io'}).then(resp => {
    t.same(resp, 1);
    t.end();
  });
});

test('Generic remove failure', t => {
  services.user.remove({email: 'asd.one@ecp.io'}).catch(err => {
    t.same(err, {status: 404, message: lang.notFound(lang.models.user)});
    t.end();
  });
});

test('Generic remove by id success', t => {
  services.user.removeById(7).then(resp => {
    t.same(resp, 1);
    t.end();
  });
});

test('Generic remove by id failure', t => {
  services.user.removeById(1950).catch(err => {
    t.same(err, {status: 404, message: lang.notFound(lang.models.user)});
    t.end();
  });
});

test('Generic get by id success', t => {
  services.user.getById(1).then(user => {
    t.same({email: user.email}, {email: 'john.doe@ecp.io'});
    t.end();
  });
});

test('Generic get by id success', t => {
  services.user.getById(1950).catch(err => {
    t.same(err, {status: 404, message: lang.notFound(lang.models.user)});
    t.end();
  });
});

test('Generic get one success', t => {
  services.user.getOne({email: 'john.doe@ecp.io'}).then(user => {
    t.same({email: user.email}, {email: 'john.doe@ecp.io'});
    t.end();
  });
});

test('Generic get one success', t => {
  services.user.getOne({email: 'asda@sd.com'}).catch(err => {
    t.same(err, {status: 404, message: lang.notFound(lang.models.user)});
    t.end();
  });
});

test('Generic update success', t => {
  services.user.update(
    {firstname: 'New firstname', lastname: 'New lastname'},
    {email: 'update.one@ecp.io'}
  ).then(user => {
    t.same(
      {firstname: user.firstname, lastname: user.lastname},
      {firstname: 'New firstname', lastname: 'New lastname'}
    );
    t.end();
  });
});

test('Generic update failure', t => {
  services.user.update(
    {firstname: 'New firstname', lastname: 'New lastname'},
    {email: 'not.user@ecp.io'}
  ).catch(err => {
    t.same(err, {status: 404, message: lang.notFound(lang.models.user)});
    t.end();
  });
});

