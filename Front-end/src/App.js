// src/App.jsx - Fixed version with proper routing
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

// صفحة عامة للخدمات
import ServicesByCategory from './Components/Services/ServicesByCategory';

// صفحة الأطباء حسب التخصص
import DoctorsBySpecialty from './Components/Doctors/DoctorsBySpecialty';

// صفحات الإدارة
import AdminLogin from './Pages/AdminLogin';
import Dashboard from './Pages/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

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
      <div className="flex flex-col min-h-screen">
        {!isAdminPage && <Navbar />}
        <main className="flex-grow">
          <Routes>
            {/* الصفحة الرئيسية */}
            <Route path="/" element={<MainLayout />} />
            
            {/* صفحة عامة للخدمات حسب القسم */}
            <Route path="/services/:categorySlug" element={<ServicesByCategory />} />
            
            {/* صفحة جميع الأقسام */}
            <Route path="/services" element={<Services />} />

            {/* صفحة الأطباء حسب التخصص */}
            <Route path="/doctors/:categorySlug" element={<DoctorsBySpecialty />} />
            
            {/* صفحة جميع الأطباء */}
            <Route path="/doctors" element={<Doctors />} />

            {/* مسارات مخصصة للتخصصات الشائعة */}
            <Route path="/dentist" element={<DoctorsBySpecialty />} />
            <Route path="/internist" element={<DoctorsBySpecialty />} />
            <Route path="/pediatrics" element={<DoctorsBySpecialty />} />
            <Route path="/orthopedics" element={<DoctorsBySpecialty />} />
            <Route path="/ophthalmology" element={<DoctorsBySpecialty />} />
            <Route path="/gynecology" element={<DoctorsBySpecialty />} />

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
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center max-w-md mx-auto px-6">
                  <div className="text-8xl mb-8">😔</div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">الصفحة غير موجودة</h1>
                  <p className="text-gray-600 mb-8">عذراً، الصفحة التي تبحث عنها غير متوفرة</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/"
                      className="bg-[#0d5047] text-white px-6 py-3 rounded-lg hover:bg-[#28a49c] transition-colors duration-300"
                    >
                      العودة للرئيسية
                    </a>
                    <a
                      href="/services"
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                    >
                      تصفح الخدمات
                    </a>
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