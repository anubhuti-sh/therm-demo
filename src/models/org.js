const mongoose = require('mongoose');

const { Schema } = mongoose;

const OrgSchema = new Schema({
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
});

module.exports = mongoose.model('Organization', OrgSchema);
