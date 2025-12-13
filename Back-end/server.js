// Back-end/server.js - مُصحح بالكامل مع إضافة الفروع
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

// التحقق من وجود متغيرات البيئة المطلوبة
const checkEnvVariables = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('📝 Please check your .env file');
    
    // في بيئة الإنتاج، أوقف الخادم
    if (process.env.NODE_ENV === 'production') {
      console.error('🛑 Stopping server due to missing configuration');
      process.exit(1);
    }
  } else {
    console.log('✅ All required environment variables are set');
  }
};

// استيراد المسارات - ✅ مُصحح مع إضافة الفروع
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const reportRoutes = require('./routes/report');
const serviceRoutes = require('./routes/services');
const categoryRoutes = require('./routes/categories');
const doctorRoutes = require('./routes/doctors');
const settingsRoutes = require('./routes/settings');
const partnerRoutes = require('./routes/partner');
const branchRoutes = require('./routes/branches'); // 🆕 إضافة مسار الفروع

const app = express();

// إعداد CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://altakhses1.netlify.app',
      'https://altakhses.netlify.app',
      'https://altakhsees1.netlify.app',
      'https://altakhsees.netlify.app',
      'https://www.altakhsees1.netlify.app',
      'https://www.altakhsees.netlify.app',
      'https://www.altakhses1.netlify.app',
      'https://www.altakhses.netlify.app'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// المتطلبات الأساسية
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// إنشاء مجلدات الرفع
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

// الملفات الثابتة
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true
}));

// تسجيل الطلبات
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ربط المسارات - ✅ مُصحح مع إضافة الفروع
app.use('/api/auth', authRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/branches', branchRoutes); // 🆕 إضافة مسار الفروع

// نقطة اختبار الفروع - ✅ جديد
app.get('/api/branches/test', (req, res) => {
  res.json({
    message: 'Branches API is working!',
    timestamp: new Date().toISOString(),
    endpoint: '/api/branches'
  });
});

// نقطة اختبار الشراكات - ✅ جديد
app.get('/api/partners/test', (req, res) => {
  res.json({
    message: 'Partners API is working!',
    timestamp: new Date().toISOString(),
    endpoint: '/api/partners'
  });
});

// نقطة اختبار Cloudinary
app.get('/api/cloudinary/test', async (req, res) => {
  try {
    const { cloudinary } = require('./config/cloudinary');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary test result:', result);
    res.json({ 
      status: 'connected',
      message: 'Cloudinary متصل بنجاح',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cloudinary test error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'فشل الاتصال بـ Cloudinary',
      error: error.message,
      hint: 'تحقق من صحة CLOUDINARY_API_SECRET'
    });
  }
});

// نقطة البداية - ✅ مُحدث مع الفروع
app.get('/', (req, res) => {
  res.json({
    message: 'Medical Group API Server',
    version: '2.2.0', // 🆕 رفع رقم الإصدار
    status: 'running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      media: '/api/media',
      reports: '/api/reports',
      services: '/api/services',
      categories: '/api/categories',
      doctors: '/api/doctors',
      settings: '/api/settings',
      partners: '/api/partners',
      branches: '/api/branches', // 🆕 مُضاف
      partnersTest: '/api/partners/test',
      branchesTest: '/api/branches/test', // 🆕 مُضاف
      cloudinaryTest: '/api/cloudinary/test'
    }
  });
});

// نقطة اختبار
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// نقطة الصحة
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// الاتصال بقاعدة البيانات مع معالجة محسنة للأخطاء
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  // التحقق من وجود MONGODB_URI
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    console.error('📝 Please add MONGODB_URI to your .env file or Render environment variables');
    process.exit(1);
  }

  // إخفاء كلمة المرور في السجلات
  const sanitizedUri = process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');
  console.log('🔗 Attempting to connect to MongoDB:', sanitizedUri);
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ Connected to MongoDB Atlas successfully!');
      console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
      console.log(`🔗 Host: ${mongoose.connection.host}`);
      
      // اختبار الاتصال بقراءة عدد المجموعات
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📚 Collections found: ${collections.length}`);
      
      break;
      
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed`);
      console.error(`📝 Error type: ${err.name}`);
      console.error(`📝 Error message: ${err.message}`);
      
      // معالجة أنواع الأخطاء المختلفة
      if (err.message.includes('bad auth') || err.message.includes('authentication failed')) {
        console.error('🔐 Authentication Error: Check your username and password');
        console.error('📝 Make sure the password in MONGODB_URI matches the one in MongoDB Atlas');
        console.error('💡 Try creating a new database user in MongoDB Atlas');
      } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
        console.error('🌐 Network Error: Cannot reach MongoDB Atlas');
        console.error('📝 Check your internet connection');
        console.error('📝 Verify the cluster address is correct');
      } else if (err.message.includes('whitelist')) {
        console.error('🛡️ IP Whitelist Error: Your IP is not allowed');
        console.error('📝 Add your IP address or 0.0.0.0/0 in MongoDB Atlas Network Access');
      }
      
      if (retries === maxRetries) {
        console.error('💥 Could not connect to MongoDB after maximum retries');
        console.error('🔧 Troubleshooting steps:');
        console.error('   1. Check your MongoDB Atlas username and password');
        console.error('   2. Verify IP whitelist settings (add 0.0.0.0/0 for testing)');
        console.error('   3. Ensure the database user has correct permissions');
        console.error('   4. Check if the cluster is active and running');
        console.error('   5. Try creating a new database user with a simple password');
        process.exit(1);
      }
      
      console.log(`⏳ Waiting 5 seconds before retry ${retries + 1}...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// مراقبة اتصال قاعدة البيانات
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
  console.log('❌ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ Mongoose reconnected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

// معالج أخطاء Cloudinary
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('Cloudinary')) {
    console.error('❌ Cloudinary Error:', err);
    return res.status(500).json({
      error: 'خطأ في رفع الصورة',
      message: 'تأكد من صحة إعدادات Cloudinary',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
    available_endpoints: [
      '/api/auth',
      '/api/media', 
      '/api/reports',
      '/api/services',
      '/api/categories', 
      '/api/doctors',
      '/api/settings',
      '/api/partners',
      '/api/branches', // 🆕 مُضاف
      '/health',
      '/api/test'
    ],
    timestamp: new Date().toISOString()
  });
});

// معالجة إشارات النظام
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
    // التحقق من متغيرات البيئة
    checkEnvVariables();
    
    // الاتصال بقاعدة البيانات
    await connectDB();
    
    // تشغيل السيرفر
    const server = app.listen(PORT, () => {
      console.log('\n🚀 ==========================================');
      console.log(`🏥 Medical Group API Server Started`);
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`🤝 Partners API: http://localhost:${PORT}/api/partners`);
      console.log(`🧪 Partners test: http://localhost:${PORT}/api/partners/test`);
      console.log(`🏢 Branches API: http://localhost:${PORT}/api/branches`); // 🆕 مُضاف
      console.log(`🧪 Branches test: http://localhost:${PORT}/api/branches/test`); // 🆕 مُضاف
      console.log(`☁️  Cloudinary test: http://localhost:${PORT}/api/cloudinary/test`);
      console.log(`🔑 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🕐 Started at: ${new Date().toLocaleString('ar-EG')}`);
      console.log('==========================================\n');
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
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