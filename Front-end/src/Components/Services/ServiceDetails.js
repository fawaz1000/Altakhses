// src/Components/Services/ServiceDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowRight, 
  FaStethoscope, 
  FaEye, 
  FaXRay, 
  FaBrain, 
  FaBaby, 
  FaPills, 
  FaTooth,
  FaSpinner,
  FaExclamationTriangle,
  FaChevronRight,
  FaHome,
  FaClock,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaWhatsapp,
  FaCheckCircle,
  FaStar,
  FaUsers,
  FaCalendarAlt,
  FaChild,
  FaLungs,
  FaSpa,
  FaHeartbeat,
  FaMicroscope
} from 'react-icons/fa';
import { GiBrokenBone, GiKidneys, GiStomach } from 'react-icons/gi';
import { MdEmergency, MdPregnantWoman } from 'react-icons/md';
import { RiMentalHealthLine, RiSurgicalMaskLine } from 'react-icons/ri';
import { API_BASE } from '../../config';

export default function ServiceDetails() {
  const { categorySlug, serviceSlug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer للتأثيرات البصرية
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // جلب بيانات الخدمة والقسم
  const fetchServiceDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching service details:', { categorySlug, serviceSlug });

      // جلب جميع الأقسام للعثور على القسم المطلوب
      const categoriesResponse = await axios.get(`${API_BASE}/api/categories`);
      const categories = categoriesResponse.data || [];
      
      // البحث عن القسم بالـ slug
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

      console.log('✅ Found category:', foundCategory.name);
      setCategory(foundCategory);

      // جلب خدمات هذا القسم
      const servicesResponse = await axios.get(`${API_BASE}/api/services`, {
        params: { 
          categoryId: foundCategory._id,
          populate: 'category'
        }
      });
      
      const servicesData = servicesResponse.data || [];
      console.log(`✅ Found ${servicesData.length} services for category`);

      // البحث عن الخدمة المطلوبة
      const foundService = servicesData.find(service => {
        const serviceSlugGenerated = (service.name || service.title || '')
          .replace(/\s+/g, '-')
          .replace(/[^\w\-\u0600-\u06FF]+/g, '')
          .toLowerCase();
        
        return service.slug === serviceSlug || 
               serviceSlugGenerated === serviceSlug ||
               service._id === serviceSlug;
      });

      if (!foundService) {
        setError('الخدمة المطلوبة غير موجودة');
        setLoading(false);
        return;
      }

      console.log('✅ Found service:', foundService.name);
      setService(foundService);

      // تعيين الخدمات المرتبطة (باقي خدمات نفس القسم)
      const otherServices = servicesData.filter(s => s._id !== foundService._id).slice(0, 3);
      setRelatedServices(otherServices);
      
    } catch (error) {
      console.error('❌ Error fetching service details:', error);
      setError('حدث خطأ في تحميل تفاصيل الخدمة');
    } finally {
      setLoading(false);
    }
  }, [categorySlug, serviceSlug]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  // دالة للحصول على الأيقونة المناسبة - محدثة
  const getCategoryIcon = useCallback((iconName, categoryName) => {
    const iconClass = "w-full h-full";
    
    // معالجة الأيقونات المحددة
    if (iconName) {
      switch (iconName) {
        case 'FaTooth': return <FaTooth className={iconClass} />;
        case 'FaEye': return <FaEye className={iconClass} />;
        case 'FaBrain': return <FaBrain className={iconClass} />;
        case 'FaBaby': return <FaBaby className={iconClass} />;
        case 'FaPills': return <FaPills className={iconClass} />;
        case 'GiBrokenBone': 
        case 'GiBone': return <GiBrokenBone className={iconClass} />;
        case 'MdPregnantWoman': return <MdPregnantWoman className={iconClass} />;
        case 'RiMentalHealthLine': return <RiMentalHealthLine className={iconClass} />;
        case 'MdEmergency': return <MdEmergency className={iconClass} />;
        case 'FaHandHoldingMedical': 
        case 'MdSpa': return <FaSpa className={iconClass} />;
        case 'FaXRay': return <FaXRay className={iconClass} />;
        case 'FaMicroscope': return <FaMicroscope className={iconClass} />;
        case 'FaHeartbeat': 
        case 'FaHeart': return <FaHeartbeat className={iconClass} />;
        case 'FaInternalMedicine': return <GiStomach className={iconClass} />;
        case 'FaLungs': return <FaLungs className={iconClass} />;
        case 'FaChild': return <FaChild className={iconClass} />;
        case 'GiKidneys': return <GiKidneys className={iconClass} />;
        case 'RiSurgicalMaskLine': return <RiSurgicalMaskLine className={iconClass} />;
        default: return <FaStethoscope className={iconClass} />;
      }
    }

    // معالجة بناءً على اسم القسم
    if (!categoryName) return <FaStethoscope className={iconClass} />;
    
    const name = categoryName.toLowerCase();
    
    if (name.includes('أسنان') || name.includes('سن')) return <FaTooth className={iconClass} />;
    if (name.includes('عين') || name.includes('عيون') || name.includes('بصر')) return <FaEye className={iconClass} />;
    if (name.includes('عظام') || name.includes('عظم') || name.includes('مفاصل')) return <GiBrokenBone className={iconClass} />;
    if (name.includes('أطفال') || name.includes('طفل')) return <FaChild className={iconClass} />;
    if (name.includes('نساء') || name.includes('ولادة') || name.includes('نسائية')) return <MdPregnantWoman className={iconClass} />;
    if (name.includes('مخ') || name.includes('أعصاب') || name.includes('عصب')) return <FaBrain className={iconClass} />;
    if (name.includes('أشعة') || name.includes('تصوير')) return <FaXRay className={iconClass} />;
    if (name.includes('جلد') || name.includes('تجميل') || name.includes('بشرة')) return <FaSpa className={iconClass} />;
    if (name.includes('نفس') || name.includes('عقل')) return <RiMentalHealthLine className={iconClass} />;
    if (name.includes('طوارئ') || name.includes('إسعاف')) return <MdEmergency className={iconClass} />;
    if (name.includes('صيدل') || name.includes('دواء')) return <FaPills className={iconClass} />;
    if (name.includes('قلب') || name.includes('قلوب')) return <FaHeartbeat className={iconClass} />;
    if (name.includes('باطن') || name.includes('هضم')) return <GiStomach className={iconClass} />;
    if (name.includes('صدر') || name.includes('رئة')) return <FaLungs className={iconClass} />;
    if (name.includes('مختبر') || name.includes('تحليل')) return <FaMicroscope className={iconClass} />;
    if (name.includes('كلى') || name.includes('كلية')) return <GiKidneys className={iconClass} />;
    if (name.includes('جراح')) return <RiSurgicalMaskLine className={iconClass} />;
    
    return <FaStethoscope className={iconClass} />;
  }, []);

  // دالة للتنقل إلى خدمة أخرى
  const handleServiceClick = (relatedService) => {
    const serviceSlug = (relatedService.name || relatedService.title || '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\u0600-\u06FF]+/g, '')
      .toLowerCase() || relatedService._id;
    
    navigate(`/services/category/${categorySlug}/${serviceSlug}`);
  };

  // معالجة حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#062b2d] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل تفاصيل الخدمة...</p>
        </div>
      </div>
    );
  }

  // معالجة حالة الخطأ
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-6">
        <div className="text-center max-w-md mx-auto">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={fetchServiceDetails}
              className="bg-[#062b2d] text-white px-6 py-3 rounded-lg hover:bg-[#0a3a35] transition-colors duration-300"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate(`/services/category/${categorySlug}`)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              العودة للخدمات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 rtl">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] py-16 px-6">
          <div className="max-w-7xl mx-auto">
            {/* مسار التنقل */}
            <nav className="flex items-center gap-2 text-white/80 mb-8">
              <FaHome className="text-sm" />
              <button 
                onClick={() => navigate('/')}
                className="text-sm hover:text-white transition-colors"
              >
                الرئيسية
              </button>
              <FaChevronRight className="text-xs" />
              <button 
                onClick={() => navigate('/services')}
                className="text-sm hover:text-white transition-colors"
              >
                الأقسام الطبية
              </button>
              <FaChevronRight className="text-xs" />
              <button 
                onClick={() => navigate(`/services/category/${categorySlug}`)}
                className="text-sm hover:text-white transition-colors"
              >
                {category?.name}
              </button>
              <FaChevronRight className="text-xs" />
              <span className="text-sm text-white">{service?.name || service?.title}</span>
            </nav>

            {/* معلومات الخدمة */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* الأيقونة */}
              <div className="relative">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                  <div className="w-16 h-16 text-white">
                    {getCategoryIcon(category?.icon, category?.name)}
                  </div>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl blur opacity-50"></div>
              </div>

              {/* النصوص */}
              <div className="flex-1 text-center lg:text-right">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                  {service?.name || service?.title}
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-3xl lg:mx-0 mx-auto leading-relaxed">
                  {service?.description}
                </p>
                
                {/* معلومات الخدمة */}
                <div className="flex items-center justify-center lg:justify-start gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{category?.name}</div>
                    <div className="text-white/80 text-sm">القسم</div>
                  </div>
                  {service?.price && (
                    <>
                      <div className="w-px h-12 bg-white/30"></div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{service.price} ر.س</div>
                        <div className="text-white/80 text-sm">السعر</div>
                      </div>
                    </>
                  )}
                  {service?.duration && (
                    <>
                      <div className="w-px h-12 bg-white/30"></div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{service.duration}</div>
                        <div className="text-white/80 text-sm">المدة</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* زر العودة */}
              <button
                onClick={() => navigate(`/services/category/${categorySlug}`)}
                className="lg:self-start bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center gap-3 border border-white/20"
              >
                <FaArrowRight />
                <span>العودة للخدمات</span>
              </button>
            </div>
          </div>
        </div>

        {/* محتوى تفاصيل الخدمة */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2">
              {/* بطاقة تفاصيل الخدمة */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl mb-8 border border-white/20">
                <h2 className="text-3xl font-bold text-[#062b2d] mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#062b2d] to-[#28a49c] rounded-xl flex items-center justify-center">
                    <FaStethoscope className="text-white text-xl" />
                  </div>
                  تفاصيل الخدمة
                </h2>
                
                {/* صورة الخدمة إذا كانت موجودة */}
                {service?.image && (
                  <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={service.image}
                      alt={service.name || service.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        console.error('Failed to load service image:', service.image);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    {service?.description}
                  </p>
                  
                  {/* معلومات إضافية */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {service?.price && (
                      <div className="flex items-center gap-4 p-4 bg-[#062b2d]/5 rounded-2xl">
                        <div className="w-12 h-12 bg-[#28a49c]/10 rounded-xl flex items-center justify-center">
                          <FaMoneyBillWave className="text-[#28a49c] text-xl" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#062b2d]">السعر</h4>
                          <p className="text-gray-600">{service.price} ريال سعودي</p>
                        </div>
                      </div>
                    )}
                    
                    {service?.duration && (
                      <div className="flex items-center gap-4 p-4 bg-[#062b2d]/5 rounded-2xl">
                        <div className="w-12 h-12 bg-[#0d5047]/10 rounded-xl flex items-center justify-center">
                          <FaClock className="text-[#0d5047] text-xl" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#062b2d]">مدة الخدمة</h4>
                          <p className="text-gray-600">{service.duration}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ميزات الخدمة إذا كانت موجودة */}
                  {service?.features && service.features.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-2xl font-bold text-[#062b2d] mb-4 flex items-center gap-2">
                        <FaCheckCircle className="text-[#28a49c]" />
                        ميزات الخدمة
                      </h3>
                      <ul className="space-y-3">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <FaCheckCircle className="text-[#28a49c] flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* متطلبات الخدمة إذا كانت موجودة */}
                  {service?.requirements && (
                    <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
                      <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
                        <FaStar className="text-green-600" />
                        متطلبات مهمة
                      </h3>
                      <p className="text-green-700">{service.requirements}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* بطاقة الحجز */}
              <div className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] rounded-3xl p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <FaCalendarAlt className="text-2xl" />
                  احجز موعدك الآن
                </h3>
                <p className="text-white/90 mb-6 text-lg">
                  احصل على {service?.name || service?.title} بأفضل جودة وأحدث التقنيات
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://wa.me/966500069636"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white text-[#062b2d] font-bold px-6 py-4 rounded-2xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-3 group"
                  >
                    <FaWhatsapp className="text-xl group-hover:scale-110 transition-transform duration-300" />
                    <span>واتساب</span>
                  </a>
                  <a
                    href="tel:920002111"
                    className="flex-1 bg-white/10 backdrop-blur-md text-white font-bold px-6 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center gap-3 group"
                  >
                    <FaPhoneAlt className="text-xl group-hover:scale-110 transition-transform duration-300" />
                    <span>اتصل بنا</span>
                  </a>
                </div>
              </div>
            </div>

            {/* الشريط الجانبي */}
            <div className="space-y-8">
              {/* معلومات القسم */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-xl font-bold text-[#062b2d] mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#062b2d]/10 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(category?.icon, category?.name)}
                  </div>
                  {category?.name}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {category?.description}
                </p>
                <button
                  onClick={() => navigate(`/services/category/${categorySlug}`)}
                  className="w-full bg-[#062b2d] text-white px-4 py-3 rounded-lg hover:bg-[#0a3a35] transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <span>عرض جميع خدمات {category?.name}</span>
                  <FaChevronRight className="text-sm" />
                </button>
              </div>

              {/* الخدمات المرتبطة */}
              {relatedServices.length > 0 && (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-xl font-bold text-[#062b2d] mb-4 flex items-center gap-3">
                    <FaUsers className="text-[#28a49c]" />
                    خدمات أخرى
                  </h3>
                  <div className="space-y-3">
                    {relatedServices.map((relatedService) => (
                      <div
                        key={relatedService._id}
                        onClick={() => handleServiceClick(relatedService)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-[#28a49c] hover:bg-[#28a49c]/5 transition-all duration-300 cursor-pointer group"
                      >
                        <h4 className="font-semibold text-[#062b2d] group-hover:text-[#28a49c] transition-colors duration-300">
                          {relatedService.name || relatedService.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {relatedService.description}
                        </p>
                        {relatedService.price && (
                          <p className="text-sm font-medium text-[#28a49c] mt-2">
                            {relatedService.price} ريال
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* معلومات التواصل */}
              <div className="bg-gradient-to-br from-[#062b2d] to-[#0d5047] rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-lg font-bold mb-4">تحتاج مساعدة؟</h3>
                <p className="text-white/90 text-sm mb-4">
                  فريقنا الطبي جاهز للإجابة على استفساراتك
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:920002111"
                    className="block w-full bg-white/10 text-center py-2 rounded-lg hover:bg-white/20 transition-colors duration-300"
                  >
                    📞 920002111
                  </a>
                  <a
                    href="mailto:info@altakhsees.com"
                    className="block w-full bg-white/10 text-center py-2 rounded-lg hover:bg-white/20 transition-colors duration-300"
                  >
                    ✉️ info@altakhsees.com
                  </a>
                </div>
              </div>
            </div>
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
      `}</style>
    </div>
  );
}