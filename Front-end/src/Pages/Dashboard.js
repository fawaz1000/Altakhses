// Front-end/src/Pages/Dashboard.js - مُصحح بالكامل
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import {
  FaHome,
  FaList,
  FaCog,
  FaChartBar,
  FaImages,
  FaUserMd,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaEye,
  FaDownload,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { API_BASE } from '../config';

function Dashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // States for Categories
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedCategory, setUpdatedCategory] = useState({ name: '', description: '' });
  
  // States for Services
  const [services, setServices] = useState([]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', categoryId: '' });
  const [editingService, setEditingService] = useState(null);
  const [updatedService, setUpdatedService] = useState({ name: '', description: '', categoryId: '' });
  
  // States for Doctors
  const [doctors, setDoctors] = useState([]);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', experience: '', image: '' });
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [updatedDoctor, setUpdatedDoctor] = useState({ name: '', specialty: '', experience: '', image: '' });
  
  // States for Media
  const [mediaItems, setMediaItems] = useState([]);
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [newMedia, setNewMedia] = useState({ title: '', description: '', category: 'general', file: null });
  
  // States for Reports
  const [reports, setReports] = useState([]);
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [newReport, setNewReport] = useState({ year: new Date().getFullYear(), metrics: [] });
  const [editingReport, setEditingReport] = useState(null);
  const [updatedReport, setUpdatedReport] = useState({ year: '', metrics: [] });
  
  // Common states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Configure axios defaults
  const getAxiosConfig = () => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        navigate('/admin/login');
        return;
      }
      setUserInfo(decoded);
      setLoading(false);
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('token');
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/categories`, getAxiosConfig());
      const categoriesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('خطأ في جلب الأقسام الطبية');
    }
  }, []);

  // Fetch Services
  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/services?populate=category`, getAxiosConfig());
      const servicesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('خطأ في جلب الخدمات');
    }
  }, []);

  // Fetch Doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/doctors`, getAxiosConfig());
      const doctorsData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('خطأ في جلب الأطباء');
    }
  }, []);

  // Fetch Media
  const fetchMedia = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/media`, getAxiosConfig());
      const mediaData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setMediaItems(mediaData);
    } catch (error) {
      console.error('Error fetching media:', error);
      setError('خطأ في جلب الوسائط');
    }
  }, []);

  // Fetch Reports
  const fetchReports = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/reports/all`, getAxiosConfig());
      const reportsData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('خطأ في جلب التقارير');
    }
  }, []);

  // Load data based on active section
  useEffect(() => {
    if (!userInfo) return;

    switch (activeSection) {
      case 'categories':
        fetchCategories();
        break;
      case 'services':
        fetchServices();
        fetchCategories(); // للحصول على الأقسام للخدمات
        break;
      case 'doctors':
        fetchDoctors();
        fetchCategories(); // للحصول على التخصصات
        break;
      case 'media':
        fetchMedia();
        break;
      case 'reports':
        fetchReports();
        break;
      default:
        fetchCategories();
        fetchServices();
        fetchDoctors();
        fetchMedia();
        break;
    }
  }, [activeSection, userInfo, fetchCategories, fetchServices, fetchDoctors, fetchMedia, fetchReports]);

  // Category Functions
  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim() || !newCategory.description.trim()) return;

    setActionLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/categories`, newCategory, getAxiosConfig());
      
      if (response.data) {
        const categoryData = response.data.data || response.data;
        setCategories(prev => [...prev, categoryData]);
        setNewCategory({ name: '', description: '' });
        setIsAddingCategory(false);
        setSuccess('تم إضافة القسم بنجاح');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setError(error.response?.data?.message || 'خطأ في إضافة القسم');
    } finally {
      setActionLoading(false);
    }
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (!updatedCategory.name.trim() || !editingCategory) return;

    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/api/categories/${editingCategory._id}`,
        updatedCategory,
        getAxiosConfig()
      );
      
      if (response.data) {
        const categoryData = response.data.data || response.data;
        setCategories(prev => 
          prev.map(cat => 
            cat._id === editingCategory._id ? categoryData : cat
          )
        );
        setEditingCategory(null);
        setUpdatedCategory({ name: '', description: '' });
        setSuccess('تم تحديث القسم بنجاح');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError(error.response?.data?.message || 'خطأ في تحديث القسم');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/categories/${categoryId}`, getAxiosConfig());
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      setSuccess('تم حذف القسم بنجاح');
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error.response?.data?.message || 'خطأ في حذف القسم');
    } finally {
      setActionLoading(false);
    }
  };

  // Service Functions
  const addService = async (e) => {
    e.preventDefault();
    if (!newService.name.trim() || !newService.description.trim()) return;

    setActionLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/services`, newService, getAxiosConfig());
      
      if (response.data) {
        const serviceData = response.data.data || response.data;
        setServices(prev => [...prev, serviceData]);
        setNewService({ name: '', description: '', categoryId: '' });
        setIsAddingService(false);
        setSuccess('تم إضافة الخدمة بنجاح');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      setError(error.response?.data?.message || 'خطأ في إضافة الخدمة');
    } finally {
      setActionLoading(false);
    }
  };

  const updateService = async (e) => {
    e.preventDefault();
    if (!updatedService.name.trim() || !editingService) return;

    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/api/services/${editingService._id}`,
        updatedService,
        getAxiosConfig()
      );
      
      if (response.data) {
        const serviceData = response.data.data || response.data;
        setServices(prev => 
          prev.map(service => 
            service._id === editingService._id ? serviceData : service
          )
        );
        setEditingService(null);
        setUpdatedService({ name: '', description: '', categoryId: '' });
        setSuccess('تم تحديث الخدمة بنجاح');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      setError(error.response?.data?.message || 'خطأ في تحديث الخدمة');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/services/${serviceId}`, getAxiosConfig());
      setServices(prev => prev.filter(service => service._id !== serviceId));
      setSuccess('تم حذف الخدمة بنجاح');
    } catch (error) {
      console.error('Error deleting service:', error);
      setError(error.response?.data?.message || 'خطأ في حذف الخدمة');
    } finally {
      setActionLoading(false);
    }
  };

  // Doctor Functions
  const addDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctor.name.trim() || !newDoctor.specialty) return;

    setActionLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/doctors`, newDoctor, getAxiosConfig());
      
      if (response.data) {
        const doctorData = response.data.data || response.data;
        setDoctors(prev => [...prev, doctorData]);
        setNewDoctor({ name: '', specialty: '', experience: '', image: '' });
        setIsAddingDoctor(false);
        setSuccess('تم إضافة الطبيب بنجاح');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      setError(error.response?.data?.message || 'خطأ في إضافة الطبيب');
    } finally {
      setActionLoading(false);
    }
  };

  const updateDoctor = async (e) => {
    e.preventDefault();
    if (!updatedDoctor.name.trim() || !updatedDoctor.specialty || !editingDoctor) return;

    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/api/doctors/${editingDoctor._id}`,
        updatedDoctor,
        getAxiosConfig()
      );
      
      if (response.data) {
        const doctorData = response.data.data || response.data;
        setDoctors(prev => 
          prev.map(doctor => 
            doctor._id === editingDoctor._id ? doctorData : doctor
          )
        );
        setEditingDoctor(null);
        setUpdatedDoctor({ name: '', specialty: '', experience: '', image: '' });
        setSuccess('تم تحديث بيانات الطبيب بنجاح');
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      setError(error.response?.data?.message || 'خطأ في تحديث بيانات الطبيب');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteDoctor = async (doctorId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return;

    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/doctors/${doctorId}`, getAxiosConfig());
      setDoctors(prev => prev.filter(doctor => doctor._id !== doctorId));
      setSuccess('تم حذف الطبيب بنجاح');
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setError(error.response?.data?.message || 'خطأ في حذف الطبيب');
    } finally {
      setActionLoading(false);
    }
  };

  // Media Functions
  const addMedia = async (e) => {
    e.preventDefault();
    if (!newMedia.title.trim() || !newMedia.file) return;

    setActionLoading(true);
    const formData = new FormData();
    formData.append('title', newMedia.title.trim());
    formData.append('description', newMedia.description.trim());
    formData.append('category', newMedia.category);
    formData.append('media', newMedia.file);

    try {
      const response = await axios.post(`${API_BASE}/api/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data) {
        const mediaData = response.data.data || response.data;
        setMediaItems(prev => [...prev, mediaData]);
        setNewMedia({ title: '', description: '', category: 'general', file: null });
        setIsAddingMedia(false);
        setSuccess('تم رفع الوسائط بنجاح');
      }
    } catch (error) {
      console.error('Error adding media:', error);
      setError(error.response?.data?.message || 'خطأ في رفع الوسائط');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteMedia = async (mediaId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوسائط؟')) return;

    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/media/${mediaId}`, getAxiosConfig());
      setMediaItems(prev => prev.filter(media => media._id !== mediaId));
      setSuccess('تم حذف الوسائط بنجاح');
    } catch (error) {
      console.error('Error deleting media:', error);
      setError(error.response?.data?.message || 'خطأ في حذف الوسائط');
    } finally {
      setActionLoading(false);
    }
  };

  // Report Functions
  const addReport = async (e) => {
    e.preventDefault();
    if (!newReport.year || !newReport.metrics.length) return;

    setActionLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/reports`, newReport, getAxiosConfig());
      
      if (response.data) {
        const reportData = response.data.data || response.data;
        setReports(prev => [...prev, reportData]);
        setNewReport({ year: new Date().getFullYear(), metrics: [] });
        setIsAddingReport(false);
        setSuccess('تم إضافة التقرير بنجاح');
      }
    } catch (error) {
      console.error('Error adding report:', error);
      setError(error.response?.data?.message || 'خطأ في إضافة التقرير');
    } finally {
      setActionLoading(false);
    }
  };

  const updateReport = async (e) => {
    e.preventDefault();
    if (!updatedReport.year || !updatedReport.metrics.length || !editingReport) return;

    setActionLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/reports`,
        updatedReport,
        getAxiosConfig()
      );
      
      if (response.data) {
        const reportData = response.data.data || response.data;
        setReports(prev => 
          prev.map(report => 
            report.year === editingReport.year ? reportData : report
          )
        );
        setEditingReport(null);
        setUpdatedReport({ year: '', metrics: [] });
        setSuccess('تم تحديث التقرير بنجاح');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      setError(error.response?.data?.message || 'خطأ في تحديث التقرير');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReport = async (year) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) return;

    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/reports/${year}`, getAxiosConfig());
      setReports(prev => prev.filter(report => report.year !== year));
      setSuccess('تم حذف التقرير بنجاح');
    } catch (error) {
      console.error('Error deleting report:', error);
      setError(error.response?.data?.message || 'خطأ في حذف التقرير');
    } finally {
      setActionLoading(false);
    }
  };

  // Clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  if (loading || !userInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#062b2d] mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex rtl">
      {/* Sidebar */}
      <div className="w-64 bg-[#062b2d] text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">لوحة التحكم</h1>
          <p className="text-gray-300">مرحباً، {userInfo.username}</p>
        </div>
        
        <nav className="mt-8">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full text-right px-6 py-3 flex items-center transition-colors ${
              activeSection === 'dashboard' ? 'bg-[#0a3c40] border-r-4 border-white' : 'hover:bg-[#0a3c40]'
            }`}
          >
            <FaHome className="ml-3" />
            الرئيسية
          </button>
          
          <button
            onClick={() => setActiveSection('categories')}
            className={`w-full text-right px-6 py-3 flex items-center transition-colors ${
              activeSection === 'categories' ? 'bg-[#0a3c40] border-r-4 border-white' : 'hover:bg-[#0a3c40]'
            }`}
          >
            <FaList className="ml-3" />
            الأقسام الطبية
          </button>
          
          <button
            onClick={() => setActiveSection('services')}
            className={`w-full text-right px-6 py-3 flex items-center transition-colors ${
              activeSection === 'services' ? 'bg-[#0a3c40] border-r-4 border-white' : 'hover:bg-[#0a3c40]'
            }`}
          >
            <FaCog className="ml-3" />
            الخدمات
          </button>
          
          <button
            onClick={() => setActiveSection('doctors')}
            className={`w-full text-right px-6 py-3 flex items-center transition-colors ${
              activeSection === 'doctors' ? 'bg-[#0a3c40] border-r-4 border-white' : 'hover:bg-[#0a3c40]'
            }`}
          >
            <FaUserMd className="ml-3" />
            الأطباء
          </button>
          
          <button
            onClick={() => setActiveSection('media')}
            className={`w-full text-right px-6 py-3 flex items-center transition-colors ${
              activeSection === 'media' ? 'bg-[#0a3c40] border-r-4 border-white' : 'hover:bg-[#0a3c40]'
            }`}
          >
            <FaImages className="ml-3" />
            الوسائط
          </button>
          
          <button
            onClick={() => setActiveSection('reports')}
            className={`w-full text-right px-6 py-3 flex items-center transition-colors ${
              activeSection === 'reports' ? 'bg-[#0a3c40] border-r-4 border-white' : 'hover:bg-[#0a3c40]'
            }`}
          >
            <FaChartBar className="ml-3" />
            التقارير السنوية
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <FaExclamationTriangle className="ml-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <FaCheckCircle className="ml-2" />
            {success}
          </div>
        )}

        {/* Dashboard Overview */}
        {activeSection === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">نظرة عامة</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <FaList className="text-3xl text-blue-600 ml-4" />
                  <div>
                    <p className="text-gray-600">الأقسام الطبية</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <FaCog className="text-3xl text-green-600 ml-4" />
                  <div>
                    <p className="text-gray-600">الخدمات</p>
                    <p className="text-2xl font-bold">{services.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <FaUserMd className="text-3xl text-purple-600 ml-4" />
                  <div>
                    <p className="text-gray-600">الأطباء</p>
                    <p className="text-2xl font-bold">{doctors.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <FaImages className="text-3xl text-orange-600 ml-4" />
                  <div>
                    <p className="text-gray-600">الوسائط</p>
                    <p className="text-2xl font-bold">{mediaItems.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Section */}
        {activeSection === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">الأقسام الطبية</h2>
              <button
                onClick={() => setIsAddingCategory(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              >
                <FaPlus className="ml-2" />
                إضافة قسم جديد
              </button>
            </div>

            {/* Add Category Form */}
            {isAddingCategory && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold mb-4">إضافة قسم جديد</h3>
                <form onSubmit={addCategory}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      اسم القسم
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل اسم القسم"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      وصف القسم
                    </label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="أدخل وصف القسم"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {actionLoading ? <FaSpinner className="animate-spin" /> : 'إضافة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategory({ name: '', description: '' });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div key={category._id} className="bg-white p-6 rounded-lg shadow-md">
                  {editingCategory && editingCategory._id === category._id ? (
                    <form onSubmit={updateCategory}>
                      <input
                        type="text"
                        value={updatedCategory.name}
                        onChange={(e) => setUpdatedCategory({...updatedCategory, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        required
                      />
                      <textarea
                        value={updatedCategory.description}
                        onChange={(e) => setUpdatedCategory({...updatedCategory, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        rows="3"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          {actionLoading ? <FaSpinner className="animate-spin" /> : 'حفظ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(null);
                            setUpdatedCategory({ name: '', description: '' });
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setUpdatedCategory({
                              name: category.name,
                              description: category.description
                            });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <FaEdit className="ml-1" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteCategory(category._id)}
                          disabled={actionLoading}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center disabled:opacity-50"
                        >
                          <FaTrash className="ml-1" />
                          حذف
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Section */}
        {activeSection === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">الخدمات</h2>
              <button
                onClick={() => setIsAddingService(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              >
                <FaPlus className="ml-2" />
                إضافة خدمة جديدة
              </button>
            </div>

            {/* Add Service Form */}
            {isAddingService && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold mb-4">إضافة خدمة جديدة</h3>
                <form onSubmit={addService}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        اسم الخدمة
                      </label>
                      <input
                        type="text"
                        value={newService.name}
                        onChange={(e) => setNewService({...newService, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="أدخل اسم الخدمة"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        القسم
                      </label>
                      <select
                        value={newService.categoryId}
                        onChange={(e) => setNewService({...newService, categoryId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">اختر القسم (اختياري)</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      وصف الخدمة
                    </label>
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="أدخل وصف الخدمة"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {actionLoading ? <FaSpinner className="animate-spin" /> : 'إضافة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingService(false);
                        setNewService({ name: '', description: '', categoryId: '' });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service._id} className="bg-white p-6 rounded-lg shadow-md">
                  {editingService && editingService._id === service._id ? (
                    <form onSubmit={updateService}>
                      <div className="mb-4">
                        <input
                          type="text"
                          value={updatedService.name}
                          onChange={(e) => setUpdatedService({...updatedService, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          required
                        />
                        <select
                          value={updatedService.categoryId}
                          onChange={(e) => setUpdatedService({...updatedService, categoryId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        >
                          <option value="">اختر القسم (اختياري)</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={updatedService.description}
                          onChange={(e) => setUpdatedService({...updatedService, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          {actionLoading ? <FaSpinner className="animate-spin" /> : 'حفظ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingService(null);
                            setUpdatedService({ name: '', description: '', categoryId: '' });
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-2">
                        القسم: {service.categoryId ? 
                          (categories.find(cat => cat._id === service.categoryId)?.name || 'غير محدد')
                          : 'خدمات عامة'
                        }
                      </p>
                      {service.description && (
                        <p className="text-gray-600 mb-4">{service.description}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingService(service);
                            setUpdatedService({
                              name: service.name,
                              description: service.description || '',
                              categoryId: service.categoryId || ''
                            });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <FaEdit className="ml-1" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteService(service._id)}
                          disabled={actionLoading}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center disabled:opacity-50"
                        >
                          <FaTrash className="ml-1" />
                          حذف
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctors Section */}
        {activeSection === 'doctors' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">الأطباء</h2>
              <button
                onClick={() => setIsAddingDoctor(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              >
                <FaPlus className="ml-2" />
                إضافة طبيب جديد
              </button>
            </div>

            {/* Add Doctor Form */}
            {isAddingDoctor && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold mb-4">إضافة طبيب جديد</h3>
                <form onSubmit={addDoctor}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        اسم الطبيب
                      </label>
                      <input
                        type="text"
                        value={newDoctor.name}
                        onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="أدخل اسم الطبيب"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        التخصص
                      </label>
                      <select
                        value={newDoctor.specialty}
                        onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">اختر التخصص</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        سنوات الخبرة
                      </label>
                      <input
                        type="text"
                        value={newDoctor.experience}
                        onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="مثال: 10 سنوات"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        رابط الصورة
                      </label>
                      <input
                        type="url"
                        value={newDoctor.image}
                        onChange={(e) => setNewDoctor({...newDoctor, image: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {actionLoading ? <FaSpinner className="animate-spin" /> : 'إضافة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingDoctor(false);
                        setNewDoctor({ name: '', specialty: '', experience: '', image: '' });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="bg-white p-6 rounded-lg shadow-md">
                  {editingDoctor && editingDoctor._id === doctor._id ? (
                    <form onSubmit={updateDoctor}>
                      <div className="mb-4">
                        <input
                          type="text"
                          value={updatedDoctor.name}
                          onChange={(e) => setUpdatedDoctor({...updatedDoctor, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          required
                        />
                        <select
                          value={updatedDoctor.specialty}
                          onChange={(e) => setUpdatedDoctor({...updatedDoctor, specialty: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          required
                        >
                          <option value="">اختر التخصص</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={updatedDoctor.experience}
                          onChange={(e) => setUpdatedDoctor({...updatedDoctor, experience: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          placeholder="سنوات الخبرة"
                        />
                        <input
                          type="url"
                          value={updatedDoctor.image}
                          onChange={(e) => setUpdatedDoctor({...updatedDoctor, image: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="رابط الصورة"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          {actionLoading ? <FaSpinner className="animate-spin" /> : 'حفظ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDoctor(null);
                            setUpdatedDoctor({ name: '', specialty: '', experience: '', image: '' });
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {doctor.image && (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{doctor.name}</h3>
                      <p className="text-gray-600 mb-2">
                        التخصص: {categories.find(cat => cat._id === doctor.specialty)?.name || 'غير محدد'}
                      </p>
                      {doctor.experience && (
                        <p className="text-gray-600 mb-4">الخبرة: {doctor.experience}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingDoctor(doctor);
                            setUpdatedDoctor({
                              name: doctor.name,
                              specialty: doctor.specialty,
                              experience: doctor.experience || '',
                              image: doctor.image || ''
                            });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <FaEdit className="ml-1" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteDoctor(doctor._id)}
                          disabled={actionLoading}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center disabled:opacity-50"
                        >
                          <FaTrash className="ml-1" />
                          حذف
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Section */}
        {activeSection === 'media' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">الوسائط</h2>
              <button
                onClick={() => setIsAddingMedia(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              >
                <FaPlus className="ml-2" />
                رفع وسائط جديدة
              </button>
            </div>

            {/* Add Media Form */}
            {isAddingMedia && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold mb-4">رفع وسائط جديدة</h3>
                <form onSubmit={addMedia}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        عنوان الوسائط
                      </label>
                      <input
                        type="text"
                        value={newMedia.title}
                        onChange={(e) => setNewMedia({...newMedia, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="أدخل عنوان الوسائط"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        الفئة
                      </label>
                      <select
                        value={newMedia.category}
                        onChange={(e) => setNewMedia({...newMedia, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">عام</option>
                        <option value="hero">الشريط الرئيسي</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      وصف الوسائط
                    </label>
                    <textarea
                      value={newMedia.description}
                      onChange={(e) => setNewMedia({...newMedia, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="أدخل وصف الوسائط"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      اختر الملف
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setNewMedia({...newMedia, file: e.target.files[0]})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept="image/*,video/*"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {actionLoading ? <FaSpinner className="animate-spin" /> : 'رفع'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingMedia(false);
                        setNewMedia({ title: '', description: '', category: 'general', file: null });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mediaItems.map((media) => (
                <div key={media._id} className="bg-white p-6 rounded-lg shadow-md">
                  {media.type === 'image' && media.url && (
                    <img
                      src={`${API_BASE}${media.url}`}
                      alt={media.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  {media.type === 'video' && media.url && (
                    <video
                      src={`${API_BASE}${media.url}`}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      controls
                    />
                  )}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{media.title}</h3>
                  <p className="text-gray-600 mb-2">النوع: {media.type === 'image' ? 'صورة' : 'فيديو'}</p>
                  <p className="text-gray-600 mb-4">الفئة: {media.category === 'hero' ? 'الشريط الرئيسي' : 'عام'}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`${API_BASE}${media.url}`, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                    >
                      <FaEye className="ml-1" />
                      عرض
                    </button>
                    <button
                      onClick={() => deleteMedia(media._id)}
                      disabled={actionLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center disabled:opacity-50"
                    >
                      <FaTrash className="ml-1" />
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">التقارير السنوية</h2>
              <button
                onClick={() => setIsAddingReport(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              >
                <FaPlus className="ml-2" />
                إضافة تقرير جديد
              </button>
            </div>

            {/* Add Report Form */}
            {isAddingReport && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold mb-4">إضافة تقرير جديد</h3>
                <form onSubmit={addReport}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      السنة
                    </label>
                    <input
                      type="number"
                      value={newReport.year}
                      onChange={(e) => setNewReport({...newReport, year: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثال: 2024"
                      min="2020"
                      max="2030"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      الإحصائيات
                    </label>
                    <div className="space-y-3">
                      {['سنوات خبرة', 'أطباء خبراء', 'غرف مجهزة', 'عمليات منجزة', 'عدد المراجعين', 'عدد المراجعين الجدد'].map((label, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <span className="w-32 text-sm font-medium">{label}:</span>
                          <input
                            type="number"
                            value={newReport.metrics.find(m => m.label === label)?.count || ''}
                            onChange={(e) => {
                              const updatedMetrics = [...newReport.metrics];
                              const existingIndex = updatedMetrics.findIndex(m => m.label === label);
                              if (existingIndex >= 0) {
                                updatedMetrics[existingIndex].count = parseInt(e.target.value) || 0;
                              } else {
                                updatedMetrics.push({ label, count: parseInt(e.target.value) || 0, suffix: '' });
                              }
                              setNewReport({...newReport, metrics: updatedMetrics});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {actionLoading ? <FaSpinner className="animate-spin" /> : 'إضافة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingReport(false);
                        setNewReport({ year: new Date().getFullYear(), metrics: [] });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.year} className="bg-white p-6 rounded-lg shadow-md">
                  {editingReport && editingReport.year === report.year ? (
                    <form onSubmit={updateReport}>
                      <div className="mb-4">
                        <input
                          type="number"
                          value={updatedReport.year}
                          onChange={(e) => setUpdatedReport({...updatedReport, year: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          required
                        />
                        <div className="space-y-2">
                          {['سنوات خبرة', 'أطباء خبراء', 'غرف مجهزة', 'عمليات منجزة', 'عدد المراجعين', 'عدد المراجعين الجدد'].map((label, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <span className="text-xs w-20">{label}:</span>
                              <input
                                type="number"
                                value={updatedReport.metrics.find(m => m.label === label)?.count || ''}
                                onChange={(e) => {
                                  const updatedMetrics = [...updatedReport.metrics];
                                  const existingIndex = updatedMetrics.findIndex(m => m.label === label);
                                  if (existingIndex >= 0) {
                                    updatedMetrics[existingIndex].count = parseInt(e.target.value) || 0;
                                  } else {
                                    updatedMetrics.push({ label, count: parseInt(e.target.value) || 0, suffix: '' });
                                  }
                                  setUpdatedReport({...updatedReport, metrics: updatedMetrics});
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                min="0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          {actionLoading ? <FaSpinner className="animate-spin" /> : 'حفظ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReport(null);
                            setUpdatedReport({ year: '', metrics: [] });
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">تقرير عام {report.year}</h3>
                      <div className="space-y-2 mb-4">
                        {report.metrics && report.metrics.map((metric, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600 text-sm">{metric.label}:</span>
                            <span className="font-semibold">{metric.count}{metric.suffix}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingReport(report);
                            setUpdatedReport({
                              year: report.year,
                              metrics: report.metrics || []
                            });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <FaEdit className="ml-1" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteReport(report.year)}
                          disabled={actionLoading}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center disabled:opacity-50"
                        >
                          <FaTrash className="ml-1" />
                          حذف
                        </button>
                        <button
                          onClick={() => {
                            const reportData = JSON.stringify(report, null, 2);
                            const element = document.createElement('a');
                            const file = new Blob([reportData], { type: 'application/json' });
                            element.href = URL.createObjectURL(file);
                            element.download = `تقرير_${report.year}.json`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <FaDownload className="ml-1" />
                          تحميل
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;