'use strict';

const bcrypt = require('bcrypt');
const config = require('../../config');
const lang = require('../../config/language');
const jwt = require('jsonwebtoken');
const validator = require('../../middleware/validator');

const errors = require('../../utils/errors');
const Error400 = errors.Error400;
const Error404 = errors.Error404;

const models = require('../../models');
const SuperAdmin = models.superAdmin;

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
  SuperAdmin.findOne({ where: { email: req.body.email }})
    .then( superAdmin => {
      if (!superAdmin) throw Error404(lang.errors.notFound(lang.models.user));

      const sentPassword = req.body.password;
      const oldPassword = superAdmin.password.trim();
      let isCorrectPassword = bcrypt.compareSync(sentPassword, oldPassword);

      if (!isCorrectPassword) throw Error400(lang.errors.wrongPassword);

      const token = jwt.sign(
        { userId: superAdmin.id, isSuperAdmin: true },
        config.jwtKey,
        { expiresIn: config.tokenExpiration }
      );

      res.status(200);
      res.locals = { token: token, user: superAdmin };
      next();
    })
    .catch(err => next(err));
}

module.exports = {
  authenticate: authenticate,
  validate: validate
};
