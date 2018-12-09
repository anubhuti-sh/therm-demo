const mongoose = require('mongoose');

const { Schema } = mongoose;

const SegmentSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['Point', 'LineString', 'Polygon'],
    default: 'Polygon',
  },
  coordinates: [
    [
      { type: [Number] },
    ],
  ],
});

module.exports = mongoose.model('Segment', SegmentSchema);
