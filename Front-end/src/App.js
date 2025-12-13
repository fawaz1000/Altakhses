import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './Components/Navbar/navbar';
import Footer from './Components/Footer/footer';
import Hero from './Components/Hero/hero';
import About from './Components/AboutUs/aboutUs';
import Services from './Components/Services/services';
import Doctors from './Components/Doctors/doctors';
import MediaChannel from './Components/MediaChannel/media';
import PartnersSlider from './Components/PartnersSlider/PartnersSlider';

// صفحات الخدمات
import ServicesByCategory from './Components/Services/ServicesByCategory';
import ServiceDetails from './Components/Services/ServiceDetails';

// صفحة الأطباء حسب التخصص
import DoctorsBySpecialty from './Components/Doctors/DoctorsBySpecialty';

// صفحات الإدارة
import AdminLogin from './Pages/AdminLogin';
import Dashboard from './Pages/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

// تخطيط الصفحة الرئيسية بالترتيب المطلوب
const MainLayout = () => (
  <>
    <Hero />
    <About />
    <Services />
    <Doctors />
    <MediaChannel />
    <PartnersSlider />
  </>
);

export default function App() {
  const isAdminPage = window.location.pathname.startsWith('/admin');

  return (
    <Router>
      <div className="flex flex-col min-h-screen" dir="rtl">
        {!isAdminPage && <Navbar />}
        <main className="flex-grow">
          <Routes>
            {/* الصفحة الرئيسية */}
            <Route path="/" element={<MainLayout />} />
            
            {/* صفحة جميع الأقسام الطبية */}
            <Route path="/services" element={<Services />} />
            
            {/* صفحة خدمات القسم المحدد */}
            <Route path="/services/category/:categorySlug" element={<ServicesByCategory />} />
            
            {/* صفحة تفاصيل الخدمة المحددة */}
            <Route path="/services/category/:categorySlug/:serviceSlug" element={<ServiceDetails />} />

            {/* صفحة جميع الأطباء */}
            <Route path="/doctors" element={<Doctors />} />

            {/* صفحة الأطباء حسب التخصص */}
            <Route path="/doctors/:categorySlug" element={<DoctorsBySpecialty />} />

            {/* صفحات الإدارة */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* صفحة 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rtl">
                <div className="text-center max-w-md mx-auto px-6">
                  <div className="text-8xl mb-8">😔</div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">الصفحة غير موجودة</h1>
                  <p className="text-gray-600 mb-8">عذراً، الصفحة التي تبحث عنها غير متوفرة</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/"
                      className="bg-[#0d5047] text-white px-6 py-3 rounded-lg hover:bg-[#28a49c] transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      🏠 العودة للرئيسية
                    </a>
                    <a
                      href="/services"
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      🏥 تصفح الخدمات
                    </a>
                  </div>
                  
                  {/* روابط مفيدة إضافية */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">روابط مفيدة</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <a
                        href="/doctors"
                        className="text-[#0d5047] hover:text-[#28a49c] transition-colors duration-300 px-3 py-1 rounded-md hover:bg-[#0d5047]/5"
                      >
                        الأطباء
                      </a>
                      <span className="text-gray-300">|</span>
                      <a
                        href="https://wa.me/966500069636"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 transition-colors duration-300 px-3 py-1 rounded-md hover:bg-green-50"
                      >
                        واتساب
                      </a>
                      <span className="text-gray-300">|</span>
                      <a
                        href="tel:920002111"
                        className="text-blue-600 hover:text-blue-700 transition-colors duration-300 px-3 py-1 rounded-md hover:bg-blue-50"
                      >
                        اتصل بنا
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }/>
          </Routes>
        </main>
        {!isAdminPage && <Footer />}
      </div>
    </Router>
  );
}