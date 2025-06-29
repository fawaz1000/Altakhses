// Back-end/Models/Service.js - Updated with Categories support
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الخدمة مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الخدمة يجب أن يكون أقل من 100 حرف']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'عنوان الخدمة يجب أن يكون أقل من 100 حرف']
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
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// إنشاء title تلقائياً من name للتوافق مع النظام القديم
serviceSchema.pre('save', function(next) {
  try {
    if (this.isModified('name') || this.isNew) {
      if (!this.title || this.title.trim() === '') {
        this.title = this.name;
      }
      
      // إنشاء slug
      if (!this.slug) {
        this.slug = this.name
          .replace(/\s+/g, '-')
          .replace(/[^\w\-\u0600-\u06FF]+/g, '')
          .toLowerCase();
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// إضافة indexes للبحث السريع
serviceSchema.index({ name: 1 });
serviceSchema.index({ title: 1 });
serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ slug: 1 });

// Virtual للحصول على معلومات القسم
serviceSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

// Static methods
serviceSchema.statics.findByCategory = function(categoryId) {
  return this.find({ categoryId, isActive: true }).populate('categoryId');
};

serviceSchema.statics.findActiveServices = function() {
  return this.find({ isActive: true }).populate('categoryId').sort({ createdAt: -1 });
};

// Instance methods
serviceSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    title: this.title,
    description: this.description,
    categoryId: this.categoryId,
    price: this.price,
    duration: this.duration,
    slug: this.slug,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Service', serviceSchema);