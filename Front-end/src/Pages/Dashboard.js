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
} from 'react-icons/fa';
import { API_BASE } from '../config';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('hero');
  const [mediaItems, setMediaItems] = useState([]);
  const [reportMetrics, setReportMetrics] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]); // إضافة state للأقسام
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
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
    title: '',
    description: '',
  });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [updatedService, setUpdatedService] = useState({
    title: '',
    description: '',
  });

  // إضافة states للأقسام
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/admin/login');
    try {
      const { exp, role } = jwtDecode(token);
      if (exp * 1000 < Date.now() || role !== 'admin') {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } catch {
      localStorage.removeItem('token');
      navigate('/admin/login');
    }
  }, [navigate]);

  // جلب جميع السنوات المتاحة
  const fetchAvailableYears = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_BASE}/api/reports/all`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      if (Array.isArray(data)) {
        const years = data.map(report => report.year).sort((a, b) => b - a);
        setAvailableYears(years);
      }
    } catch (error) {
      console.error('خطأ في جلب السنوات:', error);
      setAvailableYears([]);
    }
  }, []);

  // جلب الأقسام
  const fetchCategories = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('🔍 Fetching categories...');
      const { data } = await axios.get(`${API_BASE}/api/categories`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
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
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      setCategories([]);
      showMessage('error', `خطأ في جلب الأقسام: ${error.message}`);
    }
  }, []);

  const fetchCurrentCategory = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (category === 'reports') {
        // جلب بيانات السنة المحددة
        const { data } = await axios.get(`${API_BASE}/api/reports`, {
          headers,
          withCredentials: true,
          params: { year: selectedYear },
        });
        
        setReportMetrics(data[0]?.metrics || []);
        setMediaItems([]);
        setServices([]);
        setCategories([]);
        
        // جلب السنوات المتاحة
        await fetchAvailableYears();
      } else if (category === 'services') {
        // جلب الخدمات
        const { data } = await axios.get(`${API_BASE}/api/services`, {
          headers,
          withCredentials: true,
        });
        setServices(data || []);
        setMediaItems([]);
        setReportMetrics([]);
        setCategories([]);
      } else if (category === 'categories') {
        // جلب الأقسام
        await fetchCategories();
        setMediaItems([]);
        setReportMetrics([]);
        setServices([]);
      } else {
        const { data } = await axios.get(`${API_BASE}/api/media`, {
          headers,
          withCredentials: true,
          params: { category },
        });
        setMediaItems(data || []);
        setReportMetrics([]);
        setServices([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      setMediaItems([]);
      setReportMetrics([]);
      setServices([]);
      setCategories([]);
      showMessage('error', 'حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [category, selectedYear, fetchAvailableYears, fetchCategories]);

  useEffect(() => {
    fetchCurrentCategory();
  }, [fetchCurrentCategory]);

  // إضافة قسم جديد
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newCategory.name.trim() || !newCategory.description.trim()) {
      showMessage('error', 'يرجى ملء جميع الحقول');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      console.log('Adding category:', newCategory);
      const { data } = await axios.post(
        `${API_BASE}/api/categories`,
        newCategory,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      console.log('Category added successfully:', data);
      setCategories([data, ...categories]);
      setNewCategory({ name: '', description: '', icon: 'FaStethoscope' });
      showMessage('success', 'تم إضافة القسم بنجاح');
    } catch (error) {
      console.error('خطأ في إضافة القسم:', error);
      const errorMessage = error.response?.data?.error || error.message || 'فشل في إضافة القسم';
      showMessage('error', errorMessage);
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
      showMessage('error', 'يرجى ملء جميع الحقول');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      console.log('Updating category:', id, updatedCategory);
      const { data } = await axios.put(
        `${API_BASE}/api/categories/${id}`,
        updatedCategory,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        }
      );
      
      console.log('Category updated successfully:', data);
      setCategories(categories.map((c) => (c._id === id ? data : c)));
      setEditingCategoryId(null);
      showMessage('success', 'تم تحديث القسم بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث القسم:', error);
      const errorMessage = error.response?.data?.error || error.message || 'فشل في تحديث القسم';
      showMessage('error', errorMessage);
    }
  };

  // حذف قسم
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الخدمات المرتبطة به أيضاً.')) return;
    
    const token = localStorage.getItem('token');
    try {
      console.log('Deleting category:', id);
      await axios.delete(`${API_BASE}/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      console.log('Category deleted successfully');
      setCategories(categories.filter((c) => c._id !== id));
      showMessage('success', 'تم حذف القسم بنجاح');
    } catch (error) {
      console.error('خطأ في حذف القسم:', error);
      const errorMessage = error.response?.data?.error || error.message || 'فشل في حذف القسم';
      showMessage('error', errorMessage);
    }
  };

  // باقي الدوال الموجودة (handleAdd, handleEdit, handleUpdate, handleDelete, etc.)
  const handleAdd = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('media', newMedia.file);
    form.append('title', newMedia.title);
    form.append('description', newMedia.description);
    form.append('category', category);

    try {
      const { data } = await axios.post(`${API_BASE}/api/media`, form, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
      });
      
      setMediaItems([data, ...mediaItems]);
      setNewMedia({ title: '', description: '', file: null });
      showMessage('success', 'تم إضافة الملف بنجاح');
    } catch (error) {
      console.error('خطأ في إضافة الملف:', error);
      showMessage('error', 'فشل في إضافة الملف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setUpdatedMedia({ title: item.title, description: item.description });
  };

  const handleUpdate = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/media/${id}`,
        updatedMedia,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setMediaItems(mediaItems.map((i) => (i._id === id ? data : i)));
      setEditingId(null);
      showMessage('success', 'تم تحديث الملف بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث الملف:', error);
      showMessage('error', 'فشل في تحديث الملف');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/api/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setMediaItems(mediaItems.filter((i) => i._id !== id));
      showMessage('success', 'تم حذف الملف بنجاح');
    } catch (error) {
      console.error('خطأ في حذف الملف:', error);
      showMessage('error', 'فشل في حذف الملف');
    }
  };

  // إضافة خدمة جديدة
  const handleAddService = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newService.title.trim() || !newService.description.trim()) {
      showMessage('error', 'يرجى ملء جميع الحقول');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/services`,
        newService,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      setServices([data, ...services]);
      setNewService({ title: '', description: '' });
      showMessage('success', 'تم إضافة الخدمة بنجاح');
    } catch (error) {
      console.error('خطأ في إضافة الخدمة:', error);
      showMessage('error', 'فشل في إضافة الخدمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // تعديل خدمة
  const handleEditService = (service) => {
    setEditingServiceId(service._id);
    setUpdatedService({ title: service.title, description: service.description });
  };

  const handleUpdateService = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.put(
        `${API_BASE}/api/services/${id}`,
        updatedService,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setServices(services.map((s) => (s._id === id ? data : s)));
      setEditingServiceId(null);
      showMessage('success', 'تم تحديث الخدمة بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث الخدمة:', error);
      showMessage('error', 'فشل في تحديث الخدمة');
    }
  };

  // حذف خدمة
  const handleDeleteService = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setServices(services.filter((s) => s._id !== id));
      showMessage('success', 'تم حذف الخدمة بنجاح');
    } catch (error) {
      console.error('خطأ في حذف الخدمة:', error);
      showMessage('error', 'فشل في حذف الخدمة');
    }
  };

  const handleSaveReports = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // التحقق من صحة البيانات
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
    const token = localStorage.getItem('token');
    
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
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      setReportMetrics(data.metrics || []);
      setSelectedYear(parseInt(newMetric.year));
      
      // إعادة تحميل السنوات المتاحة
      await fetchAvailableYears();
      
      // إعادة تعيين النموذج
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
      const errorMessage = error.response?.data?.message || 'فشل في حفظ التقرير';
      showMessage('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // تغيير السنة المحددة
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // حذف تقرير سنة معينة
  const handleDeleteYear = async (year) => {
    if (!window.confirm(`هل أنت متأكد من حذف تقرير سنة ${year}؟`)) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/api/reports/${year}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      // إعادة تحميل البيانات
      await fetchAvailableYears();
      
      // تغيير السنة المحددة إلى السنة الحالية إذا تم حذف السنة المحددة
      if (selectedYear === year) {
        setSelectedYear(new Date().getFullYear());
        setReportMetrics([]);
      }
      
      showMessage('success', `تم حذف تقرير سنة ${year} بنجاح`);
    } catch (error) {
      console.error('خطأ في حذف التقرير:', error);
      showMessage('error', 'فشل في حذف التقرير');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#062b2d] mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-72 bg-white shadow-lg p-6">
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
                      placeholder="مثال: طب الأسنان"
                      value={newService.title}
                      onChange={(e) =>
                        setNewService((prev) => ({ ...prev, title: e.target.value }))
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
                    <h4 className="font-bold text-lg mb-2 text-[#062b2d]">{service.title}</h4>
                    <p className="text-gray-600 mb-4">{service.description}</p>

                    {editingServiceId === service._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={updatedService.title}
                          onChange={(e) =>
                            setUpdatedService((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
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
                        />
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
              
              {/* قائمة السنوات المتاحة */}
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
                {/* حقل السنة */}
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

                {/* حقول الإحصائيات */}
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

            {/* عرض التقارير الحالية */}
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

            {/* قائمة جميع السنوات المتاحة */}
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
                          className="px-4 py-2 bg-[#062b2d] text-white rounded-lg mr-2"
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
          </>
        )}
      </main>
    </div>
  );
}