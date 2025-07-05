// Back-end/routes/doctors.js
const express = require('express');
const router = express.Router();
const Doctor = require('../Models/Doctors');
const Category = require('../Models/Category');
const authenticateToken = require('../Middleware/authMiddleware');
const { requireAdmin } = require('../Middleware/roleMiddleware');

// جلب جميع الأطباء (عام)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all doctors...');
    
    const doctors = await Doctor.find({ isActive: true })
      .populate('specialty', 'name')
      .sort({ createdAt: -1 });
    
    console.log('Doctors found:', doctors.length);
    
    res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length
    });
    
  } catch (error) {
    console.error('Error fetching doctors:', error);
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
    
    console.log('Fetching doctors for specialty:', specialtyId);
    
    // التحقق من وجود التخصص
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
    .populate('specialty', 'name')
    .sort({ createdAt: -1 });
    
    console.log('Doctors found for specialty:', doctors.length);
    
    res.status(200).json({
      success: true,
      data: doctors,
      specialty: specialty.name,
      count: doctors.length
    });
    
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
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
    
    console.log('Fetching doctor:', id);
    
    const doctor = await Doctor.findById(id)
      .populate('specialty', 'name');
    
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
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الطبيب',
      error: error.message
    });
  }
});

// إضافة طبيب جديد (إدارة فقط)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, specialty, experience, image } = req.body;
    
    console.log('Creating new doctor:', { name, specialty });
    
    // التحقق من البيانات المطلوبة
    if (!name || !specialty) {
      return res.status(400).json({
        success: false,
        message: 'اسم الطبيب والتخصص مطلوبان'
      });
    }
    
    // التحقق من وجود التخصص
    const categoryExists = await Category.findById(specialty);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'التخصص المحدد غير موجود'
      });
    }
    
    // التحقق من عدم وجود طبيب بنفس الاسم والتخصص
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
    
    // إنشاء الطبيب الجديد
    const newDoctor = new Doctor({
      name: name.trim(),
      specialty,
      experience: experience ? experience.trim() : '',
      image: image ? image.trim() : ''
    });
    
    const savedDoctor = await newDoctor.save();
    
    // جلب الطبيب مع بيانات التخصص
    const populatedDoctor = await Doctor.findById(savedDoctor._id)
      .populate('specialty', 'name');
    
    console.log('Doctor created successfully:', populatedDoctor._id);
    
    res.status(201).json({
      success: true,
      message: 'تم إضافة الطبيب بنجاح',
      data: populatedDoctor
    });
    
  } catch (error) {
    console.error('Error creating doctor:', error);
    
    // التعامل مع أخطاء التحقق
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

// تحديث بيانات طبيب (إدارة فقط)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, experience, image } = req.body;
    
    console.log('Updating doctor:', id);
    
    // التحقق من وجود الطبيب
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود'
      });
    }
    
    // التحقق من البيانات المطلوبة
    if (!name || !specialty) {
      return res.status(400).json({
        success: false,
        message: 'اسم الطبيب والتخصص مطلوبان'
      });
    }
    
    // التحقق من وجود التخصص
    const categoryExists = await Category.findById(specialty);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'التخصص المحدد غير موجود'
      });
    }
    
    // التحقق من عدم وجود طبيب آخر بنفس الاسم والتخصص
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
    
    // تحديث البيانات
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        specialty,
        experience: experience ? experience.trim() : '',
        image: image ? image.trim() : ''
      },
      { new: true, runValidators: true }
    ).populate('specialty', 'name');
    
    console.log('Doctor updated successfully:', updatedDoctor._id);
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الطبيب بنجاح',
      data: updatedDoctor
    });
    
  } catch (error) {
    console.error('Error updating doctor:', error);
    
    // التعامل مع أخطاء التحقق
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

// حذف طبيب (إدارة فقط)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting doctor:', id);
    
    // التحقق من وجود الطبيب
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'الطبيب غير موجود'
      });
    }
    
    // حذف الطبيب
    await Doctor.findByIdAndDelete(id);
    
    console.log('Doctor deleted successfully:', id);
    
    res.status(200).json({
      success: true,
      message: 'تم حذف الطبيب بنجاح'
    });
    
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الطبيب',
      error: error.message
    });
  }
});

// تعطيل/تفعيل طبيب (إدارة فقط)
router.patch('/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Toggling doctor status:', id);
    
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
      .populate('specialty', 'name');
    
    console.log('Doctor status toggled successfully:', id);
    
    res.status(200).json({
      success: true,
      message: `تم ${doctor.isActive ? 'تفعيل' : 'تعطيل'} الطبيب بنجاح`,
      data: populatedDoctor
    });
    
  } catch (error) {
    console.error('Error toggling doctor status:', error);
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
    console.log('Fetching doctors statistics...');
    
    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ isActive: true });
    const inactiveDoctors = await Doctor.countDocuments({ isActive: false });
    
    // إحصائيات حسب التخصص
    const doctorsBySpecialty = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialty',
          count: { $sum: 1 }
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
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('Doctors statistics fetched successfully');
    
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
    console.error('Error fetching doctors statistics:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الأطباء',
      error: error.message
    });
  }
});

module.exports = router;