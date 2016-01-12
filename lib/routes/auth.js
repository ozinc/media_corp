'use strict';

var router = require('express').Router();
var passport = require('passport');
var request = require('request');
var User = require('../../models/user');

// Oauth
var authorizationUrl = 'https://channel-www-staging.oz.com/oauth2/authorize?';
var tokenUrl = 'https://core-staging.oz.com/oauth2/token';
var clientId = 'MediaCorp2';
var clientSecret = 'some_password';
var responseType = 'code';
var redirectUri = 'https://media-corp.herokuapp.com/oauth-callback';

router.get('/', redirectIfLoggedIn, loginForm);
router.get('/login', redirectIfLoggedIn, loginForm);
router.get('/signup', signupForm);
router.get('/signout', signout);
router.get('/oauth-callback', getAccessToken, saveAccesToken);

router.post('/login', passport.authenticate('login', {
  successRedirect: '/users/me',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.post('/connect', getAuthorizationCode);

router.post('/signup', passport.authenticate('signup', {
  successRedirect: '/users/me',
  failureRedirect: '/signup',
  failureFlash: true
}));

function getAuthorizationCode(req, res) {
  res.redirect(authorizationUrl +
    'response_type=' + responseType + '&' +
    'client_id=' + clientId + '&' +
    'redirect_uri=' + redirectUri + '&' +
    'scope=subscriptions&state=testing');
}

function getAccessToken(req, res, next) {
  console.log('Authorization code: ', req.code);
  request({
    url: tokenUrl,
    form: {
      grant_type: 'authorization_code',
      code: req.query.code,
      client_id: clientId,
      client_secret: clientSecret
    },
    method: 'POST'
  }, function(error, response, body) {
    if (error) {
      res.status(500).send(error.message);
    } else {
      req.accesToken = JSON.parse(body).access_token;
      next();
    }
  });
}

function saveAccesToken(req, res) {
  User.findById(req.user.id, function(err, user) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      user.accesToken = req.accesToken;
      user.save(function(err) {
        if (err) {
          res.status(500).send(err.message);
        } else {
          console.log('acces Token:', req.accesToken);
          res.redirect('/channels');
        }
      });
    }
  });
}

function redirectIfLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/users/me');
  }
  next();
}

function loginForm(req, res) {
  res.render('login', {
    message: req.flash('message')
  });
}

function signupForm(req, res) {
  res.render('register', {
    message: req.flash('message')
  });
}

function signout(req, res) {
  req.logout();
  res.redirect('/login');
}


module.exports = router;
