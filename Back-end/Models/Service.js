// Back-end/Models/Service.js - مُصحح ومُحسن
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
    default: null // السماح بخدمات بدون قسم محدد
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

// إنشاء slug تلقائياً وتعيين title
serviceSchema.pre('save', function(next) {
  try {
    if (this.isModified('name') || this.isNew) {
      // تنظيف الاسم
      const cleanName = this.name.trim();
      
      // تعيين title إذا لم يكن موجود
      if (!this.title || this.title.trim() === '') {
        this.title = cleanName;
      }
      
      // إنشاء slug من الاسم
      if (!this.slug) {
        this.slug = cleanName
          .replace(/\s+/g, '-')
          .replace(/[^\w\-\u0600-\u06FF]+/g, '')
          .toLowerCase();
        
        // التأكد من أن الـ slug ليس فارغ
        if (!this.slug || this.slug === '') {
          this.slug = `service-${Date.now()}`;
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// middleware للتحقق من عدم وجود slug مكرر
serviceSchema.pre('save', async function(next) {
  try {
    if (this.isModified('slug') || this.isNew) {
      const existingService = await this.constructor.findOne({
        slug: this.slug,
        _id: { $ne: this._id }
      });
      
      if (existingService) {
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
serviceSchema.pre('save', function(next) {
  try {
    // تنظيف المسافات الزائدة
    if (this.name) this.name = this.name.trim();
    if (this.title) this.title = this.title.trim();
    if (this.description) this.description = this.description.trim();
    if (this.duration) this.duration = this.duration.trim();
    if (this.requirements) this.requirements = this.requirements.trim();
    
    // تنظيف features array
    if (this.features && Array.isArray(this.features)) {
      this.features = this.features
        .map(feature => feature?.trim())
        .filter(feature => feature && feature.length > 0);
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
serviceSchema.index({ order: 1 });

// index مركب للبحث
serviceSchema.index({ 
  name: 'text', 
  title: 'text', 
  description: 'text' 
});

// Virtual للحصول على معلومات القسم
serviceSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

// Static methods
serviceSchema.statics.findByCategory = function(categoryId) {
  return this.find({ categoryId, isActive: true })
    .populate('categoryId')
    .sort({ order: 1, createdAt: -1 });
};

serviceSchema.statics.findActiveServices = function() {
  return this.find({ isActive: true })
    .populate('categoryId')
    .sort({ order: 1, createdAt: -1 });
};

serviceSchema.statics.searchServices = function(searchTerm) {
  return this.find({
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  }).populate('categoryId').sort({ order: 1, createdAt: -1 });
};

serviceSchema.statics.getServicesWithStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$categoryId',
        categoryName: { $first: '$category.name' },
        categoryIcon: { $first: '$category.icon' },
        servicesCount: { $sum: 1 },
        services: { $push: '$$ROOT' }
      }
    },
    { $sort: { servicesCount: -1, categoryName: 1 } }
  ]);
};

// Instance methods
serviceSchema.methods.updateOrder = function(newOrder) {
  this.order = newOrder;
  return this.save();
};

serviceSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

serviceSchema.methods.addFeature = function(feature) {
  if (!this.features) {
    this.features = [];
  }
  if (!this.features.includes(feature.trim())) {
    this.features.push(feature.trim());
  }
  return this.save();
};

serviceSchema.methods.removeFeature = function(feature) {
  if (this.features && Array.isArray(this.features)) {
    this.features = this.features.filter(f => f !== feature);
  }
  return this.save();
};

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
    slug: this.slug,
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
    // يمكن إضافة تنظيف إضافي هنا (مثل حذف التقييمات أو التعليقات المرتبطة)
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

// التعامل مع أخطاء التكرار
serviceSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    const message = field === 'name' ? 'اسم الخدمة موجود مسبقاً' : 
                   field === 'slug' ? 'رابط الخدمة موجود مسبقاً' : 
                   'هذه البيانات موجودة مسبقاً';
    next(new Error(message));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Service', serviceSchema);