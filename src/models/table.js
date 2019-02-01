const mongoose = require('mongoose');

const { Schema } = mongoose;
const { polygonSchema, rawImage } = require('./mixins');

const tableSchema = new Schema({
  uid: { type: String, required: true },
  polygon: polygonSchema,
  classId: { type: Number, required: true },
  className: { type: String, required: true },
  rawImages: [rawImage],
  temperature_difference: Number,
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  numModulesHorizontal: Number,
  numModulesVertical: Number,
}, { timestamps: true });


tableSchema.pre('find', function (next) {
  this.populate({
    path: 'project',
  });
  next();
});

tableSchema.pre('findOne', function (next) {
  this.populate({
    path: 'project',
  });
  next();
});

module.exports = mongoose.model('Table', tableSchema);
