const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  uid: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    default: null,
  },
  organization: {
    type: String,
    default: null,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
  isManager: {
    type: Boolean,
    default: true,
  },
  lastUpdateAt: { type: Date, default: Date.now },
});

UserSchema.post('save', function () {
  const data = this;
  data.lastUpdateAt = new Date();
});

module.exports = mongoose.model('User', UserSchema);
