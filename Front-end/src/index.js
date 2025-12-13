import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // استيراد ملف Tailwind CSS

// ضبط خصائص المستند للعربية
document.documentElement.lang = 'ar';
document.documentElement.dir = 'rtl';

// ضبط كلاسات body
document.body.className = 'rtl';

// ضبط meta tags للاتجاه
const metaDirection = document.createElement('meta');
metaDirection.name = 'direction';
metaDirection.content = 'rtl';
document.head.appendChild(metaDirection);

// ضبط viewport للأجهزة المحمولة
const metaViewport = document.querySelector('meta[name="viewport"]');
if (metaViewport) {
  metaViewport.content = 'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);