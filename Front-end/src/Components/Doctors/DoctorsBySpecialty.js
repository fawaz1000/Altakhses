// Front-end/src/Components/Doctors/DoctorsBySpecialty.js
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
  FaHandHoldingMedical,
  FaTooth,
  FaSpinner,
  FaExclamationTriangle,
  FaChevronRight,
  FaHome,
  FaUserMd,
  FaGraduationCap,
  FaHeart,
  FaPhone
} from 'react-icons/fa';
import { GiBrokenBone } from 'react-icons/gi';
import { MdEmergency, MdPregnantWoman } from 'react-icons/md';
import { RiMentalHealthLine } from 'react-icons/ri';
import { API_BASE } from '../../config';

export default function DoctorsBySpecialty() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer للتأثيرات البصرية
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // جلب بيانات التخصص والأطباء
  const fetchSpecialtyAndDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching doctors for specialty:', categorySlug);

      const response = await axios.get(`${API_BASE}/api/doctors/category/${categorySlug}`);
      
      if (response.data.success) {
        setSpecialty(response.data.specialty);
        setDoctors(response.data.data);
        console.log(`✅ Found ${response.data.data.length} doctors for specialty`);
      } else {
        setError('التخصص المطلوب غير موجود');
      }
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      if (error.response?.status === 404) {
        setError('التخصص المطلوب غير موجود');
      } else {
        setError('حدث خطأ في تحميل البيانات');
      }
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchSpecialtyAndDoctors();
  }, [fetchSpecialtyAndDoctors]);

  // دالة للحصول على الأيقونة المناسبة
  const getSpecialtyIcon = useCallback((iconName, specialtyName) => {
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

    // fallback بناءً على اسم التخصص
    if (!specialtyName) return <FaStethoscope className={iconClass} />;
    
    const name = specialtyName.toLowerCase();
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

  // معالجة حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#062b2d] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل أطباء التخصص...</p>
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
              onClick={fetchSpecialtyAndDoctors}
              className="bg-[#062b2d] text-white px-6 py-3 rounded-lg hover:bg-[#0a3a35] transition-colors duration-300"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              العودة للرئيسية
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
                onClick={() => navigate('/#doctors')}
                className="text-sm hover:text-white transition-colors"
              >
                الأطباء
              </button>
              <FaChevronRight className="text-xs" />
              <span className="text-sm text-white">{specialty?.name}</span>
            </nav>

            {/* معلومات التخصص */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* الأيقونة */}
              <div className="relative">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                  <div className="w-16 h-16 text-white">
                    {getSpecialtyIcon(specialty?.icon, specialty?.name)}
                  </div>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl blur opacity-50"></div>
              </div>

              {/* النصوص */}
              <div className="flex-1 text-center lg:text-right">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                  أطباء {specialty?.name}
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-3xl lg:mx-0 mx-auto leading-relaxed">
                  {specialty?.description || `فريق متخصص من أطباء ${specialty?.name} لتقديم أفضل الرعاية الطبية`}
                </p>
                
                {/* إحصائيات */}
                <div className="flex items-center justify-center lg:justify-start gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{doctors.length}</div>
                    <div className="text-white/80 text-sm">طبيب متاح</div>
                  </div>
                  <div className="w-px h-12 bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-white/80 text-sm">متاح</div>
                  </div>
                </div>
              </div>

              {/* زر العودة */}
              <button
                onClick={() => navigate('/#doctors')}
                className="lg:self-start bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center gap-3 border border-white/20"
              >
                <FaArrowRight />
                <span>العودة للأطباء</span>
              </button>
            </div>
          </div>
        </div>

        {/* محتوى الأطباء */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {doctors.length === 0 ? (
            // حالة عدم وجود أطباء
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <FaUserMd className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                لا يوجد أطباء في هذا التخصص حالياً
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                نعمل على إضافة المزيد من الأطباء المتخصصين في {specialty?.name}. يرجى المحاولة مرة أخرى لاحقاً.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/#doctors')}
                  className="bg-[#062b2d] text-white px-8 py-3 rounded-lg hover:bg-[#0a3a35] transition-colors duration-300"
                >
                  تصفح أطباء آخرين
                </button>
                <a
                  href="https://wa.me/966500069636"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
                >
                  تواصل معنا
                </a>
              </div>
            </div>
          ) : (
            // عرض الأطباء
            <>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-[#062b2d] mb-4">
                  أطباء {specialty?.name}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#062b2d] to-[#28a49c] rounded-full mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {doctors.map((doctor, index) => (
                  <div
                    key={doctor._id}
                    className={`bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 group ${
                      isVisible ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* صورة الطبيب */}
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto relative">
                        {doctor.image ? (
                          <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="w-full h-full object-cover rounded-full border-3 border-white shadow-lg group-hover:border-[#0d5047] transition-all duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Avatar افتراضي */}
                        <div className={`w-full h-full ${doctor.image ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-[#0d5047] to-[#28a49c] rounded-full border-3 border-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                          <FaUserMd className="text-white text-2xl" />
                        </div>
                        
                        {/* مؤشر التخصص */}
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-[#0d5047] to-[#28a49c] border-3 border-white rounded-full flex items-center justify-center shadow-md">
                          <div className="w-3 h-3 text-white">
                            {getSpecialtyIcon(specialty?.icon, specialty?.name)}
                          </div>
                        </div>
                      </div>
                      
                      {/* حلقة ديكورية */}
                      <div className="absolute inset-0 w-24 h-24 mx-auto border-2 border-dashed border-[#0d5047]/20 rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* معلومات الطبيب */}
                    <div className="text-center space-y-3">
                      <h3 className="text-xl font-black text-gray-800 group-hover:text-[#0d5047] transition-colors duration-300 leading-tight">
                        {doctor.name}
                      </h3>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-[#28a49c] flex items-center justify-center gap-2">
                          <FaGraduationCap className="text-[#0d5047] text-xs" />
                          {specialty?.name}
                        </p>
                        
                        {/* شريط ديكوري */}
                        <div className="w-16 h-0.5 bg-gradient-to-r from-[#0d5047] to-[#28a49c] mx-auto rounded-full group-hover:w-24 transition-all duration-300" />
                      </div>
                      
                      {doctor.experience && (
                        <p className="text-gray-600 text-sm flex items-center justify-center gap-2 group-hover:text-gray-700 transition-colors duration-300">
                          <FaHeart className="text-[#28a49c] text-xs" />
                          {doctor.experience}
                        </p>
                      )}

                      {/* أزرار التواصل */}
                      <div className="mt-6 space-y-3 transform transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
                        <a
                          href="https://wa.me/966500069636"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d5047] to-[#28a49c] text-white font-bold px-4 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 group/btn text-sm"
                        >
                          <span>احجز موعد</span>
                          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover/btn:bg-white/30 transition-colors duration-300">
                            <FaPhone className="text-xs group-hover/btn:scale-110 transition-transform duration-300" />
                          </div>
                        </a>
                        
                        <a
                          href="https://wa.me/966500069636"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-green-700 hover:shadow-lg transition-all duration-300 text-sm"
                        >
                          <span>واتساب</span>
                          <span className="text-xs">💬</span>
                        </a>
                      </div>
                    </div>

                    {/* تأثير الإضاءة */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d5047]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                  </div>
                ))}
              </div>

              {/* دعوة للعمل */}
              <div className="text-center mt-16">
                <div className="bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
                  {/* خلفية ديكورية */}
                  <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20 animate-pulse delay-1000"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
                      {getSpecialtyIcon(specialty?.icon, specialty?.name)}
                    </div>
                    
                    <h3 className="text-3xl font-bold mb-4">
                      هل تحتاج إلى استشارة في {specialty?.name}؟
                    </h3>
                    <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                      فريقنا المتخصص في {specialty?.name} جاهز لتقديم أفضل الخدمات الطبية على مدار الساعة
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
            </>
          )}
        </div>
      </div>

      {/* Styles مخصصة */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-spin-slow {
          animation: spin 12s linear infinite;
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
      `}</style>
    </div>
  );
}