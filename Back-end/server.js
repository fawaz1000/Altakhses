// Back-end/server.js - Updated
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const mongoose   = require('mongoose');
const path       = require('path');

const authRoutes      = require('./routes/auth');
const mediaRoutes     = require('./routes/media');
const reportRoutes    = require('./routes/report');
const serviceRoutes   = require('./routes/services'); // ✅ Updated services routes
const categoryRoutes  = require('./routes/categories'); // ✅ New categories routes

const app = express();

// إعداد CORS لدعم الكوكيز من الواجهة
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// لتحليل جسد الطلب (JSON) وللتعامل مع الكوكي
app.use(express.json());
app.use(cookieParser());

// ملفات الصور والفيديو المرفوع تُعرض كـ static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ربط المسارات
app.use('/api/admin', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/services', serviceRoutes);    // ✅ Updated services with category support
app.use('/api/categories', categoryRoutes); // ✅ New categories management

// نقطة البداية
app.get('/', (req, res) => {
  res.send('API is running...');
});

// نقطة اختبار محدثة
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    endpoints: [
      '/api/admin',
      '/api/media', 
      '/api/reports',
      '/api/services',    // ✅ Updated with category filtering
      '/api/categories'   // ✅ New endpoint
    ],
    newFeatures: [
      'Categories management',
      'Services linked to categories',
      'Dynamic service filtering'
    ]
  });
});

// الاتصال بقاعدة البيانات
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinicDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🆕 New features: Categories & Enhanced Services');
  })
  .catch(err => console.error('❌ MongoDB Error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/admin', 
      '/api/media', 
      '/api/reports', 
      '/api/services', 
      '/api/categories'
    ]
  });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
  console.log(`🏥 Services API: http://localhost:${PORT}/api/services`);
  console.log(`📋 Categories API: http://localhost:${PORT}/api/categories`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🆕 Enhanced with Categories & Dynamic Services`);
});