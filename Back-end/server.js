// Back-end/server.js
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const mongoose   = require('mongoose');
const path       = require('path');

const authRoutes   = require('./routes/auth');
const mediaRoutes  = require('./routes/media');
const reportRoutes = require('./routes/report');

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

// نقطة البداية
app.get('/', (req, res) => {
  res.send('API is running...');
});

// الاتصال بقاعدة البيانات
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinicDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// تشغيل السيرفر
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
