'use strict';

const cors = require('cors');
const router = require('express').Router();
const passport = require('passport');
const controllers = require('../controllers');

require('../middleware/passportConfig')(passport);

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
    passport.authenticate('facebook', { session: false, scope: 'email' })
  );

router.route('/authenticate/facebook/callback')
  // here should be a post from web application that will work only on the
  // same domains
  .get(
    passport.authenticate('facebook', function(req, res) {

      // let user = req.user;
      //
      // const token = jwt.sign(
      //   { userId: user.id },
      //   config.jwtKey,
      //   { expiresIn: config.tokenExpiration }
      // );
      // // this should be send to web application
      // res.status(200).json({
      //   token: token,
      //   user: user,
      //   socialLogin: true
      // });

      res.send(req.user? 200 : 401);
    })
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
