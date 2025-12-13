// Back-end/routes/doctors.js - محدث مع Cloudinary
const express = require('express');
const router = express.Router();
const Doctor = require('../Models/Doctors');
const Category = require('../Models/Category');
const authenticateToken = require('../Middleware/authMiddleware');

// 🆕 استيراد Cloudinary بدلاً من multer العادي
const { uploadDoctor, deleteFromCloudinary } = require('../config/cloudinary');

// إضافة middleware لتحقق من صلاحيات الأدمن
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'غير مسموح - تحتاج صلاحيات المدير'
    });
  }
};

// إضافة middleware للـ CORS والـ logging
router.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://localhost:5050'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// معالجة طلبات OPTIONS
router.options('*', (req, res) => {
  res.status(200).end();
});

// جلب جميع الأطباء (عام - للموقع الرئيسي)
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching all doctors...');
    
    const doctors = await Doctor.find({ isActive: true })
      .populate('specialty', 'name image icon slug description')
      .sort({ order: 1, createdAt: -1 });
    
    console.log(`✅ Found ${doctors.length} active doctors`);
    
    if (doctors.length > 0 && doctors[0].specialty) {
      console.log('Sample specialty data:', {
        name: doctors[0].specialty.name,
        image: doctors[0].specialty.image,
        icon: doctors[0].specialty.icon
      });
    }
    
    res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الأطباء',
      error: error.message
    });
  }
});

// جلب جميع الأطباء للأدمن (يشمل المعطلين)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Admin fetching all doctors (including inactive)...');
    
    const doctors = await Doctor.find({})
      .populate('specialty', 'name image icon slug description')
      .sort({ order: 1, createdAt: -1 });
    
    console.log(`✅ Found ${doctors.length} doctors total`);
    
    res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching all doctors for admin:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الأطباء',
      error: error.message
    });
  }
});

// جلب أطباء حسب التخصص (عام)
router.get('/specialty/:specialtyId', async (req, res) => {
  try {
    const { specialtyId } = req.params;
    
    console.log('🔍 Fetching doctors for specialty:', specialtyId);
    
    const specialty = await Category.findById(specialtyId);
    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'التخصص غير موجود'
      });
    }
    
    const doctors = await Doctor.find({ 
      specialty: specialtyId, 
      isActive: true 
    })
    .populate('specialty', 'name image icon slug description')
    .sort({ order: 1, createdAt: -1 });
    
    console.log(`✅ Found ${doctors.length} doctors for specialty`);
    
    res.status(200).json({
      success: true,
      data: doctors,
      specialty: {
        _id: specialty._id,
        name: specialty.name,
        image: specialty.image,
        icon: specialty.icon,
        slug: specialty.slug,
        description: specialty.description
      },
      count: doctors.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching doctors by specialty:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب أطباء التخصص',
      error: error.message
    });
  }
});

// جلب أطباء حسب slug التخصص (عام)
router.get('/category/:categorySlug', async (req, res) => {
  try {
    const { categorySlug } = req.params;
    
    console.log('🔍 Fetching doctors for category slug:', categorySlug);
    
    const specialty = await Category.findOne({ 
      $or: [
        { slug: categorySlug },
        { name: { $regex: new RegExp(categorySlug, 'i') } }
      ]
    });
    
    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'التخصص غير موجود'
      });
    }
    
    const doctors = await Doctor.find({ 
      specialty: specialty._id, 
      isActive: true 
    })
    .populate('specialty', 'name image icon slug description')
    .sort({ order: 1, createdAt: -1 });
    
    console.log(`✅ Found ${doctors.length} doctors for category`);
    
    res.status(200).json({
      success: true,
      data: doctors,
      specialty: {
        _id: specialty._id,
        name: specialty.name,
        image: specialty.image,
        icon: specialty.icon,
        slug: specialty.slug,
        description: specialty.description
      },
      count: doctors.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching doctors by category:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب أطباء التخصص',
      error: error.message
    });
  }
});

// جلب طبيب واحد (عام)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Fetching doctor:', id);
    
    const doctor = await Doctor.findById(id)
      .populate('specialty', 'name image icon slug description');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: doctor
    });
    
  } catch (error) {
    console.error('❌ Error fetching doctor:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'معرف الطبيب غير صحيح'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الطبيب',
      error: error.message
    });
  }
});

// 🔄 إضافة طبيب جديد - محدث مع Cloudinary
router.post('/', authenticateToken, requireAdmin, uploadDoctor.single('image'), async (req, res) => {
  try {
    const { 
      name, 
      specialty, 
      experience, 
      conditions, 
      yearsOfExperience,
      qualifications,
      phoneNumber,
      order 
    } = req.body;
    
    console.log('🔍 Creating new doctor:', { name, specialty });
    
    if (!name || !specialty) {
      return res.status(400).json({
        success: false,
        message: 'اسم الطبيب والتخصص مطلوبان'
      });
    }
    
    const categoryExists = await Category.findById(specialty);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'التخصص المحدد غير موجود'
      });
    }
    
    const existingDoctor = await Doctor.findOne({ 
      name: { $regex: new RegExp('^' + name.trim() + '$', 'i') },
      specialty: specialty
    });
    
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'يوجد طبيب بنفس الاسم في هذا التخصص'
      });
    }
    
    // 🆕 الصورة من Cloudinary - CloudinaryStorage يعيد secure_url أو url وليس path
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.secure_url || req.file.url;
      
      if (!imagePath) {
        console.error('❌ No URL returned from Cloudinary:', req.file);
        return res.status(500).json({
          success: false,
          message: 'فشل في رفع الملف إلى Cloudinary'
        });
      }
    }
    
    const newDoctor = new Doctor({
      name: name.trim(),
      specialty,
      experience: experience ? experience.trim() : '',
      image: imagePath,
      conditions: conditions ? conditions.trim() : '',
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
      qualifications: qualifications ? qualifications.trim() : '',
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      order: order ? parseInt(order) : 0
    });
    
    const savedDoctor = await newDoctor.save();
    
    const populatedDoctor = await Doctor.findById(savedDoctor._id)
      .populate('specialty', 'name image icon slug description');
    
    console.log('✅ Doctor created successfully:', populatedDoctor._id);
    
    res.status(201).json({
      success: true,
      message: 'تم إضافة الطبيب بنجاح',
      data: populatedDoctor
    });
    
  } catch (error) {
    console.error('❌ Error creating doctor:', error);
    
    // 🆕 حذف الصورة من Cloudinary إذا حدث خطأ
    if (req.file && req.file.public_id) {
      try {
        await deleteFromCloudinary(req.file.public_id);
      } catch (deleteError) {
        console.error('❌ Error deleting from Cloudinary:', deleteError);
      }
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة الطبيب',
      error: error.message
    });
  }
});

// 🔄 تحديث بيانات طبيب - محدث مع Cloudinary
router.put('/:id', authenticateToken, requireAdmin, uploadDoctor.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      specialty, 
      experience, 
      conditions,
      yearsOfExperience,
      qualifications,
      phoneNumber,
      order,
      removeImage 
    } = req.body;
    
    console.log('🔍 Updating doctor:', id);
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود'
      });
    }
    
    if (!name || !specialty) {
      return res.status(400).json({
        success: false,
        message: 'اسم الطبيب والتخصص مطلوبان'
      });
    }
    
    const categoryExists = await Category.findById(specialty);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'التخصص المحدد غير موجود'
      });
    }
    
    const existingDoctor = await Doctor.findOne({ 
      $and: [
        { _id: { $ne: id } },
        { name: { $regex: new RegExp('^' + name.trim() + '$', 'i') } },
        { specialty: specialty }
      ]
    });
    
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'يوجد طبيب آخر بنفس الاسم في هذا التخصص'
      });
    }
    
    // 🆕 إدارة الصورة مع Cloudinary
    let imagePath = doctor.image;
    
    if (removeImage === 'true') {
      // حذف الصورة الحالية من Cloudinary
      if (doctor.image) {
        await deleteFromCloudinary(doctor.image);
      }
      imagePath = null;
    } else if (req.file) {
      // 🆕 CloudinaryStorage يعيد secure_url أو url وليس path
      const fileUrl = req.file.secure_url || req.file.url;
      
      if (!fileUrl) {
        console.error('❌ No URL returned from Cloudinary:', req.file);
        return res.status(500).json({
          success: false,
          message: 'فشل في رفع الملف إلى Cloudinary'
        });
      }
      
      // رفع صورة جديدة - حذف القديمة أولاً
      if (doctor.image) {
        await deleteFromCloudinary(doctor.image);
      }
      imagePath = fileUrl;
      console.log('📷 Uploaded new doctor image:', fileUrl);
    }
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        specialty,
        experience: experience ? experience.trim() : '',
        image: imagePath,
        conditions: conditions ? conditions.trim() : '',
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
        qualifications: qualifications ? qualifications.trim() : '',
        phoneNumber: phoneNumber ? phoneNumber.trim() : '',
        order: order ? parseInt(order) : 0
      },
      { new: true, runValidators: true }
    ).populate('specialty', 'name image icon slug description');
    
    console.log('✅ Doctor updated successfully:', updatedDoctor._id);
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الطبيب بنجاح',
      data: updatedDoctor
    });
    
  } catch (error) {
    console.error('❌ Error updating doctor:', error);
    
    // 🆕 حذف الصورة الجديدة من Cloudinary إذا حدث خطأ
    if (req.file && req.file.public_id) {
      try {
        await deleteFromCloudinary(req.file.public_id);
      } catch (deleteError) {
        console.error('❌ Error deleting from Cloudinary:', deleteError);
      }
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'معرف الطبيب غير صحيح'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث بيانات الطبيب',
      error: error.message
    });
  }
});

// 🔄 حذف طبيب - محدث مع Cloudinary
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Deleting doctor:', id);
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود'
      });
    }
    
    // 🆕 حذف صورة الطبيب من Cloudinary
    if (doctor.image) {
      await deleteFromCloudinary(doctor.image);
    }
    
    await Doctor.findByIdAndDelete(id);
    
    console.log('✅ Doctor deleted successfully:', id);
    
    res.status(200).json({
      success: true,
      message: 'تم حذف الطبيب بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Error deleting doctor:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'معرف الطبيب غير صحيح'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الطبيب',
      error: error.message
    });
  }
});

// تعطيل/تفعيل طبيب
router.patch('/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Toggling doctor status:', id);
    
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود'
      });
    }
    
    doctor.isActive = !doctor.isActive;
    await doctor.save();
    
    const populatedDoctor = await Doctor.findById(id)
      .populate('specialty', 'name image icon slug description');
    
    console.log('✅ Doctor status toggled successfully:', id);
    
    res.status(200).json({
      success: true,
      message: `تم ${doctor.isActive ? 'تفعيل' : 'تعطيل'} الطبيب بنجاح`,
      data: populatedDoctor
    });
    
  } catch (error) {
    console.error('❌ Error toggling doctor status:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'معرف الطبيب غير صحيح'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في تغيير حالة الطبيب',
      error: error.message
    });
  }
});

// إحصائيات الأطباء (إدارة فقط)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Fetching doctors statistics...');
    
    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ isActive: true });
    const inactiveDoctors = await Doctor.countDocuments({ isActive: false });
    
    const doctorsBySpecialty = await Doctor.getSpecialtyStats();
    
    console.log('✅ Doctors statistics fetched successfully');
    
    res.status(200).json({
      success: true,
      data: {
        total: totalDoctors,
        active: activeDoctors,
        inactive: inactiveDoctors,
        bySpecialty: doctorsBySpecialty
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching doctors statistics:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الأطباء',
      error: error.message
    });
  }
});

// البحث في الأطباء (عام)
router.get('/search/:searchTerm', async (req, res) => {
  try {
    const { searchTerm } = req.params;
    
    console.log('🔍 Searching doctors with term:', searchTerm);
    
    const doctors = await Doctor.searchDoctors(searchTerm);
    
    console.log(`✅ Found ${doctors.length} doctors matching search term`);
    
    res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length,
      searchTerm
    });
    
  } catch (error) {
    console.error('❌ Error searching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث عن الأطباء',
      error: error.message
    });
  }
});

// تحديث ترتيب الأطباء (إدارة فقط)
router.patch('/reorder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { doctorsOrder } = req.body;
    
    console.log('🔍 Reordering doctors...');
    
    if (!Array.isArray(doctorsOrder)) {
      return res.status(400).json({
        success: false,
        message: 'يجب إرسال مصفوفة من ترتيب الأطباء'
      });
    }
    
    const updatePromises = doctorsOrder.map(({ id, order }) => 
      Doctor.findByIdAndUpdate(id, { order: parseInt(order) })
    );
    
    await Promise.all(updatePromises);
    
    console.log('✅ Doctors reordered successfully');
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث ترتيب الأطباء بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Error reordering doctors:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث ترتيب الأطباء',
      error: error.message
    });
  }
});

module.exports = router;