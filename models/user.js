var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  ozId: String,
  role: {
    type: String,
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  accesToken: { type: String, default: null }
});

function destroy(req, res) {
  this.remove({
    _id: req.params.id
  }, function(err, results) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send('User removed');
    }
  });
}

function create(req, done) {
  var newUser = new this();

  // set the user's local credentials
  newUser.email = req.email;
  newUser.password = createHash(req.password);

  if (req.body.admin) {
    newUser.role = 'admin';
  }

  newUser.save(function(err) {
    if (err) {
      console.log('Error in Saving user: ' + err);
      throw err;
    }
    console.log('User Registration succesful');
    return done(null, newUser);
  });
}

// Generates hash using bCrypt
var createHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

module.exports = mongoose.model('User', UserSchema);
module.exports.UserSchema = UserSchema;
module.exports.destroy = destroy;
module.exports.create = create;
