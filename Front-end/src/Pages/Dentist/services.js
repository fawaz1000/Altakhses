// src/Pages/DentistPage.jsx
import React from 'react';
import { FaTooth, FaCheckCircle, FaShieldAlt, FaAward } from 'react-icons/fa';
import { dentistServices } from '../../Data/dentist/services';

export default function DentistPage() {
  return (
    <section id="dentist" className="relative bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 pt-28 pb-20 px-6 rtl scroll-mt-32 overflow-hidden">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-20 w-40 h-40 bg-emerald-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-56 h-56 bg-teal-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-green-400 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* العنوان الرئيسي */}
      <div className="text-center mb-16 relative z-10">
        <div className="inline-block relative">
          {/* أيقونة مميزة */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-6 shadow-2xl border-4 border-emerald-100">
                <FaTooth className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600" />
              </div>
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-emerald-700 to-teal-700 tracking-tight leading-tight mb-4">
            طب وجراحة الأسنان
          </h2>
          
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="h-1.5 w-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
            <FaTooth className="text-emerald-500 text-lg animate-bounce" />
            <div className="h-1.5 w-16 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"></div>
          </div>
        </div>
        
        <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
          خدمات متكاملة لرعاية الفم والأسنان، نقدمها بأحدث التقنيات العالمية وعلى يد نخبة من الأطباء المتخصصين ذوي الخبرة العالية.
        </p>

        {/* شارات الجودة */}
        <div className="flex justify-center items-center gap-8 mt-8">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-emerald-100">
            <FaShieldAlt className="text-emerald-500" />
            <span className="text-sm font-semibold text-gray-700">معتمد دولياً</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-teal-100">
            <FaAward className="text-teal-500" />
            <span className="text-sm font-semibold text-gray-700">جودة عالية</span>
          </div>
        </div>
      </div>

      {/* بطاقات الخدمات */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {dentistServices.map(({ id, service, desc }, index) => (
            <div
              key={id}
              className="group relative bg-white/95 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* تأثير الإضاءة */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* شريط جانبي متدرج */}
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-600 group-hover:w-3 transition-all duration-500 rounded-r-full"></div>
              
              {/* رقم الخدمة */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="p-8 md:p-10 relative z-10">
                {/* عنوان الخدمة */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-3 rounded-2xl shadow-inner group-hover:shadow-lg transition-shadow duration-300">
                      <FaTooth className="text-emerald-600 text-xl group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300 leading-tight">
                    {service}
                  </h3>
                  
                  {/* خط فاصل */}
                  <div className="mt-4 h-0.5 w-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full group-hover:w-20 transition-all duration-500"></div>
                </div>

                {/* قائمة الخدمات */}
                <ul className="space-y-4 text-gray-700">
                  {desc.split('\n').map((line, idx) => (
                    <li 
                      key={idx} 
                      className="flex items-start group/item hover:bg-emerald-50/50 p-2 -m-2 rounded-xl transition-all duration-300"
                      style={{
                        animationDelay: `${(index * 100) + (idx * 50)}ms`
                      }}
                    >
                      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-1 rounded-full mt-1 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300">
                        <FaCheckCircle className="text-white text-xs" />
                      </div>
                      <span className="mr-3 text-sm md:text-base leading-relaxed group-hover/item:text-gray-900 transition-colors duration-300">
                        {line.replace(/^•\s*/, '')}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* تأثير ديكوري في الأسفل */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex justify-center">
                    <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 rounded-full group-hover:w-24 transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* قسم إضافي للثقة */}
      <div className="max-w-4xl mx-auto mt-20 text-center relative z-10">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            لماذا تختار عيادتنا؟
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTooth className="text-emerald-600 text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">تقنيات حديثة</h4>
              <p className="text-sm text-gray-600">أحدث الأجهزة والتقنيات العالمية</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaShieldAlt className="text-emerald-600 text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">أمان وجودة</h4>
              <p className="text-sm text-gray-600">معايير السلامة والجودة العالمية</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaAward className="text-emerald-600 text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">خبرة متميزة</h4>
              <p className="text-sm text-gray-600">فريق طبي متخصص وذو خبرة عالية</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS مخصص للتحريك */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .grid > div {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </section>
  );
}