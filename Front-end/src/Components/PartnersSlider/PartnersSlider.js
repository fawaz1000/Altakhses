// Front-end/src/Components/PartnersSlider/PartnersSlider.js - مُحسَّن مع حركة صحيحة
import React, { useState, useEffect } from 'react';
import { FaHandshake } from 'react-icons/fa';
import axios from 'axios';

// استيراد التكوين
import { API_BASE } from '../../config';

// دالة للحصول على URL الصورة
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export default function PartnersSlider() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchPartners = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/partners`, { 
          signal: controller.signal 
        });
        
        console.log('Partners data:', response.data);
        
        // التأكد من أن البيانات مصفوفة
        if (Array.isArray(response.data)) {
          setPartners(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setPartners(response.data.data);
        } else {
          console.error('Invalid partners data format:', response.data);
          setPartners([]);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('خطأ في جلب الشراكات:', error);
          setPartners([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
    return () => controller.abort();
  }, []);

  // حالة التحميل
  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-gray-50 py-20 px-4 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="relative mb-12">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#48d690] to-[#28a49c] rounded-2xl animate-spin"></div>
              <div className="absolute inset-1 bg-white rounded-xl flex items-center justify-center">
                <FaHandshake className="text-3xl text-[#0d5047]" />
              </div>
            </div>
          </div>
          
          <h3 className="text-3xl font-black text-gray-800 mb-4">جاري التحميل...</h3>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-[#0d5047] rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-[#48d690] rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-[#28a49c] rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </section>
    );
  }

  // في حالة عدم وجود شراكات
  if (!partners.length) {
    return (
      <section className="relative bg-white py-20 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d5047]/10 to-[#28a49c]/10 rounded-3xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaHandshake className="w-16 h-16 text-[#0d5047]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">الشراكات المجتمعية</h2>
          <p className="text-gray-600">لا توجد شراكات متاحة حالياً</p>
        </div>
      </section>
    );
  }

  // مكون الشريك الواحد
  const PartnerItem = ({ partner, className = "" }) => (
    <div className={`flex-shrink-0 mx-6 transition-all duration-700 group ${className}`}>
      <div className="relative w-60 h-48 bg-transparent p-6 flex flex-col items-center justify-center">
        {/* الشعار */}
        <div className="mb-4 h-20 flex items-center justify-center">
          {partner.logo ? (
            <img
              src={getImageUrl(partner.logo)}
              alt={partner.name}
              className="max-h-full max-w-[160px] object-contain filter grayscale hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
              onError={(e) => {
                console.error('خطأ في تحميل شعار الشريك:', partner.name);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-16 h-16 bg-gray-200 rounded-full ${partner.logo ? 'hidden' : 'flex'} items-center justify-center`}>
            <FaHandshake className="text-xl text-gray-400" />
          </div>
        </div>

        {/* الأسماء */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-[#0d5047] transition-colors duration-300">
            {partner.name}
          </h3>
          {partner.enName && (
            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              {partner.enName}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-gray-50 py-24 px-4 rtl text-right overflow-hidden">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-gradient-to-br from-[#0d5047]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-gradient-to-br from-[#28a49c]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* العنوان الرئيسي */}
      <div className="relative z-10 max-w-6xl mx-auto text-center mb-20">
        <div className="inline-block relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#48d690] to-[#28a49c] rounded-3xl blur-xl opacity-30"></div>
          <div className="relative bg-gradient-to-br from-[#48d690] to-[#28a49c] p-1 rounded-3xl">
            <div className="bg-white rounded-[22px] px-6 py-4">
              <FaHandshake className="text-5xl text-[#0d5047]" />
            </div>
          </div>
        </div>
        
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
          <span className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] bg-clip-text text-transparent">
            الشراكات المجتمعية
          </span>
        </h2>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          نؤمن بأهمية التعاون المجتمعي لتحقيق أفضل الخدمات الصحية
        </p>
      </div>

      {/* Container للشراكات */}
      <div className="relative z-10 max-w-[1800px] mx-auto">
        {partners.length > 1 ? (
          // عرض متحرك للشراكات المتعددة
          <div className="relative overflow-hidden">
            <div className="flex animate-seamless-scroll whitespace-nowrap">
              {/* المجموعة الأولى */}
              {partners.map((partner) => (
                <PartnerItem key={partner._id} partner={partner} />
              ))}
              {/* المجموعة المكررة للاستمرارية */}
              {partners.map((partner) => (
                <PartnerItem key={`copy-${partner._id}`} partner={partner} />
              ))}
            </div>
          </div>
        ) : (
          // عرض ثابت للشريك الواحد
          <div className="flex justify-center">
            <PartnerItem partner={partners[0]} />
          </div>
        )}
      </div>

      {/* Custom CSS Styles */}
      <style jsx>{`
        @keyframes seamless-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-seamless-scroll {
          animation: seamless-scroll ${Math.max(20, partners.length * 3)}s linear infinite;
          width: fit-content;
        }
        
        .animate-seamless-scroll:hover {
          animation-play-state: paused;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .animate-seamless-scroll {
            animation-duration: ${Math.max(15, partners.length * 2.5)}s;
          }
        }
        
        @media (max-width: 640px) {
          .animate-seamless-scroll {
            animation-duration: ${Math.max(12, partners.length * 2)}s;
          }
        }
      `}</style>
    </section>
  );
}