'use strict';

const cors = require('cors');
const router = require('express').Router();
const controllers = require('../controllers');

module.exports = function(passport) {
  // Allow the api to accept request from web app
  router.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS'
  }));

  // enable cors preflight for all endpoints
  router.options('*', cors());

  // User authentication
  router.route('/authenticate')
  .post(
    controllers.authentication.validate.authenticate,
    controllers.authentication.authenticate
  );

  // User authentication facebook
  router.route('/authenticate/facebook')
  .get(
    passport.authenticate('facebook', { session: false, scope: ['email'] })
  );

  router.route('/authenticate/facebook/callback')
  .get(
    passport.authenticate('facebook', { session: false }),
    controllers.authentication.authenticateSocial
  );

  /*
  - User CRUD /users

  - Change/Reset Password
    /changePassword
    /resetPassword

  - Change Email
    /changeEmail
    /changeEmail/:token

  - User Confirmation
    /emailConfirm
    /resendConfirmation
  */
  require('./users')(router);

  /*
  Super admin routes

    - Authentication
      /superAdmin/authenticate
  */
  require('./superAdmin')(router);

  return router;
};
