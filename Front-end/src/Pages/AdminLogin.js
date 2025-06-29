// Front-end/src/Pages/AdminLogin.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { API_BASE } from '../config';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // التحقق من وجود توكن صالح عند تحميل الصفحة
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_BASE}/api/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            timeout: 5000
          });
          
          if (response.data.valid && response.data.user?.role === 'admin') {
            console.log('✅ Valid token found, redirecting to dashboard');
            navigate('/admin/dashboard', { replace: true });
          }
        } catch (error) {
          console.log('❌ Invalid token, removing from storage');
          localStorage.removeItem('token');
        }
      }
    };

    checkExistingAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // التحقق من صحة البيانات
    if (!username.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول');
      setLoading(false);
      return;
    }

    try {
      console.log('🔑 Attempting login for:', username);
      
      const response = await axios.post(
        `${API_BASE}/api/admin/login`,
        { 
          username: username.trim(), 
          password: password.trim() 
        },
        { 
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Login response:', response.data);

      // تخزين التوكن
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('✅ Token stored in localStorage');
      }

      // التحقق من دور المستخدم
      if (response.data.user?.role === 'admin') {
        console.log('✅ Admin role confirmed, navigating to dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else {
        throw new Error('المستخدم ليس مديراً');
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      
      let errorMessage = 'خطأ في الاتصال بالخادم';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى';
      } else if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data.message || 'بيانات غير صحيحة';
            break;
          case 401:
            errorMessage = data.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
            break;
          case 429:
            errorMessage = data.message || 'تم تجاوز عدد المحاولات المسموحة. حاول لاحقاً';
            break;
          case 500:
            errorMessage = 'خطأ في الخادم. يرجى المحاولة لاحقاً';
            break;
          default:
            errorMessage = data.message || `خطأ غير متوقع (${status})`;
        }
      } else if (err.request) {
        errorMessage = 'لا يمكن الوصول للخادم. تحقق من الاتصال بالإنترنت';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-white relative overflow-hidden">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#0d5047]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#28a49c]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* شعار وعنوان */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#48D690] to-[#28a49c] rounded-3xl mb-6 shadow-2xl">
            <span className="text-white text-2xl font-black">A</span>
          </div>
          <h1 className="text-3xl font-black text-[#062B2D] mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-600">
            مجموعة التخصيص الطبية
          </p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <form 
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20"
        >
          <h2 className="text-2xl font-bold mb-6 text-[#023b37] text-center">
            تسجيل دخول المدير
          </h2>

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="mr-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* حقل اسم المستخدم */}
          <div className="mb-6 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                placeholder="أدخل اسم المستخدم"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d5047] focus:border-[#0d5047] transition-colors duration-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* حقل كلمة المرور */}
          <div className="mb-6 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="أدخل كلمة المرور"
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d5047] focus:border-[#0d5047] transition-colors duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white transition-all duration-200 ${
              loading || !username.trim() || !password.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#48d690] to-[#28a49c] hover:from-[#3ccf80] to-[#239688] hover:shadow-xl hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4 ml-2" />
                جاري تسجيل الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>

          {/* معلومات إضافية */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              محمي بواسطة نظام الأمان المتقدم
            </p>
          </div>
        </form>

        {/* معلومات للمطورين (فقط في وضع التطوير) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">معلومات التطوير:</h3>
            <p className="text-xs text-blue-600">
              اسم المستخدم: fawaz<br />
              كلمة المرور: 1234567890
            </p>
          </div>
        )}
      </div>
    </div>
  );
}