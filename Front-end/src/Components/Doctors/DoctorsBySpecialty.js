// Front-end/src/Components/Doctors/DoctorsBySpecialty.js - تصميم مبتكر ومتطور
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaStethoscope,
  FaExclamationTriangle,
  FaChevronRight,
  FaHome,
  FaUserMd,
  FaClock,
  FaAward,
  FaStar
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { API_BASE } from '../../config';

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

// دالة مساعدة لتنسيق سنوات الخبرة
const formatExperienceYears = (years) => {
  if (!years || years === 0) return '';
  const yearNum = parseInt(years);
  if (yearNum >= 2 && yearNum <= 10) {
    return `${yearNum}+ سنوات`;
  } else {
    return `${yearNum}+ سنة`;
  }
};

export default function DoctorsBySpecialty() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // حل مشكلة التمرير - التأكد من البدء من أعلى الصفحة
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // التأكد من التمرير لأعلى عند تغيير categorySlug
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug]);

  const fetchSpecialtyAndDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE}/api/doctors/category/${categorySlug}`);
      
      if (response.data.success) {
        setSpecialty(response.data.specialty);
        setDoctors(response.data.data);
      } else {
        setError('التخصص المطلوب غير موجود');
      }
      
    } catch (error) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-[#062b2d] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-[#28a49c]/30 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-[#062b2d] mb-2">جاري التحميل</h3>
          <p className="text-gray-600 text-lg">يتم تحميل أطباء التخصص...</p>
        </div>
      </div>
    );
  }

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
              onClick={fetchSpecialtyAndDoctors}
              className="bg-gradient-to-r from-[#062b2d] to-[#0d5047] text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold"
            >
              العودة للرئيسية
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
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-green-200/30 to-emerald-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header مبسط ومتداخل */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] pt-32 pb-20">
          {/* عناصر ديكورية */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16 blur-lg"></div>
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
                    onClick={() => navigate('/#doctors')}
                    className="text-lg hover:text-white transition-colors font-medium"
                  >
                    الأطباء
                  </button>
                </div>
                <FaChevronRight className="text-white/60" />
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                  <span className="text-lg text-white font-semibold">{specialty?.name}</span>
                </div>
              </nav>

              {/* محتوى الرأس */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* النصوص */}
                <div className="text-center lg:text-right">
                  <div className="mb-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                      أطباء متخصصون في
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-200">
                        {specialty?.name}
                      </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light max-w-2xl lg:mx-0 mx-auto">
                      {specialty?.description || `نخبة من أفضل الأطباء المتخصصين في ${specialty?.name} مع خبرة واسعة وسمعة ممتازة`}
                    </p>
                  </div>
                  
                  {/* إحصائية واحدة فقط */}
                  <div className="flex justify-center lg:justify-start">
                    <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 min-w-[200px]">
                      <div className="text-4xl font-black text-white mb-2">{doctors.length}</div>
                      <div className="text-white/80 font-medium text-lg">طبيب متخصص</div>
                    </div>
                  </div>
                </div>

                {/* الصورة والعناصر البصرية - استخدام الصور بدلاً من الأيقونات */}
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    {/* الصورة الرئيسية */}
                    <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                      {specialty?.image ? (
                        <img
                          src={getImageUrl(specialty.image)}
                          alt={specialty.name}
                          className="w-full h-full object-cover relative z-10"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`${specialty?.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full relative z-10`}>
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

        {/* قسم الأطباء */}
        <div className="relative py-20 px-8">
          <div className="max-w-6xl mx-auto">
            {doctors.length === 0 ? (
              // حالة عدم وجود أطباء
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <FaUserMd className="text-6xl text-gray-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-700 mb-6">
                  لا يوجد أطباء متاحون حالياً
                </h3>
                <p className="text-gray-500 mb-12 max-w-2xl mx-auto text-xl leading-relaxed">
                  نعمل جاهدين على إضافة المزيد من الأطباء المتخصصين في {specialty?.name}. 
                  يرجى المحاولة مرة أخرى قريباً أو تصفح تخصصات أخرى.
                </p>
                <button
                  onClick={() => navigate('/#doctors')}
                  className="bg-gradient-to-r from-[#062b2d] to-[#0d5047] text-white px-10 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold text-lg"
                >
                  تصفح التخصصات الأخرى
                </button>
              </div>
            ) : (
              <>
                {/* عنوان القسم مبسط */}
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-6">
                    الأطباء
                  </h2>
                  <div className="w-40 h-2 bg-gradient-to-r from-[#062b2d] via-[#0d5047] to-[#28a49c] rounded-full mx-auto"></div>
                </div>

                {/* شبكة الأطباء - تصميم بهوية الموقع */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {doctors.map((doctor, index) => (
                    <div
                      key={doctor._id}
                      className={`group relative bg-gradient-to-br from-[#062b2d] via-[#0d5047] to-[#28a49c] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                      }`}
                      style={{ 
                        animationDelay: `${index * 150}ms`,
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {/* خلفية ديكورية */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                      </div>
                      
                      {/* محتوى الكرت */}
                      <div className="relative z-10 p-6">
                        {/* صورة واسم الطبيب - في الأعلى */}
                        <div className="text-center mb-6">
                          <div className="relative inline-block mb-4">
                            {doctor.image ? (
                              <img
                                src={getImageUrl(doctor.image)}
                                alt={doctor.name}
                                className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            
                            <div className={`w-20 h-20 ${doctor.image ? 'hidden' : 'flex'} items-center justify-center bg-white/20 backdrop-blur-md rounded-full border-4 border-white shadow-xl`}>
                              <FaUserMd className="text-white text-3xl" />
                            </div>
                            
                            {/* شارة التحقق */}
                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <MdVerified className="text-white text-sm" />
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-100 transition-colors duration-300">
                            {doctor.name}
                          </h3>
                          
                          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                            <div className="w-4 h-4 text-white overflow-hidden rounded-full">
                              {specialty?.image ? (
                                <img
                                  src={getImageUrl(specialty.image)}
                                  alt={specialty.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                              ) : null}
                              <FaStethoscope className={`${specialty?.image ? 'hidden' : 'block'} w-full h-full`} />
                            </div>
                            <span className="text-sm font-bold text-white">{specialty?.name}</span>
                          </div>
                        </div>

                        {/* المعلومات الأساسية - فقط المطلوبة */}
                        <div className="space-y-3">
                          
                          {/* المؤهلات */}
                          {doctor.qualifications && (
                            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <FaAward className="text-white text-sm" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-green-200 uppercase mb-1">المؤهلات</div>
                                <div className="text-sm font-semibold text-white truncate">{doctor.qualifications}</div>
                              </div>
                            </div>
                          )}

                          {/* سنوات الخبرة */}
                          {doctor.yearsOfExperience && (
                            <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <FaClock className="text-white text-sm" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-bold text-green-200 uppercase mb-1">سنوات الخبرة</div>
                                <div className="text-sm font-semibold text-white">{formatExperienceYears(doctor.yearsOfExperience)}</div>
                              </div>
                            </div>
                          )}

                          {/* الحالات المتخصصة */}
                          {doctor.conditions && (
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                                  <FaStar className="text-white text-xs" />
                                </div>
                                <div className="text-xs font-bold text-green-200 uppercase">الحالات التي يعالجها</div>
                              </div>
                              <p className="text-sm text-white/90 leading-relaxed line-clamp-2">
                                {doctor.conditions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* تأثيرات بصرية متطورة */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#062b2d] via-transparent to-[#28a49c]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#28a49c] via-[#0d5047] to-[#062b2d] rounded-2xl opacity-0 group-hover:opacity-60 blur transition-opacity duration-500 -z-10"></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}