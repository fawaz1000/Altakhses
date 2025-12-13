import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../config';
import { FaStethoscope, FaHeartbeat, FaHospital } from 'react-icons/fa';

// دالة مساعدة للحصول على URL الصورة الصحيح
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  // إذا كانت الصورة من Cloudinary أو أي مصدر خارجي
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // إذا كانت الصورة محلية
  return `${API_BASE}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

export default function Services() {
  const navigate = useNavigate();
  const [categoriesWithServices, setCategoriesWithServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer للتأثيرات البصرية
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('services');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // جلب بيانات الأقسام والخدمات من API
  const fetchCategoriesAndServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching categories and services from API...');
      
      // جلب الأقسام
      const categoriesResponse = await axios.get(`${API_BASE}/api/categories`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('✅ Categories response:', categoriesResponse.data);
      
      if (Array.isArray(categoriesResponse.data)) {
        const activeCategories = categoriesResponse.data.filter(cat => cat.isActive !== false);
        console.log(`✅ ${activeCategories.length} active categories loaded`);

        // جلب الخدمات لكل قسم
        const categoriesWithServicesData = await Promise.all(
          activeCategories.map(async (category) => {
            try {
              const servicesResponse = await axios.get(`${API_BASE}/api/services`, {
                params: { categoryId: category._id }
              });
              
              const services = servicesResponse.data || [];
              console.log(`✅ Found ${services.length} services for ${category.name}`);
              
              return {
                ...category,
                services: services,
                servicesCount: services.length
              };
            } catch (error) {
              console.error(`❌ Error fetching services for ${category.name}:`, error);
              return {
                ...category,
                services: [],
                servicesCount: 0
              };
            }
          })
        );

        setCategoriesWithServices(categoriesWithServicesData);
        
      } else {
        console.warn('⚠️ Categories response is not an array:', categoriesResponse.data);
        setCategoriesWithServices([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      setError('حدث خطأ في تحميل الأقسام الطبية');
      setCategoriesWithServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesAndServices();
  }, [fetchCategoriesAndServices]);

  // دالة للتنقل إلى خدمات القسم
  const handleCategoryClick = (category) => {
    const slug = category.slug || category._id || category.name?.replace(/\s+/g, '-').toLowerCase();
    navigate(`/services/category/${slug}`);
  };

  // معالجة حالة التحميل
  if (loading) {
    return (
      <section id="services" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-4 rtl text-right overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0d5047] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل الأقسام الطبية...</p>
        </div>
      </section>
    );
  }

  // معالجة حالة الخطأ
  if (error && categoriesWithServices.length === 0) {
    return (
      <section id="services" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-4 rtl text-right overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-5xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={fetchCategoriesAndServices}
            className="bg-[#0d5047] text-white px-6 py-3 rounded-lg hover:bg-[#28a49c] transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-4 rtl text-right overflow-hidden">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-[#0d5047]/20 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#28a49c]/30 rounded-full animate-ping delay-1500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#48d690] to-[#28a49c] rounded-3xl mb-8 shadow-2xl relative">
            <FaHospital className="text-white text-3xl" />
            <div className="absolute inset-0 bg-white/20 rounded-3xl animate-pulse"></div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black mb-6 relative">
            <span className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] bg-clip-text text-transparent">
              خدماتنا
            </span>
            <div className="absolute -inset-2 bg-gradient-to-r from-[#0d5047]/10 to-[#28a49c]/10 blur-2xl opacity-50 -z-10"></div>
          </h2>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-24 h-2 bg-gradient-to-r from-transparent to-[#0d5047] rounded-full animate-pulse"></div>
            <div className="w-12 h-12 border-4 border-[#0d5047] rounded-full flex items-center justify-center animate-spin-slow">
              <FaHeartbeat className="text-[#0d5047] animate-pulse" />
            </div>
            <div className="w-24 h-2 bg-gradient-to-l from-transparent to-[#28a49c] rounded-full animate-pulse"></div>
          </div>
          
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            تخصصات طبية متنوعة وخدمات متطورة بأحدث التقنيات العالمية
          </p>
        </div>

        {categoriesWithServices.length === 0 ? (
          // حالة عدم وجود أقسام
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <FaStethoscope className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              لا توجد أقسام طبية متاحة حالياً
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              نعمل على إضافة المزيد من الأقسام الطبية. يرجى المحاولة مرة أخرى لاحقاً.
            </p>
          </div>
        ) : (
          // عرض الأقسام
          <>
            {/* شبكة الأقسام - 4 أعمدة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              {categoriesWithServices.map((category, index) => (
                <div
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  className={`group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 hover:shadow-3xl border border-gray-100 cursor-pointer ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* خلفية متحركة */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d5047]/5 to-[#28a49c]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* أنماط ديكورية */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#0d5047] to-[#28a49c] rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-[#0d5047] to-[#28a49c] rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 transition-transform duration-700"></div>
                  </div>

                  <div className="relative z-10 p-8 text-center">
                    {/* صورة القسم */}
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#0d5047] to-[#28a49c] rounded-3xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 overflow-hidden">
                      {category.image ? (
                        <img
                          src={getImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load category image:', category.image);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`${category.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                        <FaStethoscope className="text-white text-2xl" />
                      </div>
                      <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* اسم القسم */}
                    <h3 className="text-xl font-bold mb-3 leading-none transition-all duration-500 text-[#0d5047] group-hover:scale-110">
                      {category.name || category.title}
                    </h3>
                    
                    {/* وصف القسم */}
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors leading-tight mb-6 line-clamp-2">
                      {category.description}
                    </p>

                    {/* معلومات الخدمات */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#0d5047]/5 rounded-full">
                        <span className="text-sm font-medium text-gray-700">
                          {category.servicesCount > 0 
                            ? `${category.servicesCount} خدمة متاحة`
                            : 'قريباً'
                          }
                        </span>
                      </div>
                    </div>

                    {/* مؤشر التفاعل */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2 text-[#28a49c] group-hover:text-[#48D690] transition-colors duration-300">
                        <span className="text-sm font-medium">
                          {category.servicesCount > 0 ? 'استكشف الخدمات' : 'استكشف القسم'}
                        </span>
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* مؤشر التقدم */}
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0d5047] to-[#28a49c] rounded-full transition-all duration-1000"
                        style={{ 
                          width: isVisible ? '100%' : '0%',
                          transitionDelay: `${index * 200}ms`
                        }}
                      />
                    </div>
                  </div>

                  {/* تأثير الإضاءة */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d5047]/10 to-[#28a49c]/10 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* دعوة للعمل */}
            <div className="text-center mt-20">
              <div className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
                {/* خلفية ديكورية */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20 animate-pulse delay-1000"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FaStethoscope className="text-white text-2xl" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    هل تحتاج إلى حجز موعد؟
                  </h3>
                  <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                    فريقنا الطبي المتخصص جاهز لتقديم أفضل الرعاية الطبية في جميع التخصصات
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="https://wa.me/966500069636"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-[#062b2d] font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      <span>احجز موعد الآن</span>
                      <span className="text-2xl group-hover:animate-pulse">📅</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* شعار ختامي */}
            
          </>
        )}
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
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
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