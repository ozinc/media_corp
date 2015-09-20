var mongoose = require('mongoose');
var User = require('./user');
var Channel = require('./channel');
var _ = require('lodash');

var SubscriptionSchema = new mongoose.Schema({
  userId: String,
  email: String,
  channelName: String,
  channelId: String,
  channel: [Channel.ChannelSchema],
  user: [User.UserSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function destroy(req, res) {
  this.remove({
    "channel._id": req.channel._id,
    "user._id": req.user.id
  }, function(err, result) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.redirect('/channels');
    }
  });
}

function create(req, res) {
  var subscription = new this();
  subscription.channel = req.channel;
  subscription.user = req.user;

  subscription.save(function(err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.redirect('/channels');
    }
  });
}

module.exports = mongoose.model('Subscription', SubscriptionSchema);
module.exports.destroy = destroy;
module.exports.create = create;
