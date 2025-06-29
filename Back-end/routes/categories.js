// Back-end/routes/categories.js - Complete Fixed Version
const express = require('express');
const router = express.Router();
const Category = require('../Models/Category');
const authenticateToken = require('../Middleware/authMiddleware');

// إضافة middleware للـ CORS والـ logging
router.use((req, res, next) => {
  // إضافة headers للـ CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // تسجيل الطلبات
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  next();
});

// معالجة طلبات OPTIONS
router.options('*', (req, res) => {
  res.status(200).end();
});

// جلب جميع الأقسام (مفتوح للجميع)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/categories - Fetching categories...');
    
    // إضافة بيانات افتراضية في حالة عدم وجود أقسام
    let categories = await Category.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    
    console.log(`Found ${categories.length} categories from database`);
    
    // إذا لم توجد أقسام، إنشاء بيانات افتراضية
    if (categories.length === 0) {
      console.log('No categories found, creating default categories...');
      
      const defaultCategories = [
        {
          name: 'طب الأسنان',
          description: 'قسم طب الأسنان يقدم خدمات شاملة للعناية بصحة الفم والأسنان',
          icon: 'FaTooth',
          order: 1
        },
        {
          name: 'طب العيون',
          description: 'قسم طب العيون متخصص في تشخيص وعلاج جميع أمراض العين',
          icon: 'FaEye',
          order: 2
        },
        {
          name: 'طب الأطفال',
          description: 'قسم طب الأطفال يهتم بصحة الأطفال من الولادة حتى المراهقة',
          icon: 'FaBaby',
          order: 3
        },
        {
          name: 'الطب الباطني',
          description: 'قسم الطب الباطني يقدم الرعاية الطبية الشاملة للبالغين',
          icon: 'FaStethoscope',
          order: 4
        },
        {
          name: 'جراحة العظام',
          description: 'قسم جراحة العظام متخصص في علاج إصابات وأمراض الجهاز الحركي',
          icon: 'GiBrokenBone',
          order: 5
        },
        {
          name: 'النساء والولادة',
          description: 'قسم النساء والولادة يقدم رعاية شاملة للمرأة في جميع مراحل حياتها',
          icon: 'MdPregnantWoman',
          order: 6
        }
      ];

      try {
        // إنشاء الأقسام الافتراضية
        const createdCategories = await Category.insertMany(defaultCategories);
        categories = createdCategories;
        console.log(`Created ${categories.length} default categories`);
      } catch (insertError) {
        console.error('Error creating default categories:', insertError);
        // في حالة فشل الإنشاء، إرسال الأقسام الافتراضية كما هي
        categories = defaultCategories.map((cat, index) => ({
          _id: `default_${index}`,
          ...cat,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }));
        console.log('Sending default categories without saving to database');
      }
    }
    
    // التأكد من أن كل قسم له البيانات المطلوبة
    const processedCategories = categories.map(category => {
      return {
        _id: category._id,
        name: category.name || category.title || 'قسم طبي',
        title: category.title || category.name || 'قسم طبي',
        description: category.description || 'وصف القسم الطبي',
        icon: category.icon || 'FaStethoscope',
        slug: category.slug || category.name?.replace(/\s+/g, '-').toLowerCase(),
        isActive: category.isActive !== false,
        order: category.order || 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };
    });
    
    console.log(`Sending ${processedCategories.length} processed categories`);
    
    // إضافة headers إضافية للاستجابة
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Total-Count': processedCategories.length.toString()
    });
    
    res.status(200).json(processedCategories);
    
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    console.error('Error stack:', error.stack);
    
    // إرسال رد خطأ مفصل
    res.status(500).json({ 
      error: 'خطأ في جلب الأقسام',
      message: error.message,
      timestamp: new Date().toISOString(),
      endpoint: '/api/categories'
    });
  }
});

// جلب قسم واحد (مفتوح للجميع)
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/categories/${req.params.id} - Fetching single category...`);
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      console.log(`Category with id ${req.params.id} not found`);
      return res.status(404).json({ 
        error: 'القسم غير موجود',
        message: `لم يتم العثور على قسم بالمعرف ${req.params.id}`,
        id: req.params.id
      });
    }
    
    console.log(`Found category: ${category.name}`);
    
    // معالجة البيانات قبل الإرسال
    const processedCategory = {
      _id: category._id,
      name: category.name || category.title || 'قسم طبي',
      title: category.title || category.name || 'قسم طبي',
      description: category.description || 'وصف القسم الطبي',
      icon: category.icon || 'FaStethoscope',
      slug: category.slug || category.name?.replace(/\s+/g, '-').toLowerCase(),
      isActive: category.isActive !== false,
      order: category.order || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
    
    res.status(200).json(processedCategory);
    
  } catch (error) {
    console.error('Error fetching single category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'معرف القسم غير صحيح',
        message: 'تنسيق معرف القسم غير صحيح',
        id: req.params.id
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في جلب القسم',
      message: error.message,
      timestamp: new Date().toISOString(),
      id: req.params.id
    });
  }
});

// إضافة قسم جديد (محمي - للإدارة فقط)
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/categories - Creating new category');
    console.log('Request body:', req.body);
    console.log('User role:', req.user?.role);
    
    // التحقق من صلاحيات المستخدم
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية لإضافة أقسام',
        message: 'هذه العملية متاحة للمديرين فقط'
      });
    }
    
    const { name, title, description, icon, order } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'اسم القسم مطلوب',
        message: 'يجب إدخال اسم صحيح للقسم'
      });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ 
        error: 'وصف القسم مطلوب',
        message: 'يجب إدخال وصف للقسم'
      });
    }
    
    // التحقق من عدم وجود قسم بنفس الاسم
    const existingCategory = await Category.findOne({ 
      $or: [
        { name: name.trim() }, 
        { title: name.trim() },
        { name: title?.trim() }
      ]
    });
    
    if (existingCategory) {
      return res.status(400).json({ 
        error: 'يوجد قسم بهذا الاسم مسبقاً',
        message: `القسم "${existingCategory.name}" موجود بالفعل`,
        existingCategory: {
          id: existingCategory._id,
          name: existingCategory.name
        }
      });
    }

    // إنشاء القسم الجديد
    const categoryData = {
      name: name.trim(),
      title: (title || name).trim(),
      description: description.trim(),
      icon: icon || 'FaStethoscope',
      order: order || 0,
      metadata: {
        createdBy: req.user?.id || req.user?.username
      }
    };

    console.log('Creating category with data:', categoryData);
    
    const category = new Category(categoryData);
    await category.save();
    
    console.log('Category created successfully:', category);
    
    // معالجة البيانات قبل الإرسال
    const responseCategory = {
      _id: category._id,
      name: category.name,
      title: category.title,
      description: category.description,
      icon: category.icon,
      slug: category.slug,
      isActive: category.isActive,
      order: category.order,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
    
    res.status(201).json(responseCategory);
    
  } catch (error) {
    console.error('Error creating category:', error);
    console.error('Error stack:', error.stack);
    
    if (error.code === 11000) {
      // خطأ التكرار
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'name' ? 'اسم القسم' : field === 'title' ? 'عنوان القسم' : 'الحقل';
      return res.status(400).json({ 
        error: `${fieldName} موجود مسبقاً`,
        message: `يوجد قسم آخر بنفس ${fieldName}`,
        field: field
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'خطأ في التحقق من البيانات',
        message: validationErrors.join(', '),
        validationErrors
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في إنشاء القسم',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// تحديث قسم (محمي - للإدارة فقط)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`PUT /api/categories/${req.params.id} - Updating category`);
    console.log('Request body:', req.body);
    console.log('User role:', req.user?.role);
    
    // التحقق من صلاحيات المستخدم
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية لتعديل الأقسام',
        message: 'هذه العملية متاحة للمديرين فقط'
      });
    }
    
    const { name, title, description, icon, order } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'اسم القسم مطلوب',
        message: 'يجب إدخال اسم صحيح للقسم'
      });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ 
        error: 'وصف القسم مطلوب',
        message: 'يجب إدخال وصف للقسم'
      });
    }
    
    // التحقق من عدم وجود قسم آخر بنفس الاسم
    const existingCategory = await Category.findOne({ 
      $and: [
        { _id: { $ne: req.params.id } }, // استثناء القسم الحالي
        {
          $or: [
            { name: name.trim() }, 
            { title: name.trim() },
            { name: title?.trim() }
          ]
        }
      ]
    });
    
    if (existingCategory) {
      return res.status(400).json({ 
        error: 'يوجد قسم آخر بهذا الاسم',
        message: `القسم "${existingCategory.name}" موجود بالفعل`,
        existingCategory: {
          id: existingCategory._id,
          name: existingCategory.name
        }
      });
    }
    
    const updateData = {
      name: name.trim(),
      title: (title || name).trim(),
      description: description.trim(),
      icon: icon || 'FaStethoscope',
      order: order || 0,
      updatedAt: new Date(),
      'metadata.updatedBy': req.user?.id || req.user?.username
    };
    
    console.log('Updating category with data:', updateData);
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query' // لضمان تشغيل الـ middleware
      }
    );

    if (!category) {
      return res.status(404).json({ 
        error: 'القسم غير موجود',
        message: `لم يتم العثور على قسم بالمعرف ${req.params.id}`,
        id: req.params.id
      });
    }

    console.log('Category updated successfully:', category);
    
    // معالجة البيانات قبل الإرسال
    const responseCategory = {
      _id: category._id,
      name: category.name,
      title: category.title,
      description: category.description,
      icon: category.icon,
      slug: category.slug,
      isActive: category.isActive,
      order: category.order,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
    
    res.status(200).json(responseCategory);
    
  } catch (error) {
    console.error('Error updating category:', error);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'معرف القسم غير صحيح',
        message: 'تنسيق معرف القسم غير صحيح',
        id: req.params.id
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'name' ? 'اسم القسم' : field === 'title' ? 'عنوان القسم' : 'الحقل';
      return res.status(400).json({ 
        error: `${fieldName} موجود مسبقاً`,
        message: `يوجد قسم آخر بنفس ${fieldName}`,
        field: field
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'خطأ في التحقق من البيانات',
        message: validationErrors.join(', '),
        validationErrors
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في تحديث القسم',
      message: error.message,
      timestamp: new Date().toISOString(),
      id: req.params.id
    });
  }
});

// حذف قسم (محمي - للإدارة فقط)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`DELETE /api/categories/${req.params.id} - Deleting category`);
    console.log('User role:', req.user?.role);
    
    // التحقق من صلاحيات المستخدم
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية لحذف الأقسام',
        message: 'هذه العملية متاحة للمديرين فقط'
      });
    }
    
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'القسم غير موجود',
        message: `لم يتم العثور على قسم بالمعرف ${req.params.id}`,
        id: req.params.id
      });
    }

    // حذف جميع الخدمات المرتبطة بهذا القسم
    let deletedServicesCount = 0;
    try {
      const Service = require('../Models/Service');
      const deletedServices = await Service.deleteMany({ categoryId: req.params.id });
      deletedServicesCount = deletedServices.deletedCount;
      console.log(`Deleted ${deletedServicesCount} services for category ${req.params.id}`);
    } catch (serviceError) {
      console.log('No services to delete or Service model not found:', serviceError.message);
    }

    console.log('Category deleted successfully:', category.name);
    
    res.status(200).json({ 
      message: 'تم حذف القسم والخدمات المرتبطة به بنجاح',
      deletedCategory: {
        id: category._id,
        name: category.name
      },
      deletedServicesCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error deleting category:', error);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'معرف القسم غير صحيح',
        message: 'تنسيق معرف القسم غير صحيح',
        id: req.params.id
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في حذف القسم',
      message: error.message,
      timestamp: new Date().toISOString(),
      id: req.params.id
    });
  }
});

// إحصائيات الأقسام (مفتوح للجميع)
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('GET /api/categories/stats/summary');
    
    const totalCategories = await Category.countDocuments({ isActive: true });
    const categoriesWithServices = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'services'
        }
      },
      {
        $project: {
          name: 1,
          servicesCount: { $size: '$services' }
        }
      },
      { $sort: { servicesCount: -1 } }
    ]);
    
    const stats = {
      totalCategories,
      categoriesWithServices: categoriesWithServices.length,
      topCategories: categoriesWithServices.slice(0, 5),
      timestamp: new Date().toISOString()
    };
    
    console.log('Categories stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error getting categories stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// إضافة endpoint للتحقق من صحة الاتصال
router.get('/health/check', (req, res) => {
  console.log('Categories health check requested');
  res.status(200).json({
    status: 'OK',
    message: 'Categories API is working',
    timestamp: new Date().toISOString(),
    endpoint: '/api/categories'
  });
});

module.exports = router;