// Back-end/routes/categories.js - مُحدث لحل مشاكل الإضافة
const express = require('express');
const router = express.Router();
const Category = require('../Models/Category');
// 🔧 تصحيح الاستيراد
const authenticateToken = require('../Middleware/authMiddleware');
const { requireAdmin } = require('../Middleware/authMiddleware');

// إضافة middleware للـ CORS والـ logging
router.use((req, res, next) => {
  // إضافة headers للـ CORS
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // تسجيل الطلبات
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
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
        }
      ];

      try {
        const createdCategories = await Category.insertMany(defaultCategories);
        categories = createdCategories;
        console.log(`Created ${categories.length} default categories`);
      } catch (insertError) {
        console.error('Error creating default categories:', insertError);
        categories = defaultCategories.map((cat, index) => ({
          _id: `default_${index}`,
          ...cat,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }));
      }
    }
    
    // معالجة البيانات قبل الإرسال
    const processedCategories = categories.map(category => ({
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
    }));
    
    console.log(`Sending ${processedCategories.length} processed categories`);
    
    res.status(200).json(processedCategories);
    
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    res.status(500).json({ 
      error: 'خطأ في جلب الأقسام',
      message: error.message,
      success: false
    });
  }
});

// جلب قسم واحد (مفتوح للجميع)
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/categories/${req.params.id}`);
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'القسم غير موجود',
        message: `لم يتم العثور على قسم بالمعرف ${req.params.id}`,
        success: false
      });
    }
    
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
        success: false
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في جلب القسم',
      message: error.message,
      success: false
    });
  }
});

// إضافة قسم جديد (محمي - للإدارة فقط)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('POST /api/categories - Creating new category');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User info:', req.user);
    
    const { name, title, description, icon, order } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !name.trim()) {
      console.log('❌ Missing name field');
      return res.status(400).json({ 
        error: 'اسم القسم مطلوب',
        message: 'يجب إدخال اسم صحيح للقسم',
        success: false
      });
    }
    
    if (!description || !description.trim()) {
      console.log('❌ Missing description field');
      return res.status(400).json({ 
        error: 'وصف القسم مطلوب',
        message: 'يجب إدخال وصف للقسم',
        success: false
      });
    }
    
    // التحقق من عدم وجود قسم بنفس الاسم
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    
    if (existingCategory) {
      console.log('❌ Category already exists:', existingCategory.name);
      return res.status(400).json({ 
        error: 'يوجد قسم بهذا الاسم مسبقاً',
        message: `القسم "${existingCategory.name}" موجود بالفعل`,
        success: false
      });
    }

    // إنشاء القسم الجديد
    const categoryData = {
      name: name.trim(),
      title: (title || name).trim(),
      description: description.trim(),
      icon: icon || 'FaStethoscope',
      order: order || 0,
      isActive: true,
      metadata: {
        createdBy: req.user?.id || req.user?.username
      }
    };

    console.log('Creating category with data:', JSON.stringify(categoryData, null, 2));
    
    const category = new Category(categoryData);
    await category.save();
    
    console.log('✅ Category created successfully:', category._id);
    
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
    
    res.status(201).json({
      ...responseCategory,
      success: true,
      message: 'تم إنشاء القسم بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Error creating category:', error);
    console.error('Error stack:', error.stack);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const fieldName = field === 'name' ? 'اسم القسم' : 'الحقل';
      return res.status(400).json({ 
        error: `${fieldName} موجود مسبقاً`,
        message: `يوجد قسم آخر بنفس ${fieldName}`,
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
      error: 'خطأ في إنشاء القسم',
      message: error.message,
      success: false
    });
  }
});

// تحديث قسم (محمي - للإدارة فقط)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log(`PUT /api/categories/${req.params.id}`);
    console.log('Request body:', req.body);
    
    const { name, title, description, icon, order } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'اسم القسم مطلوب',
        success: false
      });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ 
        error: 'وصف القسم مطلوب',
        success: false
      });
    }
    
    // التحقق من عدم وجود قسم آخر بنفس الاسم
    const existingCategory = await Category.findOne({ 
      $and: [
        { _id: { $ne: req.params.id } },
        { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }
      ]
    });
    
    if (existingCategory) {
      return res.status(400).json({ 
        error: 'يوجد قسم آخر بهذا الاسم',
        success: false
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
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!category) {
      return res.status(404).json({ 
        error: 'القسم غير موجود',
        success: false
      });
    }

    console.log('✅ Category updated successfully');
    
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
    
    res.status(200).json({
      ...responseCategory,
      success: true,
      message: 'تم تحديث القسم بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Error updating category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'معرف القسم غير صحيح',
        success: false
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'اسم القسم موجود مسبقاً',
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
      error: 'خطأ في تحديث القسم',
      message: error.message,
      success: false
    });
  }
});

// حذف قسم (محمي - للإدارة فقط)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log(`DELETE /api/categories/${req.params.id}`);
    
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'القسم غير موجود',
        success: false
      });
    }

    console.log('✅ Category deleted successfully');
    
    res.status(200).json({ 
      message: 'تم حذف القسم بنجاح',
      success: true
    });
    
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'معرف القسم غير صحيح',
        success: false
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في حذف القسم',
      message: error.message,
      success: false
    });
  }
});

module.exports = router;