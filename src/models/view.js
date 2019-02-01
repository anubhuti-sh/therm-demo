const mongoose = require('mongoose');
const { userObj, geoJsonSchema } = require('./mixins');

const { Schema } = mongoose;

const ViewSchema = new Schema({
  uid: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project',
  }],
  owner: userObj,
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  important: {
    type: Boolean,
    required: true,
  },
  temperature: {
    min: Number,
    max: Number,
  },
  fromProject: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  polygon: geoJsonSchema,
  tableNames: [String],
  metric: {
    type: Object,
  },
  issueType: [String],
});

ViewSchema.pre('find', function (next) {
  this.populate({
    path: 'projects organization',
  });
  next();
});

ViewSchema.pre('findOne', function (next) {
  this.populate({
    path: 'projects organization',
  });
  next();
});

module.exports = mongoose.model('View', ViewSchema);
