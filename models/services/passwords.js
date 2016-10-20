'use strict';

const User = require('../').user;
const Error404 = require('../../utils/errors').Error404;
const ForgotPassword = require('../').forgotPassword;
const lang = require('../../config/language');
const langForgotPassword = lang.models.forgotPassword;
const generic = require('./_generic')(ForgotPassword, langForgotPassword);
const mailer = require('../../utils/mailer');

//TODO figure out what to send as argument to this services
//(req, req.body/params/query, or specific parameters)
function reset(req) {
  const createUser = user => generic.create({ userId: user.id })
    .then( confirmation =>
      mailer.forgotPassword({
        user: { email: user.email }, token: confirmation.token
      }));

  const getUser = email =>
    User.findOne({ where: { email: email }})
    .then( user => {
      if (!user) throw Error404(lang.errors.notFound(lang.models.user));

      return user;
    });

  const removeTokens = user =>
    ForgotPassword.destroy({ where: { userId: user.id }})
    .then( () => user );

  return getUser(req.body.email)
  .then( userToRemoveTokens => removeTokens(userToRemoveTokens) )
  .then( userToCreate => createUser(userToCreate) );
}

function changeWithToken(req) {
  const getByToken = token => generic.getOne({ token: token })
    .then( user => user.getUser());

  const removeByToken = token => generic.remove({ token: token });

  return getByToken(req.params.token)
    .then( userFromToken => {
      userFromToken.password = req.body.password;
      return userFromToken.save();
    })
    .then( () => removeByToken(req.params.token) );
}

module.exports = {
  changeWithToken: changeWithToken,
  reset: reset
};
