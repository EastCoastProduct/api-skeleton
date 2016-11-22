'use strict';

const tests = require('tape');
const nock = require('nock');

const config = require('../../config');
const helpers = require('../../utils/test/helper');
const lang = require('../../config/language');

tests('POST /authenticate', authenticate => {

  authenticate.test('Failed', failed => {
    failed.test('Invalid parameters', test => {
      helpers.json('post', '/authenticate')
        .send({ invalidParam: 'wrong' })
        .end( (err, res) => {
          const debugInfoError = [
            { path: 'invalidParam', message: lang.errors.unrecognizedParameter },
            { path: 'email', message: lang.errors.required },
            { path: 'password', message: lang.errors.required }
          ];

          test.same({
            status: res.status,
            message: res.body.message,
            debugInfo: res.body.debugInfo
          }, {
            status: 400,
            message: lang.errors.parametersError,
            debugInfo: debugInfoError
          });
          test.end();
        });
    });

    failed.test('User does not exist', test => {
      helpers.json('post', '/authenticate')
        .send({
          email: 'not.user@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 404, message: lang.errors.notFound(lang.models.user) });
          test.end();
        });
    });

    failed.test('Wrong password', test => {
      helpers.json('post', '/authenticate')
        .send({
          email: 'user@mail.com',
          password: 'Wrong123'
        })
        .end( (err, res) => {
          test.same(
            { status: res.status, message: res.body.message },
            { status: 400, message: lang.errors.wrongPassword }
          );
          test.end();
        });
    });
  });

  authenticate.test('Success', success => {
    success.test('Successfull login with image', test => {
      helpers.json('post', '/authenticate')
        .send({
          email: 'stay.confirmed@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(res.status, 200);
          test.error(!res.body.token, 'No token');
          test.error(!res.body.user, 'No user');
          test.error(!res.body.user.image, 'No image for user');
          test.end();
        });
    });

  });

  authenticate.test('Success', success => {

    success.test('Successfull login regular user', test => {
      helpers.json('post', '/authenticate')
        .send({
          email: 'regular@mail.com',
          password: 'Password123'
        })
        .end( (err, res) => {
          test.same(res.status, 200);
          test.error(!res.body.token, 'No token');
          test.error(!res.body.user, 'No user');
          test.end();
        });
    });
  });
});

// **** social authentication ****

// facebok

// request user facebook information
tests('GET /authenticate/facebook', facebookRequest => {
  nock.cleanAll();

  nock('https://www.facebook.com')
  .get('/dialog/oauth')
  .query({
    'response_type': 'code',
    'redirect_uri': config.facebook.callbackURL,
    'scope': 'email',
    'client_id': config.facebook.clientID
  })
  .reply(302);

  facebookRequest.test('Facebook request', test => {
    helpers.json('get', '/authenticate/facebook')
      .end( (err, res) => {
        test.same(
          { status: res.status },
          { status: 302 }
        );
        test.end();
      });
  });

  nock.cleanAll();
});

/* TODO find a way to test facebook callback endpoint:
  Scenario 1: remove entire passport middleware and test controller only
  with mocked req.user object.
  Scenario 2: mock passport middleware methods that are invoked (both in app.js
  and routes folder) - mock passport.authenticate method so it calls
  socialUser - getOrCreateFacebookUser() service and serves the user in req.user
  to the controller

  Potential problem: callback from Facebook should be handled in web part of
  project forward the request onto API endpoint that can create cross origin
  problems. If that hapens current idea is for web server to handle facebook
  communication via its own endpoints and post facebook data on API
  endpoint for creating/finding user and generating token. Essentially meaning
  web will handle passport.js and API wil call
  socialUser - getOrCreateFacebookUser() service upon receiving facebook data
  from the web and then generating the token.
*/

// receive user facebook information
// tests('GET /authenticate/facebook/callback', success => {
//
//   success.test('Get token for already signed up facebook user', test => {
//     let mockPassportExistingUser = (req, res, next) => {
//       services.socialUser.getOrCreateFacebookUser('130331354110247', 'TestToken')
//       .then( (user) => {
//         req.user = user;
//         return next();
//       })
//       .catch(err => {
//         return next(err);
//       });
//     };
//
//
//     let passportStub = helpers.stubPassport(mockPassportExistingUser);
//
//     // var stub = sinon.stub(passport, 'authenticate').returns(function() {});
//     helpers.json('get', '/authenticate/facebook/callback?' +
//       'code=EAAW4apKbygABAHnVKMzYUjWdZC7loeiZApYMSTZCA1oYTjUwF3zvZA7aY5' +
//       'EDaGIYNj7VkjvNvz8Uj7FchYiP55pGInxEhHBjGEYKZBfRZCX1MgwlqTkKiGO9AjpN' +
//       'gCzc5uMHWLhPUF1hZAsBTJWUyrBFT7Yco1UVJXsoVRKmRdZAdgZDZD')
//     .end( (err, res) => {
//       test.same(res.body.socialLogin, true);
//       test.error(!res.body.token, 'No token');
//       test.error(!res.body.user, 'No user');
//       helpers.resetStub(passportStub);
//       test.end();
//     });
//   });
// });
