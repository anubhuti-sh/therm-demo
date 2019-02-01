const mongoose = require('mongoose');

const { Schema } = mongoose;

require('mongoose-type-url');

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
}, { _id: false });

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
}, { _id: false });

const pointSchema = new Schema({
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  type: {
    type: String,
    enum: ['Feature'],
  },
  properties: Object,
}, { _id: false });

const polygonSchema = new Schema({
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
}, { _id: false });

const lineSchema = new Schema({
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true,
    },
    coordinates: {
      type: [[Number]],
      required: true,
    },
  },
  type: {
    type: String,
    enum: ['Feature'],
  },
  properties: Object,
}, { _id: false });

const rawImage = new Schema({
  location: [Number],
  src: [mongoose.SchemaTypes.Url],
}, { _id: false });

module.exports = {
  userObj,
  geoJsonSchema,
  pointSchema,
  polygonSchema,
  lineSchema,
  rawImage,
};
