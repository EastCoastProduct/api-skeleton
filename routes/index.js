'use strict';

const cors = require('cors');
const controllers = require('../controllers');
const router = require('express').Router();

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

module.exports = router;
