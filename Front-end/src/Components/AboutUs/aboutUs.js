import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FaHospitalSymbol, FaUsers, FaUserPlus, FaBed, FaAward, FaPhone, FaEnvelope, FaMapMarkerAlt, FaChartLine, FaHeart, FaCalendarAlt, FaSpinner, FaWhatsapp } from 'react-icons/fa';
import { MdDoneAll, MdTrendingUp } from 'react-icons/md';
import useSWR from 'swr';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { API_BASE } from '../../config';

// الألوان الثابتة للنظام
const THEME_COLORS = {
  primary: '#0d5047',
  primaryHover: '#28a49c',
  primaryLight: '#e6f7f5',
  secondary: '#062b2d',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

const fetcher = (url) => {
  console.log('🔄 Fetching from:', url);
  return fetch(url)
    .then((res) => {
      console.log('📡 Response status:', res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('✅ Data received:', data);
      return data;
    })
    .catch((error) => {
      console.error('❌ Fetch error:', error);
      throw error;
    });
};

// دالة تنسيق الأرقام الكبيرة
const formatNumber = (num) => {
  const number = parseInt(num);
  
  if (number >= 10000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 10000) {
    return (number / 1000).toFixed(0) + 'K';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

// دالة للحصول على القيمة الأصلية للعرض في التفاصيل
const getOriginalNumber = (num) => {
  return parseInt(num).toLocaleString('ar-SA');
};

const orderedStats = [
  { 
    label: 'تأسس منذ', 
    icon: FaAward, 
    color: 'from-purple-500 to-pink-500', 
    bgColor: 'rgba(147, 51, 234, 0.1)', 
    textColor: THEME_COLORS.primary,
    iconBg: 'rgba(147, 51, 234, 0.2)'
  },
  { 
    label: 'طبيب خبير', 
    icon: FaHospitalSymbol, 
    color: 'from-blue-500 to-cyan-500', 
    bgColor: 'rgba(59, 130, 246, 0.1)', 
    textColor: THEME_COLORS.primary,
    iconBg: 'rgba(59, 130, 246, 0.2)'
  },
  { 
    label: 'عيادة مجهزة', 
    icon: FaBed, 
    color: 'from-green-500 to-teal-500', 
    bgColor: 'rgba(34, 197, 94, 0.1)', 
    textColor: THEME_COLORS.primary,
    iconBg: 'rgba(34, 197, 94, 0.2)'
  },
  { 
    label: 'حالات معالجة', 
    icon: MdDoneAll, 
    color: 'from-orange-500 to-red-500', 
    bgColor: 'rgba(249, 115, 22, 0.1)', 
    textColor: THEME_COLORS.primary,
    iconBg: 'rgba(249, 115, 22, 0.2)'
  },
  { 
    label: 'عدد المراجعين', 
    icon: FaUsers, 
    color: 'from-indigo-500 to-purple-500', 
    bgColor: 'rgba(99, 102, 241, 0.1)', 
    textColor: THEME_COLORS.primary,
    iconBg: 'rgba(99, 102, 241, 0.2)'
  },
  { 
    label: 'عدد المراجعين الجدد', 
    icon: FaUserPlus, 
    color: 'from-teal-500 to-green-500', 
    bgColor: 'rgba(20, 184, 166, 0.1)', 
    textColor: THEME_COLORS.primary,
    iconBg: 'rgba(20, 184, 166, 0.2)'
  },
];

export default function About() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [animatedValues, setAnimatedValues] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // جلب البيانات للسنة المحددة
  const { data: reportData, error: reportError, isLoading: reportLoading, mutate } = useSWR(
    `${API_BASE}/api/reports?year=${selectedYear}`, 
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
    }
  );
  
  // جلب جميع السنوات المتاحة
  const { data: allYearsData, isLoading: yearsLoading } = useSWR(
    `${API_BASE}/api/reports/years`, 
    fetcher,
    {
      revalidateOnFocus: false,
      fallbackData: [],
    }
  );

  const metrics = useMemo(() => {
    console.log('📊 Processing report data:', reportData);
    return reportData?.[0]?.metrics || [];
  }, [reportData]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-out-cubic' });
  }, []);

  // تحديث السنوات المتاحة
  useEffect(() => {
    console.log('📅 All years data:', allYearsData);
    if (allYearsData && Array.isArray(allYearsData) && allYearsData.length > 0) {
      const years = allYearsData.map(report => report.year).sort((a, b) => b - a);
      console.log('📅 Available years:', years);
      setAvailableYears(years);
      
      if (years.length > 0 && !years.includes(selectedYear)) {
        console.log('🔄 Changing to most recent year:', years[0]);
        setSelectedYear(years[0]);
      }
    } else {
      console.log('ℹ️ No years data available, using current year');
      setAvailableYears([selectedYear]);
    }
  }, [allYearsData, selectedYear]);

  // إعادة تعيين الرسوم المتحركة عند تغيير السنة
  useEffect(() => {
    console.log('🎨 Resetting animations for year:', selectedYear);
    setIsVisible(false);
    setAnimatedValues({});
    setAnimationStarted(false);
  }, [selectedYear]);

  // دالة بدء الرسوم المتحركة
  const startAnimation = useCallback(() => {
    if (animationStarted || metrics.length === 0) return;
    
    console.log('▶️ Starting animations');
    setAnimationStarted(true);
    setIsVisible(true);
    
    metrics.forEach((metric, index) => {
      setTimeout(() => {
        const targetValue = parseInt(metric.count.toString().replace(/\D/g, '')) || 0;
        let currentValue = 0;
        const increment = targetValue / 50;
        let animationId;

        const animateNumber = () => {
          if (currentValue < targetValue) {
            currentValue += increment;
            setAnimatedValues((prev) => ({
              ...prev,
              [metric.label]: Math.floor(currentValue),
            }));
            animationId = requestAnimationFrame(animateNumber);
          } else {
            setAnimatedValues((prev) => ({
              ...prev,
              [metric.label]: targetValue,
            }));
          }
        };
        
        animateNumber();
        
        return () => {
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
        };
      }, index * 200);
    });
  }, [animationStarted, metrics]);

  // مراقب التقاطع للرسوم المتحركة
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animationStarted && metrics.length > 0) {
          console.log('👁️ Stats section is visible, starting animation');
          startAnimation();
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [animationStarted, metrics, startAnimation]);

  // دالة تحديث السنة
  const handleYearChange = (year) => {
    console.log('📅 Changing year to:', year);
    setSelectedYear(year);
    mutate();
  };

  // معالجة حالة التحميل
  if (reportLoading && yearsLoading) {
    return (
      <section 
        id="about" 
        className="relative py-24 px-6 rtl overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${THEME_COLORS.gray[50]} 0%, white 50%, ${THEME_COLORS.gray[100]} 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <FaSpinner 
              className="animate-spin text-4xl mx-auto mb-4" 
              style={{ color: THEME_COLORS.primary }}
            />
            <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="about" 
      className="relative py-24 px-6 rtl overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${THEME_COLORS.gray[50]} 0%, white 50%, ${THEME_COLORS.gray[100]} 100%)`
      }}
    >
      {/* خلفية ديكورية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: `${THEME_COLORS.primary}0D` }}
        ></div>
        <div 
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ 
            backgroundColor: `${THEME_COLORS.primaryHover}0D`,
            animationDelay: '1s'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/3 w-4 h-4 rounded-full animate-ping"
          style={{ 
            backgroundColor: `${THEME_COLORS.primary}33`,
            animationDelay: '0.5s'
          }}
        ></div>
        <div 
          className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full animate-ping"
          style={{ 
            backgroundColor: `${THEME_COLORS.primaryHover}4D`,
            animationDelay: '1.5s'
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header محسن */}
        <div className="text-center mb-20 relative" data-aos="fade-up">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${THEME_COLORS.primary} 0%, ${THEME_COLORS.primaryHover} 100%)`
            }}
          >
            <FaHeart className="text-white text-3xl animate-pulse" />
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black mb-6 relative">
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${THEME_COLORS.secondary}, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryHover})`
              }}
            >
              من نحن
            </span>
            <div 
              className="absolute -inset-1 blur-xl opacity-30 -z-10"
              style={{
                background: `linear-gradient(to right, ${THEME_COLORS.primary}33, ${THEME_COLORS.primaryHover}33)`
              }}
            ></div>
          </h2>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div 
              className="w-24 h-2 rounded-full animate-pulse"
              style={{
                background: `linear-gradient(to right, transparent, ${THEME_COLORS.primary})`
              }}
            ></div>
            <div 
              className="w-12 h-12 border-4 rounded-full flex items-center justify-center animate-spin-slow"
              style={{ borderColor: THEME_COLORS.primary }}
            >
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: THEME_COLORS.primary }}
              ></div>
            </div>
            <div 
              className="w-24 h-2 rounded-full animate-pulse"
              style={{
                background: `linear-gradient(to left, transparent, ${THEME_COLORS.primaryHover})`
              }}
            ></div>
          </div>
          
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            الرائدون في الخدمات الطبية المتخصصة بأحدث التقنيات العالمية
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24">
          {/* Text Content */}
          <div className="space-y-8 relative" data-aos="fade-right">
            <div className="group relative bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${THEME_COLORS.primary}0D, ${THEME_COLORS.primaryHover}0D)`
                }}
              ></div>
              
              <div className="relative z-10 space-y-8 text-gray-700 text-lg leading-relaxed">
                <div className="relative">
                  <div 
                    className="absolute -right-6 top-0 w-2 h-full rounded-full"
                    style={{
                      background: `linear-gradient(to bottom, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryHover})`
                    }}
                  ></div>
                  <div className="mb-4">
                    <span 
                      className="inline-block text-white font-bold text-xl px-6 py-2 rounded-2xl shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${THEME_COLORS.primary} 0%, ${THEME_COLORS.primaryHover} 100%)`
                      }}
                    >
                      رؤيتنا
                    </span>
                  </div>
                  <p className="text-xl leading-relaxed">
                  نحو خدمات طبية رائدة تلبي أحتياجات المجتمع
                  </p>
                </div>
                
                <div 
                  className="rounded-2xl p-6 border"
                  style={{
                    background: `linear-gradient(135deg, ${THEME_COLORS.primary}1A, ${THEME_COLORS.primaryHover}1A)`,
                    borderColor: `${THEME_COLORS.primary}33`
                  }}
                >
                  <p className="text-lg">
                    تقديم خدمات طبية متخصصة و متنوعة على أعلى قدر من الجودة تراعي كافة فئات المجتمع و تتناسب معه
                    <span 
                      className="block mt-3 font-bold text-xl flex items-center gap-2"
                      style={{ color: THEME_COLORS.primary }}
                    >
                      <FaHeart className="animate-pulse" />
                      التميز بالتخصص
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* بطاقة الخدمات المميزة */}
            <div 
              className="rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${THEME_COLORS.primary} 0%, ${THEME_COLORS.primaryHover} 100%)`
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <MdTrendingUp className="text-3xl" />
                  أهدافنا
                </h3>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    أن تكون مجموعة التخصيص الطبية الرائدة و الأولى في المجال الطبي على مستوى المنطقة
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    تقديم الخدمات الطبية المتنوعة و المتخصصه بما يلامس احتياجات المجتمع
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    الأرتقاء بجودة الخدمات الطبية من أجل الوصول الى رضى العملاء
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    المساهمة في خدمة المجتمع و الوطن بما يتوائم مع رؤية المملكة 2030
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-8" data-aos="fade-left">
            <div 
              className="relative rounded-3xl p-10 text-white shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${THEME_COLORS.primary} 0%, ${THEME_COLORS.primaryHover} 50%, ${THEME_COLORS.primary} 100%)`
              }}
            >
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>
              </div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                    <FaPhone className="text-2xl animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-bold">تواصل معنا</h3>
                  <p className="text-white/90 mt-2">نحن هنا بخدمتكم بكل اهتمام</p>
                </div>
                
                <div className="space-y-6">
                  <ContactItem icon={FaPhone} label="الرقم الموحد" value="920002111" />
                  <ContactItem icon={FaEnvelope} label="الإيميل" value="info@altakhses.com" />
                  <ContactItem icon={FaMapMarkerAlt} label="الموقع" value="حائل، السعودية" />
                </div>

                <div className="mt-8">
                  <a
                    href="https://wa.me/966500069636"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/30 transition-all duration-300 group w-full"
                  >
                    <div className="text-3xl mb-3">
                      <FaWhatsapp className="mx-auto text-green-400" />
                    </div>
                    <div className="font-bold text-xl group-hover:scale-105 transition-transform duration-300">واتساب</div>
                    <div className="text-white/80 text-sm mt-1">أحجز الآن</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Header */}
        <div id="stats-section" className="text-center mb-16" data-aos="fade-up">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${THEME_COLORS.primary} 0%, ${THEME_COLORS.primaryHover} 100%)`
            }}
          >
            <FaChartLine className="text-white text-2xl" />
          </div>
          
          <h3 className="text-4xl md:text-5xl font-black mb-4">
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${THEME_COLORS.secondary}, ${THEME_COLORS.primary})`
              }}
            >
              التخصيص في أرقام لسنة {selectedYear}
            </span>
          </h3>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            إنجازاتنا تتحدث عن جودة خدماتنا وثقة عملائنا
          </p>

          {/* اختيار السنة */}
          {availableYears.length > 1 && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <FaCalendarAlt 
                  className="text-xl" 
                  style={{ color: THEME_COLORS.primary }}
                />
                <span className="text-lg font-medium text-gray-700">اختر السنة:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 ${
                      selectedYear === year
                        ? 'text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 hover:shadow-md'
                    }`}
                    style={{
                      background: selectedYear === year 
                        ? `linear-gradient(135deg, ${THEME_COLORS.primary} 0%, ${THEME_COLORS.primaryHover} 100%)`
                        : 'white',
                      borderColor: selectedYear === year ? 'transparent' : `${THEME_COLORS.primary}33`,
                      color: selectedYear === year ? 'white' : THEME_COLORS.primary
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* عرض حالة التحميل للإحصائيات */}
          {reportLoading && (
            <div className="py-8">
              <FaSpinner 
                className="animate-spin text-2xl mx-auto mb-2" 
                style={{ color: THEME_COLORS.primary }}
              />
              <p className="text-gray-600">جاري تحميل إحصائيات سنة {selectedYear}...</p>
            </div>
          )}
        </div>

        {/* Stats Grid محسن */}
        {!reportLoading && metrics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
            {orderedStats.map(({ label, icon: Icon }, i) => {
              const stat = metrics.find((m) => m.label?.trim() === label);
              const animatedValue = animatedValues[label] || 0;
              const originalValue = stat ? stat.count : 0;
              const displayValue = stat ? 
                (isVisible ? `${formatNumber(animatedValue)}${stat.suffix || ''}` : '0') : 
                '—';
              
              return (
                <div
                  key={label}
                  className={`group relative overflow-hidden bg-white rounded-3xl shadow-xl p-8 text-center transition-all duration-700 transform hover:-translate-y-4 hover:shadow-2xl border border-gray-100 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ 
                    animationDelay: `${i * 150}ms`,
                    backgroundColor: 'white'
                  }}
                  data-aos="zoom-in"
                  data-aos-delay={i * 150}
                >
                  {/* خلفية ملونة عند الهوفر */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                    style={{ backgroundColor: `${THEME_COLORS.primary}0D` }}
                  />
                  
                  {/* أنماط ديكورية */}
                  <div className="absolute inset-0 opacity-5">
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"
                      style={{ backgroundColor: THEME_COLORS.primary }}
                    />
                    <div 
                      className="absolute bottom-0 left-0 w-16 h-16 rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 transition-transform duration-700"
                      style={{ backgroundColor: THEME_COLORS.primaryHover }}
                    />
                  </div>

                  <div className="relative z-10">
                    {/* أيقونة */}
                    <div 
                      className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-white rounded-3xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                      style={{
                        background: `linear-gradient(135deg, ${THEME_COLORS.primary} 0%, ${THEME_COLORS.primaryHover} 100%)`
                      }}
                    >
                      <Icon size={32} />
                      <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    
                    {/* الرقم */}
                    <h3 
                      className="text-5xl font-black mb-3 leading-none transition-all duration-500 group-hover:scale-110"
                      style={{ color: THEME_COLORS.primary }}
                      title={`القيمة الأصلية: ${getOriginalNumber(originalValue)}`}
                    >
                      {displayValue}
                    </h3>
                    
                    {/* التسمية */}
                    <p className="text-sm font-bold text-gray-600 group-hover:text-gray-800 transition-colors leading-tight">
                      {label}
                    </p>

                    {/* مؤشر التقدم */}
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-4">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          background: `linear-gradient(to right, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryHover})`,
                          width: isVisible ? '100%' : '0%',
                          transitionDelay: `${i * 200}ms`
                        }}
                      />
                    </div>
                  </div>

                  {/* تأثير الإضاءة عند الهوفر */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${THEME_COLORS.primary}1A, ${THEME_COLORS.primaryHover}1A)`
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : !reportLoading && reportError ? (
          // رسالة خطأ
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-3xl mb-6">
              <FaChartLine className="text-red-400 text-3xl" />
            </div>
            <h4 className="text-2xl font-bold text-red-600 mb-4">
              خطأ في تحميل البيانات
            </h4>
            <p className="text-gray-500 text-lg mb-4">
              حدث خطأ أثناء جلب بيانات سنة {selectedYear}
            </p>
            <button
              onClick={() => mutate()}
              className="px-6 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: THEME_COLORS.primary }}
            >
              إعادة المحاولة
            </button>
          </div>
        ) : !reportLoading ? (
          // رسالة عدم وجود بيانات
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-3xl mb-6">
              <FaChartLine className="text-gray-400 text-3xl" />
            </div>
            <h4 className="text-2xl font-bold text-gray-600 mb-4">
              لا توجد بيانات لسنة {selectedYear}
            </h4>
            <p className="text-gray-500 text-lg">
              {availableYears.length > 0 
                ? 'يرجى اختيار سنة أخرى من الخيارات المتاحة أعلاه'
                : 'لم يتم إضافة أي بيانات بعد'
              }
            </p>
          </div>
        ) : null}

        {/* شعار ختامي */}
        <div className="text-center mt-20 relative" data-aos="fade-up">
          <div 
            className="inline-block text-white rounded-2xl px-8 py-4 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${THEME_COLORS.primary} 0%, ${THEME_COLORS.primaryHover} 100%)`
            }}
          >
            <div className="flex items-center gap-3 text-xl font-bold">
              <FaHeart className="animate-pulse" />
              <span>صحتكم أولويتنا</span>
              <FaHeart className="animate-pulse" />
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

function ContactItem({ icon: Icon, label, value }) {
  return (
    <div className="group flex items-center gap-4 p-5 bg-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20">
      <div className="flex-shrink-0">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
          <Icon className="text-white text-xl" />
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-white/80 mb-1">{label}</h4>
        <p className="text-white font-bold text-lg group-hover:scale-105 transition-transform duration-300">{value}</p>
      </div>
    </div>
  );
}