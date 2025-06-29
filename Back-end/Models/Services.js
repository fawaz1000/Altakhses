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
    default: null // السماح بخدمات بدون قسم مؤقتاً
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
  },
  // حقول إضافية للخدمة
  features: [{
    type: String,
    trim: true
  }],
  requirements: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
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
  if (this.isModified('name') && !this.title) {
    this.title = this.name;
  }
  if (this.isModified('title') && !this.name) {
    this.name = this.title;
  }
  next();
});

// إضافة indexes للبحث السريع
serviceSchema.index({ name: 1 });
serviceSchema.index({ title: 1 });
serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ order: 1 });

// Virtual للحصول على اسم القسم
serviceSchema.virtual('categoryName', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

// Static method للبحث بالاسم
serviceSchema.statics.findByName = function(name) {
  return this.find({
    $or: [
      { name: new RegExp(name, 'i') },
      { title: new RegExp(name, 'i') }
    ],
    isActive: true
  });
};

// Static method للحصول على الخدمات النشطة
serviceSchema.statics.getActiveServices = function() {
  return this.find({ isActive: true })
    .populate('categoryId', 'name title icon slug')
    .sort({ order: 1, createdAt: -1 });
};

// Static method للحصول على خدمات قسم معين
serviceSchema.statics.getServicesByCategory = function(categoryId) {
  return this.find({ 
    categoryId: categoryId,
    isActive: true 
  })
  .populate('categoryId', 'name title description icon slug')
  .sort({ order: 1, createdAt: -1 });
};

// Instance method للتحديث
serviceSchema.methods.updateOrder = function(newOrder) {
  this.order = newOrder;
  return this.save();
};

// Instance method لتصدير البيانات
serviceSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    title: this.title,
    description: this.description,
    categoryId: this.categoryId,
    price: this.price,
    duration: this.duration,
    features: this.features,
    requirements: this.requirements,
    isActive: this.isActive,
    order: this.order,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// middleware للتنظيف قبل الحذف
serviceSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    console.log(`Cleaning up data for service: ${this.name}`);
    // يمكن إضافة تنظيف إضافي هنا
    next();
  } catch (error) {
    console.error('Error in service pre-delete middleware:', error);
    next(error);
  }
});

// middleware بعد الحذف
serviceSchema.post('deleteOne', { document: true, query: false }, function(doc) {
  console.log(`Service deleted: ${doc.name} (${doc._id})`);
});

module.exports = mongoose.model('Service', serviceSchema);