import React, { useState, useEffect } from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaSnapchatGhost,
  FaTiktok,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaShareAlt,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import axios from 'axios';
import { CONTACT_INFO } from '../../config';


const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5050';

// دالة مساعدة للحصول على URL الصورة الصحيح
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // إذا كانت الصورة من Cloudinary أو أي مصدر خارجي
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // إذا كانت الصورة محلية
  return `${API_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const Footer = () => {
  const [siteLogo, setSiteLogo] = useState(null);
  const [siteName, setSiteName] = useState('مجموعة التخصيص الطبية');
  const [logoLoading, setLogoLoading] = useState(true);
  const [branches, setBranches] = useState([]);

  const socialLinks = [
    { 
      href: 'https://facebook.com/altakhses', 
      icon: <FaFacebookF className="text-green-400 text-xl"/>, 
      name: 'Facebook',
    },
    { 
      href: 'https://x.com/Altakhses', 
      icon: <FaXTwitter className="text-green-400 text-xl" />, 
      name: 'X',
    },
    { 
      href: 'https://www.instagram.com/altakhses/', 
      icon: <FaInstagram className="text-green-400 text-xl"/>, 
      name: 'Instagram',
    },
    { 
      href: 'https://www.tiktok.com/@altakhses', 
      icon: <FaTiktok className="text-green-400 text-xl"/>, 
      name: 'TikTok',
    },
    { 
      href: 'https://www.snapchat.com/add/altakhses', 
      icon: <FaSnapchatGhost className="text-green-400 text-xl"/>, 
      name: 'Snapchat',
    },
  ];

  // جلب إعدادات الموقع عند التحميل - بنفس طريقة Navbar
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/settings`);
        if (data.success && data.data) {
          if (data.data.logo) {
            setSiteLogo(getImageUrl(data.data.logo));
          }
          if (data.data.siteName) {
            setSiteName(data.data.siteName);
          }
        }
      } catch (error) {
        console.error('خطأ في جلب إعدادات الموقع:', error);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  // الاستماع لتحديثات الشعار من لوحة التحكم - بنفس طريقة Navbar تماماً
  useEffect(() => {
    const handleLogoUpdate = (event) => {
      console.log('🔔 Footer: Logo update event received:', event.detail);
      if (event.detail) {
        setSiteLogo(getImageUrl(event.detail));
        console.log('✅ Footer: Logo updated to:', event.detail);
      } else {
        setSiteLogo(null);
        console.log('❌ Footer: Logo removed');
      }
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);

  // جلب الفروع من API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/branches`);
        if (data.success && Array.isArray(data.data)) {
          setBranches(data.data);
        }
      } catch (error) {
        console.error('خطأ في جلب الفروع:', error);
      }
    };

    fetchBranches();
  }, []);

  return (
    <footer 
      id="contact" 
      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-20 pb-8 px-6 font-[Tajawal] overflow-hidden" 
      dir="rtl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Top Section */}
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* استخدام نفس منطق Navbar للشعار مع خلفية بيضاء للرؤية الواضحة */}
                {!logoLoading && siteLogo ? (
                  <img 
                    src={siteLogo} 
                    alt={siteName} 
                    className="w-20 h-20 rounded-2xl shadow-xl border-2 border-green-400/30 object-contain bg-white p-2"
                    style={{ backgroundColor: 'white' }}
                    onError={(e) => {
                      // في حالة فشل تحميل الصورة، اعرض الشعار الاحتياطي
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* الشعار الاحتياطي */}
                <div 
                  className={`${(!logoLoading && siteLogo) ? 'hidden' : 'flex'} items-center justify-center w-20 h-20 bg-gradient-to-br from-[#48D690] to-[#28a49c] rounded-2xl shadow-xl border-2 border-green-400/30`}
                >
                  <span className="text-white text-2xl font-bold">MT</span>
                </div>
                
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-400 mb-1">
                  {siteName}
                </h3>
                <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-full" />
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed text-lg">
              مجموعة طبية شاملة تضم كافة التخصصات بخدمات عالية الجودة وكفاءة تحت أشراف كوادر طبية ذات خبرة طويلة لتلبية تطلعات المجتمع و رغباتة الطبيه
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-300 hover:text-green-400 transition-colors duration-300">
                <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-green-400" />
                </div>
                <span className="text-lg">حائل، المملكة العربية السعودية</span>
              </div>
              
              <div className="flex items-center gap-4 text-gray-300 hover:text-green-400 transition-colors duration-300">
                <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center">
                  <FaPhone className="text-green-400" />
                </div>
                <span className="text-lg" dir="ltr">{CONTACT_INFO.phone}</span>
              </div>
              
              <div className="flex items-center gap-4 text-gray-300 hover:text-green-400 transition-colors duration-300">
                <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-green-400" />
                </div>
                <span className="text-lg">info@altakhses.com</span>
              </div>
            </div>
          </div>

          {/* Branches */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center">
                <FaBuilding className="text-green-400 text-xl" />
              </div>
              <h4 className="text-2xl font-bold text-white">فروعنا</h4>
            </div>
            
            <div className="space-y-4">
              {branches.map((branch, index) => (
                <a
                  key={branch._id || index}
                  href={branch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-white/5 hover:bg-green-400/10 rounded-xl border border-white/10 hover:border-green-400/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full group-hover:scale-125 transition-transform duration-300" />
                    <span className="text-gray-300 group-hover:text-green-400 transition-colors duration-300 font-medium">
                      {branch.name}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center">
                <FaShareAlt className="text-green-400 text-xl" />
              </div>
              <h4 className="text-2xl font-bold text-white">تابعونا</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {socialLinks.map(({ href, icon }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <div className="relative w-16 h-16 bg-green-400/10 hover:bg-green-400/20 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-green-400/20 hover:border-green-400/40">
                    <span className="text-green-400 text-xl">{icon}</span>
                    <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-400/10 to-teal-500/10 rounded-2xl border border-green-400/20">
              <h5 className="text-lg font-semibold text-green-400 mb-3">أبق على تواصل</h5>
              <p className="text-gray-300 text-sm leading-relaxed">
                تابع آخر الأخبار والتحديثات الطبيه من خلال متابعتنا على وسائل التواصل الأجتماعي
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">
              © 2025 {siteName}. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-green-400/20 to-teal-500/20 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-teal-500/20 to-green-400/20 rounded-full blur-2xl" />
    </footer>
  );
};

export default Footer;