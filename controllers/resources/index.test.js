'use strict';

const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');
const tests = require('tape');
const resourcesMiddleware = require('.');
const services = require('../../models/services');

function generateImage(name, extension) {
  return {
    _filename: `${name}.${extension}`,
    mimetype: 'image/jpeg',
    originalname: name
  };
}

tests('Resources', resources => {

  resources.test('Failed', failed => {

    failed.test('It should fail because no image provided', test => {
      const { req, res } = helpers.generateRequestAndResponse();

      resourcesMiddleware.mapSingle(true)( req, res, err => {
        test.same(
          { status: err.status, message: err.message },
          { status: 400, message: lang.errors.fileNotProvided }
        );
        test.end();
      });
    });

    failed.test('It should fail because file is invalid', test => {
      const { req, res } = helpers.generateRequestAndResponse();

      req.file = generateImage('newImage', 'jpg');
      delete req.file.mimetype;

      resourcesMiddleware.mapSingle()(req, res, err => {
        test.error(!err, 'There should be an error');
        test.end();
      });
    });

    failed.test('It should fail and break because files are not provided', test => {
      const { req, res } = helpers.generateRequestAndResponse();

      resourcesMiddleware.mapMultiple(true)( req, res, err => {
        test.same(
          { status: err.status, message: err.message },
          { status: 400, message: lang.errors.filesNotProvided }
        );
        test.end();
      });
    });

    failed.test('It should fail to create multiple because invalid file', test => {
      const { req, res } = helpers.generateRequestAndResponse();
      req.files = [
        generateImage('someImage2', 'jpg'),
        generateImage('someImage3', 'jpg')
      ];
      delete req.files[0].mimetype;

      resourcesMiddleware.mapMultiple(true)( req, res, err => {
        test.error(!err, 'There should be an error');
        test.end();
      });
    });
  });

  resources.test('Success', success => {
    success.test('It should create a new resource', test => {
      const { req, res } = helpers.generateRequestAndResponse();

      req.file = generateImage('newImage', 'jpg');
      res.locals = {
        _uploaded: { file: {} },
        _delete: {}
      };

      resourcesMiddleware.mapSingle()(req, res, err => {
        test.error(err, 'There should be no error because file is provided');
        test.end();
      });
    });

    success.test('It should create new resources', test => {
      const { req, res } = helpers.generateRequestAndResponse();
      req.files = [
        generateImage('newImage2', 'jpg'),
        generateImage('newImage3', 'jpg')
      ];

      resourcesMiddleware.mapMultiple()(req, res, err => {
        test.error(err, 'There should be no error because file is provided');
        test.end();
      });
    });

    success.test('It should pass because no file provided', test => {
      const { req, res } = helpers.generateRequestAndResponse();

      resourcesMiddleware.mapSingle()(req, res, err => {
        test.error(err, 'There should be no error');
        test.end();
      });
    });

    success.test('It should pass because no files are not provided', test => {
      const {req, res} = helpers.generateRequestAndResponse();

      resourcesMiddleware.mapMultiple()( req, res, err => {
        test.error(err, 'There should be no error');
        test.end();
      });
    });

    success.test('It should delete a resource', test => {
      let stub = helpers.stubS3();

      services.resource.remove({ id: 3 })
      .then( response => {
        test.error(!response, 'There should be a response');
        helpers.resetStub(stub);
        test.end();
      });
    });
  });
});
