'use strict';

const tests = require('tape');
const helpers = require('../utils/test/helper');
const lang = require('../config/language');

tests('Middleware test', middleware => {
  middleware.test('Failed', failed => {
    failed.test('Not found route', test => {
      helpers.json('get', '/404')
        .end((err, res) => {
          test.same(
            {status: res.status, message: res.body.message},
            {status: 404, message: lang.routeNotFound}
          );
          test.end();
        });
    });
  });
});
