import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {  
  FaStethoscope,
  FaExclamationTriangle,
  FaChevronRight,
  FaHome,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle
} from 'react-icons/fa';
import { API_BASE } from '../../config';

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

export default function ServicesByCategory() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // التأكد من التمرير لأعلى الصفحة عند التحميل
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // التأكد من التمرير لأعلى عند تغيير categorySlug
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug]);

  // جلب بيانات القسم والخدمات
  const fetchCategoryAndServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب جميع الأقسام للعثور على القسم المطلوب
      const categoriesResponse = await axios.get(`${API_BASE}/api/categories`);
      const categories = categoriesResponse.data || [];
      
      // البحث عن القسم بالـ slug أو الـ ID
      const foundCategory = categories.find(cat => 
        cat.slug === categorySlug || 
        cat._id === categorySlug ||
        cat.name === categorySlug
      );

      if (!foundCategory) {
        setError('القسم المطلوب غير موجود');
        setLoading(false);
        return;
      }

      setCategory(foundCategory);

      // جلب خدمات هذا القسم
      const servicesResponse = await axios.get(`${API_BASE}/api/services`, {
        params: { 
          categoryId: foundCategory._id,
          populate: 'category'
        }
      });
      
      const servicesData = servicesResponse.data || [];
      setServices(servicesData);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchCategoryAndServices();
  }, [fetchCategoryAndServices]);

  // دالة للانتقال إلى صفحة تفاصيل الخدمة
  const handleServiceClick = (service) => {
    const serviceSlug = (service.name || service.title || '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\u0600-\u06FF]+/g, '')
      .toLowerCase() || service._id;
    
    navigate(`/services/category/${categorySlug}/${serviceSlug}`);
  };

  // معالجة حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-[#062b2d] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-[#28a49c]/30 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-[#062b2d] mb-2">جاري التحميل</h3>
          <p className="text-gray-600 text-lg">يتم تحميل خدمات القسم...</p>
        </div>
      </div>
    );
  }

  // معالجة حالة الخطأ
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center px-6">
        <div className="text-center max-w-lg mx-auto bg-white rounded-3xl p-10 shadow-2xl border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-8">
            <FaExclamationTriangle className="text-4xl text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">عذراً، حدث خطأ</h2>
          <p className="text-gray-600 mb-10 text-lg leading-relaxed">{error}</p>
          <div className="flex flex-col gap-4">
            <button
              onClick={fetchCategoryAndServices}
              className="bg-gradient-to-r from-[#062b2d] to-[#0d5047] text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate('/services')}
              className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold"
            >
              العودة للأقسام
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100" dir="rtl">
      {/* شبكة ديكورية في الخلفية */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(6, 43, 45, 0.1) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* خلفية متحركة */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#28a49c]/20 to-[#062b2d]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#0d5047]/20 to-[#28a49c]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header مبسط ومتداخل */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] pt-32 pb-20">
          {/* عناصر ديكورية */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-xl"></div>
          </div>
          
          <div className="relative px-8">
            <div className="max-w-6xl mx-auto">
              {/* مسار التنقل المبسط */}
              <nav className="flex items-center gap-4 text-white/80 mb-12">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <FaHome className="text-lg" />
                  <button 
                    onClick={() => navigate('/')}
                    className="text-lg hover:text-white transition-colors font-medium"
                  >
                    الرئيسية
                  </button>
                </div>
                <FaChevronRight className="text-white/60" />
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <FaStethoscope className="text-lg" />
                  <button 
                    onClick={() => navigate('/services')}
                    className="text-lg hover:text-white transition-colors font-medium"
                  >
                    الأقسام الطبية
                  </button>
                </div>
                <FaChevronRight className="text-white/60" />
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                  <span className="text-lg text-white font-semibold">{category?.name}</span>
                </div>
              </nav>

              {/* محتوى الرأس */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* النصوص */}
                <div className="text-center lg:text-right">
                  <div className="mb-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                      خدمات
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-200">
                        {category?.name}
                      </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light max-w-2xl lg:mx-0 mx-auto">
                      {category?.description}
                    </p>
                  </div>
                  
                  {/* إحصائية واحدة فقط */}
                  <div className="flex justify-center lg:justify-start">
                    <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 min-w-[200px]">
                      <div className="text-4xl font-black text-white mb-2">{services.length}</div>
                      <div className="text-white/80 font-medium text-lg">خدمة متاحة</div>
                    </div>
                  </div>
                </div>

                {/* الصورة والعناصر البصرية */}
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    {/* الصورة الرئيسية */}
                    <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                      {category?.image ? (
                        <img
                          src={getImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-cover relative z-10"
                          onError={(e) => {
                            console.error('Failed to load category image:', category.image);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`${category?.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full relative z-10`}>
                        <FaStethoscope className="text-white text-6xl" />
                      </div>
                    </div>
                    
                    {/* عناصر ديكورية حول الصورة */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/2 -right-8 w-4 h-4 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/4 -left-6 w-3 h-3 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    
                    {/* هالة مضيئة */}
                    <div className="absolute -inset-8 bg-gradient-to-r from-white/20 via-white/10 to-transparent rounded-full blur-2xl opacity-60"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قسم الخدمات */}
        <div className="relative py-20 px-8">
          <div className="max-w-7xl mx-auto">
            {services.length === 0 ? (
              // حالة عدم وجود خدمات
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <FaStethoscope className="text-6xl text-gray-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-700 mb-6">
                  لا توجد خدمات متاحة حالياً
                </h3>
                <p className="text-gray-500 mb-12 max-w-2xl mx-auto text-xl leading-relaxed">
                  نعمل جاهدين على إضافة المزيد من الخدمات في {category?.name}. 
                  يرجى المحاولة مرة أخرى قريباً أو تصفح أقسام أخرى.
                </p>
                <button
                  onClick={() => navigate('/services')}
                  className="bg-gradient-to-r from-[#062b2d] to-[#0d5047] text-white px-10 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold text-lg"
                >
                  تصفح الأقسام الأخرى
                </button>
              </div>
            ) : (
              <React.Fragment>
                {/* عنوان القسم */}
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
                    اختر الخدمة المناسبة
                  </h2>
                  <div className="w-40 h-2 bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] rounded-full mx-auto"></div>
                </div>

                {/* شبكة الخدمات - تصميم محسن لعرض 20+ خدمة */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {services.map((service, index) => {
                    // معالجة الوصف لإنشاء قائمة مرقمة
                    const descriptionLines = service.description ? 
                      service.description.split(/[.\n]/).filter(line => line.trim()) : [];
                    
                    return (
                      <div
                        key={service._id}
                        onClick={() => handleServiceClick(service)}
                        className={`group relative bg-gradient-to-br from-white via-slate-50 to-green-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-[#28a49c]/20 hover:border-[#28a49c]/40 overflow-hidden cursor-pointer ${
                          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                        }`}
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {/* خلفية ديكورية متطورة */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#28a49c]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#062b2d]/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                        </div>

                        {/* شريط علوي متدرج */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#062b2d] via-[#28a49c] to-[#0d5047] rounded-t-3xl"></div>
                        
                        {/* محتوى الكرت */}
                        <div className="relative z-10 p-6">
                          {/* رأس الكرت */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#28a49c] to-[#062b2d] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                {category?.image ? (
                                  <img
                                    src={getImageUrl(category.image)}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`${category?.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                                  <FaStethoscope className="text-white text-lg" />
                                </div>
                              </div>
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                                <FaCheckCircle className="text-white text-sm" />
                              </div>
                            </div>
                          </div>

                          {/* اسم الخدمة */}
                          <h3 className="text-xl font-black text-gray-800 mb-4 group-hover:text-[#062b2d] transition-colors duration-300 leading-tight">
                            {service.name || service.title}
                          </h3>

                          {/* صورة الخدمة إذا كانت موجودة */}
                          {service.image && (
                            <div className="mb-4 rounded-xl overflow-hidden shadow-md">
                              <img
                                src={service.image}
                                alt={service.name || service.title}
                                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  console.error('Failed to load service image:', service.image);
                                  e.target.parentElement.style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          {/* وصف الخدمة مع التسلسل الرقمي */}
                          <div className="mb-6">
                            {descriptionLines.length > 1 ? (
                              <ol className="space-y-2">
                                {descriptionLines.slice(0, 3).map((line, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#28a49c] to-[#062b2d] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                      {idx + 1}
                                    </span>
                                    <span className="flex-1">{line.trim()}</span>
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                                {service.description}
                              </p>
                            )}
                          </div>

                          {/* معلومات إضافية محسنة */}
                          <div className="space-y-3">
                            {service.duration && (
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                                  <FaClock className="text-white text-sm" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-bold text-green-600 uppercase tracking-wide">المدة</div>
                                  <div className="text-sm font-semibold text-gray-800">{service.duration}</div>
                                </div>
                              </div>
                            )}
                            
                            {service.price && (
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                                  <FaMoneyBillWave className="text-white text-sm" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide">السعر</div>
                                  <div className="text-sm font-semibold text-gray-800">{service.price} ريال</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* تأثيرات بصرية متطورة */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d5047]/5 via-transparent to-[#28a49c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl pointer-events-none"></div>
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#062b2d] via-[#28a49c] to-[#0d5047] rounded-3xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-700 -z-10"></div>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      {/* Styles مخصصة */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}