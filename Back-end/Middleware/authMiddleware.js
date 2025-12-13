// Back-end/Middleware/authMiddleware.js - مُحدث ومُصحح بالكامل
require('dotenv').config();
const jwt = require('jsonwebtoken');
const adminStatic = require('../data/admin');

// 🔧 دالة التحقق من التوكن - تصدير مباشر كما متوقع في الملفات الأخرى
const authenticateToken = (req, res, next) => {
  try {
    console.log('🔑 Authenticating request to:', req.originalUrl);
    console.log('📋 Headers authorization:', req.headers.authorization ? 'Present' : 'Missing');
    console.log('🍪 Cookies token:', req.cookies?.token ? 'Present' : 'Missing');
    
    // 1. البحث عن التوكن في عدة أماكن
    let token = null;
    
    // من الهيدر Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('✅ Token found in Authorization header');
    }
    
    // من الكوكيز كبديل
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('✅ Token found in cookies');
    }
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        message: 'رمز المصادقة مطلوب',
        error: 'No token provided',
        authenticated: false
      });
    }

    // 2. التحقق من صحة التوكن
    const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('❌ Invalid token:', err.message);
        
        // معالجة أنواع الأخطاء المختلفة
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            message: 'انتهت صلاحية رمز المصادقة',
            error: 'Token expired',
            authenticated: false
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ 
            message: 'رمز المصادقة غير صحيح',
            error: 'Invalid token',
            authenticated: false
          });
        }

        return res.status(401).json({ 
          message: 'فشل في التحقق من رمز المصادقة',
          error: err.message,
          authenticated: false
        });
      }

      // 3. التحقق من انتهاء الصلاحية مرة أخرى للتأكد
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.log('❌ Token expired (manual check)');
        return res.status(401).json({ 
          message: 'انتهت صلاحية رمز المصادقة',
          error: 'Token expired',
          authenticated: false
        });
      }

      // 4. إعداد معلومات المستخدم
      req.user = {
        id: decoded.id || decoded.username,
        username: decoded.username,
        role: decoded.role || 'user'
      };

      console.log('✅ Token verified for user:', req.user.username, 'Role:', req.user.role);
      next();
    });

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'خطأ في التحقق من المصادقة',
      error: 'Authentication error',
      authenticated: false
    });
  }
};

// 🔧 دالة التحقق من صلاحيات الأدمن
const requireAdmin = (req, res, next) => {
  try {
    console.log('🔐 Checking admin permissions for:', req.user?.username);
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ 
        message: 'يجب تسجيل الدخول أولاً',
        error: 'User not authenticated'
      });
    }

    if (req.user.role !== 'admin') {
      console.log('❌ User is not admin:', req.user.role);
      return res.status(403).json({ 
        message: 'ليس لديك صلاحية للوصول - مطلوب صلاحيات إدارية',
        error: 'Admin access required'
      });
    }

    console.log('✅ Admin access granted for:', req.user.username);
    next();

  } catch (error) {
    console.error('❌ Admin check error:', error);
    return res.status(500).json({ 
      message: 'خطأ في التحقق من الصلاحيات',
      error: 'Permission check error'
    });
  }
};

// 🔧 تصدير الدوال - التصدير المباشر والمسمى معاً لضمان التوافق
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;