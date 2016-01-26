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
router.get('/oauth-callback', saveAccesToken);

router.post('/login', passport.authenticate('login', {
  successRedirect: '/users/me',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.post('/connect', connect);

router.post('/signup', passport.authenticate('signup', {
  successRedirect: '/users/me',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.post('/callback', saveAccesToken, createSubscriptions);

function createSubscriptions(req, res, next) {
  var username = process.env.USERNAME;
  var password = process.env.PASSWORD;
  var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
  var payload = {
  	included: [{
  		type: 'video_channels',
  		'attributes': {
  			code: 'Krakkar'
  		}
  	}, {
  		type: 'video_channels',
  		attributes: {
  			code: 'Stod2'
  		}
  	}],
  	data: {
  		type: 'video_fulfilment_requests',
  		attributes: {
  			request_type: 'open',
  			distribution_provider_customer_id: req.body.userId,
  			fulfilment_request_id: '4C77E73C-6603-49D4-9732-572947B84E56',
  			access_token: req.body.accessToken,
  			callback_url: ''
  		}
  	}
  };

  request({
    url: process.env.SYNC_URL,
    headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
    },
    method: 'POST',
    json: true,
    body: payload
  }, function(error, response, body) {
    res.redirect('/channels');
  });
}

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
      console.log('Halló', response);
      req.accessToken = req.body.accessToken;
      next();
    }
  });
}

function saveAccesToken(req, res, next) {
  User.findOne({
    'ozId': req.body.userId,
  }, function(err, user) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      user.accessToken = req.body.accessToken;
      user.save(function(err) {
        if (err) {
          res.status(500).send(err.message);
        } else {
          next();
        }
      });
    }
  });

  console.log('access token', req.body.accessToken);
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
