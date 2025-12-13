
const express = require('express');
const router = express.Router();
const Branch = require('../Models/Branches');
const authenticateToken = require('../Middleware/authMiddleware');

// إضافة middleware لتحقق من صلاحيات الأدمن
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'غير مسموح - تحتاج صلاحيات المدير'
    });
  }
};

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
  next();
});

// معالجة طلبات OPTIONS
router.options('*', (req, res) => {
  res.status(200).end();
});

// GET /api/branches - للعرض العام
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching branches for public...');
    
    const branches = await Branch.getAllBranches();
    
    console.log(`✅ Found ${branches.length} branches`);
    
    res.status(200).json({
      success: true,
      data: branches,
      count: branches.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching branches:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الفروع',
      error: error.message
    });
  }
});

// GET /api/branches/admin/all - للوحة التحكم (جميع الفروع)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Admin fetching all branches...');
    
    const branches = await Branch.find({})
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${branches.length} branches total`);
    
    res.status(200).json({
      success: true,
      data: branches,
      count: branches.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching all branches for admin:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الفروع',
      error: error.message
    });
  }
});

// GET /api/branches/:id - جلب فرع واحد
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Fetching branch:', id);
    
    const branch = await Branch.findById(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'الفرع غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: branch
    });
    
  } catch (error) {
    console.error('❌ Error fetching branch:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'معرف الفرع غير صحيح'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الفرع',
      error: error.message
    });
  }
});

// POST /api/branches - إضافة فرع جديد
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, url } = req.body;
    
    console.log('🔍 Creating new branch:', { name, url });
    
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'اسم الفرع ورابط الموقع مطلوبان'
      });
    }
    
    // التحقق من صحة الرابط
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url.trim())) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن يكون الرابط صحيحاً ويبدأ بـ http:// أو https://'
      });
    }
    
    const newBranch = new Branch({
      name: name.trim(),
      url: url.trim()
    });
    
    const savedBranch = await newBranch.save();
    
    console.log('✅ Branch created successfully:', savedBranch._id);
    
    res.status(201).json({
      success: true,
      message: 'تم إضافة الفرع بنجاح',
      data: savedBranch
    });
    
  } catch (error) {
    console.error('❌ Error creating branch:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة الفرع',
      error: error.message
    });
  }
});

// PUT /api/branches/:id - تحديث فرع
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url } = req.body;
    
    console.log('🔍 Updating branch:', id);
    
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'اسم الفرع ورابط الموقع مطلوبان'
      });
    }
    
    // التحقق من صحة الرابط
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url.trim())) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن يكون الرابط صحيحاً ويبدأ بـ http:// أو https://'
      });
    }
    
    const updatedBranch = await Branch.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        url: url.trim()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedBranch) {
      return res.status(404).json({
        success: false,
        message: 'الفرع غير موجود'
      });
    }
    
    console.log('✅ Branch updated successfully:', updatedBranch._id);
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث الفرع بنجاح',
      data: updatedBranch
    });
    
  } catch (error) {
    console.error('❌ Error updating branch:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'معرف الفرع غير صحيح'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الفرع',
      error: error.message
    });
  }
});

// DELETE /api/branches/:id - حذف فرع
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Deleting branch:', id);
    
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'الفرع غير موجود'
      });
    }
    
    await Branch.findByIdAndDelete(id);
    
    console.log('✅ Branch deleted successfully:', id);
    
    res.status(200).json({
      success: true,
      message: 'تم حذف الفرع بنجاح'
    });
    
  } catch (error) {
    console.error('❌ Error deleting branch:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'معرف الفرع غير صحيح'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الفرع',
      error: error.message
    });
  }
});

module.exports = router;