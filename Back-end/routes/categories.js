// Back-end/routes/categories.js - مُصحح ومُحسن
const express = require('express');
const router = express.Router();
const Category = require('../Models/Category');
const authenticateToken = require('../Middleware/authMiddleware');
const { requireAdmin } = require('../Middleware/authMiddleware');

// إضافة middleware للـ CORS والـ logging
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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
    
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    console.log(`Found ${categories.length} categories from database`);
    
    // إذا لم توجد أقسام، إنشاء بيانات افتراضية
    if (categories.length === 0) {
      console.log('No categories found, creating default categories...');
      
      const defaultCategories = [
        {
          name: 'طب الأسنان',
          title: 'طب الأسنان',
          description: 'قسم طب الأسنان يقدم خدمات شاملة للعناية بصحة الفم والأسنان',
          icon: 'FaTooth',
          order: 1,
          isActive: true
        },
        {
          name: 'طب العيون',
          title: 'طب العيون',
          description: 'قسم طب العيون متخصص في تشخيص وعلاج جميع أمراض العين',
          icon: 'FaEye',
          order: 2,
          isActive: true
        },
        {
          name: 'طب الأطفال',
          title: 'طب الأطفال',
          description: 'قسم طب الأطفال يهتم بصحة الأطفال من الولادة حتى المراهقة',
          icon: 'FaBaby',
          order: 3,
          isActive: true
        },
        {
          name: 'الطب الباطني',
          title: 'الطب الباطني',
          description: 'قسم الطب الباطني يقدم الرعاية الطبية الشاملة للبالغين',
          icon: 'FaStethoscope',
          order: 4,
          isActive: true
        },
        {
          name: 'جراحة العظام',
          title: 'جراحة العظام',
          description: 'قسم جراحة العظام متخصص في علاج إصابات وأمراض الجهاز الحركي',
          icon: 'GiBrokenBone',
          order: 5,
          isActive: true
        },
        {
          name: 'النساء والولادة',
          title: 'النساء والولادة',
          description: 'قسم النساء والولادة يقدم رعاية شاملة لصحة المرأة والحمل',
          icon: 'MdPregnantWoman',
          order: 6,
          isActive: true
        }
      ];

      try {
        const createdCategories = await Category.insertMany(defaultCategories);
        console.log(`Created ${createdCategories.length} default categories`);
        
        return res.status(200).json({
          success: true,
          data: createdCategories.map(cat => ({
            _id: cat._id,
            name: cat.name,
            title: cat.title || cat.name,
            description: cat.description,
            icon: cat.icon,
            slug: cat.slug,
            isActive: cat.isActive,
            order: cat.order,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt
          }))
        });
        
      } catch (insertError) {
        console.error('Error creating default categories:', insertError);
        return res.status(500).json({
          success: false,
          message: 'خطأ في إنشاء الأقسام الافتراضية',
          error: insertError.message
        });
      }
    }
    
    // معالجة البيانات قبل الإرسال
    const processedCategories = categories.map(category => ({
      _id: category._id,
      name: category.name || category.title || 'قسم طبي',
      title: category.title || category.name || 'قسم طبي',
      description: category.description || 'وصف القسم الطبي',
      icon: category.icon || 'FaStethoscope',
      slug: category.slug || (category.name?.replace(/\s+/g, '-').toLowerCase()),
      isActive: category.isActive !== false,
      order: category.order || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));
    
    console.log(`Sending ${processedCategories.length} processed categories`);
    res.status(200).json({
      success: true,
      data: processedCategories
    });
    
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في جلب الأقسام',
      error: error.message
    });
  }
});

// جلب قسم واحد (مفتوح للجميع)
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/categories/${req.params.id}`);
    
    const category = await Category.findById(req.params.id).lean();
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'القسم غير موجود',
        error: `لم يتم العثور على قسم بالمعرف ${req.params.id}`
      });
    }
    
    const processedCategory = {
      _id: category._id,
      name: category.name || category.title || 'قسم طبي',
      title: category.title || category.name || 'قسم طبي',
      description: category.description || 'وصف القسم الطبي',
      icon: category.icon || 'FaStethoscope',
      slug: category.slug || (category.name?.replace(/\s+/g, '-').toLowerCase()),
      isActive: category.isActive !== false,
      order: category.order || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: processedCategory
    });
    
  } catch (error) {
    console.error('Error fetching single category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'معرف القسم غير صحيح'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'خطأ في جلب القسم',
      error: error.message
    });
  }
});

// إضافة قسم جديد (محمي - للإدارة فقط)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('POST /api/categories - Creating new category');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { name, title, description, icon, order } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !name.trim()) {
      console.log('❌ Missing name field');
      return res.status(400).json({ 
        success: false,
        message: 'اسم القسم مطلوب',
        error: 'يجب إدخال اسم صحيح للقسم'
      });
    }
    
    if (!description || !description.trim()) {
      console.log('❌ Missing description field');
      return res.status(400).json({ 
        success: false,
        message: 'وصف القسم مطلوب',
        error: 'يجب إدخال وصف للقسم'
      });
    }
    
    // التحقق من عدم وجود قسم بنفس الاسم
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    
    if (existingCategory) {
      console.log('❌ Category already exists:', existingCategory.name);
      return res.status(400).json({ 
        success: false,
        message: 'يوجد قسم بهذا الاسم مسبقاً',
        error: `القسم "${existingCategory.name}" موجود بالفعل`
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
    const savedCategory = await category.save();
    
    console.log('✅ Category created successfully:', savedCategory._id);
    
    // معالجة البيانات قبل الإرسال
    const responseCategory = {
      _id: savedCategory._id,
      name: savedCategory.name,
      title: savedCategory.title,
      description: savedCategory.description,
      icon: savedCategory.icon,
      slug: savedCategory.slug,
      isActive: savedCategory.isActive,
      order: savedCategory.order,
      createdAt: savedCategory.createdAt,
      updatedAt: savedCategory.updatedAt
    };
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء القسم بنجاح',
      data: responseCategory
    });
    
  } catch (error) {
    console.error('❌ Error creating category:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'name' ? 'اسم القسم' : 'الحقل';
      return res.status(400).json({ 
        success: false,
        message: `${fieldName} موجود مسبقاً`,
        error: `يوجد قسم آخر بنفس ${fieldName}`
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'خطأ في التحقق من البيانات',
        error: validationErrors.join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'خطأ في إنشاء القسم',
      error: error.message
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
        success: false,
        message: 'اسم القسم مطلوب'
      });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'وصف القسم مطلوب'
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
        success: false,
        message: 'يوجد قسم آخر بهذا الاسم'
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
        success: false,
        message: 'القسم غير موجود'
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
      success: true,
      message: 'تم تحديث القسم بنجاح',
      data: responseCategory
    });
    
  } catch (error) {
    console.error('❌ Error updating category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'معرف القسم غير صحيح'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'اسم القسم موجود مسبقاً'
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'خطأ في التحقق من البيانات',
        error: validationErrors.join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'خطأ في تحديث القسم',
      error: error.message
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
        success: false,
        message: 'القسم غير موجود'
      });
    }

    console.log('✅ Category deleted successfully');
    
    res.status(200).json({ 
      success: true,
      message: 'تم حذف القسم بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'معرف القسم غير صحيح'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'خطأ في حذف القسم',
      error: error.message
    });
  }
});

module.exports = router;