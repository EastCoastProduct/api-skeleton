'use strict';

const services = require('../../models/services');
const validator = require('../../middleware/validator');
const lang = require('../../config/language');

const validate = {
  create: validator.validation('body', {
    rules: {
      oldEmail: 'email',
      newEmail: 'email',
      password: 'norule'
    },
    required: ['oldEmail', 'newEmail', 'password']
  })
};

function create(req, res, next) {

  res.status(200).json({message: 'Request change email'});
}

function confirm(req, res, next) {
  res.status(200).json({message: 'Changed email'});
}

module.exports = {
  create: create,
  confirm: confirm,
  validate: validate
};
