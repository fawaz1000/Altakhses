import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaChevronRight, FaChevronLeft, FaUserMd, FaStethoscope, FaGraduationCap, FaHeart } from 'react-icons/fa';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Doctors() {
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [isVisible, setIsVisible] = useState(false);
  const swiperRef = useRef(null);

  // بيانات الأطباء داخل الكومبوننت
  const doctors = [
    {
      id: 1,
      name: "د. أحمد محمد السعيد",
      specialty: "أخصائي القلب والأوعية الدموية",
      bio: "خبرة أكثر من 15 عاماً في جراحة القلب والقسطرة العلاجية",
      img: "/images/doctor1.jpg",
      link: null
    },
    {
      id: 2,
      name: "د. فاطمة علي الزهراني",
      specialty: "أخصائية الأطفال والرضع",
      bio: "متخصصة في طب الأطفال حديثي الولادة والعناية المركزة",
      img: "/images/doctor2.jpg",
      link: null
    },
    {
      id: 3,
      name: "د. محمد عبدالرحمن القحطاني",
      specialty: "أخصائي جراحة العظام",
      bio: "خبير في جراحة المفاصل الاصطناعية وإصابات الملاعب",
      img: "/images/doctor3.jpg",
      link: null
    },
    {
      id: 4,
      name: "د. نورا سالم العتيبي",
      specialty: "أخصائية الأمراض الجلدية",
      bio: "متخصصة في علاج الأمراض الجلدية والتجميل الطبي",
      img: "/images/doctor4.jpg",
      link: null
    },
    {
      id: 5,
      name: "د. خالد يوسف الغامدي",
      specialty: "أخصائي المسالك البولية",
      bio: "خبرة واسعة في جراحة المسالك البولية والمناظير",
      img: "/images/doctor5.jpg",
      link: null
    },
    {
      id: 6,
      name: "د. سارة أحمد الدوسري",
      specialty: "أخصائية النساء والولادة",
      bio: "متخصصة في الحمل عالي الخطورة والجراحات النسائية",
      img: "/images/doctor6.jpg",
      link: null
    }
  ];

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setSlidesPerView(w < 640 ? 1 : w < 1024 ? 2 : w < 1400 ? 3 : 4);
    };
    window.addEventListener('resize', update);
    update();
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('doctors');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="doctors" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-4 rtl scroll-mt-32 overflow-hidden">
      
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-80 h-80 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
    
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#0d5047]/20 rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-[#28a49c]/20 rounded-full animate-ping delay-1500"></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-[#0d5047]/30 rounded-full animate-ping delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#48D690] to-[#28a49c] rounded-3xl mb-8 shadow-2xl relative">
            <FaUserMd className="text-white text-3xl" />
            <div className="absolute inset-0 bg-white/20 rounded-3xl animate-pulse"></div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black mb-6 relative">
            <span className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] bg-clip-text text-transparent">
              الأطباء
            </span>
            <div className="absolute -inset-2 bg-gradient-to-r from-[#0d5047]/10 to-[#28a49c]/10 blur-2xl opacity-50 -z-10"></div>
          </h2>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-24 h-2 bg-gradient-to-r from-transparent to-[#0d5047] rounded-full animate-pulse"></div>
            <div className="w-12 h-12 border-4 border-[#0d5047] rounded-full flex items-center justify-center animate-spin-slow">
              <FaHeart className="text-[#0d5047] animate-pulse" />
            </div>
            <div className="w-24 h-2 bg-gradient-to-l from-transparent to-[#28a49c] rounded-full animate-pulse"></div>
          </div>
          
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            فريق من أمهر الأطباء المتخصصين لتقديم أفضل رعاية طبية
          </p>

          <div className="flex justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-black text-[#0d5047]">{doctors.length}+</div>
              <div className="text-sm text-gray-500">طبيب متخصص</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#28a49c]">15+</div>
              <div className="text-sm text-gray-500">تخصص طبي</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#062b2d]">24/7</div>
              <div className="text-sm text-gray-500">خدمة مستمرة</div>
            </div>
          </div>
        </div>

        {/* Doctors Carousel */}
        <div className="relative">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Navigation, Pagination, Autoplay]}
            centeredSlides={true}
            slidesPerView={slidesPerView}
            spaceBetween={32}
            loop={doctors.length > slidesPerView}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              el: '.doctors-pagination',
              clickable: true,
              dynamicBullets: true,
              renderBullet: (index, className) =>
                `<span class="${className} !w-3 !h-3 !bg-[#0d5047] !opacity-50 hover:!opacity-100 transition-all duration-300"></span>`,
            }}
            navigation={{
              nextEl: '.doctors-button-next',
              prevEl: '.doctors-button-prev',
            }}
            className="pb-16"
          >
            {doctors.map(({ id, img, name, specialty, bio, link }) => {
              const cardContent = (
                <div className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 mx-2 h-full ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                  {/* Card Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d5047]/5 to-[#28a49c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative p-6 text-center h-full flex flex-col">
                    {/* Avatar Section */}
                    <div className="relative inline-block mb-4 mx-auto">
                      <div className="w-24 h-24 mx-auto relative">
                        <img
                          src={img || '/default-avatar.png'}
                          alt={name}
                          className="w-full h-full object-cover rounded-full border-3 border-white shadow-lg group-hover:border-[#0d5047] transition-all duration-300 group-hover:scale-105"
                        />
                        {/* Status Indicator */}
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-[#0d5047] to-[#28a49c] border-3 border-white rounded-full flex items-center justify-center shadow-md">
                          <FaStethoscope className="text-white text-xs" />
                        </div>
                      </div>
                      
                      {/* Decorative Ring */}
                      <div className="absolute inset-0 w-24 h-24 mx-auto border-2 border-dashed border-[#0d5047]/20 rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Doctor Info */}
                    <div className="space-y-3 flex-grow flex flex-col justify-center">
                      <h3 className="text-lg font-black text-gray-800 group-hover:text-[#0d5047] transition-colors duration-300 leading-tight">
                        {name}
                      </h3>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-[#28a49c] flex items-center justify-center gap-2">
                          <FaGraduationCap className="text-[#0d5047] text-xs" />
                          {specialty}
                        </p>
                        
                        {/* شريط ديكوري */}
                        <div className="w-16 h-0.5 bg-gradient-to-r from-[#0d5047] to-[#28a49c] mx-auto rounded-full group-hover:w-24 transition-all duration-300" />
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed text-xs px-1 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                        {bio}
                      </p>

                      {/* زر الحجز */}
                      <div className="mt-4 transform transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
                        <a
                          href="https://wa.me/966500069636"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0d5047] to-[#28a49c] text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 group/btn text-sm"
                        >
                          <span>احجز موعد</span>
                          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover/btn:bg-white/30 transition-colors duration-300">
                            <FaChevronLeft className="text-xs group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* تأثير الإضاءة */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d5047]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                  </div>
                </div>
              );

              return (
                <SwiperSlide key={id}>
                  {link ? (
                    <a href={link} className="block h-full">
                      {cardContent}
                    </a>
                  ) : (
                    cardContent
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
            <button className="doctors-button-next group w-14 h-14 bg-white/90 backdrop-blur-md hover:bg-[#0d5047] border-2 border-[#0d5047]/20 hover:border-[#0d5047] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
              <FaChevronRight className="text-[#0d5047] group-hover:text-white text-lg group-hover:scale-110 transition-all duration-300" />
            </button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10">
            <button className="doctors-button-prev group w-14 h-14 bg-white/90 backdrop-blur-md hover:bg-[#0d5047] border-2 border-[#0d5047]/20 hover:border-[#0d5047] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
              <FaChevronLeft className="text-[#0d5047] group-hover:text-white text-lg group-hover:scale-110 transition-all duration-300" />
            </button>
          </div>

          {/* Custom Pagination */}
          <div className="doctors-pagination flex justify-center mt-12" />
        </div>
      </div>

      {/* Styles مخصصة */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
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
      `}</style>
    </section>
  );
}