// src/Components/ProtectedRoute/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const { exp, role } = jwtDecode(token);
    if (Date.now() >= exp * 1000 || role !== 'admin') {
      localStorage.removeItem('token');
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  } catch {
    localStorage.removeItem('token');
    return <Navigate to="/admin/login" replace />;
  }
}
