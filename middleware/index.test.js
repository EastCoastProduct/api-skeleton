'use strict';

const lang = require('../config/language');
const tests = require('tape');
const responseMiddleware = require('.').responseMiddleware;
const helpers = require('../utils/test/helper');

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

    failed.test('Remove files from resources because something broke', test => {
      let stub = helpers.stubS3();
      const {req, res} = helpers.generateRequestAndResponse();

      res.locals = {
        _delete: {
          file: {id: 4},
          files: [{id: 5}, {id: 6}]
        }
      };

      responseMiddleware(req, res, err => {
        test.error(err, 'There should be no error message');
        helpers.resetStub(stub);
        test.end();
      });
    });
  });
});
