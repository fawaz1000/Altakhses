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
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';

function Dashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // States for Categories
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState('');
  
  // States for Services
  const [services, setServices] = useState([]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', category: '' });
  const [editingService, setEditingService] = useState(null);
  const [updatedService, setUpdatedService] = useState({ name: '', description: '', category: '' });
  
  // States for Doctors
  const [doctors, setDoctors] = useState([]);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', experience: '', image: '' });
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [updatedDoctor, setUpdatedDoctor] = useState({ name: '', specialty: '', experience: '', image: '' });
  
  // States for Media
  const [mediaItems, setMediaItems] = useState([]);
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [newMedia, setNewMedia] = useState({ title: '', type: 'image', file: null });
  const [editingMedia, setEditingMedia] = useState(null);
  const [updatedMedia, setUpdatedMedia] = useState({ title: '', type: 'image' });
  
  // States for Reports
  const [reports, setReports] = useState([]);
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [newReport, setNewReport] = useState({ year: '', content: '' });
  const [editingReport, setEditingReport] = useState(null);
  const [updatedReport, setUpdatedReport] = useState({ year: '', content: '' });
  
  // Common states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Configure axios defaults
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  };

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
      const response = await axios.get('http://localhost:5050/api/categories', axiosConfig);
      const categoriesData = response.data?.data || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('خطأ في جلب الأقسام الطبية');
    }
  }, []);

  // Fetch Services
  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5050/api/services', axiosConfig);
      const servicesData = response.data?.data || response.data || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('خطأ في جلب الخدمات');
    }
  }, []);

  // Fetch Doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5050/api/doctors', axiosConfig);
      const doctorsData = response.data?.data || response.data || [];
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('خطأ في جلب الأطباء');
    }
  }, []);

  // Fetch Media
  const fetchMedia = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5050/api/media', axiosConfig);
      const mediaData = response.data?.data || response.data || [];
      setMediaItems(Array.isArray(mediaData) ? mediaData : []);
    } catch (error) {
      console.error('Error fetching media:', error);
      setError('خطأ في جلب الوسائط');
    }
  }, []);

  // Fetch Reports
  const fetchReports = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5050/api/reports', axiosConfig);
      const reportsData = response.data?.data || response.data || [];
      setReports(Array.isArray(reportsData) ? reportsData : []);
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
        break;
    }
  }, [activeSection, userInfo, fetchCategories, fetchServices, fetchDoctors, fetchMedia, fetchReports]);

  // Category Functions
  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setActionLoading(true);
    try {
      const response = await axios.post('http://localhost:5050/api/categories', 
        { name: newCategoryName.trim() }, 
        axiosConfig
      );
      
      if (response.data) {
        setCategories(prev => [...prev, response.data.data || response.data]);
        setNewCategoryName('');
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
    if (!updatedCategoryName.trim() || !editingCategory) return;

    setActionLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5050/api/categories/${editingCategory._id}`,
        { name: updatedCategoryName.trim() },
        axiosConfig
      );
      
      if (response.data) {
        setCategories(prev => 
          prev.map(cat => 
            cat._id === editingCategory._id 
              ? { ...cat, name: updatedCategoryName.trim() }
              : cat
          )
        );
        setEditingCategory(null);
        setUpdatedCategoryName('');
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
      await axios.delete(`http://localhost:5050/api/categories/${categoryId}`, axiosConfig);
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
    if (!newService.name.trim() || !newService.category) return;

    setActionLoading(true);
    try {
      const response = await axios.post('http://localhost:5050/api/services', 
        {
          name: newService.name.trim(),
          description: newService.description.trim(),
          category: newService.category
        }, 
        axiosConfig
      );
      
      if (response.data) {
        setServices(prev => [...prev, response.data.data || response.data]);
        setNewService({ name: '', description: '', category: '' });
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
    if (!updatedService.name.trim() || !updatedService.category || !editingService) return;

    setActionLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5050/api/services/${editingService._id}`,
        {
          name: updatedService.name.trim(),
          description: updatedService.description.trim(),
          category: updatedService.category
        },
        axiosConfig
      );
      
      if (response.data) {
        setServices(prev => 
          prev.map(service => 
            service._id === editingService._id 
              ? { ...service, ...updatedService }
              : service
          )
        );
        setEditingService(null);
        setUpdatedService({ name: '', description: '', category: '' });
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
      await axios.delete(`http://localhost:5050/api/services/${serviceId}`, axiosConfig);
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
      const response = await axios.post('http://localhost:5050/api/doctors', 
        {
          name: newDoctor.name.trim(),
          specialty: newDoctor.specialty,
          experience: newDoctor.experience.trim(),
          image: newDoctor.image.trim()
        }, 
        axiosConfig
      );
      
      if (response.data) {
        setDoctors(prev => [...prev, response.data.data || response.data]);
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
        `http://localhost:5050/api/doctors/${editingDoctor._id}`,
        {
          name: updatedDoctor.name.trim(),
          specialty: updatedDoctor.specialty,
          experience: updatedDoctor.experience.trim(),
          image: updatedDoctor.image.trim()
        },
        axiosConfig
      );
      
      if (response.data) {
        setDoctors(prev => 
          prev.map(doctor => 
            doctor._id === editingDoctor._id 
              ? { ...doctor, ...updatedDoctor }
              : doctor
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
      await axios.delete(`http://localhost:5050/api/doctors/${doctorId}`, axiosConfig);
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
    formData.append('type', newMedia.type);
    formData.append('file', newMedia.file);

    try {
      const response = await axios.post('http://localhost:5050/api/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data) {
        setMediaItems(prev => [...prev, response.data.data || response.data]);
        setNewMedia({ title: '', type: 'image', file: null });
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
      await axios.delete(`http://localhost:5050/api/media/${mediaId}`, axiosConfig);
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
    if (!newReport.year.trim() || !newReport.content.trim()) return;

    setActionLoading(true);
    try {
      const response = await axios.post('http://localhost:5050/api/reports', 
        {
          year: newReport.year.trim(),
          content: newReport.content.trim()
        }, 
        axiosConfig
      );
      
      if (response.data) {
        setReports(prev => [...prev, response.data.data || response.data]);
        setNewReport({ year: '', content: '' });
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
    if (!updatedReport.year.trim() || !updatedReport.content.trim() || !editingReport) return;

    setActionLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5050/api/reports/${editingReport._id}`,
        {
          year: updatedReport.year.trim(),
          content: updatedReport.content.trim()
        },
        axiosConfig
      );
      
      if (response.data) {
        setReports(prev => 
          prev.map(report => 
            report._id === editingReport._id 
              ? { ...report, ...updatedReport }
              : report
          )
        );
        setEditingReport(null);
        setUpdatedReport({ year: '', content: '' });
        setSuccess('تم تحديث التقرير بنجاح');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      setError(error.response?.data?.message || 'خطأ في تحديث التقرير');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) return;

    setActionLoading(true);
    try {
      await axios.delete(`http://localhost:5050/api/reports/${reportId}`, axiosConfig);
      setReports(prev => prev.filter(report => report._id !== reportId));
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
    <div className="min-h-screen bg-gray-50 flex">
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
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="6"
                      placeholder="أدخل محتوى التقرير"
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
                        setIsAddingReport(false);
                        setNewReport({ year: '', content: '' });
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
                <div key={report._id} className="bg-white p-6 rounded-lg shadow-md">
                  {editingReport && editingReport._id === report._id ? (
                    <form onSubmit={updateReport}>
                      <div className="mb-4">
                        <input
                          type="text"
                          value={updatedReport.year}
                          onChange={(e) => setUpdatedReport({...updatedReport, year: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          required
                        />
                        <textarea
                          value={updatedReport.content}
                          onChange={(e) => setUpdatedReport({...updatedReport, content: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="6"
                          required
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
                            setEditingReport(null);
                            setUpdatedReport({ year: '', content: '' });
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
                      <p className="text-gray-600 mb-4 line-clamp-3">{report.content}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingReport(report);
                            setUpdatedReport({
                              year: report.year,
                              content: report.content
                            });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <FaEdit className="ml-1" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteReport(report._id)}
                          disabled={actionLoading}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center disabled:opacity-50"
                        >
                          <FaTrash className="ml-1" />
                          حذف
                        </button>
                        <button
                          onClick={() => {
                            const element = document.createElement('a');
                            const file = new Blob([report.content], { type: 'text/plain' });
                            element.href = URL.createObjectURL(file);
                            element.download = `تقرير_${report.year}.txt`;
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

export default Dashboard;outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل اسم القسم"
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
                        setNewCategoryName('');
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
                        value={updatedCategoryName}
                        onChange={(e) => setUpdatedCategoryName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
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
                            setUpdatedCategoryName('');
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">{category.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setUpdatedCategoryName(category.name);
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
                        value={newService.category}
                        onChange={(e) => setNewService({...newService, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">اختر القسم</option>
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
                        setNewService({ name: '', description: '', category: '' });
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
                          value={updatedService.category}
                          onChange={(e) => setUpdatedService({...updatedService, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                          required
                        >
                          <option value="">اختر القسم</option>
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
                            setUpdatedService({ name: '', description: '', category: '' });
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
                        القسم: {categories.find(cat => cat._id === service.category)?.name || 'غير محدد'}
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
                              category: service.category
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
                        نوع الوسائط
                      </label>
                      <select
                        value={newMedia.type}
                        onChange={(e) => setNewMedia({...newMedia, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="image">صورة</option>
                        <option value="video">فيديو</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      اختر الملف
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setNewMedia({...newMedia, file: e.target.files[0]})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept={newMedia.type === 'image' ? 'image/*' : 'video/*'}
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
                        setNewMedia({ title: '', type: 'image', file: null });
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
                      src={media.url}
                      alt={media.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  {media.type === 'video' && media.url && (
                    <video
                      src={media.url}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      controls
                    />
                  )}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{media.title}</h3>
                  <p className="text-gray-600 mb-4">النوع: {media.type === 'image' ? 'صورة' : 'فيديو'}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(media.url, '_blank')}
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
                      type="text"
                      value={newReport.year}
                      onChange={(e) => setNewReport({...newReport, year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثال: 2024"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      محتوى التقرير
                    </label>
                    <textarea
                      value={newReport.content}
                      onChange={(e) => setNewReport({...newReport, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus: