'use strict';

const bcrypt = require('bcrypt');
const config = require('../../config');
const errors = require('../../utils/errors');
const Error400 = errors.Error400;
const Error404 = errors.Error404;
const lang = require('../../config/language');
const User = require('../../models').user;
const jwt = require('jsonwebtoken');
const validator = require('../../middleware/validator');

const validate = {
  authenticate: validator.validation('body', {
    rules: {
      email: 'email',
      password: 'norule'
    },
    required: ['email', 'password']
  })
};

function authenticate(req, res, next) {
  User.findOne({where: {email: req.body.email}})
    .then(user => {
      if (!user) throw Error404(lang.notFound(lang.models.user));

      const sentPassword = req.body.password;
      const oldPassword = user.password.trim();
      let isCorrectPassword = bcrypt.compareSync(sentPassword, oldPassword);

      if (!isCorrectPassword) throw Error400(lang.wrongPassword);

      const token = jwt.sign(
        {userId: user.id},
        config.jwtKey,
        {expiresIn: config.tokenExpiration}
      );

      res.status(200);
      res.locals = {token: token, user: user};
      next();
    })
    .catch(err => next(err));
}

module.exports = {
  authenticate: authenticate,
  validate: validate
};
