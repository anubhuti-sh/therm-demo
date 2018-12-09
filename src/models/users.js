const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  lastUpdateAt: { type: Date, default: Date.now },
});

UserSchema.post('save', function () {
  const data = this;
  data.lastUpdateAt = new Date();
});

module.exports = mongoose.model('User', UserSchema);
