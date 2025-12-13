import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// استيراد API_BASE من ملف الإعداد
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

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [siteLogo, setSiteLogo] = useState(null);
  const [siteName, setSiteName] = useState('المجموعة الطبية');
  const [logoLoading, setLogoLoading] = useState(true);

  const menuItems = useMemo(() => [
    { href: '#hero', label: 'الرئيسية' },
    { href: '#about', label: 'من نحن' },
    { href: '#services', label: 'خدماتنا' },
    { href: '#doctors', label: 'الأطباء' },
    { href: '#media', label: 'قناة الإعلام' },
    { href: '#contact', label: 'تواصل معنا' },
  ], []);

  // جلب إعدادات الموقع
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

  // الاستماع لتحديثات الشعار من لوحة التحكم
  useEffect(() => {
    const handleLogoUpdate = (event) => {
      if (event.detail) {
        setSiteLogo(getImageUrl(event.detail));
      } else {
        setSiteLogo(null);
      }
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = menuItems.map(item => item.href.substring(1));
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuItems]);

  const handleCloseMenu = () => setOpen(false);

  const handleNavClick = (href) => {
    // إذا كان المستخدم في صفحة أخرى، ارجع للصفحة الرئيسية أولاً
    if (window.location.pathname !== '/') {
      window.location.href = `/${href}`;
      return;
    }
    
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-[999] transition-all duration-500 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-2xl border-b border-[#0d5047]/10' 
          : 'bg-white/80 backdrop-blur-md shadow-lg'
      }`} dir="rtl">
        <div className="container mx-auto px-6 flex items-center justify-between h-[85px]">
          {/* Logo */}
          <a 
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#hero');
            }}
            className="hover:scale-105 transition-transform duration-300"
          >
            {!logoLoading && siteLogo ? (
              <img 
                src={siteLogo} 
                alt={siteName} 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  // في حالة فشل تحميل الصورة، اعرض الشعار الاحتياطي
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* الشعار الاحتياطي */}
            <div 
              className={`${(!logoLoading && siteLogo) ? 'hidden' : 'flex'} items-center gap-3 group`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#48D690] via-[#28a49c] to-[#062B2D] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white text-lg font-bold">MT</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-2xl font-black bg-gradient-to-r from-[#062B2D] to-[#0d5047] bg-clip-text text-transparent">
                  {siteName}
                </div>
              </div>
            </div>
          </a>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-2">
            {menuItems.map((item, i) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <a
                  key={i}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={`relative text-base font-semibold px-4 py-3 rounded-xl transition-all duration-300 group flex items-center gap-2 ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-[#0d5047] to-[#28a49c] shadow-lg scale-105' 
                      : 'text-[#062B2D] hover:text-[#0d5047] hover:bg-[#0d5047]/5'
                  }`}
                >
                  {item.label}
                  {!isActive && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#0d5047] to-[#28a49c] transition-all duration-300 group-hover:w-full rounded-full"></span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* CTA Button */}
            <a
              href="https://wa.me/966500069636"
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden bg-gradient-to-r from-[#48D690] via-[#28a49c] to-[#48D690] bg-size-200 text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#0d5047] hover:shadow-2xl hover:scale-105 transition-all duration-500 text-sm flex items-center gap-2 group"
            >
              <span className="relative z-10">احجز موعد</span>
              <span className="text-lg group-hover:animate-pulse">💚</span>
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </a>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden relative w-10 h-10 flex flex-col justify-center items-center group p-1"
              onClick={() => setOpen(!open)}
              aria-label="فتح القائمة"
            >
              <div className="absolute inset-0 bg-[#0d5047]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className={`w-6 h-0.5 bg-[#062B2D] rounded-full transition-all duration-300 relative z-10 ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`w-6 h-0.5 bg-[#062B2D] rounded-full transition-all duration-300 relative z-10 my-1 ${open ? 'opacity-0 scale-0' : ''}`} />
              <span className={`w-6 h-0.5 bg-[#062B2D] rounded-full transition-all duration-300 relative z-10 ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav className={`lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-[#0d5047]/10 shadow-2xl transition-all duration-500 ${
          open ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-8'
        }`}>
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col gap-2">
              {menuItems.map((item, i) => {
                const isActive = activeSection === item.href.substring(1);
                return (
                  <a
                    key={i}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className={`flex items-center gap-3 text-lg font-semibold py-4 px-4 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-[#0d5047] to-[#28a49c] shadow-lg' 
                        : 'text-[#062B2D] hover:text-[#0d5047] hover:bg-[#0d5047]/5'
                    }`}
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animation: open ? 'slideInFromRight 0.5s ease-out forwards' : 'none'
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Overlay */}
        {open && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[-1] transition-opacity duration-300"
            onClick={handleCloseMenu}
          />
        )}
      </header>

      <style jsx>{`
        .bg-size-200 {
          background-size: 200% 100%;
        }
        .bg-pos-100 {
          background-position: 100% 0;
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 1023px) {
          nav a {
            opacity: 0;
            animation: slideInFromRight 0.5s ease-out forwards;
          }
        }
      `}</style>
    </>
  );
}