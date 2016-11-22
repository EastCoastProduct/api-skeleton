'use strict';

const bcrypt = require('bcrypt');
const config = require('../../config');
const lang = require('../../config/language');
const jwt = require('jsonwebtoken');
const prependS3 = require('../../utils/s3').prependS3;
const validator = require('../../middleware/validator');

const errors = require('../../utils/errors');
const Error400 = errors.Error400;
const Error404 = errors.Error404;

const models = require('../../models');
const User = models.user;
const Resource = models.resource;

const validate = {
  authenticate: validator.validation('body', {
    rules: {
      email: 'email',
      password: 'password'
    },
    required: ['email', 'password']
  })
};

function authenticate(req, res, next) {
  User.findOne({
    where: { email: req.body.email.toLowerCase() },
    include: { model: Resource, required: false }
  })
  .then( user => {
    if (!user) throw Error404(lang.errors.notFound(lang.models.user));

    const sentPassword = req.body.password;
    const oldPassword = user.password.trim();
    let isCorrectPassword = bcrypt.compareSync(sentPassword, oldPassword);

    if (!isCorrectPassword) throw Error400(lang.errors.wrongPassword);

    const token = jwt.sign(
      { userId: user.id },
      config.jwtKey,
      { expiresIn: config.tokenExpiration }
    );

    res.status(200);
    res.locals = { token: token, user: prependS3(user, 'image') };
    next();
  })
  .catch(err => next(err));
}

/* istanbul ignore next */
function authenticateSocial(req, res, next) {
  let user = req.user;

  const token = jwt.sign(
    { userId: user.id },
    config.jwtKey,
    { expiresIn: config.tokenExpiration }
  );

  res.status(200);
  res.locals = {
    token: token,
    user: prependS3(user, 'image'),
    socialLogin: true
  };
  next();
}

module.exports = {
  authenticate: authenticate,
  authenticateSocial: authenticateSocial,
  validate: validate,
  superAdmin: require('./superAdmin')
};
