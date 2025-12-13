// Back-end/config/cloudinary.js - مُصحح مع دعم الخدمات
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// تحميل متغيرات البيئة أولاً
require('dotenv').config();

// التحقق من وجود متغيرات البيئة المطلوبة
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary environment variables');
  console.error('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  console.error('Current values:', {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'NOT SET',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
  });
}

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// التحقق من الاتصال
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    console.error('Please check your Cloudinary credentials in .env file');
    return false;
  }
};

// اختبار الاتصال عند بدء التشغيل
testCloudinaryConnection();

// إعداد التخزين للأقسام
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
      console.log('📸 Uploading category image:', file.originalname);
      const params = {
        folder: 'altakhses/categories',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: [{ 
          width: 500, 
          height: 500, 
          crop: 'limit', 
          quality: 'auto:good',
          fetch_format: 'auto'
        }],
        use_filename: true,
        unique_filename: true,
        public_id: `category_${Date.now()}`
      };
      console.log('📸 Upload params:', params);
      return params;
    } catch (error) {
      console.error('❌ Category storage params error:', error);
      throw error;
    }
  }
});

// إعداد التخزين للأطباء
const doctorStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
      console.log('👨‍⚕️ Uploading doctor image:', file.originalname);
      const params = {
        folder: 'altakhses/doctors',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: [{ 
          width: 400, 
          height: 400, 
          crop: 'fill', 
          gravity: 'face', 
          quality: 'auto:good',
          fetch_format: 'auto'
        }],
        use_filename: true,
        unique_filename: true,
        public_id: `doctor_${Date.now()}`
      };
      console.log('👨‍⚕️ Upload params:', params);
      return params;
    } catch (error) {
      console.error('❌ Doctor storage params error:', error);
      throw error;
    }
  }
});

// 🆕 إعداد التخزين للخدمات
const serviceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
      console.log('🏥 Uploading service image:', file.originalname);
      const params = {
        folder: 'altakhses/services',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: [{ 
          width: 600, 
          height: 400, 
          crop: 'limit', 
          quality: 'auto:good',
          fetch_format: 'auto'
        }],
        use_filename: true,
        unique_filename: true,
        public_id: `service_${Date.now()}`
      };
      console.log('🏥 Upload params:', params);
      return params;
    } catch (error) {
      console.error('❌ Service storage params error:', error);
      throw error;
    }
  }
});

// إعداد التخزين للوسائط
const mediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
      console.log('🎬 Uploading media file:', file.originalname);
      console.log('File mimetype:', file.mimetype);
      console.log('Request body:', req.body);
      
      // تحديد نوع الملف
      const isVideo = file.mimetype.startsWith('video');
      
      const params = {
        folder: `altakhses/media/${req.body.category || 'general'}`,
        resource_type: isVideo ? 'video' : 'image',
        allowed_formats: isVideo ? ['mp4', 'webm', 'mov', 'avi'] : ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: isVideo ? 
          [{ 
            width: 1280, 
            height: 720, 
            crop: 'limit', 
            quality: 'auto:good',
            resource_type: 'video'
          }] :
          [{ 
            width: 1200, 
            height: 800, 
            crop: 'limit', 
            quality: 'auto:best',
            fetch_format: 'auto'
          }],
        use_filename: true,
        unique_filename: true,
        public_id: `media_${Date.now()}`
      };
      
      console.log('🎬 Upload params:', params);
      return params;
    } catch (error) {
      console.error('❌ Media storage params error:', error);
      throw error;
    }
  }
});

// دالة معالجة أخطاء Multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer Error:', error);
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          error: 'حجم الملف كبير جداً', 
          message: 'يجب أن يكون حجم الملف أقل من 10MB للصور و 100MB للفيديو' 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          error: 'عدد الملفات تجاوز الحد المسموح', 
          message: 'يمكن رفع ملف واحد فقط في كل مرة' 
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          error: 'حقل الملف غير متوقع', 
          message: 'تأكد من استخدام الحقل الصحيح للملف' 
        });
      default:
        return res.status(400).json({ 
          error: 'خطأ في رفع الملف', 
          message: error.message 
        });
    }
  }
  
  if (error) {
    console.error('❌ Upload Error:', error);
    
    // معالجة أخطاء Cloudinary
    if (error.message && error.message.includes('Invalid token')) {
      return res.status(500).json({ 
        error: 'خطأ في إعدادات Cloudinary', 
        message: 'تحقق من صحة مفاتيح API في ملف .env',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    return res.status(500).json({ 
      error: 'خطأ في الخادم', 
      message: 'حدث خطأ أثناء رفع الملف',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  
  next();
};

// إنشاء multer instances مع معالجة أفضل للأخطاء
const uploadCategory = multer({ 
  storage: categoryStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 Category file filter:', file.mimetype);
    
    // قبول أنواع الصور فقط
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يُرجى رفع صورة فقط'), false);
    }
  }
});

const uploadDoctor = multer({ 
  storage: doctorStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    console.log('👨‍⚕️ Doctor file filter:', file.mimetype);
    
    // قبول أنواع الصور فقط
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يُرجى رفع صورة فقط'), false);
    }
  }
});

// 🆕 إنشاء multer instance للخدمات
const uploadService = multer({ 
  storage: serviceStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    console.log('🏥 Service file filter:', file.mimetype);
    
    // قبول أنواع الصور فقط
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يُرجى رفع صورة فقط'), false);
    }
  }
});

const uploadMedia = multer({ 
  storage: mediaStorage,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB للفيديو
  },
  fileFilter: (req, file, cb) => {
    console.log('🎬 Media file filter:', file.mimetype);
    
    // قبول الصور والفيديوهات
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يُرجى رفع صورة أو فيديو'), false);
    }
  }
});

// دالة لحذف الصور من Cloudinary
const deleteFromCloudinary = async (imageUrlOrPublicId) => {
  try {
    if (!imageUrlOrPublicId) {
      console.log('⚠️ No URL or public_id provided for deletion');
      return { result: 'not_found' };
    }

    let publicId = imageUrlOrPublicId;

    // إذا كان URL وليس public_id، استخراج public_id من الـ URL
    if (imageUrlOrPublicId.includes('cloudinary') || imageUrlOrPublicId.startsWith('http')) {
      console.log('🗑️ Attempting to delete from Cloudinary URL:', imageUrlOrPublicId);
      
      const urlParts = imageUrlOrPublicId.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      
      if (uploadIndex !== -1) {
        // إزالة version (v123456) إذا كان موجود
        let startIndex = uploadIndex + 1;
        if (urlParts[startIndex] && urlParts[startIndex].startsWith('v') && !isNaN(urlParts[startIndex].substring(1))) {
          startIndex += 1;
        }
        
        // بناء public_id
        const publicIdParts = urlParts.slice(startIndex);
        const lastPart = publicIdParts[publicIdParts.length - 1];
        const publicIdWithoutExtension = lastPart.split('.')[0];
        publicIdParts[publicIdParts.length - 1] = publicIdWithoutExtension;
        publicId = publicIdParts.join('/');
      } else {
        console.log('⚠️ Could not extract public_id from URL');
        return { result: 'not_found' };
      }
    } else {
      console.log('🗑️ Attempting to delete from Cloudinary using public_id:', publicId);
    }
    
    console.log('🔍 Using public_id:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Cloudinary deletion result:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    return { result: 'error', error: error.message };
  }
};

// دالة تنظيف الملفات المؤقتة
const cleanupTempFiles = () => {
  console.log('🧹 Cleanup temporary files if any...');
};

module.exports = {
  cloudinary,
  uploadCategory,
  uploadDoctor,
  uploadService, // 🆕 تصدير uploadService
  uploadMedia,
  deleteFromCloudinary,
  handleMulterError,
  cleanupTempFiles,
  testCloudinaryConnection
};