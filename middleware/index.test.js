'use strict';

const test = require('tape');
const helpers = require('../utils/test/helper');
const lang = require('../config/language');

test('Middleware test', t => {
  t.test('Failed', f => {
    f.test('Not found route', ft => {
      helpers.json('get', '/404')
        .end((err, res) => {
          ft.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.routeNotFound}
          );
          ft.end();
        });
    });
  });
});
