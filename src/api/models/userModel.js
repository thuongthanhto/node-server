const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trime: true,
    require: true
  },
  hash_password: {
    type: String,
    require: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  reset_password_token: {
    type: String
  },
  reset_password_expires: {
    type: Date
  }
});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.hash_password);
};

module.exports = mongoose.model('Users', UserSchema);
