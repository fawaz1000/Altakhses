const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الفرع مطلوب'],
    trim: true,
    maxlength: [500, 'اسم الفرع لا يمكن أن يزيد عن 500 حرف']
  },
  url: {
    type: String,
    required: [true, 'رابط الموقع مطلوب'],
    trim: true,
    validate: {
      validator: function(v) {
        // التحقق من صحة الرابط
        return /^https?:\/\/.+/.test(v);
      },
      message: 'يجب أن يكون الرابط صحيحاً ويبدأ بـ http:// أو https://'
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

// إنشاء فهارس للبحث
branchSchema.index({ createdAt: -1 });

// تنظيف البيانات قبل الحفظ
branchSchema.pre('save', function(next) {
  try {
    if (this.name) this.name = this.name.trim();
    if (this.url) this.url = this.url.trim();
    next();
  } catch (error) {
    next(error);
  }
});

// Static method للحصول على جميع الفروع
branchSchema.statics.getAllBranches = function() {
  return this.find({}).sort({ createdAt: -1 });
};

// Instance method لتصدير البيانات
branchSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    url: this.url,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// التعامل مع أخطاء التكرار
branchSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('هذا الفرع موجود مسبقاً'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Branch', branchSchema);