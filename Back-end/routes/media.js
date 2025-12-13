// Back-end/routes/media.js - محدث مع Cloudinary
const express  = require('express');
const Media    = require('../Models/Media');
const authenticateToken = require('../Middleware/authMiddleware');
const router   = express.Router();

// 🆕 استيراد Cloudinary بدلاً من multer العادي
const { uploadMedia, deleteFromCloudinary, handleMulterError } = require('../config/cloudinary');

// GET /api/media
router.get('/', async (req, res) => {
  try {
    const filter = { approved: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const items = await Media.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('خطأ جلب الوسائط:', err);
    res.status(500).json({ message: 'فشل في تحميل الوسائط' });
  }
});

// 🔄 POST /api/media - محدث مع Cloudinary
router.post('/', authenticateToken, (req, res) => {
  uploadMedia.single('media')(req, res, async (err) => {
    if (err) {
      console.error('❌ Upload error:', err);
      
      if (err.message && err.message.includes('Invalid token')) {
        return res.status(500).json({ 
          message: 'خطأ في إعدادات Cloudinary. تحقق من مفاتيح API' 
        });
      }
      
      return handleMulterError(err, req, res, () => {});
    }

    try {
      const { title, description, category } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'الملف غير موجود' });
      }

      console.log('✅ File uploaded to Cloudinary:', req.file.path);

      const newMedia = new Media({
        title,
        description,
        category: category || 'general',
        url: req.file.path,  // 🆕 استخدام path من Cloudinary
        type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
        approved: true
      });

      const saved = await newMedia.save();
      console.log('✅ Media saved to database:', saved._id);
      
      res.status(201).json(saved);
    } catch (error) {
      console.error('خطأ حفظ الوسائط:', error);
      // 🆕 حذف الملف من Cloudinary في حالة الخطأ
      if (req.file) {
        await deleteFromCloudinary(req.file.path);
      }
      res.status(500).json({ message: 'فشل في حفظ الوسائط' });
    }
  });
});

// PUT /api/media/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Media.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, description: req.body.description },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'العنصر غير موجود' });
    }
    res.json(updated);
  } catch (err) {
    console.error('خطأ تحديث الوسائط:', err);
    res.status(400).json({ message: 'فشل تحديث الوسائط' });
  }
});

// 🔄 DELETE /api/media/:id - محدث مع Cloudinary
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Media.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'العنصر غير موجود' });
    }

    // 🆕 حذف من Cloudinary بدلاً من الملف المحلي
    if (item.url) {
      await deleteFromCloudinary(item.url);
    }

    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الوسائط بنجاح' });
  } catch (err) {
    console.error('خطأ حذف الوسائط:', err);
    res.status(500).json({ message: 'فشل حذف الوسائط' });
  }
});

module.exports = router;