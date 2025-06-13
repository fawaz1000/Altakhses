// Back-end/middleware/authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // جرّب أولًا أخذ التوكن من هيدر Authorization: "Bearer <token>"
  const authHeader = req.headers['authorization']; 
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  // جرّب بعد ذلك أخذ التوكن من الكوكي (httpOnly)
  const tokenFromCookie = req.cookies?.token;

  const token = tokenFromHeader || tokenFromCookie;
  if (!token) {
    return res.status(401).json({ message: 'لا يوجد توكن، الوصول مرفوض' });
  }

  const secret = process.env.JWT_SECRET || 'secretkey';
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // سيتضمن { id, role } أو { username, role } للأدمن الثابت
    next();
  } catch (err) {
    return res.status(403).json({ message: 'التوكن غير صالح' });
  }
}

module.exports = authenticateToken;
