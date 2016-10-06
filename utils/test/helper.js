'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk');
const path = require('path');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const request = require('supertest');
const mailer = require('../mailer');
const mock = require('node-mocks-http');
const sinon = require('sinon');
require('sinon-as-promised');

const app = require('../../app');
const config = require('../../config');
const defaultValue = require('../').defaultValue;

const helpers = {};

helpers.json = function json(verb, url) {
  return request(app)[verb](url)
    .set({
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }})
    .expect({'Content-Type': /json/});
};

helpers.signToken = (object) => {
  let userId = object.userId;
  let jwtKey = defaultValue(object.jwtKey, config.jwtKey);
  let expiresIn = defaultValue(object.expiresIn, config.tokenExpiration);

  return jwt.sign(
    { userId: userId },
    jwtKey,
    { expiresIn: expiresIn }
  );
};

helpers.signSuperAdminToken = (object) => {
  let userId = object.userId;
  let jwtKey = defaultValue(object.jwtKey, config.jwtKey);
  let expiresIn = defaultValue(object.expiresIn, config.tokenExpiration);

  return jwt.sign(
    { userId: userId, isSuperAdmin: true },
    jwtKey,
    { expiresIn: expiresIn }
  );
};

helpers.getAuthorizationHeader = function getAuthorizationHeader(userId) {
  return 'Bearer ' + helpers.signToken({ userId: userId });
};

helpers.getSuperAdminAuthorizationHeader =
  function getSuperAdminAuthorizationHeader(userId) {
    return 'Bearer ' + helpers.signSuperAdminToken({ userId: userId });
  };

/*
  Generic mock helper
*/

helpers.generateRequestAndResponse = () => {
  let req = mock.createRequest({
    method: 'POST',
    url: '/dummy'
  });
  let res = mock.createResponse();

  return {req, res};
};

/*
  Stub helper
*/
helpers.stubMailer = (result, isError) => {
  let emailStub = sinon.stub(mailer.transport, 'sendMail');

  if (isError) {
    emailStub.throws(result);
  } else {
    emailStub.resolves(result);
  }

  return emailStub;
};

helpers.stubS3 = (r, isError) => {
  let stubbedResp = {};
  stubbedResp.promise = () =>
    (isError) ? Promise.reject(r) : Promise.resolve(r);
  let stubbedObj = {
    putObject: () => stubbedResp,
    deleteObject: () => stubbedResp
  };

  let stub = sinon.stub(AWS, 'S3').returns(stubbedObj);

  return stub;
};

helpers.resetStub = (stub, restoreStub = true) => {
  stub.reset();
  if (restoreStub) stub.restore();
};

/*
  File helper
*/
const filePath = function(directory, file) {
  if (arguments.length < 2) {
    file = directory;
    directory = '/utils/fixtures/files';
  }

  return path.resolve(__dirname, `../../${directory}/${file}`);
};
helpers.filePath = filePath;

helpers.filePaths = (files) => _.transform(files, (result, file, key) => {
  result[key] = filePath(file);
});

module.exports = helpers;
