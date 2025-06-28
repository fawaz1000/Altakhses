import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FaHospitalSymbol, FaUsers, FaUserPlus, FaBed, FaAward, FaPhone, FaEnvelope, FaMapMarkerAlt, FaChartLine, FaHeart, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import { MdDoneAll, MdTrendingUp } from 'react-icons/md';
import useSWR from 'swr';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { API_BASE } from '../../config';

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

const orderedStats = [
  { label: 'سنوات خبرة', icon: FaAward, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  { label: 'أطباء خبراء', icon: FaHospitalSymbol, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { label: 'غرف مجهزة', icon: FaBed, color: 'from-green-500 to-teal-500', bgColor: 'bg-green-50', textColor: 'text-green-600' },
  { label: 'عمليات منجزة', icon: MdDoneAll, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  { label: 'عدد المراجعين', icon: FaUsers, color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
  { label: 'عدد المراجعين الجدد', icon: FaUserPlus, color: 'from-teal-500 to-green-500', bgColor: 'bg-teal-50', textColor: 'text-teal-600' },
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
      
      // إذا لم تكن السنة المحددة متاحة، اختر أحدث سنة متاحة
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

  // مراقب التقاطع للرسوم المتحركة - هذا هو المكان الوحيد الذي يبدأ الأنيميشن
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
      <section id="about" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-6 rtl overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-[#0d5047] mx-auto mb-4" />
            <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 px-6 rtl overflow-hidden">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-[#0d5047]/20 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#28a49c]/30 rounded-full animate-ping delay-1500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header محدث */}
        <div className="text-center mb-20 relative" data-aos="fade-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#48D690] to-[#28a49c] rounded-3xl mb-8 shadow-2xl">
            <FaHeart className="text-white text-3xl animate-pulse" />
          </div>
          
          <h2 className="text-6xl md:text-7xl font-black mb-6 relative">
            <span className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] bg-clip-text text-transparent">
              من نحن
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0d5047]/20 to-[#28a49c]/20 blur-xl opacity-30 -z-10"></div>
          </h2>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-24 h-2 bg-gradient-to-r from-transparent to-[#0d5047] rounded-full animate-pulse"></div>
            <div className="w-12 h-12 border-4 border-[#0d5047] rounded-full flex items-center justify-center animate-spin-slow">
              <div className="w-6 h-6 bg-[#0d5047] rounded-full"></div>
            </div>
            <div className="w-24 h-2 bg-gradient-to-l from-transparent to-[#28a49c] rounded-full animate-pulse"></div>
          </div>
          
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            الرائدون في الخدمات الطبية المتخصصة بأحدث التقنيات العالمية
          </p>
        </div>

        {/* Main Content محدث */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24">
          {/* Text Content */}
          <div className="space-y-8 relative" data-aos="fade-right">
            {/* بطاقة المحتوى الرئيسية */}
            <div className="group relative bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
              {/* خلفية متحركة */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d5047]/5 to-[#28a49c]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 space-y-8 text-gray-700 text-lg leading-relaxed">
                <div className="relative">
                  <div className="absolute -right-6 top-0 w-2 h-full bg-gradient-to-b from-[#0d5047] to-[#28a49c] rounded-full"></div>
                  <div className="mb-4">
                    <span className="inline-block bg-gradient-to-r from-[#0d5047] to-[#28a49c] text-white font-bold text-xl px-6 py-2 rounded-2xl shadow-lg">
                      مجموعة التخصيص الطبية
                    </span>
                  </div>
                  <p className="text-xl leading-relaxed">
                    الرائدة في الخدمات الطبية بحائل. نقدم رعاية شاملة في تخصصات متعددة باستخدام أحدث التقنيات وأفضل الخبرات العالمية.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-[#0d5047]/10 to-[#28a49c]/10 rounded-2xl p-6 border border-[#0d5047]/20">
                  <p className="text-lg">
                    نسعى لتوفير بيئة صحية متميزة، معاييرنا تقوم على الجودة، الأمان، وراحة المريض.
                    <span className="block mt-3 font-bold text-[#0d5047] text-xl flex items-center gap-2">
                      <FaHeart className="animate-pulse" />
                      ابتسامتك هدفنا والاهتمام يرافق خطواتنا
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* بطاقة إضافية للخدمات المميزة */}
            <div className="bg-gradient-to-br from-[#0d5047] to-[#28a49c] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <MdTrendingUp className="text-3xl" />
                  خدماتنا المتميزة
                </h3>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    تشخيص دقيق بأحدث الأجهزة
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    فريق طبي متخصص ومدرب
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    خدمة عملاء متميزة 24/7
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info محدث */}
          <div className="space-y-8" data-aos="fade-left">
            {/* بطاقة التواصل الرئيسية */}
            <div className="relative bg-gradient-to-br from-[#0d5047] via-[#28a49c] to-[#0d5047] rounded-3xl p-10 text-white shadow-2xl overflow-hidden">
              {/* خلفية ديكورية */}
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
                  <p className="text-white/90 mt-2">نحن هنا لخدمتكم في أي وقت</p>
                </div>
                
                <div className="space-y-6">
                  <ContactItem icon={FaPhone} label="الرقم الموحد" value="920002111" />
                  <ContactItem icon={FaEnvelope} label="الإيميل" value="info@altakhsees.com" />
                  <ContactItem icon={FaMapMarkerAlt} label="الموقع" value="حائل، السعودية" />
                </div>

                {/* أزرار التواصل السريع */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <a
                    href="https://wa.me/966500069636"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-all duration-300 group"
                  >
                    <div className="text-2xl mb-2">💬</div>
                    <div className="font-semibold group-hover:scale-105 transition-transform duration-300">واتساب</div>
                  </a>
                  <a
                    href="tel:920002111"
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-all duration-300 group"
                  >
                    <div className="text-2xl mb-2">📞</div>
                    <div className="font-semibold group-hover:scale-105 transition-transform duration-300">اتصل بنا</div>
                  </a>
                </div>
              </div>
            </div>

            {/* بطاقة أوقات العمل */}
            
          </div>
        </div>

        {/* Stats Header محدث مع اختيار السنة */}
        <div id="stats-section" className="text-center mb-16" data-aos="fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0d5047] to-[#28a49c] rounded-2xl mb-6 shadow-xl">
            <FaChartLine className="text-white text-2xl" />
          </div>
          
          <h3 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-[#062b2d] to-[#0d5047] bg-clip-text text-transparent">
              أرقام التخصيص لسنة {selectedYear}
            </span>
          </h3>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            إنجازاتنا تتحدث عن جودة خدماتنا وثقة عملائنا
          </p>

          {/* اختيار السنة */}
          {availableYears.length > 1 && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-[#0d5047] text-xl" />
                <span className="text-lg font-medium text-gray-700">اختر السنة:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                      selectedYear === year
                        ? 'bg-gradient-to-r from-[#0d5047] to-[#28a49c] text-white shadow-lg scale-105'
                        : 'bg-white text-[#0d5047] border-2 border-[#0d5047]/20 hover:border-[#0d5047] hover:shadow-md hover:scale-105'
                    }`}
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
              <FaSpinner className="animate-spin text-2xl text-[#0d5047] mx-auto mb-2" />
              <p className="text-gray-600">جاري تحميل إحصائيات سنة {selectedYear}...</p>
            </div>
          )}
        </div>

        {/* Stats Grid محدث - من API */}
        {!reportLoading && metrics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
            {orderedStats.map(({ label, icon: Icon }, i) => {
              const stat = metrics.find((m) => m.label?.trim() === label);
              const animatedValue = animatedValues[label] || 0;
              const displayValue = stat ? (isVisible ? `${animatedValue}${stat.suffix || ''}` : '0') : '—';
              
              return (
                <div
                  key={label}
                  className={`group relative overflow-hidden bg-white rounded-3xl shadow-xl p-8 text-center transition-all duration-700 transform hover:-translate-y-4 hover:shadow-2xl border border-gray-100 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 150}ms` }}
                  data-aos="zoom-in"
                  data-aos-delay={i * 150}
                >
                  {/* خلفية ملونة */}
                  <div className={`absolute inset-0 bg-[#0d5047]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
                  
                  {/* أنماط ديكورية */}
                  <div className="absolute inset-0 opacity-5">
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#0d5047] to-[#28a49c] rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700`} />
                    <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-[#0d5047] to-[#28a49c] rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 transition-transform duration-700`} />
                  </div>

                  <div className="relative z-10">
                    {/* أيقونة */}
                    <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#0d5047] to-[#28a49c] text-white rounded-3xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                      <Icon size={32} />
                      <div className={`absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    </div>
                    
                    {/* الرقم */}
                    <h3 className={`text-5xl font-black mb-3 leading-none transition-all duration-500 text-[#0d5047] group-hover:scale-110`}>
                      {displayValue}
                    </h3>
                    
                    {/* التسمية */}
                    <p className="text-sm font-bold text-gray-600 group-hover:text-gray-800 transition-colors leading-tight">
                      {label}
                    </p>

                    {/* مؤشر التقدم */}
                    <div className={`w-full h-1 bg-gray-200 rounded-full mt-4 overflow-hidden`}>
                      <div 
                        className={`h-full bg-gradient-to-r from-[#0d5047] to-[#28a49c] rounded-full transition-all duration-1000 ${isVisible ? 'w-full' : 'w-0'}`}
                        style={{ transitionDelay: `${i * 200}ms` }}
                      />
                    </div>
                  </div>

                  {/* تأثير الإضاءة */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-[#0d5047]/10 to-[#28a49c]/10 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl pointer-events-none`} />
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
              className="bg-[#0d5047] text-white px-6 py-3 rounded-lg hover:bg-[#28a49c] transition-colors"
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
          <div className="inline-block bg-gradient-to-r from-[#0d5047] to-[#28a49c] text-white rounded-2xl px-8 py-4 shadow-xl">
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