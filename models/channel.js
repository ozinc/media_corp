var mongoose = require('mongoose');

var ChannelSchema = new mongoose.Schema({
  name: String,
  ozId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  connected: {type: Boolean, default: false}
});

function create(req, res) {
  var channel = new this();
  channel.name = req.body.name;

  channel.save(function(err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json({
        message: 'New channel added',
        data: channel
      });
    }
  });
}

function destroy(req, res) {
  this.remove({
    _id: req.params.id
  }, function(err, results) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send('Channel removed');
    }
  });
}

module.exports = mongoose.model('Channel', ChannelSchema);
module.exports.ChannelSchema = ChannelSchema;
module.exports.create = create;
module.exports.destroy = destroy;
