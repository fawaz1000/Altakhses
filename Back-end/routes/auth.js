// Back-end/routes/auth.js
require('dotenv').config();
const express    = require('express');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
const rateLimit  = require('express-rate-limit');
const User       = require('../Models/User');
const adminStatic= require('../data/admin');             // تم تعديل المسار ليشير إلى data/admin.js
const authenticateToken = require('../Middleware/authMiddleware');

const router = express.Router();

// 🔐 محدودية لمحاولات تسجيل الدخول
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5,
  message: 'عدد محاولات تسجيل الدخول تجاوز الحد، حاول لاحقًا.',
  standardHeaders: true,
  legacyHeaders: false,
});

// --- إنشاء مستخدم جديد (اختياري، لإنشاء مفوَّض غير الأدمن الثابت) ---
router.post('/signup', async (req, res) => {
  const { username, password, role = 'user' } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }
  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ message: 'اسم المستخدم موجود بالفعل' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, passwordHash: hash, role });
  await user.save();
  res.status(201).json({ message: 'تم إنشاء الحساب بنجاح' });
});

// --- تسجيل الدخول ---
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  // 1) حاول التحقق من الأدمن الثابت أولًا:
  if (username === adminStatic.username) {
    const validAdmin = bcrypt.compareSync(password, adminStatic.password);
    if (!validAdmin) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
    }
    // لو الأدمن صالح:
    const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET || 'secretkey', {
      expiresIn: '2h'
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000, // ساعتان
      path: '/'
    });
    // إضافة حقل token في الجسم ليخزن في الـ localStorage
    return res.json({ message: 'تم تسجيل الدخول كأدمن', token });
  }

  // 2) غير ذلك، تحقق من قاعدة البيانات:
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
  }

  // أنشئ التوكن ووضّعه في الكوكي
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '2h'
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2 * 60 * 60 * 1000,
    path: '/'
  });
  // إضافة حقل token في الجسم ليخزن في الـ localStorage
  res.json({ message: 'تم تسجيل الدخول', token });
});

// --- تسجيل الخروج ---
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'تم تسجيل الخروج' });
});

// --- مسار محمي للاختبار (جرّب عملية GET هنا للتأكّد من التوكن) ---
router.get('/profile', authenticateToken, (req, res) => {
  // نسترجع الـ decoded payload من التوكن (مثال: { id, role } أو { username, role })
  res.json({ user: req.user });
});

module.exports = router;
