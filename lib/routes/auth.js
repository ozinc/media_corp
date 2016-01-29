'use strict';

var router = require('express').Router();
var passport = require('passport');
var request = require('request');
var User = require('../../models/user');

router.get('/', redirectIfLoggedIn, loginForm);
router.get('/login', redirectIfLoggedIn, loginForm);
router.get('/signup', signupForm);
router.get('/signout', signout);

router.post('/login', passport.authenticate('login', {
  successRedirect: '/users/me',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.post('/signup', passport.authenticate('signup', {
  successRedirect: '/users/me',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.post('/connect', connect);

router.post('/callback', saveAccesToken, createSubscriptions);

function connect (req, res, next) {
  request({
    url: process.env.OZ_CORE + '/invitations/connect',
    headers: {
      'x-application-secret': process.env.APPLICATION_SECRET,
      'x-application-token': process.env.APPLICATION_ID
    },
    form: {
      userId: req.user.ozId,
      callback: process.env.CALLBACK
    },
    method: 'POST'
  }, function(error, response, body) {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.redirect('/users/me');
    }
  });
}

function saveAccesToken(req, res, next) {
  User.findOne({
    'ozId': req.body.invitation.userId,
  }, function(err, user) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      console.log('Payload', req.body);
      user.accessToken = req.body.accessToken;
      user.save(function(err) {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.redirect('/channels');
          next();
        }
      });
    }
  });
}

function createSubscriptions(req, res, next) {
  request({
    url: process.env.OZ_CORE + '/subscriptions',
    headers: {
      'Authorization': 'Bearer ' + req.body.accessToken
    },
    form: {
      channelId: "71e448a6-34df-41c9-bcc4-7df545c926e0",
      billingProvider: 'external',
      userId: req.body.invitation.userId
    },
    method: 'POST'
  }, function(error, response, body) {
    if (error) {
      console.log(error);
    } else {
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
