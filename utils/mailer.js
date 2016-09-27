'use strict';

const nodemailer = require('nodemailer');
const config = require('../config');
var transport = nodemailer.createTransport(config.mailOptions);

var emails = {
  dontReply: 'ECP Boilerplate <dont.reply@eastcoastproduct.com>'
};

const sendEmail = options => transport.sendMail(options).then(r => r);

function emailUpdate(options) {
  let link = `${config.webUrl}/emailConfirm/${options.token}`;
  let mailOptions = {
    to: options.user.email,
    from: emails.dontReply,
    subject: 'Change email',
    text: 'Please use the link to change your email.',
    html: '<p>Please use the link to change your email.</p>' +
          '<a href="' + link + '">Change Email</a>'
  };

  return sendEmail(mailOptions);
}

function emailConfirm(options) {
  let link = `${config.webUrl}/emailConfirm/${options.token}`;
  let mailOptions = {
    to: options.user.email,
    from: emails.dontReply,
    subject: 'Confirmation email',
    text: 'Please use the link to confirm your email.',
    html: '<p>Please use the link to confirm your email.</p>' +
          '<a href="' + link + '">Confirm Email</a>'
  };

  return sendEmail(mailOptions);
}

function forgotPassword(options) {
  let link = `${config.webUrl}/changePassword/${options.token}`;
  let mailOptions = {
    to: options.user.email,
    from: emails.dontReply,
    subject: 'Password recovery',
    text: 'Please use the link to reset your password.',
    html: '<p>Please use the link to reset your password.</p>' +
          '<a href="' + link + '">Password Recovery</a>'
  };

  return sendEmail(mailOptions);
}

module.exports = {
  transport: transport,
  emailUpdate: emailUpdate,
  emailConfirm: emailConfirm,
  forgotPassword: forgotPassword
};
