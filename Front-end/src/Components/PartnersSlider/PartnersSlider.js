import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import Hail from '../../Assets/hail.jpg';

// البيانات الأصلية من الدالة
const partners = [
  { name: 'إمارة منطقة حائل', enName: 'Hail.gov.sa', logo: Hail },
];

export default function PartnersSlider() {
  const [ setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);
  

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white rtl">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="text-center mb-16">
          {/* أيقونة الشراكات */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#48d690] to-[#28a49c] rounded-3xl mb-8 shadow-2xl relative group mx-auto">
            {/* رمز المصافحة SVG */}
            <svg 
              className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M11 14H9c0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-2.21-1.79-4-4-4s-4 1.79-4 4z"/>
              <path d="M7 18c-1.1 0-2-.9-2-2V9.5C5 8.12 6.12 7 7.5 7S10 8.12 10 9.5c0 .28.22.5.5.5s.5-.22.5-.5C11 7.57 9.43 6 7.5 6S4 7.57 4 9.5V16c0 1.66 1.34 3 3 3s3-1.34 3-3c0-.28-.22-.5-.5-.5S9 15.72 9 16c0 1.1-.9 2-2 2z"/>
              <path d="M15.5 16c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              <path d="M18.5 13c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
            <div className="absolute inset-0 bg-white/10 rounded-3xl animate-pulse"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-[#0d5047]/30 to-[#28a49c]/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          {/* العنوان الرئيسي */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 relative">
            <span className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] bg-clip-text text-transparent">
              الشراكات
            </span>
            <div className="absolute -inset-4 bg-gradient-to-r from-[#0d5047]/5 to-[#28a49c]/5 blur-3xl opacity-50 -z-10 rounded-full"></div>
          </h2>
          
          {/* الخط الديكوري */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#0d5047] to-transparent rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-[#0d5047] rounded-full animate-ping"></div>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#28a49c] to-transparent rounded-full animate-pulse"></div>
          </div>
          
          {/* الوصف */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            شراكات استراتيجية مع أهم المؤسسات والجهات الحكومية لتقديم أفضل الخدمات
          </p>
        </div>

        {/* Swiper Container */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => {
              setCurrentSlide(swiper.activeIndex);
            }}
            spaceBetween={40}
            slidesPerView={1}
            centeredSlides={true}
            loop={partners.length > 1}
            navigation={{
              nextEl: '.partners-button-next',
              prevEl: '.partners-button-prev',
            }}
            pagination={{
              el: '.partners-pagination',
              clickable: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 50,
              },
              1280: {
                slidesPerView: 5,
                spaceBetween: 60,
              }
            }}
            className="partners-swiper pb-16"
          >
            {partners.map((partner, index) => (
              <SwiperSlide key={index}>
                <div className="group relative">
                  {/* البطاقة الرئيسية */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 p-8 border border-gray-100 hover:-translate-y-2 h-full flex flex-col items-center justify-center min-h-[280px] group-hover:border-[#0d5047]/30">
                    
                    {/* الشعار */}
                    <div className="relative mb-6 w-full h-24 flex items-center justify-center">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-h-20 max-w-32 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjMGQ1MDQ3Ii8+Cjx0ZXh0IHg9IjYwIiB5PSI2NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzBkNTA0NyIgZm9udC1zaXplPSIxMnB4Ij7YtNix2YrZg88L3RleHQ+Cjwvc3ZnPgo=`;
                        }}
                      />
                    </div>

                    {/* النصوص */}
                    <div className="text-center space-y-3 flex-grow flex flex-col justify-center">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#0d5047] transition-colors duration-300">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {partner.enName}
                      </p>
                      {partner.description && (
                        <p className="text-xs text-gray-400 leading-relaxed px-2">
                          {partner.description}
                        </p>
                      )}
                    </div>

                    {/* تأثيرات التصميم */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d5047]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                    
                    {/* خط ديكوري */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0d5047] to-[#28a49c] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl"></div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* أزرار التنقل */}
          <button className="partners-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-[#0d5047] hover:bg-[#0d5047] hover:text-white transition-all duration-300 hover:scale-110">
            <FaChevronLeft className="w-5 h-5" />
          </button>
          
          <button className="partners-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-[#0d5047] hover:bg-[#0d5047] hover:text-white transition-all duration-300 hover:scale-110">
            <FaChevronRight className="w-5 h-5" />
          </button>

          {/* النقاط السفلية */}
          <div className="partners-pagination flex justify-center mt-8"></div>
        </div>
      </div>

      {/* Custom CSS للـ Pagination */}
      <style jsx>{`
        :global(.partners-pagination .swiper-pagination-bullet) {
          width: 12px;
          height: 12px;
          background: #d1d5db;
          opacity: 1;
          margin: 0 6px;
          transition: all 0.3s ease;
        }

        :global(.partners-pagination .swiper-pagination-bullet-active) {
          background: #0d5047;
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(13, 80, 71, 0.3);
        }

        :global(.partners-swiper) {
          overflow: visible;
        }

        :global(.partners-swiper .swiper-slide) {
          transition: all 0.3s ease;
        }

        :global(.partners-swiper .swiper-slide:not(.swiper-slide-active)) {
          opacity: 0.7;
          transform: scale(0.95);
        }

        :global(.partners-swiper .swiper-slide-active) {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>
    </section>
  );
}