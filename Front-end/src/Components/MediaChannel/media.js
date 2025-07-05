import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { API_BASE, MEDIA_CATEGORY, MEDIA_SLIDE_INTERVAL } from '../../config';
import { FaChevronRight, FaChevronLeft, FaTv, FaImage, FaExpand } from 'react-icons/fa';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const getSrc = (url) =>
  url ? (url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`) : '';

export default function MediaChannel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const videoRefs = useRef({});

  useEffect(() => {
    const controller = new AbortController();
    
    console.log('🔍 Fetching media items from category:', MEDIA_CATEGORY);
    
    axios
      .get(`${API_BASE}/api/media?category=${MEDIA_CATEGORY}`, { signal: controller.signal })
      .then((res) => {
        const mediaItems = res.data || [];
        console.log(`✅ Found ${mediaItems.length} media items`);
        setItems(mediaItems);
      })
      .catch((error) => {
        if (error.name !== 'CanceledError') {
          console.error('❌ Error fetching media items:', error);
        }
        setItems([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const toggleFullscreen = (element) => {
    if (!document.fullscreenElement) {
      element?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-gray-50 py-20 px-4 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="relative mb-12">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#48d690] to-[#28a49c] rounded-2xl animate-spin"></div>
              <div className="absolute inset-1 bg-white rounded-xl flex items-center justify-center">
                <FaTv className="text-3xl text-[#0d5047]" />
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

  if (!items.length) {
    return (
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-gray-50 py-20 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d5047]/10 to-[#28a49c]/10 rounded-3xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaTv className="w-16 h-16 text-[#0d5047]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">القناة الإعلامية</h2>
          <p className="text-gray-600">لا يوجد محتوى إعلامي متاح حالياً</p>
        </div>
      </section>
    );
  }

  return (
    <section id="media" className="relative bg-gradient-to-br from-slate-50 via-white to-gray-50 py-24 px-4 rtl text-right overflow-hidden">
      {/* خلفية ديكورية محسنة */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-gradient-to-br from-[#0d5047]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-gradient-to-br from-[#28a49c]/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d5047' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm-20 0c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm-20 0c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </div>

      {/* العنوان الرئيسي محسن */}
      <div className="relative z-10 max-w-6xl mx-auto text-center mb-20">
        <div className="inline-block relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#48d690] to-[#28a49c] rounded-3xl blur-xl opacity-30"></div>
          <div className="relative bg-gradient-to-br from-[#48d690] to-[#28a49c] p-1 rounded-3xl">
            <div className="bg-white rounded-[22px] px-6 py-4">
              <FaTv className="text-5xl text-[#0d5047]" />
            </div>
          </div>
        </div>
        
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
          <span className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] bg-clip-text text-transparent">
            القناة الإعلامية
          </span>
        </h2>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          استكشف آخر الأخبار والفعاليات والتطورات الطبية بتجربة تفاعلية مميزة
        </p>
      </div>

      {/* السلايدر الاحترافي */}
      <div className="relative z-10 max-w-[1800px] mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            // إيقاف جميع الفيديوهات عند التغيير
            Object.values(videoRefs.current).forEach(video => {
              if (video && !video.paused) {
                video.pause();
              }
            });
          }}
          spaceBetween={30}
          loop={items.length > 3}
          autoplay={{
            delay: MEDIA_SLIDE_INTERVAL,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            el: '.media-pagination',
            clickable: true,
            dynamicBullets: true,
            renderBullet: (index, className) => {
              return `<span class="${className}"></span>`;
            },
          }}
          navigation={{
            nextEl: '.media-button-next',
            prevEl: '.media-button-prev',
          }}
          className="media-swiper"
        >
          {items.map((item, index) => {
            const src = getSrc(item.url);
            const isVideo = /\.(mp4|webm|avi|mov)$/i.test(item.url || '');
            const isActive = activeIndex === index;

            return (
              <SwiperSlide key={item._id || index} className="swiper-slide-custom">
                <div 
                  id={`media-item-${index}`}
                  className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-700 ${
                    isActive 
                      ? 'shadow-2xl' 
                      : 'shadow-xl'
                  }`}
                  style={{ width: '600px', height: '600px' }}
                >
                  <div className="relative w-full h-full">
                    {isVideo ? (
                      <div className="relative w-full h-full bg-black">
                        <video
                          ref={(el) => { if (el) videoRefs.current[index] = el; }}
                          className="w-full h-full object-contain"
                          controls
                          controlsList="nodownload"
                          playsInline
                          webkit-playsinline="true"
                          x5-playsinline="true"
                          muted
                          preload="metadata"
                          poster=""
                          style={{ backgroundColor: '#000' }}
                        >
                          <source src={src} type="video/mp4" />
                          <source src={src} type="video/webm" />
                          <source src={src} type="video/ogg" />
                        </video>
                        
                        {/* مؤشر الفيديو */}
                        <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg pointer-events-none">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span>فيديو</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 group">
                        <img
                          src={src}
                          alt={item.title || 'media'}
                          loading="lazy"
                          className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg==';
                          }}
                        />
                        
                        {/* زر ملء الشاشة للصور */}
                        {isActive && (
                          <button
                            onClick={() => {
                              const imgElement = document.getElementById(`media-item-${index}`);
                              toggleFullscreen(imgElement);
                            }}
                            className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm hover:bg-[#0d5047]/80 text-white px-5 py-2.5 rounded-full text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
                          >
                            <FaExpand className="w-3 h-3" />
                            <span>عرض كامل</span>
                          </button>
                        )}
                        
                        {/* مؤشر الصورة */}
                        <div className="absolute top-6 right-6 bg-[#0d5047] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                          <FaImage className="w-3 h-3" />
                          <span>صورة</span>
                        </div>
                      </div>
                    )}
                    
                    {/* إطار للعنصر النشط */}
                    {isActive && (
                      <div className="absolute inset-0 border-4 border-[#0d5047]/30 rounded-3xl pointer-events-none"></div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* أزرار التنقل المحسنة */}
        {items.length > 1 && (
          <>
            <button
              className="media-button-prev absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-xl text-[#0d5047] hover:bg-[#0d5047] hover:text-white p-4 w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 hover:scale-110 group"
            >
              <FaChevronRight className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              className="media-button-next absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-xl text-[#0d5047] hover:bg-[#0d5047] hover:text-white p-4 w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 hover:scale-110 group"
            >
              <FaChevronLeft className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}

        {/* مؤشرات التنقل المحسنة */}
        <div className="media-pagination flex justify-center mt-12 gap-3" />

        {/* معلومات إضافية محسنة */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-xl border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0d5047] rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-bold text-lg">
                {activeIndex + 1} / {items.length}
              </span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <span className="text-gray-600 text-sm">
              {items[activeIndex]?.title || 'عنصر إعلامي'}
            </span>
          </div>
        </div>
      </div>

      {/* Styles محسنة */}
      <style jsx>{`
        .media-swiper {
          padding: 40px 0;
          overflow: visible !important;
        }
        
        .swiper-slide-custom {
          width: auto !important;
        }
        
        .media-swiper .swiper-slide {
          opacity: 1 !important;
        }
        
        .media-pagination {
          position: relative !important;
        }
        
        .media-pagination .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #e5e7eb;
          opacity: 1;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .media-pagination .swiper-pagination-bullet::after {
          content: '';
          position: absolute;
          inset: 2px;
          background: white;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .media-pagination .swiper-pagination-bullet-active {
          background: #0d5047;
          width: 32px;
          border-radius: 6px;
        }
        
        .media-pagination .swiper-pagination-bullet-active::after {
          opacity: 0.3;
          border-radius: 4px;
        }
        
        @media (max-width: 1024px) {
          .media-button-prev { right: 20px !important; }
          .media-button-next { left: 20px !important; }
        }
        
        @media (max-width: 768px) {
          .swiper-slide-custom > div {
            width: 500px !important;
            height: 500px !important;
          }
        }
        
        @media (max-width: 640px) {
          .swiper-slide-custom > div {
            width: 90vw !important;
            height: 90vw !important;
            max-width: 400px !important;
            max-height: 400px !important;
          }
        }
      `}</style>
    </section>
  );
}