'use strict';

const facebookStrategy = require('passport-facebook').Strategy;
const config = require('../config');
const services = require('../models/services');

/* istanbul ignore next */
module.exports = function(passport) {
  //TODO implement other passport strategies here (google, twiter, github ...)
  passport.use( new facebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: ['id', 'emails', 'name']
  },
  function(token, refreshToken, profile, done) {
    services.socialUser.getOrCreateFacebookUser(profile, token)
    .then( (user) => {
      return done(null, user);
    })
    .catch(err => {
      return done(err);
    });
  }));
};
