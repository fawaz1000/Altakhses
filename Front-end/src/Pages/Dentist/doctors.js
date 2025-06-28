import React, { useRef, useEffect, useState } from 'react';
import { doctors } from '../../Data/dentist/doctors';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { FaChevronRight, FaChevronLeft, FaTooth, FaStar, FaPlay, FaCalendarAlt } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

export default function DentistDoctors() {
  const [isVisible, setIsVisible] = useState(false);
  const [, setActiveSlide] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('dentist-doctors');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="dentist-doctors" className="relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900 py-20 px-4 rtl overflow-hidden">
      
      {/* خلفية متحركة متطورة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        {/* نقاط متحركة */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-teal-400 rounded-full animate-ping delay-1000"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* العنوان الفائق الحداثة */}
        <div className="text-center mb-16 relative">
          {/* أيقونة مبتكرة */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-400 rounded-2xl rotate-12 flex items-center justify-center shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/50 via-cyan-400/50 to-teal-400/50 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <FaTooth className="text-white text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-2 border-2 border-emerald-400/30 rounded-2xl animate-spin-slow"></div>
            </div>
          </div>
          
          {/* عنوان جلاسمورفيزم */}
          <div className="relative">
            <h2 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 relative">
              <span className="bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent leading-tight block">
                أطباء
              </span>
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent leading-tight block -mt-4">
                الأسنان
              </span>
            </h2>
            <div className="absolute -inset-8 bg-gradient-to-r from-emerald-400/5 via-cyan-400/5 to-teal-400/5 blur-3xl rounded-full"></div>
          </div>
          
          {/* وصف مع تأثير نيومورفيزم */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
                نخبة من أطباء الأسنان المتخصصين 
                <span className="text-emerald-300 font-medium"> بخبرات عالمية </span>
                لتقديم أفضل رعاية صحية متقدمة
              </p>
            </div>
          </div>

          {/* إحصائيات متحركة */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { number: doctors.length + "+", label: "طبيب متخصص", color: "emerald" },
              { number: "24/7", label: "خدمة متاحة", color: "cyan" },
              { number: "100%", label: "رضا العملاء", color: "teal" }
            ].map((stat, index) => (
              <div key={index} className="relative group">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className={`text-3xl font-black text-${stat.color}-300 mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.label}
                  </div>
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-${stat.color}-400/20 to-${stat.color}-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* سلايدر متطور مع تأثير 3D */}
        <div className="relative">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            spaceBetween={30}
            coverflowEffect={{
              rotate: 15,
              stretch: 0,
              depth: 300,
              modifier: 1,
              slideShadows: true,
            }}
            loop={doctors.length > 3}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              el: '.dentist-pagination',
              clickable: true,
              renderBullet: (index, className) => `
                <span class="${className} w-3 h-3 bg-emerald-400/50 border-2 border-emerald-400 rounded-full hover:bg-emerald-400 transition-all duration-300 cursor-pointer"></span>
              `,
            }}
            navigation={{
              nextEl: '.dentist-next',
              prevEl: '.dentist-prev',
            }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-16"
          >
            {doctors.map(({ id, img, name, specialty, bio }, index) => (
              <SwiperSlide key={id} style={{ width: '350px' }}>
                <div className={`group relative h-[500px] transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                  {/* بطاقة جلاسمورفيزم */}
                  <div className="relative h-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden hover:bg-white/15 transition-all duration-500 hover:scale-105">
                    
                    {/* تأثير متدرج */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* صورة الطبيب */}
                    <div className="relative h-64 overflow-hidden rounded-t-3xl">
                      <img
                        src={img || '/default-avatar.png'}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
                      {/* تقييم */}
                      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-white text-sm font-bold">4.9</span>
                      </div>
                      
                      {/* أيقونة التشغيل */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                          <FaPlay className="text-white text-xl mr-1" />
                        </div>
                      </div>
                    </div>

                    {/* معلومات الطبيب */}
                    <div className="p-6 text-center space-y-4">
                      <h3 className="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors duration-300">
                        {name}
                      </h3>
                      
                      <div className="inline-block bg-gradient-to-r from-emerald-400 to-cyan-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {specialty}
                      </div>
                      
                      {bio && (
                        <p className="text-gray-300 text-sm leading-relaxed px-2 line-clamp-2">
                          {bio}
                        </p>
                      )}

                      {/* أزرار العمل */}
                      <div className="flex gap-3 justify-center mt-6">
                        <button className="flex-1 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold py-3 px-6 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                          <FaCalendarAlt className="text-sm" />
                          <span>احجز موعد</span>
                        </button>
                      </div>
                    </div>

                    {/* خط مضيء */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* أزرار تنقل متطورة */}
          <button className="dentist-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 group">
            <FaChevronLeft className="text-white text-lg group-hover:scale-110 transition-transform duration-300" />
          </button>
          
          <button className="dentist-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 group">
            <FaChevronRight className="text-white text-lg group-hover:scale-110 transition-transform duration-300" />
          </button>

          {/* مؤشرات حديثة */}
          <div className="dentist-pagination flex justify-center mt-8 gap-2"></div>
        </div>

        {/* قسم إضافي للتفاعل */}
        <div className="text-center mt-16">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              جاهزون لخدمتكم على مدار الساعة
            </h3>
            <p className="text-gray-300 mb-6">
              احجز موعدك الآن واحصل على استشارة مجانية مع أفضل أطباء الأسنان
            </p>
            <button className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 text-black font-bold py-4 px-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              احجز استشارة مجانية
            </button>
          </div>
        </div>
      </div>

      {/* أنماط مخصصة */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .swiper-slide-shadow-left,
        .swiper-slide-shadow-right {
          background: linear-gradient(to right, rgba(16, 185, 129, 0.2), transparent);
        }
      `}</style>
    </section>
  );
}