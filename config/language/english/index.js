'use strict';

const errors = require('./errors');
const messages = require('./messages');

module.exports = {
  // All model names
  models: {
    emailConfirmation: 'Confirmation email',
    forgotPassword: 'Recovery token',
    resource: 'Resource',
    user: 'User'
  },
  
  errors: errors,
  messages: messages
};
