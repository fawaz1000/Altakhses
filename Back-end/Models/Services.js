// Back-end/Models/Service.js - Updated to work with Categories
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الخدمة مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الخدمة يجب أن يكون أقل من 100 حرف']
  },
  description: {
    type: String,
    required: [true, 'وصف الخدمة مطلوب'],
    trim: true,
    maxlength: [1000, 'وصف الخدمة يجب أن يكون أقل من 1000 حرف']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'القسم مطلوب']
  },
  price: {
    type: Number,
    min: [0, 'السعر يجب أن يكون أكبر من أو يساوي صفر']
  },
  duration: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // للتوافق مع النظام القديم
  title: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// إنشاء title تلقائياً من name للتوافق مع النظام القديم
serviceSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.title) {
    this.title = this.name;
  }
  next();
});

// إضافة indexes للبحث السريع
serviceSchema.index({ name: 1 });
serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Service', serviceSchema);