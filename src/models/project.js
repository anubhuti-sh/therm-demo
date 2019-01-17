const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProjectSchema = new Schema({
  uid: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: null,
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
  active: {
    type: Boolean,
    required: true,
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
  data: Object,
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
});

module.exports = mongoose.model('Project', ProjectSchema);
