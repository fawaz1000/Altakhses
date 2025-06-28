// src/App.jsx
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
import DentistServices from './Pages/Dentist/services';
import DentistDoctors  from './Pages/Dentist/doctors';
import InternistServices from './Pages/Internist/services';
import InternistDoctors  from './Pages/Internist/doctor';
import GeneralServices   from './Pages/General/services';
import GeneralDoctor     from './Pages/General/doctor';
import EntServices       from './Pages/ENT/services';
import EntDoctor         from './Pages/ENT/doctor';

import AdminLogin    from './Pages/AdminLogin';
import Dashboard     from './Pages/Dashboard';
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
            <Route path="/" element={<MainLayout />} />
            <Route path="/dentist"        element={<DentistServices />} />
            <Route path="/dentistdoctors" element={<DentistDoctors />} />
            <Route path="/internist"      element={<InternistServices />} />
            <Route path="/internistdoctors" element={<InternistDoctors />} />
            <Route path="/general"          element={<GeneralServices />} />
            <Route path="/generaldoctor"    element={<GeneralDoctor />} />
            <Route path="/ent"              element={<EntServices />} />
            <Route path="/entdoctor"        element={<EntDoctor />} />

            {/* إدارة */}
            <Route path="/admin/login"   element={<AdminLogin />} />
            <Route path="/admin/dashboard"
                   element={
                     <ProtectedRoute>
                       <Dashboard />
                     </ProtectedRoute>
                   }
            />

            {/* 404 */}
            <Route path="*" element={
              <h1 className="text-center text-xl mt-32 text-red-500 font-bold">
                الصفحة غير موجودة
              </h1>
            }/>
          </Routes>
        </main>
        {!isAdminPage && <Footer />}
      </div>
    </Router>
  );
}
