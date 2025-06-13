// backend/data/admin.js
const bcrypt = require('bcryptjs');

module.exports = {
  username: 'fawaz',
  // كلمة المرور الأصلية: 1234567890
  password: bcrypt.hashSync('1234567890', 10)
};
