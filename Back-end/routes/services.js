// Back-end/routes/services.js - محدث مع دعم الصور
const express = require('express');
const router = express.Router();
const Service = require('../Models/Service');
const Category = require('../Models/Category');
const authenticateToken = require('../Middleware/authMiddleware');

// 🆕 استيراد Cloudinary
const { uploadService, deleteFromCloudinary, handleMulterError } = require('../config/cloudinary');

// إضافة middleware لتحقق من صلاحيات الأدمن
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      error: 'غير مسموح - تحتاج صلاحيات المدير'
    });
  }
};

// جلب جميع الخدمات أو تصفية حسب القسم (مفتوح للجميع)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/services - Query params:', req.query);
    
    const { categoryId, category, populate } = req.query;
    let query = { isActive: true };
    
    // تصفية حسب القسم إذا تم تمرير categoryId
    if (categoryId) {
      query.categoryId = categoryId;
      console.log('Filtering by categoryId:', categoryId);
    }
    
    // تصفية حسب اسم القسم إذا تم تمرير category
    if (category) {
      const foundCategory = await Category.findOne({ 
        $or: [{ name: category }, { slug: category }] 
      });
      if (foundCategory) {
        query.categoryId = foundCategory._id;
        console.log('Filtering by category name:', category, '-> ID:', foundCategory._id);
      }
    }
    
    let servicesQuery = Service.find(query).sort({ createdAt: -1 });
    
    // populate معلومات القسم إذا طُلب ذلك
    if (populate === 'category') {
      servicesQuery = servicesQuery.populate('categoryId', 'name description image icon slug');
    }
    
    const services = await servicesQuery;
    console.log(`Found ${services.length} services`);
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: error.message });
  }
});

// جلب خدمة واحدة (مفتوح للجميع)
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/services/${req.params.id}`);
    
    const service = await Service.findById(req.params.id).populate('categoryId', 'name description image icon slug');
    
    if (!service) {
      return res.status(404).json({ error: 'الخدمة غير موجودة' });
    }
    
    console.log('Service found:', service.name);
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔄 إضافة خدمة جديدة - محدث مع دعم الصور
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  uploadService.single('image')(req, res, async (err) => {
    if (err) {
      console.error('❌ Upload error:', err);
      return handleMulterError(err, req, res, () => {});
    }

    try {
      console.log('POST /api/services - Request body:', req.body);
      console.log('Uploaded file:', req.file);
      
      const { name, description, categoryId, price, duration } = req.body;
      
      // التحقق من البيانات المطلوبة
      if (!name || !description || !categoryId) {
        // حذف الصورة المرفوعة إذا كان هناك خطأ
        if (req.file && req.file.public_id) {
          await deleteFromCloudinary(req.file.public_id);
        }
        return res.status(400).json({ 
          error: 'اسم الخدمة ووصفها والقسم مطلوبة' 
        });
      }
      
      // التحقق من وجود القسم
      const category = await Category.findById(categoryId);
      if (!category) {
        if (req.file && req.file.public_id) {
          await deleteFromCloudinary(req.file.public_id);
        }
        return res.status(400).json({ error: 'القسم المحدد غير موجود' });
      }
      
      // التحقق من عدم وجود خدمة بنفس الاسم في نفس القسم
      const existingService = await Service.findOne({ 
        name,
        categoryId,
        isActive: true
      });
      
      if (existingService) {
        if (req.file && req.file.public_id) {
          await deleteFromCloudinary(req.file.public_id);
        }
        return res.status(400).json({ 
          error: 'يوجد خدمة بهذا الاسم في نفس القسم مسبقاً' 
        });
      }

      // 🆕 CloudinaryStorage يعيد secure_url أو url وليس path
      const fileUrl = req.file ? (req.file.secure_url || req.file.url) : null;

      const service = new Service({
        name,
        description,
        categoryId,
        image: fileUrl, // 🆕 إضافة رابط الصورة من Cloudinary
        price: price ? parseFloat(price) : undefined,
        duration
      });

      console.log('Creating service:', service);
      await service.save();
      
      // جلب الخدمة مع معلومات القسم
      const savedService = await Service.findById(service._id).populate('categoryId', 'name description image icon slug');
      
      console.log('Service created successfully:', savedService.name);
      res.status(201).json(savedService);
    } catch (error) {
      console.error('Error creating service:', error);
      
      // حذف الصورة المرفوعة في حالة الخطأ
      if (req.file && req.file.public_id) {
        try {
          await deleteFromCloudinary(req.file.public_id);
        } catch (deleteError) {
          console.error('Error deleting uploaded file:', deleteError);
        }
      }
      
      if (error.code === 11000) {
        return res.status(400).json({ error: 'اسم الخدمة موجود مسبقاً في هذا القسم' });
      }
      res.status(500).json({ error: error.message });
    }
  });
});

// 🔄 تحديث خدمة - محدث مع دعم الصور
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  uploadService.single('image')(req, res, async (err) => {
    if (err) {
      console.error('❌ Upload error:', err);
      return handleMulterError(err, req, res, () => {});
    }

    try {
      console.log(`PUT /api/services/${req.params.id} - Request body:`, req.body);
      console.log('Uploaded file:', req.file);
      
      const { name, description, categoryId, price, duration, removeImage } = req.body;
      
      // العثور على الخدمة الحالية
      const currentService = await Service.findById(req.params.id);
      if (!currentService) {
        if (req.file && req.file.public_id) {
          await deleteFromCloudinary(req.file.public_id);
        }
        return res.status(404).json({ error: 'الخدمة غير موجودة' });
      }
      
      // إذا تم تغيير القسم، تحقق من وجوده
      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          if (req.file && req.file.public_id) {
            await deleteFromCloudinary(req.file.public_id);
          }
          return res.status(400).json({ error: 'القسم المحدد غير موجود' });
        }
      }
      
      // إدارة الصورة
      let imagePath = currentService.image;
      
      if (removeImage === 'true') {
        // حذف الصورة الحالية
        if (currentService.image) {
          await deleteFromCloudinary(currentService.image);
          console.log('🗑️ Deleted old service image');
        }
        imagePath = null;
      } else if (req.file) {
        // 🆕 CloudinaryStorage يعيد secure_url أو url وليس path
        const fileUrl = req.file.secure_url || req.file.url;
        
        if (!fileUrl) {
          console.error('❌ No URL returned from Cloudinary:', req.file);
          return res.status(500).json({
            error: 'فشل في رفع الملف إلى Cloudinary',
            message: 'لم يتم إرجاع رابط الملف من Cloudinary'
          });
        }
        
        // رفع صورة جديدة - حذف القديمة أولاً
        if (currentService.image) {
          await deleteFromCloudinary(currentService.image);
          console.log('🗑️ Deleted old service image');
        }
        imagePath = fileUrl;
        console.log('📷 Uploaded new service image:', fileUrl);
      }
      
      const updateData = {
        name,
        description,
        categoryId,
        image: imagePath, // 🆕 تحديث الصورة
        price: price ? parseFloat(price) : undefined,
        duration
      };
      
      // إزالة القيم undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      const service = await Service.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('categoryId', 'name description image icon slug');

      if (!service) {
        return res.status(404).json({ error: 'الخدمة غير موجودة' });
      }

      console.log('Service updated successfully:', service.name);
      res.json(service);
    } catch (error) {
      console.error('Error updating service:', error);
      
      // حذف الصورة الجديدة في حالة الخطأ
      if (req.file && req.file.public_id) {
        try {
          await deleteFromCloudinary(req.file.public_id);
        } catch (deleteError) {
          console.error('Error deleting uploaded file:', deleteError);
        }
      }
      
      if (error.code === 11000) {
        return res.status(400).json({ error: 'اسم الخدمة موجود مسبقاً في هذا القسم' });
      }
      res.status(500).json({ error: error.message });
    }
  });
});

// 🔄 حذف خدمة - محدث لحذف الصورة
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log(`DELETE /api/services/${req.params.id}`);
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'الخدمة غير موجودة' });
    }

    // 🆕 حذف صورة الخدمة من Cloudinary
    if (service.image) {
      await deleteFromCloudinary(service.image);
      console.log('🗑️ Deleted service image from Cloudinary');
    }

    await service.deleteOne();

    console.log('Service deleted successfully:', service.name);
    res.json({ message: 'تم حذف الخدمة بنجاح' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: error.message });
  }
});

// إحصائيات الخدمات حسب القسم (مفتوح للجميع)
router.get('/stats/by-category', async (req, res) => {
  try {
    console.log('GET /api/services/stats/by-category');
    
    const stats = await Service.aggregate([
      { $match: { isActive: true } },
      { 
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
          services: { $push: { name: '$name', _id: '$_id' } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          categoryId: '$_id',
          categoryName: '$category.name',
          categoryIcon: '$category.icon',
          categorySlug: '$category.slug',
          servicesCount: '$count',
          services: '$services'
        }
      },
      { $sort: { servicesCount: -1 } }
    ]);
    
    console.log('Services stats by category:', stats.length);
    res.json(stats);
  } catch (error) {
    console.error('Error getting services stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// middleware لمعالجة أخطاء Multer على مستوى الراوتر
router.use(handleMulterError);

module.exports = router;