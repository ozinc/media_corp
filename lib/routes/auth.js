'use strict';

var router = require('express').Router();
var passport = require('passport');
var request = require('request');
var User = require('../../models/user');

// Oauth
var authorizationUrl = 'http://coop.apps.knpuniversity.com/authorize?';
var tokenUrl = 'http://coop.apps.knpuniversity.com/token?';
var clientId = 'Media Corp';
var clientSecret = 'ab0cb016102c6ccdab7c259cf31ce1cf';
var responseType = 'code';
var redirectUri = 'http://media-corp.herokuapp.com/oauth-callback';
var scope = 'barn-unlock';

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
    'redirect_uri=' + redirectUri + '&' +
    'scope=' + scope + '&' +
    'client_id=' + clientId);
}

function getAccessToken(req, res, next) {
  request({
    url: tokenUrl,
    form: {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: req.query.code
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
          console.log('Acces Token:', req.accesToken);
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
