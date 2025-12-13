// Back-end/routes/settings.js
const express = require('express');
const router = express.Router();
const Settings = require('../Models/Settings');
const authenticateToken = require('../Middleware/authMiddleware');
const { cloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// إعداد التخزين للشعار
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'altakhses/settings',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'],
      transformation: [{ 
        width: 300, 
        height: 150, 
        crop: 'limit', 
        quality: 'auto:best',
        fetch_format: 'auto'
      }],
      use_filename: true,
      unique_filename: true,
      public_id: `logo_${Date.now()}`
    };
  }
});

const uploadLogo = multer({ 
  storage: logoStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يُرجى رفع صورة فقط'), false);
    }
  }
});

// جلب الإعدادات (عام)
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching site settings...');
    const settings = await Settings.getInstance();
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإعدادات',
      error: error.message
    });
  }
});

// تحديث الإعدادات (للأدمن فقط)
router.put('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Updating site settings...');
    
    // التحقق من صلاحيات الأدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح - تحتاج صلاحيات المدير'
      });
    }

    const settings = await Settings.getInstance();
    
    // تحديث البيانات
    if (req.body.siteName) settings.siteName = req.body.siteName;
    if (req.body.contactInfo) {
      settings.contactInfo = { ...settings.contactInfo, ...req.body.contactInfo };
    }
    if (req.body.socialLinks) {
      settings.socialLinks = { ...settings.socialLinks, ...req.body.socialLinks };
    }
    
    await settings.save();
    
    console.log('✅ Settings updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح',
      data: settings
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الإعدادات',
      error: error.message
    });
  }
});

// رفع الشعار (للأدمن فقط)
router.post('/logo', authenticateToken, uploadLogo.single('logo'), async (req, res) => {
  try {
    console.log('🔍 Uploading new logo...');
    
    // التحقق من صلاحيات الأدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح - تحتاج صلاحيات المدير'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي ملف'
      });
    }

    const settings = await Settings.getInstance();
    
    // حذف الشعار القديم إذا كان موجود
    if (settings.logo) {
      await deleteFromCloudinary(settings.logo);
      console.log('🗑️ Deleted old logo');
    }
    
    // 🔍 multer-storage-cloudinary v4 يعيد path كـ URL كامل
    // لكن بعض الإصدارات قد تعيد secure_url أو url
    // نتحقق من جميع الخيارات
    const fileUrl = req.file.path || req.file.secure_url || req.file.url;
    
    if (!fileUrl) {
      console.error('❌ No URL returned from Cloudinary');
      console.error('❌ req.file keys:', Object.keys(req.file));
      console.error('❌ req.file object:', {
        path: req.file.path,
        secure_url: req.file.secure_url,
        url: req.file.url,
        public_id: req.file.public_id,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype
      });
      return res.status(500).json({
        success: false,
        message: 'فشل في رفع الملف إلى Cloudinary - لم يتم إرجاع رابط الملف',
        error: 'Cloudinary did not return a file URL'
      });
    }
    
    settings.logo = fileUrl;
    await settings.save();
    
    console.log('✅ Logo uploaded successfully:', fileUrl);
    
    res.status(200).json({
      success: true,
      message: 'تم رفع الشعار بنجاح',
      data: settings
    });
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    
    // حذف الملف المرفوع في حالة الخطأ
    if (req.file && req.file.public_id) {
      try {
        await deleteFromCloudinary(req.file.public_id);
      } catch (deleteError) {
        console.error('❌ Error deleting from Cloudinary:', deleteError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في رفع الشعار',
      error: error.message
    });
  }
});

// حذف الشعار (للأدمن فقط)
router.delete('/logo', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Deleting logo...');
    
    // التحقق من صلاحيات الأدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح - تحتاج صلاحيات المدير'
      });
    }

    const settings = await Settings.getInstance();
    
    if (settings.logo) {
      await deleteFromCloudinary(settings.logo);
      settings.logo = null;
      await settings.save();
      console.log('✅ Logo deleted successfully');
    }
    
    res.status(200).json({
      success: true,
      message: 'تم حذف الشعار بنجاح',
      data: settings
    });
  } catch (error) {
    console.error('❌ Error deleting logo:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الشعار',
      error: error.message
    });
  }
});

module.exports = router;