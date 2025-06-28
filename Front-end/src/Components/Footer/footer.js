import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaSnapchatGhost,
  FaTiktok,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBuilding,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import pic1 from '../../Assets/logo.jpg';

const Footer = () => {
  return (
    <footer id="contact" className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-20 pb-8 px-6 rtl font-[Tajawal] overflow-hidden">
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
                <img 
                  src={pic1} 
                  alt="Logo" 
                  className="w-20 h-20 rounded-2xl shadow-xl border-2 border-green-400/30" 
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-400 mb-1">
                  مجموعة التخصيص الطبية
                </h3>
                <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-full" />
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed text-lg">
              نحن ملتزمون بتقديم أفضل الخدمات الطبية والرعاية الصحية المتميزة لمجتمعنا
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
                <span className="text-lg" dir="ltr">920002111</span>
              </div>
              
              <div className="flex items-center gap-4 text-gray-300 hover:text-green-400 transition-colors duration-300">
                <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-green-400" />
                </div>
                <span className="text-lg">info@altakhsees.com</span>
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
              {branches.map(({ name, url }, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-white/5 hover:bg-green-400/10 rounded-xl border border-white/10 hover:border-green-400/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full group-hover:scale-125 transition-transform duration-300" />
                    <span className="text-gray-300 group-hover:text-green-400 transition-colors duration-300 font-medium">
                      {name}
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
                <FaInstagram className="text-green-400 text-xl" />
              </div>
              <h4 className="text-2xl font-bold text-white">تابعنا على</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {socialLinks.map(({ href, icon, name, color }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <div className={`relative w-16 h-16 ${color} rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}>
                    <span className="text-white text-xl">{icon}</span>
                    <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <span className="block text-center text-xs text-gray-400 mt-2 group-hover:text-green-400 transition-colors duration-300">
                    {name}
                  </span>
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-400/10 to-teal-500/10 rounded-2xl border border-green-400/20">
              <h5 className="text-lg font-semibold text-green-400 mb-3">ابق على تواصل</h5>
              <p className="text-gray-300 text-sm leading-relaxed">
                تابع آخر الأخبار والتحديثات الطبية من خلال متابعتنا على وسائل التواصل الاجتماعي
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-right">
              © 2025 مجموعة التخصيص الطبية. جميع الحقوق محفوظة.
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

const branches = [
  {
    name: 'مجموعة التخصيص الطبية 1 - حائل',
    url: 'https://www.google.com/maps/place/%D9%85%D8%AC%D9%85%D8%B9+%D8%A7%D9%84%D8%AA%D8%AE%D8%B5%D9%8A%D8%B5+%D9%84%D8%B7%D8%A8+%D9%88+%D8%AC%D8%B1%D8%A7%D8%AD%D8%A9+%D8%A7%D9%84%D9%81%D9%85+%D9%88+%D8%A7%D9%84%D8%A3%D8%B3%D9%86%D8%A7%D9%86+%D8%A7%D9%84%D8%B7%D8%A8%D9%8A+%D8%A7%D9%84%D9%85%D8%AA%D8%AE%D8%B5%D8%B5%E2%80%AD/@27.5239015,41.6946144,1038m/data=!3m2!1e3!4b1!4m6!3m5!1s0x157646d836e15cad:0x7a5d889fac3d3c36!8m2!3d27.5238968!4d41.6920395!16s%2Fg%2F11b6srjwpn?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D',
  },
  {
    name: 'مجموعة التخصيص الطبية 2 - حائل',
    url: 'https://www.google.com/maps/place/%D9%85%D8%AC%D9%85%D9%88%D8%B9%D8%A9+%D8%A7%D9%84%D8%AA%D8%AE%D8%B5%D9%8A%D8%B5+%D8%A7%D9%84%D8%B7%D8%A8%D9%8A+%D8%A7%D9%84%D8%B9%D8%A7%D9%85+2%E2%80%AD/@27.5242705,41.6945581,1038m/data=!3m2!1e3!4b1!4m6!3m5!1s0x157647b7091c71c7:0xb5ae81e76bc5caef!8m2!3d27.5242658!4d41.6919832!16s%2Fg%2F11y54__450?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D',
  },
  {
    name: 'مجموعة التخصيص الطبية 3 - حائل',
    url: 'https://www.google.com/maps/place/%D9%85%D8%AC%D9%85%D8%B9+%D8%A7%D9%84%D8%AA%D8%AE%D8%B5%D9%8A%D8%B5+%D8%A7%D9%84%D8%B7%D8%A8%D9%8A+3%E2%80%AD/@27.4988509,41.6881414,1038m/data=!3m2!1e3!4b1!4m6!3m5!1s0x1576474c23abb5c5:0x974f40eaf4a201c0!8m2!3d27.4988462!4d41.6855665!16s%2Fg%2F11b6t1npyx?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D',
  },
];

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

export default Footer;