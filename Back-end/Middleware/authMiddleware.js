// Back-end/Middleware/authMiddleware.js - مُحدث مع تصدير صحيح
require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    console.log('🔐 Auth middleware started');
    console.log('📋 Headers:', req.headers);
    console.log('🍪 Cookies:', req.cookies);
    
    // محاولة الحصول على التوكن من headers أو cookies
    let token = req.headers.authorization?.split(' ')[1]; // Bearer token
    
    if (!token) {
      token = req.cookies?.token; // Cookie token
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        message: 'رمز الوصول مطلوب',
        error: 'No token provided',
        authenticated: false
      });
    }

    console.log('🔍 Token found:', token.substring(0, 20) + '...');

    // التحقق من صحة التوكن
    const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token decoded:', {
      username: decoded.username,
      role: decoded.role,
      exp: new Date(decoded.exp * 1000)
    });

    // التحقق من انتهاء صلاحية التوكن
    if (decoded.exp * 1000 < Date.now()) {
      console.log('❌ Token expired');
      return res.status(401).json({ 
        message: 'انتهت صلاحية رمز الوصول',
        error: 'Token expired',
        authenticated: false
      });
    }

    // التحقق من دور المستخدم (للمسارات الإدارية)
    if (req.path.includes('/admin') || req.path.includes('/categories') || req.path.includes('/services')) {
      if (decoded.role !== 'admin') {
        console.log('❌ Access denied: user is not admin');
        return res.status(403).json({ 
          message: 'ليس لديك صلاحية للوصول',
          error: 'Access denied',
          authenticated: false
        });
      }
    }
    
    // إضافة معلومات المستخدم إلى الطلب
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    
    console.log('✅ Authentication successful for:', decoded.username || decoded.id);
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    // معالجة أنواع الأخطاء المختلفة
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'انتهت صلاحية رمز الوصول',
        error: 'Token expired',
        authenticated: false
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'رمز وصول غير صحيح',
        error: 'Invalid token',
        authenticated: false
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        message: 'رمز الوصول غير صالح بعد',
        error: 'Token not active',
        authenticated: false
      });
    }
    
    return res.status(401).json({ 
      message: 'فشل في التحقق من رمز الوصول',
      error: error.message,
      authenticated: false
    });
  }
};

// middleware إضافي للتحقق من دور المدير فقط
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'يجب تسجيل الدخول أولاً',
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'هذه العملية متاحة للمديرين فقط',
      error: 'Admin access required'
    });
  }

  next();
};

// 🔧 التصدير المُصحح - الدالة الأساسية مباشرة
module.exports = authenticateToken;

// تصدير الدالة الإضافية منفصلة
module.exports.requireAdmin = requireAdmin;