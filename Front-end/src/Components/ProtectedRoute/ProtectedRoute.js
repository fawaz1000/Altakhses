// src/Components/ProtectedRoute/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { API_BASE } from '../../config';

export default function ProtectedRoute({ children }) {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found');
        setIsValidating(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // التحقق من صحة التوكن محلياً أولاً
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          console.log('❌ Token expired locally');
          localStorage.removeItem('token');
          setIsValidating(false);
          setIsAuthenticated(false);
          return;
        }

        if (decoded.role !== 'admin') {
          console.log('❌ User is not admin');
          localStorage.removeItem('token');
          setIsValidating(false);
          setIsAuthenticated(false);
          return;
        }

        // التحقق من صحة التوكن مع الخادم
        const response = await axios.get(`${API_BASE}/api/auth/verify`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
          timeout: 10000
        });

        if (response.data.valid && response.data.user?.role === 'admin') {
          console.log('✅ Token is valid');
          setIsAuthenticated(true);
        } else {
          console.log('❌ Invalid token from server');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Token validation error:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-white">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-[#0d5047] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#28a49c]/30 rounded-full animate-pulse mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-[#062b2d] mb-2">جاري التحقق من الصلاحيات</h3>
          <p className="text-gray-600">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}