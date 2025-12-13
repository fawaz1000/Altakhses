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
    maxlength: [200, 'وصف الخبرة يجب أن يكون أقل من 200 حرف']
  },
  image: {
    type: String,
    trim: true,
    default: null // يمكن أن يكون null إذا لم يتم رفع صورة
  },
  conditions: {
    type: String,
    trim: true,
    maxlength: [500, 'وصف الحالات يجب أن يكون أقل من 500 حرف']
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'سنوات الخبرة لا يمكن أن تكون سالبة'],
    max: [50, 'سنوات الخبرة لا يمكن أن تزيد عن 50 سنة']
  },
  qualifications: {
    type: String,
    trim: true,
    maxlength: [300, 'المؤهلات يجب أن تكون أقل من 300 حرف']
  },
  phoneNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'رقم الهاتف يجب أن يكون أقل من 20 رقم']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0 // لترتيب الأطباء داخل التخصص
  }
}, {
  timestamps: true
});

// إضافة index للبحث
doctorSchema.index({ name: 'text', conditions: 'text', qualifications: 'text' });
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ isActive: 1 });
doctorSchema.index({ specialty: 1, order: 1 }); // للترتيب حسب التخصص

// Populate التخصص عند الاستعلام - تحديث ليشمل image
doctorSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'specialty',
    select: 'name image icon slug description' // إضافة image للتأكد من جلبها
  });
  next();
});

// Method لتحويل البيانات للعرض العام
doctorSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    specialty: this.specialty,
    experience: this.experience,
    image: this.image,
    conditions: this.conditions,
    yearsOfExperience: this.yearsOfExperience,
    qualifications: this.qualifications,
    phoneNumber: this.phoneNumber,
    isActive: this.isActive,
    order: this.order,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method للحصول على الأطباء حسب التخصص مع الترتيب
doctorSchema.statics.findBySpecialty = function(specialtyId) {
  return this.find({ specialty: specialtyId, isActive: true })
    .populate('specialty', 'name image icon slug description')
    .sort({ order: 1, createdAt: -1 });
};

// Static method للبحث في الأطباء
doctorSchema.statics.searchDoctors = function(searchTerm) {
  return this.find({
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { experience: { $regex: searchTerm, $options: 'i' } },
      { conditions: { $regex: searchTerm, $options: 'i' } },
      { qualifications: { $regex: searchTerm, $options: 'i' } }
    ]
  }).populate('specialty', 'name image icon slug description')
    .sort({ order: 1, createdAt: -1 });
};

// Static method للحصول على عدد الأطباء لكل تخصص
doctorSchema.statics.getSpecialtyStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$specialty',
        doctorsCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'specialty'
      }
    },
    {
      $unwind: '$specialty'
    },
    {
      $project: {
        specialtyName: '$specialty.name',
        specialtyImage: '$specialty.image',
        specialtyIcon: '$specialty.icon',
        specialtySlug: '$specialty.slug',
        doctorsCount: 1
      }
    },
    {
      $sort: { doctorsCount: -1 }
    }
  ]);
};

module.exports = mongoose.model('Doctor', doctorSchema);