'use strict';

const upload = require('./upload');
const tests = require('tape');
const mock = require('node-mocks-http');
const helpers = require('../utils/test/helper');

const generateFakeImage = name => ({
  originalname: `${name}.jpg`,
  mimetype: 'image/jpeg'
});

const generateFakeDocument = name => ({
  originalname: `${name}.txt`,
  mimetype: 'text/plain'
});

function generateFilesRequestResponse(files, name) {
  let reqObj = { method: 'POST', url: '/dummy' };
  reqObj[name] = files;

  const req = mock.createRequest(reqObj);
  const res = mock.createResponse(req);

  return {req, res};
}

tests('Upload', uploadMiddleware => {
  let s3Stub = helpers.stubS3();

  uploadMiddleware.test('Upload documents', uploadDocuments => {
    uploadDocuments.test('Success', success => {
      success.test('Upload document', test => {
        let fakeFile = generateFakeDocument('dummy');
        const {req, res} = generateFilesRequestResponse(fakeFile, 'file');

        upload.uploadDocument('document')(req, res, err => {
          test.error(err, 'There should be no error');
          test.same(res.locals._uploaded.file, {_filename: 'dummy.txt'});
          helpers.resetStub(s3Stub, false);
          test.end();
        });
      });

      success.test('Upload documents', test => {
        let fakeFiles = [
          generateFakeDocument('dummy1'),
          generateFakeDocument('dummy2')
        ];
        const {req, res} = generateFilesRequestResponse(fakeFiles, 'files');

        upload.uploadDocuments('document')(req, res, err => {
          test.error(err, 'There should be no error');
          test.same(
            res.locals._uploaded.files,
            [{_filename: 'dummy1.txt'}, {_filename: 'dummy2.txt'}]
          );
          helpers.resetStub(s3Stub, false);
          test.end();
        });
      });

      success.test('Upload image', test => {
        let fakeFile = generateFakeImage('dummy');
        const {req, res} = generateFilesRequestResponse(fakeFile, 'file');

        upload.uploadImages('image')(req, res, err => {
          test.error(err, 'There should be no error');
          test.same(res.locals._uploaded.file, {_filename: 'dummy.jpg'});
          helpers.resetStub(s3Stub, false);
          test.end();
        });
      });

      success.test('Upload images', test => {
        let fakeFiles = [
          generateFakeImage('dummy1'),
          generateFakeImage('dummy2')
        ];
        const {req, res} = generateFilesRequestResponse(fakeFiles, 'files');

        upload.uploadImages('image')(req, res, err => {
          test.error(err, 'There should be no error');
          test.same(
            res.locals._uploaded.files,
            [{_filename: 'dummy1.jpg'}, {_filename: 'dummy2.jpg'}]
          );
          helpers.resetStub(s3Stub);
          test.end();
        });
      });
    });
  });
});
