// src/Components/Services/services.js - Updated with API integration and proper navigation
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaStethoscope, 
  FaEye, 
  FaXRay, 
  FaBrain, 
  FaBaby, 
  FaPills, 
  FaHandHoldingMedical,
  FaTooth,
  FaSpinner,
  FaExclamationTriangle,
  FaHeart,
  FaArrowLeft,
  FaUserMd
} from 'react-icons/fa';
import { GiBrokenBone } from 'react-icons/gi';
import { MdEmergency, MdPregnantWoman } from 'react-icons/md';
import { RiMentalHealthLine } from 'react-icons/ri';
import { API_BASE } from '../../config';

export default function Services() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
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

  // جلب الأقسام من API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching categories from API...');
      const response = await axios.get(`${API_BASE}/api/categories`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('✅ Categories response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setCategories(response.data.data);
        console.log(`✅ ${response.data.data.length} categories loaded successfully`);
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        setCategories(response.data);
        console.log(`✅ ${response.data.length} categories loaded successfully`);
      } else {
        console.log('ℹ️ No categories found, using fallback data');
        setCategories(getFallbackCategories());
      }
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setError('حدث خطأ في تحميل الأقسام');
      setCategories(getFallbackCategories());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // بيانات احتياطية للأقسام
  const getFallbackCategories = () => [
    {
      _id: 'fallback-1',
      name: 'طب الأسنان',
      description: 'خدمات شاملة لطب وجراحة الأسنان وتجميل الابتسامة',
      icon: 'FaTooth',
      slug: 'dentist'
    },
    {
      _id: 'fallback-2',
      name: 'طب العيون',
      description: 'فحص وعلاج جميع أمراض العين والجراحات التخصصية',
      icon: 'FaEye',
      slug: 'ophthalmology'
    },
    {
      _id: 'fallback-3',
      name: 'طب الأطفال',
      description: 'رعاية صحية متكاملة للأطفال من الولادة حتى المراهقة',
      icon: 'FaBaby',
      slug: 'pediatrics'
    },
    {
      _id: 'fallback-4',
      name: 'الطب الباطني',
      description: 'تشخيص وعلاج الأمراض الداخلية للبالغين',
      icon: 'FaStethoscope',
      slug: 'internal-medicine'
    },
    {
      _id: 'fallback-5',
      name: 'جراحة العظام',
      description: 'علاج إصابات وأمراض الجهاز الحركي والعظام',
      icon: 'GiBrokenBone',
      slug: 'orthopedics'
    },
    {
      _id: 'fallback-6',
      name: 'النساء والولادة',
      description: 'رعاية شاملة لصحة المرأة والحمل والولادة',
      icon: 'MdPregnantWoman',
      slug: 'gynecology'
    }
  ];

  // دالة للحصول على الأيقونة المناسبة
  const getCategoryIcon = useCallback((iconName, categoryName) => {
    const iconClass = "w-full h-full";
    
    if (iconName) {
      switch (iconName) {
        case 'FaTooth': return <FaTooth className={iconClass} />;
        case 'FaEye': return <FaEye className={iconClass} />;
        case 'FaBrain': return <FaBrain className={iconClass} />;
        case 'FaBaby': return <FaBaby className={iconClass} />;
        case 'FaPills': return <FaPills className={iconClass} />;
        case 'GiBrokenBone': return <GiBrokenBone className={iconClass} />;
        case 'MdPregnantWoman': return <MdPregnantWoman className={iconClass} />;
        case 'RiMentalHealthLine': return <RiMentalHealthLine className={iconClass} />;
        case 'MdEmergency': return <MdEmergency className={iconClass} />;
        case 'FaHandHoldingMedical': return <FaHandHoldingMedical className={iconClass} />;
        case 'FaXRay': return <FaXRay className={iconClass} />;
        default: return <FaStethoscope className={iconClass} />;
      }
    }

    // fallback بناءً على اسم القسم
    if (!categoryName) return <FaStethoscope className={iconClass} />;
    
    const name = categoryName.toLowerCase();
    if (name.includes('أسنان')) return <FaTooth className={iconClass} />;
    if (name.includes('عين') || name.includes('عيون')) return <FaEye className={iconClass} />;
    if (name.includes('عظام')) return <GiBrokenBone className={iconClass} />;
    if (name.includes('أطفال')) return <FaBaby className={iconClass} />;
    if (name.includes('نساء') || name.includes('ولادة')) return <MdPregnantWoman className={iconClass} />;
    if (name.includes('مخ') || name.includes('أعصاب')) return <FaBrain className={iconClass} />;
    if (name.includes('أشعة')) return <FaXRay className={iconClass} />;
    if (name.includes('جلدية')) return <FaHandHoldingMedical className={iconClass} />;
    if (name.includes('نفس')) return <RiMentalHealthLine className={iconClass} />;
    if (name.includes('طوارئ')) return <MdEmergency className={iconClass} />;
    if (name.includes('صيدل')) return <FaPills className={iconClass} />;
    
    return <FaStethoscope className={iconClass} />;
  }, []);

  // دالة للتنقل إلى صفحة الخدمات أو الأطباء
  const handleCategoryClick = (category, type = 'services') => {
    console.log('🔄 Navigating to category:', category.name, category.slug, 'type:', type);
    
    const slug = category.slug || category._id;
    
    if (type === 'doctors') {
      // التنقل إلى صفحة الأطباء
      navigate(`/doctors/${slug}`);
    } else {
      // التنقل إلى صفحة الخدمات
      navigate(`/services/${slug}`);
    }
  };

  // معالجة حالة التحميل
  if (loading) {
    return (
      <section id="services" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-6 rtl scroll-mt-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0d5047] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل الأقسام الطبية...</p>
        </div>
      </section>
    );
  }

  // معالجة حالة الخطأ
  if (error && categories.length === 0) {
    return (
      <section id="services" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-6 rtl scroll-mt-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ في التحميل</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchCategories}
            className="bg-[#0d5047] text-white px-6 py-3 rounded-lg hover:bg-[#28a49c] transition-colors duration-300"
          >
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-6 rtl scroll-mt-32 overflow-hidden">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#0d5047]/20 rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-[#28a49c]/20 rounded-full animate-ping delay-1500"></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-[#0d5047]/30 rounded-full animate-ping delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        
        {/* العنوان الرئيسي */}
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#48D690] to-[#28a49c] rounded-3xl mb-8 shadow-2xl relative">
            <FaStethoscope className="text-white text-3xl" />
            <div className="absolute inset-0 bg-white/20 rounded-3xl animate-pulse"></div>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black mb-6 relative">
            <span className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] bg-clip-text text-transparent">
              خدماتنا الطبية
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
            تخصصات طبية متنوعة بأحدث التقنيات العالمية وفريق طبي متميز
          </p>

          {/* إحصائيات سريعة */}
          <div className="flex justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-black text-[#0d5047]">{categories.length}+</div>
              <div className="text-sm text-gray-500">تخصص طبي</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#28a49c]">24/7</div>
              <div className="text-sm text-gray-500">خدمة مستمرة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#062b2d]">100%</div>
              <div className="text-sm text-gray-500">جودة عالية</div>
            </div>
          </div>
        </div>

        {/* بطاقات الأقسام */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category._id}
              className={`group relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-white/20 cursor-pointer overflow-hidden ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* تأثير الإضاءة */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d5047]/5 to-[#28a49c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* رقم القسم */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-[#0d5047] to-[#28a49c] text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="relative p-8 text-center h-full flex flex-col">
                {/* الأيقونة */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#0d5047] to-[#28a49c] rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <div className="w-10 h-10 text-white">
                      {getCategoryIcon(category.icon, category.name)}
                    </div>
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-[#0d5047]/20 to-[#28a49c]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* اسم القسم */}
                <h3 className="text-2xl font-black text-[#062b2d] mb-4 group-hover:text-[#0d5047] transition-colors duration-300 leading-tight">
                  {category.name}
                </h3>

                {/* الوصف */}
                <p className="text-gray-600 leading-relaxed mb-8 flex-grow group-hover:text-gray-700 transition-colors duration-300">
                  {category.description}
                </p>

                {/* أزرار الإجراءات */}
                <div className="mt-auto space-y-3">
                  {/* زر الخدمات */}
                  <button
                    onClick={() => handleCategoryClick(category, 'services')}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d5047] to-[#28a49c] text-white font-bold px-6 py-3 rounded-2xl group-hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <span>استكشف الخدمات</span>
                    <FaArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                  
                  {/* زر الأطباء */}
                  <button
                    onClick={() => handleCategoryClick(category, 'doctors')}
                    className="w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-[#0d5047] text-[#0d5047] font-bold px-6 py-3 rounded-2xl hover:bg-[#0d5047] hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    <FaUserMd className="w-4 h-4" />
                    <span>الأطباء</span>
                  </button>
                </div>

                {/* شريط ديكوري */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0d5047] via-[#28a49c] to-[#0d5047] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>

              {/* تأثير الحركة */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d5047]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
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
              <h3 className="text-4xl font-bold mb-4">
                هل تحتاج إلى استشارة طبية؟
              </h3>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                فريقنا الطبي المتخصص جاهز لتقديم أفضل الخدمات الصحية على مدار الساعة
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
                <a
                  href="tel:920002111"
                  className="bg-white/10 backdrop-blur-md text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center gap-3"
                >
                  <span>اتصل بنا</span>
                  <span className="text-xl">📞</span>
                </a>
              </div>
            </div>
          </div>
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
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
}