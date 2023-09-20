const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    minLength: 5,
    maxLength: 50,
    unique: true,
    required: true
  },
  password: {
    type: String,
    minLength: 5,
    maxLength: 1024,
    required: true
  },
  firstName: {
    type: String,
    minLength: 2,
    maxLength: 12,
    required: true
  },
  lastName: {
    type: String,
    minLength: 2,
    maxLength: 12,
    required: true
  },
  // 0 - male, 1 - female
  gender: {
    type: Number,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
    maxLength: 255
  },
  address: {
    type: String,
    minLength: 5,
    maxLength: 45,
  },
  about: {
    type: String,
    maxLength: 150
  },
  phone: {
    type: String,
    minLength: 9,
    maxLength: 10,
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      // _id: this._id,
      username: this.username,
      email: this.email,
      isAdmin: this.isAdmin
    },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
};

module.exports = mongoose.model('User', userSchema);