const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    default: "farmer"
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  verificationCode: String,

  resetPasswordCode: String
});

module.exports = mongoose.model("User", userSchema);