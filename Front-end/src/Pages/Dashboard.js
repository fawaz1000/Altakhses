import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
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
  FaUserMd,
  FaSignOutAlt,
  FaUpload,
  FaTimes,
  FaPhone,
  FaGraduationCap,
  FaAward,
  FaBed,
  FaUsers,
  FaCog,
  FaBuilding,
  FaEnvelope,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaHandshake,
  FaGlobe,
  FaSort
} from 'react-icons/fa';
import { MdDoneAll } from 'react-icons/md';

import { API_BASE } from '../config';

// الألوان الثابتة
const PRIMARY_COLOR = '#062b2d';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('hero');
  const [mediaItems, setMediaItems] = useState([]);
  const [reportMetrics, setReportMetrics] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [partners, setPartners] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  
  // States للإعدادات
  const [settings, setSettings] = useState({
    siteName: 'مجموعة التخصيص الطبية',
    logo: null,
    contactInfo: {
      phone: '',
      whatsapp: '',
      email: '',
      location: ''
    },
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      tiktok: '',
      snapchat: ''
    }
  });
  const [newLogo, setNewLogo] = useState(null);
  const [updatedSettings, setUpdatedSettings] = useState({});
  
  // States للوسائط
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

  // States للتقارير
  const [newMetric, setNewMetric] = useState({
    year: new Date().getFullYear(),
    exp: '',
    doctors: '',
    rooms: '',
    operations: '',
    visitors: '',
    newVisitors: '',
  });

  // States للخدمات
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    duration: '',
    image: null
  });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [updatedService, setUpdatedService] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    duration: '',
    image: null,
    removeImage: false
  });

  //States للفروع
 
  const [newBranch, setNewBranch] = useState({
    name: '',
    url: ''
});
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [updatedBranch, setUpdatedBranch] = useState({
     name: '',
     url: ''
});

  // States للأقسام
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: null
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [updatedCategory, setUpdatedCategory] = useState({
    name: '',
    description: '',
    image: null,
    removeImage: false
  });

  // States للأطباء
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    experience: '',
    yearsOfExperience: '',
    qualifications: '',
    phoneNumber: '',
    conditions: '',
    order: 0,
    image: null
  });
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [updatedDoctor, setUpdatedDoctor] = useState({
    name: '',
    specialty: '',
    experience: '',
    yearsOfExperience: '',
    qualifications: '',
    phoneNumber: '',
    conditions: '',
    order: 0,
    image: null,
    removeImage: false
  });

  // States للشراكات
  const [newPartner, setNewPartner] = useState({
    name: '',
    enName: '',
    logo: null
  });
  const [editingPartnerId, setEditingPartnerId] = useState(null);
  const [updatedPartner, setUpdatedPartner] = useState({
    name: '',
    enName: '',
    logo: null,
    removeLogo: false
  });

  // دالة تنسيق الأرقام الكبيرة
  const formatNumber = (num) => {
    const number = parseInt(num);
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  // عرض الرسائل
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  // التحقق من صحة التوكن عند تحميل الصفحة
  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        navigate('/admin/login');
        return;
      }

      try {
        // فك التوكن والتحقق من صلاحيته
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        console.log('🔍 Token validation:', {
          username: decoded.username,
          role: decoded.role,
          exp: new Date(decoded.exp * 1000).toLocaleString(),
          isExpired: decoded.exp < currentTime
        });

        // التحقق من انتهاء الصلاحية
        if (decoded.exp < currentTime) {
          console.log('❌ Token expired');
          localStorage.removeItem('token');
          navigate('/admin/login');
          return;
        }

        // التحقق من دور المستخدم
        if (decoded.role !== 'admin') {
          console.log('❌ User is not admin:', decoded.role);
          localStorage.removeItem('token');
          navigate('/admin/login');
          return;
        }

        // التحقق من صحة التوكن مع الخادم
        try {
          const response = await axios.get(`${API_BASE}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            timeout: 10000
          });

          if (!response.data.valid || response.data.user?.role !== 'admin') {
            console.log('❌ Token validation failed on server');
            localStorage.removeItem('token');
            navigate('/admin/login');
            return;
          }

          console.log('✅ Token validated successfully');
        } catch (verifyError) {
          console.error('❌ Token verification error:', verifyError);
          // في حالة فشل التحقق من الخادم، نستمر إذا كان التوكن صالح محلياً
        }

      } catch (error) {
        console.error('❌ Token decode error:', error);
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    };

    validateAuth();
  }, [navigate]);

  // جلب الإعدادات
  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/settings`);
      if (data.success && data.data) {
        setSettings(data.data);
        setUpdatedSettings(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
      showMessage('error', 'فشل في جلب الإعدادات');
    }
  }, []);


  // جلب الفروع
const fetchBranches = useCallback(async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const { data } = await axios.get(`${API_BASE}/api/branches/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    
    if (data.success && Array.isArray(data.data)) {
      setBranches(data.data);
    }
  } catch (error) {
    console.error('خطأ في جلب الفروع:', error);
    setBranches([]);
  }
}, []);

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
    try {
      const { data } = await axios.get(`${API_BASE}/api/categories`);
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('خطأ في جلب الأقسام:', error);
      setCategories([]);
    }
  }, []);

  // جلب الأطباء
  const fetchDoctors = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_BASE}/api/doctors/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      if (data.success && Array.isArray(data.data)) {
        setDoctors(data.data);
      } else if (Array.isArray(data)) {
        setDoctors(data);
      }
    } catch (error) {
      console.error('خطأ في جلب الأطباء:', error);
      setDoctors([]);
    }
  }, []);

  // جلب الشراكات
  const fetchPartners = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_BASE}/api/partners/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      if (data.success && Array.isArray(data.data)) {
        setPartners(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب الشراكات:', error);
      setPartners([]);
    }
  }, []);

  const fetchCurrentCategory = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      await fetchCategories();

      if (category === 'settings') {
        await fetchSettings();
      } else if (category === 'reports') {
        const { data } = await axios.get(`${API_BASE}/api/reports`, {
          headers,
          withCredentials: true,
          params: { year: selectedYear },
        });
        
        setReportMetrics(data[0]?.metrics || []);
        await fetchAvailableYears();
      } else if (category === 'services') {
        const { data } = await axios.get(`${API_BASE}/api/services`, {
          headers,
          withCredentials: true,
          params: { populate: 'category' }
        });
        setServices(data || []);
      } else if (category === 'categories') {
        // الأقسام تم جلبها بالأعلى
      } else if (category === 'doctors') {
        await fetchDoctors();
      } else if (category === 'partners') {
        await fetchPartners();
     }  else if (category === 'branches') {
        await fetchBranches();
      } else {
        const { data } = await axios.get(`${API_BASE}/api/media`, {
          headers,
          withCredentials: true,
          params: { category },
        });
        setMediaItems(data || []);
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      showMessage('error', 'حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [category, selectedYear, fetchAvailableYears, fetchCategories, fetchDoctors, fetchPartners, fetchSettings]);

  useEffect(() => {
    fetchCurrentCategory();
  }, [fetchCurrentCategory]);

  // دوال إدارة الشراكات
  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newPartner.name.trim()) {
      showMessage('error', 'يرجى ملء اسم الشريك على الأقل');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('name', newPartner.name);
      if (newPartner.enName) formData.append('enName', newPartner.enName);
      if (newPartner.logo) {
        formData.append('logo', newPartner.logo);
      }

      const { data } = await axios.post(
        `${API_BASE}/api/partners`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      if (data.success && data.data) {
        setPartners([data.data, ...partners]);
        setNewPartner({ 
          name: '', 
          enName: '', 
          logo: null 
        });
        showMessage('success', 'تم إضافة الشريك بنجاح');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل في إضافة الشريك';
      showMessage('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPartner = (partner) => {
    setEditingPartnerId(partner._id);
    setUpdatedPartner({ 
      name: partner.name,
      enName: partner.enName || '',
      description: partner.description || '',
      website: partner.website || '',
      order: partner.order || 0,
      logo: null,
      removeLogo: false
    });
  };

  const handleUpdatePartner = async (id) => {
    if (!updatedPartner.name.trim()) {
      showMessage('error', 'يرجى ملء اسم الشريك على الأقل');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('name', updatedPartner.name);
      formData.append('enName', updatedPartner.enName || '');
      formData.append('removeLogo', updatedPartner.removeLogo);
      
      if (updatedPartner.logo) {
        formData.append('logo', updatedPartner.logo);
      }

      const { data } = await axios.put(
        `${API_BASE}/api/partners/${id}`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          },
          withCredentials: true,
        }
      );
      
      if (data.success && data.data) {
        setPartners(partners.map((p) => (p._id === id ? data.data : p)));
        setEditingPartnerId(null);
        showMessage('success', 'تم تحديث بيانات الشريك بنجاح');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل في تحديث بيانات الشريك';
      showMessage('error', errorMessage);
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الشريك؟')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/api/partners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setPartners(partners.filter((p) => p._id !== id));
      showMessage('success', 'تم حذف الشريك بنجاح');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل في حذف الشريك';
      showMessage('error', errorMessage);
    }
  };

  const handleTogglePartnerStatus = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.patch(
        `${API_BASE}/api/partners/${id}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      if (data.success && data.data) {
        setPartners(partners.map((p) => (p._id === id ? data.data : p)));
        showMessage('success', data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل في تغيير حالة الشريك';
      showMessage('error', errorMessage);
    }
  };

  // دوال إدارة الفروع
const handleAddBranch = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  if (!newBranch.name.trim() || !newBranch.url.trim()) {
    showMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
    return;
  }

  setIsSubmitting(true);
  const token = localStorage.getItem('token');

  try {
    const { data } = await axios.post(
      `${API_BASE}/api/branches`,
      newBranch,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    
    if (data.success && data.data) {
      setBranches([data.data, ...branches]);
      setNewBranch({ name: '', url: '' });
      showMessage('success', 'تم إضافة الفرع بنجاح');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'فشل في إضافة الفرع';
    showMessage('error', errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

const handleEditBranch = (branch) => {
  setEditingBranchId(branch._id);
  setUpdatedBranch({ 
    name: branch.name,
    url: branch.url
  });
};

const handleUpdateBranch = async (id) => {
  if (!updatedBranch.name.trim() || !updatedBranch.url.trim()) {
    showMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
    return;
  }

  const token = localStorage.getItem('token');
  try {
    const { data } = await axios.put(
      `${API_BASE}/api/branches/${id}`,
      updatedBranch,
      {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        withCredentials: true,
      }
    );
    
    if (data.success && data.data) {
      setBranches(branches.map((b) => (b._id === id ? data.data : b)));
      setEditingBranchId(null);
      showMessage('success', 'تم تحديث بيانات الفرع بنجاح');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'فشل في تحديث بيانات الفرع';
    showMessage('error', errorMessage);
  }
};

const handleDeleteBranch = async (id) => {
  if (!window.confirm('هل أنت متأكد من حذف هذا الفرع؟')) return;
  
  const token = localStorage.getItem('token');
  try {
    await axios.delete(`${API_BASE}/api/branches/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    setBranches(branches.filter((b) => b._id !== id));
    showMessage('success', 'تم حذف الفرع بنجاح');
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'فشل في حذف الفرع';
    showMessage('error', errorMessage);
  }
};

  // دوال إدارة الإعدادات
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const { data } = await axios.put(
        `${API_BASE}/api/settings`,
        updatedSettings,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      if (data.success) {
        setSettings(data.data);
        showMessage('success', 'تم تحديث الإعدادات بنجاح');
      }
    } catch (error) {
      showMessage('error', 'فشل في تحديث الإعدادات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadLogo = async () => {
    if (!newLogo || isSubmitting) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('logo', newLogo);

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/settings/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      if (data.success) {
        setSettings(data.data);
        setNewLogo(null);
        showMessage('success', 'تم رفع الشعار بنجاح');
        
        // إرسال حدث لتحديث الشعار في الموقع
        window.dispatchEvent(new CustomEvent('logoUpdated', { detail: data.data.logo }));
      }
    } catch (error) {
      showMessage('error', 'فشل في رفع الشعار');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!window.confirm('هل أنت متأكد من حذف الشعار؟')) return;
    
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.delete(`${API_BASE}/api/settings/logo`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      if (data.success) {
        setSettings(data.data);
        showMessage('success', 'تم حذف الشعار بنجاح');
        
        // إرسال حدث لإزالة الشعار من الموقع
        window.dispatchEvent(new CustomEvent('logoUpdated', { detail: null }));
      }
    } catch (error) {
      showMessage('error', 'فشل في حذف الشعار');
    }
  };

  // دوال إدارة الأقسام
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
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('description', newCategory.description);
      if (newCategory.image) {
        formData.append('image', newCategory.image);
      }

      const { data } = await axios.post(
        `${API_BASE}/api/categories`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      setCategories([data, ...categories]);
      setNewCategory({ name: '', description: '', image: null });
      showMessage('success', 'تم إضافة القسم بنجاح');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'فشل في إضافة القسم';
      showMessage('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setUpdatedCategory({ 
      name: category.name, 
      description: category.description,
      image: null,
      removeImage: false
    });
  };

  const handleUpdateCategory = async (id) => {
    if (!updatedCategory.name.trim() || !updatedCategory.description.trim()) {
      showMessage('error', 'يرجى ملء جميع الحقول');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('name', updatedCategory.name);
      formData.append('description', updatedCategory.description);
      formData.append('removeImage', updatedCategory.removeImage);
      
      if (updatedCategory.image) {
        formData.append('image', updatedCategory.image);
      }

      const { data } = await axios.put(
        `${API_BASE}/api/categories/${id}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true,
        }
      );
      
      setCategories(categories.map((c) => (c._id === id ? data : c)));
      setEditingCategoryId(null);
      showMessage('success', 'تم تحديث القسم بنجاح');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'فشل في تحديث القسم';
      showMessage('error', errorMessage);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الخدمات المرتبطة به أيضاً.')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      setCategories(categories.filter((c) => c._id !== id));
      showMessage('success', 'تم حذف القسم بنجاح');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'فشل في حذف القسم';
      showMessage('error', errorMessage);
    }
  };

  // دوال إدارة الخدمات
  const handleAddService = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newService.name.trim() || !newService.description.trim() || !newService.categoryId) {
      showMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('name', newService.name);
      formData.append('description', newService.description);
      formData.append('categoryId', newService.categoryId);
      if (newService.price) formData.append('price', newService.price);
      if (newService.duration) formData.append('duration', newService.duration);
      if (newService.image) formData.append('image', newService.image);

      const { data } = await axios.post(
        `${API_BASE}/api/services`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      setServices([data, ...services]);
      setNewService({ name: '', description: '', categoryId: '', price: '', duration: '', image: null });
      showMessage('success', 'تم إضافة الخدمة بنجاح');
    } catch (error) {
      showMessage('error', 'فشل في إضافة الخدمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = (service) => {
    setEditingServiceId(service._id);
    setUpdatedService({ 
      name: service.name || service.title, 
      description: service.description,
      categoryId: service.categoryId?._id || service.categoryId || '',
      price: service.price || '',
      duration: service.duration || '',
      image: null,
      removeImage: false
    });
  };

  const handleUpdateService = async (id) => {
    if (!updatedService.name.trim() || !updatedService.description.trim()) {
      showMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('name', updatedService.name);
      formData.append('description', updatedService.description);
      if (updatedService.categoryId) formData.append('categoryId', updatedService.categoryId);
      if (updatedService.price) formData.append('price', updatedService.price);
      if (updatedService.duration) formData.append('duration', updatedService.duration);
      formData.append('removeImage', updatedService.removeImage);
      if (updatedService.image) formData.append('image', updatedService.image);

      const { data } = await axios.put(
        `${API_BASE}/api/services/${id}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true,
        }
      );
      setServices(services.map((s) => (s._id === id ? data : s)));
      setEditingServiceId(null);
      showMessage('success', 'تم تحديث الخدمة بنجاح');
    } catch (error) {
      showMessage('error', 'فشل في تحديث الخدمة');
    }
  };

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
      showMessage('error', 'فشل في حذف الخدمة');
    }
  };

  // دوال إدارة الأطباء
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newDoctor.name.trim() || !newDoctor.specialty) {
      showMessage('error', 'يرجى ملء الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('name', newDoctor.name);
      formData.append('specialty', newDoctor.specialty);
      formData.append('experience', newDoctor.experience || '');
      formData.append('yearsOfExperience', newDoctor.yearsOfExperience || '');
      formData.append('qualifications', newDoctor.qualifications || '');
      formData.append('phoneNumber', newDoctor.phoneNumber || '');
      formData.append('conditions', newDoctor.conditions || '');
      formData.append('order', newDoctor.order || 0);
      
      if (newDoctor.image) {
        formData.append('image', newDoctor.image);
      }

      const { data } = await axios.post(
        `${API_BASE}/api/doctors`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      
      if (data.success && data.data) {
        setDoctors([data.data, ...doctors]);
      }
      setNewDoctor({ 
        name: '', 
        specialty: '', 
        experience: '', 
        yearsOfExperience: '',
        qualifications: '',
        phoneNumber: '',
        conditions: '',
        order: 0,
        image: null 
      });
      showMessage('success', 'تم إضافة الطبيب بنجاح');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل في إضافة الطبيب';
      showMessage('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctorId(doctor._id);
    setUpdatedDoctor({ 
      name: doctor.name, 
      specialty: doctor.specialty?._id || doctor.specialty || '',
      experience: doctor.experience || '',
      yearsOfExperience: doctor.yearsOfExperience || '',
      qualifications: doctor.qualifications || '',
      phoneNumber: doctor.phoneNumber || '',
      conditions: doctor.conditions || '',
      order: doctor.order || 0,
      image: null,
      removeImage: false
    });
  };

  const handleUpdateDoctor = async (id) => {
    if (!updatedDoctor.name.trim() || !updatedDoctor.specialty) {
      showMessage('error', 'يرجى ملء الحقول المطلوبة');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('name', updatedDoctor.name);
      formData.append('specialty', updatedDoctor.specialty);
      formData.append('experience', updatedDoctor.experience || '');
      formData.append('yearsOfExperience', updatedDoctor.yearsOfExperience || '');
      formData.append('qualifications', updatedDoctor.qualifications || '');
      formData.append('phoneNumber', updatedDoctor.phoneNumber || '');
      formData.append('conditions', updatedDoctor.conditions || '');
      formData.append('order', updatedDoctor.order || 0);
      formData.append('removeImage', updatedDoctor.removeImage);
      
      if (updatedDoctor.image) {
        formData.append('image', updatedDoctor.image);
      }

      const { data } = await axios.put(
        `${API_BASE}/api/doctors/${id}`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          },
          withCredentials: true,
        }
      );
      
      if (data.success && data.data) {
        setDoctors(doctors.map((d) => (d._id === id ? data.data : d)));
      }
      setEditingDoctorId(null);
      showMessage('success', 'تم تحديث بيانات الطبيب بنجاح');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل في تحديث بيانات الطبيب';
      showMessage('error', errorMessage);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/api/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setDoctors(doctors.filter((d) => d._id !== id));
      showMessage('success', 'تم حذف الطبيب بنجاح');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل في حذف الطبيب';
      showMessage('error', errorMessage);
    }
  };

  // دوال إدارة الوسائط
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
      showMessage('error', 'فشل في حذف الملف');
    }
  };

  // دوال إدارة التقارير
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
    const token = localStorage.getItem('token');
    
    const metrics = [
      { label: 'تأسس منذ', count: parseInt(newMetric.exp), suffix: '+' },
      { label: 'طبيب خبير', count: parseInt(newMetric.doctors), suffix: '+' },
      { label: 'عيادة مجهزة', count: parseInt(newMetric.rooms), suffix: '+' },
      { label: 'حالات معالجة', count: parseInt(newMetric.operations), suffix: '+' },
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
      const errorMessage = error.response?.data?.message || 'فشل في حفظ التقرير';
      showMessage('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleDeleteYear = async (year) => {
    if (!window.confirm(`هل أنت متأكد من حذف تقرير سنة ${year}؟`)) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/api/reports/${year}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      await fetchAvailableYears();
      
      if (selectedYear === year) {
        setSelectedYear(new Date().getFullYear());
        setReportMetrics([]);
      }
      
      showMessage('success', `تم حذف تقرير سنة ${year} بنجاح`);
    } catch (error) {
      showMessage('error', 'فشل في حذف التقرير');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl mb-4" style={{ color: PRIMARY_COLOR }} />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-72 bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-8" style={{ color: '#062b2d' }}>لوحة التحكم</h2>
        <nav className="space-y-4">
          {[
            { key: 'hero', label: 'الرئيسية', icon: <FaHome /> },
            { key: 'general', label: 'قناة الإعلام', icon: <FaImage /> },
            { key: 'categories', label: 'الأقسام الطبية', icon: <FaList /> },
            { key: 'services', label: 'الخدمات', icon: <FaStethoscope /> },
            { key: 'doctors', label: 'الأطباء', icon: <FaUserMd /> },
            { key: 'partners', label: 'الشراكات', icon: <FaHandshake /> },
            { key: 'branches', label: 'الفروع', icon: <FaBuilding /> },
            { key: 'reports', label: 'أبرز الأرقام', icon: <FaChartBar /> },
            { key: 'settings', label: 'إدارة الشعار', icon: <FaImage /> },  
          ].map((tab) => (
            <div
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                category === tab.key
                  ? 'text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              style={{
                backgroundColor: category === tab.key ? PRIMARY_COLOR : 'transparent'
              }}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </div>
          ))}
        </nav>
        
        <button
          onClick={handleLogout}
          className="mt-8 w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <FaSignOutAlt />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
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

        {category === 'partners' ? (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: '#062b2d' }}>إدارة الشراكات</h3>
            
            {/* نموذج إضافة شريك جديد */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#062b2d' }}>
                <FaPlusCircle />
                إضافة شريك جديد
              </h4>
              
              <form onSubmit={handleAddPartner} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الشريك *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: إمارة منطقة حائل"
                      value={newPartner.name}
                      onChange={(e) =>
                        setNewPartner((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم بالإنجليزية
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: Hail.gov.sa"
                      value={newPartner.enName}
                      onChange={(e) =>
                        setNewPartner((prev) => ({ ...prev, enName: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شعار الشريك
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        <FaUpload />
                        <span>اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) =>
                            setNewPartner((prev) => ({ ...prev, logo: e.target.files[0] }))
                          }
                        />
                      </label>
                      {newPartner.logo && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">{newPartner.logo.name}</span>
                          <button
                            type="button"
                            onClick={() => setNewPartner((prev) => ({ ...prev, logo: null }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 text-white ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة الشريك'
                  )}
                </button>
              </form>
            </div>

            {/* عرض الشراكات الحالية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <div key={partner._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {partner.logo ? (
                        <img
                          src={getImageUrl(partner.logo)}
                          alt={partner.name}
                          className="w-20 h-20 object-contain border border-gray-200 rounded-lg p-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-20 h-20 ${partner.logo ? 'hidden' : 'flex'} items-center justify-center rounded-lg border-2 border-dashed border-gray-300`}>
                        <FaBuilding className="text-2xl text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1" style={{ color: '#062b2d' }}>{partner.name}</h4>
                        {partner.enName && (
                          <p className="text-sm text-gray-600 mb-2">{partner.enName}</p>
                        )}
                        {partner.isActive ? (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            نشط
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            معطل
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {partner.description && (
                      <p className="text-sm text-gray-600 mb-3">{partner.description}</p>
                    )}
                    
                    {partner.website && (
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3"
                      >
                        <FaGlobe />
                        زيارة الموقع
                      </a>
                    )}

                    <div className="text-xs text-gray-500 mb-3">
                      ترتيب العرض: {partner.order || 0}
                    </div>

                    {editingPartnerId === partner._id ? (
                      <div className="space-y-3 mt-4">
                        <input
                          type="text"
                          value={updatedPartner.name}
                          onChange={(e) =>
                            setUpdatedPartner((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                          placeholder="اسم الشريك"
                        />
                        <input
                          type="text"
                          value={updatedPartner.enName}
                          onChange={(e) =>
                            setUpdatedPartner((prev) => ({
                              ...prev,
                              enName: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                          placeholder="الاسم بالإنجليزية"
                        />
                        <textarea
                          value={updatedPartner.description}
                          onChange={(e) =>
                            setUpdatedPartner((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded h-20 resize-none"
                          placeholder="الوصف"
                        />
                        <input
                          type="url"
                          value={updatedPartner.website}
                          onChange={(e) =>
                            setUpdatedPartner((prev) => ({
                              ...prev,
                              website: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                          placeholder="الموقع الإلكتروني"
                        />
                        <input
                          type="number"
                          value={updatedPartner.order}
                          onChange={(e) =>
                            setUpdatedPartner((prev) => ({
                              ...prev,
                              order: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                          placeholder="ترتيب العرض"
                        />
                        
                        {/* إدارة الشعار */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                            <FaUpload />
                            <span>رفع شعار جديد</span>
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) =>
                                setUpdatedPartner((prev) => ({ 
                                  ...prev, 
                                  logo: e.target.files[0],
                                  removeLogo: false 
                                }))
                              }
                            />
                          </label>
                          
                          {partner.logo && !updatedPartner.removeLogo && (
                            <button
                              type="button"
                              onClick={() => setUpdatedPartner((prev) => ({ 
                                ...prev, 
                                removeLogo: true,
                                logo: null 
                              }))}
                              className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                            >
                              حذف الشعار الحالي
                            </button>
                          )}
                          
                          {updatedPartner.logo && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-600">{updatedPartner.logo.name}</span>
                              <button
                                type="button"
                                onClick={() => setUpdatedPartner((prev) => ({ ...prev, logo: null }))}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdatePartner(partner._id)}
                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingPartnerId(null)}
                            className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50 transition"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={() => handleEditPartner(partner)}
                          className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <FaEdit /> تعديل
                        </button>
                        <button
                          onClick={() => handleTogglePartnerStatus(partner._id)}
                          className={`flex items-center gap-1 text-sm ${
                            partner.isActive ? 'text-orange-600 hover:underline' : 'text-green-600 hover:underline'
                          }`}
                        >
                          {partner.isActive ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner._id)}
                          className="text-red-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <FaTrash /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {partners.length === 0 && (
              <div className="text-center py-16">
                <FaHandshake className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">لا يوجد شراكات مضافة بعد</p>
              </div>
            )}
          </>
          ) : category === 'branches' ? (
  <>
    <h3 className="text-xl font-semibold mb-6" style={{ color: '#062b2d' }}>إدارة الفروع</h3>
    
    {/* نموذج إضافة فرع جديد */}
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#062b2d' }}>
        <FaPlusCircle />
        إضافة فرع جديد
      </h4>
      
      <form onSubmit={handleAddBranch} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الفرع *
            </label>
            <input
              type="text"
              placeholder="مثال: فرع الملك عبدالعزيز"
              value={newBranch.name}
              onChange={(e) =>
                setNewBranch((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط الموقع *
            </label>
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              value={newBranch.url}
              onChange={(e) =>
                setNewBranch((prev) => ({ ...prev, url: e.target.value }))
              }
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" />
              جاري الإضافة...
            </>
          ) : (
            'إضافة الفرع'
          )}
        </button>
      </form>
    </div>

    {/* عرض الفروع الحالية */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {branches.map((branch) => (
        <div key={branch._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center">
                <FaBuilding className="text-green-400 text-xl" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1" style={{ color: '#062b2d' }}>{branch.name}</h4>
                <a 
                  href={branch.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  عرض الموقع
                </a>
              </div>
            </div>

            {editingBranchId === branch._id ? (
              <div className="space-y-3 mt-4">
                <input
                  type="text"
                  value={updatedBranch.name}
                  onChange={(e) =>
                    setUpdatedBranch((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                  placeholder="اسم الفرع"
                />
                <input
                  type="url"
                  value={updatedBranch.url}
                  onChange={(e) =>
                    setUpdatedBranch((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                  placeholder="رابط الموقع"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateBranch(branch._id)}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => setEditingBranchId(null)}
                    className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleEditBranch(branch)}
                  className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                >
                  <FaEdit /> تعديل
                </button>
                <button
                  onClick={() => handleDeleteBranch(branch._id)}
                  className="text-red-600 hover:underline flex items-center gap-1 text-sm"
                >
                  <FaTrash /> حذف
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    {branches.length === 0 && (
      <div className="text-center py-16">
        <FaBuilding className="text-4xl text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">لا يوجد فروع مضافة بعد</p>
      </div>
    )}
  </>
        ) : category === 'settings' ? (
  <>
    <h3 className="text-xl font-semibold mb-6" style={{ color: '#062b2d' }}>إدارة الشعار</h3>
    
    {/* قسم الشعار فقط */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#062b2d' }}>
        <FaImage />
        شعار الموقع
      </h4>
      
      <div className="space-y-4">
        {settings.logo && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">الشعار الحالي:</p>
            <div className="flex items-center gap-4">
              <img
                src={getImageUrl(settings.logo)}
                alt="شعار الموقع"
                className="h-20 w-auto object-contain border border-gray-200 rounded-lg p-2"
              />
              <button
                onClick={handleDeleteLogo}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 flex items-center gap-2"
              >
                <FaTrash />
                حذف الشعار
              </button>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رفع شعار جديد
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-3 text-white rounded-lg hover:bg-green-700 transition"
                   style={{ backgroundColor: '#22c55e' }}>
              <FaUpload />
              <span>اختر صورة</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setNewLogo(e.target.files[0])}
              />
            </label>
            {newLogo && (
              <>
                <span className="text-sm text-green-600">{newLogo.name}</span>
                <button
                  onClick={handleUploadLogo}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2 text-white ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'hover:bg-green-700'
                  }`}
                  style={{ backgroundColor: isSubmitting ? undefined : '#22c55e' }}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    'رفع الشعار'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setNewLogo(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTimes />
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">الصيغ المدعومة: JPG, PNG, WEBP, SVG (الحد الأقصى 5MB)</p>
        </div>
      </div>
    </div>
  </>
        ) : category === 'doctors' ? (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: '#062b2d' }}>إدارة الأطباء</h3>
            
            {/* نموذج إضافة طبيب جديد */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#062b2d' }}>
                <FaPlusCircle />
                إضافة طبيب جديد
              </h4>
              
              <form onSubmit={handleAddDoctor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الطبيب *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: د. أحمد محمد"
                      value={newDoctor.name}
                      onChange={(e) =>
                        setNewDoctor((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التخصص *
                    </label>
                    <select
                      value={newDoctor.specialty}
                      onChange={(e) =>
                        setNewDoctor((prev) => ({ ...prev, specialty: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                      required
                    >
                      <option value="">اختر التخصص</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سنوات الخبرة (رقم)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      placeholder="مثال: 10"
                      value={newDoctor.yearsOfExperience}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setNewDoctor((prev) => ({ ...prev, yearsOfExperience: value }))
                      }}
                      onKeyPress={(e) => {
                        const charCode = e.which ? e.which : e.keyCode;
                        if (charCode < 48 || charCode > 57) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المؤهلات
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: بكالوريوس طب وجراحة"
                      value={newDoctor.qualifications}
                      onChange={(e) =>
                        setNewDoctor((prev) => ({ ...prev, qualifications: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحالات التي يعالجها
                    </label>
                    <textarea
                      placeholder="مثال: علاج جذور الأسنان، زراعة الأسنان"
                      value={newDoctor.conditions}
                      onChange={(e) =>
                        setNewDoctor((prev) => ({ ...prev, conditions: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047] h-24 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ترتيب العرض
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newDoctor.order}
                      onChange={(e) =>
                        setNewDoctor((prev) => ({ ...prev, order: e.target.value }))
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة الطبيب
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        <FaUpload />
                        <span>اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) =>
                            setNewDoctor((prev) => ({ ...prev, image: e.target.files[0] }))
                          }
                        />
                      </label>
                      {newDoctor.image && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">{newDoctor.image.name}</span>
                          <button
                            type="button"
                            onClick={() => setNewDoctor((prev) => ({ ...prev, image: null }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 text-white ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة الطبيب'
                  )}
                </button>
              </form>
            </div>

            {/* عرض الأطباء الحاليين */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {doctor.image ? (
                        <img
                          src={getImageUrl(doctor.image)}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-full object-cover border-4"
                          style={{ borderColor: PRIMARY_COLOR + '1A' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-20 h-20 ${doctor.image ? 'hidden' : 'flex'} items-center justify-center rounded-full border-4`} style={{ backgroundColor: PRIMARY_COLOR + '1A', borderColor: PRIMARY_COLOR + '33' }}>
                        <FaUserMd className="text-3xl" style={{ color: PRIMARY_COLOR }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1" style={{ color: '#062b2d' }}>{doctor.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {doctor.specialty?.name || categories.find(c => c._id === doctor.specialty)?.name || 'غير محدد'}
                        </p>
                        {doctor.isActive ? (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            نشط
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            معطل
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {doctor.yearsOfExperience && (
                        <p className="flex items-center gap-2">
                          <FaGraduationCap style={{ color: PRIMARY_COLOR }} />
                          {formatExperienceYears(doctor.yearsOfExperience)}
                        </p>
                      )}
                      {doctor.qualifications && (
                        <p className="text-xs text-gray-500">{doctor.qualifications}</p>
                      )}
                    </div>

                    {editingDoctorId === doctor._id ? (
                      <div className="space-y-3 mt-4">
                        <input
                          type="text"
                          value={updatedDoctor.name}
                          onChange={(e) =>
                            setUpdatedDoctor((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                          placeholder="اسم الطبيب"
                        />
                        <select
                          value={updatedDoctor.specialty}
                          onChange={(e) =>
                            setUpdatedDoctor((prev) => ({
                              ...prev,
                              specialty: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                        >
                          <option value="">اختر التخصص</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={updatedDoctor.yearsOfExperience}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setUpdatedDoctor((prev) => ({
                              ...prev,
                              yearsOfExperience: value,
                            }))
                          }}
                          onKeyPress={(e) => {
                            const charCode = e.which ? e.which : e.keyCode;
                            if (charCode < 48 || charCode > 57) {
                              e.preventDefault();
                            }
                          }}
                          className="w-full border p-2 rounded"
                          placeholder="سنوات الخبرة"
                        />
                        <input
                          type="text"
                          value={updatedDoctor.qualifications}
                          onChange={(e) =>
                            setUpdatedDoctor((prev) => ({
                              ...prev,
                              qualifications: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                          placeholder="المؤهلات"
                        />
                        <textarea
                          value={updatedDoctor.conditions}
                          onChange={(e) =>
                            setUpdatedDoctor((prev) => ({
                              ...prev,
                              conditions: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded h-20 resize-none"
                          placeholder="الحالات التي يعالجها"
                        />
                        <input
                          type="number"
                          value={updatedDoctor.order}
                          onChange={(e) =>
                            setUpdatedDoctor((prev) => ({
                              ...prev,
                              order: e.target.value,
                            }))
                          }
                          className="w-full border p-2 rounded"
                          placeholder="ترتيب العرض"
                        />
                        
                        {/* إدارة الصورة */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                            <FaUpload />
                            <span>رفع صورة جديدة</span>
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) =>
                                setUpdatedDoctor((prev) => ({ 
                                  ...prev, 
                                  image: e.target.files[0],
                                  removeImage: false 
                                }))
                              }
                            />
                          </label>
                          
                          {doctor.image && !updatedDoctor.removeImage && (
                            <button
                              type="button"
                              onClick={() => setUpdatedDoctor((prev) => ({ 
                                ...prev, 
                                removeImage: true,
                                image: null 
                              }))}
                              className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                            >
                              حذف الصورة الحالية
                            </button>
                          )}
                          
                          {updatedDoctor.image && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-600">{updatedDoctor.image.name}</span>
                              <button
                                type="button"
                                onClick={() => setUpdatedDoctor((prev) => ({ ...prev, image: null }))}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateDoctor(doctor._id)}
                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingDoctorId(null)}
                            className="px-4 py-2 text-gray-500 border rounded-lg hover:bg-gray-50 transition"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <FaEdit /> تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor._id)}
                          className="text-red-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <FaTrash /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {doctors.length === 0 && (
              <div className="text-center py-16">
                <FaUserMd className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">لا يوجد أطباء مضافين بعد</p>
              </div>
            )}
          </>
        ) : category === 'categories' ? (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: '#062b2d' }}>إدارة الأقسام الطبية</h3>
            
            {/* نموذج إضافة قسم جديد */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#062b2d' }}>
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
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
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
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047] h-24 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة القسم
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        <FaUpload />
                        <span>اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) =>
                            setNewCategory((prev) => ({ ...prev, image: e.target.files[0] }))
                          }
                        />
                      </label>
                      {newCategory.image && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">{newCategory.image.name}</span>
                          <button
                            type="button"
                            onClick={() => setNewCategory((prev) => ({ ...prev, image: null }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 text-white ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
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
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: PRIMARY_COLOR + '1A' }}>
                        {cat.image ? (
                          <img
                            src={getImageUrl(cat.image)}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`${cat.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                          <FaStethoscope className="text-xl" style={{ color: PRIMARY_COLOR }} />
                        </div>
                      </div>
                      <h4 className="font-bold text-lg" style={{ color: '#062b2d' }}>{cat.name}</h4>
                    </div>
                    <p className="text-gray-600 mb-4">{cat.description}</p>

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
                        
                        {/* إدارة الصورة */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                            <FaUpload />
                            <span>رفع صورة جديدة</span>
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) =>
                                setUpdatedCategory((prev) => ({ 
                                  ...prev, 
                                  image: e.target.files[0],
                                  removeImage: false 
                                }))
                              }
                            />
                          </label>
                          
                          {cat.image && !updatedCategory.removeImage && (
                            <button
                              type="button"
                              onClick={() => setUpdatedCategory((prev) => ({ 
                                ...prev, 
                                removeImage: true,
                                image: null 
                              }))}
                              className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                            >
                              حذف الصورة الحالية
                            </button>
                          )}
                          
                          {updatedCategory.image && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-600">{updatedCategory.image.name}</span>
                              <button
                                type="button"
                                onClick={() => setUpdatedCategory((prev) => ({ ...prev, image: null }))}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateCategory(cat._id)}
                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
                            style={{ backgroundColor: PRIMARY_COLOR }}
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
            <h3 className="text-xl font-semibold mb-6" style={{ color: '#062b2d' }}>إدارة الخدمات</h3>
            
            {/* نموذج إضافة خدمة جديدة */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#062b2d' }}>
                <FaPlusCircle />
                إضافة خدمة جديدة
              </h4>
              
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     اسم الخدمة *
                   </label>
                   <input
                     type="text"
                     placeholder="مثال: علاج الأسنان"
                     value={newService.name}
                     onChange={(e) =>
                       setNewService((prev) => ({ ...prev, name: e.target.value }))
                     }
                     className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                     required
                   />
                 </div>
                 
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     وصف الخدمة *
                   </label>
                   <textarea
                     placeholder="وصف تفصيلي للخدمة"
                     value={newService.description}
                     onChange={(e) =>
                       setNewService((prev) => ({ ...prev, description: e.target.value }))
                     }
                     className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047] h-24 resize-none"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     القسم *
                   </label>
                   <select
                     value={newService.categoryId}
                     onChange={(e) =>
                       setNewService((prev) => ({ ...prev, categoryId: e.target.value }))
                     }
                     className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                     required
                   >
                     <option value="">اختر القسم</option>
                     {categories.map((cat) => (
                       <option key={cat._id} value={cat._id}>
                         {cat.name}
                       </option>
                     ))}
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     السعر (اختياري)
                   </label>
                   <input
                     type="number"
                     placeholder="مثال: 150"
                     value={newService.price}
                     onChange={(e) =>
                       setNewService((prev) => ({ ...prev, price: e.target.value }))
                     }
                     className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     المدة (اختياري)
                   </label>
                   <input
                     type="text"
                     placeholder="مثال: 30 دقيقة"
                     value={newService.duration}
                     onChange={(e) =>
                       setNewService((prev) => ({ ...prev, duration: e.target.value }))
                     }
                     className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     صورة الخدمة
                   </label>
                   <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                       <FaUpload />
                       <span>اختر صورة</span>
                       <input
                         type="file"
                         accept="image/*"
                         hidden
                         onChange={(e) =>
                           setNewService((prev) => ({ ...prev, image: e.target.files[0] }))
                         }
                       />
                     </label>
                     {newService.image && (
                       <div className="flex items-center gap-2">
                         <span className="text-sm text-green-600">{newService.image.name}</span>
                         <button
                           type="button"
                           onClick={() => setNewService((prev) => ({ ...prev, image: null }))}
                           className="text-red-600 hover:text-red-800"
                         >
                           <FaTimes />
                         </button>
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               <button
                 type="submit"
                 disabled={isSubmitting}
                 className={`w-full py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 text-white ${
                   isSubmitting
                     ? 'bg-gray-400 cursor-not-allowed'
                     : 'bg-green-600 hover:bg-green-700'
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
                 {service.image && (
                   <img
                     src={getImageUrl(service.image)}
                     alt={service.name || service.title}
                     className="w-full h-48 object-cover"
                     onError={(e) => {
                       e.target.style.display = 'none';
                     }}
                   />
                 )}
                 <div className="p-6">
                   <h4 className="font-bold text-lg mb-2" style={{ color: '#062b2d' }}>{service.name || service.title}</h4>
                   <p className="text-gray-600 mb-2">{service.description}</p>
                   {service.categoryId && (
                     <p className="text-sm text-gray-500 mb-2">
                       القسم: {categories.find(c => c._id === (service.categoryId._id || service.categoryId))?.name || 'غير محدد'}
                     </p>
                   )}
                   {service.price && (
                     <p className="text-sm text-gray-500 mb-2">السعر: {service.price} ريال</p>
                   )}
                   {service.duration && (
                     <p className="text-sm text-gray-500 mb-4">المدة: {service.duration}</p>
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
                         <option value="">اختر القسم</option>
                         {categories.map((cat) => (
                           <option key={cat._id} value={cat._id}>
                             {cat.name}
                           </option>
                         ))}
                       </select>
                       <input
                         type="number"
                         value={updatedService.price}
                         onChange={(e) =>
                           setUpdatedService((prev) => ({
                             ...prev,
                             price: e.target.value,
                           }))
                         }
                         className="w-full border p-2 rounded"
                         placeholder="السعر"
                       />
                       <input
                         type="text"
                         value={updatedService.duration}
                         onChange={(e) =>
                           setUpdatedService((prev) => ({
                             ...prev,
                             duration: e.target.value,
                           }))
                         }
                         className="w-full border p-2 rounded"
                         placeholder="المدة"
                       />
                       
                       {/* إدارة الصورة */}
                       <div className="space-y-2">
                         <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                           <FaUpload />
                           <span>رفع صورة جديدة</span>
                           <input
                             type="file"
                             accept="image/*"
                             hidden
                             onChange={(e) =>
                               setUpdatedService((prev) => ({ 
                                 ...prev, 
                                 image: e.target.files[0],
                                 removeImage: false 
                               }))
                             }
                           />
                         </label>
                         
                         {service.image && !updatedService.removeImage && (
                           <button
                             type="button"
                             onClick={() => setUpdatedService((prev) => ({ 
                               ...prev, 
                               removeImage: true,
                               image: null 
                             }))}
                             className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                           >
                             حذف الصورة الحالية
                           </button>
                         )}
                         
                         {updatedService.image && (
                           <div className="flex items-center gap-2 text-sm">
                             <span className="text-green-600">{updatedService.image.name}</span>
                             <button
                               type="button"
                               onClick={() => setUpdatedService((prev) => ({ ...prev, image: null }))}
                               className="text-red-600 hover:text-red-800"
                             >
                               <FaTimes />
                             </button>
                           </div>
                         )}
                       </div>
                       
                       <div className="flex gap-2">
                         <button
                           onClick={() => handleUpdateService(service._id)}
                           className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
                           style={{ backgroundColor: PRIMARY_COLOR }}
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
             <h3 className="text-xl font-semibold" style={{ color: '#062b2d' }}>أبرز الأرقام</h3>
             
             {/* قائمة السنوات المتاحة */}
             {availableYears.length > 0 && (
               <div className="flex items-center gap-4">
                 <label className="text-sm font-medium text-gray-700">عرض بيانات سنة:</label>
                 <select
                   value={selectedYear}
                   onChange={(e) => handleYearChange(parseInt(e.target.value))}
                   className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
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
             <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#062b2d' }}>
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
                     className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                     required
                   />
                 </div>
               </div>

               {/* حقول الإحصائيات */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {[
                   { field: 'exp', label: 'تأسس منذ', icon: FaAward },
                   { field: 'doctors', label: 'طبيب خبير', icon: FaUserMd },
                   { field: 'rooms', label: 'عيادة مجهزة', icon: FaBed },
                   { field: 'operations', label: 'حالات معالجة', icon: MdDoneAll },
                   { field: 'visitors', label: 'عدد المراجعين', icon: FaUsers },
                   { field: 'newVisitors', label: 'عدد المراجعين الجدد', icon: FaUsers },
                 ].map(({ field, label, icon: IconComponent }) => (
                   <div key={field}>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       <IconComponent className="inline ml-2" />
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
                       className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
                       required
                     />
                   </div>
                 ))}
               </div>

               <button
                 type="submit"
                 disabled={isSubmitting}
                 className={`w-full py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 text-white ${
                   isSubmitting
                     ? 'bg-gray-400 cursor-not-allowed'
                     : 'bg-green-600 hover:bg-green-700'
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
                 <h4 className="text-lg font-semibold" style={{ color: '#062b2d' }}>
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
                     className="text-white p-6 rounded-lg shadow hover:shadow-lg transition"
                     style={{
                       background: `linear-gradient(135deg, #062b2d 0%, ${PRIMARY_COLOR} 100%)`
                     }}
                   >
                     <div className="text-center">
                       <div className="text-4xl font-bold mb-2" title={`القيمة الأصلية: ${parseInt(m.count).toLocaleString()}`}>
                         {formatNumber(m.count)}
                         {m.suffix}
                       </div>
                       <div className="text-gray-200">{m.label}</div>
                       {parseInt(m.count) >= 1000 && (
                         <div className="text-xs text-gray-300 mt-1">
                           ({parseInt(m.count).toLocaleString()})
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* قائمة جميع السنوات المتاحة */}
           {availableYears.length > 0 && (
             <div className="mt-8 bg-white p-6 rounded-lg shadow">
               <h4 className="text-lg font-semibold mb-4" style={{ color: '#062b2d' }}>
                 السنوات المتاحة ({availableYears.length})
               </h4>
               <div className="flex flex-wrap gap-3">
                 {availableYears.map(year => (
                   <div
                     key={year}
                     className={`px-4 py-2 rounded-lg cursor-pointer transition text-white ${
                       selectedYear === year
                         ? ''
                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                     }`}
                     style={{
                       backgroundColor: selectedYear === year ? PRIMARY_COLOR : undefined,
                       color: selectedYear === year ? 'white' : undefined
                     }}
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
           <h3 className="text-xl font-semibold mb-6" style={{ color: '#062b2d' }}>
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
               className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
               required
             />
             <input
               type="text"
               placeholder="الوصف"
               value={newMedia.description}
               onChange={(e) =>
                 setNewMedia((prev) => ({ ...prev, description: e.target.value }))
               }
               className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5047]"
               required
             />
             <label className="flex items-center gap-2 cursor-pointer px-4 py-3 text-white rounded-lg hover:bg-green-700 bg-green-600">
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
               className={`px-6 py-3 rounded-lg transition duration-200 flex items-center gap-2 text-white ${
                 isSubmitting
                   ? 'bg-gray-400 cursor-not-allowed'
                   : 'bg-green-600 hover:bg-green-700'
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
                     src={getImageUrl(item.url)}
                     alt={item.title}
                     className="w-full h-48 object-cover"
                   />
                 ) : (
                   <video controls className="w-full h-48 object-cover">
                     <source src={getImageUrl(item.url)} />
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
                         className="px-4 py-2 text-white rounded-lg mr-2 hover:opacity-90"
                         style={{ backgroundColor: PRIMARY_COLOR }}
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