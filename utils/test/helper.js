'use strict';

const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../../app');
const config = require('../../config');
const defaultValue = require('../').defaultValue;

var helpers = {};

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
  var userId = object.userId;
  var jwtKey = defaultValue(object.jwtKey, config.jwtKey);
  var expiresIn = defaultValue(object.expiresIn, config.tokenExpiration);

  return jwt.sign(
    { userId: userId },
    jwtKey,
    { expiresIn: expiresIn }
  );
};

helpers.getAuthorizationHeader = function getAuthorizationHeader(userId) {
  return 'Bearer ' + helpers.signToken({ userId: userId });
};

module.exports = helpers;
