'use strict';

const User = require('../').user;
const lang = require('../../config/language');
const genericUser = require('./_generic')(User, lang.models.user);

function getOrCreateFacebookUser(profile, token) {
  // find the user in the database based on their facebook id only
  return User.scope('socialUsers').findOne({
    where: { facebookId: profile.id }
  })
  .then( (user) => {

    if (user) return Promise.resolve(user);

    return genericUser.create({
      facebookId: profile.id,
      facebookToken: token,
      firstname: profile.name.givenName,
      lastname: profile.name.familyName,
      confirmed: true,
      /* TODO
       will facebook always return email?
       if facebook returns array of mails which one to chose?
      */
      facebookEmail: profile.emails.length > 0 ? profile.emails[0].value : null
    });
  });
}

module.exports = {
  getOrCreateFacebookUser: getOrCreateFacebookUser
};
