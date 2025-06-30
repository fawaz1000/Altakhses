const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Media    = require('../Models/Media');
// 🔧 تصحيح الاستيراد - استيراد مباشر
const authenticateToken = require('../Middleware/authMiddleware');
const router   = express.Router();

// إعداد Multer لحفظ الملفات في مجلّد /uploads/media
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve(__dirname, '../uploads/media'));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }  // 100 ميجابايت كحد أقصى (لملفات حتى 5 دقائق)
});

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

// POST /api/media
router.post('/', authenticateToken, upload.single('media'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'الملف غير موجود' });
    }

    const newMedia = new Media({
      title,
      description,
      category: category || 'general',
      url: `/uploads/media/${req.file.filename}`,
      type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      approved: true  // ✅ الآن تُضاف تلقائيًا للقناة الإعلامية
    });

    const saved = await newMedia.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('خطأ حفظ الوسائط:', err);
    res.status(500).json({ message: 'فشل في حفظ الوسائط' });
  }
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

// DELETE /api/media/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Media.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'العنصر غير موجود' });
    }

    const filePath = path.resolve(__dirname, '../uploads/media', path.basename(item.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الوسائط بنجاح' });
  } catch (err) {
    console.error('خطأ حذف الوسائط:', err);
    res.status(500).json({ message: 'فشل حذف الوسائط' });
  }
});

module.exports = router;