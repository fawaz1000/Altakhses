// src/Pages/AdminLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import { API_BASE } from '../config';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/admin/login`,
        { username, password },
        { withCredentials: true }           // <== مهمّ جدًا
      );
      // نُخزّن التوكن الذي أرساه السيرفر في body
      localStorage.setItem('token', res.data.token);
      // ننتقل إلى لوحة التحكم
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit}
            className="bg-white p-6 rounded shadow-md w-full max-w-sm text-right">
        <h2 className="text-2xl font-bold mb-4 text-[#023b37]">تسجيل دخول الأدمن</h2>
        {error && <div className="text-red-600 mb-3">{error}</div>}

        <div className="mb-4 relative">
          <FaUser className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            required
            placeholder="اسم المستخدم"
            className="pl-10 w-full border rounded p-2"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-6 relative">
          <FaLock className="absolute top-3 left-3 text-gray-400" />
          <input
            type="password"
            required
            placeholder="كلمة المرور"
            className="pl-10 w-full border rounded p-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#48d690] text-white py-2 rounded hover:bg-[#3ccf80]"
        >
          {loading ? '...جاري المحاولة' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  );
}
