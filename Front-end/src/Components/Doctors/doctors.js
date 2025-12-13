import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import {
  FaChevronRight,
  FaChevronLeft,
  FaStethoscope,
  FaHeart,
  FaSpinner,
  FaExclamationTriangle,
  FaUserMd,
  FaGraduationCap
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import axios from 'axios';
import { API_BASE } from '../../config';

// استيراد CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

export default function Doctors() {
  const navigate = useNavigate();
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [isVisible, setIsVisible] = useState(false);
  const [specialtiesWithDoctors, setSpecialtiesWithDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalDoctorsCount, setTotalDoctorsCount] = useState(0);
  const swiperRef = useRef(null);

  // جلب الأطباء واستخراج التخصصات الموجودة
  const fetchDoctorsAndSpecialties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching doctors and their specialties...');
      
      // جلب جميع الأطباء
      const doctorsResponse = await axios.get(`${API_BASE}/api/doctors`);
      console.log('✅ Doctors response:', doctorsResponse.data);
      
      let doctorsData = [];
      if (doctorsResponse.data && doctorsResponse.data.success && Array.isArray(doctorsResponse.data.data)) {
        doctorsData = doctorsResponse.data.data;
      } else if (Array.isArray(doctorsResponse.data)) {
        doctorsData = doctorsResponse.data;
      }
      
      console.log(`✅ Found ${doctorsData.length} doctors`);
      setTotalDoctorsCount(doctorsData.length);
      
      if (doctorsData.length === 0) {
        setSpecialtiesWithDoctors([]);
        return;
      }
      
      // تجميع الأطباء حسب التخصص
      const specialtyGroups = {};
      
      doctorsData.forEach(doctor => {
        if (doctor.specialty && doctor.isActive !== false) {
          const specialtyId = doctor.specialty._id || doctor.specialty;
          const specialtyName = doctor.specialty.name || doctor.specialty;
          const specialtyImage = doctor.specialty.image || doctor.specialty.icon;
          const specialtySlug = doctor.specialty.slug;
          
          console.log('Doctor specialty data:', {
            name: specialtyName,
            image: doctor.specialty.image,
            icon: doctor.specialty.icon,
            fullSpecialty: doctor.specialty
          });
          
          if (!specialtyGroups[specialtyId]) {
            specialtyGroups[specialtyId] = {
              _id: specialtyId,
              name: specialtyName,
              image: specialtyImage,
              slug: specialtySlug,
              doctors: [],
              doctorsCount: 0
            };
          }
          
          specialtyGroups[specialtyId].doctors.push(doctor);
          specialtyGroups[specialtyId].doctorsCount++;
        }
      });
      
      // تحويل إلى array وترتيب حسب عدد الأطباء
      const specialtiesArray = Object.values(specialtyGroups)
        .sort((a, b) => b.doctorsCount - a.doctorsCount);
      
      console.log(`✅ Found ${specialtiesArray.length} specialties with doctors`);
      setSpecialtiesWithDoctors(specialtiesArray);
      
    } catch (error) {
      console.error('❌ Error fetching doctors and specialties:', error);
      setError('حدث خطأ في تحميل بيانات الأطباء');
      
      setSpecialtiesWithDoctors([]);
      setTotalDoctorsCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorsAndSpecialties();
  }, [fetchDoctorsAndSpecialties]);

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

  // دالة للتنقل إلى صفحة أطباء التخصص
  const handleSpecialtyClick = (specialty) => {
    const slug = specialty.slug || specialty.name?.replace(/\s+/g, '-').toLowerCase();
    navigate(`/doctors/${slug}`);
  };

  if (loading) {
    return (
      <section id="doctors" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-4 rtl scroll-mt-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-80 h-80 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0d5047] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل بيانات الأطباء...</p>
        </div>
      </section>
    );
  }

  if (error && specialtiesWithDoctors.length === 0) {
    return (
      <section id="doctors" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-4 rtl scroll-mt-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ في التحميل</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDoctorsAndSpecialties}
            className="bg-[#0d5047] text-white px-6 py-3 rounded-lg hover:bg-[#28a49c] transition-colors duration-300"
          >
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  if (specialtiesWithDoctors.length === 0) {
    return (
      <section id="doctors" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-4 rtl scroll-mt-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d5047]/10 to-[#28a49c]/10 rounded-3xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaUserMd className="w-16 h-16 text-[#0d5047]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">الأطباء</h2>
          <p className="text-gray-600 mb-8">لا يوجد أطباء مسجلين في النظام حالياً</p>
          <p className="text-gray-500 text-sm">يرجى إضافة أطباء من لوحة التحكم لعرض التخصصات المتاحة</p>
        </div>
      </section>
    );
  }

  return (
    <section id="doctors" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-4 rtl text-right overflow-hidden">
      
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
            تخصصات طبية متنوعة مع أفضل الأطباء المتخصصين
          </p>

          <div className="flex justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-black text-[#0d5047]">{specialtiesWithDoctors.length}+</div>
              <div className="text-sm text-gray-500">تخصص متاح</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#28a49c]">{totalDoctorsCount}+</div>
              <div className="text-sm text-gray-500">طبيب متخصص</div>
            </div>
          </div>
        </div>

        {/* Specialties Carousel */}
        <div className="relative">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Navigation, Pagination, Autoplay]}
            centeredSlides={true}
            slidesPerView={slidesPerView}
            spaceBetween={32}
            loop={specialtiesWithDoctors.length > slidesPerView}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              el: '.specialties-pagination',
              clickable: true,
              dynamicBullets: true,
              renderBullet: (index, className) =>
                `<span class="${className} !w-3 !h-3 !bg-[#0d5047] !opacity-50 hover:!opacity-100 transition-all duration-300"></span>`,
            }}
            navigation={{
              nextEl: '.specialties-button-next',
              prevEl: '.specialties-button-prev',
            }}
            className="pb-16"
          >
            {specialtiesWithDoctors.map((specialty, index) => (
              <SwiperSlide key={specialty._id}>
                <div 
                  className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100 mx-2 h-full cursor-pointer ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                  onClick={() => handleSpecialtyClick(specialty)}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* شريط علوي متدرج */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c]"></div>
                  
                  {/* خلفية متحركة */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d5047]/5 to-[#28a49c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* محتوى الكرت */}
                  <div className="relative p-6 text-center h-full flex flex-col">
                    {/* صورة التخصص */}
                    <div className="relative inline-block mb-4 mx-auto">
                      <div className="w-20 h-20 mx-auto relative">
                        {/* حلقة ديكورية خلفية */}
                        <div className="absolute inset-0 w-20 h-20 border-2 border-dashed border-[#0d5047]/20 rounded-full animate-spin-slow group-hover:border-[#28a49c]/40 transition-colors duration-500"></div>
                        
                        {/* الصورة الأساسية */}
                        <div className="w-full h-full rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 overflow-hidden bg-gradient-to-br from-[#0d5047] to-[#28a49c] relative">
                          {/* إطار داخلي */}
                          <div className="absolute inset-1 bg-white rounded-full shadow-inner"></div>
                          
                          {/* الصورة */}
                          <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                            {specialty.image ? (
                              <img
                                src={getImageUrl(specialty.image)}
                                alt={specialty.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`${specialty.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                              <FaStethoscope className="text-[#0d5047] text-lg" />
                            </div>
                          </div>
                          
                          {/* شارة التميز */}
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <MdVerified className="text-white text-xs" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* معلومات التخصص */}
                    <div className="space-y-3 flex-grow flex flex-col justify-center">
                      <h3 className="text-lg font-black text-gray-800 group-hover:text-[#0d5047] transition-colors duration-300 leading-tight">
                        {specialty.name}
                      </h3>
                      
                      {/* شريط معلومات */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#0d5047]/10 to-[#28a49c]/10 rounded-full">
                          <FaUserMd className="text-[#0d5047] text-xs" />
                          <span className="text-xs font-bold text-[#0d5047]">{specialty.doctorsCount} طبيب</span>
                        </div>
                      </div>
                      
                      {/* شريط ديكوري متحرك */}
                      <div className="w-12 h-0.5 bg-gradient-to-r from-[#0d5047] to-[#28a49c] mx-auto rounded-full group-hover:w-16 transition-all duration-500" />
                      
                      {/* زر الإجراء */}
                      <div className="mt-4 transform transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0d5047] to-[#28a49c] text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 group/btn text-xs">
                          <FaGraduationCap className="text-xs" />
                          <span>عرض الأطباء</span>
                          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                            <FaChevronRight className="text-xs group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* تأثير الضوء */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d5047]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
                    
                    {/* نقاط ديكورية */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-[#28a49c]/30 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-4 left-4 w-1 h-1 bg-[#0d5047]/40 rounded-full animate-pulse delay-1000"></div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* أسهم تنقل محسنة */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
            <button className="specialties-button-next group w-12 h-12 bg-white hover:bg-[#0d5047] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-gray-200 hover:border-[#0d5047]">
              <FaChevronRight className="text-[#0d5047] group-hover:text-white text-lg transition-all duration-300" />
            </button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10">
            <button className="specialties-button-prev group w-12 h-12 bg-white hover:bg-[#0d5047] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-gray-200 hover:border-[#0d5047]">
              <FaChevronLeft className="text-[#0d5047] group-hover:text-white text-lg transition-all duration-300" />
            </button>
          </div>

          {/* مؤشرات التنقل */}
          <div className="specialties-pagination flex justify-center mt-12" />
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
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}