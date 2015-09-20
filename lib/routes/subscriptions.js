'use strict';

var router = require('express').Router();
var Channel = require('../../models/channel');
var Subscription = require('../../models/subscription');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

router.post('/:id', ensureLoggedIn, findChannel, updateSubscriptions);
router.get('/', listSubscriptions);
router.get('/json', jsonList);
router.delete('/:id', deleteSubscription);

function findChannel(req, res, next) {
  Channel.findById(req.params.id, function(err, channel) {
    if (err) {
      handleError(res, err.message);
    } else {
      req.channel = channel;
      next();
    }
  });
}

function updateSubscriptions(req, res) {
  Subscription.findOne({
    'channel._id': req.channel._id,
    'user._id': req.user.id
  }, function(err, subscription) {
    if (err) {
      handleError(res, err.message);
    } else if (subscription === null) {
      Subscription.create(req, res);
    } else {
      Subscription.destroy(req, res);
    }
  });
}

function jsonList(req, res) {
  Subscription.find(function(err, subscriptions) {
    if (err) {
      handleError(res, err.message);
    } else {
      res.json(subscriptions);
    }
  });
}

function listSubscriptions(req, res) {
  Subscription.find(function(err, subscriptions) {
    if (err) {
      handleError(res, err.message);
    } else {
      res.render('subscriptions', {
        subscriptions: subscriptions
      });
    }
  });
}

function deleteSubscription(req, res) {
  Subscription.remove({
    _id: req.params.id
  }, function(err, result) {
    if (err) {
      handleError(res, err.message);
    } else {
      res.status(200).send('Subscription removed');
    }
  });
}

function handleError(res, message) {
  res.status(500).send(message);
}

module.exports = router;
