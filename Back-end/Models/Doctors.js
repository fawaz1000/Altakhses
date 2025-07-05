// Back-end/Models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الطبيب مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الطبيب يجب أن يكون أقل من 100 حرف']
  },
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'تخصص الطبيب مطلوب']
  },
  experience: {
    type: String,
    trim: true,
    maxlength: [50, 'وصف الخبرة يجب أن يكون أقل من 50 حرف']
  },
  image: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(v);
      },
      message: 'رابط الصورة غير صحيح'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// إضافة index للبحث
doctorSchema.index({ name: 'text' });
doctorSchema.index({ specialty: 1 });

// Populate التخصص عند الاستعلام
doctorSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'specialty',
    select: 'name'
  });
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);