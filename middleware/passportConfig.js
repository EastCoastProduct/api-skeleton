'use strict';

const facebookStrategy = require('passport-facebook').Strategy;
const config = require('../config');
const services = require('../models/services');

module.exports = function(passport) {
  // facebook configuration
  passport.use( new facebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL
  },
  function(token, refreshToken, profile, done) {
    // find the user in the database based on their facebook id
    services.user.getOne({ facebookId: profile.id })
    .then( (user) => {

      if (user) return done(null, user);

      services.user.create({
        facebookId: profile.id,
        facebookToken: token,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName
        // TODO do we need facebook email for anything?
        // email: profile.emails[0].value
      })
      .then( (newUser) => {
        return done(null, newUser);
      });
    })
    .catch(err => {
      return done(err);
    });
  }));
};
