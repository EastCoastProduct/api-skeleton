'use strict';

const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');
const mock = require('node-mocks-http');
const test = require('tape');
const resources = require('.');
const services = require('../../models/services');

function generateImage(name, extension) {
  return {
    _filename: `${name}.${extension}`,
    mimetype: 'image/jpeg',
    originalname: name
  };
}

function generateRequestAndResponse() {
  let req = mock.createRequest({
    method: 'POST',
    url: '/mapSingleFile'
  });
  let res = mock.createResponse();

  return {req, res};
}

test('Resources', t => {

  t.test('Failed', f => {

    f.test('It should fail because no image provided', ft => {
      const {req, res} = generateRequestAndResponse();

      resources.mapSingle(true)(req, res, err => {
        ft.same(
          {status: err.status, message: err.message},
          {status: 400, message: lang.fileNotProvided}
        );
        ft.end();
      });
    });

    f.test('It should fail because file is invalid', ft => {
      const {req, res} = generateRequestAndResponse();

      req.file = generateImage('newImage', 'jpg');
      delete req.file.mimetype;

      resources.mapSingle()(req, res, err => {
        ft.error(!err, 'There should be an error');
        ft.end();
      });
    });

    f.test('It should fail and break because files are not provided', ft => {
      const {req, res} = generateRequestAndResponse();

      resources.mapMultiple(true)(req, res, err => {
        ft.same(
          {status: err.status, message: err.message},
          {status: 400, message: lang.filesNotProvided}
        );
        ft.end();
      });
    });

    f.test('It should fail to create multiple because invalid file', ft => {
      const {req, res} = generateRequestAndResponse();
      req.files = [
        generateImage('someImage2', 'jpg'),
        generateImage('someImage3', 'jpg')
      ];
      delete req.files[0].mimetype;

      resources.mapMultiple(true)(req, res, err => {
        ft.error(!err, 'There should be an error');
        ft.end();
      });
    });
  });

  t.test('Success', s => {
    s.test('It should create a new resource', st => {
      const {req, res} = generateRequestAndResponse();
      req.file = generateImage('newImage', 'jpg');

      resources.mapSingle()(req, res, err => {
        st.error(err, 'There should be no error because file is provided');
        st.end();
      });
    });

    s.test('It should create a new resources', st => {
      const {req, res} = generateRequestAndResponse();
      req.files = [
        generateImage('newImage2', 'jpg'),
        generateImage('newImage3', 'jpg')
      ];

      resources.mapMultiple()(req, res, err => {
        st.error(err, 'There should be no error because file is provided');
        st.end();
      });
    });

    s.test('It should pass because no file provided', st => {
      const {req, res} = generateRequestAndResponse();

      resources.mapSingle()(req, res, err => {
        st.error(err, 'There should be no error');
        st.end();
      });
    });

    s.test('It should pass because no files are not provided', st => {
      const {req, res} = generateRequestAndResponse();

      resources.mapMultiple()(req, res, err => {
        st.error(err, 'There should be no error');
        st.end();
      });
    });

    s.test('It should delete a resource', st => {
      let stub = helpers.stubS3();

      services.resource.remove({id: 3}).then(resp => {
        st.error(!resp, 'There should be a response');
        helpers.resetStub(stub);
        st.end();
      });
    });
  });
});
