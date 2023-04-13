const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: { type: String, unique: true, require: true },
  password: { type: String, require: true },
  isActivate: { type: Boolean, default: false },
  activationLink: { type: String },
});

module.exports = model("User", userSchema);
