// Back-end/models/Category.js - Updated with image field instead of icon
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم القسم مطلوب'],
    unique: true,
    trim: true,
    minlength: [2, 'اسم القسم يجب أن يكون أكثر من حرفين'],
    maxlength: [100, 'اسم القسم لا يمكن أن يزيد عن 100 حرف']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'عنوان القسم لا يمكن أن يزيد عن 100 حرف']
  },
  description: {
    type: String,
    required: [true, 'وصف القسم مطلوب'],
    trim: true,
    minlength: [10, 'وصف القسم يجب أن يكون أكثر من 10 أحرف'],
    maxlength: [500, 'وصف القسم لا يمكن أن يزيد عن 500 حرف']
  },
  image: {
    type: String,
    default: null, // مسار الصورة: "/uploads/categories/filename.jpg"
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
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
      // إزالة الحقول الحساسة من الاستجابة
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// إنشاء فهارس لتحسين الأداء
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ order: 1 });
CategorySchema.index({ createdAt: -1 });

// Virtual للحصول على عدد الخدمات المرتبطة
CategorySchema.virtual('servicesCount', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'categoryId',
  count: true
});

// إنشاء slug تلقائياً وتعيين title
CategorySchema.pre('save', function(next) {
  try {
    if (this.isModified('name') || this.isNew) {
      // تنظيف الاسم
      const cleanName = this.name.trim();
      
      // إنشاء slug من الاسم
      this.slug = cleanName
        .replace(/\s+/g, '-') // استبدال المسافات بشرطات
        .replace(/[^\w\-\u0600-\u06FF]+/g, '') // إزالة الرموز غير المرغوبة (السماح بالعربية)
        .toLowerCase();
      
      // تعيين title إذا لم يكن موجود
      if (!this.title || this.title.trim() === '') {
        this.title = cleanName;
      }
      
      // التأكد من أن الـ slug فريد
      if (!this.slug || this.slug === '') {
        this.slug = `category-${Date.now()}`;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// middleware للتحقق من عدم وجود slug مكرر
CategorySchema.pre('save', async function(next) {
  try {
    if (this.isModified('slug') || this.isNew) {
      const existingCategory = await this.constructor.findOne({
        slug: this.slug,
        _id: { $ne: this._id }
      });
      
      if (existingCategory) {
        // إنشاء slug فريد
        const timestamp = Date.now();
        this.slug = `${this.slug}-${timestamp}`;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// middleware لتنظيف البيانات قبل الحفظ
CategorySchema.pre('save', function(next) {
  try {
    // تنظيف المسافات الزائدة
    if (this.name) this.name = this.name.trim();
    if (this.title) this.title = this.title.trim();
    if (this.description) this.description = this.description.trim();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method للبحث بالاسم أو العنوان
CategorySchema.statics.findByNameOrTitle = function(searchTerm) {
  return this.find({
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { title: new RegExp(searchTerm, 'i') }
    ],
    isActive: true
  });
};

// Static method للحصول على الأقسام النشطة مع ترتيب
CategorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .populate('servicesCount');
};

// Instance method للتحقق من إمكانية الحذف
CategorySchema.methods.canBeDeleted = async function() {
  try {
    // التحقق من وجود خدمات مرتبطة
    const Service = mongoose.model('Service');
    const servicesCount = await Service.countDocuments({ categoryId: this._id });
    
    return {
      canDelete: true, // يمكن الحذف حتى لو كانت هناك خدمات (سيتم حذفها أيضاً)
      servicesCount,
      warning: servicesCount > 0 ? `سيتم حذف ${servicesCount} خدمة مرتبطة بهذا القسم` : null
    };
  } catch (error) {
    return {
      canDelete: true,
      servicesCount: 0,
      warning: null
    };
  }
};

// Instance method لتحديث ترتيب القسم
CategorySchema.methods.updateOrder = function(newOrder) {
  this.order = newOrder;
  return this.save();
};

// middleware قبل الحذف لتنظيف البيانات المرتبطة
CategorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    console.log(`Cleaning up data for category: ${this.name}`);
    
    // حذف الخدمات المرتبطة
    try {
      const Service = mongoose.model('Service');
      const result = await Service.deleteMany({ categoryId: this._id });
      console.log(`Deleted ${result.deletedCount} services for category ${this._id}`);
    } catch (error) {
      console.log('No Service model found or error deleting services:', error.message);
    }
    
    // حذف صورة القسم إذا كانت موجودة
    if (this.image) {
      const fs = require('fs').promises;
      const path = require('path');
      const imagePath = path.join(__dirname, '..', this.image);
      
      try {
        await fs.unlink(imagePath);
        console.log(`Deleted category image: ${this.image}`);
      } catch (error) {
        console.log('Error deleting category image:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-delete middleware:', error);
    next(error);
  }
});

// middleware بعد الحذف للتنظيف الإضافي
CategorySchema.post('deleteOne', { document: true, query: false }, function(doc) {
  console.log(`Category deleted: ${doc.name} (${doc._id})`);
});

// التعامل مع أخطاء التكرار
CategorySchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const message = field === 'name' ? 'اسم القسم موجود مسبقاً' : 
                   field === 'slug' ? 'رابط القسم موجود مسبقاً' : 
                   'هذه البيانات موجودة مسبقاً';
    next(new Error(message));
  } else {
    next(error);
  }
});

// إضافة method لتصدير البيانات
CategorySchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    title: this.title,
    description: this.description,
    image: this.image,
    slug: this.slug,
    isActive: this.isActive,
    order: this.order,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Category', CategorySchema);