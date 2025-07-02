// Front-end/src/Pages/Dashboard.js - الملف الصحيح والمكتمل
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import {
  FaHome,
  FaImage,
  FaChartBar,
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaStethoscope,
  FaList,
  FaSignOutAlt,
  FaUser,
} from 'react-icons/fa';
import { API_BASE } from '../config';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('hero');
  const [mediaItems, setMediaItems] = useState([]);
  const [reportMetrics, setReportMetrics] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userInfo, setUserInfo] = useState(null);
  
  const [newMedia, setNewMedia] = useState({
    title: '',
    description: '',
    file: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [updatedMedia, setUpdatedMedia] = useState({
    title: '',
    description: '',
  });
  const [newMetric, setNewMetric] = useState({
    year: new Date().getFullYear(),
    exp: '',
    doctors: '',
    rooms: '',
    operations: '',
    visitors: '',
    newVisitors: '',
  });
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    categoryId: '',
  });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [updatedService, setUpdatedService] = useState({
    name: '',
    description: '',
    categoryId: '',
  });

  // states للأقسام
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: 'FaStethoscope'
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [updatedCategory, setUpdatedCategory] = useState({
    name: '',
    description: '',
    icon: 'FaStethoscope'
  });

  // قائمة الأيقونات المتاحة
  const availableIcons = [
    { value: 'FaStethoscope', label: 'سماعة طبية' },
    { value: 'FaTooth', label: 'أسنان' },
    { value: 'FaEye', label: 'عيون' },
    { value: 'FaBrain', label: 'مخ وأعصاب' },
    { value: 'FaBaby', label: 'أطفال' },
    { value: 'FaPills', label: 'صيدلة' },
    { value: 'GiBrokenBone', label: 'عظام' },
    { value: 'MdPregnantWoman', label: 'نساء وولادة' },
    { value: 'RiMentalHealthLine', label: 'الصحة النفسية' },
    { value: 'MdEmergency', label: 'طوارئ' },
    { value: 'FaHandHoldingMedical', label: 'جلدية' },
    { value: 'FaXRay', label: 'أشعة' }
  ];

  // عرض الرسائل
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // دالة للحصول على التوكن
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found');
      showMessage('error', 'انتهت جلسة المستخدم، يرجى تسجيل الدخول مرة أخرى');
      navigate('/admin/login');
      return null;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.log('❌ Token expired');
        localStorage.removeItem('token');
        showMessage('error', 'انتهت صلاحية الجلسة');
        navigate('/admin/login');
        return null;
      }

      if (decoded.role !== 'admin') {
        console.log('❌ User is not admin');
        localStorage.removeItem('token');
        showMessage('error', 'ليس لديك صلاحية للوصول');
        navigate('/admin/login');
        return null;
      }

      return token;
    } catch (error) {
      console.error('❌ Invalid token:', error);
      localStorage.removeItem('token');
      showMessage('error', 'رمز المصادقة غير صحيح');
      navigate('/admin/login');
      return null;
    }
  };

  // دالة للحصول على headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) return null;
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // معالجة أخطاء API
  const handleApiError = (error, defaultMessage = 'حدث خطأ غير متوقع') => {
    console.error('API Error:', error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      showMessage('error', 'انتهت صلاحية الجلسة');
      navigate('/admin/login');
      return;
    }

    if (error.response?.status === 403) {
      showMessage('error', 'ليس لديك صلاحية لهذه العملية');
      return;
    }

    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        defaultMessage;
    
    showMessage('error', errorMessage);
  };

  // التحقق من المصادقة
  useEffect(() => {
    const verifyAuth = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await axios.get(`${API_BASE}/api/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          timeout: 10000
        });

        if (response.data.valid && response.data.user) {
          setUserInfo(response.data.user);
          console.log('✅ Authentication verified for:', response.data.user.username);
        } else {
          throw new Error('Invalid token response');
        }

      } catch (error) {
        console.error('❌ Auth verification failed:', error);
        handleApiError(error, 'فشل في التحقق من المصادقة');
      }
    };

    verifyAuth();
  }, [navigate]);

  // جلب السنوات المتاحة
  const fetchAvailableYears = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const { data } = await axios.get(`${API_BASE}/api/reports/all`, {
        headers,
        withCredentials: true,
        timeout: 10000
      });
      
      if (Array.isArray(data)) {
        const years = data.map(report => report.year).sort((a, b) => b - a);
        setAvailableYears(years);
        console.log('✅ Available years loaded:', years);
      }
    } catch (error) {
      console.error('❌ Error fetching years:', error);
      setAvailableYears([]);
      handleApiError(error, 'خطأ في جلب السنوات المتاحة');
    }
  }, [navigate]);

  // جلب الأقسام
  const fetchCategories = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      console.log('🔍 Fetching categories...');
      const { data } = await axios.get(`${API_BASE}/api/categories`, {
        headers,
        withCredentials: true,
        timeout: 10000
      });
      
      console.log('✅ Categories response:', data);
      
      if (Array.isArray(data)) {
        setCategories(data);
        console.log(`✅ ${data.length} categories loaded`);
      } else {
        console.warn('⚠️ Categories response is not an array:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
      handleApiError(error, 'خطأ في جلب الأقسام');
    }
  }, [navigate]);

  // جلب البيانات حسب القسم
  const fetchCurrentCategory = useCallback(async () => {
    if (!userInfo) return;
    
    setLoading(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      console.log(`🔄 Fetching data for category: ${category}`);
      
      if (category === 'reports') {
        const { data } = await axios.get(`${API_BASE}/api/reports`, {
          headers,
          withCredentials: true,
          params: { year: selectedYear },
          timeout: 10000
        });
        
        setReportMetrics(data[0]?.metrics || []);
        setMediaItems([]);
        setServices([]);
        setCategories([]);
        await fetchAvailableYears();
        
      } else if (category === 'services') {
        const { data } = await axios.get(`${API_BASE}/api/services`, {
          headers,
          withCredentials: true,
          timeout: 10000
        });
        
        const servicesData = data.success ? data.data : data;
        setServices(Array.isArray(servicesData) ? servicesData : []);
        setMediaItems([]);
        setReportMetrics([]);
        await fetchCategories();
        
      } else if (category === 'categories') {
        await fetchCategories();
        setMediaItems([]);
        setReportMetrics([]);
        setServices([]);
        
      } else {
        const { data } = await axios.get(`${API_BASE}/api/media`, {
          headers,
          withCredentials: true,
          params: { category },
          timeout: 10000
        });
        setMediaItems(data || []);
        setReportMetrics([]);
        setServices([]);
        setCategories([]);
      }
      
      console.log(`✅ Data loaded for category: ${category}`);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setMediaItems([]);
      setReportMetrics([]);
      setServices([]);
      setCategories([]);
      handleApiError(error, 'خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [category, selectedYear, fetchAvailableYears, fetchCategories, userInfo, navigate]);

  useEffect(() => {
    fetchCurrentCategory();
  }, [fetchCurrentCategory]);

  // تسجيل الخروج
  const handleLogout = async () => {
    try {
      const headers = getAuthHeaders();
      if (headers) {
        await axios.post(`${API_BASE}/api/admin/logout`, {}, {
          headers,
          withCredentials: true
        });
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      navigate('/admin/login');
    }
  };

  // إضافة قسم جديد
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newCategory.name.trim() || !newCategory.description.trim()) {
      showMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Adding category:', newCategory);
      const response = await axios.post(
        `${API_BASE}/api/categories`,
        newCategory,
        {
          headers,
          withCredentials: true,
          timeout: 10000
        }
      );
      
      console.log('Category add response:', response.data);
      
      const categoryData = response.data.success ? response.data : response.data;
      if (categoryData._id || categoryData.success !== false) {
        setCategories([categoryData, ...categories]);
        setNewCategory({ name: '', description: '', icon: 'FaStethoscope' });
        showMessage('success', categoryData.message || 'تم إضافة القسم بنجاح');
      } else {
        throw new Error(categoryData.error || 'فشل في إضافة القسم');
      }
    } catch (error) {
      console.error('خطأ في إضافة القسم:', error);
      handleApiError(error, 'فشل في إضافة القسم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // تعديل قسم
  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setUpdatedCategory({ 
      name: category.name, 
      description: category.description,
      icon: category.icon || 'FaStethoscope'
    });
  };

  const handleUpdateCategory = async (id) => {
    if (!updatedCategory.name.trim() || !updatedCategory.description.trim()) {
      showMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      console.log('Updating category:', id, updatedCategory);
      const response = await axios.put(
        `${API_BASE}/api/categories/${id}`,
        updatedCategory,
        {
          headers,
          withCredentials: true,
          timeout: 10000
        }
      );
      
      const categoryData = response.data.success ? response.data : response.data;
      if (categoryData._id || categoryData.success !== false) {
        setCategories(categories.map((c) => (c._id === id ? categoryData : c)));
        setEditingCategoryId(null);
        showMessage('success', categoryData.message || 'تم تحديث القسم بنجاح');
      } else {
        throw new Error(categoryData.error || 'فشل في تحديث القسم');
      }
    } catch (error) {
      console.error('خطأ في تحديث القسم:', error);
      handleApiError(error, 'فشل في تحديث القسم');
    }
  };

  // حذف قسم
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الخدمات المرتبطة به أيضاً.')) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await axios.delete(`${API_BASE}/api/categories/${id}`, {
        headers,
        withCredentials: true,
        timeout: 10000
      });
      
      if (response.data.success || response.status === 200) {
        setCategories(categories.filter((c) => c._id !== id));
        showMessage('success', response.data.message || 'تم حذف القسم بنجاح');
      } else {
        throw new Error(response.data.error || 'فشل في حذف القسم');
      }
    } catch (error) {
      console.error('خطأ في حذف القسم:', error);
      handleApiError(error, 'فشل في حذف القسم');
    }
  };

  // إضافة خدمة جديدة
  const handleAddService = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newService.name.trim() || !newService.description.trim()) {
      showMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/services`,
        newService,
        {
          headers,
          withCredentials: true,
          timeout: 10000
        }
      );
      
      if (response.data.success) {
        setServices([response.data.data, ...services]);
        setNewService({ name: '', description: '', categoryId: '' });
        showMessage('success', response.data.message || 'تم إضافة الخدمة بنجاح');
      } else if (response.data._id) {
        setServices([response.data, ...services]);
        setNewService({ name: '', description: '', categoryId: '' });
        showMessage('success', 'تم إضافة الخدمة بنجاح');
      } else {
        throw new Error(response.data.error || 'فشل في إضافة الخدمة');
      }
    } catch (error) {
      console.error('خطأ في إضافة الخدمة:', error);
      handleApiError(error, 'فشل في إضافة الخدمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // تعديل خدمة
  const handleEditService = (service) => {
    setEditingServiceId(service._id);
    setUpdatedService({ 
      name: service.name || service.title, 
      description: service.description,
      categoryId: service.categoryId?._id || service.categoryId || ''
    });
  };

  const handleUpdateService = async (id) => {
    if (!updatedService.name.trim() || !updatedService.description.trim()) {
      showMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await axios.put(
        `${API_BASE}/api/services/${id}`,
        updatedService,
        {
          headers,
          withCredentials: true,
          timeout: 10000
        }
      );
      
      if (response.data.success) {
        setServices(services.map((s) => (s._id === id ? response.data.data : s)));
        setEditingServiceId(null);
        showMessage('success', response.data.message || 'تم تحديث الخدمة بنجاح');
      } else if (response.data._id) {
        setServices(services.map((s) => (s._id === id ? response.data : s)));
        setEditingServiceId(null);
        showMessage('success', 'تم تحديث الخدمة بنجاح');
      } else {
        throw new Error(response.data.error || 'فشل في تحديث الخدمة');
      }
    } catch (error) {
      console.error('خطأ في تحديث الخدمة:', error);
      handleApiError(error, 'فشل في تحديث الخدمة');
    }
  };

  // حذف خدمة
  const handleDeleteService = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await axios.delete(`${API_BASE}/api/services/${id}`, {
        headers,
        withCredentials: true,
        timeout: 10000
      });
      
      if (response.data.success || response.status === 200) {
        setServices(services.filter((s) => s._id !== id));
        showMessage('success', response.data.message || 'تم حذف الخدمة بنجاح');
      } else {
        throw new Error(response.data.error || 'فشل في حذف الخدمة');
      }
    } catch (error) {
      console.error('خطأ في حذف الخدمة:', error);
      handleApiError(error, 'فشل في حذف الخدمة');
    }
  };

  // دوال الوسائط
  const handleAdd = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newMedia.file || !newMedia.title.trim()) {
      showMessage('error', 'يرجى ملء جميع الحقول واختيار ملف');
      return;
    }

    setIsSubmitting(true);
    const token = getAuthToken();
    if (!token) {
      setIsSubmitting(false);
      return;
    }

    const form = new FormData();
    form.append('media', newMedia.file);
    form.append('title', newMedia.title.trim());
    form.append('description', newMedia.description.trim());
    form.append('category', category);

    try {
      const { data } = await axios.post(`${API_BASE}/api/media`, form, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        timeout: 30000
      });
      
      setMediaItems([data, ...mediaItems]);
      setNewMedia({ title: '', description: '', file: null });
      showMessage('success', 'تم إضافة الملف بنجاح');
    } catch (error) {
      console.error('خطأ في إضافة الملف:', error);
      handleApiError(error, 'فشل في إضافة الملف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setUpdatedMedia({ title: item.title, description: item.description });
  };

  const handleUpdate = async (id) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const { data } = await axios.put(
        `${API_BASE}/api/media/${id}`,
        updatedMedia,
        {
          headers,
          withCredentials: true,
          timeout: 10000
        }
      );
      setMediaItems(mediaItems.map((i) => (i._id === id ? data : i)));
      setEditingId(null);
      showMessage('success', 'تم تحديث الملف بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث الملف:', error);
      handleApiError(error, 'فشل في تحديث الملف');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await axios.delete(`${API_BASE}/api/media/${id}`, {
        headers,
        withCredentials: true,
        timeout: 10000
      });
      setMediaItems(mediaItems.filter((i) => i._id !== id));
      showMessage('success', 'تم حذف الملف بنجاح');
    } catch (error) {
      console.error('خطأ في حذف الملف:', error);
      handleApiError(error, 'فشل في حذف الملف');
    }
  };

  // دوال التقارير
  const handleSaveReports = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const requiredFields = ['exp', 'doctors', 'rooms', 'operations', 'visitors', 'newVisitors'];
    const emptyFields = requiredFields.filter(field => !newMetric[field] || newMetric[field] === '');
    
    if (emptyFields.length > 0) {
      showMessage('error', 'يرجى ملء جميع الحقول');
      return;
    }

    if (!newMetric.year || newMetric.year < 2020 || newMetric.year > 2030) {
      showMessage('error', 'يرجى إدخال سنة صحيحة بين 2020 و 2030');
      return;
    }

    setIsSubmitting(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsSubmitting(false);
      return;
    }
    
    const metrics = [
      { label: 'سنوات خبرة', count: parseInt(newMetric.exp), suffix: '+' },
      { label: 'أطباء خبراء', count: parseInt(newMetric.doctors), suffix: '+' },
      { label: 'غرف مجهزة', count: parseInt(newMetric.rooms), suffix: '+' },
      { label: 'عمليات منجزة', count: parseInt(newMetric.operations), suffix: '+' },
      { label: 'عدد المراجعين', count: parseInt(newMetric.visitors), suffix: '+' },
      { label: 'عدد المراجعين الجدد', count: parseInt(newMetric.newVisitors), suffix: '+' },
    ];

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/reports`,
        { year: parseInt(newMetric.year), metrics },
        {
          headers,
          withCredentials: true,
          timeout: 10000
        }
      );
      
      setReportMetrics(data.metrics || []);
      setSelectedYear(parseInt(newMetric.year));
      await fetchAvailableYears();
      
      setNewMetric({
        year: new Date().getFullYear(),
        exp: '',
        doctors: '',
        rooms: '',
        operations: '',
        visitors: '',
        newVisitors: '',
      });
      
      showMessage('success', `تم حفظ تقرير سنة ${parseInt(newMetric.year)} بنجاح`);
    } catch (error) {
      console.error('خطأ في حفظ التقرير:', error);
      handleApiError(error, 'فشل في حفظ التقرير');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleDeleteYear = async (year) => {
    if (!window.confirm(`هل أنت متأكد من حذف تقرير سنة ${year}؟`)) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await axios.delete(`${API_BASE}/api/reports/${year}`, {
        headers,
        withCredentials: true,
        timeout: 10000
      });
      
      await fetchAvailableYears();
      
      if (selectedYear === year) {
        setSelectedYear(new Date().getFullYear());
        setReportMetrics([]);
      }
      
      showMessage('success', `تم حذف تقرير سنة ${year} بنجاح`);
    } catch (error) {
      console.error('خطأ في حذف التقرير:', error);
      handleApiError(error, 'فشل في حذف التقرير');
    }
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
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-72 bg-white shadow-lg">
        {/* معلومات المستخدم */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#48D690] to-[#28a49c] rounded-full flex items-center justify-center">
              <FaUser className="text-white" />
            </div>
            <div className="mr-3">
              <h3 className="text-sm font-semibold text-gray-900">{userInfo.username}</h3>
              <p className="text-xs text-gray-500">{userInfo.role === 'admin' ? 'مدير النظام' : 'مستخدم'}</p>
            </div>
          </div>
        </div>

        {/* القائمة */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8 text-[#062b2d]">لوحة التحكم</h2>
          <nav className="space-y-4">
            {[
              { key: 'hero', label: 'الرئيسية', icon: <FaHome /> },
              { key: 'general', label: 'قناة الإعلام', icon: <FaImage /> },
              { key: 'categories', label: 'الأقسام الطبية', icon: <FaList /> },
              { key: 'services', label: 'الخدمات', icon: <FaStethoscope /> },
              { key: 'reports', label: 'أبرز الأرقام', icon: <FaChartBar /> },
            ].map((tab) => (
              <div
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                  category === tab.key
                    ? 'bg-[#062b2d] text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </div>
            ))}
          </nav>

          {/* زر تسجيل الخروج */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition w-full"
            >
              <FaSignOutAlt />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 rtl">
        {/* رسائل النظام */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
            <span>{message.text}</span>
          </div>
        )}

        {category === 'categories' ? (
          <>
            <h3 className="text-xl font-semibold mb-6 text-[#062b2d]">إدارة الأقسام الطبية</h3>
            
            {/* نموذج إضافة قسم جديد */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h4 className="text-lg font-semibold mb-4 text-[#062b2d] flex items-center gap-2">
                <FaPlusCircle />
                إضافة قسم طبي جديد
              </h4>
              
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم القسم *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: طب الأسنان"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف القسم *
                    </label>
                    <textarea
                      placeholder="وصف تفصيلي للقسم الطبي"
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d] h-24 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      أيقونة القسم
                    </label>
                    <select
                      value={newCategory.icon}
                      onChange={(e) =>
                        setNewCategory((prev) => ({ ...prev, icon: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d]"
                    >
                      {availableIcons.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#062b2d] hover:bg-[#0a3a35] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة القسم'
                  )}
                </button>
              </form>
            </div>

            {/* عرض الأقسام الحالية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-2 text-[#062b2d]">{cat.name}</h4>
                    <p className="text-gray-600 mb-2">{cat.description}</p>
                    <p className="text-sm text-gray-500 mb-4">الأيقونة: {availableIcons.find(icon => icon.value === cat.icon)?.label || cat.icon}</p>

                    {editingCategoryId === cat._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={updatedCategory.name}
                          onChange={(e) =>
                            setUpdatedCategory((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                          placeholder="اسم القسم"
                        />
                        <textarea
                          value={updatedCategory.description}
                          onChange={(e) =>
                            setUpdatedCategory((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded h-20 resize-none"
                          placeholder="وصف القسم"
                        />
                        <select
                          value={updatedCategory.icon}
                          onChange={(e) =>
                            setUpdatedCategory((prev) => ({
                              ...prev,
                              icon: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                        >
                          {availableIcons.map((icon) => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateCategory(cat._id)}
                            className="px-4 py-2 bg-[#062b2d] text-white rounded-lg hover:bg-[#0a3a35] transition"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50 transition"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FaEdit /> تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="text-red-600 hover:underline flex items-center gap-1"
                        >
                          <FaTrash /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-16">
                <FaList className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">لا توجد أقسام مضافة بعد</p>
              </div>
            )}
          </>
        ) : category === 'services' ? (
          <>
            <h3 className="text-xl font-semibold mb-6 text-[#062b2d]">إدارة الخدمات</h3>
            
            {/* نموذج إضافة خدمة جديدة */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h4 className="text-lg font-semibold mb-4 text-[#062b2d] flex items-center gap-2">
                <FaPlusCircle />
                إضافة خدمة جديدة
              </h4>
              
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الخدمة *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: فحص عام"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف الخدمة *
                    </label>
                    <textarea
                      placeholder="وصف تفصيلي للخدمة"
                      value={newService.description}
                      onChange={(e) =>
                        setNewService((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d] h-24 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      القسم الطبي
                    </label>
                    <select
                      value={newService.categoryId}
                      onChange={(e) =>
                        setNewService((prev) => ({ ...prev, categoryId: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d]"
                    >
                      <option value="">اختر القسم (اختياري - سيتم إنشاء قسم عام)</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#062b2d] hover:bg-[#0a3a35] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة الخدمة'
                  )}
                </button>
              </form>
            </div>

            {/* عرض الخدمات الحالية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-2 text-[#062b2d]">{service.name || service.title}</h4>
                    <p className="text-gray-600 mb-2">{service.description}</p>
                    {service.categoryId && (
                      <p className="text-sm text-gray-500 mb-4">
                        القسم: {typeof service.categoryId === 'object' ? service.categoryId.name : 'غير محدد'}
                      </p>
                    )}

                    {editingServiceId === service._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={updatedService.name}
                          onChange={(e) =>
                            setUpdatedService((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                          placeholder="اسم الخدمة"
                        />
                        <textarea
                          value={updatedService.description}
                          onChange={(e) =>
                            setUpdatedService((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded h-20 resize-none"
                          placeholder="وصف الخدمة"
                        />
                        <select
                          value={updatedService.categoryId}
                          onChange={(e) =>
                            setUpdatedService((prev) => ({
                              ...prev,
                              categoryId: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                        >
                          <option value="">بدون قسم محدد</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateService(service._id)}
                            className="px-4 py-2 bg-[#062b2d] text-white rounded-lg hover:bg-[#0a3a35] transition"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingServiceId(null)}
                            className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50 transition"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FaEdit /> تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="text-red-600 hover:underline flex items-center gap-1"
                        >
                          <FaTrash /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {services.length === 0 && (
              <div className="text-center py-16">
                <FaStethoscope className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">لا توجد خدمات مضافة بعد</p>
              </div>
            )}
          </>
        ) : category === 'reports' ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#062b2d]">أبرز الأرقام</h3>
              
              {availableYears.length > 0 && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">عرض بيانات سنة:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#062b2d]"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* نموذج إضافة تقرير جديد */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h4 className="text-lg font-semibold mb-4 text-[#062b2d] flex items-center gap-2">
                <FaPlusCircle />
                إضافة تقرير جديد أو تحديث موجود
              </h4>
              
              <form onSubmit={handleSaveReports} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCalendarAlt className="inline ml-2" />
                      السنة *
                    </label>
                    <input
                      type="number"
                      min="2020"
                      max="2030"
                      placeholder="مثال: 2024"
                      value={newMetric.year}
                      onChange={(e) =>
                        setNewMetric((prev) => ({ ...prev, year: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { field: 'exp', label: 'سنوات خبرة' },
                    { field: 'doctors', label: 'أطباء خبراء' },
                    { field: 'rooms', label: 'غرف مجهزة' },
                    { field: 'operations', label: 'عمليات منجزة' },
                    { field: 'visitors', label: 'عدد المراجعين' },
                    { field: 'newVisitors', label: 'عدد المراجعين الجدد' },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label} *
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder={`أدخل ${label}`}
                        value={newMetric[field]}
                        onChange={(e) =>
                          setNewMetric((prev) => ({ ...prev, [field]: e.target.value }))
                        }
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d]"
                        required
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#062b2d] hover:bg-[#0a3a35] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    `حفظ التقرير لسنة ${newMetric.year}`
                  )}
                </button>
              </form>
            </div>

            {reportMetrics.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-[#062b2d]">
                    بيانات سنة {selectedYear}
                  </h4>
                  <button
                    onClick={() => handleDeleteYear(selectedYear)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 flex items-center gap-2"
                  >
                    <FaTrash />
                    حذف تقرير {selectedYear}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportMetrics.map((m, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-[#062b2d] to-[#0a3a35] text-white p-6 rounded-lg shadow hover:shadow-lg transition"
                    >
                      <div className="text-4xl font-bold mb-2">
                        {m.count}
                        {m.suffix}
                      </div>
                      <div className="text-gray-200">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableYears.length > 0 && (
              <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-4 text-[#062b2d]">
                  السنوات المتاحة ({availableYears.length})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {availableYears.map(year => (
                    <div
                      key={year}
                      className={`px-4 py-2 rounded-lg cursor-pointer transition ${
                        selectedYear === year
                          ? 'bg-[#062b2d] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleYearChange(year)}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-6 text-[#062b2d]">
              {category === 'hero' ? 'الصور الرئيسية' : 'وسائط قناة الإعلام'}
            </h3>
            
            <form
              onSubmit={handleAdd}
              className="flex flex-wrap gap-4 mb-8 bg-white p-6 rounded-lg shadow"
            >
              <input
                type="text"
                placeholder="العنوان"
                value={newMedia.title}
                onChange={(e) =>
                  setNewMedia((prev) => ({ ...prev, title: e.target.value }))
                }
                className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d]"
                required
              />
              <input
                type="text"
                placeholder="الوصف"
                value={newMedia.description}
                onChange={(e) =>
                  setNewMedia((prev) => ({ ...prev, description: e.target.value }))
                }
                className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062b2d]"
                required
              />
              <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-[#062b2d] text-white rounded-lg hover:bg-[#0a3a35]">
                <FaPlusCircle />
                <span>رفع ملف</span>
                <input
                  type="file"
                  hidden
                  accept="image/*,video/*"
                  onChange={(e) =>
                    setNewMedia((prev) => ({ ...prev, file: e.target.files[0] }))
                  }
                  required
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg transition duration-200 flex items-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#062b2d] hover:bg-[#0a3a35] text-white'
                }`}
              >
                {isSubmitting ? <FaSpinner className="animate-spin" /> : null}
                {isSubmitting ? 'جاري الإضافة...' : 'إضافة'}
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden">
                  {item.type === 'image' ? (
                    <img
                      src={`${API_BASE}${item.url}`}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video controls className="w-full h-48 object-cover">
                      <source src={`${API_BASE}${item.url}`} />
                    </video>
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-gray-600 mb-4">{item.description}</p>

                    {editingId === item._id ? (
                      <>
                        <input
                          type="text"
                          value={updatedMedia.title}
                          onChange={(e) =>
                            setUpdatedMedia((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded mb-2"
                        />
                        <input
                          type="text"
                          value={updatedMedia.description}
                          onChange={(e) =>
                            setUpdatedMedia((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded mb-4"
                        />
                        <button
                          onClick={() => handleUpdate(item._id)}
                          className="px-4 py-2 bg-[#062b2d] text-white rounded-lg ml-2"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 text-gray-500 rounded-lg"
                        >
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FaEdit /> تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:underline flex items-center gap-1"
                        >
                          <FaTrash /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {mediaItems.length === 0 && (
              <div className="text-center py-16">
                <FaImage className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">لا توجد وسائط مضافة بعد</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}