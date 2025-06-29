// Back-end/routes/services.js - Updated to work with Categories
const express = require('express');
const router = express.Router();
const Service = require('../Models/Service');
const Category = require('../Models/Category');
const authenticateToken = require('../Middleware/authMiddleware');

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
        $or: [
          { name: category }, 
          { slug: category },
          { _id: category }
        ] 
      });
      if (foundCategory) {
        query.categoryId = foundCategory._id;
        console.log('Filtering by category name:', category, '-> ID:', foundCategory._id);
      }
    }
    
    let servicesQuery = Service.find(query).sort({ createdAt: -1 });
    
    // populate معلومات القسم إذا طُلب ذلك
    if (populate === 'category' || populate === 'true') {
      servicesQuery = servicesQuery.populate('categoryId', 'name description icon slug');
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
    
    const service = await Service.findById(req.params.id).populate('categoryId', 'name description icon slug');
    
    if (!service) {
      return res.status(404).json({ error: 'الخدمة غير موجودة' });
    }
    
    console.log('Service found:', service.name);
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'معرف الخدمة غير صحيح' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// إضافة خدمة جديدة (محمي - للإدارة فقط)
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/services - Request body:', req.body);
    console.log('User role:', req.user?.role);
    
    // التحقق من صلاحيات المستخدم
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية لإضافة خدمات',
        message: 'هذه العملية متاحة للمديرين فقط'
      });
    }
    
    const { name, title, description, categoryId, price, duration } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !description) {
      return res.status(400).json({ 
        error: 'اسم الخدمة ووصفها مطلوبان' 
      });
    }
    
    // إذا لم يتم تمرير categoryId، استخدم قسم افتراضي أو أنشئ قسم عام
    let finalCategoryId = categoryId;
    
    if (!finalCategoryId) {
      // البحث عن قسم "خدمات عامة" أو إنشاؤه
      let generalCategory = await Category.findOne({ name: 'خدمات عامة' });
      
      if (!generalCategory) {
        generalCategory = new Category({
          name: 'خدمات عامة',
          description: 'خدمات طبية عامة',
          icon: 'FaStethoscope'
        });
        await generalCategory.save();
        console.log('Created general category:', generalCategory._id);
      }
      
      finalCategoryId = generalCategory._id;
    } else {
      // التحقق من وجود القسم المحدد
      const category = await Category.findById(finalCategoryId);
      if (!category) {
        return res.status(400).json({ error: 'القسم المحدد غير موجود' });
      }
    }
    
    // التحقق من عدم وجود خدمة بنفس الاسم في نفس القسم
    const existingService = await Service.findOne({ 
      name,
      categoryId: finalCategoryId,
      isActive: true
    });
    
    if (existingService) {
      return res.status(400).json({ 
        error: 'يوجد خدمة بهذا الاسم في نفس القسم مسبقاً' 
      });
    }

    const service = new Service({
      name,
      title: title || name,
      description,
      categoryId: finalCategoryId,
      price: price ? parseFloat(price) : undefined,
      duration
    });

    console.log('Creating service:', service);
    await service.save();
    
    // جلب الخدمة مع معلومات القسم
    const savedService = await Service.findById(service._id).populate('categoryId', 'name description icon slug');
    
    console.log('Service created successfully:', savedService.name);
    res.status(201).json(savedService);
  } catch (error) {
    console.error('Error creating service:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'اسم الخدمة موجود مسبقاً في هذا القسم' });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'خطأ في التحقق من البيانات',
        details: validationErrors
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// تحديث خدمة (محمي - للإدارة فقط)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`PUT /api/services/${req.params.id} - Request body:`, req.body);
    
    // التحقق من صلاحيات المستخدم
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية لتعديل الخدمات'
      });
    }
    
    const { name, title, description, categoryId, price, duration } = req.body;
    
    // إذا تم تغيير القسم، تحقق من وجوده
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'القسم المحدد غير موجود' });
      }
    }
    
    const updateData = {
      name,
      title: title || name,
      description,
      categoryId,
      price: price ? parseFloat(price) : undefined,
      duration,
      updatedAt: new Date()
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
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).populate('categoryId', 'name description icon slug');

    if (!service) {
      return res.status(404).json({ error: 'الخدمة غير موجودة' });
    }

    console.log('Service updated successfully:', service.name);
    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'معرف الخدمة غير صحيح' });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'اسم الخدمة موجود مسبقاً في هذا القسم' });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'خطأ في التحقق من البيانات',
        details: validationErrors
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// حذف خدمة (محمي - للإدارة فقط)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`DELETE /api/services/${req.params.id}`);
    
    // التحقق من صلاحيات المستخدم
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية لحذف الخدمات'
      });
    }
    
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'الخدمة غير موجودة' });
    }

    console.log('Service deleted successfully:', service.name);
    res.json({ 
      message: 'تم حذف الخدمة بنجاح',
      deletedService: {
        id: service._id,
        name: service.name
      }
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'معرف الخدمة غير صحيح' });
    }
    
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
    }).populate('categoryId', 'name description icon slug').limit(20);
    
    console.log(`Found ${services.length} services matching "${query}"`);
    res.json(services);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ error: error.message });
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