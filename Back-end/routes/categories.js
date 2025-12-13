// Back-end/routes/categories.js - مُصحح مع معالجة أفضل للأخطاء
const express = require('express');
const router = express.Router();
const Category = require('../Models/Category');
const authenticateToken = require('../Middleware/authMiddleware');

// استيراد Cloudinary مع معالجة الأخطاء
const { uploadCategory, deleteFromCloudinary, handleMulterError } = require('../config/cloudinary');

// إضافة middleware للـ CORS والـ logging
router.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://localhost:5050'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.method !== 'GET') {
    console.log('Request headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Bearer ***' : 'None'
    });
  }
  
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
    
    if (categories.length === 0) {
      console.log('No categories found, creating default categories...');
      
      const defaultCategories = [
        {
          name: 'طب الأسنان',
          description: 'قسم طب الأسنان يقدم خدمات شاملة للعناية بصحة الفم والأسنان',
          image: null
        },
        {
          name: 'طب العيون',
          description: 'قسم طب العيون متخصص في تشخيص وعلاج جميع أمراض العين',
          image: null
        },
        {
          name: 'طب الأطفال',
          description: 'قسم طب الأطفال يهتم بصحة الأطفال من الولادة حتى المراهقة',
          image: null
        }
      ];

      try {
        const createdCategories = await Category.insertMany(defaultCategories);
        categories = createdCategories;
        console.log(`Created ${categories.length} default categories`);
      } catch (insertError) {
        console.error('Error creating default categories:', insertError);
        categories = [];
      }
    }
    
    const processedCategories = categories.map(category => ({
      _id: category._id,
      name: category.name || 'قسم طبي',
      title: category.title || category.name || 'قسم طبي',
      description: category.description || 'وصف القسم الطبي',
      image: category.image || null,
      slug: category.slug || category.name?.replace(/\s+/g, '-').toLowerCase(),
      isActive: category.isActive !== false,
      order: category.order || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));
    
    res.status(200).json(processedCategories);
    
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    res.status(500).json({ 
      error: 'خطأ في جلب الأقسام',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// جلب قسم واحد (مفتوح للجميع)
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/categories/${req.params.id}`);
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      console.log(`Category with id ${req.params.id} not found`);
      return res.status(404).json({ 
        error: 'القسم غير موجود',
        message: `لم يتم العثور على قسم بالمعرف ${req.params.id}`
      });
    }
    
    console.log(`Found category: ${category.name}`);
    
    const processedCategory = {
      _id: category._id,
      name: category.name || 'قسم طبي',
      title: category.title || category.name || 'قسم طبي',
      description: category.description || 'وصف القسم الطبي',
      image: category.image || null,
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
        message: 'تنسيق معرف القسم غير صحيح'
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في جلب القسم',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// إضافة قسم جديد - مع معالجة محسنة للأخطاء
router.post('/', authenticateToken, (req, res) => {
  console.log('POST /api/categories - Starting category creation');
  console.log('User role:', req.user?.role);
  
  // التحقق من الصلاحيات
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'ليس لديك صلاحية لإضافة أقسام',
      message: 'هذه العملية متاحة للمديرين فقط'
    });
  }

  // استخدام uploadCategory مع معالجة الأخطاء
  uploadCategory.single('image')(req, res, async (err) => {
    // معالجة أخطاء Multer/Cloudinary
    if (err) {
      console.error('❌ Upload error:', err);
      
      if (err.message && err.message.includes('نوع الملف غير مدعوم')) {
        return res.status(400).json({
          error: 'نوع الملف غير مدعوم',
          message: 'يُرجى رفع صورة بصيغة JPG، PNG، أو WebP'
        });
      }
      
      return res.status(400).json({
        error: 'خطأ في رفع الصورة',
        message: err.message || 'حدث خطأ أثناء رفع الصورة'
      });
    }

    try {
      console.log('Request body after upload:', req.body);
      console.log('Uploaded file:', req.file);
      
      const { name, title, description } = req.body;
      
      // التحقق من البيانات المطلوبة
      if (!name || !name.trim()) {
        // حذف الصورة المرفوعة إذا كان هناك خطأ
        if (req.file) {
          await deleteFromCloudinary(req.file.path);
        }
        return res.status(400).json({ 
          error: 'اسم القسم مطلوب',
          message: 'يجب إدخال اسم صحيح للقسم'
        });
      }
      
      if (!description || !description.trim()) {
        if (req.file) {
          await deleteFromCloudinary(req.file.path);
        }
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
        if (req.file) {
          await deleteFromCloudinary(req.file.path);
        }
        return res.status(400).json({ 
          error: 'يوجد قسم بهذا الاسم مسبقاً',
          message: `القسم "${existingCategory.name}" موجود بالفعل`
        });
      }

      // إنشاء بيانات القسم
      const categoryData = {
        name: name.trim(),
        title: (title || name).trim(),
        description: description.trim(),
        image: req.file ? req.file.path : null
      };

      console.log('Creating category with data:', categoryData);
      
      // حفظ القسم في قاعدة البيانات
      const category = new Category(categoryData);
      await category.save();
      
      console.log('✅ Category created successfully:', category._id);
      
      // إرجاع البيانات المعالجة
      const responseCategory = {
        _id: category._id,
        name: category.name,
        title: category.title,
        description: category.description,
        image: category.image,
        slug: category.slug,
        isActive: category.isActive,
        order: category.order,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };
      
      res.status(201).json(responseCategory);
      
    } catch (error) {
      console.error('❌ Error creating category:', error);
      
      // حذف الصورة المرفوعة في حالة الخطأ
      if (req.file) {
        try {
          await deleteFromCloudinary(req.file.path);
        } catch (deleteError) {
          console.error('Error deleting uploaded file:', deleteError);
        }
      }
      
      // معالجة أخطاء قاعدة البيانات
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        const fieldName = field === 'name' ? 'اسم القسم' : field === 'title' ? 'عنوان القسم' : 'الحقل';
        return res.status(400).json({ 
          error: `${fieldName} موجود مسبقاً`,
          message: `يوجد قسم آخر بنفس ${fieldName}`
        });
      }
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          error: 'خطأ في التحقق من البيانات',
          message: validationErrors.join(', ')
        });
      }
      
      res.status(500).json({ 
        error: 'خطأ في إنشاء القسم',
        message: 'حدث خطأ في الخادم أثناء إنشاء القسم',
        timestamp: new Date().toISOString()
      });
    }
  });
});

// تحديث قسم - مع معالجة محسنة للأخطاء
router.put('/:id', authenticateToken, (req, res) => {
  console.log(`PUT /api/categories/${req.params.id}`);
  console.log('User role:', req.user?.role);
  
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'ليس لديك صلاحية لتعديل الأقسام',
      message: 'هذه العملية متاحة للمديرين فقط'
    });
  }

  uploadCategory.single('image')(req, res, async (err) => {
    if (err) {
      console.error('❌ Upload error:', err);
      return res.status(400).json({
        error: 'خطأ في رفع الصورة',
        message: err.message || 'حدث خطأ أثناء رفع الصورة'
      });
    }

    try {
      console.log('Request body after upload:', req.body);
      console.log('Uploaded file:', req.file);
      
      const { name, title, description, removeImage } = req.body;
      
      // التحقق من البيانات المطلوبة
      if (!name || !name.trim()) {
        if (req.file) {
          await deleteFromCloudinary(req.file.path);
        }
        return res.status(400).json({ 
          error: 'اسم القسم مطلوب',
          message: 'يجب إدخال اسم صحيح للقسم'
        });
      }
      
      if (!description || !description.trim()) {
        if (req.file) {
          await deleteFromCloudinary(req.file.path);
        }
        return res.status(400).json({ 
          error: 'وصف القسم مطلوب',
          message: 'يجب إدخال وصف للقسم'
        });
      }
      
      // العثور على القسم الحالي
      const currentCategory = await Category.findById(req.params.id);
      if (!currentCategory) {
        if (req.file) {
          await deleteFromCloudinary(req.file.path);
        }
        return res.status(404).json({ 
          error: 'القسم غير موجود',
          message: `لم يتم العثور على قسم بالمعرف ${req.params.id}`
        });
      }
      
      // التحقق من عدم التكرار (باستثناء القسم الحالي)
      const existingCategory = await Category.findOne({ 
        $and: [
          { _id: { $ne: req.params.id } },
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
        if (req.file) {
          await deleteFromCloudinary(req.file.path);
        }
        return res.status(400).json({ 
          error: 'يوجد قسم آخر بهذا الاسم',
          message: `القسم "${existingCategory.name}" موجود بالفعل`
        });
      }
      
      // إدارة الصورة
      let imagePath = currentCategory.image;
      
      if (removeImage === 'true') {
        // حذف الصورة الحالية
        if (currentCategory.image) {
          await deleteFromCloudinary(currentCategory.image);
          console.log('🗑️ Deleted old category image');
        }
        imagePath = null;
      } else if (req.file) {
        // رفع صورة جديدة - حذف القديمة أولاً
        if (currentCategory.image) {
          await deleteFromCloudinary(currentCategory.image);
          console.log('🗑️ Deleted old category image');
        }
        imagePath = req.file.path;
        console.log('📷 Uploaded new category image');
      }
      
      // تحديث البيانات
      const updateData = {
        name: name.trim(),
        title: (title || name).trim(),
        description: description.trim(),
        image: imagePath,
        updatedAt: new Date()
      };
      
      console.log('Updating category with data:', updateData);
      
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { 
          new: true, 
          runValidators: true,
          context: 'query'
        }
      );

      console.log('✅ Category updated successfully:', category._id);
      
      const responseCategory = {
        _id: category._id,
        name: category.name,
        title: category.title,
        description: category.description,
        image: category.image,
        slug: category.slug,
        isActive: category.isActive,
        order: category.order,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };
      
      res.status(200).json(responseCategory);
      
    } catch (error) {
      console.error('❌ Error updating category:', error);
      
      // حذف الصورة الجديدة في حالة الخطأ
      if (req.file) {
        try {
          await deleteFromCloudinary(req.file.path);
        } catch (deleteError) {
          console.error('Error deleting uploaded file:', deleteError);
        }
      }
      
      if (error.name === 'CastError') {
        return res.status(400).json({ 
          error: 'معرف القسم غير صحيح',
          message: 'تنسيق معرف القسم غير صحيح'
        });
      }
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        const fieldName = field === 'name' ? 'اسم القسم' : field === 'title' ? 'عنوان القسم' : 'الحقل';
        return res.status(400).json({ 
          error: `${fieldName} موجود مسبقاً`,
          message: `يوجد قسم آخر بنفس ${fieldName}`
        });
      }
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          error: 'خطأ في التحقق من البيانات',
          message: validationErrors.join(', ')
        });
      }
      
      res.status(500).json({ 
        error: 'خطأ في تحديث القسم',
        message: 'حدث خطأ في الخادم أثناء تحديث القسم',
        timestamp: new Date().toISOString()
      });
    }
  });
});

// حذف قسم
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`DELETE /api/categories/${req.params.id}`);
    console.log('User role:', req.user?.role);
    
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية لحذف الأقسام',
        message: 'هذه العملية متاحة للمديرين فقط'
      });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'القسم غير موجود',
        message: `لم يتم العثور على قسم بالمعرف ${req.params.id}`
      });
    }

    // حذف صورة القسم من Cloudinary
    if (category.image) {
      await deleteFromCloudinary(category.image);
      console.log('🗑️ Deleted category image from Cloudinary');
    }

    // حذف القسم
    await category.deleteOne();

    console.log('✅ Category deleted successfully:', category.name);
    
    res.status(200).json({ 
      message: 'تم حذف القسم والخدمات المرتبطة به بنجاح',
      deletedCategory: {
        id: category._id,
        name: category.name
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'معرف القسم غير صحيح',
        message: 'تنسيق معرف القسم غير صحيح'
      });
    }
    
    res.status(500).json({ 
      error: 'خطأ في حذف القسم',
      message: 'حدث خطأ في الخادم أثناء حذف القسم',
      timestamp: new Date().toISOString()
    });
  }
});

// middleware لمعالجة أخطاء Multer على مستوى الراوتر
router.use(handleMulterError);

// اختبار الصحة
router.get('/health/check', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    status: 'OK',
    message: 'Categories API is working',
    timestamp: new Date().toISOString(),
    endpoint: '/api/categories'
  });
});

module.exports = router;