// Back-end/data/admin.js - بيانات الأدمن الثابت
const bcrypt = require('bcryptjs');

// بيانات الأدمن الثابت
const adminStatic = {
  username: 'fawaz',
  // كلمة المرور: 1234567890 (مُشفرة)
  password: bcrypt.hashSync('1234567890', 10),
  role: 'admin'
};

console.log('📋 Admin credentials loaded:');
console.log('   Username:', adminStatic.username);
console.log('   Password hash:', adminStatic.password.substring(0, 20) + '...');
console.log('   Role:', adminStatic.role);

module.exports = adminStatic;