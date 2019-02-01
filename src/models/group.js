/* eslint-disable func-names */
const mongoose = require('mongoose');
const { userObj } = require('./mixins');

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
    type: userObj,
  },
  readUser: [{
    type: userObj,
  }],
  writeUser: [{
    type: userObj,
  }],
});

GroupSchema.pre('find', function (next) {
  this.populate({
    path: 'organization',
  });
  next();
});

GroupSchema.pre('findOne', function (next) {
  this.populate({
    path: 'organization',
  });
  next();
});

module.exports = mongoose.model('Group', GroupSchema);
