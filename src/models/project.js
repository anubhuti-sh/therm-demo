/* eslint-disable func-names */
const mongoose = require('mongoose');
const { userObj } = require('./mixins');

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
    type: userObj,
  },
  active: {
    type: Boolean,
    required: true,
  },
  readUser: [{
    type: userObj,
  }],
  writeUser: [{
    type: userObj,
  }],
  data: Object,
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
});

ProjectSchema.pre('find', function (next) {
  this.populate({
    path: 'group',
  });
  next();
});

ProjectSchema.pre('findOne', function (next) {
  this.populate({
    path: 'group',
  });
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
