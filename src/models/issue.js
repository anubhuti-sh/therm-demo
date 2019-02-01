const mongoose = require('mongoose');

const { Schema } = mongoose;
const { polygonSchema, rawImage } = require('./mixins');

const issueSchema = new Schema({
  uid: { type: String, required: true },
  polygon: polygonSchema,
  classId: { type: Number, required: true },
  className: { type: String, required: true },
  rawImages: [rawImage],
  temperatureDifference: Number,
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  table: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  location: [Number],
}, { timestamps: true });


issueSchema.pre('find', function (next) {
  this.populate({
    path: 'project table',
  });
  next();
});

issueSchema.pre('findOne', function (next) {
  this.populate({
    path: 'project table',
  });
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
