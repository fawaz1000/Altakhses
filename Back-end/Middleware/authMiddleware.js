// Back-end/Middleware/authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    // محاولة الحصول على التوكن من headers أو cookies
    let token = req.headers.authorization?.split(' ')[1]; // Bearer token
    
    if (!token) {
      token = req.cookies?.token; // Cookie token
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        message: 'رمز الوصول مطلوب',
        error: 'No token provided'
      });
    }

    // التحقق من صحة التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    // إضافة معلومات المستخدم إلى الطلب
    req.user = decoded;
    
    console.log('✅ Token verified for user:', decoded.username || decoded.id);
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'انتهت صلاحية رمز الوصول',
        error: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'رمز وصول غير صحيح',
        error: 'Invalid token'
      });
    }
    
    return res.status(401).json({ 
      message: 'فشل في التحقق من رمز الوصول',
      error: error.message
    });
  }
};

module.exports = authenticateToken;