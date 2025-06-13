// Back-end/models/Report.js
const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  label:  { type: String, required: true },
  count:  { type: Number, required: true },
  suffix: { type: String, default: '' }
});

const reportSchema = new mongoose.Schema({
  year:    { type: Number, required: true, unique: true },
  metrics: [metricSchema]
});

module.exports = mongoose.model('Report', reportSchema);
