// Back-end/data/admin.js - بيانات الأدمن المحدثة
const bcrypt = require('bcryptjs');

// بيانات الأدمن المحدثة
const adminStatic = {
  username: 'admin',
  // كلمة المرور: altakhses@1122 (مُشفرة)
  password: bcrypt.hashSync('altakhses@1122', 10),
  role: 'admin'
};

console.log('📋 Admin credentials loaded:');
console.log('   Username:', adminStatic.username);
console.log('   Password hash:', adminStatic.password.substring(0, 20) + '...');
console.log('   Role:', adminStatic.role);

module.exports = adminStatic;