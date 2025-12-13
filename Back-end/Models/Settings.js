// Back-end/Models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'مجموعة التخصيص الطبية'
  },
  logo: {
    type: String,
    default: null // مسار الشعار من Cloudinary
  },
  favicon: {
    type: String,
    default: null
  },
  contactInfo: {
    phone: {
      type: String,
      default: '920002111'
    },
    whatsapp: {
      type: String,
      default: '966500069636'
    },
    email: {
      type: String,
      default: 'info@altakhsees.com'
    },
    location: {
      type: String,
      default: 'حائل، المملكة العربية السعودية'
    }
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    tiktok: String,
    snapchat: String
  }
}, {
  timestamps: true
});

// التأكد من وجود سجل واحد فقط
settingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);