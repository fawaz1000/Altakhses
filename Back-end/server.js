// Back-end/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const reportRoutes = require('./routes/report');
const serviceRoutes = require('./routes/services');
const categoryRoutes = require('./routes/categories');

const app = express();

// إعداد CORS متقدم لدعم الكوكيز من الواجهة
const corsOptions = {
  origin: function (origin, callback) {
    // السماح للطلبات من المصادر المحددة أو الطلبات المحلية (بدون origin)
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// معالجة طلبات OPTIONS (preflight)
app.options('*', cors(corsOptions));

// لتحليل جسد الطلب (JSON) وللتعامل مع الكوكي
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// إنشاء مجلدات الرفع إذا لم تكن موجودة
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/media')
  ];
  
  dirs.forEach(dir => {
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

createUploadDirs();

// ملفات الصور والفيديو المرفوع تُعرض كـ static
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // تخزين مؤقت ليوم واحد
  etag: true
}));

// إضافة middleware للتسجيل
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // تسجيل headers المهمة
  if (req.headers.authorization) {
    console.log(`  🔑 Auth: ${req.headers.authorization.substring(0, 20)}...`);
  }
  
  next();
});

// ربط المسارات
app.use('/api/admin', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);

// نقطة البداية
app.get('/', (req, res) => {
  res.json({
    message: 'Medical Group API Server',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/admin',
      media: '/api/media',
      reports: '/api/reports',
      services: '/api/services',
      categories: '/api/categories'
    }
  });
});

// نقطة اختبار شاملة
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is working perfectly!',
    server: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.db?.databaseName || 'unknown'
    },
    endpoints: [
      'GET /api/admin/profile',
      'POST /api/admin/login',
      'GET /api/media',
      'GET /api/reports',
      'GET /api/services',
      'GET /api/categories'
    ],
    features: [
      'Authentication with JWT',
      'File upload for media',
      'CORS enabled',
      'Error handling',
      'Request logging'
    ],
    timestamp: new Date().toISOString()
  });
});

// الاتصال بقاعدة البيانات مع إعادة المحاولة
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinicDB',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        }
      );
      
      console.log('✅ Connected to MongoDB');
      console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
      console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      break;
      
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed:`, err.message);
      
      if (retries === maxRetries) {
        console.error('💥 Could not connect to MongoDB after maximum retries');
        process.exit(1);
      }
      
      // انتظار قبل إعادة المحاولة
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// مراقبة اتصال قاعدة البيانات
mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// Error handling middleware محسن
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // التعامل مع أخطاء CORS
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'CORS policy violation',
      error: 'Access denied from this origin'
    });
  }

  // التعامل مع أخطاء JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'رمز المصادقة غير صحيح',
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'انتهت صلاحية رمز المصادقة',
      error: 'Token expired'
    });
  }

  // التعامل مع أخطاء Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'خطأ في التحقق من البيانات',
      error: err.message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'معرف غير صحيح',
      error: 'Invalid ID format'
    });
  }

  // خطأ عام
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler محسن
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'POST /api/admin/login',
      'GET /api/admin/profile',
      'GET /api/media',
      'GET /api/reports',
      'GET /api/services',
      'GET /api/categories'
    ],
    timestamp: new Date().toISOString()
  });
});

// معالجة إشارات النظام للإغلاق النظيف
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// معالجة الأخطاء غير المعالجة
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5050;

const startServer = async () => {
  try {
    // الاتصال بقاعدة البيانات أولاً
    await connectDB();
    
    // ثم تشغيل السيرفر
    const server = app.listen(PORT, () => {
      console.log('\n🚀 ==========================================');
      console.log(`🏥 Medical Group API Server Started`);
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
      console.log(`🔑 Admin Login: http://localhost:${PORT}/api/admin/login`);
      console.log(`📁 Media API: http://localhost:${PORT}/api/media`);
      console.log(`📊 Reports API: http://localhost:${PORT}/api/reports`);
      console.log(`🏥 Services API: http://localhost:${PORT}/api/services`);
      console.log(`📋 Categories API: http://localhost:${PORT}/api/categories`);
      console.log(`🕐 Started at: ${new Date().toLocaleString('ar-EG')}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('==========================================\n');
    });

    // معالجة أخطاء السيرفر
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('💡 Try a different port or stop the other service');
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// بدء تشغيل السيرفر
startServer();