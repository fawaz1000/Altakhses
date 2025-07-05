// Back-end/routes/services.js - مُصحح ومُحسن
const express = require('express');
const router = express.Router();
const Service = require('../Models/Service');
const Category = require('../Models/Category');
const authenticateToken = require('../Middleware/authMiddleware');
const { requireAdmin } = require('../Middleware/authMiddleware');

// إضافة middleware للـ CORS والـ logging
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.originalUrl);
  next();
});

// معالجة طلبات OPTIONS
router.options('*', (req, res) => {
  res.status(200).end();
});

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
    if (category && !categoryId) {
      try {
        const foundCategory = await Category.findOne({ 
          $or: [
            { name: { $regex: new RegExp(category, 'i') } }, 
            { slug: category },
            { _id: category }
          ] 
        });
        if (foundCategory) {
          query.categoryId = foundCategory._id;
          console.log('Filtering by category name:', category, '-> ID:', foundCategory._id);
        }
      } catch (error) {
        console.error('Error finding category:', error);
      }
    }
    
    let servicesQuery = Service.find(query).sort({ createdAt: -1 });
    
    // populate معلومات القسم إذا طُلب ذلك
    if (populate === 'category' || populate === 'true') {
      servicesQuery = servicesQuery.populate('categoryId', 'name description icon slug');
    }
    
    const services = await servicesQuery.lean();
    console.log('Found ' + services.length + ' services');
    
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ 
      error: 'خطأ في جلب الخدمات',
      message: error.message,
      success: false
    });
  }
});

// جلب خدمة واحدة (مفتوح للجميع)
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /api/services/' + req.params.id);
    
    const service = await Service.findById(req.params.id)
      .populate('categoryId', 'name description icon slug')
      .lean();
    
    if (!service) {
      return res.status(404).json({ 
        error: 'الخدمة غير موجودة',
        success: false
      });
    }
    
    console.log('Service found:', service.name);
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'معرف الخدمة غير صحيح',
        success: false
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في جلب الخدمة',
      message: error.message,
      success: false
    });
  }
});

// إضافة خدمة جديدة (محمي - للإدارة فقط)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('POST /api/services - Creating new service');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { name, title, description, categoryId, price, duration } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !name.trim()) {
      console.log('❌ Missing name field');
      return res.status(400).json({ 
        error: 'اسم الخدمة مطلوب',
        message: 'يجب إدخال اسم صحيح للخدمة',
        success: false
      });
    }

    if (!description || !description.trim()) {
      console.log('❌ Missing description field');
      return res.status(400).json({ 
        error: 'وصف الخدمة مطلوب',
        message: 'يجب إدخال وصف للخدمة',
        success: false
      });
    }
    
    // التعامل مع categoryId
    let finalCategoryId = categoryId;
    
    if (!finalCategoryId) {
      console.log('No categoryId provided, searching for general category...');
      // البحث عن قسم "خدمات عامة" أو إنشاؤه
      let generalCategory = await Category.findOne({ 
        $or: [
          { name: { $regex: /خدمات عامة/i } },
          { name: { $regex: /عام/i } }
        ]
      });
      
      if (!generalCategory) {
        console.log('Creating general category...');
        generalCategory = new Category({
          name: 'خدمات عامة',
          description: 'خدمات طبية عامة ومتنوعة',
          icon: 'FaStethoscope',
          order: 999,
          isActive: true
        });
        await generalCategory.save();
        console.log('✅ General category created:', generalCategory._id);
      }
      
      finalCategoryId = generalCategory._id;
    } else {
      // التحقق من وجود القسم المحدد
      const category = await Category.findById(finalCategoryId);
      if (!category) {
        console.log('❌ Category not found:', finalCategoryId);
        return res.status(400).json({ 
          error: 'القسم المحدد غير موجود',
          message: 'يرجى اختيار قسم صحيح',
          success: false
        });
      }
      console.log('✅ Category found:', category.name);
    }
    
    // التحقق من عدم وجود خدمة بنفس الاسم في نفس القسم
    const existingService = await Service.findOne({ 
      name: { $regex: new RegExp('^' + name.trim() + '$', 'i') },
      categoryId: finalCategoryId,
      isActive: true
    });
    
    if (existingService) {
      console.log('❌ Service already exists:', existingService.name);
      return res.status(400).json({ 
        error: 'يوجد خدمة بهذا الاسم في نفس القسم مسبقاً',
        success: false
      });
    }

    // إنشاء الخدمة الجديدة
    const serviceData = {
      name: name.trim(),
      title: (title || name).trim(),
      description: description.trim(),
      categoryId: finalCategoryId,
      price: price ? parseFloat(price) : undefined,
      duration: duration && duration.trim() ? duration.trim() : undefined,
      isActive: true,
      metadata: {
        createdBy: req.user && req.user.id ? req.user.id : req.user.username
      }
    };

    console.log('Creating service with data:', JSON.stringify(serviceData, null, 2));
    
    const service = new Service(serviceData);
    const savedService = await service.save();
    
    console.log('✅ Service created successfully:', savedService._id);
    
    // جلب الخدمة مع معلومات القسم
    const populatedService = await Service.findById(savedService._id)
      .populate('categoryId', 'name description icon slug');
    
    res.status(201).json({
      success: true,
      data: populatedService,
      message: 'تم إنشاء الخدمة بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Error creating service:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'اسم الخدمة موجود مسبقاً في هذا القسم',
        success: false
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'خطأ في التحقق من البيانات',
        message: validationErrors.join(', '),
        success: false
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في إنشاء الخدمة',
      message: error.message,
      success: false
    });
  }
});

// تحديث خدمة (محمي - للإدارة فقط)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('PUT /api/services/' + req.params.id);
    console.log('Request body:', req.body);
    
    const { name, title, description, categoryId, price, duration } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'اسم الخدمة مطلوب',
        success: false
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ 
        error: 'وصف الخدمة مطلوب',
        success: false
      });
    }
    
    // إذا تم تغيير القسم، تحقق من وجوده
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ 
          error: 'القسم المحدد غير موجود',
          success: false
        });
      }
    }
    
    // التحقق من عدم وجود خدمة أخرى بنفس الاسم في نفس القسم
    const existingService = await Service.findOne({ 
      $and: [
        { _id: { $ne: req.params.id } },
        { name: { $regex: new RegExp('^' + name.trim() + '$', 'i') } },
        { categoryId: categoryId || undefined }
      ]
    });
    
    if (existingService && categoryId) {
      return res.status(400).json({ 
        error: 'يوجد خدمة أخرى بهذا الاسم في نفس القسم',
        success: false
      });
    }
    
    const updateData = {
      name: name.trim(),
      title: (title || name).trim(),
      description: description.trim(),
      price: price ? parseFloat(price) : undefined,
      duration: duration && duration.trim() ? duration.trim() : undefined,
      updatedAt: new Date(),
      'metadata.updatedBy': req.user && req.user.id ? req.user.id : req.user.username
    };

    // إضافة categoryId فقط إذا تم تمريره
    if (categoryId) {
      updateData.categoryId = categoryId;
    }
    
    // إزالة القيم undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    ).populate('categoryId', 'name description icon slug');

    if (!service) {
      return res.status(404).json({ 
        error: 'الخدمة غير موجودة',
        success: false
      });
    }

    console.log('✅ Service updated successfully');
    
    res.json({
      success: true,
      data: service,
      message: 'تم تحديث الخدمة بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Error updating service:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'معرف الخدمة غير صحيح',
        success: false
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'اسم الخدمة موجود مسبقاً في هذا القسم',
        success: false
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'خطأ في التحقق من البيانات',
        message: validationErrors.join(', '),
        success: false
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في تحديث الخدمة',
      message: error.message,
      success: false
    });
  }
});

// حذف خدمة (محمي - للإدارة فقط)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('DELETE /api/services/' + req.params.id);
    
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({ 
        error: 'الخدمة غير موجودة',
        success: false
      });
    }

    console.log('✅ Service deleted successfully');
    
    res.json({ 
      success: true,
      message: 'تم حذف الخدمة بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Error deleting service:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'معرف الخدمة غير صحيح',
        success: false
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في حذف الخدمة',
      message: error.message,
      success: false
    });
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
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          categoryId: '$_id',
          categoryName: { $ifNull: ['$category.name', 'خدمات عامة'] },
          categoryIcon: { $ifNull: ['$category.icon', 'FaStethoscope'] },
          categorySlug: { $ifNull: ['$category.slug', 'general'] },
          servicesCount: '$count',
          services: '$services'
        }
      },
      { $sort: { servicesCount: -1 } }
    ]);
    
    console.log('Services stats by category:', stats.length);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting services stats:', error);
    res.status(500).json({ 
      error: 'خطأ في جلب إحصائيات الخدمات',
      message: error.message,
      success: false
    });
  }
});

// البحث في الخدمات (مفتوح للجميع)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    console.log('Searching services for:', query);
    
    const services = await Service.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).populate('categoryId', 'name description icon slug').limit(20).lean();
    
    console.log('Found ' + services.length + ' services matching "' + query + '"');
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ 
      error: 'خطأ في البحث',
      message: error.message,
      success: false
    });
  }
});

// إضافة endpoint للتحقق من صحة الاتصال
router.get('/health/check', (req, res) => {
  console.log('Services health check requested');
  res.status(200).json({
    status: 'OK',
    message: 'Services API is working',
    timestamp: new Date().toISOString(),
    endpoint: '/api/services'
  });
});

module.exports = router;