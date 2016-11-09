'use strict';

const nodemailer = require('nodemailer');
const config = require('../config');
var transport = nodemailer.createTransport(config.mailOptions);

var emails = {
  dontReply: 'ECP Boilerplate <dont.reply@eastcoastproduct.com>'
};

const sendEmail = options => transport.sendMail(options);

function emailUpdate(options) {
  let link = `${config.webUrl}/emailConfirm/${options.token}`;
  let mailOptions = {
    to: options.user.email,
    from: emails.dontReply,
    subject: 'Change email',
    text: 'Please use the link to change your email.',
    html: `
      <p>Please use the link to change your email.</p>
      <a href='${link}'>Change Email</a>`
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
    html: `
      <p>Please use the link to confirm your email.</p>
      <a href='${link}'>Confirm Email</a>`
  };

  return sendEmail(mailOptions);
}

function forgotPassword(options) {
  let link = `${config.webUrl}/recoverPassword/${options.token}`;
  let mailOptions = {
    to: options.user.email,
    from: emails.dontReply,
    subject: 'Password recovery',
    text: 'Please use the link to reset your password.',
    html: `
      <p>Please use the link to reset your password.</p>
      <a href='${link}'>Password Recovery</a>`
  };

  return sendEmail(mailOptions);
}

function superAdminCreatedUser(options) {
  // TODO change link to map proper URL on frontend
  let link = `${config.webUrl}/recoverPassword/${options.token}`;
  let mailOptions = {
    to: options.user.email,
    from: emails.dontReply,
    subject: 'Account activation',
    text: `
      Your account has been created. Please use the link below to set
      your password.`,
    html: `
      <p>
        Your account has been created. Please use the link below to set
        your password.
      </p>
      <a href='${link}'>Account activation</a>`
  };

  return sendEmail(mailOptions);
}

function superAdminChangedUserEmail(options) {
  let mailOptions = {
    to: options.user.email,
    from: emails.dontReply,
    subject: 'Account email changed',
    text: `
      Your account email has been changed.`,
    html: `
      <p>Your account email has been changed.</p>
    `
  };

  return sendEmail(mailOptions);
}

module.exports = {
  transport: transport,
  emailUpdate: emailUpdate,
  emailConfirm: emailConfirm,
  forgotPassword: forgotPassword,
  superAdminCreatedUser: superAdminCreatedUser,
  superAdminChangedUserEmail: superAdminChangedUserEmail
};
