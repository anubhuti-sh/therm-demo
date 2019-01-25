const { Schema } = require('mongoose');

const userObj = new Schema({
  uid: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
});

const geoJsonSchema = new Schema({
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
    },
  },
  type: {
    type: String,
    enum: ['Feature'],
  },
  properties: Object,
});

module.exports = {
  userObj,
  geoJsonSchema,
};
