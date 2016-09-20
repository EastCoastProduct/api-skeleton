'use strict';

const test = require('tape');
const helpers = require('../utils/test/helper');
const lang = require('../config/language');

test('Not found route', t => {
  helpers.json('get', '/404')
    .end((err, res) => {
      t.same(
        {status: res.status, message: res.body.message},
        {status: 404, message: lang.routeNotFound}
      );
      t.end();
    });
});
