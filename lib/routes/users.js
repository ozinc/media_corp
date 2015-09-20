'use strict';

var router = require('express').Router();
var request = require('request');
var User = require('../../models/user');
var Subscription = require('../../models/subscription');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

router.get('/me', ensureLoggedIn, homePage);
router.get('/:id', findUser, homePage);
router.get('/list/json', jsonList);
router.get('/:id/example-request', getAccesToken, exampleApiRequest);

router.delete('/:id', removeUser);

function jsonList(req, res) {
  User.find(function(err, users) {
    if (err) {
      handleError(res, err.message);
    } else {
      res.json(users);
    }
  });
}

function findUser(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      handleError(res, err.message);
    } else {
      req.user = user;
      next();
    }
  });
}

function removeUser(req, res) {
  User.destroy(req, res);
}

function homePage(req, res) {
  Subscription.find({
    'user._id': req.user.id
  }, function(err, subscriptions) {
    if (err) {
      handleError(res, err.message);
    } else {
      res.render('user', {
        user: req.user,
        subscriptions: subscriptions
      });
    }
  });
}

function getAccesToken(req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
      handleError(res, err.message);
    } else if (user.accesToken === null) {
      res.send('No acces token found');
    } else {
      req.accesToken = user.accesToken;
      next();
    }
  });
}

function exampleApiRequest(req, res) {
  request({
    url: 'http://coop.apps.knpuniversity.com/api/110/barn-unlock',
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + req.accesToken,
    }
  }, function(error, response, body) {
    if (error) {
      handleError(res, error.message);
    } else {
      res.send(body);
    }
  });
}

function handleError(res, message) {
  res.status(500).send(message);
}

module.exports = router;
