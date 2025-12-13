// Back-end/Models/Partner.js - مُصحح ومبسط
const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الشريك مطلوب'],
    trim: true
  },
  enName: {
    type: String,
    trim: true,
    default: ''
  },
  logo: {
    type: String,
    required: [true, 'الشعار مطلوب']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // سيضيف createdAt و updatedAt تلقائياً
});

// إنشاء فهارس
partnerSchema.index({ isActive: 1 });
partnerSchema.index({ order: 1 });
partnerSchema.index({ createdAt: -1 });

// تنظيف البيانات قبل الحفظ
partnerSchema.pre('save', function(next) {
  try {
    if (this.name) this.name = this.name.trim();
    if (this.enName) this.enName = this.enName.trim();
    next();
  } catch (error) {
    next(error);
  }
});

// middleware قبل الحذف لتنظيف الشعار من Cloudinary
partnerSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    if (this.logo) {
      try {
        const { deleteFromCloudinary } = require('../config/cloudinary');
        await deleteFromCloudinary(this.logo);
        console.log(`Deleted partner logo: ${this.logo}`);
      } catch (error) {
        console.log('Error deleting partner logo:', error.message);
      }
    }
    next();
  } catch (error) {
    console.error('Error in partner pre-delete middleware:', error);
    next(error);
  }
});

module.exports = mongoose.model('Partner', partnerSchema);