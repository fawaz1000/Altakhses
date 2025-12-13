// Back-end/models/Media.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type:        { type: String, enum: ['image', 'video'], required: true },
  url:         { type: String, required: true },        // مسار الرفع: "/uploads/media/filename.jpg"
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  category:    { type: String, default: 'general' },    // 'hero' أو 'general'
  approved:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Media', mediaSchema);
