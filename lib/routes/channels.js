'use strict';

var router = require('express').Router();
var Channel = require('../../models/channel');
var Subscription = require('../../models/subscription');
var async = require('async');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

router.get('/', ensureLoggedIn, userChannels);
router.get('/json', jsonList);
router.get('/list', listAllChannels);
router.post('/', newChannel);
router.delete('/:id', removeChannel);

function userChannels(req, res) {
  var channelList = [];
  Channel.find(function(err, channels) {
    async.each(channels, function(channel, callback) {
      findSubscription(channel._id, req.user.id, function(subscription) {
        channelList.push({
          id: channel._id,
          name: channel.name,
          subscribed: subscription !== null
        });
        callback();
      });

    }, function(err) {
      if (err) {
        handleError(res, err.message);
      } else {
        res.render('channels', {
          channels: channelList
        });
      }
    });
  });
}

function listAllChannels(req, res) {
  var channelList = [];
  Channel.find(function(err, channels) {
    async.each(channels, function(channel, callback) {
      getAllChannelSubscriptions(channel._id, function(subscriptions) {
        channelList.push({
          id: channel._id,
          name: channel.name,
          subscriptions: subscriptions
        });
        callback();
      });

    }, function(err) {
      if (err) {
        handleError(res, err.message);
      } else {
        res.render('channel-list', {
          channels: channelList
        });
      }
    });
  });
}

function jsonList(req, res) {
  Channel.find(function(err, channels) {
    if (err) {
      handleError(res, err.message);
    } else {
      res.json(channels);
    }
  });
}

function newChannel(req, res) {
  Channel.create(req, res);
}

function removeChannel(req, res) {
  Channel.destroy(req, res);
}

function findSubscription(channelId, userId, callback) {
  Subscription.findOne({
      "channel._id": channelId,
      "user._id": userId
    })
    .then(function(subscription) {
      callback(subscription);
    });
}

function getAllChannelSubscriptions(channelId, callback) {
  Subscription.find({
      "channel._id": channelId,
    })
    .then(function(subscriptions) {
      callback(subscriptions);
    });
}

function handleError(res, message) {
  res.status(500).send(message);
}

module.exports = router;
