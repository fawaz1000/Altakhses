// Back-end/routes/auth.js - مُصحح
require('dotenv').config();
const express    = require('express');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
const rateLimit  = require('express-rate-limit');
const User       = require('../Models/User');
const adminStatic= require('../data/admin');
// 🔧 تصحيح الاستيراد - استيراد مباشر بدلاً من destructuring
const authenticateToken = require('../Middleware/authMiddleware');

const router = express.Router();

// 🔐 محدودية لمحاولات تسجيل الدخول
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10, // زيادة عدد المحاولات المسموحة
  message: { message: 'عدد محاولات تسجيل الدخول تجاوز الحد، حاول لاحقًا.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- إنشاء مستخدم جديد (اختياري) ---
router.post('/signup', async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'اسم المستخدم وكلمة المرور مطلوبان' 
      });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ 
        message: 'اسم المستخدم موجود بالفعل' 
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, passwordHash: hash, role });
    await user.save();
    
    console.log('✅ User created:', username);
    res.status(201).json({ message: 'تم إنشاء الحساب بنجاح' });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ message: 'خطأ في إنشاء الحساب' });
  }
});

// --- تسجيل الدخول ---
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔑 Login attempt for:', username);

    if (!username || !password) {
      return res.status(400).json({ 
        message: 'اسم المستخدم وكلمة المرور مطلوبان' 
      });
    }

    // 1) التحقق من الأدمن الثابت أولاً
    if (username === adminStatic.username) {
      const validAdmin = bcrypt.compareSync(password, adminStatic.password);
      if (!validAdmin) {
        console.log('❌ Invalid admin credentials');
        return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
      }
      
      // إنشاء التوكن للأدمن
      const token = jwt.sign(
        { username, role: 'admin' }, 
        process.env.JWT_SECRET || 'secretkey', 
        { expiresIn: '24h' }
      );
      
      // إعداد الكوكي
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
        path: '/'
      });
      
      console.log('✅ Admin login successful');
      return res.json({ 
        message: 'تم تسجيل الدخول كأدمن', 
        token,
        user: { username, role: 'admin' }
      });
    }

    // 2) التحقق من قاعدة البيانات
    const user = await User.findOne({ username });
    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.log('❌ Invalid password for user:', username);
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
    }

    // إنشاء التوكن للمستخدم
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '24h' }
    );
    
    // إعداد الكوكي
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
      path: '/'
    });
    
    console.log('✅ User login successful:', username);
    res.json({ 
      message: 'تم تسجيل الدخول', 
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// --- تسجيل الخروج ---
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', { path: '/' });
    console.log('✅ User logged out');
    res.json({ message: 'تم تسجيل الخروج' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ message: 'خطأ في تسجيل الخروج' });
  }
});

// --- مسار محمي للتحقق من التوكن ---
router.get('/profile', authenticateToken, (req, res) => {
  try {
    console.log('✅ Profile accessed by:', req.user.username || req.user.id);
    res.json({ 
      message: 'تم الوصول للملف الشخصي',
      user: req.user 
    });
  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({ message: 'خطأ في الوصول للملف الشخصي' });
  }
});

// --- التحقق من حالة المصادقة ---
router.get('/verify', authenticateToken, (req, res) => {
  try {
    console.log('✅ Token verified for:', req.user.username || req.user.id);
    res.json({ 
      valid: true, 
      user: req.user 
    });
  } catch (error) {
    console.error('❌ Verify error:', error);
    res.status(500).json({ message: 'خطأ في التحقق' });
  }
});

module.exports = router;