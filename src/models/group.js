const mongoose = require('mongoose');

const { Schema } = mongoose;

const GroupSchema = new Schema({
  uid: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  owner: {
    uid: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
  },
  readUser: [{
    uid: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
  }],
  writeUser: [{
    uid: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
  }],
});

module.exports = mongoose.model('Group', GroupSchema);
