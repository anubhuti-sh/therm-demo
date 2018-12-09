const mongoose = require('mongoose');

const { Schema } = mongoose;

const SegmentSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['Point', 'LineString', 'Polygon'],
    default: 'Polygon',
  },
  coordinates: {
    type: [[[Number]]],
    required: true,
  },
});

const AreaSchema = new Schema({
  name: {
    type: String,
  },
  uid: {
    type: String,
  },
  geometry: SegmentSchema,
});

module.exports = mongoose.model('Area', AreaSchema);
