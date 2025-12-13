// Back-end/routes/partner.js - مُصحح ومبسط
const express = require('express');
const router = express.Router();
const Partner = require('../Models/Partner');
const authenticateToken = require('../Middleware/authMiddleware');

// استيراد Cloudinary
const { uploadMedia, deleteFromCloudinary, handleMulterError } = require('../config/cloudinary');

// GET /api/partners - للعرض العام (فقط النشطة)
router.get('/', async (req, res) => {
  try {
    const partners = await Partner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(partners);
  } catch (err) {
    console.error('خطأ جلب الشراكات:', err);
    res.status(500).json({ message: 'فشل في تحميل الشراكات' });
  }
});

// GET /api/partners/admin/all - للوحة التحكم (جميع الشراكات)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const partners = await Partner.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: partners });
  } catch (err) {
    console.error('خطأ جلب الشراكات:', err);
    res.status(500).json({ success: false, message: 'فشل في تحميل الشراكات' });
  }
});

// POST /api/partners - إضافة شريك جديد
router.post('/', authenticateToken, (req, res) => {
  uploadMedia.single('logo')(req, res, async (err) => {
    if (err) {
      console.error('❌ Upload error:', err);
      return handleMulterError(err, req, res, () => {});
    }

    try {
      const { name, enName } = req.body;

      if (!name || !name.trim()) {
        if (req.file && req.file.public_id) {
          await deleteFromCloudinary(req.file.public_id);
        }
        return res.status(400).json({ success: false, message: 'اسم الشريك مطلوب' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'الشعار مطلوب' });
      }

      // 🆕 CloudinaryStorage يعيد secure_url أو url وليس path
      const fileUrl = req.file.secure_url || req.file.url;
      
      if (!fileUrl) {
        console.error('❌ No URL returned from Cloudinary:', req.file);
        return res.status(500).json({
          success: false,
          message: 'فشل في رفع الملف إلى Cloudinary'
        });
      }

      console.log('✅ Logo uploaded to Cloudinary:', fileUrl);

      const newPartner = new Partner({
        name: name.trim(),
        enName: enName ? enName.trim() : '',
        logo: fileUrl,
        isActive: true
      });

      const saved = await newPartner.save();
      console.log('✅ Partner saved to database:', saved._id);
      
      res.status(201).json({ success: true, data: saved, message: 'تم إضافة الشريك بنجاح' });
    } catch (error) {
      console.error('خطأ حفظ الشريك:', error);
      if (req.file && req.file.public_id) {
        try {
          await deleteFromCloudinary(req.file.public_id);
        } catch (deleteError) {
          console.error('❌ Error deleting from Cloudinary:', deleteError);
        }
      }
      res.status(500).json({ success: false, message: 'فشل في حفظ الشريك' });
    }
  });
});

// PUT /api/partners/:id - تحديث شريك
router.put('/:id', authenticateToken, (req, res) => {
  uploadMedia.single('logo')(req, res, async (err) => {
    if (err) {
      console.error('❌ Upload error:', err);
      return handleMulterError(err, req, res, () => {});
    }

    try {
      const { name, enName } = req.body;

      if (!name || !name.trim()) {
        if (req.file && req.file.public_id) {
          await deleteFromCloudinary(req.file.public_id);
        }
        return res.status(400).json({ success: false, message: 'اسم الشريك مطلوب' });
      }

      const updateData = {
        name: name.trim(),
        enName: enName ? enName.trim() : ''
      };

      // إذا تم رفع شعار جديد
      if (req.file) {
        // 🆕 CloudinaryStorage يعيد secure_url أو url وليس path
        const fileUrl = req.file.secure_url || req.file.url;
        
        if (!fileUrl) {
          console.error('❌ No URL returned from Cloudinary:', req.file);
          return res.status(500).json({
            success: false,
            message: 'فشل في رفع الملف إلى Cloudinary'
          });
        }
        
        const oldPartner = await Partner.findById(req.params.id);
        if (oldPartner && oldPartner.logo) {
          await deleteFromCloudinary(oldPartner.logo);
        }
        updateData.logo = fileUrl;
        console.log('📷 Uploaded new partner logo:', fileUrl);
      }

      const updated = await Partner.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updated) {
        if (req.file && req.file.public_id) {
          await deleteFromCloudinary(req.file.public_id);
        }
        return res.status(404).json({ success: false, message: 'الشريك غير موجود' });
      }

      res.json({ success: true, data: updated, message: 'تم تحديث الشريك بنجاح' });
    } catch (err) {
      console.error('خطأ تحديث الشريك:', err);
      if (req.file && req.file.public_id) {
        try {
          await deleteFromCloudinary(req.file.public_id);
        } catch (deleteError) {
          console.error('❌ Error deleting from Cloudinary:', deleteError);
        }
      }
      res.status(400).json({ success: false, message: 'فشل تحديث الشريك' });
    }
  });
});

// PATCH /api/partners/:id/toggle-status - تغيير حالة الشريك (تفعيل/تعطيل)
router.patch('/:id/toggle-status', authenticateToken, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'الشريك غير موجود' });
    }

    partner.isActive = !partner.isActive;
    const updated = await partner.save();

    const statusText = updated.isActive ? 'تم تفعيل الشريك' : 'تم تعطيل الشريك';
    res.json({ success: true, data: updated, message: statusText });
  } catch (err) {
    console.error('خطأ تغيير حالة الشريك:', err);
    res.status(500).json({ success: false, message: 'فشل في تغيير حالة الشريك' });
  }
});

// DELETE /api/partners/:id - حذف شريك
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'الشريك غير موجود' });
    }

    // حذف الشعار من Cloudinary
    if (partner.logo) {
      await deleteFromCloudinary(partner.logo);
    }

    await Partner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف الشريك بنجاح' });
  } catch (err) {
    console.error('خطأ حذف الشريك:', err);
    res.status(500).json({ success: false, message: 'فشل حذف الشريك' });
  }
});

module.exports = router;